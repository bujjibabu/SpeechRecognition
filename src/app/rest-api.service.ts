import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})


export class Globals {
  pwaDemo:boolean = true;
}

export class RestApiService {
  private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

  agendaUrl: string;
  loginUrl: string;
  leaveUrl: string;
  leavesListUrl: string;
  demo: boolean = false;

  // Define API
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();

    if(this.demo) {
      this.agendaUrl = 'https://my-json-server.typicode.com/bujjibabu/demo/agenda';
    } else {
       this.agendaUrl = 'http://192.168.27.35:8085/afspraak/afsprakenVoorDeelnemer?deelnemer=';
       this.loginUrl = 'http://192.168.27.35:8085/auth/signin';
       this.leaveUrl = "http://192.168.27.35:8085/applyLeave";
       this.leavesListUrl = 'http://192.168.27.35:8085/getLeaveRequsetsOfUser?username='
    }

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

  applyLeave(obj) {
    return this.http.post<any>(this.leaveUrl, obj)
      .pipe(retry(1),
        catchError(this.handleError)
      );
  }

  getLeaveList(): Observable<any> {
    return this.http.get<any>(this.leavesListUrl + this.currentUserSubject.value.username)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }


  // HttpClient API get() method => Fetch agenda list
  getAgenda(): Observable<any> {
    let username;
    if(this.currentUserSubject.value) {
      username = this.currentUserSubject.value.username;
    }
    return this.http.get<any>(this.agendaUrl + username)
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
