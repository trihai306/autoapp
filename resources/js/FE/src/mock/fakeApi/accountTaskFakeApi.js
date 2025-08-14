export default function accountTaskFakeApi(server, apiPrefix) {
    server.get(`${apiPrefix}/account-tasks`, (schema, request) => {
        const { search, status, priority, tiktok_account_id } = request.queryParams
        let data = schema.db.accountTaskData

        if (search) {
            data = data.filter(
                (task) =>
                    task.task_type.toLowerCase().includes(search.toLowerCase()) ||
                    task.tiktok_account.nickname.toLowerCase().includes(search.toLowerCase()),
            )
        }

        if (status) {
            data = data.filter((task) => task.status === status)
        }

        if (priority) {
            data = data.filter((task) => task.priority === priority)
        }

        if (tiktok_account_id) {
            data = data.filter((task) => task.tiktok_account_id == tiktok_account_id)
        }

        return {
            data,
            total: data.length,
        }
    })

    server.delete(`${apiPrefix}/account-tasks/:id`, (schema, request) => {
        const id = request.params.id
        schema.db.accountTaskData.remove({ id })
        return {}
    })
}
