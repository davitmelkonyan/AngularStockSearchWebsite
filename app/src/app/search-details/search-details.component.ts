import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; //access to information about a route associated with a component that is loaded in an outlet. Use to traverse the RouterState tree and extract information from nodes
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

import {Description} from '../description';
import { History } from '../history';
import {LastestPrice} from '../lastest-price';
import { Autocomplete } from '../autocomplete';
import { News } from '../news';
import { Recommendations,Recommendation } from '../recommendations';
import {Sentiment} from '../sentiment';
import { BuyModalComponent } from '../buy-modal/buy-modal.component'
import { NewsModalComponent } from '../news-modal/news-modal.component'

import * as Highcharts from 'highcharts/highstock';
import {NgbModule,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs'; //multicast observable (more than one observer)
import {debounceTime} from 'rxjs';
import { interval} from 'rxjs';
import { Subscription, timer } from 'rxjs';
import { Options } from 'highcharts/highstock';
declare var require: any
require('highcharts/indicators/indicators')(Highcharts);
require('highcharts/indicators/volume-by-price')(Highcharts);

@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.css']
})
export class SearchDetailsComponent implements OnInit {
  isHighcharts = typeof Highcharts === 'object';
  Highcharts: typeof Highcharts = Highcharts;
  chartOptionsLastDay:any;
  chartOptionsHistory:any;
  chartOptionsReccomendations:any;
  chartOptionsSurprises:any;
  chartColor: string = '';
  lastDayChartDone: boolean = false;
  historyChartDone: boolean = false;
  recChartDone: boolean = false;
  surpriseChartDone: boolean = false;

  ticker: string = '';
  tickerExist = true;
  inWatchlist = false;
  marketStatus = false;
  starAlert = new Subject<string>();
  buyAlert = new Subject<string>();
  starMessage = '';
  buyMessage = '';
  currentTime: number = 0;
  change: number = 0;
  changePercent: number = 0;
  lasttimestamp:any;
  update15Subscription: any;
  
  description:any;
  history: any;
  lastDayHistory: any;
  latestPrice: any;
  news:any;
  recommendations: any;
  sentiment: any;
  peers: any;
  earnings:any;

