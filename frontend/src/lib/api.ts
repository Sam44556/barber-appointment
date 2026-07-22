const API_BASE_URL = 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
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
        throw new Error(`Network error: Unable to connect to backend at ${url}. Please ensure the backend is running on http://localhost:3000`);
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
  async getBarberAvailability(barberId: string, date: string) {
    // This would need to be implemented in the backend
    // For now, we'll return a mock response
    const appointments = await this.getBarberAppointments();
    const dayAppointments = appointments.filter((apt: any) => 
      apt.barberId === barberId && 
      new Date(apt.start).toDateString() === new Date(date).toDateString()
    );
    
    // Generate available time slots (9 AM to 6 PM, excluding appointments)
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const datetime = `${date}T${timeString}:00.000Z`;
      
      const isBooked = dayAppointments.some((apt: any) => {
        const aptTime = new Date(apt.start);
        return aptTime.getHours() === hour;
      });
      
      if (!isBooked) {
        slots.push({
          time: timeString,
          datetime,
          available: true,
        });
      }
    }
    
    return slots;
  }
}

export const apiService = new ApiService();