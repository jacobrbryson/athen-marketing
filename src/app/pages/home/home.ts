import { Component } from '@angular/core';
import { Headline } from './sections/headline/headline';
import { Kids } from './sections/kids/kids';
import { Parents } from './sections/parents/parents';
import { Teachers } from './sections/teachers/teachers';

@Component({
  selector: 'app-home',
  imports: [Teachers, Parents, Kids, Headline],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
