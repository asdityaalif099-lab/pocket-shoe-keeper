# Shoe Stock Keeper

Build a mobile-first app called Shoes Store Management.

The app is a simple offline-first management tool for small shoe stores. It must work completely without internet, backend, authentication, Supabase, or AI.

Core Requirements

Mobile-first responsive UI optimized for Android phones.

Use React + TypeScript.

Use Capacitor and make the project ready to export/build in Android Studio.

Store all application data locally on the device using LocalStorage.

No backend.

No database server.

No login or registration.

No AI or external AI API.

The app must remain fully usable when offline.

Keep the implementation simple and maintainable. Do not over-engineer.

Do not add unnecessary libraries or complex architecture.

Do not use TanStack unless absolutely necessary.

All important data must persist after closing and reopening the app.

App Navigation

Use a simple bottom navigation:

Dashboard

Products

Inventory

Sales

More

Use a clean modern retail-management design with cards, clear typography, simple icons, good spacing, and touch-friendly controls.

1. Dashboard

Create a useful but simple dashboard.

Show:

Total Products

Total Stock

Low Stock Items

Out of Stock Items

Today's Sales

Today's Revenue

Estimated Profit Today

Add quick action buttons:

Add Product

Stock In

New Sale

Show a small "Recent Sales" section containing the latest transactions.

Show useful low-stock alerts when applicable.

If there is no data yet, show a friendly empty state explaining what the user can do first.

2. Products

Create a product management screen.

Users can:

View all shoe products

Search products

Filter by category

Add product

Edit product

Delete product

View product details

Each product should support:

Product name

SKU / product code

Brand

Category

Selling price

Purchase price

Available colors

Available sizes

Minimum stock level

Optional product image

Notes

Categories should include:

Sneakers

Running

Casual

Formal

Sandals

Boots

Sports

Other

Allow users to add multiple sizes and colors.

Product photos are optional. If implemented, store them locally and do not upload them anywhere.

3. Inventory

Inventory is one of the most important parts of the app.

Stock must be tracked by:

Product + Size + Color

For example:

Nike Air Example:

Size 39:

Black: 2

White: 1

Red: 0

Size 40:

Black: 4

White: 2

Red: 1

Do NOT only store one total stock number for a shoe product.

Create an inventory screen where users can:

See current stock

Search products

Filter low stock

Filter out of stock

View stock by size and color

Add stock

Adjust stock

Stock In

Allow:

Select product

Select size

Select color

Enter quantity

Optional purchase cost

Add note

Save

Stock Adjustment

Allow users to manually increase or decrease stock.

Require an optional adjustment reason such as:

Damaged

Lost

Correction

Return

Other

Every stock change must update the current inventory correctly.

4. Sales

Create a simple sales recording system.

When creating a sale:

Select a product

Select size

Select color

Enter quantity

Show selling price

Add more items if needed

Calculate subtotal

Calculate total

Select payment method

Optionally select customer

Save transaction

Payment methods:

Cash

Bank Transfer

E-Wallet

Other

Prevent users from selling more stock than is currently available.

After a successful sale, automatically reduce the corresponding inventory quantity.

Generate a simple transaction number automatically.

The sale should record:

Transaction ID

Date/time

Items

Product

Size

Color

Quantity

Unit price

Subtotal

Total

Payment method

Optional customer

Optional notes

5. Sales History

Create a sales history screen.

Show:

Transaction number

Date

Number of items

Total amount

Payment method

Allow users to:

Open transaction details

Search transactions

Filter by date

Filter by payment method

Date filters:

Today

This Week

This Month

Custom Date Range

Do not allow accidental deletion. If deleting a sale is supported, warn the user and restore the sold stock correctly.

6. Reports

Inside the More section, create simple reports.

Sales Report

Show:

Total revenue

Number of transactions

Units sold

Estimated profit

Allow date filtering.

Product Performance

Show:

Best-selling products

Most sold sizes

Most sold colors

Inventory Report

Show:

Total stock

Low-stock items

Out-of-stock items

Keep reports simple and easy to understand.

7. Customers

Create a lightweight customer management section.

Users can add:

Customer name

Phone number

Notes

Customers are optional.

During a sale, users can optionally select a customer.

Show basic customer purchase history when viewing a customer.

Do not build a complicated CRM system.

8. Expenses

Create a simple expense tracker.

Users can record:

Expense name

Category

Amount

Date

Notes

Categories:

Rent

Electricity

Shipping

Packaging

Employee

Marketing

Other

Show:

Today's expenses

This month's expenses

Total expenses for selected period

Use expenses to calculate:

Estimated Profit = Revenue - Purchase Cost - Expenses

Keep this as an estimated business figure, not formal accounting.

9. Currency

