'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GroupCard from '../component/GroupCard';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_DEV;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [paidUsers, setPaidUsers] = useState([]); // ✅ added
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('user_email');
  const [env, setEnv] = useState('prod');
  const [shifting, setShifting] = useState(false);
  const [showMode, setShowMode] = useState('groups'); // 'groups' | 'message'

  useEffect(() => {
    const savedEnv = localStorage.getItem('dashboard_env');
    if (savedEnv) setEnv(savedEnv);
    else {
      localStorage.setItem('dashboard_env', 'prod');
      setEnv('prod');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userDomain = currentUser.email.split('@')[1];
        if (userDomain === allowedDomain) {
          setUser(currentUser);
          localStorage.setItem('email', currentUser.email);
          loadData();
        } else {
          signOut(auth);
        }
      } else setUser(null);
    });
    return () => unsubscribe();
  }, [env]);

  async function handleLogin() {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      const userDomain = loggedUser.email.split('@')[1];
      if (userDomain !== allowedDomain) {
        alert(`Access restricted. Use an @${allowedDomain} email.`);
        await signOut(auth);
        return;
      }
      localStorage.setItem('email', loggedUser.email);
      setUser(loggedUser);
      loadData();
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please try again.');
    }
  }

  async function handleLogout() {
    localStorage.removeItem('email');
    await signOut(auth);
    setUser(null);
    setGroups([]);
  }

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/dashboard/api/groups?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  async function loadPaidUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/dashboard/api/users/paid?limit=200`);
      if (!res.ok) throw new Error('Failed to fetch paid users');
      const data = await res.json();
      setPaidUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnvToggle() {
    const newEnv = env === 'dev' ? 'prod' : 'dev';
    setShifting(true);
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/dashboard/switch-env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env_name: newEnv }),
      });
      localStorage.setItem('dashboard_env', newEnv);
      setEnv(newEnv);
      setTimeout(() => {
        window.location.reload();
      }, 8000);
    } catch (err) {
      console.error('Failed to switch environment:', err);
      setTimeout(() => {
        alert('Environment switch failed. Try again.');
        window.location.reload();
      }, 8000);
    }
  }

  const filteredGroups = groups.filter((group) => {
    if (searchType === 'prompt') {
      const prompt = group.output_images.length > 0 ? group.output_images[0].prompt : '';
      return prompt.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchType === 'group_id') {
      return group.group_id.toString().includes(searchQuery);
    } else if (searchType === 'user_email') {
      return group.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading || shifting)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          color: '#d1d5db',
          fontSize: '18px',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 36,
            height: 36,
            border: '4px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            marginBottom: 16,
          }}
        />
        {shifting
          ? 'Switching environment...'
          : `Loading dashboard (${env.toUpperCase()} environment)...`}
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: 'center', color: '#f87171', marginTop: 40 }}>
        Error loading dashboard: {error}
      </div>
    );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
        color: 'white',
        padding: 24,
      }}
    >
      {user && (
        <>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 24,
              maxWidth: 800,
              marginLeft: 25,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="prompt">Prompt</option>
                <option value="group_id">Group ID</option>
                <option value="user_email">Email</option>
              </select>
              <input
                type="text"
                placeholder={`Search by ${searchType}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: 'white',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                {/* Reprocess KL Button */}
                <button
                  onClick={async (event) => {
                    const limitStr = prompt('How many groups to reprocess?', '50');
                    if (!limitStr) return;
                    const limit = parseInt(limitStr, 10);
                    if (isNaN(limit) || limit <= 0) {
                      alert('Please enter a valid number greater than 0.');
                      return;
                    }

                    if (!confirm(`Are you sure you want to reprocess the latest ${limit} groups?`)) return;

                    const btn = event.currentTarget;
                    const oldText = btn.innerText;
                    btn.disabled = true;
                    btn.innerText = 'Reprocessing...';

                    try {
                      const res = await fetch(`${API_BASE}/dashboard/api/reprocess-latest-groups?limit=${limit}`, {
                        method: 'POST',
                      });
                      const data = await res.json();

                      if (res.ok) {
                        alert(`✅ Successfully queued ${data.queued || limit} groups for reprocessing.`);
                      } else {
                        alert(`❌ Failed: ${data.detail || JSON.stringify(data)}`);
                      }
                    } catch (err) {
                      console.error(err);
                      alert('❌ Error starting reprocess. Check console for details.');
                    } finally {
                      btn.disabled = false;
                      btn.innerText = oldText;
                    }
                  }}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Regenerate with KL
                </button>

                {/* Open Playground Button */}
                <button
                  onClick={() => (window.location.href = '/process')}
                  style={{
                    background: 'rgba(37,99,235,0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(37,99,235,0.4)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Open Playground
                </button>
              </div>

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
              }}
            >
              <span>{user.email}</span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          </div>


          <div style={{ display: 'flex', gap: 12, justifyContent: 'left', marginBottom: 12, marginLeft: 25 }}>
            <button
              onClick={() => {
                setShowMode('groups');
                loadData();
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: 8,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Show All Group Data
            </button>
            <button
              onClick={() => {
                setShowMode('message');
                loadPaidUsers();
              }}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: 8,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Show Paid Users
            </button>
          </div>


          {showMode === 'message' ? (
            paidUsers.length > 0 ? (
              <div style={{ marginLeft: 25, marginTop: 20 }}>
                <h2 style={{ color: '#a7f3d0', fontSize: 18, marginBottom: 10 }}>Paid Users ({paidUsers.length})</h2>
                <table style={{ width: '95%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#334155' }}>
                      <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
                      <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 10, textAlign: 'left' }}>Created At</th>
                      <th style={{ padding: 10, textAlign: 'left' }}>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #475569' }}>
                        <td style={{ padding: 10 }}>{u.email}</td>
                        <td style={{ padding: 10 }}>{u.name || '—'}</td>
                        <td style={{ padding: 10 }}>{u.created_at?.split('T')[0]}</td>
                        <td style={{ padding: 10 }}>{u.is_paid ? '✅ Yes' : '❌ No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 40 }}>
                No paid users found
              </div>
            )
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group, idx) => (
              <motion.div
                key={group.group_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GroupCard group={group} />
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>No groups found</div>
          )}
        </>
      )}

      {!user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(51,65,85,0.8)',
                borderRadius: 24,
                padding: '48px 40px',
                width: '90%',
                maxWidth: 400,
                textAlign: 'center',
              }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Logo"
                style={{ width: 30, height: 30, marginBottom: 12 }}
              />
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>
                Welcome to <span style={{ color: '#60a5fa' }}>WeClick Dashboard</span>
              </h1>
              <p style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>
                Sign in using your company Google account
              </p>
              <button
                onClick={handleLogin}
                style={{
                  marginTop: 24,
                  backgroundColor: 'white',
                  color: '#444',
                  fontWeight: 500,
                  borderRadius: 10,
                  padding: '12px 20px',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                Continue with Google
              </button>
              <p style={{ color: '#6b7280', fontSize: 12, marginTop: 20 }}>
                Access restricted to <span style={{ color: '#60a5fa' }}>@{allowedDomain}</span> users
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
