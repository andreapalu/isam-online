import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, ComponentRef, DoCheck, ElementRef, EmbeddedViewRef, Injector, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { NotificationObj } from "../../om/notification.model/NotificationObj";
import { NotificationService } from "../../service/notification.service";

@Component({
  selector: "notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"]
})
export class NotificationComponent implements OnChanges, AfterContentChecked {
  @Input() _notificationContent: NotificationObj;

  @ViewChild('notificationRef') notificationRef: ElementRef;
  height: number;

  constructor(
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngAfterContentChecked(): Observable<{ index: number, height: number }> {
    if (!this.height || this.height == 0) {
      this.height = this.notificationRef.nativeElement.offsetHeight;
      if (this.height != 0) {
        return new Observable((observer) => {
          observer.next({ index: this._notificationContent.index, height: this.height });
          observer.complete();
        })
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes) {
      if (!!changes._notificationContent.currentValue) {
        this._notificationContent = changes._notificationContent.currentValue;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  test() {
    this.changeDetectorRef.detectChanges();
  }

  removeNotification() {
    let notificationService: NotificationService = this.injector.get(NotificationService);
    notificationService.remove(this._notificationContent.index);
  }

}