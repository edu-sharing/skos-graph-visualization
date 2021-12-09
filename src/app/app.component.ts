import { Component, OnInit } from '@angular/core';
import { SKOSService } from './skos.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'graph';
  readonly window = window;
  data: any;
  constructor(
    private skos: SKOSService
  ) {
  }
  async ngOnInit() {
    this.data = await this.skos.getLinkStructure();
  }
}
