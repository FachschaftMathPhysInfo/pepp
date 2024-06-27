# GraphQL API Documentation

**Note: Not all queries and mutations are implemented yet**

## Queries

### ~~`students`~~
Fetch a list of all students.

#### Example
```graphql
query {
  students {
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

### `tutors`
Fetch a list of all tutors.

#### Example
```graphql
query {
  tutors {
    fn
    sn
    mail
    confirmed
  }
}
```

### `events`
Fetch a list of all events.
Possible values for the `subjects` input are `MATHEMATICS`, `PHYSICS`, `INFORMATICS` and `GENERAL`. Querying without the `subjects` argument simply returns all events.

#### Arguments (optional):
- `subjects` ([Subject]): List of subjects to filter events.

#### Example
```graphql
query {
  events(subjects: [INFORMATICS, MATHEMATICS]) {  # optional
    id
    tutor {
      fn
      sn
      mail
      confirmed
    }
    title
    description
    subject
    building {
      id
      name
      street
      number
      city
      zip
      osmLink
      rooms
    }
    room
    from
    to
  }
}
```

### `buildings`
Fetch a list of all buildings.

#### Example
```graphql
query {
  buildings {
    id
    name
    street
    number
    city
    zip
    osmLink
    rooms
  }
}
```

## Mutations

### ~~`addRegistration`~~
Add a new student registration.

#### Arguments
- `student` (NewStudent!): The details of the new student.

#### Example
```graphql
mutation {
  addRegistration(student: {
    fn: "John"
    sn: "Doe"
    mail: "john.doe@example.com"
    answers: ["Answer1", "Answer2"]  # optional
  }) 
}
```

### ~~`updateStudentAcceptedStatus`~~
Update the acceptance status of a student.

#### Arguments
- `studentMail` (String!): The email of the student.
- `accepted` (Boolean!): The new acceptance status.

#### Example
```graphql
mutation {
  updateStudentAcceptedStatus(studentMail: "john.doe@example.com", accepted: true) 
}
```

### `addTutor`
Add a new tutor.

#### Arguments
- `tutor` (NewTutor!): The details of the new tutor.

#### Example
```graphql
mutation {
  addTutor(tutor: {
    fn: "Jane"
    sn: "Smith"
    mail: "jane.smith@example.com"
  }) 
}
```

### ~~`updateTutor`~~
Update an existing tutor's details.

#### Arguments
- `tutorMail` (String!): The email of the tutor to be updated.
- `tutor` (NewTutor!): The new details of the tutor.

#### Example
```graphql
mutation {
  updateTutor(tutorMail: "jane.smith@example.com", tutor: {
    fn: "Jane"
    sn: "Smith"
    mail: "jane.smith@newdomain.com"
  }) 
}
```

### `addEvent`
Add a new event.
Possible values for the `subject` field are `MATHEMATICS`, `PHYSICS`, `INFORMATICS` and `GENERAL`.

#### Arguments
- `event` (NewEvent!): The details of the new event.

#### Example
```graphql
mutation {
  addEvent(event: {
    tutorMail: "jane.smith@example.com"  # optional
    title: "New Event"
    description: "An exciting new event"  # optional
    subject: INFORMATICS
    buildingId: "1"  # optional
    room: "101"  # optional
    from: "2024-07-01T10:00:00Z"
    to: "2024-07-01T12:00:00Z"
  }) 
}
```

### ~~`updateEvent`~~
Update an existing event's details.

#### Arguments
- `eventId` (ID!): The ID of the event to be updated.
- `event` (NewEvent!): The new details of the event.

#### Example
```graphql
mutation {
  updateEvent(eventId: "1", event: {
    tutorMail: "jane.smith@example.com"  # optional
    title: "Updated Event"
    description: "An updated exciting event"  # optional
    subject: PHYSICS
    buildingId: "1"  # optional
    room: "101"  # optional
    from: "2024-07-01T10:00:00Z"
    to: "2024-07-01T12:00:00Z"
  }) 
}
```

### `addBuilding`
Add a new building.

#### Arguments
- `building` (NewBuilding!): The details of the new building.

#### Example
```graphql
mutation {
  addBuilding(building: {
    name: "Main Hall"
    street: "Main St"
    number: "123"
    city: "Metropolis"
    zip: 12345
    osmLink: "https://osm.org/link"
    rooms: ["101", "102"]  # optional
  }) 
}
```

### ~~`addRoom`~~
Add a new room to an existing building.

#### Arguments
- `buildingId` (ID!): The ID of the building.
- `room` (String!): The name of the new room.

#### Example
```graphql
mutation {
  addRoom(buildingId: "1", room: "103") 
}
```

### ~~`updateBuilding`~~
Update an existing building's details.

#### Arguments
- `buildingId` (ID!): The ID of the building to be updated.
- `building` (NewBuilding!): The new details of the building.

#### Example
```graphql
mutation {
  updateBuilding(buildingId: "1", building: {
    name: "Main Hall"
    street: "Main St"
    number: "123"
    city: "Metropolis"
    zip: 12345
    osmLink: "https://osm.org/newlink"
    rooms: ["101", "102", "103"]  # optional
  }) 
}
```
