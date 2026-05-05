import { Heart, Clock, Users } from 'lucide-react'
import { Recipe } from '@/hooks/useRecipes'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
}

export function RecipeCard({ recipe, onClick, onToggleFavorite }: RecipeCardProps) {
  const totalMin = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group"
    >
      {/* Foto */}
      <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🍽️
          </div>
        )}

        {/* Favoriet knop */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          aria-label="Favoriet"
        >
          <Heart
            size={16}
            className={recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          {totalMin > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {totalMin} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {recipe.servings} pers.
            </span>
          )}
          {recipe.recipe_ingredients?.length > 0 && (
            <span>{recipe.recipe_ingredients.length} ingrediënten</span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-primary-50 text-primary-600 font-medium"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-500">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
