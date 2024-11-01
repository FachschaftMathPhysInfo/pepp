/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "mutation addStudentApplicationForEvent($application: NewUserToEventApplication!) {\n  addStudentApplicationForEvent(application: $application) {\n    fn\n  }\n}": types.AddStudentApplicationForEventDocument,
    "mutation updateEvent($id: Int!, $event: NewEvent!) {\n  updateEvent(id: $id, event: $event) {\n    ID\n  }\n}": types.UpdateEventDocument,
    "mutation addStudentRegistrationForEvent($registration: NewUserToEventRegistration!) {\n  addStudentRegistrationForEvent(registration: $registration) {\n    room {\n      number\n      building {\n        ID\n      }\n    }\n  }\n}\n\nmutation deleteStudentRegistrationForEvent($registration: NewUserToEventRegistration!) {\n  deleteStudentRegistrationForEvent(registration: $registration) {\n    eventsRegistered {\n      ID\n    }\n  }\n}": types.AddStudentRegistrationForEventDocument,
    "mutation addTutor($firstName: String!, $lastName: String!, $email: String!, $eventsAvailable: [Int!]!) {\n  addTutor(\n    tutor: {fn: $firstName, sn: $lastName, mail: $email}\n    availability: {userMail: $email, eventID: $eventsAvailable}\n  ) {\n    fn\n  }\n}": types.AddTutorDocument,
    "mutation registration($fn: String!, $sn: String, $mail: String!, $password: String!) {\n  addUser(user: {fn: $fn, sn: $sn, mail: $mail, password: $password}) {\n    fn\n    sn\n    mail\n    confirmed\n  }\n}": types.RegistrationDocument,
    "query tableEvents($needsTutors: Boolean, $onlyFuture: Boolean, $umbrellaID: [Int!]) {\n  events(\n    needsTutors: $needsTutors\n    onlyFuture: $onlyFuture\n    umbrellaID: $umbrellaID\n  ) {\n    ID\n    title\n    from\n    to\n    needsTutors\n    topic {\n      name\n      color\n    }\n    type {\n      name\n      color\n    }\n  }\n}\n\nquery futureEvents {\n  events(onlyFuture: true) {\n    ID\n    title\n    umbrella {\n      ID\n      title\n    }\n  }\n}\n\nquery plannerEvents($umbrellaID: Int!, $type: [String!], $topic: [String!]) {\n  umbrellas(id: [$umbrellaID]) {\n    title\n  }\n  typeLabels: labels(kind: EVENT_TYPE, umbrellaID: [$umbrellaID]) {\n    name\n  }\n  topicLabels: labels(kind: TOPIC, umbrellaID: [$umbrellaID]) {\n    name\n  }\n  events(umbrellaID: [$umbrellaID], type: $type, topic: $topic) {\n    ID\n    title\n    from\n    to\n    topic {\n      color\n    }\n  }\n}\n\nquery umbrellaOfEvent($id: Int!) {\n  events(id: [$id]) {\n    umbrella {\n      ID\n    }\n  }\n}\n\nquery eventCloseup($id: Int!) {\n  events(id: [$id]) {\n    ID\n    title\n    description\n    from\n    to\n    topic {\n      name\n      color\n    }\n    type {\n      name\n      color\n    }\n    tutorsAssigned {\n      tutors {\n        fn\n        sn\n        mail\n      }\n      room {\n        capacity\n        floor\n        name\n        number\n        building {\n          ID\n          name\n          street\n          number\n          city\n          zip\n          latitude\n          longitude\n          zoomLevel\n        }\n      }\n      registrations\n    }\n  }\n}": types.TableEventsDocument,
    "query registrationForm($eventID: Int!) {\n  forms(id: [$eventID]) {\n    title\n    description\n    questions {\n      ID\n      title\n      type\n      required\n      answers {\n        ID\n        title\n        points\n      }\n    }\n  }\n}": types.RegistrationFormDocument,
    "query emailPasswordLogin($email: String!, $password: String!) {\n  login(credentials: {email: $email, password: $password}) {\n    sessionID\n    user {\n      fn\n      sn\n      mail\n      confirmed\n    }\n  }\n}": types.EmailPasswordLoginDocument,
    "query userEventRegistration($email: String!, $id: Int!) {\n  registrations(studentMail: [$email], eventId: $id) {\n    room {\n      number\n      building {\n        ID\n      }\n    }\n  }\n}": types.UserEventRegistrationDocument,
    "query umbrellas($onlyFuture: Boolean, $id: [Int!]) {\n  umbrellas(onlyFuture: $onlyFuture, id: $id) {\n    ID\n    title\n  }\n}": types.UmbrellasDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation addStudentApplicationForEvent($application: NewUserToEventApplication!) {\n  addStudentApplicationForEvent(application: $application) {\n    fn\n  }\n}"): (typeof documents)["mutation addStudentApplicationForEvent($application: NewUserToEventApplication!) {\n  addStudentApplicationForEvent(application: $application) {\n    fn\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation updateEvent($id: Int!, $event: NewEvent!) {\n  updateEvent(id: $id, event: $event) {\n    ID\n  }\n}"): (typeof documents)["mutation updateEvent($id: Int!, $event: NewEvent!) {\n  updateEvent(id: $id, event: $event) {\n    ID\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation addStudentRegistrationForEvent($registration: NewUserToEventRegistration!) {\n  addStudentRegistrationForEvent(registration: $registration) {\n    room {\n      number\n      building {\n        ID\n      }\n    }\n  }\n}\n\nmutation deleteStudentRegistrationForEvent($registration: NewUserToEventRegistration!) {\n  deleteStudentRegistrationForEvent(registration: $registration) {\n    eventsRegistered {\n      ID\n    }\n  }\n}"): (typeof documents)["mutation addStudentRegistrationForEvent($registration: NewUserToEventRegistration!) {\n  addStudentRegistrationForEvent(registration: $registration) {\n    room {\n      number\n      building {\n        ID\n      }\n    }\n  }\n}\n\nmutation deleteStudentRegistrationForEvent($registration: NewUserToEventRegistration!) {\n  deleteStudentRegistrationForEvent(registration: $registration) {\n    eventsRegistered {\n      ID\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation addTutor($firstName: String!, $lastName: String!, $email: String!, $eventsAvailable: [Int!]!) {\n  addTutor(\n    tutor: {fn: $firstName, sn: $lastName, mail: $email}\n    availability: {userMail: $email, eventID: $eventsAvailable}\n  ) {\n    fn\n  }\n}"): (typeof documents)["mutation addTutor($firstName: String!, $lastName: String!, $email: String!, $eventsAvailable: [Int!]!) {\n  addTutor(\n    tutor: {fn: $firstName, sn: $lastName, mail: $email}\n    availability: {userMail: $email, eventID: $eventsAvailable}\n  ) {\n    fn\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation registration($fn: String!, $sn: String, $mail: String!, $password: String!) {\n  addUser(user: {fn: $fn, sn: $sn, mail: $mail, password: $password}) {\n    fn\n    sn\n    mail\n    confirmed\n  }\n}"): (typeof documents)["mutation registration($fn: String!, $sn: String, $mail: String!, $password: String!) {\n  addUser(user: {fn: $fn, sn: $sn, mail: $mail, password: $password}) {\n    fn\n    sn\n    mail\n    confirmed\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query tableEvents($needsTutors: Boolean, $onlyFuture: Boolean, $umbrellaID: [Int!]) {\n  events(\n    needsTutors: $needsTutors\n    onlyFuture: $onlyFuture\n    umbrellaID: $umbrellaID\n  ) {\n    ID\n    title\n    from\n    to\n    needsTutors\n    topic {\n      name\n      color\n    }\n    type {\n      name\n      color\n    }\n  }\n}\n\nquery futureEvents {\n  events(onlyFuture: true) {\n    ID\n    title\n    umbrella {\n      ID\n      title\n    }\n  }\n}\n\nquery plannerEvents($umbrellaID: Int!, $type: [String!], $topic: [String!]) {\n  umbrellas(id: [$umbrellaID]) {\n    title\n  }\n  typeLabels: labels(kind: EVENT_TYPE, umbrellaID: [$umbrellaID]) {\n    name\n  }\n  topicLabels: labels(kind: TOPIC, umbrellaID: [$umbrellaID]) {\n    name\n  }\n  events(umbrellaID: [$umbrellaID], type: $type, topic: $topic) {\n    ID\n    title\n    from\n    to\n    topic {\n      color\n    }\n  }\n}\n\nquery umbrellaOfEvent($id: Int!) {\n  events(id: [$id]) {\n    umbrella {\n      ID\n    }\n  }\n}\n\nquery eventCloseup($id: Int!) {\n  events(id: [$id]) {\n    ID\n    title\n    description\n    from\n    to\n    topic {\n      name\n      color\n    }\n    type {\n      name\n      color\n    }\n    tutorsAssigned {\n      tutors {\n        fn\n        sn\n        mail\n      }\n      room {\n        capacity\n        floor\n        name\n        number\n        building {\n          ID\n          name\n          street\n          number\n          city\n          zip\n          latitude\n          longitude\n          zoomLevel\n        }\n      }\n      registrations\n    }\n  }\n}"): (typeof documents)["query tableEvents($needsTutors: Boolean, $onlyFuture: Boolean, $umbrellaID: [Int!]) {\n  events(\n    needsTutors: $needsTutors\n    onlyFuture: $onlyFuture\n    umbrellaID: $umbrellaID\n  ) {\n    ID\n    title\n    from\n    to\n    needsTutors\n    topic {\n      name\n      color\n    }\n    type {\n      name\n      color\n    }\n  }\n}\n\nquery futureEvents {\n  events(onlyFuture: true) {\n    ID\n    title\n    umbrella {\n      ID\n      title\n    }\n  }\n}\n\nquery plannerEvents($umbrellaID: Int!, $type: [String!], $topic: [String!]) {\n  umbrellas(id: [$umbrellaID]) {\n    title\n  }\n  typeLabels: labels(kind: EVENT_TYPE, umbrellaID: [$umbrellaID]) {\n    name\n  }\n  topicLabels: labels(kind: TOPIC, umbrellaID: [$umbrellaID]) {\n    name\n  }\n  events(umbrellaID: [$umbrellaID], type: $type, topic: $topic) {\n    ID\n    title\n    from\n    to\n    topic {\n      color\n    }\n  }\n}\n\nquery umbrellaOfEvent($id: Int!) {\n  events(id: [$id]) {\n    umbrella {\n      ID\n    }\n  }\n}\n\nquery eventCloseup($id: Int!) {\n  events(id: [$id]) {\n    ID\n    title\n    description\n    from\n    to\n    topic {\n      name\n      color\n    }\n    type {\n      name\n      color\n    }\n    tutorsAssigned {\n      tutors {\n        fn\n        sn\n        mail\n      }\n      room {\n        capacity\n        floor\n        name\n        number\n        building {\n          ID\n          name\n          street\n          number\n          city\n          zip\n          latitude\n          longitude\n          zoomLevel\n        }\n      }\n      registrations\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query registrationForm($eventID: Int!) {\n  forms(id: [$eventID]) {\n    title\n    description\n    questions {\n      ID\n      title\n      type\n      required\n      answers {\n        ID\n        title\n        points\n      }\n    }\n  }\n}"): (typeof documents)["query registrationForm($eventID: Int!) {\n  forms(id: [$eventID]) {\n    title\n    description\n    questions {\n      ID\n      title\n      type\n      required\n      answers {\n        ID\n        title\n        points\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query emailPasswordLogin($email: String!, $password: String!) {\n  login(credentials: {email: $email, password: $password}) {\n    sessionID\n    user {\n      fn\n      sn\n      mail\n      confirmed\n    }\n  }\n}"): (typeof documents)["query emailPasswordLogin($email: String!, $password: String!) {\n  login(credentials: {email: $email, password: $password}) {\n    sessionID\n    user {\n      fn\n      sn\n      mail\n      confirmed\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query userEventRegistration($email: String!, $id: Int!) {\n  registrations(studentMail: [$email], eventId: $id) {\n    room {\n      number\n      building {\n        ID\n      }\n    }\n  }\n}"): (typeof documents)["query userEventRegistration($email: String!, $id: Int!) {\n  registrations(studentMail: [$email], eventId: $id) {\n    room {\n      number\n      building {\n        ID\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query umbrellas($onlyFuture: Boolean, $id: [Int!]) {\n  umbrellas(onlyFuture: $onlyFuture, id: $id) {\n    ID\n    title\n  }\n}"): (typeof documents)["query umbrellas($onlyFuture: Boolean, $id: [Int!]) {\n  umbrellas(onlyFuture: $onlyFuture, id: $id) {\n    ID\n    title\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;