import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class RestApiService {
  agendaUrl: string;
  demo: boolean = false;

  // Define API
  constructor(private http: HttpClient) {
    if(this.demo) {
      this.agendaUrl = 'https://my-json-server.typicode.com/bujjibabu/demo/agenda';
    } else {
       this.agendaUrl = 'http://rest-eduario.localhost.topicus.nl:8080/eduario/rest/v1/afspraak';
    }
  }

  // HttpClient API get() method => Fetch agenda list
  getAgenda(): Observable<any> {
    return this.http.get<any>(this.agendaUrl)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Error handling
  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
