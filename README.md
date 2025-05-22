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

| Key | Description | Example |
| - | - | - |
| `PUBLIC_URL` | Domain under which pepp is deployed | `https://pepp.example.com` |
| `PEPPER_KEY` | Generate a random 32 characters long string for password security | - |
| `SMTP_HOST` | E-Mail provider | `smtp.example.com` |
| `SMTP_USER` | The user to log into the SMTP Server | `alice@example.com` |
| `SMTP_PASSWORD` | The password to log into the SMTP Server | - |
| `SMTP_PORT` | The port of your SMTP Server | `465` |
| `FROM_ADDRESS` | Address from which mails are send | `vorkurs@example.com` |

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
| `OIDC_LOGIN_PROVIDER_URL` | When given, initializes an Open ID Endpoint at `/sso/oidc` | `auth.example.com` |
| `OIDC_LOGIN_CLIENT_ID` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `pepp` |
| `OIDC_LOGIN_CLIENT_SECRET` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `insecure_secret` |
| `OIDC_LOGIN_SCOPES` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `openid profile email groups` |

## contributions
1. [create an issue](https://github.com/FachschaftMathPhysInfo/pepp/issues/new)
2. from this issue create a branch and work on it
3. create a pull request and tag one of the main contributors for a short review
4. sanfter Schulterklopfer ♡
