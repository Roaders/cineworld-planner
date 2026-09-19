import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IDay } from 'src/contracts/contracts';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'date-selector',
    templateUrl: './date-selector.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
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
        const now = new Date(Date.now());
        return Array.from({length: 7})
            .map((_, index) => {
                const date = new Date(now);
                date.setDate(now.getDate() + index);

                const description = index === 0 ? 'Today' : formatWeekday(date);

                return {
                    description,
                    date: formatDate(date)
                };
            });
    }

}

function formatDate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatWeekday(date: Date): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}
