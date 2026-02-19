# Ethree & E4 Backend API Documentation

This document provides a comprehensive overview of the RESTful APIs available in the Ethree backend.

**Base URL**: `http://localhost:5000` (Local) or `https://e3-e4-backend.vercel.app` (Production)
**Authentication**: Bearer Token mechanism. Include `Authorization: Bearer <token>` in headers for protected routes.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/send-otp` | Send OTP to mobile number | No | `{ "mobile": "9999999999", "location": "E3" }` | `{ "message": "OTP sent", "debugOtp": "123456" }` (Dev only) |
| `POST` | `/verify-otp` | Verify OTP and Login/Register | No | `{ "mobile": "9999999999", "otp": "123456", "name": "John", "location": "E3" }` | `{ "token": "jwt...", "user": { ... } }` |
| `POST` | `/refresh-token` | Refresh Access Token | No (Cookie) | N/A (Uses `refreshToken` cookie) | `{ "token": "new_jwt..." }` |
| `POST` | `/logout` | Logout User | No | N/A | `{ "message": "Logged out" }` |

---

## 2. User Profile (`/api/profile`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get current user profile | **Yes** | N/A | `{ "_id": "...", "name": "...", "mobile": "...", "role": "..." }` |
| `PUT` | `/` | Update user profile | **Yes** | `{ "name": "New Name", "email": "new@example.com" }` | Updated User Object |

---

## 3. E3 Resources (`/api/e3`)

### Rides
| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/rides` | Get all E3 rides | No | N/A | `[ { "id": "...", "name": "...", "image": "..." } ]` |
| `POST` | `/rides` | Add new ride | **Yes (Admin)** | `{ "name": "...", "price": 100, "image": "base64...", "category": "play" }` | Created Ride |
| `PUT` | `/rides/:id` | Update ride | **Yes (Admin)** | `{ "price": 150 }` | Updated Ride |
| `DELETE` | `/rides/:id` | Delete ride | **Yes (Admin)** | N/A | `{ "message": "Ride deleted" }` |

### Dine
| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dine` | Get all E3 dine items | No | N/A | `[ { "id": "...", "name": "...", "cuisine": "..." } ]` |
| `POST` | `/dine` | Add dine item | **Yes (Admin)** | `{ "name": "...", "price": 50, "image": "...", "stall": "Stall 1" }` | Created Item |
| `PUT` | `/dine/:id` | Update dine item | **Yes (Admin)** | `{ "open": false }` | Updated Item |
| `DELETE` | `/dine/:id` | Delete dine item | **Yes (Admin)** | N/A | `{ "message": "Deleted" }` |

---

## 4. E4 Resources (`/api/e4`)

### Rides
| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/rides` | Get all E4 rides | No | N/A | List of E4 Rides |
| `POST` | `/rides` | Add new ride | **Yes (Admin)** | Ride Object | Created Ride |
| `PUT` | `/rides/:id` | Update ride | **Yes (Admin)** | Ride Object | Updated Ride |

### Dine
| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dine` | Get all E4 dine items | No | N/A | List of E4 Dine Items |
| `POST` | `/dine` | Add dine item | **Yes (Admin)** | Dine Object | Created Item |
| `PUT` | `/dine/:id` | Update dine item | **Yes (Admin)** | Dine Object | Updated Item |
| `DELETE` | `/dine/:id` | Delete dine item | **Yes (Admin)** | N/A | `{ "message": "Deleted" }` |

---

## 5. Events (`/api/events`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all events | No | Query: `?location=E3` (optional) | `[ { "name": "...", "start_time": "..." } ]` |
| `POST` | `/` | Create event | **Yes (Admin)** | `{ "name": "...", "location": "E3", "start_time": "...", "image": "..." }` | Created Event |

---

## 6. Orders & Checkout (`/api/orders`)

| Method | Endpoint | Description | Auth Required | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/e3/all` | Get ALL E3 orders | **Yes (Admin)** | N/A | List of all orders |
| `GET` | `/e3` | Get My E3 orders | **Yes** | N/A | List of user's orders |
| `GET` | `/e4/all` | Get ALL E4 orders | **Yes (Admin)** | N/A | List of all orders |
| `GET` | `/e4` | Get My E4 orders | **Yes** | N/A | List of user's orders |
| `POST` | `/e3/checkout` | Initiate Checkout | **Yes** | `{ "items": [ { "id": "...", "quantity": 1, "price": 100 } ] }` | `{ "success": true, "payment_url": "...", "txnid": "..." }` |
| `POST` | `/e4/checkout` | Initiate Checkout | **Yes** | Same as above | Payment details |

---

## 7. Payments (`/api/payment`)

*Managed by Easebuzz Gateway callbacks*

| Method | Endpoint | Description | Usage |
| :--- | :--- | :--- | :--- |
| `POST` | `/success` | Handle successful payment | Called by Easebuzz. Verifies hash, updates order status to 'success', records payment. Redirects to Frontend Success Page. |
| `POST` | `/failure` | Handle failed payment | Called by Easebuzz. Updates order status to 'failed'. Redirects to Frontend Failure Page. |

---

## 8. Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all event bookings | **Yes (Admin)** | Derived from `orders` table filtering for 'event' category items. Aggregates E3 and E4. |

---

## 9. Sponsors (`/api/sponsors`)

*Note: Currently uses local Mock Database (JSON file).*

| Method | Endpoint | Description | Auth Required | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all sponsors | No | N/A |
| `POST` | `/` | Add sponsor | **Yes (Admin)** | `{ "name": "...", "image": "...", "tier": "Gold" }` |
| `DELETE`| `/:id` | Delete sponsor | **Yes (Admin)** | N/A |

---

## 10. Analytics (`/api/analytics`)

*Note: Currently uses local Mock Database for simple stat tracking.*

| Method | Endpoint | Description | Auth Required | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/e3/stats` | Get E3 platform stats | **Yes (Admin)** | `{ "web": 10, "mobile": 5, "total": 15 }` |
| `GET` | `/e4/stats` | Get E4 platform stats | **Yes (Admin)** | Same as above |
| `GET` | `/stats` | Get Unified stats | **Yes (Admin)** | Aggregated stats |

---

### Data Models (Supabase)

*   **Users** (`e3users`, `e4users`): Store user profiles, name, mobile, email, role.
*   **Rides** (`e3rides`, `e4rides`): Store ride details, images (URL and Gallery JSONB), price, status.
*   **Dine** (`e3dines`, `e4dines`): Store dine items, menu images (JSONB), stall info.
*   **Events** (`e3events`, `e4events`): Event details, start/end times.
*   **Orders** (`e3orders`, `e4orders`): Transaction records, items (JSONB), amount, status.
*   **Payments** (`e3payments`, `e4payments`): Payment gateway records, linked to orderId.
*   **OTPs** (`otps`): Temporary storage for OTP verification.
