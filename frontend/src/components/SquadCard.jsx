import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Tag, Users, Calendar, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  'PLANEJAMENTO':   { label: 'Planejado',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'EM_IMPLANTACAO': { label: 'Em Implantação',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  'ENTREGUE':       { label: 'Entregue',        color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status || '-', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '999px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

const ProjectRow = ({ project }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.6rem 0.75rem', borderRadius: '8px',
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s'
  }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
  >
    {/* Status */}
    <StatusBadge status={project.status} />

    {/* Cliente + Projeto */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.1rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {project.client_name}
      </p>
      <p style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
        {project.name}
      </p>
    </div>

    {/* Tags */}
    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
      {project.segment_name && (
        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.2)', fontWeight: 600 }}>
          {project.segment_name}
        </span>
      )}
      {project.team_name && (
        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(59,130,246,0.08)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)', fontWeight: 600 }}>
          {project.team_name}
        </span>
      )}
    </div>

    {/* Data */}
    {project.actual_end_date && (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
        <Calendar size={11} /> {project.actual_end_date}
      </span>
    )}

    {/* Impeditivo */}
    {project.impediments && (
      <AlertCircle size={14} color="var(--danger)" title={project.impediments} style={{ flexShrink: 0 }} />
    )}
  </div>
);

const SquadCard = ({ squad, projects }) => {
  const [expanded, setExpanded] = useState(true);

  const counts = {
    PLANEJAMENTO: projects.filter(p => p.status === 'PLANEJAMENTO').length,
    EM_IMPLANTACAO: projects.filter(p => p.status === 'EM_IMPLANTACAO').length,
    ENTREGUE: projects.filter(p => p.status === 'ENTREGUE').length,
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header do Squad */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          textAlign: 'left',
        }}
      >
        {/* Hash + Nome */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>
            # {squad || 'Sem Squad'}
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
          </span>
        </div>

        {/* Mini status bar */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {counts.PLANEJAMENTO > 0 && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              {counts.PLANEJAMENTO} Planejado{counts.PLANEJAMENTO > 1 ? 's' : ''}
            </span>
          )}
          {counts.EM_IMPLANTACAO > 0 && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
              {counts.EM_IMPLANTACAO} Em Implantação
            </span>
          )}
          {counts.ENTREGUE > 0 && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
              {counts.ENTREGUE} Entregue{counts.ENTREGUE > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Expandir */}
        <span style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Lista de Projetos */}
      {expanded && (
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {projects.map(p => <ProjectRow key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
};

export default SquadCard;
