from flask import Blueprint, request, jsonify
import json
from datetime import datetime
from models import db, BibleBlogPost, BibleAutomationSettings
from automation_bible import BibleMeditationGenerator

bible_bp = Blueprint('bible', __name__)
generator = BibleMeditationGenerator()

@bible_bp.route('/bible/categories', methods=['GET'])
def get_categories():
    categories = generator.get_categories()
    verses_by_cat = {cat: generator.get_verses_by_category(cat) for cat in categories}
    return jsonify({
        "categories": categories,
        "verses": verses_by_cat
    })

@bible_bp.route('/bible/posts', methods=['GET'])
def get_bible_posts():
    posts = BibleBlogPost.query.order_by(BibleBlogPost.created_at.desc()).all()
    posts_list = []
    for p in posts:
        posts_list.append({
            "id": p.id,
            "title": p.title,
            "passage": p.passage,
            "verse_text": p.verse_text,
            "meditation": p.meditation,
            "prayer": p.prayer,
            "tags": p.tags,
            "full_content": p.full_content,
            "category": p.category,
            "tone": p.tone,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return jsonify({"posts": posts_list})

@bible_bp.route('/bible/generate', methods=['POST'])
def generate_bible_post():
    data = request.json or {}
    category = data.get("category", "위로와 평안")
    tone = data.get("tone", "은혜로운 묵상체")
    specific_passage = data.get("passage", None)

    result = generator.generate_meditation(category=category, tone=tone, specific_passage=specific_passage)

    # Check if Tistory API is configured for live publishing
    settings = BibleAutomationSettings.query.filter_by(user_id=1).first()
    tistory_status = "published"
    publish_msg = "티스토리 로컬 생성 완료"

    if settings and settings.tistory_access_token and settings.tistory_blog_name:
        success, res_info = generator.post_to_tistory_api(
            access_token=settings.tistory_access_token,
            blog_name=settings.tistory_blog_name,
            title=result["title"],
            content=result["full_content"],
            category_id=settings.tistory_category_id or "0",
            tag_string=result["tags"]
        )
        if success:
            publish_msg = f"티스토리 블로그 연동 발행 성공! ({res_info})"
        else:
            tistory_status = "failed"
            publish_msg = f"티스토리 포스팅 생성 완료 (API 연동 참고: {res_info})"

    post = BibleBlogPost(
        title=result["title"],
        passage=result["passage"],
        verse_text=result["verse_text"],
        meditation=result["meditation"],
        prayer=result["prayer"],
        tags=result["tags"],
        full_content=result["full_content"],
        category=result["category"],
        tone=result["tone"],
        status=tistory_status,
        created_at=datetime.utcnow()
    )
    db.session.add(post)
    db.session.commit()

    return jsonify({
        "message": f"[{result['passage']}] 티스토리 성경 묵상 포스팅 생성 완료. ({publish_msg})",
        "post": {
            "id": post.id,
            "title": post.title,
            "passage": post.passage,
            "verse_text": post.verse_text,
            "meditation": post.meditation,
            "prayer": post.prayer,
            "tags": post.tags,
            "full_content": post.full_content,
            "category": post.category,
            "tone": post.tone,
            "status": post.status,
            "created_at": post.created_at.isoformat()
        }
    })

@bible_bp.route('/bible/settings', methods=['GET', 'POST'])
def bible_settings():
    if request.method == 'GET':
        settings = BibleAutomationSettings.query.filter_by(user_id=1).first()
        if not settings:
            return jsonify({
                "user_id": 1,
                "tistory_blog_name": "my-bible-meditation",
                "tistory_access_token": "",
                "tistory_category_id": "0",
                "categories": ["위로와 평안", "소망과 용기", "감사와 기쁨", "지혜와 인도"],
                "preferred_tone": "은혜로운 묵상체",
                "interval_hours": 12,
                "is_active": True,
                "auto_publish_tistory": True
            })
        
        try:
            cats = json.loads(settings.categories)
        except Exception:
            cats = ["위로와 평안", "소망과 용기", "감사와 기쁨", "지혜와 인도"]

        return jsonify({
            "user_id": settings.user_id,
            "tistory_blog_name": settings.tistory_blog_name,
            "tistory_access_token": settings.tistory_access_token,
            "tistory_category_id": settings.tistory_category_id,
            "categories": cats,
            "preferred_tone": settings.preferred_tone,
            "interval_hours": settings.interval_hours,
            "is_active": settings.is_active,
            "auto_publish_tistory": settings.auto_publish_tistory
        })

    data = request.json or {}
    tistory_blog_name = data.get("tistory_blog_name", "my-bible-meditation")
    tistory_access_token = data.get("tistory_access_token", "")
    tistory_category_id = data.get("tistory_category_id", "0")
    categories = data.get("categories", ["위로와 평안", "소망과 용기"])
    preferred_tone = data.get("preferred_tone", "은혜로운 묵상체")
    interval_hours = data.get("interval_hours", 12)
    is_active = data.get("is_active", True)
    auto_publish_tistory = data.get("auto_publish_tistory", True)

    settings = BibleAutomationSettings.query.filter_by(user_id=1).first()
    if not settings:
        settings = BibleAutomationSettings(
            user_id=1,
            tistory_blog_name=tistory_blog_name,
            tistory_access_token=tistory_access_token,
            tistory_category_id=tistory_category_id,
            categories=json.dumps(categories),
            preferred_tone=preferred_tone,
            interval_hours=interval_hours,
            is_active=is_active,
            auto_publish_tistory=auto_publish_tistory
        )
        db.session.add(settings)
    else:
        settings.tistory_blog_name = tistory_blog_name
        settings.tistory_access_token = tistory_access_token
        settings.tistory_category_id = tistory_category_id
        settings.categories = json.dumps(categories)
        settings.preferred_tone = preferred_tone
        settings.interval_hours = interval_hours
        settings.is_active = is_active
        settings.auto_publish_tistory = auto_publish_tistory

    db.session.commit()
    return jsonify({"message": "티스토리 성경 묵상 자동 발행 설정이 성공적으로 저장되었습니다."})
