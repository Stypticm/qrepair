import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-12 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">О компании</h1>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">QOQOS</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Мы — современный интернет-магазин электроники и гаджетов. Наша миссия — сделать технологии доступными для каждого.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                В нашем ассортименте представлены смартфоны, планшеты, ноутбуки, часы, наушники и аксессуары от ведущих мировых брендов.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Наши преимущества</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">✓ Оригинальная продукция</h3>
                                    <p className="text-gray-600 text-sm">Все товары сертифицированы и имеют официальную гарантию</p>
                                </div>

                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">✓ Быстрая доставка</h3>
                                    <p className="text-gray-600 text-sm">Доставка по Москве за 1-2 дня, самовывоз в день заказа</p>
                                </div>

                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">✓ Выгодные цены</h3>
                                    <p className="text-gray-600 text-sm">Конкурентные цены и регулярные акции</p>
                                </div>

                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">✓ Поддержка 24/7</h3>
                                    <p className="text-gray-600 text-sm">Наши специалисты всегда готовы помочь</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Контакты</h2>
                            <div className="bg-gray-50 rounded-apple-lg p-6">
                                <p className="text-gray-600 mb-2"><strong>Адрес:</strong> Москва, Горбушка</p>
                                <p className="text-gray-600 mb-2"><strong>Телефон:</strong> +7 (999) 888-77-66</p>
                                <p className="text-gray-600"><strong>Email:</strong> info@qoqos.ru</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
