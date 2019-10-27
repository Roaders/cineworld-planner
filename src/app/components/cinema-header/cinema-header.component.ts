import { Component, Input } from '@angular/core';
import { ICinema } from 'src/contracts/contracts';
import { CinemaHelper } from 'src/app/helper/cinema-helper';

@Component({
    selector: 'cinema-header',
    templateUrl: './cinema-header.component.html',
})
export class CinemaHeaderComponent {

    constructor(private cinemaHelper: CinemaHelper) { }

    @Input()
    public cinema: ICinema | undefined;

    public get cinemaName(): string {
        return this.cinema != null ? this.cinema.name : 'Loading...';
    }

    public get cinemaUrl(): string | undefined {
        if (this.cinema == null) {
            return;
        }

        return `https://www.google.com/maps/search/?api=1&query=${this.cinema.latitude},${this.cinema.longitude}`;
    }

    public isFavoriteCinema(cinema?: ICinema): boolean {
        return this.cinemaHelper.isFavoriteCinema(cinema);
    }

    public toggleFavorite(cinema?: ICinema) {
        this.cinemaHelper.toggleFavorite(cinema);
    }

}
