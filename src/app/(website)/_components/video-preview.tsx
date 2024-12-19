'use client'
import { getPreviewVideo } from '@/actions/workspace'
import { useQueryData } from '@/hooks/useQueryData'
import { VideoProps } from '@/types/index.type'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import Comments from './comments'
import { toast } from 'sonner'
import VideoCard from './video-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  videoId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allVideos: any[] // Add proper type from your getAllVideos return type
}

const PublicVideoPreview = ({ videoId, allVideos }: Props) => {
  const router = useRouter()
  const [timeAgo, setTimeAgo] = useState<string>('')

  const { data, isLoading } = useQueryData(['preview-video'], () =>
    getPreviewVideo(videoId)
  )

  const { data: video, status } = data as VideoProps
  if (status !== 200) router.push('/')

  useEffect(() => {
    if (video?.createdAt) {
      setTimeAgo(formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }))
    }
  }, [video?.createdAt])

  const handleDownload = async () => {
    try {
      const response = await fetch(`https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${video.source}`, {
        method: 'GET',
        headers: {
          'Origin': window.location.origin
        },
        mode: 'cors'
      })
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = video.title || video.source
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Video downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download video')
    }
  }

  const otherVideos = allVideos
    .filter(v => v.id !== videoId)
    .slice(0, 10)

  if (isLoading) {
    return <div>Loading...</div> // Add proper loading state
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
      {/* Main Content - Video and Comments */}
      <div className="xl:col-span-3 space-y-6">
        {/* Video Player */}
        <video
          preload="metadata"
          className="w-full aspect-video rounded-xl"
          controls
        >
          <source
            src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${video.source}#1`}
          />
        </video>

        {/* Video Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">{video.title}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={video.User?.image as string} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-white capitalize">
                  {video.User?.firstname} {video.User?.lastname}
                </p>
                <p className="text-sm text-gray-400">
                  {timeAgo || 'Recently'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleDownload}
              className="hover:text-neutral-300 transition"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>

          {video.description && (
            <p className="text-gray-300 mt-4 text-sm">
              {video.description}
            </p>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
          <Comments videoId={videoId} />
        </div>
      </div>

      {/* Sidebar - Related Videos */}
      <div className="xl:col-span-1">
        <h3 className="text-lg font-semibold text-white mb-4">More Videos</h3>
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-2rem)]">
          {otherVideos.map((video) => (
            <VideoCard
              key={video.id}
              {...video}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PublicVideoPreview 