import { IEvent } from 'src/contracts/contracts';

export interface IInteraryBase {
    startEstimated?: boolean;
    endEstimated?: boolean;
    alertClass: string;
    body: string | IEvent;
}

export interface IItineraryItem extends IInteraryBase {
    start: string;
    end: string;
}
