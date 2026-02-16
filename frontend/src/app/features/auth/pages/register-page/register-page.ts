import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  constructor(private authService: Auth) {}
  registerForm = new FormGroup({
    email: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl('')
  });


  onSubmit() {
    if (this.registerForm.valid) {
      const { email, username, password } = this.registerForm.value;
      this.authService.register({ email: email!, username: username!, password: password! }).subscribe({
        next: () => {
          // Registration successful, navigation is handled by the Auth service
          this.authService.isLoggedIn() ? this.authService.logout() : null;
        },
        error: (err) => {
          console.error('Registration failed:', err);
          alert('Registration failed. Please try again.');
        }
      });
    } else {
      alert('Please fill in all fields.');
    }
  }
}
