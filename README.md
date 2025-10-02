<div align="center">
  <a href="https://github.com/FachschaftMathPhysInfo/pepp">
    <img src="frontend/public/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Pepp</h3>

  <p align="center">
    A software to organize preparatory courses at universities.
    <br />
    <a href="https://vorkurs.mathphys.info"><strong>Explore a live version »</strong></a>
    <br />
    <br />
    <a href="https://github.com/FachschaftMathPhysInfo/pepp/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/FachschaftMathPhysInfo/pepp/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

## Getting started
> [!CAUTION]
> For development and testing purposes, SQLite is supported as DB-System. However, in production please use Postgres as we only support this for DB-migrations. You will get no updates otherwise, or break your system. To use SQLite just don't provide Posgres connection environment variables.
### Deployment via docker-compose
```bash
volumes:
  data:

services:
  pepp:
    image: ghcr.io/fachschaftmathphysinfo/pepp:latest
    ports:
      - 8080:8080
    env_file: .env
    depends_on:
      - postgres
  postgres:
    image: postgres:15.6-alpine
    volumes:
      - data:/var/lib/postgresql/data
    env_file: .env
```
### (optional) Configuring mTLS with Postgres
1. You need the files `gen_certs.sh`, `postgresql.conf` and folder `tls` from this repositorys root
2. Run `./gen_certs.sh`
3. Deploy with provided keys:
```bash
volumes:
  data:

services:
  pepp:
    image: ghcr.io/fachschaftmathphysinfo/pepp:latest
    volumes:
      - ./tls/certs/root.crt:/app/root.crt:ro
      - ./tls/certs/client.crt:/app/server.crt:ro
      - ./tls/certs/client.key:/app/server.key:ro
    ports:
      - 8080:8080
    env_file: .env
    depends_on:
      - postgres
  postgres:
    image: postgres:15.6-alpine
    volumes:
      - data:/var/lib/postgresql/data
      - ./postgresql.conf:/etc/postgresql/config/postgresql.conf:ro
      - ./tls/certs/root.crt:/etc/postgres/security/root.crt:ro
      - ./tls/certs/server.crt:/etc/postgres/security/server.crt:ro
      - ./tls/certs/server.key:/etc/postgres/security/server.key:ro
    command: -c config_file=/etc/postgresql/config/postgresql.conf
    env_file: .env
``` 
> [!IMPORTANT]
> After initial startup run `docker compose exec pepp pepp db init` and `docker compose exec pepp pepp db mark_applied`

## Environment Variables

### Required for Production environment
| Key | Description | Example |
| - | - | - |
| `PUBLIC_URL` | Domain under which pepp is deployed | `https://pepp.example.com` |
| `PEPPER_KEY` | Generate a random 32 characters long string for password security | - |
| `SMTP_HOST` | E-Mail provider | `smtp.example.com` |
| `SMTP_USER` | The user to log into the SMTP Server | `alice@example.com` |
| `SMTP_PASSWORD` | The password to log into the SMTP Server | - |
| `SMTP_PORT` | The port of your SMTP Server | `465` |
| `FROM_ADDRESS` | Address from which mails are send | `vorkurs@example.com` |
| `POSTGRES_HOST` | When given tries to connect. Creates a SQLite per default | `postgres` |
| `POSTGRES_PASSWORD` | Required if `POSTGRES_HOST` is given | `a string password` |
| `POSTGRES_PORT` | Required if `POSTGRES_HOST` is given | `5433` |
| `POSTGRES_USER` | Required if `POSTGRES_HOST` is given | `postgres` |
| `POSTGRES_DB` | Required if `POSTGRES_HOST` is given | `postgres` |

### optional

| Key | Description | Example |
| - | - | - |
| `LOG_LEVEL` | Default is `Info`. Set to `Debug` for more information | `Debug` |
| `LOCALE` | Default is `UTC`. This affects mainly the events exported as ICS which get converted. | `Europe/Berlin` |
| `ENV` | Set to `Production` on deployment | `Production` |
| `ENABLE_TRACING` | Application exports traces to an OpenTelemetry Collector | `true` |
| `ADMIN_USER` | Default is `admin@pepp.local`. Generated on initial startup | `admin@example.com` |
| `OIDC_LOGIN_PROVIDER_URL` | When given, initializes an Open ID Endpoint at `/sso/oidc` | `https://auth.example.com` |
| `OIDC_LOGIN_CLIENT_ID` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `pepp` |
| `OIDC_LOGIN_CLIENT_SECRET` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `insecure_secret` |
| `OIDC_LOGIN_SCOPES` | Required if `OIDC_LOGIN_PROVIDER_URL` is given | `openid profile email groups` |
| `OIDC_LOGIN_CLAIM_MAPPING` | Required if `OIDC_LOGIN_PROVIDER_URL` is given. Map single name strings to `name` and splitted to `fn` and `sn` | `'{"mail":"email","name":"name","groups":"groups"}'` |
| `OIDC_LOGIN_ADMIN_GROUPS` | User groups which will automatically get admin rights. | `vorkurs-orga root` |

> [!NOTE]
> When configuring your OIDC-Provider, remember to set the callback uri to `https://<your PUBLIC_URL here>/sso/oidc/callback`.


## Development
### Build
```bash
cp .env .env.local
docker compose build
docker compose up -d && docker compose logs -f
```

- Frontend: [localhost:8080](http://localhost:8080)
- ICal Calendar: [localhost:8080/ical](http://localhost:8080/ical)
- API: [localhost:8080/api](http://localhost:8080/api)
- GraphQL Playground: [localhost:8080/playground](http://localhost:8080/playground)

#### Frontend
```bash
cd frontend
npm i
npm run codegen
npm run dev
```

#### Backend
> [!IMPORTANT]  
> In development, the backend creates some example data and creates an admin user:
> Mail: `admin@pepp.local`, 
> Password: `admin`
```bash
cd server
go generate ./...
go run server.go
```

## Contributions
1. [create an issue](https://github.com/FachschaftMathPhysInfo/pepp/issues/new)
2. from this issue create a branch and work on it
3. create a pull request and tag one of the main contributors for a short review
4. sanfter Schulterklopfer ♡
