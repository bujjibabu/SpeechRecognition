import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { RestApiService, Globals } from '../rest-api.service';
import { first } from 'rxjs/operators';
import { SpeechService } from '../speech.service';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition }: IWindow = window as IWindow;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  @ViewChild('userName', { static: false }) userName: ElementRef;
  @ViewChild('pwd', { static: false }) pwd: ElementRef;

  username: string;
  password: string;
  mic = 'mic_off';
  rec: any;
  interim = '';
  resulttext = '';
  language = 'en-US';
  mobile = false;

  // tslint:disable-next-line: max-line-length
  constructor(private router: Router, private rest: RestApiService, private speech: SpeechService, private zone: NgZone, public globals: Globals) { }

  selectLanguage(lang) {
    this.language = lang;
    localStorage.setItem('language', this.language);
  }

  ngOnInit() {
    console.log(this.globals);
    localStorage.setItem('language', this.language);
    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.resulttext = '';
    this.rec.continuous = true;
    this.rec.lang = this.language;

    if (typeof window.orientation !== 'undefined') {
      this.mobile = true;
    }

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onresult = (event) => {
      //  for (let i = event.resultIndex; i < event.results.length; i++) {
      const last = event.results.length - 1;
      if (event.results[last].isFinal) {
        this.zone.run(() => {
          this.resulttext = event.results[last][0].transcript;
          if (!this.username) {
            this.username = this.resulttext;
            this.pwd.nativeElement.focus();
            this.speech.readOutLoud('Pleas enter Password.');
            this.resulttext = '';
          } else if (!this.password) {
            this.password = this.resulttext;
            // tslint:disable-next-line: max-line-length
            const verifyCredentials = 'you have entered user name as ' + this.username + ' and password as ' + this.password + '. do you want to continue to login?';
            this.speech.readOutLoud(verifyCredentials);
            this.resulttext = '';
          }

          this.interim = '';
          if (this.username && this.password && this.resulttext) {
            if (this.resulttext.trim().toLowerCase() === 'yes') {
              this.login();
            } else {
              this.username = '';
              this.password = '';
              this.userName.nativeElement.focus();
              this.speech.readOutLoud('please enter username and password');
            }
          }
          console.log(event.results[last][0].transcript);
        });
      } else {
        this.interim = '';
        this.interim = event.results[last][0].transcript;
      }
      // }
    };

  }

  voiceStart() {
    if (this.mic === 'mic_off') {
      this.mic = 'mic';
      this.speech.readOutLoud('speech enabled.');
      this.userName.nativeElement.focus();
      this.speech.readOutLoud('Pleas enter username.');
      // Start speech recog
      this.rec.start();
    } else {
      this.mic = 'mic_off';
      this.speech.readOutLoud('speech disabled.');
    }
  }

  login() {
    this.username = this.username.replace(/ +/g, '');
    this.password = this.password.replace(/ +/g, '');

    if (this.globals.pwaDemo && this.username === 'demo' && this.password === 'demo') {
      this.router.navigate(['home']);
    }

    if (this.globals.pwaDemo) {
      if (this.username === 'demo' && this.password === 'demo') {
        this.router.navigate(['home']);
      } else {
        this.username = '';
        this.password = '';
        this.userName.nativeElement.focus();
        this.speech.readOutLoud('username or password is invalid. please enter the valid credentials');
      }
    } else {
      this.rest.login(this.username, this.password)
        .pipe(first())
        .subscribe(
          data => {
            this.rec.stop();
            this.router.navigate(['home']);
            console.log('success');
          },
          error => {
            this.username = '';
            this.password = '';
            this.userName.nativeElement.focus();
            this.speech.readOutLoud('username or password is invalid. please enter the valid credentials');
          });
    }
  }

}
