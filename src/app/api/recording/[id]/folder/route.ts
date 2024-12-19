import { client } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: 'Unauthorized',
        status: 401
      })
    }

    const user = await client.user.findUnique({
      where: {
        clerkid: userId
      }
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        status: 404
      })
    }

    const video = await client.video.update({
      where: {
        id,
        userId: user.id
      },
      data: {
        folderId: null
      }
    })

    if (!video) {
      return NextResponse.json({
        error: 'Video not found or unauthorized',
        status: 404
      })
    }

    return NextResponse.json({
      message: 'Video removed from folder',
      status: 200
    })

  } catch (error) {
    console.error('Remove from folder error:', error)
    return NextResponse.json({
      error: 'Failed to remove from folder',
      status: 500
    })
  }
} 