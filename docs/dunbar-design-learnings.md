# Dunbar MVP v0.1 design

A # DUNBAR Social Network Navigation Assistant Implementation Guide.

## Executive Summary
DUNBAR is a privacy-first relationship management system based on Dunbar's number theory (5/15/50/150) expansion of human ability to nurture relationships -- a kind of social aug mod to multiply yourself. This guide provides stack-agnostic implementation requirements for recreating the validated prototype features.

## Core Data Model

### Friend Entity
```
Friend {
  id: unique_identifier
  name: string
  relationships: Set<friend_id>  // Bidirectional connections
  events: Array<Event>
  lastInteraction: date (computed from events)
}
```

### Event Entity
```
Event {
  id: unique_identifier
  date: date
  notes: string (required)
  location: string (optional)
  participants: Array<friend_id>  // For multi-friend events
}
```

### Persistence Requirements
- **MVP Password**: request browser-based classic password: "freehugs4all"
- **Local Storage**: All data must persist between sessions
- **Data Format**: Serialize Sets to Arrays for storage, reconstruct on load
- **Auto-save**: Save on every state change, no manual save required

## Feature Requirements

### 1. Friends List View
**Purpose**: Primary navigation and overview of all relationships

**Implementation**:
- Display all friends in scrollable list
- Show metadata per friend: `{event_count} events · {connection_count} connections`
- Click to navigate to friend detail view
- Visual indicator (arrow/chevron) showing clickable items

**Critical UX**:
- Hover states for better interactivity feedback
- Maintain scroll position when returning from detail view

### 2. Friend Detail View
**Purpose**: Manage individual friend's relationships and events

**Layout**: Two-column design
- Left column: Relationships management
- Right column: Events timeline + add event form

**Relationships Section**:
- List ALL other friends with toggle switches
- Toggle creates/removes bidirectional connection
- **Critical Bug Fix**: Preserve scroll position during toggle operations
  - Store scrollTop before state update
  - Restore scrollTop after DOM update (use setTimeout or nextTick)
- Show count in header: "Relationships (N)"

**Events Section**:
- Chronological list (newest first)
- Display format: Date on top, notes below
- Add Event form at bottom:
  - Date picker (required)
  - Multi-line text for notes (required)
  - Submit button

### 3. Events Tab (Timeline View)
**Purpose**: Event-centric view for batch operations and timeline visualization

**Components**:

**New Event Creation**:
- Quick date buttons: "Today", "Yesterday", "Week Ago", "Start of Month"
- Multi-select friend list with:
  - Search/filter box
  - Checkbox per friend
  - Visual highlight for selected friends
  - Selected count display: "Friends (N selected)"
- Optional location field
- Required notes field
- Create button disabled until friends selected AND notes entered

**Timeline Display**:
- Group events by date
- Date headers with full format: "Monday, December 2, 2024"
- Each event shows:
  - Friend name (bold)
  - Event notes
  - Location with pin emoji if present
- Visual hierarchy: Date > Friend > Details

### 4. Orbits Visualization
**Purpose**: Visual representation of relationship closeness based on interaction frequency

**Layout**:
- 3 concentric circles representing interaction levels
- Center point at viewport center
- Labels above each orbit

**Orbit Assignment Logic**:
```
Last 90 days events count:
- Inner orbit (5+ events): Close friends
- Middle orbit (2-4 events): Regular friends  
- Outer orbit (0-1 events): Distant friends
```

