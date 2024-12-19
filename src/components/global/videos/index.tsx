'use client'
import { getAllUserVideos } from '@/actions/workspace'
import VideoRecorderDuotone from '@/components/icons/video-recorder-duotone'
import { useQueryData } from '@/hooks/useQueryData'
import { cn } from '@/lib/utils'
import { VideosProps } from '@/types/index.type'
import React from 'react'
import VideoCard from './video-card'
import { useSearchParams } from 'next/navigation'

type Props = {
  folderId: string
  videosKey: string
  workspaceId: string
}

const Videos = ({ folderId, videosKey, workspaceId }: Props) => {
  const searchParams = useSearchParams()
  const searchTerm = searchParams.get('search')
  
  const { data: videoData } = useQueryData([videosKey], () =>
    getAllUserVideos(folderId)
  )

  const { status: videosStatus, data: videos } = videoData as VideosProps

  const filteredVideos = React.useMemo(() => {
    if (!videos || !searchTerm) return videos
    
    return videos.filter((video) => {
      const searchableText = [
        video.title,
        video.User?.firstname,
        video.User?.lastname,
        video.Folder?.name
      ].filter(Boolean).join(' ').toLowerCase()
      
      return searchableText.includes(searchTerm.toLowerCase())
    })
  }, [videos, searchTerm])

  const hasVideos = videosStatus === 200 && filteredVideos?.length > 0

  return (
    <div className="flex flex-col gap-4 mt-4" suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <VideoRecorderDuotone />
          <h2 className="text-[#BdBdBd] text-xl">Videos</h2>
        </div>
      </div>
      <section
        className={cn(
          !hasVideos
            ? 'p-5'
            : 'grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        )}
      >
        {hasVideos ? (
          filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              workspaceId={workspaceId}
              {...video}
            />
          ))
        ) : (
          <p className="text-[#BDBDBD]">
            {searchTerm ? 'No videos found matching your search' : 'No videos in workspace'}
          </p>
        )}
      </section>
    </div>
  )
}

export default Videos
