import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json()
  const { id } = params

  const completeProcessing = await client.video.update({
    where: {
      userId: id,
      source: body.filename,
    },
    data: {
      processing: false,
    },
  })
  if (completeProcessing) {
    return NextResponse.json({ status: 200 })
  }

  return NextResponse.json({ status: 400 })
}
