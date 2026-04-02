import { supabase } from '../lib/supabaseClient';

export const dashboardService = {
  // Métricas gerais
  getMetrics: async () => {
    const { data: projects, error } = await supabase
      .from('dashboard_project')
      .select('id, status, delivery_count, team_id, segment_id, dashboard_team(name), dashboard_segment(name)');

    if (error) throw error;

    const total_projects = projects.length;
    const by_team = {};
    const by_segment = {};

    for (const p of projects) {
      const teamName = p.dashboard_team?.name || 'Sem Time';
      const segName = p.dashboard_segment?.name || 'Sem Segmento';
      by_team[teamName] = (by_team[teamName] || 0) + 1;
      by_segment[segName] = (by_segment[segName] || 0) + 1;
    }

    return { data: { total_projects, by_team, by_segment } };
  },

  // Lista de projetos com filtros
  getProjects: async (params = {}) => {
    let query = supabase
      .from('dashboard_project')
      .select('id, name, status, actual_end_date, delivery_count, squad, impediments, dashboard_client(name), dashboard_team(name), dashboard_segment(name)')
      .order('actual_end_date', { ascending: false, nullsFirst: false });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Normaliza para o formato esperado pelo Dashboard (compatibilidade)
    const normalized = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      actual_end_date: p.actual_end_date,
      delivery_count: p.delivery_count,
      squad: p.squad,
      impediments: p.impediments,
      client_name: p.dashboard_client?.name || '',
      team_name: p.dashboard_team?.name || '',
      segment_name: p.dashboard_segment?.name || '',
    }));

    return { data: normalized };
  },

  // Limpar todos os dados (Delete Everything)
  clearAll: async () => {
    // Apaga projetos que não tem ID = 0 (ou seja, todos)
    const { error: epErr } = await supabase.from('dashboard_project').delete().neq('id', 0);
    if (epErr) throw epErr;
    const { error: ecErr } = await supabase.from('dashboard_client').delete().neq('id', 0);
    if (ecErr) throw ecErr;
    const { error: etErr } = await supabase.from('dashboard_team').delete().neq('id', 0);
    if (etErr) throw etErr;
    const { error: esErr } = await supabase.from('dashboard_segment').delete().neq('id', 0);
    if (esErr) throw esErr;
    return { data: { message: 'Todos os dados foram removidos com sucesso!' } };
  },
};

export default supabase;
