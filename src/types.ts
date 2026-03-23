export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: 'movie' | 'tv';
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  score: number;
  year: number | null;
  synopsis: string;
  status: string;
  episodes: number | null;
}

export interface LiveChannel {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  url: string;
}
