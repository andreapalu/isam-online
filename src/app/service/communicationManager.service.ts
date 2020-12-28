import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { HttpOptions } from "../../assets/const/HttpOptions";

@Injectable({
    providedIn: "root",
})
export class CommunicationManagerService {
    private baseUrl: string = "";
    private mockServerUrl: string = "/api/mock-server/";

    constructor(
        private httpClient: HttpClient
    ) {
    }

    /**
     * This method is used to load a static file passing in the file URL.
     *
     * The method takes a Type T that is a class that describes the content of the static file (if it a JSON)
     *
     * @param url The URL of the static file to load
     * @param httpOptions The http option to pass to the Angular httpClient get method
     *
     * @returns {Observable<T>} An Observable which will hold the static file data in the T
     * type
     */
    loadStaticFile<T>(url: string, httpOptions?: {}, noBaseUrl?: boolean): Observable<T> {
        let finalUrl = this.baseUrl + url;
        if (noBaseUrl) {
            finalUrl = url;
        }
        return this.httpClient.get<T>(finalUrl, httpOptions);
    }

    public callMockService<T>(request: CommunicationManagerRequest<T>): Observable<T> {
        let finalUrl = this.mockServerUrl + request.url;
        return this.httpClient.get<T>(finalUrl, request.httpOptions);
    }
}

export type CommunicationManagerRequest<T> = {
    url: string;
    httpOptions?: HttpOptions;
    noBaseUrl?: boolean;
}

export type CommunicationManagerResponse<T> = {

}