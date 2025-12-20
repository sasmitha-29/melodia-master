import { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  Repeat,
  Shuffle
} from 'lucide-react';
import { Song } from '@/lib/api';

interface MusicPlayerProps {
  song: Song | null;
  songs: Song[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSongEnd: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicPlayer = ({
  song,
  songs,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSongEnd,
  audioRef,
}: MusicPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        onSongEnd();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, isRepeat, onSongEnd]);

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!song) {
    return (
      <div className="glass-card rounded-t-2xl p-4 sm:p-6">
        <div className="flex items-center justify-center gap-4 py-4 text-muted-foreground">
          <Music className="w-5 h-5" />
          <span>Select a song to start playing</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-t-2xl p-4 sm:p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Song Info */}
        <div className="flex items-center gap-4 w-full sm:w-1/4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
            {song.coverImage ? (
              <img 
                src={song.coverImage} 
                alt={song.title}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Music className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium truncate text-foreground">{song.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex-1 flex flex-col items-center gap-2 w-full sm:w-1/2">
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`player-button-secondary ${isShuffle ? 'text-primary' : ''}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button 
              onClick={onPrevious}
              className="player-button-secondary"
              title="Previous"
              disabled={songs.length <= 1}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onPlayPause}
              className="player-button player-button-primary glow-primary"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            <button 
              onClick={onNext}
              className="player-button-secondary"
              title="Next"
              disabled={songs.length <= 1}
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`player-button-secondary ${isRepeat ? 'text-primary' : ''}`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div 
              ref={progressRef}
              className="progress-bar flex-1"
              onClick={handleProgressClick}
            >
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="hidden sm:flex items-center gap-2 w-1/4 justify-end">
          <button 
            onClick={toggleMute}
            className="player-button-secondary"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 accent-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
