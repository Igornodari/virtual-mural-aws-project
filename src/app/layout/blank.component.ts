import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],})
export class BlankComponent {}
