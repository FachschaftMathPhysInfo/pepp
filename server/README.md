# GraphQL Schema Documentation

**Note: Not all queries and mutations are implemented**

## Scalars

### UUID
A universally unique identifier.

### Date
A date scalar type.

### Time
A time scalar type.

### HexColorCode
A hex color code scalar type.

## Interfaces

### Person
A base interface for person-related types.
- `fn: String!` - First name of the person.
- `sn: String!` - Surname of the person.
- `mail: String!` - Email of the person.
- `confirmed: Boolean!` - Confirmation status of the person.

## Types

### Student
Represents a student, implementing the `Person` interface.
- `fn: String!` - First name of the student.
- `sn: String!` - Surname of the student.
- `mail: String!` - Email of the student.
- `confirmed: Boolean!` - Confirmation status of the student.
- `answers: [String!]!` - List of answers provided by the student.
- `score: Int` - Score of the student.
- `accepted: Boolean` - Acceptance status of the student.

### Tutor
Represents a tutor, implementing the `Person` interface.
- `fn: String!` - First name of the tutor.
- `sn: String!` - Surname of the tutor.
- `mail: String!` - Email of the tutor.
- `confirmed: Boolean!` - Confirmation status of the tutor.
- `eventsAvailable: [Event!]` - List of available events for the tutor.
- `eventsAssigned: [Event!]` - List of events assigned to the tutor.

### Day
Represents a day.
- `ID: UUID!` - Unique identifier of the day.
- `name: String` - Name of the day.
- `date: Date!` - Date of the day.
- `events: [Event!]` - List of events scheduled for the day.

### Topic
Represents a topic.
- `name: String!` - Name of the topic.
- `color: HexColorCode` - Color code of the topic.
- `events: [Event!]` - List of events related to the topic.

### EventTutorRoomPair
Represents a pair of tutors and room assigned to an event.
- `tutors: [Tutor!]!` - List of tutors assigned to the event.
- `room: Room` - Room assigned to the event.

### Event
Represents an event.
- `ID: UUID!` - Unique identifier of the event.
- `assignedTutorsWithRoom: [EventTutorRoomPair!]` - List of tutors with their assigned room for the event.
- `needsTutors: Boolean!` - Indicates if the event needs tutors.
- `availableTutors: [Tutor!]` - List of available tutors for the event.
- `title: String!` - Title of the event.
- `description: String` - Description of the event.
- `topic: Topic!` - Topic of the event.
- `roomsAvailable: [Room!]` - List of available rooms for the event.
- `link: String` - Link associated with the event.
- `day: Day!` - Day the event is scheduled.
- `from: Time!` - Start time of the event.
- `to: Time!` - End time of the event.

### Room
Represents a room.
- `name: String` - Name of the room.
- `number: String!` - Number of the room.
- `capacity: Int` - Capacity of the room.
- `floor: Int` - Floor where the room is located.
- `building: Building!` - Building where the room is located.

### Building
Represents a building.
- `ID: UUID!` - Unique identifier of the building.
- `name: String!` - Name of the building.
- `street: String!` - Street where the building is located.
- `number: String!` - Number of the building.
- `city: String!` - City where the building is located.
- `zip: Int!` - Zip code of the building.
- `osm: String!` - OpenStreetMap identifier for the building.
- `rooms: [Room!]` - List of rooms in the building.

## Queries

### ~~students~~
Fetches a list of students by email.
- `mail: [String!]` - List of emails to filter students.
- Returns: `[Student!]!` - List of students.

### tutors
Fetches a list of tutors by email and event ID.
- `mail: [String!]` - List of emails to filter tutors.
- `eventID: UUID` - Event ID to filter tutors.
- Returns: `[Tutor!]!` - List of tutors.

### events
Fetches a list of events by ID and topic.
- `id: [UUID!]` - List of event IDs to filter events.
- `topic: [String!]` - List of topics to filter events.
- Returns: `[Event!]!` - List of events.

### buildings
Fetches a list of buildings by ID.
- `id: [UUID!]` - List of building IDs to filter buildings.
- Returns: `[Building!]!` - List of buildings.

### rooms
Fetches a list of rooms by number and building ID.
- `number: [String!]` - List of room numbers to filter rooms.
- `buildingID: UUID!` - Building ID to filter rooms.
- Returns: `[Room!]!` - List of rooms.

### topics
Fetches a list of topics by name.
- `name: [String!]` - List of topic names to filter topics.
- Returns: `[Topic!]!` - List of topics.

