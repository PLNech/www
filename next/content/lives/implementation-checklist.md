# ParVagues Site Upgrade - Implementation Checklist

## Phase 1: File Structure Setup
- [x] Create `/content/lives/` directory
- [x] Create `/content/lives/2025/` subdirectory  
- [x] Create `/content/lives/2022/` subdirectory
- [x] Create `/content/lives/_template.md`
- [x] Create event metadata files:
  - [x] `/content/lives/2025/ensad-2025-05-22.md`
  - [x] `/content/lives/2025/algorave-lyon-2025-XX-XX.md`
- [x] Create image directories:
  - [x] `/public/images/parvagues/live-placeholder.jpg`
  - [x] `/public/images/parvagues/code-sample-1.png`
  - [x] `/public/images/parvagues/setup-placeholder.jpg`
  - [x] `/public/images/parvagues/lives/2025/ensad-2025-05-22/`
  - [x] `/public/images/parvagues/lives/2025/algorave-lyon-2025-XX-XX/`

## Phase 2: Dynamic Live Page Implementation
- [x] Create `/pages/parvagues/live/[id].js`
- [x] Implement getStaticPaths to read lives directory
- [x] Implement getStaticProps to load markdown metadata
- [x] Create countdown component
- [x] Create teasing display logic
- [x] Create post-event archive layout
- [x] Add collapsible teasing section
- [x] Implement gallery component (masonry layout)
- [ ] Add responsive design

## Phase 3: Landing Page Redesign
- [x] Backup existing `/pages/parvagues.js`
- [x] Create new hero section with cyberpunk theme
- [x] Add code sample section with highlight.js
- [x] Implement live events sidebar/list
- [x] Add dark theme with purple/pink gradients
- [x] Add subtle rain/glitch effects
- [ ] Create responsive layout
- [ ] Add scroll animations

## Phase 4: Content Creation
- [x] Create ENSAD event metadata
- [x] Create AlgoRave Lyon metadata (placeholder date)
- [x] Write teasing content for both events
- [x] Add placeholder images with descriptive names
- [x] Create sample TidalCycles code snippets

## Phase 5: Testing & Verification
- [ ] Test countdown functionality
- [ ] Test gallery display
- [ ] Test responsive design
- [ ] Verify markdown rendering
- [ ] Test live page routing
- [ ] Verify image loading
- [ ] Test date logic for pre/post event states

## Phase 6: Polish & Deployment
- [ ] Add accessibility attributes
- [ ] Optimize image loading  
- [ ] Add loading states
- [ ] Test SEO metadata
- [ ] Verify all links work
- [ ] Final visual polish

## Dependencies to Install
- [x] marked (for markdown rendering)
- [x] prismjs (for syntax highlighting)
- [x] react-masonry-css (for gallery layout)
- [ ] NOTE: Run `npm install marked prismjs react-masonry-css`

---
*Last updated: May 11, 2025*
