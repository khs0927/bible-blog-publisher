# 📖 Bible Blog Publisher (성경 말씀 블로그 자동 발행 웹앱)

> **Agency Agents 가상 전문가 팀**(`product-manager`, `ui-designer`, `backend-architect`, `devops-automator`, `git-workflow-master`, `test-automation-engineer`)이 구축한 성경 말씀 주제 자동 묵상 포스팅 플랫폼입니다.

---

## 🌟 주요 기능
- **성경 구절 큐레이션 DB**: 위로와 평안, 소망과 용기, 감사와 기쁨, 지혜와 인도
- **AI 묵상글 포맷터**: 성경 본문 + 문맥 묵상 + 삶의 적용 + 마무리 기도문 + 관련 해시태그 자동 생성
- **반응형 묵상 카드 UI**: 경건하고 세리프 스타일 미학 적용 실시간 프리뷰
- **Docker 컨테이너화 지원**: 멀티스테이지 Docker 빌드 및 Docker Compose 1-클릭 가동
- **Vercel 서벌리스 호환성**: `vercel.json` 및 `@vercel/python` 서벌리스 지원

---

## 🐳 Docker를 통한 로컬 실행 가이드

### 1. Docker Compose 실행 (권장)
```bash
docker-compose up --build -d
```
가동 후 웹 브라우저에서 `http://localhost:5001` 접속.

### 2. 단일 Docker 이미지 빌드 및 실행
```bash
docker build -t bible-blog-publisher .
docker run -p 5001:5001 -e OPENAI_API_KEY=your_key bible-blog-publisher
```

---

## ⚡ Vercel 연동 배포 안내
본 프로젝트는 `vercel.json` 및 `api/index.py` 핸들러가 포함되어 있어 Vercel CLI 또는 GitHub 연동을 통해 원클릭 배포가 가능합니다.

```bash
# Vercel CLI로 바로 배포 시
npm i -g vercel
vercel
```

---

## 🛠️ 개발 및 기술 스택
- **Backend**: Python 3.12, Flask, Flask-SQLAlchemy, Gunicorn
- **Frontend**: React (Vite), Tailwind CSS
- **Container**: Docker Multi-stage Build (Node 22 + Python 3.12 slim)
- **Deployment**: Docker Compose, Vercel
