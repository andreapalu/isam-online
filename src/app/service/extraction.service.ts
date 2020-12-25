import { Injectable } from "@angular/core";
import { Exctraction } from "../om/extraction-model/Extraction";
import * as XLSX from "xlsx";
import { stringsNotNull } from "../util/stringsNotNull";

@Injectable({
    providedIn: "root"
})
export class ExtractionService {

    extractionList: Exctraction[] = [];

    private exceltoJson = {};

    constructor() { }

    init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.extractionList = [];
            let serviceData: Exctraction[] = JSON.parse(sessionStorage.getItem('serviceData'));
            if (!!serviceData) {
                serviceData.forEach(servExt => {
                    let ext: Exctraction = {
                        date: new Date(servExt.date),
                        data: servExt.data,
                        rawMap: new Map(),
                        refineMap: new Map()
                    };
                    let mapindex: number = -1;
                    servExt.data.forEach((row, ri) => {
                        let out = this.populateMap(row, ext, mapindex);
                        ext = out.ext;
                        mapindex = out.mapindex;
                    });
                    this.extractionList.push(ext);
                });
            }
            resolve();
        });
    }

    saveUploaded(fileDate: string) {
        !!this.exceltoJson && Object.keys(this.exceltoJson).forEach(key => {
            if (key.startsWith("sheet")) {
                let ext: Exctraction = {
                    date: new Date(fileDate),
                    data: [],
                    rawMap: new Map(),
                    refineMap: new Map()
                };
                let mapindex: number = -1;
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
                        ext.data.push(newRow);
                        let out = this.populateMap(newRow, ext, mapindex);
                        ext = out.ext;
                        mapindex = out.mapindex;
                    }
                });
                ext.data.length > 0 && this.extractionList.push(ext);
            }
        });
        sessionStorage.setItem('serviceData', JSON.stringify(this.extractionList));
    }

    populateMap(row: any, ext: Exctraction, mapindex: number): { ext: Exctraction, mapindex: number } {
        let firstKey: string = row[Object.keys(row)[0]];
        if (firstKey == 'Descrizione') {
            mapindex++;
            ext.rawMap.set(mapindex, [row]);
        } else if (ext.rawMap.has(mapindex)) {
            ext.rawMap.get(mapindex).push(row);
        }
        if (firstKey.startsWith("TOT")) {
            let arr = firstKey.split(" ");
            arr.splice(0,1);
            ext.refineMap.set(
                arr.join(" "),
                ext.rawMap.get(mapindex)
            );
            mapindex++;
        }
        return { ext: ext, mapindex: mapindex };
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
                const data: { "": number | string }[] = XLSX.utils.sheet_to_json(ws, { blankrows: false }); // to get 2d array pass 2nd parameter as object {header: 1}
                this.exceltoJson[`sheet${i + 1}`] = data;
                const headers: string[] = this.getHeaderRow(ws);
                headerJson[`header${i + 1}`] = headers;
                //  console.log("json",headers)
            }
            this.exceltoJson['headers'] = headerJson;
            // console.log(this.exceltoJson);
        };
    }

    getHeaderRow(sheet): string[] {
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