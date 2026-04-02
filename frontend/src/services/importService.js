import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';

// Colunas mínimas obrigatórias
const REQUIRED_COLUMNS = new Set(['Cliente', 'Projeto']);

// Mapeamento de status igual ao Python
const STATUS_MAP = {
  'planja': 'PLANEJAMENTO',
  'planejamento': 'PLANEJAMENTO',
  'planejado': 'PLANEJAMENTO',
  'planejar': 'PLANEJAMENTO',
  'em implantacao': 'EM_IMPLANTACAO',
  'em implantação': 'EM_IMPLANTACAO',
  'implantacao': 'EM_IMPLANTACAO',
  'implantação': 'EM_IMPLANTACAO',
  'em andamento': 'EM_IMPLANTACAO',
  'andamento': 'EM_IMPLANTACAO',
  'entregue': 'ENTREGUE',
  'concluido': 'ENTREGUE',
  'concluído': 'ENTREGUE',
  'finalizado': 'ENTREGUE',
};

const FILL_DOWN_FIELDS = ['Cliente', 'Segmento', 'Time', 'Squad', 'Status'];

function parseDate(dateStr) {
  if (!dateStr || ['-', 'None', ''].includes(dateStr)) return null;
  const formats = [
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, fn: (m) => `${m[3]}-${m[2]}-${m[1]}` },
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, fn: (m) => `${m[1]}-${m[2]}-${m[3]}` },
    { regex: /^(\d{2})\/(\d{2})\/(\d{2})$/, fn: (m) => `20${m[3]}-${m[2]}-${m[1]}` },
  ];
  // Trata datas numéricas do Excel (número de dias desde 1/1/1900)
  if (!isNaN(dateStr)) {
    const excelDate = XLSX.SSF.parse_date_code(Number(dateStr));
    if (excelDate) {
      return `${excelDate.y}-${String(excelDate.m).padStart(2,'0')}-${String(excelDate.d).padStart(2,'0')}`;
    }
  }
  for (const { regex, fn } of formats) {
    const m = String(dateStr).trim().match(regex);
    if (m) return fn(m);
  }
  return null;
}

function parseRow(rowDict) {
  const impedimentsVal = (rowDict['Impetitivos'] || rowDict['Impeditivos'] || '').trim();
  const rawTotal = String(rowDict['Total'] || '0').trim();
  let deliveryCount = 0;
  try { deliveryCount = Math.round(parseFloat(rawTotal)) || 0; } catch (_) {}

  return {
    clientName: (rowDict['Cliente'] || '').trim(),
    projName: (rowDict['Projeto'] || '').trim(),
    dateStr: String(rowDict['Término Real'] || '').trim(),
    deliveryCount,
    segmentName: (rowDict['Segmento'] || '').trim(),
    teamName: (rowDict['Time'] || '').trim(),
    impediments: impedimentsVal,
    statusRaw: (rowDict['Status'] || '').trim().toLowerCase(),
    squad: (rowDict['Squad'] || '').trim(),
  };
}

