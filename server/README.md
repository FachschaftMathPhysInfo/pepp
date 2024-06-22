# GraphQL Schema Documentation
**Note: Not all queries and mutations are implemented**

## Queries

### ~~`students`~~
Fetches a list of all students.

**Query:**
```graphql
{
  students {
    id
    fn
    sn
    mail
    confirmed
    answers
    score
    accepted
  }
}
```

**Example Response:**
```json
{
  "data": {
    "students": [
      {
        "id": "1",
        "fn": "John",
        "sn": "Doe",
        "mail": "john.doe@example.com",
        "confirmed": true,
        "answers": ["Answer1", "Answer2"],
        "score": 95,
        "accepted": true
      }
    ]
  }
}
```

### `tutors`
Fetches a list of all tutors.

**Query:**
```graphql
{
  tutors {
    id
    fn
    sn
    mail
    confirmed
  }
}
```

**Example Response:**
```json
{
  "data": {
    "tutors": [
      {
        "id": "1",
        "fn": "Jane",
        "sn": "Smith",
        "mail": "jane.smith@example.com",
        "confirmed": true
      }
    ]
  }
}
```

### `tutor`
Fetches a specific tutor by ID.

**Query:**
```graphql
{
  tutor(id: "1") {
    id
    fn
    sn
    mail
    confirmed
  }
}
```

**Example Response:**
```json
{
  "data": {
    "tutor": {
      "id": "1",
      "fn": "Jane",
      "sn": "Smith",
      "mail": "jane.smith@example.com",
      "confirmed": true
    }
  }
}
```

### `events`
Fetches a list of all events.

**Query:**
```graphql
{
  events {
    id
    tutor {
      id
      fn
      sn
    }
    title
    description
    building {
      id
      name
      street
      number
      city
      zip
    }
    room {
      id
      number
    }
    from
    to
  }
}
```

**Example Response:**
```json
{
  "data": {
    "events": [
      {
        "id": "1",
        "tutor": {
          "id": "1",
          "fn": "Jane",
          "sn": "Smith"
        },
        "title": "Math Tutoring",
        "description": "Basic math tutoring session.",
        "building": {
          "id": "1",
          "name": "Main Building",
          "street": "123 Main St",
          "number": 123,
          "city": "Townsville",
          "zip": "12345"
        },
        "room": {
          "id": "101",
          "number": "101"
        },
        "from": "2024-06-22T10:00:00Z",
        "to": "2024-06-22T12:00:00Z"
      }
    ]
  }
}
```

## Mutations

### ~~`addRegistration`~~
Registers a new student.

**Mutation:**
```graphql
mutation {
  addRegistration(input: {
    fn: "John",
    sn: "Doe",
    mail: "john.doe@example.com",
    answers: ["Answer1", "Answer2"]
  })
}
```

**Example Response:**
```json
{
  "data": {
    "addRegistration": "SUCCESS_STUDENT_ADD"
  }
}
```

### `addTutor`
Registers a new tutor.

**Mutation:**
```graphql
mutation {
  addTutor(input: {
    fn: "Jane",
    sn: "Smith",
    mail: "jane.smith@example.com"
  })
}
```

**Example Response:**
```json
{
  "data": {
    "addTutor": "SUCCESS_TUTOR_ADD"
  }
}
```

### `newEvent`
Creates a new event.

**Mutation:**
```graphql
mutation {
  newEvent(input: {
    tutorId: "1",
    title: "Math Tutoring",
    description: "Basic math tutoring session.",
    buildingId: "1",
    roomId: "101",
    from: "2024-06-22T10:00:00Z",
    to: "2024-06-22T12:00:00Z"
  })
}
```

**Example Response:**
```json
{
  "data": {
    "newEvent": "SUCCESS_EVENT_INSERT"
  }
}
```
