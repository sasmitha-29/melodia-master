import { Play, Pause, Pencil, Trash2, Music } from 'lucide-react';
import { Song } from '@/lib/api';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrentSong: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SongCard = ({ 
  song, 
  isPlaying, 
  isCurrentSong, 
  onPlay, 
  onEdit, 
  onDelete 
}: SongCardProps) => {
  // Format duration from seconds to mm:ss
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`song-card group border ${
        isCurrentSong 
          ? 'border-primary/50 glow-primary' 
          : 'border-transparent hover:border-border'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Cover Image */}
        <div 
          className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={onPlay}
        >
          {song.coverImage ? (
            <img 
              src={song.coverImage} 
              alt={song.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isCurrentSong && isPlaying ? 'animate-spin-slow' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Music className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className={`absolute inset-0 bg-background/60 flex items-center justify-center transition-opacity duration-200 ${
            isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {isCurrentSong && isPlaying ? (
              <Pause className="w-6 h-6 text-primary" />
            ) : (
              <Play className="w-6 h-6 text-primary ml-1" />
            )}
          </div>
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onPlay}>
          <h3 className={`font-medium truncate transition-colors ${
            isCurrentSong ? 'text-primary' : 'text-foreground'
          }`}>
            {song.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {song.artist}
            {song.album && ` • ${song.album}`}
          </p>
        </div>

        {/* Duration & Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {formatDuration(song.duration)}
          </span>
          
          {/* Action buttons - visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Edit song"
            >
              <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-full hover:bg-destructive/20 transition-colors"
              title="Delete song"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
