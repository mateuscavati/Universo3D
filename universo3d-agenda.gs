/**
 * Universo 3D — ponte entre a calculadora e o Google Agenda
 *
 * Cria, atualiza e apaga eventos de encomendas confirmadas e guarda os dados
 * da calculadora num arquivo do seu Google Drive, para sincronizar PC e celular.
 * Cole este código em script.google.com, troque o TOKEN e publique como "App da Web".
 */

// 1) Troque por uma senha só sua (a mesma que você vai colar na calculadora)
const TOKEN = 'TROQUE-ESTA-SENHA';

// 2) Cor dos eventos de impressão no Google Agenda.
//    Opções: PALE_BLUE, PALE_GREEN, MAUVE, PALE_RED, YELLOW, ORANGE (Tangerina),
//            CYAN, GRAY, BLUE, GREEN, RED (Tomate)
const COR = CalendarApp.EventColor.ORANGE;

// 3) Agenda onde os eventos serão criados. Vazio = sua agenda principal.
//    Para usar outra, cole o "ID da agenda" (Configurações da agenda > Integrar agenda).
const AGENDA_ID = '';

// Opcional: lembrete (em minutos antes do evento). Use 0 para nenhum.
const LEMBRETE_MIN = 30;

/* ---------------- não precisa mexer daqui para baixo ---------------- */

function doGet(e) {
  const cb = String((e && e.parameter && e.parameter.callback) || '').replace(/[^\w]/g, '');
  let saida;
  try {
    const p = JSON.parse((e && e.parameter && e.parameter.p) || '{}');
    if (String(p.token || '').trim() !== String(TOKEN).trim()) throw new Error('senha (TOKEN) incorreta — se você mudou o TOKEN, publique uma nova versão em Implantar > Gerenciar implantações');
    const trava = LockService.getScriptLock();
    trava.waitLock(15000);
    try { saida = executar(p); } finally { trava.releaseLock(); }
  } catch (err) {
    saida = { ok: false, erro: String(err && err.message ? err.message : err) };
  }
  const corpo = cb ? cb + '(' + JSON.stringify(saida) + ');' : JSON.stringify(saida);
  return ContentService.createTextOutput(corpo)
    .setMimeType(cb ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

// Recebe os dados enviados pela página (POST) e junta com os que já estão no Drive
function doPost(e) {
  let saida;
  try {
    const p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (String(p.token || '').trim() !== String(TOKEN).trim()) throw new Error('senha (TOKEN) incorreta');
    if (p.acao !== 'gravar') throw new Error('ação desconhecida: ' + p.acao);
    const trava = LockService.getScriptLock();
    trava.waitLock(20000);
    try {
      const atual = lerDados();
      const novo = atual ? mesclar(p.dados || {}, atual) : (p.dados || {});
      arquivoDados().setContent(JSON.stringify(novo));
      saida = { ok: true };
    } finally { trava.releaseLock(); }
  } catch (err) {
    saida = { ok: false, erro: String(err && err.message ? err.message : err) };
  }
  return ContentService.createTextOutput(JSON.stringify(saida)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- dados no Google Drive ---------- */
const NOME_ARQUIVO = 'Universo 3D - dados da calculadora.json';

function arquivoDados() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('arquivo_dados');
  if (id) { try { const f = DriveApp.getFileById(id); if (!f.isTrashed()) return f; } catch (_) {} }
  const f = DriveApp.createFile(NOME_ARQUIVO, '', 'application/json');
  props.setProperty('arquivo_dados', f.getId());
  return f;
}
function lerDados() {
  const txt = arquivoDados().getBlob().getDataAsString('utf-8');
  return txt ? JSON.parse(txt) : null;
}
// Mesma regra da página: em cada carretel/encomenda vale a versão editada por último
function mesclar(a, b) {
  const apag = Object.assign({}, b.apagados || {});
  Object.keys(a.apagados || {}).forEach(k => { apag[k] = Math.max(a.apagados[k], apag[k] || 0); });
  const limite = Date.now() - 90 * 864e5;
  Object.keys(apag).forEach(k => { if (apag[k] < limite) delete apag[k]; });
  const out = { apagados: apag };
  ['spools', 'orders'].forEach(col => {
    const m = new Map();
    (b[col] || []).forEach(x => m.set(x.id, x));
    (a[col] || []).forEach(x => { const y = m.get(x.id); if (!y || (x.upd || 0) >= (y.upd || 0)) m.set(x.id, x); });
    out[col] = Array.from(m.values()).filter(x => !(x.id in apag && apag[x.id] >= (x.upd || 0)));
  });
  const cfg = (a.cfgAt || 0) >= (b.cfgAt || 0) ? a : b;
  ['calc', 'canais', 'wpp', 'cfgAt'].forEach(k => { out[k] = cfg[k]; });
  return out;
}

function agenda() {
  const cal = AGENDA_ID ? CalendarApp.getCalendarById(AGENDA_ID) : CalendarApp.getDefaultCalendar();
  if (!cal) throw new Error('agenda não encontrada — confira o AGENDA_ID');
  return cal;
}

function executar(p) {
  if (p.acao === 'teste') return { ok: true, agenda: agenda().getName() };
  if (p.acao === 'carregar') { const txt = arquivoDados().getBlob().getDataAsString('utf-8'); return { ok: true, dados: txt || null }; }
  if (!p.id) throw new Error('encomenda sem id');

  const props = PropertiesService.getScriptProperties();
  const chave = 'ev_' + p.id;
  const antigo = props.getProperty(chave);

  // apaga o evento anterior dessa encomenda (se existir) — serve para apagar e para atualizar
  if (antigo) {
    try { const ev = agenda().getEventById(antigo); if (ev) ev.deleteEvent(); } catch (_) {}
    props.deleteProperty(chave);
  }
  if (p.acao === 'apagar') return { ok: true };
  if (p.acao !== 'salvar') throw new Error('ação desconhecida: ' + p.acao);

  const opcoes = { description: p.descricao || '' };
  let ev;
  if (p.dia) {
    const [a, m, d] = p.dia.split('-').map(Number);
    ev = agenda().createAllDayEvent(p.titulo, new Date(a, m - 1, d), opcoes);
  } else {
    ev = agenda().createEvent(p.titulo, new Date(p.inicio), new Date(p.fim), opcoes);
  }
  ev.setColor(COR);
  if (LEMBRETE_MIN > 0) { ev.removeAllReminders(); ev.addPopupReminder(LEMBRETE_MIN); }
  props.setProperty(chave, ev.getId());
  return { ok: true, evento: ev.getId() };
}

// Rode esta função uma vez pelo editor (botão ▶ Executar) para autorizar a agenda e o Drive.
function autorizar() {
  Logger.log('Conectado à agenda: ' + agenda().getName());
  Logger.log('Arquivo de dados no Drive: ' + arquivoDados().getName());
}
