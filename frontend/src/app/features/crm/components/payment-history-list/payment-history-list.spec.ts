import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryList } from './payment-history-list';

describe('PaymentHistoryList', () => {
  let component: PaymentHistoryList;
  let fixture: ComponentFixture<PaymentHistoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
