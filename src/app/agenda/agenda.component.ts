import { Component, OnInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

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
  text1 = '';
  language = 'en-US';
  date: any;
  time: any;
  subject: any;
  subjects = ['physics','social', 'science', 'maths'];
  questions = [];

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
    this.text1 = '';
    this.rec.continuous = false;
    this.rec.lang = this.language;
    this.rec.interimResults = true;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onresult =  (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
        this.zone.run(() => {
          // this.text1 = this.text1.concat(event.results[i][0].transcript);
          this.text1 = event.results[i][0].transcript;
          this.matIcon = 'mic_off';
          // clearing interim
          this.interim = '';
          this.rec.stop();
          this.formatText(this.text1);
          this.text1 = '';
          console.log(event.results[i][0].transcript);
        });
        } else {
          this.interim = '';
          this.interim = event.results[i][0].transcript;
        }
      }
    };
  }

  outputResult(txt) {
    let datePipe = new DatePipe('en-US');

    if (this.time && this.date) {
      this.agendaDetails.filter((item) => {
        let dt = datePipe.transform(item.beginDatumTijd, 'dd/MM/yyyy');
        let tm = datePipe.transform(item.beginDatumTijd, 'hh:mm');
        if(this.date === dt && this.time === tm) {
          let qText = "you have " + item.titel + " class on " + dt + " at " + tm;
          this.questions.push(qText);
          this.readOutLoud(qText);
        }
      })
    }

    if (this.time && this.subject) {
      this.agendaDetails.filter((item) => {
        let dt = datePipe.transform(item.beginDatumTijd, 'dd/MM/yyyy');
        let tm = datePipe.transform(item.beginDatumTijd, 'hh:mm');
        let sub = item.titel.toLowerCase();
        if(this.subject === sub && this.time === tm) {
          let qText = "you have " + item.titel + " class on " + dt + " at " + tm;
          this.questions.push(qText);
          this.readOutLoud(qText);
        }
      })
    }

    if (this.date && this.subject) {
      this.agendaDetails.filter((item) => {
        let dt = datePipe.transform(item.beginDatumTijd, 'dd/MM/yyyy');
        let tm = datePipe.transform(item.beginDatumTijd, 'hh:mm');
        let sub = item.titel.toLowerCase();
        if(this.date === dt && this.subject === sub) {
          let qText = "you have " + item.titel + " class on " + dt + " at " + tm;
          this.questions.push(qText);
          this.readOutLoud(qText);
        }
      })
    }
   }

  formatText(txt) {
    const noSpacesTxt = txt.replace(/ +/g, "");
    if(!this.time) {
      this.time = this.getTime(noSpacesTxt);
    }
    if(!this.date) {
      this.date = this.getDate(noSpacesTxt);
     }
     if(!this.subject) {
      this.subject = this.getSubject(noSpacesTxt);
     }

    this.questions.push(txt);
    if (this.time && !this.date && !this.subject)  {
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
      if(hh && min) {
        return hh+':'+min;
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
        if(null != result) {
            const  dateSplitted = result[0].split(result[1]);
            day = dateSplitted[2];
            month = dateSplitted[1];
            year = dateSplitted[0];
        }

        if ( month > 12) {
            const aux = day;
            day = month;
            month = aux;
        }
        if(day && month && year) {
          return day+'/'+month+'/'+year;
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
