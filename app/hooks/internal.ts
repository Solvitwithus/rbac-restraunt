import axios from "axios";

export const useInternalHooks = () => {
  // Function to create a role
  async function createRole(payload: {
    roleName: string;
    permissions: Record<string, boolean>;
    staffId?: string;
  }) {
    try {
      const response = await axios.post("/api/roles", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error creating role:", error);
      // Optional: return structured error
      return { error: error.response?.data || error.message };
    }
  }

async function fetchRoles(id?: string) {
    try {
      const url = id ? `/api/roles?id=${id}` : "/api/roles";
      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data; // { roles: [ { id, name, permissions: [{ name, value }] } ] }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      return { error: error.response?.data || error.message };
    }
  }

  return {
    createRole,fetchRoles
  };

};
