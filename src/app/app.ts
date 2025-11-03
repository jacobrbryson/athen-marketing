import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from './shared/footer/footer';
import { Nav } from './shared/nav/nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Nav, Footer],
  templateUrl: './app.html',
})
export class App {}
