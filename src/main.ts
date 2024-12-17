import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './app/environments/environments';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { CommonModule } from '@angular/common';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Configuración del enrutamiento
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Inicializar Firebase
    provideAuth(() => getAuth()), // Proveer autenticación de Firebase
    provideFirestore(() => getFirestore()), // Proveer Firestore de Firebase
    provideHttpClient(), // Proveer cliente HTTP
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, // Interceptor para manejar la autenticación
      multi: true, // Permitir múltiples interceptores
    },
    CommonModule // Importar CommonModule para directivas comunes como ngIf, ngFor, etc.
  ]
}).catch((err) => console.error('Error al inicializar la aplicación:', err));
