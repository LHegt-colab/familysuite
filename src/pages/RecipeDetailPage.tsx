import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Users, Heart, Pencil, Trash2, ChefHat } from 'lucide-react'
import { useRecipes, Recipe } from '@/hooks/useRecipes'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import toast from 'react-hot-toast'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchRecipe, deleteRecipe, toggleFavorite } = useRecipes()
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspace()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canEdit =
    recipe?.created_by === user?.id || activeWorkspace?.role === 'owner'

  useEffect(() => {
    if (!id) return
    fetchRecipe(id)
      .then(r => { setRecipe(r); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [id])

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    try {
      await deleteRecipe(id)
      toast.success('Recept verwijderd')
      navigate('/recipes')
    } catch (err: any) {
      toast.error('Verwijderen mislukt: ' + err.message)
      setDeleting(false)
    }
  }

  async function handleToggleFavorite() {
    if (!recipe) return
    await toggleFavorite(recipe.id, recipe.is_favorite)
    setRecipe(r => r ? { ...r, is_favorite: !r.is_favorite } : r)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!recipe) return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <ChefHat size={40} className="text-slate-300 mb-4" />
      <h3 className="text-lg font-semibold text-slate-600">Recept niet gevonden</h3>
      <button onClick={() => navigate('/recipes')}
        className="mt-4 text-sm text-primary hover:underline">
        Terug naar recepten
      </button>
    </div>
  )

  const totalMin = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Navigatie */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/recipes')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Recepten
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title="Favoriet"
          >
            <Heart size={18} className={recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                title="Bewerken"
              >
                <Pencil size={18} />
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-danger text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                  >
                    {deleting ? 'Verwijderen...' : 'Ja, verwijderen'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm"
                  >
                    Annuleren
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-danger transition-colors"
                  title="Verwijderen"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Foto */}
      {recipe.image_url && (
        <div className="w-full aspect-video overflow-hidden">
          <img src={recipe.image_url} alt={recipe.title}
            className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.tags.map(tag => (
              <span key={tag}
                className="px-3 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Titel */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-slate-500 leading-relaxed mb-4">{recipe.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-100 mb-6 text-sm text-slate-600">
          {recipe.prep_time_minutes != null && recipe.prep_time_minutes > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-slate-400" />
              <span>Voorbereiding: <strong>{recipe.prep_time_minutes} min</strong></span>
            </div>
          )}
          {recipe.cook_time_minutes != null && recipe.cook_time_minutes > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-slate-400" />
              <span>Koken: <strong>{recipe.cook_time_minutes} min</strong></span>
            </div>
          )}
          {totalMin > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-primary" />
              <span>Totaal: <strong>{totalMin} min</strong></span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-slate-400" />
              <span><strong>{recipe.servings}</strong> personen</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Ingrediënten */}
          {recipe.recipe_ingredients.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Ingrediënten</h2>
              <ul className="space-y-2">
                {recipe.recipe_ingredients.map((ing, i) => (
                  <li key={ing.id ?? i}
                    className="flex items-baseline gap-2 py-1.5 border-b border-slate-50 last:border-0">
                    <span className="font-medium text-slate-700 text-sm whitespace-nowrap min-w-[60px]">
                      {ing.amount != null ? ing.amount : ''}{ing.unit ? ` ${ing.unit}` : ''}
                    </span>
                    <span className="text-slate-600 text-sm">{ing.name}</span>
                  </li>
                ))}
              </ul>

              {/* Snelkoppelingen */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => toast('Boodschappenlijst komt in Fase 4!', { icon: '🛒' })}
                  className="w-full py-2 px-4 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors"
                >
                  🛒 Voeg toe aan boodschappenlijst
                </button>
                <button
                  onClick={() => toast('Taken koppelen komt in Fase 3!', { icon: '✅' })}
                  className="w-full py-2 px-4 bg-primary-50 text-primary rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  ✅ Koppel aan taak
                </button>
              </div>
            </div>
          )}

          {/* Stappen */}
          {recipe.recipe_steps.length > 0 && (
            <div className="md:col-span-3">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Bereiding</h2>
              <ol className="space-y-3">
                {recipe.recipe_steps.map((step, i) => (
                  <li
                    key={step.id ?? i}
                    onClick={() => setActiveStep(activeStep === step.step_number ? null : step.step_number)}
                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      activeStep === step.step_number
                        ? 'bg-primary-50 border border-primary-100'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                      activeStep === step.step_number
                        ? 'bg-primary text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {step.step_number}
                    </span>
                    <span className="text-slate-700 text-sm leading-relaxed pt-1">
                      {step.instruction}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
