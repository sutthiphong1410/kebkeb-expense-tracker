import client from "../client";

export const expenseApi = {
    getAll: (params) => client.get('/expenses', { params }).then((res) => res.data),
    getMonths: () => client.get('/expenses/months').then((res) => res.data),
    getDays: (month) => client.get('/expenses/days', { params: { month } }).then((res) => res.data),
    getSummary: (month) => client.get('/expenses/summary', { params: { month } }).then((res) => res.data),
    create: (data) => client.post('/expenses', data).then((res) => res.data),
    update: (id, data) => client.put(`/expenses/${id}`, data).then((res) => res.data),
    delete: (id) => client.delete(`/expenses/${id}`).then((res) => res.data),
}