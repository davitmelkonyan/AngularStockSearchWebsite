import { Component, OnInit } from '@angular/core';
import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.css']
})
export class BuyModalComponent implements OnInit {
  @Input() public ticker: any;
  @Input() public name: any;
  @Input() public currentPrice:any;
  @Input() public opt: any; 
  @Input() public money: any; 
  @Output() quantity: EventEmitter<any> = new EventEmitter();
  inputQuantity: number = 0;
  purchasedQuantity: number = 0;
  stockItem: any;
  moneyInWallet: number = 0.0;
  constructor(public buyModal: NgbActiveModal) { }

  public buyOrSell() {
    console.log("ITEMMM:",this.stockItem);
    if (this.opt === 'Sell') {
      this.stockItem.quantity -= this.inputQuantity;
      this.stockItem.totalCost -= (this.stockItem.totalCost/this.stockItem.quantity) * this.inputQuantity;
      console.log(`Sold ${this.ticker} ${this.inputQuantity}, ${this.stockItem.quantity} left, totalCost ${this.stockItem.totalCost}`);
    } 
    else if (this.opt === 'Buy') {
      this.stockItem.quantity += this.inputQuantity;
      this.stockItem.totalCost += this.currentPrice * this.inputQuantity;
      console.log(`Bought ${this.ticker} ${this.inputQuantity}, ${this.stockItem.quantity} now, totalCost ${this.stockItem.totalCost}`);
    }

    let portfolioArr = [];
    if(localStorage.getItem('Portfolio')!==null) {
      //let json_ = JSON.parse(localStorage.getItem('Portfolio')!);
      portfolioArr = JSON.parse(localStorage.getItem('Portfolio')!);//json_.portf;
      //this.moneyInWallet = json_.money;
    }
    if (this.stockItem.quantity==0) { //delete if none left
      let newPortfolio = portfolioArr.filter((v:any) => v.ticker != this.ticker);
      localStorage.setItem('Portfolio', JSON.stringify(newPortfolio));
    } 
    else {
      let newPortfolio = portfolioArr.filter((v:any) => v.ticker == this.ticker);
      if (newPortfolio.length>0) {
        for (let i = 0; i < portfolioArr.length; i++){
          if (portfolioArr[i].ticker == this.stockItem.ticker) {
            portfolioArr[i] = this.stockItem;
          }
        }
      } 
      else {
        portfolioArr.push(this.stockItem);
      }
      //let moneyAndPorfolio = {"money": 250000, "portf":portfolioArr}
      localStorage.setItem('Portfolio', JSON.stringify(portfolioArr)); //JSON.stringify(moneyAndPorfolio)
    }
    this.buyModal.close(this.stockItem);
  }

  ngOnInit(): void {
    //money = localStorage.getItem('Po')
    //localStorage.clear();
    let portfolioList = [];
    console.log("PORT",localStorage.getItem('Portfolio'));
    if(localStorage.getItem('Portfolio')!==null) {
      //let _json = JSON.parse(localStorage.getItem('Portfolio')!);
      portfolioList = JSON.parse(localStorage.getItem('Portfolio')!);//_json.portf ? _json.portf:[];
      //this.moneyInWallet = _json.money;
    }
    console.log("PORTFOLIO",portfolioList);
    if (this.opt === 'Sell') {
      this.stockItem = portfolioList.filter((v:any) => v.ticker == this.ticker)[0];
      this.purchasedQuantity = this.stockItem.quantity;
    } 
    else if (this.opt === 'Buy') {
      let portf =  portfolioList.filter((v:any) => v.ticker == this.ticker)
      if (portf.length > 0){
        this.stockItem = portfolioList.filter((v:any) => v.ticker == this.ticker)[0]
      }
      else{
        this.stockItem = { ticker: this.ticker, name: this.name, quantity: 0, totalCost: 0 };
      }
    }
  }

}
