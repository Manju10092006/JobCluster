from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    provider = db.Column(db.String(50), nullable=False) # 'google', 'github', 'local'
    provider_id = db.Column(db.String(255), unique=True, nullable=True) # Unique ID from provider
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    local_auth = db.relationship('LocalAuth', backref='user', uselist=False)
    resumes = db.relationship('Resume', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'avatar': self.avatar,
            'bio': self.bio,
            'location': self.location,
            'provider': self.provider
        }

class LocalAuth(db.Model):
    __tablename__ = 'local_auth'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Resume(db.Model):
    __tablename__ = 'resumes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_path': self.file_path,
            'uploaded_at': self.uploaded_at.isoformat()
        }

def init_db(app):
    with app.app_context():
        db.create_all()
