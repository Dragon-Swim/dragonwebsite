/**
 * CSV Download Utility — Dragon Swim Team
 * Shared between coach roster and admin panel.
 */

/**
 * Admin export column definitions.
 * key → CSV header label. Order matters (left → right in output).
 */
export const ADMIN_COLUMNS = [
  { key: 'firstName',           label: 'First Name' },
  { key: 'lastName',            label: 'Last Name' },
  { key: 'gender',              label: 'Gender' },
  { key: 'age',                 label: 'Age' },
  { key: 'dob',                 label: 'DOB' },
  { key: 'usaSwimmingId',       label: 'USA Swimming ID' },
  { key: 'status',              label: 'Status' },
  { key: 'parentFirstName',     label: 'Parent First Name' },
  { key: 'parentLastName',      label: 'Parent Last Name' },
  { key: 'parentEmail',         label: 'Parent Email' },
  { key: 'parentPhone',         label: 'Parent Phone' },
  { key: 'address',             label: 'Address' },
  { key: 'ecName',              label: 'Emergency Contact Name' },
  { key: 'ecPhone',             label: 'Emergency Contact Phone' },
];

/**
 * Trigger a CSV file download in the browser.
 * @param {Array<Object>} swimmers - Array of swimmer objects
 * @param {string} filename - Download filename (e.g. "dragon-roster-active-2026-06-10.csv")
 */
export function downloadCSV(swimmers, filename) {
  const headers = ['First Name', 'Last Name', 'Gender', 'Age', 'DOB', 'USA Swimming ID', 'Status', 'Parent'];

  const rows = swimmers.map(s => {
    const age = s.dob ? Math.floor((new Date() - new Date(s.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : '';
    return [
      s.firstName || '',
      s.lastName || '',
      s.gender || '',
      age,
      s.dob || '',
      s.usaSwimmingId || '',
      s.status || 'pending',
      s.parentName || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  triggerDownload(csv, filename);
}

/**
 * Build a flat row object for a swimmer (all 14 admin columns).
 */
function buildRow(reg, swimmer) {
  const parent = reg.parent || {};
  const ec = reg.emergencyContact || {};
  const age = swimmer.dob
    ? Math.floor((new Date() - new Date(swimmer.dob)) / (365.25 * 24 * 60 * 60 * 1000))
    : '';

  return {
    firstName:       swimmer.firstName || '',
    lastName:        swimmer.lastName || '',
    gender:          swimmer.gender || '',
    age:             age,
    dob:             swimmer.dob || '',
    usaSwimmingId:   swimmer.usaSwimmingId || '',
    status:          swimmer.status || 'pending',
    parentFirstName: parent.firstName || '',
    parentLastName:  parent.lastName || '',
    parentEmail:     parent.email || '',
    parentPhone:     parent.phone || '',
    address:         parent.address || '',
    ecName:          ec.name || '',
    ecPhone:         ec.phone || '',
  };
}

/**
 * Admin Panel full export — one row per swimmer with family info.
 * @param {Array<Object>} registrations - Array of registration documents
 * @param {string} filename - Download filename
 * @param {string[]} [selectedKeys] - Optional whitelist of ADMIN_COLUMNS keys to include
 */
export function downloadAdminCSV(registrations, filename, selectedKeys) {
  // Determine which columns to include
  const keys = selectedKeys && selectedKeys.length > 0
    ? selectedKeys
    : ADMIN_COLUMNS.map(c => c.key);

  // Build header → key lookup
  const keyToCol = {};
  for (const col of ADMIN_COLUMNS) {
    keyToCol[col.key] = col;
  }

  const headers = keys.map(k => keyToCol[k]?.label || k);

  // Build rows
  const rows = [];
  for (const reg of registrations) {
    const swimmers = reg.swimmers || [];
    for (const s of swimmers) {
      if (s.deleted) continue;
      const row = buildRow(reg, s);
      rows.push(keys.map(k => csvEscape(row[k] ?? '')).join(','));
    }
  }

  const csv = [headers.map(h => csvEscape(h)).join(','), ...rows].join('\n');
  triggerDownload(csv, filename);
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

/** Shared helper: trigger a file download in the browser. */
function triggerDownload(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
