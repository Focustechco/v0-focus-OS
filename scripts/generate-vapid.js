const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

if (!envContent.includes('VAPID_PUBLIC_KEY')) {
  envContent += `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"\n`;
  envContent += `VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('VAPID keys saved to .env');
} else {
  console.log('VAPID keys already exist in .env');
}
