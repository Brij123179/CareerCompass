import React, { useState } from 'react';
import { Sparkles, Key, Check, AlertCircle, X, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { MentorService, OPENROUTER_MODELS } from '../services/mentorService';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState(MentorService.getApiKey());
  const [selectedModel, setSelectedModel] = useState(MentorService.getModel());
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      MentorService.setApiKey('');
      MentorService.setModel(selectedModel);
      setStatus('idle');
      onKeySaved();
      onClose();
      return;
    }

    setStatus('testing');
    setErrorMessage('');

    try {
      // Test key on OpenRouter with a fast test prompt
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
          'X-Title': 'CareerCompass Validation'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: 'Say hello in 1 word' }],
          max_tokens: 10
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenRouter responded with status ${res.status}`);
      }

      MentorService.setApiKey(apiKey.trim());
      MentorService.setModel(selectedModel);
      setStatus('success');
      setTimeout(() => {
        onKeySaved();
        onClose();
      }, 700);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Verification failed. Please check the OpenRouter key.');
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
        maxWidth: '540px',
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
            <Cpu size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Intelligence Engine</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Connect high-speed AI engines for live career intelligence
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Dynamic Offline Engine Active by Default:</strong> Even without an OpenRouter key, CareerCompass answers all questions dynamically using the student's 9D profile.
            </span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.8rem' }}>
            To enable live streaming generation across state-of-the-art models, enter your OpenRouter key below.
          </p>
        </div>

        {/* Model Selector */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Select OpenRouter Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {OPENROUTER_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.tag})
              </option>
            ))}
          </select>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            OpenRouter API Key
          </label>
          <div style={{ position: 'relative' }}>
            <Key size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="password"
              placeholder="Paste your OpenRouter API key..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setStatus('idle');
              }}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: status === 'error' ? '1px solid var(--accent-rose)' : '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontSize: '0.8rem', marginTop: '6px' }}>
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontSize: '0.8rem', marginTop: '6px' }}>
              <Check size={14} />
              <span>OpenRouter key verified and connected successfully!</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.82rem',
              color: 'var(--accent-indigo)',
              textDecoration: 'none'
            }}
          >
            <span>Get an OpenRouter API key</span>
            <ExternalLink size={12} />
          </a>

          {apiKey && (
            <button
              onClick={handleClearKey}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Remove saved key
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
            {status === 'testing' ? 'Verifying on OpenRouter...' : 'Save & Connect'}
          </button>
        </div>
      </div>
    </div>
  );
};
