import { Component, OnInit } from '@angular/core';
import { SearchDetailsComponent } from '../search-details/search-details.component'
import { SearchComponent } from '../search/search.component'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  ticker:string ='';
  constructor() { }//private s:SearchComponent

  ngOnInit(): void {
    //this.ticker = this.s.ticker;
  }

}
