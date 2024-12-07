import { getAllUserVideos, getFolderInfo } from '@/actions/workspace'
import FolderInfo from '@/components/global/folders/forlder-info'
import Videos from '@/components/global/videos'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import React from 'react'

type Props = {
  params: Promise<{
    folderId: string
    workspaceId: string
  }>
}

const page = async (props: Props) => {
  const params = await props.params;

  const {
    folderId,
    workspaceId
  } = params;

  const query = new QueryClient()
  await query.prefetchQuery({
    queryKey: ['folder-videos'],
    queryFn: () => getAllUserVideos(folderId),
  })

  await query.prefetchQuery({
    queryKey: ['folder-info'],
    queryFn: () => getFolderInfo(folderId),
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <FolderInfo folderId={folderId} />
      <Videos
        workspaceId={workspaceId}
        folderId={folderId}
        videosKey="folder-videos"
      />
    </HydrationBoundary>
  )
}

export default page
