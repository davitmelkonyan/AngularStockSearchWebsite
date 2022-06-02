export interface News {
    all_news: NewsStory[];
}

export interface NewsStory{
    category:string;
    datetime:number;
    headline:string;
    id:number;
    image:string;
    related:string;
    source:string;
    summary:string;
    url:string;
}
