import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { asset } from 'src/app/asset';

@Component({
  selector: 'app-kids',
  imports: [RouterLink],
  templateUrl: './kids.html',
  styleUrl: './kids.css',
})
export class Kids {
  asset = asset;
}
