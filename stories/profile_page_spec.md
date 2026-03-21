# 🧩 TechSpec: Profiles Page with Reader Summaries
**ID:** PROFILE-PAGE-001  
**Service:** Book App - Profiles
---

## User Story
**Primary User Persona:** Reader using the Book App owner context
**Core Story:**
> As a `reader using the Book App owner context`, I want `a dedicated profiles page that lists readers and how many books they have read` so that `I can quickly browse personal reading summaries across the app`.
**Additional Scenarios:**
- As a reader navigating across the app, I want to open the profiles page from the primary navigation so that I can browse reader summaries without leaving the main experience.
- As a first-time or low-activity reader, I want the page to show a valid zero state when I have not read any books yet so that the page still feels intentional and complete.
- As a reader who updates my display name in Settings, I want the profile page to reflect the latest name so that my identity remains consistent across the app.
- As a reader experiencing a backend issue, I want the page to continue showing my known name and a non-blocking fallback for the count so that the screen remains useful.
**Acceptance Criteria:**
- The frontend exposes a dedicated `/profiles` route and a primary navigation entry for the profiles page.
- The frontend supports viewing another reader profile through `/profiles/:userId`.
- The profiles page lists all known readers with their display names and books-read counts.
- The profiles feature uses an explicit collection contract for the overview page and a detail contract for `/profiles/:userId`.
- The overview and detail pages support loading, empty or zero-data, success, not-found, and error/fallback states where applicable.
- The profiles feature is read-only in this story; name editing remains in Settings.
---

## 🧩Key Functional Requirements
### Functional Requirements
- Add a new frontend feature for profile-related UI under `frontend/src/features/profile/`.
- Add a new route at `/profiles` and expose it in the shared primary navigation.
- Add a route at `/profiles/:userId` for viewing another reader's profile summary.
- Render a profiles overview page that lists all known readers with display name and total books-read count.
- Introduce a read-only backend profiles collection endpoint, proposed as `GET /api/v1/profiles`.
- Introduce a read-only backend endpoint for one reader profile, proposed as `GET /api/v1/profiles/{userId}`.
- The backend response must include at minimum `userId`, `displayName`, and `booksReadCount`.
- The collection endpoint should return an empty list when no reader summaries exist.
- The detail page must remain viewable when the summary request fails by rendering a non-blocking fallback message.
- This story does not add profile editing in the profiles feature; the existing Settings flow remains the single place for changing the display name.
- The backend implementation should follow the repository's feature-based clean architecture under `backend/src/main/kotlin/com/bookapp/features/profile/`.
- Current-reading cards should expose a navigation path to the matching reader detail page.

### Main Flow (step-by-step)
1. A reader opens the app and navigates to `/profiles`.
2. The primary navigation highlights the Profiles entry.
3. The profiles page renders its shell and starts loading the reader summaries collection.
4. The frontend sends `GET /api/v1/profiles`.
5. The backend resolves all known reader summaries and returns them in a deterministic order.
6. The frontend renders the reader cards with display name, user id, books-read count, and a link to each reader detail page.
7. If the backend returns an empty collection, the page renders an explicit empty state.
8. If the backend request fails, the page renders a non-blocking fallback state instead of collapsing the layout.

### Additional Flow: Viewing Another Reader Profile
1. A reader opens a profile detail route such as `/profiles/reader-22`, for example from a current-reading card or the profiles overview page.
2. The frontend extracts `reader-22` from the route.
3. The frontend sends `GET /api/v1/profiles/reader-22`.
4. The backend resolves the requested reader's stored profile summary.
5. The frontend renders that reader's display name and books-read count in a read-only state.
6. If the requested reader profile is unknown, the backend returns `404` and the frontend renders a not-found state.

#### Sequence Diagram
```plantuml
@startuml
actor Reader
participant Nav as App Navigation
participant Frontend as Profiles Page
participant Backend as Profiles API
participant Domain as Profiles Use Cases
participant Store as Profile Summary Store
Reader -> Nav: Open /profiles
Nav -> Frontend: Render profiles overview route
Frontend -> Backend: GET /api/v1/profiles
Backend -> Domain: Load all reader summaries
Domain -> Store: List known reader summaries
Store --> Domain: Reader summaries
Domain --> Backend: Profiles response
Backend --> Frontend: { items: [{ userId, displayName, booksReadCount }] }
Frontend --> Reader: Render reader summary cards
@enduml
```

### Inputs (explicit and structured)
| Field | Type | Example | Required | Constraints |
|-------|------|---------|----------|-------------|
| route | string | `/profiles` | Yes | Fixed overview route for this story |
| profileDetailRoute | string | `/profiles/reader-22` | No | Used when viewing another reader |
| profilesRequest | string | `GET /api/v1/profiles` | Yes | Read-only request for all known reader summaries |
| foreignProfileSummaryRequest | string | `GET /api/v1/profiles/reader-22` | No | Read-only request for another known reader |
| userId | string | `reader-7` | Yes | Profile identifier returned in overview and detail responses |
| displayName | string | `Reader Seven` | Yes | Display name returned in overview and detail responses |
| booksReadCount | integer | `12` | Yes | Must be `>= 0` |

