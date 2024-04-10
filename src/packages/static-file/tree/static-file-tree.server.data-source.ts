import { UMB_STATIC_FILE_ENTITY_TYPE, UMB_STATIC_FILE_FOLDER_ENTITY_TYPE } from '../entity.js';
import type { UmbStaticFileTreeItemModel } from './types.js';
import { UmbServerFilePathUniqueSerializer } from '@umbraco-cms/backoffice/server-file-system';
import type {
	UmbTreeAncestorsOfRequestArgs,
	UmbTreeChildrenOfRequestArgs,
	UmbTreeRootItemsRequestArgs,
} from '@umbraco-cms/backoffice/tree';
import { UmbTreeServerDataSourceBase } from '@umbraco-cms/backoffice/tree';
import {
	StaticFileService,
	type FileSystemTreeItemPresentationModel,
} from '@umbraco-cms/backoffice/external/backend-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

/**
 * A data source for the Static File tree that fetches data from the server
 * @export
 * @class UmbStaticFileTreeServerDataSource
 * @implements {UmbTreeServerDataSourceBase}
 */
export class UmbStaticFileTreeServerDataSource extends UmbTreeServerDataSourceBase<
	FileSystemTreeItemPresentationModel,
	UmbStaticFileTreeItemModel
> {
	/**
	 * Creates an instance of UmbStylesheetTreeServerDataSource.
	 * @param {UmbControllerHost} host
	 * @memberof UmbStylesheetTreeServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		super(host, {
			getRootItems,
			getChildrenOf,
			getAncestorsOf,
			mapper,
		});
	}
}

const getRootItems = (args: UmbTreeRootItemsRequestArgs) =>
	// eslint-disable-next-line local-rules/no-direct-api-import
	StaticFileService.getTreeStaticFileRoot({ skip: args.skip, take: args.take });

const getChildrenOf = (args: UmbTreeChildrenOfRequestArgs) => {
	const parentPath = new UmbServerFilePathUniqueSerializer().toServerPath(args.parentUnique);

	if (parentPath === null) {
		return getRootItems(args);
	} else {
		// eslint-disable-next-line local-rules/no-direct-api-import
		return StaticFileService.getTreeStaticFileChildren({
			parentPath,
			skip: args.skip,
			take: args.take,
		});
	}
};

const getAncestorsOf = (args: UmbTreeAncestorsOfRequestArgs) =>
	// eslint-disable-next-line local-rules/no-direct-api-import
	StaticFileService.getTreeStaticFileAncestors({
		descendantPath: args.descendantUnique,
	});

const mapper = (item: FileSystemTreeItemPresentationModel): UmbStaticFileTreeItemModel => {
	const serializer = new UmbServerFilePathUniqueSerializer();

	return {
		unique: serializer.toUnique(item.path),
		parentUnique: item.parent ? serializer.toUnique(item.parent.path) : null,
		entityType: item.isFolder ? UMB_STATIC_FILE_FOLDER_ENTITY_TYPE : UMB_STATIC_FILE_ENTITY_TYPE,
		name: item.name,
		isFolder: item.isFolder,
		hasChildren: item.hasChildren,
	};
};
