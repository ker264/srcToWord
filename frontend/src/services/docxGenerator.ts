import * as iconv from "iconv-lite";
import * as docx from "docx";
import { Alignment, AlignmentType, Document, Packer, PageBreak, Paragraph, Style, TableOfContents, TextRun } from "docx";

interface IFileNames {
    simple: string;
    relative: string;
    absolute: string;
}

export function generateDocx(filesList: IFileNames[], filesData: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        //Создаем массив с абзацами для ворда
        let allPars: Paragraph[] = [];
        allPars.push(new Paragraph({ children: [new PageBreak()] }));

        if (filesList.length == 0) reject("Файлы не выбраны");

        filesList.forEach((file, index) => {
            allPars.push(new Paragraph({ text: `${file.relative}`, heading: docx.HeadingLevel.HEADING_1 }));

            // TODO Восстановить работоспособность конвертера
            // let allFileRaw = fs.readFileSync(file.absolute);
            // let decodedFile = iconv.decode(allFileRaw, encoding);

            filesData[index].split("\n").forEach((line) => {
                allPars.push(new Paragraph({ text: line }));
            });
        });

        let doc = new Document({
            styles: {
                default: {
                    heading1: {
                        run: {
                            // size: 28,
                            bold: true,
                            // italics: true,
                            color: "000000",
                        },
                        paragraph: {
                            alignment: AlignmentType.CENTER,
                            spacing: {
                                before: 240,
                                after: 120,
                            },
                        },
                    },
                    heading2: {
                        run: {
                            // size: 26,
                            bold: true,
                            color: "000000",
                        },
                        paragraph: {
                            alignment: AlignmentType.CENTER,
                            spacing: {
                                after: 120,
                            },
                        },
                    },
                    // listParagraph: {
                    //   run: {
                    //     color: "#FF0000",
                    //   },
                    // },
                    document: {
                        run: {
                            size: "14pt",
                            font: "Times New Roman",
                        },
                        paragraph: {
                            alignment: AlignmentType.LEFT,
                        },
                    },
                },
                // paragraphStyles: [{ id: "myStyle", name: "My Style", basedOn: "Normal", run: { font: "Times New Roman", size: 28 } }],
            },
            sections: [
                {
                    properties: {},
                    children: [
                        new TableOfContents("Оглавление", {
                            hyperlink: true,
                            headingStyleRange: "1-5",
                        }),
                        ...allPars,
                    ],
                },
            ],
        });

        // Отправляем на страницу для скачивания
        Packer.toBase64String(doc)
            .then((base64String) => {
                resolve(base64String);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
