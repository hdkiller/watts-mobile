## ADDED Requirements

### Requirement: Chat room deep link targets room
Paths `/chat/:roomId` (scheme and universal `/go/chat/:roomId`) SHALL open Coach with that room selected when the room exists for the athlete.

#### Scenario: Open chat room by id
- **WHEN** the app receives `coachwatts://chat/<roomId>` for a room the athlete can access
- **THEN** navigation lands on Coach and that room becomes active

#### Scenario: Chat without room id
- **WHEN** the app receives `coachwatts://chat` or `coachwatts://coach`
- **THEN** navigation lands on Coach and the session open policy selects or creates a room
