import { Component } from '@angular/core';
import { asset } from 'src/app/asset';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  asset = asset;
}
