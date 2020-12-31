import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { YahooChartModel } from "../om/stock-service.model/getChart.model";
import { CommunicationManagerService, HttpVerbs } from "./communicationManager.service";
import { NasdaqStocksModel } from "../om/stock-service.model/getNasdaqStocks.model";

@Injectable()
export class StockService {

  constructor(
    private communicationManagerService: CommunicationManagerService
  ) { 
  }

  getChart(id: string): Observable<YahooChartModel> {
    return this.communicationManagerService.callMockService<YahooChartModel>({
      apiEndpoint: "stock-api/getChart",
      apiMethod: HttpVerbs.get,
      pathParams: { id }
    })
  }

  getNasdaqStocks(): Observable<NasdaqStocksModel> {
    return this.communicationManagerService.callMockService<NasdaqStocksModel>({
      apiEndpoint: "stock-api/getStocks",
      apiMethod: HttpVerbs.get,
      queryStringParams: {
        tableonly: 'true',
        limit: '25',
        download: 'true'
      }
    })
  }

}