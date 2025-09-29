import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import "../../css/ResourceCenter.css";
import { toast } from "react-toastify";
import {
  createResource,
  getResources,
  updateResource,
  downloadResource,
  deleteResource,
} from "../../api/services/resourceCenter";
import AddResourceModal from "./Addresource";
import EditResourceModal from "./Editresource";
import ViewResourceModal from "./ViewResourceModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "../../utils/Button";
import DeleteConfirmModal from "./DeleteConfirmModal";

const ResourceCenter = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [setLoading] = useState(false);
  const [error, setErrors] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    file: null,
    status: "active",
  });
  const sampleResources = [
    {
      id: 1,
      title: "Sustainability Report 2024",
      category: "esgReports",
      uploadedAt: "2024-12-12",
      downloads: 34,
      status: "active",
      author: "john doe",
      description: "test",
      fileUrl: "https://example.com/report.pdf",
    },
    {
      id: 2,
      title: "Company Policy Template",
      category: "templates",
      uploadedAt: "2024-11-01",
      downloads: 12,
      status: "pending",
      fileUrl: "https://example.com/template.docx",
      author: "john doe",
      description: "test",
    },
    {
      id: 3,
      title: "Quarterly ESG Policy",
      category: "Policies",
      uploadedAt: "2024-10-20",
      downloads: 7,
      status: "archived",
      fileUrl: "https://example.com/policy.pdf",
      author: "john doe",
      description: "test",
    },
  ];

  const [resources, setResources] = useState(sampleResources);
  const fetchData = async (page = 1) => {
    setLoading(true);
    setErrors("");
    try {
      const data = await getResources(page, pageSize);
      setResources(data.results || data);

      // Fallback to sample data (for testing/demo)
      setResources(
        sampleResources.slice((page - 1) * pageSize, page * pageSize),
      );

      setTotalPages(Math.ceil(sampleResources.length / pageSize));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      fetchData(page);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.fileType || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || res.category === selectedCategory;

    const matchesFileType =
      selectedFileType === "" || res.fileType === selectedFileType;

    const matchesStatus =
      selectedStatus === "" || res.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesFileType && matchesStatus;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    let newErrors = {};
    if (!form.title) newErrors.title = "Title is required";
    if (!form.author) newErrors.author = "Author is required";
    if (!form.description) newErrors.description = "Description is required";
    if (!form.file) newErrors.file = "File is required";
    if (!form.category) newErrors.category = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("file", form.file);
      formData.append("status", form.status);

      const response = await createResource(formData);
      if (response.status === 201 || response.status === 200) {
        toast.success("Resource added successfully!");
        await fetchData();
        setShowAddModal(false);

        setForm({
          title: "",
          author: "",
          description: "",
          category: "",
          file: null,
          status: "active",
        });
        setErrors({});
      } else {
        toast.error("Failed to save resource");
      }
    } catch (err) {
      console.error("Error saving resource:", err);
      toast.error("Failed to save resource");
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setShowEditModal(true);
  };
  const handleView = (resource) => {
    setSelectedResource(resource);
    setShowViewModal(true);
  };

  const handleSaveEdit = async (form) => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("status", form.status);
      if (form.file) {
        formData.append("file", form.file);
      }

      const response = await updateResource(formData);

      if (response.status === 200) {
        toast.success("Resource updated successfully!");
        await fetchData();
        setShowEditModal(false);
      } else {
        toast.error("Failed to update resource");
      }
    } catch (err) {
      console.error("Error updating resource:", err);
      toast.error("Failed to update resource");
    }
  };

  const handleDeleteClick = (resource) => {
    setDeleteTarget(resource);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteResource(deleteTarget.id);

      if (response.status === 200) {
        toast.success("Resource deleted successfully");
        await fetchData();
      } else {
        toast.error(response.data?.message || "Failed to delete resource");
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
      toast.error(err.response?.data?.message || "Failed to delete resource");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <section className="my-3 mx-2 bg-white rounded-4 py-5 px-3">
        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle pb-2">
          <p className="fw-bold m-0">Manage Resources</p>
          <Button
            action="add"
            label="Add Resource"
            hoverColor="none"
            onClick={() => setShowAddModal(true)}
          />
        </div>
        <div className="row g-3 m-3 align-items-end justify-content-between">
          <div className="col-12 col-md-3">
            <label htmlFor="categories" className="form-label">
              Category
            </label>
            <select
              id="categories"
              name="categories"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              <option value="esgReports">ESG Reports</option>
              <option value="templates">Templates</option>
              <option value="Policies">Policies</option>
              <option value="sustainability">Sustainability</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="fileTypes" className="form-label">
              File type
            </label>
            <select
              id="fileTypes"
              name="fileTypes"
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="form-select"
            >
              <option value="">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="xlsx">XLSX</option>
              <option value="pptx">PPTX</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label d-none d-md-block">&nbsp;</label>
            <div className="position-relative">
              <SearchIcon className="search-icon" />
              <input
                type="search"
                className="form-control ps-5"
                placeholder="Search resources..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Resource</th>
                <th>Category</th>
                <th>Uploaded</th>
                <th>Downloads</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((res) => (
                  <tr key={res.id} className="">
                    <td>{res.title}</td>
                    <td>{res.category}</td>
                    <td>{new Date(res.uploadedAt).toLocaleDateString()}</td>
                    <td>{res.downloads}</td>
                    <td>
                      <span
                        className={`badge-status ${
                          res.status === "active"
                            ? "badge-active"
                            : res.status === "pending"
                              ? "badge-pending"
                              : "badge-archived"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1 align-items-center h-100">
                        <button
                          className="btn btn-sm bg-success text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                          onClick={() => downloadResource(res.id, res.title)}
                        >
                          <DownloadIcon />
                        </button>
                        <button
                          className="btn btn-sm text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                          style={{ background: "#3ba6ff" }}
                          onClick={() => handleView(res)}
                        >
                          <RemoveRedEyeIcon />
                        </button>
                        <button
                          className="btn btn-sm text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                          style={{ background: "#eb7d00" }}
                          onClick={() => handleEdit(res)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn btn-sm bg-danger text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                          onClick={() => handleDeleteClick(res)}
                        >
                          <DeleteForeverIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No resources found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, idx) => (
                <li
                  key={idx}
                  className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
      <AddResourceModal
        visible={showAddModal}
        form={form}
        errors={error}
        onChange={handleChange}
        onCancel={() => setShowAddModal(false)}
        onSave={handleSave}
      />
      <EditResourceModal
        visible={showEditModal}
        resource={selectedResource}
        onCancel={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
      <ViewResourceModal
        visible={showViewModal}
        resource={selectedResource}
        onCancel={() => setShowViewModal(false)}
        onDownload={downloadResource} // pass function as prop
      />
      <DeleteConfirmModal
        visible={showDeleteModal}
        resource={deleteTarget}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};
export default ResourceCenter;
