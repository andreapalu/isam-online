import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, from } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class StockService {
  private api =
    "https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&includePrePost=false&interval=2m&range=1d&.tsrc=finance";
  
  private new_url =
    "https://query1.finance.yahoo.com/v8/finance/chart/${symbol}";

  private proxy_url = "/stock/v8/finance/chart/${symbol}";
  
  private proxy_url_test = "/stock/ciaone/${symbol}";

  private options?: CommOption = {};

  constructor(private httpClient: HttpClient) {}

  public getStockInformation(ticker: string): Observable<any> {
    let api = this.proxy_url.replace("${symbol}", ticker);
    this.options = {
      responseType: "json"
    };
    const httpOptions = {
      headers: new HttpHeaders({
        "Access-Control-Allow-Origin": "*",
        Authorization: "authkey",
        userid: "1"
      })
    };
    const noCors = {
      // mode: 'no-cors'
      withCredentials: false
    };
    return this.httpClient.get(api, this.options);
  }

  public fetch(ticker: string): Observable<any> {
    let api = this.new_url.replace("${symbol}", ticker);
    let proxy = this.proxy_url.replace("${symbol}", ticker);
    let proxyTest = this.proxy_url_test.replace("${symbol}", ticker);
    let req: RequestInit = {};
    req.headers = {};

    return from(
      // wrap the fetch in a from if you need an rxjs Observable
      fetch(proxyTest, {
        // body: JSON.stringify(data),
        headers: {
          Accept:
            "text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8",
          // "Accept": "text/html, application/xhtml+xml, application/xml;q=0.9, image/avif, image/webp,image/apng, */*;q=0.8, application/signed-exchange;v=b3;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
          // "Content-Type": "application/json",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-Mode": "navigate",
          // "Sec-Fetch-User": "?1",
          "Sec-Fetch-Dest": "document",
          "Upgrade-Insecure-Requests": "1"
        },
        method: "GET",
        mode: "no-cors"
      })
    );
  }
}

export class CommOption {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: "body";
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType?: "json";
  withCredentials?: boolean;
}
