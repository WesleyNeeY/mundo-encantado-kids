// Avisos do Lumi — envia as notificações que chegaram na hora.
// Roda a cada 1 minuto (acionador de tempo) na conta Google dona do Firebase.
// Não usa chave secreta: a autorização é a do próprio dono do projeto.
var PROJETO = 'assistente-lume';
var APP_URL = 'https://wesleyneey.github.io/mundo-encantado-kids/assistente-lume/';
var BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJETO + '/databases/(default)/documents';
var LIMITE_ATRASO = 60 * 60 * 1000; // aviso mais de 1h depois do compromisso é descartado
var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function chamar_(url, opcoes) {
  opcoes = opcoes || {};
  opcoes.muteHttpExceptions = true;
  opcoes.headers = Object.assign({
    Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
    'x-goog-user-project': PROJETO
  }, opcoes.headers || {});
  var r = UrlFetchApp.fetch(url, opcoes);
  var texto = r.getContentText();
  return { codigo: r.getResponseCode(), dados: texto ? JSON.parse(texto) : {} };
}

function quando_(ms) {
  var dia = Number(Utilities.formatDate(new Date(ms), 'America/Sao_Paulo', 'u')) % 7; // 1=segunda … 7=domingo
  return DIAS[dia] + ', ' + Utilities.formatDate(new Date(ms), 'America/Sao_Paulo', 'dd/MM, HH:mm');
}

function mensagem_(aviso) {
  if (aviso.eventId === 'test') return { title: 'Assistente Lumi', body: 'As notificações do Lumi estão funcionando.' };
  var titulo = String(aviso.title || 'Compromisso').slice(0, 80) + (aviso.label === '1 dia' ? ' — amanhã' : ' — daqui a 2 horas');
  return { title: titulo, body: 'Lembrete do Lumi: ' + quando_(aviso.eventAt) + '.' };
}

function enviarAvisos() {
  var trava = LockService.getScriptLock();
  if (!trava.tryLock(1000)) return;
  try {
    var agora = Date.now();
    var consulta = chamar_(BASE + ':runQuery', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: 'alarms' }],
        where: { fieldFilter: { field: { fieldPath: 'dueAt' }, op: 'LESS_THAN_OR_EQUAL', value: { integerValue: String(agora) } } },
        orderBy: [{ field: { fieldPath: 'dueAt' } }], limit: 100 } })
    });
    if (consulta.codigo !== 200) throw new Error('Consulta falhou: ' + JSON.stringify(consulta.dados).slice(0, 500));
    var linhas = consulta.dados.filter(function (l) { return l.document; });
    var aparelhos = {}, enviados = 0, descartados = 0, falhas = 0;
    linhas.forEach(function (linha) {
      var doc = linha.document, f = doc.fields || {};
      var apagar = function () { chamar_('https://firestore.googleapis.com/v1/' + doc.name, { method: 'delete' }); };
      var aviso = { uid: f.uid && f.uid.stringValue, eventId: f.eventId && f.eventId.stringValue, title: f.title && f.title.stringValue,
        eventAt: Number(f.eventAt && f.eventAt.integerValue), label: f.label && f.label.stringValue };
      if (!aviso.uid || aviso.eventAt + LIMITE_ATRASO < agora) { apagar(); descartados++; return; }
      if (!(aviso.uid in aparelhos)) {
        var a = chamar_(BASE + '/devices/' + aviso.uid);
        aparelhos[aviso.uid] = a.codigo === 200 ? (a.dados.fields || {}) : null;
      }
      var ap = aparelhos[aviso.uid];
      if (!ap || !ap.enabled || !ap.enabled.booleanValue || !ap.token) { apagar(); descartados++; return; }
      var m = mensagem_(aviso), id = doc.name.split('/').pop();
      var envio = chamar_('https://fcm.googleapis.com/v1/projects/' + PROJETO + '/messages:send', {
        method: 'post', contentType: 'application/json',
        payload: JSON.stringify({ message: { token: ap.token.stringValue, notification: m,
          webpush: { headers: { TTL: '3600', Urgency: 'high' }, notification: { tag: id.slice(-60), icon: APP_URL + 'icon-192.png' }, fcm_options: { link: APP_URL + '#agenda-page' } } } })
      });
      if (envio.codigo === 200) { apagar(); enviados++; return; }
      falhas++;
      var erro = JSON.stringify(envio.dados);
      console.warn('Falha no envio', envio.codigo, erro.slice(0, 300));
      if (envio.codigo === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(erro)) {
        apagar();
        chamar_(BASE + '/devices/' + aviso.uid + '?updateMask.fieldPaths=enabled', { method: 'patch', contentType: 'application/json',
          payload: JSON.stringify({ fields: { enabled: { booleanValue: false } } }) });
        aparelhos[aviso.uid] = null;
      }
    });
    if (linhas.length) console.log('Avisos na hora: ' + linhas.length + ' · enviados: ' + enviados + ' · descartados: ' + descartados + ' · falhas: ' + falhas);
  } finally {
    trava.releaseLock();
  }
}

// Rode uma vez para ligar o envio automático a cada 1 minuto.
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('enviarAvisos').timeBased().everyMinutes(1).create();
  enviarAvisos();
  console.log('Envio automático ligado: a cada 1 minuto.');
}
