export function parseFloatNotNull(value: string | number): number {
    if (!!value) {
        if (typeof value == "number") {
            return value;
        } else if (!isNaN(parseFloat(value))) {
            return parseFloat(value);
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

export function parseDateNotNull(value: string | number): Date {
    if (!!value) {
        if (typeof value == "number") {
            return new Date(value);
        } else if (!isNaN(Date.parse(value))) {
            return new Date(value);
        } else {
            return new Date();
        }
    } else {
        return new Date();
    }
}