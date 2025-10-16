'use client'
import { useState, useRef, useCallback } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { apiUploadFile } from '@/services/file/FileService'
import { TbPhoto, TbVideo, TbTrash, TbUpload, TbFile, TbX } from 'react-icons/tb'

const Dropzone = ({ accept, multiple = false, onUploaded }) => {
    const inputRef = useRef(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const uploadFiles = async (files) => {
        if (!files || files.length === 0) return
        setUploading(true)
        setError('')
        try {
            const uploaded = []
            for (let i = 0; i < files.length; i++) {
                const res = await apiUploadFile(files[i])
                const path = res?.path || res?.data?.path
                if (path) uploaded.push({ name: files[i].name, path })
            }
            onUploaded?.(multiple ? uploaded : (uploaded[0] ? [uploaded[0]] : []))
        } catch (e) {
            setError(e.message || 'Upload thất bại')
        } finally {
            setUploading(false)
            setDragOver(false)
        }
    }

    const onInputChange = (e) => uploadFiles(e.target.files)
    const onDrop = (e) => { e.preventDefault(); uploadFiles(e.dataTransfer.files) }

    const openPicker = useCallback(() => { inputRef.current?.click() }, [])

    return (
        <div
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true) }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-600'}`}
            onClick={openPicker}
        >
            <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={onInputChange} className="hidden" />
            <div className="flex flex-col items-center gap-2">
                <TbUpload className="w-8 h-8 text-blue-600" />
                <div className="text-sm text-gray-700 dark:text-gray-300">Kéo & thả tệp vào đây hoặc bấm để chọn</div>
                {uploading && <div className="text-xs text-gray-500">Đang tải lên...</div>}
                {error && <div className="text-xs text-red-500">{error}</div>}
            </div>
        </div>
    )
}

const PostToTimelineModal = ({ isOpen, onClose, action, onSave }) => {
    const [form, setForm] = useState({
        content: '',
        images: [], // [{name, path}]
        video: null, // {name, path}
        actionName: 'Đăng bài lên tường',
    })
    const [fileInputKey, setFileInputKey] = useState(0)

    const removeImage = (idx) => setForm(p=>({ ...p, images: p.images.filter((_,i)=>i!==idx) }))
    const clearVideo = () => setForm(p=>({ ...p, video: null }))

    const inferType = () => {
        if (form.video?.path) return 'VIDEO'
        if (form.images.length) return 'IMAGE'
        return 'TEXT'
    }

    const handleCombinedUpload = async (files) => {
        if (!files || files.length === 0) return
        const first = files[0]
        if (first.type?.startsWith('video')) {
            // Nếu đã có ảnh rồi thì không cho chọn video
            if (form.images.length > 0) { setFileInputKey(k=>k+1); return }
            // Upload một video
            const res = await apiUploadFile(first)
            const path = res?.path || res?.data?.path
            if (path) setForm(p=>({ ...p, images: [], video: { name: first.name, path } }))
        } else {
            // Upload nhiều ảnh
            const imgs = []
            for (let i = 0; i < files.length; i++) {
                const f = files[i]
                if (!f.type?.startsWith('image')) continue
                const res = await apiUploadFile(f)
                const path = res?.path || res?.data?.path
                if (path) imgs.push({ name: f.name, path })
            }
            if (imgs.length) setForm(p=>({ ...p, video: null, images: [...p.images, ...imgs] }))
        }
        // reset input để có thể chọn lại cùng file tên cũ
        setFileInputKey(k=>k+1)
    }

    const handleSave = () => {
        const type = inferType()
        const config = {
            FacebookPostWorkflow: {
                Config: {
                    type,
                    content: form.content || null,
                    url: null,
                    imagePaths: type === 'IMAGE' ? form.images.map(i=>i.path) : null,
                    videoPath: type === 'VIDEO' ? form.video?.path || null : null,
                },
            },
        }
        onSave?.(action, config)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={800}>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div>
                    <h5 className="font-bold text-lg">Cấu hình Đăng bài lên tường</h5>
                </div>

                {/* Cấu hình cơ bản */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="text-sm font-semibold">Cấu hình cơ bản</div>
                    <Input placeholder="Tên hành động" value={form.actionName} onChange={(e)=>setForm(p=>({ ...p, actionName: e.target.value }))} />
                    <Input textArea rows={4} placeholder="Nội dung văn bản" value={form.content} onChange={(e)=>setForm(p=>({ ...p, content: e.target.value }))} />
                </div>

                {/* Khu upload hợp nhất */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                    <div className="text-sm font-semibold">Ảnh/Video</div>
                    {!form.video && (
                        <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer text-gray-600 dark:text-gray-300">
                            <input key={fileInputKey} type="file" accept={form.images.length>0 ? 'image/*' : 'image/*,video/*'} multiple onChange={(e)=>handleCombinedUpload(e.target.files)} className="hidden" />
                            <div className="flex flex-col items-center gap-2">
                                <TbUpload className="w-8 h-8 text-blue-600" />
                                <div>Kéo & thả tệp vào đây hoặc bấm để chọn</div>
                                {form.images.length>0 && <div className="text-xs text-gray-500">Đang ở chế độ ảnh • Có thể thêm nhiều đợt</div>}
                            </div>
                        </label>
                    )}

                    {/* Preview ảnh */}
                    {form.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {form.images.map((img, idx)=> (
                                <div key={idx} className="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={img.path} alt={img.name} className="w-full h-28 object-cover" />
                                    <button className="absolute top-1 right-1 bg-white/80 dark:bg-gray-800/80 rounded-full p-1" onClick={()=>removeImage(idx)}><TbX /></button>
                                    <div className="px-2 py-1 text-xs text-gray-500 truncate">{img.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Preview video */}
                    {form.video && (
                        <div className="space-y-2">
                            <video controls className="w-full rounded-md border border-gray-200 dark:border-gray-700">
                                <source src={form.video.path} />
                            </video>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="truncate flex items-center gap-2"><TbFile /> {form.video.name}</span>
                                <button className="text-red-500 flex items-center gap-1" onClick={clearVideo}><TbTrash /> Xóa</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="default" onClick={onClose}>Thoát</Button>
                    <Button variant="solid" onClick={handleSave}>Lưu thay đổi</Button>
                </div>
            </div>
        </Dialog>
    )
}

export default PostToTimelineModal
