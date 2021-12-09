import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SKOSService {

  constructor(
    private http: HttpClient,
  ) { }

  async getLinkStructure() {
    const nodes = [];
    let skos = await this.http.get<any>('https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/new_lrt/index.json').toPromise();
    this.transform(skos.hasTopConcept, nodes);
    //skos = await this.http.get<any>('https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/learningResourceType/index.json').toPromise();
    //this.transform(skos.hasTopConcept, nodes);
    skos = await this.http.get<any>('https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/widgets/index.json').toPromise();
    this.transform(skos.hasTopConcept, nodes);
    console.log(nodes);

    const links = this.buildLinks(nodes);
    console.log(links);
    return {
      nodes: nodes,
      links: links
    };
  }
  buildLinks(nodes: any[]) {
    const links = [];
    nodes.forEach(element => {
    if(element.id.includes('new_lrt') && element.skos.relatedMatch) {
      console.log(element);
      element.skos.relatedMatch.forEach((target: any) => {
        // const target = nodes.filter((n) => n.id === related)[0];
        links.push({
            id: 'Link' + Math.random().toString().replace('.',''),
            source: element.id,
            target: target.id,
            label: 'Related match'
        })
      });
    }
  });
  return links;
  }

  transform(skos: any[], flat: any[], parent: any[] = []) {
    console.log(skos);
    skos.forEach(element => {
      if(element.narrower) {
        const parentCopy = parent.slice();
        parentCopy.push(element);
        this.transform(element.narrower, flat, parentCopy);
      }
      let path = parent.map((p) => p.prefLabel.de).join(' -> ');
      if(path) {
        // path += ' -> ';
      }
      flat.push({
        id: element.id,
        label: element.prefLabel.de,
        path: path,
        skos: element
      });
    });

  }
}
