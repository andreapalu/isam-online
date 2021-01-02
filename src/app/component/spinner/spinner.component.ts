import {
  Component
} from '@angular/core';

@Component({
  template: `<div class="spinner"></div>`,
  styles: [
    `.spinner {
      border: 16px solid #f3f3f3; /* Light grey */
      border-top: 16px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 100px;
      height: 100px;
      margin: 100px auto;
      animation: spin 2s linear infinite;
    }`,
    `@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
      }
    }`
  ],
})
export class SpinnerComponent {

  constructor() { }

}