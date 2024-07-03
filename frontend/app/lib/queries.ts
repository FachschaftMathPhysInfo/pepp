import { gql } from 'graphql-request';

export const ADD_TUTOR = gql`
mutation($firstName:String!, $lastName:String!, $email:String!, $eventsAvailable:[UUID!]) {
  addTutor(tutor: {
    fn: $firstName
    sn: $lastName
    mail: $email
    eventsAvailable: $eventsAvailable
  }) 
}`
;

export const GET_EVENTS = gql`
query {
  event {
    ID,
    name,
    from
  }
}`
;