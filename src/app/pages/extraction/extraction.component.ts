import { Component, ElementRef, Renderer2, ViewChild } from "@angular/core";
import { Exctraction } from "../../om/extraction-model/Extraction";
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
    this.selectedExtraction.refineMap.forEach((value, key) => { this.extractionTypeList.push(key) });
  }

  showSingleExtraction(extKey: string) {
    if (this.selectedExtraction.refineMap.has(extKey)) {
      this.selectedExtractionDeatil = extKey;
      this.showExtraction(this.selectedExtraction.refineMap.get(extKey))
    } else {
      this.selectedExtractionDeatil = undefined;
      window.alert("Estrazione not found!");
    }
  }

  showExtraction(extKey?: any[]) {
    let selectedExtraction: Exctraction;
    let detail: boolean = false;
    if (!!extKey) {
      detail = true;
      selectedExtraction = { data: extKey, date: this.selectedDate };
    } else {
      this.selectedExtractionDeatil = "Tutte";
      selectedExtraction = this.selectedExtraction;
    }
    if (!!selectedExtraction.data && selectedExtraction.data.length > 0) {
      let filename: string = 'Estrazione '.concat((typeof selectedExtraction.date == "string" ? new Date(selectedExtraction.date) : selectedExtraction.date).toLocaleTimeString());

      let oldTable = document.getElementById("generatedExtractionTable");
      !!oldTable && document.getElementById("generatedExtractionTable").parentNode.removeChild(oldTable);
      // !!oldTable && document.body.removeChild(oldTable);
      let table = document.createElement("table");
      table.id = "generatedExtractionTable";
      table.style.border = "1px solid black";
      let rowMaster = document.createElement("tr");
      rowMaster.style.fontWeight = "bold";
      rowMaster.style.background = "#CCCCCC";
      rowMaster.style.border = "1px solid black";

      selectedExtraction.data.forEach((row, index) => {
        let tr = document.createElement("tr");
        tr.style.border = "1px solid black";
        Object.keys(row).forEach(colKey => {
          let col = row[colKey];
          if (index == 0) {
            let th = document.createElement("th");
            th.style.fontWeight = "bold";
            th.style.color = "#1775BE";
            th.style.border = "1px solid black";
            th.innerHTML = col;
            rowMaster.appendChild(th);
          } else {
            let td = document.createElement("td");
            td.style.fontWeight = "bold";
            td.style.border = "1px solid black";
            td.innerHTML = col;
            tr.appendChild(td);
          }
        });
        if (index == 0) {
          table.appendChild(rowMaster);
        }
        table.appendChild(tr);
      });
      // document.body.appendChild(table);
      this.renderer.appendChild(this.tableContainer.nativeElement, table)
    } else {
      window.alert("Estrazione vuota!");
    }
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

}