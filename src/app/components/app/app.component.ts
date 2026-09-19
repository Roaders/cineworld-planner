import { Component, ChangeDetectionStrategy } from '@angular/core';
import packageJson from '../../../../package.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent {

    constructor() {
        document.title = `Cineworld Planner ${packageJson.version}`;
    }

}
