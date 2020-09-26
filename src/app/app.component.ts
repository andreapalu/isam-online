import { Component, VERSION } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  name = "Angular " + VERSION.major;

  public out: string;
  public users: ResponseModel[];
  public outPresent: boolean = false;
  private url =
    "http://query.yahooapis.com/v1/public/yql?format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=&q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol=%22goog%22";
  private headers = new Headers({ "Content-Type": "application/json" });

  testCommit;

  constructor(private httpClient: HttpClient) {}

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
    this.httpClient
      .get(this.url)
      .subscribe(response => {
        console.log("Yahoo dice: "+JSON.stringify(response));
      });
  }
}

export class ResponseModel {
  userId: number;
  id: number;
  title: string;
  body: string;
}
