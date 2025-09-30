
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../../src/api/axiosConfig';
import { getBlogs, getBlogById, createBlog, fetchAdminBlogs, updateBlog, deleteBlog } from '../../../src/api/services/blog';
import { ENDPOINTS } from '../../../src/api/endpoints';

vi.mock('../../../src/api/axiosConfig');

describe('Blog Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getBlogs', () => {
    it('should fetch blogs successfully', async () => {
      const mockData = [{ id: 1, title: 'Blog 1' }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await getBlogs();

      expect(api.get).toHaveBeenCalledWith(ENDPOINTS.blogs);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching blogs', async () => {
      const mockError = new Error('Failed to fetch blogs');
      api.get.mockRejectedValue(mockError);

      await expect(getBlogs()).rejects.toThrow('Failed to fetch blogs');
    });
  });

  describe('getBlogById', () => {
    it('should fetch a blog by ID successfully', async () => {
      const mockData = { id: 1, title: 'Blog 1' };
      api.get.mockResolvedValue({ data: mockData });

      const result = await getBlogById(1);

      expect(api.get).toHaveBeenCalledWith(ENDPOINTS.blogById(1));
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching a blog by ID', async () => {
      const mockError = new Error('Failed to fetch blog');
      api.get.mockRejectedValue(mockError);

      await expect(getBlogById(1)).rejects.toThrow('Failed to fetch blog');
    });
  });

  describe('createBlog', () => {
    it('should create a blog successfully', async () => {
      const blogData = { title: 'New Blog', content: 'Content' };
      const mockData = { id: 2, ...blogData };
      api.postForm.mockResolvedValue({ data: mockData });

      const result = await createBlog(blogData);

      expect(api.postForm).toHaveBeenCalledWith(ENDPOINTS.blogs, blogData);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when creating a blog', async () => {
      const blogData = { title: 'New Blog', content: 'Content' };
      const mockError = new Error('Failed to create blog');
      api.postForm.mockRejectedValue(mockError);

      await expect(createBlog(blogData)).rejects.toThrow('Failed to create blog');
    });
  });

  describe('fetchAdminBlogs', () => {
    it('should fetch admin blogs successfully', async () => {
      const mockData = [{ id: 1, title: 'Admin Blog 1' }];
      api.get.mockResolvedValue({ data: mockData });

      const result = await fetchAdminBlogs();

      expect(api.get).toHaveBeenCalledWith(ENDPOINTS.adminBlogs);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching admin blogs', async () => {
      const mockError = new Error('Failed to fetch admin blogs');
      api.get.mockRejectedValue(mockError);

      await expect(fetchAdminBlogs()).rejects.toThrow('Failed to fetch admin blogs');
    });
  });

  describe('updateBlog', () => {
    it('should update a blog successfully', async () => {
      const blogData = { title: 'Updated Blog', content: 'Updated Content' };
      const mockData = { id: 1, ...blogData };
      api.putForm.mockResolvedValue({ data: mockData });

      const result = await updateBlog(1, blogData);

      expect(api.putForm).toHaveBeenCalledWith(ENDPOINTS.blogById(1), blogData);
      expect(result).toEqual(mockData);
    });

    it('should handle errors when updating a blog', async () => {
      const blogData = { title: 'Updated Blog', content: 'Updated Content' };
      const mockError = new Error('Failed to update blog');
      api.putForm.mockRejectedValue(mockError);

      await expect(updateBlog(1, blogData)).rejects.toThrow('Failed to update blog');
    });
  });

  describe('deleteBlog', () => {
    it('should delete a blog successfully', async () => {
      const mockData = { message: 'Blog deleted successfully' };
      api.delete.mockResolvedValue({ data: mockData });

      const result = await deleteBlog(1);

      expect(api.delete).toHaveBeenCalledWith(ENDPOINTS.blogById(1));
      expect(result).toEqual(mockData);
    });

    it('should handle errors when deleting a blog', async () => {
      const mockError = new Error('Failed to delete blog');
      api.delete.mockRejectedValue(mockError);

      await expect(deleteBlog(1)).rejects.toThrow('Failed to delete blog');
    });
  });
});
