import { Component } from '@angular/core';
import { CineworldService, ICinema } from '../../services/cineworld.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cinema-list',
  templateUrl: './cinema-list.component.html',
  styleUrls: ['./cinema-list.component.scss']
})
export class CinemaListComponent {

    constructor(
        private cineworldService: CineworldService,
        private router: Router,
        ) {
        this.loadCinemaList();
    }

    public get cinemaList() {
        return this._cinemaList;
    }

    private _cinemaList: ICinema[] | undefined;

    public selectCinema(cinema: ICinema) {
        this.router.navigate(['/cinema/', cinema.externalCode]);
    }

    private loadCinemaList() {
        this.cineworldService.getCinemaListAsync().subscribe(list => this._cinemaList = list);
    }

}
