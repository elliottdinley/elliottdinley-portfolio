# Portfolio Website Documentation

## Overview
A modern, interactive portfolio website showcasing professional experience and technical capabilities. Built with vanilla JavaScript, HTML, and CSS, featuring a clean, responsive design with both light and dark modes.

## Key Features

### 1. Dynamic Content
- **Typewriter Effect**: 
  - Many rotating professional statements
  - Typing delay: 100ms
  - Erasing delay: 50ms
  - Pause between texts: 2000ms
- **Scroll-Based Animations**: 
  - 10% visibility threshold
  - Smooth fade-in transitions

### 2. Theme Management
- **Dark/Light Mode Toggle**: 
  - Instant theme switching with 300ms transitions
  - Sound effects at 30% volume
  - Persistent preferences via localStorage

### 3. Interactive Chatbot
- **AI-Powered Chat Interface**: 
  - Message fade-in: 500ms per line
  - Character limit: 500 per message
  - Loading indicator with 600ms animation cycles

### 4. Background Music
- **Ambient Audio**:
  - Default volume: 20%
  - Fade duration: 1000ms (both in/out)
  - Volume adjustment steps: 2%

### 5. Security Features
- **Rate Limiting**: 
  - Base limit: 5 requests per minute
  - After 3 violations: Reduced to 2 requests/minute
  - Progressive backoff: 60s → 120s → 240s → max 1 hour
  - 24-hour violation reset period
- **Content Security**: 
  - Comprehensive security headers
  - Strict permissions policy
  - Limited external connections

### 6. Welcome Modal
- **First-Time Visitor Experience**:
  - 500ms entrance delay
  - 300ms animation duration

### 7. Responsive Design
Breakpoints:
- Mobile: < 480px
- Tablet: 481px - 768px
- Laptop: 769px - 1024px
- Desktop: 1025px - 1200px

### 8. Content Filtering
Blocks potentially harmful content including:
- Prompt injection attempts
- Harmful content patterns
- Sensitive data requests

### 9. Visual Elements
- Loader animation: 30px height with 2.5 aspect ratio
- Chat container: 600px max width
- Modal width: 90% with 500px max-width

### 10. Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

### 11. Cache Strategy
- Static assets: 30 days
- API responses: 5 minutes
- Theme preferences: Persistent
- Session data: Browser session only

---

*Note: All specifications are derived directly from the codebase. Features without specific numerical values in the code have been described qualitatively.*
