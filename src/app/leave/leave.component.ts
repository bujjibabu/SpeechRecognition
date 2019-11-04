import { Component, OnInit, NgZone, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestApiService } from '../rest-api.service';
import { first } from 'rxjs/operators';
import { SpeechService } from '../speech.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

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
export class LeaveComponent implements OnInit, AfterViewInit {

  @ViewChild('reasonId', { static: false }) reasonId: ElementRef;
  @ViewChild('sdateId', { static: false }) sdateId: ElementRef;
  @ViewChild('edateId', { static: false }) edateId: ElementRef;

  sdate: any;
  edate: any;
  reason: any;
  leaveObj: any;
  leavesList: any;
  interim: any;
  resulttext: any;
  rec: any;
  displayedColumns: string[] = ['reason', 'startDate', 'endDate'];

  // tslint:disable-next-line: max-line-length
  constructor(private zone: NgZone, private router: Router, private http: HttpClient, private rest: RestApiService, private speech: SpeechService) { }

  ngOnInit() {
    this.leaveList();
    this.speech.readOutLoud('Now you are in apply leave page.');
    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.resulttext = '';
    this.rec.continuous = true;
    this.rec.lang = localStorage.getItem('language');
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 3;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onnomatch = (data) => {
      console.log('no match found please try again!');
      // this.readOutLoud('no match found please try again!');
    };

    this.rec.onend = (data) => {
      console.log('disconnected');
      // this.readOutLoud('disconnected!');
    };

    this.rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.zone.run(() => {

            this.resulttext = event.results[i][0].transcript;

            if (this.resulttext && this.resulttext.trim().toLowerCase().includes('home')) {
              this.router.navigate(['home']);
              this.resulttext = '';
            }

            if (this.resulttext && this.resulttext.trim().toLowerCase().includes('logout')) {
              this.router.navigate(['login']);
              this.resulttext = '';
            }


            if (!this.reason && this.resulttext) {
              this.reason = this.resulttext;
              this.sdateId.nativeElement.focus();
              this.speech.readOutLoud('Pleas enter start date.');
              this.resulttext = '';
              this.verify();
            } else if (!this.sdate && this.resulttext) {
              this.sdate = new Date(this.resulttext.trim());
              if (this.sdate == 'Invalid Date') {
                this.speech.readOutLoud('Pleas enter valid start date.');
                this.sdate = '';
                this.sdateId.nativeElement.focus();
              } else {
                const datePipe = new DatePipe('en-US');
                this.sdate = datePipe.transform(this.sdate, 'MM/dd/yyyy');
                this.edateId.nativeElement.focus();
                this.speech.readOutLoud('Pleas enter end date.');
              }
              this.resulttext = '';
              this.verify();
            } else if (!this.edate && this.resulttext) {
              this.edate = new Date(this.resulttext.trim());
              if (this.edate == 'Invalid Date') {
                this.speech.readOutLoud('Pleas enter valid end date.');
                this.edate = '';
                this.edateId.nativeElement.focus();
              } else {
                const datePipe = new DatePipe('en-US');
                this.edate = datePipe.transform(this.edate, 'MM/dd/yyyy');
              }
              this.resulttext = '';
              this.verify();
            }

            this.interim = '';
            if (this.reason && this.sdate && this.edate && this.resulttext) {
              if (this.resulttext.trim().toLowerCase() === 'yes' || this.resulttext.trim().toLowerCase() === 'submit') {
                this.submit();
              } else {
                this.reason = '';
                this.sdate = '';
                this.edate = '';
                this.reasonId.nativeElement.focus();
                this.speech.readOutLoud('please enter details again.');
              }
            }
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

  ngAfterViewInit() {
    setTimeout(function() {
      this.reasonId.nativeElement.focus();
    }.bind(this), 0);
    this.speech.readOutLoud('please enter reason for leave');
  }

  submit() {
    const obj = {
      user: this.rest.currentUserValue.username,
      reason: this.reason,
      dtStart: new Date(this.sdate),
      dtEnd: new Date(this.edate)
    };
    this.rest.applyLeave(obj).pipe(first())
      .subscribe(
        data => {
          this.speech.readOutLoud('your leave has been submitted successfully.');
          this.reason = '';
          this.sdate = '';
          this.edate = '';
          this.reasonId.nativeElement.focus();
          this.leaveList();
        },
        error => {
          this.reason = '';
          this.sdate = '';
          this.edate = '';
          this.reasonId.nativeElement.focus();
          this.speech.readOutLoud('some thing went wrong. please try again.');
          console.log('error');
        });
  }

  leaveList() {
    this.rest.getLeaveList().pipe(first())
      .subscribe(
        data => {
          this.leavesList = data;
          this.leavesList.sort(function (a, b) {
            return <any>new Date(a.startDate) - <any>new Date(b.startDate);
          });
          console.log('leave s', data);
        },
        error => {
          console.log('error');
        });
  }

  verify() {
    this.leaveObj = {
      reason: 'your reason ' + this.reason,
      sdate: 'your satrt date ' + this.sdate,
      edate: 'your end date ' + this.edate
    };
    if (this.reason && this.edate && this.sdate) {
      // tslint:disable-next-line: max-line-length
      const verifySentance = 'your reason is' + this.reason + '. your start date is' + this.sdate + '. your end date is' + this.edate + ' . do you want to submit your leave?';
      this.speech.readOutLoud(verifySentance);
    }
  }

}
