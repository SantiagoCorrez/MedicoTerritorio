import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDoctoresComponent } from './components/admin-doctores/admin-doctores.component';

export const routes: Routes = [
    {component:AdminDoctoresComponent,path:'adminDoctores'},
    {component:LoginComponent,path:'login'}
];
