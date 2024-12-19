'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

type Props = {
  workspaceId: string
  children?: React.ReactNode
}

const UploadModal = ({ workspaceId, children }: Props) => {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setUploading(true)
      
      for (const file of acceptedFiles) {
        if (!file.type.includes('video/')) {
          toast.error('Only video files are allowed')
          continue
        }

        const filename = `${Date.now()}-${file.name}`
        
        // Get presigned URL
        const response = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename,
            contentType: file.type,
            workspaceId
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get upload URL')
        }

        const data = await response.json()
        
        if (data.status !== 200) {
          throw new Error(data.message || 'Failed to get valid upload URL')
        }

        // Create form data with the file and fields
        const formData = new FormData()
        Object.entries(data.fields || {}).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append('file', file)

        // Upload to S3
        const uploadResponse = await fetch(data.url, {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.status !== 204) {
          throw new Error(`Upload failed with status: ${uploadResponse.status}`)
        }

        // Notify backend of successful upload
        try {
          const completeResponse = await fetch('/api/recording/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename,
              videoId: data.video?.id
            }),
          })

          if (!completeResponse.ok) {
            console.warn('Failed to notify backend of upload completion')
          }
        } catch (completeError) {
          console.warn('Error notifying backend:', completeError)
        }

        toast.success('File uploaded successfully')
        setOpen(false)
        
        // Add a small delay before reload to ensure all operations complete
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [workspaceId, setOpen])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxSize: 104857600 // 100MB
  })

  return (
    <>
      {children ? (
        <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <Button 
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <Upload size={16} />
          Upload
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <p>Uploading...</p>
            ) : isDragActive ? (
              <p>Drop the video here...</p>
            ) : (
              <p>Drag & drop a video here, or click to select (max 100MB)</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UploadModal 