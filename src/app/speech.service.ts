import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  webcamImage;
  constructor() { }

  setWebcamImage(val) {
    this.webcamImage = val;
  }

  getWebcamImage() {
    return this.webcamImage;
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
    speech.lang = localStorage.getItem('language');
    window.speechSynthesis.speak(speech);
  }

}
