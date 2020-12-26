import { Component, ElementRef, Renderer2, ViewChild } from "@angular/core";
import { Exctraction, ExtractionDetail } from "../../om/extraction-model/Extraction";
import { ExtractionService } from "../../service/extraction.service";

@Component({
  selector: "extraction",
  templateUrl: "./extraction.component.html",
  styleUrls: ["./extraction.component.scss"]
})
export class ExtractionComponent {

  /** Data selezionata */
  selectedDate: Date;
  selectedExtractionDeatil: string;
  selectedExtraction: Exctraction;

  extractionList: Exctraction[] = [];
  extractionTypeList: string[] = [];

  @ViewChild('tableContainer') tableContainer: ElementRef;

  constructor(
    private extractionService: ExtractionService,
    private renderer: Renderer2
  ) { }

  selectDate(ext: Exctraction) {
    this.selectedDate = ext.date;
    this.selectedExtraction = ext;
    this.extractionTypeList = [];
    this.selectedExtraction.parsedData.forEach((value) => { this.extractionTypeList.push(value.extractionLabel) });
    this.showExtraction();
  }

  showSingleExtraction(extKey: string) {
    if (this.selectedExtraction.parsedData.find(el => el.extractionLabel == extKey)) {
      this.selectedExtractionDeatil = extKey;
      this.showExtraction(this.selectedExtraction.parsedData.find(el => el.extractionLabel == extKey))
    } else {
      this.selectedExtractionDeatil = undefined;
      window.alert("Estrazione not found!");
    }
  }

  showExtraction(extractionDetail?: ExtractionDetail) {
    let selectedExtractions: ExtractionDetail[];
    if (!!extractionDetail) {
      selectedExtractions = [extractionDetail];
    } else {
      this.selectedExtractionDeatil = "Tutte";
      selectedExtractions = this.selectedExtraction.parsedData;
    }

    let oldTables = document.getElementsByClassName("generatedExtractionTable");
    let length = oldTables.length;
    for (var i = 0; i < length; ++i) {
      oldTables[oldTables.length - 1].parentNode.removeChild(oldTables[oldTables.length - 1]);
    }

    (selectedExtractions || []).forEach(selectedExtraction => {
      if (
        !!selectedExtraction
        && !!selectedExtraction.rows
        && selectedExtraction.rows.length > 0
      ) {
        let filename: string = 'Estrazione '.concat((typeof this.selectedDate == "string" ? new Date(this.selectedDate) : this.selectedDate).toLocaleTimeString());

        let table = document.createElement("table");
        table.id = "generatedExtractionTable";
        table.className = "generatedExtractionTable";
        table.style.border = "1px solid black";
        let rowMaster = document.createElement("tr");
        rowMaster.style.fontWeight = "bold";
        rowMaster.style.background = "#CCCCCC";
        rowMaster.style.border = "1px solid black";

        selectedExtraction.rows.forEach((row, index) => {
          let tr = document.createElement("tr");
          tr.style.border = "1px solid black";
          row.columns.forEach(col => {
            if (index == 0) {
              let th = document.createElement("th");
              th.style.fontWeight = "bold";
              th.style.color = "#1775BE";
              th.style.border = "1px solid black";
              th.innerHTML = col.colName;
              rowMaster.appendChild(th);
            } else {
              let td = document.createElement("td");
              td.style.border = "1px solid black";
              td.innerHTML = !!col.colField ? col.isCurrency ? this.formatMoney(col.colField) : col.colField : "-";
              tr.appendChild(td);
            }
          });
          if (index == 0) {
            table.appendChild(rowMaster);
          }
          table.appendChild(tr);
        });
        this.renderer.appendChild(this.tableContainer.nativeElement, table)
      } else {
        window.alert("Estrazione vuota!");
      }
    });

  }

  exportAsExcel() {
    let uri = 'data:application/vnd.ms-excel;base64,';
    let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    let base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) };
    let format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
    let table = document.getElementById("generatedExtractionTable");
    let filename: string = "exportEstrazione";

    let blobData = { worksheet: filename || 'Worksheet', table: table.innerHTML };
    if (navigator.msSaveBlob) {
      let blob = new Blob([format(template, blobData)], {
        type: "application/vnd.ms-excel"
      });
      navigator.msSaveBlob(blob, filename + ".xls");
    } else {
      let link = document.createElement("a");
      document.body.appendChild(link);
      link.href = uri + base64(format(template, blobData));
      link.download = filename + ".xls";
      link.click();
    }
  }

  /**
   * Formatta gli importi
   * @param amount 
   */
  formatMoney(amount: string, currency?: string): string {
    if (!!amount && !isNaN(parseFloat(amount))) {
      let formatted: string = (new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: currency || 'EUR',
      }).format(parseFloat(amount)));
      return currency ? formatted : formatted.substr(0, formatted.length - 2);
    } else {
      return amount;
    }
  }

}