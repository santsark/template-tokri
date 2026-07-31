'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin() {
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream, #F7F1E3)' }}>
      <div style={{ background: '#fff', padding: 36, borderRadius: 16, width: 320, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', marginBottom: 20 }}>Template Tokri Admin</h2>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #E4DFD3', marginBottom: 12 }}
        />
        {error && <div style={{ color: '#A64A2A', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button
          onClick={handleLogin}
          style={{ width: '100%', padding: 11, borderRadius: 8, border: 'none', background: '#1E2B3C', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          Log in
        </button>
      </div>
    </div>
  );
}
