# WeatherClock

Path to site
https://socr4tesjohnson.github.io/WeatherClock/

## TODO (priority)
1. Replace client API key with serverless proxy (Vercel/Netlify/Cloudflare Worker). Use `config.js` to point to proxy URL.
2. Fix DOM reference and event binding for `#updateButton` (done).
3. Robust fetch: timeouts, JSON parse, non-2xx handling, user-facing status (done).
4. Correct hour-to-forecast mapping across 24–48h window (done).
5. Prevent DOM growth: remove old temp/hour/icon nodes before re-render (done).
6. Clamp color mapping for temps outside 32–100°F (done).
7. HTML cleanup: meta viewport, remove unused scripts, input validation (done).
8. Accessibility: ARIA live region for status, better contrast and focus styles.
9. Add °C/°F toggle and timezone handling.
10. CI: add lint/format workflow and basic checks for PRs.
11. Documentation: setup, proxy example code, screenshots.

## Configuration
- Set the proxy endpoint in `config.js`:
  ```js
  window.WEATHER_API_PROXY_URL = "https://your-proxy.example.com/forecast";
  ```
- The proxy should perform the upstream call to `weatherapi` with your secret key server-side and return the JSON.

## Development
- Open `index.html` via a simple local server.
- Update ZIP and observe clock wedges/labels update.
