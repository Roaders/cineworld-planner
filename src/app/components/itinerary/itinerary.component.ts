import { Component, Input } from '@angular/core';
import { IEvent, IFilm } from 'src/contracts/contracts';
import moment, { Moment } from 'moment';
import { getStartMoment, formatTime, getEndMoment, getEventFilmName } from 'src/app/helper/event-helper';
import { defaultTrailerAllowance } from 'src/app/constants/constants';

interface IInteraryBase {
    startEstimated?: boolean;
    endEstimated?: boolean;
    message: string;
    alertClass: string;
}

interface IItineraryItem extends IInteraryBase {
    start: string;
    end: string;
}

interface IInteraryMoment extends IInteraryBase {
    start: Moment;
    end: Moment;
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
    public trailerAllowance = defaultTrailerAllowance;

    private _events: IEvent[] = [];

    @Input()
    public get events(): IEvent[] {
        return this._events;
    }

    public set events(value: IEvent[]) {
        this._events = value || [];
    }

    public get itinerary(): IItineraryItem[] {
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
                    start,
                    message,
                    end,
                    endEstimated: true,
                    alertClass: 'alert-primary'
                };
            })
            .reduce((all, item) => {
                if (all.length < 1) {
                    return [item];
                }
                const previous = all[all.length - 1];

                const interimTime = item.start.diff(previous.end, 'minutes');

                let message: string;
                let alertClass: string;

                if (interimTime > 0) {
                    message = `${interimTime.toFixed(0)} minute break`;
                    alertClass = `alert-success`;
                } else {
                    message = `${Math.abs(interimTime).toFixed(0)} minute overlap`;
                    alertClass = `alert-danger`;
                }

                const interim = {
                    start: previous.end,
                    message,
                    end: item.start,
                    endEstimated: true,
                    startEstimated: true,
                    alertClass
                };

                return [...all, interim, item];
            }, new Array<IInteraryMoment>())
            .map(({start, message, end, startEstimated, endEstimated, alertClass}) => ({
                start: formatTime(start),
                end: formatTime(end),
                message,
                endEstimated,
                startEstimated,
                alertClass,
            }));
    }
}

function sortEvents(one: IEvent, two: IEvent): number {
    const oneTime = moment(one.eventDateTime).toDate().getTime();
    const twoTime = moment(two.eventDateTime).toDate().getTime();

    return oneTime - twoTime;
}
