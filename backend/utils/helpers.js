export function parseJSON(val) {
  if (!val) return [];
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return []; }
}

export function buildUpdateQuery(body, allowedFields) {
  const fields = [];
  const values = [];
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      fields.push(`\`${key}\` = ?`);
      values.push(body[key]);
    }
  }
  return { fields, values };
}
