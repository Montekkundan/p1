import { getUserProfile, getVideoComments } from '@/actions/user'
import { getAllVideos, getPreviewVideo } from '@/actions/workspace'
import PublicVideoPreview from '../../_components/video-preview'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

type Props = {
  params: {
    id: string
  }
}

export const revalidate = 0

export default async function VideoPage({ params }: Props) {
  const { id } = params
  const query = new QueryClient()
  const { data: videos } = await getAllVideos()

  await query.prefetchQuery({
    queryKey: ['preview-video'],
    queryFn: () => getPreviewVideo(id),
  })
  await query.prefetchQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })
  await query.prefetchQuery({
    queryKey: ['video-comments'],
    queryFn: () => getVideoComments(id),
  })

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <PublicVideoPreview videoId={id} allVideos={videos || []} />
    </HydrationBoundary>
  )
} 