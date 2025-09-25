import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Blog service
export const getBlogs = async () => {
  try {
    const response = await api.get(ENDPOINTS.blogs);
    const res = response.data;
    if (res.status === "success") {
      return res.data;
    } else {
      throw new Error(res.message || "Failed to fetch blogs");
    }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch blogs");
  }
};

export const getBlogById = async (id) => {
  try {
    const response = await api.get(ENDPOINTS.blogById(id));
    const res = response.data;
    if (res.status === "success") {
      return res.data;
    } else {
      throw new Error(res.message || "Failed to fetch blog");
    }
  } catch (error) {
    throw new Error(error.message || "Failed to fetch blog");
  }
};
