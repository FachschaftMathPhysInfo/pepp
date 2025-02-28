import {
  Application,
  Building,
  Event,
  Form,
  Label,
  Role,
  Room,
  Tutorial,
  User,
} from "@/lib/gql/generated/graphql";

export const defaultEvent: Event = {
  ID: 0,
  needsTutors: false,
  title: "",
  topic: { name: "" },
  type: { name: "" },
  from: "",
  to: "",
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
  event: defaultEvent,
  tutors: [],
  registrations: 0,
  room: defaultRoom,
};

export const defaultUser: User = {
  fn: "",
  sn: "",
  mail: "",
  confirmed: false,
  role: Role.User,
};

export const defaultLabel: Label = {
  name: "",
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
