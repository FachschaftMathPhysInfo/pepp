
# GraphQL Schema Documentation

## Scalars
### `HexColorCode`
Represents a color in hex code format.

### `timestamptz`
Represents a timestamp with timezone.

## Enums
### `ScalarType`
- `STRING`
- `INT`
- `FLOAT`
- `BOOLEAN`
- `COLOR`
- `TIMESTAMP`

### `LabelKind`
- `EVENT_TYPE`
- `TOPIC`

## Types

### `User`
Represents a user in the system.
- `fn: String!` - First name.
- `sn: String!` - Surname.
- `mail: String!` - Email.
- `confirmed: Boolean!` - Whether the user is confirmed.
- `eventsRegistered: [Event!]` - Events the user is registered to.
- `eventsAvailable: [Event!]` - Events available to the user.
- `eventsAssigned: [Event!]` - Events assigned to the user.

### `Label`
Represents a label used for events.
- `name: String!` - Name of the label.
- `color: HexColorCode` - Color of the label.

### `EventTutorRoomPair`
Represents a pairing of tutors and rooms for an event.
- `tutors: [User!]` - Tutors assigned to the event in the room.
- `room: Room` - Room where the event is held.
- `registrations: Int` - Number of registrations for the event in the room.

### `Event`
Represents an event.
- `ID: Int!` - ID of the event.
- `tutorsAssigned: [EventTutorRoomPair!]` - Tutors assigned to the event.
- `tutorsAvailable: [User!]` - Tutors available for the event.
- `roomsAvailable: [Room!]` - Rooms available for the event.
- `umbrella: Event` - The umbrella event this event is under.
- `needsTutors: Boolean!` - Whether the event needs tutors.
- `title: String!` - Title of the event.
- `description: String` - Description of the event.
- `topic: Label!` - Topic of the event.
- `type: Label!` - Type of the event.
- `from: timestamptz!` - Start time of the event.
- `to: timestamptz!` - End time of the event.

### `Room`
Represents a room in a building.
- `name: String` - Name of the room.
- `number: String!` - Room number.
- `capacity: Int` - Capacity of the room.
- `floor: Int` - Floor where the room is located.
- `building: Building!` - The building where the room is located.

### `Building`
Represents a building.
- `ID: Int!` - ID of the building.
- `name: String!` - Name of the building.
- `street: String!` - Street where the building is located.
- `number: String!` - Number on the street.
- `city: String!` - City where the building is located.
- `zip: Int!` - ZIP code.
- `osm: String!` - OpenStreetMap link.
- `rooms: [Room!]` - Rooms in the building.

### `Setting`
Represents a system setting.
- `key: String!` - Key of the setting.
- `value: String!` - Value of the setting.
- `type: ScalarType!` - Type of the setting.

## Queries

### `events`
Fetches a list of events.
#### Arguments:
- `id: [Int!]` (optional) - List of event IDs to filter events.
- `umbrellaID: [Int!]` (optional) - Filter events by umbrella ID.
- `label: [String!]` (optional) - List of labels to filter events.
- `needsTutors: Boolean` (optional) - Filter events whether it needs tutors.
- `onlyFuture: Boolean` (optional) - Filter to only future events.
- `userMail: [String!]` (optional) - Filter events by user email.
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

### `umbrellas`
Fetches a list of umbrella events.
#### Arguments:
- `id: [Int!]` (optional) - List of umbrella event IDs.
- `onlyFuture: Boolean` (optional) - Filter to only future umbrella events.

### `buildings`
Fetches a list of buildings.
#### Arguments:
- `id: [Int!]` (optional) - List of building IDs to filter buildings.

### `rooms`
Fetches a list of rooms.
#### Arguments:
- `number: [String!]` (optional) - List of room numbers to filter rooms.
- `buildingID: Int!` - Building ID to filter rooms.

### `labels`
Fetches a list of labels.
#### Arguments:
- `name: [String!]` (optional) - List of label names to filter labels.
- `kind: [LabelKind!]` (optional) - List of label kinds to filter labels.

### `settings`
Fetches a list of system settings.
#### Arguments:
- `key: [String!]` (optional) - List of setting keys to filter.
- `type: [ScalarType!]` (optional) - List of setting types to filter.

### `users`
Fetches a list of users.
#### Arguments:
- `mail: [String!]` (optional) - List of user emails to filter.

