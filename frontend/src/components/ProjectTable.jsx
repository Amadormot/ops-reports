import React from 'react';

const ProjectTable = ({ projects, loading }) => {
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando dados logísticos...</div>;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Lista de Implementações</h2>
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'var(--bg-hover)', borderRadius: '999px', color: 'var(--text-muted)' }}>
          {projects.length} Projetos
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Cliente</th>
              <th style={thStyle}>Projeto</th>
              <th style={thStyle}>Término Real</th>
              <th style={thStyle}>Segmento</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Squad</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.id} style={{ borderBottom: index === projects.length - 1 ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{project.client_name}</span>
                </td>
                <td style={tdStyle}>{project.name}</td>
                <td style={tdStyle}>{project.actual_end_date || '-'}</td>
                <td style={tdStyle}>
                  <span style={badgeStyle}>{project.segment_name || '-'}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ ...badgeStyle, borderColor: 'var(--accent)', color: 'var(--accent)' }}>{project.team_name || '-'}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ ...badgeStyle, borderColor: 'var(--primary)', color: 'var(--primary)' }}>{project.squad || '-'}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{project.total_score}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ ...badgeStyle, borderColor: 'var(--success)', color: 'var(--success)', fontSize: '0.7rem' }}>{project.status || '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  fontWeight: 600,
};

const tdStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.875rem',
};

const badgeStyle = {
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  border: '1px solid var(--border)',
  fontSize: '0.75rem',
  fontWeight: 500,
};

export default ProjectTable;
