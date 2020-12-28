import { stringsNotNull } from "../../util/stringsNotNull";

export class Exctraction {
  date: Date;
  rawData: any[];
  parsedData?: ExtractionDetail[] = [];

  constructor(
    date: Date,
    rawData: any[]
  ) {
    this.date = date;
    this.rawData = rawData;
    this.parsedData = [];
    populateMap(rawData).forEach((value, key) => {
      this.parsedData.push(new ExtractionDetail(key, value));
    })
  }
}

function populateMap(
  data: any[],
): Map<string, ExtractionResource[]> {
  let mapindex: number = -1;
  let rawMap: Map<number, any[]> = new Map();
  let refineMap: Map<string, any[]> = new Map(); // es <"AZIONI", datiEstrazione>
  (data || []).forEach(row => { // build refinedMap
    let firstKey: string = row[Object.keys(row)[0]];
    if (!!firstKey && firstKey.toUpperCase().trim() == 'DESCRIZIONE') {
      mapindex++;
      rawMap.set(mapindex, [row]);
    } else if (rawMap.has(mapindex)) {
      rawMap.get(mapindex).push(row);
    }
    if (firstKey.toUpperCase().startsWith("TOT")) {
      let key: string = manageTotCell(firstKey);
      if (stringsNotNull(key)) {
        refineMap.set(
          key,
          rawMap.get(mapindex)
        );
      }
      mapindex++;
    }
  });
  let parsedMap: Map<string, ExtractionResource[]> = new Map(); // es <"AZIONI", <ExtractionResource[]>datiEstrazione>
  refineMap.forEach((value, key) => {
    try {
      let extractionObj: ExtractionObj = ExtractionDetailMap.get(getExtractionType(key));
      if (!extractionObj) {
        throw new Error("Tipo estrazione not found. key: " + key);
      }
      parsedMap.set(
        key,
        dataToResource(extractionObj, value)
      )
    } catch (error) {
      console.error("Catched error: " + error);
    }
  })
  return parsedMap;
}

function manageTotCell(firstKey: string): string {
  firstKey = firstKey.replace("\r\n", " ");
  firstKey = firstKey.replace("TOT.", "TOT ");
  let arr = firstKey.split(" ");
  if (arr.length > 1 && stringsNotNull(arr[1])) {
    arr.splice(0, 1);
  }
  return arr.join(" ").trim();
}

function dataToResource(extractionObj: ExtractionObj, extractionData: any[]): ExtractionResource[] {
  let output: ExtractionResource[] = [];

  /** Mappa valori - colonna rilevante */
  let significantCell: Map<string, number> = new Map();
  extractionObj.extractionColumns.forEach(columnKey => {
    Object.keys(extractionData[0]).forEach((key, colIndex) => {
      if (extractionData[0][key] == columnKey.colName) {
        significantCell.set(columnKey.colField, colIndex);
      } else if (
        extractionData[0][key] == "Utile-Perdite"
        || extractionData[0][key] == "Utile Perdite"
      ) {
        significantCell.set("_incomeLossPercentage", colIndex);
        significantCell.set("_incomeLossValue", colIndex + 1);
      }
    })
  });

  extractionData.forEach(row => {
    let ext: ExtractionResource = {};
    significantCell.forEach((value, key) => {
      ext[key] = row[Object.keys(row)[value]];
    })
    output.push(ext);
  })

  return output;
}

interface ExtractionResource {
  _description?: string;
  _quantity?: string;
  _avarageChargePrice?: number;
  _marketPrice?: number;
  _date?: string;
  _incomeLossPercentage?: string;
  _incomeLossValue?: number;
  _chargeValue?: number;
  _counterValue?: number;
  _insurancePremiumsPaid?: number;
}


// ---------- EXTRACTION CLASSES ----------

export interface pippo {
  pippo(param: string): void;
}

export class ExtractionDetail {
  extractionLabel: string;
  extractionType: string;
  rows: ExtractionRow[] = [];
  constructor(type: string, extractionData: ExtractionResource[]) {
    let extractionType: string = getExtractionType(type);
    let extractionObj: ExtractionObj = ExtractionDetailMap.get(extractionType);
    if (!!extractionObj) {
      this.extractionLabel = type;
      this.extractionType = extractionType;
      extractionData.forEach((extraction, index) => {
        index != 0 && this.rows.push(new ExtractionRow(extractionObj.extractionColumns, extraction));
      });
      /*
      */
      let colField: string = this.rows[this.rows.length - 1].columns[0].colField;
      if (
        extractionType != "Polizze"
        && !!colField
        && typeof colField == "string"
        && colField.startsWith("TOT")
      ) {
        this.rows[this.rows.length - 1].columns.splice(1, 0,
          new ExtractionColumn(
            "col.colName",
            "-",
            "col.colWidth",
            "col.headerTooltip",
            false,
            false
          )
        )
        this.rows[this.rows.length - 1].columns.pop();
      }
    } else {
      window.alert("Unsupported extraction");
    }
  }
}

