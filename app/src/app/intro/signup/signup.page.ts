import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import validate = WebAssembly.validate;
import {AuthService} from '../../services/auth.service';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {HttpClient, HttpRequest} from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  registerForm: FormGroup;


  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private  alertCtrl: AlertController,
              private route: Router, private http: HttpClient) {
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      year: ['', Validators.required],
      major: ['', Validators.required],
      campus: ['', Validators.required]

    });
  }


  register() {
      this.authService.postUser(this.registerForm.value).then( data => {
        this.route.navigateByUrl('/tabs/tabs/tab1');
        console.log(data)
      });

  }
}




//
//   async register() {
//     /// this cretates a new loading controller
//     const loading = await this.loadCtrl.create({
//       message: 'Loading...'
//     });
//
//     await loading.present();
//     this.authService.signUp(this.registerForm.value).then(async res => {
//       await loading.dismiss();
//       this.route.navigateByUrl('/tabs/tabs/tab1');
//       /// creating  a new toast
//       let toast = await this.toastCtrl.create({
//         duration: 3000,
//         message: 'Succesfully created new acount'
//       });
//       toast.present();
//       this.route.navigateByUrl('/main/tab/tabs/tab1');
//
//     }, async err => {
//       loading.dismiss();
//       let alert = await this.alertCtrl.create({
//         header: 'Error',
//         message: err.message,
//         buttons: ['Ok']
//       });
//       alert.present();
//     });
//   }
// }



