import { Component, Injector } from "@angular/core";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { ExtractionColumn, ExtractionDetail, ExtractionDetailMap, ExtractionObj, ExtractionRow } from "../../om/extraction.model/Extraction";
import { ExtractionService } from "../../service/extraction.service";
import { cloneDeep } from 'lodash';
import { GraphData, Series } from "../../component/line-chart/line-chart-model";
import { parseDateNotNull, parseFloatNotNull } from "../../util/parseFunction";

@Component({
  selector: "infografica",
  templateUrl: "./infografica.component.html",
  styleUrls: ["./infografica.component.scss"]
})
export class InfograficaComponent extends BasePageComponent {

  extractionDetail: ExtractionDetail;
  extractionObj: ExtractionObj;
  selectedTitle: string;

  /** Line-chart */
  graphSource: GraphData[] = [];

  graphLegend: string[] = []
  show: boolean = false;
  graphTitle: string;
  yScaleMin: number;
  yScaleMax: number;

  constructor(
    injector: Injector,
    private extractionService: ExtractionService
  ) {
    super(injector);
  }

  onInit() {
    let payload = this.navigationManagerService.getPayload("infograficaPayload", true);
    if (!!payload) {
    } else {
      payload = sessionStorage.getItem("infograficaPayload");
      if (!!payload) {
        let p: { table: ExtractionDetail, row: ExtractionRow } = JSON.parse(payload);
        this.selectedTitle = p.row.columns[0].colField;
        this.graphTitle = "INFOGRAFICA per " + this.selectedTitle;
        let extractions: ExtractionDetail[] = cloneDeep(this.extractionService.extractionList
          .map(ext =>
            ext.parsedData.find(extWtype => (
              extWtype.extractionLabel == p.table.extractionLabel
              && !!extWtype.rows.find(row =>
                !!row.columns.find(col => col.colField == this.selectedTitle)
              )
            ))
          )) || [];
        extractions.forEach(ext => {
          ext.rows = ext.rows.filter(row => !!row.columns.find(col => col.colField == this.selectedTitle))
        })

        if (extractions.length > 0) {
          this.extractionDetail = {
            extractionLabel: extractions[0].extractionLabel,
            extractionType: extractions[0].extractionType,
            rows: [...extractions.map(el => el.rows)][0]
          };
          this.extractionObj = ExtractionDetailMap.get(this.extractionDetail.extractionType);

        }
        // sessionStorage.removeItem("infograficaPayload"); // TODO: RIPRISTINARE A SVILUPPI FINITI
      } else {
        this.navigationManagerService.goTo("/home")
      }
    }
  }

  mock: boolean = false;
  test() {
    if (this.mock) {
      this.getGraph(ResponseFull);
    } else {
      this.getGraph(ResponseEmpty);
    }
    this.mock = !this.mock;
  }

  /** Genera il grafico */
  generateGraph(columSelected: ExtractionColumn) {
    this.resetGraph();
    if (!this.extractionDetail || !this.extractionDetail.rows) { // caso niente dati
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
      let dateIndex: number;
      let valueIndex: number;
      this.extractionObj.extractionColumns.forEach((col, index) => {
        if (col.colField == "_date") {
          dateIndex = index;
        }
        if (col.colField == columSelected.colField) {
          valueIndex = index;
        }
      });
      let graphData: GraphData = { series: [] };
      graphData.color = "#5965BA";
      graphData.name = this.extractionDetail.extractionLabel;
      this.extractionDetail.rows.forEach(row => {
        let name: Date = parseDateNotNull(row.columns[dateIndex].colField);
        let value: number = parseFloatNotNull(row.columns[valueIndex].colField);
        graphData.series.push({
          name: name,
          value: value
        })
      });
      let values: number[] = [...graphData.series.map(x => x.value)];
      this.yScaleMin = Math.min(...values) - Math.abs(Math.min(...values) * 0.1);
      this.yScaleMax = Math.max(...values) + Math.abs(Math.max(...values) * 0.1);
      this.graphSource.push(graphData);
      this.graphLegend = [this.graphTitle + ": " + "1 gen " + "2015" + " - " + "OGGI"]
    }
    setTimeout(() => {
      this.show = true;
    }, 75);
  }

