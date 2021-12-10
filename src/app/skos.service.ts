import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SKOSService {
  static SUPPORTED_LINKS = [
    {
      id: "exactMatch",
      label: "Exact Match",
    },
    {
      id: "relatedMatch",
      label: "Related Match",
    },
  ];
  constructor(private http: HttpClient) {}
  async fetchSKOS(url: string) {
    let skos = await this.http.get<any>(url).toPromise();
    const nodes = [];
    this.transform(skos.title.de, skos.hasTopConcept, nodes);
    return nodes;
  }
  async getLinkStructure(url: string) {
    const nodes = await this.fetchSKOS(
      url
    );
    //skos = await this.http.get<any>('https://vocabs.openeduhub.de/w3id.org/openeduhub/vocabs/learningResourceType/index.json').toPromise();
    //this.transform(skos.hasTopConcept, nodes);

    return await this.buildLinks(nodes);
  }
  async buildLinks(nodes: any[]) {
    const links = [];
    const urls = new Set<string>();
    nodes.forEach((element) => {
      SKOSService.SUPPORTED_LINKS.forEach((link) => {
        if (element.skos[link.id]) {
          element.skos[link.id].forEach((target: any) => {
            // const target = nodes.filter((n) => n.id === related)[0];
            links.push({
              id: "Link" + Math.random().toString().replace(".", ""),
              source: element.id,
              target: target.id,
              label: link.label,
            });
            const targetUrl = target.id.split("/");
            targetUrl[targetUrl.length - 1] = "index.json";
            urls.add(targetUrl.join('/'));
          });
        }
      });
    });
    console.log(urls);
    console.log(links);
    for (const url of urls) {
      nodes = nodes.concat(await this.fetchSKOS(url));
    }
    links.forEach(l => {
      if(!nodes.find(n => n.id === l.target)) {
        console.error('Invalid link target found', l);
        links.splice(links.indexOf(l), 1);
      }
    });
    console.log(nodes);
    return {
      nodes,
      links
    };
  }

  transform(title: string, skos: any[], flat: any[], parent: any[] = []) {
    console.log(skos);
    skos.forEach((element) => {
      if (element.narrower) {
        const parentCopy = parent.slice();
        parentCopy.push(element);
        this.transform(title, element.narrower, flat, parentCopy);
      }
      let path = parent.map((p) => p.prefLabel.de);
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
