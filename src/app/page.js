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

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAOijGPli7nfH38drf72jiENjx1cHjHmNE",
  authDomain: "dashboard-8fb4e.firebaseapp.com",
  projectId: "dashboard-8fb4e",
  storageBucket: "dashboard-8fb4e.firebasestorage.app",
  messagingSenderId: "1046394550689",
  appId: "1:1046394550689:web:27c5186c6060a78c6df3e0",
  measurementId: "G-K1XFBK3BCG",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('user_email');
  const [env, setEnv] = useState('dev'); // Current environment
  const [shifting, setShifting] = useState(false); // Env switching state

  const allowedDomain = 'yonderwonder.ai';

  // --- Environment Handling (Persist in localStorage) ---
  useEffect(() => {
    const savedEnv = localStorage.getItem('dashboard_env');
    if (savedEnv) {
      setEnv(savedEnv);
    } else {
      localStorage.setItem('dashboard_env', 'dev');
      setEnv('dev');
    }
  }, []);

  const API_BASE = 'https://weclick.dev.api.yonderwonder.ai';

  // --- Firebase Auth Persistence ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userDomain = currentUser.email.split('@')[1];
        if (userDomain === allowedDomain) {
          setUser(currentUser);
          loadData();
        } else {
          signOut(auth);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [env]); // reload data when env changes

  // --- Authentication Handlers ---
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

      setUser(loggedUser);
      loadData();
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please try again.');
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
    setGroups([]);
  }

  // --- Data Fetch ---
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/dashboard/api/groups?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Environment Toggle (with 8-sec full loading state) ---
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

      // Save new environment
      localStorage.setItem('dashboard_env', newEnv);
      setEnv(newEnv);

      // Keep full-screen loader visible for 8 seconds
      setTimeout(() => {
        window.location.reload();
      }, 8000);
    } catch (err) {
      console.error('Failed to switch environment:', err);
      // Still show loading until reload to prevent flicker
      setTimeout(() => {
        alert('Environment switch failed. Try again.');
        window.location.reload();
      }, 8000);
    }
  }

  // --- Filtering Logic ---
  const filteredGroups = groups.filter((group) => {
    if (searchType === 'prompt') {
      const groupPrompt =
        group.output_images.length > 0 ? group.output_images[0].prompt : '';
      return groupPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchType === 'group_id') {
      return group.group_id.toString().includes(searchQuery);
    } else if (searchType === 'user_email') {
      return group.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // --- Loading or Switching State ---
  if (loading || shifting) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          color: '#d1d5db',
          fontSize: '18px',
          flexDirection: 'column',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '36px',
            height: '36px',
            border: '4px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            marginBottom: '16px',
          }}
        />
        {shifting
          ? `Switching environment...`
          : `Loading dashboard (${env.toUpperCase()} environment)...`}
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div style={{ textAlign: 'center', color: '#f87171', marginTop: '40px' }}>
        Error loading dashboard: {error}
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
        color: 'white',
        padding: '24px',
        overflowX: 'hidden',
      }}
    >
      {/* Search + Env Toggle + User Info */}
      {user && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '32px',
            maxWidth: '800px',
            marginLeft: '25px',
          }}
        >
          {/* Search + Toggle Row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center' }}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: 'white',
                fontSize: '14px',
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
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            {/* Environment Toggle */}
            <button
              onClick={handleEnvToggle}
              disabled={shifting}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: shifting ? '#64748b' : '#3b82f6',
                color: 'white',
                fontWeight: 500,
                cursor: shifting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {shifting
                ? `Switching...`
                : `Current: ${env.toUpperCase()} | Switch`}
            </button>
          </div>

          {/* User Info & Logout */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: 'white',
              fontSize: '14px',
            }}
          >
            <span>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Groups */}
      {user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {filteredGroups.length > 0 ? (
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
        </div>
      )}

      {/* 🔐 LOGIN MODAL */}
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
              zIndex: 40,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                padding: '48px 40px',
                width: '90%',
                maxWidth: '400px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                margin: '10px auto',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '32px' }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    padding: '10px',
                    borderRadius: '50%',
                    marginBottom: '12px',
                    display: 'inline-flex',
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Logo"
                    style={{ width: '30px', height: '30px' }}
                  />
                </div>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Welcome to <span style={{ color: '#60a5fa' }}>Yonder Dashboard</span>
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>
                  Sign in using your company Google account
                </p>
              </motion.div>
              <button
                onClick={handleLogin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: 'white',
                  color: '#444',
                  fontWeight: 500,
                  borderRadius: '10px',
                  padding: '12px 20px',
                  width: '100%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f1f1')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Continue with Google</span>
              </button>
              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '20px' }}>
                Access restricted to <span style={{ color: '#60a5fa' }}>@{allowedDomain}</span> users
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
