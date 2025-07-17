import { supabase } from './supabase';

export const deleteImageFromSupabase = async (imageUrl: string) => {
  const fileName = imageUrl.split('/').pop();

  const { error } = await supabase.storage.from('items').remove([fileName!]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};
