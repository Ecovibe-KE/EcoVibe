import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Blog service
export const getBlogs = async () => {
  try {
    const response = await api.get(ENDPOINTS.blogs);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch blogs",
    );
  }
};

export const getBlogById = async (id) => {
  try {
    const response = await api.get(ENDPOINTS.blogById(id));
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to fetch blog",
    );
  }
};
