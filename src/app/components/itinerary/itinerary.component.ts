import { Component, Input } from '@angular/core';
import { IEvent, IFilm } from 'src/contracts/contracts';
import moment from 'moment';
import { getStartMoment, formatTime, getEndMoment, getEventFilmName } from 'src/app/helper/event-helper';

interface ITineraryItem {
    startEstimated?: boolean;
    endEstimated?: boolean;
    start: string;
    message: string;
    end: string;
}


@Component({
    selector: 'itinerary',
    templateUrl: './itinerary.component.html'
})
export class ItineraryComponent {

    private _films: IFilm[] = [];

    @Input()
    public get films(): IFilm[] {
        return this._films;
    }

    public set films(value: IFilm[]) {
        this._films = value || [];
    }

    @Input()
    public trailerAllowance = 30;

    private _events: IEvent[] = [];

    @Input()
    public get events(): IEvent[] {
        return this._events;
    }

    public set events(value: IEvent[]) {
        this._events = value || [];
    }

    public get itinerary(): ITineraryItem[] {
        return this.events
            .sort(sortEvents)
            .map(event => {
                const start = getStartMoment(event);
                const message = getEventFilmName(event, this.films);
                const end = getEndMoment(event, this.trailerAllowance, this.films);

                if (start == null || end == null || message == null) {
                    throw Error(`Could not generate itinerary. start: ${start}, end: ${end} message: ${message}`);
                }

                return {
                    start: formatTime(start),
                    message,
                    end: formatTime(end),
                    endEstimated: true
                };
            });
    }


}

function sortEvents(one: IEvent, two: IEvent): number {
    const oneTime = moment(one.eventDateTime).toDate().getTime();
    const twoTime = moment(two.eventDateTime).toDate().getTime();

    return oneTime - twoTime;
}
