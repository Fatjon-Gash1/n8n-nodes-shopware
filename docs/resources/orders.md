# Order Resource

The **Order Resource** allows you to manage Shopware 6 orders directly from your **n8n** workflows.  
You can create, retrieve, update, and delete order records using the Shopware Admin API.

---

## Supported Operations

| Operation | Description |
|------------|-------------|
| **Get** | Retrieve a single order by its ID. |
| **Get Many** | Retrieve multiple orders, optionally filtered by currency, order/delivery/transaction state, max/min total etc. |
| **Create** | Add a new order to your Shopware store. |
| **Update** | Modify order details such as line items, deliveries, transactions etc. |
| **Delete** | Remove a order from your store by ID. |

---

## 1. Get Order

Retrieve a single order using its **ID**.

**Parameters**

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| **Order ID** | String | ✅ | The unique identifier of the order to retrieve. |

**Example Output**

```json
[
  {
    "id": "0199c8e1c6ea726b834fe9c07cea87ff",
    "orderNumber": "MOCK-O0199c8e1c6ea726b834fe9c07db49fc7",
    "billingAddressId": "0199c8e1a2517121aec9f29c91894d4c",
    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "orderDateTime": "2025-10-09T12:11:03.786+00:00",
    "amountTotal": 69690.95,
    "amountNet": 58563.82,
    "taxStatus": "gross",
    "shippingTotal": 0,
    "currencyFactor": 1,
    "affiliateCode": null,
    "campaignCode": null,
    "customerComment": null,
    "stateId": "019938bf91d271bf876ceedea8336514",
    "createdAt": "2025-10-09T12:11:03.811+00:00",
    "updatedAt": null,
    "apiAlias": "order"
  }
]
```

## 2. Get Many Orders

Retrieve multiple orders, optionally applying filters or pagination.

**Parameters & Filters**

| Field                 | Type    | Required | Filter | Description                                   |
| --------------------- | ------- | -------- | ------ | --------------------------------------------- |
| **Limit**             | Number  | ❌       | ❌     | Maximum number of orders to return.           |
| **Currency**          | Boolean | ❌       | ✅     | Filter orders by currency.                    |
| **Max/Min Total**     | String  | ❌       | ✅     | Filter orders by max/min order total (gross). |
| **Transaction State** | String  | ❌       | ✅     | Filter orders by transaction state.           |
...

**Example Output**

```json
[
  {
    "id": "0199c8e1c6ea726b834fe9c07cea87ff",
    "orderNumber": "MOCK-O0199c8e1c6ea726b834fe9c07db49fc7",
    "billingAddressId": "0199c8e1a2517121aec9f29c91894d4c",
    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "orderDateTime": "2025-10-09T12:11:03.786+00:00",
    "amountTotal": 69690.95,
    "amountNet": 58563.82,
    "taxStatus": "gross",
    "shippingTotal": 0,
    "currencyFactor": 1,
    "affiliateCode": null,
    "campaignCode": null,
    "customerComment": null,
    "stateId": "019938bf91d271bf876ceedea8336514",
    "createdAt": "2025-10-09T12:11:03.811+00:00",
    "updatedAt": null,
    "apiAlias": "order"
  },
  {
    "id": "0199c8e1c6ea726b834fe9c0803c20e4",
    "orderNumber": "MOCK-O0199c8e1c6ea726b834fe9c08102dff2",
    "billingAddressId": "0199c8e1a267724da16cd998c3d42efb",
    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "orderDateTime": "2025-10-09T12:11:03.786+00:00",
    "amountTotal": 15152.41,
    "amountNet": 12733.12,
    "taxStatus": "gross",
    "shippingTotal": 0,
    "currencyFactor": 1,
    "affiliateCode": null,
    "campaignCode": null,
    "customerComment": null,
    "stateId": "019938bf91d271bf876ceedea8336514",
    "createdAt": "2025-10-09T12:11:03.812+00:00",
    "updatedAt": null,
    "apiAlias": "order"
  }
]
```

## 3. Create Order

Create a new order in Shopware.

**Parameters**

