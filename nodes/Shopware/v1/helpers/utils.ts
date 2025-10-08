import {
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
} from 'n8n-workflow';
import { currencyFields } from '../actions/product/fields';
import { apiRequest } from '../transport';
import {
	genericFields,
	lineItemFields,
	orderAddressFields,
	orderCustomerFields,
} from '../actions/fields';
import {
	CustomerAddressResponse,
	CustomerResponse,
	DeliveryTimeResponse,
	LineItemResponse,
	OrderCustomerResponse,
	ProductResponse,
	ShippingMethodDataResponse,
	ShippingMethodPrice,
} from '../actions/types';

export function wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (!Array.isArray(data)) {
		return [{ json: data }];
	}
	return data.map((item) => ({
		json: item,
	}));
}

/**
 * Generates shopware UUIDv7.
 *
 * @returns A promise resolving to a string representing the uuid
 */
export function uuidv7(): string {
	const hex = (n: number, width: number) => n.toString(16).padStart(width, '0');

	const now = Date.now();
	const timeHex = hex(now, 12);

	const rand1 = hex(Math.floor(Math.random() * 0xffff), 4);
	const rand2 = hex(Math.floor(Math.random() * 0xffff), 4);
	const rand3 = hex(Math.floor(Math.random() * 0xffffff), 6);
	const rand4 = hex(Math.floor(Math.random() * 0xffffff), 6);

	return timeHex.slice(0, 8) + timeHex.slice(8, 12) + '7' + rand1.slice(1) + rand2 + rand3 + rand4;
}

/**
 * Retrieves the Shopware instance's default installation currency.
 *
 * @returns A promise resolving to a string representing the currencyId
 */
export async function getDefaultCurrencyId(this: IExecuteFunctions): Promise<string> {
	const body = {
		fields: currencyFields,
		includes: {
			currency: currencyFields,
		},
		filter: [
			{
				type: 'equals',
				field: 'factor',
				value: 1,
			},
		],
	};
	const response = await apiRequest.call(this, 'POST', `/search/currency`, body);
	return response.data[0].id;
}

/**
 * Retrieves the Shopware instance's default installation language.
 *
 * @returns A promise resolving to a string representing the languageId
 */
export async function getDefaultLanguageId(this: IExecuteFunctions): Promise<string> {
	const body = {
		fields: genericFields,
		includes: {
			language: genericFields,
		},
		filter: [
			{
				type: 'equals',
				field: 'name',
				value: 'English',
			},
		],
	};
	const response = await apiRequest.call(this, 'POST', `/search/language`, body);
	return response.data[0].id;
}

/**
 * Retrieves the system default tax rate.
 *
 * @returns A promise resolving to a number representing the default tax rate
 */
export async function getDefaultTaxRate(this: IExecuteFunctions): Promise<number> {
	const body = {
		fields: ['configurationValue'],
		filter: [
			{
				type: 'equals',
				field: 'configurationKey',
				value: 'core.tax.defaultTaxRate',
			},
		],
	};

	const taxId = (await apiRequest.call(this, 'POST', `/search/system-config`, body)).data[0]
		.configurationValue;

	const taxRate = await getTaxRate.call(this, taxId);

	return taxRate;
}

/**
 * Retrieves the default shipping method.
 *
 * @returns A promise resolving to a string representing the shipping method
 */
export async function getDefaultShippingMethod(this: IExecuteFunctions): Promise<string> {
	const body = {
		filter: [
			{
				type: 'equals',
				field: 'technicalName',
				value: 'shipping_standard',
			},
		],
	};

	return (await apiRequest.call(this, 'POST', `/search/shipping-method`, body)).data[0].id;
}

/**
 * Retrieves shipping method data for orders.
 *
 * @param shippingMethodId - The ID of the shpping method
 * @param currencyId - Order currency ID
 * @returns A promise resolving to a shipping method data response
 */
export async function getShippingMethodData(
	this: IExecuteFunctions,
	shippingMethodId: string,
	currencyId: string,
): Promise<ShippingMethodDataResponse> {
	const body = {
		associations: {
			prices: {},
		},
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: shippingMethodId,
			},
		],
	};
	const shippingMethod = (await apiRequest.call(this, 'POST', `/search/shipping-method`, body))
		.data[0];

	const unitPrice = (shippingMethod.prices[0].currencyPrice as Array<ShippingMethodPrice>).filter(
		(price) => price.currencyId === currencyId,
	)[0].net;

	const taxId = shippingMethod.taxId as string;

	let taxRate: number;
	if (taxId) {
		taxRate = await getTaxRate.call(this, taxId);
	} else {
		taxRate = await getDefaultTaxRate.call(this);
	}

	return { unitPrice, taxRate };
}

/**
 * Retrieves the provided product's tax rate.
 *
 * @param productId - The product UUID
 * @returns A promise resolving to a number representing the tax rate
 */