  redditPos:number = 0;
  redditNeg:number = 0;
  redditTotal: number = 0;
  twitterPos:number = 0;
  twitterNeg:number = 0;
  twitterTotal:number = 0;
  host:string = 'http://localhost:8080';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private finnhub_api: ApiService,
    private newsModal: NgbModal,
    private buyModal: NgbModal
  ){}

  goToPeer(peer:any) {
    console.log('Peer: ', peer);
    this.router.navigateByUrl('/search/' + peer);
  }

  goToURL(url:any) {
    this.router.navigateByUrl(url);
  }

  check_watchlist() {
    const name = localStorage.getItem('Watchlist');
    let watchlistArr = []
    if(name){
      watchlistArr = JSON.parse(name);
    }
    let result = watchlistArr.filter((data:any) => data.ticker === this.ticker.toUpperCase());
    if (result && result.length) {
      this.inWatchlist = true;
    } else {
      this.inWatchlist = false;
    }
  }

  get_peers(){
    let observer = {
      next: (x: any) => {
        this.peers = x;
        console.log('Recieved Peers',this.peers);
      },
      //error: (err: Error) => console.error('Observer got an error: ' + err),
      //complete: () => console.log('Observer got a complete notification'),
    };
    this.finnhub_api.getPeers(this.ticker).subscribe(observer);
  }

  get_sentiment(){
    let observer = {
      next: (x: any) => {
        this.sentiment = x;
        for(let i = 0; i < this.sentiment.reddit.length; i+=1){
          this.redditPos+= this.sentiment.reddit[i].positiveMention
          this.redditNeg+= this.sentiment.reddit[i].negativeMention
          this.redditTotal+= this.sentiment.reddit[i].mention
        }
        for(let i = 0; i < this.sentiment.twitter.length; i+=1){
          this.twitterPos+= this.sentiment.twitter[i].positiveMention
          this.twitterNeg+= this.sentiment.twitter[i].negativeMention
          this.twitterTotal+= this.sentiment.reddit[i].mention
        }
        console.log('Recieved sentiment',this.sentiment);
      },
      //error: (err: Error) => console.error('Observer got an error: ' + err),
      //complete: () => console.log('Observer got a complete notification'),
    };
    this.finnhub_api.getSentiment(this.ticker).subscribe(observer);
  }

  get_recommendations(){
    //let observer = {
    //  next: (x: any) => {
    //    this.recommendations = x;
    //    console.log('Recommend recieved',this.recommendations);
    //  },
      //error: (err: Error) => console.error('Observer got an error: ' + err),
      //complete: () => console.log('Observer got a complete notification'),
    //};
    this.finnhub_api.getRecommendations(this.ticker)//subscribe(observer)
      .subscribe((v) => {
        this.recommendations = v;
        console.log('Recommendations recieved ',this.recommendations);
        this.recChartDone = false;
        this.draw_Recommendations();
        this.recChartDone = true;
        console.log('Rec Chart drawn ');
      });
  }

  get_earnings(){
    this.finnhub_api.getEarnings(this.ticker)//subscribe(observer)
      .subscribe((v) => {
        this.earnings = v;
        console.log('Earnings recieved ',this.earnings);
        this.surpriseChartDone = false;
        this.draw_Surprise();
        this.surpriseChartDone = true;
        console.log('Surprise Chart drawn ');
      });
  }

  get_description(){
    let observer = {
      next: (x: any) => {
        this.description = x;
        if (this.description.ticker) {
          this.tickerExist = true;
        } else {
          this.tickerExist = false;
        }
        console.log('Recieved details');
      },
      //error: (err: Error) => console.error('Observer got an error: ' + err),
      //complete: () => console.log('Observer got a complete notification'),
    };
    this.finnhub_api.getDescription(this.ticker).subscribe(observer);
  }

  get_news() {
    let observer = {
      next: (x: any) => {
        this.news = x;
        console.log('News fetched ' + Date()+this.news[0]);
      },
      //error: (err: Error) => console.error('Observer got an error: ' + err),
      //complete: () => console.log('Observer got a complete notification'),
    };
    this.finnhub_api.getNews(this.ticker).subscribe(observer);
  }

  draw_lastDaysChart() {
    let priceList = [];
    for (let i = 0; i < this.lastDayHistory.c.length; i += 1) {
      priceList.push([this.lastDayHistory.t[i], this.lastDayHistory.c[i]]);
    }
    console.log("DTT: ",priceList)

    this.chartOptionsLastDay = {
      title: { text: this.ticker.toUpperCase() },
      series: [
        {
          name: this.ticker.toUpperCase(),
          data: priceList,
          color: 'black',
          type: 'line',
          showInNavigator: true,
          tooltip: {
            valueDecimals: 2,
          },
        },
      ],
      rangeSelector: {
        enabled: false,
      },
      navigator: {
        series: {
          type: 'area',
          color: this.chartColor,
          fillOpacity: 1,
        },
      },
    };
  }

  get_lastDaysChart() { // update data every 15 seconds
    console.log('get_lastDaysChart Start: ' + Date());

    this.update15Subscription = timer(0, 15000).subscribe(() => {
      console.log('Last Day Chart Start: ' + Date() +this.ticker);
      this.finnhub_api
        .getLatestPrice(this.ticker)
        .subscribe((latestprice) => {
          this.latestPrice = latestprice;
          if (this.latestPrice.c !==null) {
            this.tickerExist = true;
            this.change = this.latestPrice.c - this.latestPrice.pc;
            if (this.change > 0) {
              this.chartColor = '#008000';
            } 
            else if (this.change < 0) {
              this.chartColor = '#FF0000';
            } 
            else {
              this.chartColor = '#000000';
            }
            this.changePercent = (this.change / this.latestPrice.pc)*100;
            this.lasttimestamp = this.latestPrice.t*1000//new Date(this.latestPrice.t);
            console.log("PTUK:",this.lasttimestamp)
            
            this.currentTime = Date.now();
            console.log("PTUkkK:",this.currentTime)
            let timeDifference =  Math.floor((this.currentTime - this.lasttimestamp)/1000); //in secs
            console.log('Time difference:' + Math.floor(timeDifference ));
            if (timeDifference < 300 ) {
              this.marketStatus = true;
            } else {
              this.marketStatus = false;
            }

            let lastWorkingDate = this.latestPrice.t
            console.log('Last working date: ', lastWorkingDate,typeof lastWorkingDate.toString());
            this.finnhub_api
              .getHistory(this.ticker, lastWorkingDate.toString())
              .subscribe((dailycharts:any) => {
                this.lastDayHistory = dailycharts;
                console.log(
                  'DailyCharts fetched ' +
                    Date() +
                    '; Length: '
                    //this.lastDayHistory.c.length
                );
                this.lastDayChartDone = false;
                this.draw_lastDaysChart();
                this.lastDayChartDone = true;
                console.log('DailyCharts drawn ' + Date());
              });
          } else {
            this.tickerExist = false;
            this.lastDayHistory = { detail: 'Not found.' };
          }
          console.log('LatestPrice fetched ' + Date());
        });
    });
  }
  

  draw_histortyChart() {
    let sma = [];
    let volumeByPrice = [];
    let dataLength = this.history.c;
    console.log("DATA LENGTH",this.history)

    for (let i = 0; i < dataLength.length; i += 1) {
      sma.push([
        this.history.t[i],
        this.history.o[i],
        this.history.h[i],
        this.history.l[i],
        this.history.c[i],
      ]);

      volumeByPrice.push([
        this.history.t[i],
        this.history.v[i], 
      ]);
    }
    console.log("SMA",sma)
    console.log("VP",volumeByPrice)

    this.chartOptionsHistory = {
      series: [
        {
          type: 'candlestick',
          name: this.ticker.toUpperCase(),
          id: this.ticker,
          zIndex: 2,
          data: sma,
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volumeByPrice,
          yAxis: 1,
        },
        {
          type: 'vbp',
          linkedTo: this.ticker,
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          linkedTo: this.ticker,
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],

      title: { text: this.ticker.toUpperCase() + ' Historical' },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
      },
      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
        },
        {
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
        },
      ],
      tooltip: {
        split: true,
      },
      plotOptions: {

      },
      rangeSelector: {
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 2,
      },
    };
  }

  get_historyChart() {
    let time = new Date();
    let year = time.getFullYear(), month = time.getMonth(),day = time.getDate();
    let from = Math.floor((new Date(year - 2, month, day)).getTime() / 1000)
    console.log('Two years before today: ' + from);

    this.finnhub_api
      .getHistory(this.ticker, from.toString())
      .subscribe((v) => {
        this.history = v;
        console.log('History fetched ' + Date());
        console.log('History length: ');// + this.history.c.length);
        this.historyChartDone = false;
        this.draw_histortyChart();
        this.historyChartDone = true;
        console.log('History Chart drawn ' + Date());
      });
  }

  draw_Recommendations(){
    let recCat = [];
    let recSB = [],recB = [],recH = [],recS = [],recSS = [];

    for(let i = 0; i < this.recommendations.length;i+=1){
      recCat.push(this.recommendations[i].period.toString());
      recSB.push(this.recommendations[i].strongBuy);
      recB.push(this.recommendations[i].buy);
      recH.push(this.recommendations[i].hold);
      recS.push(this.recommendations[i].sell);
      recSS.push(this.recommendations[i].strongSell);
    }
    this.chartOptionsReccomendations = {
      chart: {
          type: 'column'
      },
      title: {
          text: 'Recommendation Trends'
      },
      xAxis: {
          categories: recCat
      },
      yAxis: {
          min: 0,
          title: {
              text: '#Analysis'
          },
          stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color:  'gray'
              }
          }
      },
      legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'top',
          y: 25,
          floating: true,
          backgroundColor: 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false
      },
      tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: true
              }
          }
      },
      series: [{name: 'String Buy',data: recSB,color: 'green'}, 
              {name: 'Buy',data: recB,color: 'lime'}, 
              {name: 'Hold',data: recH,color:'yellow'},
              {name: 'Sell',data: recS,color:'red'},
              {name: 'Strong Sell',data: recSS,color:'maroon'}]
    };
  }
  
  draw_Surprise(){
    let surCat = [],surSurprise = [];
    let surActual = [],surEstimate = [];
    for(let i = 0; i < this.earnings.length;i+=1){
      //surCat.push();
      let per = this.earnings[i].period.toString()
      if(this.earnings[i].actual){
        surActual.push([per,this.earnings[i].actual]);
      }else{
        surActual.push([per,0]);
      }
      if(this.earnings[i].estimate){
        surEstimate.push([per,this.earnings[i].estimate]);
      }else{
        surEstimate.push([per,0]);
      }
      if(this.earnings[i].surprise){
        surSurprise.push([per,this.earnings[i].surprise]);
      }else{
        surSurprise.push([per,0]);
      }
    }
    this.chartOptionsSurprises = {
        chart: {
            type: 'spline',
        },
        title: {
            text: 'Historical EPS Surprises'
        },
        xAxis: {
            reversed: false,
            title: {
                enabled: true,
            },
            maxPadding: 0.05,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Quarterly EPS'
            },
            lineWidth: 2
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: 'Actual: {1.86} \nEstimate: {1.626}'
        },
        plotOptions: {
            spline: {
                marker: {
                    enable: false
                }
            }
        },
        series: [{
            name: 'Actual',
            data: surActual
        },
        {
          name: 'Estimate',
          data: surEstimate
      }]
    }
  }

  public watchlist_stock(){
    this.inWatchlist = !this.inWatchlist;
    let watchlistArr = [], watchlistArrNew;
    if(localStorage.getItem('Watchlist')!==null){
      watchlistArr = JSON.parse(localStorage.getItem('Watchlist')!);
    }
    if (this.inWatchlist===false) {//add
      watchlistArrNew = watchlistArr.filter((v:any) => v.ticker != this.ticker.toUpperCase());
      localStorage.setItem('Watchlist', JSON.stringify(watchlistArrNew));
    } else {// remove
      let watchlistItemNew = {
        ticker: this.ticker.toUpperCase(),
        name: this.description.name,
      };
      watchlistArr.push(watchlistItemNew);
      localStorage.setItem('Watchlist', JSON.stringify(watchlistArr));
    }
    this.starAlert.next('Message changed.');
  }

  ngOnInit(): void {
    //console.log('tickerdsbhvgh: ' + this.route.paramMap);
    this.route.paramMap//An Observable that contains a map of the required and optional parameters specific to the route. The map supports retrieving single and multiple values from the same parameter.
    .subscribe((params) => {
      console.log('tickerdsbjfdvfffgff: ' + params.keys);
      this.ticker = params.get('ticker')!;
      console.log('ticker name in details: ' + this.ticker);
    });

    this.check_watchlist();
    this.get_description();
    this.get_peers();
    this.get_news();
    this.get_lastDaysChart();
    this.get_historyChart();
    this.get_sentiment();
    this.get_recommendations();
    this.get_earnings();
    //this.draw_Recommendations();
    


    this.starAlert.subscribe((v) => (this.starMessage = v));
    this.starAlert.pipe(debounceTime(5000)).subscribe(() => (this.starMessage = ''));
    this.buyAlert.subscribe((v) => (this.buyMessage = v));
    this.buyAlert.pipe(debounceTime(5000)).subscribe(() => (this.buyMessage = ''));
  }
  
  ngOnDestroy() {
    this.update15Subscription.unsubscribe();
    console.log(`Details of ${this.ticker} closed.`);
  }

  openNewsModal(news_:any) {
    const newsModalRef = this.newsModal.open(NewsModalComponent);
    newsModalRef.componentInstance.news = news_;
  }

  openBuyModal(ticker:string, name: string, currentPrice:any, opt:string) {
    const butBtn = this.buyModal.open(BuyModalComponent);
    butBtn.componentInstance.ticker = ticker;
    butBtn.componentInstance.name = name;
    butBtn.componentInstance.currentPrice = currentPrice;
    butBtn.componentInstance.opt = opt;
    butBtn.componentInstance.money = 25000.00;
    butBtn.result.then((item) => {
      console.log(item);
      this.buyAlert.next('Message changed.');
    });
  }
}
