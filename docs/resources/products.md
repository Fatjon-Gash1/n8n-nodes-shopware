# Product Resource

The **Product Resource** allows you to manage Shopware 6 products directly from your **n8n** workflows.  
You can create, retrieve, update, and delete product records using the Shopware Admin API.

---

## Supported Operations

| Operation | Description |
|------------|-------------|
| **Get** | Retrieve a single product by its ID. |
| **Get Many** | Retrieve multiple products, optionally filtered by category, stock, manufacturer etc. |
| **Create** | Add a new product to your Shopware store. |
| **Update** | Modify product details such as name, price, stock etc. |
| **Delete** | Remove a product from your store by ID. |

---

## 1. Get Product

Retrieve a single product using its **ID**.

**Parameters**

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| **Product ID** | String | ✅ | The unique identifier of the product to retrieve. |

**Example Output**

```json
[
  {
    "id": "0199c8e1b6ff739b9b6bc86f5c6ed1e8",
    "parentId": null,
    "manufacturerId": null,
    "price": [
      {
        "extensions": [],
        "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
        "net": 3500.218487394958,
        "gross": 4165.26,
        "linked": true,
        "listPrice": null,
        "percentage": null,
        "regulationPrice": null,
        "apiAlias": "price"
      }
    ],
    "productNumber": "MOCK-P0199c8e1b6ff739b9b6bc86f5d0491d6",
    "active": true,
    "available": false,
    "availableStock": 615,
    "stock": 615,
    "displayGroup": null,
    "ean": null,
    "weight": null,
    "width": null,
    "height": null,
    "length": null,
    "ratingAverage": null,
    "categoryIds": null,
    "name": "Enormous Plastic Shoes",
    "description": "Enormous Plastic Shoes with Enormous functionality.",
    "createdAt": "2025-10-09T12:10:59.736+00:00",
    "updatedAt": null,
    "apiAlias": "product"
  }
]
```

## 2. Get Many Products

Retrieve multiple products, optionally applying filters or pagination.

**Parameters & Filters**

| Field             | Type    | Required | Filter | Description                            |
| ----------------- | ------- | -------- | ------ | -------------------------------------- |
| **Limit**         | Number  | ❌       | ❌     | Maximum number of products to return.  |
| **Active**        | Boolean | ❌       | ✅     | If true, only returns active products. |
| **Max/Min Price** | String  | ❌       | ✅     | Filter by product prices.              |
| **Max/Min Stock** | String  | ❌       | ✅     | Filter by product stock levels.        | 
...

**Example Output**

```json
[
  {
    "id": "0199c8e1b6ff739b9b6bc86f5c6ed1e8",
    "parentId": null,
    "manufacturerId": null,
    "price": [
      {
        "extensions": [],
        "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
        "net": 3500.218487394958,
        "gross": 4165.26,
        "linked": true,
        "listPrice": null,
        "percentage": null,
        "regulationPrice": null,
        "apiAlias": "price"
      }
    ],
    "productNumber": "MOCK-P0199c8e1b6ff739b9b6bc86f5d0491d6",
    "active": true,
    "available": false,
    "availableStock": 615,
    "stock": 615,
    "displayGroup": null,
    "ean": null,
    "weight": null,
    "width": null,
    "height": null,
    "length": null,
    "ratingAverage": null,
    "categoryIds": null,
    "name": "Enormous Plastic Shoes",
    "description": "Enormous Plastic Shoes with Enormous functionality.",
    "createdAt": "2025-10-09T12:10:59.736+00:00",
    "updatedAt": null,
    "apiAlias": "product"
  },
  {
    "id": "0199c8e1b6ff739b9b6bc86f5df4ac5e",
    "parentId": null,
    "manufacturerId": null,
    "price": [
      {
        "extensions": [],
        "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
        "net": 605.7563025210085,
        "gross": 720.85,
        "linked": true,
        "listPrice": null,
        "percentage": null,
        "regulationPrice": null,
        "apiAlias": "price"
      }
    ],
    "productNumber": "MOCK-P0199c8e1b6ff739b9b6bc86f5e348b9d",
    "active": true,
    "available": false,
    "availableStock": 550,
    "stock": 550,
    "displayGroup": null,
    "ean": null,
    "weight": null,
    "width": null,
    "height": null,
    "length": null,
    "ratingAverage": null,
    "categoryIds": null,
    "name": "Incredible Iron Hat",
    "description": "Incredible Iron Hat with Durable style.",
    "createdAt": "2025-10-09T12:10:59.758+00:00",
    "updatedAt": null,
    "apiAlias": "product"
  }
]
```

## 3. Create Product

Create a new product in Shopware.

**Parameters**

| Field              | Type    | Required  | Description                                      |
| ------------------ | ------- | --------- | ------------------------------------------------ |
| **Name**           | String  | ✅        | Product name.                                    |
| **Product Number** | String  | ✅        | Unique SKU identifier.                           |
| **Price (Gross)**  | Number  | ✅        | Product price (gross value).                     |
| **Stock**          | Number  | ✅        | Available stock.                                 |
| **Tax ID**         | String  | ✅        | ID of the tax rate configured in Shopware.       |
| **Active**         | Boolean | ❌        | Whether the product is active. Defaults to true. |
...

