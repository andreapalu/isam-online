export const yahooDateMultiplier: number = 1000;

export const LineChartColor = {
    _value: "valueSerie",
    _max: "maxSerie",
    _min: "minSerie",
    _open: "openSerie",
    _close: "closeSerie"
}

export const LineChartSeriesKey = {
    _value: "valueSerie",
    _max: "maxSerie",
    _min: "minSerie",
    _open: "openSerie",
    _close: "closeSerie"
}

export const LineCharSeriesMap: Map<string, { name: string, color: string, field: string }> = new Map([
    [
        LineChartSeriesKey._value,
        {
            color: "#17d200",
            name: "Valore corrente",
            field: "high"
        }
    ],
    [
        LineChartSeriesKey._max,
        {
            color: "#17d200",
            name: "Massimi",
            field: "high"
        }
    ],
    [
        LineChartSeriesKey._min,
        {
            color: "#ff0000",
            name: "Minimi",
            field: "low"
        }
    ],
    [
        LineChartSeriesKey._open,
        {
            color: "#FABE0A",
            name: "Apertura",
            field: "open"
        }
    ],
    [
        LineChartSeriesKey._close,
        {
            color: "#5965BA",
            name: "Chiusura",
            field: "close"
        }
    ],
])