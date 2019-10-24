import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import moment from 'moment';
import { IDay } from 'src/contracts/contracts';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'date-selector',
    templateUrl: './date-selector.component.html'
})
export class DateSelectorComponent implements OnInit {

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        ) {
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

        const cinema = this.activatedRoute.snapshot.params.externalCode;

        if (cinema == null) {
            return;
        }

        this.router.navigate(['/cinema/', cinema, day.date]);
    }

    public isActive(day: IDay) {
        return this._selectedDate != null && day.date === this._selectedDate.date;
    }

    public ngOnInit(): void {
        const dateFromRoute: string | undefined = this.activatedRoute.snapshot.params.selectedDate;
        let selectedDay = this.days.filter(day => day.date === dateFromRoute)[0];

        if (selectedDay == null) {
            selectedDay = this._days[0];
        }

        this.selectDate(selectedDay);
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
