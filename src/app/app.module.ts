import { APP_INITIALIZER, InjectionToken, ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";
import { APP_BASE_HREF } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import * as unirest from "unirest";


// ---------- INJECTION TOKEN ---------- //
// export const APPLICATION_STATUS = new InjectionToken<ApplicationStatusInterface>('application status');
// export const APPLICATION_CONTEXT_MANAGER = new InjectionToken<ApplicationContextManagerInterface>('application context manager');
// export const COMMUNICATION_MANAGER = new InjectionToken<CommunicationManagerInterface>('communication manager'); 
// export const SESSION_MANAGER = new InjectionToken<SessionManagerInterface>('session manager');
// export const APPLICATION_BASE_URL = new InjectionToken<string>('application base url');
export const NAVIGATION_MANAGER = new InjectionToken<NavigationManagerService>('navigation manager');
// export const WIDGET_MODE_SERVICE = new InjectionToken<WidgetModeServiceInterface>('widget mode service');
// export const REGISTER_FORM_SERVICE = new InjectionToken<RegisterFormServiceInterface>('RegisterFormService');

import { AppComponent } from "./app.component";
export { AppComponent } from "./app.component";

// ---------- PAGES ---------- //
import { HomeComponent } from "./pages/home/home.component";
export { HomeComponent } from "./pages/home/home.component";

import { TestServiceComponent } from "./pages/test-service/test-service.component";
export { TestServiceComponent } from "./pages/test-service/test-service.component";

import { ExtractionComponent } from "./pages/extraction/extraction.component";
export { ExtractionComponent } from "./pages/extraction/extraction.component";

import { InfograficaComponent } from "./pages/infografica/infografica.component";
export { InfograficaComponent } from "./pages/infografica/infografica.component";

import { AuthorComponent } from "./pages/author/author.component";
export { AuthorComponent } from "./pages/author/author.component";

import { RaiComponent } from "./pages/rai/rai.component";
export { RaiComponent } from "./pages/rai/rai.component";

import { CryptoComponent } from "./pages/crypto/crypto.component";
export { CryptoComponent } from "./pages/crypto/crypto.component";

// ---------- COMPONENTS ---------- //
import { HeaderComponent } from "./component/header/header.component";
export { HeaderComponent } from "./component/header/header.component";

import { CircleSeriesComponent } from "./component/line-chart/circle-series";
import { AreaComponent } from "./component/line-chart/line-area";
import { LineChartComponent } from "./component/line-chart/line-chart.component";
import { LineSerieComponent } from "./component/line-chart/line-serie";
export { CircleSeriesComponent } from "./component/line-chart/circle-series";
export { AreaComponent } from "./component/line-chart/line-area";
export { LineChartComponent } from "./component/line-chart/line-chart.component";
export { LineSerieComponent } from "./component/line-chart/line-serie";

import { SpinnerComponent } from "./component/spinner/spinner.component";
export { SpinnerComponent } from "./component/spinner/spinner.component";

import { NotificationComponent } from "./component/notification/notification.component";
export { NotificationComponent } from "./component/notification/notification.component";

// import { DatepickerDropdownComponent } from "./component/datepicker/datepicker.component";
// export { DatepickerDropdownComponent } from "./component/datepicker/datepicker.component";

// ---------- SERVICE ---------- //
import { ExtractionService } from "./service/extraction.service";
export { ExtractionService } from "./service/extraction.service";

import { NavigationManagerService } from "./service/navigationManager.service";
export { NavigationManagerService } from "./service/navigationManager.service";

import { CommunicationManagerService } from "./service/communicationManager.service";
export { CommunicationManagerService } from "./service/communicationManager.service";

import { AuthorService } from "./service/author/author.service";
export { AuthorService } from "./service/author/author.service";

import { StockService } from "./service/stock.service";
export { StockService } from "./service/stock.service";

import { SpinnerService } from "./service/spinner.service";
export { SpinnerService } from "./service/spinner.service";

import { NotificationService } from "./service/notification.service";
export { NotificationService } from "./service/notification.service";

// ---------- INTERCEPTOR ---------- //
import { httpInterceptorProviders } from "./interceptor/interceptors.list";
export { httpInterceptorProviders } from "./interceptor/interceptors.list";

export function initExtService(extractionService: ExtractionService): Function {
  return function () {
    return extractionService.init();
  };
}
export function initNavService(nav: NavigationManagerService): Function {
  return function () {
    return nav.init();
  };
}
export function initCommMan(commMan: CommunicationManagerService): Function {
  return function () {
    return commMan.init();
  };
}

export const routerModuleForChild = RouterModule.forRoot([
  { path: 'home', component: HomeComponent },
  { path: 'test-service', component: TestServiceComponent },
  { path: 'extraction', component: ExtractionComponent },
  { path: 'infografica', component: InfograficaComponent },
  { path: 'author', component: AuthorComponent },
  { path: 'rai', component: RaiComponent },
  { path: 'crypto', component: CryptoComponent },
  { path: '**', component: HomeComponent }
]);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    routerModuleForChild,
    NgbModule.forRoot(),
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ExtractionComponent,
    HeaderComponent,
    TestServiceComponent,
    InfograficaComponent,
    LineChartComponent,
    LineSerieComponent,
    AreaComponent,
    CircleSeriesComponent,
    AuthorComponent,
    RaiComponent,
    SpinnerComponent,
    NotificationComponent,
    CryptoComponent
  ],
  entryComponents: [
    SpinnerComponent,
    NotificationComponent
  ],
  exports: [

  ],
  bootstrap: [
    AppComponent
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    NavigationManagerService,
    CommunicationManagerService,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initCommMan,
      'deps': [CommunicationManagerService],
      'multi': true
    },
    ExtractionService,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initExtService,
      'deps': [ExtractionService],
      'multi': true
    },
    AuthorService,
    StockService,
    SpinnerService,
    httpInterceptorProviders,
    NotificationService
    // { provide: APPLICATION_BASE_URL, useValue: 'Hello world' }
  ]
})
export class AppModule {
}