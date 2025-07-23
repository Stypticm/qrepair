import prisma from '@/core/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json(
      { error: 'Missing id' },
      { status: 400 }
    )
  }

  try {
    const application =
      await prisma.repairRequest.findUnique({
        where: { id },
      })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
