import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || 'Đã xảy ra lỗi!'
    return Promise.reject({ message, status: error.response?.status })
  }
)

// ========== Dashboard ==========
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats').then(res => res.data),
}

// ========== Parents ==========
export const parentApi = {
  getAll: (skip = 0, limit = 100) =>
    api.get('/parents/', { params: { skip, limit } }).then(res => res.data),
  getById: (id) => api.get(`/parents/${id}`).then(res => res.data),
  create: (data) => api.post('/parents/', data).then(res => res.data),
  update: (id, data) => api.put(`/parents/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/parents/${id}`).then(res => res.data),
}

// ========== Students ==========
export const studentApi = {
  getAll: (skip = 0, limit = 100) =>
    api.get('/students/', { params: { skip, limit } }).then(res => res.data),
  getById: (id) => api.get(`/students/${id}`).then(res => res.data),
  create: (data) => api.post('/students/', data).then(res => res.data),
  update: (id, data) => api.put(`/students/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/students/${id}`).then(res => res.data),
}

// ========== Classes ==========
export const classApi = {
  getAll: (skip = 0, limit = 100) =>
    api.get('/classes/', { params: { skip, limit } }).then(res => res.data),
  getById: (id) => api.get(`/classes/${id}`).then(res => res.data),
  create: (data) => api.post('/classes/', data).then(res => res.data),
  update: (id, data) => api.put(`/classes/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/classes/${id}`).then(res => res.data),
  register: (classId, studentId) =>
    api.post(`/classes/${classId}/register`, { student_id: studentId }).then(res => res.data),
  unregister: (classId, studentId) =>
    api.delete(`/classes/${classId}/unregister/${studentId}`).then(res => res.data),
  getStudents: (classId) =>
    api.get(`/classes/${classId}/students`).then(res => res.data),
}

// ========== Subscriptions ==========
export const subscriptionApi = {
  getAll: (skip = 0, limit = 100) =>
    api.get('/subscriptions/', { params: { skip, limit } }).then(res => res.data),
  getById: (id) => api.get(`/subscriptions/${id}`).then(res => res.data),
  getByStudent: (studentId) =>
    api.get(`/subscriptions/student/${studentId}`).then(res => res.data),
  create: (data) => api.post('/subscriptions/', data).then(res => res.data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data).then(res => res.data),
  useSession: (id) => api.patch(`/subscriptions/${id}/use-session`).then(res => res.data),
  delete: (id) => api.delete(`/subscriptions/${id}`).then(res => res.data),
}

export default api
