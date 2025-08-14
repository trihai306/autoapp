// resources/js/FE/src/services/scenario-script/ScenarioScriptService.js
import ApiService from '../ApiService'

const ScenarioScriptService = {
    /**
     * Lấy danh sách tất cả scenario scripts
     * GET /api/scenario-scripts
     */
    getScenarioScripts: async (params) => {
        return ApiService.fetchDataWithAxios({
            url: '/scenario-scripts',
            method: 'get',
            params,
        })
    },

    /**
     * Tạo scenario script mới
     * POST /api/scenario-scripts
     */
    createScenarioScript: async (data) => {
        return ApiService.fetchDataWithAxios({
            url: '/scenario-scripts',
            method: 'post',
            data,
        })
    },

    /**
     * Lấy chi tiết một scenario script
     * GET /api/scenario-scripts/{id}
     */
    getScenarioScript: async (id) => {
        return ApiService.fetchDataWithAxios({
            url: `/scenario-scripts/${id}`,
            method: 'get',
        })
    },

    /**
     * Cập nhật scenario script
     * PUT /api/scenario-scripts/{id}
     */
    updateScenarioScript: async (id, data) => {
        return ApiService.fetchDataWithAxios({
            url: `/scenario-scripts/${id}`,
            method: 'put',
            data,
        })
    },

    /**
     * Xóa scenario script
     * DELETE /api/scenario-scripts/{id}
     */
    deleteScenarioScript: async (id) => {
        return ApiService.fetchDataWithAxios({
            url: `/scenario-scripts/${id}`,
            method: 'delete',
        })
    },
}

export default ScenarioScriptService
