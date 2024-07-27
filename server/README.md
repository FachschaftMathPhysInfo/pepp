# GraphQL Schema Documentation

**Note: Not all queries and mutations are implemented yet**

## Queries

### ~~`students`~~
Fetches a list of students by email.
#### Arguments:
- `mail: [String!]` (optional) - List of emails to filter students.

#### Example:
```graphql
query {
  students(mail: ["john.doe@example.com", "jane.doe@example.com"]) {
    fn
    sn
    mail
    confirmed
    answers
    score
    accepted
    eventsRegistered {
      ID
      title
    }
  }
}
```

### `tutors`
Fetches a list of tutors by email and event ID.
#### Arguments:
- `mail: [String!]` (optional) - List of emails to filter tutors.
- `eventID: Int` (optional) - Event ID to filter tutors.

#### Example:
```graphql
query {
  tutors(mail: ["tutor1@example.com"], eventID: 1) {
    fn
    sn
    mail
    confirmed
    eventsAvailable {
      ID
      title
    }
    eventsAssigned {
      ID
      title
    }
  }
}
```

### `events`
Fetches a list of events. *Note: per default only returns events in the future. See `all` argument to change this*
#### Arguments:
- `id: [Int!]` (optional) - List of event IDs to filter events.
- `label: [String!]` (optional) - List of labels to filter events.
- `needsTutors: Boolean` (optional) - Filter events whether it needs tutors.
- `all: Boolean` (optional) - When set to true also returns events from the past.
- `tutor: [String!]` (optional) - Filter events for tutors. Any tutor that is in any relation to the event.

#### Example:
```graphql
query {
  events(id: [1], label: ["Math"], needsTutors: true) {
    ID
    title
    description
    topic {
      name
      color
    }
    tutorsAssigned {
      tutors {
        fn
        sn
      }
      room {
        number
        name
        capacity
      }
      registrations
    }
    needsTutors
    tutorsAvailable {
      fn
      sn
    }
    roomsAvailable {
      name
      number
    }
    from
    to
  }
}
```

### `buildings`
Fetches a list of buildings by ID.
#### Arguments:
- `id: [Int!]` (optional) - List of building IDs to filter buildings.

#### Example:
```graphql
query {
  buildings(id: [1]) {
    ID
    name
    street
    number
    city
    zip
    osm
    rooms {
      number
      name
    }
  }
}
```

### `rooms`
Fetches a list of rooms by number and building ID.
#### Arguments:
- `number: [String!]` (optional) - List of room numbers to filter rooms.
- `buildingID: Int!` - Building ID where rooms are located.

#### Example:
```graphql
query {
  rooms(number: ["101", "102"], buildingID: 1) {
    number
    name
    capacity
    floor
    building {
      name
    }
  }
}
```

### `labels`
Fetches a list of labels by name or kind.
#### Arguments:
- `name: [String!]` (optional) - List of topic names to filter labels.
- `kind: [LabelKind!]` (optional) - List of label kinds to filter labels. Is `EVENT_TYPE` or `TOPIC`

#### Example:
```graphql
query {
  labels(name: ["Math", "Science"], kind: TOPIC) {
    name
    color
  }
}
```

## Mutations

### ~~`addRegistration`~~
Registers a new student.
#### Arguments:
- `student: NewStudent!` - Details of the new student.

#### Example:
```graphql
mutation {
  addRegistration(student: {
    fn: "John"
    sn: "Doe"
    mail: "john.doe@example.com"
  })
}
```

### ~~`updateStudentAcceptedStatus`~~
Updates the acceptance status of a student.
#### Arguments:
- `studentMail: String!` - Email of the student.
- `accepted: Boolean!` - New acceptance status.

#### Example:
```graphql
mutation {
  updateStudentAcceptedStatus(studentMail: "john.doe@example.com", accepted: true)
}
```

### `addTutor`
Adds a new tutor.
#### Arguments:
- `tutor: NewTutor!` - Details of the new tutor.

#### Example:
```graphql
mutation {
  addTutor(tutor: {
    fn: "Jane"
    sn: "Doe"
    mail: "jane.doe@example.com"
    eventsAvailable: [1]
  })
}
```

### ~~`updateTutor`~~
Updates a tutor's details.
#### Arguments:
- `tutorMail: String!` - Email of the tutor.
- `tutor: NewTutor!` - Updated details of the tutor.

#### Example:
```graphql
mutation {
  updateTutor(tutorMail: "jane.doe@example.com", tutor: {
    fn: "Jane"
    sn: "Doe"
    mail: "jane.doe@example.com"
    eventsAvailable: [1]
  })
}
```

### `deleteUser`
Deletes a list of users. *Note: Tutors and Students are users.*
#### Arguments:
- `mail: [String!]!` - Email of the users.

#### Example:
```graphql
mutation {
  deleteUser(mail: "jane.doe@example.com")
}
```

