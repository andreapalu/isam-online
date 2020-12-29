import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthorResource } from "../../om/json-server.model/Author";
import { CommunicationManagerService, HttpVerbs } from "../communicationManager.service";

@Injectable()
export class AuthorService {

    constructor(
        private communicationManagerService: CommunicationManagerService
    ) { }

    getAuthors(): Observable<AuthorResource[]> {
        return this.communicationManagerService.callMockService<AuthorResource[]>(
            {
                apiEndpoint: "author-api/getAuthors",
                apiMethod: HttpVerbs.get
            }
        )
    }

    deleteAuthor(author: AuthorResource) {
        return this.communicationManagerService.callMockService<AuthorResource[]>({
            apiEndpoint: "author-api/deleteAuthor",
            apiMethod: HttpVerbs.delete,
            pathParams: {
                id: author.id.toString()
            }
        })
    }

    postAuthor(author: AuthorResource): Observable<AuthorResource> {
        return this.communicationManagerService.callMockService<AuthorResource>({
            apiEndpoint: "author-api/postAuthor",
            apiMethod: HttpVerbs.post,
            body: author
        })
    }

    updateAuthor(author: AuthorResource): Observable<AuthorResource> {
        return this.communicationManagerService.callMockService<AuthorResource>({
            apiEndpoint: "author-api/updateAuthor",
            apiMethod: HttpVerbs.put,
            pathParams: {
                id: author.id.toString()
            },
            body: author
        })
    }

}