## Mutations

**Note:** 
- `add` and `update` mutations return the object they have worked on
- `delete` mutation returns the number of objects affected. When deleting references between objects, `delete` returns the outgoing object.

### `addUser`
Adds a new user.
#### Arguments:
- `user: NewUser!` - Details of the new user.

### `updateUser`
Updates the information of a user.
#### Arguments:
- `user: NewUser!` - Details of the user.

### `deleteUser`
Deletes a user.
#### Arguments:
- `mail: [String!]!` - E-Mail adresses of the user(s) to delete.

### `addTutor`
Combines the creation of a user and setting initial availabilitys.
#### Arguments:
- `tutor: NewUser!` - Details of the new user.
- `availability: UserToEventAvailability` - Pair of tutor mail and event ids.
#### Example:
```graphql
mutation {
  addTutor(
    tutor: {fn: "Jane", sn: "Doe", mail: "jane.doe@example.de"}
    availability: {userMail: "jane.doe@example.de", eventID: [2, 3]}
  ) {
    fn
    confirmed
    eventsAvailable {
      ID
      title
    }
  }
}
```

### `addEvent`
Adds a new event.
#### Arguments:
- `event: NewEvent!` - Details of the new event.

### `updateEvent`
Updates an event's details.
#### Arguments:
- `id: Int!` - ID of the event.
- `event: NewEvent!` - Updated details of the event.

### `deleteEvent`
Deletes a list of events. *Note: deleting an umbrella event will delete all events assigned to it*
#### Arguments:
- `id: [Int!]!` - IDs of the event

### `addBuilding`
Adds a new building.
#### Arguments:
- `building: NewBuilding!` - Details of the new building.

### `updateBuilding`
Updates a building's details.
#### Arguments:
- `id: Int!` - ID of the building.
- `building: NewBuilding!` - Updated details of the building.

### `deleteBuilding`
Deletes a list of buildings. *Note: This also deletes all rooms in the buildings*
#### Arguments:
- `id: [Int!]!` - IDs of buildings

### `addRoom`
Adds a new room.
#### Arguments:
- `room: NewRoom!` - Details of the new room.

### `updateRoom`
Updates a room's details.
#### Arguments:
- `room: NewRoom!` - Details of the updated room.

### `deleteRoom`
Deletes a room in a building.
#### Arguments:
- `number: [String!]!` - List of room numbers
- `buildingID: Int!` - ID of building

### `addLabel`
Adds a new label.
#### Arguments:
- `label: NewLabel!` - Details of the new label.

### `updateLabel`
Updates a label's details.
#### Arguments:
- `label: NewLabel!` - Details of the updated new label.

### `deleteLabel`
Deletes a list of labels.
#### Arguments:
- `name: [String!]!` - Names of labels

### `addEventAssignmentForTutor`
Assigns a user to an event as tutor.
#### Arguments:
- `assignment: EventToUserAssignment!` - Event, User, Room pair
#### Example:
```graphql
mutation {
  addEventAssignmentForTutor(
    assignment: {eventID: 1, userMail: "john.doe@example.de", roomNumber: "101", buildingID: 1}
  ) {
    title
    roomsAvailable {
      number
    }
  }
}
```

### `deleteEventAssignmentForTutor`
Unassigns a user from an event as tutor.
#### Arguments:
- `assignment: EventToUserAssignment!` - Event, User, Room pair

### `addTutorAvailabilityForEvent`
Marks user as available for an event as tutor.
#### Arguments:
- `availability: NewUserToEventAvailability!` - User, Event pair

### `deleteTutorAvailabilityForEvent`
Unmarks user as available for an event as tutor.
#### Arguments:
- `availability: NewUserToEventAvailability!` - User, Event pair

### `addRoomAvailabilityForEvent`
Marks room as available for an event
#### Arguments:
- `availability: RoomToEventAvailability!` - Room, Event pair

### `deleteRoomAvailabilityForEvent`
Unmarks room as available for an event
#### Arguments:
- `availability: RoomToEventAvailability!` - Room, Event pair

### `addStudentRegistrationForEvent`
Registers a user to an event.
#### Arguments:
- `registration: UserToEventRegistration!` - User, Event, Room pair

### `deleteStudentRegistrationForEvent`
Unregisters a user from an event.
#### Arguments:
- `registration: UserToEventRegistration!` - User, Event, Room pair
