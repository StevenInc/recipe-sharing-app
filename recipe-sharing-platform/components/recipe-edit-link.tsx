'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RecipeEditLinkProps {
  recipeUserId: string;
  recipeId: string;
}

export default function RecipeEditLink({ recipeUserId, recipeId }: RecipeEditLinkProps) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwner(!!user && user.id === recipeUserId);
    };
    checkOwner();
  }, [recipeUserId]);

  if (!isOwner) return null;

  return (
    <a
      href={`/recipes/${recipeId}/edit`}
      className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
    >
      Edit Recipe
    </a>
  );
}