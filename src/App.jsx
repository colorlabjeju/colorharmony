import React, { useState, useEffect, useMemo, useRef } from "react";
import { toBlob } from "html-to-image";

/* ============================================================
   뚜띠콜로리 컬러카드 배색 리더  ·  Color Harmony Reader
   제주 자연색 46색 TC 인덱스 기반
   ============================================================ */

const FAM = {
  RR: { wheel: 0,   labh: 28,  cmax: 82, ko: "빨강",   temp: "warm" },
  YR: { wheel: 36,  labh: 58,  cmax: 88, ko: "주황",   temp: "warm" },
  YY: { wheel: 72,  labh: 92,  cmax: 96, ko: "노랑",   temp: "warm" },
  GY: { wheel: 108, labh: 126, cmax: 78, ko: "연두",   temp: "mid"  },
  GG: { wheel: 144, labh: 156, cmax: 62, ko: "초록",   temp: "cool" },
  BG: { wheel: 180, labh: 202, cmax: 58, ko: "청록",   temp: "cool" },
  BB: { wheel: 216, labh: 266, cmax: 54, ko: "파랑",   temp: "cool" },
  PB: { wheel: 252, labh: 294, cmax: 56, ko: "남보라", temp: "cool" },
  PP: { wheel: 288, labh: 320, cmax: 58, ko: "보라",   temp: "mid"  },
  RP: { wheel: 324, labh: 352, cmax: 70, ko: "자주",   temp: "warm" },
  ER: { wheel: 18,  labh: 52,  cmax: 46, ko: "갈색",   temp: "warm", earth: true },
  NE: { wheel: 216, labh: 250, cmax: 10, ko: "중성",   temp: "cool", quasi: true },
  NN: { wheel: null,labh: 85,  cmax: 0,  ko: "무채색", temp: "none", achroma: true },
};

const CARDS = [
  { c:"RR59", en:"Sweet Viburnum · Dense Red", ko:"아왜나무 열매 — 붉은 결실", place:"제주 전역", m:"강렬한 빨강은 거침없는 열정과 삶의 역동적인 에너지를 깨웁니다.", k:["확신","열정","활력","생명력"] },
  { c:"RR37", en:"Holly Tree · Red Berry", ko:"먼나무 — 붉은 겨울 열매", place:"제주 가로수", m:"깊게 익은 붉은빛은 인내 끝에 결실을 맺는 단단한 자아를 뜻합니다.", k:["묵직한","강인한","깊은","단단한"] },
  { c:"RR82", en:"Jeju Cherry Blossom · Blossom Wind", ko:"제주왕벚꽃 — 벚꽃 바람", place:"제주시", m:"연한 분홍은 봄바람에 흩날리는 꽃잎처럼 설렘과 순수한 마음을 보여줍니다.", k:["투명한","설레는","순수한","부드러운"] },
  { c:"YR59", en:"Hallabong · Sunset Bulb", ko:"한라봉 — 새콤달콤 알전구", place:"서귀포", m:"탐스러운 주황은 기쁨과 생기로 주변에 다정한 온기를 전합니다.", k:["대담한","역동적인","활기찬","다정한"] },
  { c:"YR68", en:"Hallabong · Juicy Sunrise", ko:"한라봉 — 볕빛 주황", place:"서귀포", m:"밝은 주황은 따뜻한 생기와 긍정적인 에너지를 전합니다.", k:["환한","풍요로운","생기있는","긍정적인"] },
  { c:"YY89", en:"Canola Flower · Yellow Joy", ko:"유채 — 제주 유채 물결", place:"산방산 일대", m:"찬란한 노랑은 어둠을 걷어내는 생명력과 봄의 환희, 희망을 전달합니다.", k:["찬란한","환희","생명력 있는","환한"] },
  { c:"YY84", en:"Mandarin Flower · Butter Yellow", ko:"귤꽃 — 초봄 연노랑", place:"제주 과수원", m:"따스한 연노란빛은 어떤 상황에서도 꿈을 잃지 않는 낙천적인 마음을 보여줍니다.", k:["부드러운","낙천적인","잔잔한","편안한"] },
  { c:"YY82", en:"Golden Barley · Sunlit Fields", ko:"황금보리 — 빛여문 들녘", place:"제주 동부", m:"은은한 미색은 따뜻한 햇살처럼 섬세하고 다정한 마음의 여유를 전합니다.", k:["따뜻한","부드러운","포근한","온화한"] },
  { c:"YY78", en:"Young Mandarin · Sun-Kissed Yellow", ko:"조생귤 — 햇살 머금은 노랑", place:"제주 과수원", m:"선명한 노랑은 내면의 자신감과 긍정적인 미래를 그리는 밝은 마음을 상징합니다.", k:["환영하는","풍성한","따스한","충만한"] },
  { c:"GY73", en:"Green Barley · Spike Green", ko:"청보리 — 돋은 연둣빛", place:"가파도", m:"부드러운 연초록은 봄바람에 일렁이는 청보리밭처럼 여유로운 마음을 전달합니다.", k:["밝은","유연한","희망찬","싱그러운"] },
  { c:"GY62", en:"Jeju Buckwheat · Serene Green", ko:"제주 메밀 — 고요한 여린 잎", place:"제주 중산간", m:"연한 풀빛은 소박한 들판의 평화로움 속에서 온전한 쉼을 전합니다.", k:["온화한","부드러운","조용한","고요한"] },
  { c:"GY55", en:"Young Mandarin · Sunny Peel", ko:"조생귤 — 풋풋 연초록", place:"제주 과수원", m:"싱그러운 연둣빛은 생각을 유연하게 넓히고 한 단계 성장하려는 에너지를 보여줍니다.", k:["상큼한","싱그러운","경쾌한","풋풋한"] },
  { c:"GY45", en:"Jeju Carrot · Green Carpet", ko:"제주 당근 — 겹겹 초록 융단", place:"구좌", m:"차분한 초록색은 대자연이 주는 깊은 안정감과 평온함을 전합니다.", k:["차분한","평화로운","안정된","고요한"] },
  { c:"GY43", en:"Mandarin Flower · Shadow Green", ko:"귤꽃 — 빛머문 초록잎", place:"제주 과수원", m:"은은한 초록잎은 마음에 차분한 안정감과 편안한 휴식을 전합니다.", k:["안정된","회복","온화한","편안한"] },
  { c:"GG57", en:"Bracken Fern · Sun-lit Green", ko:"고사리 — 햇살담은 초록", place:"제주 중산간", m:"싱그러운 초록은 스스로 회복하고 재생하려는 내면의 생명력을 보여줍니다.", k:["성장","희망","싱그러운","회복하는"] },
  { c:"GG47", en:"Forest of Healing · Summer Forest Green", ko:"치유의 숲 — 여름숲 초록", place:"서귀포 치유의 숲", m:"깊은 초록은 복잡한 감정을 정돈하고 균형을 찾아가는 정신력을 표현합니다.", k:["균형","싱그러운","성장","활력"] },
  { c:"GG35", en:"Jeju Torreya · Bija Forest Green", ko:"비자나무 — 비자 녹음", place:"비자림", m:"짙은 녹색은 오랜 세월 뿌리내린 지혜와 변치 않는 신념을 상징합니다.", k:["사색적인","깊은","진중한","평화로운"] },
  { c:"BG72", en:"Hamdeok Beach · Soft Aqua", ko:"함덕 해변 — 여린 물보라", place:"함덕", m:"부드러운 물빛은 마음의 긴장을 풀어주는 이완과 평온함을 상징합니다.", k:["깨끗한","투명한","청초한","낙천적인"] },
  { c:"BG63", en:"Geumneung Beach · Jade Blue", ko:"금능 해변 — 비색파도거품", place:"금능", m:"차분한 옥빛은 어느 한쪽으로 치우치지 않는 마음의 평온과 균형을 보여줍니다.", k:["안온한","차분한","조용한","평화로운"] },
  { c:"BG62", en:"Gimnyeong Beach · Sheer Water", ko:"김녕 해변 — 투명 물빛", place:"김녕", m:"투명하고 시원한 하늘색은 세상을 바라보는 순수한 마음을 상징합니다.", k:["청량","환기","투명한","여유"] },
  { c:"BG56", en:"Hamdeok Beach · Bright Water Blue", ko:"함덕 해변 — 청량 물빛", place:"함덕", m:"시원한 청록빛은 마음을 투명하게 환기시키는 기분 좋은 활력을 의미합니다.", k:["깨끗한","가벼운","시원한","청량한"] },
  { c:"BG45", en:"Yongmeori Coast · Emerald Abyss", ko:"용머리해안 — 초록심연", place:"용머리해안", m:"신비로운 청록은 미지의 세계에 대한 호기심과 탐구의 열망을 표현합니다.", k:["잔잔한","깊은","청명한","평온한"] },
  { c:"BG23", en:"Soesokkak · Lava Canyon Teal", ko:"쇠소깍 — 용암 물길", place:"쇠소깍", m:"깊은 청록빛은 내면을 고요하게 성찰하려는 의지를 상징합니다.", k:["이성적인","깊이 있는","고요한","안정된"] },
  { c:"BB73", en:"Hydrangea · Summer Sky Blue", ko:"수국 — 하늘하늘 여름", place:"제주 전역", m:"옅은 하늘색은 마음을 맑게 하는 가볍고 기분 좋은 자유로움을 표현합니다.", k:["맑은","청량한","가벼운","투명한"] },
  { c:"BB55", en:"Hydrangea · Blooming Blue", ko:"수국 — 피어난 물빛", place:"제주 전역", m:"부드럽고 경쾌한 파란빛은 마음에 편안한 안정감과 활력을 전달합니다.", k:["청량한","경쾌한","맑은","시원한"] },
  { c:"BB53", en:"Winter Hallasan · Winter Sky", ko:"한라산 — 고요한 설경", place:"한라산", m:"차분한 청회색은 고요한 사색을 도와주며 마음에 담백한 여백을 남겨줍니다.", k:["차분한","이성적인","담백한","잔잔한"] },
  { c:"BB36", en:"Hado-ri Port · Anchored Blue", ko:"하도리 포구 — 포구 청청파랑", place:"하도리", m:"선명한 파란색은 내면의 굳건한 신뢰를 바탕으로 깊은 안정감을 표현합니다.", k:["신뢰","안정","명료한","이성적인"] },
  { c:"BB25", en:"Dodubong Coast · Anchored Deep Blue", ko:"도두봉 해안가 — 깊은 물빛", place:"도두봉", m:"짙은 남색은 목표를 향해 나아가는 깊은 집중력과 의지를 상징합니다.", k:["깊은","신뢰감","차분한","안정된"] },
  { c:"BB24", en:"Baksu-gijeong · Isle Blue", ko:"박수기정 — 섬푸른 바다", place:"박수기정", m:"깊은 파랑은 넓은 시야로 상황을 바라보는 침착한 판단력을 의미합니다.", k:["고요한","단단한","신뢰감","안정된"] },
  { c:"PB26", en:"Udo Sanho Beach · Stillnight Blue", ko:"우도 산호 해변 — 홍조단괴 짙푸름", place:"우도", m:"고요한 남보라는 내면의 진실을 발견하는 사유와 통찰의 시선을 보여줍니다.", k:["깊숙한","진중한","고요한","안정적인"] },
  { c:"PP63", en:"Hydrangea · Romantic Purple", ko:"수국 — 보랏빛 속삭임", place:"제주 전역", m:"연한 보라는 일상 속 낭만을 발견하는 섬세하고 감성적인 시선을 보여줍니다.", k:["평온한","다정한","여유로운","섬세한"] },
  { c:"PP27", en:"Hydrangea · Layered Purple", ko:"수국 — 보랏빛 꽃무리", place:"제주 전역", m:"보랏빛은 일상과 예술의 경계를 넘나드는 풍부한 상상력을 상징합니다.", k:["고결한","신비로운","우아한","영감을 주는"] },
  { c:"RP51", en:"Jeju Cabbage · Purple Blush", ko:"제주 양배추 — 연보랏빛 여운", place:"제주 서부", m:"회보랏빛은 감정의 과잉을 막고 중심을 지키는 성숙한 절제를 의미합니다.", k:["차분한","우아한","세련된","고요한"] },
  { c:"RP48", en:"Hallasan Azalea · Spring Mountain Blush", ko:"한라산 털진달래 — 봄산 핑크빛", place:"한라산", m:"화사한 마젠타 핑크는 내면의 당당함과 매력으로 세상과 소통하는 힘입니다.", k:["대담한","화사한","창의적인","생동하는"] },
  { c:"RP35", en:"Halla Chive · Mystic Blossom", ko:"한라부추 — 자줏빛 봉오리", place:"한라산", m:"고혹적인 자줏빛은 내면의 능동적인 에너지와 매력을 표현합니다.", k:["고혹적인","품격","우아한","신비로운"] },
  { c:"ER55", en:"Bracken Fern · Golden Dust", ko:"고사리 — 금빛 가루", place:"제주 중산간", m:"따뜻한 황토색은 대지의 너그러움처럼 포용하는 마음을 표현합니다.", k:["성숙한","고귀한","풍요로운","따뜻한"] },
  { c:"ER44", en:"Jeju Kiwi · Fluffy Brown", ko:"제주 키위 — 보송보송 갈피", place:"제주 남부", m:"부드러운 흙갈색은 정직한 마음과 내면의 단단함을 보여줍니다.", k:["따뜻한","포근한","안정된","온화한"] },
  { c:"ER42", en:"Gwangchigi Beach · Brown Boulder", ko:"광치기 해변 — 갈색 갯바위", place:"광치기", m:"차분한 흙갈색은 내면의 중심을 지키는 깊이감과 단단함을 의미합니다.", k:["묵직한","단단한","안정적인","포용하는"] },
  { c:"ER34", en:"Jeju Volcano · Scoria Brown", ko:"제주 화산섬 — 갈색빛 화산송이", place:"제주 전역", m:"붉은 갈색은 화산이 빚어낸 강인함과 역경을 이겨내는 단단함을 의미합니다.", k:["묵직한","뿌리 깊은","듬직한","단단한"] },
  { c:"ER22", en:"St. Isidore Farm · Cedar Tree", ko:"성이시돌 목장 — 삼나무 그늘아래", place:"성이시돌", m:"어두운 고목의 색은 단단한 대지처럼 깊고 굳건한 내면의 중심을 보여줍니다.", k:["무게 있는","굳건한","안정적인","고요한"] },
  { c:"ER21", en:"Yongmeori Coast · Primeval Land", ko:"용머리해안 — 태초의 땅", place:"용머리해안", m:"짙은 암회색은 태초의 대지처럼 모든 것을 묵묵히 수용하는 힘을 보여줍니다.", k:["묵직한","안정감","침착","신중함"] },
  { c:"NN91", en:"Jeju Kohlrabi · Ivory Bite", ko:"제주 콜라비 — 아삭아삭 한입", place:"제주 서부", m:"포근한 아이보리빛은 지친 마음을 다정하게 감싸 안는 위로를 상징합니다.", k:["깨끗한","부드러운","고요한","온화한"] },
  { c:"NN90", en:"Winter Hallasan · Serene Snowfield", ko:"한라산 — 고요한 설원", place:"한라산", m:"순백은 모든 가능성을 수용할 수 있는 여백이자 새로운 시작을 의미합니다.", k:["순수한","깨끗한","밝은","무한한"] },
  { c:"NN60", en:"Winter Hallasan · Sheer Snow Shadow", ko:"한라산 — 눈 그늘빛", place:"한라산", m:"은은한 회색은 감정에 치우치지 않는 균형 잡힌 객관적 시선을 의미합니다.", k:["차분한","은은한","안정된","중립적인"] },
  { c:"NE51", en:"Geumneung Beach · Tidal Silver", ko:"금능 해변 — 물빛 언저리", place:"금능", m:"차가운 회색빛은 감정에 휘둘리지 않는 이성적 판단과 절제를 상징합니다.", k:["고요한","이성적인","절제된","도회적인"] },
  { c:"NN00", en:"Jeju Lava Tube · Cave Black", ko:"제주 용암동굴 — 용암 흑빛", place:"제주 용암동굴", m:"검정은 모든 색을 품는 무한한 깊이와 감정을 다스리는 절제력을 상징합니다.", k:["깊은","절대적인","단단한","위엄 있는"] },
];

