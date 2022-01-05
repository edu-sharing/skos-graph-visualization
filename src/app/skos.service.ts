import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SKOSService {
  static SUPPORTED_LINKS = [
    {
      id: 'exactMatch',
      label: 'Exact Match',
    },
    {
      id: 'relatedMatch',
      label: 'Related Match',
    },
    {
      id: 'closeMatch',
      label: 'Close Match',
    },
    {
      id: 'broadMatch',
      label: 'Broad Match',
    },

  ];
  constructor(private http: HttpClient) {}
  async fetchSKOS(url: string) {
    const skos = await this.http.get<any>(url).toPromise();
    const nodes = [];
    this.transform(skos.title.de, skos.hasTopConcept, nodes);
    return nodes;
  }
  async getLinkStructure(url: string, config: { link: string; hideEmpty: boolean; vocabId: string }) {
    const nodes = await this.fetchSKOS(
      url
    );
    // skos = await this.http.get<any>('https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/learningResourceType/index.json').toPromise();
    // this.transform(skos.hasTopConcept, nodes);

    return await this.buildLinks(nodes, config);
  }
  async buildLinks(nodes: any[], config: { link: string; hideEmpty: boolean; vocabId: string }) {
    let links = [];
    const urls = new Set<string>();
    nodes.forEach((element) => {
      SKOSService.SUPPORTED_LINKS.filter(
        (l) => config.link ? config.link === l.id : true
      ).forEach((link) => {
        if (element.skos[link.id]) {
          element.skos[link.id].forEach((target: any) => {
            // const target = nodes.filter((n) => n.id === related)[0];
            links.push({
              id: 'Link' + Math.random().toString().replace('.', ''),
              source: element.id,
              target: target.id,
              label: link.label,
            });
            const targetUrl = target.id.split('/');
            targetUrl[targetUrl.length - 1] = 'index.json';
            urls.add(targetUrl.join('/'));
          });
        }
      });
    });
    for (const url of urls) {
      nodes = nodes.concat(await this.fetchSKOS(url));
    }
    links.forEach(l => {
      if (!nodes.find(n => n.id === l.target)) {
        console.error('Invalid link target found', l);
        links.splice(links.indexOf(l), 1);
      }
    });
    if (config.vocabId) {
      nodes = nodes.filter((n) =>
        n.id.toLowerCase().includes(config.vocabId.toLowerCase()) ||
        links.some((l) => (l.source === n.id) && l.target.toLowerCase().includes(config.vocabId.toLowerCase()))
      );
      links = links.filter(l =>
        nodes.find(n => (n.id === l.source)) &&
        nodes.find(n => (n.id === l.target))
      );
    }
    if (config.hideEmpty) {
      nodes = nodes.filter((n) =>
        links.some((l) => l.source === n.id || l.target === n.id)
      );
    }
    return {
      nodes,
      links
    };
  }

  transform(title: string, skos: any[], flat: any[], parent: any[] = []) {
    skos.forEach((element) => {
      if (element.narrower) {
        const parentCopy = parent.slice();
        parentCopy.push(element);
        this.transform(title, element.narrower, flat, parentCopy);
      }
      const path = parent.map((p) => p.prefLabel.de);
      path.splice(0, 0, title);
      if (path) {
        // path += ' -> ';
      }
      flat.push({
        id: element.id,
        label: element.prefLabel.de,
        path: path.join(' -> '),
        skos: element,
      });
    });
  }
}
