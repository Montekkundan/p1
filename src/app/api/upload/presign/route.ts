import { client } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'
import { auth } from '@clerk/nextjs/server'

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({
        status: 401,
        message: 'Unauthorized'
      })
    }

    const user = await client.user.findUnique({
      where: {
        clerkid: clerkId
      }
    })

    if (!user) {
      return NextResponse.json({
        status: 404,
        message: 'User not found'
      })
    }

    const { filename, contentType, workspaceId } = await req.json()

    // Create presigned post data
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
      Key: filename,
      Conditions: [
        ['content-length-range', 0, 104857600], // up to 100MB
        ['starts-with', '$Content-Type', 'video/'],
      ],
      Fields: {
        'Content-Type': contentType,
      },
      Expires: 600, // 10 minutes
    })

    // Create video record in database
    const video = await client.video.create({
      data: {
        source: filename,
        userId: user.id,
        workSpaceId: workspaceId,
        processing: true,
        title: filename.split('-')[1] // Use filename without timestamp as initial title
      },
    })

    if (!video) {
      return NextResponse.json({
        status: 400,
        message: 'Failed to create video record'
      })
    }

    return NextResponse.json({
      status: 200,
      message: 'Presigned URL generated',
      url,
      fields
    })

  } catch (error) {
    console.error('Presign error:', error)
    return NextResponse.json({
      status: 500,
      message: 'Failed to create upload URL'
    })
  }
} 