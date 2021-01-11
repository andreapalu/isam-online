import {
  Component
} from '@angular/core';

@Component({
  template: `<div class="spinner-container"><div class="spinner"></div></div>`,
  styles: [
    `.spinner {
      border: 25px solid #f3f3f3; /* Light grey */
      border-top: 25px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 200px;
      height: 200px;
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
    }
    .spinner-container {
      top: 25%;
      position: fixed;
      width: 100%;
    }`
  ],
})
export class SpinnerComponent {

  constructor() { }

}