import {
    animate,
    style,
    transition,
    trigger
} from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef
} from '@angular/core';
import { ColorHelper } from '@swimlane/ngx-charts';

@Component({
    selector: 'g[isam-circle-series]',
    template: `
      <svg:g *ngIf="circle">
        <defs>
          <svg:g ngx-charts-svg-linear-gradient
            orientation="vertical"
            [name]="gradientId"
            [stops]="circle.gradientStops"
          />
        </defs>
        <svg:g ngx-charts-circle
          class="circle"
          style="cursor:pointer"
          [cx]="circle.cx"
          [cy]="circle.cy"
          [r]="circle.radius"
          fill="white"
          [stroke]="circle.stroke"
          [class.active]="isActive({name: circle.seriesName})"
          pointerEvents="all"
          [data]="circle.value"
          [classNames]="circle.classNames"
          (select)="onClick($event, circle.label)"
          (activate)="activateCircle()"
          (deactivate)="deactivateCircle()"
          ngx-tooltip
          [tooltipDisabled]="tooltipDisabled"
          [tooltipPlacement]="'top'"
          [tooltipType]="'tooltip'"
          [tooltipTitle]="tooltipTemplate ? undefined : getTooltipText(circle)"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipContext]="circle.data"
          [tooltipCssClass]="morezIndex?'zIndex1' : ''"
        />
      </svg:g>
    `, styleUrls: ['./line-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('animationState', [
            transition(':enter', [
                style({
                    opacity: 0,
                }),
                animate(250, style({ opacity: 1 }))
            ])
        ])
    ]
})
export class CircleSeriesComponent implements OnChanges, OnInit {

    @Input() data;
    @Input() type = 'standard';
    @Input() xScale;
    @Input() yScale;
    @Input() colors: ColorHelper;
    @Input() scaleType;
    @Input() visibleValue;
    @Input() activeEntries: any[];
    @Input() tooltipDisabled: boolean = false;
    @Input() tooltipTemplate: TemplateRef<any>;
    @Input() morezIndex: boolean;

    @Output() select = new EventEmitter();
    @Output() activate = new EventEmitter();
    @Output() deactivate = new EventEmitter();

    areaPath: any;
    circle: any; // Active circle
    barVisible: boolean = false;
    gradientId: string;
    gradientFill: string;
    cache = {};

    ngOnInit() {
        this.gradientId = 'grad' + this.id().toString();
        this.gradientFill = `url(#${this.gradientId})`;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.update();
    }

    update(): void {
        this.circle = this.getActiveCircle();
    }

    getActiveCircle(): {} {
        const indexActiveDataPoint = this.data.series.findIndex((d) => {
            const label = d.name;
            return label && this.visibleValue && label.toString() === this.visibleValue.toString() && d.value !== undefined;
        });

        if (indexActiveDataPoint === -1) {
            // No valid point is 'active/hovered over' at this moment.
            return undefined;
        }

        return this.mapDataPointToCircle(this.data.series[indexActiveDataPoint], indexActiveDataPoint);
    }

    mapDataPointToCircle(d: any, i: number): any {
        const seriesName = this.data.name;

        const value = d.value;
        const label = d.name;
        const tooltipLabel = this.formatLabel(label);

        let cx;
        if (this.scaleType === 'time') {
            cx = this.xScale(label);
        } else if (this.scaleType === 'linear') {
            cx = this.xScale(Number(label));
        } else {
            cx = this.xScale(label);
        }

        const cy = this.yScale(this.type === 'standard' ? value : d.d1);
        const radius = 3.5;
        const height = this.yScale.range()[0] - cy;
        const opacity = 1;

        let stroke;
        if (this.colors.scaleType === 'linear') {
            if (this.type === 'standard') {
                stroke = this.colors.getColor(value);
            } else {
                stroke = this.colors.getColor(d.d1);
            }
        } else {
            stroke = this.colors.getColor(seriesName);
        }

        const data = {
            series: seriesName,
            value,
            name: label
        };

        return {
            classNames: [`circle-data-${i}`],
            value,
            label,
            data,
            cx,
            cy,
            radius,
            height,
            tooltipLabel,
            stroke,
            opacity,
            seriesName,
            gradientStops: this.getGradientStops(stroke),
            min: d.min,
            max: d.max
        };
    }

    getTooltipText({ tooltipLabel, value, seriesName, min, max }): string {
        return `
        <span class="tooltip-label">${seriesName} • ${tooltipLabel}</span>
        <span class="tooltip-val">${value.toLocaleString()}${this.getTooltipMinMaxText(min, max)}</span>
      `;
    }

    getTooltipMinMaxText(min: any, max: any) {
        if (min !== undefined || max !== undefined) {
            let result = ' (';
            if (min !== undefined) {
                if (max === undefined) {
                    result += '≥';
                }
                result += min.toLocaleString();
                if (max !== undefined) {
                    result += ' - ';
                }
            } else if (max !== undefined) {
                result += '≤';
            }
            if (max !== undefined) {
                result += max.toLocaleString();
            }
            result += ')';
            return result;
        } else {
            return '';
        }
    }

    getGradientStops(color) {
        return [
            {
                offset: 0,
                color,
                opacity: 0.2
            },
            {
                offset: 100,
                color,
                opacity: 1
            }];
    }

    onClick(value, label): void {
        this.select.emit({
            name: label,
            value
        });
    }

    isActive(entry): boolean {
        if (!this.activeEntries) { return false; }
        const item = this.activeEntries.find(d => {
            return entry.name === d.name;
        });
        return item !== undefined;
    }

    activateCircle(): void {
        this.activate.emit({ name: this.data.name });
    }

    deactivateCircle(): void {
        this.circle.opacity = 0;
        this.deactivate.emit({ name: this.data.name });
    }

    formatLabel(label: any): string {
        if (label instanceof Date) {
            label = label.toLocaleDateString();
        } else {
            label = label.toLocaleString();
        }

        return label;
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
