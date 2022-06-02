import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs'; //of - Converts the arguments to an observable sequence.
import { catchError, retry } from 'rxjs/operators';
import { map, tap } from 'rxjs/operators';


import {Description} from './description';
import { History } from './history';
import {LastestPrice} from './lastest-price';
import { Autocomplete } from './autocomplete';
import { News,NewsStory } from './news';
import { Recommendations,Recommendation } from './recommendations';
import {Sentiment} from './sentiment';
import {Peers} from './peers';
import {Earnings} from './earnings';


//const HOST: string = 'http://localhost:8080';
//const HOST: string = 'http://localhost:4200';
const HOST: string = '';

@Injectable({
  providedIn: 'root'
})
export class ApiService { //ng generate interface 
  private description_url = HOST + '/description';
  private history_url = HOST + '/history';
  private latestPrice_url = HOST + '/latestprice'
  private autocomplete_url = HOST + '/autocomplete';
  private news_url = HOST + '/news';
  private recommendations_url = HOST + '/recommendations';
  private sentiment_url = HOST + '/sentiment';
  private peers_url = HOST + '/peers';
  private earnings_url = HOST + '/earnings';

  constructor(private http: HttpClient) { }

  getDescription(ticker: string): Observable<Description> {
    return this.http.get<Description>(`${this.description_url}/${ticker}`);
  }

  getHistory(ticker: string, startDate: string): Observable<History[]> {
    return this.http.get<History[]>(`${this.history_url}/${ticker}/${startDate}`);
  }

  getLatestPrice(ticker: string): Observable<LastestPrice> {
    return this.http.get<LastestPrice>(`${this.latestPrice_url}/${ticker}`);
  }

  getSearch(ticker: string): Observable<Autocomplete[]> {
    const auto_url = `${this.autocomplete_url}/${ticker}`;
    console.log(auto_url)
    return this.http.get<Autocomplete[]>(auto_url).pipe(
      catchError(this.handleError("Autocomplete",[]))
    );
    /*
    const http$ = 
    console.log(http$);
    http$
      .pipe(
        catchError(err => { 
          console.log(`Search failed: ${err.message}`);
          return of([]);
        })
      )
      .subscribe({
        next: (v) => console.log('HTTP response', v),
        error: (e) => console.log('HTTP Error', e),
        complete: () => console.log('HTTP request completed.')
      });
    return http$*/
  }

  getNews(ticker: string): Observable<NewsStory[]> {
    return this.http.get<NewsStory[]>(`${this.news_url}/${ticker}`);
  }

  getRecommendations(ticker: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.recommendations_url}/${ticker}`);
  }

  getSentiment(ticker: string): Observable<Sentiment> {
    return this.http.get<Sentiment>(`${this.sentiment_url}/${ticker}`);
  }

  getPeers(ticker: string): Observable<Peers> {
    return this.http.get<Peers>(`${this.peers_url}/${ticker}`);
  }

  getEarnings(ticker: string): Observable<Earnings> {
    return this.http.get<Earnings>(`${this.earnings_url}/${ticker}`);
  }

  private handleError<T>(operation = '', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

}
