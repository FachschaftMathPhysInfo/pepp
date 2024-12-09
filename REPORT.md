# Bericht zur Vorkursorganistationssoftware *pepp*
> Daniel Heidemann, Universität Heidelberg

1. Einleitung
2. Architektur
3. Hauptfunktionen
4. Deployment
5. Weiterentwicklung und Ausblick
6. Fazit

# 1. Einleitung

Die Software zur Verwaltung des Vorkurses für Erstsemester soll eine effiziente und übersichtliche Lösung für die organisatorischen Herausforderungen bieten, die jedes Jahr bei der Planung und Durchführung dieser Kurse auftreten. Sie soll die zentrale Verwaltung aller benötigten Ressourcen und Prozesse unterstützen.

Die Arbeit an *pepp* ist enstanden, da sich die Verwaltung jährlicher Vorkurse mit insgesamt rund 400 Erstsemestern als mühsamer, aber automatisierbarer Prozess herausgestellt hat. Der Fokus liegt also insbesondere darauf, wiederkehrende Veranstaltungen unkompliziert zu reproduzieren und verwalten, um den organisatorischen Aufwand zu minimieren. Dies sollte mindestens zur Qualitätssicherung beitragen — im Optimalfall führt es dazu, dass mehr Wert auf die inhaltliche Planung gesetzt werden kann.

Im Folgenden werden die Anforderungen an die Software detailliert beschrieben.

## 1.1 Anforderungsanalyse

### 1.1.1 Veranstaltungsplanung: Vorlesungen und Tutorien

Die Software muss es den Organisatoren ermöglichen, den Vorkurs in verschiedene Veranstaltungsarten zu unterteilen, z. B. Vorlesungen und Tutorien. Hierbei sollten folgende Funktionen erfüllt werden:

- **Erstellen** von Veranstaltungen: Möglichkeit zur Erstellung und Verwaltung von Vorlesungen und Tutorien mit Angaben zu Titel, Beschreibung, Dozent/Tutor, Terminen und zugehörigen Räumen.
- Festlegung von **Zeitplänen**: Unterstützung bei der Planung von Veranstaltungen, sodass keine Überschneidungen auftreten. Die Software sollte Konflikte erkennen und vermeiden.
- **Flexible Anpassungen**: Die Veranstaltungen müssen während der Planungsphase sowie während des laufenden Vorkurses angepasst oder aktualisiert werden können.

### 1.1.2 Raumverwaltung

Für eine reibungslose Durchführung des Vorkurses ist eine zentrale Raumverwaltung notwendig. Die Software muss dabei folgende Anforderungen erfüllen:

- **Markieren** reservierter Räume: Zuweisung von Räumen zu einzelnen Veranstaltungen unter Berücksichtigung der Raumkapazität.
- **Konfliktprüfung**: Die Software soll sicherstellen, dass keine Doppelbuchungen für Räume entstehen und dass die Raumkapazitäten den Teilnehmerzahlen entsprechen.

### 1.1.3 Verwaltung von Tutoren und Dozenten

Die Software sollte ein umfassendes Management für Tutoren und Dozenten bieten, um Verfügbarkeiten und Zuweisungen zu verwalten. Zu den Anforderungen gehören:

- **Verfügbarkeitsmanagement**: Tutoren und Dozenten sollten ihre Verfügbarkeiten direkt in der Software angeben können, damit ihre Zuweisungen entsprechend geplant werden können.
- **Zuweisung** zu Veranstaltungen: Die Software muss die Möglichkeit bieten, Tutoren und Dozenten bestimmten Veranstaltungen (z. B. Tutorien oder Vorlesungen) zuzuweisen und ihnen Benachrichtigungen zukommen zu lassen.
- Verwaltung der **Rollen und Rechte**: Abgrenzung der Rechte zwischen Tutoren, Dozenten und Administratoren, sodass beispielsweise nur die zuständigen Personen Änderungen an den Veranstaltungsdetails vornehmen können.

### 1.1.4 Anmeldesystem

Ein zentrales Feature der Software ist die Verwaltung der Anmeldungen. Hierbei wird unterschieden zwischen der Anmeldung für den gesamten Vorkurs und der Auswahl spezifischer Tutorien.

