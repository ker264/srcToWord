import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { ItemsListComponent } from "./items-list/items-list.component";
import { FileFilterPipe } from "src/pipes/file-filter.pipe";
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';

@NgModule({
  declarations: [AppComponent, ItemsListComponent, FileFilterPipe, SettingsMenuComponent],
  imports: [BrowserModule, NgbModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
