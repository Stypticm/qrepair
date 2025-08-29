import { Page } from '@/components/Page';
import React from 'react';

const LearnMore = () => {
    const questions = [
        {
            id: 0,
            question: 'Какие модели можно сдать?',
            answer: 'Выкупаем большинство популярных моделей смартфонов. Конкретную модель можно выбрать в форме заявки.'
        },
        {
            id: 1,
            question: 'Не работает экран, это проблема?',
            answer: 'Это не помешает выкупу. Мы работаем с неисправными и сломанными телефонами.'
        },
        {
            id: 2,
            question: 'Как проходит оценка?',
            answer: 'Мы оцениваем телефон онлайн по предоставленным данным. Окончательно цена озвучивается после встречи.'
        },
        {
            id: 3,
            question: 'Где осуществляется выкуп?',
            answer: 'В пределах Москвы. Соглсовать точное место можно при оформлении заявки.'
        }
    ];

    return (
        <Page back={true}>
            <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
                <div className="flex-1 p-6" style={{ paddingTop: 'env(--safe-area-top, 60px)' }}>
                    <div className="w-full max-w-md mx-auto space-y-8">
                        {/* Как это работает */}
                        <div className="text-center mt-12">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                                Как это работает
                            </h1>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-blue-600 text-sm">⚡</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Быстро</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-green-600 text-sm">💰</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Выгодно</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-purple-600 text-sm">🚚</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Удобно</p>
                                </div>
                            </div>
                        </div>

                        {/* Частые вопросы */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
                                Частые вопросы
                            </h2>
                            <div className="space-y-3">
                                {questions.map((question, index) => (
                                    <div className="p-3 bg-white rounded-xl border border-gray-100" key={index}>
                                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                                            {question.question}
                                        </h3>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {question.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default LearnMore;