const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAsync() {
  const now = Date.now();

  // Ensure at least one store exists
  const { data: stores } = await supabase.from('stores').select('id').limit(1);
  if (!stores || stores.length === 0) {
    const storeId = uuidv4();
    await supabase.from('stores').insert({
      id: storeId,
      name: 'Default Store',
      created_at: new Date(now).toISOString()
    });
  }

  // Optionally seed first admin
  const { data: admins } = await supabase.from('admins').select('id').limit(1);
  if ((!admins || admins.length === 0) && process.env.INIT_ADMIN_EMAIL && process.env.INIT_ADMIN_PASSWORD) {
    const { data: storeRow } = await supabase.from('stores').select('id').limit(1).single();
    if (storeRow) {
      const adminId = uuidv4();
      const hash = bcrypt.hashSync(process.env.INIT_ADMIN_PASSWORD, 10);
      await supabase.from('admins').insert({
        id: adminId,
        store_id: storeRow.id,
        email: process.env.INIT_ADMIN_EMAIL,
        password: hash,
        fullname: process.env.INIT_ADMIN_FULLNAME || 'Admin',
        timestamp: now
      });
    }
  }

  // Optionally seed first vendor
  const { data: vendors } = await supabase.from('vendors').select('id').limit(1);
  if ((!vendors || vendors.length === 0) && process.env.INIT_VENDOR_EMAIL && process.env.INIT_VENDOR_PASSWORD) {
    const vendorId = uuidv4();
    const vendorHash = bcrypt.hashSync(process.env.INIT_VENDOR_PASSWORD, 10);
    await supabase.from('vendors').insert({
      id: vendorId,
      name: process.env.INIT_VENDOR_NAME || 'Vendor',
      email: process.env.INIT_VENDOR_EMAIL,
      password: vendorHash,
      phone: '',
      address: '',
      points_per_dollar: 1,
      is_active: true,
      created_at: now
    });
  }
}

module.exports = { supabase, seedAsync };
