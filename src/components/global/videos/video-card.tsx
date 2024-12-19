'use client'
import React, { useState } from 'react'
import CardMenu from './video-card-menu'
import CopyLink from './copy-link'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dot, Share2, User, Trash2, FolderMinus } from 'lucide-react'
import Modal from '../modal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { io } from 'socket.io-client';

type Props = {
  User: {
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
  id: string
  Folder: {
    id: string
    name: string
  } | null
  createdAt: Date
  title: string | null
  source: string
  processing: boolean
  workspaceId: string
}

const VideoCard = (props: Props) => {
  const daysAgo = Math.floor(
    (new Date().getTime() - props.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  )

  const [videoError, setVideoError] = useState(false);

  const handleDelete = async () => {
    try {
      // First delete from database
      const deleteResponse = await fetch(`/api/recording/${props.id}/delete`, {
        method: 'DELETE',
      });

      const data = await deleteResponse.json();

      if (data.status !== 200) {
        throw new Error(data.error || 'Failed to delete video from database');
      }

      // Then delete from AWS via socket
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
      
      socket.emit('delete-video', {
        filename: props.source,
        videoId: props.id
      });

      socket.on('video-deleted', (response: { success: boolean, error?: string }) => {
        if (response.success) {
          toast.success('Video deleted successfully');
          window.location.reload();
        } else {
          toast.error(response.error || 'Failed to delete video from storage');
        }
        socket.disconnect();
      });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete video');
      console.error('Error deleting video:', error);
    }
  };

  const handleRemoveFromFolder = async () => {
    try {
      const response = await fetch(`/api/recording/${props.id}/folder`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      if (data.status !== 200) {
        throw new Error(data.error || 'Failed to remove from folder')
      }

      toast.success('Removed from folder')
      window.location.reload()
    } catch (error) {
      console.error('Error removing from folder:', error)
      toast.error('Failed to remove from folder')
    }
  }

  // console.log('video', props.source)
  // console.log('video', `${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${props.source}#t=1`)

  return (
      <div className=" group overflow-hidden cursor-pointer bg-[#171717] relative border-[1px] border-[#252525] flex flex-col rounded-xl" suppressHydrationWarning>
        <div className="absolute top-3 right-3 z-50 gap-x-3 hidden group-hover:flex">
          {props.Folder && (
            <button
              onClick={(e) => {
                e.preventDefault()
                handleRemoveFromFolder()
              }}
              className="p-2 hover:bg-neutral-800 rounded-full transition"
            >
              <FolderMinus className="w-4 h-4 text-yellow-500" />
            </button>
          )}
          <Modal
            title="Delete Video"
            description="Are you sure you want to delete this video? This action cannot be undone."
            trigger={
              <Button variant="ghost" size="icon" className="p-[5px] h-5 bg-hover:bg-transparent bg-[#252525]">
                <Trash2 className="text-red-500" size={20} />
              </Button>
            }
          >
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </Modal>
          <CardMenu
            currentFolderName={props.Folder?.name}
            videoId={props.id}
            currentWorkspace={props.workspaceId}
            currentFolder={props.Folder?.id}
          />
          <CopyLink
            className="p-[5px] h-5 bg-hover:bg-transparent bg-[#252525]"
            videoId={props.id}
          />
        </div>
        <Link
          href={`/dashboard/${props.workspaceId}/video/${props.id}`}
          className="hover:bg-[#252525] transition duration-150 flex flex-col justify-between h-full"
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
              <Avatar className=" w-8 h-8">
                <AvatarImage src={props.User?.image as string} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="capitalize text-xs text-[#BDBDBD]">
                  {props.User?.firstname} {props.User?.lastname}
                </p>
                <p className="text-[#6d6b6b]  text-xs flex items-center ">
                  <Dot /> {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span className="flex gap-x-1 items-center">
                <Share2
                  fill="#9D9D9D"
                  className="text-[#9D9D9D]"
                  size={12}
                />
                <p className="text-xs text-[#9D9D9D] capitalize">
                  {props.User?.firstname}&apos;s Workspace
                </p>
              </span>
            </div>
          </div>
        </Link>
      </div>
  )
}

export default VideoCard
