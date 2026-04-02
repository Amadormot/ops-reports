import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: '0.5rem', borderRadius: '8px', background: color + '15', color: color }}>
          <Icon size={20} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{title}</h3>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
