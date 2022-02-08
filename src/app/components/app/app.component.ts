import { Component } from '@angular/core';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

    constructor() {
        document.title = `Cineworld Planner ${packageJson.version}`;
    }

}
