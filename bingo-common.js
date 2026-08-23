// Gedeelde logica voor Bingo 2.0: kaart-generatie, QR-formaat, en winst-check.
// Kaartformaat: 3 rijen x 9 kolommen (Belgisch), midden (rij2, kolom5) = FREE-vakje met QR.
// Rij1: 5 nummers | Rij2: 4 nummers (FREE in kolom5) | Rij3: 5 nummers

const BINGO_COLUMNS = [
  {min:1,  max:9},   // kolom 1
  {min:10, max:19},  // kolom 2
  {min:20, max:29},  // kolom 3
  {min:30, max:39},  // kolom 4
  {min:40, max:49},  // kolom 5 (midden, bevat FREE in rij2)
  {min:50, max:59},  // kolom 6
  {min:60, max:69},  // kolom 7
  {min:70, max:79},  // kolom 8
  {min:80, max:90},  // kolom 9
];
const FREE_COL_INDEX = 4; // 0-indexed middelste kolom

function shuffleArr(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function pickRowNumbers(colIndices, usedByColumn){
  // colIndices: welke kolommen deze rij gebruikt (1 nummer per kolom)
  // usedByColumn: Map colIndex -> Set van al gebruikte nummers in die kolom (over de hele kaart)
  const result = [];
  for(const c of colIndices){
    const range = BINGO_COLUMNS[c];
    const used = usedByColumn.get(c);
    let n, tries = 0;
    do{
      n = range.min + Math.floor(Math.random()*(range.max-range.min+1));
      tries++;
    }while(used.has(n) && tries < 50);
    used.add(n);
    result.push(n);
  }
  return result.sort((a,b)=>a-b);
}

function generateCard(){
  const usedByColumn = new Map();
  for(let i=0;i<9;i++) usedByColumn.set(i, new Set());

  const row1Cols = shuffleArr([0,1,2,3,4,5,6,7,8]).slice(0,5).sort((a,b)=>a-b);
  const row3Cols = shuffleArr([0,1,2,3,4,5,6,7,8]).slice(0,5).sort((a,b)=>a-b);
  const nonFreeCols = [0,1,2,3,5,6,7,8]; // kolom5 (index4) uitgesloten voor rij2
  const row2Cols = shuffleArr(nonFreeCols).slice(0,4).sort((a,b)=>a-b);

  const row1 = pickRowNumbers(row1Cols, usedByColumn);
  const row2 = pickRowNumbers(row2Cols, usedByColumn);
  const row3 = pickRowNumbers(row3Cols, usedByColumn);

  return { row1, row2, row3 };
}

function cardKey(card){
  return card.row1.join(',') + '|' + card.row2.join(',') + '|' + card.row3.join(',');
}

function generateUniqueCards(count){
  const cards = [];
  const seen = new Set();
  let guard = 0;
  while(cards.length < count && guard < count*50){
    guard++;
    const c = generateCard();
    const key = cardKey(c);
    if(!seen.has(key)){
      seen.add(key);
      cards.push(c);
    }
  }
  return cards;
}

function encodeCardQR(card){
  return 'CARD:' + card.row1.join(',') + '|' + card.row2.join(',') + '|' + card.row3.join(',');
}

function decodeCardQR(text){
  if(!text || !text.startsWith('CARD:')) return null;
  const body = text.slice(5);
  const parts = body.split('|');
  if(parts.length !== 3) return null;
  try{
    const row1 = parts[0].split(',').filter(Boolean).map(Number);
    const row2 = parts[1].split(',').filter(Boolean).map(Number);
    const row3 = parts[2].split(',').filter(Boolean).map(Number);
    if(row1.some(isNaN) || row2.some(isNaN) || row3.some(isNaN)) return null;
    return { row1, row2, row3 };
  }catch(e){ return null; }
}

function encodeStateQR(calledArray){
  return 'STATE:' + calledArray.slice().sort((a,b)=>a-b).join(',');
}

function decodeStateQR(text){
  if(!text || !text.startsWith('STATE:')) return null;
  const body = text.slice(6);
  if(body.trim() === '') return [];
  const nums = body.split(',').filter(Boolean).map(Number);
  if(nums.some(isNaN)) return null;
  return nums;
}

function checkCardAgainstDrawn(card, calledSet){
  const row1Complete = card.row1.every(n => calledSet.has(n));
  const row2Complete = card.row2.every(n => calledSet.has(n)); // FREE telt altijd mee
  const row3Complete = card.row3.every(n => calledSet.has(n));
  const rowsComplete = [row1Complete, row2Complete, row3Complete].filter(Boolean).length;
  return {
    row1Complete, row2Complete, row3Complete,
    rowsComplete,
    fullCard: rowsComplete === 3
  };
}
