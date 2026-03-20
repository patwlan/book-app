# AGENTS.md

## Purpose
This file defines the mandatory engineering guardrails for contributors and coding agents working in this repository.

## Tech Stack
- **Frontend:** React + Tailwind CSS
- **Backend:** Kotlin + Spring Boot

## Coding Standards
- Follow **Clean Code** principles in every change.
- Follow **Clean Architecture** boundaries in frontend and backend design.
- Prefer small, cohesive modules with clear naming and explicit responsibilities.
- Keep business logic independent from UI, framework, and infrastructure details where applicable.
- Avoid hidden side effects, dead code, speculative abstractions, and cross-layer leakage.

## Folder Structure
Use a **feature-based folder structure**.

### Frontend
- Place feature code under `frontend/src/features/<feature>/`
- Place shared reusable code under `frontend/src/shared/`
- Prefer feature-local components, hooks, services, state, and tests before introducing shared modules

Example:
```text
frontend/
└── src/
    ├── features/
    │   └── <feature>/
    │       ├── components/
    │       ├── hooks/
    │       ├── pages/
    │       ├── services/
    │       ├── state/
    │       └── tests/
    └── shared/
```

### Backend
- Place backend feature code under `backend/src/main/kotlin/.../features/<feature>/`
- Separate concerns by role when applicable:
  - `domain/`
  - `application/`
  - `infrastructure/`
  - `web/`
- Keep dependencies pointing inward toward domain and application logic

Example:
```text
backend/
├── src/main/kotlin/.../
│   └── features/
│       └── <feature>/
│           ├── domain/
│           ├── application/
│           ├── infrastructure/
│           └── web/
└── src/test/kotlin/
```

## Documentation Rules
- All documentation MUST be written in **English**.
- The repository MUST maintain a top-level `README.md`.
  - The `README.md` MUST include a project description, setup instructions, and a high-level overview of the architecture and tech stack.
  - Add curl examples for API endpoints where applicable.
- Backend API changes MUST be reflected in an **OpenAPI specification**.
  - The OpenAPI spec MUST be stored under docs/api.yml
- Feature work SHOULD update documentation whenever behavior, setup, contracts, or architecture changes.
- All classes should include KDoc comments describing their purpose and public API.

## Delivery Expectations
- Write tests before implementing behavior changes.
- Keep frontend/backend contracts explicit and version-aware.
- Update relevant documentation together with the code change.
- Do not introduce frameworks or structural exceptions that conflict with the project constitution.

## Developing new Features
- Use the tech_spec_template.md to define new features.
