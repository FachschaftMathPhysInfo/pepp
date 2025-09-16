import {
  Application,
  Building,
  Event,
  Form,
  Label,
  LabelKind,
  Role,
  Room,
  Tutorial,
  User,
} from "@/lib/gql/generated/graphql";

export const defaultEvent: Event = {
  ID: 0,
  needsTutors: false,
  title: "",
  topic: { ID: 0, name: "", color: "", kind: LabelKind.Topic },
  type: { ID: 0, name: "", color: "", kind: LabelKind.EventType },
  from: "",
  to: "",
  tutorialsOpen: false,
  registrationNeeded: true,
};

export const defaultBuilding: Building = {
  ID: 0,
  name: "",
  street: "",
  number: "",
  city: "",
  zip: "",
  latitude: 0,
  longitude: 0,
  zoomLevel: 17,
};

export const defaultRoom: Room = {
  number: "",
  building: defaultBuilding,
};

export const defaultTutorial: Tutorial = {
  ID: 0,
  event: defaultEvent,
  tutors: [],
  registrationCount: 0,
  room: defaultRoom,
};

export const defaultUser: User = {
  ID: 0,
  fn: "",
  sn: "",
  mail: "",
  confirmed: false,
  role: Role.User,
};

export const defaultLabel: Label = {
  ID: 0,
  name: "",
  color: "",
  kind: LabelKind.EventType,
};

export const defaultForm: Form = {
  eventID: 0,
  title: "",
  questions: [],
};

export const defaultApplication: Application = {
  event: defaultEvent,
  student: defaultUser,
  score: 0,
  form: defaultForm,
};
