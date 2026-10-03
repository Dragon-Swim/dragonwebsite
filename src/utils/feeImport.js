/**
 * Fee-import logic — the pure half of the Deposits tab's two spreadsheet
 * importers ("Upload Carry-over Balance" and "Upload Deposits").
 *
 * Why this is a module instead of inline code in dashboard.js
 * ----------------------------------------------------------
 * 2026-10-02 the coaches uploaded two spreadsheets and both imports went wrong:
 *
 *   1. Carry-over balance — the parser rejected negative numbers, so the
 *      "balance = deposit − fees" column (negative = the family owes money)
 *      could only be uploaded with its sign stripped.
 *   2. Deposits — the only amount column was headed "depoist" (typo), which
 *      matched none of the deposit-1/2/3 column patterns. The importer still
 *      created 13 records that held a name and nothing else.
 *
 * Both bugs live in header/value parsing and in deciding what to write — pure,
 * deterministic logic. It lives here so tests/unit/verify-fee-import.mjs can
 * pin it down; dashboard.js only reads the sheet, renders the plan and commits
 * it (see src/pages/dashboard.js).
 *
 * Input shape: the array-of-arrays produced by
 * `XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })`.
 *
 * Everything here is framework-free: no DOM, no Firestore, no i18n.
 */

// ── Generic helpers ──────────────────────────────────────────────

/**
 * Key used to match a deposits record with a meet's fee data.
 *
 * Case-insensitive, whitespace-collapsed and punctuation-blind on purpose: the
 * same child is spelled differently by different sources — the registration says
 * "Luo-han Chen", the Hy-Tek fee export says "Luohan Chen", the coach's sheet
 * says "eric chen". Without dropping the hyphen they become two Fee Summary
 * rows, one holding the fees and one holding the deposit.
 */
export function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents: José → Jose
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // hyphens, apostrophes, periods, commas
    .replace(/\s+/g, ' ')
    .trim();
}

/** 0-based column index → spreadsheet letter (0 → A, 26 → AA). */
export function colLetter(index) {
  let n = Number(index) + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/**
 * Parse one spreadsheet money cell.
 * Accepts numbers, "$1,234.50", "+3", and the accounting negative "(182)".
 * Returns NaN for blanks and anything else non-numeric.
 */
export function parseMoney(value) {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  let s = String(value).trim();
  if (!s) return NaN;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[$,\s]/g, '');
  if (!/^[+-]?\d*\.?\d+$/.test(s)) return NaN;
  const n = Number(s);
  return negative ? -n : n;
}

/** Deposit total for one deposits doc — mirrors the Fee Summary's rule. */
export function depositTotal(doc) {
  return (Number(doc?.balance) || 0)
    + (Number(doc?.deposit1Amount) || 0)
    + (Number(doc?.deposit2Amount) || 0)
    + (Number(doc?.deposit3Amount) || 0);
}

/** First deposit slot (1-3) that holds no amount, or null when all three do. */
export function nextFreeDepositSlot(doc) {
  for (const n of [1, 2, 3]) {
    const amount = doc?.[`deposit${n}Amount`];
    const num = Number(amount);
    if (amount === null || amount === undefined || amount === '' || !Number.isFinite(num) || num === 0) {
      return `deposit${n}Amount`;
    }
  }
  return null;
}

/** The deposits doc for this swimmer+season, or null. */
export function findDepositForSwimmer(deposits, season, name) {
  const key = normalizeName(name);
  if (!key) return null;
  return (deposits || []).find(
    (d) => d && d.season === season && normalizeName(d.swimmerName) === key
  ) || null;
}

const isBlankRow = (row) => !row || row.every((c) => c === null || c === undefined || String(c).trim() === '');
const cellText = (row, index) => (index >= 0 && row && index < row.length ? row[index] : null);

// ── Header classification ────────────────────────────────────────

const isNameHeader = (cell) => /name|swimmer/.test(cell);
const isBalanceHeader = (cell) => /balance|carry[\s-]*over|credit/.test(cell);

