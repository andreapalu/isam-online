import { NewNotificationModel } from "../notification.model/NewNotificationModel";
import { BaseServerResource } from "./BaseServerResource";

export class NotificationResource extends BaseServerResource {
    title: string;
    content: string;
    read: boolean;
    action?: string;
    icon?: string;
    date?: Date;
    topOffset?: number;

    constructor(newNotificationModel: NewNotificationModel, id: number) {
        super();
        this.title = newNotificationModel.title;
        this.content = newNotificationModel.content;
        this.read = newNotificationModel.read;
        this.action = JSON.stringify(newNotificationModel.action, converter);
        this.icon = newNotificationModel.icon;
        this.date = newNotificationModel.date;
        this.topOffset = newNotificationModel.topOffset;
        this.insertDate = newNotificationModel.date || new Date();
        this.lastUpdate = newNotificationModel.date || new Date();
        this.lastUpdateUser = "FE_CLIENT";
        this.id = id;
    }
}

function converter(key, val) {
    if (typeof val === 'function' || val && val.constructor === RegExp) {
        let str = ((String(val) as any).replaceAll('"', "'") as string);
        return str;
    }
    return val.replaceAll('"', "'");
}