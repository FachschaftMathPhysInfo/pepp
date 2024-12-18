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

export type Answer = {
  __typename?: 'Answer';
  ID: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type AnswerValuePair = {
  __typename?: 'AnswerValuePair';
  answer?: Maybe<Answer>;
  value?: Maybe<Scalars['String']['output']>;
};

export type Application = {
  __typename?: 'Application';
  accepted?: Maybe<Scalars['Boolean']['output']>;
  event: Event;
  form: Form;
  responses?: Maybe<Array<QuestionAnswersPair>>;
  score: Scalars['Int']['output'];
  student: User;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  sessionID: Scalars['String']['output'];
  user: User;
};

export type Building = {
  __typename?: 'Building';
  ID: Scalars['Int']['output'];
  city: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  number: Scalars['String']['output'];
  rooms?: Maybe<Array<Room>>;
  street: Scalars['String']['output'];
  zip: Scalars['Int']['output'];
  zoomLevel: Scalars['Int']['output'];
};

export type EmailPassword = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Event = {
  __typename?: 'Event';
  ID: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  from: Scalars['timestamptz']['output'];
  needsTutors: Scalars['Boolean']['output'];
  registrationForm?: Maybe<Form>;
  roomsAvailable?: Maybe<Array<Room>>;
  title: Scalars['String']['output'];
  to: Scalars['timestamptz']['output'];
  topic: Label;
  tutorsAssigned?: Maybe<Array<EventTutorRoomPair>>;
  tutorsAvailable?: Maybe<Array<User>>;
  type: Label;
  umbrella?: Maybe<Event>;
};

export type EventRegistration = {
  __typename?: 'EventRegistration';
  event: Event;
  room: Room;
};

export type EventToUserAssignment = {
  buildingID: Scalars['Int']['input'];
  eventID: Scalars['Int']['input'];
  roomNumber: Scalars['String']['input'];
  userMail: Scalars['String']['input'];
};

export type EventTutorRoomPair = {
  __typename?: 'EventTutorRoomPair';
  registrations: Scalars['Int']['output'];
  room: Room;
  tutors: Array<User>;
};

export type Form = {
  __typename?: 'Form';
  description?: Maybe<Scalars['String']['output']>;
  eventID: Scalars['Int']['output'];
  questions: Array<Question>;
  title: Scalars['String']['output'];
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
  addBuilding: Building;
  addEvent: Event;
  addEventAssignmentForTutor: Event;
  addForm: Form;
  addLabel: Label;
  addRoom: Room;
  addRoomAvailabilityForEvent: Room;
  addSetting: Setting;
  addStudent: User;
  addStudentApplicationForEvent: User;
  addStudentRegistrationForEvent: EventRegistration;
  addTutor: User;
  addTutorAvailabilityForEvent: User;
  addUser: User;
  deleteBuilding: Scalars['Int']['output'];
  deleteEvent: Scalars['Int']['output'];
  deleteEventAssignmentForTutor: Event;
  deleteForm: Scalars['Int']['output'];
  deleteLabel: Scalars['Int']['output'];
  deleteRoom: Scalars['Int']['output'];
  deleteRoomAvailabilityForEvent: Room;
  deleteSetting: Scalars['Int']['output'];
  deleteStudentApplicationForEvent: User;
  deleteStudentRegistrationForEvent: User;
  deleteTutorAvailabilityForEvent: User;
  deleteUser: Scalars['Int']['output'];
  updateBuilding: Building;
  updateEvent: Event;
  updateForm: Form;
  updateLabel: Label;
  updateRoom: Room;
  updateRoomForTutorial: Event;
  updateSetting: Setting;
  updateUser: User;
};


export type MutationAddBuildingArgs = {
  building: NewBuilding;
};


export type MutationAddEventArgs = {
  event: NewEvent;
};


export type MutationAddEventAssignmentForTutorArgs = {
  assignment: EventToUserAssignment;
};


export type MutationAddFormArgs = {
  form: NewForm;
};


export type MutationAddLabelArgs = {
  label: NewLabel;
};


export type MutationAddRoomArgs = {
  room: NewRoom;
};


export type MutationAddRoomAvailabilityForEventArgs = {
  availability: RoomToEventAvailability;
};


export type MutationAddSettingArgs = {
  setting: NewSetting;
};


export type MutationAddStudentArgs = {
  application: NewUserToEventApplication;
  student: NewUser;
};


export type MutationAddStudentApplicationForEventArgs = {
  application: NewUserToEventApplication;
};


export type MutationAddStudentRegistrationForEventArgs = {
  registration: NewUserToEventRegistration;
};


export type MutationAddTutorArgs = {
  availability: NewUserToEventAvailability;
  tutor: NewUser;
};


export type MutationAddTutorAvailabilityForEventArgs = {
  availability: NewUserToEventAvailability;
};


export type MutationAddUserArgs = {
  user: NewUser;
};


export type MutationDeleteBuildingArgs = {
  id: Array<Scalars['Int']['input']>;
};


export type MutationDeleteEventArgs = {
  id: Array<Scalars['Int']['input']>;
};


export type MutationDeleteEventAssignmentForTutorArgs = {
  assignment: EventToUserAssignment;
};


export type MutationDeleteFormArgs = {
  id: Array<Scalars['Int']['input']>;
};


export type MutationDeleteLabelArgs = {
  name: Array<Scalars['String']['input']>;
};


export type MutationDeleteRoomArgs = {
  buildingID: Scalars['Int']['input'];
  number: Array<Scalars['String']['input']>;
};


export type MutationDeleteRoomAvailabilityForEventArgs = {
  availability: RoomToEventAvailability;
};


export type MutationDeleteSettingArgs = {
  key: Array<Scalars['String']['input']>;
};


export type MutationDeleteStudentApplicationForEventArgs = {
  eventID: Scalars['Int']['input'];
  mail: Scalars['String']['input'];
};


export type MutationDeleteStudentRegistrationForEventArgs = {
  registration: NewUserToEventRegistration;
};


export type MutationDeleteTutorAvailabilityForEventArgs = {
  availability: NewUserToEventAvailability;
};


export type MutationDeleteUserArgs = {
  mail: Array<Scalars['String']['input']>;
};


export type MutationUpdateBuildingArgs = {
  building: NewBuilding;
  id: Scalars['Int']['input'];
};


export type MutationUpdateEventArgs = {
  event: NewEvent;
  id: Scalars['Int']['input'];
};


export type MutationUpdateFormArgs = {
  form: NewForm;
  id: Scalars['Int']['input'];
};


export type MutationUpdateLabelArgs = {
  label: NewLabel;
};


export type MutationUpdateRoomArgs = {
  room: NewRoom;
};


export type MutationUpdateRoomForTutorialArgs = {
  eventID: Scalars['Int']['input'];
  newBuildingID: Scalars['Int']['input'];
  newRoomNumber: Scalars['String']['input'];
  oldBuildingID: Scalars['Int']['input'];
  oldRoomNumber: Scalars['String']['input'];
};


export type MutationUpdateSettingArgs = {
  setting: NewSetting;
};


export type MutationUpdateUserArgs = {
  user: NewUser;
};

export type NewAnswer = {
  points: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type NewBuilding = {
  city: Scalars['String']['input'];
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  number: Scalars['String']['input'];
  street: Scalars['String']['input'];
  zip: Scalars['Int']['input'];
  zoomLevel?: InputMaybe<Scalars['Int']['input']>;
};

export type NewEvent = {
  description?: InputMaybe<Scalars['String']['input']>;
  from: Scalars['timestamptz']['input'];
  needsTutors: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
  to: Scalars['timestamptz']['input'];
  topicName?: InputMaybe<Scalars['String']['input']>;
  typeName?: InputMaybe<Scalars['String']['input']>;
  umbrellaID?: InputMaybe<Scalars['Int']['input']>;
};

export type NewForm = {
  description?: InputMaybe<Scalars['String']['input']>;
  questions: Array<NewQuestion>;
  title: Scalars['String']['input'];
};

export type NewLabel = {
  color?: InputMaybe<Scalars['HexColorCode']['input']>;
  kind: LabelKind;
  name: Scalars['String']['input'];
};

export type NewQuestion = {
  answers: Array<NewAnswer>;
  required: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
  type: QuestionType;
};

export type NewQuestionResponsePair = {
  answerID?: InputMaybe<Scalars['Int']['input']>;
  questionID: Scalars['Int']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};

export type NewRoom = {
  buildingID: Scalars['Int']['input'];
  capacity: Scalars['Int']['input'];
  floor?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  number: Scalars['String']['input'];
};

export type NewSetting = {
  key: Scalars['String']['input'];
  type?: InputMaybe<ScalarType>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type NewUser = {
  fn: Scalars['String']['input'];
  mail: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  sn?: InputMaybe<Scalars['String']['input']>;
};

export type NewUserToEventApplication = {
  answers?: InputMaybe<Array<NewQuestionResponsePair>>;
  eventID: Scalars['Int']['input'];
  userMail: Scalars['String']['input'];
};

export type NewUserToEventAvailability = {
  eventID: Array<Scalars['Int']['input']>;
  userMail: Scalars['String']['input'];
};

export type NewUserToEventRegistration = {
  buildingID: Scalars['Int']['input'];
  eventID: Scalars['Int']['input'];
  roomNumber: Scalars['String']['input'];
  userMail: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  applications: Array<Application>;
  buildings: Array<Building>;
  events: Array<Event>;
  forms: Array<Form>;
  labels: Array<Label>;
  login: AuthPayload;
  registrations: Array<EventRegistration>;
  rooms: Array<Room>;
  settings: Array<Setting>;
  umbrellas: Array<Event>;
  users: Array<User>;
};


export type QueryApplicationsArgs = {
  eventID?: InputMaybe<Scalars['Int']['input']>;
  studentMail?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryBuildingsArgs = {
  id?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryEventsArgs = {
  id?: InputMaybe<Array<Scalars['Int']['input']>>;
  needsTutors?: InputMaybe<Scalars['Boolean']['input']>;
  onlyFuture?: InputMaybe<Scalars['Boolean']['input']>;
  topic?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Array<Scalars['String']['input']>>;
  umbrellaID?: InputMaybe<Array<Scalars['Int']['input']>>;
  userMail?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryFormsArgs = {
  id?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryLabelsArgs = {
  kind?: InputMaybe<Array<LabelKind>>;
  name?: InputMaybe<Array<Scalars['String']['input']>>;
  umbrellaID?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryLoginArgs = {
  credentials?: InputMaybe<EmailPassword>;
  sessionID?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRegistrationsArgs = {
  studentMail: Scalars['String']['input'];
};


export type QueryRoomsArgs = {
  buildingID: Scalars['Int']['input'];
  number?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QuerySettingsArgs = {
  key?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Array<ScalarType>>;
};


export type QueryUmbrellasArgs = {
  id?: InputMaybe<Array<Scalars['Int']['input']>>;
  onlyFuture?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryUsersArgs = {
  mail?: InputMaybe<Array<Scalars['String']['input']>>;
  sessionID?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Question = {
  __typename?: 'Question';
  ID: Scalars['Int']['output'];
  answers: Array<Answer>;
  required: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: QuestionType;
};

export type QuestionAnswersPair = {
  __typename?: 'QuestionAnswersPair';
  answers: Array<AnswerValuePair>;
  question: Question;
};

export enum QuestionType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  Scale = 'SCALE',
  SingleChoice = 'SINGLE_CHOICE',
  Text = 'TEXT'
}

export type Room = {
  __typename?: 'Room';
  building: Building;
  capacity?: Maybe<Scalars['Int']['output']>;
  floor?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  number: Scalars['String']['output'];
};

export type RoomToEventAvailability = {
  buildingID: Scalars['Int']['input'];
  eventID: Scalars['Int']['input'];
  roomNumber: Scalars['String']['input'];
};

export enum ScalarType {
  Boolean = 'BOOLEAN',
  Color = 'COLOR',
  Float = 'FLOAT',
  Int = 'INT',
  String = 'STRING',
  Timestamp = 'TIMESTAMP'
}

export type Setting = {
  __typename?: 'Setting';
  key: Scalars['String']['output'];
  type: ScalarType;
  value: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  applications?: Maybe<Array<Application>>;
  confirmed: Scalars['Boolean']['output'];
  eventsAssigned?: Maybe<Array<Event>>;
  eventsAvailable?: Maybe<Array<Event>>;
  eventsRegistered?: Maybe<Array<Event>>;
  fn: Scalars['String']['output'];
  mail: Scalars['String']['output'];
  sn: Scalars['String']['output'];
};

export type AddStudentApplicationForEventMutationVariables = Exact<{
  application: NewUserToEventApplication;
}>;


export type AddStudentApplicationForEventMutation = { __typename?: 'Mutation', addStudentApplicationForEvent: { __typename?: 'User', fn: string } };

export type UpdateEventMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  event: NewEvent;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', ID: number } };

export type AddStudentRegistrationForEventMutationVariables = Exact<{
  registration: NewUserToEventRegistration;
}>;


export type AddStudentRegistrationForEventMutation = { __typename?: 'Mutation', addStudentRegistrationForEvent: { __typename?: 'EventRegistration', room: { __typename?: 'Room', number: string, building: { __typename?: 'Building', ID: number } } } };

export type DeleteStudentRegistrationForEventMutationVariables = Exact<{
  registration: NewUserToEventRegistration;
}>;


export type DeleteStudentRegistrationForEventMutation = { __typename?: 'Mutation', deleteStudentRegistrationForEvent: { __typename?: 'User', eventsRegistered?: Array<{ __typename?: 'Event', ID: number }> | null } };

export type AddTutorMutationVariables = Exact<{
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  eventsAvailable: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type AddTutorMutation = { __typename?: 'Mutation', addTutor: { __typename?: 'User', fn: string } };

export type RegistrationMutationVariables = Exact<{
  fn: Scalars['String']['input'];
  sn?: InputMaybe<Scalars['String']['input']>;
  mail: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegistrationMutation = { __typename?: 'Mutation', addUser: { __typename?: 'User', fn: string, sn: string, mail: string, confirmed: boolean } };

export type TableEventsQueryVariables = Exact<{
  needsTutors?: InputMaybe<Scalars['Boolean']['input']>;
  onlyFuture?: InputMaybe<Scalars['Boolean']['input']>;
  umbrellaID?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type TableEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', ID: number, title: string, from: any, to: any, needsTutors: boolean, topic: { __typename?: 'Label', name: string, color?: any | null }, type: { __typename?: 'Label', name: string, color?: any | null } }> };

export type FutureEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type FutureEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', ID: number, title: string, umbrella?: { __typename?: 'Event', ID: number, title: string } | null }> };

export type PlannerEventsQueryVariables = Exact<{
  umbrellaID: Scalars['Int']['input'];
  type?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  topic?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type PlannerEventsQuery = { __typename?: 'Query', umbrellas: Array<{ __typename?: 'Event', title: string, registrationForm?: { __typename?: 'Form', eventID: number } | null }>, typeLabels: Array<{ __typename?: 'Label', name: string }>, topicLabels: Array<{ __typename?: 'Label', name: string }>, events: Array<{ __typename?: 'Event', ID: number, title: string, from: any, to: any, topic: { __typename?: 'Label', color?: any | null } }> };

export type UmbrellaOfEventQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type UmbrellaOfEventQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', umbrella?: { __typename?: 'Event', ID: number } | null }> };

export type EventCloseupQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type EventCloseupQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', ID: number, title: string, description?: string | null, from: any, to: any, needsTutors: boolean, topic: { __typename?: 'Label', name: string, color?: any | null }, type: { __typename?: 'Label', name: string, color?: any | null }, tutorsAssigned?: Array<{ __typename?: 'EventTutorRoomPair', registrations: number, tutors: Array<{ __typename?: 'User', fn: string, sn: string, mail: string, confirmed: boolean }>, room: { __typename?: 'Room', capacity?: number | null, floor?: number | null, name?: string | null, number: string, building: { __typename?: 'Building', ID: number, name: string, street: string, number: string, city: string, zip: number, latitude: number, longitude: number, zoomLevel: number } } }> | null }> };

export type TutorialAvailabilitysQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type TutorialAvailabilitysQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', tutorsAvailable?: Array<{ __typename?: 'User', mail: string, fn: string, sn: string }> | null, roomsAvailable?: Array<{ __typename?: 'Room', floor?: number | null, number: string, name?: string | null, capacity?: number | null, building: { __typename?: 'Building', ID: number, number: string, name: string, street: string, zip: number, city: string, latitude: number, longitude: number, zoomLevel: number } }> | null }> };

export type RegistrationFormQueryVariables = Exact<{
  eventID: Scalars['Int']['input'];
}>;


export type RegistrationFormQuery = { __typename?: 'Query', forms: Array<{ __typename?: 'Form', title: string, description?: string | null, questions: Array<{ __typename?: 'Question', ID: number, title: string, type: QuestionType, required: boolean, answers: Array<{ __typename?: 'Answer', ID: number, title: string, points: number }> }> }> };

export type EmailPasswordLoginQueryVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type EmailPasswordLoginQuery = { __typename?: 'Query', login: { __typename?: 'AuthPayload', sessionID: string, user: { __typename?: 'User', fn: string, sn: string, mail: string, confirmed: boolean, applications?: Array<{ __typename?: 'Application', accepted?: boolean | null, event: { __typename?: 'Event', ID: number } }> | null } }, registrations: Array<{ __typename?: 'EventRegistration', event: { __typename?: 'Event', ID: number }, room: { __typename?: 'Room', capacity?: number | null, floor?: number | null, name?: string | null, number: string, building: { __typename?: 'Building', ID: number, name: string, street: string, number: string, city: string, zip: number, latitude: number, longitude: number, zoomLevel: number } } }> };

export type UmbrellasQueryVariables = Exact<{
  onlyFuture?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type UmbrellasQuery = { __typename?: 'Query', umbrellas: Array<{ __typename?: 'Event', ID: number, title: string }> };


export const AddStudentApplicationForEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addStudentApplicationForEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"application"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewUserToEventApplication"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addStudentApplicationForEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"application"},"value":{"kind":"Variable","name":{"kind":"Name","value":"application"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fn"}}]}}]}}]} as unknown as DocumentNode<AddStudentApplicationForEventMutation, AddStudentApplicationForEventMutationVariables>;
export const UpdateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"event"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewEvent"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"event"},"value":{"kind":"Variable","name":{"kind":"Name","value":"event"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}}]}}]}}]} as unknown as DocumentNode<UpdateEventMutation, UpdateEventMutationVariables>;
export const AddStudentRegistrationForEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addStudentRegistrationForEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"registration"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewUserToEventRegistration"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addStudentRegistrationForEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"registration"},"value":{"kind":"Variable","name":{"kind":"Name","value":"registration"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"room"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"building"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddStudentRegistrationForEventMutation, AddStudentRegistrationForEventMutationVariables>;
export const DeleteStudentRegistrationForEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteStudentRegistrationForEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"registration"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewUserToEventRegistration"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStudentRegistrationForEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"registration"},"value":{"kind":"Variable","name":{"kind":"Name","value":"registration"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventsRegistered"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteStudentRegistrationForEventMutation, DeleteStudentRegistrationForEventMutationVariables>;
export const AddTutorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addTutor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventsAvailable"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTutor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tutor"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"fn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"sn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"mail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"availability"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"userMail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"eventID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventsAvailable"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fn"}}]}}]}}]} as unknown as DocumentNode<AddTutorMutation, AddTutorMutationVariables>;
export const RegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"registration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fn"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sn"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mail"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"fn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fn"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"sn"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sn"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"mail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mail"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fn"}},{"kind":"Field","name":{"kind":"Name","value":"sn"}},{"kind":"Field","name":{"kind":"Name","value":"mail"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}}]}}]}}]} as unknown as DocumentNode<RegistrationMutation, RegistrationMutationVariables>;
export const TableEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tableEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"needsTutors"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"onlyFuture"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"needsTutors"},"value":{"kind":"Variable","name":{"kind":"Name","value":"needsTutors"}}},{"kind":"Argument","name":{"kind":"Name","value":"onlyFuture"},"value":{"kind":"Variable","name":{"kind":"Name","value":"onlyFuture"}}},{"kind":"Argument","name":{"kind":"Name","value":"umbrellaID"},"value":{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"needsTutors"}},{"kind":"Field","name":{"kind":"Name","value":"topic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]} as unknown as DocumentNode<TableEventsQuery, TableEventsQueryVariables>;
export const FutureEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"futureEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"onlyFuture"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"umbrella"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]}}]} as unknown as DocumentNode<FutureEventsQuery, FutureEventsQueryVariables>;
export const PlannerEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"plannerEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"topic"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"umbrellas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"registrationForm"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventID"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"typeLabels"},"name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"EnumValue","value":"EVENT_TYPE"}},{"kind":"Argument","name":{"kind":"Name","value":"umbrellaID"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"topicLabels"},"name":{"kind":"Name","value":"labels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"EnumValue","value":"TOPIC"}},{"kind":"Argument","name":{"kind":"Name","value":"umbrellaID"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"umbrellaID"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"umbrellaID"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"topic"},"value":{"kind":"Variable","name":{"kind":"Name","value":"topic"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"topic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]} as unknown as DocumentNode<PlannerEventsQuery, PlannerEventsQueryVariables>;
export const UmbrellaOfEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"umbrellaOfEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"id"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"umbrella"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}}]}}]}}]}}]} as unknown as DocumentNode<UmbrellaOfEventQuery, UmbrellaOfEventQueryVariables>;
export const EventCloseupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"eventCloseup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"id"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"needsTutors"}},{"kind":"Field","name":{"kind":"Name","value":"topic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tutorsAssigned"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tutors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fn"}},{"kind":"Field","name":{"kind":"Name","value":"sn"}},{"kind":"Field","name":{"kind":"Name","value":"mail"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"room"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"floor"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"building"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"zoomLevel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"registrations"}}]}}]}}]}}]} as unknown as DocumentNode<EventCloseupQuery, EventCloseupQueryVariables>;
export const TutorialAvailabilitysDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"tutorialAvailabilitys"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"id"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tutorsAvailable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mail"}},{"kind":"Field","name":{"kind":"Name","value":"fn"}},{"kind":"Field","name":{"kind":"Name","value":"sn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roomsAvailable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"floor"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"building"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"zoomLevel"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TutorialAvailabilitysQuery, TutorialAvailabilitysQueryVariables>;
export const RegistrationFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"registrationForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventID"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"eventID"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RegistrationFormQuery, RegistrationFormQueryVariables>;
export const EmailPasswordLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"emailPasswordLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"credentials"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sessionID"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fn"}},{"kind":"Field","name":{"kind":"Name","value":"sn"}},{"kind":"Field","name":{"kind":"Name","value":"mail"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"applications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accepted"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"registrations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"studentMail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}}]}},{"kind":"Field","name":{"kind":"Name","value":"room"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"floor"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"building"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"zip"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}},{"kind":"Field","name":{"kind":"Name","value":"zoomLevel"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EmailPasswordLoginQuery, EmailPasswordLoginQueryVariables>;
export const UmbrellasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"umbrellas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"onlyFuture"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"umbrellas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"onlyFuture"},"value":{"kind":"Variable","name":{"kind":"Name","value":"onlyFuture"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ID"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<UmbrellasQuery, UmbrellasQueryVariables>;