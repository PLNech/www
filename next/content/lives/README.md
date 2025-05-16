# ParVagues Live Events System

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install marked prismjs react-masonry-css
   ```

2. **Create a new event**:
   ```bash
   # Create markdown file in appropriate year directory
   # Follow the _template.md format
   cp content/lives/_template.md content/lives/2025/my-event-YYYY-MM-DD.md
   ```

3. **Add images**:
   ```bash
   # Create directory matching event slug
   mkdir -p public/images/parvagues/lives/2025/my-event-YYYY-MM-DD/
   # Add jpg/png/gif/webp files to this directory
   ```

4. **Test locally**:
   ```bash
   npm run dev
   # Visit: http://localhost:3000/parvagues
   # Check: http://localhost:3000/parvagues/live/my-event-YYYY-MM-DD
   ```

## How it works

### Event Lifecycle
1. **Pre-event**: Shows countdown with teasings based on days remaining
   - J-14+: teasing1
   - J-7 to J-3: teasing2
   - J-3 to event: teasing3
   
2. **Post-event**: Shows full content with:
   - Video/audio links (if provided)
   - Image gallery (automatic)
   - Collapsible teasings (for nostalgia)

### Event Metadata Structure
```yaml
---
title: "Event Title"
date: "2025-05-22"
time: "18:30-20:00"
location: "Venue Name"
address: "Full Address"
description: "Brief description"
ctaURL: "https://..."
ctaText: "RSVP"
# ... teasings, video, audio etc.
---
```

### File Structure
```
content/lives/
├── 2025/
│   ├── ensad-2025-05-22.md
│   └── algorave-lyon-2025-XX-XX.md
└── 2022/
    └── (historical events)

public/images/parvagues/lives/
├── 2025/
│   ├── ensad-2025-05-22/
│   │   ├── photo1.jpg
│   │   └── photo2.jpg
│   └── algorave-lyon-2025-XX-XX/
└── 2022/
    └── (historical images)
```

## URL Structure
- Landing: `/parvagues`
- Event page: `/parvagues/live/[slug]`
- Slug format: `event-name-YYYY-MM-DD`

## URL Shortener Integration
Create short URLs for events:
- `nech.pl/ensad` → `/parvagues/live/ensad-2025-05-22`
- `nech.pl/lyon` → `/parvagues/live/algorave-lyon-2025-XX-XX`

## Development Notes
- Page regenerates every minute for countdown accuracy
- Images are loaded dynamically from filesystem
- Support markdown in all text fields
- Code blocks use Haskell syntax highlighting
