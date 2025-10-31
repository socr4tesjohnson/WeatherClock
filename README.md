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

## Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. No build process required - it's a static site

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
├── index.html              # Main HTML file
├── clock.js                # Application logic
├── styles.css              # Styling
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request to `main`

## License

This project is open source.
