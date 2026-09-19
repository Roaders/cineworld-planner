import { Component, Input, ChangeDetectionStrategy, DoCheck } from '@angular/core';
import { IEvent, IFilm } from 'src/contracts/contracts';
import { differenceInMinutes, getStartDate, formatTime, getEndDate, getEventFilmName } from 'src/app/helper/event-helper';
import { IInteraryBase, IItineraryItem } from 'src/app/contracts/contracts';

interface IInteraryDate extends IInteraryBase {
    start: Date;
    end: Date;
}

@Component({
    selector: 'itinerary-list',
    templateUrl: './itinerary-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ItineraryListComponent implements DoCheck {
    private itinerariesDirty = false;

    private _allEvents: IEvent[] = [];

    @Input()
    public get allEvents(): IEvent[] {
        return this._allEvents;
    }

    public set allEvents(value: IEvent[]) {
        value = value || [];
        if (arraysEqual(value, this._allEvents)) {
            return;
        }

        this._allEvents = value;
        this.itinerariesDirty = true;
    }

    private _selectedFilms: IFilm[] = [];

    @Input()
    public get selectedFilms(): IFilm[] {
        return this._selectedFilms;
    }

    public set selectedFilms(value: IFilm[]) {
        value = value || [];
        if (arraysEqual(value, this._selectedFilms)) {
            return;
        }

        this._selectedFilms = value;
        this.itinerariesDirty = true;
    }

    private _trailerAllowance = 0;

    @Input()
    public get trailerAllowance(): number {
        return this._trailerAllowance;
    }

    public set trailerAllowance(value: number) {
        if (value === this._trailerAllowance) {
            return;
        }

        this._trailerAllowance = value;
        this.itinerariesDirty = true;
    }

    private _maxBreakLength = 0;

    @Input()
    public set maxBreakLength(value: number) {
        if (value === this._maxBreakLength) {
            return;
        }

        this._maxBreakLength = value;
        this.itinerariesDirty = true;
    }

    private _selectedEvents: IEvent[] = [];

    @Input()
    public get selectedEvents(): IEvent[] {
        return this._selectedEvents;
    }

    public set selectedEvents(value: IEvent[]) {
        value = value || [];
        if (arraysEqual(value, this._selectedEvents)) {
            return;
        }

        this._selectedEvents = value;
        this.itinerariesDirty = true;
    }

    private _itineraryList: IItineraryItem[][] = [];

    public get itineraryList(): IItineraryItem[][] {
        return this._itineraryList;
    }

    private _itinerary: IItineraryItem[] = [];

    public get itinerary(): IItineraryItem[] {
        return this._itinerary;
    }

    public ngDoCheck(): void {
        if (!this.itinerariesDirty) {
            return;
        }

        this.updateItineraries();
        this.itinerariesDirty = false;
    }

    public getStartTime(itinerary: IItineraryItem[]): string {
        return itinerary[0].start;
    }

    private createItinerary(events: IEvent[]): IItineraryItem[] {
        return [...events]
            .sort(sortEvents)
            .map(event => this.createDateItinerary(event))
            .reduce((all, item) => this.addNextEvent(all, item), new Array<IInteraryDate>())
            .map(({start, body, end, startEstimated, isEvent, endEstimated, alertClass}) => ({
                start: formatTime(start),
                end: formatTime(end),
                body,
                endEstimated,
                startEstimated,
                alertClass,
                isEvent
            }));
    }

    private updateItineraries(): void {
        this._itinerary = this.createItinerary(this.selectedEvents);
        this._itineraryList = this.generateEventLists()
            .map(eventList => this.createItinerary(eventList));
    }

    private addNextEvent(all: IInteraryDate[], item: IInteraryDate): IInteraryDate[] {
        if (all.length < 1) {
            return [item];
        }

        const previous = all[all.length - 1];

        const interimTime = differenceInMinutes(item.start, previous.end);

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
            body: message,
            end: item.start,
            endEstimated: true,
            startEstimated: true,
            alertClass,
            isEvent: false
        };

        return [...all, interim, item];
    }

    private createDateItinerary(event: IEvent): IInteraryDate {
        const start = getStartDate(event);
        const message = getEventFilmName(event, this.selectedFilms);
        const end = getEndDate(event, this.trailerAllowance, this.selectedFilms);

        if (start == null || end == null || message == null) {
            throw Error(`Could not generate itinerary. start: ${start}, end: ${end} message: ${message}`);
        }

        return {
            start,
            body: event,
            end,
            endEstimated: true,
            alertClass: 'alert-primary',
            isEvent: true,
        };
    }

    private generateEventLists() {
        return this._allEvents.reduce(
                (itineraries, event) => [...itineraries, ...this.pickNextEvent([event])],
                new Array<IEvent[]>()
            )
            .filter(itinerary => itinerary.length > 1);
    }

    private pickNextEvent(events: IEvent[]): IEvent[][] {
        const lastEvent = events[events.length - 1];
        const lastEventEnd = getEndDate(lastEvent, this.trailerAllowance, this.selectedFilms);

        if (lastEventEnd == null ) {
            throw Error(`Could not generate itinerary. `);
        }

        const subsequentEvents = this.allEvents
            .filter(event => {
                const eventStart = getStartDate(event);
                return events.every(existingEvent => existingEvent.filmId !== event.filmId) &&
                    eventStart > lastEventEnd &&
                    differenceInMinutes(eventStart, lastEventEnd) < this._maxBreakLength;
            });

        if (subsequentEvents.length === 0) {
            return [events];
        }

        return subsequentEvents.map(event => [...events, event])
            .reduce((itineraries, itinerary) => [...itineraries, ...this.pickNextEvent(itinerary)], new Array<IEvent[]>());
    }
}


function sortEvents(one: IEvent, two: IEvent): number {
    const oneTime = getStartDate(one).getTime();
    const twoTime = getStartDate(two).getTime();

    return oneTime - twoTime;
}

function arraysEqual<T>(one: T[], two: T[]): boolean {
    return one.length === two.length && one.every((item, index) => item === two[index]);
}
