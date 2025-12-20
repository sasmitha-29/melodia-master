import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Song, SongInput, songApi } from '@/lib/api';
import SongList from '@/components/SongList';
import MusicPlayer from '@/components/MusicPlayer';
import SongForm from '@/components/SongForm';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import musicHero from '@/assets/music-hero.jpg';

const Index = () => {
  // State
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  
  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch songs on mount
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await songApi.getAll();
      // Sort by createdAt (newest first)
      const sorted = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSongs(sorted);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      toast.error('Failed to load songs. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Play/Pause control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
          toast.error('Unable to play audio');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Handle song selection
  const handleSongSelect = (song: Song) => {
    if (currentSong?._id === song._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  // Play/Pause toggle
  const handlePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  // Next song
  const handleNext = () => {
    if (!currentSong || songs.length <= 1) return;
    const currentIndex = songs.findIndex(s => s._id === currentSong._id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  // Previous song
  const handlePrevious = () => {
    if (!currentSong || songs.length <= 1) return;
    const currentIndex = songs.findIndex(s => s._id === currentSong._id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  // Song ended handler
  const handleSongEnd = () => {
    handleNext();
  };

  // Add song handler
  const handleAddSong = () => {
    setEditingSong(null);
    setIsFormOpen(true);
  };

  // Edit song handler
  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setIsFormOpen(true);
  };

  // Delete song handler
  const handleDeleteSong = (song: Song) => {
    setDeletingSong(song);
  };

  // Form submit handler
  const handleFormSubmit = async (data: SongInput) => {
    try {
      setFormLoading(true);
      
      if (editingSong) {
        // Update existing song
        const updated = await songApi.update(editingSong._id, data);
        setSongs(prev => prev.map(s => s._id === editingSong._id ? updated : s));
        
        // Update current song if it was edited
        if (currentSong?._id === editingSong._id) {
          setCurrentSong(updated);
        }
        
        toast.success('Song updated successfully');
      } else {
        // Create new song
        const created = await songApi.create(data);
        setSongs(prev => [created, ...prev]);
        toast.success('Song added successfully');
      }
      
      setIsFormOpen(false);
      setEditingSong(null);
    } catch (error) {
      console.error('Failed to save song:', error);
      toast.error(editingSong ? 'Failed to update song' : 'Failed to add song');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete confirm handler
  const handleDeleteConfirm = async () => {
    if (!deletingSong) return;
    
    try {
      setDeleteLoading(true);
      await songApi.delete(deletingSong._id);
      
      // Remove from list
      setSongs(prev => prev.filter(s => s._id !== deletingSong._id));
      
      // If deleted song was playing, stop and clear
      if (currentSong?._id === deletingSong._id) {
        setCurrentSong(null);
        setIsPlaying(false);
      }
      
      toast.success('Song deleted');
      setDeletingSong(null);
    } catch (error) {
      console.error('Failed to delete song:', error);
      toast.error('Failed to delete song');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>MERN Music Player - Your Personal Music Library</title>
        <meta name="description" content="A beautiful music player built with React. Add, play, and manage your music collection with an elegant dark-themed interface." />
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${musicHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col max-w-4xl w-full mx-auto">
          <SongList
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            loading={loading}
            onSongSelect={handleSongSelect}
            onEditSong={handleEditSong}
            onDeleteSong={handleDeleteSong}
            onAddSong={handleAddSong}
            onRefresh={fetchSongs}
          />
        </main>

        {/* Music Player */}
        <footer className="relative z-10 sticky bottom-0">
          <MusicPlayer
            song={currentSong}
            songs={songs}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSongEnd={handleSongEnd}
            audioRef={audioRef}
          />
        </footer>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={currentSong?.audioUrl}
          preload="metadata"
        />

        {/* Song Form Modal */}
        <SongForm
          song={editingSong}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSong(null);
          }}
          onSubmit={handleFormSubmit}
          loading={formLoading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          song={deletingSong}
          isOpen={!!deletingSong}
          onClose={() => setDeletingSong(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      </div>
    </>
  );
};

export default Index;
