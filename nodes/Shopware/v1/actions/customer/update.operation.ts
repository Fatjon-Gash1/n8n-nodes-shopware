/* eslint-disable n8n-nodes-base/node-param-description-wrong-for-dynamic-options */
/* eslint-disable n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options */
/* We only allow to select existing entities (e.g. categories, manufacturers, tax rates, etc.) by name for UX convenience. Therefore, we disable the relevant ESLint rules. */

import {
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	type JsonObject,
	updateDisplayOptions,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import type { CustomerUpdatePayload, NodeCustomerAddress } from './types';
import { uuidv7, wrapData } from '../../helpers/utils';
import { customerFields } from './fields';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Customer ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the customer to update. You can find the ID in the URL when viewing the customer in Shopware Admin (e.g. https://your-domain.com/admin#/sw/customer/detail/&lt;customerId&gt;).',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
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
			{
				displayName: 'Customer Number',
				name: 'customerNumber',
				type: 'string',
				default: '',
				placeholder: 'e.g. 2a88d9b59d474...',
				description: 'Unique customer number',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'e.g. name@email.com',
				description: 'Customer email',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Customer first name',
			},
			{
				displayName: 'Group',
				name: 'group',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCustomerGroups',
				},
				default: '',
				description: 'Select the customer group from the list',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLanguages',
				},
				default: '',
				description: 'Select the language from the list',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Customer last name',
			},
			{
				displayName: 'Payment Method',
				name: 'paymentMethod',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPaymentMethods',
				},
				default: '',
				description: 'Select the payment method from the list',
			},
			{
				displayName: 'Sales Channel',
				name: 'salesChannel',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSalesChannels',
				},
				default: '',
				description: 'Select the sales channel from the list',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['customer'],
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

			const searchBody = {
				fields: customerFields,
				includes: {
					customer: customerFields,
				},
				filter: [{ type: 'equals', field: 'id', value: id }],
			};

			const customer = (await apiRequest.call(this, 'POST', `/search/customer`, searchBody)).data[0];
			if (!customer) {
				throw new NodeOperationError(this.getNode(), 'Customer does not exist', {
					description: 'There is no customer with id ' + id,
					itemIndex: i,
				});
			}

			const updateFields = this.getNodeParameter('updateFields', i);

			let defaultShippingAddressId: string | null = null;
			let defaultBillingAddressId: string | null = null;

			if (updateFields.email && (updateFields.email as string).indexOf('@') === -1) {
				throw new NodeOperationError(this.getNode(), 'Invalid email address', {
					description: `The email address '${updateFields.email}' in the 'email' field isn't valid`,
					itemIndex: i,
				});
			}

			let addresses: CustomerUpdatePayload['addresses'];
			const nodeAddresses = (
				updateFields.addresses as { address: Array<NodeCustomerAddress> | null }
			)?.address;

			if (nodeAddresses && nodeAddresses.length > 0) {
				addresses = nodeAddresses.map((address) => {
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
						salutationId: customer.salutationId
					};
				});
			}

			const updateBody: CustomerUpdatePayload = {
				firstName: updateFields.firstName as string,
				lastName: updateFields.lastName as string,
				email: updateFields.email as string,
				customerNumber: updateFields.customerNumber as string,
				defaultPaymentMethodId: updateFields.paymentMethod as string,
				languageId: updateFields.language as string,
				salesChannelId: updateFields.salesChannel as string,
				groupId: updateFields.group as string,
				defaultShippingAddressId,
				defaultBillingAddressId,
				addresses,
			};

			for (const key in updateBody) {
				const typedKey = key as keyof CustomerUpdatePayload;

				if (
					Array.isArray(updateBody[typedKey]) &&
					(updateBody[typedKey] as Array<unknown>).length === 0
				) {
					delete updateBody[typedKey];
				} else if (updateBody[typedKey] === '' || updateBody[typedKey] === null) {
					delete updateBody[typedKey];
				}
			}

			await apiRequest.call(this, 'PATCH', `/customer/${id}`, updateBody);

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

			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return returnData;
}
