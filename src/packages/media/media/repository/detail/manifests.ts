import type { ManifestRepository, ManifestStore, ManifestTypes } from '@umbraco-cms/backoffice/extension-registry';

export const UMB_MEDIA_DETAIL_REPOSITORY_ALIAS = 'Umb.Repository.Media.Detail';

const repository: ManifestRepository = {
	type: 'repository',
	alias: UMB_MEDIA_DETAIL_REPOSITORY_ALIAS,
	name: 'Media Detail Repository',
	api: () => import('./media-detail.repository.js'),
};

export const UMB_MEDIA_DETAIL_STORE_ALIAS = 'Umb.Store.Media.Detail';

const store: ManifestStore = {
	type: 'store',
	alias: UMB_MEDIA_DETAIL_STORE_ALIAS,
	name: 'Media Detail Store',
	api: () => import('./media-detail.store.js'),
};

export const manifests: Array<ManifestTypes> = [repository, store];
