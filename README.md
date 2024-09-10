# World Clock Application

This is a simple web application built with Flask that displays the current time and allows users to add and view times from different timezones. It includes user authentication and timezone management features.

## Deployment Instructions

[... existing content ...]

## PWA Setup

This application is set up as a Progressive Web App (PWA). To complete the PWA setup:

1. Replace the placeholder icon files with actual images:
   - Replace `/static/icons/icon-192x192.txt` with a 192x192 pixel PNG image named `icon-192x192.png`.
   - Replace `/static/icons/icon-512x512.txt` with a 512x512 pixel PNG image named `icon-512x512.png`.

2. Ensure that the `manifest.json` file in the `static` folder is correctly configured with the following content:
   ```json
   {
     "name": "World Clock",
     "short_name": "World Clock",
     "description": "A simple web application to display current time in multiple timezones",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#4CAF50",
     "icons": [
       {
         "src": "/static/icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/static/icons/icon-512x512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

3. Verify that the `index.html` file includes the following lines in the `<head>` section:
   ```html
   <link rel="manifest" href="{{ url_for('static', filename='manifest.json') }}">
   <meta name="theme-color" content="#4CAF50">
   <link rel="apple-touch-icon" href="{{ url_for('static', filename='icons/icon-192x192.png') }}">
   ```

4. Ensure that the `sw.js` (Service Worker) file is present in the `static` folder and properly configured.

Once these steps are completed, the World Clock application will be fully set up as a Progressive Web App.

[... rest of the existing content ...]
