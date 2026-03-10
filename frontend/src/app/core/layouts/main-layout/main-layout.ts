import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Import shared components
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Header } from '../../../shared/components/header/header';
import { Footer } from '../../../shared/components/footer/footer';
import { PlanService } from '../../services/plan';


@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Header, Footer, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  private planService = inject(PlanService);

  ngOnInit() {
    this.planService.loadPlan();
  }
}
