import {
	type IDataObject,
	type IExecuteFunctions,
	type IPollFunctions,
	type ILoadOptionsFunctions,
	type IHttpRequestMethods,
	type IRequestOptions,
    NodeApiError,
} from 'n8n-workflow';
import type { ProductField } from '../helpers/interfaces';

/**
 * Make an API request to Shopware 
 *
 */
export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	uri?: string,
	option: IDataObject = {},
) {
    const credentials = await this.getCredentials('shopwareOAuth2Api');
    const url = credentials.url as string;

	query = query || {};

	const options: IRequestOptions = {
		headers: {},
		method,
		body,
		qs: query,
		uri: `${url}/api/${endpoint}`,
		useQuerystring: false,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	const response =  await this.helpers.requestWithAuthentication.call(this, 'shopwareOAuth2Api', options);
	return response;
}

/**
 * Make an API request to paginated Shopware endpoint
 * and return all results
 *
 * @param {(IExecuteFunctions | IExecuteFunctions)} this
 */
export async function apiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
) {
	if (query === undefined) {
		query = {};
	}
	query.pageSize = 100;

	const returnData: IDataObject[] = [];

	let responseData;

	do {
		responseData = await apiRequest.call(this, method, endpoint, body, query);
		returnData.push.apply(returnData, responseData.records as IDataObject[]);

		query.offset = responseData.offset;
	} while (responseData.offset !== undefined);

	return {
		records: returnData,
	};
}

export async function getProductFields(
	this: IExecuteFunctions | IPollFunctions,
): Promise<ProductField[]> {
    try {
    // const response = await apiRequest.call(this, 'GET', '/products/schema');
    // return response.fields as ProductField[];

    const fields: ProductField[] = ['id', 'name', 'productNumber', 'stock', 'price', 'description', 'createdAt', 'updatedAt'];

    return fields;
    } catch (error) {
        throw new NodeApiError(this.getNode(), {error: 'Failed to fetch fields from Shopware: ' + error.message });
    }
}