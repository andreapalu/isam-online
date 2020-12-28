import { Injectable } from "@angular/core";
import { Exctraction } from "../om/extraction-model/Extraction";
import * as XLSX from "xlsx";
import { stringsNotNull } from "../util/stringsNotNull";
import { CommunicationManagerService } from "./communicationManager.service";

declare class AuthorResource {
    id: number;
    age: number;
    name: string;
}

@Injectable({
    providedIn: "root"
})
export class ExtractionService {

    extractionList: Exctraction[] = [];

    private exceltoJson = {};

    constructor(
        private communicationManagerService: CommunicationManagerService
    ) { }

    init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.extractionList = [];
            // sessionStorage.removeItem('serviceData');
            let parsed;
            try {
                parsed = JSON.parse(sessionStorage.getItem('serviceData'));
                if (!parsed) {
                    throw new Error("JSON.parse ERROR at className: " + ExtractionService.name);
                }
                this.communicationManagerService.callMockService<AuthorResource[]>({ url: "author" }).subscribe(
                    (response) => {
                        !!response && response.forEach(auth => {
                            console.warn("Author: " + auth.name);
                        });
                    }
                );
            } catch (error) {
                console.warn(error);
            }
            let serviceData: Exctraction[] = parsed;
            if (!!serviceData) {
                serviceData.forEach(servExt => {
                    this.extractionList.push(
                        new Exctraction(
                            new Date(servExt.date),
                            servExt.rawData
                        )
                    );
                });
            }
            resolve();
        });
    }

    saveUploaded(fileDate: string) {
        !!this.exceltoJson && Object.keys(this.exceltoJson).forEach(key => {
            if (key.startsWith("sheet")) {
                let date = new Date(fileDate);
                let wsname = key.split("_");
                if (
                    wsname.length > 1
                    && typeof wsname[1] == "string"
                    // && !isNaN(Date.parse(wsname[1]))
                ) {
                    date = this.getDateFromSheet(wsname[1]);
                }
                let data: any[] = [];
                !!this.exceltoJson[key] && this.exceltoJson[key].forEach((row, ri) => {
                    let newRow = {};
                    Object.keys(row).forEach((rowkey, i) => {
                        if (!stringsNotNull(rowkey)) {
                            Object.defineProperty(newRow, `row${ri}_col${i}`,
                                Object.getOwnPropertyDescriptor(row, rowkey));
                        } else {
                            Object.defineProperty(newRow, rowkey,
                                Object.getOwnPropertyDescriptor(row, rowkey));
                        }
                        // delete row[rowkey];
                    })
                    if (Object.keys(newRow).find(rowkey => stringsNotNull(newRow[rowkey]))) {
                        data.push(newRow);
                    }
                });
                data.length > 0 && this.extractionList.push(new Exctraction(date, data));
            }
        });
        sessionStorage.setItem('serviceData', JSON.stringify(this.extractionList));
    }

    getDateFromSheet(wsname: any): Date {
        if (typeof wsname == "string") {
            if (wsname.length == 7) {
                let day = parseInt(wsname.substr(0, 2));
                let month = this.getMonth(wsname.substr(2, 3));
                let year = parseInt("20" + wsname.substr(5, 2));
                return new Date(year, month, day);
            } else {
                window.alert("Data di tipo stringa ma dimensione != 7: " + wsname);
                return null;
            }
        } else if (wsname instanceof Number) {
            window.alert("Data di tipo number: " + wsname);
            return null;
        }
        return null;
    }

    getMonth(month: string): number {
        switch (month.toLowerCase()) {
            case "gen":
                return 0;
            case "feb":
                return 1;
            case "mar":
                return 2;
            case "apr":
                return 3;
            case "mag":
            case "may":
                return 4;
            case "giu":
            case "jun":
                return 5;
            case "lug":
            case "jul":
                return 6;
            case "ago":
            case "aug":
                return 7;
            case "set":
            case "sep":
                return 8;
            case "ott":
            case "oct":
                return 9;
            case "nov":
                return 10;
            case "dic":
            case "dec":
                return 11;
            default:
                return null;
        }
    }

    uploadExcel(event: any) {
        this.exceltoJson = {};
        let headerJson = {};
        /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) {
            throw new Error('Cannot use multiple files');
        }
        const reader: FileReader = new FileReader();
        reader.readAsBinaryString(target.files[0]);
        // console.log("filename", target.files[0].name);
        this.exceltoJson['filename'] = target.files[0].name;
        reader.onload = (e: any) => {
            /* create workbook */
            const binarystr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
            for (var i = 0; i < wb.SheetNames.length; ++i) {
                const wsname: string = wb.SheetNames[i];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];
                const data: { "": number | string }[] = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
                this.exceltoJson[`sheet${i + 1}_${wsname}`] = data;
                const headers: string[] = this.getHeaderRow(ws);
                headerJson[`header${i + 1}`] = headers;
                //  console.log("json",headers)
            }
            this.exceltoJson['headers'] = headerJson;
            // console.log(this.exceltoJson);
        };
    }

    getHeaderRow(sheet: XLSX.WorkSheet): string[] {
        let headers: string[] = [];
        let range: XLSX.Range = XLSX.utils.decode_range(sheet['!ref']);
        let columnNumber: number = range.s.c;
        let rowNumber: number = range.s.r; /* start in the first row */
        /* walk every column in the range */
        for (columnNumber; columnNumber <= range.e.c; ++columnNumber) {
            let cell = sheet[XLSX.utils.encode_cell({ c: columnNumber, r: rowNumber })] /* find the cell in the first row */
            // console.log("cell",cell)
            var hdr = "UNKNOWN " + columnNumber; // <-- replace with your desired default 
            if (cell && cell.t) {
                hdr = XLSX.utils.format_cell(cell);
                headers.push(hdr);
            }
        }
        return headers;
    }

}