- **Unabhängige** Anmeldung: Häufig werden zur Verwendung universitärer Dienste interne Anmeldedaten benötigt, welche einigen Studenten noch nicht zur Verfügung stehen. Ein unabhängiges Registrierungsverfahren soll hier Abhilfe schaffen.
- Anmeldung **für den Vorkurs**: Die Software soll es ermöglichen, eine zentrale Anmeldemöglichkeit für kapazitätsbegrenzte Vorkurse anzubieten. Dabei sollen durch einen Fragebogen bevorzugt Studenten mit weniger Vorerfahrung zugelassen werden.
- Anmeldung **zu Tutorien**: Flexible Eintragung anhand der Verfügbarkeit von Plätzen.
- **Bestätigungs- und Erinnerungsmails**: Die Software sollte automatisierte Bestätigungs- und Erinnerungsemails für Anmeldungen versenden, um die Teilnehmer regelmäßig zu informieren.

### 1.1.5 Benutzerfreundlichkeit und Datensicherheit

- **Intuitive** Benutzeroberfläche: Die Software muss eine benutzerfreundliche Oberfläche bieten, die für alle Beteiligten (Administratoren, Dozenten, Tutoren, Studenten) einfach zu bedienen ist.
- **Datenschutz und Sicherheit**: Die Software muss datenschutzkonform sein und den Schutz personenbezogener Daten gewährleisten. Dies beinhaltet eine sichere Anmeldung und verschlüsselte Datenspeicherung. Zur Umsetzung sollte die Architektur auf Basis des *Zero Trust* Prinzips gebaut werden (mindestens *TLS*, wenn möglich *mTLS* zur Kommunikation, auch im serverseitigen *Docker-Netzwerk*).
- **Mobiler Zugriff**: Idealerweise sollte die Software auch auf mobilen Geräten zugänglich sein

# 2. Architektur

## 2.1 Überblick
![Architekturdiagram](pics/pepp-architecture-overview.png)

