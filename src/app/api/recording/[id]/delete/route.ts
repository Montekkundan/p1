import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({
        error: 'Unauthorized',
        status: 401
      })
    }

    const videoId = params.id

    // First check if video exists and user has permission
    const video = await client.video.findFirst({
      where: {
        id: videoId,
        User: {
          clerkid: user.id
        }
      }
    })

    if (!video) {
      return NextResponse.json({
        error: 'Video not found or unauthorized',
        status: 404
      })
    }

    // Delete the video from database
    await client.video.delete({
      where: {
        id: videoId
      }
    })

    return NextResponse.json({
      message: 'Video deleted successfully',
      status: 200
    })

  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete video',
      status: 500
    })
  }
} 