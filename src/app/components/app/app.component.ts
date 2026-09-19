import { Component, ChangeDetectionStrategy } from '@angular/core';
import packageJson from '../../../../package.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent {

    /** Sets the browser title to include the current application version. */
    constructor() {
        document.title = `Cineworld Planner ${packageJson.version}`;
    }

}
