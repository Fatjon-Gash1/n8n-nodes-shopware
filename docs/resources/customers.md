# Customer Resource

The **Customer Resource** allows you to manage Shopware 6 customers directly from your **n8n** workflows.  
You can create, retrieve, update, and delete customer records using the Shopware Admin API.

---

## Supported Operations

| Operation | Description |
|------------|-------------|
| **Get** | Retrieve a single customer by its ID. |
| **Get Many** | Retrieve multiple customers, optionally filtered by first/last name, email, customer number etc. |
| **Create** | Add a new customer to your Shopware store. |
| **Update** | Modify customer details such as first/last name, shipping/billing addresses, birthday etc. |
| **Delete** | Remove a customer from your store by ID. |

---

## 1. Get Customer

Retrieve a single customer using its **ID**.

**Parameters**

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| **Customer ID** | String | ✅ | The unique identifier of the customer to retrieve. |

**Example Output**

```json
[
  {
    "id": "0199c8e1a250722aa62533710ca3c141",
    "groupId": "cfbd5018d38d41d8adca10d94fc8bdd6",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "defaultBillingAddressId": "0199c8e1a250722aa62533710ce1991c",
    "defaultShippingAddressId": "0199c8e1a250722aa62533710ce1991c",
    "customerNumber": "MOCK-C0199c8e1a250722aa62533710d7e10f4",
    "salutationId": "019938bf919473a3b1855c0f41af83e9",
    "firstName": "Helen",
    "lastName": "Pfeffer",
    "company": null,
    "email": "kaela.kub@example.org",
    "active": true,
    "guest": false,
    "lastLogin": null,
    "birthday": null,
    "orderCount": 0,
    "orderTotalAmount": 0,
    "defaultPaymentMethodId": "019938bf91b8717eaf618a6896ec623e",
    "createdAt": "2025-10-09T12:10:54.416+00:00",
    "updatedAt": null,
    "apiAlias": "customer"
  }
]
```

## 2. Get Many Customers

Retrieve multiple customers, optionally applying filters or pagination.

**Parameters & Filters**

| Field            | Type    | Required | Filter | Description                            |
| ---------------- | ------- | -------- | ------ | -------------------------------------- |
| **Limit**        | Number  | ❌       | ❌     | Maximum number of customers to return. |
| **Guest**        | Boolean | ❌       | ✅     | If true, only returns guest customers. |
| **Account Type** | String  | ❌       | ✅     | Filter by customer account types.      |
| **Created By**   | String  | ❌       | ✅     | Filter by customer creator (admin).    |
...

**Example Output**

```json
[
  {
    "id": "0199c8e1a250722aa62533710ca3c141",
    "groupId": "cfbd5018d38d41d8adca10d94fc8bdd6",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "defaultBillingAddressId": "0199c8e1a250722aa62533710ce1991c",
    "defaultShippingAddressId": "0199c8e1a250722aa62533710ce1991c",
    "customerNumber": "MOCK-C0199c8e1a250722aa62533710d7e10f4",
    "salutationId": "019938bf919473a3b1855c0f41af83e9",
    "firstName": "Helen",
    "lastName": "Pfeffer",
    "company": null,
    "email": "kaela.kub@example.org",
    "active": true,
    "guest": false,
    "lastLogin": null,
    "birthday": null,
    "orderCount": 0,
    "orderTotalAmount": 0,
    "defaultPaymentMethodId": "019938bf91b8717eaf618a6896ec623e",
    "createdAt": "2025-10-09T12:10:54.416+00:00",
    "updatedAt": null,
    "apiAlias": "customer"
  },
  {
    "id": "0199c8e1a250722aa62533710e74c21e",
    "groupId": "cfbd5018d38d41d8adca10d94fc8bdd6",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "defaultBillingAddressId": "0199c8e1a250722aa62533710e7cbd38",
    "defaultShippingAddressId": "0199c8e1a250722aa62533710e7cbd38",
    "customerNumber": "MOCK-C0199c8e1a250722aa62533710f704306",
    "salutationId": "019938bf919473a3b1855c0f41af83e9",
    "firstName": "Chadd",
    "lastName": "Marks",
    "company": null,
    "email": "mariela.thompson@example.net",
    "active": true,
    "guest": false,
    "lastLogin": null,
    "birthday": null,
    "orderCount": 0,
    "orderTotalAmount": 0,
    "defaultPaymentMethodId": "019938bf91b8717eaf618a6896ec623e",
    "createdAt": "2025-10-09T12:10:54.416+00:00",
    "updatedAt": null,
    "apiAlias": "customer"
  }
]
```

## 3. Create Customer

Create a new customer in Shopware.

**Parameters**

