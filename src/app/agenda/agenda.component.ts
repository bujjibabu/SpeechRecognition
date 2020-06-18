import { Component, OnInit, NgZone, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpeechService } from '../speech.service';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition }: IWindow = window as IWindow;

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})

export class AgendaComponent implements OnInit {

  formObj = {
    name: '',
    colour: '',
    width: '',
    height: ''
  };

  field: any;
  interim: any;
  resulttext: any;
  rec: any;
  updatefieldval: boolean;
  language = 'en-US';
  webCamImage: any;

  constructor(private zone: NgZone,
    private router: Router,
    // tslint:disable-next-line: variable-name
    private _snackBar: MatSnackBar,
    private elementRef: ElementRef,
    private ss: SpeechService) { }

  ngOnInit() {

    this.webCamImage = this.ss.getWebcamImage();
    // this.getAgendaDetails();
    this.formObj = {
      name: 'Lotus',
      colour: 'pink',
      width: '300',
      height: '300'
    };
    this.readOutLoud('Now you are in image details page. below are the image details');
    // tslint:disable-next-line: max-line-length
    const details = 'name is  ' + this.formObj.name + ' colour is  ' + this.formObj.colour + ' width is  ' + this.formObj.width + ' height is  ' + this.formObj.height + '. do you want to edit the details or submit?';
    this.readOutLoud(details);

    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.rec.continuous = true;
    this.rec.lang = this.language;
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 1;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    // tslint:disable-next-line: only-arrow-functions
    this.rec.onnomatch = function () {
      console.log('no match found please try again!');
    };

    // tslint:disable-next-line: only-arrow-functions
    this.rec.onend = function () {
      console.log('disconnected');
    };

    this.rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.zone.run(() => {
            const resultText = event.results[i][0].transcript;
            if (resultText && resultText.trim().toLowerCase().includes('submit')) {
              this.submit();
            }
            if (resultText && resultText.trim().toLowerCase().includes('edit')) {
              this.editDetails();
            }

            if (this.updatefieldval && resultText) {
              this.formObj[this.field] = resultText;
              this.updatefieldval = false;
              this.readOutLoud('do you want to edit any other details or submit ?');
            }

            const formFields = ['colour', 'name', 'width', 'height'];
            formFields.forEach(element => {
              if (resultText && resultText.trim().toLowerCase().includes(element)) {
                console.log(element, 'element');
                this.editFiled(element);
              }
            });

          });
        } else {
          this.interim = '';
          console.log('inbterm', event.results[i][0].transcript);
          this.interim = event.results[i][0].transcript;
        }
      }
    };

    this.rec.start();
  }

  /** edit  details */
  editDetails() {
    this.readOutLoud('which field you want to edit?');
  }

  editFiled(field) {
    console.log('field', field);
    this.field = field;
    const ele = this.elementRef.nativeElement.querySelector('#' + field);
    ele.focus();
    this.formObj[field] = '';
    ele.value = '';
    this.readOutLoud('please enter' + field);
    this.updatefieldval = true;
  }

  /** submit form */
  submit() {
    this._snackBar.open('Details have been submitted successfully!', 'X', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.formObj = {
      name: '',
      colour: '',
      width: '',
      height: ''
    };
    this.readOutLoud('Details have been submitted successfully!');
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