/**
 * Classify one non-name header cell.
 * Returns:
 *   { field: 'deposit1Amount' }  — a numbered deposit column
 *   { field: 'deposit2Date' }    — a numbered deposit date column
 *   { simpleAmount: true }       — a single "Deposit"/"Depoist"/"Dep" column
 *   { simpleDate: true }         — a single date column next to it
 *   null                         — not a column we write
 *
 * Deliberately typo-tolerant on "deposit" (depoist/deposite) and deliberately
 * strict on a bare "Amount" header: on a balance sheet that column holds the
 * fees owed, and importing it as a payment would be silently wrong.
 */
function classifyValueHeader(rawCell) {
  const cell = String(rawCell ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!cell) return null;
  // "deposit" (and typos) or the short "D2" form — but not a plain "date".
  const depositWord = /depo|(^|[^a-z])d\s*#?[123](?![0-9])/.test(cell);
  const dateWord = /date|日期/.test(cell);
  const amountWord = /amount|amt|paid|payment|金额/.test(cell);
  const numMatch = cell.match(/(?:^|\D)([123])(?:\D|$)/);
  const num = numMatch ? numMatch[1] : null;

  if (dateWord) {
    if (depositWord && num) return { field: `deposit${num}Date` };
    if (depositWord) return { simpleDate: true };
    return null; // a plain "Date" column on its own means nothing here
  }
  if (depositWord || amountWord) {
    if (num && (depositWord || amountWord)) return { field: `deposit${num}Amount` };
    if (depositWord) return { simpleAmount: true };
    return null; // bare "Amount" — refused on purpose (see doc comment)
  }
  return null;
}

const mappingOf = (entries) =>
  entries.filter((e) => e && e.index >= 0).map((e) => ({ ...e, letter: colLetter(e.index) }));

// ── Carry-over balance sheet ─────────────────────────────────────

/**
 * Parse a carry-over balance sheet: a header row with a name column and a
 * balance column, then one row per swimmer.
 *
 * Negative balances are kept (they mean the family owes money).
 * Returns { valid, errors, fatal, headerRow, columns }.
 */
export function parseCarryOverRows(rows) {
  if (!Array.isArray(rows) || rows.length < 2) {
    return { valid: [], errors: [], fatal: 'no-data-rows', headerRow: -1, columns: [] };
  }

  let headerRow = -1;
  let nameCol = -1;
  let balanceCol = -1;
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r];
    if (!row) continue;
    let nc = -1;
    let bc = -1;
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? '').toLowerCase().trim();
      if (!cell) continue;
      if (nc < 0 && isNameHeader(cell)) nc = c;
      if (bc < 0 && isBalanceHeader(cell)) bc = c;
    }
    if (nc >= 0 && bc >= 0) {
      headerRow = r;
      nameCol = nc;
      balanceCol = bc;
      break;
    }
  }
  if (headerRow < 0) {
    return { valid: [], errors: [], fatal: 'need-name-balance', headerRow: -1, columns: [] };
  }

  const valid = [];
  const errors = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row)) continue;
    const name = String(cellText(row, nameCol) ?? '').trim();
    if (!name) {
      errors.push({ rowNum: r + 1, reason: 'Missing name.' });
      continue;
    }
    const balance = parseMoney(cellText(row, balanceCol));
    if (!Number.isFinite(balance)) {
      errors.push({ rowNum: r + 1, reason: `Invalid balance for "${name}": ${cellText(row, balanceCol) ?? '(empty)'}` });
      continue;
    }
    valid.push({ swimmerName: name, balance });
  }

  return {
    valid,
    errors,
    fatal: null,
    headerRow,
    columns: mappingOf([
      { field: 'name', label: String(cellText(rows[headerRow], nameCol) ?? 'name').trim(), index: nameCol },
      { field: 'balance', label: String(cellText(rows[headerRow], balanceCol) ?? 'balance').trim(), index: balanceCol },
    ]),
  };
}

/**
 * Attach what will happen to each parsed balance row: update an existing
 * deposits doc for this season, or create one.
 */
