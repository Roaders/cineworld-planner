import { Component } from '@angular/core';
import { CineworldService, ICinema } from '../../services/cineworld.service';

@Component({
  selector: 'cinema-list',
  templateUrl: './cinema-list.component.html',
  styleUrls: ['./cinema-list.component.scss']
})
export class CinemaListComponent {

    constructor(private cineworldService: CineworldService) {
        this.loadCinemaList();
    }

    public get cinemaList() {
        return this._cinemaList;
    }

    private _cinemaList: ICinema[];

    public selectCinema(cinema: ICinema){
        console.log(`cinema selected: ${cinema.name}`);
    }

    private loadCinemaList() {
        this.cineworldService.getCinemaListAsync().subscribe(list => this._cinemaList = list);
    }

}
