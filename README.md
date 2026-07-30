# Template Tokri — Website

## What's built in this version

- ✅ Product catalog (search + category filter), reading live from Postgres
- ✅ Cart, with Track A input-collection modal (names/date/wording per item)
- ✅ Checkout flow with **real Razorpay order creation** (test mode until you switch keys)
- ✅ Razorpay **webhook** handler — this is the only thing that marks an order "PAID" (never trust the client redirect alone)
- ✅ Database schema for Products, Orders, OrderItems, Users (optional accounts), and CustomOrderLead (Track B)
- ✅ Custom order (Track B) API endpoint, with Brevo email notification to you

## What's not built yet (next steps)

- ⬜ Custom order form UI on the page (API route exists at `/api/custom-order`, just needs the form wired up — same pattern as the demo)
- ⬜ Order confirmation email to the customer (currently only notifies you as admin)
- ⬜ Optional customer accounts / login (schema supports it via `User`, auth flow not built yet)
- ⬜ Delivered-file upload flow for the team once an order is edited

## 1. Push this to your GitHub repo

```bash
cd template-tokri
git init
git remote add origin https://github.com/santsark/template-tokri.git
git add .
git commit -m "Initial scaffold: catalog, cart, Razorpay checkout, webhook"
git branch -M main
git push -u origin main
```

## 2. Connect to Vercel

If the GitHub repo is already linked to your Vercel project (`template-tokri`), pushing to `main` will auto-deploy. If not, import the repo from the Vercel dashboard → New Project → select `template-tokri`.

## 3. Environment variables

In Vercel → Project → Settings → Environment Variables, add everything listed in `.env.example`. A few notes:

- `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` — should already be injected automatically since Postgres is connected to this project. Double check they're present.
- `BLOB_READ_WRITE_TOKEN_PUBLIC` / `BLOB_READ_WRITE_TOKEN_PVT` — Vercel injects one `BLOB_READ_WRITE_TOKEN` per store by default. Since you have two stores, check each store's settings to get its specific token, and name them as above so the code can tell them apart.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — use **test mode** keys for now.
- `RAZORPAY_WEBHOOK_SECRET` — set this when you configure the webhook (see below).
- `BREVO_API_KEY` — from your Brevo account.
- `ADMIN_NOTIFICATION_EMAIL` — where you want new-order and new-lead alerts sent.

Also copy `.env.example` to `.env.local` for local development and fill in the same values.

## 4. Run the database migration

Once `POSTGRES_PRISMA_URL` is available locally (pull it from Vercel with `vercel env pull .env.local`, or copy manually):

```bash
npm install
npx prisma migrate dev --name init
```

This creates all the tables in your Postgres database.

## 5. Add your first products

```bash
npx prisma studio
```

This opens a local spreadsheet-like UI. Add rows to the `Product` table — set `isActive: true` for anything that should show on the live site.

## 6. Set up the Razorpay webhook

In the Razorpay dashboard → Settings → Webhooks → Add New Webhook:
- URL: `https://<your-vercel-domain>/api/razorpay-webhook`
- Active events: `payment.captured`
- Copy the generated webhook secret into `RAZORPAY_WEBHOOK_SECRET`

## 7. Test end-to-end (test mode)

1. `npm run dev` locally, or use your Vercel preview URL
2. Add a product to cart, go through checkout with Razorpay **test card/UPI details** (Razorpay dashboard has test credentials)
3. Confirm the order status flips to `PAID` in Prisma Studio after payment — this confirms the webhook is working correctly

Once this all checks out, switch Razorpay keys to live mode for launch.
