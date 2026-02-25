import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabFinancials } from './tab-financials';

describe('TabFinancials', () => {
  let component: TabFinancials;
  let fixture: ComponentFixture<TabFinancials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabFinancials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabFinancials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
