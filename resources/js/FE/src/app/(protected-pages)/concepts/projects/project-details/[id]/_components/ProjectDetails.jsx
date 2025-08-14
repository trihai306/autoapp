'use client'
import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import ProjectDetailsHeader from './ProjectDetailsHeader'
import ProjectDetailsNavigation from './ProjectDetailsNavigation'
import useResponsive from '@/utils/hooks/useResponsive'
import getProject from '@/server/actions/project/getProject'
import useSWR from 'swr'
import ProjectDetailsOverview from './ProjectDetailsOverview'
import ProjectDetailsTask from './ProjectDetailsTask'
import ProjectDetailsAttachments from './ProjectDetailsAttachments'
import ProjectDetailsActivity from './ProjectDetailsActivity'
import ProjectDetailsSetting from './ProjectDetailsSetting'

const defaultNavValue = 'overview'
const settingsNavValue = 'settings'

const ProjectDetails = ({ id }) => {
    const fetcher = async () => {
        const result = await getProject(id);
        if (result.success) return result.data;
        throw new Error(result.message);
    };
    const { data, mutate } = useSWR(
        id ? `/api/projects/${id}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    const { larger } = useResponsive()

    const [selectedNav, setSelectedNav] = useState(defaultNavValue)
    const [isContentEdit, setIsContentEdit] = useState(false)

    const handleEdit = (isEdit) => {
        setSelectedNav(settingsNavValue)
        setIsContentEdit(isEdit)
    }

    const handleContentChange = (content) => {
        mutate({ ...data, content }, false)
        setIsContentEdit(false)
    }

    const handleUpdate = ({ name, content, dueDate }) => {
        const newData = { ...data }
        newData.name = name
        newData.content = content
        if (newData.schedule) {
            newData.schedule.dueDate = dueDate
        }

        mutate({ ...newData }, false)
        setIsContentEdit(false)
        setSelectedNav(defaultNavValue)
    }

    const handleNavigationChange = (val) => {
        if (val === settingsNavValue) {
            setIsContentEdit(true)
        } else {
            setIsContentEdit(false)
        }
        setSelectedNav(val)
    }

    return (
        <div>
            {data && (
                <>
                    <ProjectDetailsHeader
                        title={data.name}
                        isContentEdit={isContentEdit}
                        selected={selectedNav}
                        onEdit={handleEdit}
                        onChange={handleNavigationChange}
                    />
                    <div className="mt-6 flex gap-12">
                        {larger.xl && (
                            <ProjectDetailsNavigation
                                selected={selectedNav}
                                onChange={handleNavigationChange}
                            />
                        )}
                        <div className="w-full">
                            <div>
                                {selectedNav === defaultNavValue && (
                                    <ProjectDetailsOverview
                                        content={data.content}
                                        client={data.client}
                                        schedule={data.schedule}
                                        isContentEdit={isContentEdit}
                                        setIsContentEdit={setIsContentEdit}
                                        onContentChange={handleContentChange}
                                    />
                                )}
                                {selectedNav === 'tasks' && (
                                    <ProjectDetailsTask />
                                )}
                                {selectedNav === 'attachments' && (
                                    <ProjectDetailsAttachments />
                                )}
                                {selectedNav === 'activity' && (
                                    <ProjectDetailsActivity />
                                )}
                                {selectedNav === 'settings' && (
                                    <ProjectDetailsSetting
                                        name={data.name}
                                        content={data.content}
                                        dueDate={data.schedule.dueDate}
                                        onUpdate={handleUpdate}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ProjectDetails
