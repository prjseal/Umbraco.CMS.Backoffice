import { UmbRelationTypeDetailRepository } from '../repository/detail/index.js';
import type { UmbRelationTypeDetailModel } from '../types.js';
import { UmbRelationTypeWorkspaceEditorElement } from './relation-type-workspace-editor.element.js';
import { UmbWorkspaceRouteManager } from '@umbraco-cms/backoffice/workspace';
import { UmbObjectState } from '@umbraco-cms/backoffice/observable-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';

export class UmbRelationTypeWorkspaceContext extends UmbContextBase<UmbRelationTypeWorkspaceContext> {
	public readonly workspaceAlias = 'Umb.Workspace.RelationType';
	public readonly repository = new UmbRelationTypeDetailRepository(this);

	#data = new UmbObjectState<UmbRelationTypeDetailModel | undefined>(undefined);
	readonly data = this.#data.asObservable();

	readonly unique = this.#data.asObservablePart((data) => data?.unique);
	readonly name = this.#data.asObservablePart((data) => data?.name);

	readonly routes = new UmbWorkspaceRouteManager(this);

	constructor(host: UmbControllerHost) {
		super(host, 'Umb.Workspace.RelationType');

		this.routes.setRoutes([
			{
				path: 'edit/:unique',
				component: UmbRelationTypeWorkspaceEditorElement,
				setup: (_component, info) => {
					const unique = info.match.params.unique;
					this.load(unique);
				},
			},
		]);
	}

	async load(unique: string) {
		const { data } = await this.repository.requestByUnique(unique);

		if (data) {
			this.#data.update(data);
		}
	}

	getData() {
		return this.#data.getValue();
	}

	getUnique() {
		return this.getData()?.unique;
	}

	getEntityType() {
		return 'relation-type';
	}

	public destroy(): void {
		this.#data.destroy();
		super.destroy();
	}
}

export { UmbRelationTypeWorkspaceContext as api };
