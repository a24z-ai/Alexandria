/**
 * Alexandria API Client
 * Handles all communication with the Alexandria backend API
 */

import type { CodebaseViewSummary } from 'a24z-memory';

export interface Repository {
  id: string;
  owner: string;
  name: string;
  description: string;
  stars: number;
  hasViews: boolean;
  viewCount: number;
  views: CodebaseViewSummary[];
  lastUpdated: string;
  tags?: string[];
  metadata?: {
    primaryLanguage?: string | null;
    topics?: string[];
    license?: string | null;
    lastCommit?: string | null;
    defaultBranch?: string;
  };
  registeredAt?: string;
  lastChecked?: string;
}

export interface RepositoriesResponse {
  repositories: Repository[];
  total: number;
  lastUpdated: string;
}

export interface RegisterRepositoryRequest {
  owner: string;
  name: string;
  branch?: string;
}

export interface RegisterRepositoryResponse {
  success: boolean;
  repository: {
    id: string;
    owner: string;
    name: string;
    status: 'registered' | 'updated';
    message: string;
    hasViews: boolean;
    viewCount: number;
    views: CodebaseViewSummary[];
  };
}

export interface APIError {
  error: {
    code: string;
    message: string;
  };
}

export class AlexandriaAPI {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = 'https://git-gallery.com') {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set custom headers (e.g., for authentication)
   */
  setHeaders(headers: HeadersInit): void {
    this.headers = { ...this.headers, ...headers };
  }

  /**
   * Fetch all registered repositories
   */
  async getRepositories(): Promise<RepositoriesResponse> {
    const response = await fetch(`${this.baseUrl}/api/alexandria/repos`, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-cache'
    });

    if (!response.ok) {
      const error = await response.json() as APIError;
      throw new Error(error.error?.message || `Failed to fetch repositories: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch a specific repository by owner and name
   */
  async getRepository(owner: string, name: string): Promise<Repository> {
    const response = await fetch(`${this.baseUrl}/api/alexandria/repos/${owner}/${name}`, {
      method: 'GET',
      headers: this.headers,
      cache: 'no-cache'
    });

    if (!response.ok) {
      const error = await response.json() as APIError;
      throw new Error(error.error?.message || `Failed to fetch repository ${owner}/${name}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Register a new repository or update an existing one
   */
  async registerRepository(request: RegisterRepositoryRequest): Promise<RegisterRepositoryResponse> {
    const response = await fetch(`${this.baseUrl}/api/alexandria/repos`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json() as APIError;
      throw new Error(error.error?.message || `Failed to register repository: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch raw markdown content for a view
   * This goes directly to GitHub for now but could be proxied through the API later
   */
  async getViewContent(owner: string, repo: string, docPath: string, branch: string = 'main'): Promise<string> {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${docPath}`;
    
    // Note: raw.githubusercontent.com doesn't support custom headers (triggers CORS preflight)
    // Using cache: 'no-cache' only, which doesn't trigger preflight
    const response = await fetch(url, {
      cache: 'no-cache'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Search repositories (if/when this endpoint is added to the API)
   */
  async searchRepositories(query: string, filters?: {
    tags?: string[];
    hasViews?: boolean;
    language?: string;
  }): Promise<RepositoriesResponse> {
    const params = new URLSearchParams({ q: query });
    
    if (filters?.tags?.length) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.hasViews !== undefined) {
      params.append('hasViews', String(filters.hasViews));
    }
    if (filters?.language) {
      params.append('language', filters.language);
    }

    const response = await fetch(`${this.baseUrl}/api/alexandria/repos/search?${params}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.json() as APIError;
      throw new Error(error.error?.message || `Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh repository data from GitHub
   */
  async refreshRepository(owner: string, name: string): Promise<Repository> {
    const response = await fetch(`${this.baseUrl}/api/alexandria/repos/${owner}/${name}/refresh`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      const error = await response.json() as APIError;
      throw new Error(error.error?.message || `Failed to refresh repository: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export a default instance for convenience
export const alexandriaAPI = new AlexandriaAPI();