import { EventEmitter, Injectable } from "@angular/core";
import { IFileNames } from "src/interfaces/i-file-names";
import { CreateDocx, ReadDirectory, SelectDirectory, SelectFilesDirectly } from "wailsjs/go/main/App";
import { EventsEmit, EventsOn } from "wailsjs/runtime/runtime";

@Injectable({
  providedIn: "root",
})
export class PcService {
  public messageReceived: EventEmitter<any> = new EventEmitter();

  constructor() {
    EventsOn("message", (message) => {
      this.messageReceived.emit(message);
    });
  }

  public readFilesInDirectory(directoryPath: string, isRecursive: boolean): Promise<IFileNames[]> {
    return new Promise((resolve, reject) => {
      ReadDirectory(directoryPath, isRecursive)
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  public directFileChoose(): Promise<IFileNames[]> {
    return new Promise((resolve, reject) => {
      SelectFilesDirectly()
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  public chooseRootFolder(): Promise<string> {
    return new Promise((resolve, reject) => {
      SelectDirectory()
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  /**
   * Создает docx файл из содержимого переданных файлов
   * @param filesList - список файлов из которых создать docx
   * @returns возвращает путь к docx в случае успеха
   */
  public createDocx(filesList: IFileNames[], ...resultDirParts: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      CreateDocx(filesList, resultDirParts)
        .then((docxFilePath) => resolve(docxFilePath))
        .catch((err) => reject(err));
    });
  }
}
