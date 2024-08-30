import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { CinemaHeaderComponent } from './components/cinema-header/cinema-header.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { ItineraryListComponent } from './components/itinerary-list/itinerary-list.component';
import { ItineraryComponent } from './components/itinerary/itinerary.component';
import { AttributeSelectorComponent } from './components/attribute-selector/attribute-selector.component';

@NgModule({ declarations: [
        AppComponent,
        CinemaListComponent,
        CinemaComponent,
        DateSelectorComponent,
        CinemaHeaderComponent,
        EventListComponent,
        ItineraryComponent,
        ItineraryListComponent,
        AttributeSelectorComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule], providers: [
        CineworldService,
        PreferencesService,
        CinemaHelper,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule { }
