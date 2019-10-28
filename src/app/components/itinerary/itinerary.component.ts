import { Component, Input } from '@angular/core';
import { IItineraryItem } from 'src/app/contracts/contracts';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { getEventFilmName } from 'src/app/helper/event-helper';

@Component({
    selector: 'itinerary',
    templateUrl: './itinerary.component.html',
    styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent {

    @Input()
    public films: IFilm[] = [];

    @Input()
    public itinerary: IItineraryItem[] = [];

    public getMessage(body: IEvent | string): string {
        if (typeof body === 'string') {
            return body;
        }

        return getEventFilmName(body, this.films) || '';
    }

}
