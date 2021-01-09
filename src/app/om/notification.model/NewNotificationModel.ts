export class NewNotificationModel {
    title: string;
    content: string;
    action?: Function;
    icon?: string;
    date?: Date;
    topOffset?: number;
    constructor(
        title: string,
        content: string,
        action?: Function,
        icon?: string,
        date?: Date, 
        topOffset?: number
    ){
        this.title = title;
        this.content = content;
        this.action = action;
        this.icon = icon;
        this.date = date;
        this.topOffset = topOffset;
    }
}