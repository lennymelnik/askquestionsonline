import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {from, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private afAuth: AngularFireAuth , private db: AngularFirestore , private http: HttpClient) { }



getData(){
  return   this.http.get('http://72.89.33.99:88/questions' );
}
    postUser(event){
        let par = {
            name: event.name,
            password:  event.password
        };
        return  this.http.post('http://72.89.33.99:88/register' , par ).toPromise().then( data => {
            console.log(data);
        });
    }

    poslogin(event){
        let info = {
            email: event.email,
            password:  event.password
        };
        return  this.http.post('http://72.89.33.99:88/login' , info ).toPromise().then( data => {
            console.log(data);
        });
    }






    //  signUp(credentials){
   //      /// return the result of the angular fire auth
   //      // return a promise with the data that is return
   //      return this.afAuth.createUserWithEmailAndPassword(credentials.email , credentials.password).then(data => {
   //          console.log(data);
   //          /// here we are creating a new dataset with the unique uid of the user
   //          /// the set is to set a new collection with whatever we want to store to the user
   //          return this.db.doc(`users/${data.user.uid}`).set({
   //              name: credentials.name,
   //              campus : credentials.campus,
   //              email: credentials.email,
   //              major: credentials.major,
   //              year: credentials.year
   //
   //          });
   //      });
   //
   //  }
   //
   //  signIn(credentials): Observable<any>{
   //      /// from transform a promise into a observable
   //      return from(this.afAuth.signInWithEmailAndPassword(credentials.email, credentials.password)).pipe(
   //          switchMap(userLog => {
   //              if ( userLog ){
   //                  return this.db.doc(`users/${userLog.user.uid}`).valueChanges();
   //              }else{
   //                  return of(null);
   //              }
   //          })
   //      );
   //
   // }
   //
   // getAllComments(){
   //      return  this.db.collection('comments').valueChanges({ idField: 'id'});
   // }
}
