# Ember (beta)
"Keep your faith fire lit"

Ember is a free web app for growing in faith: a flame that grows as you light daily practices, streaks and an ember jar, the Bible in dozens of versions with free commentaries, devotionals, classic Christian books, podcasts, Christian radio, memory verses and more. It runs in the browser and can be added to a phone's home screen like an app.

## Files

| File | What it is |
|---|---|
| `index.html` | The app page and its styles |
| `app.js` | Everything the app does |
| `install.html` | The page shared links open, with steps for adding Ember to a home screen |
| `sw.js` | Lets Ember load quickly and work offline |
| `manifest.json` | App name, colors and icons for home-screen installs |
| `icon-192.png`, `icon-512.png` | App icons |
| `og-image.jpg` | The picture shown when an Ember link is shared |

## Settings

At the top of `app.js`:

- `SITE`: Ember's public address (`https://dsmith2721.github.io/ember/`). Every shared link and invite uses it.

- `SUGGEST_URL`: paste a free Formspree form address (`https://formspree.io/f/...`) to get an email whenever someone suggests a podcast, station, devotional, commentary or book they added. Leave it empty to send nothing.

## Updating

Upload all files to the main folder of the GitHub repository. GitHub Pages updates within a minute or two. People who already installed Ember get the new version the next time they open it (sometimes after reopening once).

Each person's progress is saved on their own device. Nothing is sent to a server.
