import { useState, useEffect } from 'react';
import { X, Music, Loader2 } from 'lucide-react';
import { Song, SongInput } from '@/lib/api';

interface SongFormProps {
  song?: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SongInput) => Promise<void>;
  loading: boolean;
}

const SongForm = ({ song, isOpen, onClose, onSubmit, loading }: SongFormProps) => {
  const [formData, setFormData] = useState<SongInput>({
    title: '',
    artist: '',
    album: '',
    genre: '',
    duration: undefined,
    audioUrl: '',
    coverImage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        artist: song.artist,
        album: song.album || '',
        genre: song.genre || '',
        duration: song.duration,
        audioUrl: song.audioUrl,
        coverImage: song.coverImage || '',
      });
    } else {
      setFormData({
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: undefined,
        audioUrl: '',
        coverImage: '',
      });
    }
    setErrors({});
  }, [song, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist is required';
    }
    if (!formData.audioUrl.trim()) {
      newErrors.audioUrl = 'Audio URL is required';
    } else if (!isValidUrl(formData.audioUrl)) {
      newErrors.audioUrl = 'Please enter a valid URL';
    }
    if (formData.coverImage && !isValidUrl(formData.coverImage)) {
      newErrors.coverImage = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="modal-content animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              {song ? 'Edit Song' : 'Add New Song'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter song title"
              className={`input-field ${errors.title ? 'border-destructive' : ''}`}
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Artist */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Artist <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="Enter artist name"
              className={`input-field ${errors.artist ? 'border-destructive' : ''}`}
            />
            {errors.artist && (
              <p className="text-xs text-destructive mt-1">{errors.artist}</p>
            )}
          </div>

          {/* Album & Genre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Album</label>
              <input
                type="text"
                name="album"
                value={formData.album}
                onChange={handleChange}
                placeholder="Album name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g., Pop, Rock"
                className="input-field"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration || ''}
              onChange={handleChange}
              placeholder="e.g., 180"
              min="0"
              className="input-field"
            />
          </div>

          {/* Audio URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Audio URL <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              placeholder="https://example.com/song.mp3"
              className={`input-field ${errors.audioUrl ? 'border-destructive' : ''}`}
            />
            {errors.audioUrl && (
              <p className="text-xs text-destructive mt-1">{errors.audioUrl}</p>
            )}
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
              className={`input-field ${errors.coverImage ? 'border-destructive' : ''}`}
            />
            {errors.coverImage && (
              <p className="text-xs text-destructive mt-1">{errors.coverImage}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                song ? 'Save Changes' : 'Add Song'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongForm;
