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
            <div className="min-h-full w-full my-auto p-4">
                <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">❓Частые вопросы</h2>
                <section className='flex flex-col gap-2 w-full'>
                    {
                        questions.map((question, index) => (
                            <div className="flex flex-row items-start justify-center gap-4" key={index}>
                                <Image
                                    src={getPictureUrl('questionImage.png') || '/questionImage.png'}
                                    alt="Знак вопроса"
                                    width={150}
                                    height={150}
                                    className="object-cover rounded-lg"
                                />
                                <section className='flex flex-col gap-2'>
                                    <span className="text-2xl font-bold text-black">
                                        {question.question}
                                    </span>
                                    <p className="text-lg text-slate-700 w-full font-semibold">
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