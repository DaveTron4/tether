import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { AuthService } from '../../../core/services/auth';
import { PlanService } from '../../../core/services/plan';

@Component({
  selector: 'app-header',
  imports: [CommonModule ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  dropdownOpen = false;
  planService = inject(PlanService);

  constructor(public authService: AuthService, private el: ElementRef) {}

  get initialLetters(): string {
    const fullName = this.authService.getAuthenticatedUser()?.fullName || '';
    return fullName ? fullName.slice(0, 2).toUpperCase() : 'NA';
  }

  get fullName(): string {
    const user = this.authService.getAuthenticatedUser();
    return user?.fullName || 'Guest';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target) && this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(event?: Event) {
    if (event) event.stopPropagation();
    this.authService.logout();
  }
}
