import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';
import List from '../src/List';

class QuantityAndPriceModel extends Model {
	definition() {
		return {
			id: new IntegerType(),
			text: new StringType()
		};
	}
}

class QuantitiesAndPricesList extends List {
	definition() {
		return QuantityAndPriceModel;
	}
}

class ItemModel extends Model {
	definition() {
		return {
			id: new IntegerType(),
			name: new StringType(),
			quantityAndPrices: QuantitiesAndPricesList
		};
	}
}


describe('Testing List in Model', () => {
	it('Testing simple case', () => {
		const item = ItemModel.create();
		expect(item).toBeInstanceOf(ItemModel);
		expect(item.quantityAndPrices).toBeInstanceOf(QuantitiesAndPricesList);

		item.quantityAndPrices = [];
		expect(item.quantityAndPrices).toBeInstanceOf(QuantitiesAndPricesList);
	});

	it('Testing simple with data case', () => {
		const item = ItemModel.create({
			id: 1,
			name: 'Car tyre',
			quantityAndPrices: [{
				id: 51,
				text: 'A good tyre for summer'
			},{
				id: 52,
				text: 'A good tyre for winter'
			}]
		});

		expect(item.quantityAndPrices.length).toBe(2);
		expect(item.quantityAndPrices[1].id).toBe(52);

		const item2 = item.clone();
		const newQuantities = item2.quantityAndPrices.clone();
		newQuantities.splice(0, 1);
		item2.quantityAndPrices = newQuantities;

		expect(item2.quantityAndPrices).toBeInstanceOf(QuantitiesAndPricesList);
		expect(item2.quantityAndPrices.length).toBe(1);
		expect(item2.quantityAndPrices[0].id).toBe(52);
		expect(item === item2).toBeFalsy();
	});
});
