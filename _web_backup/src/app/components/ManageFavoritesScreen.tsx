import { useState } from "react";
import { useNavigate } from "react-router";
import { Home, Briefcase, Heart, ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";

const INITIAL_FAVORITES = [
  { id: 1, name: "Home", icon: Home, address: "123 Oak Street, Northside" },
  { id: 2, name: "Work", icon: Briefcase, address: "Tech Plaza, Floor 15, Downtown" },
  { id: 3, name: "Gym", icon: Heart, address: "456 Fitness Ave, West District" },
];

export default function ManageFavoritesScreen() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  const handleEdit = (id: number) => {
    setEditingId(id === editingId ? null : id);
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
          MANAGE FAVORITES
        </p>
        <div className="w-6" />
      </div>

      {/* Saved Places List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 flex items-center gap-2">
          <p className="text-xs text-[var(--gray-300)] font-light tracking-wider uppercase">
            Saved Places
          </p>
          <div className="flex-1 h-px bg-[var(--gray-800)]" />
        </div>

        <div className="space-y-4 pb-24">
          {favorites.map((favorite) => {
            const Icon = favorite.icon;
            const isEditing = editingId === favorite.id;

            return (
              <div
                key={favorite.id}
                className="bg-[var(--gray-900)] border border-[var(--gray-800)] hover:border-[var(--gray-700)] transition-all overflow-hidden"
                style={{ borderRadius: '4px' }}
              >
                {/* Main Card Content */}
                <div className="p-5 flex items-start gap-4">
                  {/* Minimalist Icon */}
                  <div className="flex-shrink-0 w-12 h-12 border border-[var(--gray-800)] flex items-center justify-center" style={{ borderRadius: '4px' }}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Location Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-white font-medium mb-1">
                      {favorite.name}
                    </p>
                    <p className="text-sm text-[var(--gray-300)] font-light">
                      {favorite.address}
                    </p>
                  </div>

                  {/* Edit Toggle Button */}
                  <button
                    onClick={() => handleEdit(favorite.id)}
                    className={`flex-shrink-0 p-2 transition-colors ${
                      isEditing ? 'text-[var(--crimson-red)]' : 'text-[var(--gray-300)] hover:text-white'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    <Edit2 className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Edit Actions Panel */}
                {isEditing && (
                  <div className="border-t border-[var(--gray-800)] bg-black px-5 py-4 flex items-center justify-between">
                    <button className="text-sm text-white hover:text-[var(--crimson-red)] font-light tracking-wide uppercase transition-colors" style={{ borderRadius: '4px' }}>
                      Edit
                    </button>
                    <div className="w-px h-4 bg-[var(--gray-800)]" />
                    <button
                      onClick={() => handleDelete(favorite.id)}
                      className="text-sm text-white hover:text-[var(--crimson-red)] font-light tracking-wide uppercase transition-colors flex items-center gap-2"
                      style={{ borderRadius: '4px' }}
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {favorites.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--gray-300)] font-light">
              No saved places yet
            </p>
          </div>
        )}
      </div>

      {/* Floating Add New Button */}
      <button
        className="fixed bottom-24 right-6 w-14 h-14 bg-[var(--crimson-red)] hover:bg-[var(--crimson-red-dark)] shadow-2xl flex items-center justify-center transition-all group"
        style={{ borderRadius: '4px' }}
        onClick={() => {
          // Add new favorite logic
          const newId = Math.max(...favorites.map(f => f.id), 0) + 1;
          setFavorites([
            ...favorites,
            { id: newId, name: "New Place", icon: Home, address: "Add address..." }
          ]);
        }}
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2} />
      </button>

      {/* Android Gesture Bar */}
      <div className="h-1 bg-[var(--gray-800)] flex-shrink-0" />
    </div>
  );
}