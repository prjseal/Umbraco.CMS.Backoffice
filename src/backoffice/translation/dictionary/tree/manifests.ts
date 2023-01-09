import type { ManifestTree, ManifestTreeItemAction } from '@umbraco-cms/models';

const treeAlias = 'Umb.Tree.Dictionary';

const tree: ManifestTree = {
	type: 'tree',
	alias: treeAlias,
	name: 'Dictionary Tree',
	meta: {
		storeAlias: 'umbDictionaryStore',
	},
};

const treeItemActions: Array<ManifestTreeItemAction> = [];

export const manifests = [tree, ...treeItemActions];