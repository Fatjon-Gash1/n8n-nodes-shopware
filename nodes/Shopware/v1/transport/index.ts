import type {
	IDataObject,
	IExecuteFunctions,
	IPollFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

/**
 * Generic request wrapper for Shopware API.
 *
 * @param method - HTTP method (GET, POST, etc.)
 * @param endpoint - Shopware API endpoint, starting with `/`
 * @param [body] - Optional request body
 * @param [qs] - Optional query string params
 * @returns A promise that resolves to a parsed JSON response from Shopware
 * @throws NodeApiError when the request fails
 */
export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	option: IDataObject = {},
) {
	const credentials = await this.getCredentials('shopwareOAuth2Api');
	const url = credentials.url as string;

	query = query || {};

	const options: IHttpRequestOptions = {
		headers: {},
		method,
		body,
		qs: query,
		url: `${url}/api${endpoint}`,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return await this.helpers.httpRequestWithAuthentication.call(this, 'shopwareOAuth2Api', options);
}
