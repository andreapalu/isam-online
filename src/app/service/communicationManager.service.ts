import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { HttpOptions } from "../../assets/const/HttpOptions";
import { BaseServerResource } from "../om/json-server.model/BaseServerResource";
import { stringsNotNull } from "../util/stringsNotNull";
import { ApiCatalogModel } from "../../assets/const/ApiCatalogModel";

@Injectable()
export class CommunicationManagerService {
    private baseUrl: string = "";
    private mockServerUrl: string = "/api/mock-server/";

    apiCatalog: { [apiGroup: string]: ApiCatalogModel[] } = {};

    constructor(
        private httpClient: HttpClient
    ) {
        this.loadStaticFile<{ [apiGroup: string]: ApiCatalogModel[] }>("../../assets/env/apicatalog/api.json").subscribe(
            file => this.apiCatalog = file
        )
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
        let finalUrl = this.getFinalUrl(this.mockServerUrl, request);
        if (!request.httpOptions) {
            request.httpOptions = {};
        }
        if (request.queryStringParams) {
            request.httpOptions['params'] = request.queryStringParams;
        }
        if (request.pathParams) {
            finalUrl = this.addPathParams(finalUrl, request.pathParams);
        }
        switch (request.apiMethod) {
            case HttpVerbs.get:
                return this.httpClient.get<T>(finalUrl, request.httpOptions);
            case HttpVerbs.delete:
                return this.httpClient.delete<T>(finalUrl, request.httpOptions);
            case HttpVerbs.patch:
                return this.httpClient.patch<T>(finalUrl, request.httpOptions);
            case HttpVerbs.post:
                if (!!request.body) {
                    if (BaseServerResource.prototype.parseBaseServerResource(request.body)) {
                        request.httpOptions = request.body;
                    } else {
                        throw new Error("INVALID RESOURCE FOR METHOD " + request.apiMethod);
                    }
                }
                return this.httpClient.post<T>(finalUrl, request.httpOptions);
            case HttpVerbs.put:
                if (!!request.body) {
                    if (BaseServerResource.prototype.parseBaseServerResource(request.body)) {
                        request.httpOptions = request.body;
                    } else {
                        throw new Error("INVALID RESOURCE FOR METHOD " + request.apiMethod);
                    }
                }
                return this.httpClient.put<T>(finalUrl, request.httpOptions);
            default:
                return null;
        }
    }

    private getFinalUrl(applicationBaseurl: string, request: CommunicationManagerRequest<any>): string {
        let apiDefinition: ApiCatalogModel = (this.apiCatalog[request.apiEndpoint.split("/")[0]] || [])
            .find(api => (
                api.name == request.apiEndpoint.split("/")[1]
                && api.method == request.apiMethod
            ));
        if (!apiDefinition) {
            throw new Error("api not found!");
        }
        return applicationBaseurl + apiDefinition.baseUrl + apiDefinition.endpoint;
    }

    private addPathParams(requestUrl: string, pathParams?: ParamsObj): string {
        Object.keys(pathParams).forEach(paramKey => {
            if (!!requestUrl && requestUrl.indexOf(`/:${paramKey}`) != -1) {
                requestUrl = requestUrl.replace(`/:${paramKey}`, "/" + encodeURIComponent(pathParams[paramKey]));
            }
        })
        return requestUrl;
    }

    public callRealService<T>(request: CommunicationManagerRequest<T>): Observable<T> {
        let finalUrl = this.getFinalUrl(this.mockServerUrl, request);
        return Observable.create(observer => {
            let httpCallObservable: Observable<T>;
            switch (request.apiMethod) {
                case HttpVerbs.get:
                    httpCallObservable = this.callHttpGet<T>(finalUrl, request);
                    observer.next(httpCallObservable);
                    observer.complete();
                    break;
                case HttpVerbs.delete:
                    httpCallObservable = this.callHttpDelete<T>(finalUrl, request);
                    observer.next(httpCallObservable);
                    observer.complete();
                    break;
                case HttpVerbs.post:
                    httpCallObservable = this.callHttpPost<T>(finalUrl, request);
                    observer.next(httpCallObservable);
                    observer.complete();
                    break;
                case HttpVerbs.put:
                    httpCallObservable = this.callHttpPut<T>(finalUrl, request);
                    observer.next(httpCallObservable);
                    observer.complete();
                    break;
                case HttpVerbs.patch:
                    httpCallObservable = this.callHttpPatch<T>(finalUrl, request);
                    observer.next(httpCallObservable);
                    observer.complete();
                    break;
                case HttpVerbs.head:
                    httpCallObservable = this.callHttpHead<T>(finalUrl, request);
                    observer.next(httpCallObservable);
                    observer.complete();
                    break;
                default:
                    throw new Error('Communication manager do not implement ' + request.apiMethod);
            }
        })
    }


