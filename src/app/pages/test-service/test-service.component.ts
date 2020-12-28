import { Component, ContentChildren, Injector, VERSION, QueryList } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { StockService } from "../../service/stock.service";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { HttpVerbs } from "../../service/communicationManager.service";
import { AuthorResource } from "../../om/json-server.model/Author";
import { Observable } from "rxjs";
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from "@angular/forms";

@Component({
  selector: "test-service",
  templateUrl: "./test-service.component.html",
  styleUrls: ["./test-service.component.scss"]
})
export class TestServiceComponent extends BasePageComponent {
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

  oldService: boolean = false;
  showInsertForm: boolean = false;

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private stockService: StockService
  ) {
    super(injector);
  }

  insertAuthorForm: FormGroup;
  createForm() {
    this.insertAuthorForm = this.fb.group({
      id: ['', [Validators.required, this.notValidId]],
      name: ['', [Validators.required, this.stringWoSpaces, Validators.minLength(3)]],
      age: ['', Validators.required]
    });
  }
  onInit() {
    this.getAuthors();
  }

  showForm(form?: NgForm) {
    !!form && form.reset();
    this.showInsertForm = !this.showInsertForm;
    this.createForm();
  }

  onSubmit(form: NgForm) {
    try {
      let aut: AuthorResource = form.value;
      aut.insertDate = new Date();
      aut.lastUpdate = new Date();
      aut.lastUpdateUser = "FE_CLIENT";
      this.postAuth(aut);
      this.showForm(form);
    } catch (error) {
      console.error(error);
    }
  }

  stringWoSpaces(control: AbstractControl): ValidationErrors | null {
    if (control.value && (control.value as string).indexOf(' ') >= 0) {
      return { shouldNotHaveSpaces: true };
    }
    return null;
  }

  notValidId(control: AbstractControl): ValidationErrors | null {
    let table = document.getElementById('autorTable');
    let authorsId: number[] = [];
    if (!!table && !!table.children && table.children.length > 0) {
      let idIndex: number;
      let tbody: any = table.children[0];
      if (!!tbody && !!tbody.rows && tbody.rows.length > 1) {
        for (let index = 0; index < tbody.rows.length; index++) {
          const row: any = tbody.rows[index];
          if (index == 0) {
            for (let i = 0; i < (row.cells as HTMLCollection).length; i++) { let cell = row.cells[i]; if ((cell.innerHTML as string).toLowerCase() == 'id') { idIndex = i; } });
          } else {
            authorsId.push(parseInt(row.cells[idIndex].innerHTML as string));
          }
        }
      }
      if (authorsId.find(el => el == (control.value as number))) {
        return { idAlreadyUsed: true };
      }
      if ((control.value as number) == 0) {
        return { invalidId: true };
      }
    }
    return null;
  }

  authors: AuthorResource[] = [];
  authors$: Observable<AuthorResource[]> = this.communicationManagerService.callMockService<AuthorResource[]>(
    {
      url: "author",
      apiMethod: HttpVerbs.get
    }
  );

  getAuthors() {
    this.communicationManagerService.callMockService<AuthorResource[]>(
      {
        url: "author",
        apiMethod: HttpVerbs.get
      }
    ).subscribe(response => {
      this.authors = response;
    })
  }

  deleteAuth(auth: AuthorResource) {
    this.communicationManagerService.callMockService<AuthorResource[]>({
      url: "author/:id",
      apiMethod: HttpVerbs.delete,
      pathParams: {
        id: auth.id.toString()
      }
    }).subscribe(
      (response) => {
        this.getAuthors();
      }
    );
  }

  postAuth(author: AuthorResource) {
    this.communicationManagerService.callMockService<AuthorResource[]>({
      url: "author",
      apiMethod: HttpVerbs.post,
      body: author
    }).subscribe(
      (response) => {
        this.getAuthors();
      }
    );
  }

  EXAMPLEdeleteAuth(auth: AuthorResource) {
    this.communicationManagerService.callMockService<AuthorResource[]>({
      url: "author/:id",
      apiMethod: HttpVerbs.delete,
      body: auth,
      httpOptions: {},
      queryStringParams: {
        id: auth.id.toString()
      },
      pathParams: {
        id: auth.id.toString()
      }
    }).subscribe(
      (response) => {
        this.authors = response || [];
      }
    );
  }

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
        return this.out = JSON.stringify(res);
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
