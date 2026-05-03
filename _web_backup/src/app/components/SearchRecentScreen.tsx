import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Clock, ChevronLeft, MapPin } from "lucide-react";
import { Input } from "./ui/input";

// ⚠️ Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyDXw2wsXCNszTNJX8kDar7UwZmWw1VjXXk";

const RECENT_SEARCHES = [
  { id: 1, name: "Union Station", address: "123 Transit Blvd, Downtown" },
  { id: 2, name: "Central Library", address: "456 Knowledge Ave, Midtown" },
  { id: 3, name: "Tech Park Plaza", address: "789 Innovation Dr, East District" },
  { id: 4, name: "Riverside Market", address: "321 Waterfront St, South End" },
  { id: 5, name: "City Hospital", address: "654 Medical Center Rd, West Side" },
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

export default function SearchRecentScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Google Maps states
  const [predictions, setPredictions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Google Maps API 초기화
  useEffect(() => {
    const initAPI = async () => {
      try {
        console.log("🗺️ Google Maps API 초기화 시작...");

        // 이미 로드된 경우 체크
        if (window.google?.maps?.places?.AutocompleteService) {
          console.log("✅ Google Maps API 이미 로드됨 (재사용)");
          
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
          geocoderRef.current = new google.maps.Geocoder();
          
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

        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        geocoderRef.current = new google.maps.Geocoder();
        
        console.log("✅ Places API 서비스 초기화 완료");
      } catch (error) {
        console.error("❌ Google Maps API 초기화 실패:", error);
      }
    };

    initAPI();
  }, []);

  // 검색 자동완성
  useEffect(() => {
    if (!searchQuery.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);
    setShowPredictions(true);
    
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
          } else {
            setPredictions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePlaceSelect = async (prediction: AutocompleteSuggestion) => {
    if (!geocoderRef.current || !prediction.placePrediction) return;

    setShowPredictions(false);
    setSearchQuery("");

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
              name: prediction.placePrediction.structuredFormat.mainText.text,
              address: prediction.placePrediction.structuredFormat.secondaryText?.text || prediction.placePrediction.text.text,
            },
          });
        }
      }
    );
  };

  const handleRecentClick = (location: typeof RECENT_SEARCHES[0]) => {
    const position = { x: 200 + location.id * 20, y: 280 + location.id * 15 };
    navigate("/radius-selection", { state: { position, name: location.name, address: location.address } });
  };

  const filteredSearches = RECENT_SEARCHES.filter(
    (item) =>
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* iOS Dynamic Island Space */}
      <div className="h-12 bg-black flex-shrink-0" />

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-[var(--gray-800)] flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-white hover:text-[var(--crimson-red)] transition-colors"
          style={{ borderRadius: '4px' }}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <p className="text-sm text-[var(--gray-300)] font-light tracking-wider">
          SEARCH
        </p>
        <div className="w-6" />
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 px-6 py-6">
        <div className="relative bg-[var(--gray-900)] border border-[var(--gray-800)]" style={{ borderRadius: '4px' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--crimson-red)]" strokeWidth={1.5} />
          <Input
            type="text"
            placeholder="Where are you heading?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-white placeholder:text-[var(--gray-300)] focus:ring-0 font-light tracking-wide"
          />
        </div>
      </div>

      {/* Recent Searches List */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Google Places Autocomplete 결과 */}
        {showPredictions && searchQuery.trim() && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
                Search Results
              </p>
              <div className="flex-1 h-px bg-[var(--gray-800)]" />
            </div>

            <div className="space-y-3 pb-6">
              {isLoading ? (
                <div className="w-full bg-[var(--gray-900)] border border-[var(--gray-800)] p-4 text-center" style={{ borderRadius: '4px' }}>
                  <p className="text-sm text-[var(--gray-300)] font-light">Loading...</p>
                </div>
              ) : predictions.length > 0 ? (
                predictions.map((prediction) => (
                  <button
                    key={prediction.placePrediction?.placeId}
                    onClick={() => handlePlaceSelect(prediction)}
                    className="w-full bg-[var(--gray-900)] border border-[var(--gray-800)] hover:border-[var(--crimson-red)] transition-all p-4 text-left group"
                    style={{ borderRadius: '4px' }}
                  >
                    <div className="flex items-start gap-4">
                      {/* MapPin Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <MapPin className="w-5 h-5 text-[var(--crimson-red)]" strokeWidth={1.5} />
                      </div>

                      {/* Location Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-white font-medium mb-1 group-hover:text-[var(--crimson-red)] transition-colors">
                          {prediction.placePrediction?.structuredFormat.mainText.text}
                        </p>
                        <p className="text-sm text-[var(--gray-300)] font-light truncate">
                          {prediction.placePrediction?.structuredFormat.secondaryText?.text || prediction.placePrediction?.text.text}
                        </p>
                      </div>

                      {/* Cursor Indicator */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-[var(--crimson-red)] rounded-full" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="w-full bg-[var(--gray-900)] border border-[var(--gray-800)] p-4 text-center" style={{ borderRadius: '4px' }}>
                  <p className="text-sm text-[var(--gray-300)] font-light">No results found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Recent Searches (검색어가 없을 때만 표시) */}
        {!showPredictions && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
                Recent Searches
              </p>
              <div className="flex-1 h-px bg-[var(--gray-800)]" />
            </div>

            <div className="space-y-3 pb-6">
              {filteredSearches.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRecentClick(item)}
                  className="w-full bg-[var(--gray-900)] border border-[var(--gray-800)] hover:border-[var(--crimson-red)] transition-all p-4 text-left group"
                  style={{ borderRadius: '4px' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Crimson Red Clock Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="w-5 h-5 text-[var(--crimson-red)]" strokeWidth={1.5} />
                    </div>

                    {/* Location Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-white font-medium mb-1 group-hover:text-[var(--crimson-red)] transition-colors">
                        {item.name}
                      </p>
                      <p className="text-sm text-[var(--gray-300)] font-light truncate">
                        {item.address}
                      </p>
                    </div>

                    {/* Cursor Indicator */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 bg-[var(--crimson-red)] rounded-full" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredSearches.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-[var(--gray-300)] font-light">
                  No recent searches found
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />
    </div>
  );
}