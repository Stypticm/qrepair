import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-12 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Помощь</h1>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">Как оформить заказ?</h3>
                                    <p className="text-gray-600">Выберите товар, добавьте в корзину и следуйте инструкциям на странице оформления заказа.</p>
                                </div>

                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">Какие способы оплаты доступны?</h3>
                                    <p className="text-gray-600">Мы принимаем оплату наличными при получении и банковскими картами онлайн.</p>
                                </div>

                                <div className="bg-gray-50 rounded-apple-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-2">Как долго доставка?</h3>
                                    <p className="text-gray-600">Доставка по Москве занимает 1-2 дня. Самовывоз доступен в день заказа.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Контакты</h2>
                            <div className="bg-gray-50 rounded-apple-lg p-6">
                                <p className="text-gray-600 mb-2"><strong>Телефон:</strong> +7 (999) 888-77-66</p>
                                <p className="text-gray-600"><strong>Email:</strong> support@qoqos.ru</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
