import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from './shared/components/sidebar/sidebar';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, Footer],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
