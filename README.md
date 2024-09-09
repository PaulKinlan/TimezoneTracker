# World Clock Application

This is a simple web application built with Flask that displays the current time and allows users to add and view times from different timezones. It includes user authentication and timezone management features.

## Deployment Instructions

### Prerequisites

- Python 3.8 or higher (3.11 recommended)
- pip (Python package manager)
- Git (optional, for cloning the repository)

### Step 1: Clone the Repository (if using Git)

```
git clone <repository-url>
cd <repository-directory>
```

If you're not using Git, ensure you have all the project files in your current directory.

### Step 2: Set Up a Virtual Environment (Recommended)

It's a good practice to use a virtual environment for Python projects. Here's how to set it up:

```
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### Step 3: Install Dependencies

Install the required Python packages using pip:

```
pip install -r requirements.txt
```

This will install all the necessary dependencies listed in the requirements.txt file.

### Step 4: Set Up the Database

The application uses SQLite as its database. To set up the database, run the following commands:

```
python
```

Then in the Python interactive shell:

```python
from main import app, db
with app.app_context():
    db.create_all()
exit()
```

This will create the necessary database tables. Make sure you have write permissions in the directory where the database file will be created.

### Step 5: Set Environment Variables

Set the following environment variables:

```
export FLASK_APP=main.py
export FLASK_ENV=production
export SECRET_KEY=<your-secret-key>
```

Replace `<your-secret-key>` with a secure random string. You can generate one using Python:

```
python -c "import os; print(os.urandom(24).hex())"
```

For production, consider storing these environment variables in a secure location, such as a .env file (not tracked by version control) or a secure key management system.

### Step 6: Run the Application

For development purposes, you can start the Flask application using:

```
flask run --host=0.0.0.0 --port=5000
```

For production deployment, it's recommended to use a production-ready WSGI server like Gunicorn:

1. Install Gunicorn:
   ```
   pip install gunicorn
   ```

2. Run the application with Gunicorn:
   ```
   gunicorn --bind 0.0.0.0:5000 main:app
   ```

The application will now be running on `http://localhost:5000`.

### Step 7: Configure a Reverse Proxy (for Production)

For production deployment, it's recommended to use a reverse proxy like Nginx. This allows you to handle SSL/TLS, load balancing, and other production-level concerns. Here's a basic Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Remember to replace `yourdomain.com` with your actual domain name.

### Step 8: Set Up HTTPS (Recommended for Production)

For production environments, it's crucial to use HTTPS to encrypt data in transit. You can set this up using Let's Encrypt with Certbot. Here's a basic process:

1. Install Certbot:
   ```
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtain and install a certificate:
   ```
   sudo certbot --nginx -d yourdomain.com
   ```

3. Follow the prompts to configure HTTPS for your domain.

4. Certbot will modify your Nginx configuration to use the new SSL/TLS certificates.

### Step 9: Access the Application

Open a web browser and navigate to `https://yourdomain.com` (or `http://localhost:5000` for local development).

## Usage

1. Register a new account or log in if you already have one.
2. Add timezones using the input field and "Add Timezone" button.
3. View the current time and times for added timezones.
4. Remove timezones as needed.

## Maintenance

- To update the application, pull the latest changes from the repository (if using Git) and restart the Flask server.
- Ensure that the database file (`users.db`) is regularly backed up to prevent data loss.
- Monitor the application logs for any errors or issues. You can set up log rotation to manage log files effectively.
- Regularly update dependencies to their latest versions:
  ```
  pip install --upgrade -r requirements.txt
  ```
- Set up monitoring for your application using tools like Prometheus and Grafana to track performance and usage metrics.

## Troubleshooting

- If you encounter any issues with database connections, ensure that the `users.db` file has the correct permissions.
- For any other issues, check the Flask server logs for error messages. In production, you can configure logging to a file:
  ```python
  import logging
  logging.basicConfig(filename='app.log', level=logging.INFO)
  ```
- If the application is not accessible, verify that the firewall settings allow traffic on port 5000 (for development) or port 80/443 (for production with Nginx).
- Ensure all required dependencies are installed correctly. You can reinstall them using `pip install -r requirements.txt`.

## Security Considerations

- Always use HTTPS in production environments to encrypt data in transit.
- Regularly update all dependencies to their latest versions to patch security vulnerabilities.
- Use environment variables for sensitive information like database credentials and API keys.
- Implement rate limiting and other security measures to prevent brute-force attacks on user authentication.
- Regularly review and update user permissions and access controls.
- Consider implementing Content Security Policy (CSP) headers to prevent XSS attacks.
- Use secure session cookies by setting `session.permanent = True` and `app.config['SESSION_COOKIE_SECURE'] = True` in your Flask application.

For any additional support or questions, please contact the development team.
