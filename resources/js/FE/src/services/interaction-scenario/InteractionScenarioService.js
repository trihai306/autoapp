// resources/js/FE/src/services/interaction-scenario/InteractionScenarioService.js
import ApiService from '../ApiService'

const InteractionScenarioService = {
    /**
     * Lấy danh sách tất cả interaction scenarios
     * GET /api/interaction-scenarios
     */
    getInteractionScenarios: async (params) => {
        return ApiService.fetchDataWithAxios({
            url: '/interaction-scenarios',
            method: 'get',
            params,
        })
    },

    /**
     * Tạo interaction scenario mới
     * POST /api/interaction-scenarios
     */
    createInteractionScenario: async (data) => {
        return ApiService.fetchDataWithAxios({
            url: '/interaction-scenarios',
            method: 'post',
            data,
        })
    },

    /**
     * Lấy chi tiết một interaction scenario
     * GET /api/interaction-scenarios/{id}
     */
    getInteractionScenario: async (id) => {
        return ApiService.fetchDataWithAxios({
            url: `/interaction-scenarios/${id}`,
            method: 'get',
        })
    },

    /**
     * Cập nhật interaction scenario
     * PUT /api/interaction-scenarios/{id}
     */
    updateInteractionScenario: async (id, data) => {
        return ApiService.fetchDataWithAxios({
            url: `/interaction-scenarios/${id}`,
            method: 'put',
            data,
        })
    },

    /**
     * Xóa interaction scenario
     * DELETE /api/interaction-scenarios/{id}
     */
    deleteInteractionScenario: async (id) => {
        return ApiService.fetchDataWithAxios({
            url: `/interaction-scenarios/${id}`,
            method: 'delete',
        })
    },
}

export default InteractionScenarioService