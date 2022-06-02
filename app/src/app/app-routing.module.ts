import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from "./search/search.component";
import {SearchDetailsComponent} from "./search-details/search-details.component";
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

const routes: Routes = [
  {path: '', redirectTo: '/search/home',pathMatch:'full'},
  {path: 'search/home', component:SearchComponent},
  {path: 'search/:ticker', component: SearchDetailsComponent },
  {path: 'watchlist', component: WatchlistComponent },
  {path: 'portfolio', component: PortfolioComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], //ensures that your application only instantiates one RouterModule
  exports: [RouterModule]
})
export class AppRoutingModule { }
