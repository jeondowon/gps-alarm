export type FavoriteIcon = 'home' | 'work' | 'school' | 'heart' | 'star' | 'pin';

export interface Favorite {
  id: string;
  name: string;
  icon: FavoriteIcon;
  address: string;
  lat: number;
  lng: number;
}

export const FAVORITES_STORAGE_KEY = 'favorites_v1';
