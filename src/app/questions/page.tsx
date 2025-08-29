import { Page } from '@/components/Page';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

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
]

const QuestionsPage = () => {
    return (
        <Page back={true}>
            <div className="min-h-screen min-w-screen bg-gradient-to-b from-white to-gray-50 flex flex-col" style={{ padding: 'env(--safe-area-top, 20px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
                <div className="w-full max-w-md mx-auto text-center space-y-4 px-6 pt-20">
                    <h1 className="text-3xl font-semibold text-gray-900 text-center leading-tight tracking-tight">
                        ❓ Частые вопросы
                    </h1>
                    <section className='flex flex-col gap-3 w-full'>
                        {
                            questions.map((question, index) => (
                                <div className="flex flex-row items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm" key={index}>
                                    <Image
                                        src={getPictureUrl('questionImage.png') || '/questionImage.png'}
                                        alt="Знак вопроса"
                                        width={80}
                                        height={80}
                                        className="object-cover rounded-lg flex-shrink-0"
                                    />
                                    <section className='flex flex-col gap-1 flex-1'>
                                        <span className="text-base font-semibold text-gray-900 text-left">
                                            {question.question}
                                        </span>
                                        <p className="text-xs text-gray-600 w-full font-medium text-left leading-relaxed">
                                            {question.answer}
                                        </p>
                                    </section>
                                </div>
                            ))
                        }
                    </section>
                </div>
            </div>
        </Page>
    );
}

export default QuestionsPage