export async function getProductTaxRate(
	this: IExecuteFunctions,
	productId: string,
): Promise<number> {
	const productBody = {
		fields: ['taxId'],
		includes: {
			product: ['taxId'],
		},
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: productId,
			},
		],
	};

	const taxId = (await apiRequest.call(this, 'POST', `/search/product`, productBody)).data[0].taxId;

	const taxRate = await getTaxRate.call(this, taxId);

	return taxRate;
}

async function getTaxRate(this: IExecuteFunctions, taxId: string): Promise<number> {
	const taxBody = {
		fields: ['taxRate'],
		includes: {
			tax: ['taxRate'],
		},
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: taxId,
			},
		],
	};

	const taxRate = (await apiRequest.call(this, 'POST', `/search/tax`, taxBody)).data[0].taxRate;

	return taxRate;
}

/**
 * Retrieves a customer by customer number.
 *
 * @param customerNumber - The customer number to retrieve by
 * @param itemIndex - The index of the current node item
 * @returns A promise resolving to a customer response
 */
export async function getCustomerByNumber(
	this: IExecuteFunctions,
	customerNumber: string,
	itemIndex: number
): Promise<OrderCustomerResponse> {
	const customerBody = {
		fields: orderCustomerFields,
		includes: {
			customer: orderCustomerFields,
		},
		filter: [
			{
				type: 'equals',
				field: 'customerNumber',
				value: customerNumber,
			},
		],
	};

	const customer = (await apiRequest.call(this, 'POST', `/search/customer`, customerBody))
		.data[0] as CustomerResponse;

	if (!customer) {
				throw new NodeOperationError(this.getNode(), 'No customer found', {
					description: 'There is no customer associated with customer number ' + customerNumber,
					itemIndex,
				});
	}

	const [billingAddress, shippingAddress] = await Promise.all([
		getCustomerAddress.call(this, customer.defaultBillingAddressId),
		getCustomerAddress.call(this, customer.defaultShippingAddressId),
	]);

	return { ...customer, billingAddress, shippingAddress };
}

async function getCustomerAddress(
	this: IExecuteFunctions,
	addressId: string,
): Promise<CustomerAddressResponse> {
	const customerAddressBody = {
		fields: orderAddressFields,
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: addressId,
			},
		],
	};

	const address = (
		await apiRequest.call(this, 'POST', `/search/customer-address`, customerAddressBody)
	).data[0] as CustomerAddressResponse;

	return address;
}

/**
 * Retrieves order line item data by a product number.
 *
 * @param productNumber - The product number to retrieve the data by
 * @param currencyId - Line item price currency ID
 * @param itemIndex - Index of the current node item
 * @returns A promise resolving to a line item response
 */
export async function getLineItemData(
	this: IExecuteFunctions,
	productNumber: string,
	currencyId: string,
	itemIndex: number,
): Promise<LineItemResponse> {
	const body = {
		fields: lineItemFields,
		includes: {
			product: lineItemFields,
		},
		filter: [
			{
				type: 'equals',
				field: 'productNumber',
				value: productNumber,
			},
		],
	};

	const product = (await apiRequest.call(this, 'POST', `/search/product`, body))
		.data[0] as ProductResponse;

	if (!product) {
				throw new NodeOperationError(this.getNode(), 'No product found', {
					description: 'There is no product associated with product number ' + productNumber,
					itemIndex,
				});
	}

	const taxRate = await getTaxRate.call(this, product.taxId);

	const price = product.price.filter((price) => price.currencyId === currencyId)[0];

	if (!price) {
		throw new NodeOperationError(this.getNode(), 'Line item price missing', {
			description: `Line item with product number ${productNumber} does not have a price for the selected order currency`,
			itemIndex,
		});
	}

	return {
		identifier: product.id,
		productId: product.id,
		label: product.name,
		states: product.states,
		unitPrice: price.net,
		taxRate,
	};
}

export async function getShippingDeliveryTime(
	this: IExecuteFunctions,
	shippingMethodId: string,
): Promise<DeliveryTimeResponse> {
	const body = {
		filter: [
			{
				type: 'equals',
				field: 'id',
				value: shippingMethodId,
			},
		],
	};
	const { min, max, unit } = (await apiRequest.call(this, 'POST', `/search/shipping-method`, body))
		.data[0].deliveryTime;

	return { min, max, unit };
}

export async function getPrePaymentOrderStates(this: IExecuteFunctions): Promise<Array<string>> {
	const body = {
		filter: [
			{
				type: 'equals',
				field: 'technicalName',
				value: 'order.state',
			},
		],
		associations: {
			states: {},
		},
	};

	const states = (await apiRequest.call(this, 'POST', `/search/state-machine`, body)).data[0]
		.states as Array<{ id: string; technicalName: string }>;

	const prePaymentStates = states
		.filter((state) => ['open', 'in_progress'].includes(state.technicalName))
		.map((state) => state.id);

	return prePaymentStates;
}
