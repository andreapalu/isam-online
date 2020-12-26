import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { select } from 'd3-selection';

@Component({
    selector: 'g[isam-area]',
    template: `
      <svg:defs *ngIf="gradient">
      <linearGradient [attr.id]="index" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="10%" [attr.stop-color]="fill" style = "stop-opacity: 1"/>
        <stop offset="25%" [attr.stop-color]="fill" style = "stop-opacity: 0.5"/>
        <stop offset="50%" [attr.stop-color]="fill" style = "stop-opacity: 0.25"/>
        <stop offset="75%" [attr.stop-color]="fill" style = "stop-opacity: 0.0"/>
      </linearGradient>
      </svg:defs>
      <svg:path
        class="area"
        [attr.d]="areaPath"
        [attr.fill]="pattern"
        [style.opacity]="opacity"
      />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaComponent implements OnChanges {

    @Input() data;
    @Input() path;
    @Input() startingPath;
    @Input() fill;
    @Input() opacity = 1;
    @Input() startOpacity = 0.5;
    @Input() endOpacity = 1;
    @Input() activeLabel;
    @Input() gradient: boolean = false;
    @Input() stops: any[];
    @Input() index: number;
    @Input() animations: boolean = true;

    @Output() select = new EventEmitter();

    pattern = "url(#0)";

    element: HTMLElement;
    gradientId: string;
    gradientFill: string;
    areaPath: string;
    initialized: boolean = false;
    gradientStops: any[];
    hasGradient: boolean = false;
    cache = {};

    constructor(element: ElementRef) {
        this.element = element.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.initialized) {
            this.loadAnimation();
            this.initialized = true;
        } else {
            this.update();
        }
        if (changes.fill) {
            this.pattern = "url(#" + this.index.toString() + ")";
        }
    }

    update(): void {
        this.gradientId = 'grad' + this.id().toString();
        this.gradientFill = `url(#${this.gradientId})`;

        if (this.gradient || this.stops) {
            this.gradientStops = this.getGradient();
            this.hasGradient = true;
        } else {
            this.hasGradient = false;
        }

        this.updatePathEl();
    }

    loadAnimation(): void {
        this.areaPath = this.startingPath;
        setTimeout(this.update.bind(this), 100);
    }

    updatePathEl(): void {
        const node = select(this.element).select('.area');

        if (this.animations) {
            node.transition().duration(750)
                .attr('d', this.path);
        } else {
            node.attr('d', this.path);
        }
    }

    getGradient() {
        if (this.stops) {
            return this.stops;
        }

        return [
            {
                offset: 0,
                color: this.fill,
                opacity: this.startOpacity
            },
            {
                offset: 100,
                color: this.fill,
                opacity: this.endOpacity
            }];
    }
    id(): string {
        let newId = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);

        // Append a 'a' because neo gets mad
        newId = `a${newId}`;

        // Ensure not already used
        if (!this.cache[newId]) {
            this.cache[newId] = true;
            return newId;
        }

        return this.id();
    }
}
