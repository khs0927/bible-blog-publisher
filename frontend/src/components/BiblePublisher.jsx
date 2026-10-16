import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api';

export default function BiblePublisher({ setMessage }) {
  const [categories, setCategories] = useState([]);
  const [versesByCat, setVersesByCat] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('위로와 평안');
  const [selectedVerse, setSelectedVerse] = useState('');
  const [selectedTone, setSelectedTone] = useState('은혜로운 묵상체');
  const [posts, setPosts] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoActive, setAutoActive] = useState(true);
  const [intervalHours, setIntervalHours] = useState(12);

  // 티스토리 연동 설정 상태
  const [tistoryBlogName, setTistoryBlogName] = useState('my-bible-meditation');
  const [tistoryAccessToken, setTistoryAccessToken] = useState('');
  const [tistoryCategoryId, setTistoryCategoryId] = useState('0');
  const [tistoryTokenSet, setTistoryTokenSet] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBiblePosts();
    fetchSettings();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bible/categories`);
      setCategories(res.data.categories || []);
      setVersesByCat(res.data.verses || {});
    } catch (err) {
      console.error('카테고리 로딩 실패', err);
    }
  };

  const fetchBiblePosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bible/posts`);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('티스토리 포스팅 이력 로딩 실패', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bible/settings`);
      setAutoActive(res.data.is_active);
      setIntervalHours(res.data.interval_hours);
      setTistoryBlogName(res.data.tistory_blog_name || 'my-bible-meditation');
      setTistoryTokenSet(!!res.data.tistory_token_set);
      setTistoryCategoryId(res.data.tistory_category_id || '0');
    } catch (err) {
      console.error('티스토리 설정 로딩 실패', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('AI가 티스토리 포스팅용 성경 묵상 글을 작성 중입니다...');
    try {
      const res = await axios.post(`${API_BASE_URL}/bible/generate`, {
        category: selectedCategory,
        tone: selectedTone,
        passage: selectedVerse || undefined,
      });
      setMessage(res.data.message);
      setPreviewPost(res.data.post);
      fetchBiblePosts();
    } catch (err) {
      console.error('묵상 생성 실패', err);
      setMessage('묵상 글 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/bible/settings`, {
        tistory_blog_name: tistoryBlogName,
        tistory_access_token: tistoryAccessToken,
        tistory_category_id: tistoryCategoryId,
        categories: categories,
        preferred_tone: selectedTone,
        interval_hours: intervalHours,
        is_active: autoActive,
        auto_publish_tistory: true,
      });
      setMessage(res.data.message);
      if (tistoryAccessToken) setTistoryTokenSet(true);
      setTistoryAccessToken('');
    } catch {
      setMessage('티스토리 설정 저장 실패 (관리자 키를 확인하세요)');
    }
  };

  return (
    <div className="space-y-8">
      {/* 상단 티스토리 헤더 & 배너 */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-2 backdrop-blur-sm">
              🧡 Tistory Bible Publisher Mode v2.0
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              티스토리 성경 묵상 블로그 자동 발행 시스템
            </h2>
            <p className="mt-1 text-orange-100/90 text-sm max-w-xl">
              성경 구절과 은혜로운 묵상, 기도를 AI로 정교하게 조합하여 티스토리 블로그(Tistory OpenAPI)에 최적화된 포스팅을 자동 발행합니다.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl backdrop-blur-md border border-white/10">
            <div className="text-right">
              <div className="text-xs text-orange-200">자동 발행 상태</div>
              <div className="text-lg font-bold">
                {autoActive ? `🟢 ${intervalHours}시간 주기 자동 포스팅` : '🔴 정지됨'}
              </div>
            </div>
            <button
              onClick={() => setAutoActive(!autoActive)}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow ${
                autoActive
                  ? 'bg-red-500/80 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {autoActive ? '일시정지' : '자동화 가동'}
            </button>
          </div>
        </div>
      </div>

      {/* 대시보드 2열 그리드: 티스토리 설정 및 컨트롤 / 실시간 프리뷰 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 폼: 티스토리 연동 & 묵상 설정 */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <div className="border-b pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              🧡 티스토리 API 및 묵상 컨트롤
            </h3>
            <p className="text-xs text-slate-500">
              티스토리 블로그 정보와 원하시는 성경 주제를 설정하세요.
            </p>
          </div>

          {/* 티스토리 연동 설정 */}
          <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200/80 space-y-3">
            <div className="text-xs font-bold text-orange-900 flex items-center gap-1">
              🔑 티스토리 OpenAPI 연동 설정
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                티스토리 블로그 식별 이름 (Subdomain)
              </label>
              <input
                type="text"
                value={tistoryBlogName}
                onChange={(e) => setTistoryBlogName(e.target.value)}
                placeholder="예: my-bible-meditation"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tistory Access Token (OpenAPI)
              </label>
              <input
                type="password"
                value={tistoryAccessToken}
                onChange={(e) => setTistoryAccessToken(e.target.value)}
                placeholder={tistoryTokenSet ? '저장된 토큰 있음 (변경할 때만 입력)' : '티스토리 오픈API 토큰 입력'}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>

          {/* 성경 주제 카테고리 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              성경 주제 카테고리
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedVerse('');
                  }}
                  className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {cat === '위로와 평안' && '🕊️ '}
                  {cat === '소망과 용기' && '🌱 '}
                  {cat === '감사와 기쁨' && '☀️ '}
                  {cat === '지혜와 인도' && '💡 '}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 성경 구절 수동 지정 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              특정 성경 구절 지정 (선택)
            </label>
            <select
              value={selectedVerse}
              onChange={(e) => setSelectedVerse(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
            >
              <option value="">-- {selectedCategory} 대표 구절 임의 무작위 선택 --</option>
              {(versesByCat[selectedCategory] || []).map((v) => (
                <option key={v.passage} value={v.passage}>
                  {v.passage} - {v.text.substring(0, 25)}...
                </option>
              ))}
            </select>
          </div>

          {/* 묵상 어투 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              글쓰기 어투 / 톤앤매너
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
            >
              <option value="은혜로운 묵상체">은혜로운 묵상체 (경건하고 깊이 있는 칼럼)</option>
              <option value="따뜻한 편지체">따뜻한 편지체 (마음을 보듬어주는 편지글)</option>
              <option value="친근한 대화체">친근한 대화체 (쉽게 이해되는 따스한 설명)</option>
            </select>
          </div>

          {/* 생성 버튼 */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>티스토리 묵상 글 작성 중...</span>
                </>
              ) : (
                <span>✨ 티스토리 묵상 포스팅 생성하기</span>
              )}
            </button>
          </div>

          <div className="border-t pt-4 flex justify-between items-center text-xs text-slate-500">
            <span>발행 주기: {intervalHours}시간마다</span>
            <button
              onClick={handleSaveSettings}
              className="text-orange-600 font-semibold hover:underline"
            >
              티스토리 설정 저장
            </button>
          </div>
        </div>

        {/* 우측 뷰: 실시간 티스토리 포스팅 프리뷰 */}
        <div className="lg:col-span-7">
          {previewPost ? (
            <div className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full">
                    🧡 Tistory Preview
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    [{previewPost.category}]
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {previewPost.status === 'published' ? '🟢 발행 완료' : '⚪ 로컬 보관'}
                </span>
              </div>

              <h3 className="text-xl font-bold font-serif text-slate-900 leading-snug">
                {previewPost.title}
              </h3>

              {/* 티스토리 HTML 렌더링 카드 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 max-h-[500px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: previewPost.full_content }} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 space-y-3">
              <div className="text-4xl">🧡</div>
              <div className="text-sm font-semibold text-slate-600">
                아직 생성된 티스토리 묵상 프리뷰가 없습니다.
              </div>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                왼쪽 컨트롤 폼에서 원하는 성경 주제와 어투를 선택하고 [티스토리 묵상 포스팅 생성하기] 버튼을 누르시면 정교한 티스토리 포스팅이 생성됩니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단: 티스토리 발행 이력 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
          <span>📜 최근 발행된 티스토리 묵상 포스팅 ({posts.length}개)</span>
          <button
            onClick={fetchBiblePosts}
            className="text-xs text-orange-600 hover:underline font-normal"
          >
            🔄 새로고침
          </button>
        </h3>

        {posts.length === 0 ? (
          <p className="text-xs text-slate-500">저장된 묵상 포스트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.slice(0, 6).map((post) => (
              <div
                key={post.id}
                onClick={() => setPreviewPost(post)}
                className="p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-sm cursor-pointer transition-all space-y-2 bg-slate-50/50 hover:bg-white"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-orange-700">[{post.passage}]</span>
                  <span className="text-slate-400">{post.created_at?.substring(0, 10)}</span>
                </div>
                <div className="font-bold text-slate-800 text-sm truncate">
                  {post.title}
                </div>
                <div className="text-xs text-slate-500 line-clamp-2">
                  {post.meditation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
