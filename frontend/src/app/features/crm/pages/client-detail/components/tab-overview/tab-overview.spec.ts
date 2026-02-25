import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabOverview } from './tab-overview';

describe('TabOverview', () => {
  let component: TabOverview;
  let fixture: ComponentFixture<TabOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
