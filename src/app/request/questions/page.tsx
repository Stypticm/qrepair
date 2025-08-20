'use client'

import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Textarea } from '@/components/ui/textarea'

const questions = [
    { id: '1', text: 'Имеются ли глубокие царапины?' },
    { id: '2', text: 'Есть ли мелкие царапины?' },
    { id: '3', text: 'Устройство выглядит как новое?' },
    { id: '4', text: 'Есть ли повреждения?' },
    { id: '5', text: 'Остаточная ёмкость аккумулятора более 85%?' },
    { id: '6', text: 'Есть ли трещины, вмятины или сколы на устройстве?' },
    { id: '7', text: 'На дисплее есть битые пиксели, выгорания или пятна?' },
    { id: '8', text: 'Устройство включается и выключается?' },
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
        updated[index] = value ? 1 : 0;
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
                            <div key={q.id} className="flex items-center justify-between">
                                <Label htmlFor={q.id} className="text-black text-xl font-bold">
                                    {q.text}
                                </Label>
                                <div className="flex gap-3">
                                    <Button
                                        className={cn(
                                            'flex-1 py-2 rounded-lg font-semibold border',
                                            localAnswers[parseInt(q.id) - 1] === 1
                                                ? 'bg-green-500 text-white border-green-500'
                                                : 'bg-white text-green-500 border-green-500'
                                        )}
                                        onClick={() => handleSelect(q.id, true)}
                                    >
                                        Да
                                    </Button>
                                    <Button
                                        className={cn(
                                            'flex-1 py-2 rounded-lg font-semibold border',
                                            localAnswers[parseInt(q.id) - 1] === 0
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-white text-red-500 border-red-500'
                                        )}
                                        onClick={() => handleSelect(q.id, false)}
                                    >
                                        Нет
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
