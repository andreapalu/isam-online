import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { area, line } from 'd3-shape';


@Component({
    selector: 'g[isam-line-serie]',
    template: `
      <svg:g>
        <defs>
          <svg:g ngx-charts-svg-linear-gradient *ngIf="hasGradient"
            orientation="vertical"
            [name]="gradientId"
            [stops]="gradientStops"
          />
        </defs>
        <svg:g isam-area
          class="line-highlight"
          [data]="data"
          [path]="areaPath"
          [fill]="hasGradient ? gradientUrl : colors.getColor(data.name)"
          [opacity]="0.25"
          [startOpacity]="0"
          [gradient]="true"
          [stops]="areaGradientStops"
          [class.active]="isActive(data)"
          [class.inactive]="isInactive(data)"
          [startingPath]="path"
          [index]="index"
        />
        <svg:g ngx-charts-line
          class="line-series"
          [data]="data"
          [path]="path"
          [stroke]="stroke"
          [animations]="animations"
          [class.active]="isActive(data)"
          [class.inactive]="isInactive(data)"
        />
      </svg:g>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineSerieComponent implements OnChanges {

    @Input() data;
    @Input() xScale;
    @Input() yScale;
    @Input() colors;
    @Input() scaleType;
    @Input() curve: any;
    @Input() activeEntries: any[];
    @Input() rangeFillOpacity: number;
    @Input() hasRange: boolean;
    @Input() index: number;
    @Input() animations: boolean = false;


    path: string;
    outerPath: string;
    areaPath: string;
    gradientId: string;
    gradientUrl: string;
    hasGradient: boolean;
    gradientStops: any[];
    areaGradientStops: any[];
    stroke: any;
    cache = {};

    ngOnChanges(changes: SimpleChanges): void {
        this.update();
    }

    update(): void {
        this.updateGradients();

        const data = this.sortData(this.data.series);

        const lineGen = this.getLineGenerator();
        this.path = lineGen(data) || '';

        const areaGen = this.getAreaGenerator();
        this.areaPath = areaGen(data) || '';

        if (this.hasRange) {
            const range = this.getRangeGenerator();
            this.outerPath = range(data) || '';
        }

        if (this.hasGradient) {
            this.stroke = this.gradientUrl;
            const values = this.data.series.map(d => d.value);
            const max = Math.max(...values);
            const min = Math.min(...values);
            if (max === min) {
                this.stroke = this.colors.getColor(max);
            }
        } else {
            this.stroke = this.colors.getColor(this.data.name);
        }
    }

    getLineGenerator(): any {
        return line<any>()
            .x((d) => {
                const label = d.name;
                let value;
                if (this.scaleType === 'time') {
                    value = this.xScale(label);
                } else if (this.scaleType === 'linear') {
                    value = this.xScale(Number(label));
                } else {
                    value = this.xScale(label);
                }
                return value;
            })
            .y(d => this.yScale(d.value))
            .curve(this.curve);
    }

    getRangeGenerator(): any {
        return area<any>()
            .x(d => {
                const label = d.name;
                let value;
                if (this.scaleType === 'time') {
                    value = this.xScale(label);
                } else if (this.scaleType === 'linear') {
                    value = this.xScale(Number(label));
                } else {
                    value = this.xScale(label);
                }
                return value;
            })
            .y0(d => this.yScale(d.min ? d.min : d.value))
            .y1(d => this.yScale(d.max ? d.max : d.value))
            .curve(this.curve);
    }

    getAreaGenerator(): any {
        const xProperty = (d) => {
            const label = d.name;
            return this.xScale(label);
        };

        return area<any>()
            .x(xProperty)
            .y0(() => this.yScale.range()[0])
            .y1(d => this.yScale(d.value))
            .curve(this.curve);
    }

    sortData(data) {
        if (this.scaleType === 'linear') {
            data = this.sortLinear(data, 'name');
        } else if (this.scaleType === 'time') {
            data = this.sortByTime(data, 'name');
        } else {
            data = this.sortByDomain(data, 'name', 'asc', this.xScale.domain());
        }

        return data;
    }

    updateGradients() {
        if (this.colors.scaleType === 'linear') {
            this.hasGradient = true;
            this.gradientId = 'grad' + this.id().toString();
            this.gradientUrl = `url(#${this.gradientId})`;
            const values = this.data.series.map(d => d.value);
            const max = Math.max(...values);
            const min = Math.min(...values);
            this.gradientStops = this.colors.getLinearGradientStops(max, min);
            this.areaGradientStops = this.colors.getLinearGradientStops(max);
        } else {
            this.hasGradient = false;
            this.gradientStops = undefined;
            this.areaGradientStops = undefined;
        }
    }

    isActive(entry): boolean {
        if (!this.activeEntries) { return false; }
        const item = this.activeEntries.find(d => {
            return entry.name === d.name;
        });
        return item !== undefined;
    }

    isInactive(entry): boolean {
        if (!this.activeEntries || this.activeEntries.length === 0) { return false; }
        const item = this.activeEntries.find(d => {
            return entry.name === d.name;
        });
        return item === undefined;
    }
    sortLinear(data, property, direction = 'asc') {
        return data.sort((a, b) => {
            if (direction === 'asc') {
                return a[property] - b[property];
            } else {
                return b[property] - a[property];
            }
        });
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

    sortByDomain(data, property, direction = 'asc', domain) {
        return data.sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];

            const aIdx = domain.indexOf(aVal);
            const bIdx = domain.indexOf(bVal);

            if (direction === 'asc') {
                return aIdx - bIdx;
            } else {
                return bIdx - aIdx;
            }
        });
    }

    sortByTime(data, property, direction = 'asc') {
        return data.sort((a, b) => {
            const aDate = a[property].getTime();
            const bDate = b[property].getTime();

            if (direction === 'asc') {
                if (aDate > bDate) { return 1; }
                if (bDate > aDate) { return -1; }
                return 0;
            } else {
                if (aDate > bDate) { return -1; }
                if (bDate > aDate) { return 1; }
                return 0;
            }
        });
    }
}
