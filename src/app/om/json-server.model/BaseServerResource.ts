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
    /**
     * Return true only if the resource has all the attributes of this class && id != 0
     * @param object 
     */
    parseBaseServerResource(object: any): boolean {
        if (!!object) {
            let checkObj = new BaseServerResource();
            return Object.keys(checkObj).every(key => !!object[key] && typeof object[key] == typeof checkObj[key]);
        } else {
            return false;
        }
    }
}