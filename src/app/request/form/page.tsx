'use client'

import { useEffect, useState } from 'react'
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
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
        <Page back={true}>
            <div className="w-full flex flex-col items-center justify-center">
                <Select value={localModel} onValueChange={handleModelChange}>
                    <SelectTrigger className="border-2 border-gray-300 bg-white !text-black w-full">
                        <SelectValue placeholder="Выберите модель" className="!text-black" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-300 shadow-lg rounded-lg">
                        <SelectGroup>
                            {
                                Object.entries(deviceCatalog).map(([key, value]) => (
                                    <SelectItem key={key} value={key} className="hover:bg-gray-100 text-black">
                                        {value.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </Page>
    );
}

