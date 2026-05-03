import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

const DISTANCE_OPTIONS = [
  {
    value: 0.3,
    label: "300m",
    eta: "About 1–2 minutes before arrival",
  },
  {
    value: 0.5,
    label: "500m",
    eta: "About 2–3 minutes before arrival",
  },
  {
    value: 1,
    label: "1km",
    eta: "About 4–5 minutes before arrival",
  },
  {
    value: 2,
    label: "2km",
    eta: "About 8–10 minutes before arrival",
  },
];

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

export default function GoogleMapsRadiusScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { lat, lng, name, address } = location.state || {
    lat: 37.5665, // Seoul default
    lng: 126.978,
    name: "Selected Location",
    address: "No address provided",
  };

  const [selectedRadius, setSelectedRadius] = useState(1); // Default 1km
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Google Maps 초기화
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        console.log("🗺️ Google Maps 로딩 시작...");
        console.log("📍 좌표:", { lat, lng });
        console.log(
          "🔑 API Key:",
          GOOGLE_MAPS_API_KEY.substring(0, 10) + "...",
        );

        // 이미 로드된 경우 체크
        if (window.google?.maps?.Map) {
          console.log(
            "✅ Google Maps API 이미 로드됨 (재사용)",
          );
        } else {
          // Google Maps 스크립트 동적 로드
          if (!document.getElementById("google-maps-script")) {
            console.log("📥 Google Maps 스크립트 로드 중...");

            const script = document.createElement("script");
            script.id = "google-maps-script";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;

            const loadPromise = new Promise<void>(
              (resolve, reject) => {
                script.onload = () => {
                  console.log(
                    "📦 스크립트 로드 완료, API 초기화 대기 중...",
                  );

                  // Google Maps API가 완전히 초기화될 때까지 대기
                  const checkInterval = setInterval(() => {
                    if (window.google?.maps?.Map) {
                      clearInterval(checkInterval);
                      console.log(
                        "✅ Google Maps API 완전히 초기화됨",
                      );
                      resolve();
                    }
                  }, 100);

                  // 타임아웃 (10초)
                  setTimeout(() => {
                    clearInterval(checkInterval);
                    reject(
                      new Error(
                        "Google Maps API 초기화 타임아웃",
                      ),
                    );
                  }, 10000);
                };

                script.onerror = () => {
                  reject(
                    new Error("Google Maps 스크립트 로드 실패"),
                  );
                };
              },
            );

            document.head.appendChild(script);
            await loadPromise;
          }
        }

        console.log("✅ Google Maps API 로드 완료");

        if (
          !isMounted ||
          !mapRef.current ||
          googleMapRef.current
        ) {
          console.log(
            "⚠️ 컴포넌트 언마운트되었거나 지도가 이미 생성됨",
          );
          return;
        }

        // API가 완전히 로드되었는지 확인
        if (!window.google?.maps) {
          throw new Error(
            "Google Maps API가 로드되지 않았습니다",
          );
        }

        console.log("🗺️ 지도 생성 중...");

        // 지도 생성
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          // 다크 모드 스타일 적용
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
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#bdbdbd" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#757575" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#181818" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#616161" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#2c2c2c" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212121" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#3c3c3c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#000000" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#3d3d3d" }],
            },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        console.log("✅ 지도 생성 완료");

        googleMapRef.current = map;

        // 마커 생성 (빨간 핀)
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#D32F2F",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });

        console.log("✅ 마커 생성 완료");

        markerRef.current = marker;

        // 반경 원 생성 (Crimson Red)
        const circle = new google.maps.Circle({
          map,
          center: { lat, lng },
          radius: selectedRadius * 1000, // km를 m로 변환
          strokeColor: "#D32F2F",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#D32F2F",
          fillOpacity: 0.15,
          clickable: false,
          editable: false,
        });

        console.log(
          "✅ 반경 원 생성 완료:",
          selectedRadius * 1000,
          "m",
        );

        circleRef.current = circle;

        // 반경 원이 보이도록 지도 범위 조정
        // const bounds = circle.getBounds();
        // if (bounds) {
        //   map.fitBounds(bounds);
        //   // 약간의 패딩 추가
        //   const currentZoom = map.getZoom();
        //   if (currentZoom) {
        //     map.setZoom(currentZoom - 0.5);
        //   }
        // }

        setIsMapLoaded(true);
        setMapError(null);

        console.log("🎉 Google Maps 초기화 완료!");
      } catch (error) {
        console.error("❌ Google Maps 로딩 실패:", error);
        setMapError(
          error instanceof Error
            ? error.message
            : "지도를 불러올 수 없습니다",
        );
      }
    };

    initMap();

    return () => {
      isMounted = false;
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [lat, lng]);

  // 반경이 변경될 때 원 업데이트
  useEffect(() => {
    if (circleRef.current && isMapLoaded) {
      circleRef.current.setRadius(selectedRadius * 1000);

      // 지도 줌 레벨 조정
      if (googleMapRef.current) {
        const bounds = circleRef.current.getBounds();
        if (bounds) {
          googleMapRef.current.fitBounds(bounds);
        }
      }
    }
  }, [selectedRadius, isMapLoaded]);

  const handleSetAlarm = () => {
    localStorage.setItem(
      "alarmData",
      JSON.stringify({
        destination: name || "Selected Location",
        address: address || "No address provided",
        lat,
        lng,
        radius: selectedRadius,
      }),
    );
    navigate("/active");
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-black flex-shrink-0" />

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-[var(--gray-800)] flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-white hover:text-[var(--crimson-red)] transition-colors"
          style={{ borderRadius: "4px" }}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <p className="text-sm text-[var(--gray-300)] font-light tracking-wider">
          SET RADIUS
        </p>
        <div className="w-6" />
      </div>

      {/* Google Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading State */}
        {!isMapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--crimson-red)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-white font-light">
                Loading Google Maps...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
            <div className="text-center max-w-md">
              <div
                className="w-16 h-16 bg-[var(--gray-900)] border border-[var(--gray-800)] flex items-center justify-center mx-auto mb-4"
                style={{ borderRadius: "4px" }}
              >
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-base text-white font-medium mb-2">
                지도를 불러올 수 없습니다
              </p>
              <p className="text-sm text-[var(--gray-400)] font-light mb-4">
                {mapError}
              </p>
              <div
                className="space-y-2 text-xs text-[var(--gray-400)] text-left bg-[var(--gray-900)] p-4"
                style={{ borderRadius: "4px" }}
              >
                <p className="font-medium text-white mb-2">
                  해결 방법:
                </p>
                <p>1. Google Cloud Console에서 API 키 확인</p>
                <p>
                  2. Maps JavaScript API가 활성화되었는지 확인
                </p>
                <p>3. 결제 계정이 연결되어 있는지 확인</p>
                <p>
                  4. 브라우저 콘솔(F12)에서 자세한 오류 확인
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 bg-[var(--crimson-red)] text-white font-medium tracking-wide hover:bg-[var(--crimson-red-dark)] transition-all"
                style={{ borderRadius: "4px" }}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Radius Label Overlay */}
        {isMapLoaded && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border border-[var(--crimson-red)] px-4 py-2 backdrop-blur-sm"
            style={{ borderRadius: "4px" }}
          >
            <p className="text-xs text-white font-light tracking-wider">
              {selectedRadius >= 1
                ? `${selectedRadius.toFixed(0)} KM RADIUS`
                : `${(selectedRadius * 1000).toFixed(0)} M RADIUS`}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0 bg-black border-t border-[var(--gray-800)] p-6 space-y-6">
        {/* Destination Info */}
        <div className="flex items-center gap-3">
          <div className="w-1 self-stretch bg-[var(--crimson-red)]" />
          <div>
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
              Destination
            </p>
            <p className="text-lg text-white font-normal mt-1">
              {name || "Selected Location"}
            </p>
            <p className="text-sm text-[var(--gray-400)] font-light mt-0.5">
              {address || "No address provided"}
            </p>
          </div>
        </div>

        {/* Segmented Picker */}
        <div className="space-y-4">
          <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
            Alert Radius
          </p>

          {/* 4-Point Grid Control */}
          <div className="grid grid-cols-4 gap-2">
            {DISTANCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRadius(option.value)}
                className={`
                  py-4 transition-all duration-300 border
                  ${
                    selectedRadius === option.value
                      ? "bg-[var(--crimson-red)] text-[var(--gray-100)] border-[var(--gray-800)]"
                      : "bg-transparent text-[var(--gray-300)] border-[var(--gray-800)] hover:bg-[var(--gray-900)]"
                  }
                `}
                style={{ fontWeight: 700, borderRadius: "4px" }}
              >
                <span className="text-sm tracking-wide">
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* ETA Description */}
          <div className="pt-2">
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wide text-center">
              {
                DISTANCE_OPTIONS.find(
                  (opt) => opt.value === selectedRadius,
                )?.eta
              }
            </p>
          </div>
        </div>

        {/* Set Alarm Button */}
        <Button
          onClick={handleSetAlarm}
          className="w-full py-6 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] text-white font-medium tracking-wider uppercase transition-all text-[#ffffff]"
          style={{ borderRadius: "4px" }}
        >
          Set Alarm
        </Button>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />
    </div>
  );
}