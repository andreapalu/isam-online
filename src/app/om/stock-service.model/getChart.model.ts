export class YahooChartModel {
    chart: YahooChartObj;
}

export class YahooChartObj {
    result: YahooChartResultObj[];
    error: any;
}

export class YahooChartResultObj {
    meta: YahooChartMetaObj;
    timestamp: number[]; // integer 
    indicators: YahooChartIndicatorsObj;
}

export class YahooChartIndicatorsObj {
    quote: YahooChartQuoteObj[];
}

export class YahooChartQuoteObj {
    close: number[]; // float
    high: number[]; // float
    low: number[]; // float
    open: number[]; // float
    volume: number[]; // float
}

export class YahooChartTimeObj {
    timezone: string; // EST,
    start: number; // 1609318800,
    end: number; // 1609338600,
    gmtoffset: number; // -18000
}

export class YahooChartMetaObj {
    currency: string; // USD,
    symbol: string; // TSLA,
    exchangeName: string; // NMS,
    instrumentType: string; // EQUITY,
    firstTradeDate: number; // 1277818200,
    regularMarketTime: number; // 1609356897,
    gmtoffset: number; // -18000,
    timezone: string; // EST,
    exchangeTimezoneName: string; // America/New_York,
    regularMarketPrice: number; // 692.71,
    chartPreviousClose: number; // 665.99,
    previousClose: number; // 665.99,
    scale: number; // 3,
    priceHint: number; // 2,
    currentTradingPeriod: {
        pre: YahooChartTimeObj;
        regular: YahooChartTimeObj;
        post: YahooChartTimeObj;
    };
    tradingPeriods: YahooChartTimeObj[][];
    dataGranularity: string; // 1m,
    range: string; // 1d,
    validRanges: string[];
}

export const validRanges = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]