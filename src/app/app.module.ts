import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DemoMaterialModule } from './material-module';
import { MatNativeDateModule } from '@angular/material/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RestApiService } from './rest-api.service';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AgendaComponent } from './agenda/agenda.component';
import { LeaveComponent } from './leave/leave.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AgendaComponent,
    LeaveComponent
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
    AppRoutingModule
  ],
  providers: [RestApiService],
  bootstrap: [AppComponent]
})

export class AppModule { }
