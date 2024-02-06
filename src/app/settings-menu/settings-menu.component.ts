import { Component, EventEmitter, Output } from "@angular/core";
import { CheckRegedit, UpdateRegedit } from "wailsjs/go/main/App";

@Component({
  selector: "app-settings-menu",
  templateUrl: "./settings-menu.component.html",
  styleUrls: ["./settings-menu.component.scss"],
})
export class SettingsMenuComponent {
  @Output() closeSettingsMenu: EventEmitter<boolean> = new EventEmitter();

  isInMenu: boolean = false;

  constructor() {
    CheckRegedit().then((inRegedit) => (this.isInMenu = inRegedit));
  }

  /**
   * Закрыть окно настроек
   */
  close() {
    this.closeSettingsMenu.emit(true);
  }

  // TODD Перейти на тостер!!!!
  switchContextMenuState() {
    UpdateRegedit(this.isInMenu)
      .then()
      .catch((err) => alert(err));
  }
}
