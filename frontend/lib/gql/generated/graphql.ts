/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  HexColorCode: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
};

export type Building = {
  __typename?: 'Building';
  ID: Scalars['Int']['output'];
  city: Scalars['String']['output'];
  name: Scalars['String']['output'];
  number: Scalars['String']['output'];
  osm: Scalars['String']['output'];
  rooms?: Maybe<Array<Room>>;
  street: Scalars['String']['output'];
  zip: Scalars['Int']['output'];
};

export type Event = {
  __typename?: 'Event';
  ID: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  from: Scalars['timestamptz']['output'];
  needsTutors: Scalars['Boolean']['output'];
  roomsAvailable?: Maybe<Array<Room>>;
  title: Scalars['String']['output'];
  to: Scalars['timestamptz']['output'];
  topic: Label;
  tutorsAssigned?: Maybe<Array<EventTutorRoomPair>>;
  tutorsAvailable?: Maybe<Array<Tutor>>;
  type: Label;
};

export type EventTutorRoomPair = {
  __typename?: 'EventTutorRoomPair';
  registrations?: Maybe<Scalars['Int']['output']>;
  room?: Maybe<Room>;
  tutors?: Maybe<Array<Tutor>>;
};

export type Label = {
  __typename?: 'Label';
  color?: Maybe<Scalars['HexColorCode']['output']>;
  name: Scalars['String']['output'];
};

export enum LabelKind {
  EventType = 'EVENT_TYPE',
  Topic = 'TOPIC'
}

export type Mutation = {
  __typename?: 'Mutation';
  addAvailableRoomToEvent: Scalars['String']['output'];
  addBuilding: Scalars['String']['output'];
  addEvent: Scalars['String']['output'];
  addLabel: Scalars['String']['output'];
  addRegistration: Scalars['String']['output'];
  addRoom: Scalars['String']['output'];
  addTutor: Scalars['String']['output'];
  assignTutorToEvent: Scalars['String']['output'];
  deleteBuilding: Scalars['String']['output'];
  deleteEvent: Scalars['String']['output'];
  deleteLabel: Scalars['String']['output'];
  deleteRoom: Scalars['String']['output'];
  deleteRoomFromEvent: Scalars['String']['output'];
  deleteUser: Scalars['String']['output'];
  unassignTutorFromEvent: Scalars['String']['output'];
  updateBuilding: Scalars['String']['output'];
  updateEvent: Scalars['String']['output'];
  updateStudentAcceptedStatus: Scalars['String']['output'];
  updateTutor: Scalars['String']['output'];
};


export type MutationAddAvailableRoomToEventArgs = {
  link: NewRoomToEventLink;
};


export type MutationAddBuildingArgs = {
  building: NewBuilding;
};


export type MutationAddEventArgs = {
  event: NewEvent;
};


export type MutationAddLabelArgs = {
  label: NewLabel;
};


export type MutationAddRegistrationArgs = {
  student: NewStudent;
};


export type MutationAddRoomArgs = {
  room: NewRoom;
};


export type MutationAddTutorArgs = {
  tutor: NewTutor;
};


export type MutationAssignTutorToEventArgs = {
  link: NewEventToTutorLink;
};


export type MutationDeleteBuildingArgs = {
  id: Array<Scalars['Int']['input']>;
};


export type MutationDeleteEventArgs = {
  id: Array<Scalars['Int']['input']>;
};


export type MutationDeleteLabelArgs = {
  name: Array<Scalars['String']['input']>;
};


export type MutationDeleteRoomArgs = {
  buildingID: Scalars['Int']['input'];
  number: Scalars['String']['input'];
};


export type MutationDeleteRoomFromEventArgs = {
  link: NewRoomToEventLink;
};


export type MutationDeleteUserArgs = {
  mail: Array<Scalars['String']['input']>;
};


export type MutationUnassignTutorFromEventArgs = {
  link: NewEventToTutorLink;
};


export type MutationUpdateBuildingArgs = {
  building: NewBuilding;
  id: Scalars['Int']['input'];
};


export type MutationUpdateEventArgs = {
  event: NewEvent;
  id: Scalars['Int']['input'];
};


export type MutationUpdateStudentAcceptedStatusArgs = {
  accepted: Scalars['Boolean']['input'];
  mail: Scalars['String']['input'];
};


export type MutationUpdateTutorArgs = {
  mail: Scalars['String']['input'];
  tutor: NewTutor;
};

export type NewBuilding = {
  city: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  number: Scalars['String']['input'];
  osm: Scalars['String']['input'];
  street: Scalars['String']['input'];
  zip: Scalars['Int']['input'];
};

