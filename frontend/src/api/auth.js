import client from "../client";

export const authApi = {
    register: (data) => client.post('/auth/register', data).then((res) => res.data),
    login: (data) => client.post('/auth/login', data).then((res) => res.data)
}