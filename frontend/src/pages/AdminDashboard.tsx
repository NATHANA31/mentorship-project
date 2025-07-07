import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{ mentorCount: number; menteeCount: number; totalCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/api/auth/site-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.errors?.[0]?.msg || 'Failed to fetch site stats');
        } else {
          setStats(data);
        }
      } catch (err) {
        setError('Server error.');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Overview</h1>
      {loading ? (
        <div className="loading">Loading site stats...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : stats ? (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Mentors</h3>
            <p className="stat-number">{stats.mentorCount}</p>
          </div>
          <div className="stat-card">
            <h3>Mentees</h3>
            <p className="stat-number">{stats.menteeCount}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalCount}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
