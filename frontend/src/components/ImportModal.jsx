import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { importFileToSupabase } from '../services/importService';

const ImportModal = ({ isOpen, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const result = await importFileToSupabase(file);
      setResult({ success: result.success, message: result.message, errors: result.errors });
      if (result.success && onRefresh) onRefresh();
    } catch (error) {
      setResult({ success: false, message: 'Erro técnico ao processar o arquivo. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', background: 'var(--bg-card)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={24} className="text-primary" /> Importar Planilha
        </h2>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <a
            href="/modelo_importacao.csv"
            download="modelo_importacao.csv"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--primary)',
              textDecoration: 'none',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.target.style.background = 'rgba(59, 130, 246, 0.2)'; e.target.style.borderColor = 'var(--primary)'; }}
            onMouseOut={(e) => { e.target.style.background = 'rgba(59, 130, 246, 0.1)'; e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'; }}
          >
            Baixar Arquivo Modelo (.csv)
          </a>
        </div>

        <div style={{ border: '2px dashed var(--border)', padding: '2rem', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.3)' }}>
          <input
            type="file"
            id="fileInput"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <Upload size={32} style={{ margin: '0 auto' }} />
            </div>
            <p style={{ fontWeight: 600, color: file ? 'var(--primary)' : 'var(--text-main)' }}>{file ? file.name : 'Clique para selecionar o arquivo'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Formatos aceitos: .xlsx e .csv</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Colunas: Cliente, Projeto, Término Real, Total, Segmento, Time, Squad, Impetitivos, Status</p>
          </label>
        </div>

        {result && (
          <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${result.success ? 'var(--success)' : 'var(--danger)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              {result.success ? <CheckCircle size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
              <span>{result.message}</span>
            </div>
            {result.errors && result.errors.length > 0 && (
              <ul style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--danger)', listStyle: 'none', padding: 0 }}>
                {result.errors.map((err, i) => <li key={i}>• {err}</li>)}
              </ul>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpload} disabled={!file || loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Processar Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
