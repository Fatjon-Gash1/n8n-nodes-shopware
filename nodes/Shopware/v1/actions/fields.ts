export const genericFields = ['id', 'name'];

export const orderCustomerFields = [
	'id',
	'firstName',
	'lastName',
	'email',
	'salutationId',
	'salesChannelId',
	'languageId',
	'defaultBillingAddressId',
	'defaultShippingAddressId',
];

export const orderAddressFields = [
	'id',
	'countryId',
	'firstName',
	'lastName',
	'street',
	'city',
];

export const lineItemFields = ['id', 'name', 'states', 'price', 'taxId']

export const salutationFields = ['id', 'displayName', 'salutationKey'];
