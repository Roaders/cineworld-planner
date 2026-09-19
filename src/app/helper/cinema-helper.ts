import { ICinema } from 'src/contracts/contracts';
import { PreferencesService } from '../services/preferences.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CinemaHelper {
    /** Creates a helper backed by persisted cinema preferences. */
    constructor(
        private preferencesService: PreferencesService
    ) {
    }

    /** Checks whether a cinema is saved as a favorite. */
    public isFavoriteCinema(cinema?: ICinema): boolean {
        return cinema != null && this.preferencesService.getFavoriteCinemaIds().indexOf(cinema.externalCode) >= 0;
    }

    /** Adds or removes a cinema from the saved favorites. */
    public toggleFavorite(cinema?: ICinema) {
        if (cinema != null) {
            if (this.preferencesService.getFavoriteCinemaIds().indexOf(cinema.externalCode) < 0) {
                this.preferencesService.addFavoriteCinema(cinema.externalCode);
            } else {
                this.preferencesService.removeFavoriteCinema(cinema.externalCode);
            }
        }
    }
}
