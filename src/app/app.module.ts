import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { CineworldService } from './services/cineworld.service';
import { CinemaListComponent } from './components/cinema-list/cinema-list.component';
import { CinemaComponent } from './components/cinema/cinema.component';
import { DateSelectorComponent } from './components/date-selector/date-selector.component';
import { PreferencesService } from './services/preferences.service';
import { CinemaHelper } from './helper/cinema-helper';

@NgModule({
    declarations: [
        AppComponent,
        CinemaListComponent,
        CinemaComponent,
        DateSelectorComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
    ],
    providers: [
        CineworldService,
        PreferencesService,
        CinemaHelper,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
