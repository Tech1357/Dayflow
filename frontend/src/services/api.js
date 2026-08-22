const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('hrms_token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('hrms_token', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('hrms_token');
  }

  // Make API request with auth header
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    this.removeAuthToken();
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Employee methods
  async getEmployees(params = {}) {
    return this.get('/employees', params);
  }

  async getEmployee(id) {
    return this.get(`/employees/${id}`);
  }

  async updateEmployee(id, data) {
    return this.put(`/employees/${id}`, data);
  }

  async getDepartments() {
    return this.get('/employees/meta/departments');
  }

  // Attendance methods
  async getAttendance(params = {}) {
    return this.get('/attendance', params);
  }

  async checkIn() {
    return this.post('/attendance/checkin');
  }

  async checkOut() {
    return this.post('/attendance/checkout');
  }

  async markAttendance(data) {
    return this.post('/attendance/mark', data);
  }

  async getTodayAttendanceStatus() {
    return this.get('/attendance/status/today');
  }

  // Time off methods
  async getTimeOffRequests(params = {}) {
    return this.get('/timeoff/requests', params);
  }

  async submitTimeOffRequest(data) {
    return this.post('/timeoff/requests', data);
  }

  async processTimeOffRequest(id, action, rejectionReason = '') {
    return this.patch(`/timeoff/requests/${id}`, {
      action,
      rejectionReason
    });
  }

  async getTimeOffBalance(employeeId = '') {
    const params = employeeId ? { employeeId } : {};
    return this.get('/timeoff/balance', params);
  }

  async getTimeOffCalendar(params = {}) {
    return this.get('/timeoff/calendar', params);
  }

  // Profile methods
  async updateBasicProfile(data) {
    return this.put('/profile/basic', data);
  }

  async updatePrivateInfo(data) {
    return this.put('/profile/private', data);
  }

  async updateBankDetails(data) {
    return this.put('/profile/bank', data);
  }

  async updateSalaryInfo(employeeId, data) {
    return this.put(`/profile/salary/${employeeId}`, data);
  }

  async addSkill(data) {
    return this.post('/profile/skills', data);
  }

  async updateSkill(id, data) {
    return this.put(`/profile/skills/${id}`, data);
  }

  async deleteSkill(id) {
    return this.delete(`/profile/skills/${id}`);
  }

  async changePassword(data) {
    return this.put('/profile/password', data);
  }
}

export default new ApiService();