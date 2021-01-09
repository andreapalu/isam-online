import { ComponentRef } from "@angular/core";
import { NotificationComponent } from "../../component/notification/notification.component";

export class NotificationObj {
    title: string;
    content: string;
    action: Function;
    close: Function;
    componentRef: ComponentRef<NotificationComponent>;
    index: number;
    top: number;
    icon?: string;
    date: Date;
    elapsed: string;
    private interval: NodeJS.Timer;
  
    constructor(
      title: string,
      content: string,
      componentRef: ComponentRef<NotificationComponent>,
      top: number,
      index?: number,
      action?: Function,
      icon?: string,
      date?: Date
    ) {
      this.title = title;
      this.content = content;
      this.componentRef = componentRef;
      this.top = top;
      this.index = index || 0;
      this.action = action;
      this.close = () => {
        clearInterval(this.interval);
      }
      this.icon = icon;
      this.date = date || new Date();
      this.elapsed = getElapsed((new Date()).getTime() - this.date.getTime());
      this.interval = setInterval(() => {
        this.elapsed = getElapsed((new Date()).getTime() - this.date.getTime());
        this.componentRef.changeDetectorRef.detectChanges();
      }, 30000);
      setTimeout(() => {
        this.componentRef.changeDetectorRef.detectChanges();
      }, 5);
    }
  
  }
  
  function getElapsed(elapsedMS: number): string {
    let elapsedS: number = parseInt((elapsedMS / 1000).toFixed(0));
    if (elapsedS < 2) {
      return `Ora`;
    } else if (elapsedS < 60) {
      return `${elapsedS} secondi`;
    } else if (elapsedS < 60 * 2) {
      return `${(elapsedS / 60).toFixed(0)} minuto`;
    } else if (elapsedS < 60 * 60) {
      return `${(elapsedS / 60).toFixed(0)} minuti`;
    } else if (elapsedS < 60 * 60 * 2) {
      return `${(elapsedS / (60 * 60)).toFixed(0)} ora`;
    } else if (elapsedS < 60 * 60 * 24) {
      return `${(elapsedS / (60 * 60)).toFixed(0)} ore`;
    } else if (elapsedS < 60 * 60 * 24 * 2) {
      return `${(elapsedS / (60 * 60 * 24)).toFixed(0)} giorno`;
    } else if (elapsedS < 60 * 60 * 24 * 7) {
      return `${(elapsedS / (60 * 60 * 24)).toFixed(0)} giorni`;
    } else if (elapsedS < 60 * 60 * 24 * 7 * 2) {
      return `${(elapsedS / (60 * 60 * 24 * 7)).toFixed(0)} settimana`;
    } else if (elapsedS < 60 * 60 * 24 * 7 * 4) {
      return `${(elapsedS / (60 * 60 * 24 * 7)).toFixed(0)} settimane`;
    } else {
      return `Più di 4 settimane fa`;
    }
  }