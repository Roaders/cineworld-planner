import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeSelectorComponent } from './attribute-selector.component';
import { PreferencesService } from 'src/app/services/preferences.service';
import { FormsModule } from '@angular/forms';

describe('AttributeSelectorComponent', () => {
    let component: AttributeSelectorComponent;
    let fixture: ComponentFixture<AttributeSelectorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [PreferencesService],
            declarations: [AttributeSelectorComponent],
            imports: [FormsModule]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributeSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
