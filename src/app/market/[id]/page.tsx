import { Page } from '@/components/Page';
import Image from 'next/image';
import { prisma } from '@/core/lib/prisma';
import { notFound } from 'next/navigation';
import { MarketItemClient } from './MarketItemClient';

interface MarketItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketItemPage({ params }: MarketItemPageProps) {
  const { id } = await params;

  // Получаем данные из БД
  const item = await prisma.skupka.findUnique({
    where: { id },
    select: {
      id: true,
      modelname: true,
      price: true,
      photoUrls: true,
      userEvaluation: true,
      comment: true,
      createdAt: true,
      status: true,
    },
  });

  if (!item || item.status !== 'paid') {
    notFound();
  }

  // Разбираем modelname на компоненты
  const modelParts = (item.modelname || '').split(' ');
  let model = '';
  let storage = '';
  let color = '';

  if (modelParts.length >= 3) {
    const gbIndex = modelParts.findIndex((part) => part.includes('GB'));
    if (gbIndex > 0) {
      model = modelParts.slice(0, gbIndex).join(' ');
      storage = modelParts[gbIndex];
      color = modelParts.slice(gbIndex + 1).join(' ');
    } else {
      model = modelParts.slice(0, 2).join(' ');
      color = modelParts.slice(2).join(' ');
    }
  } else {
    model = item.modelname || 'Модель не указана';
  }

  const coverImage =
    Array.isArray(item.photoUrls) && item.photoUrls.length > 0
      ? item.photoUrls[0]
      : '/logo3.png';

  return (
    <Page back={true}>
      <MarketItemClient
        id={item.id}
        title={item.modelname || 'Модель не указана'}
        price={item.price}
        coverImage={coverImage}
        photos={Array.isArray(item.photoUrls) ? item.photoUrls : []}
        model={model}
        storage={storage}
        color={color}
        condition={item.userEvaluation || 'Отличное'}
        description={item.comment}
      />
    </Page>
  );
}
