import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Upload, Trash2, AlertTriangle, Loader2, RefreshCw, Truck, Briefcase, Box } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import { dashboardService } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── Status ───────────────────────────────────────────────────────────────
const STATUS = {
  PLANEJAMENTO:   { label: 'Planejados',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  EM_IMPLANTACAO: { label: 'Em Implantação',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  ENTREGUE:       { label: 'Finalizados',     color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
};

const SQUAD_ICONS = [Truck, Briefcase, Box];

// ─── KPI ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, color, sub, pct }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</p>
    <p style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color }}>{value}</p>
    {sub && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</p>}
    {pct !== undefined && (
      <div style={{ height: 3, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
    )}
  </div>
);

// ─── Card de Squad/Time ───────────────────────────────────────────────────
const SquadReportCard = ({ squad, projects, iconIndex = 0 }) => {
  const Icon = SQUAD_ICONS[iconIndex % SQUAD_ICONS.length];

  const byStatus = {
    ENTREGUE:       projects.filter(p => p.status === 'ENTREGUE'),
    EM_IMPLANTACAO: projects.filter(p => p.status === 'EM_IMPLANTACAO'),
    PLANEJAMENTO:   projects.filter(p => p.status === 'PLANEJAMENTO'),
  };

  // Cor do acento do card baseada no status dominante
  const dominant = byStatus.ENTREGUE.length >= byStatus.EM_IMPLANTACAO.length
    ? '#10b981' : '#3b82f6';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${dominant}`,
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      minWidth: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: `${dominant}20`, borderRadius: '10px', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={dominant} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{squad}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Seções por status — só exibe se tiver projetos */}
      {Object.entries(byStatus).map(([statusKey, list]) => {
        if (!list.length) return null;
        const s = STATUS[statusKey];
        return (
          <div key={statusKey}>
            {/* Label da seção */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.color }}>
                {s.label}
              </span>
            </div>
            {/* Lista de projetos */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {list.map(p => (
                <li key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.82rem', lineHeight: 1.4 }}>
                  <span style={{ color: s.color, marginTop: '0.25rem', flexShrink: 0, fontSize: '0.6rem' }}>◆</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
                    <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>{p.client_name}:</strong>
                    <span style={{ color: '#94a3b8' }}>{p.name}</span>
                    {p.delivery_count > 0 && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 800, background: s.bg, color: s.color,
                        padding: '0.05rem 0.4rem', borderRadius: '4px', border: `1px solid ${s.color}30`,
                        marginLeft: '0.2rem'
                      }}>
                        {p.delivery_count} entrega{p.delivery_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

const ImpedimentCard = ({ projects }) => {
  if (!projects.length) return null;
  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderLeft: '4px solid #ef4444',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444' }}>
        <AlertTriangle size={20} />
        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atenção: Projetos com Impeditivos ({projects.length})</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {projects.map(p => (
          <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.client_name}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>{p.name}</div>
            </div>

            {/* Metadados: Squad, Time, Segmento */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                Squad: {p.squad || '-'}
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                Time: {p.team_name || '-'}
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                Segm: {p.segment_name || '-'}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', fontStyle: 'italic', lineHeight: 1.4 }}>
              &quot;{p.impediments}&quot;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const ConfirmModal = ({ isOpen, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: '50%', padding: '1rem' }}>
            <AlertTriangle size={32} color="var(--danger)" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Excluir todos os projetos?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Esta ação remove <strong>todos</strong> os projetos. Use para importar uma nova planilha.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn" style={{ flex: 1, background: 'var(--danger)', color: '#fff', justifyContent: 'center', gap: '0.5rem' }} onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={15} /> : <Trash2 size={15} />}
            {loading ? 'Excluindo...' : 'Excluir Tudo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [importOpen, setImportOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [toast, setToast]               = useState(null);
  const [groupBy, setGroupBy]           = useState('squad'); // 'squad' | 'team' | 'segment'
  const [filterStatus, setFilterStatus] = useState(''); // '' | 'PLANEJAMENTO' | 'EM_IMPLANTACAO' | 'ENTREGUE'
  const [showImpediments, setShowImpediments] = useState(false);
  const [isExporting, setIsExporting]           = useState(false);
  const [exportMsg, setExportMsg]               = useState('');
  const [currentExportTeam, setCurrentExportTeam] = useState(null); // Para controle de exportação em lote

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchData = async () => {
    setLoading(true);
    try { const r = await dashboardService.getProjects(); setProjects(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClearAll = async () => {
    setClearLoading(true);
    try { const r = await dashboardService.clearAll(); showToast(r.data.message); setConfirmOpen(false); fetchData(); }
    catch { showToast('Erro ao excluir.', 'error'); }
    finally { setClearLoading(false); }
  };

  const exportToPDF = async (title = 'Dashboard', filename = `relatorio-${new Date().toISOString().slice(0,10)}.pdf`) => {
    setIsExporting(true);
    setExportMsg(`Gerando: ${title}...`);
    // Delay para garantir que o DOM atualizou (importante para o loop de times)
    await new Promise(r => setTimeout(r, 800)); 
    try {
      const element = document.getElementById('dashboard-print-area');
      if (!element) return;
      
      const canvas = await html2canvas(element, { 
        scale: 1.5, // Resolução balanceada (peso x qualidade)
        useCORS: true, 
        backgroundColor: '#0a0c14', 
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
        }
      });
      
      // Otimização: JPEG com 75% de qualidade (gera ~2-3MB contra os 40MB do PNG)
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true // Habilita compressão interna do PDF
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Sanitização e Download Robusto (ajuda o navegador a salvar com o nome e extensão corretos)
      const cleanName = filename.replace(/[<>:"/\\|?*]/g, '').replace(/\.{2,}/g, '.');
      const finalName = cleanName.endsWith('.pdf') ? cleanName : `${cleanName}.pdf`;
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) { 
      console.error(err);
      showToast('Erro ao gerar PDF.', 'error'); 
    }
    finally { setIsExporting(false); setExportMsg(''); }
  };

  const handleExportByTeam = async () => {
    const teams = [...new Set(projects.map(p => p.team_name || 'Sem Time'))].filter(t => t);
    if (teams.length === 0) {
      showToast('Nenhum time encontrado para exportar.', 'error');
      return;
    }

    showToast(`Iniciando exportação de ${teams.length} arquivos...`);
    
    for (const team of teams) {
      setCurrentExportTeam(team);
      // O render vai atualizar o 'filteredProjectsByExport'
      // Esperamos o ciclo de renderização
      await new Promise(r => setTimeout(r, 300));
      await exportToPDF(`Relatório: ${team}`, `Relatorio_${team.replace(/\s+/g, '_')}.pdf`);
    }
    setCurrentExportTeam(null);
    showToast('Exportação concluída!', 'success');
  };

  const filteredProjects = useMemo(() => {
    // Se estivermos no meio de um loop de exportação por time, usamos o filtro do time
    if (currentExportTeam) {
      return projects.filter(p => (p.team_name || 'Sem Time') === currentExportTeam);
    }
    return projects.filter(p => !filterStatus || p.status === filterStatus);
  }, [projects, filterStatus, currentExportTeam]);

  const totalProjects = filteredProjects.length;
  const totalEntregas = filteredProjects.reduce((acc, p) => acc + (p.delivery_count || 0), 0);
  const plan = filteredProjects.filter(p => p.status === 'PLANEJAMENTO').length;
  const impl = filteredProjects.filter(p => p.status === 'EM_IMPLANTACAO').length;
  const done = filteredProjects.filter(p => p.status === 'ENTREGUE').length;
  const impList = filteredProjects.filter(p => p.impediments);
  const impCount = impList.length;

  const groupedCards = useMemo(() => {
    const m = {};
    filteredProjects.forEach(p => {
      const k = groupBy === 'squad' ? (p.squad || 'Sem Squad') : groupBy === 'team' ? (p.team_name || 'Sem Time') : (p.segment_name || 'Sem Segmento');
      if (!m[k]) m[k] = [];
      m[k].push(p);
    });
    return Object.entries(m).sort((a, b) => {
      if (a[0].startsWith('Sem ')) return 1;
      if (b[0].startsWith('Sem ')) return -1;
      return b[1].length - a[1].length;
    });
  }, [filteredProjects, groupBy]);

  // Título (Trimestre manual conforme solicitado)
  const titulo = `Balanço do 1º Trimestre: Entregas e Planejamento`;
  const subtit = `Visão consolidada de ${totalEntregas} entregas em ${totalProjects} projetos — ${done} finalizados, ${impl} em implantação, ${plan} planejados.`;

  const chartTooltip = { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1, padding: 10, cornerRadius: 8 };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 1000, padding: '0.7rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`, color: toast.type === 'success' ? '#10b981' : '#ef4444', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
          {toast.msg}
        </div>
      )}

      {isExporting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Loader2 size={48} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{exportMsg}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aguarde enquanto preparamos o seu relatório...</p>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Sistema Online</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.15 }}>Ops Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Dashboard de Implementações Logísticas</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={fetchData} title="Atualizar" className="no-print" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0.45rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-ghost no-print" onClick={() => setConfirmOpen(true)} style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', gap: '0.4rem', fontSize: '0.82rem' }}>
            <Trash2 size={15} /> Limpar
          </button>
          
          <div style={{ height: '32px', width: '1px', background: 'var(--border)', margin: '0 0.5rem' }} className="no-print" />
          
          <button className="btn btn-ghost no-print" onClick={() => exportToPDF()} disabled={isExporting} style={{ gap: '0.4rem', fontSize: '0.82rem' }}>
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} style={{ transform: 'rotate(180deg)' }} />} PDF Geral
          </button>
          
          <button className="btn btn-ghost no-print" onClick={handleExportByTeam} disabled={isExporting} style={{ gap: '0.4rem', fontSize: '0.82rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Briefcase size={14} />} PDF por Time
          </button>

          <button className="btn btn-primary no-print" onClick={() => setImportOpen(true)} style={{ gap: '0.4rem', fontSize: '0.82rem' }}>
            <Upload size={15} /> Importar Planilha
          </button>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{titulo}</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtit}</p>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.75rem', padding: '5rem' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Carregando dados...
        </div>
      ) : totalProjects === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.75rem', padding: '5rem' }}>
          <Box size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontWeight: 700, fontSize: '1rem' }}>Nenhum projeto ainda</p>
          <p style={{ fontSize: '0.82rem' }}>Clique em "Importar Planilha" para começar.</p>
        </div>
      ) : (
        <div id="dashboard-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-main)' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            <KPI label="Total Entregas"  value={totalEntregas} color="var(--accent)" sub={`Em ${totalProjects} projetos`} />
            <KPI label="Planejados"      value={plan}  color="#f59e0b" pct={totalProjects ? Math.round(plan/totalProjects*100) : 0} sub={`${totalProjects ? Math.round(plan/totalProjects*100) : 0}% dos projetos`} />
            <KPI label="Em Implantação"  value={impl}  color="#3b82f6" pct={totalProjects ? Math.round(impl/totalProjects*100) : 0} sub={`${totalProjects ? Math.round(impl/totalProjects*100) : 0}% dos projetos`} />
            <KPI label="Finalizados"     value={done}  color="#10b981" pct={totalProjects ? Math.round(done/totalProjects*100) : 0} sub={`${totalProjects ? Math.round(done/totalProjects*100) : 0}% dos projetos`} />
            <div className="no-print" onClick={() => setShowImpediments(!showImpediments)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <KPI label="Com Impeditivo"  value={impCount}   color={impCount > 0 ? '#ef4444' : 'var(--text-muted)'} sub={impCount > 0 ? (showImpediments ? '▼ Ocultar detalhes' : '▶ Ver detalhes') : 'Sem impeditivos'} />
            </div>
            {/* KPI Versão Impressa para Impeditivos (Sempre visível se houver) */}
            <div className="print-only" style={{ display: 'none' }}>
               <KPI label="Com Impeditivo" value={impCount} color="#ef4444" sub="Projetos com pendências" />
            </div>
          </div>

          {showImpediments && <ImpedimentCard projects={impList} />}
          {/* Sempre mostrar impeditivos na exportação do PDF se houver algum */}
          {(isExporting && impCount > 0) && (
            <div className="print-only">
               <ImpedimentCard projects={impList} />
            </div>
          )}

          {/* ÁREA DE RELATÓRIO */}
          <div style={{ marginTop: '0.5rem' }}>
            {/* Filtros de Status e Agrupamento (Ocultos no PDF) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>Filtrar Status:</span>
                {Object.entries(STATUS).map(([key, cfg]) => (
                  <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)} style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${filterStatus === key ? cfg.color : 'var(--border)'}`, background: filterStatus === key ? cfg.bg : 'transparent', color: filterStatus === key ? cfg.color : 'var(--text-muted)', transition: 'all 0.15s' }}>
                    {cfg.label}
                  </button>
                ))}
                {filterStatus && (
                  <button onClick={() => setFilterStatus('')} style={{ fontSize: '0.72rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>✕ Limpar</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>Agrupar por:</span>
                {[['squad', 'Squad'], ['team', 'Time'], ['segment', 'Segmento']].map(([k, l]) => (
                  <button key={k} onClick={() => setGroupBy(k)} style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${groupBy === k ? 'var(--primary)' : 'var(--border)'}`, background: groupBy === k ? 'var(--primary-glow)' : 'transparent', color: groupBy === k ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {groupedCards.map(([name, list], i) => (
                <SquadReportCard key={name} squad={name} projects={list} iconIndex={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} onRefresh={fetchData} />
      <ConfirmModal isOpen={confirmOpen} onConfirm={handleClearAll} onCancel={() => setConfirmOpen(false)} loading={clearLoading} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
