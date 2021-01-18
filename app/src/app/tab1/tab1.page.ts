import {Component, ViewChild} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AuthService} from '../services/auth.service';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DetailPage} from '../modal/detail/detail.page';
import {Route, Router} from '@angular/router';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private authService: AuthService , private http: HttpClient    ,private  RouterLink: Router) {
  }

DataAll: any = [];


  ionViewWillEnter(){
     this.authService.getData().subscribe( data => {
       console.log(data);
       this.DataAll =  data;
       console.log(this.DataAll);
     });

  }
//   ui(p){
//     this.detail.user(p);
// this.RouterLink.
//
//   }
}

