import { Component } from "@angular/core";
import { ExtractionService } from "../../service/extraction.service";

@Component({
  selector: "isam-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent {

  extractionNotLoaded: boolean = true;
  dateNotSet: boolean = true;
  resetExcelInput: boolean = true;
  excelDate: string;

  constructor(
    private extractionService: ExtractionService
  ) {
  }

  uploadExtraction() { }

  isExcelUploaderDisabled(): boolean {
    return this.extractionNotLoaded || !this.excelDate;
  }

  setDate(event) {
    this.dateNotSet = false;
  }

  onFileChange(event: any) {
    this.extractionService.uploadExcel(event);
    this.extractionNotLoaded = false;
  }

  saveUploaded() {
    this.extractionNotLoaded = true;
    this.dateNotSet = true;
    this.resetExcelInput = false;
    setTimeout(() => {
      this.resetExcelInput = true;
    }, 10);
    this.extractionService.saveUploaded(this.excelDate);
    document.getElementById('dismissButton').click();
  }

}