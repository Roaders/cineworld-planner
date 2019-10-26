import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FilmAttribute, IEvent, IFilm } from 'src/contracts/contracts';
import { displayAttribute } from 'src/app/helper/attribute-helper';

export type FilterMode = 'exclude' | 'include';

export interface IFilter {attribute: FilmAttribute; mode: FilterMode; }

@Component({
    selector: 'attribute-selector',
    templateUrl: './attribute-selector.component.html',
})
export class AttributeSelectorComponent {

    private _expand = false;

    public get expand() {
        return this._expand;
    }

    private _filters: IFilter[] = [];

    @Output()
    public filters: EventEmitter<IFilter[]> = new EventEmitter<IFilter[]>();

    private _events: IEvent[] = [];

    @Input()
    public get events(): IEvent[] {
        return this._events;
    }

    public set events(value: IEvent[]) {
        this._events = value || [];
    }

    private _selectedFilms: IFilm[] = [];

    @Input()
    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    public set selectedFilms(value: IFilm[]) {
        this._selectedFilms = value || [];
    }

    public get allAttributes(): FilmAttribute[] {
        return this._events
            .filter(event => this.selectedFilms.some(film => film.id === event.filmId))
            .map(event => event.attributeIds)
            .reduce((all, ids) => [...all, ...ids.filter(id => all.indexOf(id) < 0)], new Array<FilmAttribute>())
            .filter(attribute => displayAttribute(attribute) != null)
            .sort();
    }

    public toggleExpand() {
        this._expand = !this._expand;
    }

    public getIcon(attribute: FilmAttribute): string | undefined {
        const attributeInfo = displayAttribute(attribute);
        return attributeInfo != null ? attributeInfo.icon : undefined;
    }

    public getDescription(attribute: FilmAttribute): string | undefined {
        const attributeInfo = displayAttribute(attribute);
        return attributeInfo != null ? attributeInfo.description : undefined;
    }

    public attributeFilterClass(attribute: FilmAttribute): string {
        const attributeFilter = this._filters.filter(filter => filter.attribute === attribute)[0];
        const existingMode = attributeFilter != null ? attributeFilter.mode : undefined;

        switch (existingMode) {
            case 'include':
                return 'fa-check';

            case 'exclude':
                return 'fa-times';

            default:
                return 'fa-square-o';
        }
    }

    public toggleFilter(attribute: FilmAttribute) {
        const attributeFilter = this._filters.filter(filter => filter.attribute === attribute)[0];
        const existingMode = attributeFilter != null ? attributeFilter.mode : undefined;

        this._filters = this._filters.filter(filter => filter.attribute !== attribute);

        switch (existingMode) {
            case 'include':
                this._filters.push({attribute, mode: 'exclude'});
                break;

            case 'exclude':
                break;

            default:
                this._filters.push({attribute, mode: 'include'});
        }

        this.filters.emit(this._filters);
    }

}
