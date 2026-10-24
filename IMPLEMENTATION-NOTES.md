# Stripe + Orders integration notes

This is a working-copy merge of the original app with Stripe Checkout and order-list/admin-order pages. The original QR/UPI flow is preserved.

## Local setup
1. Backend: `cd backend`, copy `env.example` to `.env`, fill in your MongoDB URI, JWT secret, Stripe test secret, frontend URL, and Stripe webhook secret.
2. Frontend: `cd frontend`, copy `.env.example` to `.env.local`.
3. Run `npm install` in both `backend` and `frontend` so lockfiles match the merged dependencies.
4. Start backend and frontend as usual.
5. Use Stripe test keys and Stripe CLI to forward events to `http://localhost:8080/api/webhook`; set `STRIPE_WEBHOOK_SECRET` to the signing secret Stripe CLI provides.

## Important
- The server builds Checkout line items from the signed-in user's MongoDB cart and database prices; browser-supplied prices are not trusted.
- The webhook verifies Stripe's signature against the raw request body and creates orders only for paid sessions.
- Admin order listing checks that the signed-in user's role is `ADMIN`.
- The existing QR/UPI flow is retained as a separate option.
- Before deployment, set environment variables in the hosting dashboards and configure Stripe's webhook URL as `https://YOUR_BACKEND_DOMAIN/api/webhook`. Never commit `.env` files or real keys.
- Stripe payments and webhook flow must be tested with test credentials before enabling live payments.
