import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { MapPin, X } from "lucide-react";
import { Button } from "./ui/button";
import { AlarmData } from "../types/alarm";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export default function ActiveAlarmScreen() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // localStorage에서 알람 데이터 로드
  useEffect(() => {
    const data = localStorage.getItem("alarmData");
    if (data) {
      const parsed = JSON.parse(data);
      setAlarmData(parsed);
      
      // 시작 위치 설정 (목적지에서 5km 떨어진 곳)
      setCurrentPosition({
        lat: parsed.lat - 0.045, // 약 5km 남쪽
        lng: parsed.lng,
      });
    } else {
      setShouldRedirect(true);
    }
  }, []);

  // 리다이렉트 처리
  useEffect(() => {
    if (shouldRedirect) {
      navigate("/");
    }
  }, [shouldRedirect, navigate]);

  // Google Maps 초기화
  useEffect(() => {
    if (!alarmData || !mapRef.current || googleMapRef.current) return;

    const initMap = async () => {
      try {
        // 이미 로드된 경우 체크
        if (!window.google?.maps?.Map) {
          // Google Maps 스크립트 동적 로드
          if (!document.getElementById("google-maps-script")) {
            const script = document.createElement("script");
            script.id = "google-maps-script";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            
            const loadPromise = new Promise<void>((resolve, reject) => {
              script.onload = () => {
                const checkInterval = setInterval(() => {
                  if (window.google?.maps?.Map) {
                    clearInterval(checkInterval);
                    resolve();
                  }
                }, 100);
                
                setTimeout(() => {
                  clearInterval(checkInterval);
                  reject(new Error("Google Maps API 초기화 타임아웃"));
                }, 10000);
              };
              
              script.onerror = () => {
                reject(new Error("Google Maps 스크립트 로드 실패"));
              };
            });
            
            document.head.appendChild(script);
            await loadPromise;
          }
        }

        // 지도 생성
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: alarmData.lat, lng: alarmData.lng },
          zoom: 13,
          styles: [
            {
              elementType: "geometry",
              stylers: [{ color: "#212121" }],
            },
            {
              elementType: "labels.text.stroke",
              stylers: [{ color: "#212121" }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: "#757575" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#2c2c2c" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#000000" }],
            },
          ],
          disableDefaultUI: true,
          zoomControl: false,
        });

        googleMapRef.current = map;

        // 목적지 마커
        destinationMarkerRef.current = new google.maps.Marker({
          position: { lat: alarmData.lat, lng: alarmData.lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#D32F2F",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });

        // 반경 원
        circleRef.current = new google.maps.Circle({
          map,
          center: { lat: alarmData.lat, lng: alarmData.lng },
          radius: alarmData.radius * 1000,
          strokeColor: "#D32F2F",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#D32F2F",
          fillOpacity: 0.15,
        });

        setIsMapLoaded(true);
      } catch (error) {
        console.error("❌ Google Maps 로딩 실패:", error);
      }
    };

    initMap();

    return () => {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null);
      }
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setMap(null);
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [alarmData]);

  // 현재 위치 마커 및 라인 업데이트
  useEffect(() => {
    if (!isMapLoaded || !currentPosition || !alarmData || !googleMapRef.current) return;

    // 현재 위치 마커
    if (!currentMarkerRef.current) {
      currentMarkerRef.current = new google.maps.Marker({
        position: currentPosition,
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });
    } else {
      currentMarkerRef.current.setPosition(currentPosition);
    }

    // 연결선
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        map: googleMapRef.current,
        path: [currentPosition, { lat: alarmData.lat, lng: alarmData.lng }],
        strokeColor: "#D32F2F",
        strokeOpacity: 0.5,
        strokeWeight: 2,
        geodesic: true,
      });
    } else {
      polylineRef.current.setPath([
        currentPosition,
        { lat: alarmData.lat, lng: alarmData.lng },
      ]);
    }
  }, [isMapLoaded, currentPosition, alarmData]);

  // 위치 시뮬레이션 (목적지를 향해 이동)
  useEffect(() => {
    if (!alarmData || !currentPosition) return;

    const interval = setInterval(() => {
      setCurrentPosition((prev) => {
        if (!prev) return prev;

        const dx = alarmData.lng - prev.lng;
        const dy = alarmData.lat - prev.lat;
        const newLat = prev.lat + dy * 0.04;
        const newLng = prev.lng + dx * 0.04;

        // 거리 계산 (Haversine formula)
        const R = 6371; // 지구 반지름 (km)
        const dLat = (alarmData.lat - newLat) * (Math.PI / 180);
        const dLng = (alarmData.lng - newLng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(newLat * (Math.PI / 180)) *
            Math.cos(alarmData.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;

        setDistance(dist);

        // 반경 내에 들어오면 알람 트리거
        if (dist <= alarmData.radius) {
          navigate("/trigger");
        }

        return { lat: newLat, lng: newLng };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [alarmData, currentPosition, navigate]);

  const handleCancel = () => {
    localStorage.removeItem("alarmData");
    navigate("/");
  };

  // 알람 데이터가 없으면 null 반환 (모든 hooks 호출 후)
  if (!alarmData) {
    return null;
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-black flex-shrink-0" />

      {/* Status Bar */}
      <div className="flex-shrink-0 bg-[var(--gray-900)] border-b border-[var(--gray-800)] px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-3 h-3 bg-[var(--crimson-red)] rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-[var(--crimson-red)] rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
                Vigilant
              </p>
              <p className="text-sm text-white font-normal mt-0.5">
                {distance.toFixed(2)} km remaining
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-[var(--gray-300)] hover:text-white transition-colors"
            style={{ borderRadius: "4px" }}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Google Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading State */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--crimson-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-white font-light">Loading Map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Panel */}
      <div className="flex-shrink-0 bg-black border-t border-[var(--gray-800)] p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase mb-2">
              Destination
            </p>
            <p className="text-xl text-white font-normal">
              {alarmData.destination}
            </p>
            <p className="text-sm text-[var(--gray-400)] font-light mt-1">
              {alarmData.address}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase mb-2">
              Alert Range
            </p>
            <p className="text-xl text-white font-normal">
              {alarmData.radius < 1
                ? `${(alarmData.radius * 1000).toFixed(0)} m`
                : `${alarmData.radius} km`}
            </p>
          </div>
        </div>

        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full py-5 bg-transparent border border-[var(--gray-800)] text-white hover:border-white hover:bg-transparent font-light tracking-wider uppercase transition-all"
          style={{ borderRadius: "4px" }}
        >
          Cancel Alarm
        </Button>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />
    </div>
  );
}