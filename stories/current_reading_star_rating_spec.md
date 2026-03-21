# 🧩 TechSpec: Star Icon Rating for Current Reading
**ID:** CUR-STAR-RATING-001  
**Service:** Book App - Current Reading
---

## User Story

**Primary User Persona:** Reader sharing a current book update

**Core Story:**
> As a `reader sharing a current book update`, I want `to choose and view ratings with star icons instead of a plain numeric field` so that `rating a book feels faster, clearer, and more intuitive`.

**Additional Scenarios:**
- As a reader editing my own post, I want the previously selected rating to be preselected as stars so that I can adjust it without re-entering a number.
- As a visitor browsing the feed, I want to understand each rating at a glance so that I can compare opinions quickly.
- As a keyboard or screen-reader user, I want the star rating control to remain accessible so that I can rate books without relying on a pointer device.

**Acceptance Criteria:**
- The create and edit form replaces the numeric rating field with a star-based rating control for values 1 through 5.
- Selecting a star updates the underlying rating value that is submitted to the existing API contract as an integer from 1 to 5.
- Existing ratings are displayed in the feed using star icons with accessible text that communicates the numeric value.
- The star rating control supports mouse, touch, keyboard, and screen-reader interaction.
- Validation and error handling remain consistent with the current rule that ratings must be between 1 and 5.

---

## 🧩Key Functional Requirements

### Functional Requirements

- Replace the current numeric rating input in the current-reading form with a five-star selection control.
- Keep the stored and transmitted rating model as an integer from 1 to 5; this story changes presentation and interaction, not rating semantics.
- Preselect the saved rating in edit mode and the default rating in create mode.
- Display star icons for persisted ratings in current-reading cards while preserving a clear textual rating label for accessibility.
- Provide visible hover, focus, and selected states so users can understand which rating will be chosen or has been chosen.
- Ensure the star rating control can be operated using keyboard navigation and announced correctly by assistive technologies.
- Preserve existing success, validation, and server-error messaging when a post is created or updated.

### Main Flow (step-by-step)

1. A reader opens the current-reading page.
2. The form renders the rating field as five selectable stars with a default selected value.
3. The reader enters a book title and selects a star rating.
4. The frontend stores the selected star as the existing numeric `rating` field.
5. The frontend submits the current-reading payload to the existing backend endpoint.
6. The backend validates and persists the integer rating without any contract change.
7. The frontend refreshes the feed after a successful mutation.
8. The feed renders the saved rating using filled and unfilled star icons plus an accessible textual description.

#### Sequence Diagram
```plantuml
@startuml
actor Reader
participant Frontend as Current Reading Form
participant Backend as Current Reading API
participant DB as Current Reading Store
participant Feed as Current Reading Feed

Reader -> Frontend: Open page
Frontend --> Reader: Render title input + 5-star rating control
Reader -> Frontend: Select 4 stars and submit
Frontend -> Backend: POST/PUT { bookTitle, rating: 4 }
Backend -> DB: Persist rating integer
DB --> Backend: Saved post
Backend --> Frontend: CurrentReadingPost response
Frontend -> Feed: Refresh current-reading items
Feed --> Reader: Render saved post with 4 filled stars
@enduml
```

### Inputs (explicit and structured)
| Field | Type | Example | Required | Constraints |
|-------|------|---------|----------|-------------|
| bookTitle | string | `The Left Hand of Darkness` | Yes | Must satisfy existing current-reading title validation |
| rating | integer | `4` | Yes | Must remain an integer between `1` and `5` |
| formMode | string | `create` | Yes | Allowed values: `create`, `edit` |
| interactionMethod | string | `mouse` | No | Allowed values may include `mouse`, `touch`, `keyboard`, `screen-reader` |
| existingRating | integer | `3` | No | Used to preselect stars in edit mode |

### Outputs
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| rating | integer | Selected rating value preserved for API submission and persistence | `4` |
| filledStars | integer | Number of visually filled stars shown for the selected or persisted rating | `4` |
| emptyStars | integer | Number of remaining unfilled stars shown out of 5 | `1` |
| accessibleRatingLabel | string | Assistive text describing the selected or displayed rating | `4 out of 5 stars` |
| statusMessage | string | Existing success or error feedback shown after submit | `Saved your current read.` |

Example Output:
```json
{
  "bookTitle": "The Left Hand of Darkness",
  "rating": 4,
  "filledStars": 4,
  "emptyStars": 1,
  "accessibleRatingLabel": "4 out of 5 stars"
}
```

### Error Cases

| Error Scenario | HTTP Status Code | Response Behavior | Details |
|----------------|------------------|-------------------|---------|
| User attempts to submit without a valid rating | 400 (client validation) | Frontend blocks submission and shows inline validation message | Validation rule remains `1` to `5` |
| Backend rejects the payload because rating is out of range | 400 | Frontend shows the returned error message and keeps the selected stars visible | Prevent losing user input after failure |
| Submission fails due to a server or network issue | 500 / network error | Frontend shows the existing non-success error banner | Selected stars and title input should remain intact |
| Persisted feed item contains an unexpected rating value | 200 with invalid data | Frontend falls back to safe text handling and avoids rendering misleading star states | Should be treated as defensive UI handling, not a normal business path |
|

### 🧩Non-Functional Requirements

- **Performance:** The star-based control should not introduce a noticeable delay compared with the current numeric input interaction.
- **Scalability:** The solution should remain reusable for other 1-to-5 rating displays without forcing shared abstractions before a second valid use case exists.
- **Security:** Authentication is not required.
- **CORs:** CORs are not required. These are handled by the BBF gateway.
- **Accessibility:** The rating control must expose clear labels, focus order, and state announcements for assistive technologies.

### Artifacts and External Specs

- Story template source: `templates/story_spec_template.md`
- Current-reading form UI: `frontend/src/features/current-reading/components/CurrentReadingForm.tsx`
- Current-reading feed card UI: `frontend/src/features/current-reading/components/CurrentReadingCard.tsx`
- Current-reading form schema: `frontend/src/features/current-reading/services/currentReadingFormSchema.ts`
- Frontend/API contract reference: `docs/api.yml` (no contract change expected for this story because the submitted `rating` remains numeric)
- Project setup and architecture overview: `README.md`

## Frontend Requirements

### UI Design
- Keep the implementation inside `frontend/src/features/current-reading/` unless a second feature proves a shared star-rating primitive is needed.
- Render the rating selector as a clear five-option star control with one obvious selected state.
- Preserve the existing form layout and messaging while replacing only the rating interaction pattern.
- Show persisted ratings in each feed card as stars plus readable supporting text for accessibility.
- Ensure the visual design works for create, edit, loading, validation-error, and submission-error states.

Illustrative layout:

```text
Current Reading Form
+-----------------------------------------------------------+
| Book title: [ The Left Hand of Darkness                ]  |
| Rating:     [★][★][★][☆][☆]  3 out of 5 stars           |
|             Helper text / validation message             |
| [Share current read]                                     |
+-----------------------------------------------------------+

Current Reading Card
+-----------------------------------------------------------+
| The Left Hand of Darkness                    ★★★★☆        |
| Ai Reader · user-2                                         |
| Posted Mar 21, 2026                                        |
+-----------------------------------------------------------+
```

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

- 2026-03-21: Initial story-based feature specification created for replacing numeric current-reading ratings with accessible star icon interactions and display states.
