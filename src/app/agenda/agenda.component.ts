import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RestApiService } from '../rest-api.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
const { webkitSpeechRecognition }: IWindow = <IWindow>window;

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})

export class AgendaComponent implements OnInit {
  @ViewChild('txtArea', { static: false }) txtArea: ElementRef;

  options: FormGroup;
  agendaDetails: any;
  rec: any;
  interim = '';
  text = '';
  language = 'en-US';
  date: any;
  time: any;
  subject: any;
  subjects = ['physics', 'social', 'science', 'maths'];
  questions = [];

  constructor(private zone: NgZone, fb: FormBuilder, private http: HttpClient, private rest: RestApiService, private router: Router) {
    this.options = fb.group({});
  }

  getAgendaDetails() {
    this.rest.getAgenda().pipe(first()).subscribe(
      data => {
        this.agendaDetails = data;
        console.log('success');
      },
      error => {
        console.log('error');
      });
  }

  ngOnInit() {
    this.getAgendaDetails();
    this.readOutLoud('Now you are in Agenda Search page. Let us know if you would like to know your Agenda.');
    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.text = '';
    this.rec.continuous = true;
    this.rec.lang = this.language;
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 1;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onnomatch = function() {
      console.log('no match found please try again!');
     };

     this.rec.onend = function() {
       console.log('disconnected');
     };

    this.rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.zone.run(() => {
            this.text = event.results[i][0].transcript;
            if (this.text && this.text.trim().toLowerCase() === 'yes') {
              this.readOutLoud('Please enter date time and subject');
              this.txtArea.nativeElement.focus();
            }
            this.interim = '';
            if (this.text && this.text.trim().toLowerCase() !== 'yes') {
              this.formatText(this.text);
            }
            if (this.text && this.text.trim().toLowerCase().includes('home')) {
              this.router.navigate(['home']);
            }
            if (this.text && this.text.trim().toLowerCase().includes('logout')) {
              this.router.navigate(['login']);
              this.text = '';
            }
            this.text = '';

          });
        } else {
          this.interim = '';
          console.log('inbterm', event.results[i][0].transcript)
          this.interim = event.results[i][0].transcript;
        }
        //console.log(event.results[i][0].transcript);
      }
    };

    this.rec.start();
  }

  outputResult(txt) {
    const datePipe = new DatePipe('en-US');

    if (this.time && this.date) {
      let dtFlag = false;
      this.agendaDetails.filter((item) => {
        const dt = datePipe.transform(item.dateTimeStart, 'dd/MM/yyyy');
        const tm = datePipe.transform(item.dateTimeStart, 'hh:mm');
        if (this.date === dt && this.time === tm) {
          const qText = 'you have ' + item.titel + ' class on ' + dt + ' at ' + tm;
          this.questions.push(qText);
          this.readOutLoud(qText);
          dtFlag = true;
          this.date = "";
          this.time = "";
        }
      })

      if (!dtFlag) {
        let qText = "you don't have any class on " + this.date + " at " + this.time + ". Please enter another date and time.";
        this.questions.push(qText);
        this.readOutLoud(qText);
        this.date = "";
        this.time = "";
      }
    }

    if (this.time && this.subject) {
      let tsFlag = false;
      this.agendaDetails.filter((item) => {
        let dt = datePipe.transform(item.dateTimeStart, 'dd/MM/yyyy');
        let tm = datePipe.transform(item.dateTimeStart, 'hh:mm');
        let sub = item.titel.toLowerCase();
        if (this.subject === sub && this.time === tm) {
          let qText = "you have " + item.titel + " class on " + dt + " at " + tm;
          this.questions.push(qText);
          this.readOutLoud(qText);
          tsFlag = true;
          this.subject = "";
          this.time = "";
        }
      })

      if (!tsFlag) {
        let qText = "you don't have any " + this.subject + " class in this week at " + this.time + ". Please enter another subject and time.";
        this.questions.push(qText);
        this.readOutLoud(qText);
        this.subject = "";
        this.time = "";
      }
    }

    if (this.date && this.subject) {
      let dsFlag = false;
      this.agendaDetails.filter((item) => {
        let dt = datePipe.transform(item.dateTimeStart, 'dd/MM/yyyy');
        let tm = datePipe.transform(item.dateTimeStart, 'hh:mm');
        let sub = item.titel.toLowerCase();
        if (this.date === dt && this.subject === sub) {
          let qText = "you have " + item.titel + " class on " + dt + " at " + tm;
          this.questions.push(qText);
          this.readOutLoud(qText);
          dsFlag = true;
          this.date = "";
          this.subject = "";
        }
      })

      if (!dsFlag) {
        let qText = "you don't have any " + this.subject + " class on " + this.date + ". Please enter another subject and date.";
        this.questions.push(qText);
        this.readOutLoud(qText);
        this.date = "";
        this.subject = "";
      }
    }
  }

  formatText(txt) {
    const noSpacesTxt = txt.replace(/ +/g, "");
    if (!this.time) {
      this.time = this.getTime(noSpacesTxt);
    }
    if (!this.date) {
      this.date = this.getDate(noSpacesTxt);
    }
    if (!this.subject) {
      this.subject = this.getSubject(noSpacesTxt);
    }

    this.questions.push(txt);
    if (this.time && !this.date && !this.subject) {
      this.questions.push('Please enter date or subject');
      this.readOutLoud('Please enter date or subject');
    } else if (!this.time && this.date && !this.subject) {
      this.questions.push('Please enter time or subject');
      this.readOutLoud('Please enter time or subject');
    } else if (!this.time && !this.date && this.subject) {
      this.questions.push('Please enter time or date');
      this.readOutLoud('Please enter time or date');
    }

    this.outputResult(txt);

  }

  getSubject(txt) {
    let sub;
    this.subjects.filter(item => {
      if (txt.toLowerCase().includes(item)) {
        sub = item;
      }
    });
    return sub;
  }

  getTime(d) {
    // tslint:disable-next-line: one-variable-per-declaration
    let hh, min;
    const result = d.match("[0-9]{2}([\:])[0-9]{2}");
    if (null != result) {
      const dateSplitted = result[0].split(result[1]);
      hh = dateSplitted[0];
      min = dateSplitted[1];
    }
    if (hh && min) {
      return hh + ':' + min;
    } else {
      return;
    }

  }

  getDate(d) {
    // tslint:disable-next-line: one-variable-per-declaration
    let day, month, year;

    let result = d.match("[0-9]{2}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{4}");
    if (null != result) {
      const dateSplitted = result[0].split(result[1]);
      day = dateSplitted[0];
      month = dateSplitted[1];
      year = dateSplitted[2];
    }
    result = d.match("[0-9]{4}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{2}");
    if (null != result) {
      const dateSplitted = result[0].split(result[1]);
      day = dateSplitted[2];
      month = dateSplitted[1];
      year = dateSplitted[0];
    }

    if (month > 12) {
      const aux = day;
      day = month;
      month = aux;
    }
    if (day && month && year) {
      return day + '/' + month + '/' + year;
    } else {
      return;
    }

  }
  /*-----------------------------
          Speech Synthesis
  ------------------------------*/
  readOutLoud(message) {
    console.log('readOutLoud', message);
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  }
}
