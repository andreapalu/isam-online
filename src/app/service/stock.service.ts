import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, from, of } from "rxjs";
import { buffer } from "rxjs/operators";
import { YahooChartModel } from "../om/stock-service.model/getChart.model";
import { CommunicationManagerService, HttpVerbs } from "./communicationManager.service";
import { NasdaqStocksModel } from "../om/stock-service.model/getNasdaqStocks.model";
import { GraphData } from "../component/line-chart/line-chart-model";
import { LineCharSeriesMap, yahooDateMultiplier } from "../../assets/const/LineCharSeries";
import { parseDateNotNull, parseFloatNotNull } from "../util/parseFunction";

const _startDate: Date = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
const _today: Date = new Date();

/**
 * regularMarketTime: 1610704142 --> * 1000 = data attuale
 * firstTradeDateMilliseconds: 1410908400000
 */

@Injectable()
export class StockService {
  diff: number;

  constructor(
    private communicationManagerService: CommunicationManagerService
  ) {
    let a = _startDate;
    a.setFullYear(2021)
    this.diff = a.getTime() - _startDate.getTime();
  }

  getChart(id: string): Observable<YahooChartModel> {
    let endDate: Date = new Date(Date.UTC(1970, 0, _startDate.getDay() + 2, 0, 0, 0, 0));
    let startDate: Date = new Date(Date.UTC(_today.getFullYear(), _today.getMonth(), _today.getDay() - 2, 0, 0, 0, 0));
    return this.communicationManagerService.callMockService<YahooChartModel>({
      apiEndpoint: "stock-api/getChart",
      apiMethod: HttpVerbs.get,
      pathParams: { id },
      queryStringParams: {
        region: "US",
        lang: "en-US",
        // includePrePost: "false",
        interval: "1d", // un punto ogni
        period1: ((startDate.getTime() - this.diff) / 1000).toString(),
        period2: ((_today.getTime() - this.diff) / 1000).toFixed(0).toString(),
        // period2: "1000999999",
        // useYfid: "true",
        // range: "1wk",
        // corsDomain: "finance.yahoo.com",
        // ".tsrc": "finance"
      }
    })
  }
  // interval/range one of [1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo]

  getHistoryChart(id: string): Observable<YahooChartModel> {
    return this.communicationManagerService.callMockService<YahooChartModel>({
      apiEndpoint: "stock-api/getChart",
      apiMethod: HttpVerbs.get,
      pathParams: { id }
    })
  }

  string = "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance"

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

  /** Genera il grafico */
  generateGraph(serviceData: YahooChartModel, series: string[]): { graphSource: GraphData[], graphLegend: string[], yScaleMin: number, yScaleMax: number } {
    let graphSource: GraphData[] = [];
    let graphLegend: string[] = []
    let yScaleMin: number;
    let yScaleMax: number;
    if (!serviceData || !serviceData.chart || !serviceData.chart.result || serviceData.chart.result.length == 0) { // caso niente dati
      let emptySerie: GraphData = {
        color: "white",
        name: "Nessun record",
        series: []
      };
      for (let i = 0; i < 12; i++) {
        emptySerie.series.push({ name: new Date(2021, i, 1), value: 100 })
      }
      graphSource.push(emptySerie);
    } else {
      let seriesObj: { [serie: string]: GraphData } = {};
      series.forEach(serie => seriesObj[serie] = { series: [], name: LineCharSeriesMap.get(serie).name, color: LineCharSeriesMap.get(serie).color });

      let startDate: Date;
      let endDate: Date;
      let maxValue: number = 0;
      let minValue: number = 0;
      serviceData.chart.result.forEach(result => {
        result.timestamp.forEach((tms, index) => {
          tms = tms * yahooDateMultiplier;
          if (index == 0) {
            startDate = parseDateNotNull(tms);
          }
          if (index == (result.timestamp.length - 1)) {
            endDate = parseDateNotNull(tms);
          }
          let name: Date = parseDateNotNull(tms);
          let volumeValue: number = parseFloatNotNull(result.indicators.quote[0].volume[index]);

          if (!!volumeValue && volumeValue != 0 && volumeValue != null) {
            Object.keys(seriesObj).forEach((key) => {
              let value: number = parseFloatNotNull(result.indicators.quote[0][LineCharSeriesMap.get(key).field][index]);
              seriesObj[key].series.push({
                name: name,
                value: value
              });
              if (!maxValue && !minValue) {
                maxValue = value;
                minValue = value;
              } else if (value > maxValue) {
                maxValue = value;
              } else if (value < minValue) {
                minValue = value;
              }
            });
          }
        })

      });
      yScaleMin = minValue;
      yScaleMax = maxValue;
      Object.keys(seriesObj).forEach((key) => {
        graphSource.push(seriesObj[key]);
        graphLegend.push(LineCharSeriesMap.get(key).name + ": " + startDate.toDateString() + " - " + endDate.toDateString());
      });
    }
    return { graphSource, graphLegend, yScaleMin, yScaleMax };
  }

}