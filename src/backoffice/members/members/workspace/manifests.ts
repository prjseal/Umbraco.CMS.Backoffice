import type {
	ManifestWorkspace,
	ManifestWorkspaceAction,
	ManifestWorkspaceView,
	ManifestWorkspaceViewCollection,
} from '@umbraco-cms/models';

const workspace: ManifestWorkspace = {
	type: 'workspace',
	alias: 'Umb.Workspace.Member',
	name: 'Member Workspace',
	loader: () => import('./member-workspace.element'),
	meta: {
		entityType: 'member',
	},
};

const workspaceViews: Array<ManifestWorkspaceView> = [];
const workspaceViewCollections: Array<ManifestWorkspaceViewCollection> = [];
const workspaceActions: Array<ManifestWorkspaceAction> = [];

export const manifests = [workspace, ...workspaceViews, ...workspaceViewCollections, ...workspaceActions];
