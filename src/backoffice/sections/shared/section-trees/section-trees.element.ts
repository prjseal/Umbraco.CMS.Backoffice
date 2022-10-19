import { UUITextStyles } from '@umbraco-ui/uui-css/lib';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map, switchMap, EMPTY, of } from 'rxjs';

import { UmbSectionContext } from '../../section.context';
import { UmbObserverMixin } from '@umbraco-cms/observable-api';
import { UmbExtensionRegistry } from '@umbraco-cms/extensions-api';
import { UmbContextConsumerMixin } from '@umbraco-cms/context-api';

import '../../../trees/shared/tree-extension.element';

@customElement('umb-section-trees')
export class UmbSectionTreesElement extends UmbContextConsumerMixin(UmbObserverMixin(LitElement)) {
	static styles = [UUITextStyles];

	@state()
	private _treeAliases: Array<string> = [];

	private _extensionStore?: UmbExtensionRegistry;
	private _sectionContext?: UmbSectionContext;

	constructor() {
		super();

		this.consumeAllContexts(['umbExtensionRegistry', 'umbSectionContext'], (instances) => {
			this._extensionStore = instances['umbExtensionRegistry'];
			this._sectionContext = instances['umbSectionContext'];
			this._observeTrees();
		});
	}

	private _observeTrees() {
		if (!this._extensionStore || !this._sectionContext) return;

		this.observe<string[]>(
			this._sectionContext?.data.pipe(
				switchMap((section) => {
					if (!section) return EMPTY;

					return (
						this._extensionStore
							?.extensionsOfType('tree')
							.pipe(
								map((trees) =>
									trees.filter((tree) => tree.meta.sections.includes(section.alias)).map((tree) => tree.alias)
								)
							) ?? of([])
					);
				})
			),
			(treeAliases) => {
				this._treeAliases = treeAliases;
			}
		);
	}

	render() {
		return html`${this._treeAliases.map((treeAlias) => html`<umb-tree alias="${treeAlias}"></umb-tree>`)} `;
	}
}

export default UmbSectionTreesElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-section-trees': UmbSectionTreesElement;
	}
}