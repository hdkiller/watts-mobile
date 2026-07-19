## ADDED Requirements

### Requirement: Markdown-lite assistant bubbles
Assistant (and system) text parts in Coach SHALL render a constrained markdown-lite subset: at least bold/italic emphasis, unordered/ordered lists, and inline links. User bubbles MAY remain plain text. The renderer MUST NOT execute HTML/scripts from message content.

#### Scenario: Emphasis and lists
- **WHEN** an assistant message contains markdown emphasis or list markers
- **THEN** the bubble renders them with readable formatting rather than raw markers only

#### Scenario: Inline link
- **WHEN** an assistant message contains a markdown or bare https link
- **THEN** the user can open the link via the system browser or in-app linking rules

#### Scenario: No HTML execution
- **WHEN** message text includes raw HTML tags
- **THEN** the app does not interpret them as executable UI/script

### Requirement: Preserve existing non-text parts
Rich text rendering MUST NOT strip image `file` parts, tool-approval controls, or tool summary cards from the same message.

#### Scenario: Text plus image
- **WHEN** an assistant or user message has both text and an image file part
- **THEN** both the formatted text and the image remain visible
