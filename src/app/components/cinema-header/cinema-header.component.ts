import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ICinema } from 'src/contracts/contracts';
import { CinemaHelper } from 'src/app/helper/cinema-helper';

@Component({
    selector: 'cinema-header',
    templateUrl: './cinema-header.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CinemaHeaderComponent {

    /** Creates a cinema header backed by favorite-cinema helpers. */
    constructor(private cinemaHelper: CinemaHelper) { }

    @Input()
    public cinema: ICinema | undefined;

    /** Provides the cinema name or a loading placeholder. */
    public get cinemaName(): string {
        return this.cinema != null ? this.cinema.name : 'Loading...';
    }

    /** Builds a Google Maps search URL for the current cinema. */
    public get cinemaUrl(): string | undefined {
        if (this.cinema == null) {
            return;
        }

        return `https://www.google.com/maps/search/?api=1&query=${this.cinema.latitude},${this.cinema.longitude}`;
    }

    /** Checks whether a cinema is saved as a favorite. */
    public isFavoriteCinema(cinema?: ICinema): boolean {
        return this.cinemaHelper.isFavoriteCinema(cinema);
    }

    /** Toggles a cinema's favorite status. */
    public toggleFavorite(cinema?: ICinema) {
        this.cinemaHelper.toggleFavorite(cinema);
    }

}
