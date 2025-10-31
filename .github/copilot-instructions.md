# GitHub Copilot Instructions for WeatherClock

## Project Overview

WeatherClock is a Progressive Web App (PWA) that displays a 12-hour weather forecast as a visual clock interface. The project is built with vanilla JavaScript, HTML5, and CSS3 with no build process or dependencies.

**Key Features:**
- 12-hour hourly weather forecast visualization
- Temperature-based color coding on clock segments
- ZIP code-based location search with localStorage persistence
- Offline support via Service Worker
- Installable as a PWA on mobile and desktop devices

## Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **No Framework:** This is intentionally a framework-free project
- **No Build Process:** Static files are served directly
- **API:** WeatherAPI via RapidAPI
- **Deployment:** GitHub Pages (automated via GitHub Actions)

## Code Style and Conventions

### JavaScript
- Use vanilla JavaScript ES6+ features (const/let, arrow functions, async/await, template literals)
- No transpilation - code must run natively in modern browsers
- Use `const` for variables that won't be reassigned, `let` for those that will
- Prefer arrow functions for callbacks and short functions
- Use template literals for string interpolation
- Use async/await for asynchronous operations
- Add meaningful comments only when the code logic is complex or non-obvious
- Use descriptive variable and function names (camelCase)

### HTML
- Semantic HTML5 elements
- Include proper ARIA labels for accessibility
- Maintain PWA meta tags and manifest references
- Keep inline scripts minimal (service worker registration only)

### CSS
- Use modern CSS features (flexbox, grid, CSS variables where appropriate)
- Mobile-first responsive design
- Use relative units (rem, %, vh/vw) over fixed pixels where possible
- Maintain the existing gradient and glassmorphism design aesthetic
- Keep specificity low - avoid deep nesting

### File Organization
- Keep all source files in the root directory
- PWA icons in `/icons/` directory
- GitHub Actions workflows in `.github/workflows/`
- No build artifacts or dependencies should be committed

## PWA Requirements

### Service Worker (sw.js)
- Cache all static assets on install
- Use cache-first strategy for static files
- Use network-first for API calls (weather data should be fresh)
- Don't cache API responses to weatherapi-com.p.rapidapi.com
- Update CACHE_NAME when making significant changes
- Clean up old caches on activation

### Manifest (manifest.json)
- Maintain proper PWA manifest structure
- Include both 192x192 and 512x512 icons
- Use `/WeatherClock/` as the start_url (for GitHub Pages deployment)
- Keep display mode as "standalone"

### localStorage
- Use `weatherclock_location` key for storing user's ZIP code
- Always provide fallback defaults when reading from localStorage
- Never store sensitive data in localStorage

## Security and Privacy

### API Keys
- **NOTE:** The current API key in clock.js is exposed in the client code (a known limitation of this static site architecture documented here for awareness)
- Never commit new API keys or secrets to the repository
- This is intentionally a static site with no backend - if additional security is needed, consider using a serverless function or backend proxy

### Data Handling
- Only store non-sensitive user preferences (ZIP code) in localStorage
- Don't log or transmit personal information
- Validate and sanitize ZIP code input

## Testing

### Manual Testing
- Test PWA installation on both mobile (iOS/Android) and desktop (Chrome/Edge)
- Verify offline functionality after first load
- Test ZIP code updates and localStorage persistence
- Test on modern browsers: Chrome, Firefox, Safari, Edge
- Verify service worker registration and caching behavior
- Test responsive design on various screen sizes

### Local Development
- Use a local server for PWA features:
  - Python (no installation needed): `python3 -m http.server 8000`
  - VS Code Live Server extension (recommended for development)
  - Node.js http-server (requires npm): `npx http-server -p 8000`
- Test service worker changes in incognito/private mode or clear cache between tests
- Use browser DevTools Application tab to inspect PWA status, service workers, and cache

## Deployment

- Automatic deployment to GitHub Pages via `.github/workflows/static.yml`
- Deploys on push to `main` branch
- Can be manually triggered via GitHub Actions tab
- Deployment URL: https://socr4tesjohnson.github.io/WeatherClock/
- All paths must account for `/WeatherClock/` base path on GitHub Pages

## Documentation

- Update README.md when adding significant features
- Include setup instructions for any new tools or processes
- Document API changes or new configuration options
- Keep PWA installation instructions current
- Update this file when project conventions change

## Common Patterns

### Weather API Calls
```javascript
// Use the existing pattern with RapidAPI headers (see clock.js for current implementation)
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '<key from existing clock.js>',
    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
  }
};
```

### localStorage Usage
```javascript
// Reading with fallback
let currentZip = localStorage.getItem('weatherclock_location') || '72704';

// Writing
localStorage.setItem('weatherclock_location', currentZip);
```

### SVG Manipulation
- Clock visualization uses SVG with JavaScript manipulation
- Use proper SVG namespacing when creating elements
- Apply filters and styles via SVG attributes or CSS

## Things to Avoid

- Don't add build tools or bundlers (webpack, vite, parcel, etc.)
- Don't add JavaScript frameworks or libraries (React, Vue, jQuery, etc.)
- Don't add CSS preprocessors (Sass, Less, etc.)
- Don't add package.json or node_modules
- Don't break offline PWA functionality
- Don't cache weather API responses (data should be fresh)
- Don't remove or modify the service worker registration without testing

## Contribution Guidelines

1. Keep changes minimal and focused
2. Test PWA functionality after changes
3. Maintain the vanilla JavaScript approach
4. Preserve offline functionality
5. Update README.md for user-facing changes
6. Test on multiple browsers and devices before submitting PR
