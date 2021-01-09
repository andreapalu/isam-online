import { ComponentFactory, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector, ViewContainerRef } from "@angular/core";
import { NotificationComponent } from "../component/notification/notification.component";
import { cloneDeep } from 'lodash';
import { NewNotificationModel } from "../om/notification.model/NewNotificationModel";
import { NotificationObj } from "../om/notification.model/NotificationObj";

const headerHeight: number = 60;

@Injectable()
export class NotificationService {
    private notificationFactory: ComponentFactory<NotificationComponent>;

    private _notificationList: ComponentRef<NotificationComponent>[] = [];

    constructor(
        private injector: Injector,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        this.notificationFactory = componentFactoryResolver.resolveComponentFactory(NotificationComponent);
    }

    add(newNotificationModel: NewNotificationModel): NotificationComponent {
        let componentRef = this.notificationFactory.create(this.injector);
        let top: number;
        if (!!newNotificationModel.topOffset) {
            top = newNotificationModel.topOffset + 3;
        } else if (this._notificationList.length > 0) {
            let instance = this._notificationList[this._notificationList.length - 1].instance;
            top = instance._notificationContent.top + instance.height + 3;
        } else {
            top = headerHeight;
        }
        componentRef.instance._notificationContent = new NotificationObj(
            newNotificationModel.title,
            newNotificationModel.content,
            componentRef,
            top,
            this._notificationList.length,
            newNotificationModel.action,
            newNotificationModel.icon,
            newNotificationModel.date
        );
        componentRef.changeDetectorRef.detectChanges();
        let domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);
        this._notificationList.push(componentRef);
        return componentRef.instance;
    }

    remove(notifIndex: number) {
        let oldList: ComponentRef<NotificationComponent>[] = cloneDeep(this._notificationList);
        this._notificationList = [];
        let remove: number;
        oldList.forEach((notif, i) => {
            document.body.removeChild((notif.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement);
            if (notif.instance._notificationContent.index == notifIndex) {
                remove = i;
            }
        });
        oldList.splice(remove, 1);
        if (!!oldList && oldList.length > 0) {
            this.addInOrder(0, oldList);
        }
    }

    addInOrder(i: number, oldList: ComponentRef<NotificationComponent>[], height?: number) {
        let notif: ComponentRef<NotificationComponent> = oldList[i];
        this.add(new NewNotificationModel(
            notif.instance._notificationContent.title,
            notif.instance._notificationContent.content,
            notif.instance._notificationContent.action,
            notif.instance._notificationContent.icon,
            notif.instance._notificationContent.date,
            height
        )).ngAfterContentChecked().subscribe(value => {
            if (!!value && value.index != null && value.height != 0 && oldList.length > (value.index + 1)) {
                this.addInOrder(value.index + 1, oldList);
            }
        });
    }

}
