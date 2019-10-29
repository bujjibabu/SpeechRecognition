import { Component, OnInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const {webkitSpeechRecognition} : IWindow = <IWindow>window;

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})

export class AgendaComponent implements OnInit  {
  options: FormGroup;
  agendaDetails: any;
  matIcon = 'mic_off';
  rec: any;
  interim = '';
  final = '';

  constructor(private zone: NgZone, fb: FormBuilder, private http: HttpClient) {
    this.options = fb.group({});
  }

  getAgendaDetails() {
    this.http.get('https://my-json-server.typicode.com/bujjibabu/demo/agenda').subscribe((data) => {
      if(data) {
        this.agendaDetails = data['items'];
        console.log(this.agendaDetails);
      }
    });
  }

  ngOnInit() {
    this.getAgendaDetails();

    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.final = '';
    this.rec.continuous = false;
    this.rec.lang = 'en-US';
    this.rec.interimResults = true;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onresult =  (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
        this.zone.run(() => {
          // this.final = this.final.concat(event.results[i][0].transcript);
          this.final = event.results[i][0].transcript;
          this.matIcon = 'mic_off';
          // clearing interim
          this.interim = '';
          this.rec.stop();
          console.log(event.results[i][0].transcript);
        });
        } else {
          this.interim = '';
          this.interim = event.results[i][0].transcript;
        }
      }
    };

  }

  /*-----------------------------
          Speech Synthesis
  ------------------------------*/
  readOutLoud(message) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  }

   // New implementation
    startVoice() {
      this.rec.start();
      this.matIcon = 'mic';
    }

}

/* pushQuestion() {
      this.recognition.stop();
      this.qText = this.inputText;
      // need to do our own NLP.
      if(this.qText.includes("subject")) {
        let str = this.qText.split("subject ");
        this.obj.subject = str[1];
      }

      this.inputText = "";
      for(let i=0; i < this.agendaDetails.length; i++) {
        if(this.agendaDetails[i].titel == this.obj.subject) {
          let dt = "October 24th 2019 at 11AM";
          this.qText = "you have " +this.agendaDetails[i].titel+ " class on " + dt;
          this.readOutLoud(this.qText);
          }
      }
    } */