export class ExtractionRow {
  columns: ExtractionColumn[] = [];
  constructor(columns: ExtractionColumn[], extraction: ExtractionResource) {
    columns.forEach((col, index) => {
      this.columns.push(
        new ExtractionColumn(
          col.colName,
          stringsNotNull(col.action) ? col.action : extraction[col.colField],
          col.colWidth,
          col.headerTooltip,
          col.isCurrency,
          col.inRowExpander,
          col.action
        )
      )
    });
  }
}

export class ExtractionColumn {
  colName: string;
  colField: string;
  colWidth?: string;
  headerTooltip?: string;
  isCurrency?: boolean;
  inRowExpander?: boolean;
  action?: string;
  constructor(
    colName: string,
    colField: string,
    colWidth?: string,
    headerTooltip?: string,
    isCurrency?: boolean,
    inRowExpander?: boolean,
    action?: string,
  ) {
    this.colName = colName;
    this.colField = colField;
    this.colWidth = colWidth;
    this.headerTooltip = headerTooltip;
    this.isCurrency = !!isCurrency;
    this.inRowExpander = !!inRowExpander;
    this.action = action;
  }
}

export class ExtractionObj {
  extractionLabel: string;
  extractionColumns: ExtractionColumn[];
  constructor(
    extractionLabel?: string,
    extractionColumns?: ExtractionColumn[]
  ) {
    this.extractionLabel = extractionLabel;
    this.extractionColumns = extractionColumns || [];
  }
}

// ---------- CONST ----------

export function getExtractionType(key: string): string {
  switch (key.toUpperCase().trim()) {
    case "AZIONI":
    case "OBBLIGAZIONI":
    case "TITOLI DI STATO":
    case "ETF":
    case "ETC":
    case "CERTIFICATES":
      return ExtractionTypes._financialInvestments;
    case "POLIZZE":
      return ExtractionTypes._insurances;
    case "FONDI COMUNI":
      return ExtractionTypes._founds;
    default:
      return "not found";
  }
}

export const ActionIcon = {
  _play: "play-circle.svg"
}

export const ExtractionTypes = {
  _financialInvestments: "Investimenti finanziari",
  _insurances: "Polizze",
  _founds: "Fondi Comuni"
};

export const ExtractionDetailMap: Map<string, ExtractionObj> = new Map([
  [
    ExtractionTypes._financialInvestments,
    {
      extractionLabel: ExtractionTypes._financialInvestments,
      extractionColumns: [
        {
          colName: "Descrizione",
          colField: "_description",
          colWidth: "20%"
        },
        {
          colName: "Quantità",
          colField: "_quantity"
        },
        {
          colName: "Prezzo medio di carico",
          colField: "_avarageChargePrice",
          isCurrency: true
        },
        {
          colName: "Prezzo Mercato",
          colField: "_marketPrice",
          isCurrency: true
        },
        {
          colName: "Data-Ora",
          colField: "_date"
        },
        {
          colName: "Utile-Perdite (%)",
          colField: "_incomeLossPercentage"
        },
        {
          colName: "Utile-Perdite (€)",
          colField: "_incomeLossValue",
          isCurrency: true
        },
        {
          colName: "Valore carico",
          colField: "_chargeValue",
          isCurrency: true
        },
        {
          colName: "Controvalore",
          colField: "_counterValue",
          isCurrency: true
        },
        {
          colName: "Vedi andamento",
          colField: "",
          action: ActionIcon._play
        }
      ]
    }
  ],
  [
    ExtractionTypes._insurances,
    {
      extractionLabel: ExtractionTypes._insurances,
      extractionColumns: [
        {
          colName: "Descrizione",
          colField: "_description",
          colWidth: "20%"
        },
        {
          colName: "Premi Versati",
          colField: "_insurancePremiumsPaid",
          isCurrency: true
        },
        {
          colName: "Controvalore",
          colField: "_counterValue",
          isCurrency: true
        }
      ]
    }
  ],
  [
    ExtractionTypes._founds,
    {
      extractionLabel: ExtractionTypes._founds,
      extractionColumns: [
        {
          colName: "Descrizione",
          colField: "_description",
          colWidth: "20%"
        },
        {
          colName: "Numero Quote",
          colField: "_quantity",
          isCurrency: true
        },
        {
          colName: "Valore quaota di carico",
          colField: "_chargeShare",
          isCurrency: true
        },
        {
          colName: "Valora Ultima Quota",
          colField: "_lastShareValue",
          isCurrency: true
        },
        {
          colName: "Data Ultima Quota",
          colField: "_date"
        },
        {
          colName: "Utile-Perdite (%)",
          colField: "_incomeLossPercentage"
        },
        {
          colName: "Utile-Perdite (€)",
          colField: "_incomeLossValue",
          isCurrency: true
        },
        {
          colName: "Valore carico",
          colField: "_chargeValue",
          isCurrency: true
        },
        {
          colName: "Controvalore",
          colField: "_counterValue",
          isCurrency: true
        }
      ]
    }
  ]
])