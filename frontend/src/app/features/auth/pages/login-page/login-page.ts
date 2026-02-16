import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Auth } from '../../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPage {
  constructor(private authService: Auth) {}
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username: username!, password: password! }).subscribe({
        next: () => {
          // Login successful, navigation is handled by the Auth
        },
        error: (err) => {
          console.error('Login failed:', err);
          alert('Login failed. Please check your credentials and try again.');
        }
      });
    } else {
      alert('Please fill in both fields.');
    }
  }
}
