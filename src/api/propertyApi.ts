export const propertyApi = {
  async fetchAll() {
    const res = await fetch("/api/properties");
    if (!res.ok) throw new Error("Failed to fetch properties");
    const json = await res.json();
    return json.data;
  },

  async fetchMine() {
    const res = await fetch("/api/properties?mine=true");
    if (!res.ok) throw new Error("Failed to fetch properties");
    const json = await res.json();
    return json.data;
  },

  async create(data: FormData | any) {
    const res = await fetch("/api/properties", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...(data instanceof FormData ? {} : { headers: { "Content-Type": "application/json" } })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      throw new Error(json.error || "Failed to create property");
    }
    return json.data;
  },

  async update(id: string, data: FormData | any) {
    const res = await fetch(`/api/properties/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      ...(data instanceof FormData ? {} : { headers: { "Content-Type": "application/json" } })
    });
    if (!res.ok) throw new Error("Failed to update property");
    const json = await res.json();
    return json.data;
  },

  async delete(id: string) {
    const res = await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete property");
    return true;
  }
};
