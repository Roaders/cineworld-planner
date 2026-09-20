import { Injectable } from '@angular/core';
import { IFilter } from '../components/attribute-selector/attribute-selector.component';

const FAVORITE_CINEMA_STORAGE_KEY = 'favoriteCinemaIds';
const TRAILER_ALLOWANCE_STORAGE_KEY = 'trailerAllowance';
const ATTRIBUTE_FILTER_STORAGE_KEY = 'attributeFilter';
const MAX_BREAK_LENGTH_STORAGE_KEY = 'maxBreakLength';

@Injectable()
export class PreferencesService {

    /** Loads the saved attribute filters. */
    public getAttributeFilters(): IFilter[] {
        const filtersString = localStorage.getItem(ATTRIBUTE_FILTER_STORAGE_KEY);
        return filtersString ? JSON.parse(filtersString) : [];
    }

    /** Saves the selected attribute filters. */
    public setAttributeFilters(value: IFilter[]) {
        localStorage.setItem(ATTRIBUTE_FILTER_STORAGE_KEY, JSON.stringify(value));
    }

    /** Loads the saved trailer allowance or its default. */
    public getTrailerAllowance(): number {
        return this.getStoredNonNegativeNumber(TRAILER_ALLOWANCE_STORAGE_KEY, 30);
    }

    /** Saves the trailer allowance. */
    public setTrailerAllowance(value: number) {
        localStorage.setItem(TRAILER_ALLOWANCE_STORAGE_KEY, JSON.stringify(value));
    }

    /** Loads the saved maximum break length or its default. */
    public getMaxBreakLength(): number {
        return this.getStoredNonNegativeNumber(MAX_BREAK_LENGTH_STORAGE_KEY, 30);
    }

    /** Saves the maximum break length. */
    public setMaxBreakLength(value: number) {
        localStorage.setItem(MAX_BREAK_LENGTH_STORAGE_KEY, JSON.stringify(value));
    }

    /** Removes a cinema from the saved favorites. */
    public removeFavoriteCinema(id: string) {
        const currentFavorites = this.getFavoriteCinemaIds();

        if (currentFavorites.indexOf(id) >= 0) {
            const filteredFavorites = currentFavorites.filter(existingID => existingID !== id);

            localStorage.setItem(FAVORITE_CINEMA_STORAGE_KEY, JSON.stringify(filteredFavorites));
        }
    }

    /** Adds a cinema to the saved favorites. */
    public addFavoriteCinema(id: string) {
        const currentFavorites = this.getFavoriteCinemaIds();

        if (currentFavorites.indexOf(id) < 0) {
            currentFavorites.push(id);

            localStorage.setItem(FAVORITE_CINEMA_STORAGE_KEY, JSON.stringify(currentFavorites));
        }
    }

    /** Loads the saved favorite cinema identifiers. */
    public getFavoriteCinemaIds(): string[] {
        const savedIds = localStorage.getItem(FAVORITE_CINEMA_STORAGE_KEY);
        return savedIds != null ? JSON.parse(savedIds) : new Array<string>();
    }

    /** Loads a numeric preference, including values saved by the former text inputs. */
    private getStoredNonNegativeNumber(key: string, fallback: number): number {
        const storedValue = localStorage.getItem(key);
        const value = storedValue == null ? fallback : Number(JSON.parse(storedValue));

        return Number.isFinite(value) && value >= 0 ? value : fallback;
    }
}
