import { client } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      })
    }

    const { videoId, filename } = await req.json()

    if (!videoId || !filename) {
      return NextResponse.json({
        status: 400,
        message: 'Missing required fields'
      })
    }

    // Update video record to mark as processed
    const video = await client.video.update({
      where: {
        id: videoId,
      },
      data: {
        processing: false,
      },
    })

    if (!video) {
      return NextResponse.json({
        status: 404,
        message: 'Video not found'
      })
    }

    return NextResponse.json({
      status: 200,
      message: 'Video processing completed'
    })

  } catch (error) {
    console.error('Complete upload error:', error)
    return NextResponse.json({
      status: 500,
      message: 'Failed to complete upload processing'
    })
  }
} 