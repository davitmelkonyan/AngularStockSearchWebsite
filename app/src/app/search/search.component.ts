import { Component, OnInit } from '@angular/core';
import { FormControl,FormBuilder,FormGroup} from '@angular/forms';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

import { fromEvent, debounceTime, pipe } from 'rxjs';
import { tap } from 'rxjs/operators'; //Used to perform side-effects for notifications from the source observable
import { switchMap } from 'rxjs/operators'; //On each emission  previous inner observable is cancelled and the new observable is subscribed
import { finalize } from 'rxjs/operators'; //Call a function when observable completes or errors
import { Autocomplete } from '../autocomplete';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})


export class SearchComponent implements OnInit {
  companies: Autocomplete[] = [];
  isLoading: Boolean = false;
  ticker: string = '' ;
  search_box!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiCalls: ApiService
  ){}

  ngOnInit(): void {
    this.search_box = this.formBuilder.group({ tickerInput: '' });
    const change = this.search_box.get('tickerInput')!.valueChanges//The ValueChanges is an event raised by the Angular forms whenever the value of the FormControl, FormGroup or FormArray changes. It returns an observable so that you can subscribe to it. The observable gets the latest value of the control. It allows us to track changes made to the value in real-time and respond to it
    .pipe(//pipes to link operators together - pipe() function takes as its arguments the functions you want to combine, and returns a new function that, when executed, runs the composed functions in sequence.
      debounceTime(500),
      tap(() => (this.isLoading = true)),
      switchMap((v:any) => this.apiCalls.getSearch(v).pipe(finalize(() => (this.isLoading = false))))
    )
    .subscribe((out:Autocomplete[]) => (this.companies = out));
  }

  onSubmit(input:any) {
    if (input.tickerInput.count>0) {
      this.ticker = input.tickerInput.symbol;
    } else {
      this.ticker = input.tickerInput;
    }
    console.log('Entered Ticker: ', this.ticker);
    this.router.navigateByUrl('/search/' + this.ticker);
    this.search_box.reset();
  }

  display(company: any) {
    if (company) {
      return company.symbol;
    }else{
      return '';
    }
  }
}
