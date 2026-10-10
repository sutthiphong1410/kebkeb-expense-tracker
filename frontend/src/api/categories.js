import client from "../client";

export const categoryApi = {
    getAll: (params) => client.get('/categories', { params }).then((res) => res.data),
    getSummary: () => client.get('/categories/summary').then((res) => res.data),
    create: (data) => client.post('/categories', data).then((res) => res.data),
    update: (id, data) => client.put(`/categories/${id}`, data).then((res) => res.data),
    delete: (id) => client.delete(`/categories/${id}`).then((res) => res.data),
}