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

export const createBlog = async (blogData) => {
  const response = await api.postForm(ENDPOINTS.blogs, blogData);
  return response.data;
};

export const fetchAdminBlogs = async () => {
  const response = await api.get(ENDPOINTS.adminBlogs);
  return response.data;
};

export const updateBlog = async (id, blogData) => {
  const response = await api.putForm(ENDPOINTS.blogById(id), blogData);
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(ENDPOINTS.blogById(id));
  return response.data;
};
