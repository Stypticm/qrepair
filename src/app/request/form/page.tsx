'use client'

import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const deviceCatalog = {
    'Apple iPhone 11': { name: 'Apple iPhone 11', basePrice: 48000 },
    'Apple iPhone 12': { name: 'Apple iPhone 12', basePrice: 56000 },
    'Apple iPhone 13': { name: 'Apple iPhone 13', basePrice: 64000 },
    'Apple iPhone 14': { name: 'Apple iPhone 14', basePrice: 72000 },
    'Apple iPhone 15': { name: 'Apple iPhone 15', basePrice: 80000 },
} as const;

export default function FormPage() {
    const { modelname, setModel } = useStartForm();
    const [localModel, setLocalModel] = useState<string>(modelname || 'Apple iPhone 11');

    useEffect(() => {
        if (modelname) {
            setLocalModel(modelname);
        }
    }, [modelname]);

    const handleModelChange = (value: string) => {
        setLocalModel(value);
        setModel(value);
    };

    return (
        <div className="w-full">
            <div className="flex flex-col items-center justify-center w-full px-4">
                <div className="w-full max-w-md">
                    <Select value={localModel} onValueChange={handleModelChange}>
                        <SelectTrigger className="w-full !border-slate-700 border-3 !text-black">
                            <SelectValue className='!text-black' placeholder="Выберите модель" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999] bg-white border-2 border-gray-300 shadow-2xl rounded-lg">
                            <SelectGroup className='text-black'>
                                {
                                    Object.entries(deviceCatalog).map(([key, value]) => (
                                        <SelectItem key={key} value={key} className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">
                                            <span className='!text-black font-bold'>{value.name}</span>
                                        </SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

