import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { CineworldService } from './services/cineworld.service';
import { CinemaListComponent } from './components/cinema-list/cinema-list.component';

@NgModule({
    declarations: [
        AppComponent,
        CinemaListComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
    ],
    providers: [CineworldService],
    bootstrap: [AppComponent]
})
export class AppModule { }