export type NewEvent = {
  description?: InputMaybe<Scalars['String']['input']>;
  from: Scalars['timestamptz']['input'];
  needsTutors: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
  to: Scalars['timestamptz']['input'];
  topicName: Scalars['String']['input'];
  typeName: Scalars['String']['input'];
};

export type NewEventToTutorLink = {
  buildingID: Scalars['Int']['input'];
  eventID: Scalars['Int']['input'];
  roomNumber: Scalars['String']['input'];
  tutorMail: Scalars['String']['input'];
};

export type NewLabel = {
  color?: InputMaybe<Scalars['HexColorCode']['input']>;
  kind: LabelKind;
  name: Scalars['String']['input'];
};

export type NewRoom = {
  buildingID: Scalars['Int']['input'];
  capacity?: InputMaybe<Scalars['Int']['input']>;
  floor?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  number: Scalars['String']['input'];
};

export type NewRoomToEventLink = {
  buildingID: Scalars['Int']['input'];
  eventID: Scalars['Int']['input'];
  roomNumber: Scalars['String']['input'];
};

export type NewStudent = {
  fn: Scalars['String']['input'];
  mail: Scalars['String']['input'];
  sn: Scalars['String']['input'];
};

export type NewTutor = {
  eventsAvailable?: InputMaybe<Array<Scalars['Int']['input']>>;
  fn: Scalars['String']['input'];
  mail: Scalars['String']['input'];
  sn?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  buildings: Array<Building>;
  events: Array<Event>;
  labels: Array<Label>;
  rooms: Array<Room>;
  students: Array<Student>;
  tutors: Array<Tutor>;
};


export type QueryBuildingsArgs = {
  id?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryEventsArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Array<Scalars['Int']['input']>>;
  label?: InputMaybe<Array<Scalars['String']['input']>>;
  needsTutors?: InputMaybe<Scalars['Boolean']['input']>;
  tutor?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryLabelsArgs = {
  kind?: InputMaybe<Array<LabelKind>>;
  name?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryRoomsArgs = {
  buildingID: Scalars['Int']['input'];
  number?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryStudentsArgs = {
  mail?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryTutorsArgs = {
  eventID?: InputMaybe<Scalars['Int']['input']>;
  mail?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Room = {
  __typename?: 'Room';
  building: Building;
  capacity?: Maybe<Scalars['Int']['output']>;
  floor?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number: Scalars['String']['output'];
};

export type Student = User & {
  __typename?: 'Student';
  accepted?: Maybe<Scalars['Boolean']['output']>;
  answers: Array<Scalars['String']['output']>;
  confirmed: Scalars['Boolean']['output'];
  eventsRegistered?: Maybe<Array<Event>>;
  fn: Scalars['String']['output'];
  mail: Scalars['String']['output'];
  score?: Maybe<Scalars['Int']['output']>;
  sn: Scalars['String']['output'];
};

export type Tutor = User & {
  __typename?: 'Tutor';
  confirmed: Scalars['Boolean']['output'];
  eventsAssigned?: Maybe<Array<Event>>;
  eventsAvailable?: Maybe<Array<Event>>;
  fn: Scalars['String']['output'];
  mail: Scalars['String']['output'];
  sn: Scalars['String']['output'];
};

export type User = {
  confirmed: Scalars['Boolean']['output'];
  fn: Scalars['String']['output'];
  mail: Scalars['String']['output'];
  sn: Scalars['String']['output'];
};

export type AddTutorMutationVariables = Exact<{
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  eventsAvailable?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type AddTutorMutation = { __typename?: 'Mutation', addTutor: string };

export type TutorFormEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type TutorFormEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', ID: number, title: string, from: any, to: any, topic: { __typename?: 'Label', name: string, color?: any | null }, type: { __typename?: 'Label', name: string, color?: any | null } }> };

export type TutorsQueryVariables = Exact<{ [key: string]: never; }>;


export type TutorsQuery = { __typename?: 'Query', tutors: Array<{ __typename?: 'Tutor', fn: string, sn: string, mail: string, confirmed: boolean }> };


export const AddTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventsAvailable"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutor"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"fn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"sn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"mail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"eventsAvailable"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventsAvailable"}}}]}}]}]}}]} as unknown as DocumentNode<AddTutorMutation, AddTutorMutationVariables>;
export const TutorFormEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tutorFormEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"needsTutors"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"topic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]} as unknown as DocumentNode<TutorFormEventsQuery, TutorFormEventsQueryVariables>;
export const TutorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tutors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tutors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fn"}},{"kind":"Field","name":{"kind":"Name","value":"sn"}},{"kind":"Field","name":{"kind":"Name","value":"mail"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}}]}}]}}]} as unknown as DocumentNode<TutorsQuery, TutorsQueryVariables>;