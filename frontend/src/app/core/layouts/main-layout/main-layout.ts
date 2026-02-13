import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Import shared components
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Header } from '../../../shared/components/header/header';
import { Footer } from '../../../shared/components/footer/footer';


@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Header, Footer, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
