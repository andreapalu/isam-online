import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component, DoCheck, Injector, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges
} from '@angular/core';
import { isNullOrUndefined } from 'util';
import { CommunicationManagerService } from '../../service/communicationManager.service';
import { NavigationManagerService } from '../../service/navigationManager.service';

@Component({
  template: '',
  styles: [],
})
export abstract class BasePageComponent implements
  OnChanges, OnInit, DoCheck,
  AfterContentInit, AfterContentChecked,
  AfterViewInit, AfterViewChecked,
  OnDestroy {

  protected navigationManagerService: NavigationManagerService;
  protected communicationManagerService: CommunicationManagerService;

  constructor(
    @Optional() protected injector?: Injector
  ) {
    if (!isNullOrUndefined(this.injector)) {
      this.navigationManagerService = this.injector.get(NavigationManagerService);
      this.communicationManagerService = this.injector.get(CommunicationManagerService);
    }
  }

  ngOnInit(): void {
    if ((<any>this).onInit) {
      (<any>this).onInit();
    }
  }
  ngOnDestroy(): void {
    if ((<any>this).onDestroy) {
      (<any>this).onDestroy();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if ((<any>this).onChanges) {
      (<any>this).onChanges(changes);
    }
  }
  ngDoCheck(): void {
    if ((<any>this).doCheck) {
      (<any>this).doCheck();
    }
  }
  ngAfterContentInit(): void {
    if ((<any>this).afterContentInit) {
      (<any>this).afterContentInit();
    }
  }
  ngAfterContentChecked(): void {
    if ((<any>this).afterContentChecked) {
      (<any>this).afterContentChecked();
    }
  }
  ngAfterViewChecked(): void {
    if ((<any>this).afterViewChecked) {
      (<any>this).afterViewChecked();
    }
  }
  ngAfterViewInit(): void {
    if ((<any>this).afterViewInit) {
      (<any>this).afterViewInit();
    }
  }
}