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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component.tabs = [
      { label: 'Tab 1', content: 'Content 1' as any },
      { label: 'Tab 2', content: 'Content 2' as any },
    ];
    component.ngOnInit();
    expect(component.activeTabContent as unknown as string).toBe('Content 1');
  });

  it('should change activeTabContent when onTabChange is called', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component.tabs = [
      { label: 'Tab 1', content: 'Content 1' as any },
      { label: 'Tab 2', content: 'Content 2' as any },
    ];
    component.onTabChange(1);
    expect(component.activeTabContent as unknown as string).toBe('Content 2');
  });
});
