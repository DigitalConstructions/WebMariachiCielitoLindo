import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

const requiredVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}. Check your .env file.`);
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
}

const db = admin.firestore();
const data = JSON.parse(readFileSync(join(__dirname, '../data/wp-songs-ai-final.json'), 'utf-8'));

async function sync() {
    const songsRef = db.collection('songs');
    const snapshot = await songsRef.get();
    let count = 0;
    
    for (const doc of snapshot.docs) {
        const songClient = doc.data();
        const updated = data.songs.find(s => s.title === songClient.title);
        if (updated && updated.artist !== songClient.artist) {
            console.log(`Updating ${songClient.title}: ${songClient.artist} -> ${updated.artist}`);
            await songsRef.doc(doc.id).update({
                artist: updated.artist,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
        }
    }
    console.log(`Synced ${count} records successfully!`);
}

sync().catch(console.error).finally(() => process.exit(0));