/* ---------- 색 계산 ---------- */
function parse(code) {
  const fam = code.slice(0, 2).toUpperCase();
  const d1 = +code[2], d2 = +code[3];
  const f = FAM[fam];
  if (!f) return null;
  const L = 8 + d1 * 9.8;
  let C = f.cmax * Math.pow(d2 / 9, 0.85);
  if (fam === "NN") C = d2 * 3.2;
  if (fam === "NE") C = 2 + d2 * 2.2;
  return { fam, f, d1, d2, L, C, h: f.labh };
}
function lab2rgb(L, a, b) {
  const fi = (t) => (t > 6 / 29 ? t * t * t : 3 * (6 / 29) ** 2 * (t - 4 / 29));
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const X = 0.95047 * fi(fx), Y = fi(fy), Z = 1.08883 * fi(fz);
  return [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.204 * Y + 1.057 * Z,
  ].map((c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055));
}
const hexOf = (rgb) => "#" + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
function lch2hex(L, C, h) {
  let c = C;
  for (let i = 0; i < 30; i++) {
    const rad = (h * Math.PI) / 180;
    const rgb = lab2rgb(L, c * Math.cos(rad), c * Math.sin(rad));
    if (rgb.every((v) => v >= -0.002 && v <= 1.002)) return hexOf(rgb);
    c *= 0.94;
  }
  return hexOf(lab2rgb(L, 0, 0));
}
const BASE = CARDS.map((x) => {
  const p = parse(x.c);
  return { ...x, ...p, hex: lch2hex(p.L, p.C, p.h) };
});
const cd = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const readable = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#16232b" : "#ffffff";
};

const AX = {
  활력: ["열정","활력","생명력","역동적인","활기찬","대담한","생기있는","환희","경쾌한","생동하는","상큼한","싱그러운","화사한","찬란한","긍정적인","희망","성장","환한","풍요로운","확신","회복하는","풍성한","충만한","환영하는","희망찬","유연한","밝은","무한한","창의적인"],
  안정: ["안정된","차분한","고요한","평화로운","편안한","단단한","굳건한","묵직한","진중한","안정","포근한","온화한","잔잔한","안온한","평온한","조용한","회복","안정감","안정적인","포용하는","듬직한","뿌리 깊은","무게 있는","강인한","은은한","여유","여유로운","낙천적인","따뜻한","따스한","다정한","성숙한"],
  감성: ["신비로운","우아한","고결한","섬세한","설레는","영감을 주는","고혹적인","품격","순수한","청초한","투명한","부드러운","다정다감한","풋풋한","맑은","깨끗한","가벼운"],
  이성: ["이성적인","명료한","절제된","신뢰","신뢰감","중립적인","담백한","깊이 있는","사색적인","신중함","침착","도회적인","세련된","깊은","깊숙한","절대적인","균형","위엄 있는","청량","청량한","시원한","환기","청명한","고귀한"],
  };

