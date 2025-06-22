from sqlalchemy.orm import Session
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from models.user import User
from typing import Optional
import uuid

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.ph = PasswordHasher()
    
    def create_user(self, email: str, password: str, is_admin: bool = False) -> User:
        """Create a new user with hashed password"""
        # Check if user already exists
        existing_user = self.get_user_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash the password
        password_hash = self.ph.hash(password)
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=email.lower().strip(),
            password_hash=password_hash,
            is_admin=is_admin
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        return self.db.query(User).filter(User.email == email.lower().strip()).first()
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def verify_password(self, plain_password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            self.ph.verify(password_hash, plain_password)
            return True
        except VerifyMismatchError:
            return False
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.get_user_by_email(email)
        if not user or not user.is_active:
            return None
        
        if not self.verify_password(password, user.password_hash):
            return None
        
        return user
    
    def update_user(self, user_id: str, **updates) -> Optional[User]:
        """Update user information"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate a user account"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_active = False
        self.db.commit()
        return True
    
    def get_all_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users with pagination"""
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def create_default_admin(self) -> User:
        """Create default admin user if none exists"""
        admin = self.get_user_by_email("admin@test.com")
        if not admin:
            admin = self.create_user(
                email="admin@test.com",
                password="admin123",
                is_admin=True
            )
        return admin 