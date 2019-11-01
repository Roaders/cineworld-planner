import { Injectable } from '@angular/core';
import { IFilter } from '../components/attribute-selector/attribute-selector.component';

const FAVORITE_CINEMA_STORAGE_KEY = 'favoriteCinemaIds';
const TRAILER_ALLOWANCE_STORAGE_KEY = 'trailerAllowance';
const ATTRIBUTE_FILTER_STORAGE_KEY = 'attributeFilter';
const MAX_BREAK_LENGTH_STORAGE_KEY = 'maxBreakLength';

@Injectable()
export class PreferencesService {

    public getAttributeFilters(): IFilter[] {
        const filtersString = localStorage.getItem(ATTRIBUTE_FILTER_STORAGE_KEY);
        return filtersString ? JSON.parse(filtersString) : [];
    }

    public setAttributeFilters(value: IFilter[]) {
        localStorage.setItem(ATTRIBUTE_FILTER_STORAGE_KEY, JSON.stringify(value));
    }

    public getTrailerAllowance(): number {
        const filtersString = localStorage.getItem(TRAILER_ALLOWANCE_STORAGE_KEY);
        return filtersString ? JSON.parse(filtersString) : 30;
    }

    public setTrailerAllowance(value: number) {
        localStorage.setItem(TRAILER_ALLOWANCE_STORAGE_KEY, JSON.stringify(value));
    }

    public getMaxBreakLength(): number {
        const filtersString = localStorage.getItem(MAX_BREAK_LENGTH_STORAGE_KEY);
        return filtersString ? JSON.parse(filtersString) : 30;
    }

    public setMaxBreakLength(value: number) {
        localStorage.setItem(MAX_BREAK_LENGTH_STORAGE_KEY, JSON.stringify(value));
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
