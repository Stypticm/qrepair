'use client'

import { useEffect, useState } from 'react'
import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

// Новая структура дефектов в стиле комикса с картинками
const deviceDefects = [
    {
        id: '1',
        category: 'Экран',
        defect: 'Царапины на экране',
        description: 'Видимые следы на стекле дисплея',
        instruction: 'Осмотрите экран при ярком свете. Мелкие царапины едва видны, средние заметны, тяжёлые — глубокие борозды.',
        icon: '📱',
        image: 'screen-scratches.png', // Картинка царапин на экране
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '2',
        category: 'Экран',
        defect: 'Трещины на экране',
        description: 'Разбитое стекло или трещины на дисплее',
        instruction: 'Проверьте экран на трещины. Волосные — лёгкие, паутина — средние, полностью разбитый — тяжёлый.',
        icon: '💥',
        image: 'screen-cracks.png', // Картинка трещин на экране
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '3',
        category: 'Корпус',
        defect: 'Царапины или сколы на корпусе',
        description: 'Потёртости или вмятины на задней панели/боках',
        instruction: 'Осмотрите корпус. Лёгкие потёртости — едва заметны, средние — видны, тяжёлые — глубокие вмятины.',
        icon: '🔧',
        image: 'body-scratches.png', // Картинка царапин на корпусе
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '4',
        category: 'Корпус',
        defect: 'Повреждение заднего стекла',
        description: 'Трещины на задней панели',
        instruction: 'Проверьте заднее стекло. Мелкие трещины — лёгкие, средние — заметные разломы, тяжёлые — разбитое.',
        icon: '🪟',
        image: 'back-glass-damage.png', // Картинка повреждения заднего стекла
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '5',
        category: 'Кнопки',
        defect: 'Следы износа кнопок',
        description: 'Потёртости на кнопках (громкость, питание)',
        instruction: 'Нажмите кнопки. Лёгкий износ — слегка стёрты, средний — заметно, тяжёлый — сильно стёрты.',
        icon: '🔘',
        image: 'button-wear.png', // Картинка износа кнопок
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '6',
        category: 'Камера',
        defect: 'Повреждение камеры (внешнее)',
        description: 'Царапины на стекле камеры',
        instruction: 'Осмотрите стекло камеры. Мелкие царапины — лёгкие, заметные дефекты — средние, трещины — тяжёлые.',
        icon: '📷',
        image: 'camera-damage.png', // Картинка повреждения камеры
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '7',
        category: 'Экран',
        defect: 'Пятна или выгорание на экране',
        description: 'Видимые пятна или зоны выгорания',
        instruction: 'Включите белый фон (например, в браузере). Лёгкие пятна — едва видны, средние — заметны, тяжёлые — крупные.',
        icon: '🎨',
        image: 'screen-burn-in.png', // Картинка выгорания экрана
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '8',
        category: 'Корпус',
        defect: 'Наличие наклеек или следов клея',
        description: 'Остатки наклеек на корпусе',
        instruction: 'Проверьте корпус на наклейки. Лёгкие — мелкие следы, средние — заметные, тяжёлые — обширные.',
        icon: '🏷️',
        image: 'sticker-residue.png', // Картинка следов наклеек
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '9',
        category: 'Порты',
        defect: 'Повреждение порта зарядки (внешнее)',
        description: 'Износ или загрязнение разъёма',
        instruction: 'Осмотрите порт зарядки. Лёгкое загрязнение — мелкие следы, средний износ — заметный, тяжёлый — вмятины.',
        icon: '🔌',
        image: 'charging-port-damage.png', // Картинка повреждения порта зарядки
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '10',
        category: 'Порты',
        defect: 'Следы воды или коррозии (видимые)',
        description: 'Пятна коррозии на портах',
        instruction: 'Проверьте порт зарядки и лоток SIM. Лёгкие пятна — едва видны, средние — заметны, тяжёлые — обширные.',
        icon: '💧',
        image: 'water-damage.png', // Картинка следов воды
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '11',
        category: 'Корпус',
        defect: 'Деформация корпуса',
        description: 'Изгиб корпуса',
        instruction: 'Положите телефон на ровную поверхность. Лёгкий изгиб — едва заметен, средний — виден, тяжёлый — сильный.',
        icon: '📐',
        image: 'body-deformation.png', // Картинка деформации корпуса
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '12',
        category: 'Корпус',
        defect: 'Потёртости логотипа Apple',
        description: 'Износ логотипа',
        instruction: 'Осмотрите логотип. Лёгкий износ — едва заметен, средний — частично стёрт, тяжёлый — полностью стёрт.',
        icon: '🍎',
        image: 'logo-wear.png', // Картинка износа логотипа
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '13',
        category: 'Функциональность',
        defect: 'Неисправность микрофона/динамика (заметная)',
        description: 'Хрипение или плохой звук',
        instruction: 'Протестируйте звонок или музыку. Лёгкий хрип — едва слышен, средний — заметен, тяжёлый — полное отсутствие.',
        icon: '🔊',
        image: 'speaker-damage.png', // Картинка повреждения динамика
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    },
    {
        id: '14',
        category: 'Батарея',
        defect: 'Состояние батареи',
        description: 'Износ батареи',
        instruction: 'Откройте Настройки → Батарея → Состояние батареи. Максимальная ёмкость: >90% — отсутствует, 85–90% — лёгкий, 80–85% — средний, <80% — тяжёлый.',
        icon: '🔋',
        image: 'battery-health.png', // Картинка состояния батареи
        levels: [
            { value: '0', label: 'Отсутствует', penalty: 0, color: 'bg-green-100 text-green-800' },
            { value: '1', label: 'Лёгкий', penalty: 5, color: 'bg-yellow-100 text-yellow-800' },
            { value: '2', label: 'Средний', penalty: 15, color: 'bg-orange-100 text-orange-800' },
            { value: '3', label: 'Тяжёлый', penalty: 30, color: 'bg-red-100 text-red-800' }
        ]
    }
];

