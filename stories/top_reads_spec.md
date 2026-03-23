# 🧩 TechSpec: Main Page Hero Panel for Top Current Reads
**ID:** HERO-TOP-BOOKS-001  
**Service:** Book App - Current Reading
---

## User Story

**Primary User Persona:** Visitor browsing the main page

**Core Story:**
> As a `visitor browsing the main page`, I want `a hero panel that highlights the top 3 books currently being read` so that `I can immediately see which books are most popular right now without scanning the entire feed`.

**Additional Scenarios:**
- As a returning visitor, I want the hero panel to update when current reading activity changes so that the highlighted books stay relevant.
- As a visitor, I want ties and low-data situations to be handled consistently so that the panel feels trustworthy.
- As a visitor, I want the page to remain useful when hero data is unavailable so that I can still access the current reading feed.

**Acceptance Criteria:**
- The main page displays a hero panel above the current reading feed.
- The hero panel highlights up to 3 distinct books ranked by how many users are currently reading them.
- Each hero entry shows the book title and current reader count.
- The ranking is deterministic when two books have the same reader count.
- The page shows a meaningful empty or fallback state when there are fewer than 3 books or when the hero data cannot be loaded.

---

## 🧩Key Functional Requirements

### Functional Requirements

- Display a dedicated hero panel on the main page for featured current reads.
- Aggregate active current reading posts by normalized book title.
- Select the top 3 distinct books by active reader count.
- Show each featured book with title, rank, and number of active readers.
- Apply a deterministic tie-break rule for books with the same reader count.
- Show only available books when fewer than 3 distinct books qualify.
- Display an empty-state message when no current reading posts exist.
- Display a non-blocking fallback message when featured-book data retrieval fails.
- Keep the rest of the main page usable even if the hero panel cannot be populated.

### Main Flow (step-by-step)

1. A visitor opens the main page.
2. The frontend requests featured-book summary data derived from current reading activity.
3. The backend retrieves active current reading posts.
4. The backend normalizes titles and groups posts by book title.
5. The backend ranks grouped books by active reader count and applies a deterministic tie-break rule.
6. The backend returns up to 3 featured books.
7. The frontend renders the hero panel above the existing current reading feed.
8. If the data set is empty or unavailable, the frontend renders the appropriate empty or fallback state.

#### Sequence Diagram
```plantuml
@startuml
actor Visitor
participant Frontend as Main Page
participant Backend as Current Reading API
participant Domain as Ranking Logic
participant DB as Current Reading Store

Visitor -> Main Page: Open main page
Main Page -> Backend: Request featured top books
Backend -> DB: Load active current reading posts
DB --> Backend: Active posts
Backend -> Domain: Normalize titles and rank books
Domain --> Backend: Top 3 featured books
Backend --> Main Page: Featured books response
Main Page --> Visitor: Render hero panel above feed
@enduml
```

### Inputs (explicit and structured)
| Field | Type | Example | Required | Constraints |
|-------|------|---------|----------|-------------|
| pageContext | string | `main-page` | Yes | Must identify the main page hero experience |
| activePosts | array | Current reading posts | Yes | Source data must include only active current reading posts |
| bookTitle | string | `The Hobbit` | Yes | Normalized for grouping, display form preserved for UI |
| readerCount | integer | `4` | Yes | Must be `>= 0` |
| rankingLimit | integer | `3` | Yes | Fixed to top 3 for this feature |

### Outputs
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| featuredBooks | array | Ranked list of up to 3 books currently being read by the most users | `[{"rank":1,"title":"The Hobbit","readerCount":4}]` |
| rank | integer | Position within the hero panel | `1` |
| title | string | Display title of the featured book | `The Hobbit` |
| readerCount | integer | Number of users currently reading the book | `4` |
| state | string | Hero panel rendering state | `success`, `empty`, `fallback` |
| message | string | User-facing helper text for empty or fallback scenarios | `No featured current reads yet.` |

Example Output:
```json
{
  "state": "success",
  "featuredBooks": [
    {
      "rank": 1,
      "title": "The Hobbit",
      "readerCount": 4
    },
    {
      "rank": 2,
      "title": "Dune",
      "readerCount": 3
    },
    {
      "rank": 3,
      "title": "Project Hail Mary",
      "readerCount": 2
    }
  ]
}
```

### Error Cases

| Error Scenario | HTTP Status Code | Response Behavior | Details |
|----------------|------------------|-------------------|---------|
| Featured summary cannot be retrieved | 500 | Frontend shows non-blocking fallback message | The current reading feed should remain available |
| No active current reading posts exist | 200 | Frontend shows empty-state hero message | This is a valid empty result, not an error |
| Fewer than 3 distinct books qualify | 200 | Frontend renders only available featured books | No placeholder cards should be shown |
| Two or more books have the same reader count | 200 | Backend returns deterministic order | Tie-break rule must be stable across repeated loads |
|

### 🧩Non-Functional Requirements

- **Performance:** The hero panel data should load within the same user-perceived page load budget as the main feed and should not noticeably delay rendering.
- **Scalability:** The ranking logic should support growth in current reading activity without requiring changes to the UI contract.
- **Security:** Authentication is not required.
- **CORs:** CORs are not required. These are handled by the BBF gateway.

### Artifacts and External Specs

- Existing current reading feature specification: `specs/003-post-reading-rating/`
- Project API contract location: `docs/api.yml`
- Story template source: `templates/story_spec_template.md`

## Frontend Requirements

- Add the hero panel to the main page above the current reading feed.
- Keep hero-panel UI and tests inside the current-reading frontend feature unless a shared abstraction is clearly needed later.
- Use clear visual hierarchy so the hero panel reads as a summary section, not a replacement for the feed.
- Ensure the hero panel supports success, empty, loading, and fallback states.
- Preserve the usability of the posting form and feed when the hero panel has no data or fails to load.

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

- 2026-03-19: Initial story-based feature specification created for the main-page hero panel that highlights the top 3 books currently being read.

