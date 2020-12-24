import { ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";
import {APP_BASE_HREF} from '@angular/common';
// import * as unirest from "unirest";

import { AppComponent } from "./app.component";
export { AppComponent } from "./app.component";

// ---------- PAGES ---------- //
import { HomeComponent } from "./pages/home/home.component";
export { HomeComponent } from "./pages/home/home.component";

import { SecondComponent } from "./pages/second/second.component";
export { SecondComponent } from "./pages/second/second.component";

// ---------- COMPONENTS ---------- //
import { HeaderComponent } from "./component/header/header.component";
export { HeaderComponent } from "./component/header/header.component";


export const routerModuleForChild = RouterModule.forRoot([
  { path: 'home', component: HomeComponent },
  { path: 'second', component: SecondComponent },
  { path: '**', component: HomeComponent }
]);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routerModuleForChild
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    SecondComponent,
    HeaderComponent
  ],
  entryComponents: [
  ],
  exports: [
  ],
  bootstrap: [
    AppComponent
  ],
  providers:[
    {provide: APP_BASE_HREF, useValue : '/' }
  ]
})
export class AppModule {
}