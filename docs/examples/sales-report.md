# Example: Shopware Sales Report Workflow

This workflow automatically generates and sends a **sales summary** for multiple **Shopware 6** projects on specified intervals.  
It retrieves project data from **Airtable**, collects order information from each Shopware instance, aggregates sales metrics, and sends formatted reports via **Email** and **Slack**.

---

## Workflow Overview

| Component | Description |
|------------|-------------|
| **Trigger** | Scheduled execution using the `Schedule Trigger` node. |
| **Data Source** | Retrieves project URLs and credentials from the Airtable `Projects` table. |
| **Logic** | Iterates over each project, fetches order data for the previous interval, calculates sales totals, and aggregates metrics. |
| **Output** | Sends a structured **Email** and **Slack message** with project and global performance summaries. |

---

## Workflow Steps

### 1. **Trigger**

**Node:** `Schedule Trigger`  
**Type:** `n8n-nodes-base.scheduleTrigger`  
**Schedule:** e.g. Monthly.  
**Purpose:** Initiates the workflow once per month.

---

### 2. **Set Last `<interval>` Date**

**Node:** `Set Last <interval> Date` (Code)  
Calculates the first day of the previous interval e.g. month to determine the date range for querying Shopware orders.

```js
const date = new Date();
date.setMonth(date.getMonth() - 1);
return [{ date: date.toISOString().split('T')[0] }];
```

---

## 3. Get Project URLs

Node: `Get Project URLs` (Airtable)
Retrieves all Shopware projects and their thresholds.

| Field        | Description                        |
| ------------ | ---------------------------------- |
| **Base ID**  | `appe1ZsZ0wJPZoHYT`                |
| **Table ID** | `tbljFDNk8vIUPzQcH`                |
| **Fields**   | `Project Name`, `URL`, `Threshold` |

---

## 4. Loop Over Project URLs

Node: `Loop Over Project URLs` (SplitInBatches)
Iterates through each project retrieved from Airtable, allowing the workflow to process each project individually.

---

## 5. Switch Shopware Project Credentials

Node: `Switch Shopware Project Credentials2` (Switch)
Selects the appropriate Shopware credentials dynamically based on the current project’s name.

---

## 6. Get Orders per Project

Fetches all orders for the given project created after the calculated last-interval date.

| Node                         | Function                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| **Get Orders for Project 1** | Retrieves order data for the first project.                           |
| **Get Orders for Project 2** | Retrieves order data for the second project). |
...

Credentials:
Each Shopware node uses the respective project credentials (e.g., `Shopware account`).

---

## 7. Calculate Per-Project Sales

Node(s): `Calculate Sales Data`, `Calculate Sales Data1`...
Computes key metrics for each project:

| Metric                  | Formula                    |
| ----------------------- | -------------------------- |
| **Total Orders**        | `orders.length`            |
| **Total Sales**         | `sum(orders.amountTotal)`  |
| **Average Order Value** | `totalSales / totalOrders` |
| **Date**                | Current report date        |

**Output Example:**

```json
{
  "project": "Shopware A",
  "ordersCount": 87,
  "totalSales": 12340,
  "avgOrderValue": 141.84,
  "date": "2025-08-11"
}
```

---

## 8. Prepare Combined Project Data

Node: `Prepare Projects Data`
Combines all per-project sales summaries into a single array for aggregation.

```js
return [{ projectsData: $input.all().map(o => o.json) }];
```

---

## 9. Calculate Global Sales Metrics

Node: `Calculate All Projects Sales Data`
Aggregates all project data to compute global KPIs:

| Metric                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| **Total Orders**        | Sum of all orders from all projects.             |
| **Total Sales**         | Sum of all totalSales values (formatted in EUR). |
| **Average Order Value** | Overall average across all projects.             |

---

## 10. Format Reports
Prepare HTML Table (Email Report)

Node: `Prepare HTML Table Rows`
Generates a `<tbody>` for the summary email, with currency formatting.

```js
const formatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
});

return [{
  htmlRows: $input.all().map(o =>
    `<tr><td>${o.json.project}</td><td>${o.json.date}</td><td>${o.json.ordersCount}</td><td>${formatter.format(o.json.totalSales)}</td><td>${formatter.format(o.json.avgOrderValue)}</td></tr>`
  ).join('')
}];
```

---

**Send Summary Email**

Node: `Send Summary Email` (Email)
Sends a structured HTML report summarizing all projects.

**Includes:**

- Branded header and timestamp.

- Per-project table.

- Global totals.

- Styled HTML with a footer message.

- Credentials: SMTP account

---

## 11. Prepare and Send Slack Message

Nodes:

`Prepare Slack Block Message` – Formats a Slack block with project summaries.

Send Summary Message – Sends the report to `#channel`.

Example Slack Message:

```yaml
📊 Monthly Sales Report – 11/08/2025
Total Orders: 133
Total Sales: €19,310
Overall Avg. Order Value: €145.15
📁 Individual Project Breakdown
• Project A – 87 Orders (€12,340)
• Project B – 46 Orders (€6,970)
```

---

## Download

You can download the ready-to-import n8n workflow JSON below:

[**Download Shopware Sales Report Workflow**](../../workflows/sales-report.json)

*(Import this file directly into your n8n instance.)*   

---

## Tips

You can adjust the schedule (e.g., weekly or quarterly) for different reporting frequencies.

Extend the workflow by:

- Adding refunds, new customer counts, or average item count per order.

- Writing results to Airtable or a database for long-term analytics.

- Integrating Google Sheets for auto-updated dashboards.

- Customize the Slack and Email messages with branding and team mentions.

---

## Other Examples

[Shopware Low Stock Alert Example Workflow](low-stock-alert.md)

---

## Related Resources
- [Shopware Product Resource](../resources/products.md)
- [Airtable Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.airtable/)  
- [Slack Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/)
- [Shopware API Reference](https://developer.shopware.com/docs/resources/references/api-reference.html)
