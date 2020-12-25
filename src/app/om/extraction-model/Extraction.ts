export class Exctraction {
  date: Date;
  data: any[];
  rawMap?: Map<number, any[]> = new Map();
  refineMap?: Map<string, any[]> = new Map();
}

// ---------- EXTRACTION CLASSES ----------

export class ExtractionDetail {
  extractionLabel: string;
  extractionType: string;
  rows: ExtractionRow[] = [];
  constructor(extractions: any[]) {
    let notificationType: string;
    let extractionObj: ExtractionObj = ExtractionDetailMap.get(notificationType);
    this.extractionLabel = extractionObj.extractionLabel;
    this.extractionType = notificationType;
    extractions.forEach(extraction => {
      this.rows.push(new ExtractionRow(extractionObj.extractionColumns, extraction));
    });
  }
}

export class ExtractionRow {
  columns: ExtractionColumn[] = [];
  constructor(columns: ExtractionColumn[], extraction: ExtractionColumn) {
    columns.forEach(col => {
      this.columns.push(
        new ExtractionColumn(
          col.colName,
          extraction[col.colField],
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

export const ExtractionTypes = {
  _financialInvestments: "Investimenti finanziari"
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
          colField: "_avarageChargePrice"
        },
        {
          colName: "Prezzo Mercato",
          colField: "_marketPrice"
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
          colField: "_incomeLossValue"
        },
        {
          colName: "Valore carico",
          colField: "_chargeValue"
        },
        {
          colName: "Controvalore",
          colField: "_counterValue"
        }
      ]
    }
  ]
])