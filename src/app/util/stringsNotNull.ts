export function stringsNotNull(input: string | string[]): boolean {
    if (!!input) {
        if (typeof input == 'string') {
            return stringsNotNull([input]);
        }
        if (input.length > 0) {
            return input.every(el => (!!el && el.trim() != ''));
        }
        return false;
    }
    return false;
}