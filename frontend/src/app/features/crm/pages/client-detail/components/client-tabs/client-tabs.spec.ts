import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTabs } from './client-tabs';

describe('ClientTabs', () => {
  let component: ClientTabs;
  let fixture: ComponentFixture<ClientTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