| Field               | Type    | Required | Description                                  |
| ------------------  | ------- | -------- | -------------------------------------------- |
| **Name**            | String  | ✅       | Order name.                                  |
| **Order Number**    | String  | ✅       | Order identifier.                            |
| **Date and Time**   | Date    | ✅       | Date and time of order creation.             |
| **Currency**        | String  | ✅       | Order currency.                              |
| **State**           | String  | ✅       | State of the order.                          |
| **Customer Number** | String  | ✅       | Number of the customer who places the order. |
| **Line Items**      | Array   | ✅       | Order line items (1+).                       |
...

**Example Input**

```json
{
    "id": "0199bf1a43a976b177d043e92b8bd722",
    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
    "languageId": "019938bf918a717bb21f2ede3292463a",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "billingAddressId": "0199aa7ae89174cca3268ed000752508",
    "orderNumber": "ON0280943",
    "orderDateTime": "2025-10-15T13:54:21.000+00:00",
    "stateId": "019938bf91d271bf876ceedea8f98064",
    "currencyFactor": 1,
    "itemRounding": {
        "decimals": 2,
        "interval": 0.01,
        "roundForNet": true
    },
    "totalRounding": {
        "decimals": 2,
        "interval": 0.01,
        "roundForNet": true
    },
    "orderCustomer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "salutationId": "019938bf919473a3b1855c0f41af83e9",
        "customerNumber": "CN2073094",
        "customerId": "0199aa7ae92f7122a75796093348723f"
    },
    "billingAddress": {
        "id": "0199aa7ae89174cca3268ed000752508",
        "countryId": "019938bf91af721da0270620c4f32ea9",
        "firstName": "John",
        "lastName": "Doe",
        "city": "Berlin",
        "street": "123 Main Street"
    },
    "lineItems": [
        {
            "identifier": "0199abe871fe71259811133198861282",
            "productId": "0199abe871fe71259811133198861282",
            "quantity": 1,
            "label": "aaa",
            "states": [
                "is-physical"
            ],
            "price": {
                "unitPrice": 17.65,
                "totalPrice": 17.65,
                "quantity": 1,
                "calculatedTaxes": [
                    {
                        "tax": 3.3535,
                        "taxRate": 19,
                        "price": 21.0035
                    }
                ],
                "taxRules": [
                    {
                        "taxRate": 19,
                        "percentage": 100
                    }
                ]
            }
        }
    ],
    "price": {
        "netPrice": 17.65,
        "totalPrice": 21.0035,
        "calculatedTaxes": [
            {
                "tax": 3.3535,
                "taxRate": 19,
                "price": 21.0035
            }
        ],
        "taxRules": [
            {
                "taxRate": 19,
                "percentage": 100
            }
        ],
        "positionPrice": 17.65,
        "rawTotal": 17.65,
        "taxStatus": "gross"
    },
    "shippingCosts": {
        "unitPrice": 0,
        "totalPrice": 0,
        "quantity": 1,
        "calculatedTaxes": [
            {
                "tax": 0,
                "taxRate": 19,
                "price": 0
            }
        ],
        "taxRules": [
            {
                "taxRate": 19,
                "percentage": 100
            }
        ]
    },
    "transactions": [
        {
            "paymentMethodId": "019938c02927739fa792eab04e503f87",
            "stateId": "019938bf91d5722a8075bc975c67d822",
            "amount": {
                "unitPrice": 17.65,
                "totalPrice": 21.0035,
                "quantity": 1,
                "calculatedTaxes": [
                    {
                        "tax": 3.3535,
                        "taxRate": 19,
                        "price": 21.0035
                    }
                ],
                "taxRules": [
                    {
                        "taxRate": 19,
                        "percentage": 100
                    }
                ]
            }
        }
    ],
    "deliveries": [
        {
            "shippingOrderAddressId": "0199aa7ae89178c11ab7a74ce4d73a2b",
            "shippingMethodId": "019938bf91bb73c6b0f0a1969448487d",
            "stateId": "019938bf91d3727fb84cfa10ef38039b",
            "shippingDateEarliest": "2025-10-08T14:36:35.881Z",
            "shippingDateLatest": "2025-10-10T14:36:35.881Z",
            "shippingCosts": {
                "unitPrice": 0,
                "totalPrice": 0,
                "quantity": 1,
                "calculatedTaxes": [
                    {
                        "tax": 0,
                        "taxRate": 19,
                        "price": 0
                    }
                ],
                "taxRules": [
                    {
                        "taxRate": 19,
                        "percentage": 100
                    }
                ]
            }
        }
    ],
    "addresses": [
        {
            "id": "0199aa7ae89178c11ab7a74ce4d73a2b",
            "countryId": "019938bf91ae72a4bd89f1d4f20046ab",
            "firstName": "John",
            "lastName": "Doe",
            "city": "Berlin",
            "street": "123 Main Street"
        }
    ]
}
```

