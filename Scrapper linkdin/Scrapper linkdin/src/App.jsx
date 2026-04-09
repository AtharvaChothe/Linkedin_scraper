import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/profiles`);
      setProfiles(resp.data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setStatus('Logging in...');
    try {
      await axios.post(`${API_BASE}/login`, { email, password });
      setLoggedIn(true);
      setStatus('Logged in successfully');
    } catch (err) {
      console.error('Login error:', err);
      setStatus('Failed to establish session. Please check your credentials and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setStatus('Scraping...');
    try {
      const resp = await axios.post(`${API_BASE}/scrape`, { url });
      setProfiles(resp.data.data);
      setStatus('Scraping complete!');
    } catch (err) {
      console.error('Scrape error:', err);
      setStatus('An error occurred during scraping. Please try again.');
    } finally {
      setLoading(false);
      setUrl('');
    }
  };

  const handleExport = (format) => {
    window.open(`${API_BASE}/export/${format.toLowerCase()}`, '_blank');
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>LinkedIn Scrapper Pro</h1>
        <p>Production-ready LinkedIn profile data extraction with ease.</p>
      </header>

      {!loggedIn && (
        <div className="card login-form">
          <h2>LinkedIn Authentication</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            We'll need your credentials once to establish a secure session. 
            <br/><b>Warning:</b> Headful browser session will open on the server.
          </p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <input 
                type="email" 
                placeholder="LinkedIn Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="password" 
                placeholder="LinkedIn Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loginLoading} style={{width: '100%'}}>
              {loginLoading ? <div className="loader"></div> : 'Establish Session'}
            </button>
            {status && !loggedIn && (
              <div style={{ marginTop: '15px', color: status.includes('Failed') ? '#dc2626' : '#059669', fontSize: '0.9rem', fontWeight: 500 }}>
                {status}
              </div>
            )}
          </form>
        </div>
      )}

      {loggedIn && (
        <div className="card">
          <form className="input-container" onSubmit={handleScrape}>
            <input 
              type="text" 
              placeholder="Paste LinkedIn Profile URL (e.g., https://www.linkedin.com/in/reidhoffman/)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <div className="loader"></div> : 'Scrape Profile'}
            </button>
          </form>
          <div className="status-bar">
            <div className="status-text">
              Status: <span className={`status-msg ${status.includes('error') || status.includes('Failed') ? 'error' : ''}`}>{status}</span>
            </div>
            <div className="export-group">
              <button className="btn-export" onClick={() => handleExport('CSV')}>Export CSV</button>
              <button className="btn-export" onClick={() => handleExport('JSON')}>Export JSON</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Extracted Results</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Headline</th>
                <th>Location</th>
                <th>About</th>
                <th>Experience</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No data fetched yet.</td>
                </tr>
              ) : (
                profiles.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.fullName}</td>
                    <td style={{ maxWidth: '200px', fontSize: '0.9rem' }}>{p.headline}</td>
                    <td>{p.location}</td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#555' }}>
                      {p.about?.substring(0, 100)}...
                    </td>
                    <td>{p.experience?.length || 0} Positions</td>
                    <td>
                      <a href={p.profileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'none' }}>View Profile</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
