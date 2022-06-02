import { Component, OnInit } from '@angular/core';
import { Subject,  } from 'rxjs';
import { Subscription,  } from 'rxjs';
import { timer  } from 'rxjs';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { interval, lastValueFrom } from 'rxjs';

import {ApiService} from '../api.service';
import { LastestPrice } from '../lastest-price';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  isEmpty:any;
  watchlistArr:any;
  tickerInfoArr: any;
  fetchDone = false;
  fetchSubscribe: Subscription = new Subscription();
  constructor(private finhubApi: ApiService, private router: Router) { }

  checkEmpty(): void{
    this.watchlistArr = [];
    if(localStorage.getItem('Watchlist')!==null) {
      this.watchlistArr = JSON.parse(localStorage.getItem('Watchlist')!)
    }
    if (this.watchlistArr.length>0) {
      this.isEmpty = false;
    } else {
      this.isEmpty = true;
    }
  }

  public removeFromWatchlist(item: any): void {
    this.tickerInfoArr.splice(this.tickerInfoArr.indexOf(item), 1);
    let watchlistArrOld = JSON.parse(localStorage.getItem('Watchlist')!);
    let watchlistArrNew = watchlistArrOld.filter((v:any) => v.ticker != item.ticker.toUpperCase());
    localStorage.setItem('Watchlist', JSON.stringify(watchlistArrNew));
    this.checkEmpty();
  }

  public linkToSearch(ticker:string) {
    this.router.navigateByUrl('/search/' + ticker);
  }

  ngOnInit(): void {
    this.fetchSubscribe = timer(0, 15000).subscribe(() => {
      this.checkEmpty();
      let callArr = [];
      for (let i = 0; i< this.watchlistArr.length; i++) {
        callArr.push(this.finhubApi.getLatestPrice(this.watchlistArr[i].ticker));
      }
      forkJoin(callArr).subscribe((responses) => {
        let infoArr = [];
        for (let j = 0; j< responses.length; j++) {
          let res = responses[j];
          let tickerName = this.watchlistArr.filter((v:any) => v.ticker === this.watchlistArr[j].ticker)[0].name;
          let info = {
            ticker: this.watchlistArr[j].ticker,
            name: tickerName,
            last: res.l,
            change: res.l - res.pc,
            changePercent: (100 * (res.l - res.pc)) / res.pc,
            timestamp: res.t,
          };
          infoArr.push(info);
        }
        this.tickerInfoArr = infoArr;
        this.fetchDone = true;
        console.log(this.tickerInfoArr);
      });
    });
  }

  ngOnDestroy() {
    this.fetchSubscribe.unsubscribe();
    console.log('Watchlist closed');
  }

}