export function planCarryOverRows(valid, deposits, season) {
  return (valid || []).map((row) => {
    const existing = findDepositForSwimmer(deposits, season, row.swimmerName);
    return {
      swimmerName: row.swimmerName,
      balance: row.balance,
      existingId: existing ? existing.id : null,
      willCreate: !existing,
      previousBalance: existing && Number.isFinite(Number(existing.balance)) ? Number(existing.balance) : null,
    };
  });
}

/** Write plan (see commitDepositWrites in dashboard.js) for balance rows. */
export function buildCarryOverWrites(plan) {
  return (plan || []).map((row) => ({
    swimmerName: row.swimmerName,
    existingId: row.existingId,
    willCreate: !row.existingId,
    fields: { balance: Number(row.balance) || 0 },
  }));
}

// ── Deposit sheet (numbered detail OR a single amount column) ────

/**
 * Parse a deposit sheet. Two shapes are supported:
 *
 *   detail — numbered columns ("Deposit 1 Amount", "D2 Date", …); each row
 *            writes exactly the numbered fields it has.
 *   simple — one amount column ("Deposit", "Depoist", "Dep") plus an optional
 *            date column; the amount goes into the swimmer's next free slot.
 *
 * A sheet whose header has a name column but no amount column is REFUSED
 * (fatal: 'need-name-amount') instead of importing name-only records.
 *
 * Returns { valid, errors, fatal, mode, headerRow, columns }.
 */
export function parseDepositDetailRows(rows) {
  const refused = (fatal) => ({ valid: [], errors: [], fatal, mode: null, headerRow: -1, columns: [] });
  if (!Array.isArray(rows) || rows.length < 2) return refused('no-data-rows');

  let headerRow = -1;
  let nameCol = -1;
  let mode = null;
  let detailCols = {};
  let simpleCols = { amount: -1, date: -1 };

  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r];
    if (!row) continue;
    let nc = -1;
    const found = {};
    let simpleAmount = -1;
    let simpleDate = -1;
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (!cell) continue;
      if (nc < 0 && isNameHeader(cell)) { nc = c; continue; }
      const kind = classifyValueHeader(cell);
      if (!kind) continue;
      if (kind.field) found[kind.field] = c;
      else if (kind.simpleAmount && simpleAmount < 0) simpleAmount = c;
      else if (kind.simpleDate && simpleDate < 0) simpleDate = c;
    }
    const hasDetail = Object.keys(found).length > 0;
    if (nc >= 0 && (hasDetail || simpleAmount >= 0)) {
      headerRow = r;
      nameCol = nc;
      detailCols = found;
      simpleCols = { amount: simpleAmount, date: simpleDate };
      mode = hasDetail ? 'detail' : 'simple';
      break;
    }
  }
  if (headerRow < 0) return refused('need-name-amount');

  const header = rows[headerRow];
  const columns = mappingOf([
    { field: 'name', label: String(cellText(header, nameCol) ?? 'name').trim(), index: nameCol },
    ...Object.entries(detailCols).map(([field, index]) => ({
      field,
      label: String(cellText(header, index) ?? field).trim(),
      index,
    })),
    ...(mode === 'simple'
      ? [
        { field: 'amount', label: String(cellText(header, simpleCols.amount) ?? 'amount').trim(), index: simpleCols.amount },
        { field: 'date', label: simpleDateLabel(header, simpleCols.date), index: simpleCols.date },
      ]
      : []),
  ]);

  const valid = [];
  const errors = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row)) continue;
    const name = String(cellText(row, nameCol) ?? '').trim();
    if (!name) {
      errors.push({ rowNum: r + 1, reason: 'Missing name.' });
      continue;
    }

    if (mode === 'simple') {
      const amount = parseMoney(cellText(row, simpleCols.amount));
      if (!Number.isFinite(amount)) {
        errors.push({ rowNum: r + 1, reason: `Invalid deposit amount for "${name}": ${cellText(row, simpleCols.amount) ?? '(empty)'}` });
        continue;
      }
      const rawDate = simpleCols.date >= 0 ? cellText(row, simpleCols.date) : null;
      valid.push({ swimmerName: name, amount, date: rawDate ? String(rawDate).trim() : null });
      continue;
    }

    const record = { swimmerName: name };
    let sawAmount = false;
    let badValue = null;
    for (const [field, index] of Object.entries(detailCols)) {
      const raw = cellText(row, index);
      if (field.endsWith('Amount')) {
        if (raw === null || raw === undefined || String(raw).trim() === '') continue;
        const amount = parseMoney(raw);
        if (!Number.isFinite(amount)) { badValue = `Invalid ${field} for "${name}": ${raw}`; break; }
        record[field] = amount;
        sawAmount = true;
      } else {
        if (raw === null || raw === undefined || String(raw).trim() === '') continue;
        record[field] = String(raw).trim();
      }
    }
    if (badValue) {
      errors.push({ rowNum: r + 1, reason: badValue });
      continue;
    }
    if (!sawAmount) {
      // The old importer created a name-only record here. Refuse instead.
      errors.push({ rowNum: r + 1, reason: `No deposit amount for "${name}" — row skipped.` });
      continue;
    }
    valid.push(record);
  }

  return { valid, errors, fatal: null, mode, headerRow, columns };
}

