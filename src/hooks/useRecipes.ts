import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useWorkspace } from '@/context/WorkspaceContext'

export interface Ingredient {
  id?: string
  name: string
  amount: number | null
  unit: string
  sort_order: number
}

export interface Step {
  id?: string
  step_number: number
  instruction: string
}

export interface Recipe {
  id: string
  workspace_id: string
  created_by: string | null
  title: string
  description: string | null
  image_url: string | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
  recipe_ingredients: Ingredient[]
  recipe_steps: Step[]
}

export interface RecipeFilters {
  search?: string
  tags?: string[]
  sort?: 'newest' | 'alpha' | 'favorites'
}

const RECIPE_SELECT = `
  id, workspace_id, created_by, title, description, image_url,
  prep_time_minutes, cook_time_minutes, servings, tags, is_favorite,
  created_at, updated_at,
  recipe_ingredients(id, name, amount, unit, sort_order),
  recipe_steps(id, step_number, instruction)
`

export function useRecipes(filters: RecipeFilters = {}) {
  const { activeWorkspace } = useWorkspace()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!activeWorkspace) { setLoading(false); return }
    setLoading(true)
    setError(null)

    let q = supabase
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('workspace_id', activeWorkspace.id)

    if (filters.search?.trim()) {
      q = q.ilike('title', `%${filters.search.trim()}%`)
    }
    if (filters.tags?.length) {
      q = q.overlaps('tags', filters.tags)
    }

    const { data, error: err } = await q

    if (err) { setError(err.message); setLoading(false); return }

    let list: Recipe[] = (data ?? []).map((r: any) => ({
      ...r,
      recipe_ingredients: [...(r.recipe_ingredients ?? [])].sort(
        (a: Ingredient, b: Ingredient) => a.sort_order - b.sort_order
      ),
      recipe_steps: [...(r.recipe_steps ?? [])].sort(
        (a: Step, b: Step) => a.step_number - b.step_number
      ),
    }))

    if (filters.sort === 'alpha') {
      list = list.sort((a, b) => a.title.localeCompare(b.title))
    } else if (filters.sort === 'favorites') {
      list = list.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite))
    } else {
      list = list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    setRecipes(list)
    setLoading(false)
  }, [activeWorkspace?.id, filters.search, filters.tags?.join(','), filters.sort])

  useEffect(() => { load() }, [load])

  async function fetchRecipe(id: string): Promise<Recipe> {
    const { data, error: err } = await supabase
      .from('recipes')
      .select(RECIPE_SELECT)
      .eq('id', id)
      .single()
    if (err) throw err
    return {
      ...data,
      recipe_ingredients: [...(data.recipe_ingredients ?? [])].sort(
        (a: Ingredient, b: Ingredient) => a.sort_order - b.sort_order
      ),
      recipe_steps: [...(data.recipe_steps ?? [])].sort(
        (a: Step, b: Step) => a.step_number - b.step_number
      ),
    }
  }

  async function createRecipe(payload: {
    title: string
    description?: string
    prepTime?: number | null
    cookTime?: number | null
    servings?: number
    tags?: string[]
    ingredients: Ingredient[]
    steps: string[]
    imageFile?: File | null
  }): Promise<string> {
    if (!activeWorkspace) throw new Error('Geen actieve workspace')
    const userId = (await supabase.auth.getUser()).data.user?.id

    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .insert({
        workspace_id: activeWorkspace.id,
        created_by: userId,
        title: payload.title,
        description: payload.description || null,
        prep_time_minutes: payload.prepTime ?? null,
        cook_time_minutes: payload.cookTime ?? null,
        servings: payload.servings ?? 4,
        tags: payload.tags ?? [],
      })
      .select('id')
      .single()

    if (recipeErr) throw recipeErr

    if (payload.imageFile) {
      const url = await uploadRecipeImage(recipe.id, payload.imageFile)
      await supabase.from('recipes').update({ image_url: url }).eq('id', recipe.id)
    }

    if (payload.ingredients.length) {
      await supabase.from('recipe_ingredients').insert(
        payload.ingredients.map((ing, i) => ({
          recipe_id: recipe.id,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          sort_order: i,
        }))
      )
    }

    if (payload.steps.length) {
      await supabase.from('recipe_steps').insert(
        payload.steps.map((instruction, i) => ({
          recipe_id: recipe.id,
          step_number: i + 1,
          instruction,
        }))
      )
    }

    await load()
    return recipe.id
  }

  async function updateRecipe(
    id: string,
    payload: Parameters<typeof createRecipe>[0]
  ): Promise<void> {
    const updates: Record<string, any> = {
      title: payload.title,
      description: payload.description || null,
      prep_time_minutes: payload.prepTime ?? null,
      cook_time_minutes: payload.cookTime ?? null,
      servings: payload.servings ?? 4,
      tags: payload.tags ?? [],
    }

    if (payload.imageFile) {
      const { data: existing } = await supabase
        .from('recipes').select('image_url').eq('id', id).single()
      if (existing?.image_url) await deleteRecipeImage(existing.image_url)
      updates.image_url = await uploadRecipeImage(id, payload.imageFile)
    }

    const { error: recipeErr } = await supabase
      .from('recipes').update(updates).eq('id', id)
    if (recipeErr) throw recipeErr

    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)
    if (payload.ingredients.length) {
      await supabase.from('recipe_ingredients').insert(
        payload.ingredients.map((ing, i) => ({
          recipe_id: id,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          sort_order: i,
        }))
      )
    }

    await supabase.from('recipe_steps').delete().eq('recipe_id', id)
    if (payload.steps.length) {
      await supabase.from('recipe_steps').insert(
        payload.steps.map((instruction, i) => ({
          recipe_id: id,
          step_number: i + 1,
          instruction,
        }))
      )
    }

    await load()
  }

  async function deleteRecipe(id: string): Promise<void> {
    const { data } = await supabase
      .from('recipes').select('image_url').eq('id', id).single()
    if (data?.image_url) await deleteRecipeImage(data.image_url)
    const { error: err } = await supabase.from('recipes').delete().eq('id', id)
    if (err) throw err
    await load()
  }

  async function toggleFavorite(id: string, current: boolean): Promise<void> {
    await supabase.from('recipes').update({ is_favorite: !current }).eq('id', id)
    setRecipes(prev =>
      prev.map(r => r.id === id ? { ...r, is_favorite: !current } : r)
    )
  }

  async function uploadRecipeImage(recipeId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${activeWorkspace!.id}/${recipeId}/photo.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('recipe-images')
      .upload(path, file, { upsert: true })
    if (uploadErr) throw uploadErr
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function deleteRecipeImage(imageUrl: string): Promise<void> {
    const path = imageUrl.split('/recipe-images/')[1]
    if (path) await supabase.storage.from('recipe-images').remove([path])
  }

  function getAllTags(): string[] {
    return [...new Set(recipes.flatMap(r => r.tags ?? []))].sort()
  }

  return {
    recipes, loading, error, reload: load,
    fetchRecipe, createRecipe, updateRecipe, deleteRecipe,
    toggleFavorite, uploadRecipeImage, getAllTags,
  }
}