### days
Fetches a list of days by ID.
- `id: [UUID!]` - List of day IDs to filter days.
- Returns: `[Day!]!` - List of days.

## Inputs

### NewTutor
Input for creating a new tutor.
- `fn: String!` - First name of the tutor.
- `sn: String` - Surname of the tutor.
- `mail: String!` - Email of the tutor.
- `eventsAvailable: [UUID!]` - List of event IDs the tutor is available for.

### NewStudent
Input for creating a new student.
- `fn: String!` - First name of the student.
- `sn: String!` - Surname of the student.
- `mail: String!` - Email of the student.

### NewDay
Input for creating a new day.
- `name: String!` - Name of the day.
- `date: Date!` - Date of the day.

### NewEvent
Input for creating a new event.
- `title: String!` - Title of the event.
- `description: String` - Description of the event.
- `topicName: String!` - Topic name of the event.
- `link: String` - Link associated with the event.
- `dayID: UUID!` - Day ID the event is scheduled.
- `needsTutors: Boolean!` - Indicates if the event needs tutors.
- `from: Time!` - Start time of the event.
- `to: Time!` - End time of the event.

### NewBuilding
Input for creating a new building.
- `name: String` - Name of the building.
- `street: String!` - Street where the building is located.
- `number: String!` - Number of the building.
- `city: String!` - City where the building is located.
- `zip: Int!` - Zip code of the building.
- `osm: String!` - OpenStreetMap identifier for the building.

### NewRoom
Input for creating a new room.
- `number: String!` - Number of the room.
- `name: String` - Name of the room.
- `capacity: Int` - Capacity of the room.
- `floor: Int` - Floor where the room is located.
- `buildingID: UUID!` - Building ID where the room is located.

### NewTopic
Input for creating a new topic.
- `name: String!` - Name of the topic.
- `color: HexColorCode` - Color code of the topic.

### NewEventToTutorLink
Input for linking an event to a tutor and room.
- `eventID: UUID!` - Event ID.
- `tutorMail: String!` - Email of the tutor.
- `roomNumber: String!` - Room number.
- `buildingID: UUID!` - Building ID.

### NewRoomToEventLink
Input for linking a room to an event.
- `eventID: UUID!` - Event ID.
- `roomNumber: String!` - Room number.
- `buildingID: UUID!` - Building ID.

## Mutations

### ~~addRegistration~~
Registers a new student.
- `student: NewStudent!` - Details of the new student.
- Returns: `String!` - Confirmation message.

### ~~updateStudentAcceptedStatus~~
Updates the acceptance status of a student.
- `studentMail: String!` - Email of the student.
- `accepted: Boolean!` - New acceptance status.
- Returns: `String!` - Confirmation message.

### addTutor
Adds a new tutor.
- `tutor: NewTutor!` - Details of the new tutor.
- Returns: `String!` - Confirmation message.

### ~~updateTutor~~
Updates a tutor's details.
- `tutorMail: String!` - Email of the tutor.
- `tutor: NewTutor!` - Updated details of the tutor.

 `tutor: NewTutor!` - Updated details of the tutor.
- Returns: `String!` - Confirmation message.

### addEvent
Adds a new event.
- `event: NewEvent!` - Details of the new event.
- Returns: `String!` - Confirmation message.

### ~~updateEvent~~
Updates an event's details.
- `eventID: UUID!` - ID of the event.
- `event: NewEvent!` - Updated details of the event.
- Returns: `String!` - Confirmation message.

### addBuilding
Adds a new building.
- `building: NewBuilding!` - Details of the new building.
- Returns: `String!` - Confirmation message.

### addRoom
Adds a new room.
- `room: NewRoom!` - Details of the new room.
- Returns: `String!` - Confirmation message.

### ~~updateBuilding~~
Updates a building's details.
- `buildingID: UUID!` - ID of the building.
- `building: NewBuilding!` - Updated details of the building.
- Returns: `String!` - Confirmation message.

### addTopic
Adds a new topic.
- `topic: NewTopic!` - Details of the new topic.
- Returns: `String!` - Confirmation message.

### addDay
Adds a new day.
- `day: NewDay!` - Details of the new day.
- Returns: `String!` - Confirmation message.

### linkAvailableRoomToEvent
Links an available room to an event.
- `link: NewRoomToEventLink!` - Details of the room-event link.
- Returns: `String!` - Confirmation message.

### linkTutorToEventAndRoom
Links a tutor to an event and room.
- `link: NewEventToTutorLink!` - Details of the tutor-event-room link.
- Returns: `String!` - Confirmation message.
