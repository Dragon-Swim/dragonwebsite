/**
 * Registration completeness rules — shared by the Coach Dashboard and the
 * standalone audit script.
 *
 * This module is intentionally pure (no Firebase, no i18n, no DOM) so it can be
 * imported from both the Vite browser bundle and Node scripts.
 *
 * `parent.email` is treated as account/whitelist-derived metadata rather than a
 * normal user-entered required field. It is still checked for consistency under
 * `conflicts`, but never reported as `required`.
 */

export const PARENT_REQUIRED = ['firstName', 'lastName', 'gender', 'phone', 'address'];
export const EMERGENCY_REQUIRED = ['name', 'phone'];
export const SWIMMER_REQUIRED = ['firstName', 'lastName', 'gender', 'dob'];
export const SPOUSE_REQUIRED = ['firstName', 'lastName', 'gender'];
export const SPOUSE_OPTIONAL = ['phone', 'email'];
export const SWIMMER_OPTIONAL = ['usaSwimmingId'];

export function hasValue(value) {
  if (typeof value === 'string') return value.trim() !== '';
  return value !== null && value !== undefined;
}

export function normalizeEmail(value) {
  return (value || '').trim().toLowerCase();
}

export function normalizeName(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[.,'’`\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fullName(person) {
  return normalizeName(`${person?.firstName || ''} ${person?.lastName || ''}`);
}

export function normalizePhone(value) {
  let digits = (value || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

export function activeSwimmers(registration) {
  return (registration?.swimmers || []).filter((s) => s && s.deleted !== true);
}

export function swimmerName(swimmer) {
  return [swimmer?.firstName, swimmer?.lastName].filter(Boolean).join(' ');
}

/**
 * Audit one registration document.
 *
 * @param {object} registration Firestore registration data.
 * @param {object} [options]
 * @param {string|null} [options.authEmail] Auth account email, when available
 *   (Node audit script only; the browser cannot read another user's Auth email).
 * @returns {{ required: object[], conflicts: object[], optionalGaps: object[] }}
 */
export function auditRegistration(registration = {}, options = {}) {
  const { authEmail = null } = options;
  const required = [];
  const conflicts = [];
  const optionalGaps = [];

  const parent = registration.parent || null;
  if (!parent) {
    required.push({ scope: 'parent', field: '__missing__' });
  } else {
    for (const field of PARENT_REQUIRED) {
      if (!hasValue(parent[field])) required.push({ scope: 'parent', field });
    }
  }

  const allSwimmers = Array.isArray(registration.swimmers) ? registration.swimmers : [];
  const swimmers = activeSwimmers(registration);
  const removedSwimmers = allSwimmers.length - swimmers.length;

  if (swimmers.length === 0) {
    required.push({ scope: 'family', field: 'activeSwimmers', removedSwimmers });
  } else {
    swimmers.forEach((swimmer, index) => {
      const name = swimmerName(swimmer);
      for (const field of SWIMMER_REQUIRED) {
        if (!hasValue(swimmer[field])) {
          required.push({ scope: 'swimmer', field, swimmerIndex: index, swimmerName: name });
        }
      }
      for (const field of SWIMMER_OPTIONAL) {
        if (!hasValue(swimmer[field])) {
          optionalGaps.push({ scope: 'swimmer', field, swimmerIndex: index, swimmerName: name });
        }
      }
    });
  }

  const emergency = registration.emergencyContact || null;
  if (!emergency) {
    required.push({ scope: 'emergency', field: '__missing__' });
  } else {
    for (const field of EMERGENCY_REQUIRED) {
      if (!hasValue(emergency[field])) required.push({ scope: 'emergency', field });
    }
  }

  const spouse = registration.spouse || null;
  if (spouse) {
    for (const field of SPOUSE_REQUIRED) {
      if (!hasValue(spouse[field])) required.push({ scope: 'spouse', field });
    }
    for (const field of SPOUSE_OPTIONAL) {
      if (!hasValue(spouse[field])) optionalGaps.push({ scope: 'spouse', field });
    }
  }

  // ── Cross-field conflicts (not missing fields) ──
  const parentName = fullName(parent);
  const parentPhone = normalizePhone(parent?.phone);
  const parentEmail = normalizeEmail(parent?.email);

  if (hasValue(emergency?.name) && parentName && normalizeName(emergency.name) === parentName) {
    conflicts.push({ type: 'emergency_name_same_as_parent' });
  }
  if (hasValue(emergency?.phone) && parentPhone && normalizePhone(emergency.phone) === parentPhone) {
    conflicts.push({ type: 'emergency_phone_same_as_parent' });
  }

  if (spouse) {
    const spouseName = fullName(spouse);
    if (spouseName && parentName && spouseName === parentName) {
      conflicts.push({ type: 'spouse_name_same_as_parent' });
    }
    const spouseEmail = normalizeEmail(spouse.email);
    if (spouseEmail && parentEmail && spouseEmail === parentEmail) {
      conflicts.push({ type: 'spouse_email_same_as_parent' });
    }
  }

  // parent.email vs parentEmails / Auth email (option B).
  const parentEmails = Array.isArray(registration.parentEmails)
    ? registration.parentEmails.map(normalizeEmail).filter(Boolean)
    : [];
  const authEmailNormalized = normalizeEmail(authEmail);

  if (!parentEmail) {
    conflicts.push({ type: 'parent_email_missing' });
  } else if (parentEmails.length === 0) {
    conflicts.push({ type: 'parent_emails_missing', parentEmail });
  } else if (!parentEmails.includes(parentEmail)) {
    conflicts.push({ type: 'parent_email_not_in_parent_emails', parentEmail });
  }

  if (authEmailNormalized && parentEmail && parentEmail !== authEmailNormalized) {
    conflicts.push({
      type: 'parent_email_mismatch_auth',
      parentEmail,
      authEmail: authEmailNormalized,
    });
  }

  return { required, conflicts, optionalGaps };
}

// ── Severity / display policy ───────────────────────────────────────────────
//
// A family can be incomplete, conflicted, or merely missing optional fields.
// Those are NOT equally urgent, so the dashboard must never let a cheap
// "optional gap" row crowd out a row a coach actually has to act on.
//
// Severity is derived, never stored: the highest-priority bucket a family
// falls into wins.

export const ATTENTION_SEVERITY = {
  REQUIRED: 0,
  CONFLICTS: 1,
  OPTIONAL: 2,
};

/** Severity of one audit result; lower = more urgent. */
export function attentionSeverity(audit) {
  if (audit?.required?.length) return ATTENTION_SEVERITY.REQUIRED;
  if (audit?.conflicts?.length) return ATTENTION_SEVERITY.CONFLICTS;
  return ATTENTION_SEVERITY.OPTIONAL;
}

/**
 * Stable sort by descending urgency, preserving the incoming order (newest
 * first) inside each bucket. Explicit index tiebreak so the result does not
 * depend on the engine's sort stability.
 *
 * @param {Array<{audit: object}>} items
 */
export function sortByAttentionSeverity(items) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) =>
      attentionSeverity(a.item.audit) - attentionSeverity(b.item.audit) || a.index - b.index)
    .map(({ item }) => item);
}

