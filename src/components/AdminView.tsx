import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronDown, Edit2, Trash2, Plus, Link as LinkIcon, LogOut, UserPlus } from 'lucide-react';
import { ViewState } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface Song {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  occasions: string[];
  link?: string;
  dots: number;
}

export default function AdminView({ setView }: { setView: (v: ViewState) => void, key?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'musician' | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);

  // Form states
  const [showAddSong, setShowAddSong] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', link: '', dots: 3 });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  const [showAddMusician, setShowAddMusician] = useState(false);
  const [newMusician, setNewMusician] = useState({ email: '', name: '' });

  const GENRES = ['Ranchera', 'Bolero', 'Huapango', 'Son', 'Paso Doble', 'Vals'];
  const OCCASIONS = ['Boda', 'Serenata', 'Corporativo', 'Cumpleaños', 'Entierro', 'Fiesta'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if user is admin or musician
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else if (currentUser.email === 'zyronsky7@gmail.com') {
            // Default admin
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              name: currentUser.displayName || 'Admin',
              role: 'admin',
              createdAt: serverTimestamp()
            });
            setRole('admin');
          } else {
            // Check if they are a pending musician
            const pendingDoc = await getDoc(doc(db, 'pending_musicians', currentUser.email || ''));
            if (pendingDoc.exists()) {
              await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                name: currentUser.displayName || pendingDoc.data().name,
                role: 'musician',
                createdAt: serverTimestamp()
              });
              await deleteDoc(doc(db, 'pending_musicians', currentUser.email || ''));
              setRole('musician');
            } else {
              // Standard user
              await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                name: currentUser.displayName || 'User',
                role: 'user',
                createdAt: serverTimestamp()
              });
              setRole('user');
            }
          }
        } catch (error) {
          console.error("Error checking role:", error);
        }
      } else {
        setRole(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || (role !== 'admin' && role !== 'musician')) return;

    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSongs: Song[] = [];
      snapshot.forEach((doc) => {
        fetchedSongs.push({ id: doc.id, ...doc.data() } as Song);
      });
      setSongs(fetchedSongs);
      setLoadingSongs(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'songs');
      setLoadingSongs(false);
    });

    return () => unsubscribe();
  }, [user, role]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || role !== 'admin') return;
    
    try {
      const newDocRef = doc(collection(db, 'songs'));
      await setDoc(newDocRef, {
        title: newSong.title,
        artist: newSong.artist,
        link: newSong.link,
        dots: newSong.dots,
        genres: selectedGenres,
        occasions: selectedOccasions,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      setNewSong({ title: '', artist: '', link: '', dots: 3 });
      setSelectedGenres([]);
      setSelectedOccasions([]);
      setShowAddSong(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'songs');
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!user || role !== 'admin') return;
    if (!window.confirm('¿Estás seguro de eliminar esta canción?')) return;
    try {
      await deleteDoc(doc(db, 'songs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `songs/${id}`);
    }
  };

  const handleAddMusician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || role !== 'admin') return;
    
    try {
      await setDoc(doc(db, 'pending_musicians', newMusician.email), {
        email: newMusician.email,
        name: newMusician.name,
        addedBy: user.uid,
        createdAt: serverTimestamp()
      });
      setNewMusician({ email: '', name: '' });
      setShowAddMusician(false);
      alert('Músico invitado correctamente. Podrá acceder cuando inicie sesión con su cuenta de Google.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pending_musicians');
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (loadingAuth) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">Cargando...</div>;
  }

  if (!user || (role !== 'admin' && role !== 'musician')) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">Área Restringida</span>
            <h1 className="font-serif text-4xl md:text-5xl text-on-surface">Acceso de Músicos</h1>
            {user && role === 'user' && (
              <p className="text-error mt-4 text-sm">Tu cuenta no tiene permisos de músico o administrador.</p>
            )}
          </div>
          
          <button onClick={handleLogin} className="w-full gold-gradient text-on-primary py-4 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,203,70,0.3)] transition-all mt-8 flex items-center justify-center gap-2">
            Iniciar Sesión con Google
          </button>
          
          <button onClick={() => setView('home')} className="mt-8 text-on-surface-variant text-sm hover:text-primary transition-colors w-full text-center">
            Volver al inicio
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl mb-2 text-on-surface">Panel de Control</h1>
            <p className="text-on-surface-variant font-light">Bienvenido, {user.displayName} ({role})</p>
          </div>
          <div className="flex gap-4">
            {role === 'admin' && (
              <>
                <button onClick={() => { setShowAddMusician(!showAddMusician); setShowAddSong(false); }} className="border border-outline-variant text-on-surface px-6 py-3 font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                  <UserPlus size={18} /> Añadir Músico
                </button>
                <button onClick={() => { setShowAddSong(!showAddSong); setShowAddMusician(false); }} className="border border-outline-variant text-on-surface px-6 py-3 font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                  <Plus size={18} /> Añadir Canción
                </button>
              </>
            )}
            <button onClick={handleLogout} className="border border-error/50 text-error px-6 py-3 font-medium rounded-xl hover:bg-error/10 transition-colors flex items-center gap-2">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>

        {/* Add Musician Form */}
        {showAddMusician && role === 'admin' && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 mb-12 ambient-shadow">
            <h3 className="font-serif text-2xl text-on-surface mb-8">Registrar Nuevo Músico</h3>
            <form onSubmit={handleAddMusician} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Nombre del Músico</label>
                  <input type="text" required value={newMusician.name} onChange={e => setNewMusician({...newMusician, name: e.target.value})} placeholder="Ej. Juan Pérez" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Correo Electrónico (Google)</label>
                  <input type="email" required value={newMusician.email} onChange={e => setNewMusician({...newMusician, email: e.target.value})} placeholder="musico@gmail.com" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-outline-variant/10">
                <button type="submit" className="gold-gradient text-on-primary px-8 py-3 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,203,70,0.3)] transition-all">
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Song Form */}
        {showAddSong && role === 'admin' && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 mb-12 ambient-shadow">
            <h3 className="font-serif text-2xl text-on-surface mb-8">Añadir Nueva Canción</h3>
            <form onSubmit={handleAddSong} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Título de la Canción</label>
                  <input type="text" required value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} placeholder="Ej. El Rey" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Artista / Compositor</label>
                  <input type="text" required value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} placeholder="Ej. José Alfredo Jiménez" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Enlace Mega (Repertorio)</label>
                  <input type="url" value={newSong.link} onChange={e => setNewSong({...newSong, link: e.target.value})} placeholder="https://mega.nz/..." className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4">Géneros (Selección Múltiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {GENRES.map(g => (
                      <label key={g} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                        <input type="checkbox" checked={selectedGenres.includes(g)} onChange={() => toggleSelection(g, selectedGenres, setSelectedGenres)} className="rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface-container-lowest" /> {g}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4">Ocasiones (Selección Múltiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {OCCASIONS.map(o => (
                      <label key={o} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                        <input type="checkbox" checked={selectedOccasions.includes(o)} onChange={() => toggleSelection(o, selectedOccasions, setSelectedOccasions)} className="rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface-container-lowest" /> {o}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-outline-variant/10">
                <button type="submit" disabled={selectedGenres.length === 0 || selectedOccasions.length === 0} className="gold-gradient text-on-primary px-8 py-3 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,203,70,0.3)] transition-all disabled:opacity-50">
                  Guardar Canción
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden mb-12 ambient-shadow">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre de Canción</th>
                  <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Filtros</th>
                  <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Enlace Mega (Notas)</th>
                  {role === 'admin' && <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {loadingSongs ? (
                  <tr><td colSpan={4} className="py-12 text-center text-on-surface-variant">Cargando canciones...</td></tr>
                ) : songs.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-on-surface-variant">No hay canciones registradas.</td></tr>
                ) : songs.map((song, i) => (
                  <tr key={song.id} className={i !== songs.length - 1 ? "border-b border-outline-variant/5" : ""}>
                    <td className="py-6 px-8">
                      <p className="font-serif text-lg text-on-surface">{song.title}</p>
                      <p className="text-[10px] text-primary uppercase tracking-wider mt-1">ARTISTA: {song.artist}</p>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-wrap gap-2">
                        {song.genres?.map((g, j) => (
                          <span key={`g-${j}`} className="text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/30 px-2 py-1 rounded-md bg-primary/5">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      {song.link ? (
                        <a href={song.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 text-sm">
                          <LinkIcon size={14} /> Ver Notas
                        </a>
                      ) : (
                        <span className="text-on-surface-variant text-sm italic">Sin enlace</span>
                      )}
                    </td>
                    {role === 'admin' && (
                      <td className="py-6 px-8">
                        <div className="flex items-center justify-end gap-3 text-on-surface-variant">
                          <button onClick={() => handleDeleteSong(song.id)} className="hover:text-error transition-colors p-2"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