const QuestionsPage = () => {
    const { telegramId, answers, setAnswers, setShowQuestionsSuccess, comment, setComment } = useStartForm();
    const [localAnswers, setLocalAnswers] = useState<string[]>(
        Array.isArray(answers) && answers.length === 14 ? answers.map(String) : new Array(14).fill('')
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
                    // Конвертируем старые ответы в новый формат
                    const oldAnswers = data.draft.answers;
                    const newAnswers = new Array(14).fill('');
                    
                    // Маппинг старых ответов на новые (если есть)
                    if (oldAnswers.length === 8) {
                        // Конвертируем старые да/нет ответы в новые уровни
                        const mapping = [0, 0, 0, 0, 0, 0, 0, 0]; // По умолчанию все отсутствуют
                        oldAnswers.forEach((answer: number, index: number) => {
                            if (answer === 1) {
                                mapping[index] = 2; // Средний уровень для старых "да" ответов
                            }
                        });
                        // Применяем маппинг к соответствующим дефектам
                        // Это упрощенная логика, можно доработать
                        setLocalAnswers(mapping.map(String));
                    } else {
                        setLocalAnswers(data.draft.answers.map(String));
                    }
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

    const handleSelect = (defectId: string, value: string) => {
        const index = parseInt(defectId) - 1;
        const updated = [...localAnswers];
        updated[index] = value;
        
        setHasEdited(true);
        setLocalAnswers(updated);
        setAnswers(updated.map(Number));
    };

    const handleNext = async () => {
        if (!telegramId) return;
        const allAnswered = localAnswers.every((v) => v !== '');
        if (!allAnswered) return;
        
        const res = await fetch('/api/questions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                telegramId, 
                answers: localAnswers.map(Number), 
                questionsAnswered: true, 
                comment 
            }),
        });
        const data = await res.json();
        setShowQuestionsSuccess(true);
    };

    const calculateTotalPenalty = () => {
        return localAnswers.reduce((total, answer, index) => {
            if (answer === '') return total;
            const defect = deviceDefects[index];
            const level = defect.levels.find(l => l.value === answer);
            return total + (level?.penalty || 0);
        }, 0);
    };

    const getAnsweredCount = () => {
        return localAnswers.filter(answer => answer !== '').length;
    };

    const totalPenalty = calculateTotalPenalty();
    const answeredCount = getAnsweredCount();
    const maxPenalty = Math.min(totalPenalty, 80);

    return (
        <Page back={true}>
            <section className="w-full flex flex-col gap-4 p-3">
                <h2 className="w-full text-3xl text-center font-extrabold uppercase text-black flex justify-center items-center">
                    📱 Оценка состояния устройства
                </h2>

                {loading ? (
                    <div className="text-center text-lg font-semibold">Загрузка...</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {deviceDefects.map((defect) => (
                            <Card key={defect.id} className="border-2 border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gray-50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">{defect.icon}</span>
                                            {/* Картинка дефекта */}
                                            <div className="w-24 h-24 relative rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                                                <Image
                                                    src={getPictureUrl(defect.image) || `/defects/${defect.image}`}
                                                    alt={`${defect.defect} - пример`}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        // Fallback если картинка не загрузилась
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs font-bold bg-white">
                                                    {defect.category}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl text-black">{defect.defect}</CardTitle>
                                            <CardDescription className="text-gray-600 mt-1">
                                                {defect.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                    {/* Выбор уровня дефекта */}
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                                            Выберите уровень повреждения:
                                        </Label>
                                        <RadioGroup
                                            value={localAnswers[parseInt(defect.id) - 1]}
                                            onValueChange={(value) => handleSelect(defect.id, value)}
                                            className="grid grid-cols-2 gap-3"
                                        >
                                            {defect.levels.map((level) => (
                                                <div key={level.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={level.value} id={`${defect.id}-${level.value}`} />
                                                    <Label 
                                                        htmlFor={`${defect.id}-${level.value}`}
                                                        className={cn(
                                                            "flex-1 p-3 rounded-lg border cursor-pointer text-center text-sm font-medium transition-all duration-200 hover:scale-105",
                                                            localAnswers[parseInt(defect.id) - 1] === level.value
                                                                ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        <div className={cn("text-xs px-3 py-1 rounded-full mb-2 font-bold", level.color)}>
                                                            {level.label}
                                                        </div>
                                                        <div className="text-xl font-bold text-gray-800">
                                                            {level.penalty > 0 ? `-${level.penalty}%` : '0%'}
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Комментарий */}
                        <Card className="border-2 border-gray-300 bg-gray-50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-black">Комментарий (не обязательно)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="comment"
                                    placeholder="Дополнительная информация о состоянии устройства..."
                                    className="!border-slate-700 border-3 text-black font-bold h-24 resize-none bg-white"
                                    value={comment || ''}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
                
                {/* Кнопка подтверждения */}
                {
                    (() => {
                        const allAnswered = localAnswers.every((v) => v !== '');
                        const canSubmit = !loading && allAnswered;
                        return (
                            <FooterButton 
                                nextPath="/request/form" 
                                isNextDisabled={!canSubmit} 
                                onNext={handleNext} 
                            />
                        )
                    })()
                }
            </section>
        </Page>
    );
};

export default QuestionsPage;
