import { css, html, nothing, repeat, customElement, property } from '@umbraco-cms/backoffice/external/lit';
import { UUIFormControlMixin, UUIRadioElement } from '@umbraco-cms/backoffice/external/uui';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UUIRadioEvent } from '@umbraco-cms/backoffice/external/uui';

type UmbRadioButtonItem = { label: string; value: string };

@customElement('umb-input-radio-button-list')
export class UmbInputRadioButtonListElement extends UUIFormControlMixin(UmbLitElement, '') {
	#value: string = '';

	@property()
	public set value(value: string) {
		this.#value = value;
	}
	public get value(): string {
		return this.#value;
	}

	@property({ type: Array })
	public list: Array<UmbRadioButtonItem> = [];

	protected getFormElement() {
		return undefined;
	}

	#onChange(event: UUIRadioEvent) {
		event.stopPropagation();
		if (!(event.target instanceof UUIRadioElement)) return;
		this.value = event.target.value;
		this.dispatchEvent(new UmbChangeEvent());
	}

	render() {
		if (!this.list) return nothing;

		return html`
			<uui-radio-group .value=${this.value} @change=${this.#onChange}>
				${repeat(
					this.list,
					(item) => item,
					(item) => this.#renderRadioButton(item),
				)}
			</uui-radio-group>
		`;
	}

	#renderRadioButton(item: (typeof this.list)[0]) {
		return html`<uui-radio value=${item.value} label=${item.label}></uui-radio>`;
	}

	static styles = [
		css`
			:host {
				display: block;
			}
		`,
	];
}

export default UmbInputRadioButtonListElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-input-radio-button-list': UmbInputRadioButtonListElement;
	}
}
