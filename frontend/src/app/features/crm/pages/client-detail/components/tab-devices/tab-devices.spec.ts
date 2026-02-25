import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabDevices } from './tab-devices';

describe('TabDevices', () => {
  let component: TabDevices;
  let fixture: ComponentFixture<TabDevices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabDevices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabDevices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
