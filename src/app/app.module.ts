import { APP_INITIALIZER, ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";
import { APP_BASE_HREF } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
// import * as unirest from "unirest";

import { AppComponent } from "./app.component";
export { AppComponent } from "./app.component";

// ---------- PAGES ---------- //
import { HomeComponent } from "./pages/home/home.component";
export { HomeComponent } from "./pages/home/home.component";

import { ExtractionComponent } from "./pages/extraction/extraction.component";
export { ExtractionComponent } from "./pages/extraction/extraction.component";

// ---------- COMPONENTS ---------- //
import { HeaderComponent } from "./component/header/header.component";
export { HeaderComponent } from "./component/header/header.component";

// import { DatepickerDropdownComponent } from "./component/datepicker/datepicker.component";
// export { DatepickerDropdownComponent } from "./component/datepicker/datepicker.component";

// ---------- SERVICE ---------- //
import { ExtractionService } from "./service/extraction.service";
export { ExtractionService } from "./service/extraction.service";


export function initExtService(extractionService: ExtractionService): Function {
  return function () {
    return extractionService.init();
  };
}

export const routerModuleForChild = RouterModule.forRoot([
  { path: 'home', component: HomeComponent },
  { path: 'extraction', component: ExtractionComponent },
  { path: '**', component: HomeComponent }
]);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routerModuleForChild,
    NgbModule.forRoot()
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ExtractionComponent,
    HeaderComponent,
    // DatepickerDropdownComponent
  ],
  entryComponents: [
  ],
  exports: [

  ],
  bootstrap: [
    AppComponent
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    ExtractionService,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initExtService,
      'deps': [ExtractionService],
      'multi': true
    }
  ]
})
export class AppModule {
}