function simpleDateLabel(header, index) {
  const label = index >= 0 ? String(cellText(header, index) ?? '').trim() : '';
  return label || 'date';
}

/**
 * Attach the write target to every parsed deposit row.
 * detail mode: update/create the swimmer's doc with the numbered fields.
 * simple mode: put the amount into the swimmer's next free deposit slot,
 *              skipping rows whose amount is already recorded (a re-upload of
 *              the same sheet must not double-count).
 *
 * Returns { rows, skipped, slotErrors }.
 */
export function planDepositRows(parsed, deposits, season) {
  const rows = [];
  const skipped = [];
  const slotErrors = [];

  if (!parsed || !parsed.valid) return { rows, skipped, slotErrors };

  for (const row of parsed.valid) {
    const existing = findDepositForSwimmer(deposits, season, row.swimmerName);
    const existingId = existing ? existing.id : null;

    if (parsed.mode !== 'simple') {
      rows.push({ ...row, existingId, willCreate: !existing });
      continue;
    }

    const amount = Number(row.amount);
    const duplicateSlot = [1, 2, 3].find((n) => Number(existing?.[`deposit${n}Amount`]) === amount && amount !== 0);
    if (duplicateSlot) {
      skipped.push({
        swimmerName: row.swimmerName,
        reason: `${row.swimmerName}: $${amount.toFixed(2)} is already recorded as Deposit ${duplicateSlot} — skipped to avoid double-counting.`,
      });
      continue;
    }

    const targetSlot = existing ? nextFreeDepositSlot(existing) : 'deposit1Amount';
    if (!targetSlot) {
      slotErrors.push({
        swimmerName: row.swimmerName,
        reason: `${row.swimmerName}: all three deposit slots are already filled — edit the record instead.`,
      });
      continue;
    }

    rows.push({
      swimmerName: row.swimmerName,
      amount,
      date: row.date || null,
      targetSlot,
      targetLabel: `Deposit ${targetSlot.replace(/\D/g, '')}`,
      existingId,
      willCreate: !existing,
    });
  }

  return { rows, skipped, slotErrors };
}

/** Write plan (see commitDepositWrites in dashboard.js) for deposit rows. */
export function buildDepositWrites(parsed, planRows) {
  return (planRows || []).map((row) => {
    if (parsed && parsed.mode === 'simple') {
      const slotNumber = String(row.targetSlot).replace(/\D/g, '');
      const fields = { [row.targetSlot]: Number(row.amount) || 0 };
      const dateField = `deposit${slotNumber}Date`;
      if (row.date) fields[dateField] = row.date;
      return { swimmerName: row.swimmerName, existingId: row.existingId, willCreate: !row.existingId, fields };
    }
    const fields = {};
    for (const key of Object.keys(row)) {
      if (/^deposit[123](Amount|Date)$/.test(key)) fields[key] = row[key];
    }
    return { swimmerName: row.swimmerName, existingId: row.existingId, willCreate: !row.existingId, fields };
  });
}
