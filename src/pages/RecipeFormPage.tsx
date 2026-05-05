import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, X, ArrowLeft, Upload } from 'lucide-react'
import { useRecipes, Ingredient } from '@/hooks/useRecipes'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

// ─── Sorteerbare rij ──────────────────────────────────────────────
function SortableIngredientRow({
  item, onChange, onRemove,
}: {
  item: Ingredient & { _key: string }
  onChange: (field: keyof Ingredient, value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._key })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button type="button" {...attributes} {...listeners}
        className="cursor-grab text-slate-300 hover:text-slate-500 flex-shrink-0 touch-none">
        <GripVertical size={16} />
      </button>
      <input
        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
        value={item.amount ?? ''}
        onChange={e => onChange('amount', e.target.value)}
        placeholder="250"
      />
      <input
        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
        value={item.unit}
        onChange={e => onChange('unit', e.target.value)}
        placeholder="gram"
      />
      <input
        className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
        value={item.name}
        onChange={e => onChange('name', e.target.value)}
        placeholder="Ingrediënt naam"
      />
      <button type="button" onClick={onRemove}
        className="text-slate-300 hover:text-danger flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}

function SortableStepRow({
  item, index, onChange, onRemove,
}: {
  item: { _key: string; instruction: string }
  index: number
  onChange: (value: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._key })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button type="button" {...attributes} {...listeners}
        className="cursor-grab text-slate-300 hover:text-slate-500 mt-2.5 flex-shrink-0 touch-none">
        <GripVertical size={16} />
      </button>
      <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-2 font-bold">
        {index + 1}
      </span>
      <textarea
        className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none min-h-[64px]"
        value={item.instruction}
        onChange={e => onChange(e.target.value)}
        placeholder={`Stap ${index + 1}...`}
      />
      <button type="button" onClick={onRemove}
        className="text-slate-300 hover:text-danger flex-shrink-0 mt-2.5">
        <X size={16} />
      </button>
    </div>
  )
}

// ─── Hoofd formulier ──────────────────────────────────────────────
const COMMON_TAGS = ['Ontbijt', 'Lunch', 'Diner', 'Snack', 'Dessert', 'Vegetarisch', 'Vegan', 'Snel', 'Feestelijk']

interface FormFields {
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: string
}

