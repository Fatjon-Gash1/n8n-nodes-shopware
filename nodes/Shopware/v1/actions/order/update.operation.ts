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
} from 'n8n-workflow';
import type {
	Address,
	AddressValues,
	CustomerData,
	Delivery,
	GenericPrice,
	NodeDelivery,
	NodeLineItem,
	NodeTransaction,
	OrderCreatePayload,
	Transaction,
	OrderUpdatePayload,
	LineItem,
	OrderResponse,
	NodeCustomerAddressDetails,
} from './types';
import { apiRequest } from '../../transport';
import { orderFields } from './fields';
import {
	wrapData,
	uuidv7,
	getLineItemData,
	getShippingMethodData,
	getDefaultTaxRate,
	getShippingDeliveryTime,
	getCustomerByNumber,
	getPrePaymentOrderStates,
} from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the order to update. You can find the ID in the URL when viewing the order in Shopware Admin (e.g. https://your-domain.com/admin#/sw/order/detail/&lt;orderId&gt;).',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Billing Address',
				name: 'billingAddressUi',
				placeholder: 'Add Billing Address',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				description: 'Add customer billing address',
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
				displayName: 'Shipping Address',
				name: 'shippingAddressUi',
				placeholder: 'Add Shipping Address',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				description: 'Add customer shipping address',
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
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{
						name: 'Cancel',
						value: 'cancel',
					},
					{
						name: 'Complete',
						value: 'complete',
					},
					{
						name: 'None',
						value: '',
					},
					{
						name: 'Process',
						value: 'process',
					},
					{
						name: 'Reopen',
						value: 'reopen',
					},
				],
				default: '',
				description: 'Choose the order state from the list',
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
		],
	},
];

