import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/api/[...path].ts', 'utf8');

// Remove the nested disbursement route from inside the payment webhook handler
const markerStart = `  // --- DISBURSEMENT WEBHOOK (Duitku Transfer Callback) ---\r\n  // Endpoint ini menerima callback dari Duitku saat status transfer berubah (Success/Failed)\r\n  app.post('/webhooks/duitku-disbursement', async (c) => {`;

const markerEnd = `  // Duitku bisa mengirim JSON atau Form-UrlEncoded.`;

const startIdx = content.indexOf(markerStart);
const endIdx = content.indexOf(markerEnd, startIdx);

if (startIdx === -1) { console.error('Start marker not found!'); process.exit(1); }
if (endIdx === -1) { console.error('End marker not found!'); process.exit(1); }

console.log(`Removing nested block from char ${startIdx} to ${endIdx}`);

// Remove the nested block
content = content.slice(0, startIdx) + '  // Duitku bisa mengirim JSON atau Form-UrlEncoded.' + content.slice(endIdx + markerEnd.length);

// Now add the disbursement webhook as a top-level route after the closing of payment webhook
// The payment webhook closes with: `});\n\n// DEBUG: Manual trigger`
const disbursementRoute = `
// --- DISBURSEMENT WEBHOOK (Duitku Transfer Callback) ---
app.post('/webhooks/duitku-disbursement', async (c) => {
  console.log('[Disbursement Webhook] Received callback');
  try {
    const body = await c.req.json();
    console.log('[Disbursement Webhook] Payload:', JSON.stringify(body, null, 2));
    const { disburseId, responseCode, responseDesc } = body;
    if (!disburseId || !responseCode) return c.json({ error: 'Missing required fields' }, 400);
    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();
    const isValid = await service.validateWebhook(body);
    if (!isValid) {
      console.error('[Disbursement Webhook] Invalid signature');
      return c.json({ error: 'Invalid signature' }, 401);
    }
    const { createClient: createSupa } = await import('@supabase/supabase-js');
    const supabase = createSupa(getEnv('PUBLIC_SUPABASE_URL') || '', getEnv('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: withdrawals } = await supabase.from('withdrawals').select('id, merchant_id, amount, status, notes').eq('disburse_id', disburseId).limit(1);
    let withdrawal = withdrawals?.[0] || null;
    if (!withdrawal) {
      const { data: legWd } = await supabase.from('withdrawals').select('id, merchant_id, amount, status, notes').ilike('notes', '%' + disburseId + '%').limit(1);
      withdrawal = legWd?.[0] || null;
    }
    if (responseCode === '00') {
      if (withdrawal) {
        await supabase.from('withdrawals').update({ status: 'completed', processed_at: new Date().toISOString(), notes: withdrawal.notes + ' | COMPLETED via webhook' }).eq('id', withdrawal.id);
        console.log('[Disbursement Webhook] Withdrawal ' + withdrawal.id + ' completed');
      }
    } else {
      if (withdrawal) {
        await supabase.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString(), notes: withdrawal.notes + ' | FAILED: ' + responseDesc }).eq('id', withdrawal.id);
        const { error: refundError } = await supabase.rpc('update_wallet_payout_reject', { p_merchant_id: withdrawal.merchant_id, p_amount: Number(withdrawal.amount) });
        if (refundError) console.error('[Disbursement Webhook] Refund Error:', refundError);
      }
    }
    return c.json({ received: true, disburseId, status: responseCode === '00' ? 'SUCCESS' : 'FAILED' });
  } catch (err) {
    console.error('[Disbursement Webhook] Error:', err);
    return c.json({ received: true, error: err.message }, 200);
  }
});

`;

// Insert before: // DEBUG: Manual trigger digital delivery for testing
const debugMarker = '// DEBUG: Manual trigger digital delivery for testing';
const debugIdx = content.indexOf(debugMarker);
if (debugIdx === -1) { console.error('Debug marker not found!'); process.exit(1); }

content = content.slice(0, debugIdx) + disbursementRoute + content.slice(debugIdx);

writeFileSync('src/pages/api/[...path].ts', content, 'utf8');
console.log('Done! Webhook restructured successfully.');
