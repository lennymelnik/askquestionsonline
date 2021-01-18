import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommentService} from '../../services/comment.service';
import {LoadingController, NavController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
commentForm: FormGroup;
  constructor( private fb: FormBuilder , private commentServ:  CommentService, private navCtrl:  NavController,
               private loadCtrl: LoadingController , private  toastCtrl: ToastController) { }

  ngOnInit() {
  this.commentForm =   this.fb.group({
    topic: ['' , Validators.required],
    comment: ['' ,  Validators.required]
  });
  }
  async postQuestion(){
    const loading = await this.loadCtrl.create({
      message: 'loading....'
    });
    let toast  = await this.toastCtrl.create({
      duration: 3000,
      message: 'Question Posted'
    });
    await loading.present();
    this.commentServ.createComment(this.commentForm.value).then(  res => {
      loading.dismiss();
      toast.present();
      this.navCtrl.navigateRoot('/tabs/tabs/tab1');
      toast.dismiss();
    });
  }

}
