import { Component, Injector, VERSION } from "@angular/core";
import { NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";
import { NewNotificationModel } from "../../om/notification.model/NewNotificationModel";
import { NotificationService } from "../../service/notification.service";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent extends BasePageComponent {
  name = "Angular " + VERSION.major;

  constructor(
    injector: Injector,
    private notificationService: NotificationService
  ) {
    super(injector);
  }

  index: number = 0;
  addTest() {
    this.index++;
    let a: string = (this.index % 2 == 0) ? "looooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooong" : "";
    this.notificationService.add(new NewNotificationModel(
      "Titolo",
      `notifica num: ${this.index}` + a,
      false,
      () => { console.log("Ciao") },
      "../../../assets/image/favicon-16x16.png"
    ));
  }
  
  add() {
    this.index++;
    this.notificationService.add(new NewNotificationModel(
      `Titolo notifica num: ${this.index}`,
      `Contenuto notifica num: ${this.index}`,
      false,
      () => { console.log("Ciao") },
      (this.index % 2 == 0) ? "../../../assets/image/favicon-16x16.png" : "../../../assets/image/favicon-32x32.png"
    ));
  }

  tooltip(t: NgbTooltip) {
    t.isOpen() ? t.close() : t.open();
  }

}