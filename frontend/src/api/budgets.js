import client from "../client";

export const budgetApi = {
    getAll: (params) => client.get('/budgets', { params }).then((res) => res.data),
    getSummary: () => client.get('/budgets/summary').then((res) => res.data),
    create: (data) => client.post('/budgets', data).then((res) => res.data),
    update: (id, data) => client.put(`/budgets/${id}`, data).then((res) => res.data),
    delete: (id) => client.delete(`/budgets/${id}`).then((res) => res.data),
}