**Example Output**

```json
[
  {
    "id": "0199e7bab0ea70511093bdc0c0f2060b",
    "orderNumber": "ON0280943",
    "billingAddressId": "0199c8e1a250722aa62533710ce1991c",
    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "orderDateTime": "2025-10-15T13:54:21.000+00:00",
    "amountTotal": 20826.300000000003,
    "amountNet": 17501.09243697479,
    "taxStatus": "gross",
    "shippingTotal": 0,
    "currencyFactor": 1,
    "affiliateCode": null,
    "campaignCode": null,
    "customerComment": null,
    "stateId": "019938bf91d271bf876ceedea8336514",
    "createdAt": "2025-10-15T11:56:39.414+00:00",
    "updatedAt": null,
    "apiAlias": "order"
  }
]
```

## 4. Update Order

Update existing order data.

**Parameters**

| Field                | Type   | Required | Description                                                    |
| -------------------- | ------ | -------- | -------------------------------------------------------------- |
| **Order ID**       | String | ✅        | ID of the order to update.                                   |
| **Fields to Update** | Object | ✅        | One or more fields to modify (e.g., `billing address`, `line items`, `state`). |

**Example Input**

```json
{
  "orderId": "0199e7bab0ea70511093bdc0c0f2060b",
  "updateFields": {
    "stateId": "019938bf91d271bf876ceedea8f98064",
  }
}
```

**Example Output**

```json
[
  {
    "id": "0199e7bab0ea70511093bdc0c0f2060b",
    "orderNumber": "ON0280943",
    "billingAddressId": "0199c8e1a250722aa62533710ce1991c",
    "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "orderDateTime": "2025-10-15T13:54:21.000+00:00",
    "amountTotal": 20826.300000000003,
    "amountNet": 17501.09243697479,
    "taxStatus": "gross",
    "shippingTotal": 0,
    "currencyFactor": 1,
    "affiliateCode": null,
    "campaignCode": null,
    "customerComment": null,
    "stateId": "019938bf91d271bf876ceedea8f98064",
    "createdAt": "2025-10-15T11:56:39.414+00:00",
    "updatedAt": "2025-10-15T12:05:48.973+00:00",
    "apiAlias": "order"
  }
]
```

## 5. Delete Order

Delete a order by ID.

**Parameters**

| Field          | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| **Order ID** | String | ✅        | ID of the order to delete. |

**Example Output**

```json
[
  {
    "success": true,
    "id": "0199e7bab0ea70511093bdc0c0f2060b",
    "message": "Order 0199e7bab0ea70511093bdc0c0f2060b deleted successfully"
  }
]
```

## Usage Notes
- Only line items that have a price for the specified order currency can be added as line items to the order.
  This is by shopware design and the same restriction is set in the node as well with proper errors for the user.
- A transaction cannot be added to an existing order without providing the new line items to calculate the price data for.

- 
## Other Resources
- [Customer Resource](customers.md)
- [Product Resource](products.md)

## Reference
- [Shopware Admin API Reference - Orders](https://shopware.stoplight.io/docs/admin-api/f95b395c5ae73-list-with-basic-information-of-order-resources)

---

© 2025 Solution25 — Released under the [Fair-Code License](https://faircode.io/)

