'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Recipe } from '@/lib/types/database';
import { useParams } from 'next/navigation';

const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Drink',
];

export default function EditRecipePage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    category: CATEGORIES[0],
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const { id } = params as { id: string };
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Recipe not found.');
        setLoading(false);
        return;
      }
      const recipe: Recipe = {
        id: data.id as string,
        created_at: data.created_at as string,
        user_id: data.user_id as string,
        title: data.title as string,
        description: data.description as string | null,
        ingredients: data.ingredients as string[],
        cooking_time: data.cooking_time as number | null,
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard' | null,
        category: data.category as string,
        instructions: data.instructions as string[],
        image_url: data.image_url as string | null,
      };
      setRecipe(recipe);
      setForm({
        title: recipe.title || '',
        description: recipe.description || '',
        ingredients: recipe.ingredients || [''],
        instructions: recipe.instructions || [''],
        category: recipe.category || CATEGORIES[0],
        image_url: recipe.image_url || '',
      });
      setLoading(false);
    };
    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleIngredientChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.map((ing, i) => (i === idx ? value : ing)) }));
  };
  const handleInstructionChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, instructions: f.instructions.map((ins, i) => (i === idx ? value : ins)) }));
  };
  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, ''] }));
  const removeIngredient = (idx: number) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  const addInstruction = () => setForm(f => ({ ...f, instructions: [...f.instructions, ''] }));
  const removeInstruction = (idx: number) => setForm(f => ({ ...f, instructions: f.instructions.filter((_, i) => i !== idx) }));

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (form.ingredients.length === 0 || form.ingredients.some(i => !i.trim())) return 'All ingredients are required.';
    if (form.instructions.length === 0 || form.instructions.some(i => !i.trim())) return 'All instructions are required.';
    if (!form.category) return 'Category is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    let imageUrl = form.image_url;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('recipe-images').upload(fileName, imageFile);
      if (uploadError) {
        setError('Image upload failed.');
        setLoading(false);
        return;
      }
      imageUrl = supabase.storage.from('recipe-images').getPublicUrl(fileName).data.publicUrl;
    }
    const { id } = params as { id: string };
    const { error: updateError } = await supabase.from('recipes').update({
      user_id: recipe?.user_id, // ensure user_id is included
      title: form.title,
      description: form.description,
      ingredients: form.ingredients,
      instructions: form.instructions,
      category: form.category,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (updateError) {
      setError('Failed to update recipe.');
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace(`/recipes/${id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!recipe) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-bold text-center mb-2">Edit Recipe</h2>
        <input
          className="w-full p-2 border rounded"
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full p-2 border rounded"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <div>
          <label className="block font-semibold mb-1">Ingredients</label>
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                className="w-full p-2 border rounded"
                type="text"
                value={ing}
                onChange={e => handleIngredientChange(idx, e.target.value)}
                required
              />
              {form.ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(idx)} className="text-red-500">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="text-blue-600 underline">Add Ingredient</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Instructions</label>
          {form.instructions.map((ins, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                className="w-full p-2 border rounded"
                type="text"
                value={ins}
                onChange={e => handleInstructionChange(idx, e.target.value)}
                required
              />
              {form.instructions.length > 1 && (
                <button type="button" onClick={() => removeInstruction(idx)} className="text-red-500">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="text-blue-600 underline">Add Instruction</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            className="w-full p-2 border rounded"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Image (optional)</label>
          <input
            ref={imageInputRef}
            className="w-full p-2 border rounded"
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
          />
          {form.image_url && (
            <Image
              src={form.image_url}
              alt="Current"
              width={300}
              height={150}
              className="w-full h-32 object-cover rounded mt-2"
            />
          )}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}