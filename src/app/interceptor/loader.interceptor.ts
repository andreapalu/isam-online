import { Injectable, Injector } from "@angular/core";
import {
    HttpEvent,
    HttpRequest,
    HttpHandler,
    HttpInterceptor
} from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize, delay } from "rxjs/operators";
import { SpinnerService } from "../service/spinner.service";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) { }
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // if (!req.url.includes("albums")) {
        //     console.warn("LoaderInterceptor");
        //     return next.handle(req);
        // }
        // console.warn("LoaderInterceptor");

        const spinnerService = this.injector.get(SpinnerService);

        spinnerService.show();

        return next.handle(req).pipe(
            delay(3000),
            finalize(() => spinnerService.hide())
        );
    }
}
