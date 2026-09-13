#!/usr/bin/env node
/**
 * Usage: node scripts/hash-hq-pass.mjs 'YourPassword'
 * Prints HQ_PASS_SALT and HQ_PASS_HASH for Cloudflare env.
 */
const crypto = require('crypto');
const pass = process.argv[2];
if (!pass) {
  console.error('Usage: node scripts/hash-hq-pass.mjs \'YourPassword\'');
  process.exit(1);
}
const salt = crypto.randomBytes(16).toString('hex');
crypto.pbkdf2(pass, salt, 120000, 32, 'sha256', (err, key) => {
  if (err) throw err;
  console.log('HQ_PASS_SALT=' + salt);
  console.log('HQ_PASS_HASH=' + key.toString('hex'));
});
