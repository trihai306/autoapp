'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import getContentGroups from '@/server/actions/content/getContentGroups'
import getContentsByGroup from '@/server/actions/content/getContentsByGroup'

const normalizeItemText = (item) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    const fields = [item.text, item.body, item.content, item.message, item.caption]
    for (const f of fields) {
        if (typeof f === 'string') return f
        if (f && typeof f === 'object') {
            if (typeof f.text === 'string') return f.text
            if (typeof f.value === 'string') return f.value
            if (Array.isArray(f)) return f.join('\n')
        }
    }
    try { return JSON.stringify(item.text ?? item) } catch { return '' }
}

const GroupInteractionModal = ({ isOpen, onClose, action, onSave }) => {
    const [form, setForm] = useState({
        groupUrls: [],
        actions: ['like','comment'],
        scrollDepth: 50,
        likeRatio: 0.6,
        commentRatio: 0.3,
        shareRatio: 0.1,
        actionName: 'Tương tác nhóm',
    })

    // Content groups/comments
    const [contentGroups, setContentGroups] = useState([])
    const [selectedGroupId, setSelectedGroupId] = useState('')
    const [groupContents, setGroupContents] = useState([])
    const [selectedContentIds, setSelectedContentIds] = useState([])

    useEffect(() => {
        if (!isOpen) return
        ;(async () => {
            try {
                const res = await getContentGroups({})
                if (res?.success) {
                    const groups = res.data?.data || []
                    setContentGroups(groups)
                }
            } catch (e) { /* ignore */ }
        })()
    }, [isOpen])

    useEffect(() => {
        if (!selectedGroupId) {
            setGroupContents([])
            setSelectedContentIds([])
            return
        }
        ;(async () => {
            try {
                const res = await getContentsByGroup(selectedGroupId)
                const items = res?.data?.data || []
                setGroupContents(items)
                // auto select all when group changes
                setSelectedContentIds(items.map(i=>i.id))
            } catch (e) {
                setGroupContents([])
                setSelectedContentIds([])
            }
        })()
    }, [selectedGroupId])

    const toggleContent = (id) => {
        setSelectedContentIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
    }

    const selectAll = () => setSelectedContentIds(groupContents.map(i=>i.id))
    const clearAll = () => setSelectedContentIds([])

    const handleSave = () => {
        const selectedComments = groupContents
            .filter(i => selectedContentIds.includes(i.id))
            .map(i => normalizeItemText(i))
            .map(s => (s || '').trim())
            .filter(Boolean)

        const toPercent = (val) => {
            const num = Number(val)
            if (Number.isNaN(num)) return 0
            return num <= 1 ? Math.round(num * 100) : Math.round(num)
        }

        const config = {
            type: 'group_interaction',
            name: form.actionName || 'Tương tác nhóm',
            description: 'Tương tác với các bài viết trong nhóm Facebook',
            FacebookGroupInteractionWorkflow: {
                Config: {
                    groupUrls: (form.groupUrls || []).map(s=>s.trim()).filter(Boolean),
                    postsToProcess: 10,
                    maxDurationMinutes: 15,
                    likeRatePercent: toPercent(form.likeRatio),
                    commentRatePercent: toPercent(form.commentRatio),
                    shareRatePercent: toPercent(form.shareRatio),
                    comments: Array.from(new Set(selectedComments)),
                    mode: 'BY_POSTS'
                }
            }
        }
        onSave?.(action, config)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={760}>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div>
                    <h5 className="font-bold text-lg">Tương tác nhóm (Facebook)</h5>
                    <p className="text-sm text-gray-500 mt-1">Điền link nhóm (mỗi dòng một link), chọn hành động và kho bình luận.</p>
                </div>

                {/* Cấu hình cơ bản */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="text-sm font-semibold">Cấu hình cơ bản</div>
                    <Input placeholder="Tên hành động" value={form.actionName} onChange={(e)=>setForm(p=>({ ...p, actionName: e.target.value }))} />
                    <div>
                        <label className="block text-sm font-medium mb-1">Danh sách link nhóm (mỗi dòng một link)</label>
                        <Input
                            textArea
                            rows={4}
                            placeholder={"https://www.facebook.com/groups/123\nhttps://www.facebook.com/groups/456"}
                            value={(form.groupUrls || []).join('\n')}
                            onChange={(e)=>{
                                const lines = (e.target.value || '').split('\n').map(s=>s.trim()).filter(Boolean)
                                setForm(p=>({ ...p, groupUrls: lines }))
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Checkbox checked={form.actions.includes('like')} onChange={(c)=>setForm(p=>({ ...p, actions: c ? Array.from(new Set([...(p.actions||[]),'like'])) : (p.actions||[]).filter(a=>a!=='like') }))}>Like</Checkbox>
                        <Checkbox checked={form.actions.includes('comment')} onChange={(c)=>setForm(p=>({ ...p, actions: c ? Array.from(new Set([...(p.actions||[]),'comment'])) : (p.actions||[]).filter(a=>a!=='comment') }))}>Comment</Checkbox>
                        <Checkbox checked={form.actions.includes('share')} onChange={(c)=>setForm(p=>({ ...p, actions: c ? Array.from(new Set([...(p.actions||[]),'share'])) : (p.actions||[]).filter(a=>a!=='share') }))}>Share</Checkbox>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tỉ lệ Like</label>
                            <Input type="number" step="0.1" value={form.likeRatio} onChange={(e)=>setForm(p=>({ ...p, likeRatio: Number(e.target.value)||0 }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tỉ lệ Comment</label>
                            <Input type="number" step="0.1" value={form.commentRatio} onChange={(e)=>setForm(p=>({ ...p, commentRatio: Number(e.target.value)||0 }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tỉ lệ Share</label>
                            <Input type="number" step="0.1" value={form.shareRatio} onChange={(e)=>setForm(p=>({ ...p, shareRatio: Number(e.target.value)||0 }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Độ sâu cuộn (%)</label>
                        <Input type="number" value={form.scrollDepth} onChange={(e)=>setForm(p=>({ ...p, scrollDepth: Number(e.target.value)||0 }))} />
                    </div>
                </div>

                {/* Chọn bình luận từ kho nội dung */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="text-sm font-semibold">Chọn bình luận đã tạo</div>
                    <select value={selectedGroupId} onChange={(e)=>setSelectedGroupId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">-- Chọn nhóm nội dung --</option>
                        {contentGroups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    {selectedGroupId && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                                <span>Đã tải {groupContents.length} nội dung</span>
                                <div className="flex gap-2">
                                    <button className="text-blue-600" onClick={selectAll} type="button">Chọn tất cả</button>
                                    <button className="text-gray-600" onClick={clearAll} type="button">Bỏ chọn</button>
                                </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                                {groupContents.map(item => (
                                    <label key={item.id} className="flex items-start gap-3 p-2 cursor-pointer">
                                        <input type="checkbox" className="mt-1" checked={selectedContentIds.includes(item.id)} onChange={()=>toggleContent(item.id)} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{normalizeItemText(item)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="default" onClick={onClose}>Đóng</Button>
                    <Button variant="solid" onClick={handleSave}>Lưu</Button>
                </div>
            </div>
        </Dialog>
    )
}

export default GroupInteractionModal
