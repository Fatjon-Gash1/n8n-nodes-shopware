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
import type { CategoryUpdatePayload } from './types';
import { wrapData } from '../../helpers/utils';
import { categoryFields } from './fields';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Category ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. 2a88d9b59d474...',
		required: true,
		description:
			'ID of the category to update. You can find the ID in the URL when viewing the category in Shopware Admin (e.g. https://your-domain.com/admin#/sw/category/detail/&lt;categoryId&gt;).',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the category is active and visible in the storefront',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the category',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Category name',
			},
			{
				displayName: 'Parent',
				name: 'parentId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description: 'Select the parent category from the list',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['category'],
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
				fields: categoryFields,
				includes: {
					category: categoryFields,
				},
				filter: [{ type: 'equals', field: 'id', value: id }],
			};

			const category = (await apiRequest.call(this, 'POST', `/search/category`, searchBody))
				.data[0];
			if (!category) {
				throw new NodeOperationError(this.getNode(), 'Category does not exist', {
					description: 'There is no category with id ' + id,
					itemIndex: i,
				});
			}

			const updateFields = this.getNodeParameter('updateFields', i);

			const updateBody: CategoryUpdatePayload = {
				active: updateFields.active as boolean,
				parentId: updateFields.parentId ? (updateFields.parentId as string).split('-')[0] : '',
				name: updateFields.name as string,
				description: updateFields.description as string,
			};

			for (const key in updateBody) {
				const typedKey = key as keyof CategoryUpdatePayload;

				if (updateBody[typedKey] === '') {
					delete updateBody[typedKey];
				}
			}

			await apiRequest.call(this, 'PATCH', `/category/${id}`, updateBody);

			const response = await apiRequest.call(this, 'POST', `/search/category`, searchBody);

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
