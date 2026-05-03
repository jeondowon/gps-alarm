export interface AlarmData {
  destination: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
}

export function formatRadius(radius: number): string {
  return radius >= 1 ? `${radius} km` : `${radius * 1000} m`;
}
