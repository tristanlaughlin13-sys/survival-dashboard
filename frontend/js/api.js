// API Communication Layer
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://survival-dashboard-api.onrender.com'; // Your Render backend

class API {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: this.getHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
        throw new Error('Authentication required');
      }

      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Too many login attempts. Please wait a few minutes and try again.');
      }

      if (!response.ok) {
        // Try to parse JSON error, fallback to text
        let errorMessage = 'API request failed';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          // Not JSON, try text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.token = data.token;
    localStorage.setItem('authToken', data.token);
    return data;
  }

  async register(name, email, password) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    this.token = data.token;
    localStorage.setItem('authToken', data.token);
    return data;
  }

  async getProfile() {
    return await this.request('/api/auth/me');
  }

  // Session endpoints
  async getSessions(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/api/sessions?${params}`);
  }

  async createSession(sessionData) {
    return await this.request('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  }

  async updateSession(id, updates) {
    return await this.request(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteSession(id) {
    return await this.request(`/api/sessions/${id}`, {
      method: 'DELETE'
    });
  }

  // Bills endpoints
  async getBills() {
    return await this.request('/api/bills');
  }

  async createBill(billData) {
    return await this.request('/api/bills', {
      method: 'POST',
      body: JSON.stringify(billData)
    });
  }

  async updateBill(id, updates) {
    return await this.request(`/api/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async markBillPaid(id, paid) {
    return await this.request(`/api/bills/${id}/paid`, {
      method: 'PATCH',
      body: JSON.stringify({ paid })
    });
  }

  async deleteBill(id) {
    return await this.request(`/api/bills/${id}`, {
      method: 'DELETE'
    });
  }

  // Stats endpoints
  async getStats() {
    return await this.request('/api/stats');
  }

  async getTodayStats() {
    return await this.request('/api/stats/today');
  }

  // Data management
  async exportData() {
    return await this.request('/api/export');
  }

  // Settings endpoints
  async getSettings() {
    return await this.request('/api/settings');
  }

  async updateSettings(settings) {
    return await this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Bills CSV import/export
  async exportBillsCSV() {
    const response = await fetch(`${API_URL}/api/bills/export-csv`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to export bills CSV');
    }

    return await response.blob();
  }

  async importBillsCSV(csvData) {
    return await this.request('/api/bills/import-csv', {
      method: 'POST',
      body: JSON.stringify({ csvData })
    });
  }
}

// Export singleton instance
window.api = new API();

