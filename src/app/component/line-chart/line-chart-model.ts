export class GraphData {
    color?: string;
    name?: string;
    series?: Series[];
}

export class Series {
    name: Date | string; // TODO: rimuovere | string
    value?: number;
    max?: number;
    min?: number;
}