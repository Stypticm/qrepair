'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "Как быстро можно получить деньги?",
        answer: "Сразу после оценки и проверки устройства. Обычно весь процесс занимает не более 15-20 минут."
    },
    {
        question: "Меняется ли цена на выкуп устройства после приезда специалиста?",
        answer: "Цена фиксируется при предварительной оценке, если состояние устройства соответствует заявленному. Мы не торгуемся на месте без объективных причин."
    },
    {
        question: "Нужно ли для продажи прикладывать чек?",
        answer: "Наличие чека желательно, так как это может повысить оценочную стоимость, но не является обязательным условием для выкупа."
    },
    {
        question: "Нужно ли прикладывать коробку, кабель, зарядку?",
        answer: "Полный комплект (коробка, оригинальные аксессуары) увеличивает стоимость выкупа. Однако мы покупаем устройства и без комплекта."
    },
    {
        question: "Мне надо куда-то приехать или вы сами ко мне?",
        answer: "Вы можете приехать к нам в офис на Горбушке или заказать выезд курьера/специалиста в удобное для вас место."
    },
    {
        question: "Можно ли договориться о встрече со специалистом в нейтральном месте?",
        answer: "Да, конечно. Мы можем встретиться в кафе, торговом центре или любом другом удобном и безопасном месте."
    },
    {
        question: "Нужно ли удалить информацию со старого iPhone или MacBook?",
        answer: "Желательно отвязать устройство от iCloud и сбросить настройки. Если вы не знаете как это сделать, наш специалист поможет вам на месте."
    },
    {
        question: "Как быстро вы приезжаете?",
        answer: "В пределах МКАД мы стараемся приезжать в течение 2-3 часов после подтверждения заявки, либо в любое другое заранее оговоренное время."
    },
    {
        question: "В каких городах вы работаете?",
        answer: "В данный момент мы работаем преимущественно по Москве и Московской области. Возможна работа с регионами через доставку (обсуждается индивидуально)."
    },
    {
        question: "Кто осуществляет выкуп?",
        answer: "Выкуп осуществляют квалифицированные специалисты нашего сервиса QOQOS, которые на месте проверяют устройство и производят расчет."
    }
];

export const FAQAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row gap-12">

                {/* Заголовок */}
                <div className="md:w-1/3">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                        Вопросы<br />и ответы
                    </h2>
                </div>

                {/* Список вопросов */}
                <div className="md:w-2/3 space-y-2">
                    {FAQ_ITEMS.map((item, index) => (
                        <div key={index} className="border-b border-gray-200 last:border-0">
                            <button
                                onClick={() => toggleItem(index)}
                                className={`w-full py-6 flex items-start justify-between text-left group transition-colors duration-200 ${openIndex === index ? 'bg-teal-50/50 -mx-4 px-4 rounded-lg' : ''
                                    }`}
                            >
                                <span className="text-lg font-medium text-gray-900 group-hover:text-teal-600 transition-colors pr-8">
                                    {item.question}
                                </span>
                                <span className={`flex-shrink-0 transition-transform duration-300 transform ${openIndex === index ? 'rotate-45' : 'rotate-0'
                                    }`}>
                                    <Plus className={`w-6 h-6 ${openIndex === index ? 'text-teal-600' : 'text-teal-300'
                                        }`} />
                                </span>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`pb-6 text-gray-600 leading-relaxed ${openIndex === index ? 'px-4' : ''}`}>
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
