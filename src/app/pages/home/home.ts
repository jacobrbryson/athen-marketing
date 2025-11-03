import { Component } from '@angular/core';
import { Kids } from '../kids/kids';
import { Parents } from '../parents/parents';
import { Teachers } from '../teachers/teachers';
import { Headline } from './sections/headline/headline';

@Component({
  selector: 'app-home',
  imports: [Teachers, Parents, Kids, Headline],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
