import { Inject, Injectable } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { EventEmitter } from "events";
// import { APPLICATION_BASE_URL } from "../app.module";

@Injectable()
export class NavigationManagerService {

    private payloadMap: { [name: string]: string } = {};
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(
        private router: Router,
        // @Inject(APPLICATION_BASE_URL) private baseUrl
    ) {
        this.init();
    }

    init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.addListener(
                "navigation",
                function (args) {
                    window.alert("Ricevuto evento");
                    this.goTo(args.target);
                }
            )
            resolve();
        });
    }

    goTo(target: string, params?: any, payloadArg?: any) {
        this.savePayloadInSessionStorage(target, payloadArg);

        if (this.payloadMap[target] && !payloadArg) {
            payloadArg = this.payloadMap[target]
        }

        if (payloadArg) {
            this.payloadMap[target] = payloadArg;
        }
        let navParams: NavigationExtras = {};
        if (params) {
            navParams.queryParams = params;
        }
        this.router.navigate([target], navParams);
    }

    /**
     * Method to programmatically set a navigation payload
     * @param alias the functionAlias to which you want to associate the given payload
     * @param payload the payload to send
     */
    setPayload(alias: string, payload: any) {
        this.payloadMap[alias] = payload;
    }

    /**
     * Function to retrieve the navigation payload given from the previous page
     * @param alias your function alias (moduleName.functionUrl)
     * @param deletePayload true if the payload should be removed after retrieval
     * @returns The payload
     */
    getPayload(alias: string, deletePayload?: boolean): any {
        let obj = this.payloadMap[alias];
        if (!obj) {
            obj = this.payloadMap[alias.replace(/\./g, '')];
        }
        if (deletePayload) {
            if (!!this.payloadMap[alias]) {
                this.payloadMap[alias] = null
            } else if (!!this.payloadMap[alias.replace(/\./g, '')]) {
                this.payloadMap[alias.replace(/\./g, '')] = null; //reset the payload after first get
            }
        }
        return obj;
    }

    /**
     * method to save the navigation payload relative to the page where the navigation ends when
     * there is a switch to the old site 
     */
    private savePayloadInSessionStorage(alias: string, navigationPayload: any) {
        if (!!navigationPayload) {
            sessionStorage.saveObject('navigationPayload', navigationPayload);
        }

        if (!!alias && !/[^\w -]/.test(alias.replace(/\./g, ''))) {
            sessionStorage.saveObject('statename', alias.replace(/\./g, ''));
        }
    }
}