/* ---------- 배색 판정 ---------- */
function readHarmony(sel) {
  if (!sel.length) return null;
  const chroma = sel.filter((s) => !s.f.achroma && s.d2 >= 1);
  const angles = [...new Set(chroma.map((s) => s.f.wheel))].sort((a, b) => a - b);
  const n = angles.length;
  let type = "", tag = "", why = "", desc = "", use = "";

  const gaps = n > 1 ? angles.map((a, i) => (i === n - 1 ? 360 - a + angles[0] : angles[i + 1] - a)) : [];
  const span = n > 1 ? 360 - Math.max(...gaps) : 0;
  const dists = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) dists.push(cd(angles[i], angles[j]));

  if (n === 0) {
    type = "Achromatic"; tag = "무채색 조화"; why = "색상 성분 없이 명도만으로 구성";
    desc = "색상 대비가 0이므로 조화의 성패가 전적으로 명도 단계에 달립니다. 명도차를 크게 벌리면 긴장이, 좁히면 정제된 고요함이 생깁니다.";
    use = "인쇄물 본문, 건축 마감재, 브랜드 기본 골격";
  } else if (n === 1) {
    type = "Monochromatic"; tag = "동일 색상 조화"; why = `${chroma[0].f.ko} 계열 하나로 구성`;
    desc = "색상이 하나뿐이라 명도·채도만으로 리듬을 만듭니다. 실패 확률이 가장 낮지만 단조로워지기 쉬우므로 명도 단계를 3단 이상 벌리는 것이 좋습니다.";
    use = "단일 주제의 전시 벽면, 시즌 룩북, 공간의 바탕색";
  } else if (n === 2) {
    const d = dists[0];
    if (d <= 36) { type = "Analogous (근접)"; tag = "인접 색상 조화";
      desc = "색상환에서 한 칸 거리입니다. 거의 같은 색으로 읽히므로 톤 차이가 조화의 전부가 됩니다.";
      use = "그러데이션 배경, 텍스타일 표면, 미묘한 층위 표현"; }
    else if (d <= 72) { type = "Analogous"; tag = "유사 색상 조화";
      desc = "자연 채집 팔레트에서 가장 흔히 나오는 관계입니다. 통일감은 확실하되 강조가 없으므로 세 번째 색을 보색 쪽에서 소량 얹으면 살아납니다.";
      use = "풍경 기반 브랜딩, 계절 팔레트, 공간 전체 톤"; }
    else if (d <= 108) { type = "Intermediate"; tag = "중차 색상 대비";
      desc = "유사도 보색도 아닌 중간 거리입니다. 어중간해 보이기 쉬우므로 한쪽의 채도를 확실히 낮춰 주종을 정해 주세요.";
      use = "정보 그래픽의 구분색, 두 갈래 카테고리 구분"; }
    else if (d < 162) { type = "Near-Complementary"; tag = "준보색 조화";
      desc = "보색의 대비력은 가지되 충돌은 덜합니다. 실무에서 순보색보다 다루기 쉬운 관계입니다.";
      use = "패키지 주·보조색, 포스터 대비 구조"; }
    else { type = "Complementary"; tag = "보색 조화";
      desc = "대비가 최대인 관계입니다. 잔상 관계라 서로의 채도를 끌어올려 주지만 면적을 반반으로 두면 시선이 분산됩니다. 7:3 이상으로 기울이세요.";
      use = "시선을 붙잡아야 하는 사인, 표지, 강조 요소"; }
    why = `색상 간격 ${d}°`;
  } else if (n === 3) {
    const s3 = [...dists].sort((a, b) => a - b);
    if (span <= 90) { type = "Analogous"; tag = "유사 3색 조화";
      desc = "한 방향으로 흐르는 그러데이션 구조입니다. 시간과 계절의 변화를 보여주기에 적합합니다.";
      use = "시퀀스가 있는 기록물, 지역 색채 지도"; }
    else if (s3[0] <= 72 && s3[1] >= 126 && s3[2] >= 126) { type = "Split-Complementary"; tag = "분리 보색 조화";
      desc = "보색을 둘로 쪼갠 구조입니다. 보색의 활력을 유지하면서 충돌을 줄여, 일곱 가지 배색 중 실패가 가장 적은 형태로 꼽힙니다.";
      use = "브랜드 3색 체계, 교육 교구, 아동 대상 그래픽"; }
    else if (s3[0] >= 90) { type = "Triadic"; tag = "3색 등간격 조화";
      desc = "색상환을 삼등분한 구조입니다. 대비와 균형이 동시에 성립해 생동감이 큽니다. 세 색을 모두 고채도로 쓰면 유아적으로 보이므로 두 색은 톤을 낮추세요.";
      use = "축제·이벤트 그래픽, 놀이 공간, 굿즈 라인업"; }
    else { type = "Custom 3-Tone"; tag = "비정형 3색";
      desc = "정형 도식에 들어맞지 않는 조합입니다. 색상 관계보다 톤 운용으로 묶는 편이 낫습니다.";
      use = "실측 채집 팔레트 그대로의 기록"; }
    why = `색상 간격 ${dists.join("° / ")}°`;
  } else {
    const even = gaps.every((g) => Math.abs(g - 360 / n) <= 40);
    if (span <= 108 + (n - 4) * 36) { type = "Analogous"; tag = `유사 ${n}색 조화`;
      desc = "좁은 색상 구간 안에서 톤만 흩어진 구조입니다. 자연 채집 팔레트의 전형이며, 통일감이 강한 대신 강조가 없습니다.";
      use = "장소 기반 색채 아카이브, 공간 전체 마감"; }
    else if (even && n === 4) { type = "Square"; tag = "정사각 4색 조화";
      desc = "색상환을 사등분한 구조입니다. 지배색이 자연히 생기지 않으므로 면적비를 인위적으로 기울이지 않으면 산만해집니다.";
      use = "카테고리가 넷인 시스템, 다국면 인포그래픽"; }
    else if (even && n === 5) { type = "Pentadic"; tag = "5색 등간격 조화";
      desc = "색상환을 오등분한 구조입니다. 정보량이 가장 많아 팔레트라기보다 색채 지도에 가깝습니다.";
      use = "지역 전체 색채 스펙트럼 제시"; }
    else if (n === 4 && dists.filter((d) => d >= 144).length >= 2) { type = "Tetradic"; tag = "사각(보색쌍 2조) 조화";
      desc = "보색 쌍 두 개가 겹친 구조입니다. 난색과 한색이 자동으로 섞여 풍부하지만, 네 색을 균등하게 쓰면 무너집니다. 한 쌍을 주, 다른 쌍을 종으로 두세요.";
      use = "복합 문화공간, 다층 브랜드 체계"; }
    else if (angles.find((a) => angles.every((b) => a === b || cd(a, b) >= 108)) !== undefined) {
      type = "Analogous + Accent"; tag = "유사색 + 강조색";
      desc = "다수의 유사색이 바탕을 이루고 한 색이 멀리 떨어져 강조 역할을 합니다. 실무에서 가장 안정적으로 쓰이는 구조입니다.";
      use = "웹·앱 UI, 공간 사인 체계, 출판물"; }
    else { type = `Custom ${n}-Tone`; tag = `비정형 ${n}색`;
      desc = "정형 도식과 어긋난 조합입니다. 색상보다 톤의 일관성으로 묶어야 합니다.";
      use = "현장 채집 결과 그대로의 기록"; }
    why = `색상 ${n}종 · 분포폭 ${span}°`;
  }

  const Ls = sel.map((s) => s.L), Cs = sel.map((s) => s.C);
  const dL = Math.max(...Ls) - Math.min(...Ls);
  const dC = Math.max(...Cs) - Math.min(...Cs);
  let tone, toneDesc, toneEn = "";
  if (n <= 1 && dL >= 25) { tone = "같은 색상, 다른 밝기"; toneEn = "Tone on Tone"; toneDesc = "같은 색상 안에서 명도만 벌린 구성입니다. 깊이감이 생기고 정돈되어 보입니다."; }
  else if (dL < 14 && dC < 14) { tone = "비슷한 톤끼리"; toneEn = "Tone in Tone"; toneDesc = "색상은 다르지만 톤이 거의 같습니다. 부드럽게 어우러지는 대신 주목성이 낮습니다."; }
  else if (span <= 36 && dL < 18) { tone = "거의 같은 색끼리"; toneEn = "Camaïeu"; toneDesc = "거의 같은 색끼리의 미세한 차이로만 구성된 섬세한 배색입니다."; }
  else if (dL >= 45) { tone = "명도 대비 강함"; toneDesc = "명도차가 커서 구조가 또렷하게 읽힙니다. 가독성과 주목성이 높습니다."; }
  else if (dC >= 35) { tone = "채도 대비 강함"; toneDesc = "선명한 색과 탁한 색이 함께 있어 강조 관계가 자연히 생깁니다."; }
  else { tone = "중간 톤 대비"; toneDesc = "명도·채도 모두 중간 정도로 벌어진 무난한 구성입니다."; }

  const warm = sel.filter((s) => s.f.temp === "warm").length;
  const cool = sel.filter((s) => s.f.temp === "cool").length;
  const temp = warm > cool ? "난색 우세" : cool > warm ? "한색 우세" : warm + cool === 0 ? "중성" : "한난 균형";

  const byC = [...sel].sort((a, b) => a.C - b.C);
  const accent = byC[byC.length - 1], dominant = byC[0];
  const support = byC.filter((s) => s !== accent && s !== dominant);

  const score = { 활력: 0, 안정: 0, 감성: 0, 이성: 0 };
  sel.forEach((s) => s.k.forEach((w) => Object.entries(AX).forEach(([ax, l]) => { if (l.includes(w)) score[ax]++; })));
  const top = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const NARR = { 활력: "밖으로 뻗어나가는 에너지", 안정: "안으로 자리 잡는 안정감", 감성: "섬세하게 흔들리는 감성", 이성: "차갑게 정돈된 이성" };
  const story = top[0][1] === 0
    ? "선택하신 색들의 키워드가 아직 한 방향으로 모이지 않았습니다."
    : top[1][1] > 0 && top[1][1] >= top[0][1] * 0.65
    ? `${NARR[top[0][0]]}과 ${NARR[top[1][0]]}이 함께 놓인 배색입니다. 두 성질이 서로를 눌러 주기 때문에 어느 한쪽으로 치우치지 않는 인상을 만듭니다.`
    : `${NARR[top[0][0]]}이 배색 전체를 이끕니다. 나머지 색은 이 방향을 받쳐 주는 역할에 가깝습니다.`;

  return { type, tag, why, desc, use, tone, toneEn, toneDesc, temp, dL, dC, span, angles, accent, dominant, support, story, score, chroma, n };
}

/* ---------- 보완색 추천 ---------- */
function suggest(sel, db) {
  if (!sel.length || sel.length >= 5) return [];
  const picked = new Set(sel.map((s) => s.c));
  const chroma = sel.filter((s) => !s.f.achroma && s.d2 >= 1);
  const out = [];
  const hasNeutral = sel.some((s) => s.f.achroma || s.f.quasi);
  const angles = [...new Set(chroma.map((s) => s.f.wheel))];

  if (angles.length) {
    const mean = Math.atan2(
      angles.reduce((a, w) => a + Math.sin((w * Math.PI) / 180), 0),
      angles.reduce((a, w) => a + Math.cos((w * Math.PI) / 180), 0)
    ) * 180 / Math.PI;
    const opp = ((mean + 180) % 360 + 360) % 360;
    const cands = db.filter((d) => !picked.has(d.c) && d.f.wheel !== null && !d.f.achroma && cd(d.f.wheel, opp) <= 36 && d.d2 >= 5)
      .sort((a, b) => b.C - a.C);
    if (cands[0]) out.push({ card: cands[0], why: "보색 자리의 강조색 — 유사색으로 몰린 팔레트에 초점이 생깁니다" });
    const split = db.filter((d) => !picked.has(d.c) && d.f.wheel !== null && !d.f.achroma && cd(d.f.wheel, (opp + 36) % 360) <= 18 && d.d2 >= 4)
      .sort((a, b) => b.C - a.C);
    if (split[0] && split[0].c !== cands[0]?.c) out.push({ card: split[0], why: "분리 보색 자리 — 대비는 살리고 충돌은 줄입니다" });
  }
  if (!hasNeutral) {
    const dark = sel.every((s) => s.L > 45);
    const neu = db.filter((d) => !picked.has(d.c) && (d.f.achroma || d.f.quasi))
      .sort((a, b) => (dark ? a.L - b.L : b.L - a.L));
    if (neu[0]) out.push({ card: neu[0], why: dark ? "명도를 아래로 벌려 구조를 잡아 주는 무채색" : "여백을 만들어 주는 밝은 무채색" });
  }
  return out.slice(0, 3);
}



/* ---------- 보완점 읽기 ---------- */
const SHADOW = {
  RR: { over: ["조급함", "충동", "소진"],        vis: "눈이 먼저 쏠려서 다른 색이 잘 보이지 않습니다",
        ofix: "면적을 10% 안쪽으로 줄이고 어두운 갈색이나 깊은 초록을 바닥에 두면 열기가 가라앉습니다.",
        under: ["의욕 저하", "냉담"],            ufix: "채도 높은 난색을 강조로 조금 넣으면 힘이 살아납니다." },
  YR: { over: ["들뜸", "산만함"],                vis: "화면 전체가 들뜨고 가벼워 보입니다",
        ofix: "밝은 무채색으로 여백을 주면 들뜬 기운이 정리됩니다.",
        under: ["위축", "무미건조함"],           ufix: "따뜻한 주황 계열을 강조로 쓰면 분위기가 살아납니다." },
  YY: { over: ["가벼움", "인정 욕구"],           vis: "밝은 바탕 위에서는 글씨나 형태가 잘 안 읽힙니다",
        ofix: "짙은 색으로 받쳐 주면 가벼움이 줄고 무게가 생깁니다.",
        under: ["자신감 저하", "비관"],          ufix: "밝은 노랑을 조금 넣으면 시야가 환해집니다." },
  GY: { over: ["설익음", "흩어지는 호기심"],     vis: "색이 떠 보이고 정돈되지 않은 느낌이 납니다",
        ofix: "짙은 초록이나 갈색을 함께 두면 들뜬 새싹이 자리를 잡습니다.",
        under: ["굳어짐", "변화 거부"],          ufix: "연둣빛 한 장이 굳은 자리에 숨통을 틔웁니다." },
  GG: { over: ["정체", "회피"],                  vis: "넓게 깔리면 평평해 보여 깊이가 사라집니다",
        ofix: "난색을 소량 넣으면 멈춰 있던 느낌에 움직임이 생깁니다.",
        under: ["지침", "회복력 저하"],          ufix: "싱그러운 초록이 회복의 자리를 만들어 줍니다." },
  BG: { over: ["거리 두기", "감정 차단"],        vis: "시원하지만 거리감이 생겨 차갑게 읽힙니다",
        ofix: "따뜻한 색 한 장이 거리감을 좁혀 줍니다.",
        under: ["정리되지 않음"],                ufix: "맑은 청록이 생각을 정리해 줍니다." },
  BB: { over: ["경직", "차가움"],                vis: "넓어질수록 무겁고 가라앉아 보입니다",
        ofix: "난색이나 밝은 무채색이 굳은 기운을 풀어 줍니다.",
        under: ["불신", "흔들림"],               ufix: "선명한 파랑이 기준선을 세워 줍니다." },
  PB: { over: ["고립", "침잠"],                  vis: "어두운 쪽으로 쏠려 침침해 보입니다",
        ofix: "밝은 색의 면적을 늘리면 가라앉은 분위기가 트입니다.",
        under: ["성찰 부재"],                    ufix: "깊은 남보라가 안을 들여다볼 자리를 냅니다." },
  PP: { over: ["현실 회피", "자기 몰입"],        vis: "넓게 쓰면 현실감이 옅어 보입니다",
        ofix: "갈색이나 무채색이 발을 땅에 붙여 줍니다.",
        under: ["건조함"],                       ufix: "보랏빛 한 장이 상상의 여지를 더해 줍니다." },
  RP: { over: ["과시", "인정 갈망"],             vis: "시선을 강하게 끌어서 넓으면 부담스럽습니다",
        ofix: "무채색 바탕을 넓게 쓰면 과하게 읽히지 않습니다.",
        under: ["표현 억제"],                    ufix: "화사한 자주가 자기를 드러낼 통로가 됩니다." },
  ER: { over: ["완고함", "둔중함"],              vis: "둔하고 답답한 인상이 됩니다",
        ofix: "밝고 선명한 색을 강조로 쓰면 무거움이 풀립니다.",
        under: ["뿌리 없음"],                    ufix: "짙은 갈색이 바닥을 잡아 줍니다." },
  NN: { over: ["무감각", "단절"],                vis: "밋밋해지고 생기가 빠집니다",
        ofix: "유채색 한 장이 온기를 되돌려 줍니다.",
        under: ["쉴 여백 없음"],                 ufix: "밝은 무채색이 눈 둘 자리를 만들어 줍니다." },
  NE: { over: ["냉소", "거리감"],                vis: "건조하고 사무적으로 보입니다",
        ofix: "난색 한 장이 차가움을 덜어 줍니다.",
        under: ["절제 부족"],                    ufix: "중성 회색이 과열을 식혀 줍니다." },
};

