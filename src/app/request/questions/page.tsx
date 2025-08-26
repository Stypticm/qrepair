'use client'

import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Textarea } from '@/components/ui/textarea'

const questions = [
    { id: '1', text: 'Дисплей треснул или разбит?', category: 'Экран', weight: 35 },
    { id: '2', text: 'Есть серьезные повреждения LCD/сенсора?', category: 'Экран', weight: 30 },
    { id: '3', text: 'На дисплее есть мертвые пиксели или выгорание?', category: 'Экран', weight: 25 },
    { id: '4', text: 'Есть сильные царапины или сколы на дисплее?', category: 'Экран', weight: 20 },
    { id: '5', text: 'Есть легкие царапины на стекле?', category: 'Экран', weight: 15 },
    { id: '6', text: 'Не работает TrueTone?', category: 'Экран', weight: 8 },
    { id: '7', text: 'Сенсор неотзывчивый или есть фантомные касания?', category: 'Экран', weight: 20 },
    { id: '8', text: 'Устройство включается и работает стабильно?', category: 'Функциональность', weight: 15 },
]


const QuestionsPage = () => {
    const { telegramId, answers, setAnswers, setShowQuestionsSuccess, comment, setComment } = useStartForm();
    const [localAnswers, setLocalAnswers] = useState<number[]>(
        Array.isArray(answers) && answers.length === 8 ? answers : new Array(8).fill(-1)
    );
    const [loading, setLoading] = useState(true);
    const [hasEdited, setHasEdited] = useState(false);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await fetch(`/api/questions?telegramId=${telegramId}`);
                if (!res.ok) {
                    console.error("Fetch error:", res.status, await res.text());
                    return;
                }
                const data = await res.json();
                if (data?.draft?.answers && !hasEdited) {
                    setLocalAnswers(data.draft.answers);
                    setAnswers(data.draft.answers);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (telegramId) getData();
    }, [telegramId, setAnswers, hasEdited]);

    const handleSelect = (id: string, value: boolean) => {
        // Разрешаем отвечать сразу, даже пока идёт загрузка
        const index = parseInt(id) - 1;
        const updated = [...localAnswers];
        
        // Для последнего вопроса (функциональность) логика обратная:
        // "Да" = работает хорошо = нет штрафа
        if (id === '8') {
            updated[index] = value ? 0 : 1; // 0 = хорошо, 1 = плохо
        } else {
            updated[index] = value ? 1 : 0; // 1 = есть дефект, 0 = нет дефекта
        }
        
        setHasEdited(true);
        setLocalAnswers(updated);
        setAnswers(updated);
    };

    const handleNext = async () => {
        if (!telegramId) return;
        const allAnswered = localAnswers.every((v) => v === 0 || v === 1)
        if (!allAnswered) return;
        const res = await fetch('/api/questions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, answers: localAnswers, questionsAnswered: true, comment }),
        });
        const data = await res.json();
        setShowQuestionsSuccess(true);
    };

    return (
        <Page back={true}>
            <section className="w-full flex flex-col gap-4">
                <h2 className="w-full text-3xl font-extrabold uppercase text-black flex justify-center items-center">
                    ❓вопросы
                </h2>

                {loading ? (
                    <div className="text-center text-lg font-semibold">Загрузка вопросов...</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {questions.map((q) => (
                            <div key={q.id} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {q.category}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                            -{q.weight}%
                                        </Badge>
                                    </div>
                                </div>
                                <Label htmlFor={q.id} className="text-black text-lg font-bold">
                                    {q.text}
                                </Label>
                                <div className="flex gap-3 mt-2">
                                    <Button
                                        className={cn(
                                            'flex-1 py-2 rounded-lg font-semibold border',
                                            (q.id === '8' ? localAnswers[parseInt(q.id) - 1] === 0 : localAnswers[parseInt(q.id) - 1] === 1)
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'bg-white text-green-500 border-green-500'
                                        )}
                                        onClick={() => handleSelect(q.id, true)}
                                    >
                                        {q.id === '8' ? 'Да, работает' : 'Да, есть'}
                                    </Button>
                                    <Button
                                        className={cn(
                                            'flex-1 py-2 rounded-lg font-semibold border',
                                            (q.id === '8' ? localAnswers[parseInt(q.id) - 1] === 1 : localAnswers[parseInt(q.id) - 1] === 0)
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-white text-red-500 border-red-500'
                                        )}
                                        onClick={() => handleSelect(q.id, false)}
                                    >
                                        {q.id === '8' ? 'Нет, не работает' : 'Нет'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="comment" className="text-black text-xl font-bold">Комментарий (не обязательно)</Label>
                            <Textarea
                                id="comment"
                                placeholder="Комментарий мастеру"
                                className="!border-slate-700 border-3 text-black font-bold h-24"
                                value={comment || ''}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                
                {/* Информация о расчете цены */}
                <div className="text-center text-sm text-gray-600 mt-6 p-3 bg-blue-50 rounded-lg">
                    <p className="font-semibold">💡 Как рассчитывается цена:</p>
                    <p>За каждый дефект снимается указанный процент от базовой цены</p>
                    <p>Максимальный штраф: 80% (минимальная цена: 20% от базовой)</p>
                    {(() => {
                        const answeredQuestions = localAnswers.filter(v => v === 0 || v === 1).length;
                        if (answeredQuestions > 0) {
                            const currentPenalty = localAnswers.reduce((sum, val, i) => {
                                if (val === 1) {
                                    if (i === 7) return sum + 15; // Последний вопрос
                                    return sum + [35, 30, 25, 20, 15, 8, 20, 15][i];
                                }
                                return sum;
                            }, 0);
                            const maxPenalty = Math.min(currentPenalty, 80);
                            return (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border">
                                    <p className="font-semibold text-yellow-800">
                                        Текущий штраф: {maxPenalty}%
                                    </p>
                                    <p className="text-yellow-700">
                                        Ответили на {answeredQuestions}/8 вопросов
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
                
                {
                    (() => {
                        const allAnswered = localAnswers.every((v) => v === 0 || v === 1)
                        const canSubmit = !loading && allAnswered
                        return (
                            <FooterButton nextPath="/request/form" isNextDisabled={canSubmit} onNext={handleNext} />
                        )
                    })()
                }
            </section>
        </Page>
    );
};

export default QuestionsPage;
