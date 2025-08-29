import { supabase } from './supabase';

export const deleteImageFromSupabase = async (imageUrl: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('master-photos')
      .remove([imageUrl]);

    if (error) {
      console.error('Error deleting image:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
