import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


import  { LucideAngularModule, Home, Users, Box, Wrench, LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
@Component({
  selector: 'app-sidebar',
  imports: [ RouterLink, 
    CommonModule, 
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Home, Users, Box, Wrench })
    }
  ]
})
export class Sidebar {
  expanded = false;
  private hoverTimer: any = null;

  onMouseEnter() {
      this.clearTimer();
      this.hoverTimer = setTimeout(() => (this.expanded = true), 2000);
  }

  onMouseLeave() {
      this.clearTimer();
      this.expanded = false;
  }

  onFocus() {
      // optional: treat keyboard focus like hover (start timer)
      this.clearTimer();
      this.hoverTimer = setTimeout(() => (this.expanded = true), 2000);
  }

  onBlur() {
      this.clearTimer();
      this.expanded = false;
  }

  private clearTimer() {
      if (this.hoverTimer) {
          clearTimeout(this.hoverTimer);
          this.hoverTimer = null;
      }
  }
}
