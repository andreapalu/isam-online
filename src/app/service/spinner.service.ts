import { ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector, ViewContainerRef } from "@angular/core";
import { SpinnerComponent } from "../component/spinner/spinner.component";

@Injectable()
export class SpinnerService {
    spinners: number = 0;
    domElem: HTMLElement;
    doc: ViewContainerRef;

    constructor(
        injector: Injector,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        const componentRef = componentFactoryResolver.resolveComponentFactory(SpinnerComponent).create(injector);
        this.domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        let div = document.createElement('div')
        div.style.zIndex = '9999';
        div.style.position = 'fixed';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.opacity = '0.5';
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.backgroundColor = '#fff';
        div.style.opacity = '0.5';
        div.id = 'mainSpinnerOverlay';
        this.domElem.appendChild(div);
        div = null;
    }

    show() {
        if (this.spinners == 0) {
            document.body.appendChild(this.domElem);
        }
        this.spinners++;
    }

    hide() {
        this.spinners--;
        if (this.spinners == 0) {
            document.body.removeChild(this.domElem);
        }
    }
}
