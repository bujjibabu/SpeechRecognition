import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SpeechService } from '../speech.service';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const {webkitSpeechRecognition} : IWindow = <IWindow>window;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  rec: any;
  interim = '';
  input = '';
  language = 'en-US';

  constructor(private zone: NgZone, private router: Router, private ss: SpeechService) { }

  ngOnInit() {
    this.ss.readOutLoud("Now you are in Home page. Would you like to search your Agenda or apply for Leave.");

    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.rec.continuous = true;
    this.rec.lang = this.language;
    this.rec.interimResults = true;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onresult =  (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
        this.zone.run(() => {
          this.input = event.results[i][0].transcript;
          this.getText(this.input);
          // clearing interim
          this.interim = '';
         // this.rec.stop();
          if (this.input && this.input.trim().toLowerCase().includes('logout')) {
            this.router.navigate(['login']);
            this.input = '';
          }
          this.input = '';
          console.log(event.results[i][0].transcript);
        });
        } else {
          this.interim = '';
          this.interim = event.results[i][0].transcript;
        }
      }
    };
    this.rec.start();
  }

  getText(txt) {
    txt = txt.replace(/ +/g, '');
    if (txt && txt.toLowerCase().includes('agenda')) {
      this.router.navigate(['agenda']);
    } else if (txt && txt.toLowerCase().includes('leave')) {
      this.router.navigate(['leave']);
    }
  }

  navigate(url) {
    this.router.navigate([url]);
  }

}
