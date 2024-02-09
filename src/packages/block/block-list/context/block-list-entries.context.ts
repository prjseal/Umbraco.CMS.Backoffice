import type { UmbBlockDataType } from '../../block/index.js';
import { UMB_BLOCK_CATALOGUE_MODAL, UmbBlockEntriesContext } from '../../block/index.js';
import type { UmbBlockListWorkspaceData } from '../index.js';
import type { UmbBlockListLayoutModel, UmbBlockListTypeModel } from '../types.js';
import { UMB_BLOCK_LIST_MANAGER_CONTEXT } from './block-list-manager.context.js';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { type UmbModalRouteBuilder, UmbModalRouteRegistrationController } from '@umbraco-cms/backoffice/modal';

export class UmbBlockListEntriesContext extends UmbBlockEntriesContext<
	typeof UMB_BLOCK_LIST_MANAGER_CONTEXT,
	typeof UMB_BLOCK_LIST_MANAGER_CONTEXT.TYPE,
	UmbBlockListTypeModel,
	UmbBlockListLayoutModel
> {
	//
	#catalogueModal: UmbModalRouteRegistrationController<typeof UMB_BLOCK_CATALOGUE_MODAL.DATA, undefined>;
	#catalogueRouteBuilder?: UmbModalRouteBuilder;

	setParentKey(contentUdi: string) {
		this.#catalogueModal.setUniquePathValue('parentUnique', contentUdi);
	}
	getParentKey() {
		return '';
	}

	setAreaKey(areaKey: string) {
		this.#catalogueModal.setUniquePathValue('areaKey', areaKey);
	}
	getAreaKey() {
		return '';
	}

	constructor(host: UmbControllerHost) {
		super(host, UMB_BLOCK_LIST_MANAGER_CONTEXT);

		this.#catalogueModal = new UmbModalRouteRegistrationController(this, UMB_BLOCK_CATALOGUE_MODAL)
			.addUniquePaths(['propertyAlias', 'parentUnique', 'areaKey'])
			.addAdditionalPath(':view/:index')
			.onSetup((routingInfo) => {
				// Idea: Maybe on setup should be async, so it can retrieve the values when needed? [NL]
				const index = routingInfo.index ? parseInt(routingInfo.index) : -1;
				return {
					data: {
						blocks: [],
						blockGroups: [],
						openClipboard: routingInfo.view === 'clipboard',
						blockOriginData: { index: index },
					},
				};
			})
			.observeRouteBuilder((routeBuilder) => {
				this.#catalogueRouteBuilder = routeBuilder;
				// TODO: Trigger render update?
			});
	}

	protected _gotBlockManager() {
		if (!this._manager) return;

		this.observe(this._manager.layouts, (layouts) => {
			this._layoutEntries.setValue(layouts);
		});

		this.observe(this.layoutEntries, (layouts) => {
			this._manager?.setLayouts(layouts);
		});

		this.observe(
			this._manager.propertyAlias,
			(alias) => {
				this.#catalogueModal.setUniquePathValue('propertyAlias', alias ?? 'null');
			},
			'observePropertyAlias',
		);
	}

	getPathForCreateBlock(index: number) {
		return this.#catalogueRouteBuilder?.({ view: 'create', index: index });
	}

	getPathForClipboard(index: number) {
		return this.#catalogueRouteBuilder?.({ view: 'clipboard', index: index });
	}

	async create(
		contentElementTypeKey: string,
		partialLayoutEntry?: Omit<UmbBlockListLayoutModel, 'contentUdi'>,
		modalData?: UmbBlockListWorkspaceData,
	) {
		await this._retrieveManager;
		return this._manager?.create(contentElementTypeKey, partialLayoutEntry, modalData);
	}

	// insert Block?

	async insert(
		layoutEntry: UmbBlockListLayoutModel,
		content: UmbBlockDataType,
		settings: UmbBlockDataType | undefined,
		modalData: UmbBlockListWorkspaceData,
	) {
		await this._retrieveManager;
		return this._manager?.insert(layoutEntry, content, settings, modalData) ?? false;
	}

	// create Block?
	async delete(contentUdi: string) {
		// TODO: Loop through children and delete them as well?
		await super.delete(contentUdi);
	}
}
