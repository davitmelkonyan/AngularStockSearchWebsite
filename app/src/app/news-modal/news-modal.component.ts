import { Component, OnInit, Input } from '@angular/core';
import { News } from '../news';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.css']
})
export class NewsModalComponent implements OnInit {
  @Input() public news: any;
  fbHref: any
  constructor(public newsModal: NgbActiveModal) { }

  ngOnInit(): void {
    console.log("CICIK",this.news)
    //https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse
    this.fbHref ='https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.news.url) +'&amp;src=sdkpreparse';
  }

  share(url: string) {
    window.open(url, '_blank');
  }

}
