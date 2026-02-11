# Ethree (E3) - Eat, Enjoy, Entertainment Platform

This repository contains the backend code for the Ethree platform, a comprehensive solution for managing rides, dining, events, and bookings.

## Project Structure

- **backend/**: Node.js + Express server with Supabase integration.
  - **routes/**: API route handlers (Auth, E3 Rides/Dine, Events, Orders, etc.).
  - **utils/**: Helper utilities (Logger, MockDB wrapper for Supabase).
  - **middleware/**: Authentication and validation middleware.
  - **schemas/**: Joi validation schemas.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Supabase project (for database)

## Setup Instructions

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Environment Configuration**:
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open `.env` and fill in your specific configuration:
      - `SUPABASE_URL`: Your Supabase project URL.
      - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin access).
      - `JWT_SECRET`: A secure string for signing session tokens.
      - `STRIPE_SECRET_KEY`: (Optional) Your Stripe secret key for payments.

## Running the Application

### Development Mode
To run the server with hot-reloading (using nodemon if installed, or just node):

```bash
npm start
# or if you have a dev script
npm run dev
```

The server will start on `http://localhost:5001` (or your configured PORT).

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the interactive API documentation at:

**[http://localhost:5001/api-docs](http://localhost:5001/api-docs)**

### Key Endpoints

-   **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/send-otp`
-   **E3 (Rides & Dine)**: `/api/e3/rides`, `/api/e3/dine`
-   **Events**: `/api/events`
-   **Orders**: `/api/orders`

## Architecture Highlights

-   **Supabase Integration**: The project uses a `MockModel` wrapper (`utils/mockDB.js`) that abstracts Supabase calls, allowing for a MongoDB-like Mongoose syntax (e.g., `User.find()`, `User.create()`) while interacting with a PostgreSQL database.
-   **Swagger Auto-docs**: API documentation is automatically generated from JSDoc comments in the route files.

## License

[MIT](LICENSE)
