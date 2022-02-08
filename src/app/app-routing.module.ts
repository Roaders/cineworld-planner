import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CinemaComponent } from './components/cinema/cinema.component';
import { CinemaListComponent } from './components/cinema-list/cinema-list.component';

const routes: Routes = [
    { path: 'cinemaList', component: CinemaListComponent },
    { path: 'cinema/:externalCode', component: CinemaComponent },
    { path: 'cinema/:externalCode/:selectedDate', component: CinemaComponent },
    { path: '',   redirectTo: '/cinemaList', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
