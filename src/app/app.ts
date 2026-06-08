import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Footer } from './shared/footer/footer';
import { Nav } from './shared/nav/nav';
import { SeoService, SeoData } from './seo.service';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Nav, Footer],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return { url: event.urlAfterRedirects, snapshot: route.snapshot };
        })
      )
      .subscribe(({ url, snapshot }) => {
        const data = (snapshot.data ?? {}) as SeoData;
        const title = (snapshot.title as string | undefined) ?? data.title;

        this.seo.update({ ...data, title });
        this.trackPageView(url, title);
      });
  }

  private trackPageView(url: string, title?: string): void {
    window.gtag?.('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: title,
    });
  }
}
