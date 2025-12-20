import axios from 'axios';

// API base URL - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Song interface matching backend schema
export interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  audioUrl: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Input type for creating/updating songs
export interface SongInput {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration?: number;
  audioUrl: string;
  coverImage?: string;
}

// API functions
export const songApi = {
  // Get all songs
  getAll: async (): Promise<Song[]> => {
    const response = await api.get('/api/songs');
    return response.data;
  },

  // Get single song by ID
  getById: async (id: string): Promise<Song> => {
    const response = await api.get(`/api/songs/${id}`);
    return response.data;
  },

  // Create new song
  create: async (song: SongInput): Promise<Song> => {
    const response = await api.post('/api/songs', song);
    return response.data;
  },

  // Update existing song
  update: async (id: string, song: SongInput): Promise<Song> => {
    const response = await api.put(`/api/songs/${id}`, song);
    return response.data;
  },

  // Delete song
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/songs/${id}`);
  },

  // Health check
  health: async (): Promise<{ status: string }> => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export default api;
