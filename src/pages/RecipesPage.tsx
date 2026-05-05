import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus, ChefHat } from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { RecipeCard } from '@/components/recipes/RecipeCard'

type SortOption = 'newest' | 'alpha' | 'favorites'

export default function RecipesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const { recipes, loading, toggleFavorite, getAllTags } = useRecipes({
    search,
    tags: selectedTags,
    sort,
  })

  const allTags = useMemo(() => getAllTags(), [recipes])

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recepten</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {recipes.length} {recipes.length === 1 ? 'recept' : 'recepten'}
          </p>
        </div>
      </div>

      {/* Zoek + filter balk */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek op recept naam..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm bg-white"
          />
        </div>

        <button
          onClick={() => setShowFilters(o => !o)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || selectedTags.length > 0
              ? 'border-primary bg-primary-50 text-primary'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filteren</span>
          {selectedTags.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-xs flex items-center justify-center">
              {selectedTags.length}
            </span>
          )}
        </button>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="newest">Nieuwste eerst</option>
          <option value="alpha">A–Z</option>
          <option value="favorites">Favorieten eerst</option>
        </select>
      </div>

      {/* Tag filters */}
      {showFilters && allTags.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Filter op tag
          </p>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Wis alle filters
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-pink-50 rounded-2xl mb-4">
            <ChefHat size={40} className="text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {search || selectedTags.length > 0 ? 'Geen recepten gevonden' : 'Nog geen recepten'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            {search || selectedTags.length > 0
              ? 'Probeer andere zoektermen of filters.'
              : 'Voeg je eerste recept toe en deel het met je familie.'}
          </p>
          {!search && selectedTags.length === 0 && (
            <button
              onClick={() => navigate('/recipes/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              <Plus size={16} />
              Recept toevoegen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onToggleFavorite={e => {
                e.stopPropagation()
                toggleFavorite(recipe.id, recipe.is_favorite)
              }}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/recipes/new')}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-600 transition-all hover:shadow-xl font-semibold text-sm"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Nieuw recept</span>
      </button>
    </div>
  )
}
