# Book App

Book App is a feature-based web application with a React + Tailwind CSS frontend and a Kotlin +
Spring Boot backend. The current implementation delivers the **Current Reading Rating** feature:
users can post the book they are currently reading with a rating, browse the active feed, and
edit or delete their own post. The main page also highlights the top three books currently being
read in a hero panel, and the local owner context is managed from a dedicated settings page.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest, Playwright
- **Backend:** Kotlin 2.1, Spring Boot 3.4, Spring Web, Spring Data JPA, Flyway, H2 for local runtime persistence
- **Architecture:** Feature-based Clean Architecture with explicit frontend/backend boundaries

## Architecture Overview

### Frontend

- `frontend/src/app/` contains the application shell and routing
- `frontend/src/features/current-reading/` contains all current-reading-specific UI, hooks, services, state, and tests
- `frontend/src/features/settings/` contains the owner-context settings page and related UI
- `frontend/src/shared/` contains reusable HTTP, query, auth, and layout primitives

### Backend

- `backend/src/main/kotlin/com/bookapp/features/currentreading/domain/` contains the domain model (`CurrentReadingPost`, `Rating`)
- `backend/src/main/kotlin/com/bookapp/features/currentreading/application/` contains use cases and repository ports
- `backend/src/main/kotlin/com/bookapp/features/currentreading/infrastructure/` contains persistence and logging adapters
- `backend/src/main/kotlin/com/bookapp/features/currentreading/web/` contains DTOs and REST controllers
- `backend/src/main/kotlin/com/bookapp/shared/` contains shared authentication, logging, time, and error-handling support

### Main Page Hero Panel

The main page hero panel summarizes the top three books currently being read across all active
current-reading posts. The backend aggregates active posts by normalized book title, ranks the
results by reader count, and returns an additive featured-books summary used by the frontend hero
panel.

## Pragmatic Owner Context

The repository does not include a full authentication system yet. To keep ownership explicit and
consistent, the application uses the following request headers as a minimal owner context:

- `X-User-Id`
- `X-User-Name`

The frontend exposes these values through the owner-context form on the Settings page and
automatically sends them with every API request.

## Local Development CORS

When the frontend runs on a local Vite development or preview server, the backend accepts browser
requests from local loopback origins by default, including fallback ports such as `5174`:

- `http://localhost:*`
- `http://127.0.0.1:*`

If you run the UI from a different origin, override the backend setting in
`backend/src/main/resources/application.yml` through `app.cors.allowed-origin-patterns`.

## Setup

### Prerequisites

- Node.js 24+
- npm 11+
- macOS or another Unix-like environment with `curl` and `unzip`
- A local JDK 21 installation for backend builds

### Frontend

```bash
cd frontend
npm install
npm run build
npm test
npm run test:e2e
```

To run the frontend in development mode:

```bash
cd frontend
npm run dev
```

To start the backend server and the frontend development server together from the repository root:

```bash
./dev.sh
```

The script starts the backend on `http://localhost:8080` and the frontend dev server on
`http://localhost:5173` by default. Stop both processes with `Ctrl+C`.

### Project Overview

The repository includes a generated overview page at `docs/project-overview.html`. It summarizes:

- Kotlin and TypeScript source inventory
- Declared automated test counts across backend and frontend
- Latest backend and frontend line coverage snapshots

Refresh the page and its JSON snapshot from the repository root with:

```bash
bash update-overview.sh
```

### Backend

```bash
cd backend
chmod +x ./gradlew
./gradlew test
./gradlew bootRun
```

The backend uses a self-bootstrapping `gradlew` script that downloads a local Gradle distribution
when needed and prefers a macOS JDK 24 installation automatically.

## API Summary
The canonical OpenAPI contract lives in `docs/api.yml`.

Example request for the main-page featured books summary:

```bash
curl http://localhost:8080/api/v1/current-reading-posts/featured
```

## Verified Commands

The following commands were executed successfully in this workspace during implementation:

```bash
cd frontend
npm install
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## License

This project is licensed under the Apache License 2.0. See the top-level `LICENSE` file for the
full text.


