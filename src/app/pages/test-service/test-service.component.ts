import { Component, Injector } from "@angular/core";
import { StockService } from "../../service/stock.service";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { NasdaqStocksModel, NasdaqStocksRowModel } from "../../om/stock-service.model/getNasdaqStocks.model";
import { GraphData } from "../../component/line-chart/line-chart-model";
import { LineChartSeriesKey } from "../../../assets/const/LineCharSeries";

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
    this.stockService.getHistoryChart(id).subscribe(response => {
      this.show = false;
      let grapObj = this.stockService.generateGraph(
        response,
        [LineChartSeriesKey._max, LineChartSeriesKey._min, LineChartSeriesKey._open, LineChartSeriesKey._close]
      );
      this.graphSource = grapObj.graphSource;
      this.graphLegend = grapObj.graphLegend;
      this.yScaleMax = grapObj.yScaleMax;
      this.yScaleMin = grapObj.yScaleMin;
      setTimeout(() => {
        this.show = true;
      }, 75);
    })
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