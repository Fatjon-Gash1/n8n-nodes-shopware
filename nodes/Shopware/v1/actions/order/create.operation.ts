/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-dynamic-options */
/* eslint-disable n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options */
/* We only allow to select existing entities (e.g. categories, manufacturers, tax rates, etc.) by name for UX convenience. Therefore, we disable the relevant ESLint rules. */

import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
	NodeOperationError,
	randomString,
} from 'n8n-workflow';
import type {
	Address,
	AddressValues,
	CustomerData,
	Delivery,
	GenericPrice,
	GlobalDefaults,
	NodeCustomerAddressDetails,
	NodeCustomerDetails,
	NodeDelivery,
	NodeLineItem,
	NodeTransaction,
	OrderCreatePayload,
	OrderCustomer,
	Rounding,
	Transaction,
} from './types';
import { apiRequest } from '../../transport';
import { orderFields } from './fields';
import {
	wrapData,
	uuidv7,
	getCustomerByNumber,
	getLineItemData,
	getShippingMethodData,
	getDefaultTaxRate,
	getShippingDeliveryTime,
	getDefaultShippingMethod,
	getDefaultLanguageId,
} from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Order Number',
		name: 'orderNumber',
		type: 'string',
		default: '',
		placeholder: 'e.g. ON752834790',
		description: 'Optional order identifier',
	},
	{
		displayName: 'Date and Time',
		name: 'dateAndTime',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Optional order date and time',
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getOrderCurrencies',
		},
		default: '',
		description: 'Choose the order currency from the list',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getOrderStates',
		},
		default: '',
		description: 'Choose the order state from the list',
	},
	{
		displayName: 'Guest Order',
		name: 'guestOrder',
		type: 'boolean',
		default: false,
		description: 'Whether the order is a guest order',
	},
	{
		displayName: 'Guest',
		name: 'guestUi',
		placeholder: 'Add Guest Details',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: false,
		},
		displayOptions: {
			show: {
				guestOrder: [true],
			},
		},
		description: 'Add guest order details',
		options: [
			{
				name: 'guestValues',
				displayName: 'Guest Details',
				values: [
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						required: true,
						default: '',
						description: 'Guest customer first name',
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						required: true,
						default: '',
						description: 'Guest customer last name',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@email.com',
						required: true,
						default: '',
						description: 'Guest customer email',
					},
					{
						displayName: 'Salutation',
						name: 'salutation',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getSalutations',
						},
						required: true,
						default: '',
						description: 'Guest customer salutation',
					},
				],
			},
		],
	},
	{
		displayName: 'Billing Address',
		name: 'billingAddressUi',
		placeholder: 'Add Billing Address',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: false,
		},
		displayOptions: {
			show: {
				guestOrder: [true],
			},
		},
		description: 'Add guest billing address',
		options: [
			{
				name: 'billingAddressValues',
				displayName: 'Billing Address',
				values: [
					{
						displayName: 'Country',
						name: 'country',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCountries',
						},
						required: true,
						default: '',
						description: 'Country of the billing address',
					},
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						required: true,
						default: '',
						description: 'Customer first name',
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						required: true,
						default: '',
						description: 'Customer last name',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						required: true,
						default: '',
						description: 'Billing address city',
					},
					{
						displayName: 'Street',
						name: 'street',
						type: 'string',
						required: true,
						default: '',
						description: 'Billing address street',
					},
				],
			},
		],
	},
	{
		displayName: 'Shipping Address',
		name: 'shippingAddressUi',
		placeholder: 'Add Shipping Address',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: false,
		},
		displayOptions: {
			show: {
				guestOrder: [true],
			},
		},
		description: 'Add guest shipping address',
		options: [
			{
				name: 'shippingAddressValues',
				displayName: 'Shipping Address',
				values: [
					{
						displayName: 'Country',
						name: 'country',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCountries',
						},
						required: true,
						default: '',
						description: 'Country of the shipping address',
					},
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						required: true,
						default: '',
						description: 'Customer first name',
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						required: true,
						default: '',
						description: 'Customer last name',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						required: true,
						default: '',
						description: 'Shipping address city',
					},
					{
						displayName: 'Street',
						name: 'street',
						type: 'string',
						required: true,
						default: '',
						description: 'Shipping address street',
					},
				],
			},
		],
	},
	{
		displayName: 'Sales Channel',
		name: 'salesChannel',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSalesChannels',
		},
		displayOptions: {
			show: {
				guestOrder: [true],
			},
		},
		default: '',
		description: 'Select sales channel for the guest order',
	},
	{
		displayName: 'Customer Number',
		name: 'customerNumber',
		type: 'string',
		displayOptions: {
			show: {
				guestOrder: [false],
			},
		},
		default: '',
		placeholder: 'e.g. C10001',
		description: 'Number of the order customer',
	},
	{
		displayName: 'Line Items',
		name: 'lineItems',
		placeholder: 'Add Line Item',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Order line items',
		default: {},
		options: [
			{
				name: 'lineItem',
				displayName: 'Line Item',
				values: [
					{
						displayName: 'Product Number',
						name: 'productNumber',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'e.g. P10001',
						description: 'Line item product number',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						typeOptions: {
							maxValue: 999000000,
							minValue: 0,
						},
						required: true,
						default: 1,
						placeholder: 'e.g. 5',
						description: 'Line item quantity',
					},
				],
			},
		],
	},
	{
		displayName: 'Transactions',
		name: 'transactions',
		placeholder: 'Add Transaction',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Order transactions',
		default: {},
		options: [
			{
				name: 'transaction',
				displayName: 'Transaction',
				values: [
					{
						displayName: 'Payment Method',
						name: 'paymentMethod',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getPaymentMethods',
						},
						required: true,
						default: '',
						description: 'Transaction payment method',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getTransactionStates',
						},
						required: true,
						default: '',
						description: 'State of the transaction (e.g. Paid)',
					},
				],
			},
		],
	},
	{
		displayName: 'Deliveries',
		name: 'deliveries',
		placeholder: 'Add Delivery',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Order deliveries',
		default: {},
		options: [
			{
				name: 'delivery',
				displayName: 'Delivery',
				values: [
					{
						displayName: 'Shipping Method',
						name: 'shippingMethod',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getShippingMethods',
						},
						required: true,
						default: '',
						description: 'Delivery shipping method',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDeliveryStates',
						},
						required: true,
						default: '',
						description: 'State of the delivery (e.g. Shipped)',
					},
					{
						displayName: 'Use Customer Shipping Address',
						name: 'customerShippingAddress',
						type: 'boolean',
						default: true,
						description: 'Whether to use the customer shipping address',
					},
					{
						displayName: 'Address',
						name: 'addressUi',
						placeholder: 'Add Address',
						type: 'fixedCollection',
						default: {},
						typeOptions: {
							multipleValues: false,
						},
						displayOptions: {
							show: {
								customerShippingAddress: [false],
							},
						},
						description: 'Add delivery shipping address',
						options: [
							{
								name: 'addressValues',
								displayName: 'Address',
								values: [
									{
										displayName: 'Country',
										name: 'country',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getCountries',
										},
										required: true,
										default: '',
										description: 'Country of the shippng address',
									},
									{
										displayName: 'First Name',
										name: 'firstName',
										type: 'string',
										required: true,
										default: '',
										description: 'Customer first name',
									},
									{
										displayName: 'Last Name',
										name: 'lastName',
										type: 'string',
										required: true,
										default: '',
										description: 'Customer last name',
									},
									{
										displayName: 'City',
										name: 'city',
										type: 'string',
										required: true,
										default: '',
										description: 'Shipping address city',
									},
									{
										displayName: 'Street',
										name: 'street',
										type: 'string',
										required: true,
										default: '',
										description: 'Shipping address street',
									},
								],
							},
						],
					},
				],
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['order'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const orderId = uuidv7();
			const customerData: Partial<CustomerData> = {};
			const globalDefaults: Partial<GlobalDefaults> = {};
			let orderCustomer: OrderCustomer;

			const customerNumber = (!this.getNodeParameter('guestOrder', i) as boolean)
				? (this.getNodeParameter('customerNumber', i) as string)
				: null;

			if (customerNumber) {
				const customer = await getCustomerByNumber.call(this, customerNumber, i);

				globalDefaults.languageId = customer.languageId;
				globalDefaults.salesChannelId = customer.salesChannelId;

				customerData.firstName = customer.firstName;
				customerData.lastName = customer.lastName;
				customerData.email = customer.email;
				customerData.salutationId = customer.salutationId;
				customerData.billingAddress = customer.billingAddress;
				customerData.shippingAddress = customer.shippingAddress;

				orderCustomer = {
					firstName: customer.firstName,
					lastName: customer.lastName,
					email: customer.email,
					salutationId: customer.salutationId,
					customerId: customer.id,
					customerNumber,
				};
			} else {
				const guest = (this.getNodeParameter('guestUi', i) as { guestValues: NodeCustomerDetails })
					.guestValues;
				const guestBillingAddress = (
					this.getNodeParameter('billingAddressUi', i) as {
						billingAddressValues: NodeCustomerAddressDetails;
					}
				).billingAddressValues;
				const guestShippingAddress = (
					this.getNodeParameter('shippingAddressUi', i) as {
						shippingAddressValues: NodeCustomerAddressDetails;
					}
				).shippingAddressValues;

				globalDefaults.languageId = await getDefaultLanguageId.call(this);
				globalDefaults.salesChannelId = this.getNodeParameter('salesChannel', i) as string;

				customerData.firstName = guest.firstName;
				customerData.lastName = guest.lastName;
				customerData.email = guest.email;
				customerData.salutationId = guest.salutation;
				customerData.billingAddress = {
					id: uuidv7(),
					countryId: guestBillingAddress.country,
					firstName: guestBillingAddress.firstName,
					lastName: guestBillingAddress.lastName,
					city: guestBillingAddress.city,
					street: guestBillingAddress.street,
				};
				customerData.shippingAddress = {
					id: uuidv7(),
					countryId: guestShippingAddress.country,
					firstName: guestShippingAddress.firstName,
					lastName: guestShippingAddress.lastName,
					city: guestShippingAddress.city,
					street: guestShippingAddress.street,
				};

				orderCustomer = {
					firstName: guest.firstName,
					lastName: guest.lastName,
					email: guest.email,
					salutationId: guest.salutation,
					customerNumber: 'guest-' + randomString(6),
				};
			}

			const currencyData = (this.getNodeParameter('currency', i) as string).split('-');

			const nodeLineItems = (
				this.getNodeParameter('lineItems', i) as { lineItem: Array<NodeLineItem> | null }
			).lineItem;

			if (!nodeLineItems || nodeLineItems.length === 0) {
				throw new NodeOperationError(this.getNode(), 'Missing order line items', {
					description: 'At least one line item must be provided',
					itemIndex: i,
				});
			}

			const lineItems = await Promise.all(
				nodeLineItems.map(async (lineItem) => {
					const { identifier, productId, label, states, unitPrice, taxRate } =
						await getLineItemData.call(this, lineItem.productNumber, currencyData[0], i);

					const quantity = lineItem.quantity;
					const totalPrice = unitPrice * quantity;
					const tax = totalPrice * (taxRate / 100);
					const taxPrice = totalPrice + tax;

					const price = {
						unitPrice,
						totalPrice,
						quantity,
						calculatedTaxes: [
							{
								tax,
								taxRate,
								price: taxPrice,
							},
						],
						taxRules: [
							{
								taxRate,
								percentage: 100,
							},
						],
					};

					return {
						identifier,
						productId,
						quantity,
						label,
						states,
						price,
					};
				}),
			);

			const defaultTaxRate = await getDefaultTaxRate.call(this);
			const totalPrice = lineItems.reduce((acc, item) => acc + item.price.totalPrice, 0);
			const orderTax = totalPrice * (defaultTaxRate / 100);
			const taxPrice = totalPrice + orderTax;
			const quantity = lineItems.reduce((acc, item) => acc + item.quantity, 0);

			const price = {
				netPrice: totalPrice,
				totalPrice: taxPrice,
				calculatedTaxes: [
					{
						tax: orderTax,
						taxRate: defaultTaxRate,
						price: taxPrice,
					},
				],
				taxRules: [
					{
						taxRate: defaultTaxRate,
						percentage: 100,
					},
				],
				positionPrice: totalPrice,
				rawTotal: totalPrice,
				taxStatus: 'gross',
			};

			let transactions: Transaction[] = [];
			const nodeTransactions = (
				this.getNodeParameter('transactions', i) as { transaction: Array<NodeTransaction> | null }
			).transaction;

			if (nodeTransactions && nodeTransactions.length > 0) {
				transactions = nodeTransactions.map((transaction) => {
					const amount = {
						unitPrice: totalPrice,
						totalPrice: taxPrice,
						quantity,
						calculatedTaxes: [
							{
								tax: orderTax,
								taxRate: defaultTaxRate,
								price: taxPrice,
							},
						],
						taxRules: [
							{
								taxRate: defaultTaxRate,
								percentage: 100,
							},
						],
					};

					return {
						paymentMethodId: transaction.paymentMethod,
						stateId: transaction.state,
						amount,
					};
				});
			}

			const addresses: Address[] = [
				{
					id: customerData.shippingAddress.id,
					countryId: customerData.shippingAddress.countryId,
					firstName: customerData.shippingAddress.firstName,
					lastName: customerData.shippingAddress.lastName,
					city: customerData.shippingAddress.city,
					street: customerData.shippingAddress.street,
				},
			];

			let deliveries: Delivery[] = [];
			const nodeDeliveries = (
				this.getNodeParameter('deliveries', i) as { delivery: Array<NodeDelivery> | null }
			).delivery;

			if (nodeDeliveries && nodeDeliveries.length > 0) {
				deliveries = await Promise.all(
					nodeDeliveries.map(async (delivery) => {
						let shippingOrderAddressId: string;

						if (delivery.customerShippingAddress) {
							shippingOrderAddressId = addresses[0].id;
						} else {
							const address = delivery.addressUi.addressValues;
							if (!address) {
								throw new NodeOperationError(this.getNode(), 'Missing shipping address', {
									description:
										'A shipping address must be provided for the selected delivery if not using the customer one',
									itemIndex: i,
								});
							}

							for (const key in address) {
								if (address[key as keyof AddressValues] === '') {
									throw new NodeOperationError(
										this.getNode(),
										'Missing required value for shipping address',
										{
											description: `Shipping address ${key} must be a valid value.`,
											itemIndex: i,
										},
									);
								}
							}

							shippingOrderAddressId = uuidv7();
							addresses.push({
								id: shippingOrderAddressId,
								countryId: address.country,
								firstName: address.firstName,
								lastName: address.lastName,
								city: address.city,
								street: address.street,
							});
						}

						const { ['unitPrice']: shippingPrice, ['taxRate']: shippingTaxRate } =
							await getShippingMethodData.call(this, delivery.shippingMethod, currencyData[0]);

						const deliveryTime = await getShippingDeliveryTime.call(this, delivery.shippingMethod);
						const shippingTax = shippingPrice * (shippingTaxRate / 100);
						const shippingTaxPrice = shippingPrice + shippingTax;

						const shippingCosts = {
							unitPrice: shippingPrice,
							totalPrice: shippingPrice,
							quantity: 1,
							calculatedTaxes: [
								{
									tax: shippingTax,
									taxRate: shippingTaxRate,
									price: shippingTaxPrice,
								},
							],
							taxRules: [
								{
									taxRate: shippingTaxRate,
									percentage: 100,
								},
							],
						};

						const shippingDateEarliest = new Date();
						const shippingDateLatest = new Date();
						switch (deliveryTime.unit) {
							case 'hour':
								shippingDateEarliest.setHours(shippingDateEarliest.getHours() + deliveryTime.min);
								shippingDateLatest.setHours(shippingDateLatest.getHours() + deliveryTime.max);
								break;
							case 'day':
								shippingDateEarliest.setDate(shippingDateEarliest.getDate() + deliveryTime.min);
								shippingDateLatest.setDate(shippingDateLatest.getDate() + deliveryTime.max);
								break;
							case 'week':
								shippingDateEarliest.setDate(shippingDateEarliest.getDate() + deliveryTime.min * 7);
								shippingDateLatest.setDate(shippingDateLatest.getDate() + deliveryTime.max * 7);
								break;
						}

						return {
							shippingOrderAddressId,
							shippingMethodId: delivery.shippingMethod,
							stateId: delivery.state,
							shippingDateEarliest,
							shippingDateLatest,
							shippingCosts,
						};
					}),
				);
			}

			let shippingCosts: GenericPrice;
			if (deliveries.length === 0) {
				const defaultShippingMethod = await getDefaultShippingMethod.call(this);
				const { ['unitPrice']: shippingPrice, ['taxRate']: shippingTaxRate } =
					await getShippingMethodData.call(this, defaultShippingMethod, currencyData[0]);
				const shippingTax = shippingPrice * (shippingTaxRate / 100);
				const shippingTaxPrice = shippingPrice + shippingTax;
				shippingCosts = {
					unitPrice: shippingPrice,
					totalPrice: shippingPrice,
					quantity: 1,
					calculatedTaxes: [
						{
							tax: shippingTax,
							taxRate: shippingTaxRate,
							price: shippingTaxPrice,
						},
					],
					taxRules: [
						{
							taxRate: shippingTaxRate,
							percentage: 100,
						},
					],
				};
			} else {
				const deliveriesUnitPrice = deliveries.reduce(
					(acc, delivery) => acc + delivery.shippingCosts.unitPrice,
					0,
				);
				const deliveriesTax = deliveries.reduce(
					(acc, delivery) => acc + delivery.shippingCosts.calculatedTaxes[0].tax,
					0,
				);
				const deliveriesTaxRate = deliveries[0].shippingCosts.taxRules[0].taxRate;
				const deliveriesTaxPrice = deliveriesUnitPrice + deliveriesTax;

				shippingCosts = {
					unitPrice: deliveriesUnitPrice,
					totalPrice: deliveriesUnitPrice,
					quantity: 1,
					calculatedTaxes: [
						{
							tax: deliveriesTax,
							taxRate: deliveriesTaxRate,
							price: deliveriesTaxPrice,
						},
					],
					taxRules: [
						{
							taxRate: deliveriesTaxRate,
							percentage: 100,
						},
					],
				};
			}

			const parsedItemRounding = JSON.parse(currencyData[3]);
			const itemRounding: Rounding = {
				decimals: parsedItemRounding.decimals,
				interval: parsedItemRounding.interval,
				roundForNet: parsedItemRounding.roundForNet,
			};
			const parsedTotalRounding = JSON.parse(currencyData[4]);
			const totalRounding: Rounding = {
				decimals: parsedTotalRounding.decimals,
				interval: parsedTotalRounding.interval,
				roundForNet: parsedTotalRounding.roundForNet,
			};
			const serializedBillingAddress = {
				id: customerData.billingAddress.id,
				countryId: customerData.billingAddress.countryId,
				firstName: customerData.billingAddress.firstName,
				lastName: customerData.billingAddress.lastName,
				city: customerData.billingAddress.city,
				street: customerData.billingAddress.street,
			};

			const createBody: OrderCreatePayload = {
				id: orderId,
				currencyId: currencyData[0],
				languageId: globalDefaults.languageId,
				salesChannelId: globalDefaults.salesChannelId,
				billingAddressId: customerData.billingAddress.id,
				orderNumber: this.getNodeParameter('orderNumber', i) as string,
				orderDateTime: this.getNodeParameter('dateAndTime', i) as Date,
				stateId: this.getNodeParameter('state', i) as string,
				currencyFactor: parseInt(currencyData[2]),
				itemRounding,
				totalRounding,
				orderCustomer,
				billingAddress: serializedBillingAddress,
				lineItems,
				price,
				shippingCosts,
				transactions,
				deliveries,
				addresses,
			};

			const searchBody = {
				fields: orderFields,
				includes: {
					order: orderFields,
				},
				filter: [{ type: 'equals', field: 'id', value: orderId }],
			};

			for (const key in createBody) {
				const typedKey = key as keyof OrderCreatePayload;

				if (
					Array.isArray(createBody[typedKey]) &&
					(createBody[typedKey] as Array<unknown>).length === 0
				) {
					delete createBody[typedKey];
				} else if (createBody[typedKey] === '') {
					delete createBody[typedKey];
				}
			}

			await apiRequest.call(this, 'POST', `/order`, createBody);

			const response = await apiRequest.call(this, 'POST', `/search/order`, searchBody);

			const executionData = this.helpers.constructExecutionMetaData(wrapData(response.data), {
				itemData: { item: i },
			});

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: error.message } });
				continue;
			}

			if (error instanceof NodeOperationError) {
				throw error;
			}

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return returnData;
}
