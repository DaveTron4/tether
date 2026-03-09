import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StripeService } from '../../../../core/services/stripe';

@Component({
  selector: 'app-signup-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.css',
})
export class SignupPage implements OnInit {
  private route = inject(ActivatedRoute);
  private stripeService = inject(StripeService);

  planName = signal('');
  priceId = signal('');
  billing = signal('monthly');
  errorMessage = signal('');
  isLoading = signal(false);

  signupForm = new FormGroup({
    store_name: new FormControl('', Validators.required),
    subdomain: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)]),
    admin_username: new FormControl('', Validators.required),
    admin_email: new FormControl('', [Validators.required, Validators.email]),
    admin_password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.planName.set(params['plan'] || '');
      this.priceId.set(params['price_id'] || '');
      this.billing.set(params['billing'] || 'monthly');
    });

    // Auto-generate subdomain from store name
    this.signupForm.controls.store_name.valueChanges.subscribe(value => {
      if (value) {
        const subdomain = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        this.signupForm.controls.subdomain.setValue(subdomain, { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (!this.signupForm.valid) {
      this.errorMessage.set('Please fill in all fields correctly.');
      return;
    }

    if (!this.priceId()) {
      this.errorMessage.set('No plan selected. Please go back and choose a plan.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formVal = this.signupForm.value;

    this.stripeService.createCheckoutSession({
      store_name: formVal.store_name!,
      subdomain: formVal.subdomain!,
      admin_username: formVal.admin_username!,
      admin_email: formVal.admin_email!,
      admin_password: formVal.admin_password!,
      price_id: this.priceId(),
    }).subscribe({
      next: (res) => {
        // Redirect to Stripe Checkout
        window.location.href = res.checkout_url;
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'Something went wrong. Please try again.');
      },
    });
  }
}
