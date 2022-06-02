export interface Autocomplete {
    count: number;
    result: Subautocomplete[];
}

interface Subautocomplete {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
}