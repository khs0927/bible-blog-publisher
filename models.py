from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'

class BibleBlogPost(db.Model):
    __tablename__ = 'bible_blog_posts'
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    passage = Column(String(200), nullable=False)  # e.g., "이사야 41:10"
    verse_text = Column(Text, nullable=False)      # 본문 성경 구절
    meditation = Column(Text, nullable=False)      # 묵상 및 삶의 적용
    prayer = Column(Text, nullable=False)          # 마무리 기도문
    tags = Column(Text, nullable=False)            # 해시태그
    full_content = Column(Text, nullable=False)    # 최종 포스팅 내용
    category = Column(String(50), nullable=False)  # 위로, 소망, 감사, 지혜 등
    tone = Column(String(50), default='은혜로운 묵상체')
    status = Column(String(20), default='published')  # published, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<BibleBlogPost {self.passage} - {self.title}>'

class BibleAutomationSettings(db.Model):
    __tablename__ = 'bible_automation_settings'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, default=1)
    tistory_blog_name = Column(String(100), default='my-bible-meditation')
    tistory_access_token = Column(Text, default='')
    tistory_category_id = Column(String(50), default='0')
    categories = Column(Text, default='["위로와 평안", "소망과 용기", "감사와 기쁨", "지혜와 인도"]')
    preferred_tone = Column(String(50), default='은혜로운 묵상체')
    interval_hours = Column(Integer, default=12)
    is_active = Column(Boolean, default=True)
    auto_publish_tistory = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<BibleAutomationSettings user_id={self.user_id}>'

