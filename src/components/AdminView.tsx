import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Link as LinkIcon, LogOut, UserPlus, X, Pencil } from 'lucide-react';
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
  youtubeUrl?: string;
  dots: number;
}

interface CatalogData {
  genres: string[];
  occasions: string[];
  artists: string[];
}

const DEFAULT_GENRES = [
  'Ranchera', 'Bolero', 'Huapango', 'Son', 'Paso Doble', 'Vals',
  'Cumbia', 'Corrido', 'Balada', 'Norteña', 'Polka', 'Zapateado',
  'Danzón', 'Chotís', 'Jarabe'
];

const DEFAULT_OCCASIONS = [
  'Boda', 'Serenata', 'Corporativo', 'Cumpleaños', 'Entierro', 'Fiesta',
  'Quinceañera', 'Aniversario', 'Bautizo', 'Graduación', 'Día de la Madre',
  'Día del Padre', 'Despedida', 'Reconciliación', 'Misa / Religioso'
];

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map(v => v.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function AdminView({ setView }: { setView: (v: ViewState) => void, key?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'musician' | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);

  // Form states
  const [showAddSong, setShowAddSong] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', link: '', youtubeUrl: '', dots: 3 });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState('');
  const [occasionSearch, setOccasionSearch] = useState('');

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'musician' });

  const [catalog, setCatalog] = useState<CatalogData>({
    genres: DEFAULT_GENRES,
    occasions: DEFAULT_OCCASIONS,
    artists: []
  });
  const [showCatalogManager, setShowCatalogManager] = useState(false);
  const [newCatalogValue, setNewCatalogValue] = useState({ genres: '', occasions: '', artists: '' });

  const GENRES = catalog.genres;
  const OCCASIONS = catalog.occasions;
  const ARTISTS = catalog.artists;

  const filteredGenreOptions = GENRES.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()));
  const filteredOccasionOptions = OCCASIONS.filter(o => o.toLowerCase().includes(occasionSearch.toLowerCase()));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check if user is admin or musician
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
            setUser(currentUser);
          } else if (currentUser.email === 'zyronsky7@gmail.com') {
            // Default admin
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              name: currentUser.displayName || 'Admin',
              role: 'admin',
              createdAt: serverTimestamp()
            });
            setRole('admin');
            setUser(currentUser);
          } else {
            // Check if they are a pending user
            let pendingDoc = await getDoc(doc(db, 'pending_users', currentUser.email || ''));
            
            // Retrocompatibility check: in case there are currently users in pending_musicians
            if (!pendingDoc.exists()) {
               pendingDoc = await getDoc(doc(db, 'pending_musicians', currentUser.email || ''));
            }

            if (pendingDoc.exists()) {
              const assignedRole = pendingDoc.data().role || 'musician';
              await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                name: currentUser.displayName || pendingDoc.data().name,
                role: assignedRole,
                createdAt: serverTimestamp()
              });
              
              // cleanup
              try { await deleteDoc(doc(db, 'pending_users', currentUser.email || '')); } catch(e) {}
              try { await deleteDoc(doc(db, 'pending_musicians', currentUser.email || '')); } catch(e) {}
              
              setRole(assignedRole);
              setUser(currentUser);
            } else {
              // Unauthorized user: do not create account, sign them out
              await signOut(auth);
              setUser(null);
              setRole(null);
              alert('Acceso Denegado: Tu cuenta de Google no ha sido autorizada por el administrador. Contáctalo para solicitar acceso.');
            }
          }
        } catch (error: any) {
          console.error("Error checking role:", error);
          await signOut(auth);
          setUser(null);
          setRole(null);
          
          if (error?.code === 'permission-denied') {
            alert('Acceso Denegado: Tu cuenta no tiene permisos para acceder o las reglas de seguridad de Firebase no han sido actualizadas. Contacta al administrador.');
          } else {
            alert('Ocurrió un error al verificar tu cuenta. Por favor, intenta de nuevo.');
          }
        }
      } else {
        setUser(null);
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

  useEffect(() => {
    const catalogDoc = doc(db, 'catalog', 'master');
    const unsubscribe = onSnapshot(catalogDoc, (snapshot) => {
      if (!snapshot.exists()) {
        setCatalog({ genres: DEFAULT_GENRES, occasions: DEFAULT_OCCASIONS, artists: [] });
        return;
      }

      const data = snapshot.data();
      setCatalog({
        genres: uniqueSorted(Array.isArray(data.genres) ? data.genres : DEFAULT_GENRES),
        occasions: uniqueSorted(Array.isArray(data.occasions) ? data.occasions : DEFAULT_OCCASIONS),
        artists: uniqueSorted(Array.isArray(data.artists) ? data.artists : [])
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'catalog/master');
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Esto forzará al usuario a poner su correo y cuenta en la ventana de Google siempre
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in:", error);
      alert(`No se pudo iniciar sesión con Google: ${error.message}`);
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
      const cleanedArtist = newSong.artist.trim();
      const cleanedGenres = uniqueSorted(selectedGenres);
      const cleanedOccasions = uniqueSorted(selectedOccasions);

      const newDocRef = doc(collection(db, 'songs'));
      await setDoc(newDocRef, {
        title: newSong.title.trim(),
        artist: cleanedArtist,
        link: newSong.link.trim(),
        youtubeUrl: newSong.youtubeUrl.trim(),
        dots: newSong.dots,
        genres: cleanedGenres,
        occasions: cleanedOccasions,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      if (cleanedArtist && !ARTISTS.includes(cleanedArtist)) {
        await upsertCatalogList('artists', [...ARTISTS, cleanedArtist]);
      }

      setNewSong({ title: '', artist: '', link: '', youtubeUrl: '', dots: 3 });
      setSelectedGenres([]);
      setSelectedOccasions([]);
      setGenreSearch('');
      setOccasionSearch('');
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || role !== 'admin') return;
    
    try {
      await setDoc(doc(db, 'pending_users', newUser.email), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        addedBy: user.uid,
        createdAt: serverTimestamp()
      });
      setNewUser({ email: '', name: '', role: 'musician' });
      setShowAddUser(false);
      alert('Invitación enviada correctamente. El usuario podrá acceder con los permisos asignados cuando inicie sesión con su cuenta de Google.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pending_users');
    }
  };

  const upsertCatalogList = async (type: keyof CatalogData, values: string[]) => {
    if (!user || role !== 'admin') return;

    const nextCatalog: CatalogData = {
      ...catalog,
      [type]: uniqueSorted(values)
    };

    await setDoc(doc(db, 'catalog', 'master'), nextCatalog, { merge: true });
  };

  const handleAddCatalogValue = async (type: keyof CatalogData) => {
    if (!user || role !== 'admin') return;
    const inputValue = newCatalogValue[type].trim();
    if (!inputValue) return;
    if (catalog[type].some(v => v.toLowerCase() === inputValue.toLowerCase())) return;

    try {
      await upsertCatalogList(type, [...catalog[type], inputValue]);
      setNewCatalogValue(prev => ({ ...prev, [type]: '' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'catalog/master');
    }
  };

  const handleRemoveCatalogValue = async (type: keyof CatalogData, value: string) => {
    if (!user || role !== 'admin') return;
    try {
      await upsertCatalogList(type, catalog[type].filter(v => v !== value));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'catalog/master');
    }
  };

  const handleRenameCatalogValue = async (type: keyof CatalogData, previousValue: string) => {
    if (!user || role !== 'admin') return;
    const nextValue = window.prompt('Nuevo nombre', previousValue)?.trim();
    if (!nextValue || nextValue === previousValue) return;
    if (catalog[type].some(v => v.toLowerCase() === nextValue.toLowerCase())) {
      alert('Ese valor ya existe.');
      return;
    }

    try {
      await upsertCatalogList(type, catalog[type].map(v => (v === previousValue ? nextValue : v)));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'catalog/master');
    }
  };

  const handleQuickAddFromSongForm = async (type: 'genres' | 'occasions' | 'artists', rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    if (catalog[type].some(v => v.toLowerCase() === value.toLowerCase())) return;
    await upsertCatalogList(type, [...catalog[type], value]);
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
        <div className="w-full max-w-md bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 ambient-shadow">
          <div className="mb-10 text-center">
            <span className="text-error text-xs font-bold uppercase tracking-widest mb-3 block">Acceso Restringido</span>
            <h1 className="font-serif text-3xl md:text-4xl text-on-surface mb-4">Portal de Músicos <br/>y Admin</h1>
            <p className="text-sm text-on-surface-variant">
              Inicia sesión con tu cuenta de Google. Sólo los correos habilitados por la administración podrán ingresar al panel y ver la información.
            </p>
          </div>
          
          <button onClick={handleLogin} className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface py-4 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all mt-4 flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264,51.509 C -3.264,50.719 -3.334,49.969 -3.454,49.239 L -14.754,49.239 L -14.754,53.749 L -8.284,53.749 C -8.574,55.229 -9.424,56.479 -10.684,57.329 L -10.684,60.329 L -6.824,60.329 C -4.564,58.239 -3.264,55.159 -3.264,51.509 Z"/>
                <path fill="#34A853" d="M -14.754,63.239 C -11.514,63.239 -8.804,62.159 -6.824,60.329 L -10.684,57.329 C -11.764,58.049 -13.134,58.489 -14.754,58.489 C -17.884,58.489 -20.534,56.379 -21.484,53.529 L -25.464,53.529 L -25.464,56.619 C -23.494,60.539 -19.444,63.239 -14.754,63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484,53.529 C -21.734,52.809 -21.864,52.039 -21.864,51.239 C -21.864,50.439 -21.724,49.669 -21.484,48.949 L -21.484,45.859 L -25.464,45.859 C -26.284,47.479 -26.754,49.299 -26.754,51.239 C -26.754,53.179 -26.284,54.999 -25.464,56.619 L -21.484,53.529 Z"/>
                <path fill="#EA4335" d="M -14.754,43.989 C -12.984,43.989 -11.404,44.599 -10.154,45.789 L -6.734,41.939 C -8.804,40.009 -11.514,39.239 -14.754,39.239 C -19.444,39.239 -23.494,41.939 -25.464,45.859 L -21.484,48.949 C -20.534,46.099 -17.884,43.989 -14.754,43.989 Z"/>
              </g>
            </svg>
            Ingresar cuenta de Google
          </button>
          
          <button onClick={() => setView('home')} className="mt-6 text-on-surface-variant text-xs hover:text-primary transition-colors w-full text-center">
            Volver a la página principal
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
                <button onClick={() => { setShowAddUser(!showAddUser); setShowAddSong(false); }} className="border border-outline-variant text-on-surface px-6 py-3 font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                  <UserPlus size={18} /> Añadir Usuario
                </button>
                <button onClick={() => { setShowAddSong(!showAddSong); setShowAddUser(false); }} className="border border-outline-variant text-on-surface px-6 py-3 font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                  <Plus size={18} /> Añadir Canción
                </button>
                <button onClick={() => setShowCatalogManager(!showCatalogManager)} className="border border-outline-variant text-on-surface px-6 py-3 font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-2">
                  Gestionar Filtros
                </button>
              </>
            )}
            <button onClick={handleLogout} className="border border-error/50 text-error px-6 py-3 font-medium rounded-xl hover:bg-error/10 transition-colors flex items-center gap-2">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>

        {showCatalogManager && role === 'admin' && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 mb-12 ambient-shadow">
            <h3 className="font-serif text-2xl text-on-surface mb-6">Catálogo de Filtros y Cantantes</h3>
            <p className="text-sm text-on-surface-variant mb-8">Aquí puedes añadir, editar o eliminar géneros, ocasiones y cantantes sin crear canciones nuevas.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(['genres', 'occasions', 'artists'] as const).map((type) => (
                <div key={type} className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4">
                  <h4 className="font-semibold text-on-surface mb-3 capitalize">
                    {type === 'genres' ? 'Géneros' : type === 'occasions' ? 'Ocasiones' : 'Cantantes'}
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={newCatalogValue[type]}
                      onChange={(e) => setNewCatalogValue(prev => ({ ...prev, [type]: e.target.value }))}
                      placeholder={`Añadir ${type === 'genres' ? 'género' : type === 'occasions' ? 'ocasión' : 'cantante'}`}
                      className="flex-1 bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleAddCatalogValue(type)}
                      className="px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-auto custom-scrollbar space-y-2 pr-1">
                    {catalog[type].map(value => (
                      <div key={value} className="flex items-center justify-between gap-2 bg-surface-container p-2 rounded-lg">
                        <span className="text-sm text-on-surface truncate">{value}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleRenameCatalogValue(type, value)} className="p-1 text-on-surface-variant hover:text-primary" title="Renombrar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleRemoveCatalogValue(type, value)} className="p-1 text-on-surface-variant hover:text-error" title="Eliminar">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add User Form */}
        {showAddUser && role === 'admin' && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 mb-12 ambient-shadow">
            <h3 className="font-serif text-2xl text-on-surface mb-8">Invitar Nuevo Usuario</h3>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Nombre del Usuario</label>
                  <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Ej. Juan Pérez" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Correo Electrónico (Google)</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="usuario@gmail.com" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Permisos / Rol</label>
                   <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none">
                     <option value="musician">Músico (Sólo lectura del repertorio)</option>
                     <option value="admin">Administrador (Puede invitar y gestionar)</option>
                   </select>
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
                  <input list="artists-catalog" type="text" required value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} placeholder="Ej. José Alfredo Jiménez" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                  <datalist id="artists-catalog">
                    {ARTISTS.map(artist => <option key={artist} value={artist} />)}
                  </datalist>
                  {newSong.artist.trim() && !ARTISTS.some(a => a.toLowerCase() === newSong.artist.trim().toLowerCase()) && (
                    <button type="button" onClick={() => handleQuickAddFromSongForm('artists', newSong.artist)} className="mt-2 text-xs text-primary hover:underline">
                      Registrar cantante "{newSong.artist.trim()}"
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Enlace Mega (Repertorio)</label>
                  <input type="url" value={newSong.link} onChange={e => setNewSong({...newSong, link: e.target.value})} placeholder="https://mega.nz/..." className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">URL de YouTube (Reproducir en web)</label>
                  <input type="url" value={newSong.youtubeUrl} onChange={e => setNewSong({...newSong, youtubeUrl: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4">Géneros (Selección Múltiple)</label>
                  <div className="mb-3 flex gap-2">
                    <input
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      placeholder="Buscar o crear género"
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-sm"
                    />
                    {genreSearch.trim() && !GENRES.some(g => g.toLowerCase() === genreSearch.trim().toLowerCase()) && (
                      <button type="button" onClick={() => handleQuickAddFromSongForm('genres', genreSearch)} className="px-3 py-2 rounded-xl border border-primary/40 text-primary text-xs">Crear</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredGenreOptions.map(g => (
                      <label key={g} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                        <input type="checkbox" checked={selectedGenres.includes(g)} onChange={() => toggleSelection(g, selectedGenres, setSelectedGenres)} className="rounded border-outline-variant/30 text-primary focus:ring-primary bg-surface-container-lowest" /> {g}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4">Ocasiones (Selección Múltiple)</label>
                  <div className="mb-3 flex gap-2">
                    <input
                      value={occasionSearch}
                      onChange={(e) => setOccasionSearch(e.target.value)}
                      placeholder="Buscar o crear ocasión"
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-sm"
                    />
                    {occasionSearch.trim() && !OCCASIONS.some(o => o.toLowerCase() === occasionSearch.trim().toLowerCase()) && (
                      <button type="button" onClick={() => handleQuickAddFromSongForm('occasions', occasionSearch)} className="px-3 py-2 rounded-xl border border-primary/40 text-primary text-xs">Crear</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredOccasionOptions.map(o => (
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
                  <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Enlaces</th>
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
                      <div className="flex flex-col gap-2 text-sm">
                        {song.link ? (
                          <a href={song.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                            <LinkIcon size={14} /> Mega
                          </a>
                        ) : (
                          <span className="text-on-surface-variant italic">Sin enlace Mega</span>
                        )}
                        {song.youtubeUrl ? (
                          <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                            <LinkIcon size={14} /> YouTube
                          </a>
                        ) : (
                          <span className="text-on-surface-variant italic">Sin YouTube</span>
                        )}
                      </div>
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
