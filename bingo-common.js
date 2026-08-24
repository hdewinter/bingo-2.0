// Gedeelde logica voor Bingo 2.0 — echte 90-bal "strip"-structuur.
// Een strip = 6 kaarten die SAMEN precies de nummers 1 t/m 90 dekken (elk nummer 1x).
// Elke kaart: 3 rijen x 9 kolommen, 15 nummers, kolommen = tientallen (net als een echte kaart).
// De QR-code komt op een willekeurig LEEG vakje (niet vast in het midden).
// Elke kaart heeft ook een korte intypbare code (seed-based) om zonder camera te verifiëren.

const BINGO_COLUMNS = [
  {min:1,  max:9},   // kolom 1
  {min:10, max:19},  // kolom 2
  {min:20, max:29},  // kolom 3
  {min:30, max:39},  // kolom 4
  {min:40, max:49},  // kolom 5
  {min:50, max:59},  // kolom 6
  {min:60, max:69},  // kolom 7
  {min:70, max:79},  // kolom 8
  {min:80, max:90},  // kolom 9
];
const TICKETS_PER_STRIP = 6;
const ROWS = 3;
const COLS = 9;

/* ---------- Seeded RNG (mulberry32) — zelfde seed = altijd exact dezelfde strip ---------- */
function mulberry32(seed){
  let s = seed >>> 0;
  return function(){
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleWith(arr, rng){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rng()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function randomSeed(){
  return Math.floor(Math.random()*4294967295);
}

/* ---------- Strip-generatie: 6 kaarten die samen 1-90 dekken ---------- */
// Greedy: wijs elk nummer toe aan de kaart/rij met de MEESTE resterende ruimte.
// Dit houdt de verdeling in balans en voorkomt bijna altijd een doodlopend pad.
function tryGenerateStrip(rng){
  const rowCap = Array.from({length:TICKETS_PER_STRIP}, () => [5,5,5]);
  const ticketRemaining = Array(TICKETS_PER_STRIP).fill(15);
  const grids = Array.from({length:TICKETS_PER_STRIP}, () => Array.from({length:ROWS}, () => Array(COLS).fill(null)));
  const colCountPerTicket = Array.from({length:TICKETS_PER_STRIP}, () => Array(COLS).fill(0));

  for(let c=0;c<COLS;c++){
    const range = BINGO_COLUMNS[c];
    const nums = [];
    for(let n=range.min;n<=range.max;n++) nums.push(n);
    const shuffledNums = shuffleWith(nums, rng);
    const size = nums.length;

    const picks = [];
    for(let i=0;i<size;i++){
      const candidates = [];
      for(let t=0;t<TICKETS_PER_STRIP;t++){
        if(colCountPerTicket[t][c] < 3 && ticketRemaining[t] > 0) candidates.push(t);
      }
      if(candidates.length === 0) return null;
      const maxRem = Math.max(...candidates.map(t => ticketRemaining[t]));
      const top = candidates.filter(t => ticketRemaining[t] === maxRem);
      const chosen = top[Math.floor(rng()*top.length)];
      picks.push(chosen);
      colCountPerTicket[chosen][c]++;
      ticketRemaining[chosen]--;
    }

    const byTicket = Array.from({length:TICKETS_PER_STRIP}, () => []);
    picks.forEach((t,i) => byTicket[t].push(shuffledNums[i]));

    for(let t=0;t<TICKETS_PER_STRIP;t++){
      const numsForTicket = byTicket[t].sort((a,b)=>a-b);
      if(numsForTicket.length === 0) continue;
      let rowsAvailable = [0,1,2].filter(r => rowCap[t][r] > 0);
      if(rowsAvailable.length < numsForTicket.length) return null;
      rowsAvailable = shuffleWith(rowsAvailable, rng).sort((a,b) => rowCap[t][b] - rowCap[t][a]);
      const chosenRows = rowsAvailable.slice(0, numsForTicket.length).sort((a,b)=>a-b);
      chosenRows.forEach((r,i) => {
        grids[t][r][c] = numsForTicket[i];
        rowCap[t][r]--;
      });
    }
  }

  for(let t=0;t<TICKETS_PER_STRIP;t++){
    for(let r=0;r<ROWS;r++){
      if(rowCap[t][r] !== 0) return null;
    }
  }
  return grids;
}

function generateStripFromSeed(seed){
  for(let attempt=0; attempt<300; attempt++){
    // eigen sub-rng per poging, maar deterministisch afgeleid van de seed + poging
    const rng = mulberry32((seed ^ (attempt * 0x9E3779B1)) >>> 0);
    const grids = tryGenerateStrip(rng);
    if(grids) return grids;
  }
  return null; // extreem onwaarschijnlijk
}

function rowsFromGrid(grid){
  return grid.map(row => row.filter(n => n !== null));
}

// Genereert `stripCount` strips (elk 6 kaarten, samen 1-90 dekkend), elk met eigen willekeurige seed.
function generateStrips(stripCount){
  const strips = [];
  for(let i=0;i<stripCount;i++){
    const seed = randomSeed();
    const grids = generateStripFromSeed(seed);
    if(!grids) continue;
    const tickets = grids.map((grid, ticketIndex) => buildTicket(grid, seed, ticketIndex));
    strips.push({ seed, tickets });
  }
  return strips;
}

function buildTicket(grid, seed, ticketIndex){
  const rows = rowsFromGrid(grid); // [row1(5), row2(5), row3(5)]
  const qrCell = pickRandomEmptyCell(grid);
  return {
    grid, row1: rows[0], row2: rows[1], row3: rows[2],
    seed, ticketIndex, code: encodeTextCode(seed, ticketIndex),
    qrCell
  };
}

function pickRandomEmptyCell(grid){
  const empties = [];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(grid[r][c] === null) empties.push({r,c});
  if(empties.length === 0) return {r:0,c:0};
  return empties[Math.floor(Math.random()*empties.length)];
}

/* ---------- Korte intypbare code (seed + kaartnummer binnen de strip) ---------- */
function encodeTextCode(seed, ticketIndex){
  const seedStr = seed.toString(36).toUpperCase();
  const idxStr = String(ticketIndex + 1).padStart(2, '0');
  return seedStr + '-' + idxStr;
}
function decodeTextCode(code){
  if(!code) return null;
  const clean = code.trim().toUpperCase();
  const parts = clean.split('-');
  if(parts.length !== 2) return null;
  const seed = parseInt(parts[0], 36);
  const idx = parseInt(parts[1], 10) - 1;
  if(isNaN(seed) || isNaN(idx) || idx < 0 || idx >= TICKETS_PER_STRIP) return null;
  const grids = generateStripFromSeed(seed >>> 0);
  if(!grids || !grids[idx]) return null;
  const rows = rowsFromGrid(grids[idx]);
  return { row1: rows[0], row2: rows[1], row3: rows[2] };
}

/* ---------- QR-encodering ---------- */
function encodeCardQR(ticket){
  return 'CARD:' + ticket.row1.join(',') + '|' + ticket.row2.join(',') + '|' + ticket.row3.join(',');
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

/* ---------- Winst-check ---------- */
function checkCardAgainstDrawn(card, calledSet){
  const row1Complete = card.row1.every(n => calledSet.has(n));
  const row2Complete = card.row2.every(n => calledSet.has(n));
  const row3Complete = card.row3.every(n => calledSet.has(n));
  const rowsComplete = [row1Complete, row2Complete, row3Complete].filter(Boolean).length;
  return { row1Complete, row2Complete, row3Complete, rowsComplete, fullCard: rowsComplete === 3 };
}

if(typeof module !== 'undefined'){ module.exports = { BINGO_COLUMNS, generateStrips, generateStripFromSeed, buildTicket, encodeTextCode, decodeTextCode, encodeCardQR, decodeCardQR, encodeStateQR, decodeStateQR, checkCardAgainstDrawn, randomSeed, mulberry32 }; }
