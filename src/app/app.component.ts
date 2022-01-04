import { Component, OnInit } from '@angular/core';
import { SKOSService } from './skos.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly SUPPORTED_LINKS = SKOSService.SUPPORTED_LINKS;
  title = 'graph';
  readonly window = window;
  data: any;
  url = 'https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/new_lrt/index.json';
  link = '';
  hideEmpty = false;
  constructor(
    private skos: SKOSService
  ) {
  }
  async ngOnInit() {

  }

  async loadSKOS() {
    this.data = await this.skos.getLinkStructure(this.url, {
      link: this.link,
      hideEmpty: this.hideEmpty,
    });
  }
}
