export class Exctraction {
  date: Date;
  rawData: any[];
  refineMap?: Map<string, any[]> = new Map();
  parsedData?: ExtractionDetail[] = [];

  constructor(
    date: Date,
    rawData: any[]
  ) {
    this.date = date;
    this.rawData = rawData;
    this.refineMap = new Map();
    this.refineMap = populateMap(rawData, this.refineMap);
    this.parsedData = [];
    this.refineMap.forEach((value, key) => {
      this.parsedData.push(new ExtractionDetail(key, value));
    })
  }

}

function populateMap(
  data: any[],
  refineMap: Map<string, any[]>,
): Map<string, any[]> {
  let mapindex: number = -1;
  let rawMap = new Map();
  data.forEach(row => {
    let firstKey: string = row[Object.keys(row)[0]];
    if (firstKey == 'Descrizione') {
      mapindex++;
      rawMap.set(mapindex, [row]);
    } else if (rawMap.has(mapindex)) {
      rawMap.get(mapindex).push(row);
    }
    if (firstKey.startsWith("TOT")) {
      let arr = firstKey.split(" ");
      arr.splice(0, 1);
      refineMap.set(
        arr.join(" "),
        rawMap.get(mapindex)
      );
      mapindex++;
    }
  });
  return refineMap;
}


// ---------- EXTRACTION CLASSES ----------

export class ExtractionDetail {
  extractionLabel: string;
  extractionType: string;
  rows: ExtractionRow[] = [];
  constructor(type: string, extractionData: any[]) {
    let extractionType: string = getExtractionType(type);
    let extractionObj: ExtractionObj = ExtractionDetailMap.get(extractionType);
    if (!!extractionObj) {
      this.extractionLabel = type;
      this.extractionType = extractionType;
      extractionData.forEach((extraction, index) => {
        index != 0 && this.rows.push(new ExtractionRow(extractionObj.extractionColumns, extraction));
      });
      let colField: string = this.rows[this.rows.length - 1].columns[0].colField;
      if (
        !!colField
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
  constructor(columns: ExtractionColumn[], extraction: ExtractionColumn) {
    columns.forEach((col, index) => {
      this.columns.push(
        new ExtractionColumn(
          col.colName,
          extraction[Object.keys(extraction)[index]],
          col.colWidth,
          col.headerTooltip,
          col.isCurrency,
          col.inRowExpander
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
  constructor(
    colName: string,
    colField: string,
    colWidth?: string,
    headerTooltip?: string,
    isCurrency?: boolean,
    inRowExpander?: boolean
  ) {
    this.colName = colName;
    this.colField = colField;
    this.colWidth = colWidth;
    this.headerTooltip = headerTooltip;
    this.isCurrency = !!isCurrency;
    this.inRowExpander = !!inRowExpander;
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

export function getExtractionType(key): string {
  switch (key) {
    case "Azioni":
    case "Obbligazioni":
    case "Titoli Di Stato":
    case "ETF":
    case "ETC":
    case "Certificates":
      return ExtractionTypes._financialInvestments;
    case "Polizze":
      return ExtractionTypes._insurances;
    case "Fondi comuni":
      return ExtractionTypes._founds;
    default:
      return "not found";
  }
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
      extractionLabel: "Investimenti finanziari",
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
        }
      ]
    }
  ]
])