import { Component, OnInit } from '@angular/core';
import { Subject, Subscription, timer, forkJoin } from 'rxjs';
import { ApiService } from '../api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuyModalComponent } from '../buy-modal/buy-modal.component'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  portfolioArr:any;
  isEmpty: boolean = true;
  tickerInfoArr:any;
  fetchDone = false;
  fetchSubscribe: Subscription = new Subscription();
  money: number = 25000;
  constructor(
    private api_service: ApiService,
    private buy_modal: NgbModal
  ) { }

  checkEmpty() {
    this.portfolioArr = [];
    if(localStorage.getItem('Portfolio')!==null) {
      //let json_ = JSON.parse(localStorage.getItem('Portfolio')!);
      this.portfolioArr = JSON.parse(localStorage.getItem('Portfolio')!);//json_.portf
      
    }
    if (this.portfolioArr.length>0) {
      this.isEmpty = false;
    } else {
      this.isEmpty = true;
    }
  }

  public removeItem(item:any) {
    //let portfolioArrOld = JSON.parse(localStorage.getItem('Portfolio')!);
    let portfolioArrOld  = JSON.parse(localStorage.getItem('Portfolio')!)
    console.log("DELETING PO: ",portfolioArrOld)
    //let newPortfolioArr = {"money":this.money,"portf":}
    localStorage.setItem('Portfolio', JSON.stringify(portfolioArrOld.filter((v:any) => v.ticker != item.ticker.toUpperCase())));
    this.checkEmpty();
  }

  getAllTicker() {
    console.log('Start fetch ' ,Date(), this.portfolioArr);
    this.fetchSubscribe = timer(0, 15000).subscribe(() => {
      this.checkEmpty();
      let callArr = [];
      for (let i = 0; i< this.portfolioArr.length; i++) {
        callArr.push(this.api_service.getLatestPrice(this.portfolioArr[i].ticker));
      }
      forkJoin(callArr).subscribe((responses) => {
        console.log('real fetch time: ' + Date());
        let infoArr = [];
        for (let j = 0; j< responses.length; j++) {
          let res = responses[j];
          let tickerName = this.portfolioArr.filter((v:any) => v.ticker === this.portfolioArr[j].ticker)[0];
          let info = {
            ticker: this.portfolioArr[j].ticker,//res.ticker
            name: tickerName.name,
            quantity: tickerName.quantity,
            totalCost: tickerName.totalCost,
            avgCost: tickerName.totalCost / tickerName.quantity, // totalCost / quantity
            change: (tickerName.totalCost / tickerName.quantity) - res.l, // totalCost / quantity - latestprice.last
            currentPrice: res.l, // latestprice.last
            marketValue: res.l * tickerName.quantity, // latestprice.last * quantity
          };
          infoArr.push(info);
        }
        this.tickerInfoArr = infoArr;
        this.fetchDone = true;
        console.log(this.tickerInfoArr);
      });
    });
  }

  buySellInPortfolio(ticker: any, name: any, currentPrice: any, opt: any) {
    const buyBtn = this.buy_modal.open(BuyModalComponent);
    buyBtn.componentInstance.ticker = ticker;
    buyBtn.componentInstance.name = name;
    buyBtn.componentInstance.currentPrice = currentPrice;
    buyBtn.componentInstance.opt = opt;
    buyBtn.componentInstance.money = this.money;
    buyBtn.result.then((item) => {
      if (item) {
        console.log(item);
        if (item.quantity === 0) {
          this.removeItem(item);
          this.tickerInfoArr = this.tickerInfoArr.filter((v:any) => v.ticker != item.ticker);
        } else {
          this.checkEmpty();
          for(let i = 0; i < this.tickerInfoArr.length;i+=1){
            if (this.tickerInfoArr[i].ticker == item.ticker) {
              this.tickerInfoArr[i].quantity = item.quantity;
              this.tickerInfoArr[i].totalCost = item.totalCost;
              this.tickerInfoArr[i].avgCost = item.totalCost / item.quantity;
              this.tickerInfoArr[i].marketValue = item.quantity * this.tickerInfoArr[i].currentPrice;
              this.tickerInfoArr[i].change = this.tickerInfoArr[i].currentPrice -(item.totalCost / item.quantity);
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
    localStorage.setItem('Money',this.money.toString());
    this.getAllTicker();
  }

}
