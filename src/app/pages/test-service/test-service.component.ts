import { Component, Injector } from "@angular/core";
import { StockService } from "../../service/stock.service";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { NasdaqStocksModel, NasdaqStocksRowModel } from "../../om/stock-service.model/getNasdaqStocks.model";
import { GraphData } from "../../component/line-chart/line-chart-model";
import { parseDateNotNull, parseFloatNotNull } from "../../util/parseFunction";
import { YahooChartModel } from "../../om/stock-service.model/getChart.model";

@Component({
  selector: "test-service",
  templateUrl: "./test-service.component.html",
  styleUrls: ["./test-service.component.scss"]
})
export class TestServiceComponent extends BasePageComponent {

  rows: NasdaqStocksRowModel[] = [];
  totalrecords: number = 0;

  /** Line-chart */
  graphSource: GraphData[] = [];
  graphLegend: string[] = []
  show: boolean = false;
  graphTitle: string;
  yScaleMin: number;
  yScaleMax: number;

  constructor(
    injector: Injector,
    private stockService: StockService
  ) {
    super(injector);
  }

  onInit() {
    this.getNasdaqStocks();
  }

  getNasdaqStocks() {
    this.stockService.getNasdaqStocks().subscribe(response => {
      let nasdaqStocksModel: NasdaqStocksModel = response;
      this.totalrecords = nasdaqStocksModel.data.rows.length;
      this.rows = nasdaqStocksModel.data.rows;

    })
  }

  getChart(id: string) {
    this.stockService.getChart(id).subscribe(response => {
      this.generateGraph(response);
    })
  }

  /** Genera il grafico */
  generateGraph(serviceData: YahooChartModel) {
    this.resetGraph();
    if (!serviceData || !serviceData.chart || !serviceData.chart.result || serviceData.chart.result.length == 0) { // caso niente dati
      let emptySerie: GraphData = {
        color: "white",
        name: "Nessun record",
        series: []
      };
      for (let i = 0; i < 12; i++) {
        emptySerie.series.push({ name: new Date(2021, i, 1), value: 100 })
      }
      this.graphSource.push(emptySerie);
    } else {

      let highSerie: GraphData = { series: [] };
      let minSerie: GraphData = { series: [] };
      let closureSerie: GraphData = { series: [] };
      let openSerie: GraphData = { series: [] };
      let startDate: Date;
      let endDate: Date;
      closureSerie.color = "#5965BA";
      closureSerie.name = "Chiusura";
      openSerie.color = "#FABE0A";
      openSerie.name = "Apertura";
      highSerie.color = "#17d200";
      highSerie.name = "Massimi";
      minSerie.color = "#ff0000";
      minSerie.name = "Minimi";
      serviceData.chart.result.forEach(result => {
        result.timestamp.forEach((tms, index) => {
          if (index == 0) {
            startDate = parseDateNotNull(tms);
          }
          if (index == (result.timestamp.length - 1)) {
            endDate = parseDateNotNull(tms);
          }
          // let name: string = parseDateNotNull(tms).toDateString();
          let name: Date = parseDateNotNull(tms);
          let highValue: number = parseFloatNotNull(result.indicators.quote[0].high[index]);
          let minValue: number = parseFloatNotNull(result.indicators.quote[0].low[index]);
          let openValue: number = parseFloatNotNull(result.indicators.quote[0].open[index]);
          let closeValue: number = parseFloatNotNull(result.indicators.quote[0].close[index]);
          let volumeValue: number = parseFloatNotNull(result.indicators.quote[0].volume[index]);
          if (!!volumeValue && volumeValue != 0 && volumeValue != null) {
            highSerie.series.push({
              name: name,
              value: highValue
            })
            minSerie.series.push({
              name: name,
              value: minValue
            })
            closureSerie.series.push({
              name: name,
              value: closeValue
            })
            openSerie.series.push({
              name: name,
              value: openValue
            })
          }
        })

      });
      let values: number[] = [
        ...highSerie.series.map(x => x.value),
        ...minSerie.series.map(x => x.value),
        ...closureSerie.series.map(x => x.value),
        ...openSerie.series.map(x => x.value)
      ];
      // this.yScaleMin = Math.min(...values) - Math.abs(Math.min(...values) * 0.1);
      // this.yScaleMax = Math.max(...values) + Math.abs(Math.max(...values) * 0.1);
      this.yScaleMin = Math.min(...values);
      this.yScaleMax = Math.max(...values);
      this.graphSource.push(closureSerie, openSerie, highSerie, minSerie);
      this.graphLegend = [
        "Chiusura" + ": " + startDate.toDateString() + " - " + endDate.toDateString(),
        "Apertura" + ": " + startDate.toDateString() + " - " + endDate.toDateString(),
        "Massimi" + ": " + startDate.toDateString() + " - " + endDate.toDateString(),
        "Minimi" + ": " + startDate.toDateString() + " - " + endDate.toDateString(),
      ]
    }
    setTimeout(() => {
      this.show = true;
    }, 75);
  }

  resetGraph() {
    this.graphSource = []
    this.graphLegend = undefined;
    this.show = false;
  }

  selectedStock: NasdaqStocksRowModel;
  selectStock(item: NasdaqStocksRowModel) {
    this.selectedStock = item;
    (<HTMLInputElement>document.getElementById('stockName')).value = item.name;
    this.filteredList = [];
    this.getChart(item.symbol)
  }

  filteredList: NasdaqStocksRowModel[];
  lastkeydown1: number = 0;
  overFlowSearch: boolean = false;
  getFilteredList($event) {
    let stockName: string = (<HTMLInputElement>document.getElementById('stockName')).value;
    this.filteredList = [];

    if (stockName.length > 2) {
      if ($event.timeStamp - this.lastkeydown1 > 200) {
        this.filteredList = this.searchFromArray(stockName);
        this.lastkeydown1 = $event.timeStamp;
      }
    }
  }

  searchFromArray(regex: string): NasdaqStocksRowModel[] {
    let matches: NasdaqStocksRowModel[] = [];
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].name.toLowerCase().match(regex.toLowerCase())) {
        matches.push(this.rows[i]);
      }
      if (matches.length > 99) {
        this.overFlowSearch = true;
        break;
      } else {
        this.overFlowSearch = false;
      }
    }
    return matches;
  };

}