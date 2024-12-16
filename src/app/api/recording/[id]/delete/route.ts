import { client } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id

    // Delete the video record from the database
    // This will automatically handle the relation cleanup due to the onDelete: Cascade setting
    await client.video.delete({
      where: {
        id: videoId,
      },
    })

    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ status: 500, error: 'Failed to delete video' })
  }
} 