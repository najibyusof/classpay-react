# Payment Schedules, Payments, Proofs, and Transactions

Payment operations require authorized access to the related organization, class, participant, or payment. The server remains authoritative for payer, ownership, calculated totals, and state transitions.

## Schedules and reminders

```http
GET    /api/v1/payment-schedules/reminders/preview
GET    /api/v1/classes/{class}/payment-schedules
POST   /api/v1/classes/{class}/payment-schedules
GET    /api/v1/payment-schedules/{paymentSchedule}
PUT    /api/v1/payment-schedules/{paymentSchedule}
PATCH  /api/v1/payment-schedules/{paymentSchedule}
DELETE /api/v1/payment-schedules/{paymentSchedule}
POST   /api/v1/payment-schedules/{paymentSchedule}/reminder
GET    /api/v1/payment-schedules/{paymentSchedule}/payments
POST   /api/v1/payment-schedules/{paymentSchedule}/payments
```

Schedule creation requires `class_participant_id`, `period_start`, `period_end`, `due_date`, and `required_amount`; `status` is optional. Updates may change `due_date` and status (`upcoming`, `pending`, `partially_paid`, `paid`, `overdue`, or `cancelled`). Payment creation accepts `additional_infaq` and `payment_method`; the API calculates the payer and total.

## Payments, transactions, and proofs

```http
GET    /api/v1/payments/{payment}
PUT    /api/v1/payments/{payment}
PATCH  /api/v1/payments/{payment}
DELETE /api/v1/payments/{payment}
GET    /api/v1/payments/{payment}/transactions
POST   /api/v1/payments/{payment}/transactions
GET    /api/v1/payments/{payment}/proofs
POST   /api/v1/payments/{payment}/proofs
PUT    /api/v1/payment-proofs/{paymentProof}
PATCH  /api/v1/payment-proofs/{paymentProof}
```

Payment updates may include `status` and `notes`. Transaction creation requires `gateway_name` and `request_amount`; transaction and response fields are optional. Proof upload uses multipart field `file`, image type `jpg`, `jpeg`, `png`, or `webp`, maximum 5 MB. Proof review requires `status` (`approved` or `rejected`) and requires `rejection_reason` when rejected.
