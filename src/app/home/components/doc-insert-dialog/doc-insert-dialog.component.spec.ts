import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocInsertDialogComponent } from './doc-insert-dialog.component';

describe('DocInsertDialogComponent', () => {
  let component: DocInsertDialogComponent;
  let fixture: ComponentFixture<DocInsertDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocInsertDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocInsertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
