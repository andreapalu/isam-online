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
    let elapsedS: number = Math.floor(elapsedMS / 1000);
    if (elapsedS < 2) {
      return `Ora`;
    } else if (elapsedS < 60) {
      return `${elapsedS} secondi fa`;
    } else if (elapsedS < 60 * 2) {
      return `${Math.floor(elapsedS / 60)} minuto fa`;
    } else if (elapsedS < 60 * 60) {
      return `${Math.floor(elapsedS / 60)} minuti fa`;
    } else if (elapsedS < 60 * 60 * 2) {
      return `${Math.floor(elapsedS / (60 * 60))} ora fa`;
    } else if (elapsedS < 60 * 60 * 24) {
      return `${Math.floor(elapsedS / (60 * 60))} ore fa`;
    } else if (elapsedS < 60 * 60 * 24 * 2) {
      return `${Math.floor(elapsedS / (60 * 60 * 24))} giorno fa`;
    } else if (elapsedS < 60 * 60 * 24 * 7) {
      return `${Math.floor(elapsedS / (60 * 60 * 24))} giorni fa`;
    } else if (elapsedS < 60 * 60 * 24 * 7 * 2) {
      return `${Math.floor(elapsedS / (60 * 60 * 24 * 7))} settimana fa`;
    } else if (elapsedS < 60 * 60 * 24 * 7 * 4) {
      return `${Math.floor(elapsedS / (60 * 60 * 24 * 7))} settimane fa`;
    } else {
      return `Più di 4 settimane fa`;
    }
  }