  /**
   * gestione dei gragici andamentali
   */
  getGraph(payload: GetPugTurnoverResource) {
    this.resetGraph();
    if (
      !!payload.trendRateResource
      && payload.trendRateResource.length == 0
    ) { // caso niente dati
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
      let oldSeries: GraphData = { series: [] };
      let newSeries: GraphData = { series: [] };
      let series: Series[] = payload.trendRateResource.map(x => ({ name: x.annomese, value: x.tasso }));
      oldSeries.color = "#FABE0A";
      oldSeries.name = "VECCHIO TASSO";
      newSeries.color = "#5965BA";
      newSeries.name = "NUOVO TASSO";
      let years: string[] = payload.anni;
      let values: number[] = [];
      series.forEach(serie => {
        if (typeof serie.name == "string" && serie.name.substring(0, 4) == years[0]) {
          serie.name = new Date(parseInt(years[0]), parseInt(serie.name.substring(4, 6)) - 1, 1)
          oldSeries.series.push(serie);
        } else if (typeof serie.name == "string") {
          serie.name = new Date(parseInt(years[0]), parseInt(serie.name.substring(4, 6)) - 1, 1)
          newSeries.series.push(serie);
        }
        values.push(serie.value);
      });
      this.yScaleMin = Math.min(...values) - Math.abs(Math.min(...values) * 0.1);
      this.yScaleMax = Math.max(...values) + Math.abs(Math.max(...values) * 0.1);

      if (oldSeries.series.length == 0) {
        this.graphSource.push(newSeries);
        this.graphLegend = ["NUOVO TASSO" + ": " + "1 gen " + years[1] + " - " + "OGGI"]
      } else if (newSeries.series.length == 0) {
        this.graphSource.push(oldSeries);
        this.graphLegend = ["VECCHIO TASSO" + ": " + "1 gen " + years[0] + " - " + "31 dic " + years[0]];
      } else {
        this.graphSource.push(oldSeries, newSeries);
        this.graphLegend = ["VECCHIO TASSO" + ": " + "1 gen " + years[0] + " - " + "31 dic " + years[0],
        "NUOVO TASSO" + ":" + "1 gen " + years[1] + " - " + "OGGI"];
      }
    }
    setTimeout(() => {
      this.show = true;
    }, 75);
  }

  xFormatFn = function (value: Date): string {
    const options = { month: 'long', day: 'numeric' };
    const length: number = value.getDate().toString().length;
    const firstLetter: string = value.toLocaleDateString('it-IT', options).replace(/[^ -~]/g, '').charAt(length + 1).toUpperCase();
    let newValue: string = value.toLocaleDateString('it-IT', options).replace(/[^ -~]/g, '').substring(0, length + 1)
      .concat(firstLetter)
      .concat(value.toLocaleDateString('it-IT', options).replace(/[^ -~]/g, '').substring(length + 2, length + 4));
    return newValue;
  }

  resetGraph() {
    this.graphSource = []
    this.graphLegend = undefined;
    this.show = false;
  }

}

export class GetPugTurnoverResource {
  anni?: Array<string>;
  trendRateResource?: Array<TrendRate>;
}
export class TrendRate {
  tasso?: number;
  timestamp?: string;
  annomese?: any;
}

export const ResponseFull = {
  "pugTurnoverResource": [],
  "trendRateResource": [],
  "anni": [
    "2018",
    "2019",
    "2020"
  ]
}
export const ResponseEmpty = {
  "pugTurnoverResource": [],
  "trendRateResource": [
    {
      "tasso": 0.02,
      "timestamp": "2019-01-27 19:20:03.865953",
      "annomese": "201901"
    },
    {
      "tasso": 0.102,
      "timestamp": "2019-02-27 19:20:03.865393",
      "annomese": "201902"
    },
    {
      "tasso": 0.202,
      "timestamp": "2019-03-27 19:20:03.865953",
      "annomese": "201903"
    },
    {
      "tasso": 0.502,
      "timestamp": "2019-04-27 19:20:03.865393",
      "annomese": "201904"
    },
    {
      "tasso": 0.402,
      "timestamp": "2019-05-27 19:20:03.865953",
      "annomese": "201905"
    },
    {
      "tasso": 0.702,
      "timestamp": "2019-06-27 19:20:03.865393",
      "annomese": "201906"
    },
    {
      "tasso": 0.602,
      "timestamp": "2019-07-27 19:20:03.865953",
      "annomese": "201907"
    },
    {
      "tasso": 0.802,
      "timestamp": "2019-08-27 19:20:03.865393",
      "annomese": "201908"
    },
    {
      "tasso": 0.802,
      "timestamp": "2020-01-27 19:20:03.865953",
      "annomese": "202001"
    },
    {
      "tasso": 0.602,
      "timestamp": "2020-02-27 19:20:03.865393",
      "annomese": "202002"
    },
    {
      "tasso": 0.702,
      "timestamp": "2020-03-27 19:20:03.865953",
      "annomese": "202003"
    },
    {
      "tasso": 0.402,
      "timestamp": "2020-04-27 19:20:03.865393",
      "annomese": "202004"
    },
    {
      "tasso": 0.502,
      "timestamp": "2020-05-27 19:20:03.865953",
      "annomese": "202005"
    },
    {
      "tasso": 0.202,
      "timestamp": "2020-06-27 19:20:03.865393",
      "annomese": "202006"
    },
    {
      "tasso": 0.302,
      "timestamp": "2020-07-27 19:20:03.865953",
      "annomese": "202007"
    },
    {
      "tasso": 0.102,
      "timestamp": "2020-08-27 19:20:03.865393",
      "annomese": "202008"
    },
  ],
  "anni": [
    "2019",
    "2020"
  ]
}