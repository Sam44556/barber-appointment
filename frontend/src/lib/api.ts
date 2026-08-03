// Read the backend API URL from the environment variable injected at build time.
// For local dev:       set VITE_API_URL in .env          → http://localhost:3000/api
// For production:      set VITE_API_URL in .env.production → https://api.yourdomain.com/api
// For Docker/K8s:      pass VITE_API_URL as a Docker build-arg  → baked into the bundle
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  // Expose the base URL so multipart methods can use it directly
  readonly baseUrl = API_BASE_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    console.log(`🔄 Making API request to: ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`📤 Request config:`, { method: config.method || 'GET', url, hasAuth: !!token });
      
      const response = await fetch(url, config);
      
      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error(`❌ API Error:`, errorData);
        } catch {
          console.error(`❌ Failed to parse error response for ${response.status}`);
        }
        throw new ApiError(response.status, errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success:`, { endpoint, dataReceived: !!data });
      return data;
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network error
      console.error(`🔥 Network Error:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to backend at ${url}. Check VITE_API_URL env variable.`);
      }
      
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  async login(credentials: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { name: string; email: string; password: string; phone?: string }) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async validateInvitation(token: string) {
    return this.request<{ valid: boolean; invitation?: any }>(`/auth/validate-invitation?token=${token}`, {
      method: 'GET',
    });
  }

  async registerBarber(barberData: {
    token: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    specializations?: string;
  }) {
    return this.request<{ user: any; token: string; barber: any; message: string }>('/auth/register-barber', {
      method: 'POST',
      body: JSON.stringify(barberData),
    });
  }

  async getSession() {
    return this.request<{ user: any; session: any }>('/auth/session');
  }

  async logout() {
    return this.request<{ message: string }>('/auth/signout', {
      method: 'POST',
    });
  }

  // ============================================
  // SERVICES ENDPOINTS
  // ============================================
  async getServices() {
    return this.request<any[]>('/services');
  }

  async getService(id: string) {
    return this.request<any>(`/services/${id}`);
  }

  async createService(serviceData: {
    name: string;
    description?: string;
    duration: number;
    price: number;
  }) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: string, serviceData: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
  }) {
    return this.request<any>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: string) {
    return this.request<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // BARBERS ENDPOINTS
  // ============================================
  async getBarbers() {
    return this.request<any[]>('/barbers');
  }

  async getBarber(id: string) {
    return this.request<any>(`/barbers/${id}`);
  }

  async createBarber(barberData: {
    name: string;
    email: string;
    specializations?: string;
  }) {
    return this.request<any>('/barbers', {
      method: 'POST',
      body: JSON.stringify(barberData),
    });
  }

  async updateBarber(id: string, barberData: {
    name?: string;
    phone?: string;
    specializations?: string;
    isActive?: boolean;
  }) {
    return this.request<any>(`/barbers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(barberData),
    });
  }

  async deleteBarber(id: string) {
    return this.request<{ message: string }>(`/barbers/${id}`, {
      method: 'DELETE',
    });
  }

  // Barber time off
  async createTimeOff(barberData: {
    allDay: boolean;
    start?: string;
    end?: string;
    reason?: string;
  }) {
    return this.request<any>('/barbers/time-off', {
      method: 'POST',
      body: JSON.stringify(barberData),
    });
  }

  async getBarberTimeOff() {
    return this.request<any[]>('/barbers/time-off');
  }

  async updateTimeOff(id: string, timeOffData: {
    allDay?: boolean;
    start?: string;
    end?: string;
    reason?: string;
  }) {
    return this.request<any>(`/barbers/time-off/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(timeOffData),
    });
  }

  async deleteTimeOff(id: string) {
    return this.request<{ message: string }>(`/barbers/time-off/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // APPOINTMENTS ENDPOINTS
  // ============================================
  
  // Customer endpoints
  async createAppointment(appointmentData: {
    barberId: string;
    serviceId: string;
    start: string;
    note?: string;
  }) {
    return this.request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments() {
    return this.request<any[]>('/appointments/me');
  }

  async getAppointment(id: string) {
    return this.request<any>(`/appointments/${id}`);
  }

  async updateAppointment(id: string, appointmentData: {
    barberId?: string;
    serviceId?: string;
    start?: string;
    note?: string;
  }) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(appointmentData),
    });
  }

  async cancelAppointment(id: string) {
    return this.request<{ message: string }>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Barber endpoints
  async getBarberAppointments() {
    return this.request<any[]>('/appointments/barber/my-appointments');
  }

  async updateAppointmentStatus(id: string, statusData: { status: string }) {
    return this.request<any>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  // Barber: get my profile
  async getMyBarberProfile() {
    return this.request<any>('/barbers/me');
  }

  // Barber: update my profile (Name, Phone, Specializations, + attached photo File together)
  async updateMyBarberProfile(data: {
    name?: string;
    phone?: string;
    specializations?: string;
    image?: string;
    file?: File | null;
  }) {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    // If an image file was selected from device, send ONE single multipart form data request
    if (data.file) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.phone) formData.append('phone', data.phone);
      if (data.specializations) formData.append('specializations', data.specializations);
      if (data.image) formData.append('image', data.image);
      formData.append('file', data.file);

      const response = await fetch(`${API_BASE_URL}/barbers/me`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update barber profile');
      }

      return response.json();
    }

    // Standard JSON request
    return this.request<any>('/barbers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Barber: upload avatar image file via backend endpoint
  async uploadMyBarberAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/barbers/me/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload avatar image');
    }

    return response.json();
  }

  // Barber: get my own time-off
  async getMyTimeOff() {
    return this.request<any[]>('/barbers/me/time-off');
  }

  // Barber: create my own time-off
  async createMyTimeOff(data: { allDay: boolean; start?: string; end?: string; reason?: string }) {
    return this.request<any>('/barbers/me/time-off', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Barber: update my own time-off
  async updateMyTimeOff(timeOffId: string, data: { allDay?: boolean; start?: string; end?: string; reason?: string }) {
    return this.request<any>(`/barbers/me/time-off/${timeOffId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Barber: delete my own time-off
  async deleteMyTimeOff(timeOffId: string) {
    return this.request<any>(`/barbers/me/time-off/${timeOffId}`, { method: 'DELETE' });
  }

  // Admin: get time-off for a specific barber
  async adminGetBarberTimeOff(barberId: string) {
    return this.request<any[]>(`/barbers/admin/${barberId}/time-off`);
  }

  // Admin: create time-off for a specific barber
  async adminCreateBarberTimeOff(barberId: string, data: { allDay: boolean; start?: string; end?: string; reason?: string }) {
    return this.request<any>(`/barbers/admin/${barberId}/time-off`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin: update any barber's time-off (blocked by backend if started)
  async adminUpdateTimeOff(timeOffId: string, data: { allDay?: boolean; start?: string; end?: string; reason?: string }) {
    return this.request<any>(`/barbers/admin/time-off/${timeOffId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Admin: delete any barber's time-off (blocked by backend if started)
  async adminDeleteTimeOff(timeOffId: string) {
    return this.request<any>(`/barbers/admin/time-off/${timeOffId}`, { method: 'DELETE' });
  }

  // ============================================
  // ADMIN: SHOP CLOSURES
  // ============================================
  async getShopClosures() {
    return this.request<any[]>('/appointments/admin/shop-closures');
  }

  async createShopClosure(data: { allDay: boolean; start?: string; end?: string; reason?: string }) {
    return this.request<any>('/appointments/admin/shop-closures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShopClosure(id: string, data: { allDay?: boolean; start?: string; end?: string; reason?: string }) {
    return this.request<any>(`/appointments/admin/shop-closures/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteShopClosure(id: string) {
    return this.request<any>(`/appointments/admin/shop-closures/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAllAppointments() {
    return this.request<any[]>('/appointments/admin/all');
  }

  async deleteAppointment(id: string) {
    return this.request<{ message: string }>(`/appointments/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // AVAILABILITY HELPER
  // ============================================
  async getAvailability(date: string, serviceId?: string, barberId?: string) {
    const params = new URLSearchParams();
    params.append('date', date);
    if (serviceId) params.append('serviceId', serviceId);
    if (barberId) params.append('barberId', barberId);
    
    return this.request<any[]>(`/appointments/availability?${params.toString()}`);
  }

  // Legacy method - keeping for backward compatibility
  async getBarberAvailability(barberId: string, date: string) {
    return this.getAvailability(date, undefined, barberId);
  }
}

export const apiService = new ApiService();