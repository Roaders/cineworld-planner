import { Injectable } from '@angular/core';

const FAVORITE_CINEMA_STORAGE_KEY = 'favoriteCinemaIds';
const TRAILER_ALLOWANCE_STORAGE_KEY = 'trailerAllowance';

@Injectable()
export class PreferencesService {

    public getTrailerAllowance(): number {
        const allowanceString = localStorage.getItem(TRAILER_ALLOWANCE_STORAGE_KEY);
        return allowanceString ? JSON.parse(allowanceString) : 30;
    }

    public setTrailerAllowance(value: number) {
        localStorage.setItem(TRAILER_ALLOWANCE_STORAGE_KEY, JSON.stringify(value));
    }

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
