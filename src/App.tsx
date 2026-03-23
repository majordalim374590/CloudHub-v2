import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Film, 
  Tv, 
  Search, 
  History, 
  Download, 
  Settings, 
  Lock, 
  Play, 
  Info, 
  Plus, 
  Check, 
  Share2, 
  ChevronRight,
  X,
  Menu,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { tmdbFetch, jikanFetch, getEmbedUrl } from './services/api';
import { VideoPlayer } from './components/VideoPlayer';

// --- Constants ---
const LIVE_CHANNELS = [
  { id: 'bbc', name: 'BBC World News', category: 'News', icon: '📺', color: '#BB1919', url: 'https://vs1.hdstreamz.io:8443/bbcworld/index.m3u8' },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'News', icon: '🌍', color: '#00A859', url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8' },
  { id: 'nasa', name: 'NASA TV', category: 'Science', icon: '🚀', color: '#1B3A6B', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8' },
];

const ADULT_SITES = [
  { name: 'XVideos', icon: 'X', url: 'https://www.xvideos.com' },
  { name: 'Pornhub', icon: 'P', url: 'https://www.pornhub.com' },
  { name: 'RedTube', icon: 'R', url: 'https://www.redtube.com' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tmdbKey, setTmdbKey] = useState(localStorage.getItem('ch_tmdb_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [heroItems, setHeroItems] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [playerConfig, setPlayerConfig] = useState<any>(null);
  const [isAdultUnlocked, setIsAdultUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [adultSearchQuery, setAdultSearchQuery] = useState('');
  const [adultResults, setAdultResults] = useState<any[]>([]);
  const [isAdultLoading, setIsAdultLoading] = useState(false);

  useEffect(() => {
    if (tmdbKey) {
      loadHomeData();
    }
  }, [tmdbKey]);

  const loadHomeData = async () => {
    const trendingData = await tmdbFetch('/trending/all/week');
    if (trendingData?.results) {
      setHeroItems(trendingData.results.slice(0, 5));
      setTrending(trendingData.results);
    }
    const moviesData = await tmdbFetch('/movie/popular');
    if (moviesData?.results) {
      setPopularMovies(moviesData.results);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const data = await tmdbFetch('/search/multi', { query });
      if (data?.results) setSearchResults(data.results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAdultSearch = async (query: string) => {
    setAdultSearchQuery(query);
    if (query.length > 2) {
      setIsAdultLoading(true);
      try {
        // Using Eporner public API for internal player content
        const res = await fetch(`https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=12&thumbsize=big`);
        const data = await res.json();
        if (data?.videos) setAdultResults(data.videos);
      } catch (error) {
        console.error('Adult Search Error:', error);
      } finally {
        setIsAdultLoading(false);
      }
    } else {
      setAdultResults([]);
    }
  };

  const handlePinSubmit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        const storedPin = localStorage.getItem('ch_adult_pin') || '1234';
        if (newPin === storedPin) {
          setIsAdultUnlocked(true);
          setShowPinModal(false);
          setActiveTab('adult');
          setPin('');
        } else {
          setPin('');
          alert('Incorrect PIN');
        }
      }
    }
  };

  const renderHero = () => (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {heroItems.length > 0 && (
        <>
          <img 
            src={`https://image.tmdb.org/t/p/original${heroItems[0].backdrop_path}`} 
            className="h-full w-full object-cover"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-transparent to-transparent" />
          <div className="absolute bottom-20 left-10 max-w-xl space-y-4">
            <h1 className="text-5xl font-bold">{heroItems[0].title || heroItems[0].name}</h1>
            <p className="text-gray-300 line-clamp-3">{heroItems[0].overview}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setPlayerConfig({ id: heroItems[0].id, type: heroItems[0].media_type })}
                className="flex items-center gap-2 rounded bg-white px-8 py-3 font-bold text-black transition hover:bg-white/90"
              >
                <Play size={20} fill="black" /> Play
              </button>
              <button 
                onClick={() => setSelectedItem(heroItems[0])}
                className="flex items-center gap-2 rounded bg-gray-500/50 px-8 py-3 font-bold text-white backdrop-blur transition hover:bg-gray-500/70"
              >
                <Info size={20} /> More Info
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderRow = (title: string, items: any[], type: string) => (
    <div className="space-y-4 py-6 px-10">
      <h2 className="text-xl font-bold flex items-center justify-between">
        {title}
        <ChevronRight size={20} className="text-brand cursor-pointer" />
      </h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ scale: 1.05 }}
            className="relative min-w-[160px] cursor-pointer rounded-lg overflow-hidden bg-surface group"
            onClick={() => setSelectedItem(item)}
          >
            <img 
              src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} 
              className="aspect-[2/3] w-full object-cover"
              alt={item.title}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
               <div className="bg-brand w-8 h-8 rounded-full flex items-center justify-center mb-2 self-end">
                  <Play size={14} fill="white" />
               </div>
               <p className="text-xs font-bold truncate">{item.title || item.name}</p>
               <p className="text-[10px] text-green-400">★ {item.vote_average.toFixed(1)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-10 transition-colors duration-300">
        <div className="flex items-center gap-10">
          <span className="font-bebas text-3xl tracking-wider text-brand cursor-pointer" onClick={() => setActiveTab('home')}>CLOUDHUB</span>
          <div className="hidden space-x-6 text-sm font-medium text-gray-300 md:flex">
            {['Home', 'Movies', 'Series', 'Anime', 'Live TV'].map((item) => (
              <span 
                key={item} 
                className={cn("cursor-pointer hover:text-white transition", activeTab === item.toLowerCase().replace(' ', '') && "text-white font-bold")}
                onClick={() => setActiveTab(item.toLowerCase().replace(' ', ''))}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search size={20} className="cursor-pointer" onClick={() => setActiveTab('search')} />
          </div>
          <Settings size={20} className="cursor-pointer" onClick={() => setShowSettings(true)} />
          <div 
            className="h-8 w-8 rounded bg-brand flex items-center justify-center font-bold cursor-pointer"
            onClick={() => {
              if (isAdultUnlocked) setActiveTab('adult');
              else setShowPinModal(true);
            }}
          >
            {isAdultUnlocked ? <Lock size={16} /> : 'U'}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === 'home' && (
          <>
            {renderHero()}
            <div className="-mt-32 relative z-10">
              {renderRow('Trending Now', trending, 'movie')}
              {renderRow('Popular Movies', popularMovies, 'movie')}
            </div>
          </>
        )}

        {activeTab === 'search' && (
          <div className="pt-24 px-10 space-y-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Search movies, series, anime..." 
                className="w-full bg-surface border border-white/10 rounded-full py-4 pl-12 pr-6 outline-none focus:border-brand transition"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {searchResults.map(item => (
                <div key={item.id} className="cursor-pointer group" onClick={() => setSelectedItem(item)}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface">
                    <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play fill="white" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{item.title || item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'adult' && isAdultUnlocked && (
          <div className="pt-24 px-10 space-y-8">
            <div className="flex items-center justify-between">
               <h1 className="text-3xl font-bold flex items-center gap-3">
                 <ShieldAlert className="text-brand" /> Adult Hub <span className="text-xs bg-brand px-2 py-1 rounded">18+</span>
               </h1>
               <button onClick={() => setIsAdultUnlocked(false)} className="text-gray-400 hover:text-white flex items-center gap-2">
                 <Lock size={16} /> Lock
               </button>
            </div>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Search adult content for internal player..." 
                className="w-full bg-surface border border-white/10 rounded-full py-4 pl-12 pr-6 outline-none focus:border-brand transition"
                value={adultSearchQuery}
                onChange={(e) => handleAdultSearch(e.target.value)}
              />
              {isAdultLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent" />}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {adultResults.map(video => (
                <div 
                  key={video.id} 
                  className="cursor-pointer group" 
                  onClick={() => setPlayerConfig({ embed_url: video.embed })}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
                    <img src={video.default_thumb.src} className="w-full h-full object-cover" alt={video.title} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play fill="white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {video.length_min}:{video.length_sec.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium line-clamp-2">{video.title}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
              {ADULT_SITES.map(site => (
                <a 
                  key={site.name} 
                  href={site.url} 
                  target="_blank" 
                  className="bg-surface border border-white/5 p-6 rounded-xl hover:border-brand transition flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl font-bold border border-white/10">
                    {site.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{site.name}</h3>
                    <p className="text-xs text-gray-500">Open in external browser</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around bg-black/90 backdrop-blur-lg border-t border-white/5 py-3 md:hidden">
        <Home size={24} className={cn(activeTab === 'home' ? "text-brand" : "text-gray-500")} onClick={() => setActiveTab('home')} />
        <Search size={24} className={cn(activeTab === 'search' ? "text-brand" : "text-gray-500")} onClick={() => setActiveTab('search')} />
        <Tv size={24} className={cn(activeTab === 'livetv' ? "text-brand" : "text-gray-500")} onClick={() => setActiveTab('livetv')} />
        <History size={24} className={cn(activeTab === 'history' ? "text-brand" : "text-gray-500")} onClick={() => setActiveTab('history')} />
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface p-8 rounded-2xl max-w-xs w-full text-center space-y-6"
            >
              <Lock className="mx-auto text-brand" size={48} />
              <div>
                <h2 className="text-xl font-bold">Enter PIN</h2>
                <p className="text-sm text-gray-500">Access restricted content</p>
              </div>
              <div className="flex justify-center gap-3">
                {[0,1,2,3].map(i => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border border-white/20", pin.length > i && "bg-brand border-brand")} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6,7,8,9,0].map(n => (
                  <button 
                    key={n} 
                    onClick={() => handlePinSubmit(n.toString())}
                    className="h-12 w-full bg-white/5 rounded-lg hover:bg-white/10 transition font-bold"
                  >
                    {n}
                  </button>
                ))}
                <button onClick={() => setPin('')} className="col-span-2 h-12 bg-white/5 rounded-lg hover:bg-white/10 transition font-bold">Clear</button>
              </div>
              <button onClick={() => setShowPinModal(false)} className="text-sm text-gray-500 hover:text-white">Cancel</button>
            </motion.div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="h-full w-full max-w-sm bg-surface p-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Settings</h2>
                <X className="cursor-pointer" onClick={() => setShowSettings(false)} />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">TMDB API Key</label>
                <input 
                  type="password" 
                  value={tmdbKey}
                  onChange={(e) => {
                    setTmdbKey(e.target.value);
                    localStorage.setItem('ch_tmdb_key', e.target.value);
                  }}
                  placeholder="Paste your API key..."
                  className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-brand"
                />
                <p className="text-[10px] text-gray-500">Get a free key at themoviedb.org</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Install App</label>
                <div className="bg-black/40 p-4 rounded-xl space-y-3">
                  <p className="text-xs text-gray-400">To install CloudHub on your phone:</p>
                  <ol className="text-[11px] text-gray-500 space-y-2 list-decimal ml-4">
                    <li>Open this site in Safari (iOS) or Chrome (Android)</li>
                    <li>Tap the <span className="text-white font-bold">Share</span> button (iOS) or <span className="text-white font-bold">Menu</span> (Android)</li>
                    <li>Select <span className="text-brand font-bold">"Add to Home Screen"</span></li>
                  </ol>
                </div>
              </div>

              <div className="pt-10">
                <button className="w-full bg-brand/10 text-brand border border-brand/20 py-3 rounded-lg font-bold hover:bg-brand/20 transition">
                  Clear All Data
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 overflow-y-auto">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-surface rounded-2xl max-w-4xl w-full overflow-hidden relative"
            >
              <button className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
              <div className="relative aspect-video">
                <img src={`https://image.tmdb.org/t/p/original${selectedItem.backdrop_path}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <div className="absolute bottom-8 left-8 space-y-4">
                  <h2 className="text-4xl font-bold">{selectedItem.title || selectedItem.name}</h2>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setPlayerConfig({ id: selectedItem.id, type: selectedItem.media_type || 'movie' });
                        setSelectedItem(null);
                        setActiveTab('player');
                      }}
                      className="bg-white text-black px-8 py-2 rounded font-bold flex items-center gap-2"
                    >
                      <Play size={18} fill="black" /> Play
                    </button>
                    <button className="bg-gray-500/50 px-4 py-2 rounded-full"><Plus size={20} /></button>
                    <button className="bg-gray-500/50 px-4 py-2 rounded-full"><Share2 size={20} /></button>
                  </div>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-green-400 font-bold">
                    <span>{selectedItem.vote_average.toFixed(1)} Rating</span>
                    <span className="text-gray-500">{(selectedItem.release_date || selectedItem.first_air_date || '').slice(0,4)}</span>
                    <span className="border border-gray-500 px-1 text-[10px] text-gray-500">HD</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedItem.overview}</p>
                </div>
                <div className="text-sm space-y-2">
                  <p><span className="text-gray-500">Cast:</span> Coming soon...</p>
                  <p><span className="text-gray-500">Genres:</span> Action, Drama</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {playerConfig && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            <div className="h-16 flex items-center px-6 justify-between bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10">
              <button onClick={() => setPlayerConfig(null)} className="flex items-center gap-2 hover:text-brand transition">
                <ChevronRight className="rotate-180" /> Back
              </button>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Now Playing</p>
                <p className="font-bold">{playerConfig.embed_url ? 'Internal Player' : 'Streaming Source 1'}</p>
              </div>
              <div className="w-10" />
            </div>
            <iframe 
              src={playerConfig.embed_url || getEmbedUrl(playerConfig.id, playerConfig.type)}
              className="w-full h-full border-none"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
