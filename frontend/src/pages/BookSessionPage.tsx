import React, { useState, useEffect } from 'react';
import './BookSessionPage.css';

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

const BookSessionPage: React.FC = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('role') || '';

  // Get current user ID (you'll need to implement this based on your auth system)
  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (currentUserId) {
      if (userRole === 'mentee') {
        fetchMentors();
        fetchSessions(); // mentee sessions
      } else if (userRole === 'mentor') {
        fetchMentorSessions(); // mentor sessions
      }
    }
  }, [currentUserId, userRole]);

  const fetchMentors = async () => {
    try {
      console.log('Fetching mentors for user:', currentUserId);
      const response = await fetch(`${apiUrl}/api/sessions/mentees/${currentUserId}/mentors`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Mentors data received:', data);
        setMentors(data);
      } else {
        console.log('Response not ok:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError('Failed to fetch mentors');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/sessions?menteeId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      setError('Failed to fetch sessions');
    }
  };

  const fetchMentorSessions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/sessions?mentorId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      setError('Failed to fetch sessions');
    }
  };

  const handleMentorSelect = async (mentor: User) => {
    setSelectedMentor(mentor);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleBookSession = async () => {
    if (!selectedMentor || !selectedDate || !selectedTime) {
      setError('Please select a mentor, date, and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          menteeId: currentUserId,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      if (response.ok) {
        const newSession = await response.json();
        setSessions([...sessions, newSession]);
        setSelectedDate('');
        setSelectedTime('');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.errors?.[0]?.msg || 'Failed to book session');
      }
    } catch (err) {
      setError('Failed to book session');
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
      }
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  const getAvailableTimes = (mentor: User) => {
    if (!mentor.availability) return [];
    
    const times = [];
    const [startHour, startMin] = mentor.availability.startTime.split(':').map(Number);
    const [endHour, endMin] = mentor.availability.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      times.push(`${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`);
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    return times;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  console.log('Mentors:', mentors);
  console.log('Current User ID:', currentUserId);

  return (
    <div className="book-session-page">
      <h1>Session Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {userRole === 'mentor' ? (
        <div className="mentor-sessions-list">
          <h2>Sessions Booked With You</h2>
          {sessions.length === 0 ? (
            <p className="no-sessions">No sessions have been booked with you yet.</p>
          ) : (
            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session._id} className={`session-card ${session.status}`}> 
                  <div className="session-header">
                    <h4>Session with {session.mentee.name}</h4>
                    <span className={`status status-${getStatusColor(session.status)}`}>{session.status}</span>
                  </div>
                  <div className="session-details">
                    <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {session.time}</p>
                    <p><strong>Mentee:</strong> {session.mentee.email}</p>
                    <p><strong>Booked:</strong> {new Date(session.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="session-container">
          {/* Left Side - Mentor Discovery & Booking */}
          <div className="booking-section">
            <h2>Book a Session</h2>
            
            <div className="mentors-list">
              <h3>Your Accepted Mentors</h3>
              {mentors.length === 0 ? (
                <p>No accepted mentors found. Request mentorship first.</p>
              ) : (
                mentors.map(mentor => (
                  <div
                    key={mentor._id}
                    className={`mentor-card ${selectedMentor?._id === mentor._id ? 'selected' : ''}`}
                    onClick={() => handleMentorSelect(mentor)}
                  >
                    <h4>{mentor.name}</h4>
                    <p>{mentor.email}</p>
                    {mentor.availability && (
                      <div className="availability">
                        <strong>Available:</strong> {mentor.availability.days.join(', ')}
                        <br />
                        <strong>Time:</strong> {mentor.availability.startTime} - {mentor.availability.endTime}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedMentor && (
              <div className="booking-form">
                <h3>Book Session with {selectedMentor.name}</h3>
                
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Time:</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedDate}
                  >
                    <option value="">Select time</option>
                    {selectedDate && selectedMentor.availability && 
                      getAvailableTimes(selectedMentor).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))
                    }
                  </select>
                </div>

                <button
                  onClick={handleBookSession}
                  disabled={loading || !selectedDate || !selectedTime}
                  className="book-button"
                >
                  {loading ? 'Booking...' : 'Book Session'}
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Session Management */}
          <div className="management-section">
            <h2>My Sessions</h2>
            
            {sessions.length === 0 ? (
              <p>No sessions booked yet.</p>
            ) : (
              <div className="sessions-list">
                {sessions.map(session => (
                  <div key={session._id} className="session-card">
                    <div className="session-header">
                      <h4>Session with {session.mentor.name}</h4>
                      <span 
                        className={`status status-${getStatusColor(session.status)}`}
                      >
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="session-details">
                      <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {session.time}</p>
                      <p><strong>Mentor:</strong> {session.mentor.email}</p>
                    </div>

                    <div className="session-actions">
                      {session.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateSessionStatus(session._id, 'confirmed')}
                            className="confirm-button"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateSessionStatus(session._id, 'cancelled')}
                            className="cancel-button"
                          >
                            Cancel
                          </button>
                        </>
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
        </div>
      )}
    </div>
  );
};

export default BookSessionPage; 