**Node Rendering**:
- Distribute friends evenly around each orbit circumference
- Angle calculation: `2π / friend_count` per orbit
- Color coding by activity:
  - Dark green (#2c5530): 5+ interactions
  - Medium green (#5a9960): 2-4 interactions
  - Light green (#a0c0a0): 0-1 interactions

**Interactivity**:
- **Click nodes** → Navigate to friend detail
- **Hover** → Show tooltip with:
  - Friend name (bold)
  - Total events count
  - Connection count
  - Last 3 events with format: "DATE: first three words..."

### 5. Network Graph
**Purpose**: Visualize and edit relationship connections

**Core Features**:
- Force-directed graph layout
- Node size proportional to connection count
- Color intensity based on connections:
  - 10+ connections: Dark green
  - 5-9 connections: Medium green
  - 1-4 connections: Light green
  - 0 connections: Gray

**Two Modes**:

**View Mode** (default):
- Click nodes → Navigate to friend detail
- Drag nodes → Reposition
- Scroll → Zoom
- Drag canvas → Pan

**Edit Mode** (toggled):
- Visual indicator: Border color change + button state
- Drag from node to node → Create/toggle connection
- Connections are always bidirectional
- Clear mode indicator: "Drag between nodes to create connections"

**Critical Implementation**:
- Node labels must be readable on all backgrounds:
  - Use dark text (#333) always
  - Add white stroke/outline for contrast
- Physics simulation for organic clustering
- Toggle physics on/off for performance

## State Management Patterns

### Data Flow
1. **Single source of truth**: Main friends array
2. **Derived states**: Calculate scores/orbits from events
3. **Bidirectional updates**: When toggling relationships, update both friends

### Update Triggers
- Use update counter or key props to force re-renders after state changes
- Critical for visualization updates after data modifications

### Performance Optimizations
- Memoize calculated values (interaction scores, event groupings)
- Limit orbit calculations to last 90 days
- Use Sets for relationship lookups (O(1) vs O(n))

## Critical UX Patterns

### Navigation Flow
```
Networks/Orbits (click node) → Set selected friend → Switch to List tab → Show detail
```

### Data Validation
- Prevent self-relationships
- Ensure bidirectional relationship consistency
- Require notes for events (not just date)

### Visual Feedback
- Disabled states for invalid inputs
- Active/hover states for all interactive elements
- Loading states for data processing
- Edit mode indicators

## Statistics Dashboard
Display four key metrics:
1. **Connections**: Total unique relationships / 2 (bidirectional)
2. **Active Friends**: Count with events in last 90 days
3. **Total Events**: Sum of all events across all friends
4. **Avg Events/Friend**: Total events / friend count

## Data Import/Export Considerations

### Reset Functionality
- Confirm dialog before clearing
- Complete localStorage wipe
- Reinitialize with empty state

### Future CSV Import
Structure to support:
```csv
Name,Met_Date,Met_Location,Community,Last_Interaction,Next_Interaction,Location,Notes
```

Auto-categorization logic:
- Rich profiles (notes + recent + future) → Inner circle
- Some data → Middle circle
- Minimal data → Outer circle

## Technical Constraints & Solutions

### Scroll Position Preservation
**Problem**: React re-renders reset scroll position
**Solution**: 
```javascript
const scrollTop = containerRef.current.scrollTop;
updateState();
setTimeout(() => {
  containerRef.current.scrollTop = scrollTop;
}, 0);
```

### Set Serialization
**Problem**: Sets can't be JSON stringified
**Solution**:
```javascript
// Save: Set → Array
relationships: Array.from(friendSet)
// Load: Array → Set
relationships: new Set(savedArray)
```

### Graph Library Selection
**Requirements**:
- Force-directed layout
- Interactive node positioning
- Zoom/pan controls
- Edit mode support
- Custom node styling

**Recommended features**:
- Physics simulation
- Collision detection
- Touch support for mobile

## Mobile Considerations
- Touch-friendly tap targets (minimum 44x44px)
- Swipe navigation between tabs
- Responsive graph scaling
- Bottom sheet pattern for add event form

## Privacy & Security
- All data stored locally only
- No external API calls
- No analytics or tracking
- Clear data ownership messaging

## Testing Checklist

### Core Functionality
- [ ] Add/remove bidirectional relationships
- [ ] Create events with multiple participants
- [ ] Navigate from graph nodes to details
- [ ] Data persists after refresh
- [ ] Scroll position maintained during updates

### Edge Cases
- [ ] 0 friends state
- [ ] 0 events state  
- [ ] Maximum friends (150+) performance
- [ ] Circular relationship consistency
- [ ] Date boundary conditions

### Visual Validation
- [ ] Orbit distribution is even
- [ ] Network labels readable on all backgrounds
- [ ] Edit mode clearly indicated
- [ ] Responsive on various screen sizes

## Implementation Order (Recommended)

1. **Data Layer**: Models, storage, state management
2. **Friends List**: Basic CRUD, detail view
3. **Events System**: Single friend events first
4. **Persistence**: LocalStorage integration
5. **Orbits View**: Calculate positions, render, tooltips
6. **Network Graph**: Basic visualization
7. **Multi-friend Events**: Batch selection UI
8. **Network Editing**: Drag-to-connect functionality
9. **Polish**: Animations, performance, mobile

## Success Metrics
- Users can manage 150 relationships without performance degradation
- All state changes persist and sync across views
- Visual representations update in real-time
- Edit operations feel intuitive without instructions
- Data remains private and under user control

---

*This guide represents a validated MVP feature set. Focus on core functionality before adding enhancements.*