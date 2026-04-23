import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { GenericTabComponent } from './generic-tab.component';
import { TranslateModule } from '@ngx-translate/core';

describe('GenericTabComponent', () => {
  let component: GenericTabComponent;
  let fixture: ComponentFixture<GenericTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GenericTabComponent,
        MatTabsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the first tab content', () => {
    component.tabs = [
      { label: 'Tab 1', content: 'Content 1' },
      { label: 'Tab 2', content: 'Content 2' },
    ];
    component.ngOnInit();
    expect(component.activeTabContent).toBe('Content 1');
  });

  it('should change activeTabContent when onTabChange is called', () => {
    component.tabs = [
      { label: 'Tab 1', content: 'Content 1' },
      { label: 'Tab 2', content: 'Content 2' },
    ];
    component.onTabChange(1);
    expect(component.activeTabContent).toBe('Content 2');
  });
});
