## ADDED Requirements

### Requirement: Assistant messages use rich rendering
The Coach tab SHALL render assistant text through `coach-chat-rich-messages` rules while keeping the existing send, rooms, attachments, and seeding behavior.

#### Scenario: Formatted coach reply
- **WHEN** the coach returns a multi-line markdown explanation
- **THEN** the Coach tab shows formatted text in the assistant bubble