const AXIS_PICK = {
  활력: (d) => d.f.temp === "warm" && d.d2 >= 6,
  안정: (d) => d.L < 45 && (d.fam === "ER" || d.f.temp === "cool"),
  감성: (d) => d.L > 70 && d.d2 <= 4,
  이성: (d) => ["BB", "BG", "NE", "NN"].includes(d.fam) && d.d1 <= 6,
};

function readShadow(sel, h, db) {
  if (!sel.length || !h) return null;
  const used = sel.map((s) => s.c);
  const pick = (pred, cmp) => {
    const c = db.filter((d) => !used.includes(d.c) && pred(d));
    return c.length ? c.sort(cmp || (() => 0))[0] : null;
  };
  const Ls = sel.map((s) => s.L);
  const lo = Math.min(...Ls), hi = Math.max(...Ls);
  const mid = (lo + hi) / 2;

  // 고른 색은 이미 팔레트 안에 있으므로, 말이 되는 경고는 "넓게 썼을 때" 한쪽뿐입니다.
  const cards = [...sel].sort((a, b) => b.C - a.C).slice(0, 3).map((s) => {
    const sh = SHADOW[s.fam] || SHADOW.NN;
    return { code: s.c, name: s.ko.split(" — ")[0], hex: s.hex, vis: sh.vis, words: sh.over, fix: sh.ofix };
  });

  const items = [];
  const add2 = (state, fix, rec) => { if (items.length < 5) items.push({ state, fix, rec }); };

  const hiC = sel.filter((s) => s.d2 >= 6).length;
  const hasNeutral = sel.some((s) => s.f.achroma || s.f.quasi);
  const warm = sel.filter((s) => s.f.temp === "warm").length;
  const cool = sel.filter((s) => s.f.temp === "cool").length;

  if (h.dL < 15 && sel.length >= 3)
    add2("명도가 서로 붙어 있어 무엇이 먼저 보여야 하는지 읽히지 않습니다.",
        "가장 어두운 색을 한 장 더해 바닥을 만들면 나머지가 또렷해집니다.",
        pick((d) => d.L < 35, (a, b) => a.L - b.L));

  if (h.span <= 72 && h.dC < 20)
    add2("색상도 채도도 가까워서 오래 보면 단조로워집니다.",
        "같은 계열에서 명도가 세 단계 이상 떨어진 색을 넣어 리듬을 만드세요.",
        pick((d) => d.fam === sel[0].fam && Math.abs(d.d1 - sel[0].d1) >= 3, (a, b) => b.C - a.C));

  if (hiC >= 3)
    add2("선명한 색이 셋 이상이라 서로 주도권을 다툽니다.",
        "하나만 강조로 남기고 나머지는 같은 계열의 낮은 채도로 바꿔 보세요.",
        pick((d) => d.d2 <= 3 && !d.f.achroma, (a, b) => b.L - a.L));

  if (h.dL > 62)
    add2("밝음과 어둠으로 갈려 중간 지대가 없습니다.",
        "중간 명도 한 장이 양쪽을 이어 주면 긴장이 누그러집니다.",
        pick((d) => Math.abs(d.L - mid) < 10, (a, b) => Math.abs(a.L - mid) - Math.abs(b.L - mid)));

  if (hi < 42)
    add2("전체가 어두워 무게가 한쪽으로 쏠립니다.",
        "밝은 색을 10% 정도 얹으면 숨 쉴 틈이 생깁니다.",
        pick((d) => d.L > 78, (a, b) => b.L - a.L));

  if (lo > 74 && h.dC < 25)
    add2("전체가 옅어 실체감이 약합니다.",
        "짙은 색 하나가 중심을 잡아 주면 형태가 또렷해집니다.",
        pick((d) => d.L < 40, (a, b) => a.L - b.L));

  if (!hasNeutral && sel.length >= 3)
    add2("쉬어 갈 무채색이 없어 눈 둘 곳이 없습니다.",
        "무채색 한 장을 바탕으로 깔면 나머지 색이 살아납니다.",
        pick((d) => d.f.achroma || d.f.quasi, (a, b) => (hi > 60 ? a.L - b.L : b.L - a.L)));

  if (h.type.startsWith("Complementary") && hiC >= 2)
    add2("보색이 둘 다 선명해 경계에서 색이 떨려 보입니다.",
        "두 색 사이에 무채색을 끼우거나 한쪽 면적을 10%로 줄이세요.",
        pick((d) => d.f.achroma, (a, b) => b.L - a.L));

  Object.entries(h.score).forEach(([ax, v]) => {
    if (v !== 0) return;
    const T = { 활력: ["밀고 나갈 힘이 비어 있습니다.", "채도 높은 난색을 강조로 넣어 보세요."],
                안정: ["기댈 바닥이 없습니다.", "어두운 갈색이나 깊은 색이 중심을 잡아 줍니다."],
                감성: ["부드럽게 풀어 줄 여지가 없습니다.", "연하고 밝은 색이 숨통을 틔웁니다."],
                이성: ["정리해 줄 축이 없습니다.", "파랑이나 무채색이 판단의 거리를 만들어 줍니다."] }[ax];
    add2(T[0], T[1], pick(AXIS_PICK[ax], (a, b) => b.C - a.C));
  });

  if (warm === 0 && sel.length >= 2)
    add2("난색이 하나도 없습니다.", "따뜻한 색 한 장이 다가서기 쉬운 인상을 만듭니다.",
        pick((d) => d.f.temp === "warm" && d.d2 >= 5, (a, b) => b.C - a.C));
  if (cool === 0 && sel.length >= 2)
    add2("한색이 하나도 없습니다.", "시원한 색 한 장이 답답함을 덜어 줍니다.",
        pick((d) => d.f.temp === "cool" && d.d2 >= 4, (a, b) => b.C - a.C));

  if (!items.length)
    add2("구조적으로 손볼 곳은 보이지 않습니다.", "면적비만 지켜 주면 그대로 쓰기 좋은 배색입니다.", null);

  return { cards, items };
}


/* ---------- 배색 형태 다듬기 ----------
   한 장만 바꾸면 정형 배색이 완성되는 경우를 찾아 제안합니다.
   색상환 자리(색상군)를 옮기는 제안이므로, 바꿀 카드와 가장 비슷한 밝기·채도를 가진 카드를 고릅니다. */
const FORM_TARGETS = [
  { name: "보색 조화",        offs: [0, 180] },
  { name: "분리 보색 조화",   offs: [0, 144, 216] },
  { name: "3색 등간격 조화",  offs: [0, 108, 216] },
  { name: "유사 색상 조화",   offs: [0, 36, 72] },
  { name: "정사각 4색 조화",  offs: [0, 72, 180, 252] },
];

function readForm(sel, h, db) {
  if (!sel.length || !h) return [];
  const out = [];
  const used = sel.map((s) => s.c);
  const ch = sel.filter((s) => !s.f.achroma && s.d2 >= 1);
  const hues = [...new Set(ch.map((s) => s.f.wheel))].sort((a, b) => a - b);

  // 1) 한 장만 바꾸면 정형이 되는가 — 비정형일 때만 제안합니다
  const loose = h.type.startsWith("Custom") || h.type === "Analogous + Accent";
  if (loose && hues.length >= 2 && hues.length <= 4) {
    const sols = [];
    FORM_TARGETS.forEach((t) => {
      if (t.offs.length !== hues.length || t.name === h.tag) return;
      for (let b = 0; b < 10; b++) {
        const need = t.offs.map((o) => (b * 36 + o) % 360);
        const miss = hues.filter((x) => !need.includes(x));
        const want = need.filter((x) => !hues.includes(x));
        if (miss.length !== 1 || want.length !== 1) continue;
        const from = ch.filter((s) => s.f.wheel === miss[0]).sort((a, b2) => a.C - b2.C)[0];
        if (!from) continue;
        const cand = db.filter((d) => !used.includes(d.c) && d.f.wheel === want[0] && !d.f.achroma)
          .sort((x, y) => (Math.abs(x.L - from.L) + Math.abs(x.C - from.C)) - (Math.abs(y.L - from.L) + Math.abs(y.C - from.C)))[0];
        if (cand) sols.push({ form: t.name, from, to: cand, cost: from.C + Math.abs(cand.L - from.L) * 0.3 });
      }
    });
    // 선명한 색은 그 배색의 얼굴입니다. 바꾸라고 권할 때는 가장 덜 두드러지는 카드부터 고릅니다.
    const best = sols.sort((a, b) => a.cost - b.cost)[0] || null;
    if (best) out.push({
      kind: "swap",
      title: "한 장만 바꾸면 형태가 맞습니다",
      line: `${best.from.c} ${best.from.ko.split(" — ")[0]} 자리에 ${best.to.f.ko} 계열을 넣으면 색상환에서 간격이 고르게 떨어져 ${best.form}가 완성됩니다. 밝기와 선명함이 가장 비슷한 카드로 골랐으니 분위기는 크게 달라지지 않습니다.`,
      from: best.from, to: best.to,
    });
  }

  // 2) 모두 선명하고 밝을 때 — 무게중심 세우기
  const allLight = sel.every((s) => s.L > 44);
  const manyVivid = sel.filter((s) => s.d2 >= 5).length >= Math.max(2, sel.length - 1);
  if (allLight && manyVivid && sel.length >= 2) {
    // 검정보다 땅빛 어두운 색이 바닥으로 더 자연스럽습니다
    const anchor = db.filter((d) => !used.includes(d.c) && d.L < 36 && d.d2 <= 5)
      .sort((a, b) => (a.L + (a.f.achroma ? 100 : 0) + (a.fam === "ER" ? -4 : 0))
                    - (b.L + (b.f.achroma ? 100 : 0) + (b.fam === "ER" ? -4 : 0)))[0];
    if (anchor) out.push({
      kind: "add",
      title: "중심을 잡아 줄 색이 없습니다",
      line: `고른 색이 모두 밝고 선명해서 시선이 머물 바닥이 없습니다. 어둡고 차분한 색 한 장을 10% 안팎으로 깔면 나머지 색이 그 위에 떠올라 깊이가 생깁니다.`,
      to: anchor,
    });
  }

  // 3) 같은 색상인데 밝기가 붙어 있을 때 — 계단 만들기
  if (hues.length <= 1 && h.dL < 24 && sel.length >= 2) {
    const base = ch[0] || sel[0];
    const step = db.filter((d) => !used.includes(d.c) && d.fam === base.fam && Math.abs(d.d1 - base.d1) >= 3)
      .sort((a, b) => Math.abs(b.L - base.L) - Math.abs(a.L - base.L))[0];
    if (step) out.push({
      kind: "add",
      title: "같은 색상이라면 밝기로 리듬을 만듭니다",
      line: `색상이 하나뿐일 때는 밝기 차이가 배색의 전부입니다. 지금은 단계가 좁아 평평하게 읽히니, 세 단계 이상 떨어진 색을 넣어 보세요.`,
      to: step,
    });
  }

  return out.slice(0, 3);
}

