/**
 * Cloudflare Custom Hostname API Wrapper
 * This service handles registration and verification of custom domains
 * using Cloudflare for SaaS.
 */

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

interface CustomHostnameResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result: any;
}

export class CloudflareService {
  private apiToken: string;
  private zoneId: string;

  constructor(apiToken: string, zoneId: string) {
    this.apiToken = apiToken;
    this.zoneId = zoneId;
  }

  /**
   * Register a new custom hostname
   */
  async registerCustomHostname(hostname: string) {
    const url = `${CF_API_BASE}/zones/${this.zoneId}/custom_hostnames`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hostname,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: {
            http2: 'on',
            min_tls_version: '1.2'
          }
        }
      })
    });

    const data: CustomHostnameResponse = await response.json();
    return data;
  }

  /**
   * Get custom hostname status
   */
  async getCustomHostnameStatus(hostnameId: string) {
    const url = `${CF_API_BASE}/zones/${this.zoneId}/custom_hostnames/${hostnameId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data: CustomHostnameResponse = await response.json();
    return data;
  }

  /**
   * Delete custom hostname
   */
  async deleteCustomHostname(hostnameId: string) {
    const url = `${CF_API_BASE}/zones/${this.zoneId}/custom_hostnames/${hostnameId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data: CustomHostnameResponse = await response.json();
    return data;
  }

  /**
   * List custom hostnames for this zone
   */
  async listCustomHostnames(hostname?: string) {
    let url = `${CF_API_BASE}/zones/${this.zoneId}/custom_hostnames`;
    if (hostname) {
      url += `?hostname=${hostname}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data: CustomHostnameResponse = await response.json();
    return data;
  }
}
