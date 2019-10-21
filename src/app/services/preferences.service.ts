import { Injectable } from '@angular/core';

const FAVORITE_CINEMA_STORAGE_KEY = 'favoriteCinemaIds';

@Injectable()
export class PreferencesService {

    public removeFavoriteCinema(id: string) {
        const currentFavorites = this.getFavoriteCinemaIds();

        if (currentFavorites.indexOf(id) >= 0) {
            const filteredFavorites = currentFavorites.filter(existingID => existingID !== id);

            localStorage.setItem(FAVORITE_CINEMA_STORAGE_KEY, JSON.stringify(filteredFavorites));
        }
    }

    public addFavoriteCinema(id: string) {
        const currentFavorites = this.getFavoriteCinemaIds();

        if (currentFavorites.indexOf(id) < 0) {
            currentFavorites.push(id);

            localStorage.setItem(FAVORITE_CINEMA_STORAGE_KEY, JSON.stringify(currentFavorites));
        }
    }

    public getFavoriteCinemaIds(): string[] {
        const savedIds = localStorage.getItem(FAVORITE_CINEMA_STORAGE_KEY);
        return savedIds != null ? JSON.parse(savedIds) : new Array<string>();
    }
}
