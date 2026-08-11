import { useState, useEffect } from 'react';
import axios from 'axios';
import BiblePublisher from './components/BiblePublisher';

// Set API base URL to /api to support both local proxy and Flask static serving
const API_BASE_URL = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('bible');
  const [automationStatus, setAutomationStatus] = useState(false);
  const [uploadInterval, setUploadInterval] = useState(5);
  const [naverId, setNaverId] = useState('');
  const [naverPassword, setNaverPassword] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [topics, setTopics] = useState([]);
  const [writingStyles, setWritingStyles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAutomationStatus();
    fetchPosts();
  }, []);

  const fetchAutomationStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/automation/status/1`);
      setAutomationStatus(response.data.is_active);
      setUploadInterval(response.data.upload_interval);
      setTopics(response.data.topics);
      setWritingStyles(response.data.writing_styles);
    } catch (error) {
      console.error('자동화 상태를 불러오는 데 실패했습니다.', error);
      setMessage('자동화 상태를 불러오는 데 실패했습니다.');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('게시물을 불러오는 데 실패했습니다.', error);
      setMessage('게시물을 불러오는 데 실패했습니다.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/automation/settings`, {
        user_id: 1,
        naver_id: naverId,
        naver_password: naverPassword,
        blog_url: blogUrl,
        topics: topics,
        writing_styles: writingStyles,
        upload_interval: uploadInterval,
      });
      setMessage(response.data.message);
      fetchAutomationStatus();
    } catch (error) {
      console.error('설정 저장에 실패했습니다.', error);
      setMessage('설정 저장에 실패했습니다.');
    }
  };

  const handleStartAutomation = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/automation/start/1`);
      setMessage(response.data.message);
      fetchAutomationStatus();
    } catch (error) {
      console.error('자동화 시작에 실패했습니다.', error);
      setMessage('자동화 시작에 실패했습니다.');
    }
  };

  const handleStopAutomation = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/automation/stop/1`);
      setMessage(response.data.message);
      fetchAutomationStatus();
    } catch (error) {
      console.error('자동화 중지에 실패했습니다.', error);
      setMessage('자동화 중지에 실패했습니다.');
    }
  };

  const handleTestGenerate = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/test/generate`, {
        topic: topics[0] || '인공지능',
        style: writingStyles[0] || '친근체',
      });
      setMessage(response.data.message);
      fetchPosts();
    } catch (error) {
      console.error('테스트 게시물 생성에 실패했습니다.', error);
      setMessage('테스트 게시물 생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🧡</span> 티스토리 성경 묵상 자동 발행 시스템 v2.0
          </h1>
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'bible' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('bible')}
            >
              ✨ 티스토리 묵상 발행
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              대시보드
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'settings' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('settings')}
            >
              설정
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'posts' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('posts')}
            >
              게시물 관리
            </button>
          </div>
        </div>
      </nav>


      <main className="container mx-auto px-4 py-8">
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setMessage('')}>
              <svg className="fill-current h-6 w-6 text-blue-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l3.029-2.651-3.029-2.651a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.029a1.2 1.2 0 1 1 1.697 1.697L11.819 10l3.029 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
          </div>
        )}

        {activeTab === 'bible' && (
          <BiblePublisher setMessage={setMessage} />
        )}

        {activeTab === 'dashboard' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-700">자동화 상태</h3>
                <p className={`text-2xl font-bold ${automationStatus ? 'text-green-600' : 'text-red-600'}`}>
                  {automationStatus ? '활성' : '비활성'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-700">업로드 간격</h3>
                <p className="text-2xl font-bold text-gray-800">{uploadInterval}분</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-700">총 게시물</h3>
                <p className="text-2xl font-bold text-gray-800">{posts.length}개</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                onClick={handleStartAutomation}
                disabled={automationStatus}
              >
                자동화 시작
              </button>
              <button
                className="ml-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                onClick={handleStopAutomation}
                disabled={!automationStatus}
              >
                자동화 중지
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">테스트 기능</h3>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={handleTestGenerate}
              >
                테스트 게시물 생성
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">설정</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="naverId" className="block text-sm font-medium text-gray-700">네이버 아이디</label>
                <input
                  type="text"
                  id="naverId"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={naverId}
                  onChange={(e) => setNaverId(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="naverPassword" className="block text-sm font-medium text-gray-700">네이버 비밀번호</label>
                <input
                  type="password"
                  id="naverPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={naverPassword}
                  onChange={(e) => setNaverPassword(e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500">⚠️ 비밀번호는 암호화되어 안전하게 저장됩니다.</p>
              </div>
              <div>
                <label htmlFor="blogUrl" className="block text-sm font-medium text-gray-700">블로그 URL</label>
                <input
                  type="text"
                  id="blogUrl"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="topics" className="block text-sm font-medium text-gray-700">주제 (쉼표로 구분)</label>
                <input
                  type="text"
                  id="topics"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={topics.join(', ')}
                  onChange={(e) => setTopics(e.target.value.split(',').map(t => t.trim()))}
                />
              </div>
              <div>
                <label htmlFor="writingStyles" className="block text-sm font-medium text-gray-700">글쓰기 어투 (쉼표로 구분)</label>
                <input
                  type="text"
                  id="writingStyles"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={writingStyles.join(', ')}
                  onChange={(e) => setWritingStyles(e.target.value.split(',').map(s => s.trim()))}
                />
              </div>
              <div>
                <label htmlFor="uploadInterval" className="block text-sm font-medium text-gray-700">업로드 간격 (분)</label>
                <input
                  type="number"
                  id="uploadInterval"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={uploadInterval}
                  onChange={(e) => setUploadInterval(parseInt(e.target.value))}
                />
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={handleSaveSettings}
              >
                설정 저장
              </button>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">게시물 관리</h2>
            {posts.length === 0 ? (
              <p className="text-gray-600">게시물이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                    <p className="text-gray-600 text-sm">주제: {post.topic} | 어투: {post.writing_style} | 상태: {post.status}</p>
                    <p className="mt-2 text-gray-700">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
