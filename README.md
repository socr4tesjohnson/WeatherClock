# WeatherClock

A visual 12-hour weather forecast displayed as a colorful clock interface. Each segment represents an hour with temperature-based coloring.

## Live Site

https://socr4tesjohnson.github.io/WeatherClock/

## Features

- 12-hour hourly weather forecast
- Temperature-based color coding
- ZIP code-based location search
- Interactive clock visualization
- Responsive design
- **Progressive Web App (PWA)** - Install on your device!
- **Offline Support** - Works without internet (after first load)
- **Persistent Location** - Your saved location is remembered

## Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions.

### Deployment Pipeline

The deployment pipeline is configured in `.github/workflows/static.yml` and:

- Triggers automatically on pushes to the `main` branch
- Can be manually triggered via the Actions tab
- Uses the latest GitHub Actions versions for reliability
- Deploys static files to GitHub Pages
- URL: https://socr4tesjohnson.github.io/WeatherClock/

### Manual Deployment

To manually trigger a deployment:
1. Go to the Actions tab in GitHub
2. Select "Deploy static content to Pages"
3. Click "Run workflow"
4. Select the `main` branch
5. Click "Run workflow"

## PWA Features

WeatherClock is a Progressive Web App that you can install on your device!

### Installing the PWA

**On Mobile (iOS/Android):**
1. Visit https://socr4tesjohnson.github.io/WeatherClock/
2. Tap the share/menu button
3. Select "Add to Home Screen"
4. The app will appear on your home screen like a native app

**On Desktop (Chrome/Edge):**
1. Visit the site
2. Look for the install icon in the address bar
3. Click "Install"
4. The app will open in its own window

### PWA Benefits

- **Works Offline**: After the first visit, the app works without internet
- **Saves Your Location**: Your ZIP code is automatically saved and restored
- **Fast Loading**: Cached assets load instantly
- **App-like Experience**: Runs in fullscreen mode without browser UI

## Local Development

1. Clone the repository
2. Open `index.html` in a web browser (use a local server for PWA features)
3. No build process required - it's a static site

### Testing PWA Features Locally

```bash
# Use Python's built-in server
python3 -m http.server 8000

# Or use Node's http-server (install with: npm install -g http-server)
http-server -p 8000
```

Then visit `http://localhost:8000`

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- WeatherAPI via RapidAPI

## Project Structure

```
WeatherClock/
├── .github/
│   └── workflows/
│       └── static.yml      # GitHub Pages deployment
├── icons/                  # PWA app icons
│   ├── generate.html       # Icon generator tool
│   ├── icon.svg            # SVG icon template
│   ├── icon-192.png        # 192x192 app icon
│   └── icon-512.png        # 512x512 app icon
├── index.html              # Main HTML file
├── clock.js                # Application logic with localStorage
├── styles.css              # Styling
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

### Improving PWA Icons

The current icons are minimal placeholders. To create better icons:

1. Open `icons/generate.html` in a web browser
2. Click the generate buttons to create icons in the canvas
3. Right-click each canvas and "Save image as..."
4. Save as `icon-192.png` and `icon-512.png` in the `icons/` folder
5. Commit and push the updated icons

Alternatively, use tools like:
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request to `main`

## License

This project is open source.
