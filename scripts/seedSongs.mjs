#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar configuración de Firebase
const firebaseConfig = JSON.parse(
  readFileSync(join(__dirname, '../firebase-applet-config.json'), 'utf-8')
);

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de ejemplo para canciones
const sampleSongs = [
  {
    title: 'Canción A - Serenata Clásica',
    artist: 'Artista A',
    genres: ['Ranchero', 'Romántico'],
    occasions: ['Serenata', 'Aniversario', 'Cumpleaños'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción B - El Mariachi',
    artist: 'Artista B',
    genres: ['Corrido', 'Tradicional'],
    occasions: ['Fiesta', 'Boda'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción C - Amor Eterno',
    artist: 'Artista A',
    genres: ['Ranchero', 'Bolero'],
    occasions: ['Serenata', 'Boda', 'Aniversario'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción D - La Norteña',
    artist: 'Artista C',
    genres: ['Norteño', 'Corrido'],
    occasions: ['Fiesta', 'Quinceañera'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción E - Viva México',
    artist: 'Artista B',
    genres: ['Ranchero', 'Patriótico'],
    occasions: ['Fiesta', 'Celebración nacional'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción F - MI Amor Lejano',
    artist: 'Artista C',
    genres: ['Romántico', 'Bolero'],
    occasions: ['Serenata', 'Cumpleaños'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción G - Feliz Cumpleaños Mariachi',
    artist: 'Artista D',
    genres: ['Ranchero'],
    occasions: ['Cumpleaños'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción H - La Boda del Siglo',
    artist: 'Artista A',
    genres: ['Clásico', 'Tradicional'],
    occasions: ['Boda', 'Aniversario'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción I - Quinceañera Bella',
    artist: 'Artista E',
    genres: ['Ranchero', 'Festivo'],
    occasions: ['Quinceañera', 'Fiesta'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción J - Amor a Medianoche',
    artist: 'Artista B',
    genres: ['Bolero', 'Romántico'],
    occasions: ['Serenata', 'Aniversario', 'Cumpleaños'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción K - El Alma del Mariachi',
    artist: 'Artista D',
    genres: ['Tradicional', 'Ranchero'],
    occasions: ['Fiesta', 'Celebración'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción L - Noche de Luna',
    artist: 'Artista C',
    genres: ['Romántico', 'Clásico'],
    occasions: ['Serenata', 'Boda'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción M - Cumpleaños Feliz Ranchero',
    artist: 'Artista E',
    genres: ['Ranchero', 'Festivo'],
    occasions: ['Cumpleaños'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción N - La Tristeza del Corazón',
    artist: 'Artista A',
    genres: ['Bolero'],
    occasions: ['Serenata', 'Aniversario'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción O - Fiesta Mexicana',
    artist: 'Artista D',
    genres: ['Ranchero', 'Festivo'],
    occasions: ['Fiesta', 'Celebración', 'Quinceañera'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción P - Boda Soñada',
    artist: 'Artista B',
    genres: ['Romántico', 'Clásico'],
    occasions: ['Boda', 'Aniversario', 'Serenata'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción Q - El Corrido de Amor',
    artist: 'Artista C',
    genres: ['Corrido', 'Romántico'],
    occasions: ['Fiesta', 'Serenata'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción R - Recuerdos Eternos',
    artist: 'Artista E',
    genres: ['Ranchero', 'Nostálgico'],
    occasions: ['Aniversario', 'Cumpleaños'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 4,
    createdAt: new Date()
  },
  {
    title: 'Canción S - Sueño de Mariachi',
    artist: 'Artista A',
    genres: ['Tradicional', 'Ranchero'],
    occasions: ['Fiesta', 'Celebración', 'Boda'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  },
  {
    title: 'Canción T - El Vals de la Quinceañera',
    artist: 'Artista B',
    genres: ['Clásico', 'Romántico'],
    occasions: ['Quinceañera', 'Boda'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    dots: 5,
    createdAt: new Date()
  }
];

async function seedSongs() {
  try {
    console.log('🌱 Iniciando seed de canciones...');
    const songsCollection = collection(db, 'songs');
    const seedUserId = 'seed-user-' + Date.now();

    for (const song of sampleSongs) {
      // Agregar campos requeridos por las reglas de Firestore
      const songWithMeta = {
        ...song,
        createdBy: seedUserId,
        createdAt: new Date()
      };
      await addDoc(songsCollection, songWithMeta);
    }

    console.log(`✅ Se agregaron ${sampleSongs.length} canciones exitosamente (Seed UID: ${seedUserId})`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar canciones:', error.code);
    console.error('📝 Mensaje:', error.message);
    if (error.code === 'PERMISSION_DENIED') {
      console.error('\n⚠️  Soluciones:');
      console.error('1. Cambia las reglas de Firestore TEMPORALMENTE a:');
      console.error('   allow read, write: if true;');
      console.error('2. O autentícate primero en la aplicación web');
      console.error('3. Ejecuta nuevamente: npm run seed:songs seed\n');
    }
    process.exit(1);
  }
}

async function cleanupSongs() {
  try {
    console.log('🧹 Iniciando limpieza de canciones de ejemplo...');
    
    const songsCollection = collection(db, 'songs');
    const snapshot = await getDocs(songsCollection);

    let deletedCount = 0;
    for (const doc of snapshot.docs) {
      const song = doc.data();
      // Eliminar canciones que coincidan con nuestros títulos de ejemplo
      if (song.title && song.title.startsWith('Canción ') &&
          song.artist && (song.artist.startsWith('Artista '))) {
        await deleteDoc(doc.ref);
        deletedCount++;
      }
    }

    console.log(`✅ Se eliminaron ${deletedCount} canciones de ejemplo`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al limpiar canciones:', error.code, error.message);
    if (error.code === 'PERMISSION_DENIED') {
      console.error('\n⚠️  Error de permisos. Asegúrate de que las reglas de Firestore permitan escrituras.');
    }
    process.exit(1);
  }
}

// Ejecutar según parámetro
const command = process.argv[2];

if (command === 'seed') {
  seedSongs();
} else if (command === 'cleanup') {
  cleanupSongs();
} else {
  console.log('Uso:');
  console.log('  npm run seed:songs seed    # Agregar canciones de ejemplo');
  console.log('  npm run seed:songs cleanup # Eliminar canciones de ejemplo');
  process.exit(0);
}
