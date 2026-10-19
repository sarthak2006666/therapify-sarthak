# Therapify events setup

Copy `.env.example` to `.env` if you need a starting point. Keep the values in the backend environment; never put Razorpay secrets in Vite variables.

Required backend settings:

- `MONGO_URI` — MongoDB connection string.
- `JWT_SECRET` — long random signing secret used by the existing auth middleware.
- `PORT` — optional; defaults to `5000`.

Paid checkout settings (optional):

- `RAZORPAY_KEY_ID` — Razorpay test key ID.
- `RAZORPAY_KEY_SECRET` — Razorpay test secret. This stays on the backend.

When Razorpay keys are blank, free enrollment works and paid events show a setup response. In test mode, configure a Razorpay test account and use the test checkout credentials supplied by Razorpay. No card data is stored by Therapify. Payment orders and signatures are checked server-side, and an enrollment is confirmed only after the payment provider reports a captured payment.

On the first event list request, eight clearly marked sample events are inserted idempotently. Replace or remove these records before a public launch. Enrollments, event records, counts, prices, and status are stored in MongoDB. Prices and fees are integer paise.

The Events API is mounted at `/api/events`:

- `GET /` — upcoming published events with search, category/format filters, pagination, and sorting (`upcoming`, `popular`, or `price`).
- `GET /:slug` — event detail.
- `POST /:id/enroll` — authenticated enrollment or server-created Razorpay order.
- `POST /:id/verify-payment` — authenticated signature and provider payment verification.
- `GET /mine` — authenticated current user's enrollments.
- `POST /enrollment/:enrollmentId/cancel` — cancel a free/pending enrollment or submit a paid refund request.
- `POST /` and `PATCH /:id/manage` — host/admin create and manage events; new events are unpublished until explicitly published.
- `GET /:id/attendees` — owner/admin attendee list.

Run `npm start` from `backend/` and `npm run dev` from `frontend/`.
