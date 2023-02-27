/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PagedHelpPageModel } from '../models/PagedHelpPageModel';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HelpResource {

    /**
     * @returns PagedHelpPageModel Success
     * @throws ApiError
     */
    public static getHelp({
        section,
        tree,
        skip,
        take,
        baseUrl = 'https://our.umbraco.com',
    }: {
        section?: string,
        tree?: string,
        skip?: number,
        take?: number,
        baseUrl?: string,
    }): CancelablePromise<PagedHelpPageModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/umbraco/management/api/v1/help',
            query: {
                'section': section,
                'tree': tree,
                'skip': skip,
                'take': take,
                'baseUrl': baseUrl,
            },
            errors: {
                400: `Bad Request`,
            },
        });
    }

}