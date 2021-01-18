import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import firebase from 'firebase';
import auth = firebase.auth;
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor( private db:  AngularFirestore ) { }

  createComment(question){
    question.creator =  auth().currentUser.uid;
    return  this.db.collection('comments').add(question);
  }
}
