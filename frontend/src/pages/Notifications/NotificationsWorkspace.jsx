import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const NotificationsWorkspace = () => {
  const [viewTab, setViewTab] = useState('inbox'); // 'inbox' | 'compose'
  const [inboxItems, setInboxItems] = useState([]);
  const [recipientsList, setRecipientsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageBanner, setMessageBanner] = useState({ type: '', text: '' });

  // Compose Message Form States
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'NORMAL',
    recipient_ids: []
  });

  const syncInbox = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications/inbox');
      if (res.data.success) setInboxItems(res.data.data);
    } catch (err) {
      console.error("Inbox data stream failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const res = await API.get('/notifications/eligible-recipients');
      if (res.data.success) setRecipientsList(res.data.data);
    } catch (err) {
      console.error("Recipients retrieval error:", err);
    }
  };

  useEffect(() => {
    syncInbox();
    loadRecipients();
  }, []);

  const handleMsgOpen = async (itemId, isRead) => {
    if (isRead) return;
    try {
      await API.patch(`/notifications/read/${itemId}`);
      syncInbox(); // Refresh state counters immediately
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (formData.recipient_ids.length === 0) {
      setMessageBanner({ type: 'error', text: 'Please select at least one recipient.' });
      return;
    }
    
    setLoading(true);
    setMessageBanner({ type: '', text: '' });
    try {
      const res = await API.post('/notifications/send', formData);
      if (res.data.success) {
        setMessageBanner({ type: 'success', text: 'Message distributed through communication pipelines.' });
        setFormData({ title: '', message: '', priority: 'NORMAL', recipient_ids: [] });
        syncInbox();
        setViewTab('inbox');
      }
    } catch (err) {
      setMessageBanner({ type: 'error', text: 'Failed to deliver message package.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '1px' }}>
            Communication Hub Node
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.5rem 0 0 0', color: '#fff' }}>
            System Notifications & Alerts
          </h1>
        </div>
        
        {/* Workspace Operations Switch Links */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setViewTab('inbox')}
            className="submit-btn"
            style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem', background: viewTab === 'inbox' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)' }}
          >
            📥 Inbox Matrix
          </button>
          <button 
            onClick={() => setViewTab('compose')}
            className="submit-btn"
            style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem', background: viewTab === 'compose' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)' }}
          >
            ✍️ Compose Message
          </button>
        </div>
      </div>

      {messageBanner.text && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem',
          background: messageBanner.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: messageBanner.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${messageBanner.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          {messageBanner.text}
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW A: INBOX TAB SUBPANEL CONTAINER */}
      {/* =================================================================== */}
      {viewTab === 'inbox' ? (
        <div className="metric-panel-card" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ color: 'var(--text-sub)' }}>Synchronizing secure updates...</div>
          ) : inboxItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
              Your communication node inbox ledger is currently clear.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inboxItems.map((item) => (
                <div 
                  key={item.recipient_notification_id} 
                  onClick={() => handleMsgOpen(item.recipient_notification_id, item.is_read)}
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${item.priority === 'URGENT' ? '#ef4444' : item.priority === 'IMPORTANT' ? '#f59e0b' : 'var(--accent-color)'}`,
                    background: item.is_read ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>{item.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0.5rem 0' }}>{item.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>
                      From: {item.sender_name || 'System Authority'} ({item.sender_role.replace('_', ' ')})
                    </span>
                    {!item.is_read && (
                      <span style={{ color: '#10b981', fontWeight: 'bold', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        ● New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* VIEW B: COMPOSE TRANSMISSION CARD ENTRY FORM */
        /* =================================================================== */
        <div style={{ maxWidth: '750px' }}>
          <form onSubmit={handleSendMessage} className="glass-auth-card" style={{ width: '100%', padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Target Recipient Address Node</label>
              <select 
                multiple
                value={formData.recipient_ids} 
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
                  setFormData({ ...formData, recipient_ids: options });
                }}
                className="form-input"
                style={{ height: '120px', padding: '0.5rem', cursor: 'pointer' }}
                required
              >
                {recipientsList.map(r => (
                  <option key={r.user_id} value={r.user_id}>
                    [{r.role.toUpperCase()}] {r.full_name} ({r.email})
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--text-sub)', marginTop: '0.25rem', display: 'block' }}>
                * Hold Ctrl (or Cmd) to multi-select several distribution targets simultaneously.
              </small>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">Subject Line Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input" 
                  placeholder="Enter notification subject banner heading..."
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Transmission Priority Index</label>
                <select 
                  value={formData.priority} 
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="form-input"
                >
                  <option value="NORMAL">Normal Delivery</option>
                  <option value="IMPORTANT">Important Flag Alert</option>
                  <option value="URGENT">Urgent Protocol Intervention</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message Content Body Context</label>
              <textarea 
                value={formData.message} 
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-input" 
                rows="5" 
                placeholder="Compose notification text body array blocks here..."
                required
              ></textarea>
            </div>

            <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Transmitting Data Arrays...' : 'Broadcast Communication Payload'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotificationsWorkspace;