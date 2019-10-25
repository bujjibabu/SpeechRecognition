import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare let window;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit  {
  @ViewChild('mySelect', {static: false}) mySelect: any;
  speechRecognition: any;
  recognition: any;
  noSupport = false;
  noteTextarea: any = '';
  notes: any;
  options: FormGroup;
  title: any;
  reason: any;
  type: any;
  leaveObj: any;
  verifySentance: any;
  language = 'en-US';
  inputText: any = "";
  qText: any = "";
  agendaDetails: any;
  obj: any;

  constructor(private zone: NgZone, fb: FormBuilder, private http: HttpClient) {
    this.options = fb.group({});
    this.notes = [];
    try {
      this.speechRecognition = window.SpeechRecognition || window['webkitSpeechRecognition'];
      this.recognition = new this.speechRecognition();
    } catch (e) {
      console.error(e);
      this.noSupport = true;
    }

    this.obj = {
      date: '',
      time: '',
      subject: ''
    };
  }

  getAgendaDetails() {
    this.http.get('https://my-json-server.typicode.com/bujjibabu/demo/agenda').subscribe((data) => {
      if(data) {
        this.agendaDetails = data.items;
        console.log(this.agendaDetails);
      }
    });
  }

  ngOnInit() {
    this.getAgendaDetails();
    /*-----------------------------
          Voice Recognition
    ------------------------------*/

    // If false, the recording will stop after a few seconds of silence.
    // When true, the silence period is longer (about 15 seconds),
    // allowing us to keep recording even when the user pauses.
    this.recognition.continuous = true;
    this.recognition.lang = 'nl-nl';
    // This block is called every time the Speech APi captures a line.

    this.recognition.onstart = function () {
      // instructions.text('Voice recognition activated. Try speaking into the microphone.');
    }

    this.recognition.onspeechend = function () {
      // instructions.text('You were quiet for a while so voice recognition turned itself off.');
    }

    this.recognition.onerror = function (event) {
      if (event.error == 'no-speech') {
        // instructions.text('No speech was detected. Try again.');
      };
    }
  }

  titleStartRecognition() {
    this.record().subscribe((value) => {
      this.title = value;
      this.recognition.stop();
      console.log(value);
    },
      (err) => {
        this.recognition.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.recognition.start();
  }

  reasonStartRecognition() {
    this.record().subscribe((value) => {
      this.reason = value;
      this.recognition.stop();
      console.log(value);
    },
      (err) => {
        this.recognition.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.recognition.start();
  }

  typeStartRecognition() {
    this.record().subscribe((value) => {
      this.type = value;
      this.mySelect.close();
      this.recognition.stop();
      console.log(value);
    },
      (err) => {
        this.recognition.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.recognition.start();
  }

  submit() {
    this.recognition.stop();
    // need to do Http call
    console.log(this.leaveObj);
  }

  verify() {
    this.recognition.stop();
    this.leaveObj = {
      title: 'your title ' + this.title,
      reason: 'your reason ' + this.reason,
      type: 'your type ' + this.type
    };

    this.verifySentance = 'your title ' + this.title  + '  your reason ' + this.reason + 'your type ' + this.type;
    this.readOutLoud(this.verifySentance);
    console.log(this.leaveObj);
  }

  record(): Observable<string> {
    return Observable.create(observer => {
      this.recognition.onresult = event => {
        let term: string = "";
        let current = event.resultIndex;
        // Get a transcript of what was said.
        let transcript = event.results[current][0].transcript;
        // Add the current transcript to the contents of our Note.
        // There is a weird bug on mobile, where everything is repeated twice.
        // There is no official solution so far so we have to handle an edge case.
        let mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
        if (!mobileRepeatBug) {
          this.noteTextarea = transcript;
          term = this.noteTextarea;
        }
        this.zone.run(() => {
          observer.next(term);
        });
      };
    });
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

  startListening() {
      this.record().subscribe(
        //listener
        (value) => {
          this.inputText = value;

          console.log(value);
        },
        //errror
        (err) => {
          console.log(err);
          if (err.error == "no-speech") {
            console.log("--restatring service--");
          }
        },
        //completion
        () => {
          console.log("--complete--");
        });
      this.recognition.start();
    }

    pushQuestion() {
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
    }

}
