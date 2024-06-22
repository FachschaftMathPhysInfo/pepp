# pepp
## dev ([todos](https://github.com/FachschaftMathPhysInfo/pepp/issues/1))
1. `cp .env .env.local`
2. `docker compose build`
3. `docker compose up -d && docker compose logs -f`

The API is now reachable on `localhost:8080/api`.
Documentation for all endpoints can be found in the `README.md` inside `server/`. Messing around with the API is possible via the GraphQL Playground on `localhost:8080`.

For the E-Mail verification to work you have to provide a smtp server inside your `.env.local`, e.g.:
```
SMTP_HOST=smtp.example.de
SMTP_USER=example@example.de
SMTP_PASSWORD=1234
SMTP_PORT=465
FROM_ADDRESS=vorkurs@example.de
```
