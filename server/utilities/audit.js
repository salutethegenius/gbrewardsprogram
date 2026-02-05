const { supabase } = require('../database/config');

/**
 * Log an audit event for compliance (Bahamas DPA, etc.).
 * @param {string} actorType - 'admin' | 'vendor' | 'system'
 * @param {string} [actorId] - ID of the actor (admin id, vendor id)
 * @param {string} action - e.g. 'login', 'view_customers', 'create_vendor', 'update_settings'
 * @param {string} [resourceType] - e.g. 'vendor', 'customer', 'settings'
 * @param {string} [resourceId] - ID of the resource affected
 * @param {object} [details] - extra context (non-PII where possible)
 * @param {object} [req] - Express request (for ip, user-agent)
 */
async function logAudit(actorType, actorId, action, resourceType, resourceId, details, req) {
  try {
    const ip = req && req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress);
    const userAgent = req && req.headers && req.headers['user-agent'];
    await supabase.from('audit_log').insert({
      actor_type: actorType,
      actor_id: actorId || null,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      details: details ? details : null,
      ip: ip || null,
      user_agent: userAgent || null,
      created_at: Date.now()
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

module.exports = { logAudit };
