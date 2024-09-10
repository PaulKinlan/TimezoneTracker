from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    timezones = db.Column(db.Text, nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/")
def index():
    return render_template("index.html", user=current_user)

@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists')
            return redirect(url_for('register'))
        
        default_timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']
        new_user = User(
            username=username, 
            password=generate_password_hash(password, method='pbkdf2:sha256'),
            timezones=json.dumps(default_timezones)
        )
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        flash('Registration successful. Default timezones have been added to your account.')
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user, remember=True)
            flash('Logged in successfully.')
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.')
    return redirect(url_for('index'))

@app.route("/save_timezones", methods=['POST'])
@login_required
def save_timezones():
    data = request.json
    new_timezones = data.get('timezones', [])
    
    current_user.timezones = json.dumps(new_timezones)
    db.session.commit()
    return jsonify({"message": "Timezones updated successfully"}), 200

@app.route("/get_timezones")
@login_required
def get_timezones():
    if current_user.timezones:
        return jsonify(json.loads(current_user.timezones)), 200
    return jsonify([]), 200

@app.route('/test_db')
def test_db():
    try:
        db.session.execute(db.select(db.text('1'))).scalar()
        return 'Database connection successful!', 200
    except Exception as e:
        db.session.rollback()
        return f'Database connection failed: {str(e)}', 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