| Field               | Type    | Required | Description                      |
| ------------------- | ------- | -------- | -------------------------------- |
| **Customer Number** | String  | ✅       | Customer personal number.        |
| **First Name**      | String  | ✅       | Customer first name.             |
| **Last Name**       | String  | ✅       | Customer last name.              |
| **Email**           | String  | ✅       | Customer email address.          |
| **Payment Method**  | String  | ✅       | Customer default payment method. |
| **Group**           | String  | ✅       | Customer group.                  |
...

**Example Input**

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "customerNumber": "CN284334",
    "languageId": "019938bf918a717bb21f2ede3292463a",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "groupId": "cfbd5018d38d41d8adca10d94fc8bdd6",
    "addresses": [
        {
            "id": "01999f89baba7961cf6582345023a854",
            "countryId": "019938bf919473a3b1855c0f42428c88",
            "firstName": "John",
            "lastName": "Doe",
            "city": "Berlin",
            "street": "123 Main Street"
        }
    ],
    "defaultShippingAddressId": "01999f89baba7961cf6582345023a854",
    "defaultBillingAddressId": "01999f89baba7961cf6582345023a854",
    "defaultPaymentMethodId": "019938bf91b9739a8ec0fe77fefefc86"
}
```

**Example Output**

```json
[
  {
    "id": "0199e7aae744721bb0ab2d350e2c523d",
    "groupId": "cfbd5018d38d41d8adca10d94fc8bdd6",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "defaultBillingAddressId": "0199e7aae6107644b9ff0b94fe3a3158",
    "defaultShippingAddressId": "0199e7aae6107644b9ff0b94fe3a3158",
    "customerNumber": "CN284334",
    "salutationId": "019938bf919473a3b1855c0f40eb9665",
    "firstName": "John",
    "lastName": "Doe",
    "company": null,
    "email": "john.doe@example.com",
    "active": true,
    "guest": false,
    "lastLogin": null,
    "birthday": null,
    "orderCount": 0,
    "orderTotalAmount": 0,
    "defaultPaymentMethodId": "019938bf91b8717eaf618a6896ec623e",
    "createdAt": "2025-10-15T11:39:21.299+00:00",
    "updatedAt": null,
    "apiAlias": "customer"
  }
]
```

## 4. Update Customer

Update existing customer data.

**Parameters**

| Field                | Type   | Required | Description                                                    |
| -------------------- | ------ | -------- | -------------------------------------------------------------- |
| **Customer ID**       | String | ✅        | ID of the customer to update.                                   |
| **Fields to Update** | Object | ✅        | One or more fields to modify (e.g., `first/last name`, `email`, `payment method`). |

**Example Input**

```json
{
  "customerId": "0199e7aae744721bb0ab2d350e2c523d",
  "updateFields": {
    "defaultPaymentMethodId": "019938c02927739fa792eab04e503f87",
  }
}
```

**Example Output**

```json
[
  {
    "id": "0199e7aae744721bb0ab2d350e2c523d",
    "groupId": "cfbd5018d38d41d8adca10d94fc8bdd6",
    "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
    "languageId": "2fbb5fe2e29a4d70aa5854ce7ce3e20b",
    "defaultBillingAddressId": "0199e7aae6107644b9ff0b94fe3a3158",
    "defaultShippingAddressId": "0199e7aae6107644b9ff0b94fe3a3158",
    "customerNumber": "CN284334",
    "salutationId": "019938bf919473a3b1855c0f40eb9665",
    "firstName": "John",
    "lastName": "Doe",
    "company": null,
    "email": "john.doe@example.com",
    "active": true,
    "guest": false,
    "lastLogin": null,
    "birthday": null,
    "orderCount": 0,
    "orderTotalAmount": 0,
    "defaultPaymentMethodId": "019938c02927739fa792eab04e503f87",
    "createdAt": "2025-10-15T11:39:21.299+00:00",
    "updatedAt": "2025-10-15T11:44:38.170+00:00",
    "apiAlias": "customer"
  }
]
```

## 5. Delete Customer

Delete a customer by ID.

**Parameters**

| Field          | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| **Customer ID** | String | ✅        | ID of the customer to delete. |

**Example Output**

```json
[
  {
    "success": true,
    "id": "0199e7aae744721bb0ab2d350e2c523d",
    "message": "Customer 0199e7aae744721bb0ab2d350e2c523d deleted successfully"
  }
]
```

## Other Resources
- [Product Resource](products.md)
- [Order Resource](orders.md)

## Reference
- [Shopware Admin API Reference - Customers](https://shopware.stoplight.io/docs/admin-api/9a2bfcaac4cf6-list-with-basic-information-of-customer-resources)

---

© 2025 Solution25 — Released under the [Fair-Code License](https://faircode.io/)
