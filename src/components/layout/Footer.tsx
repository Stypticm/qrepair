'use client';

import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Point {
    id: number;
    name: string;
    address: string;
    workingHours: string;
}

export const Footer = () => {
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

    // Generate OpenStreetMap search URL for address
    const getMapUrl = (address: string) => {
        // Use OSM search directly - it will find and center on the address
        const query = encodeURIComponent(address);
        return `https://www.openstreetmap.org/search?query=${query}#map=16`;
    };

    return (
        <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100">
            <div className="container mx-auto px-4">

                {/* Location Section - CordStore style */}
                {/* Location Section - CordStore style */}
                <div className="bg-white rounded-apple-xl p-8 mb-16 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8 relative">
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

                    {/* Interactive Map - OpenStreetMap (Blurred/Coming Soon) */}
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

                {/* Footer Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-t border-gray-200 pt-12">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Каталог</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/catalog" className="hover:text-teal-600">Смартфоны</Link></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Планшеты</span></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Ноутбуки</span></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Гаджеты</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Покупателям</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-teal-600">Доставка и оплата</Link></li>
                            <li><Link href="#" className="hover:text-teal-600">Гарантия</Link></li>
                            <li><Link href="#" className="hover:text-teal-600">Возврат</Link></li>
                            <li><Link href="#" className="hover:text-teal-600">Кредит</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Компания</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-teal-600">О нас</Link></li>
                            <li><Link href="/help" className="hover:text-teal-600">Помощь</Link></li>
                            <li><span className="text-gray-400 cursor-not-allowed">Блог</span></li>
                            <li><Link href="#" className="hover:text-teal-600">Вакансии</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Подписка</h4>
                        <p className="text-sm text-gray-500 mb-4">Узнавайте о новинках и скидках первыми</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="bg-white border text-sm border-gray-200 rounded-lg px-3 py-2 w-full outline-teal-500" />
                            <Button size="icon" className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg shrink-0">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 text-xs text-gray-400">
                    <p>&copy; 2025 QOQOS. Все права защищены.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#">Политика конфиденциальности</Link>
                        <Link href="#">Публичная оферта</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