export default function RecipeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { fetchRecipe, createRecipe, updateRecipe } = useRecipes()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormFields>({
    defaultValues: { servings: '4' },
  })

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [ingredients, setIngredients] = useState<(Ingredient & { _key: string })[]>([
    { _key: uuidv4(), name: '', amount: null, unit: '', sort_order: 0 },
  ])
  const [steps, setSteps] = useState<{ _key: string; instruction: string }[]>([
    { _key: uuidv4(), instruction: '' },
  ])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadingRecipe, setLoadingRecipe] = useState(isEditing)
  const photoRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    if (!isEditing || !id) return
    fetchRecipe(id).then(r => {
      reset({
        title: r.title,
        description: r.description ?? '',
        prepTime: String(r.prep_time_minutes ?? ''),
        cookTime: String(r.cook_time_minutes ?? ''),
        servings: String(r.servings ?? 4),
      })
      setTags(r.tags ?? [])
      setIngredients(
        r.recipe_ingredients.length
          ? r.recipe_ingredients.map(ing => ({ ...ing, _key: uuidv4() }))
          : [{ _key: uuidv4(), name: '', amount: null, unit: '', sort_order: 0 }]
      )
      setSteps(
        r.recipe_steps.length
          ? r.recipe_steps.map(s => ({ _key: uuidv4(), instruction: s.instruction }))
          : [{ _key: uuidv4(), instruction: '' }]
      )
      if (r.image_url) setImagePreview(r.image_url)
      setLoadingRecipe(false)
    }).catch(() => setLoadingRecipe(false))
  }, [id])

  function handleImageSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim()
      if (!tags.includes(tag)) setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  // Ingrediënten helpers
  function updateIngredient(key: string, field: keyof Ingredient, value: string) {
    setIngredients(prev => prev.map(ing =>
      ing._key === key
        ? { ...ing, [field]: field === 'amount' ? (value === '' ? null : parseFloat(value)) : value }
        : ing
    ))
  }

  function handleIngredientDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = ingredients.findIndex(i => i._key === active.id)
      const newIdx = ingredients.findIndex(i => i._key === over.id)
      setIngredients(arrayMove(ingredients, oldIdx, newIdx))
    }
  }

  function handleStepDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = steps.findIndex(s => s._key === active.id)
      const newIdx = steps.findIndex(s => s._key === over.id)
      setSteps(arrayMove(steps, oldIdx, newIdx))
    }
  }

  async function onSubmit(fields: FormFields) {
    setSaving(true)
    try {
      const payload = {
        title: fields.title.trim(),
        description: fields.description.trim() || undefined,
        prepTime: fields.prepTime ? parseInt(fields.prepTime) : null,
        cookTime: fields.cookTime ? parseInt(fields.cookTime) : null,
        servings: parseInt(fields.servings) || 4,
        tags,
        ingredients: ingredients
          .filter(i => i.name.trim())
          .map((i, idx) => ({ ...i, sort_order: idx })),
        steps: steps.map(s => s.instruction).filter(s => s.trim()),
        imageFile,
      }

      if (isEditing && id) {
        await updateRecipe(id, payload)
        toast.success('Recept bijgewerkt!')
        navigate(`/recipes/${id}`)
      } else {
        const newId = await createRecipe(payload)
        toast.success('Recept aangemaakt!')
        navigate(`/recipes/${newId}`)
      }
    } catch (err: any) {
      toast.error('Opslaan mislukt: ' + err.message)
    }
    setSaving(false)
  }

  if (loadingRecipe) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = 'w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-slate-800">
          {isEditing ? 'Recept bewerken' : 'Nieuw recept'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Foto upload ── */}
        <div>
          <label className={labelClass}>Foto</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file) handleImageSelect(file)
            }}
            onClick={() => photoRef.current?.click()}
            className={`relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-colors ${
              dragOver ? 'border-primary bg-primary-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Foto wijzigen</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Upload size={32} />
                <span className="text-sm">Sleep een foto hierheen of klik om te uploaden</span>
                <span className="text-xs">JPG, PNG of WebP · max 5 MB</span>
              </div>
            )}
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f) }}
          />
        </div>

        {/* ── Basisvelden ── */}
        <div>
          <label className={labelClass}>Titel *</label>
          <input
            className={inputClass}
            placeholder="Bijv. Spaghetti Carbonara"
            {...register('title', { required: 'Titel is verplicht' })}
          />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Beschrijving</label>
          <textarea
            className={`${inputClass} h-24 resize-none`}
            placeholder="Korte omschrijving van het recept..."
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Voorbereiding (min)</label>
            <input type="number" min={0} className={inputClass} placeholder="15" {...register('prepTime')} />
          </div>
          <div>
            <label className={labelClass}>Kooktijd (min)</label>
            <input type="number" min={0} className={inputClass} placeholder="30" {...register('cookTime')} />
          </div>
          <div>
            <label className={labelClass}>Porties</label>
            <input type="number" min={1} className={inputClass} {...register('servings')} />
          </div>
        </div>

        {/* ── Tags ── */}
        <div>
          <label className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_TAGS.map(t => (
              <button key={t} type="button"
                onClick={() => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  tags.includes(t)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tags.filter(t => !COMMON_TAGS.includes(t)).map(t => (
              <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary text-xs">
                {t}
                <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Eigen tag + Enter"
              className="px-2 py-1 text-xs border border-dashed border-slate-300 rounded-full focus:outline-none focus:border-primary w-36"
            />
          </div>
        </div>

        {/* ── Ingrediënten ── */}
        <div>
          <label className={`${labelClass} text-base`}>Ingrediënten</label>
          <div className="flex gap-2 text-xs text-slate-400 mb-1 pl-6">
            <span className="w-20">Hoev.</span>
            <span className="w-20">Eenheid</span>
            <span>Naam</span>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleIngredientDragEnd}>
            <SortableContext items={ingredients.map(i => i._key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {ingredients.map(ing => (
                  <SortableIngredientRow
                    key={ing._key}
                    item={ing}
                    onChange={(field, value) => updateIngredient(ing._key, field, value)}
                    onRemove={() => setIngredients(prev => prev.filter(i => i._key !== ing._key))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={() => setIngredients(prev => [
              ...prev,
              { _key: uuidv4(), name: '', amount: null, unit: '', sort_order: prev.length },
            ])}
            className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary-700 transition-colors"
          >
            <Plus size={14} /> Ingrediënt toevoegen
          </button>
        </div>

        {/* ── Stappen ── */}
        <div>
          <label className={`${labelClass} text-base`}>Bereiding</label>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
            <SortableContext items={steps.map(s => s._key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <SortableStepRow
                    key={step._key}
                    item={step}
                    index={idx}
                    onChange={value => setSteps(prev =>
                      prev.map(s => s._key === step._key ? { ...s, instruction: value } : s)
                    )}
                    onRemove={() => setSteps(prev => prev.filter(s => s._key !== step._key))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={() => setSteps(prev => [...prev, { _key: uuidv4(), instruction: '' }])}
            className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary-700 transition-colors"
          >
            <Plus size={14} /> Stap toevoegen
          </button>
        </div>

        {/* ── Knoppen ── */}
        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60"
          >
            {saving ? 'Opslaan...' : isEditing ? 'Wijzigingen opslaan' : 'Recept aanmaken'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  )
}
