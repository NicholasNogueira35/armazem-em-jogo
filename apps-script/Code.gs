/** @OnlyCurrentDoc */

/**
 * ARMAZÉM EM JOGO: receptor de dados (Google Apps Script)
 *
 * Como usar (detalhes no README):
 * 1. Crie uma planilha Google, abra Extensões > Apps Script e cole este arquivo inteiro.
 * 2. Rode a função "setup" uma vez (autorize quando o Google pedir).
 * 3. Implantar > Nova implantação > App da Web
 *      Executar como: Eu
 *      Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL que termina em /exec e cole no arquivo config.js do jogo.
 */

const ABA_ENTRADAS = 'Entradas';
const ABA_RESULTADOS = 'Resultados';
const HORAS_SALA = 12; // por quanto tempo uma entrada aparece na sala de espera

const CAB_ENTRADAS = ['data_hora', 'sala', 'nome', 'turma', 'sid'];
const CAB_RESULTADOS = [
  'data_hora', 'sala', 'nome', 'turma', 'sid', 'codigo',
  'acertos', 'total_decisoes', 'pct_acerto', 'tempo_total_s', 'meta_total_s', 'atalhos_aceitos',
  'assistente_ok', 'assistente_n', 'conferente_ok', 'conferente_n',
  'analista_ok', 'analista_n', 'operador_ok', 'operador_n',
  'tempo_cam1_s', 'tempo_cam2_s', 'tempo_cam3_s', 'decisoes_json'
];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  prepararAba_(ss, ABA_ENTRADAS, CAB_ENTRADAS);
  prepararAba_(ss, ABA_RESULTADOS, CAB_RESULTADOS);
}

function prepararAba_(ss, nome, cab) {
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cab);
    sh.getRange(1, 1, 1, cab.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function aba_(nome, cab) {
  return prepararAba_(SpreadsheetApp.getActiveSpreadsheet(), nome, cab);
}

// Impede que um texto digitado vire fórmula na planilha
function limpo_(v, max) {
  const s = String(v == null ? '' : v).slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function num_(v) {
  const n = Number(v);
  return isFinite(n) ? n : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sala = limpo_(String(d.sala || '').toUpperCase().trim(), 12);

    if (d.tipo === 'entrada') {
      aba_(ABA_ENTRADAS, CAB_ENTRADAS).appendRow([
        new Date(), sala, limpo_(d.nome, 80), limpo_(d.turma, 60), limpo_(d.sid, 12)
      ]);
      return json_({ ok: true });
    }

    if (d.tipo === 'resultado') {
      const sh = aba_(ABA_RESULTADOS, CAB_RESULTADOS);
      const sid = limpo_(d.sid, 12);
      // evita duplicar o mesmo resultado (reenvio automático)
      if (sh.getLastRow() > 1) {
        const sids = sh.getRange(2, 5, sh.getLastRow() - 1, 1).getValues().map(r => String(r[0]));
        if (sids.indexOf(sid) !== -1) return json_({ ok: true, duplicado: true });
      }
      const f = d.funcoes || {};
      const fx = k => [num_((f[k] || {}).ok), num_((f[k] || {}).n)];
      const t = d.tempos_caminhoes || [];
      sh.appendRow([
        new Date(), sala, limpo_(d.nome, 80), limpo_(d.turma, 60), sid, limpo_(d.codigo, 60),
        num_(d.acertos), num_(d.total), num_(d.pct), num_(d.tempo_total_s), num_(d.meta_total_s), num_(d.atalhos)
      ].concat(fx('assistente'), fx('conferente'), fx('analista'), fx('operador'),
        [num_(t[0]), num_(t[1]), num_(t[2]), JSON.stringify(d.decisoes || []).slice(0, 45000)]));
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
  if (p.acao !== 'sala') return json_({ ok: true, servico: 'Armazém em Jogo' });

  const sala = String(p.sala || '').toUpperCase().trim();
  const limite = Date.now() - HORAS_SALA * 3600 * 1000;
  const ent = aba_(ABA_ENTRADAS, CAB_ENTRADAS);
  const res = aba_(ABA_RESULTADOS, CAB_RESULTADOS);

  const terminaram = {};
  if (res.getLastRow() > 1) {
    res.getRange(2, 1, res.getLastRow() - 1, 5).getValues().forEach(r => {
      if (String(r[1]) === sala) terminaram[String(r[4])] = true;
    });
  }

  const vistos = {};
  const pessoas = [];
  if (ent.getLastRow() > 1) {
    ent.getRange(2, 1, ent.getLastRow() - 1, 5).getValues().forEach(r => {
      const quando = new Date(r[0]).getTime();
      const sid = String(r[4]);
      if (String(r[1]) !== sala || quando < limite || vistos[sid]) return;
      vistos[sid] = true;
      const partes = String(r[2]).trim().split(/\s+/);
      const curto = partes[0] + (partes.length > 1 ? ' ' + partes[partes.length - 1].charAt(0) + '.' : '');
      pessoas.push({ nome: curto, sid: sid, terminou: !!terminaram[sid] });
    });
  }
  return json_({ ok: true, sala: sala, pessoas: pessoas });
}
