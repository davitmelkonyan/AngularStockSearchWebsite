export interface Sentiment {
    reddit: sentimentInterf[];
    symbol: string;
    twitter: sentimentInterf[];
}

interface sentimentInterf{
    atTime: string;
    mention: number;
    positiveScore: number;
    negativeScore: number;
    positiveMention: number;
    negativeMention: number;
    score: number;
}
