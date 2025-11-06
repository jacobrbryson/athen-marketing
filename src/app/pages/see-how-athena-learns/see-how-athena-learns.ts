import { Component } from '@angular/core';
import { asset } from 'src/app/asset';

@Component({
  selector: 'app-see-how-athena-learns',
  imports: [],
  templateUrl: './see-how-athena-learns.html',
  styleUrl: './see-how-athena-learns.css',
})
export class SeeHowAthenaLearns {
  asset = asset;
}
