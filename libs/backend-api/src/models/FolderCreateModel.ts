/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FolderModelBaseModel } from './FolderModelBaseModel';

export type FolderCreateModel = (FolderModelBaseModel & {
    parentKey?: string | null;
});
