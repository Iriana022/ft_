declare const api: {
  get<T = unknown>(url: string): Promise<{ data: T }>;
};

export default api;
