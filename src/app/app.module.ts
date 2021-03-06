import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DemoMaterialModule } from './material-module';
import { MatNativeDateModule } from '@angular/material/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RestApiService, Globals } from './rest-api.service';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AgendaComponent } from './agenda/agenda.component';
import { LeaveComponent } from './leave/leave.component';
import { InterceptorService } from './interceptor.service';
import { HomeComponent } from './home/home.component';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AgendaComponent,
    LeaveComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    DemoMaterialModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    HttpClientModule,
    AppRoutingModule,
    WebcamModule
  ],
  providers: [RestApiService, Globals, { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }],
  bootstrap: [AppComponent]
})

export class AppModule { }