**Example Input**

```json
{
    "taxId": "019938bf91bc738b93d4389f6cb9fa61",
    "price": [
        {
            "currencyId": "019938bf91b770bd9ee7d86a5a3efadd",
            "gross": 799.99,
            "net": 672.26,
            "linked": true
        }
    ],
    "productNumber": "SW902843",
    "stock": 100,
    "name": "Mobile Phone",
    "description": "A high-quality mobile phone",
    "active": true,
    "visibilities": [
        {
            "salesChannelId": "019938bfa44d7243a6f6121994bd7ddd",
            "visibility": 30
        }
    ],
    "categories": [
        {
            "id": "2185182cbbd4462ea844abeb2a438b33",
            "name": "Free time & electronics"
        }
    ],
    "manufacturer": {
        "name": "Apple"
    }
}
```

**Example Output**

```json
[
  {
    "id": "0199e78cd22a70119b7d94adf8d9ec4d",
    "parentId": null,
    "manufacturerId": "0199e78cd22b7334aa9939aa6c83fed8",
    "price": [
      {
        "extensions": [],
        "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
        "net": 672.26,
        "gross": 799.99,
        "linked": true,
        "listPrice": null,
        "percentage": null,
        "regulationPrice": null,
        "apiAlias": "price"
      }
    ],
    "productNumber": "SW902843",
    "active": true,
    "available": true,
    "availableStock": 100,
    "stock": 100,
    "displayGroup": "7c893b2b676da560f38f360414716ff8",
    "ean": null,
    "weight": null,
    "width": null,
    "height": null,
    "length": null,
    "ratingAverage": null,
    "categoryIds": [
      "251448b91bc742de85643f5fccd89051"
    ],
    "name": "Mobile Phone",
    "description": "A high-quality mobile phone",
    "createdAt": "2025-10-15T11:06:29.821+00:00",
    "updatedAt": "2025-10-15T11:06:29.970+00:00",
    "apiAlias": "product"
  }
]
```

## 4. Update Product

Update existing product data.

**Parameters**

| Field                | Type   | Required | Description                                                    |
| -------------------- | ------ | -------- | -------------------------------------------------------------- |
| **Product ID**       | String | ✅        | ID of the product to update.                                   |
| **Fields to Update** | Object | ✅        | One or more fields to modify (e.g., `name`, `price`, `stock`). |

**Example Input**

```json
{
  "productId": "0199e78cd22a70119b7d94adf8d9ec4d",
  "updateFields": {
    "description": "A high-quality mobile phone with the best camera quality",
  }
}
```

**Example Output**

```json
[
  {
    "id": "0199e78cd22a70119b7d94adf8d9ec4d",
    "parentId": null,
    "manufacturerId": "0199e78cd22b7334aa9939aa6c83fed8",
    "price": [
      {
        "extensions": [],
        "currencyId": "b7d2554b0ce847cd82f3ac9bd1c0dfca",
        "net": 672.26,
        "gross": 799.99,
        "linked": true,
        "listPrice": null,
        "percentage": null,
        "regulationPrice": null,
        "apiAlias": "price"
      }
    ],
    "productNumber": "SW902843",
    "active": true,
    "available": true,
    "availableStock": 100,
    "stock": 100,
    "displayGroup": "7c893b2b676da560f38f360414716ff8",
    "ean": null,
    "weight": null,
    "width": null,
    "height": null,
    "length": null,
    "ratingAverage": null,
    "categoryIds": [
      "251448b91bc742de85643f5fccd89051"
    ],
    "name": "Mobile Phone",
    "description": "A high-quality mobile phone with the best camera quality",
    "createdAt": "2025-10-15T11:06:29.821+00:00",
    "updatedAt": "2025-10-15T11:13:52.466+00:00",
    "apiAlias": "product"
  }
]
```

## 5. Delete Product

Delete a product by ID.

**Parameters**

| Field          | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| **Product ID** | String | ✅        | ID of the product to delete. |

**Example Output**

```json
[
  {
    "success": true,
    "id": "0199e78cd22a70119b7d94adf8d9ec4d",
    "message": "Product 0199e78cd22a70119b7d94adf8d9ec4d deleted successfully"
  }
]
```

## Usage Notes

- Prices must include currency and tax information if you are managing multiple currencies.
  The node supports this by allowing the user to add multiple prices for the product.
  Each with a unique currency that is retrieved from the shopware instance.

## Other Resources
- [Customer Resource](customers.md)
- [Order Resource](orders.md)

## Reference
- [Shopware Admin API Reference - Products](https://shopware.stoplight.io/docs/admin-api/eecbb397dce52-list-with-basic-information-of-product-resources)

---

© 2025 Solution25 — Released under the [Fair-Code License](https://faircode.io/)
