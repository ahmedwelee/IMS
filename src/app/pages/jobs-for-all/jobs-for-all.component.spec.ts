import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsForAllComponent } from './jobs-for-all.component';

describe('JobsForAllComponent', () => {
  let component: JobsForAllComponent;
  let fixture: ComponentFixture<JobsForAllComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobsForAllComponent]
    });
    fixture = TestBed.createComponent(JobsForAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
