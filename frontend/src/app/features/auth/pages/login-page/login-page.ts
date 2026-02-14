import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPage {
  constructor(private authService: AuthService) {}
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username: username!, password: password! }).subscribe({
        next: () => {
          // Login successful, navigation is handled by the AuthService
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
