import { Injectable } from "@angular/core";
import * as electron from "electron";
import { IFileNames } from "src/interfaces/i-file-names";

@Injectable({
  providedIn: "root",
})
export class PcService {
  _ipc: electron.IpcRenderer | undefined;
  constructor() {
    if (window.require) {
      try {
        this._ipc = window.require("electron").ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn("Electron's IPC was not loaded");
    }
  }

  readFilesInDirectory(directoryPath: string, isRecursive: boolean): Promise<IFileNames[]> {
    return new Promise((resolve, reject) => {
      if (!this._ipc) {
        reject("no ips");
        return;
      }
      this._ipc.send("read-directory", directoryPath, isRecursive);
      this._ipc.once("directory-read", (event, files) => {
        resolve(files);
      });
      this._ipc.once("directory-read-error", (event, error) => {
        reject(error);
      });
    });
  }

  directFileChoose(): Promise<IFileNames[]> {
    return new Promise((resolve, reject) => {
      if (!this._ipc) {
        reject("no ips");
        return;
      }
      this._ipc.send("open-file-dialog");
      this._ipc.once("selected-files", (event, files) => {
        resolve(files);
      });
      this._ipc.once("open-file-dialog-error", (event, error) => {
        reject(error);
      });
    });
  }

  chooseRootFolder(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._ipc) {
        reject("no ips");
        return;
      }
      this._ipc.send("choose-root");
      this._ipc.once("choose-root-success", (event, path) => {
        resolve(path);
      });
      this._ipc.once("choose-root-error", (event, error) => {
        reject(error);
      });
    });
  }

  /**
   * Создает docx файл из содержимого переданных файлов
   * @param filesList - список файлов из которых создать docx
   * @returns возвращает путь к docx в случае успеха
   */
  createDocx(filesList: IFileNames[], ...resultDirParts: string[]): Promise<string> {
    //TODO сделать кнопку открыть в проводнике
    return new Promise((resolve, reject) => {
      if (!this._ipc) {
        reject("no ips");
        return;
      }
      this._ipc.send("create-docx", filesList, resultDirParts);
      this._ipc.once("create-docx-success", (event, path) => {
        resolve(path);
      });
      this._ipc.once("create-docx-error", (event, error) => {
        reject(error);
      });
    });
  }
}
