import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Shopware implements ICredentialType {
	name = 'shopwareOAuth2Api';
	displayName = 'Shopware OAuth2 API';
	properties: INodeProperties[] = [
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			required: true,
			noDataExpression: true,
			description: 'The domain of your Shopware instance, e.g., myshop.com',
			hint: 'Do not include https:// or any trailing slashes',
			default: '',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			noDataExpression: true,
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			noDataExpression: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			body: {
				client_id: '{{$credentials.clientId}}',
				client_secret: '{{$credentials.clientSecret}}',
				grant_type: 'client_credentials',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://wanted-causal-sawfish.ngrok-free.app',
			url: '/api/_info/version',
		},
	};
}