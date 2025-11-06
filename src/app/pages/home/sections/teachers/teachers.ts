import { Component } from '@angular/core';
import { asset } from 'src/app/asset';

@Component({
  selector: 'app-teachers',
  imports: [],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers {
  asset = asset;
}
