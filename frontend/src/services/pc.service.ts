import { EventEmitter, Injectable } from "@angular/core";
import { IFileNames } from "src/interfaces/i-file-names";
import { ReadDirectory, ReadFilesForDocx, SaveWordFile, SelectDirectory, SelectFilesDirectly } from "wailsjs/go/main/App";
import { EventsOn } from "wailsjs/runtime/runtime";
import { generateDocx } from "./docxGenerator";

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

    public readFilesDataForConvertion(fileList: IFileNames[], outPath: string, fileName: string, encoding: string): void {
        ReadFilesForDocx(fileList, encoding)
            .then((result) =>
                generateDocx(fileList, result)
                    .then((base64) => SaveWordFile(outPath, fileName, base64))
                    .catch((err) => console.log(err))
            )
            .catch((err) => console.log(err));
    }
}
