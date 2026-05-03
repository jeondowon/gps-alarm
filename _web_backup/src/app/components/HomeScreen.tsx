import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Home, Briefcase, GraduationCap, MapPin, Settings, Star, Music } from "lucide-react";
import { Input } from "./ui/input";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const FAVORITES = [
  { id: 1, name: "Home", icon: Home, location: "123 Oak Street", lat: 37.5665, lng: 126.978 },
  { id: 2, name: "Work", icon: Briefcase, location: "Tech Plaza, Floor 15", lat: 37.57, lng: 126.985 },
  { id: 3, name: "School", icon: GraduationCap, location: "University Campus", lat: 37.56, lng: 126.99 },
];

interface AutocompleteSuggestion {
  placePrediction?: {
    placeId: string;
    text: {
      text: string;
    };
    structuredFormat: {
      mainText: {
        text: string;
      };
      secondaryText?: {
        text: string;
      };
    };
  };
}

export default function HomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("onboardingComplete")) {
      navigate("/splash", { replace: true });
    }
  }, [navigate]);

  const [searchQuery, setSearchQuery] = useState("");
  
  // Google Maps states
  const [predictions, setPredictions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);

  // Google Maps API 초기화 및 지도 생성
  useEffect(() => {
    const initAPI = async () => {
      try {
        console.log("🗺️ Google Maps API 초기화 시작...");

        // 이미 로드된 경우 체크
        if (window.google?.maps?.places?.AutocompleteService) {
          console.log("✅ Google Maps API 이미 로드됨 (재사용)");
          
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
          geocoderRef.current = new google.maps.Geocoder();
          
          // 지도 초기화
          if (mapRef.current && !mapInstanceRef.current) {
            initializeMap();
          }
          
          console.log("✅ Places API 서비스 초기화 완료");
          return;
        }

        // Google Maps 스크립트 동적 로드
        if (!document.getElementById("google-maps-script")) {
          console.log("📥 Google Maps 스크립트 로드 중...");
          
          const script = document.createElement("script");
          script.id = "google-maps-script";
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
          script.async = true;
          script.defer = true;
          
          const loadPromise = new Promise<void>((resolve, reject) => {
            script.onload = () => {
              console.log("📦 스크립트 로드 완료, API 초기화 대기 중...");
              
              const checkInterval = setInterval(() => {
                if (window.google?.maps?.places?.AutocompleteService) {
                  clearInterval(checkInterval);
                  console.log("✅ Google Maps API 완전히 초기화됨");
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

        console.log("✅ Google Maps API 로드 완료");

        if (!window.google?.maps?.places) {
          throw new Error("Google Maps Places API가 로드되지 않았습니다");
        }

        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
        
        // 지도 초기화
        if (mapRef.current) {
          initializeMap();
        }
        
        console.log("✅ Places API 서비스 초기화 완료");
      } catch (error) {
        console.error("❌ Google Maps API 초기화 실패:", error);
      }
    };

    initAPI();
  }, []);

  // Google Maps 지도 초기화 함수
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // 서울 중심 좌표
      const defaultCenter = { lat: 37.5665, lng: 126.978 };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        disableDefaultUI: true,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1a1a1a" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#666666" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#2c2c2c" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f0f0f" }],
          },
        ],
      });

      console.log("✅ Google Maps 지도 초기화 완료");

      // 지도 클릭 이벤트
      mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          // Marker 추가
          if (currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current.setMap(null);
          }

          currentLocationMarkerRef.current = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#D32F2F",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
          });

          // Geocoding으로 주소 가져오기
          if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
              const address = status === "OK" && results?.[0] 
                ? results[0].formatted_address 
                : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

              navigate("/radius-google", {
                state: {
                  lat,
                  lng,
                  name: "Selected Location",
                  address,
                },
              });
            });
          }
        }
      });
    } catch (error) {
      console.error("❌ 지도 초기화 실패:", error);
    }
  };

  // 검색 자동완성
  useEffect(() => {
    if (!searchQuery.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    
    const timer = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: searchQuery,
          language: "ko",
        },
        (results, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.map(result => ({
              placePrediction: {
                placeId: result.place_id,
                text: {
                  text: result.description,
                },
                structuredFormat: {
                  mainText: {
                    text: result.structured_formatting.main_text,
                  },
                  secondaryText: result.structured_formatting.secondary_text ? {
                    text: result.structured_formatting.secondary_text,
                  } : undefined,
                },
              },
            })));
            setShowDropdown(true);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePlaceSelect = async (prediction: AutocompleteSuggestion) => {
    if (!geocoderRef.current || !prediction.placePrediction) return;

    setShowDropdown(false);
    setSearchQuery(prediction.placePrediction.text.text);

    geocoderRef.current.geocode(
      { placeId: prediction.placePrediction.placeId },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          navigate("/radius-google", {
            state: {
              lat,
              lng,
              name: prediction.placePrediction.text.text,
              address: prediction.placePrediction.structuredFormat.secondaryText?.text || prediction.placePrediction.text.text,
            },
          });
        }
      }
    );
  };

  const handleFavoriteClick = (favorite: typeof FAVORITES[0]) => {
    // Google Maps 사용
    navigate("/radius-google", {
      state: {
        lat: favorite.lat,
        lng: favorite.lng,
        name: favorite.name,
        address: favorite.location,
      },
    });
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-background flex-shrink-0" />

      {/* Floating Search Bar */}
      <div className="absolute top-16 left-4 right-4 z-20">
        <div className="relative bg-card border border-border" style={{ borderRadius: 'var(--radius)' }}>
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
          />
          <Input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) {
                setShowDropdown(true);
              }
            }}
            className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:ring-0 font-light tracking-wide"
          />
          {showDropdown && searchQuery.trim() && (
            <div 
              className="absolute left-0 right-0 top-full mt-2 bg-card border border-border max-h-96 overflow-y-auto shadow-lg" 
              style={{ borderRadius: 'var(--radius)' }}
            >
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-muted-foreground font-light">Loading...</div>
              ) : predictions.length > 0 ? (
                predictions.map((prediction) => (
                  <button
                    key={prediction.placePrediction?.placeId}
                    onClick={() => handlePlaceSelect(prediction)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="var(--color-primary)" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium">{prediction.placePrediction?.structuredFormat.mainText.text}</p>
                        <p className="text-xs text-muted-foreground font-light mt-0.5 truncate">{prediction.placePrediction?.structuredFormat.secondaryText?.text || prediction.placePrediction?.text.text}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground font-light">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Menu */}
      <div className="absolute top-32 right-4 z-20 flex flex-col gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/favorites");
          }}
          className="w-12 h-12 bg-card border border-border hover:border-primary flex items-center justify-center transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <Star className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/sound-haptic");
          }}
          className="w-12 h-12 bg-card border border-border hover:border-primary flex items-center justify-center transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <Music className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/settings");
          }}
          className="w-12 h-12 bg-card border border-border hover:border-primary flex items-center justify-center transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <Settings className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {/* Full-Screen Map */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        >
          {/* Google Maps will be rendered here */}
        </div>
      </div>

      {/* Bottom Favorites Bar */}
      <div className="flex-shrink-0 bg-background border-t border-border px-4 py-6">
        <p className="text-xs text-muted-foreground font-light tracking-wider uppercase mb-4">
          Favorites
        </p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {FAVORITES.map((favorite) => {
            const Icon = favorite.icon;
            return (
              <button
                key={favorite.id}
                onClick={() => handleFavoriteClick(favorite)}
                className="flex-shrink-0 w-32 bg-card border border-border p-4 hover:border-primary transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <Icon className="w-6 h-6 text-foreground mb-3" strokeWidth={1.5} />
                <p className="text-sm text-foreground font-medium text-left">{favorite.name}</p>
                <p className="text-xs text-muted-foreground font-light text-left mt-1 truncate">
                  {favorite.location}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-border flex-shrink-0" />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}