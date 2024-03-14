import { UmbUnpublishDocumentEntityAction } from '../../entity-actions/unpublish.action.js';
import { UMB_DOCUMENT_ENTITY_TYPE } from '../../entity.js';
import { UmbDocumentPublishingRepository } from '../../repository/index.js';
import type { UmbDocumentVariantOptionModel } from '../../types.js';
import { UMB_DOCUMENT_UNPUBLISH_MODAL } from '../../modals/index.js';
import { UMB_CONFIRM_MODAL, UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UmbEntityBulkActionBase } from '@umbraco-cms/backoffice/entity-bulk-action';
import { UMB_APP_LANGUAGE_CONTEXT, UmbLanguageCollectionRepository } from '@umbraco-cms/backoffice/language';
import { UmbVariantId } from '@umbraco-cms/backoffice/variant';
import { UmbLocalizationController } from '@umbraco-cms/backoffice/localization-api';

export class UmbDocumentUnpublishEntityBulkAction extends UmbEntityBulkActionBase<object> {
	async execute() {
		// If there is only one selection, we can refer to the regular unpublish entity action:
		if (this.selection.length === 1) {
			const action = new UmbUnpublishDocumentEntityAction(this._host, {
				unique: this.selection[0],
				entityType: UMB_DOCUMENT_ENTITY_TYPE,
				meta: {},
			});
			await action.execute();
			return;
		}

		const languageRepository = new UmbLanguageCollectionRepository(this._host);
		const { data: languageData } = await languageRepository.requestCollection({});

		const options: UmbDocumentVariantOptionModel[] = (languageData?.items ?? []).map((language) => ({
			language,
			variant: {
				name: language.name,
				culture: language.unique,
				state: null,
				createDate: null,
				publishDate: null,
				updateDate: null,
				segment: null,
			},
			unique: new UmbVariantId(language.unique, null).toString(),
			culture: language.unique,
			segment: null,
		}));

		const modalManagerContext = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);

		// If there is only one language available, we can skip the modal and unpublish directly:
		if (options.length === 1) {
			const localizationController = new UmbLocalizationController(this._host);
			const confirm = await modalManagerContext
				.open(this, UMB_CONFIRM_MODAL, {
					data: {
						headline: localizationController.term('actions_unpublish'),
						content: localizationController.term('prompt_confirmListViewUnpublish'),
						color: 'danger',
						confirmLabel: localizationController.term('actions_unpublish'),
					},
				})
				.onSubmit()
				.catch(() => false);

			if (confirm !== false) {
				const variantId = new UmbVariantId(options[0].language.unique, null);
				const publishingRepository = new UmbDocumentPublishingRepository(this._host);
				await publishingRepository.unpublish(this.selection[0], [variantId]);
			}
			return;
		}

		// Figure out the default selections
		// TODO: Missing features to pre-select the variant that fits with the variant-id of the tree/collection? (Again only relevant if the action is executed from a Tree or Collection) [NL]
		const selection: Array<string> = [];
		const context = await this.getContext(UMB_APP_LANGUAGE_CONTEXT);
		const appCulture = context.getAppCulture();
		// If the app language is one of the options, select it by default:
		if (appCulture && options.some((o) => o.unique === appCulture)) {
			selection.push(new UmbVariantId(appCulture, null).toString());
		}

		const result = await modalManagerContext
			.open(this, UMB_DOCUMENT_UNPUBLISH_MODAL, {
				data: {
					options,
				},
				value: { selection },
			})
			.onSubmit()
			.catch(() => undefined);

		if (!result?.selection.length) return;

		const variantIds = result?.selection.map((x) => UmbVariantId.FromString(x)) ?? [];

		const repository = new UmbDocumentPublishingRepository(this._host);

		if (variantIds.length) {
			for (const unique of this.selection) {
				await repository.unpublish(unique, variantIds);
			}
		}
	}
}
