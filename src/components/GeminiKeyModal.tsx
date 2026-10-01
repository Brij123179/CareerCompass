import React, { useState } from 'react';
import { Sparkles, Key, Check, AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { MentorService } from '../services/mentorService';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState(MentorService.getApiKey());
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      MentorService.setApiKey('');
      setStatus('idle');
      onKeySaved();
      onClose();
      return;
    }

    setStatus('testing');
    setErrorMessage('');

    try {
      // Test the API key with a minimal query
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
        })
      });

      if (!res.ok) {
        throw new Error(`API Key invalid or quota exceeded (Status ${res.status})`);
      }

      MentorService.setApiKey(apiKey.trim());
      setStatus('success');
      setTimeout(() => {
        onKeySaved();
        onClose();
      }, 700);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Verification failed. Please check the key.');
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    MentorService.setApiKey('');
    setStatus('idle');
    onKeySaved();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '30px',
        position: 'relative',
        border: '1px solid var(--border-glow)',
        background: 'var(--bg-card)'
      }}>
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: '18px', right: '18px' }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(79, 70, 229, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-indigo)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Live Gemini API Integration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enable real-time LLM intelligence for "Ask CareerCompass"
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Zero-Setup Offline Engine Active by Default:</strong> Even without an API key, CareerCompass includes a built-in context-aware expert advisor engine.
            </span>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.82rem' }}>
            Enter your Google Gemini API key to activate live generative streaming with Google’s latest Gemini Flash models.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Google Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setStatus('idle');
              }}
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: status === 'error' ? '1px solid var(--accent-rose)' : '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontSize: '0.82rem', marginTop: '8px' }}>
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.82rem', marginTop: '8px' }}>
              <Check size={14} />
              <span>API key verified and connected successfully!</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.82rem',
              color: 'var(--accent-cyan)',
              textDecoration: 'none'
            }}
          >
            <span>Get a free Gemini API key</span>
            <ExternalLink size={12} />
          </a>

          {apiKey && (
            <button
              onClick={handleClearKey}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Remove saved key
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={status === 'testing'}
            className="btn-primary"
            style={{ flex: 1.4 }}
          >
            {status === 'testing' ? 'Verifying...' : 'Save & Connect'}
          </button>
        </div>
      </div>
    </div>
  );
};
