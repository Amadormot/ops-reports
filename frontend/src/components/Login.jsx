import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Verifica a senha via variável de ambiente (fallback para 'adminops' para testes locais se não existir)
    const validPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'adminops';
    
    if (password === validPassword) {
      setError(false);
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '3rem',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de fundo top */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          background: 'var(--primary)',
          opacity: 0.1,
          filter: 'blur(60px)',
          borderRadius: '50%'
        }} />

        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <Lock size={30} color="var(--primary)" />
        </div>

        <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
          Ops Reports
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Painel de operações sigilosas
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Digite a senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 1.2rem',
                background: 'rgba(15, 23, 42, 0.4)',
                border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: error ? '0 0 0 1px #ef4444' : 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : 'var(--border)'}
            />
            {error && (
              <ShieldAlert size={18} color="#ef4444" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </div>
          
          <button
            type="submit"
            className="btn"
            style={{
              width: '100%',
              padding: '1rem',
              justifyContent: 'center',
              fontSize: '1rem',
              background: 'var(--primary)',
              color: '#fff',
              marginTop: '0.5rem',
              transition: 'all 0.2s',
              transform: error ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            Entrar no Sistema <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Acesso restrito. Suas ações poderão ser monitoradas.
        </p>
      </div>
    </div>
  );
};

export default Login;
