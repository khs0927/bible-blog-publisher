import { useState } from 'react';
import axios from 'axios';
import BiblePublisher from './components/BiblePublisher';

const ADMIN_KEY_STORAGE = 'bbp_admin_key';

// Attach the admin key (kept only in this browser tab's sessionStorage) to API calls.
axios.interceptors.request.use((config) => {
  const key = sessionStorage.getItem(ADMIN_KEY_STORAGE);
  if (key) config.headers['X-Admin-Key'] = key;
  return config;
});

function App() {
  const [message, setMessage] = useState('');
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) || '');

  const saveAdminKey = (value) => {
    setAdminKey(value);
    if (value) sessionStorage.setItem(ADMIN_KEY_STORAGE, value);
    else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🧡</span> 티스토리 성경 묵상 자동 발행 시스템 v2.0
          </h1>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            관리자 키
            <input
              type="password"
              value={adminKey}
              onChange={(e) => saveAdminKey(e.target.value)}
              placeholder="ADMIN_API_KEY"
              className="px-2 py-1 rounded border border-gray-300 font-mono text-xs"
            />
          </label>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {message && (
          <div className="mb-6 p-4 rounded-md bg-blue-50 text-blue-800 border border-blue-200">{message}</div>
        )}
        <BiblePublisher key={adminKey ? 'auth' : 'anon'} setMessage={setMessage} />
      </main>
    </div>
  );
}

export default App;
