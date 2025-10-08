import { Component } from '@angular/core';
import {LoadingService} from "../../service/loading.service";


@Component({
  selector: 'app-loading-spinner',
  template: `
    <div *ngIf="loadingService.loading$ | async" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
