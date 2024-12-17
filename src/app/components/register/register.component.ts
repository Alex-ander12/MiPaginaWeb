import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private auth: Auth ,private router: Router) {}

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        console.log('User registered successfully:', userCredential.user);
        this.router.navigate(['/profileView']);

      })
      .catch(error => {
        console.error('Error registering user:', error.message);
      });
  }
}
