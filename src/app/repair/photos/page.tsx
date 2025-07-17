'use client';
export const dynamic = 'force-dynamic';

import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteImageFromSupabase } from '@/core/lib/deleteImageFromSupabase';
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase';
import { List } from '@telegram-apps/telegram-ui';
import { X } from 'lucide-react';
import React, { useRef, useState } from 'react';

const PhotosPage = () => {
  const { telegramId } = useStartForm();

  const [picture1, setPicture1] = useState<string | null>(null);
  const [picture2, setPicture2] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [noPhotos, setNoPhotos] = useState(false);

  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const isNextDisabled = !!picture1 || !!picture2 || noPhotos;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, num: number) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (num === 1 && picture1) return;
    if (num === 2 && picture2) return;

    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file);

      if (num === 1) {
        setPicture1(url);
      } else if (num === 2) {
        setPicture2(url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteImage = async (num: number) => {
    setUploading(true);
    try {
      if (num === 1) {
        await deleteImageFromSupabase(picture1 as string);
        setPicture1(null);
      } else if (num === 2) {
        await deleteImageFromSupabase(picture2 as string);
        setPicture2(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    const payload = { telegramId, picture1, picture2, noPhotos };

    await fetch('/api/repair/photos', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

  return (
    <List>
      <main className="h-full flex flex-col justify-between">
        <section className="flex flex-col gap-8">
          <h2 className="text-slate-700 text-3xl font-bold text-center">
            Добавьте если возможно фото поломки
          </h2>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="picture">Фото 1</Label>
            {picture1 ? (
              <section className="flex flex-row justify-start relative p-4">
                <img src={picture1} alt="Picture 1" className="max-h-12 rounded-sm" />
                <X className="text-red-600 cursor-pointer" onClick={() => deleteImage(1)} />
              </section>
            ) : (
              <Input
                id="picture1"
                type="file"
                ref={inputRef1}
                disabled={noPhotos}
                onChange={(e) => handleFileChange(e, 1)}
              />
            )}
          </div>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="picture">Фото 2</Label>
            {picture2 ? (
              <section className="flex flex-row justify-start relative p-4">
                <img src={picture2} alt="Picture 2" className="max-h-12 rounded-sm" />
                <X className="text-red-600 cursor-pointer" onClick={() => deleteImage(2)} />
              </section>
            ) : (
              <Input
                id="picture2"
                type="file"
                ref={inputRef2}
                disabled={noPhotos}
                onChange={(e) => handleFileChange(e, 2)}
              />
            )}
          </div>
          <div className="flex flex-row w-full max-w-sm items-center gap-3">
            <Checkbox
              id="noPhotos"
              checked={noPhotos}
              onCheckedChange={(checked) => {
                setNoPhotos(!!checked);
                if (checked) {
                  setPicture1(null);
                  setPicture2(null);
                  if (inputRef1.current?.value) {
                    inputRef1.current.value = '';
                  }
                  if (inputRef2.current?.value) {
                    inputRef2.current.value = '';
                  }
                }
              }}
            />
            <Label htmlFor="terms">Нет фото</Label>
          </div>
        </section>
        <FooterButton
          nextPath="/repair/summary"
          isNextDisabled={isNextDisabled || uploading}
          onNext={handleNext}
        />
      </main>
    </List>
  );
};

export default PhotosPage;
