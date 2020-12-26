import { Component, Injector, VERSION } from "@angular/core";
import { BasePageComponent } from "../../component/BasePageComponent/base-page.component";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent extends BasePageComponent {
  name = "Angular " + VERSION.major;

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  onInit() {
  }
}