Do not hard-code the application to Indonesian Rupiah.

Create a currency setting.

Include common currencies such as:

IDR

USD

EUR

GBP

MYR

SGD

AUD

JPY

Allow a custom currency symbol if necessary.

All prices and financial reports should use the selected currency.

Format prices appropriately for the selected currency.

10. More / Settings

Create a More screen containing:

Reports

Customers

Expenses

Backup & Restore

Settings

Settings should include:

Store name

Currency

Default minimum stock

Theme

App information

Support light and dark mode.

11. Backup & Restore

Because this app is completely offline, provide simple local data backup.

Create:

Export Data

Export all important app data into a JSON file.

Include:

Products

Inventory

Sales

Customers

Expenses

Settings

Create:

Import Data

Allow users to restore a previously exported JSON backup.

Before importing, show a clear warning that existing local data may be replaced or merged.

Do not upload backup data to a server.

12. Data Structure

Use simple local data structures.

Suggested entities:

Product:

id

name

sku

brand

category

sellingPrice

purchasePrice

colors[]

sizes[]

minimumStock

image

notes

createdAt

updatedAt

Inventory:

id

productId

size

color

quantity

updatedAt

Sale:

id

transactionNumber

items[]

total

paymentMethod

customerId

notes

createdAt

Sale Item:

productId

size

color

quantity

unitPrice

purchasePrice

subtotal

Customer:

id

name

phone

notes

createdAt

Expense:

id

name

category

amount

date

notes

Settings:

storeName

currency

currencySymbol

defaultMinimumStock

theme

Store these structures in LocalStorage with a simple, reliable storage layer.

13. Important Business Logic

Implement these correctly:

Adding stock increases the correct product/size/color inventory.

Selling stock decreases the correct product/size/color inventory.

Users cannot sell unavailable stock.

Low stock should be calculated from actual inventory.

Out-of-stock means quantity is 0.

Editing a product must not break existing sales history.

Deleting a product should be handled carefully if historical sales reference it.

Sales should preserve the price at the time of sale.

Purchase price should also be preserved in sale items so estimated profit remains accurate.

Revenue comes from completed sales.

Estimated profit uses recorded purchase cost and expenses.

Currency formatting must be consistent throughout the app.

14. UI/UX

Make the interface feel like a practical small-business mobile app.

Design principles:

Clean

Fast

Simple

Professional

Touch friendly

Easy for non-technical store owners

Minimal unnecessary screens

Use cards for dashboard statistics.

Use clear buttons such as:

Add Product

Stock In

New Sale

Use confirmation dialogs for destructive actions.

Use toast/snackbar feedback after successful actions.

Use empty states when there is no data.

Forms should be simple and optimized for mobile keyboards.

Use numeric keyboards for price and quantity fields.

Do not create complicated dashboards or excessive charts.

15. Offline Behavior

The app must function without an internet connection.

Do not depend on:

Supabase

Firebase

REST APIs

External databases

Authentication services

AI services

All normal application operations must work offline.

If the device is offline, the user should still be able to:

Add products

Edit products

Manage inventory

Record sales

Manage customers

Record expenses

View reports

Export data

Import data

16. Capacitor / Android

Configure the project so it can be exported and opened in Android Studio.

Use Capacitor.

Ensure:

Android project can be generated

App works inside Android WebView

Safe-area padding is handled for modern Android devices

Touch interactions work correctly

Keyboard does not break forms or modals

No unnecessary network dependency exists

App launches directly into the dashboard

Use a proper mobile viewport and responsive layout.

Do not add a loading bar to the splash screen.

17. Sample Data

Include a small optional sample-data mechanism so the interface can be tested easily.

Sample products can include:

Running Shoes

Classic Sneakers

Formal Leather Shoes

Casual Shoes

Use several sizes and colors so inventory-by-variant can be tested.

Do not force sample data into a real user's store permanently. Provide a simple way to clear/reset demo data.

18. Final Quality Requirements

Before finishing, verify:

Product CRUD works.

Size/color variants work.

Inventory calculations work.

Stock-in works.

Stock adjustment works.

Sales reduce the correct inventory.

Selling unavailable stock is blocked.

Sales history works.

Revenue calculations work.

Estimated profit works.

Expenses work.

Customers work.

Reports work.

Currency setting works.

LocalStorage persistence works after page/app restart.

Export/import works.

Empty states work.

Mobile layout works correctly.

Android/Capacitor compatibility is maintained.

Keep the entire application focused on being a simple, reliable offline shoe-store management app. Avoid unnecessary enterprise features, backend infrastructure, authentication, AI, cloud synchronization, complex state-management systems, or over-engineered abstractions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pocket-shoe-keeper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef5ed890-dedf-4f01-9689-c8cefc5e98c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
