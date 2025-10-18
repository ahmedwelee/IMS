import {
  Component,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import {LoadingService} from "../service/loading.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-spinner',
  template: `<div class="preloader" *ngIf="isSpinnerVisible">
        <div class="spinner">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
    </div>`,
  encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnDestroy {
  public isSpinnerVisible = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private loadingService: LoadingService, private router: Router) {
    // Subscribe to HTTP loading
    this.subscriptions.add(
      this.loadingService.loading$.subscribe(isLoading => {
        this.isSpinnerVisible = isLoading;
      })
    );

    // Subscribe to router events
    this.subscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.loadingService.show();
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          this.loadingService.hide();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.isSpinnerVisible = false;
  }
}
