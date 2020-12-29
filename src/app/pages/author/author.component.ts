import { Component, Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StockService } from "../../service/stock.service";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { HttpVerbs } from "../../service/communicationManager.service";
import { AuthorResource } from "../../om/json-server.model/Author";
import { Observable } from "rxjs";
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from "@angular/forms";
import { AuthorService } from "../../service/author/author.service";

@Component({
  selector: "author",
  templateUrl: "./author.component.html",
  styleUrls: ["./author.component.scss"]
})
export class AuthorComponent extends BasePageComponent {

  showInsertForm: boolean = false;

  insertAuthorForm: FormGroup;
  isAuthorUpdate: boolean = false;

  authors: AuthorResource[] = [];
  authors$: Observable<AuthorResource[]> = this.communicationManagerService.callMockService<AuthorResource[]>(
    {
      apiEndpoint: "author-api/getAuthors",
      apiMethod: HttpVerbs.get
    }
  );

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private stockService: StockService,
    private authorService: AuthorService
  ) {
    super(injector);
  }

  onInit() {
    this.getAuthors();
  }

  createForm(authorToUpdate?: AuthorResource) {
    if (!!authorToUpdate) {
      this.insertAuthorForm = this.fb.group({
        id: ['', [Validators.required]],
        name: ['', [Validators.required, this.stringWoSpaces, Validators.minLength(3)]],
        age: ['', Validators.required]
      });
      this.isAuthorUpdate = true;
      this.insertAuthorForm.patchValue({ 'id': authorToUpdate.id });
      this.insertAuthorForm.patchValue({ 'name': authorToUpdate.name });
      this.insertAuthorForm.patchValue({ 'age': authorToUpdate.age });
    } else {
      this.insertAuthorForm = this.fb.group({
        id: ['', [Validators.required, this.notValidId]],
        name: ['', [Validators.required, this.stringWoSpaces, Validators.minLength(3)]],
        age: ['', Validators.required]
      });
      this.isAuthorUpdate = false;
    }
  }

  showForm(form?: NgForm, authorToUpdate?: AuthorResource) {
    !!form && form.reset();
    this.showInsertForm = !this.showInsertForm;
    if (this.showInsertForm) {
      this.createForm(authorToUpdate);
    }
  }

  onSubmit(form: NgForm) {
    try {
      let aut: AuthorResource = form.value;
      let oldAut = this.authors.find(author => author.id == aut.id);
      if (!!oldAut) {
        aut.insertDate = new Date(oldAut.insertDate);
        aut.lastUpdate = new Date();
        aut.lastUpdateUser = "FE_CLIENT";
        this.updateAuthor(aut);
      } else {
        aut.insertDate = new Date();
        aut.lastUpdate = new Date();
        aut.lastUpdateUser = "FE_CLIENT";
        this.postAuthor(aut);
      }
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
            for (let i = 0; i < (row.cells as HTMLCollection).length; i++) {
              let cell = row.cells[i];
              if ((cell.innerHTML as string).toLowerCase() == 'id') {
                idIndex = i;
              }
            }
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

  getAuthors() {
    this.authorService.getAuthors().subscribe(response => {
      this.authors = response.sort((a, b) => a.id - b.id);
    })
  }

  deleteAuthor(author: AuthorResource) {
    this.authorService.deleteAuthor(author).subscribe(
      (response) => {
        this.getAuthors();
      }
    );
  }

  postAuthor(author: AuthorResource) {
    this.authorService.postAuthor(author).subscribe(
      (response) => {
        this.getAuthors();
      }
    );
  }

  updateAuthor(author: AuthorResource) {
    this.authorService.updateAuthor(author).subscribe(
      (response) => {
        this.getAuthors();
      }
    );
  }

}