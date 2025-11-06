import { Component } from '@angular/core';
import { asset } from 'src/app/asset';

@Component({
  selector: 'app-parents',
  imports: [],
  templateUrl: './parents.html',
  styleUrl: './parents.css',
})
export class Parents {
  asset = asset;
}
