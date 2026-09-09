import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionFormModal } from './subscription-form-modal';

describe('SubscriptionFormModal', () => {
  let component: SubscriptionFormModal;
  let fixture: ComponentFixture<SubscriptionFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