Die Architektur ist so gestaltet, dass das Backend die zentrale Rolle einnimmt und alle Anfragen verarbeitet. Durch das direkte Reverse Proxying von `/*`-Anfragen an das Frontend wird der Bedarf an einer dedizierten Proxy-Komponente wie [*NGINX*](https://nginx.org/en/) umgangen. Somit wird die Komplexität reduziert und der Ressourcenbedarf minimiert. Das Backend sendet sog. [*Tracing-Daten*](https://opentelemetry.io/docs/concepts/signals/traces/) an einen internen Collector. Dabei handelt es sich um mit Zeitstempel versehene Logs, welche die Ausführungszeit einzelner Aktionen dokumentiert. Der Collector sammelt diese und schickt sie an einen externen Monitoring-Service wie [*Grafana*](https://grafana.com/) zur Visualisierung.

## 2.2 Technologien und Tools

### 2.2.1 Frontend: [Next.js](https://nextjs.org/)
Next.js bietet serverseitiges Rendering und statische Seiten-Generierung, was zu schneller Ladezeit und besserer SEO führt, ideal für Webanwendungen, die dynamische und gleichzeitig gut indexierte Inhalte benötigen. Die integrierte Routing-Funktion erleichtern die Entwicklung und sorgen für eine performante, einfach wartbare Codebasis.

#### 2.2.1.1 Ordnerstruktur
```bash
frontend
├── app # Alle Unterordner (ausg. (*)) sind Routing-Einheiten
│   ├── (form-tutor)
│   │   └── form-tutor # Formular zur Eintragung von Verfügbarkeiten für Tutorien
│   ├── (planner) # Landingpage Studenplan mit weiteren Administrationsmöglichkeiten
│   │   ├── applications
│   │   ├── events
│   │   ├── overview
│   │   ├── settings
│   │   └── tutorials
│   └── (registration)
│       └── register
├── assets # Statische Ressourcen
│   └── fonts
├── components # Wiederverwendbare UI-Komponenten
│   └── ui # shadcn Komponenten (https://ui.shadcn.com/)
├── config # Konfigurationsdateien
├── lib # Hilfsfunktionen
│   ├── context
│   └── gql
│       ├── generated # Generierte Objekte (Mutations/Queries) von GraphQL
│       ├── mutations
│       └── queries
├── public # Statische öffentliche Dateien
├── styles # Stile und CSS-Dateien
└── types # Typen für TypeScript-Objekte
```

#### 2.2.1.2 Backend-Kommunikation
Die Kommunikation zum API-Endpunkt erfolgt über eine Kombination der Bibliotheken [`graphql-request`](https://www.npmjs.com/package/graphql-request) und [`graphql-codegen`](https://the-guild.dev/graphql/codegen/docs/getting-started). Erstere simplifiziert dabei die Kommunikation mit dem Backend, wobei letztere das Schreiben der Anfragen und Verarbeiten der Responses erleichtert. `graphql-codegen` generiert zum Einen aus dem GraphQL-Schema in `server/graph/schema.graphqls` alle für die Frontend-Entwicklung relevanten Typen wie `Event` oder `Room`. Und zum Anderen alle *Queries* und *Mutations* definiert in `frontend/lib/gql/queries`, bzw. `.../mutations`.

Das Erstellen einer *Query* wird nun beispielhaft gezeigt:
1. Definition

    `frontend/lib/gql/queries/events.graphql`
    ```typescript
    query eventTopic($id: Int!) {
        events(id: [$id]) {
            topic {
                name
                color
            }
        }
    }
    ```
2. Generierung
    ```bash
    cd frontend
    npm run codegen
    ```
3. Verwendung in Next.js
    ```typescript
    import {
        Label,
        EventTopicDocument,
        EventTopicQuery,
        EventTopicQueryVariables,
    } from "@/lib/gql/generated/graphql";
    import { useState } from "react";

    // event topic is a Label
    const [label, setLabel] = useState<Label>();

    const fetchData = async () => {
        const vars: EventTopicQueryVariables = {
            id: 1,
        };

        const eventData = await client.request<EventTopicQuery>(
            EventTopicDocument,
            vars
        );

        if (eventData.events.length) {
            setLabel(eventData.events[0].topic)
        }
    }
    ```

#### 2.2.1.3 Provider
Provider dienen der Bereitstellung komponentenübergreifender Daten in einem Kontext. Alle in dieser Anwendung essenziellen Provider werden nun in ihrer Funktion erläutert:

- `UserProvider`: Sobald ein User angemeldet ist, wird ein Objekt vom Typ `User` mit den Nutzerdaten in den Kontext gesetzt. Dieses gibt der Software Auskunft über Zugriffsrechte, bzw. Zuweisungen oder Anmeldungen.
    ```typescript
    type UserContextType = {
      user: User | null;
      setUser: (user: User | null) => void;
    };
    ```
- `UmbrellaProvider`: Wird beim Laden der Seite gesetzt. Enthält die ID des *Umbrella-Events*, ein übergeordnetes `Event`, welche einen Vorkurs an `Event`s als Parent unter sich vereint. Die ID wird aus dem Suchparameter `e` geladen. Ist dieses nicht gegeben, wird das in nächster Zukunft liegende *Umbrella-Event* gewählt und als Suchparameter gesetzt. `e` kann optional auch die ID einer Veranstaltung innerhalb eines Vorkurses haben. Dadurch wird neben dem Parent *Umbrella-Event* auch eine `closeupID` gesetzt und die Veranstaltung im Popup geöffnet (*Randnotiz*: Das Veranstaltungspopup lässt sich alleine durch das Setzen, bzw. Entfernen der `closeupID` öffnen oder schließen).
    ```typescript
    type UmbrellaContextType = {
      umbrellaID: number | null;
      setUmbrellaID: (id: number | null) => void;
      closeupID: number | null;
      setCloseupID: (id: number | null) => void;
    };
    ```

### 2.2.2 Backend: [GraphQL](https://graphql.org/) ([gqlgen](https://gqlgen.com/))
GraphQL ermöglicht es, genau die Daten abzufragen, die für die jeweilige Ansicht benötigt werden, was die Netzwerkbelastung reduziert und die Client-Performance steigert. Mit gqlgen in Go kann man ein performantes Backend entwickeln, das typsicher, leicht und skalierbar ist.

#### 2.2.2.1 Ordnerstruktur
```bash
server
├── db # Initialisierung von Postgres
├── email # Handling des E-Mail-Verkehrs
├── graph # GraphQL Objektdefinitionen- und Implementierungen
│   └── model
├── ical # Generierung des ICS-Kalenders
├── maintenance # Regelmäßige Jobs, um Datenbank aufzuräumen
├── models # Datenbankrelationen
├── password # Hashfunktionen
└── tracing # OpenTelemetry-Anbindung
```

`server/server.go` bildet mit der Definition und Implementierung aller Routen (s.o.) die zentrale Schnittstelle der Applikation.

#### 2.2.2.2 API-Implementierung
Für die Implementierung des *API-Endpunktes* wird [`gqlgen`](https://gqlgen.com/) verwendet. Das Hinzufügen einer *Query* wird nun beispielhaft gezeigt. Ziel ist eine Begrüßung "Hallo, `<Name>`." zu erhalten:

1. Hinzufügen zu "high level" Konfigurationsdatei

    `server/graph/schema.graphqls`
    ```bash
    # ...

    type Query {
        greet(name: String!): String!
        # ...
    }

    # ...
    ```
2. Generieren der Typen und Funktion
    ```bash
    cd server
    go run github.com/99designs/gqlgen generate
    ```
3. Die zu implementierende Funktion bearbeiten (generiert in 2.)

    `server/graph/schema.resolvers.go`
    ```go
    // ...

    func (r *queryResolver) Greet(ctx context.Context, name string) (string, error) {
        return fmt.Sprintf("Hallo, %s.", name), nil
    }

    // ...
    ```
4. Jetzt kann vom Frontend eine entsprechende Query gestartet werden (s. 2.2.1.2)

#### 2.2.2.3 Datenbankanbindung
Zur Anbindung der Datenbank kommt das Object-Relational Mapping (ORM) [`bun`](https://bun.uptrace.dev/) zum Einsatz, ein leistungsstarkes Tool, das die Interaktion mit PostgreSQL stark vereinfacht. Die Initialisierung der Datenbankverbindung sowie grundlegende Konfigurationsarbeiten werden im Modul `server/db/` durchgeführt. Dieses Modul beinhaltet nicht nur den Aufbau der Verbindung, sondern auch die Migration des Datenbankschemas und das Einfügen von Testdaten. Solche Testdaten dienen der lokalen Entwicklungs- und Testumgebung und ermöglichen es, neue Funktionen effizient zu evaluieren.

Für die Weiterentwicklung der Software empfiehlt es sich, sich am bestehenden Schema in der Datei `server/graph/schema.resolvers.go` zu orientieren. Diese Datei enthält bereits implementierte Queries und Mutations, die als Vorlagen dienen können, um neue Funktionalitäten konsistent und wartbar hinzuzufügen. Es ist dabei ratsam, Datenbankanfragen primär in dieser zentralen Datei zu definieren, um eine übersichtliche und einheitliche Codebasis zu gewährleisten.

Sollten komplexere oder wiederverwendbare Funktionen benötigt werden, wie beispielsweise Passwort-Hashing oder datenbankunabhängige Logiken, sollten diese in eigene Module ausgelagert werden. Ein Beispiel hierfür ist das Modul `server/password/`, das alle notwendigen Funktionen für die sichere Verarbeitung und Verwaltung von Passwörtern bereitstellt. Eine ähnliche Struktur kann auch für andere funktionale Bereiche übernommen werden, um die Übersichtlichkeit und Wiederverwendbarkeit zu fördern.

#### 2.2.2.4 Sicherheit

Das Backend implementiert alle standardmäßigen Methoden zur datenschutzkonformen und sicheren Speicherung von Passwörtern sowie Nutzerdaten.

- **Speicherung**: Passwörter werden sowohl mit *Salt* als auch *Pepper* versehen und gehashed gespeichert. Der *Pepper* ist als Umgebungsvariable anzugeben
- **Kommunikation**: Das serverseitige Docker-Netzwerk ist nach dem *Zero Trust* Prinzip gebaut, jegliche Kommunikation ist demnach via *mTLS* durch self-signed Zertifikate gesichert.

### 2.2.3 Datenbank: [PostgreSQL](https://www.postgresql.org/)
PostgreSQL ist ein leistungsstarkes und SQL-konformes relationales Datenbanksystem mit Unterstützung für erweiterte Funktionen wie JSON-Speicherung und Volltextsuche, was Flexibilität bei der Datenmodellierung ermöglicht.

#### 2.2.3.1 ER-Diagram
Die wichtigsten Eigenschaften dargestellter Entitäten werden hier erläutert:
- `events`: Die Software unterscheidet zwischen zwei Arten von Events. Zunächst jene im folgenden als *Umbrella-Event* bezeichnet, und Events, welche zu einem *Umbrella-Event* gehören. Einfacher ausgedrückt, sprechen wir hier von Veranstaltungen, welche zu einem Vorkurs gehören.
    - Ein Tutorium ist *kein* `Event`. Es handelt sich um eine ternäre Beziehung aus Tutor, Raum und Event.
- `rooms`: Räume existieren nur mit refereziertem `Building`. Der Primärschlüssel setzt sich daher zusammen aus Raum-`number` und `building_id`.

![Datenbankmodell](pics/pepp-er.jpg)

# 3 Hauptfunktionen

## 3.1 Stundenplan
Der Stundenplan ist das zentrale Element dieser Software. Es handelt sich um die Landingpage und ist die Schnittstelle zwischen Organisatoren und Studenten.

Folgende Abbildung beinhaltet (v.o.): 
- den Header (v.l.) mit dem Logo, einer Veranstaltungssuche, Auswahl der Seitendarstellung (Hell, Dunkel) und dem Nutzerlogin.
- die Vorkurswahl in Form eines Dropdownmenüs.
- Filterkriterien sowie ein sich dynamisch verändernder Link aufgrund des eingestellten Vorkurses und der Filter. Dieser kann kopiert und bspw. in den Outlook-Kalender eingefügt werden, um Veranstaltungen dort verfügbar zu haben.
- den Stundenplan mit Veranstaltungen gruppiert nach Woche (horizontal) und Tag (vertikal).

![Stundenplan](pics/pepp-planner.png)

Auf folgender Abbildung ist die Ansicht eines Admin-Nutzers, eingetragen in einem Tutorium der Veranstaltung *'Algorithmen und Datenstrukturen'* zu sehen. Unabhängig davon kann über ein zusätzliches Panel (parallel zur Vorkurswahl), der gesamte Vorkurs bearbeitet werden.

![Stundenplan](pics/pepp-planner-admin.png)

## 3.2 Veranstaltungssuche
Die Veranstaltungssuche erleichtert das Auffinden spezifischer Veranstaltungen anhand verschiedener Filterkriterien wie Titel, Dozent oder Datum. Die Suchfunktion implementiert *Fuzzy finding*, d.h. Abkürzungen wie *'alda'* führen zum Suchergebnis *'Algorithmen und Datenstrukturen'*. Diese Funktion ist besonders nützlich für Organisatoren, die gezielt nach Veranstaltungen suchen, und für Studenten, die sich über einzelne Veranstaltungen informieren möchten.

![Veranstaltungssuche](pics/pepp-search.png)

## 3.3 Tutorien

### 3.3.1 An- bzw. Abmeldung
Studenten können sich über eine intuitive Benutzeroberfläche für Tutorien an- oder abmelden. In der Detailansicht einer Veranstaltung werden alle relevanten Informationen wie Zeit, Ort und verfügbare Plätze angezeigt. Dies ermöglicht eine einfache Verwaltung der Teilnahme.

![Event Nahansicht](pics/pepp-event-dialog.png)

### 3.3.2 Flexible Bearbeitung
Organisatoren können Tutorien flexibel anpassen, beispielsweise Änderungen an Zeiten, Räumen oder Teilnehmerkapazitäten vornehmen. Die Bearbeitungsfunktion ist so gestaltet, dass Aktualisierungen ohne großen Aufwand umgesetzt werden können.

![Event bearbeiten](pics/pepp-event-dialog-edit.png)

## 3.4 Registrierung zu Vorkursen
Die Registrierung ermöglicht es, kapazitätsbegrenzte Vorkurse für jene verfügbar zu machen, welche diese am ehesten benötigen. Über ein Formular wird zunächst Wissen abgefragt. Je weniger man weiß, umso mehr Punkte bekommt man. Zur Anlegung eines Quizes stehen drei verschiedene Komponenten zur Verfügung:
- Slider: Setzen des Sliders auf eine Zahl zwischen zwei Werten ("auf einer Skala von 1-10, wie viel Programmiererfahrung hast du?")
- Multiple Choice
- Single Choice

Später können dann beispielsweise die Top 80 zugelassen werden.

![Registrierung](pics/pepp-registration.png)

## 3.5 ICS-Kalender
Alle geplanten Veranstaltungen können in Form eines ICS-Kalenders exportiert werden. Dadurch können Studenten ihre persönlichen Zeitpläne in Kalenderanwendungen wie Outlook oder Google Kalender integrieren und behalten somit stets den Überblick über ihre Termine.

## 3.6 E-Mail Kommunikation
Um alle Beteiligten stets informiert zu halten, versendet *pepp* Mails. Auf folgender Abbildung sieht man beispielsweise eine Benachrichtigung an einen Tutor, nachdem dieser einer Veranstaltung zugewiesen wurde.

![Tutorium Zuweisung](pics/pepp-assignment-mail.png)

# 4. Deployment
1. Umgebungsvariablen angeben in `.env.local`
    ```bash
    cp .env .env.local
    ```
    Das Backend verschickt E-Mails. Dafür wird ein `SMTP-Server` benötigt, z.B.:
    ```bash
    SMTP_HOST=smtp.example.de
    SMTP_USER=example@example.de
    SMTP_PASSWORD=1234
    SMTP_PORT=465
    FROM_ADDRESS=vorkurs@example.de
    ```
2. OpenTelemetry-Collector-Konfiguration `otel-collector-config.yaml` anpassen ([mehr Infos](https://opentelemetry.io/docs/collector/configuration/#basics))
3. mTLS-Zertifikate generieren: `./gen_certs.sh`
4. Docker-Image bauen: `docker compose build`
5. Starten: `docker compose up -d && docker compose logs -f`

# 5. Weiterentwicklung und Ausblick
- Overbooking
- Mailman 3 API
- Drittanbiederauthentifizierungsservices

# 6. Fazit
Die vorgestellte Softwarelösung *pepp* adressiert effektiv die organisatorischen Herausforderungen der Verwaltung von Vorkursen für Erstsemester. Durch eine Kombination aus intuitiver Benutzeroberfläche, modularer Architektur und Funktionen wie Veranstaltungsplanung, Raumverwaltung, Tutorienmanagement und Anmeldesystem bietet die Anwendung eine umfassende Plattform zur Optimierung wiederkehrender Prozesse.  

Besonders hervorzuheben sind die Sicherheitsmaßnahmen wie mTLS-basierte Kommunikation und sichere Passwortspeicherung sowie die Integration moderner Technologien wie GraphQL und Next.js, die eine hohe Flexibilität und Skalierbarkeit garantieren. Funktionen wie der ICS-Kalenderexport und automatisierte E-Mail-Benachrichtigungen fördern zusätzlich die Nutzerfreundlichkeit und steigern die Effizienz im Umgang mit Veranstaltungen.  

Dennoch gibt es Potenzial zur Weiterentwicklung. Funktionen wie ein erweitertes Overbooking-Management oder zusätzliche Anbindungen an weitere Authentifizierungsservices könnten den Funktionsumfang erweitern und die Anwendung noch attraktiver machen. Insgesamt stellt *pepp* eine solide Basis für die langfristige Qualitätssicherung und Verbesserung der Vorkursverwaltung dar, mit der Perspektive, in Zukunft auch weitere universitäre Organisationsprozesse zu unterstützen.
