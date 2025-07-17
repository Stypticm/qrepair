import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

export const uploadImageToSupabase = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage.from('items').upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('items').getPublicUrl(filePath);

  return publicUrl;
};
