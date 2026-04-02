import React from 'react';
import { Calendar, Award, Tag, Users, Hash, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  'PLANEJAMENTO':   { label: 'Planejado',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'EM_IMPLANTACAO': { label: 'Em Implantação', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  'ENTREGUE':       { label: 'Entregue',        color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
};

const ProjectCard = ({ project }) => {
  const statusCfg = STATUS_CONFIG[project.status] || { label: project.status || '-', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default' }}>
      {/* Header: Status + Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          padding: '0.25rem 0.6rem', borderRadius: '999px',
          background: statusCfg.bg, color: statusCfg.color,
          border: `1px solid ${statusCfg.color}40`,
        }}>
          {statusCfg.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--primary-glow)', borderRadius: '6px', padding: '0.2rem 0.5rem' }}>
          <Award size={12} color="var(--primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{project.total_score}</span>
        </div>
      </div>

      {/* Client + Project Name */}
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
          {project.client_name}
        </p>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-main)' }}>
          {project.name}
        </h3>
      </div>

      {/* Tags: Segmento, Time, Squad */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {project.segment_name && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(99,102,241,0.12)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)', fontWeight: 600 }}>
            <Tag size={10} /> {project.segment_name}
          </span>
        )}
        {project.team_name && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.25)', fontWeight: 600 }}>
            <Users size={10} /> {project.team_name}
          </span>
        )}
        {project.squad && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.25)', fontWeight: 600 }}>
            <Hash size={10} /> {project.squad}
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Footer: Date + Impediments */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} />
          {project.actual_end_date || 'Sem data'}
        </span>
        {project.impediments && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--danger)', fontSize: '0.7rem' }}>
            <AlertCircle size={12} /> Impeditivo
          </span>
        )}
      </div>

      {/* Impediments (if any) */}
      {project.impediments && (
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '0.5rem 0.6rem', lineHeight: 1.5, margin: 0 }}>
          {project.impediments}
        </p>
      )}
    </div>
  );
};

export default ProjectCard;
