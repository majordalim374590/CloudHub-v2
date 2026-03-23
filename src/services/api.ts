import { GoogleGenAI } from "@google/genai";

const TMDB_BASE = 'https://api.themoviedb.org/3';
const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const tmdbFetch = async (endpoint: string, params: Record<string, string> = {}) => {
  const apiKey = localStorage.getItem('ch_tmdb_key');
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', apiKey);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('TMDB Fetch Error:', error);
    return null;
  }
};

export const jikanFetch = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${JIKAN_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Jikan Fetch Error:', error);
    return null;
  }
};

export const getEmbedUrl = (id: string | number, type: string, season?: number, episode?: number, source: string = 'vidsrcme', lang: string = 'original') => {
  const isTV = type === 'tv';
  
  if (lang === 'hindi') {
    return isTV 
      ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}&lang=hi`
      : `https://multiembed.mov/?video_id=${id}&tmdb=1&lang=hi`;
  }

  switch (source) {
    case 'vidsrc':
      return isTV ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}` : `https://vidsrc.to/embed/movie/${id}`;
    case 'vidsrcme':
      return isTV ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}` : `https://vidsrc.me/embed/movie?tmdb=${id}`;
    case 'embedsu':
      return isTV ? `https://embed.su/embed/tv/${id}/${season}/${episode}` : `https://embed.su/embed/movie/${id}`;
    default:
      return isTV ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}` : `https://vidsrc.me/embed/movie?tmdb=${id}`;
  }
};