### `addEvent`
Adds a new event.
#### Arguments:
- `event: NewEvent!` - Details of the new event.

#### Example:
```graphql
mutation {
  addEvent(event: {
    title: "Math Tutoring"
    description: "Tutoring session for Math"
    topicName: "Math"
    typeName: "Tutorial"
    needsTutors: true
    from: "2024-10-03T09:00:00Z"
    to: "2024-10-03T11:00:00Z"
  })
}
```

### ~~`updateEvent`~~
Updates an event's details.
#### Arguments:
- `eventID: Int!` - ID of the event.
- `event: NewEvent!` - Updated details of the event.

#### Example:
```graphql
mutation {
  updateEvent(eventID: 1, event: {
    title: "Advanced Math Tutoring"
    description: "Advanced tutoring session for Math"
    topicName: "Math"
    link: "http://example.com"
    needsTutors: true
    from: "2023-07-03T10:00:00Z"
    to: "2023-07-03T12:00:00Z"
  })
}
```

### `deleteEvent`
Deletes a list of events.
#### Arguments:
- `id: [Int!]!` - IDs of the event

#### Example:
```graphql
mutation {
  deleteEvent(id: [1, 2])
}
```

### `addBuilding`
Adds a new building.
#### Arguments:
- `building: NewBuilding!` - Details of the new building.

#### Example:
```graphql
mutation {
  addBuilding(building: {
    name: "Science Building"
    street: "123 Main St"
    number: "1"
    city: "Example City"
    zip: 12345
    osm: "osm-link"
  })
}
```

### ~~`updateBuilding`~~
Updates a building's details.
#### Arguments:
- `buildingID: Int!` - ID of the building.
- `building: NewBuilding!` - Updated details of the building.

#### Example:
```graphql
mutation {
  updateBuilding(buildingID: 1, building: {
    name: "Science Building"
    street: "123 Main St"
    number: "1"
    city: "Example City"
    zip: 12345
    osm: "updated-osm-link"
  })
}
```

### `deleteBuilding`
Deletes a list of buildings. *Note: This also deletes all rooms in the buildings*
#### Arguments:
- `id: [Int!]!` - IDs of buildings

#### Example:
```graphql
mutation {
  deleteBuilding(id: [1, 2])
}
```

### `addRoom`
Adds a new room.
#### Arguments:
- `room: NewRoom!` - Details of the new room.

#### Example:
```graphql
mutation {
  addRoom(room: {
    number: "101"
    name: "Physics Lab"
    capacity: 30
    floor: 1
    buildingID: 1
  })
}
```

### `deleteRoom`
Deletes a room in a building.
#### Arguments:
- `number: String!` - Number of room
- `buildingID: [Int!]!` - IDs of buildings

#### Example:
```graphql
mutation {
  deleteRoom(number: "101", buildingID: 1)
}
```

### `addLabel`
Adds a new event label. `kind` takes `TOPIC` or `EVENT_TYPE` as value. *Note: when no coler provided, default is #F1F5F9*
#### Arguments:
- `label: NewLabel!` - Details of the new label.

#### Example:
```graphql
mutation {
  addLabel(topic: {
    name: "Physics"
    color: "#FF0000"
    kind: TOPIC
  })
}
```

### `deleteLabel`
Deletes a list of labels. *Note: This also deletes all events related to it*
#### Arguments:
- `name: [String!]!` - Names of labels

#### Example:
```graphql
mutation {
  deleteLabel(name: "Math")
}
```

### `addAvailableRoomToEvent`
Links an available room to an event.
#### Arguments:
- `link: NewRoomToEventLink!` - Details of the room-event link.

#### Example:
```graphql
mutation {
  addAvailableRoomToEvent(link: {
    eventID: 1
    roomNumber: "101"
    buildingID: 1
  })
}
```

### `deleteRoomFromEvent`
Unmarks a room as available for an event.
#### Arguments:
- `link: NewRoomToEventLink!` - Details of the room-event link.

#### Example:
```graphql
mutation {
  deleteRoomFromEvent(link: {
    eventID: 1
    roomNumber: "101"
    buildingID: 1
  })
}
```

### `assignTutorToEvent`
Links a tutor to an event and room.
#### Arguments:
- `link: NewEventToTutorLink!` - Details of the tutor-event-room link.

#### Example:
```graphql
mutation {
  linkTutorToEventAndRoom(link: {
    eventID: 1
    tutorMail: "tutor1@example.com"
    roomNumber: "101"
    buildingID: 1
  })
}
```

### `unassignTutorFromEvent`
Unassign a tutor from an event and room.
#### Arguments:
- `link: NewEventToTutorLink!` - Details of the tutor-event-room link.

#### Example:
```graphql
mutation {
  unassignTutorFromEvent(link: {
    eventID: 1
    tutorMail: "tutor1@example.com"
    roomNumber: "101"
    buildingID: 1
  })
}
```
