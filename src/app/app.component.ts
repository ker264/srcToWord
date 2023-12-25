import { Component } from "@angular/core";
import { PcService } from "src/services/pc.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  testStr: string = "You weak";
  title = "electronAngular";

  listDir: string[] = [];

  constructor(private pcService: PcService) {}

  tryReadDir() {
    this.pcService
      .readFilesInDirectory("D:/")
      .then((result) => {
        this.listDir = [];
        this.listDir.push(...result);
      })
      .catch((err) => console.log(err));
  }

  handleDirectFilesAddition() {
    this.pcService
      .directFileChoose()
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }
}
