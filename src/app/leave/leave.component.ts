import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RestApiService } from '../rest-api.service';
import { first } from 'rxjs/operators';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition }: IWindow = <IWindow>window;

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  @ViewChild('mySelect', { static: false }) mySelect: any;
  noteTextarea: any = '';
  options: FormGroup;
  sdate: any;
  edate: any;
  reason: any;
  type: any;
  leaveObj: any;
  leavesList: any;

  agendaDetails: any;
  matIcon = 'mic_off';
  rec: any;
  displayedColumns: string[] = ['reason', 'startDate', 'endDate'];

  constructor(private zone: NgZone, fb: FormBuilder, private http: HttpClient, private rest: RestApiService) {
    this.options = fb.group({});
  }

  ngOnInit() {
    this.rec = new webkitSpeechRecognition();
    this.rec.continuous = false;
    this.rec.lang = 'en-US';
    this.rec.interimResults = true;
    this.leaveList();
    this.rec.onerror = (event) => {
      console.log('error!');
    };

  }

  startDateRecognition() {
    this.record().subscribe((value) => {
      this.sdate = value;
      this.rec.stop();
      console.log(value);
    },
      (err) => {
        this.rec.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.rec.start();
  }

  endDateRecognition() {
    this.record().subscribe((value) => {
      this.edate = value;
      this.rec.stop();
      console.log(value);
    },
      (err) => {
        this.rec.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.rec.start();
  }

  reasonStartRecognition() {
    this.record().subscribe((value) => {
      this.reason = value;
      this.rec.stop();
      console.log(value);
    },
      (err) => {
        this.rec.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.rec.start();
  }

  typeStartRecognition() {
    this.record().subscribe((value) => {
      this.type = value;
      this.mySelect.close();
      this.rec.stop();
      console.log(value);
    },
      (err) => {
        this.rec.stop();
        console.log(err);
        if (err.error === 'no-speech') {
          console.log('--restatring service--');
        }
      },
      () => {
        console.log('--complete--');
      });
    this.rec.start();
  }

  submit() {
    this.rec.stop();
    let obj = {
      "user": this.rest.currentUserValue.username,
      "reason": this.reason,
      "dtStart": new Date(this.sdate),
      "dtEnd": new Date(this.edate)
    };
    this.rest.applyLeave(obj).pipe(first())
      .subscribe(
        data => {
          this.leaveList();
        },
        error => {
          console.log('error');
        });
  }

  leaveList() {
    this.rest.getLeaveList().pipe(first())
      .subscribe(
        data => {
          this.leavesList = data;
          console.log('leave s', data);
        },
        error => {
          console.log('error');
        });
  }

  verify() {
    this.rec.stop();
    this.leaveObj = {
      reason: 'your reason ' + this.reason,
      sdate: 'your satrt date ' + this.sdate,
      edate: 'your end date ' + this.edate
    };

    let verifySentance = 'your reason is' + this.reason + '. your start date is' + this.sdate + '. your end date is' + this.edate;
    this.readOutLoud(verifySentance);
  }

  record(): Observable<string> {
    return Observable.create(observer => {
      this.rec.onresult = event => {
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
}
