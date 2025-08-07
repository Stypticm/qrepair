"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteImageFromSupabase } from "@/core/lib/deleteImageFromSupabase";
import { uploadImageToSupabase } from "@/core/lib/uploadImageToSupabase";

type PhotoLabel = {
  id: number;
  text: string;
  pic: string;
};

type Props = {
  photoUrls: (string | null)[];
  setPhotoUrls: (urls: (string | null)[]) => void;
  uploading: boolean;
  setUploading: (value: boolean) => void;
};

export default function UploadPhotos({
  photoUrls,
  setPhotoUrls,
  uploading,
  setUploading,
}: Props) {
  const inputRefs = useRef<(React.MutableRefObject<HTMLInputElement | null> | null)[]>(new Array(3).fill(null).map(() => useRef<HTMLInputElement | null>(null)));

  const photoLabels: PhotoLabel[] = [
    { id: 0, text: "спереди", pic: "/front.png" },
    { id: 1, text: "сзади", pic: "/back.png" },
    { id: 2, text: "сбоку", pic: "/right_side.png" },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0] || null;
    if (!file || photoUrls[index]) return;
    setUploading(true);

    try {
      const preview = URL.createObjectURL(file);
      const newPhotos = [...photoUrls];
      newPhotos[index] = preview;
      setPhotoUrls(newPhotos);

      const url = await uploadImageToSupabase(file);
      newPhotos[index] = url; // Заменяем на постоянную URL
      setPhotoUrls(newPhotos);
    } catch (error) {
      console.error(error);
      const newPhotos = [...photoUrls];
      newPhotos[index] = null; // Сбрасываем при ошибке
      setPhotoUrls(newPhotos);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteImage = async (index: number) => {
    if (!photoUrls[index]) return;

    setUploading(true);
    try {
      await deleteImageFromSupabase(photoUrls[index]!);
      const newPhotos = [...photoUrls];
      newPhotos[index] = null;
      setPhotoUrls(newPhotos);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
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
                  ref={inputRefs.current[index]}
                  onChange={(e) => handleFileChange(e, index)}
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
                  onClick={() => inputRefs.current[index]?.current?.click()}
                />
              )}
            </div>
            <Label htmlFor={`photo-${index}`} className="text-black font-bold text-xl flex justify-center items-center">
              {item.text}
            </Label>
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
                    src={photoUrls[2] || ""}
                    alt={`${item.text} фото`}
                    width={200}
                    height={150}
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
                  ref={inputRefs.current[index + 2]}
                  onChange={(e) => handleFileChange(e, 2)}
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
                  onClick={() => inputRefs.current[index + 2]?.current?.click()}
                />
              )}
            </div>
            <Label htmlFor={`photo-${index + 2}`} className="text-black font-bold text-xl flex justify-center items-center">
              {item.text}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
