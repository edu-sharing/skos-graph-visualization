import { Component, OnInit } from '@angular/core';
import { SKOSService } from './skos.service';
import {ActivatedRoute, Params, Route, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {skip} from 'rxjs/operators';

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
  queryParams: Params = {
    url: '',
    link: '',
    vocabId: '',
    hideEmpty: false
  };
  form: FormGroup;
  constructor(
    private skos: SKOSService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      url: ['', Validators.required],
      link: [''],
      vocabId: [''],
      hideEmpty: [false],
    });
    this.form.valueChanges.pipe(skip(1)).subscribe((v) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParamsHandling: 'merge',
        queryParams: v
      });
    });
    this.route.queryParams.subscribe((q) => {
      q = JSON.parse(JSON.stringify(q));
      q.url = q.url ?? 'https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/new_lrt/index.json';
      q.hideEmpty = q.hideEmpty === 'true';
      this.queryParams = q;
      this.form.patchValue(q);
    });
  }
  async ngOnInit() {

  }

  async loadSKOS() {
    this.data = await this.skos.getLinkStructure(this.queryParams.url, {
      link: this.queryParams.link,
      vocabId: this.queryParams.vocabId,
      hideEmpty: this.queryParams.hideEmpty,
    });
  }
}
