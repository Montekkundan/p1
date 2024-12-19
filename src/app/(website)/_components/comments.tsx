'use client'
import { createCommentAndReply, getUserProfile, getVideoComments } from '@/actions/user'
import { useQueryData } from '@/hooks/useQueryData'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { User } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
}

const Comments = ({ videoId }: Props) => {
  const [comment, setComment] = useState('')
  const { data: profile } = useQueryData(['user-profile'], getUserProfile)
  const { data: comments, refetch } = useQueryData(['video-comments'], () =>
    getVideoComments(videoId)
  )

  const handleComment = async () => {
    if (!comment) return

    if (!profile?.status || profile.status !== 200) {
      toast.error('Please login to comment')
      return
    }

    const response = await createCommentAndReply(
      profile.data?.id as string,
      comment,
      videoId
    )
    if (response?.status === 200) {
      setComment('')
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src={profile?.data?.image as string} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleComment}
            className="float-right"
          >
            Comment
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {comments?.data?.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.User.image as string} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">
                  {comment.User.firstname} {comment.User.lastname}
                </p>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{comment.comment}</p>
              
              {/* Replies */}
              {comment.reply?.map((reply) => (
                <div key={reply.id} className="flex gap-4 mt-4 ml-8">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={reply.User.image as string} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">
                        {reply.User.firstname} {reply.User.lastname}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{reply.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Comments 