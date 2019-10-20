import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import moment from 'moment';
import { IDay } from 'src/app/contracts/contracts';

@Component({
    selector: 'date-selector',
    templateUrl: './date-selector.component.html'
})
export class DateSelectorComponent implements OnInit {

    constructor() {
        this._days = this.generateDates();
    }

    @Output()
    public selectedDate = new EventEmitter<IDay>();

    private _selectedDate: IDay | undefined;

    private _days: IDay[];

    public get days(): IDay[] {
        return this._days;
    }

    public selectDate(day: IDay) {
        this._selectedDate = day;

        this.selectedDate.emit(day);
    }

    public isActive(day: IDay) {
        return this._selectedDate != null && day.date === this._selectedDate.date;
    }

    public ngOnInit(): void {
        this.selectDate(this.days[0]);
    }

    private generateDates(): IDay[] {
        const now = new Date(moment.now());
        return Array.from({length: 7})
            .map((_, index) => {
                const date = moment(now).add(index, 'days');

                let description: string;

                switch (index) {
                    case 0:
                        description = 'Today';
                        break;
                    case 1:
                        description = 'Tomorrow';
                        break;
                    default:
                        description = date.format('ddd');
                }

                return {
                    description,
                    date: date.format('YYYY-MM-DD')
                };
            });
    }

}
