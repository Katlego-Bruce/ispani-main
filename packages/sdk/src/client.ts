import type { Job, User } from '@ispani/shared';

export class IspaniClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  // TODO: Add API methods as endpoints are built
  async getJobs(): Promise<Job[]> {
    return this.request('/jobs');
  }

  async getProfile(): Promise<User> {
    return this.request('/users/me');
  }
}