async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (raw.length < 2) { resolve([]); return; }

        const headers = raw[0].map(h => String(h).trim());
        const lastValues = Object.fromEntries(FILL_DOWN_FIELDS.map(f => [f, '']));
        const rows = [];

        for (let i = 1; i < raw.length; i++) {
          const rowArr = raw[i];
          const rowDict = {};
          headers.forEach((h, idx) => { rowDict[h] = String(rowArr[idx] ?? '').trim(); });

          // Pula linhas completamente vazias
          if (Object.values(rowDict).every(v => !v)) continue;

          // Fill-down: herda valor anterior quando célula está vazia
          for (const field of FILL_DOWN_FIELDS) {
            if (field in rowDict) {
              if (rowDict[field]) lastValues[field] = rowDict[field];
              else rowDict[field] = lastValues[field];
            }
          }
          rows.push(rowDict);
        }
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function importFileToSupabase(file) {
  // 1. Ler arquivo
  let rows;
  try {
    rows = await readFile(file);
  } catch (err) {
    return { success: false, message: `Erro ao ler o arquivo: ${err.message}`, errors: [] };
  }

  if (rows.length === 0) {
    return { success: false, message: 'Arquivo vazio ou sem dados válidos.', errors: [] };
  }

  // 2. Validar colunas obrigatórias
  const headers = new Set(Object.keys(rows[0]));
  const missing = [...REQUIRED_COLUMNS].filter(c => !headers.has(c));
  if (missing.length > 0) {
    return {
      success: false,
      message: `Colunas obrigatórias ausentes: ${missing.join(', ')}. Certifique-se de que o arquivo contém: Cliente, Projeto, Término Real, Total, Segmento, Time, Impetitivos, Status.`,
      errors: [],
    };
  }

  // 3. Buscar dados existentes do Supabase para montar caches
  const [{ data: existingClients }, { data: existingTeams }, { data: existingSegments }] = await Promise.all([
    supabase.from('dashboard_client').select('id, name'),
    supabase.from('dashboard_team').select('id, name'),
    supabase.from('dashboard_segment').select('id, name'),
  ]);

  const clientCache = Object.fromEntries((existingClients || []).map(c => [c.name, c.id]));
  const teamCache = Object.fromEntries((existingTeams || []).map(t => [t.name, t.id]));
  const segmentCache = Object.fromEntries((existingSegments || []).map(s => [s.name, s.id]));

  // Helper: get-or-create com cache
  async function getOrCreateClient(name) {
    if (!name) return null;
    if (clientCache[name] !== undefined) return clientCache[name];
    let { data: existing } = await supabase.from('dashboard_client').select('id').eq('name', name).maybeSingle();
    let id = existing?.id;
    if (!id) {
      const { data, error } = await supabase.from('dashboard_client').insert({ name, created_at: new Date().toISOString() }).select('id').single();
      if (error) throw new Error(`Cliente "${name}": ${error.message}`);
      id = data.id;
    }
    clientCache[name] = id;
    return id;
  }

  async function getOrCreateTeam(name) {
    if (!name) return null;
    if (teamCache[name] !== undefined) return teamCache[name];
    let { data: existing } = await supabase.from('dashboard_team').select('id').eq('name', name).maybeSingle();
    let id = existing?.id;
    if (!id) {
      const { data, error } = await supabase.from('dashboard_team').insert({ name }).select('id').single();
      if (error) throw new Error(`Time "${name}": ${error.message}`);
      id = data.id;
    }
    teamCache[name] = id;
    return id;
  }

  async function getOrCreateSegment(name) {
    if (!name) return null;
    if (segmentCache[name] !== undefined) return segmentCache[name];
    let { data: existing } = await supabase.from('dashboard_segment').select('id').eq('name', name).maybeSingle();
    let id = existing?.id;
    if (!id) {
      const { data, error } = await supabase.from('dashboard_segment').insert({ name }).select('id').single();
      if (error) throw new Error(`Segmento "${name}": ${error.message}`);
      id = data.id;
    }
    segmentCache[name] = id;
    return id;
  }

  // 4. Processar cada linha
  let count = 0;
  const errors = [];

  for (const row of rows) {
    try {
      const data = parseRow(row);
      if (!data.clientName || !data.projName) continue;

      const [clientId, teamId, segmentId] = await Promise.all([
        getOrCreateClient(data.clientName),
        getOrCreateTeam(data.teamName),
        getOrCreateSegment(data.segmentName),
      ]);

      const status = STATUS_MAP[data.statusRaw] || 'PLANEJAMENTO';
      const actualEndDate = parseDate(data.dateStr);

      const payload = {
        name: data.projName,
        client_id: clientId,
        team_id: teamId,
        segment_id: segmentId,
        actual_end_date: actualEndDate,
        delivery_count: data.deliveryCount,
        impediments: data.impediments,
        squad: data.squad,
        status,
        updated_at: new Date().toISOString()
      };

      // Verificar se projeto existe
      const { data: extProj } = await supabase.from('dashboard_project')
        .select('id').eq('client_id', clientId).eq('name', data.projName).maybeSingle();

      if (extProj?.id) {
        // Atualiza
        const { error } = await supabase.from('dashboard_project').update(payload).eq('id', extProj.id);
        if (error) throw new Error(error.message);
      } else {
        // Insere novo
        const { error } = await supabase.from('dashboard_project').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw new Error(error.message);
      }
      count++;
    } catch (err) {
      errors.push(`Linha "${row['Projeto'] || '?'}": ${err.message}`);
    }
  }

  return {
    success: true,
    message: `${count} projeto(s) importado(s) com sucesso.`,
    errors,
  };
}
