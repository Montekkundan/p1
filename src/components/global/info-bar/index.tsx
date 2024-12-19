import VideoRecorderIcon from '@/components/icons/video-recorder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserButton } from '@clerk/nextjs'
import { Search, UploadIcon } from 'lucide-react'
import React from 'react'
import UploadModal from '../upload-modal'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

const InfoBar = () => {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const workspaceId = params.workspaceId as string

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <header className="pl-20 md:pl-[265px] fixed p-4 w-full flex items-center justify-between gap-4">
      <div className="flex gap-4 justify-center items-center border-2 rounded-full px-4 w-full max-w-lg">
        <Search
          size={25}
          className="text-[#707070]"
        />
        <Input
          className="bg-transparent border-none !placeholder-neutral-500 focus-visible:ring-0"
          placeholder="Search for people, projects, tags & folders"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search') ?? ''}
        />
      </div>
      <div className="flex items-center gap-4">
        <UploadModal workspaceId={workspaceId}>
          <Button className="bg-[#9D9D9D] flex items-center gap-2">
            <UploadIcon size={20} />
            <span className="flex items-center gap-2">Upload</span>
          </Button>
        </UploadModal>
        <Button className="bg-[#9D9D9D] flex items-center gap-2">
          <VideoRecorderIcon />
          <span className="flex items-center gap-2">Record</span>
        </Button>
        <UserButton />
      </div>
    </header>
  )
}

export default InfoBar