/* ---------- 키워드로 배색 찾기 ---------- */
const VOCAB = (() => {
  const all = [...new Set(CARDS.flatMap((c) => c.k))];
  const g = { 활력: [], 안정: [], 감성: [], 이성: [], 기타: [] };
  all.forEach((w) => {
    const ax = Object.keys(AX).find((a) => AX[a].includes(w));
    g[ax || "기타"].push(w);
  });
  Object.values(g).forEach((l) => l.sort((a, b) => a.localeCompare(b, "ko")));
  return g;
})();

const axisOf = (words) => {
  const p = { 활력: 0, 안정: 0, 감성: 0, 이성: 0 };
  words.forEach((w) => Object.keys(AX).forEach((a) => { if (AX[a].includes(w)) p[a]++; }));
  return p;
};

function scoreCards(kws, text, db) {
  const want = axisOf(kws);
  const wantSum = Math.max(1, Object.values(want).reduce((a, b) => a + b, 0));
  const t = text.trim();
  return db.map((d) => {
    let s = 0;
    const hit = [];
    kws.forEach((k) => {
      if (d.k.includes(k)) { s += 4; hit.push(k); }
      else if (d.k.some((w) => w.includes(k) || k.includes(w))) { s += 1.8; hit.push(k); }
      else if (d.m.includes(k)) { s += 1.2; hit.push(k); }
    });
    if (t) {
      if (d.k.some((w) => w.includes(t))) s += 2.5;
      if (d.m.includes(t) || d.ko.includes(t) || d.place.includes(t)) s += 1.8;
      if (d.en.toLowerCase().includes(t.toLowerCase())) s += 1.2;
    }
    const mine = axisOf(d.k);
    const mineSum = Math.max(1, Object.values(mine).reduce((a, b) => a + b, 0));
    const dot = Object.keys(want).reduce((acc, a) => acc + (want[a] / wantSum) * (mine[a] / mineSum), 0);
    s += dot * 3;
    return { d, s, hit: [...new Set(hit)] };
  }).sort((a, b) => b.s - a.s);
}

const FORMS = [
  { id: "split",  name: "분리 보색 조화",   off: [0, 144, 216], tol: 22, note: "활력은 살리고 충돌은 줄인 3색" },
  { id: "comp",   name: "보색 조화",        off: [0, 180],      tol: 26, note: "대비가 가장 강한 2색" },
  { id: "analog", name: "유사 색상 조화",   off: [0, 36, 72],   tol: 16, note: "한 방향으로 흐르는 3색" },
  { id: "triad",  name: "3색 등간격 조화",  off: [0, 108, 216], tol: 26, note: "대비와 균형이 함께 서는 3색" },
  { id: "mono",   name: "동일 색상 조화",   off: [0],           tol: 0,  note: "한 색상 안에서 명도만 벌린 구성" },
];

function buildPalettes(scored, addNeutral) {
  const chroma = scored.filter((e) => e.d.f.wheel !== null && !e.d.f.achroma && e.d.d2 >= 1);
  if (!chroma.length) return [];
  const anchor = chroma[0];
  const out = [];

  FORMS.forEach((form) => {
    let picks = [anchor];
    if (form.id === "mono") {
      const same = chroma.filter((e) => e.d.fam === anchor.d.fam && e.d.c !== anchor.d.c);
      const far = same.filter((e) => Math.abs(e.d.d1 - anchor.d.d1) >= 2).slice(0, 2);
      picks = [anchor, ...(far.length ? far : same.slice(0, 2))];
    } else {
      form.off.slice(1).forEach((off) => {
        const target = (anchor.d.f.wheel + off + 360) % 360;
        const cand = chroma.find((e) => !picks.includes(e) && cd(e.d.f.wheel, target) <= form.tol);
        if (cand) picks.push(cand);
      });
    }
    if (picks.length < 2) return;

    if (addNeutral && picks.length < 5) {
      const dark = picks.every((e) => e.d.L > 45);
      const neu = scored.filter((e) => e.d.f.achroma || e.d.f.quasi)
        .sort((a, b) => (dark ? a.d.L - b.d.L : b.d.L - a.d.L))[0];
      if (neu) picks.push(neu);
    }

    const avg = picks.reduce((a, e) => a + e.s, 0) / picks.length;
    out.push({
      form, codes: picks.map((e) => e.d.c),
      cards: picks.map((e) => e.d),
      hits: [...new Set(picks.flatMap((e) => e.hit))],
      avg,
    });
  });

  return out.sort((a, b) => b.avg - a.avg).slice(0, 3);
}

/* ---------- 색상환 ---------- */
function Wheel({ sel }) {
  const R = 128, r = 96, cx = 160, cy = 160;
  const fams = Object.entries(FAM).filter(([, f]) => f.wheel !== null && !f.quasi && !f.earth);
  const arc = (a0, a1) => {
    const p = (ang, rad) => [cx + rad * Math.cos(((ang - 90) * Math.PI) / 180), cy + rad * Math.sin(((ang - 90) * Math.PI) / 180)];
    const [x1, y1] = p(a0, R), [x2, y2] = p(a1, R), [x3, y3] = p(a1, r), [x4, y4] = p(a0, r);
    return `M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 0 0 ${x4},${y4} Z`;
  };
  const pts = sel.filter((s) => s.f.wheel !== null && s.d2 >= 1).map((s, i, arr) => {
    const same = arr.filter((x, j) => x.f.wheel === s.f.wheel && j < i).length;
    const rad = (r + R) / 2 - same * 21;
    const ang = ((s.f.wheel - 90) * Math.PI) / 180;
    return { x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang), hex: s.hex };
  });
  const hull = [...pts].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  const neut = sel.filter((s) => s.f.wheel === null || s.d2 < 1);
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[300px]">
      {fams.map(([k, f]) => (
        <path key={k} d={arc(f.wheel - 18, f.wheel + 18)} fill={lch2hex(62, f.cmax * 0.92, f.labh)} opacity={sel.length ? 0.3 : 0.85} />
      ))}
      {fams.map(([k, f]) => {
        const a = ((f.wheel - 90) * Math.PI) / 180;
        return <text key={k} x={cx + (R + 16) * Math.cos(a)} y={cy + (R + 16) * Math.sin(a) + 4} textAnchor="middle" fontSize="10" fill="#7b8a92">{k}</text>;
      })}
      {(() => {
        const a = ((FAM.ER.wheel - 90) * Math.PI) / 180;
        return (
          <g opacity={sel.some((s) => s.fam === "ER") ? 1 : 0.45}>
            <line x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="#16232b" strokeWidth="1" strokeDasharray="3 3" opacity=".5" />
            <text x={cx + (R + 17) * Math.cos(a)} y={cy + (R + 17) * Math.sin(a) + 4} textAnchor="middle" fontSize="10" fill="#7b8a92">ER</text>
          </g>
        );
      })()}
      {hull.length > 2 && <polygon points={hull.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#16232b" strokeWidth="1.4" opacity=".75" />}
      {hull.length === 2 && <line x1={hull[0].x} y1={hull[0].y} x2={hull[1].x} y2={hull[1].y} stroke="#16232b" strokeWidth="1.4" opacity=".75" />}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="13" fill={p.hex} stroke="#16232b" strokeWidth="1.4" />)}
      {neut.length > 0 && (
        <g>
          {neut.map((s, i) => <circle key={i} cx={cx - (neut.length - 1) * 15 + i * 30} cy={cy} r="12" fill={s.hex} stroke="#16232b" strokeWidth="1.2" />)}
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="9.5" fill="#7b8a92">무채색</text>
        </g>
      )}
    </svg>
  );
}

const PRESETS = [
  { n: "보색", v: ["RR59", "BG45"] },
  { n: "분리 보색", v: ["RR59", "GG47", "BB36"] },
  { n: "3색 등간격", v: ["RR59", "GY55", "BB36"] },
  { n: "유사 + 강조", v: ["BG62", "BB73", "BB55", "PB26", "YR59"] },
  { n: "동일 색상", v: ["BB73", "BB55", "BB36", "BB25"] },
];
const INK = "#16232b";
const STORE_KEY = "tutticolori.reader.v1";

/* ---------- 익명 집계 ----------
   앱스 스크립트 웹앱 URL을 넣으면 수집이 켜집니다. 비워 두면 아무것도 보내지 않습니다.
   개인을 식별하는 값은 보내지 않습니다. 메모 내용도 보내지 않습니다. */
const ENDPOINT = "";

const sessionId = (() => {
  try {
    let v = localStorage.getItem("tutticolori.sid");
    if (!v) { v = Math.random().toString(36).slice(2, 10); localStorage.setItem("tutticolori.sid", v); }
    return v;
  } catch (e) { return "none"; }
})();

function track(event, payload) {
  if (!ENDPOINT) return;
  try {
    const body = JSON.stringify({ event, sid: sessionId, at: new Date().toISOString(), ...payload });
    if (navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain;charset=UTF-8" }));
    else fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body, keepalive: true });
  } catch (e) { /* 수집 실패는 사용에 영향을 주지 않습니다 */ }
}

