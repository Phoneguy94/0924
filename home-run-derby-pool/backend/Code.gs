const BASE_ID = 'appmyn676TqWAAbJs';
const TABLES = {
  questions: 'Questions',
  participants: 'Participants',
  players: 'Players',
  picks: 'Picks',
  settings: 'Settings'
};

function doGet(e) {
  try {
    const action = (e.parameter.action || 'bootstrap').toLowerCase();
    if (action === 'bootstrap') return jsonResponse(getBootstrap());
    if (action === 'leaderboard') return jsonResponse(getLeaderboard());
    if (action === 'player') return jsonResponse(getPlayer(e.parameter.playerKey));
    throw new Error('Unknown action');
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = String(payload.action || '').toLowerCase();
    if (action === 'submit') return jsonResponse(submitPicks(payload));
    if (action === 'save_result') return jsonResponse(saveResult(payload));
    if (action === 'save_question') return jsonResponse(saveQuestion(payload));
    throw new Error('Unknown action');
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function getBootstrap() {
  const questions = listAll(TABLES.questions)
    .map(r => ({ id: r.id, ...r.fields }))
    .filter(q => q.Enabled)
    .sort((a, b) => Number(a['Display Order'] || 999) - Number(b['Display Order'] || 999));

  const participants = listAll(TABLES.participants)
    .map(r => ({ id: r.id, ...r.fields }))
    .filter(p => p.Active)
    .sort((a, b) => Number(a['Display Order'] || 999) - Number(b['Display Order'] || 999));

  const settings = {};
  listAll(TABLES.settings).forEach(r => settings[r.fields.Setting] = r.fields.Value);

  return { ok: true, questions, participants, settings };
}

function submitPicks(payload) {
  const name = String(payload.name || '').trim();
  const answers = payload.answers || {};
  if (!name) throw new Error('Name is required.');

  const contestStatus = getSetting('Contest Status');
  if (contestStatus && contestStatus !== 'Open') throw new Error('Picks are locked.');

  const playerKey = Utilities.getUuid();
  const player = createRecords(TABLES.players, [{
    fields: {
      Name: name,
      'Player Key': playerKey,
      'Submitted At': new Date().toISOString(),
      'Picks Locked': true,
      Score: 0,
      Correct: 0
    }
  }])[0];

  const questionMap = {};
  listAll(TABLES.questions).forEach(r => questionMap[r.fields['Question ID']] = r);

  const pickRecords = Object.keys(answers).map(questionId => {
    const q = questionMap[questionId];
    if (!q) throw new Error('Unknown question: ' + questionId);
    const answer = Array.isArray(answers[questionId]) ? answers[questionId].join('\n') : String(answers[questionId]);
    return {
      fields: {
        'Pick Key': playerKey + '_' + questionId,
        Player: [player.id],
        Question: [q.id],
        'Submitted Answer': answer,
        'Points Awarded': 0,
        'Scoring Status': 'Pending'
      }
    };
  });

  chunk(pickRecords, 10).forEach(batch => createRecords(TABLES.picks, batch));
  return { ok: true, playerKey };
}

function getPlayer(playerKey) {
  if (!playerKey) throw new Error('Player key is required.');
  const players = listAll(TABLES.players, "{Player Key}='" + escapeFormula(playerKey) + "'");
  if (!players.length) throw new Error('Player not found.');
  const player = players[0];
  const picks = listAll(TABLES.picks).filter(r => (r.fields.Player || []).includes(player.id));
  const questions = listAll(TABLES.questions);
  const qById = {};
  questions.forEach(q => qById[q.id] = q.fields);
  return {
    ok: true,
    player: { id: player.id, ...player.fields },
    picks: picks.map(p => ({ id: p.id, ...p.fields, question: qById[(p.fields.Question || [])[0]] || {} }))
  };
}

function saveResult(payload) {
  requireAdmin(payload.adminPin);
  const questionId = String(payload.questionId || '');
  const records = listAll(TABLES.questions, "{Question ID}='" + escapeFormula(questionId) + "'");
  if (!records.length) throw new Error('Question not found.');
  updateRecords(TABLES.questions, [{
    id: records[0].id,
    fields: {
      'Master Answer': Array.isArray(payload.masterAnswer) ? payload.masterAnswer.join('\n') : String(payload.masterAnswer ?? ''),
      'Result Status': payload.status || 'Final',
      Points: Number(payload.points ?? records[0].fields.Points ?? 0),
      Penalty: Number(payload.penalty ?? records[0].fields.Penalty ?? 0)
    }
  }]);
  recalculateScores();
  return { ok: true };
}

function saveQuestion(payload) {
  requireAdmin(payload.adminPin);
  const fields = payload.fields || {};
  if (payload.recordId) updateRecords(TABLES.questions, [{ id: payload.recordId, fields }]);
  else createRecords(TABLES.questions, [{ fields }]);
  return { ok: true };
}

function getLeaderboard() {
  recalculateScores();
  const players = listAll(TABLES.players).map(r => ({ id: r.id, ...r.fields }));
  players.sort((a, b) => Number(b.Score || 0) - Number(a.Score || 0) || Number(b.Correct || 0) - Number(a.Correct || 0));
  return { ok: true, players };
}

function recalculateScores() {
  const questions = listAll(TABLES.questions);
  const qByRecordId = {};
  questions.forEach(q => qByRecordId[q.id] = q.fields);
  const picks = listAll(TABLES.picks);
  const players = listAll(TABLES.players);
  const totals = {};
  players.forEach(p => totals[p.id] = { score: 0, correct: 0 });

  const pickUpdates = [];
  picks.forEach(p => {
    const playerId = (p.fields.Player || [])[0];
    const questionId = (p.fields.Question || [])[0];
    const q = qByRecordId[questionId];
    if (!playerId || !q || !totals[playerId]) return;
    const scored = scorePick(q, p.fields['Submitted Answer']);
    totals[playerId].score += scored.points;
    if (scored.correct) totals[playerId].correct += 1;
    pickUpdates.push({
      id: p.id,
      fields: {
        'Points Awarded': scored.points,
        'Is Correct': scored.correct,
        'Scoring Status': scored.status
      }
    });
  });

  chunk(pickUpdates, 10).forEach(batch => updateRecords(TABLES.picks, batch));
  const playerUpdates = players.map(p => ({
    id: p.id,
    fields: { Score: totals[p.id].score, Correct: totals[p.id].correct }
  }));
  chunk(playerUpdates, 10).forEach(batch => updateRecords(TABLES.players, batch));
}

function scorePick(q, submitted) {
  if (q['Result Status'] === 'Void') return { points: 0, correct: false, status: 'Void' };
  if (q['Result Status'] !== 'Final' || !q['Master Answer']) return { points: 0, correct: false, status: 'Pending' };

  const type = q['Answer Type'];
  const points = Number(q.Points || 0);
  const penalty = Number(q.Penalty || 0);
  const master = String(q['Master Answer']).trim();
  const answer = String(submitted || '').trim();

  if (type === 'Pick Four') {
    const official = master.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const chosen = answer.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const correctCount = chosen.filter(x => official.some(y => y.toLowerCase() === x.toLowerCase())).length;
    return { points: correctCount * points, correct: correctCount === 4, status: 'Scored' };
  }

  if (type === 'Number') {
    const a = Number(answer), m = Number(master);
    if (!Number.isFinite(a) || !Number.isFinite(m)) return { points: penalty, correct: false, status: 'Scored' };
    const d = Math.abs(a - m);
    const earned = d === 0 ? points : d <= 1 ? Math.max(points - 2, 1) : d <= 3 ? Math.max(points - 4, 1) : d <= 5 ? Math.max(points - 6, 1) : d <= 10 ? 2 : penalty;
    return { points: earned, correct: d === 0, status: 'Scored' };
  }

  const correct = answer.toLowerCase() === master.toLowerCase();
  return { points: correct ? points : penalty, correct, status: 'Scored' };
}

function getSetting(name) {
  const rows = listAll(TABLES.settings, "{Setting}='" + escapeFormula(name) + "'");
  return rows.length ? rows[0].fields.Value : '';
}

function requireAdmin(pin) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
  if (!expected || String(pin) !== String(expected)) throw new Error('Invalid commissioner PIN.');
}

function listAll(table, filterFormula) {
  let records = [], offset = '';
  do {
    let url = apiUrl(table) + '?pageSize=100';
    if (offset) url += '&offset=' + encodeURIComponent(offset);
    if (filterFormula) url += '&filterByFormula=' + encodeURIComponent(filterFormula);
    const data = airtableRequest(url, 'get');
    records = records.concat(data.records || []);
    offset = data.offset || '';
  } while (offset);
  return records;
}

function createRecords(table, records) {
  return airtableRequest(apiUrl(table), 'post', { records, typecast: true }).records || [];
}

function updateRecords(table, records) {
  if (!records.length) return [];
  return airtableRequest(apiUrl(table), 'patch', { records, typecast: true }).records || [];
}

function airtableRequest(url, method, body) {
  const token = PropertiesService.getScriptProperties().getProperty('AIRTABLE_TOKEN');
  if (!token) throw new Error('AIRTABLE_TOKEN is missing from Script Properties.');
  const options = {
    method,
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token }
  };
  if (body) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }
  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const text = response.getContentText();
  const data = text ? JSON.parse(text) : {};
  if (code < 200 || code >= 300) throw new Error(data.error?.message || ('Airtable error ' + code));
  return data;
}

function apiUrl(table) {
  return 'https://api.airtable.com/v0/' + BASE_ID + '/' + encodeURIComponent(table);
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function escapeFormula(value) {
  return String(value).replace(/'/g, "\\'");
}
