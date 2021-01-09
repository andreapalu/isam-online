import { Component, Injector, VERSION } from "@angular/core";
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
  add() {
    this.index++;
    let a: string = (this.index % 2 == 0) ? "looooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooo ooooong" : "";
    this.notificationService.add(new NewNotificationModel(
      "Titolo",
      `notifica num: ${this.index}` + a,
      () => { console.log("Ciao") },
      "../../../assets/image/favicon-16x16.png"
    ));
  }
}