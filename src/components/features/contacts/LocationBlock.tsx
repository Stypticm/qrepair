'use client';

import { MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Point {
    id: number;
    name: string;
    address: string;
    workingHours: string;
}

export const LocationBlock = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const response = await fetch('/api/points');
                const data = await response.json();
                if (data.success && data.points) {
                    setPoints(data.points);
                    if (data.points.length > 0) {
                        setSelectedPoint(data.points[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading points:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, []);

    const getMapUrl = (address: string) => {
        const query = encodeURIComponent(address);
        return `https://www.openstreetmap.org/search?query=${query}#map=16`;
    };

    return (
        <div className="bg-white rounded-apple-xl p-8 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8 relative">
            <div className="lg:w-1/3 flex flex-col gap-6">
                <h3 className="text-2xl font-bold text-gray-900">Адреса магазинов</h3>

                {loading ? (
                    <div className="text-gray-500 text-sm">Загрузка...</div>
                ) : points.length > 0 ? (
                    points.map((point) => (
                        <button
                            key={point.id}
                            onClick={() => setSelectedPoint(point)}
                            className={`flex gap-4 items-start border-t border-gray-100 first:border-t-0 pt-6 first:pt-0 text-left transition-all hover:bg-gray-50 -mx-2 px-2 rounded-lg ${selectedPoint?.id === point.id ? 'bg-teal-50 hover:bg-teal-50' : ''
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedPoint?.id === point.id ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-600'
                                }`}>
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-1">{point.name}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {point.address}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{point.workingHours}</span>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 mb-1">Горбушка</p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                г. Москва, ул. Барклая, д. 8<br />
                                ТЦ &quot;Горбушка&quot;, 1-й этаж, пав. 123
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span>10:00 - 21:00</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Map */}
            <div className="lg:w-2/3 bg-gray-200 rounded-apple-lg overflow-hidden relative min-h-[300px] lg:min-h-[500px]">
                {/* Blur overlay with "Скоро" label */}
                <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-gray-900 text-white px-8 py-4 rounded-apple-lg shadow-2xl">
                        <p className="text-2xl font-bold">Скоро</p>
                    </div>
                </div>

                {selectedPoint ? (
                    <iframe
                        src={getMapUrl(selectedPoint.address)}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '300px' }}
                        allowFullScreen
                        loading="lazy"
                        title={`Карта: ${selectedPoint.name}`}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-100">
                        <span className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Выберите адрес для отображения на карте
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
