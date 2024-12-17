// app.routes.ts
import { Route } from '@angular/router';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';  // Asegúrate de que esta ruta esté bien configurada
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RedComponent } from './components/red/red.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventosAcademicosComponent } from './components/eventos-academicos/eventos-academicos.component';
import { GruposEstudioComponent } from './components/grupos-estudio/grupos-estudio.component';
import { MensajeriaComponent } from './components/mensajeria/mensajeria.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';

export const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'reset-password', component: ResetPasswordComponent }, 
  { path: 'login', component: LoginComponent },  
  { path: 'register', component: RegisterComponent },
  {path: 'home', component: DashboardComponent},
  {path: 'dashboard', component: RedComponent},
  {path: 'eventos-academicos', component: RedComponent},
  {path: 'grupos-estudio', component: GruposEstudioComponent},
  {path: 'profileView', component: ProfileViewComponent},
  {path: 'create-post', component: CreatePostComponent},
  

];
