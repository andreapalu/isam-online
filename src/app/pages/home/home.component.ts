import { Component, VERSION } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { StockService } from "../../service/stock.service";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent {
  name = "Angular " + VERSION.major;

  public out: string;
  public users: ResponseModel[];
  public outPresent: boolean = false;
  private url =
    "https://query1.finance.yahoo.com/v8/finance/chart/TSLA";
  private headers = new Headers({ "Content-Type": "application/json" });

  stocks = [
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "SPCE", name: "Virgin Galactic" },
    { symbol: "CVS", name: "CVS Pharmacy" }
  ];

  constructor(
    private httpClient: HttpClient,
    private stockService: StockService
  ) {}

  fetchData() {
    let res: ResponseModel[];
    this.httpClient
      .get("https://jsonplaceholder.typicode.com/posts")
      .subscribe((response: ResponseModel[]) => {
        this.users = res = response;
        if (!!response && response.find(x => x.id == 1)) {
          console.log("Trovast");
        }
        if (!!res) {
          this.outPresent = true;
        } else {
          this.outPresent = false;
        }
        this.out = JSON.stringify(res);
      });
  }

  fetchStock() {
    this.httpClient.get(this.url).subscribe(response => {
      console.log("Yahoo dice: " + JSON.stringify(response));
    });
  }

  public tryService() {
    this.stockService
      .getStockWfetch(this.stocks[0].symbol)
      .subscribe(response => {
        debugger;
        console.log("questo: " + JSON.stringify(response));
      });
  }

  // FETCH COURSE -- FUNZIA
  searchString: String = "";
  imageSearch = [];
  searchImages() {
    const urlofApi =
      "https://api.github.com/search/repositories?q=" + this.searchString;
    this.httpClient.get(urlofApi).subscribe((res) => {
      const searchResult: any = res;
      console.log(searchResult);
      this.imageSearch = searchResult.items;
      //console.log(this.imageSearch.owner.avatar_url);
    });
  }
  /*
  */
  fetchImages() {
    const urlofApi =
      "https://api.github.com/search/repositories?q=" + this.searchString;
    this.stockService.fetch(urlofApi).subscribe((res) => {
      const searchResult: any = res;
      console.log(searchResult);
      this.imageSearch = searchResult.items;
      //console.log(this.imageSearch.owner.avatar_url);
    });
  }

}

export class ResponseModel {
  userId: number;
  id: number;
  title: string;
  body: string;
}
