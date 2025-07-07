import React, { useState, useEffect } from 'react';
import './MentorDashboard.css';

interface User {
  _id: string;
  name: string;
  email: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

interface Session {
  _id: string;
  mentor: User;
  mentee: User;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MentorDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // Get current user ID
  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (currentUserId) {
      fetchSessions();
    }
  }, [currentUserId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/sessions?mentorId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched sessions:', data); // Debug: log fetched sessions
        setSessions(data);
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedSession = await response.json();
        setSessions(sessions.map(s => s._id === sessionId ? updatedSession : s));
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.errors?.[0]?.msg || 'Failed to update session');
      }
    } catch (err) {
      setError('Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s._id !== sessionId));
        setError('');
      }
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Helper to parse session date and time correctly
  const parseSessionDateTime = (dateStr: string, timeStr: string) => {
    const dateObj = new Date(dateStr);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      dateObj.setHours(hours, minutes, 0, 0);
    }
    return dateObj;
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionDate = parseSessionDateTime(session.date, session.time);
      return sessionDate > now && session.status !== 'cancelled';
    }).sort((a, b) => parseSessionDateTime(a.date, a.time).getTime() - parseSessionDateTime(b.date, b.time).getTime());
  };

  const getPastSessions = () => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionDate = parseSessionDateTime(session.date, session.time);
      return sessionDate <= now;
    }).sort((a, b) => parseSessionDateTime(b.date, b.time).getTime() - parseSessionDateTime(a.date, a.time).getTime());
  };

  const upcomingSessions = getUpcomingSessions();
  const pastSessions = getPastSessions();

  return (
    <div className="mentor-dashboard">
      <h1>Mentor Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <p className="stat-number">{sessions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Sessions</h3>
          <p className="stat-number">{upcomingSessions.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Sessions</h3>
          <p className="stat-number">{sessions.filter(s => s.status === 'pending').length}</p>
        </div>
      </div>

      <div className="session-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Sessions
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : (
        <div className="sessions-container">
          {/* Upcoming Sessions Section */}
          <div className="sessions-section">
            <h2>Upcoming Sessions</h2>
            {upcomingSessions.length === 0 ? (
              <p className="no-sessions">No upcoming sessions.</p>
            ) : (
              <div className="sessions-list">
                {upcomingSessions
                  .filter(session => filter === 'all' || session.status === filter)
                  .map(session => (
                    <div key={session._id} className="session-card upcoming">
                      <div className="session-header">
                        <h4>Session with {session.mentee.name}</h4>
                        <span className={`status status-${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="session-details">
                        <p><strong>Date:</strong> {parseSessionDateTime(session.date, session.time).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {parseSessionDateTime(session.date, session.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Mentee:</strong> {session.mentee.email}</p>
                        <p><strong>Booked:</strong> {new Date(session.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="session-actions">
                        {session.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateSessionStatus(session._id, 'confirmed')}
                              className="confirm-button"
                            >
                              Confirm Session
                            </button>
                            <button
                              onClick={() => handleUpdateSessionStatus(session._id, 'cancelled')}
                              className="cancel-button"
                            >
                              Decline Session
                            </button>
                          </>
                        )}
                        {session.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateSessionStatus(session._id, 'cancelled')}
                            className="cancel-button"
                          >
                            Cancel Session
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSession(session._id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {/* Past Sessions Section */}
          <div className="sessions-section">
            <h2>Past Sessions</h2>
            {pastSessions.length === 0 ? (
              <p className="no-sessions">No past sessions.</p>
            ) : (
              <div className="sessions-list">
                {pastSessions
                  .filter(session => filter === 'all' || session.status === filter)
                  .map(session => (
                    <div key={session._id} className="session-card past">
                      <div className="session-header">
                        <h4>Session with {session.mentee.name}</h4>
                        <span className={`status status-${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="session-details">
                        <p><strong>Date:</strong> {parseSessionDateTime(session.date, session.time).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {parseSessionDateTime(session.date, session.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Mentee:</strong> {session.mentee.email}</p>
                        <p><strong>Booked:</strong> {new Date(session.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="session-actions">
                        <button
                          onClick={() => handleDeleteSession(session._id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;