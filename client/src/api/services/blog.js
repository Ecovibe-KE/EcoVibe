import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Blog service
export const getBlogs = async () => {
  const response = await api.get(ENDPOINTS.blogs);
  return response.data;
};

export const getBlogById = async (id) => {
  const response = await api.get(ENDPOINTS.blogById(id));
  return response.data;
};
