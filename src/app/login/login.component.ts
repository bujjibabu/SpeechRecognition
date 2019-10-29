import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestApiService } from '../rest-api.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  constructor(private router: Router, private rest: RestApiService) { }

  ngOnInit() {
  }

  // login() {
  //   if(this.username == 'admin' && this.password == 'admin') {
  //    this.router.navigate(["agenda"]);
  //   }else {
  //     alert("Invalid credentials");
  //   }
  // }

  login() {
    //temp
    this.router.navigate(["agenda"]);
    this.rest.login(this.username, this.password)
      .pipe(first())
      .subscribe(
        data => {
          console.log('success');
        },
        error => {
          console.log('error');
        });
    }

}
