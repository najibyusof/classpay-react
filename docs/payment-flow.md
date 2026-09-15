# Payment Flow

Payment schedules and payment amounts are backend resources. The mobile client never calculates `required_amount`, `additional_infaq`, `total_amount`, `payer_id`, or payment status.

For student or sponsor schedule creation, the client submits exactly:

```json
{
  "additional_infaq": "20.00",
  "payment_method": "merchant"
}
```

Additional infaq is controlled by backend `allow_additional_infaq`, `minimum_infaq`, and `maximum_infaq` values. Validation uses decimal strings and `BigInt` minor units, not floating-point arithmetic.

A created payment is shown as `initiated` or `pending` unless the backend explicitly reports `paid`. Payment schedules and history are invalidated after successful creation so backend state remains authoritative.
