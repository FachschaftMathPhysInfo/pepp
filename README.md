# pepp
## dev ([todos](https://github.com/FachschaftMathPhysInfo/pepp/issues/1))
1. `docker compose build`
2. `docker compose up -d && docker compose logs -f`

The API is now reachable on `localhost:8080/api`.

### Example usage of GraphQL in the interactive playground:
1. Open `localhost:8080`
2. Insert a new event (similar to `POST`), e.g.
```
mutation {
  newEvent(input: {
    tutorId: "123e4567-e89b-12d3-a456-426614174000" # dummy
    title: "Math Tutoring Session"
    description: "Learn advanced calculus"
    from: "2024-06-18T10:00:00Z"
    to: "2024-06-18T12:00:00Z"
  })
}
```
3. Query (similar to `GET`) for events in the database
```
query {
  events{
    id
    title
    description
  }
}
```
