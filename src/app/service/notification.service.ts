import { ComponentFactory, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector, ViewContainerRef } from "@angular/core";
import { NotificationComponent } from "../component/notification/notification.component";
import { cloneDeep } from 'lodash';
import { NewNotificationModel } from "../om/notification.model/NewNotificationModel";
import { NotificationObj } from "../om/notification.model/NotificationObj";
import { CommunicationManagerService, HttpVerbs } from "./communicationManager.service";
import { Observable } from "rxjs";
import { NotificationResource } from "../om/json-server.model/Notification";

const headerHeight: number = 60;

@Injectable()
export class NotificationService {
    private notificationFactory: ComponentFactory<NotificationComponent>;

    private _notificationList: ComponentRef<NotificationComponent>[] = [];
    private _serviceNotification: NotificationResource[] = [];

    constructor(
        private injector: Injector,
        private componentFactoryResolver: ComponentFactoryResolver,
        private communicationManagerService: CommunicationManagerService
    ) {
        this.notificationFactory = componentFactoryResolver.resolveComponentFactory(NotificationComponent);
        this.getNotifications();
    }

    /**
     * Add new notification and save it to the DB
     * @param newNotificationModel 
     */
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
            newNotificationModel.read,
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

        let notificationResource: NotificationResource = new NotificationResource(
            newNotificationModel,
            (this._serviceNotification.length > 0) ? Math.max(...this._serviceNotification.map(elem => elem.id)) + 1 : 1
        );
        this.postNotification(notificationResource);

        return componentRef.instance;
    }

    /**
     * Restore notification w/o adding to the DB
     * @param newNotificationModel 
     */
    private reset(newNotificationModel: NewNotificationModel | NotificationResource): NotificationComponent {
        if (!!newNotificationModel) {
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
            let funct: Function = typeof newNotificationModel.action == 'string' && eval('(' + newNotificationModel.action.substring(1, newNotificationModel.action.length - 1) + ')');
            componentRef.instance._notificationContent = new NotificationObj(
                newNotificationModel.title,
                newNotificationModel.content,
                newNotificationModel.read,
                componentRef,
                top,
                this._notificationList.length,
                funct,
                newNotificationModel.icon,
                !!newNotificationModel['lastUpdate'] ? new Date(newNotificationModel['lastUpdate']) : newNotificationModel.date
            );
            componentRef.changeDetectorRef.detectChanges();
            let domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
            document.body.appendChild(domElem);
            this._notificationList.push(componentRef);
            return componentRef.instance;
        }
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
        let newNot = this.reset(new NewNotificationModel(
            notif.instance._notificationContent.title,
            notif.instance._notificationContent.content,
            notif.instance._notificationContent.read,
            notif.instance._notificationContent.action,
            notif.instance._notificationContent.icon,
            notif.instance._notificationContent.date,
            height
        ));
        !!newNot && newNot.ngAfterContentChecked().subscribe(value => {
            if (!!value && value.index != null && value.height != 0 && oldList.length > (value.index + 1)) {
                this.addInOrder(value.index + 1, oldList);
            }
        });
    }

    addInOrderByService(i: number, oldList: NotificationResource[], height?: number) {
        if (!!height) {
            // oldList[i].topOffset = height;
        }
        let newNot = this.reset(oldList[i]);
        !!newNot && newNot.ngAfterContentChecked().subscribe(value => {
            if (!!value && value.index != null && value.height != 0 && oldList.length > (value.index + 1)) {
                this.addInOrderByService(value.index + 1, oldList, value.height);
            }
        });
    }

    /** ---------- API CALL ---------- */

    getNotifications() {
        this.communicationManagerService.callMockService<NotificationResource[]>(
            {
                apiEndpoint: "notification-api/getNotifications",
                apiMethod: HttpVerbs.get
            }
        ).subscribe(response => {
            if (!!response) {
                this._notificationList.forEach(notif => {
                    document.body.removeChild((notif.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement);
                });
                this._notificationList = [];
                this._serviceNotification = response;
                this.addInOrderByService(0, response);
            }
        });
    }

    deleteNotification(notificationObj: NotificationObj) {
        let notification: NotificationResource = this._serviceNotification.find(notif => (
            notif.content == notificationObj.content
            && notif.title == notificationObj.title
            && notif.read == notificationObj.read
        ));
        this.communicationManagerService.callMockService<NotificationResource[]>({
            apiEndpoint: "notification-api/deleteNotification",
            apiMethod: HttpVerbs.delete,
            pathParams: {
                id: notification.id.toString()
            }
        }).subscribe(res => {
            this.getNotifications();
        });
    }

    postNotification(notification: NotificationResource) {
        this.communicationManagerService.callMockService<NotificationResource>({
            apiEndpoint: "notification-api/postNotification",
            apiMethod: HttpVerbs.post,
            body: notification
        }).subscribe(res => {
            this.getNotifications();
        });
    }

    markAsRead(notificationObj: NotificationObj) {
        let notification: NotificationResource = this._serviceNotification.find(notif => (
            notif.content == notificationObj.content
            && notif.title == notificationObj.title
            && notif.read == notificationObj.read
        ));
        notification.insertDate = new Date(notification.insertDate);
        notification.lastUpdate = new Date();
        notification.lastUpdateUser = "FE_CLIENT";
        notification.read = true;
        this.communicationManagerService.callMockService<NotificationResource>({
            apiEndpoint: "notification-api/putNotification",
            apiMethod: HttpVerbs.put,
            pathParams: {
                id: notification.id.toString()
            },
            body: notification
        }).subscribe(res => {
            this.getNotifications();
        });
    }

    markAsUnRead(notificationObj: NotificationObj) {
        let notification: NotificationResource = this._serviceNotification.find(notif => (
            notif.content == notificationObj.content
            && notif.title == notificationObj.title
            && notif.read == notificationObj.read
        ));
        notification.insertDate = new Date(notification.insertDate);
        notification.lastUpdate = new Date();
        notification.lastUpdateUser = "FE_CLIENT";
        notification.read = false;
        this.communicationManagerService.callMockService<NotificationResource>({
            apiEndpoint: "notification-api/putNotification",
            apiMethod: HttpVerbs.put,
            pathParams: {
                id: notification.id.toString()
            },
            body: notification
        }).subscribe(res => {
            this.getNotifications();
        });
    }

}
