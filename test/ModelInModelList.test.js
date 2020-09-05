import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';
import List from '../src/List';

class TextModel extends Model {
	definition() {
		return {
			id: new IntegerType(),
			text: new StringType(),
			languageId: new IntegerType()
		};
	}
}

class TextsList extends List {
	definition() {
		return TextModel;
	}

	/**
	 * @param {number} languageId
	 * @return {string|null}
	 */
	translated(languageId) {
		if (typeof languageId !== 'number') {
			throw new TypeError(`Expected number, got ${typeof languageId}`);
		}

		// find the translation for requested language

		const text = this.find((el) => el.languageId === languageId) || null;
		return text ? text.text : null;
	}

	/**
	 * @param {number} languageId
	 * @param {string} text
	 */
	setTranslated(languageId, text) {
		const index = this.findIndex((el) => el.languageId === languageId);

		if (index >= 0) {
			const el = this.get(index).clone();
			el.text = text;
			this.set(index, el);
		}
	}
}

class PriceListItemModel extends Model {
	definition() {
		return {
			id: new IntegerType().notNull(),
			name: TextsList
		};
	}
}

class PriceListItemsList extends List {
	definition() {
		return PriceListItemModel;
	}

	removeItemById(id) {
		const index = this.findIndex((el) => el.id === id);

		if (index >= 0) {
			this.splice(index, 1);
		}
	}
}

describe('Testing Model in Model List', () => {
	it('Testing complex case', () => {
		const item = PriceListItemModel.create({
			id: 1,
			name: [
				{languageId: 1, text: 'English'},
				{languageId: 2, text: 'Croatian'}
			]
		});

		const name = item.name.clone();
		name.setTranslated(2, 'Hrvatski');

		const newItem = PriceListItemModel.create({
			id: item.id,
			name
		});

		expect(newItem.name[1].text).toBe('Hrvatski');
	});
});
