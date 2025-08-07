# Screenings API Structure

This directory contains the API layer for managing speech and hearing screenings.

## File Structure

- `screenings.ts` - Main combined API that provides unified access to both speech and hearing screenings
- `speechscreenings.ts` - Speech-specific screening API
- `hearingscreenings.ts` - Hearing-specific screening API

## Usage

### Combined API (Recommended)

```typescript
import { screeningsApi } from '@/api/screenings'

// Get all screenings (both speech and hearing)
const allScreenings = await screeningsApi.getScreeningsList(userId, role, orgId)

// Speech-specific operations
const speechScreenings = await screeningsApi.getSpeechScreeningsList(userId, role, orgId)
const newSpeechScreening = await screeningsApi.createSpeechScreening(data)

// Hearing-specific operations
const hearingScreenings = await screeningsApi.getHearingScreeningsList(userId, role, orgId)
const newHearingScreening = await screeningsApi.createHearingScreening(data)
```

### Direct API Access

```typescript
import { speechScreeningsApi, hearingScreeningsApi } from '@/api/screenings'

// Direct access to speech API
const speechScreenings = await speechScreeningsApi.getSpeechScreeningsList(userId, role, orgId)

// Direct access to hearing API
const hearingScreenings = await hearingScreeningsApi.getHearingScreeningsList(userId, role, orgId)
```

## Data Transformation

Both APIs transform raw database data into a unified `Screening` interface:

- **Raw Data**: Contains IDs and joined data from related tables
- **Transformed Data**: Contains human-readable names and calculated results

### Speech Screenings

- Raw result strings → Categorized results
- Error patterns → Structured display data
- Joined student/screener data → Formatted names

### Hearing Screenings

- Volume measurements → Calculated severity levels
- Raw dB values → Pass/fail results with severity
- Joined data → Formatted names and metadata

## Role-Based Access

- **SLPs**: Can only see their own screenings within their organization
- **Admins**: Can see all screenings across their organization
- **Organization Isolation**: Data is filtered by organization boundaries
