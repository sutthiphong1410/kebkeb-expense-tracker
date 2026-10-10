import axios from 'axios'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({ baseURL: API_URL })

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        // request ที่ปิด toast เอง (เช่นหน้า login ที่แสดง error ใต้ฟอร์ม)
        const silent = error.config?.skipToast

        const status = error.response?.status
        const message = error.response?.data?.error

        if (status === 401) {
            const hadToken = !!localStorage.getItem('token')
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (window.location.pathname !== '/login') {
                // token หมดอายุ: แจ้งก่อน redirect (toast จะหายไปเมื่อโหลดหน้าใหม่ จึงเก็บข้อความไว้แสดงที่หน้า login)
                if (hadToken) sessionStorage.setItem('authNotice', 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
                window.location.href = '/login'
                return Promise.reject(error)
            }
        }

        if (!silent) {
            if (!error.response) {
                toast.error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง')
            } else if (status >= 500) {
                toast.error('เกิดข้อผิดพลาดของเซิร์ฟเวอร์')
            } else {
                toast.error(message || 'เกิดข้อผิดพลาด')
            }
        }

        return Promise.reject(error)
    }
)

export default client