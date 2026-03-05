'use client';

import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FiltersProps {
    onFilterChange?: (filters: FilterState) => void;
    className?: string;
}

export interface FilterState {
    priceRange: [number, number];
    brands: string[];
    conditions: string[];
    inStock: boolean;
}

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Sony', 'Asus'];
const CONDITIONS = ['Новый', 'Как новый', 'Отличное', 'Хорошее', 'Удовлетворительное'];

export const Filters = ({ onFilterChange, className }: FiltersProps) => {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [inStock, setInStock] = useState(false);

    const handleBrandToggle = (brand: string) => {
        const updated = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];
        setSelectedBrands(updated);
        onFilterChange?.({ priceRange, brands: updated, conditions: selectedConditions, inStock });
    };

    const handleConditionToggle = (condition: string) => {
        const updated = selectedConditions.includes(condition)
            ? selectedConditions.filter(c => c !== condition)
            : [...selectedConditions, condition];
        setSelectedConditions(updated);
        onFilterChange?.({ priceRange, brands: selectedBrands, conditions: updated, inStock });
    };

    const handlePriceChange = (value: number[]) => {
        const range: [number, number] = [value[0], value[1]];
        setPriceRange(range);
        onFilterChange?.({ priceRange: range, brands: selectedBrands, conditions: selectedConditions, inStock });
    };

    const resetFilters = () => {
        setPriceRange([0, 200000]);
        setSelectedBrands([]);
        setSelectedConditions([]);
        setInStock(false);
        onFilterChange?.({ priceRange: [0, 200000], brands: [], conditions: [], inStock: false });
    };

    const hasActiveFilters = selectedBrands.length > 0 || selectedConditions.length > 0 || inStock || priceRange[0] > 0 || priceRange[1] < 200000;

    return (
        <aside className={cn("bg-white", className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Фильтры</h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-gray-500 hover:text-teal-600">
                        <X className="w-3 h-3 mr-1" />
                        Сбросить
                    </Button>
                )}
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <Label className="text-sm font-bold text-gray-900 mb-3 block">Цена</Label>
                <div className="px-2">
                    <Slider
                        min={0}
                        max={200000}
                        step={1000}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{priceRange[0].toLocaleString()} ₽</span>
                        <span>{priceRange[1].toLocaleString()} ₽</span>
                    </div>
                </div>
            </div>

            {/* Brands */}
            <div className="mb-8">
                <Label className="text-sm font-bold text-gray-900 mb-3 block">Бренд</Label>
                <div className="space-y-3">
                    {BRANDS.map((brand) => (
                        <div key={brand} className="flex items-center">
                            <Checkbox
                                id={`brand-${brand}`}
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={() => handleBrandToggle(brand)}
                            />
                            <label
                                htmlFor={`brand-${brand}`}
                                className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                            >
                                {brand}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Condition */}
            <div className="mb-8">
                <Label className="text-sm font-bold text-gray-900 mb-3 block">Состояние</Label>
                <div className="space-y-3">
                    {CONDITIONS.map((condition) => (
                        <div key={condition} className="flex items-center">
                            <Checkbox
                                id={`condition-${condition}`}
                                checked={selectedConditions.includes(condition)}
                                onCheckedChange={() => handleConditionToggle(condition)}
                            />
                            <label
                                htmlFor={`condition-${condition}`}
                                className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                            >
                                {condition}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* In Stock */}
            <div className="mb-8">
                <div className="flex items-center">
                    <Checkbox
                        id="in-stock"
                        checked={inStock}
                        onCheckedChange={(checked) => {
                            setInStock(!!checked);
                            onFilterChange?.({ priceRange, brands: selectedBrands, conditions: selectedConditions, inStock: !!checked });
                        }}
                    />
                    <label
                        htmlFor="in-stock"
                        className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
                    >
                        Только в наличии
                    </label>
                </div>
            </div>
        </aside>
    );
};