### Outputs
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| items | array | Collection of reader summaries returned for the profiles overview | `[{"userId":"reader-7","displayName":"Reader Seven","booksReadCount":12}]` |
| userId | string | Identifier of the reader whose summary is being shown | `reader-7` |
| displayName | string | Display name shown on the profiles overview or detail page | `Reader Seven` |
| booksReadCount | integer | Total number of books read by the reader in Book App | `12` |
| state | string | UI state of the profiles overview or detail page | `loading`, `success`, `empty`, `zero`, `fallback`, `not-found` |
| message | string | Helper or fallback text shown to the reader | `No reader summaries yet.` |

Example Output:
```json
{
  "items": [
    {
      "userId": "reader-7",
      "displayName": "Reader Seven",
      "booksReadCount": 12
    }
  ]
}
```

### Error Cases
| Error Scenario | HTTP Status Code | Response Behavior | Details |
|----------------|------------------|-------------------|---------|
| No reader summaries exist yet | 200 | Frontend renders an empty overview state | Applies to `GET /api/v1/profiles` when the collection is empty |
| Profiles collection retrieval fails because of server or network issues | 500 / network error | Frontend shows a non-blocking fallback message for the overview page | The page shell should remain visible |
| Requested reader profile does not exist | 404 | Frontend renders a profile not found state | Applies to `/profiles/:userId` for unknown readers |
| Backend returns an invalid negative count | 500 or defensive fallback | Frontend avoids showing misleading values and falls back safely | Negative values must never be rendered as valid counts |
|

### 🧩Non-Functional Requirements
- **Performance:** The profile summary should load within the same perceived interaction budget as existing page-level queries in the app.
- **Scalability:** The profile contract should remain small and focused so that future profile attributes can be added without breaking the initial page layout.
- **Security:** The app continues to use local owner context headers instead of full authentication for this story.
- **CORs:** CORs are not required. These are handled by the BBF gateway.
- **Accessibility:** The page must provide clear headings, readable numeric content, and accessible loading and fallback messages.

### Artifacts and External Specs
- Story template source: `templates/story_spec_template.md`
- App routing entry point: `frontend/src/app/router.tsx`
- Shared app shell and navigation: `frontend/src/shared/layout/AppShell.tsx`
- Local owner context source: `frontend/src/shared/auth/AuthProvider.tsx`
- Existing owner settings flow: `frontend/src/features/settings/pages/SettingsPage.tsx`
- API contract location: `docs/api.yml`
- Proposed backend feature location: `backend/src/main/kotlin/com/bookapp/features/profile/`
- Project overview and setup guide: `README.md`

## Frontend Requirements

### UI Design
- Keep profile-specific UI, hooks, services, state, and tests inside `frontend/src/features/profile/`.
- Add a dedicated Profiles navigation item without weakening the current information architecture of `Current reading` and `Settings`.
- Show the profiles overview as a readable collection of reader summary cards with clear links to detail routes.
- Render loading, success, empty, and fallback states without collapsing the page layout.
- Keep reader detail pages read-only; do not add editing controls in the profiles feature.
- Link reader identities in current-reading cards and overview cards to their matching profile detail routes.
Illustrative layout:
```text
Profiles Page
+-----------------------------------------------------------+
| Profiles                                                  |
| Browse all reader summaries.                              |
|                                                           |
| +--------------------+  +--------------------+            |
| | Reader Seven       |  | Reader Eight       |            |
| | 12 books read      |  | 4 books read       |            |
| | /profiles/reader-7 |  | /profiles/reader-8 |            |
| +--------------------+  +--------------------+            |
|                                                           |
| Empty / fallback message area                             |
+-----------------------------------------------------------+
```

## Open Questions
- What exactly should `booksReadCount` represent?
  - Use the total number of books a reader has read in Book App, not the current active reading post count.

- Should the profiles feature allow users to edit their display name?
  - No, keep overview and detail pages read-only and continue using `Settings` as the single editing surface.

- Should readers be able to view other users' profiles in this story?
  - Yes, through `/profiles/:userId` backed by `GET /api/v1/profiles/{userId}`.

---   

## Definition of Done Checklist

### Documentation
- [ ] OpenAPI Spec updated with endpoint definition
- [ ] Sequence diagram and data model added to `/docs/` in PlantUML format
- [ ] README updated with endpoint examples
- [ ] Inline code documentation (JavaDoc) complete
### Quality
- [ ] Unit tests: 90%+ coverage for new code
- [ ] Integration tests: all main flows and error cases covered
- [ ] Code review completed and approved

### Code Review
- [ ] Code Review is completed using the code_review_template.md

## Updates / Issues
- 00001: Readers should be able to view other users' profiles on the profiles page.
- 2026-03-21: Issue `00001` accepted into the story scope by adding support for read-only foreign profile routes and API lookups.
- 00002: The profile page should be renamed to profiles page that lists all readers and their summaries.
- 2026-03-21: Issue `00002` accepted into the story scope by introducing a collection-first `/profiles` overview and canonical `/profiles/:userId` detail routes.
