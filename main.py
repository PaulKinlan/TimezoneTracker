from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
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
        new_user = User(username=username, password=generate_password_hash(password, method='pbkdf2:sha256'))
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful. Please log in.')
        return redirect(url_for('login'))
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
    timezones = data.get('timezones', [])
    removed_timezone = data.get('removed')
    
    if current_user.timezones:
        current_timezones = json.loads(current_user.timezones)
    else:
        current_timezones = []
    
    if removed_timezone:
        if removed_timezone in current_timezones:
            current_timezones.remove(removed_timezone)
    else:
        for timezone in timezones:
            if timezone not in current_timezones:
                current_timezones.append(timezone)
    
    current_user.timezones = json.dumps(current_timezones)
    db.session.commit()
    return jsonify({"message": "Timezones updated successfully"}), 200

@app.route("/get_timezones")
@login_required
def get_timezones():
    if current_user.timezones:
        return jsonify(json.loads(current_user.timezones)), 200
    return jsonify([]), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
