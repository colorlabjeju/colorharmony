/**
 * 컬러카드 배색 리더 — 익명 집계 수신기
 *
 * 쓰는 법은 같은 폴더의 집계-설치안내.md 를 보세요.
 * 개인을 식별하는 값은 받지 않습니다. 메모 내용도 보내지 않습니다.
 */

var SHEET_NAME = '수집';
var HEADERS = [
  '시각', '이벤트', '워크숍코드', '세션',
  '카드', '카드수', '배색형태', '배색이름', '톤', '한난',
  '키워드', '자유입력', '추천카드', '맥락'
];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = getSheet_();

    sh.appendRow([
      d.at ? new Date(d.at) : new Date(),
      d.event || '',
      d.ws || '',
      d.sid || '',
      (d.codes || []).join(' '),
      d.n || (d.codes ? d.codes.length : ''),
      d.form || '',
      d.tag || '',
      d.tone || '',
      d.temp || '',
      (d.kws || []).join(', '),
      d.q || '',
      d.code || '',
      d.from || d.why || ''
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, note: 'collector alive' });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

/**
 * 집계 시트를 다시 계산합니다.
 * 스프레드시트 메뉴에서 실행하거나, 트리거로 매일 돌려도 됩니다.
 */
function 집계만들기() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = getSheet_();
  var rows = src.getDataRange().getValues();
  if (rows.length < 2) return;

  var cardCount = {}, formCount = {}, wordCount = {}, accept = 0, read = 0;

  for (var i = 1; i < rows.length; i++) {
    var ev = rows[i][1], codes = String(rows[i][4] || '').split(' ').filter(String);
    if (ev === 'read') {
      read++;
      codes.forEach(function (c) { cardCount[c] = (cardCount[c] || 0) + 1; });
      var form = rows[i][7];
      if (form) formCount[form] = (formCount[form] || 0) + 1;
    }
    if (ev === 'accept_fix' || ev === 'accept_tip') accept++;
    if (ev === 'keyword') {
      String(rows[i][10] || '').split(',').forEach(function (w) {
        w = w.trim(); if (w) wordCount[w] = (wordCount[w] || 0) + 1;
      });
    }
  }

  var out = ss.getSheetByName('집계') || ss.insertSheet('집계');
  out.clear();
  out.appendRow(['갱신 시각', new Date()]);
  out.appendRow(['판독 횟수', read]);
  out.appendRow(['추천 카드 수락', accept]);
  out.appendRow([]);

  writeBlock_(out, '카드별 선택 횟수', cardCount);
  writeBlock_(out, '배색 형태 분포', formCount);
  writeBlock_(out, '키워드 사용 횟수', wordCount);
}

function writeBlock_(sh, title, obj) {
  var pairs = Object.keys(obj).map(function (k) { return [k, obj[k]]; })
    .sort(function (a, b) { return b[1] - a[1]; });
  sh.appendRow([title]);
  sh.getRange(sh.getLastRow(), 1).setFontWeight('bold');
  if (pairs.length) sh.getRange(sh.getLastRow() + 1, 1, pairs.length, 2).setValues(pairs);
  sh.appendRow([]);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
