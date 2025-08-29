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
            <div className="min-h-screen min-w-screen bg-[#f9ecb8] flex flex-col" style={{ padding: 'env(--safe-area-top, 20px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
                <h1 className="text-2xl font-extrabold uppercase text-black text-center leading-tight px-2">
                    ❓Частые<br />вопросы
                </h1>
                <section className='flex flex-col gap-1 w-full'>
                    {
                        questions.map((question, index) => (
                            <div className="flex flex-row items-start justify-center gap-1" key={index}>
                                <Image
                                    src={getPictureUrl('questionImage.png') || '/questionImage.png'}
                                    alt="Знак вопроса"
                                    width={150}
                                    height={150}
                                    className="object-cover rounded-lg"
                                />
                                <section className='flex flex-col gap-1'>
                                    <span className="text-xl font-bold text-black">
                                        {question.question}
                                    </span>
                                    <p className="text-sm text-slate-700 w-full font-semibold">
                                        {question.answer}
                                    </p>
                                </section>
                            </div>
                        ))
                    }
                </section>
            </div>
        </Page>
    );
}

export default QuestionsPage