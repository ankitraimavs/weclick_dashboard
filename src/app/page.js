'use client';

import { useEffect, useState } from 'react';
import GroupCard from '../component/GroupCard';

export default function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('user_email');

  const API_BASE = 'https://weclick.dev.api.yonderwonder.ai';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/dashboard/api/groups?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setGroups(data.groups || []);
      console.log('Data load attempt finished', JSON.stringify(data.groups.output_images, null, 2));
       const group168 = (data.groups || []).find((g) => g.group_id === 179);
    console.log('Group 168 data:', group168);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Filter groups based on search
  const filteredGroups = groups.filter((group) => {
    if (searchType === 'prompt') {
      const groupPrompt = group.output_images.length > 0 ? group.output_images[0].prompt : '';
      return groupPrompt.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (searchType === 'group_id') {
      return group.group_id.toString().includes(searchQuery);
    }else if (searchType === 'user_email') {
      return group.user_email.toString().includes(searchQuery);
    }
    return true;
  });

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );

  if (error)
    return <div className="error-banner"> Error loading dashboard: {error}</div>;

  if (groups.length === 0)
    return (
      <div className="empty-state">
        <p>No groups found in the last 48 hours</p>
      </div>
    );

return (
  <div className="container" style={{ width: '100%', padding: '16px', justifyContent: 'end',
        alignItems: 'center', }}>
    <div
      style={{
       display: 'flex', gap: '8px', maxWidth: '600px', width: '100%', marginLeft:'30px'
      }}
    >
      <input
        type="text"
        placeholder={`Search by ${searchType}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          flex: 1,
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #64748b',
          background: 'rgba(30,41,59,0.85)',
          color: '#f1f5f9',
          outline: 'none',
        }}
      />

      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #64748b',
          background: 'rgba(30,41,59,0.85)',
          color: '#f1f5f9',
          cursor: 'pointer',
        }}
      >
        <option value="prompt">Prompt</option>
        <option value="group_id">Group ID</option>
         <option value="user_email">Email</option>
      </select>
    </div>


    {filteredGroups.length > 0 ? (
      filteredGroups.map((group) => <GroupCard key={group.group_id} group={group} />)
    ) : (
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>No groups found</div>
    )}
  </div>
);

}
