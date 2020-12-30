import { HttpVerbs } from "../../app/service/communicationManager.service";

export class ApiCatalogModel {
    name: string;
    baseUrl: string;
    endpoint: string;
    method: HttpVerbs;
    host?: string;
}