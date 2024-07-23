# pepp
> **P**raktische **E**rsti-**P**rogramm**p**lanung

## build
1. `cp .env .env.local`
2. `docker compose build`
3. `docker compose up -d && docker compose logs -f`

- Frontend: [localhost:8080](http://localhost:8080)
- ICal Calendar: [localhost:8080/ical?l=Tutorium](http://localhost:8080/ical?l="Tutorium")
- API: [localhost:8080/api](http://localhost:8080/api)
- GraphQL Playground: [localhost:8080/playground](http://localhost:8080/playground)
  - Documentation for all endpoints can be found in the [`server/README.md`](server/README.md)

### dev
#### frontend
1. `cd frontend`
2. `npm i`
3. `npm run dev`

#### backend
i just rebuild the docker image on change

The backend sends emails (confirmation, ...). You need provide a smtp server inside your `.env.local`, e.g.:
```
SMTP_HOST=smtp.example.de
SMTP_USER=example@example.de
SMTP_PASSWORD=1234
SMTP_PORT=465
FROM_ADDRESS=vorkurs@example.de
```

## contributions
1. [create an issue](https://github.com/FachschaftMathPhysInfo/pepp/issues/new)
2. from this issue create a branch and work on it
3. create a pull request and tag one of the main contributors for a short review
4. sanfter Schulterklopfer ♡
