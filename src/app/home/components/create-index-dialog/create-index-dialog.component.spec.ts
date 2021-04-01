import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIndexDialogComponent } from './create-index-dialog.component';

describe('CreateIndexDialogComponent', () => {
  let component: CreateIndexDialogComponent;
  let fixture: ComponentFixture<CreateIndexDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateIndexDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIndexDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
