# coach-chat-media Specification

## Purpose
TBD - created by archiving change coach-chat-sessions-and-media. Update Purpose after archive.
## Requirements
### Requirement: Attach photos from camera or library
The Coach composer SHALL let the athlete attach photos from the device camera and photo library for the active room.

#### Scenario: Pick from library
- **WHEN** the user chooses photo library and selects one or more images
- **THEN** those images appear as pending attachments on the composer before send

#### Scenario: Take photo
- **WHEN** the user chooses camera, grants permission, and captures a photo
- **THEN** the photo appears as a pending attachment on the composer

#### Scenario: Permission denied
- **WHEN** the user denies camera or library permission
- **THEN** the app explains the limitation and leaves text chat usable

### Requirement: Upload attachments with Bearer auth
Pending image attachments SHALL upload via a Bearer-capable storage upload API on the configured instance before send, using credentials already held by the app.

#### Scenario: Successful upload
- **WHEN** the user sends a message that includes pending photos
- **THEN** each photo is uploaded and the send payload includes `file` parts with URL, media type, and filename

#### Scenario: Upload failure
- **WHEN** an upload fails
- **THEN** the user sees an error, can retry or remove the attachment, and no partial silent send occurs for that failed file

### Requirement: Attachment-only send
The system SHALL allow sending a message that contains attachments without text, matching web chat behavior.

#### Scenario: Photo-only send
- **WHEN** the user sends one or more uploaded photos with an empty text field
- **THEN** the message is posted to `POST /api/chat/messages` and appears in the thread

### Requirement: Render image attachments in the thread
The Coach message list SHALL render image `file` parts from history and live updates, not text-only.

#### Scenario: History with photos
- **WHEN** loaded messages include image file parts
- **THEN** those images are visible in the corresponding bubbles

### Requirement: Attachment limits
The client SHALL enforce a maximum of 4 image attachments per outgoing message and SHALL reject unsupported types before upload.

#### Scenario: Too many attachments
- **WHEN** the user tries to attach a fifth image
- **THEN** the app blocks the add and explains the limit

