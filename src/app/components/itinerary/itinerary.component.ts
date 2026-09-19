import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IItineraryItem } from 'src/app/contracts/contracts';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { getEventFilmName } from 'src/app/helper/event-helper';

@Component({
    selector: 'itinerary',
    templateUrl: './itinerary.component.html',
    styleUrls: ['./itinerary.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ItineraryComponent {

    @Input()
    public films: IFilm[] = [];

    @Input()
    public itinerary: IItineraryItem[] = [];

    /** Resolves an itinerary body to its display message. */
    public getMessage(body: IEvent | string): string {
        if (typeof body === 'string') {
            return body;
        }

        return getEventFilmName(body, this.films) || '';
    }

    /** Returns the booking link available for an event body. */
    public getBookingLink(body: IEvent | string): string {
        return typeof body === 'string' ? '' : body.bookingLink;
    }

}
