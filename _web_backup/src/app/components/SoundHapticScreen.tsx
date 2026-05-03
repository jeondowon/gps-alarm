import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Play, Circle, Plus, Volume2, Headphones, Speaker, Smartphone } from "lucide-react";

const ALARM_SOUNDS = [
  { id: 1, name: "Midnight Echo", duration: "0:04" },
  { id: 2, name: "Pulse", duration: "0:03" },
  { id: 3, name: "Rapid Red", duration: "0:02" },
  { id: 4, name: "Silent Dawn", duration: "0:05" },
  { id: 5, name: "Harmonic Alert", duration: "0:03" },
];

type AlarmMode = "speaker" | "earphones" | "vibrate";

export default function SoundHapticScreen() {
  const navigate = useNavigate();
  const [selectedSound, setSelectedSound] = useState(2); // Default to "Pulse"
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [hapticIntensity, setHapticIntensity] = useState(70);
  const [volume, setVolume] = useState(80);
  const [alarmMode, setAlarmMode] = useState<AlarmMode>("speaker");

  const handlePlay = (id: number) => {
    setPlayingId(id);
    // Simulate playing sound
    setTimeout(() => {
      setPlayingId(null);
    }, 1500);

    // Trigger vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setHapticIntensity(value);

    // Provide haptic feedback
    if (navigator.vibrate) {
      const intensity = Math.floor((value / 100) * 50);
      navigator.vibrate(intensity);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
  };

  const handleAddSong = () => {
    // Simulate opening file picker for custom song
    console.log("Opening file picker to add custom alarm tone");
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
          style={{ borderRadius: '4px' }}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <p className="text-sm text-[var(--gray-300)] font-light tracking-wider">
          SOUND & HAPTICS
        </p>
        <div className="w-6" />
      </div>

      {/* Waveform Visualization */}
      <div className="flex-shrink-0 px-6 py-8 border-b border-[var(--gray-800)]">
        <div className="flex items-end justify-center gap-1 h-20">
          {[3, 7, 12, 18, 24, 28, 32, 28, 24, 18, 15, 20, 26, 22, 16, 12, 8, 4, 6, 10, 14, 18, 22, 18, 14, 10, 6].map(
            (height, index) => (
              <div
                key={index}
                className="w-1 bg-white transition-all duration-300"
                style={{
                  height: `${playingId ? height : height * 0.3}px`,
                  opacity: playingId ? 1 : 0.3,
                  backgroundColor: playingId ? 'var(--crimson-red)' : 'white',
                }}
              />
            )
          )}
        </div>
      </div>

      {/* Alarm Sounds List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-4 flex items-center gap-2">
          <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
            Alarm Tones
          </p>
          <div className="flex-1 h-px bg-[var(--gray-800)]" />
        </div>

        <div className="space-y-3">
          {ALARM_SOUNDS.map((sound) => (
            <div
              key={sound.id}
              className={`bg-[var(--gray-900)] border transition-all overflow-hidden ${
                selectedSound === sound.id
                  ? 'border-[var(--crimson-red)]'
                  : 'border-[var(--gray-800)] hover:border-[var(--gray-700)]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <div
                onClick={() => setSelectedSound(sound.id)}
                className="w-full p-4 flex items-center gap-4 cursor-pointer"
              >
                {/* Selection Indicator */}
                <div className="flex-shrink-0">
                  <Circle
                    className={`w-5 h-5 transition-all ${
                      selectedSound === sound.id
                        ? 'text-[var(--crimson-red)] fill-[var(--crimson-red)]'
                        : 'text-[var(--gray-600)]'
                    }`}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Sound Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-base font-medium mb-0.5 ${
                      selectedSound === sound.id ? 'text-white' : 'text-[var(--gray-200)]'
                    }`}
                  >
                    {sound.name}
                  </p>
                  <p className="text-sm text-[var(--gray-300)] font-light">
                    {sound.duration}
                  </p>
                </div>

                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(sound.id);
                  }}
                  className="flex-shrink-0 w-10 h-10 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] flex items-center justify-center transition-all"
                  style={{ borderRadius: '4px' }}
                >
                  <Play
                    className={`w-5 h-5 text-white transition-transform ${
                      playingId === sound.id ? 'scale-90' : 'scale-100'
                    }`}
                    strokeWidth={2}
                    fill={playingId === sound.id ? 'white' : 'none'}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Song Button */}
        <div className="mt-6">
          <button
            onClick={handleAddSong}
            className="w-full p-4 bg-[var(--gray-900)] border border-[var(--gray-800)] hover:border-[var(--gray-700)] flex items-center justify-center transition-all"
            style={{ borderRadius: '4px' }}
          >
            <Plus className="w-5 h-5 text-[var(--gray-300)]" strokeWidth={1.5} />
            <p className="text-sm text-[var(--gray-300)] font-light ml-2">
              Add Custom Song
            </p>
          </button>
        </div>

        {/* Alarm Mode Selection */}
        <div className="mt-10 mb-6">
          <div className="mb-4 flex items-center gap-2">
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
              Alarm Mode
            </p>
            <div className="flex-1 h-px bg-[var(--gray-800)]" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setAlarmMode("speaker")}
              className={`flex-1 p-4 bg-[var(--gray-900)] border transition-all ${
                alarmMode === "speaker"
                  ? 'border-[var(--crimson-red)]'
                  : 'border-[var(--gray-800)] hover:border-[var(--gray-700)]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <div className="flex flex-col items-center gap-2">
                <Speaker
                  className={`w-6 h-6 ${
                    alarmMode === "speaker" ? 'text-[var(--crimson-red)]' : 'text-[var(--gray-300)]'
                  }`}
                  strokeWidth={1.5}
                />
                <p className={`text-xs font-light ${
                  alarmMode === "speaker" ? 'text-white' : 'text-[var(--gray-300)]'
                }`}>
                  Speaker
                </p>
              </div>
            </button>

            <button
              onClick={() => setAlarmMode("earphones")}
              className={`flex-1 p-4 bg-[var(--gray-900)] border transition-all ${
                alarmMode === "earphones"
                  ? 'border-[var(--crimson-red)]'
                  : 'border-[var(--gray-800)] hover:border-[var(--gray-700)]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <div className="flex flex-col items-center gap-2">
                <Headphones
                  className={`w-6 h-6 ${
                    alarmMode === "earphones" ? 'text-[var(--crimson-red)]' : 'text-[var(--gray-300)]'
                  }`}
                  strokeWidth={1.5}
                />
                <p className={`text-xs font-light ${
                  alarmMode === "earphones" ? 'text-white' : 'text-[var(--gray-300)]'
                }`}>
                  Earphones
                </p>
              </div>
            </button>

            <button
              onClick={() => setAlarmMode("vibrate")}
              className={`flex-1 p-4 bg-[var(--gray-900)] border transition-all ${
                alarmMode === "vibrate"
                  ? 'border-[var(--crimson-red)]'
                  : 'border-[var(--gray-800)] hover:border-[var(--gray-700)]'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <div className="flex flex-col items-center gap-2">
                <Smartphone
                  className={`w-6 h-6 ${
                    alarmMode === "vibrate" ? 'text-[var(--crimson-red)]' : 'text-[var(--gray-300)]'
                  }`}
                  strokeWidth={1.5}
                />
                <p className={`text-xs font-light ${
                  alarmMode === "vibrate" ? 'text-white' : 'text-[var(--gray-300)]'
                }`}>
                  Vibrate
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mt-10 mb-6">
          <div className="mb-4 flex items-center gap-2">
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
              Volume
            </p>
            <div className="flex-1 h-px bg-[var(--gray-800)]" />
            <p className="text-xs text-white font-medium">
              {volume}%
            </p>
          </div>

          {/* Custom Slider */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 appearance-none bg-[var(--gray-800)] cursor-pointer"
              style={{
                borderRadius: '4px',
                background: `linear-gradient(to right, var(--crimson-red) 0%, var(--crimson-red) ${volume}%, var(--gray-800) ${volume}%, var(--gray-800) 100%)`,
              }}
            />
          </div>

          {/* Volume Labels */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-[var(--gray-300)] font-light">Off</p>
            <p className="text-xs text-[var(--gray-300)] font-light">Low</p>
            <p className="text-xs text-[var(--gray-300)] font-light">Medium</p>
            <p className="text-xs text-[var(--gray-300)] font-light">High</p>
          </div>
        </div>

        {/* Vibration Section */}
        <div className="mt-10 mb-6">
          <div className="mb-4 flex items-center gap-2">
            <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
              Vibration
            </p>
            <div className="flex-1 h-px bg-[var(--gray-800)]" />
            <p className="text-xs text-white font-medium">
              {hapticIntensity}%
            </p>
          </div>

          {/* Custom Slider */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={hapticIntensity}
              onChange={handleSliderChange}
              className="w-full h-2 appearance-none bg-[var(--gray-800)] cursor-pointer"
              style={{
                borderRadius: '4px',
                background: `linear-gradient(to right, var(--crimson-red) 0%, var(--crimson-red) ${hapticIntensity}%, var(--gray-800) ${hapticIntensity}%, var(--gray-800) 100%)`,
              }}
            />
          </div>

          {/* Intensity Labels */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-[var(--gray-300)] font-light">Off</p>
            <p className="text-xs text-[var(--gray-300)] font-light">Light</p>
            <p className="text-xs text-[var(--gray-300)] font-light">Medium</p>
            <p className="text-xs text-[var(--gray-300)] font-light">Strong</p>
          </div>
        </div>
      </div>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: var(--crimson-red);
          cursor: pointer;
          border: 2px solid white;
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: var(--crimson-red);
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}