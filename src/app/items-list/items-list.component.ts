import { Component, Input } from "@angular/core";
import { IFileNames } from "src/interfaces/i-file-names";

@Component({
  selector: "app-items-list",
  templateUrl: "./items-list.component.html",
  styleUrls: ["./items-list.component.scss"],
})
export class ItemsListComponent {
  @Input() itemsList: IFileNames[] = [];
  @Input() isRootData: boolean = false;
  @Input() nameMode: keyof IFileNames = "simple";

  modeCase: boolean = false;
  modeStrict: boolean = false;
  modeRegex: boolean = false;

  filterString: string = "";

  constructor() {}

  testDel() {
    // this.itemsList.splice(0, 1);
    console.log(this.itemsList);
  }

  switchMode(modeName: string) {
    switch (modeName) {
      case "modeCase":
        this.modeCase = !this.modeCase;
        break;
      case "modeStrict":
        this.modeStrict = !this.modeStrict;
        this.modeRegex = false;
        break;
      case "modeRegex":
        this.modeRegex = !this.modeRegex;
        this.modeStrict = false;
        break;
    }
  }
}
