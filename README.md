# pepp
> **P**raktische **E**rsti-**P**rogramm**p**lanung

## build
```bash
cp .env .env.local
docker compose build
docker compose up -d && docker compose logs -f
```

- Frontend: [localhost:8080](http://localhost:8080)
- ICal Calendar: [localhost:8080/ical](http://localhost:8080/ical)
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
> [!IMPORTANT]  
> In development, the backend creates some example data and creates an admin user:
> Mail: `admin@pepp.local`, 
> Password: `admin`
```bash
cd server
go generate ./...
go run server.go
```

## deployment via docker compose
```bash
services:
  pepp:
    image: ghcr.io/fachschaftmathphysinfo/pepp
    ports:
      - 8080:8080
    env_file: .env
```

## env vars

### required


| Key | Description |
| - | - |
| `NEXT_PUBLIC_URL` | The domain under which pepp is deployed |
| `PEPPER_KEY` | Generate a random 64 characters long string for password security |
| `SMTP_HOST` |  E-Mail provider, e.g. `smtp.example.de` |
| `SMTP_USER` | E.g. `alice@example.de` |
| `SMTP_PASSWORD` | The password to log into the SMTP Server |
| `SMTP_PORT` | Mostly `465` |
| `FROM_ADDRESS` | Address from which mails are send, e.g. `vorkurs@example.de` |


### optional

| Key | Description | Example |
| - | - | - |
| `LOG_LEVEL` | Default is `Info`. Set to `Debug` for more information | `Debug` |
| `ENV` | Set to `Production` on deployment | `Production` |
| `ENABLE_TRACING` | Application exports traces to an OpenTelemetry Collector | `true` |
| `ADMIN_USER` | Default is `admin@pepp.local`. Generated on initial startup | `admin@example.com` |
| `POSTGRES_HOST` | When given tries to connect. Creates a SQLite per default | `postgres` |
| `POSTGRES_PASSWORD` | Required if `POSTGRES_HOST` is given | - |
| `POSTGRES_PORT` | Required if `POSTGRES_HOST` is given | `5433` |
| `POSTGRES_USER` | Required if `POSTGRES_HOST` is given | `postgres` |
| `POSTGRES_DB` | Required if `POSTGRES_HOST` is given | `postgres` |
| `OIDC_LOGIN_PROVIDER_URL` | When given, initializes an Open ID Endpoint at `/sso/oidc` | `https://auth.example.com` |
| `OIDC_LOGIN_CLIENT_ID` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `pepp` |
| `OIDC_LOGIN_CLIENT_SECRET` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `insecure_secret` |
| `OIDC_LOGIN_SCOPES` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `openid profile email groups` |
| `OIDC_LOGIN_CLAIM_MAPPING` | Required if `OIDC_LOGIN_PROVIDER_URL` is given. Map single name strings to `name` and splitted to `fn` and `sn` | `'{"mail":"email","name":"name","groups":"groups"}'` |
| `OIDC_LOGIN_ADMIN_GROUPS` | User groups which will automatically get admin rights. | `vorkurs-orga root` |

> [!NOTE]
> When configuring your OIDC-Provider, remember to set the callback uri to `https://<your PUBLIC_URL here>/sso/oidc/callback`.

## contributions
1. [create an issue](https://github.com/FachschaftMathPhysInfo/pepp/issues/new)
2. from this issue create a branch and work on it
3. create a pull request and tag one of the main contributors for a short review
4. sanfter Schulterklopfer ♡
