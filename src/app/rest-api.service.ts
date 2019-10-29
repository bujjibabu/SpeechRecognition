import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class RestApiService {
  private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

  agendaUrl: string;
  loginUrl: string;
  demo: boolean = false;

  // Define API
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();

    if(this.demo) {
      this.agendaUrl = 'https://my-json-server.typicode.com/bujjibabu/demo/agenda';
    } else {
       this.agendaUrl = 'http://rest-eduario.localhost.topicus.nl:8080/eduario/rest/v1/afspraak';
    }
    this.loginUrl = 'xyz';
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>(this.loginUrl, { username, password })
        .pipe(map(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
        }));
  }

  // applyLeave(title: string, password: string) {
  //   return this.http.post<any>(this.loginUrl, { username, password })
  //       .pipe(map(user => {
  //           // store user details and jwt token in local storage to keep user logged in between page refreshes
  //           localStorage.setItem('currentUser', JSON.stringify(user));
  //           this.currentUserSubject.next(user);
  //           return user;
  //       }));
  // }

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
