export class BaseServerResource {
    id: number;
    insertDate: Date;
    lastUpdate: Date;
    lastUpdateUser: string;
    constructor() {
        this.id = 0;
        this.insertDate = new Date();
        this.lastUpdate = new Date();
        this.lastUpdateUser = "";
    }
    parseBaseServerResource(object: any): boolean {
        if (!!object) {
            let res = new BaseServerResource();
            return Object.keys(res).every(key => !!object[key] && typeof object[key] == typeof res[key]);
        } else {
            return false;
        }
    }
}