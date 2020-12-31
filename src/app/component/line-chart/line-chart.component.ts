import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { calculateViewDimensions, ColorHelper, ViewDimensions } from '@swimlane/ngx-charts';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { curveBasis, curveBasisClosed, curveCardinal, curveCatmullRom, curveLinear, curveLinearClosed, curveMonotoneX, curveMonotoneY, curveNatural, curveStep, curveStepAfter, curveStepBefore } from 'd3-shape'
import { HexToFilter } from '../../util/hexToFilterFunction';
import { GraphData } from './line-chart-model';

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnChanges, OnInit {

  @Input() legend: string[] = [];
  @Input() xAxis = true;
  @Input() yAxis = true;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() showGridLines: boolean = true;
  @Input() curve: any = curveCatmullRom.alpha(0.5);
  @Input() activeEntries: { name: string, value: string }[] = [];
  @Input() schemeType: string = "ordinal";
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() data: GraphData[] = [];
  @Input() xAxisTicks: any[];
  @Input() yAxisTicks: any[];
  @Input() roundDomains: boolean = false;
  @Input() tooltipDisabled: boolean = false;
  @Input() showRefLines: boolean = false;
  @Input() referenceLines: any;
  @Input() showRefLabels: boolean = true;
  @Input() xScaleMin: any;
  @Input() xScaleMax: any;
  @Input() yScaleMin: number;
  @Input() yScaleMax: number;
  @Input() chartTitle: string;
  @Input() tooltipTemplate: TemplateRef<any>
  @Input() view: number[] = [862, 237];
  /** Necessario quando il grafico viene utilizzato in elementi già in rilievo (es.modale) */
  @Input() morezIndex: boolean = false;


  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();

  @ViewChild("defaultTooltipTemplate") defaultTooltipTemplate: TemplateRef<any>;

  dims: ViewDimensions = { width: 862, height: 260, xOffset: 10 };
  xSet: any;
  scheme: { domain: string[] } = { domain: [] };
  xDomain: any;
  yDomain: any;
  seriesDomain: any;
  hasRange: boolean;
  curveTypes = [
    { name: "curveLinear", value: curveLinear },
    { name: "curveLinearClosed", value: curveLinearClosed },
    { name: "curveBasis", value: curveBasis },
    { name: "curveBasisClosed", value: curveBasisClosed },
    { name: "curveCardinal", value: curveCardinal },
    { name: "curveMonotoneX", value: curveMonotoneX },
    { name: "curveMonotoneY", value: curveMonotoneY },
    { name: "curveNatural", value: curveNatural },
    { name: "curveStep", value: curveStep },
    { name: "curveStepAfter", value: curveStepAfter },
    { name: "curveStepBefore", value: curveStepBefore }
  ];
  scaleType: string = "ordinal";
  transform: string;
  clipPath: string;
  clipPathId: string;
  series: any;
  areaPath: any;
  margin = [10, 20, 10, 20];
  hoveredVertical: any; // The value of the x axis that is hovered over
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  filteredDomain: any;
  width: any;
  height: any;
  actualValue: number;
  actualSeries: any;
  actualDate: any;

  circleDomain: any;
  yScale: any;
  xScale: any;
  colors: any;

  constructor(
    private _sanitizer: DomSanitizer
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes && !!changes.data && !!changes.data.currentValue) {
      this.update();

    }
  }

  hexToFilter(hex) {
    if (!!hex) {
      console.log("hex: " + hex + " , filter: " + HexToFilter(hex).filter)
      return this._sanitizer.bypassSecurityTrustStyle(
        HexToFilter(hex).filter
      );
    } else {
      return '';
    }
  };

  ngOnInit() {
    this.data.forEach(el => {
      this.scheme.domain.push(el.color)
    });
    if (this.curve != undefined && this.curveTypes.find(x => x.name == this.curve)) {
      this.curve = this.curveTypes.find(x => x.name == this.curve).value;
    } else {
      this.curve = curveCatmullRom.alpha(0.5)
    }
  }

  getXDomain(): any[] {
    let values = this.getUniqueXDomainValues(this.data);

    this.scaleType = this.getScaleType(values);
    let domain = [];

    if (this.scaleType === 'linear') {
      values = values.map(v => Number(v));
    }

    let min;
    let max;
    if (this.scaleType === 'time' || this.scaleType === 'linear') {
      min = this.xScaleMin
        ? this.xScaleMin
        : Math.min(...values);

      max = this.xScaleMax
        ? this.xScaleMax
        : Math.max(...values);
    }

    if (this.scaleType === 'time') {
      domain = [new Date(min), new Date(max)];
      this.xSet = [...values].sort((a, b) => {
        const aDate = a.getTime();
        const bDate = b.getTime();
        if (aDate > bDate) { return 1; }
        if (bDate > aDate) { return -1; }
        return 0;
      });
    } else if (this.scaleType === 'linear') {
      domain = [min, max];
      // Use compare function to sort numbers numerically
      this.xSet = [...values].sort((a, b) => (a - b));
    } else {
      domain = values;
      this.xSet = values;
    }

    return domain;
  }

  getYDomain(): any[] {
    const domain = [];
    for (const data of this.data) {
      for (const d of data.series) {
        if (domain.indexOf(d.value) < 0) {
          domain.push(d.value);
        }
        if (d.min !== undefined) {
          this.hasRange = true;
          if (domain.indexOf(d.min) < 0) {
            domain.push(d.min);
          }
        }
        if (d.max !== undefined) {
          this.hasRange = true;
          if (domain.indexOf(d.max) < 0) {
            domain.push(d.max);
          }
        }
      }
    }

    const values = [...domain];

    const min = this.yScaleMin
      ? this.yScaleMin
      : Math.min(...values) >= 0 ? 0 : Math.min(...values);

    const max = this.yScaleMax
      ? this.yScaleMax
      : Math.max(...values);

    return [min, max];
  }

  getUniqueXDomainValues(data: any[]): any[] {
    const valueSet = new Set();
    for (const result of data) {
      for (const d of result.series) {
        valueSet.add(d.name);
      }
    }
    return Array.from(valueSet);
  }

  getSeriesDomain(): string[] {
    return this.data.map(d => d.name);
  }

  getXScale(domain, width): any {
    let scale;

    if (this.scaleType === 'time') {
      scale = scaleTime()
        .range([0, width])
        .domain(domain);
    } else if (this.scaleType === 'linear') {
      scale = scaleLinear()
        .range([0, width])
        .domain(domain);

      if (this.roundDomains) {
        scale = scale.nice();
      }
    } else if (this.scaleType === 'ordinal') {
      scale = scalePoint()
        .range([0, width])
        .padding(0.1)
        .domain(domain);
    }

    return scale;
  }

  getYScale(domain, height): any {
    const scale = scaleLinear()
      .range([height, 0])
      .domain(domain);

    return this.roundDomains ? scale.nice() : scale;
  }

  getScaleType(values): string {
    let date = true;
    let num = true;

    for (const value of values) {
      if (!this.isDate(value)) {
        date = false;
      }

      if (typeof value !== 'number') {
        num = false;
      }
    }

    if (date) { return 'time'; }
    if (num) { return 'linear'; }
    return 'ordinal';
  }

  isDate(value): boolean {
    if (value instanceof Date) {
      return true;
    }

    return false;
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = this.getXScale(this.xDomain, this.dims.width);
  }

  updateHoveredVertical(item): void {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  update(): void {

    if (this.view) {
      this.width = this.view[0];
      this.height = this.view[1];
    }
    // Default values if width or height are 0 or undefined
    if (!this.width) {
      this.width = 600;
    }

    if (!this.height) {
      this.height = 400;
    }

    this.width = ~~this.width;
    this.height = ~~this.height;

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
    });

    this.xDomain = this.getXDomain();
    this.yDomain = this.getYDomain();
    this.seriesDomain = this.getSeriesDomain();

    this.xScale = this.getXScale(this.xDomain, this.dims.width);
    this.yScale = this.getYScale(this.yDomain, this.dims.height);
    this.setColors();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.circleDomain = this.getUniqueXDomainValues(this.data)
  }

  // @HostListener('mouseleave')
  // hideCircles(): void {
  //   this.hoveredVertical = null;
  //   this.deactivateAll();
  // }

  onClick(data, series?): void {
    if (series) {
      data.series = series.name;
    }
  }

  trackBy(index, item): string {
    return item.name;
  }

  setColors(): void {
    let domain;
    if (this.schemeType === 'ordinal') {
      domain = this.seriesDomain;
    } else {
      domain = this.yDomain;
    }
    this.colors = new ColorHelper(this.scheme, this.schemeType, domain);
  }


  onActivate(item?, x?) {
    if (x) {
      this.actualValue = x.value;
      this.actualDate = x.name;
    }
    if (item) {
      this.actualSeries = item.name;
    }
    this.deactivateAll();
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });
    if (idx > -1) {
      return;
    }
    this.activeEntries = [item];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  deactivateAll() {
    this.activeEntries = [...this.activeEntries];
    for (const entry of this.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.activeEntries = [];
  }

}
