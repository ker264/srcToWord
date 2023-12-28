import { Component, ViewChild } from "@angular/core";
import * as _ from "lodash";
import { IFileNames } from "src/interfaces/i-file-names";
import { PcService } from "src/services/pc.service";
import { ItemsListComponent } from "./items-list/items-list.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "electronAngular";

  @ViewChild("rootList") rootListComponent!: ItemsListComponent;
  @ViewChild("chosenList") chosenListComponent!: ItemsListComponent;

  isOutFolderEqualRootFolder: boolean = true;
  rootFolder: string = "";
  outFolder: string = "";
  outName: string = "";

  isRecursive: boolean = false;
  nameMode: keyof IFileNames = "simple";

  filesInRootDirectory: IFileNames[] = [];
  filesChosen: IFileNames[] = [];

  constructor(private pcService: PcService) {
    let today = new Date(Date.now());
    let year = today.getFullYear().toString().slice(-2);
    let month = (today.getMonth() + 1).toString().padStart(2, "0");
    let day = today.getDate().toString().padStart(2, "0");

    this.outName = `${year + month + day}_result`;
  }

  //TODO Добавить вывод в тостер для результатов действий или лог

  readRoot() {
    this.pcService
      .readFilesInDirectory(this.rootFolder, this.isRecursive)
      .then((result) => {
        this.filesInRootDirectory = [];
        this.filesInRootDirectory.push(...result);
      })
      .catch((err) => console.log(err));
  }

  chooseRootFolder() {
    this.pcService
      .chooseRootFolder()
      .then((root) => {
        this.rootFolder = root;
        this.handleRootChange();
      })
      .catch((err) => console.log(err));
  }

  handleRootChange() {
    // Если выходная директория залочена - изменяем её
    if (this.isOutFolderEqualRootFolder) this.outFolder = this.rootFolder;
    // Читаем корневую директорию
    if (this.rootFolder != "") this.readRoot();
  }

  switchOutFolderLock() {
    this.isOutFolderEqualRootFolder = !this.isOutFolderEqualRootFolder;
  }

  handleDirectFilesAddition() {
    this.pcService
      .directFileChoose()
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  addToChosen() {
    let newElems = _.differenceBy(this.rootListComponent.getFilteredList(), this.filesChosen, "absolute");
    this.filesChosen.push(...newElems);
  }

  deleteFromChosen() {
    this.filesChosen = _.differenceWith(this.filesChosen, this.chosenListComponent.getFilteredList(), (item1, item2) => item1.absolute == item2.absolute);
  }

  directFilesChoose() {
    this.pcService
      .directFileChoose()
      .then((list) => this.filesChosen.push(..._.differenceBy(list, this.filesChosen, "absolute")))
      .catch((err) => console.log(err));
  }

  //TODO перейти на toast
  createDocx() {
    this.pcService
      .createDocx(this.filesChosen, this.outFolder != "" ? this.outFolder : "C:/", `${this.outName}.docx`)
      .then((docxPath) => alert(`Файл создан\n${docxPath}`))
      .catch((err) => alert(`Ошибка создания файла\n${err}`));
  }
}