export default function App() {
  const [tab, setTab] = useState("read");
  const [picked, setPicked] = useState([]);
  const [typed, setTyped] = useState("");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [note, setNote] = useState("");
  const [kws, setKws] = useState([]);
  const [qtext, setQtext] = useState("");
  const [wsCode, setWsCode] = useState(() => { try { return localStorage.getItem("tutticolori.ws") || ""; } catch (e) { return ""; } });
  const saveWs = (v) => { setWsCode(v); try { localStorage.setItem("tutticolori.ws", v); } catch (e) {} };
  const [withNeutral, setWithNeutral] = useState(true);
  const [imgUrl, setImgUrl] = useState("");
  // 색 견본 보정은 전문가용. 주소 끝에 #pro 를 붙이면 열립니다.
  const [pro] = useState(() => {
    try { return /pro/.test(window.location.hash + window.location.search); } catch (e) { return false; }
  });
  const [ready, setReady] = useState(false);
  const sheetRef = useRef(null);
  const gridRef = useRef(null);
  const blobRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const d = JSON.parse(raw); setSaved(d.saved || []); setOverrides(d.overrides || {}); }
    } catch (e) { /* 첫 실행이거나 저장소를 쓸 수 없는 환경 */ }
    setReady(true);
  }, []);
  const persist = (s, o) => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ saved: s, overrides: o })); }
    catch (e) { setMsg("이 브라우저에서는 저장이 되지 않습니다. 결과 이미지 만들기나 글로 복사를 써 주세요."); }
  };

  const DB = useMemo(() => BASE.map((d) => (overrides[d.c] ? { ...d, hex: overrides[d.c], fixed: true } : d)), [overrides]);
  const byCode = useMemo(() => Object.fromEntries(DB.map((d) => [d.c, d])), [DB]);
  const sel = picked.map((c) => byCode[c]).filter(Boolean);
  const h = useMemo(() => readHarmony(sel), [picked, DB]);
  const tips = useMemo(() => suggest(sel, DB), [picked, DB]);
  const sh = useMemo(() => readShadow(sel, h, DB), [picked, DB]);
  const form = useMemo(() => readForm(sel, h, DB), [picked, DB]);
  const swap = (from, to) => { setPicked(picked.map((c) => (c === from ? to : c))); setMsg(""); };
  const proposals = useMemo(
    () => (kws.length || qtext.trim() ? buildPalettes(scoreCards(kws, qtext, DB), withNeutral) : []),
    [kws, qtext, withNeutral, DB]
  );
  const toggleKw = (w) => setKws(kws.includes(w) ? kws.filter((x) => x !== w) : kws.length >= 6 ? kws : [...kws, w]);

  const add = (code) => {
    const c = String(code).trim().toUpperCase();
    if (!byCode[c]) return setMsg(`${c} 는 카드에 없는 인덱스입니다.`);
    if (picked.includes(c)) return setMsg(`${c} 는 이미 골랐습니다.`);
    if (picked.length >= 5) return setMsg("다섯 장까지 읽습니다. 한 장을 빼고 넣어 주세요.");
    setMsg(""); setPicked([...picked, c]); setTyped(""); setImgUrl("");
  };

  const confirmPalette = () => {
    if (!picked.length) return;
    sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    track("read", { ws: wsCode, codes: picked, form: h.type, tag: h.tag, tone: h.tone, temp: h.temp, n: picked.length });
    const item = { id: Date.now(), codes: [...picked], tag: h.tag, note: note.trim(), at: new Date().toLocaleDateString("ko-KR") };
    const s = [item, ...saved].slice(0, 40);
    setSaved(s); setNote(""); persist(s, overrides); setMsg("배색조화를 판독하고 저장했습니다.");
  };
  const removeSaved = (id) => { const s = saved.filter((x) => x.id !== id); setSaved(s); persist(s, overrides); };


  // 결과 화면을 보이는 그대로 이미지로 뜹니다.
  const makeImage = async () => {
    const node = sheetRef.current;
    if (!node) return;
    setMsg("이미지를 만드는 중입니다…");
    try {
      const blob = await toBlob(node, {
        pixelRatio: 2,
        backgroundColor: "#eef1f0",
        style: { padding: "20px", borderRadius: "0" },
        filter: (el) => !(el.dataset && el.dataset.noCapture),
      });
      if (!blob) throw new Error("blob 없음");
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      blobRef.current = blob;
      setImgUrl(URL.createObjectURL(blob));
      track("make_image", { ws: wsCode, codes: picked });
      setMsg("");
      setTimeout(() => imgRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    } catch (e) { setMsg("이미지를 만들지 못했습니다. 화면을 캡처해 주세요."); }
  };

  const fileName = () => `컬러카드-배색-${picked.join("-")}.png`;

  const shareImage = async () => {
    const blob = blobRef.current;
    if (!blob) return;
    try {
      const file = new File([blob], fileName(), { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "컬러카드 배색" });
        track("share_image", { ws: wsCode, codes: picked });
      } else {
        setMsg("이 브라우저는 공유를 지원하지 않습니다. 이미지를 길게 눌러 저장해 주세요.");
      }
    } catch (e) { /* 사용자가 공유를 취소한 경우 */ }
  };

  const downloadImage = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl; a.download = fileName();
    document.body.appendChild(a); a.click(); a.remove();
    track("save_image", { ws: wsCode, codes: picked });
  };

  const copySheet = async () => {
    const lines = [
      `[뚜띠콜로리 컬러카드 배색 판독]`,
      `배색 형태 : ${h.tag} (${h.type})`,
      `근거      : ${h.why}`,
      `톤 관계   : ${h.tone} / ${h.temp} / 명도폭 ${Math.round(h.dL)} · 채도폭 ${Math.round(h.dC)}`,
      ``,
      ...sel.map((s) => `${s.c}  ${s.ko}\n   ${s.m}\n   ${s.k.join(" · ")}`),
      ``,
      `해석 : ${h.story}`,
      `특징 : ${h.desc}`,
      ...(pro ? [`보완 : ${sh.items.map((it) => it.fix + (it.rec ? " (" + it.rec.c + ")" : "")).join("\n       ")}`] : []),
      `면적 : 지배 ${h.dominant.c} 60 / 보조 ${h.support.map((x) => x.c).join(",") || "—"} 30 / 강조 ${h.accent.c} 10`,
      `쓰임 : ${h.use}`,
    ].join("\n");
    try { await navigator.clipboard.writeText(lines); setMsg("판독 결과를 복사했습니다."); }
    catch (e) { setMsg("복사가 막혀 있습니다. 화면을 그대로 캡처해 주세요."); }
  };

  const setHex = (code, v) => {
    const ok = /^#[0-9a-fA-F]{6}$/.test(v);
    const o = { ...overrides };
    if (ok) o[code] = v.toLowerCase(); else delete o[code];
    setOverrides(o); persist(saved, o);
  };

  const Tab = ({ id, children }) => (
    <button onClick={() => { setTab(id); setMsg(""); }}
      className="px-4 py-2 text-[14px] rounded-lg font-medium"
      style={tab === id ? { background: INK, color: "#fff" } : { color: "#5d6b73" }}>{children}</button>
  );

  return (
    <div className="min-h-screen w-full" style={{ background: "#eef1f0", color: INK, fontFamily: "'Pretendard','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif" }}>
      <div className="mx-auto max-w-[1120px] px-5 py-9">

        <div className="mb-6">
          <div className="text-[12.5px] tracking-[0.16em] mb-2" style={{ color: "#7b8a92" }}>TUTTI COLORI · COLOR HUNTING</div>
          <h1 className="text-[29px] sm:text-[36px] font-bold leading-[1.15] mb-2">컬러카드 배색 리더</h1>
          <p className="text-[14.5px] leading-relaxed max-w-[62ch]" style={{ color: "#4b5b63" }}>
            제주 자연색 46색에서 최대 다섯 장을 고르면, 각 색의 의미와 다섯 색이 함께 만드는 배색 형태·색채조화를 읽어 드립니다.
          </p>
        </div>

        <div className="rounded-2xl mb-6" style={{ background: "#fff", padding: "16px 18px", borderLeft: "3px solid #16232b" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, letterSpacing: ".02em" }}>
            본 서비스 공개 전, 컬러랩제주 워크숍 참가자를 위해 먼저 열어 둔 임시 페이지입니다
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "#4b5b63", margin: 0 }}>
            정식 공개를 준비하는 동안 내용이 보완될 수 있고, 준비가 끝나면 이 주소는 닫힐 수 있습니다.
            저장한 배색은 지금 쓰는 브라우저 안에만 남습니다. 기기를 바꾸거나 기록을 지우면 사라지니,
            기록이 필요하시다면 <strong style={{ fontWeight: 600, color: "#33444d" }}>결과 이미지 만들기</strong>로 따로 저장해 두세요.
          </p>
          {ENDPOINT && (
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "#7b8a92", margin: "10px 0 0" }}>
              서비스를 다듬기 위해 고른 카드와 배색 형태를 익명으로 모읍니다. 이름·연락처·메모 내용은 수집하지 않습니다.
            </p>
          )}
        </div>

        <div className="flex gap-1 mb-5">
          <Tab id="read">배색 읽기</Tab>
          <Tab id="find">키워드로 찾기</Tab>
          <Tab id="saved">저장한 배색{saved.length ? ` ${saved.length}` : ""}</Tab>
          {pro && <Tab id="cal">색 견본 보정</Tab>}
        </div>

        {msg && <div className="rounded-lg px-4 py-2.5 mb-4 text-[13.5px]" style={{ background: "#fff", color: "#4b5b63" }}>{msg}</div>}

        {/* ================= 배색 읽기 ================= */}
        {tab === "read" && (
          <>
            <div className="rounded-2xl p-5 mb-6" style={{ background: "#fff" }}>
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add(typed)}
                  placeholder="인덱스 입력 (예: BG56)" className="px-3 py-2 rounded-lg text-[15px] w-[186px] outline-none"
                  style={{ border: "1px solid #cfd8dc", letterSpacing: ".06em" }} />
                <button onClick={() => add(typed)} className="px-4 py-2 rounded-lg text-[14px] font-semibold text-white" style={{ background: INK }}>추가</button>
                <button onClick={() => { const v = !open; setOpen(v); if (v) setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60); }} className="px-4 py-2 rounded-lg text-[14px]" style={{ border: "1px solid #cfd8dc" }}>
                  {open ? "카드 접기" : "46색에서 고르기"}
                </button>
                {picked.length > 0 && <button onClick={() => { setPicked([]); setMsg(""); }} className="px-3 py-2 text-[14px]" style={{ color: "#7b8a92" }}>모두 비우기</button>}
                <span className="text-[13px] ml-auto" style={{ color: "#7b8a92" }}>{picked.length} / 5</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {picked.map((c) => (
                  <button key={c} onClick={() => setPicked(picked.filter((x) => x !== c))}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[13.5px]" style={{ border: "1px solid #dbe2e5" }}>
                    <span className="w-5 h-5 rounded-full" style={{ background: byCode[c].hex, border: "1px solid rgba(22,35,43,.18)" }} />
                    <span style={{ letterSpacing: ".05em" }}>{c}</span><span style={{ color: "#9aa8ae" }}>×</span>
                  </button>
                ))}
              </div>


              {open && (
                <div ref={gridRef} style={{ marginTop: 4, marginBottom: 16, paddingTop: 16, borderTop: "1px solid #e6ebed" }}>
                  <div style={{ fontSize: 12.5, color: "#7b8a92", marginBottom: 10 }}>
                    카드를 눌러 담으세요 · 전체 {DB.length}색
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6 }}>
                    {DB.map((d) => (
                      <button key={d.c} onClick={() => add(d.c)} title={`${d.c} · ${d.ko}`}
                        style={{
                          display: "block", width: "100%", textAlign: "left", padding: 0,
                          borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff",
                          border: picked.includes(d.c) ? `2px solid ${INK}` : "1px solid #e0e6e8",
                        }}>
                        <div style={{ background: d.hex, height: 36, width: "100%" }} />
                        <div style={{ padding: "5px 6px", fontSize: 11, letterSpacing: ".05em", color: INK }}>{d.c}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.n} onClick={() => { setPicked(p.v); setMsg(""); }} className="px-2.5 py-1 rounded text-[12.5px]" style={{ background: "#f1f4f5", color: "#5d6b73" }}>{p.n} 예시</button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center mt-4 pt-4" style={{ borderTop: "1px solid #e6ebed" }}>
                <input value={wsCode} onChange={(e) => saveWs(e.target.value)} placeholder="워크숍 코드"
                  style={{ width: 110, padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid #cfd8dc", outline: "none" }} />
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="이 배색에 이름이나 메모 (예: 3조)"
                  className="px-3 py-2 rounded-lg text-[14px] flex-1 min-w-[160px] outline-none" style={{ border: "1px solid #cfd8dc" }} />
                <button onClick={confirmPalette} disabled={!picked.length}
                  className="px-5 py-2 rounded-lg text-[14px] font-semibold text-white"
                  style={{ background: picked.length ? INK : "#b7c2c7" }}>배색조화 확인하기</button>
                <button onClick={makeImage} disabled={!picked.length}
                  className="px-4 py-2 rounded-lg text-[14px]"
                  style={{ border: "1px solid #cfd8dc", color: picked.length ? INK : "#9aa8ae" }}>결과 이미지 만들기</button>
                <button onClick={copySheet} disabled={!picked.length}
                  className="px-3 py-2 text-[13.5px]"
                  style={{ color: picked.length ? "#7b8a92" : "#b7c2c7" }}>글로 복사</button>
              </div>

              {imgUrl && (
                <div ref={imgRef} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e6ebed" }}>
                  <div style={{ fontSize: 13, color: "#4b5b63", marginBottom: 10, lineHeight: 1.7 }}>
                    휴대폰에서는 아래 이미지를 <strong style={{ fontWeight: 600 }}>길게 눌러</strong> 사진에 저장하세요.
                    컴퓨터에서는 오른쪽 버튼으로 저장하거나 내려받기를 누르시면 됩니다.
                  </div>
                  <img src={imgUrl} alt="배색 판독 결과"
                    style={{ width: "100%", maxWidth: 300, borderRadius: 14, display: "block",
                             border: "1px solid #e0e6e8", marginBottom: 12 }} />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {typeof navigator !== "undefined" && navigator.share && (
                      <button onClick={shareImage}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                                 color: "#fff", background: INK, border: "none", cursor: "pointer" }}>공유하기</button>
                    )}
                    <button onClick={downloadImage}
                      style={{ padding: "8px 16px", borderRadius: 8, fontSize: 14,
                               border: "1px solid #cfd8dc", background: "#fff", cursor: "pointer" }}>내려받기</button>
                    <button onClick={() => { URL.revokeObjectURL(imgUrl); setImgUrl(""); }}
                      style={{ padding: "8px 12px", fontSize: 13.5, color: "#7b8a92", background: "none", border: "none", cursor: "pointer" }}>닫기</button>
                  </div>
                </div>
              )}

            </div>

            {picked.length === 0 ? (
              <div className="rounded-2xl p-10 text-center text-[14.5px]" style={{ background: "#fff", color: "#7b8a92" }}>
                인덱스를 하나 넣으면 그 색의 의미부터 읽습니다. 두 장부터 배색 형태가 나옵니다.
              </div>
            ) : (
              <div ref={sheetRef}>
                <div className="rounded-2xl mb-6 overflow-hidden" style={{ background: "#fff" }}>
                  <div className="flex" style={{ height: 10 }}>{sel.map((s) => <div key={s.c} style={{ background: s.hex, flex: 1 }} />)}</div>
                  <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
                    <div className="flex justify-center"><Wheel sel={sel} /></div>
                    <div>
                      <div className="flex items-baseline gap-3 flex-wrap mb-1">
                        <h2 className="text-[25px] font-bold">{h.tag}</h2>
                        <span className="text-[14px]" style={{ color: "#7b8a92", letterSpacing: ".04em" }}>{h.type}</span>
                      </div>
                      <div className="text-[13px] mb-4" style={{ color: "#7b8a92" }}>{h.why}</div>
                      <p className="text-[15px] leading-[1.75] mb-5" style={{ color: "#33444d" }}>{h.desc}</p>
                      <div className="grid sm:grid-cols-3 gap-3 mb-4">
                        {[["톤 관계", h.tone + (pro && h.toneEn ? ` (${h.toneEn})` : "")],
                          ["한난", h.temp],
                          ["밝기 차이", pro ? `L* ${Math.round(h.dL)} · C* ${Math.round(h.dC)}`
                            : h.dL >= 45 ? "큼" : h.dL >= 22 ? "보통" : "작음"]].map(([a, b]) => (
                          <div key={a} className="rounded-xl px-3.5 py-3" style={{ background: "#f4f7f7" }}>
                            <div className="text-[12px] mb-1" style={{ color: "#7b8a92" }}>{a}</div>
                            <div className="text-[14.5px] font-semibold">{b}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[14.5px] leading-[1.7] mb-4" style={{ color: "#33444d" }}>{h.toneDesc}</p>
                      <div className="text-[13.5px]" style={{ color: "#5d6b73" }}>어울리는 쓰임 — {h.use}</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="rounded-2xl p-6" style={{ background: "#fff" }}>
                    <h3 className="text-[17px] font-bold mb-3">이 배색이 말하는 것</h3>
                    <p className="text-[15px] leading-[1.8] mb-4" style={{ color: "#33444d" }}>{h.story}</p>
                    <div className="space-y-1.5">
                      {Object.entries(h.score).sort((a, b) => b[1] - a[1]).map(([ax, v]) => {
                        const max = Math.max(1, ...Object.values(h.score));
                        return (
                          <div key={ax} className="flex items-center gap-3">
                            <span className="text-[13px] w-8" style={{ color: "#5d6b73" }}>{ax}</span>
                            <div className="flex-1 h-[7px] rounded-full" style={{ background: "#eef1f2" }}>
                              <div className="h-full rounded-full" style={{ width: `${(v / max) * 100}%`, background: INK, opacity: .75 }} />
                            </div>
                            <span className="text-[12px] w-4 text-right" style={{ color: "#9aa8ae" }}>{v}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl p-6" style={{ background: "#fff" }}>
                    <h3 className="text-[17px] font-bold mb-1">이 배색을 쓸 때</h3>
                    <p className="text-[13px] mb-4" style={{ color: "#7b8a92" }}>넓게 깔 색과 점처럼 쓸 색을 나눠 보세요</p>
                    <div className="flex rounded-lg overflow-hidden mb-4" style={{ height: 46 }}>
                      <div style={{ background: h.dominant.hex, flex: 6 }} />
                      {h.support.map((s) => <div key={s.c} style={{ background: s.hex, flex: 3 / Math.max(1, h.support.length) }} />)}
                      {h.accent !== h.dominant && <div style={{ background: h.accent.hex, flex: 1 }} />}
                    </div>
                    <p style={{ fontSize: 14.5, lineHeight: 1.8, color: "#33444d", margin: 0 }}>
                      <strong style={{ fontWeight: 600 }}>{h.dominant.ko.split(" — ")[0]}</strong>를 바탕에 넓게 깔고
                      {h.accent !== h.dominant && (
                        <> <strong style={{ fontWeight: 600 }}>{h.accent.ko.split(" — ")[0]}</strong>는 점 찍듯 조금만 쓰세요.</>
                      )}
                      {h.support.length > 0 && " 나머지는 그 사이를 채웁니다."}
                      {h.accent === h.dominant && " 나머지는 그 위에 얹습니다."}
                    </p>
                    {pro && (
                      <ul className="space-y-2 text-[14px]" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #e6ebed" }}>
                        <li className="flex gap-2"><span className="font-semibold w-[70px]" style={{ color: "#5d6b73" }}>지배 60%</span><span>{h.dominant.c} · {h.dominant.ko.split(" — ")[0]}</span></li>
                        {h.support.length > 0 && <li className="flex gap-2"><span className="font-semibold w-[70px]" style={{ color: "#5d6b73" }}>보조 30%</span><span>{h.support.map((s) => s.c).join(", ")} (각 {Math.round(30 / h.support.length)}%)</span></li>}
                        {h.accent !== h.dominant && <li className="flex gap-2"><span className="font-semibold w-[70px]" style={{ color: "#5d6b73" }}>강조 10%</span><span>{h.accent.c} · {h.accent.ko.split(" — ")[0]}</span></li>}
                      </ul>
                    )}
                  </div>
                </div>

                {form.length > 0 && (
                  <div className="rounded-2xl p-6 mb-6" style={{ background: "#fff" }}>
                    <h3 className="text-[17px] font-bold mb-1">배색 형태를 다듬는다면</h3>
                    <p className="text-[13px] mb-5" style={{ color: "#7b8a92" }}>
                      색상환에서 간격이 고르게 떨어질수록 안정감이 생깁니다. 한 장을 바꾸거나 더하는 것으로 대개 맞춰집니다.
                    </p>
                    <div style={{ display: "grid", gap: 16 }}>
                      {form.map((it, i) => (
                        <div key={i} style={{ paddingLeft: 14, borderLeft: "2px solid #e6ebed" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#33444d", marginBottom: 4 }}>{it.title}</div>
                          <div style={{ fontSize: 13.5, lineHeight: 1.75, color: "#4b5b63" }}>{it.line}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            {it.kind === "swap" && (
                              <>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: .55 }}>
                                  <span style={{ width: 18, height: 18, borderRadius: 999, background: it.from.hex, border: "1px solid rgba(22,35,43,.18)" }} />
                                  <span style={{ fontSize: 12.5, letterSpacing: ".05em", textDecoration: "line-through" }}>{it.from.c}</span>
                                </span>
                                <span style={{ fontSize: 12.5, color: "#b7c2c7" }}>→</span>
                              </>
                            )}
                            <button onClick={() => { if (it.kind === "swap") swap(it.from.c, it.to.c); else add(it.to.c); }}
                              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px 5px 6px",
                                       borderRadius: 999, border: "1px solid #dbe2e5", background: "#fff", cursor: "pointer" }}>
                              <span style={{ width: 18, height: 18, borderRadius: 999, background: it.to.hex, border: "1px solid rgba(22,35,43,.18)" }} />
                              <span style={{ fontSize: 12.5, letterSpacing: ".05em", color: INK }}>{it.to.c}</span>
                              <span style={{ fontSize: 12.5, color: "#7b8a92" }}>{it.to.ko.split(" — ")[0]} {it.kind === "swap" ? "로 바꾸기" : "더하기"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 검증 전까지 참가자 화면에서는 감춥니다. #pro 에서만 보입니다. */}
                {pro && (
                <div className="rounded-2xl p-6 mb-6" style={{ background: "#fff" }}>
                  <h3 className="text-[17px] font-bold mb-1">더 좋게 만들려면 (검증 중)</h3>
                  <p className="text-[13px] mb-5" style={{ color: "#7b8a92" }}>
                    색에 나쁜 색은 없습니다. 지나칠 때와 모자랄 때가 있을 뿐이고, 대개 한 장을 더하거나 면적을 바꾸면 풀립니다.
                  </p>

                  <div style={{ display: "grid", gap: 14, marginBottom: 22 }}>
                    {sh.items.map((it, i) => (
                      <div key={i} style={{ paddingLeft: 14, borderLeft: "2px solid #e6ebed" }}>
                        <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "#7b8a92", marginBottom: 2 }}>{it.state}</div>
                        <div style={{ fontSize: 14.5, lineHeight: 1.7, color: "#33444d" }}>{it.fix}</div>
                        {it.rec && (
                          <button onClick={() => { track("accept_fix", { ws: wsCode, code: it.rec.c, from: it.state }); add(it.rec.c); }}
                            style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8, padding: "5px 11px 5px 6px",
                                     borderRadius: 999, border: "1px solid #dbe2e5", background: "#fff", cursor: "pointer" }}>
                            <span style={{ width: 18, height: 18, borderRadius: 999, background: it.rec.hex, border: "1px solid rgba(22,35,43,.18)" }} />
                            <span style={{ fontSize: 12.5, letterSpacing: ".05em", color: INK }}>{it.rec.c}</span>
                            <span style={{ fontSize: 12.5, color: "#7b8a92" }}>{it.rec.ko.split(" — ")[0]} 더하기</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 13, color: "#7b8a92", marginBottom: 10, paddingTop: 16, borderTop: "1px solid #e6ebed" }}>
                    한 색이 너무 넓어지면
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {sh.cards.map((c) => (
                      <div key={c.code}>
                        <div style={{ fontSize: 13.5, color: "#33444d", marginBottom: 2 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, verticalAlign: "-4px", marginRight: 2 }}>
                            <span style={{ width: 16, height: 16, borderRadius: 999, background: c.hex, border: "1px solid rgba(22,35,43,.18)", flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, letterSpacing: ".05em" }}>{c.code}</span>
                            <span style={{ color: "#5d6b73" }}>{c.name}</span>
                          </span>
                          <span style={{ color: "#7b8a92" }}>를 넓게 쓰면 — {c.vis}</span>
                        </div>
                        <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "#4b5b63" }}>{c.fix}</div>
                        {pro && (
                          <div style={{ fontSize: 12.5, color: "#9aa8ae", marginTop: 3 }}>
                            인상이 과해질 때 — {c.words.join(" · ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {tips.length > 0 && (
                  <div className="rounded-2xl p-6 mb-6" style={{ background: "#fff" }}>
                    <h3 className="text-[17px] font-bold mb-1">한 장 더 얹는다면</h3>
                    <p className="text-[13px] mb-4" style={{ color: "#7b8a92" }}>지금 팔레트에서 비어 있는 자리를 채우는 카드입니다</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {tips.map((t) => (
                        <button key={t.card.c} onClick={() => { track("accept_tip", { ws: wsCode, code: t.card.c, why: t.why }); add(t.card.c); }} className="rounded-xl overflow-hidden text-left" style={{ border: "1px solid #e6ebed" }}>
                          <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: t.card.hex, color: readable(t.card.hex) }}>
                            <span className="text-[14px] font-bold" style={{ letterSpacing: ".05em" }}>{t.card.c}</span>
                            <span className="text-[12px] opacity-80 truncate">{t.card.ko.split(" — ")[0]}</span>
                          </div>
                          <div className="px-3 py-2.5 text-[13px] leading-[1.6]" style={{ color: "#4b5b63" }}>{t.why}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-[17px] font-bold mb-3">고른 색 하나하나</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {sel.map((s) => (
                    <div key={s.c} className="rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
                      <div style={{ background: s.hex, height: 88 }} />
                      <div className="p-4">
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-[15px] font-bold" style={{ letterSpacing: ".06em" }}>{s.c}</span>
                          <span className="text-[11.5px]" style={{ color: "#9aa8ae" }}>{s.f.ko}{pro ? ` · L*${Math.round(s.L)} C*${Math.round(s.C)}${s.fixed ? " · 실측" : ""}` : ""}</span>
                        </div>
                        <div className="text-[14px] font-semibold mb-0.5">{s.ko}</div>
                        <div className="text-[12.5px] mb-3" style={{ color: "#8b989e" }}>{s.en} · {s.place}</div>
                        <p className="text-[13.5px] leading-[1.7] mb-3" style={{ color: "#33444d" }}>{s.m}</p>
                        <div className="flex flex-wrap gap-1">
                          {s.k.map((w) => <span key={w} className="px-2 py-0.5 rounded text-[12px]" style={{ background: "#f1f4f5", color: "#5d6b73" }}>{w}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                              gap: 12, flexWrap: "wrap", fontSize: 12.5, color: "#9aa8ae" }}>
                  <span>컬러헌팅 · 컬러랩제주 · 제주 자연색 46색</span>
                  <span>colorhunting.org</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= 키워드로 찾기 ================= */}
        {tab === "find" && (
          <>
            <div className="rounded-2xl p-5 mb-6" style={{ background: "#fff" }}>
              <h3 className="text-[17px] font-bold mb-1">담고 싶은 인상을 고르세요</h3>
              <p className="text-[13.5px] mb-4" style={{ color: "#5d6b73" }}>
                46색 카드가 지닌 키워드에서 최대 여섯 개까지 고르면, 그에 맞는 카드를 찾아 배색 형태까지 짜서 제안합니다.
              </p>

              <input value={qtext} onChange={(e) => setQtext(e.target.value)}
                placeholder="직접 입력해도 됩니다 (예: 겨울 바다, 한라산, 쉼)"
                style={{ width: "100%", maxWidth: 380, padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1px solid #cfd8dc", outline: "none", marginBottom: 16 }} />

              {Object.entries(VOCAB).map(([ax, list]) => (
                <div key={ax} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#7b8a92", marginBottom: 6 }}>{ax}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {list.map((w) => {
                      const on = kws.includes(w);
                      return (
                        <button key={w} onClick={() => toggleKw(w)}
                          style={{
                            padding: "5px 10px", borderRadius: 999, fontSize: 12.5, cursor: "pointer",
                            background: on ? INK : "#f4f7f7", color: on ? "#fff" : "#4b5b63",
                            border: on ? `1px solid ${INK}` : "1px solid #e6ebed",
                          }}>{w}</button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid #e6ebed", flexWrap: "wrap" }}>
                <label style={{ fontSize: 13.5, color: "#4b5b63", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={withNeutral} onChange={(e) => setWithNeutral(e.target.checked)} />
                  무채색 한 장 곁들이기
                </label>
                <span style={{ fontSize: 13, color: "#9aa8ae" }}>고른 키워드 {kws.length} / 6</span>
                {kws.length > 0 && (
                  <button onClick={() => setKws([])} style={{ fontSize: 13, color: "#7b8a92", cursor: "pointer", background: "none", border: "none" }}>비우기</button>
                )}
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="rounded-2xl p-10 text-center text-[14.5px]" style={{ background: "#fff", color: "#7b8a92" }}>
                키워드를 하나 고르면 그때부터 배색을 제안합니다.
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((p, idx) => (
                  <div key={p.form.id} className="rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
                    <div style={{ display: "flex", height: 64 }}>
                      {p.cards.map((c) => (
                        <div key={c.c} style={{ background: c.hex, flex: 1, display: "flex", alignItems: "flex-end", padding: 6 }}>
                          <span style={{ fontSize: 11, letterSpacing: ".05em", color: readable(c.hex) }}>{c.c}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        {idx === 0 && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: INK, color: "#fff" }}>가장 잘 맞음</span>}
                        <span style={{ fontSize: 17, fontWeight: 700 }}>{p.form.name}</span>
                        <span style={{ fontSize: 13, color: "#7b8a92" }}>{p.form.note}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: "#4b5b63", lineHeight: 1.7, marginBottom: 10 }}>
                        {p.cards.map((c) => c.ko.split(" — ")[0]).join(" · ")}
                      </div>
                      {p.hits.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                          {p.hits.map((w) => (
                            <span key={w} style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "#f1f4f5", color: "#5d6b73" }}>{w}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => { track("keyword", { ws: wsCode, kws, q: qtext.trim(), form: p.form.id, codes: p.codes }); setPicked(p.codes); setTab("read"); setMsg(""); }}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", background: INK, cursor: "pointer", border: "none" }}>
                        이 배색으로 읽기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= 저장한 배색 ================= */}
        {tab === "saved" && (
          <div className="rounded-2xl p-6" style={{ background: "#fff" }}>
            {!ready ? <div className="text-[14px]" style={{ color: "#7b8a92" }}>불러오는 중</div>
              : saved.length === 0 ? (
              <div className="text-[14.5px] py-8 text-center" style={{ color: "#7b8a92" }}>
                아직 저장한 배색이 없습니다. 배색 읽기에서 다섯 장을 고르고 저장하면 여기에 쌓입니다.
              </div>
            ) : (
              <div className="space-y-3">
                {saved.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 rounded-xl p-3" style={{ border: "1px solid #e6ebed" }}>
                    <div className="flex rounded-lg overflow-hidden shrink-0" style={{ width: 120, height: 40 }}>
                      {it.codes.map((c) => <div key={c} style={{ background: byCode[c]?.hex || "#ccc", flex: 1 }} />)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14.5px] font-semibold truncate">{it.note || it.codes.join(" · ")}</div>
                      <div className="text-[12.5px]" style={{ color: "#8b989e" }}>{it.tag} · {it.codes.join(" ")} · {it.at}</div>
                    </div>
                    <button onClick={() => { setPicked(it.codes); setTab("read"); }} className="px-3 py-1.5 rounded-lg text-[13px] shrink-0" style={{ border: "1px solid #cfd8dc" }}>불러오기</button>
                    <button onClick={() => removeSaved(it.id)} className="px-2 text-[13px] shrink-0" style={{ color: "#9aa8ae" }}>삭제</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 색 견본 보정 ================= */}
        {tab === "cal" && pro && (
          <div className="rounded-2xl p-6" style={{ background: "#fff" }}>
            <h3 className="text-[17px] font-bold mb-1">인쇄 카드의 실제 색을 넣어 주세요</h3>
            <p className="text-[13.5px] leading-relaxed mb-5 max-w-[64ch]" style={{ color: "#5d6b73" }}>
              화면 견본은 지금 TC 인덱스에서 역산한 근사값입니다. 카드 실측값을 HEX로 넣으면 그 색으로 바뀌고, 배색 판정의 명도·채도 계산에도 반영됩니다. 비워 두면 다시 근사값으로 돌아갑니다.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {DB.map((d) => (
                <div key={d.c} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ border: "1px solid #e6ebed" }}>
                  <div className="w-9 h-9 rounded shrink-0" style={{ background: d.hex, border: "1px solid rgba(22,35,43,.12)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold" style={{ letterSpacing: ".05em" }}>{d.c}</div>
                    <div className="text-[11.5px] truncate" style={{ color: "#9aa8ae" }}>{d.ko.split(" — ")[0]}</div>
                  </div>
                  <input defaultValue={overrides[d.c] || ""} placeholder="#______" onBlur={(e) => setHex(d.c, e.target.value)}
                    className="w-[86px] px-2 py-1.5 rounded text-[12.5px] outline-none shrink-0" style={{ border: "1px solid #dbe2e5" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10" style={{ fontSize: 12.5, lineHeight: 1.8, color: "#93a1a7" }}>
          <p style={{ margin: "0 0 6px" }}>
            배색 판정은 TC 인덱스를 10색상환(36° 간격)에 배치해 색상 간격을 계산하고, 뒤 두 자리를 명도·채도로 읽어 톤 관계를 겹쳐 판단합니다.
          </p>
          <p style={{ margin: 0 }}>
            제주 자연색 46색 카드의 색채 데이터와 색명·해석 문구는 유한회사 컬러랩제주의 자산입니다.
            컬러헌팅™·뚜띠콜로리는 등록 상표입니다. 판독 결과는 진단이 아니라 색을 두고 이야기를 나누기 위한 자료입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
