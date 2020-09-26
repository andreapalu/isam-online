import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class StockService {
  private api =
    "https://query1.finance.yahoo.com/v8/finance/chart/{0}?region=US&lang=en-US&includePrePost=false&interval=2m&range=1d&.tsrc=finance";

  constructor(private httpClient: HttpClient) {}

  public getStockInformation(ticker): Observable<any> {
    let api = this.api.replace("{0}", ticker);
    return this.httpClient.get(api);
  }

}