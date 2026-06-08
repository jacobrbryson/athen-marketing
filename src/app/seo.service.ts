import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';

export interface SeoData {
  /** Full <title> for the page. Falls back to the site default. */
  title?: string;
  /** Meta description / og:description / twitter:description. */
  description?: string;
  /** Absolute or asset-relative social share image. Falls back to the default. */
  image?: string;
  /** Open Graph type, e.g. 'website' or 'article'. */
  type?: string;
  /** Route path (without leading slash) used to build the canonical/og:url. */
  path?: string;
  /** When true, the page is excluded from search engines. */
  noindex?: boolean;
}

const SITE_NAME = 'Athena';
const DEFAULT_TITLE = 'Athena | AI Companion';
const DEFAULT_DESCRIPTION =
  'Athena is the AI learning companion built to be taught by your child. Kids teach the AI what they know to cement knowledge, build confidence, and reach true mastery.';
const DEFAULT_IMAGE = `${environment.assetBase}kid-preview.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc = inject(DOCUMENT);

  update(data: SeoData = {}): void {
    const title = data.title ?? DEFAULT_TITLE;
    const description = data.description ?? DEFAULT_DESCRIPTION;
    const url = this.absoluteUrl(data.path);
    const image = this.absoluteImage(data.image);
    const type = data.type ?? 'website';

    this.title.setTitle(title);
    this.setName('description', description);
    this.setRobots(data.noindex);

    // Open Graph
    this.setProperty('og:title', title);
    this.setProperty('og:description', description);
    this.setProperty('og:type', type);
    this.setProperty('og:url', url);
    this.setProperty('og:image', image);
    this.setProperty('og:site_name', SITE_NAME);

    // Twitter
    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', title);
    this.setName('twitter:description', description);
    this.setName('twitter:image', image);

    this.setCanonical(url);
  }

  private absoluteUrl(path?: string): string {
    const base = environment.siteUrl.replace(/\/$/, '');
    if (!path) {
      return base;
    }
    return `${base}/${path.replace(/^\//, '')}`;
  }

  private absoluteImage(image?: string): string {
    if (!image) {
      return DEFAULT_IMAGE;
    }
    return /^https?:\/\//.test(image) ? image : `${environment.assetBase}${image}`;
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setRobots(noindex?: boolean): void {
    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
