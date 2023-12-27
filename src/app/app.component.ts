import { Component } from "@angular/core";
import { IFileNames } from "src/interfaces/i-file-names";
import { PcService } from "src/services/pc.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "electronAngular";

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
    this.readRoot();
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

  test() {
    console.log(this.isRecursive);
  }
}
