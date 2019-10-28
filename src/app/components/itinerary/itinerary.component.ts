import { Component, Input } from '@angular/core';
import { IItineraryItem } from 'src/app/contracts/contracts';

@Component({
  selector: 'itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss']
})
export class ItineraryComponent {

    @Input()
    public itinerary: IItineraryItem[] = [];

}
