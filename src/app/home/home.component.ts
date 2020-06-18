import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SpeechService } from '../speech.service';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

declare let window;

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

const { webkitSpeechRecognition }: IWindow = window as IWindow;

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


  // toggle webcam on/off
  public showWebcam = false;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();



  constructor(private zone: NgZone, private router: Router, private ss: SpeechService) { }

  ngOnInit() {


    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });


    this.ss.readOutLoud('Now you are in Home page. Would you like to upload image.');

    this.rec = new webkitSpeechRecognition();
    this.interim = '';
    this.rec.continuous = true;
    this.rec.lang = this.language;
    this.rec.interimResults = true;

    this.rec.onerror = (event) => {
      console.log('error!');
    };

    this.rec.onresult = (event) => {
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


  public triggerSnapshot() {
    this.trigger.next();
  }

  public toggleWebcam() {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError) {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string) {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    // console.info('received webcam image', webcamImage);
    this.ss.setWebcamImage(webcamImage.imageAsDataUrl);
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  getText(txt) {
    txt = txt.replace(/ +/g, '');
    if (txt && txt.toLowerCase().includes('yes')) {
      this.showWebcam = true;
      this.ss.readOutLoud('Do you want to capture image?.');
    }
    if (txt && txt.toLowerCase().includes('capture')) {
      this.triggerSnapshot();
      this.ss.readOutLoud('Do you want to upload to server?.');
    }
    if (txt && txt.toLowerCase().includes('upload')) {
      this.showWebcam = false;
      this.router.navigate(['agenda']);
      // this.ss.readOutLoud('Do you want to upload to server?.');
    }
  }

  navigate(url) {
    this.router.navigate([url]);
  }

}