/**
 * Split sorted attention items into what to render and what may be elided.
 *
 * Only the OPTIONAL bucket is ever truncated. Required/conflict rows are
 * always returned in full — hiding them behind a "+N …" line is what made a
 * lone "needs verification" family invisible in production.
 *
 * @param {Array<{audit: object}>} items
 * @param {number} [optionalLimit] Max optional-only rows to show.
 */
export function partitionAttention(items, optionalLimit = 5) {
  const limit = Math.max(0, optionalLimit);
  const actionable = [];
  const optionalOnly = [];
  for (const item of items) {
    if (attentionSeverity(item.audit) === ATTENTION_SEVERITY.OPTIONAL) optionalOnly.push(item);
    else actionable.push(item);
  }
  return {
    visible: [...actionable, ...optionalOnly.slice(0, limit)],
    actionableCount: actionable.length,
    optionalOnlyCount: optionalOnly.length,
    hiddenOptionalCount: Math.max(0, optionalOnly.length - limit),
  };
}

/** Counts for the summary line — one bucket per family, no double counting. */
export function attentionCounts(items) {
  const counts = { required: 0, conflicts: 0, optional: 0 };
  for (const item of items) {
    const s = attentionSeverity(item.audit);
    if (s === ATTENTION_SEVERITY.REQUIRED) counts.required++;
    else if (s === ATTENTION_SEVERITY.CONFLICTS) counts.conflicts++;
    else counts.optional++;
  }
  return counts;
}
