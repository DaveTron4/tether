import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientIdentityCard } from './client-identity-card';

describe('ClientIdentityCard', () => {
  let component: ClientIdentityCard;
  let fixture: ComponentFixture<ClientIdentityCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientIdentityCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientIdentityCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
