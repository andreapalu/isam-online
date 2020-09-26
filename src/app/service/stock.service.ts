import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class StockService {
  private api = "https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&includePrePost=false&interval=2m&range=1d&.tsrc=finance";
  private new_url = "https://query1.finance.yahoo.com/v8/finance/chart/${symbol}";

  constructor(private httpClient: HttpClient) {}

  public getStockInformation(ticker: string): Observable<any> {
    let api = this.new_url.replace("${symbol}", ticker);
    return this.httpClient.get(api);
  }

}