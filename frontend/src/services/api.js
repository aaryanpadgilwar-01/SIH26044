const API_BASE = '/api/v1';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.getItem('token');
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  },
  register: async (registerData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: registerData,
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  },
  getMe: () => apiRequest('/auth/me'),
  logout: () => {
    clearAuth();
  },

  // Student Portal
  getDashboardSummary: () => apiRequest('/students/dashboard-summary'),
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/students/cv-upload', {
      method: 'POST',
      body: formData,
    });
  },
  getStudentSkills: () => apiRequest('/students/skills'),
  addSkill: (name, category = 'General', status = 'present') =>
    apiRequest('/students/skills', {
      method: 'POST',
      body: { name, category, status },
    }),
  getSkillTest: (skillId) => apiRequest(`/students/test/${skillId}`),
  submitSkillTest: (skillId, answers) =>
    apiRequest(`/students/test/${skillId}/submit`, {
      method: 'POST',
      body: { answers },
    }),
  getStudentProfile: () => apiRequest('/students/profile'),
  updateStudentProfile: (profileData) =>
    apiRequest('/students/profile', {
      method: 'PUT',
      body: profileData,
    }),

  // Jobs
  getRecommendedJobs: (params = {}) => {
    const query = new URLSearchParams();
    if (params.query) query.append('query', params.query);
    if (params.location && params.location !== 'All Locations') query.append('location', params.location);
    if (params.job_type && params.job_type !== 'All Job Types') query.append('job_type', params.job_type);
    if (params.platform && params.platform !== 'All Platforms') query.append('platform', params.platform);
    return apiRequest(`/jobs/recommended?${query.toString()}`);
  },
  applyToJob: (jobId) =>
    apiRequest(`/jobs/${jobId}/apply`, {
      method: 'POST',
    }),
  getMyApplications: () => apiRequest('/jobs/my-applications'),

  // Industry Portal
  getCompanyProfile: () => apiRequest('/industry/company'),
  updateCompanyProfile: (companyData) =>
    apiRequest('/industry/company', {
      method: 'PUT',
      body: companyData,
    }),
  getCompanyJobs: () => apiRequest('/industry/jobs'),
  postJob: (jobData) =>
    apiRequest('/industry/jobs', {
      method: 'POST',
      body: jobData,
    }),
  getJobCandidates: (jobId) => apiRequest(`/industry/jobs/${jobId}/candidates`),
  updateApplicationStatus: (appId, status) =>
    apiRequest(`/industry/applications/${appId}/status`, {
      method: 'PUT',
      body: { status },
    }),

  // Institution Portal
  getBatches: () => apiRequest('/institutions/batches'),
  getBatchStats: (batch) => apiRequest(`/institutions/batches/${encodeURIComponent(batch)}/stats`),
  getBatchGapAnalysis: (batch) => apiRequest(`/institutions/batches/${encodeURIComponent(batch)}/gap-analysis`),
  getBatchRoster: (batch) => apiRequest(`/institutions/batches/${encodeURIComponent(batch)}/roster`),
};
