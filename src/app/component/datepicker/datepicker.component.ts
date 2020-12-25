import { Component } from "@angular/core";

interface IPerson {
    name: string;
    socialSecurityNumber: string;
    birthday: Date;
    phone: string;
}

@Component({
    selector: "datepicker",
    templateUrl: "./datepicker.component.html",
    styleUrls: ["./datepicker.component.scss"]
})
export class DatepickerDropdownComponent {
    person: IPerson;

    constructor() {
        this.person = {
            name: 'John Doe',
            socialSecurityNumber: '',
            birthday: new Date('8/10/2019'),
            phone: ''
        };
    }
}
