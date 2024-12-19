'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dot, User } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  User: {
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
  id: string
  createdAt: Date
  title: string | null
  source: string
}

const VideoCard = (props: Props) => {
  const [videoError, setVideoError] = useState(false)
  const [timeAgo, setTimeAgo] = useState<string>('')

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(props.createdAt), { addSuffix: true }))
  }, [props.createdAt])

  const handleClick = () => {
    window.location.href = `/video/${props.id}`
  }

  return (
    <div
      onClick={handleClick}
      className="group overflow-hidden cursor-pointer bg-[#171717] relative border-[1px] border-[#252525] flex flex-col rounded-xl hover:bg-[#252525] transition duration-150"
    >
      <video
        controls={false}
        preload="metadata"
        className="w-full aspect-video opacity-50 z-20"
        onError={() => setVideoError(true)}
      >
        <source
          src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${props.source}#t=1`}
          type={props.source.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
        />
        {videoError && (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <p className="text-sm text-gray-400">Video preview unavailable</p>
          </div>
        )}
      </video>
      <div className="px-5 py-3 flex flex-col gap-7-2 z-20">
        <h2 className="text-sm font-semibold text-[#BDBDBD]">
          {props.title}
        </h2>
        <div className="flex gap-x-2 items-center mt-4">
          <Avatar className="w-8 h-8">
            <AvatarImage src={props.User?.image as string} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="capitalize text-xs text-[#BDBDBD]">
              {props.User?.firstname} {props.User?.lastname}
            </p>
            <p className="text-[#6d6b6b] text-xs flex items-center">
              <Dot /> {timeAgo || 'Recently'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCard 