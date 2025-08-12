# Serverless proxy for Weather API

This static site should NOT call the upstream weather API directly with a client-exposed key. Use one of these serverless options and set `window.WEATHER_API_PROXY_URL` in `config.js` to the deployed URL.

## Query format

The client will call:
```
GET {PROXY_URL}?q={zipOrQuery}&days={1|2}
```
Your proxy should forward these to WeatherAPI via RapidAPI:
```
GET https://weatherapi-com.p.rapidapi.com/forecast.json?q=...&days=...
Headers:
  X-RapidAPI-Key: $WEATHERAPI_KEY
  X-RapidAPI-Host: weatherapi-com.p.rapidapi.com
```

Include basic CORS headers to allow requests from your GitHub Pages origin.

## Vercel (Node.js API Route)
- File: `proxy/vercel/api/forecast.js`
- Env var: `WEATHERAPI_KEY`
- Deploy: `vercel` then set the key in the project settings. The proxy URL will be `https://<project>.vercel.app/api/forecast`.

## Netlify Function
- File: `proxy/netlify/functions/forecast.js`
- Env var: `WEATHERAPI_KEY`
- Deploy: `netlify deploy --prod`, set the environment variable in site settings. The URL will be `/.netlify/functions/forecast` on your Netlify domain.

## Cloudflare Worker
- File: `proxy/cloudflare-worker/src/index.js`
- Secret: `WEATHERAPI_KEY` (via `wrangler secret put WEATHERAPI_KEY`)
- Deploy: `wrangler deploy`. The URL will be your worker route.

After deploying, set in `config.js`:
```js
window.WEATHER_API_PROXY_URL = "https://<your-proxy-domain>/api/forecast"; // or netlify/worker URL
```