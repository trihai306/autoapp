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

const SpecificPostInteractionModal = ({ isOpen, onClose, action, onSave }) => {
    const [form, setForm] = useState({
        postQuery: '',
        doLike: true,
        doComment: true,
        doShare: false,
        actionName: 'Tương tác bài viết chỉ định',
    })
    const [saving, setSaving] = useState(false)

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
            } catch (e) {
                // ignore
            }
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
                // auto select all on group change
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
        if (!form.postQuery.trim()) {
            return
        }
        setSaving(true)
        const selectedComments = groupContents
            .filter(i => selectedContentIds.includes(i.id))
            .map(i => normalizeItemText(i))
            .map(s => (s || '').trim())
            .filter(Boolean)

        const config = {
            type: 'specific_post_interaction',
            name: form.actionName || 'Tương tác bài viết chỉ định',
            FacebookSpecificPostWorkflow: {
                Config: {
                    postQuery: form.postQuery || '',
                    doLike: !!form.doLike,
                    doComment: !!form.doComment,
                    doShare: !!form.doShare,
                    comments: Array.from(new Set(selectedComments)),
                }
            }
        }
        onSave?.(action, config)
        setSaving(false)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={720}>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div>
                    <h5 className="font-bold text-lg">Tương tác bài viết chỉ định (Facebook)</h5>
                    <p className="text-sm text-gray-500 mt-1">Điền link bài viết hoặc truy vấn hợp lệ. Chọn các hành động cần thực hiện.</p>
                </div>

                {/* Cấu hình cơ bản */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="text-sm font-semibold">Cấu hình cơ bản</div>
                    <Input placeholder="Tên hành động" value={form.actionName} onChange={(e)=>setForm(p=>({ ...p, actionName: e.target.value }))} />
                    <div>
                        <label className="block text-sm font-medium mb-1">Link bài viết hoặc truy vấn (postQuery)</label>
                        <Input placeholder="https://www.facebook.com/permalink.php?story_fbid=...&id=..." value={form.postQuery} onChange={(e)=>setForm(p=>({ ...p, postQuery: e.target.value }))} />
                        <div className="text-xs text-gray-500 mt-1">Hỗ trợ permalink, URL bài viết, hoặc chuỗi truy vấn tương ứng.</div>
                    </div>
                </div>

                {/* Tùy chọn hành động */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="text-sm font-semibold">Tùy chọn hành động</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Checkbox checked={form.doLike} onChange={(c)=>setForm(p=>({ ...p, doLike: c }))}>Like</Checkbox>
                        <Checkbox checked={form.doComment} onChange={(c)=>setForm(p=>({ ...p, doComment: c }))}>Comment</Checkbox>
                        <Checkbox checked={form.doShare} onChange={(c)=>setForm(p=>({ ...p, doShare: c }))}>Share</Checkbox>
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
                    <Button variant="solid" onClick={handleSave} disabled={saving || !form.postQuery.trim()}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
                </div>
            </div>
        </Dialog>
    )
}

export default SpecificPostInteractionModal
