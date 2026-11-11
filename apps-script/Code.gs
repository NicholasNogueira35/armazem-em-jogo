/** @OnlyCurrentDoc */

/**
 * ARMAZÉM EM JOGO: receptor de dados (Google Apps Script), versão 2
 *
 * Como usar (detalhes no README):
 * 1. Na planilha, abra Extensões > Apps Script e cole este arquivo inteiro.
 * 2. Rode a função "setup" uma vez (autorize quando o Google pedir).
 * 3. Implantar > Nova implantação > App da Web (Executar como: Eu; Quem pode acessar: Qualquer pessoa)
 *    Se já existe uma implantação: Implantar > Gerenciar implantações > lápis > Versão: Nova versão > Implantar
 *    (assim a URL /exec continua a mesma).
 *
 * As colunas são criadas pelo nome: se o jogo passar a enviar um campo novo,
 * uma coluna nova aparece no fim da aba, sem apagar nada do que já existe.
 */

const ABA_ENTRADAS = 'Entradas';
const ABA_RESULTADOS = 'Resultados';
const HORAS_SALA = 12; // por quanto tempo uma entrada aparece na sala de espera

const COL_ENTRADAS = ['data_hora', 'sala', 'nome', 'sid', 'idade', 'escolaridade', 'area', 'logistica', 'jogos', 'publico', 'versao'];
const COL_RESULTADOS = [
  'data_hora', 'sala', 'nome', 'sid', 'codigo', 'versao',
  'idade', 'escolaridade', 'area', 'logistica', 'jogos', 'publico',
  'pre_total', 'pos_total', 'pre_retencao', 'pos_retencao', 'pre_transferencia', 'pos_transferencia',
  'pre_nao_sei', 'pos_nao_sei', 'pre_tempo_s', 'pos_tempo_s',
  'acertos', 'total_decisoes', 'pct_acerto', 'tempo_total_s', 'meta_total_s', 'atalhos_aceitos',
  'assistente_ok', 'assistente_n', 'conferente_ok', 'conferente_n',
  'analista_ok', 'analista_n', 'operador_ok', 'operador_n',
  'tempo_cam1_s', 'tempo_cam2_s', 'tempo_cam3_s',
  'aberta_1', 'aberta_2', 'pre_respostas', 'pos_respostas', 'decisoes_json'
];

function setup() {
  aba_(ABA_ENTRADAS, COL_ENTRADAS);
  aba_(ABA_RESULTADOS, COL_RESULTADOS);
}

// Garante que a aba existe e tem todas as colunas; devolve a aba e o cabeçalho atual
function aba_(nome, colunas) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  let cab = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) : [];
  const faltando = colunas.filter(c => cab.indexOf(c) === -1);
  if (faltando.length) {
    sh.getRange(1, cab.length + 1, 1, faltando.length).setValues([faltando]).setFontWeight('bold');
    cab = cab.concat(faltando);
    sh.setFrozenRows(1);
  }
  return { sh: sh, cab: cab };
}

function gravar_(a, obj) {
  const linha = a.cab.map(c => (c in obj ? obj[c] : ''));
  a.sh.appendRow(linha);
}

