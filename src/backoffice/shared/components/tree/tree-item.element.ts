import { css, html } from 'lit';
import { UUITextStyles } from '@umbraco-ui/uui-css/lib';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { UUIMenuItemEvent } from '@umbraco-ui/uui';
import { map, Observable } from 'rxjs';
import { repeat } from 'lit/directives/repeat.js';
import { UmbSectionContext } from '../section/section.context';
import type { UmbTreeContextBase } from './tree.context';
import { UmbTreeContextMenuService } from './context-menu/tree-context-menu.service';
import type { Entity } from '@umbraco-cms/models';
import { UmbTreeDataStore } from '@umbraco-cms/stores/store';
import { UmbLitElement } from '@umbraco-cms/element';

@customElement('umb-tree-item')
export class UmbTreeItem extends UmbLitElement {
	static styles = [UUITextStyles, css``];

	@property({ type: Object, attribute: false })
	treeItem!: Entity;

	@state()
	private _childItems?: Entity[];

	@state()
	private _href?:string;

	@state()
	private _loading = false;

	@state()
	private _selectable = false;

	@state()
	private _selected = false;

	@state()
	private _isActive = false;

	private _treeContext?: UmbTreeContextBase;
	private _store?: UmbTreeDataStore<unknown>;
	private _sectionContext?: UmbSectionContext;
	private _treeContextMenuService?: UmbTreeContextMenuService;

	constructor() {
		super();

		this.consumeContext('umbTreeContext', (treeContext: UmbTreeContextBase) => {
			this._treeContext = treeContext;
			this._observeSelectable();
			this._observeIsSelected();
		});

		this.consumeContext('umbStore', (store: UmbTreeDataStore<unknown>) => {
			this._store = store;
		});

		this.consumeContext('umbSectionContext', (sectionContext: UmbSectionContext) => {
			this._sectionContext = sectionContext;
			this._observeSection();
			this._observeActiveTreeItem();
		});

		this.consumeContext('umbTreeContextMenuService', (treeContextMenuService: UmbTreeContextMenuService) => {
			this._treeContextMenuService = treeContextMenuService;
		});
	}

	connectedCallback(): void {
		super.connectedCallback();

		this.addEventListener('selected', this._handleSelectedItem);
		this.addEventListener('unselected', this._handleDeselectedItem);
	}

	private _handleSelectedItem(event: Event) {
		event.stopPropagation();
		this._treeContext?.select(this.treeItem.key);
	}

	private _handleDeselectedItem(event: Event) {
		event.stopPropagation();
		this._treeContext?.deselect(this.treeItem.key);
	}

	private _observeSection() {
		if (!this._sectionContext) return;

		this.observe(this._sectionContext?.data, (section) => {
			this._href = this._constructPath(section?.meta.pathname || '', this.treeItem.type, this.treeItem.key);
		});
	}

	private _observeSelectable() {
		if (!this._treeContext) return;

		this.observe(this._treeContext.selectable, (value) => {
			this._selectable = value || false;
		});
	}

	private _observeIsSelected() {
		if (!this._treeContext) return;

		this.observe(
			this._treeContext.selection.pipe(map((keys) => keys?.includes(this.treeItem.key))),
			(isSelected) => {
				this._selected = isSelected || false;
			}
		);
	}

	private _observeActiveTreeItem() {
		if (!this._sectionContext) return;

		this.observe(this._sectionContext?.activeTreeItem, (treeItem) => {
			this._isActive = treeItem?.key === this.treeItem.key;
		});
	}

	// TODO: how do we handle this?
	private _constructPath(sectionPathname: string, type: string, key: string) {
		return type ? `section/${sectionPathname}/${type}/${key}` : undefined;
	}

	private _onShowChildren(event: UUIMenuItemEvent) {
		event.stopPropagation();
		if (this._childItems && this._childItems.length > 0) return;
		this._observeChildren();
	}

	private _observeChildren() {
		if (!this._store?.getTreeItemChildren) return;

		this._loading = true;

		// TODO: we should do something about these types, stop having our own version of Entity.
		this.observe(this._store.getTreeItemChildren(this.treeItem.key) as Observable<Entity[]>, (childItems) => {
			this._childItems = childItems;
			this._loading = false;
		});
	}

	private _renderChildItems() {
		return html`
			${this._childItems ? repeat(
				this._childItems,
				(item) => item.key,
				(item) => html`<umb-tree-item .treeItem=${item}></umb-tree-item>`
			) : ''}
		`;
	}

	private _openActions() {
		if (!this._treeContext || !this._sectionContext || !this.treeItem) return;

		this._sectionContext?.setActiveTree(this._treeContext?.tree);
		this._sectionContext?.setActiveTreeItem(this.treeItem);
		this._treeContextMenuService?.open({ name: this.treeItem.name, key: this.treeItem.key });
	}

	render() {
		return html`
			<uui-menu-item
				@show-children=${this._onShowChildren}
				?selectable=${this._selectable}
				?selected=${this._selected}
				.loading=${this._loading}
				.hasChildren=${this.treeItem.hasChildren}
				label="${this.treeItem.name}"
				href="${ifDefined(this._href)}"
				?active=${this._isActive}>
				${this._renderChildItems()}
				<uui-icon slot="icon" name="${this.treeItem.icon}"></uui-icon>
				<uui-action-bar slot="actions">
					<uui-button @click=${this._openActions} label="Open actions menu">
						<uui-symbol-more></uui-symbol-more>
					</uui-button>
				</uui-action-bar>
			</uui-menu-item>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-tree-item': UmbTreeItem;
	}
}