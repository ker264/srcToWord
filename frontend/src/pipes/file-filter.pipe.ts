import { Pipe, PipeTransform } from "@angular/core";
import { IFileNames } from "src/interfaces/i-file-names";
import * as _ from "lodash";

@Pipe({
  name: "fileFilter",
})
export class FileFilterPipe implements PipeTransform {
  transform(rawList: IFileNames[], nameMode: keyof IFileNames, modeCase: boolean, modeStrict: boolean, modeRegex: boolean, filterString: string): IFileNames[] {
    if (filterString === "") return rawList;
    let filtersList: string[] = (!modeCase ? _.toLower(filterString) : filterString).split(",");

    return rawList.filter((item) => {
      let itemName: string = item[nameMode];
      if (!modeCase) itemName = _.toLower(itemName);

      let isOk = false;

      for (let filter of filtersList) {
        if (modeRegex) {
          const regex = new RegExp(filter);
          // С использованием регулярных выражений
          if (modeStrict) {
            const match = regex.exec(itemName);
            console.log(match);
            if (!(match && match[0] === itemName)) continue;
          } else {
            if (!itemName.match(regex)) continue;
          }

          isOk = true;
          break;
        } else {
          // Без использования регулярных выражений
          if (modeStrict) {
            if (!_.isEqual(itemName, filter)) continue;
          } else {
            if (!itemName.includes(filter)) continue;
          }
          isOk = true;
          break;
        }
      }

      return isOk;
    });
  }
}
