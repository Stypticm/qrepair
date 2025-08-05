'use client';
export const dynamic = 'force-dynamic';

import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteImageFromSupabase } from '@/core/lib/deleteImageFromSupabase';
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase';
import { Page } from '@/components/Page';
import { X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Image from 'next/image';

const PhotosPage = () => {
  const { telegramId, photoUrls, setPhotoUrls } = useStartForm();

  const initialPhotos = photoUrls || new Array(6).fill(null);
  const [photos, setPhotos] = useState<(string | null)[]>(initialPhotos);

  const [uploading, setUploading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));

  const photoLabels = [
    {
      id: 0,
      text: 'спереди',
      pic: '/front.png'
    },
    {
      id: 1,
      text: 'сзади',
      pic: '/back.png'
    },
    {
      id: 2,
      text: 'сбоку',
      pic: '/right_side.png'
    },
  ];

  const isNextDisabled = photos.filter((photo) => photo !== null).length >= 3;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0] || null;
    if (!file || photos[index]) return;
    setUploading(true);

    try {
      const url = await uploadImageToSupabase(file);
      const newPhotos = [...photos];
      newPhotos[index] = url;
      setPhotos(newPhotos);
      setPhotoUrls(newPhotos);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };


  const deleteImage = async (index: number) => {
    if (!photoUrls[index]) return;

    setUploading(true);
    try {
      await deleteImageFromSupabase(photoUrls[index]);
      const newPhotos = [...photos];
      newPhotos[index] = null;
      setPhotos(newPhotos);
      setPhotoUrls(newPhotos);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    const payload = { telegramId, photoUrls: photos };
    const response = await fetch('/api/request/photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log('API response:', data);
  };

  return (
    <Page back={true}>
      <section className="h-full w-full flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold uppercase text-black flex justify-center items-center">
          📷 загрузите фото
        </h2>
        <span className="text-slate-700 text-lg font-bold text-center border-3 !border-slate-700 p-2 rounded-md">
          Загрузите минимум 3 фото: спереди, сзади и сбоку.
        </span>
        <div className="grid grid-cols-2 gap-4">
          {photoLabels.slice(0, 2).map((item, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="relative flex items-center justify-center">
                {photoUrls[index] ? (
                  <>
                    <Image
                      src={photoUrls[index]}
                      alt={`${item.text} фото`}
                      width={120}
                      height={120}
                      className="rounded-sm h-full w-full object-cover"
                    />
                    <X
                      className="text-red-600 cursor-pointer absolute top-1 right-1"
                      onClick={() => deleteImage(index)}
                    />
                  </>
                ) : (
                  <Input
                    type="file"
                    ref={el => { inputRefs.current[index] = el }}
                    onChange={e => handleFileChange(e, index)}
                    disabled={uploading}
                    className="hidden"
                  />
                )}
                {!photoUrls[index] && (
                  <Image
                    src={item.pic}
                    alt={item.text}
                    width={150}
                    height={150}
                    className="object-cover rounded-md cursor-pointer"
                    onClick={() => inputRefs.current[index]?.click()}
                  />
                )}
              </div>
              <Label htmlFor={`photo-${index}`} className='text-black font-bold text-xl flex justify-center items-center'>{item.text}</Label>
            </div>
          ))}
        </div>
        <div className="flex justify-center w-full">
          {photoLabels.slice(2).map((item, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="relative flex items-center justify-center">
                {photoUrls[index + 2] ? (
                  <>
                    <Image
                      src={photoUrls[2] || ''}
                      alt={`${item.text} фото`}
                      width={120}
                      height={120}
                      className="rounded-md w-full h-full object-cover flex justify-center items-center"
                    />
                    <X
                      className="text-red-600 cursor-pointer absolute top-1 right-1"
                      onClick={() => deleteImage(index + 2)}
                    />
                  </>
                ) : (
                  <Input
                    type="file"
                    ref={el => { inputRefs.current[2] = el }}
                    onChange={e => handleFileChange(e, 2)}
                    disabled={uploading}
                    className="hidden"
                  />
                )}
                {!photoUrls[index + 2] && (
                  <Image
                    src={item.pic}
                    alt={item.text}
                    width={200}
                    height={150}
                    className="object-cover rounded-md w-full cursor-pointer"
                    onClick={() => inputRefs.current[index + 2]?.click()}
                  />
                )}
              </div>
              <Label htmlFor={`photo-${index + 2}`} className='text-black font-bold text-xl flex justify-center items-center'>{item.text}</Label>
            </div>
          ))}
        </div>
          <FooterButton nextPath="/request/form" isNextDisabled={isNextDisabled} onNext={handleNext} />
      </section>
    </Page>
  );
};

export default PhotosPage;
