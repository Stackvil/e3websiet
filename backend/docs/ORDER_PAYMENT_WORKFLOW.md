# Order & Payment Workflow

This document outlines the end-to-end lifecycle of a user placing an order, processing the payment, and the database record-keeping that occurs within the application.

## 1. Cart & Checkout Initiation (Frontend)

1. **User Action:** The authenticated user adds items (rides, dine items, event bookings) to their cart and clicks "Checkout".
2. **API Request:** The frontend (`PaymentGateway.jsx` / `Cart.jsx`) calculates the totals and sends a `POST` request to the appropriate checkout endpoint (e.g., `/api/orders/e3/checkout` or `/api/orders/e4/checkout`) including the item details.

## 2. Order Creation & Payment Link Generation (Backend)

1. **User Validation:** The backend `checkoutHandler` (inside `routes/orders.js`) verifies the authenticated user's details via Supabase.
2. **Transaction ID:** A unique transaction ID (`txnid`) is generated (e.g., `ETH-492813`).
3. **Draft Record Creation:** An initial order record is inserted into the respective database table (`e3orders` or `e4orders`) with the status explicitly marked as `placed`. This record includes the full JSON array of items, the calculated total `amount`, the `txnid`, and the `userId`.
4. **Easebuzz Session:** The backend securely communicates with the Easebuzz Payment Gateway to initiate a payment session. Crucial metadata is passed in the User Defined Fields (UDFs):
   - `udf1`: Target Location (E3 or E4)
   - `udf2`: User ID
5. **Response:** Easebuzz returns an `access_key` and a redirect `payment_url`. The backend passes these back to the frontend.

## 3. Transaction Execution (Easebuzz Gateway)

1. **User Redirection:** The frontend redirects the user (or opens an iframe) to the Easebuzz hosted checkout page using the provided URL.
2. **Payment Attempt:** The user inputs their payment details (UPI, Card, Netbanking) and authorizes the transaction.
3. **Callback Webhooks:** Easebuzz autonomously triggers a server-to-server `POST` callback to our backend endpoints (`/api/payment/success` or `/api/payment/failure`). **The frontend does not dictate the outcome**, effectively preventing client-side spoofing.

## 4. Finalizing Records (Backend Webhooks)

When the backend receives the Easebuzz callback (`routes/payment.js`):

### Upon Success:
1. **Hash Verification:** The backend cryptographically verifies the response hash using the Easebuzz API salt. If the hash does not match, the request is rejected as a security threat.
2. **Order Fulfillment:** The backend updates the existing order in `e3orders` or `e4orders` by changing its status from `placed` to `success`, and attaches the gateway's `easepayid`.
3. **Payment Ledgering:** A dedicated ledger entry is recorded in the `e3payments` or `e4payments` table containing the `paymentId`, `orderId`, `amount`, `status`, and `method` (e.g., UPI, Card).
4. **Redirection:** The server triggers an HTTP 302 redirect, sending the user back to the frontend `/success` page with their `orderId`.

### Upon Failure or Cancellation:
1. **Order Cancellation:** The backend updates the original order status to `failed`.
2. **Ledger Update:** A failed payment record is inserted into `e3payments` or `e4payments` for audit tracing.
3. **Redirection:** The user is redirected to the `/failed` page to attempt the payment again.

## 5. User Confirmation (Frontend)

1. **Receipt Display:** The frontend `/success` component mounts, extracting the `orderId` from the URL.
2. **Status Fetch:** It calls `/api/payment/status/{orderId}` to retrieve the finalized, fully paid order record directly from the database.
3. **Rendering:** The user is presented with their confirmed items, a downloadable PDF receipt, and an updated order history visible in their `/profile` or `/tickets` dashboard.

---

### Conclusion on Reliability
**Are we making proper payments and accurately keeping order records?**
Yes. The current system is highly robust. 
- It uses server-side cart calculation immediately upon checkout, preventing users from altering prices on the frontend.
- It inserts a `placed` order tracking record **before** the user even touches the payment gateway, meaning abandoned carts are successfully logged.
- It utilizes cryptographically signed server-side webhooks to verify payments, ensuring no frontend manipulation can trigger a false "Success".
- It maintains a dual-ledger system (the `orders` table tracks the items/fulfillment, while the `payments` table acts as a financial audit trail).
