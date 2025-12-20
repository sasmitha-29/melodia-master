import { Music2, Plus, RefreshCw } from 'lucide-react';
import { Song } from '@/lib/api';
import SongCard from './SongCard';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  loading: boolean;
  onSongSelect: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (song: Song) => void;
  onAddSong: () => void;
  onRefresh: () => void;
}

const SongList = ({
  songs,
  currentSong,
  isPlaying,
  loading,
  onSongSelect,
  onEditSong,
  onDeleteSong,
  onAddSong,
  onRefresh,
}: SongListProps) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Your Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onAddSong}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Song
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Loading songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Music2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">No songs yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first song to get started
              </p>
            </div>
            <button
              onClick={onAddSong}
              className="btn-primary flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Song
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song, index) => (
              <div 
                key={song._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SongCard
                  song={song}
                  isPlaying={isPlaying}
                  isCurrentSong={currentSong?._id === song._id}
                  onPlay={() => onSongSelect(song)}
                  onEdit={() => onEditSong(song)}
                  onDelete={() => onDeleteSong(song)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongList;
