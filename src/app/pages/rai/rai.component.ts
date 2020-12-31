import { Component, Injector, VERSION } from "@angular/core";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { HttpVerbs } from "../../service/communicationManager.service";
import * as XLSX from "xlsx";

export class MapObj {
  yearKey: string;
  yearPages: string[];
  yearList: {
    Titolo: string,
    Data: string,
    Descrizione: string,
    Link: string
  }[];
}

@Component({
  selector: "rai",
  templateUrl: "./rai.component.html",
  styleUrls: ["./rai.component.scss"]
})
export class RaiComponent extends BasePageComponent {
  name = "Angular " + VERSION.major;

  map: Map<string, MapObj> = new Map();

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  onInit() {
  }

  getYears() {
    this.communicationManagerService.callMockService<string>({
      apiEndpoint: "rai-api/getYears",
      apiMethod: HttpVerbs.get,
      httpOptions: {
        headers: {
          Accept: "*/*"
        },
        responseType: 'text'
      }
    }).subscribe(
      response => {
        this.map = this.parseYears(response);
        this.map.forEach((value, key) => this.getYearPages(key, value.yearKey))
      }
    )
  }

  parseYears(docStr: string): Map<string, MapObj> {
    let map: Map<string, MapObj> = new Map();
    let doc = new DOMParser().parseFromString(docStr, 'text/html');
    let liList: HTMLCollectionOf<Element> = doc.getElementsByClassName("listaStagioniPuntate")[0].children;
    if (!!liList && liList.length > 0) {
      for (let index = 1; index < liList.length; index++) {
        const li = <HTMLLIElement>liList[index];
        let a = <HTMLAreaElement>li.children[0];
        let yearKey: string = a.href.split("/")[a.href.split("/").length - 1];
        if (map.has(li.innerText)) {

        } else {
          map.set(li.innerText, {
            yearKey: yearKey,
            yearPages: [],
            yearList: []
          })
        }
      };
    }
    return map;
  }

  getYearPages(year: string, yearKey: string) {
    this.communicationManagerService.callMockService<string>({
      apiEndpoint: "rai-api/getYearPages",
      apiMethod: HttpVerbs.get,
      pathParams: { year: yearKey },
      httpOptions: {
        headers: {
          Accept: "*/*"
        },
        responseType: 'text'
      }
    }).subscribe(
      response => {
        this.parsePages(response, year);
      }
    )
  }

  parsePages(docStr: string, year: string) {
    let doc = new DOMParser().parseFromString(docStr, 'text/html');
    let liList: HTMLCollectionOf<Element> = doc.getElementsByClassName("pagination")[0].children;
    if (this.map.has(year)) {
      if (!!liList && liList.length > 0) {
        for (let index = 0; index < liList.length; index++) {
          const li = <HTMLLIElement>liList[index];
          let a = <HTMLAreaElement>li.children[0];
          if (!isNaN(parseInt(li.innerText))) {
            this.map.get(year).yearPages.push(li.innerText)
          }
        };
      }
    } else {
      throw new Error("Anno non trovato")
    }
    console.log("Finito parsePages");
  }

  recuperaLista() {
    this.map.forEach((value, key) => this.getDocuments(key, value));
  }

  getDocuments(key: string, value: MapObj) {
    value.yearPages.forEach(pag => {
      this.communicationManagerService.callMockService<string>({
        apiEndpoint: "rai-api/getPage",
        apiMethod: HttpVerbs.get,
        pathParams: {
          year: value.yearKey,
          pag
        },
        httpOptions: {
          headers: {
            Accept: "*/*"
          },
          responseType: 'text'
        }
      }).subscribe(
        response => this.addPage(response, key)
      )
    })
  }

  addPage(docStr: string, mapKey: string) {
    let doc = new DOMParser().parseFromString(docStr, 'text/html');
    let coll: HTMLCollectionOf<Element> = doc.getElementsByClassName("listaAudio");
    if (!!coll && coll.length > 0) {
      for (let index = 0; index < coll.length; index++) {
        const el = coll[index];
        this.map.get(mapKey).yearList.push({
          Titolo: (<HTMLSpanElement>el.children[1].children[0]).innerText,
          Data: (<HTMLSpanElement>el.children[1].children[1]).innerText,
          Descrizione: (<HTMLSpanElement>el.children[1].children[2]).innerText,
          Link: (<HTMLAreaElement>el.children[1].children[0].children[0]).href.replace("http://localhost:4200", "https://www.raiplayradio.it")
        });
      };
    }
    console.log("Finito addPage")
  }

  exportAsExcel() {
    let headers = ["Titolo", "Data", "Descrizione", "Link"];
    let wb = XLSX.utils.book_new()
    this.map.forEach((value, key) => {
      let ws = XLSX.utils.json_to_sheet(value.yearList, { header: headers });
      // ws["!cols"].forEach(col => col.wch = 20);
      XLSX.utils.book_append_sheet(wb, ws, `${key}`)
    });
    let exportFileName = `wikiradio.xls`;
    XLSX.writeFile(wb, exportFileName)
  }

}