// Impede que um texto digitado vire fórmula na planilha
function limpo_(v, max) {
  const s = String(v == null ? '' : v).slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function num_(v) {
  if (v === '' || v == null) return '';
  const n = Number(v);
  return isFinite(n) ? n : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function perfil_(d) {
  return {
    sala: limpo_(String(d.sala || '').toUpperCase().trim(), 12),
    nome: limpo_(d.nome, 80),
    sid: limpo_(d.sid, 12),
    idade: num_(d.idade),
    escolaridade: limpo_(d.escolaridade, 20),
    area: limpo_(d.area, 80),
    logistica: limpo_(d.logistica, 20),
    jogos: limpo_(d.jogos, 20),
    publico: limpo_(d.publico, 10),
    versao: num_(d.versao)
  };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);

    if (d.tipo === 'entrada') {
      const o = perfil_(d);
      o.data_hora = new Date();
      gravar_(aba_(ABA_ENTRADAS, COL_ENTRADAS), o);
      return json_({ ok: true });
    }

    if (d.tipo === 'resultado') {
      const a = aba_(ABA_RESULTADOS, COL_RESULTADOS);
      const o = perfil_(d);
      // evita duplicar o mesmo resultado (reenvio automático)
      const colSid = a.cab.indexOf('sid') + 1;
      if (a.sh.getLastRow() > 1) {
        const sids = a.sh.getRange(2, colSid, a.sh.getLastRow() - 1, 1).getValues().map(r => String(r[0]));
        if (sids.indexOf(o.sid) !== -1) return json_({ ok: true, duplicado: true });
      }
      const f = d.funcoes || {};
      const t = d.tempos_caminhoes || [];
      Object.assign(o, {
        data_hora: new Date(),
        codigo: limpo_(d.codigo, 60),
        pre_total: num_(d.pre_total), pos_total: num_(d.pos_total),
        pre_retencao: num_(d.pre_retencao), pos_retencao: num_(d.pos_retencao),
        pre_transferencia: num_(d.pre_transferencia), pos_transferencia: num_(d.pos_transferencia),
        pre_nao_sei: num_(d.pre_nao_sei), pos_nao_sei: num_(d.pos_nao_sei),
        pre_tempo_s: num_(d.pre_tempo_s), pos_tempo_s: num_(d.pos_tempo_s),
        acertos: num_(d.acertos), total_decisoes: num_(d.total), pct_acerto: num_(d.pct),
        tempo_total_s: num_(d.tempo_total_s), meta_total_s: num_(d.meta_total_s), atalhos_aceitos: num_(d.atalhos),
        assistente_ok: num_((f.assistente || {}).ok), assistente_n: num_((f.assistente || {}).n),
        conferente_ok: num_((f.conferente || {}).ok), conferente_n: num_((f.conferente || {}).n),
        analista_ok: num_((f.analista || {}).ok), analista_n: num_((f.analista || {}).n),
        operador_ok: num_((f.operador || {}).ok), operador_n: num_((f.operador || {}).n),
        tempo_cam1_s: num_(t[0]), tempo_cam2_s: num_(t[1]), tempo_cam3_s: num_(t[2]),
        aberta_1: limpo_(d.aberta_1, 2000), aberta_2: limpo_(d.aberta_2, 2000),
        pre_respostas: limpo_(JSON.stringify(d.pre_respostas || {}), 500),
        pos_respostas: limpo_(JSON.stringify(d.pos_respostas || {}), 500),
        decisoes_json: JSON.stringify(d.decisoes || []).slice(0, 45000)
      });
      gravar_(a, o);
      return json_({ ok: true });
    }

    return json_({ ok: false, erro: 'tipo desconhecido' });
  } catch (err) {
    return json_({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Sala de espera: devolve quem entrou na sala nas últimas horas (nome curto)
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.acao !== 'sala') return json_({ ok: true, servico: 'Armazém em Jogo', versao: 2 });

  const sala = String(p.sala || '').toUpperCase().trim();
  const limite = Date.now() - HORAS_SALA * 3600 * 1000;
  const ent = aba_(ABA_ENTRADAS, COL_ENTRADAS);
  const res = aba_(ABA_RESULTADOS, COL_RESULTADOS);

  const terminaram = {};
  if (res.sh.getLastRow() > 1) {
    const iS = res.cab.indexOf('sala'), iId = res.cab.indexOf('sid');
    res.sh.getRange(2, 1, res.sh.getLastRow() - 1, res.cab.length).getValues().forEach(r => {
      if (String(r[iS]) === sala) terminaram[String(r[iId])] = true;
    });
  }

  const vistos = {};
  const pessoas = [];
  if (ent.sh.getLastRow() > 1) {
    const iD = ent.cab.indexOf('data_hora'), iS = ent.cab.indexOf('sala'), iN = ent.cab.indexOf('nome'), iId = ent.cab.indexOf('sid');
    ent.sh.getRange(2, 1, ent.sh.getLastRow() - 1, ent.cab.length).getValues().forEach(r => {
      const quando = new Date(r[iD]).getTime();
      const sid = String(r[iId]);
      if (String(r[iS]) !== sala || quando < limite || vistos[sid]) return;
      vistos[sid] = true;
      const partes = String(r[iN]).trim().split(/\s+/);
      const curto = partes[0] + (partes.length > 1 ? ' ' + partes[partes.length - 1].charAt(0) + '.' : '');
      pessoas.push({ nome: curto, sid: sid, terminou: !!terminaram[sid] });
    });
  }
  return json_({ ok: true, sala: sala, pessoas: pessoas });
}
