import { Component, OnInit } from '@angular/core';
import { CineworldService, ICinema } from 'src/app/services/cineworld.service';
import { ActivatedRoute } from '@angular/router';
import { map, filter, tap } from 'rxjs/operators';
import { Observer } from 'rxjs';

@Component({
    selector: 'cinema',
    templateUrl: './cinema.component.html',
    styleUrls: ['./cinema.component.scss']
})
export class CinemaComponent {

    constructor(
        private cineworldService: CineworldService,
        private activatedRoute: ActivatedRoute
    ) {
        this.loadCinemaTimes();
    }

    private _errorMessage: undefined | string;

    public get errorMessage() {
        return this._errorMessage;
    }

    private _cinema: ICinema | undefined;

    public get cinema(): ICinema | undefined {
        return this._cinema;
    }

    private loadCinemaTimes() {
        const externalCode = this.activatedRoute.snapshot.params.externalCode;

        const observer: Observer<ICinema> = {
            error: error => this._errorMessage = error,
            next: () => null,
            complete: () => null,
        };

        this.cineworldService.getCinemaAsync(externalCode).pipe(
            tap(cinema => this._cinema = cinema)
        ).subscribe(observer);
    }
}
