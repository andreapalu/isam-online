export class NasdaqStocksModel {
    data: {
        // filters: number;
        headers: {
            symbol: Symbol,
            name: string, // Name,
            lastsale: string, // Last Sale,
            netchange: string, // Net Change,
            pctchange: string, // % Change,
            marketCap: string, // Market Cap
        };
        rows: NasdaqStocksRowModel[];
        // totalrecords: number; // 7236,
        // asof: string; // Last price as of Dec 30, 2020
    };
    message: number; // null,
    status: {
        rCode: number, // 200,
        bCodeMessage: number, // null,
        developerMessage: number, // null
    }
}

export class NasdaqStocksRowModel {
    symbol: string; // AAPL;
    name: string; // Apple Inc. Common Stock,
    lastsale: string; // $133.90,
    netchange: string; // -0.97,
    pctchange: string; // -0.719%,
    marketCap: string; // 2,321,469,826,000,
    url: string; // /market-activity/stocks/aapl
}