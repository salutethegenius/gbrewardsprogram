function cleanUpPhone(phone) {
  if (phone && phone.includes('+'))
    return phone.toString().substring(1, phone.length);
  return phone ? phone.toString() : '';
}

function normalizePhoneForLookup(phone) {
  const cleaned = cleanUpPhone(String(phone).trim());
  return cleaned.replace(/\D/g, '') || cleaned;
}

module.exports = { cleanUpPhone, normalizePhoneForLookup };