    /**
     * A wrapper for the Angular HttpClient get method
     *
     * The method takes a Type T that describes the type of the returned Observable object
     *
     * @param url The url to get to
     * @param httpOptions An optional object containing the httpOptions
     *
     * @returns {Observable<T>} The Observable containing the service response
     */
    private callHttpGet<T>(finalUrl: string, request: CommunicationManagerRequest<T>): Observable<T> {
        return this.httpClient.get<T>(finalUrl, request.httpOptions);
    }

    /**
     * A wrapper for the Angular HttpClient post method
     *
     * The method takes a Type T that describes the type of the returned Observable object
     *
     * @param url The url to post to
     * @param body The body of the post method
     * @param httpOptions An optional object containing the httpOptions
     *
     * @returns {Observable<T>} The Observable containing the service response
     */
    private callHttpPost<T>(finalUrl: string, request: CommunicationManagerRequest<T>): Observable<T> {
        // return this.httpClient.post<T>(url, body, httpOptions);
        return this.httpClient.post<T>(finalUrl, request.httpOptions);
    }

    /**
     * A wrapper for the Angular HttpClient put method
     *
     * The method takes a Type T that describes the type of the returned Observable object
     *
     * @param url The url to post to
     * @param body The body of the post method
     * @param httpOptions An optional object containing the httpOptions
     *
     * @returns {Observable<T>} The Observable containing the service response
     */
    private callHttpPut<T>(finalUrl: string, request: CommunicationManagerRequest<T>): Observable<T> {
        // return this.httpClient.put<T>(url, body, httpOptions);
        return this.httpClient.put<T>(finalUrl, request.httpOptions);
    }

    /**
     * A wrapper for the Angular HttpClient delete method
     *
     * The method takes a Type T that describes the type of the returned Observable object
     *
     * @param url The url to post to
     * @param httpOptions An optional object containing the httpOptions
     *
     * @returns {Observable<T>} The Observable containing the service response
     */
    private callHttpDelete<T>(finalUrl: string, request: CommunicationManagerRequest<T>): Observable<T> {
        request.httpOptions['body'] = request.body;
        return this.httpClient.delete<T>(finalUrl, request.httpOptions);
    }

    /**
     * A wrapper for the Angular HttpClient patch method
     *
     * The method takes a Type T that describes the type of the returned Observable object
     *
     * @param url The url to post to
     * @param httpOptions An optional object containing the httpOptions
     *
     * @returns {Observable<T>} The Observable containing the service response
     */
    private callHttpPatch<T>(finalUrl: string, request: CommunicationManagerRequest<T>): Observable<T> {
        // return this.httpClient.patch<T>(url, body, httpOptions);
        return this.httpClient.patch<T>(finalUrl, request.httpOptions);
    }

    /**
     * A wrapper for the Angular HttpClient patch method
     *
     * The method takes a Type T that describes the type of the returned Observable object
     *
     * @param url The url to post to
     * @param httpOptions An optional object containing the httpOptions
     *
     * @returns {Observable<T>} The Observable containing the service response
     */
    private callHttpHead<T>(finalUrl: string, request: CommunicationManagerRequest<T>): Observable<T> {
        // return this.httpClient.head<T>(url, httpOptions);
        return this.httpClient.head<T>(finalUrl, request.httpOptions);
    }
}

export type CommunicationManagerRequest<T> = {
    apiEndpoint: string;
    apiMethod: HttpVerbs;
    body?: any;
    httpOptions?: HttpOptions;
    noBaseUrl?: boolean;
    queryStringParams?: ParamsObj;
    pathParams?: ParamsObj;
}

declare class ParamsObj { [key: string]: string }

export type CommunicationManagerResponse<T> = {

}

export enum HttpVerbs {
    get = "get",
    post = "post",
    delete = "delete",
    put = "put",
    patch = "patch",
    head = "head",
    options = "options"
}