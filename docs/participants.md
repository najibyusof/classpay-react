# Class Participants

Participant changes require the participant-management permission and an authorized class scope.

```http
GET    /api/v1/admin/classes/{class}/participants
POST   /api/v1/admin/classes/{class}/participants
PUT    /api/v1/admin/classes/{class}/participants/{participant}
PATCH  /api/v1/admin/classes/{class}/participants/{participant}
DELETE /api/v1/admin/classes/{class}/participants/{participant}
```

Create requires `user_id` and `participant_type` (`student` or `sponsor`). Update accepts `status` (`active`, `inactive`, or `removed`). Delete is a logical removal. The server owns class membership, organization ownership, payer identity, and timestamps; clients must not send those values to reassign a participant.
