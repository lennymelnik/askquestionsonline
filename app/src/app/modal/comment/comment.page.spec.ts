import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CommentPage } from './comment.page';

describe('CommentPage', () => {
  let component: CommentPage;
  let fixture: ComponentFixture<CommentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
