# Deep Store 🛍️

Deep Store is a frontend-only e-commerce web application that allows customers to browse products, search and filter listings, view detailed product information, manage a shopping cart, and complete a simulated checkout — all without a backend server. Product, user, cart, and order data are represented and persisted using the browser's local storage.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Homepage](#homepage)
  - [User Authentication](#user-authentication)
  - [Shopping Cart](#shopping-cart)
  - [Checkout](#checkout)
  - [Orders & Order History](#orders--order-history)
  - [Forms & Validation](#forms--validation)
  - [UI Feedback](#ui-feedback)
- [Data Persistence](#data-persistence)
- [Responsive Design](#responsive-design)
- [Non-Functional Requirements](#non-functional-requirements)
- [Project Timeline](#project-timeline)
- [Developers](#developers)

## Overview

Deep Shop is built as a frontend-only project. Since there is no backend, all application data — products, user accounts, cart contents, and order history — is handled and persisted client-side using `localStorage`. Authentication is simulated on the client, and the only available payment method is Cash on Delivery (COD).

## Tech Stack

- **React JS** — UI library for building the application
- **Tailwind CSS** — Utility-first styling
- **Git/GitHub** — Version control and collaboration

## Features

### Homepage

- Header with logo, search bar, shopping cart icon, user/account icon, and login/sign out button
- Image carousel
- Featured categories
- Featured products by category
- Footer with relevant navigation links

### User Authentication

Authentication is simulated on the client side and persisted with `localStorage`.

**Sign Up**
- Full name, email address, and password fields
- Sign Up button
- Link to the Sign In page

**Sign In**
- Email address and password fields
- Sign In button
- Link to the Sign Up page

**Sign Out**
- Signs the user out and clears the active session
- Redirects to the appropriate public page
- Registered account data remains stored in `localStorage` after sign out

**Authentication Persistence**
- Restores the user's authentication state after a page refresh
- Automatically determines sign-in status when the application loads

### Shopping Cart

- Add and remove products
- Increase or decrease product quantity
- View individual product prices, subtotal, and estimated total
- Clear the cart
- Place order

**Cart Persistence**
- Cart data is stored in `localStorage` and restored on reopen/refresh
- `localStorage` updates automatically whenever the cart changes
- Cart quantities and product selections are preserved
- Items are removed from `localStorage` when removed from the cart
- The persisted cart is cleared after a successful order
- For authenticated users, the cart is associated with the signed-in user so carts are not shared between users

### Checkout

A simulated checkout flow that allows users to:
- Review products before checkout
- Enter customer and shipping information
- Select a shipping option
- Review the order summary (subtotal, shipping, and total)
- Select a simulated payment method (Cash on Delivery)
- Have required fields validated before submission

### Orders & Order History

**Order Page**
- Delivery information
- Order summary
- Selected products and quantities
- Subtotal, shipping cost, and total amount

**Order History**
- View all previously submitted orders
- View order ID, order date, number of products, and quantities
- View order subtotal and order status

**Order Persistence**
- Completed orders are stored in `localStorage`
- Order history persists across page refreshes and browser sessions
- Orders are associated with the currently signed-in user
- New orders are added to history after successful checkout without overwriting existing history
- The cart is cleared after a successful order

### Forms & Validation

- Validates required form fields
- Validates email format and password requirements
- Displays appropriate validation messages
- Prevents submission of invalid forms
- Provides clear success and error feedback

### UI Feedback

Feedback is provided for:
- Successful sign up / sign in, failed sign in, and sign out
- Adding or removing a product from the cart
- Successful checkout
- Empty cart and empty order history states
- Invalid form submissions

## Data Persistence

| Data | Persistence | Association |
|------|-------------|-------------|
| Shopping Cart | `localStorage` | User |
| Order History | `localStorage` | User |
| Sign In | `localStorage` | User |
| Sign Up | `localStorage` | User |

## Responsive Design

The application adapts to:
- Mobile devices
- Tablets
- Desktop screens

## Non-Functional Requirements

**Performance**
- Minimizes unnecessary React re-renders
- Uses lazy-loading for smooth page rendering and speed

**Responsiveness**
- Consistent experience across screen sizes

**Visual Consistency**
- A consistent design system throughout the application

## Project Timeline

3 weeks

## Developers

Developed by interns at **DeepTech Technologies**:

- Abdulkadir Musa
- Abdullahi Abdulrasheed
- Isaac Okeke
