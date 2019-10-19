import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { CineworldService } from './services/cineworld.service';
import { CinemaListComponent } from './components/cinema-list/cinema-list.component';
import { CinemaComponent } from './components/cinema/cinema.component';

@NgModule({
    declarations: [
        AppComponent,
        CinemaListComponent,
        CinemaComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
    ],
    providers: [CineworldService],
    bootstrap: [AppComponent]
})
export class AppModule { }
