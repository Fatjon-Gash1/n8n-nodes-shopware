/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-dynamic-options */
/* eslint-disable n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options */
/* We only allow to select existing entities (e.g. groups, salesChannels, languages, etc.) by name for UX convenience. Therefore, we disable the relevant ESLint rules. */

import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	NodeApiError,
	updateDisplayOptions,
	NodeOperationError,
} from 'n8n-workflow';
import type { NodeCustomerAddress, CustomerCreatePayload } from './types';
import { apiRequest } from '../../transport';
import { customerFields } from './fields';
import { uuidv7, wrapData } from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		displayName: 'Customer Number',
		name: 'customerNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		description: 'Unique customer number',
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
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. name@email.com',
		description: 'Customer email',
	},
	{
		displayName: 'Payment Method',
		name: 'paymentMethod',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getPaymentMethods',
		},
		default: '',
		description: 'Select the payment method from the list',
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getLanguages',
		},
		default: '',
		description: 'Select the language from the list',
	},
	{
		displayName: 'Group',
		name: 'group',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getCustomerGroups',
		},
		default: '',
		description: 'Select the customer group from the list',
	},
	{
		displayName: 'Sales Channel',
		name: 'salesChannel',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getSalesChannels',
		},
		default: '',
		description: 'Select the sales channel from the list',
	},
	{
		displayName: 'Addresses',
		name: 'addresses',
		placeholder: 'Add Address',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		description: 'Customer addresses',
		default: {},
		options: [
			{
				name: 'address',
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
						description: 'Choose the country from the list',
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
						placeholder: 'e.g. München',
						description: "Name of the customer's city",
					},
					{
						displayName: 'Street',
						name: 'street',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'e.g. Schillerstraße',
						description: "Name of the customer's city",
					},
					{
						displayName: 'Set as Default Shipping Address',
						name: 'defaultShippingAddress',
						type: 'boolean',
						default: false,
						description: 'Whether to set the current address as default shipping address',
					},
					{
						displayName: 'Set as Default Billing Address',
						name: 'defaultBillingAddress',
						type: 'boolean',
						default: false,
						description: 'Whether to set the current address as default billing address',
					},
				],
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['customer'],
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
			let defaultShippingAddressId: string | null = null;
			let defaultBillingAddressId: string | null = null;

			const nodeAddresses = (
				this.getNodeParameter('addresses', i) as {
					address: Array<NodeCustomerAddress> | null;
				}
			).address;

			const email = this.getNodeParameter('email', i) as string;

			if (email.indexOf('@') === -1) {
				throw new NodeOperationError(this.getNode(), 'Invalid email address', {
					description: `The email address '${email}' in the 'email' field isn't valid`,
					itemIndex: i,
				});
			}

			if (!nodeAddresses || nodeAddresses.length === 0) {
				throw new NodeOperationError(this.getNode(), 'Missing default address', {
					description: 'At least one address must be provided',
					itemIndex: i,
				});
			}

			const addresses = nodeAddresses.map((address) => {
				const addressId = uuidv7();

				if (address.defaultShippingAddress) {
					if (defaultShippingAddressId) {
						throw new NodeOperationError(this.getNode(), 'Duplicate default shipping address', {
							description: 'Only one address can be a default shipping address',
							itemIndex: i,
						});
					}
					defaultShippingAddressId = addressId;
				}

				if (address.defaultBillingAddress) {
					if (defaultBillingAddressId) {
						throw new NodeOperationError(this.getNode(), 'Duplicate default billing address', {
							description: 'Only one address can be a default billing address',
							itemIndex: i,
						});
					}
					defaultBillingAddressId = addressId;
				}

				return {
					id: addressId,
					countryId: address.country,
					firstName: address.firstName,
					lastName: address.lastName,
					city: address.city,
					street: address.street,
				};
			});

			if (!defaultShippingAddressId) {
				throw new NodeOperationError(this.getNode(), 'Missing default shipping address', {
					description: 'Customer must have a default shipping address',
					itemIndex: i,
				});
			}
			if (!defaultBillingAddressId) {
				throw new NodeOperationError(this.getNode(), 'Missing default billing address', {
					description: 'Customer must have a default billing address',
					itemIndex: i,
				});
			}

			const createBody: CustomerCreatePayload = {
				firstName: this.getNodeParameter('firstName', i) as string,
				lastName: this.getNodeParameter('lastName', i) as string,
				email,
				customerNumber: this.getNodeParameter('customerNumber', i) as string,
				defaultPaymentMethodId: this.getNodeParameter('paymentMethod', i) as string,
				languageId: this.getNodeParameter('language', i) as string,
				salesChannelId: this.getNodeParameter('salesChannel', i) as string,
				groupId: this.getNodeParameter('group', i) as string,
				defaultShippingAddressId,
				defaultBillingAddressId,
				addresses,
			};

			const searchBody = {
				fields: customerFields,
				includes: {
					customer: customerFields,
				},
				filter: [{ type: 'equals', field: 'customerNumber', value: createBody.customerNumber }],
			};

			for (const key in createBody) {
				const typedKey = key as keyof CustomerCreatePayload;

				if (
					Array.isArray(createBody[typedKey]) &&
					(createBody[typedKey] as Array<unknown>).length === 0
				) {
					delete createBody[typedKey];
				} else if (createBody[typedKey] === '') {
					delete createBody[typedKey];
				}
			}

			await apiRequest.call(this, 'POST', `/customer`, createBody);

			const response = await apiRequest.call(this, 'POST', `/search/customer`, searchBody);

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
