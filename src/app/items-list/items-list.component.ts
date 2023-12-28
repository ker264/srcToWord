import { Component, Input } from "@angular/core";
import * as _ from "lodash";
import { IFileNames } from "src/interfaces/i-file-names";
import { FileFilterPipe } from "src/pipes/file-filter.pipe";

@Component({
  selector: "app-items-list",
  templateUrl: "./items-list.component.html",
  styleUrls: ["./items-list.component.scss"],
})
export class ItemsListComponent {
  @Input() itemsList: IFileNames[] = [];
  @Input() isRootData: boolean = false;
  @Input() nameMode: keyof IFileNames = "simple";

  private filter = new FileFilterPipe();

  modeCase: boolean = false;
  modeStrict: boolean = false;
  modeRegex: boolean = false;

  filterString: string = "";

  constructor() {}

  getFilteredList(): IFileNames[] {
    return this.filter.transform(this.itemsList, this.nameMode, this.modeCase, this.modeStrict, this.modeRegex, this.filterString);
  }

  deleteItemFromList(item: IFileNames) {
    _.remove(this.itemsList, (itemInList) => itemInList.absolute == item.absolute);
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