const displayOptions = {
	show: {
		resource: ['order'],
		operation: ['update'],
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
			const id = this.getNodeParameter('id', i) as string;
			const { state: orderState, ...updateFields } = this.getNodeParameter('updateFields', i);

			const searchPrevOrderBody = {
				filter: [{ type: 'equals', field: 'id', value: id }],
				associations: {
					currency: {},
				},
			};
            const prevOrder = (await apiRequest.call(this, 'POST', `/search/order`, searchPrevOrderBody)).data[0] as OrderResponse;

            if (!prevOrder) {
				throw new NodeOperationError(this.getNode(), 'Order does not exist', {
					description: 'There is no order with id ' + id,
					itemIndex: i,
				});
            }

			const {
				currency: currencyData,
				shippingCosts: shippingData,
				orderCustomer: prevOrderCustomer,
				...previousOrderData
			} =	prevOrder;

			const customerData: Partial<CustomerData> = {};

			const customerBillingAddress = (
				updateFields.billingAddressUi as {
					billingAddressValues: NodeCustomerAddressDetails;
				} | null
			)?.billingAddressValues;
			const customerShippingAddress = (
				updateFields.shippingAddressUi as {
					shippingAddressValues: NodeCustomerAddressDetails;
				} | null
			)?.shippingAddressValues;
			if (customerBillingAddress) {
				const prePaymentStates = await getPrePaymentOrderStates.call(this);

				if (prePaymentStates.includes(previousOrderData.stateId)) {
					customerData.billingAddress = {
						id: uuidv7(),
						countryId: customerBillingAddress.country,
						firstName: customerBillingAddress.firstName,
						lastName: customerBillingAddress.lastName,
						city: customerBillingAddress.city,
						street: customerBillingAddress.street,
					};
				}
			}
			if (customerShippingAddress) {
				customerData.shippingAddress = {
					id: uuidv7(),
					countryId: customerShippingAddress.country,
					firstName: customerShippingAddress.firstName,
					lastName: customerShippingAddress.lastName,
					city: customerShippingAddress.city,
					street: customerShippingAddress.street,
				};
			}

			const nodeLineItems = (
				updateFields.lineItems as { lineItem: Array<NodeLineItem> | null } | null
			)?.lineItem;

			let transactions: Transaction[] = [];
			const nodeTransactions = (
				updateFields.transactions as { transaction: Array<NodeTransaction> | null } | null
			)?.transaction;

			let lineItems: LineItem[] = [];
			let price: OrderCreatePayload['price'] | null = null;

			if (nodeLineItems) {
				lineItems = await Promise.all(
					nodeLineItems.map(async (lineItem) => {
						const { identifier, productId, label, states, unitPrice, taxRate } =
							await getLineItemData.call(this, lineItem.productNumber, currencyData.id, i);

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
				const totalPrice =
					lineItems.reduce((acc, item) => acc + item.price.totalPrice, 0) +
					previousOrderData.amountNet;
				const orderTax = totalPrice * (defaultTaxRate / 100);
				const taxPrice = totalPrice + orderTax;
				const quantity = lineItems.reduce((acc, item) => acc + item.quantity, 0);

				price = {
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

				if (nodeTransactions && nodeTransactions.length > 0) {
					transactions = nodeTransactions.map((transaction) => {
						const amount = {
							unitPrice: totalPrice,
							totalPrice: taxPrice,
							quantity: quantity,
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
			}

			if (!nodeLineItems && nodeTransactions) {
				throw new NodeOperationError(this.getNode(), 'Missing line items for transaction', {
					description: 'Line items are required for order transactions',
					itemIndex: i,
				});
			}

			const addresses: Address[] = [];
			if (customerShippingAddress && customerData.shippingAddress) {
				addresses.push({
					id: customerData.shippingAddress.id,
					countryId: customerData.shippingAddress.countryId,
					firstName: customerData.shippingAddress.firstName,
					lastName: customerData.shippingAddress.lastName,
					city: customerData.shippingAddress.city,
					street: customerData.shippingAddress.street,
				});
			}

			let deliveries: Delivery[] = [];
			const nodeDeliveries = (
				updateFields.deliveries as { delivery: Array<NodeDelivery> | null } | null
			)?.delivery;

			let shippingCosts: GenericPrice | null = null;
			if (nodeDeliveries && nodeDeliveries.length > 0) {
				deliveries = await Promise.all(
					nodeDeliveries.map(async (delivery) => {
						let shippingOrderAddressId: string;

						if (delivery.customerShippingAddress) {
							if (addresses.length > 0) {
								shippingOrderAddressId = addresses[0].id;
							} else {
								shippingOrderAddressId = (
									await getCustomerByNumber.call(this, prevOrderCustomer.customerNumber, i)
								).defaultShippingAddressId;
							}
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
							await getShippingMethodData.call(this, delivery.shippingMethod, currencyData.id);

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

				const deliveriesUnitPrice =
					deliveries.reduce((acc, delivery) => acc + delivery.shippingCosts.unitPrice, 0) +
					shippingData.unitPrice;
				const deliveriesTax =
					deliveries.reduce(
						(acc, delivery) => acc + delivery.shippingCosts.calculatedTaxes[0].tax,
						0,
					) + shippingData.calculatedTaxes[0].tax;
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

			let serializedBillingAddress: Address | null = null;
			if (customerData.billingAddress) {
				serializedBillingAddress = {
					id: customerData.billingAddress.id,
					countryId: customerData.billingAddress.countryId,
					firstName: customerData.billingAddress.firstName,
					lastName: customerData.billingAddress.lastName,
					city: customerData.billingAddress.city,
					street: customerData.billingAddress.street,
				};
			}

			const updateBody: OrderUpdatePayload = {
				billingAddressId: customerData.billingAddress ? customerData.billingAddress.id : null,
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
				filter: [{ type: 'equals', field: 'id', value: id }],
			};

			for (const key in updateBody) {
				const typedKey = key as keyof OrderCreatePayload;

				if (
					Array.isArray(updateBody[typedKey]) &&
					(updateBody[typedKey] as Array<unknown>).length === 0
				) {
					delete updateBody[typedKey];
				} else if (updateBody[typedKey] === '' || updateBody[typedKey] === null) {
					delete updateBody[typedKey];
				}
			}

			if (orderState) {
				await apiRequest.call(
					this,
					'POST',
					`/_action/order/${previousOrderData.id}/state/${orderState}`,
				);
			}

            if (orderState === '') {
				throw new NodeOperationError(this.getNode(), 'Invalid order state', {
					description: 'Please specify a valid order state from the list',
					itemIndex: i,
				});
            }

			if (Object.keys(updateFields).length !== 0) {
				await apiRequest.call(this, 'PATCH', `/order/${id}`, updateBody);
			}

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
