# pepp
> **P**raktische **E**rsti-**P**rogramm**p**lanung

## build
```bash
cp .env .env.local
docker compose build
docker compose up -d && docker compose logs -f
```

- Frontend: [localhost:8080](http://localhost:8080)
- ICal Calendar: [localhost:8080/ical?e=1&ty=Tutorium&to=Informatik](http://localhost:8080/ical?e=1&ty=Tutorium&to=Informatik)
- API: [localhost:8080/api](http://localhost:8080/api)
- GraphQL Playground: [localhost:8080/playground](http://localhost:8080/playground)

### dev
#### frontend
```bash
cd frontend
npm i
npm run codegen
npm run dev
```

#### backend
```bash
cd server
go generate ./...
go run server.go
```

#### example data
1. visit [localhost:8080/playground](http://localhost:8080/playground)
2. get a session id for the generated admin user by doing a login query
    ```
    {
      login (
        mail: "admin@pepp.local"
        password: "<generated password from backend logs>"
      )
    }
    ```
3. in the playground go to the headers tab and paste the session id
    ```
    {
      "SID": "<session id>"
    }
    ```
<details>
    <summary>4. trigger the following mutation</summary>

    mutation exampleData {
      tutor1: addUser(user: {mail: "tutor1@example.de", fn: "Tutorin", sn: "One", password: "test1"})
      tutor2: addUser(user: {mail: "tutor2@example.de", fn: "Tutor", sn: "Two", password: "test2"})
      mmk: addBuilding(
        building: {name: "Mathematikon", street: "INF", number: "205", city: "Heidelberg", zip: "69115", latitude: 49.417493, longitude: 8.675197, zoomLevel: 17}
      ) {
        ID
      }
      kip: addBuilding(
        building: {name: "Kirchhoff-Institut für Physik", street: "INF", number: "227", city: "Heidelberg", zip: "69115", latitude: 49.4162501, longitude: 8.6694734, zoomLevel: 17}
      ) {
        ID
      }
      sr1: addRoom(
        room: {number: "101", name: "SR 1", capacity: 20, floor: 2, buildingID: 1}
      ) {
        number
      }
      sr2: addRoom(room: {number: "2.141", capacity: 35, buildingID: 1}) {
        number
      }
      sr3: addRoom(
        room: {number: "503", name: "Labor 1", capacity: 30, floor: 5, buildingID: 2}
      ) {
        number
      }
      mathe: addLabel(label: {name: "Mathe", color: "#87cefa", kind: TOPIC}) {
        name
      }
      info: addLabel(label: {name: "Informatik", color: "#FFE31A", kind: TOPIC}) {
        name
      }
      allg: addLabel(label: {name: "Allgemein", color: "#5D737E", kind: TOPIC}) {
        name
      }
      tutorial: addLabel(
        label: {name: "Tutorium", color: "#ABBA7C", kind: EVENT_TYPE}
      ) {
        name
      }
      vl: addLabel(label: {name: "Vorlesung", color: "#ffbf00", kind: EVENT_TYPE}) {
        name
      }
      vk: addEvent(
        event: {title: "Vorkurs 2025", description: "Lorem Ipsum", from: "2030-02-21T00:00:00Z", to: "2030-02-24T00:00:00Z", needsTutors: true}
      ) {
        ID
      }
      pvk: addEvent(
        event: {title: "Programmiervorkurs 2025", description: "Lorem Ipsum", from: "2030-02-21T00:00:00Z", to: "2030-02-24T00:00:00Z", needsTutors: true}
      ) {
        ID
      }
      alda: addEvent(
        event: {title: "Algorithmen und Datenstrukturen", description: "Lorem Ipsum dolor sit amed", topicName: "Informatik", typeName: "Tutorium", needsTutors: true, from: "2030-02-21T00:00:00Z", to: "2030-02-21T01:00:00Z", umbrellaID: 1}
      ) {
        ID
      }
      ana: addEvent(
        event: {title: "Analysis", description: "Lorem Ipsum dolor sit amed", topicName: "Mathe", typeName: "Vorlesung", needsTutors: true, from: "2030-02-28T00:00:00Z", to: "2030-02-28T02:00:00Z", umbrellaID: 1}
      ) {
        ID
      }
      sr1vk: addRoomAvailabilityForEvent(
        availability: {roomNumber: "101", buildingID: 1, eventID: 3}
      ) {
        number
      }
      sr2vk: addRoomAvailabilityForEvent(
        availability: {roomNumber: "2.141", buildingID: 1, eventID: 3}
      ) {
        number
      }
      sr3pvk: addRoomAvailabilityForEvent(
        availability: {roomNumber: "503", buildingID: 2, eventID: 5}
      ) {
        number
      }
      t1sr1: addEventAssignmentForTutor(
        assignment: {eventID: 3, userMail: "tutor1@example.de", roomNumber: "101", buildingID: 1}
      ) {
        ID
      }
      t2sr1: addEventAssignmentForTutor(
        assignment: {eventID: 3, userMail: "tutor2@example.de", roomNumber: "101", buildingID: 1}
      ) {
        ID
      }
  		t2sr2: addEventAssignmentForTutor(
        assignment: {eventID: 3, userMail: "tutor2@example.de", roomNumber: "2.141", buildingID: 1}
      ) {
        ID
      }
      t1vk: addTutorAvailabilityForEvent(
        availability: {userMail: "tutor1@example.de", eventID: [3, 4]}
      ) {
        mail
      }
  		t2vk: addTutorAvailabilityForEvent(
        availability: {userMail: "tutor2@example.de", eventID: [3, 4]}
      ) {
        mail
      }
      addForm(
        form: {title: "Beispielregistrierung", description: "Lorem Ipsum dolor sit amed", questions: [{title: "Wie viel Programmiererfahrung hast du?", type: SCALE, required: true, answers: [{title: "Keine", points: 8}, {title: "Ich arbeite an eigenen Projekten", points: 0}]}, {title: "Welche der folgenden Konzepte kennst du noch nicht?", type: MULTIPLE_CHOICE, required: false, answers: [{title: "Variablen", points: 5}, {title: "If-Bedingungen", points: 4}, {title: "For/While-Schleifen", points: 3}, {title: "Klassen", points: 1}]}]}
      ) {
        eventID
      }
      s1: addSetting(setting: {key: "copyright-notice", value: "Copyright © 2024, Fachschaft MathPhysInfo. All rights reserved.", type: STRING}) { key }
      s2: addSetting(setting: {key: "email-greeting", value: "Hey", type: STRING}) { key }
      s3: addSetting(setting: {key: "email-signature", value: "Dein", type: STRING}) { key }
      s4: addSetting(setting: {key: "email-name", value: "Fachschaft MPI", type: STRING}) { key }
      s5: addSetting(setting: {key: "email-confirm-subject", value: "Bestätige deine Registrierung", type: STRING}) { key }
      s6: addSetting(setting: {key: "email-confirm-intro", value: "Bitte bestätige deine Registrierung.", type: STRING}) { key }
      s7: addSetting(setting: {key: "email-confirm-button-instruction", value: "Klicke auf den Button", type: STRING}) { key }
      s8: addSetting(setting: {key: "email-confirm-button-text", value: "Bestätigen", type: STRING}) { key }
      s9: addSetting(setting: {key: "email-availability-subject", value: "Verfügbarkeit für Tutorien", type: STRING}) { key }
      s10: addSetting(setting: {key: "email-availability-intro", value: "Bitte gib deine Verfügbarkeiten an.", type: STRING}) { key }
      s11: addSetting(setting: {key: "email-availability-outro", value: "Danke für deine Rückmeldung!", type: STRING}) { key }
      s12: addSetting(setting: {key: "email-assignment-subject", value: "Zuteilung zu Tutorien", type: STRING}) { key }
      s13: addSetting(setting: {key: "email-assignment-event-title", value: "Veranstaltung", type: STRING}) { key }
      s14: addSetting(setting: {key: "email-assignment-kind-title", value: "Art", type: STRING}) { key }
      s15: addSetting(setting: {key: "email-assignment-date-title", value: "Datum", type: STRING}) { key }
      s16: addSetting(setting: {key: "email-assignment-time-title", value: "Uhrzeit", type: STRING}) { key }
      s17: addSetting(setting: {key: "email-assignment-room-title", value: "Raum", type: STRING}) { key }
      s18: addSetting(setting: {key: "email-assignment-building-title", value: "Gebäude", type: STRING}) { key }
      s19: addSetting(setting: {key: "email-assignment-intro", value: "Hier ist deine Zuteilung", type: STRING}) { key }
      s20: addSetting(setting: {key: "email-assignment-outro", value: "Viel Erfolg!", type: STRING}) { key }
    }
</details>

## env vars

| Key | Description |
| - | - |
| `LOG_LEVEL` (optional) | Default is `Info`. Set to `Debug` for more information |
| `PUBLIC_URL` (required) | The domain under which pepp is deployed |
| `PEPPER_KEY` (required) | Generate a random 64 characters long string for password security |
| `POSTGRES_HOST` (optional) | When given tries to connect. Creates a SQLite per default |
| `POSTGRES_PASSWORD` (optional) | Required if `POSTGRES_HOST` is given |
| `POSTGRES_PORT` (optional) | Required if `POSTGRES_HOST` is given |
| `POSTGRES_USER` (optional) | Required if `POSTGRES_HOST` is given |
| `POSTGRES_DB` (optional) | Required if `POSTGRES_HOST` is given |
| `SMTP_HOST` (required) |  E-Mail provider, e.g. `smtp.example.de` |
| `SMTP_USER` (required) | E.g. `alice@example.de` |
| `SMTP_PASSWORD` (required) | The password to log into the SMTP Server |
| `SMTP_PORT` (required) | Mostly `465` |
| `FROM_ADDRESS` (required) | Address from which mails are send, e.g. `vorkurs@example.de` |

## contributions
1. [create an issue](https://github.com/FachschaftMathPhysInfo/pepp/issues/new)
2. from this issue create a branch and work on it
3. create a pull request and tag one of the main contributors for a short review
4. sanfter Schulterklopfer ♡
