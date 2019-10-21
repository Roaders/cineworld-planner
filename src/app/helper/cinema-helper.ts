import { ICinema } from 'src/contracts/contracts';
import { PreferencesService } from '../services/preferences.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CinemaHelper {
    constructor(
        private preferencesService: PreferencesService
    ) {
    }

    public isFavoriteCinema(cinema?: ICinema): boolean {
        return cinema != null && this.preferencesService.getFavoriteCinemaIds().indexOf(cinema.externalCode) >= 0;
    }

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
