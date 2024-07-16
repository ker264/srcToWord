import { EventEmitter, Injectable } from "@angular/core";
import { IFileNames } from "src/interfaces/i-file-names";
import { CreateDocx, ReadDirectory, ReadFilesForDocx, SaveWordFile, SelectDirectory, SelectFilesDirectly } from "wailsjs/go/main/App";
import { EventsEmit, EventsOn } from "wailsjs/runtime/runtime";
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

    public readFilesDataForConvertion(fileList: IFileNames[], outPath: string): void {
        ReadFilesForDocx(fileList)
            .then((result) =>
                generateDocx(fileList, result)
                    .then((base64) => SaveWordFile(outPath, base64))
                    .catch((err) => console.log(err))
            )
            .catch((err) => console.log(err));
    }

    /**
     * Создает docx файл из содержимого переданных файлов
     * @param filesList - список файлов из которых создать docx
     * @returns возвращает путь к docx в случае успеха
     */
    public createDocx(encoding: string, filesList: IFileNames[], ...resultDirParts: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            CreateDocx(filesList, resultDirParts, encoding)
                .then((docxFilePath) => resolve(docxFilePath))
                .catch((err) => reject(err));
        });
    }

    /**
     * Загружает содержимое Blob как файл с указанным именем.
     *
     * @param {Blob} blob - Содержимое Blob, которое нужно загрузить.
     * @param {string} name - Имя файла для загрузки (по умолчанию: "test.docx").
     */
    private downloadBlob(blob: Blob, name: string = "test.docx"): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
