import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  constructor(private  authService: AuthService) { }
  DataAll: any = [];
  user: any = [];
  ngOnInit() {

    // this.authService.getData().subscribe( data => {
    //   console.log(data);
    //   this.DataAll =  data;
    //   console.log(this.DataAll);
    // });
  }
  getUSerInf(da){
    this.user = da;
    console.log(da)
  }

}
