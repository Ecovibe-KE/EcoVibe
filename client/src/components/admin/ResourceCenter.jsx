import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import "../../css/ResourceCenter.css";
import { toast } from "react-toastify";
import {
  uploadDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  downloadDocument,
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
import { Feed, Star, AccessTime } from "@mui/icons-material";
import { getCurrentUser } from "../../api/services/profile";

const ResourceCenter = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [error, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState("");
  const [resources, setResources] = useState([]);
  const [userId, setUserId] = useState();

  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null,
  });

  // ---- Data fetching ----
  const fetchData = async (page = 1) => {
    setErrors("");
    try {
      const docs = await getDocuments(page, pageSize);
      setResources(docs);
      setTotalPages(1); // if you want pagination, return from backend
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const fetchRole = async () => {
      const response = await getCurrentUser();
      setRole(response.data.role);
      setUserId(response.data.id);
    };
    fetchRole();
  }, []);

  // ---- Filtering ----
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      (res.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.mimetype || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFileType =
      selectedFileType === "" || res.mimetype === selectedFileType;

    return matchesSearch && matchesFileType;
  });

  // ---- Form handling ----
  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSave = async () => {
    let newErrors = {};
    if (!form.title) newErrors.title = "Title is required";
    if (!form.description) newErrors.description = "Description is required";
    if (!form.file) newErrors.file = "File is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("file", form.file);
      if (userId) formData.append("admin_id", userId);

      await uploadDocument(formData);
      toast.success("Document uploaded successfully!");
      await fetchData();
      setShowAddModal(false);
      setErrors({});
      setForm({ title: "", description: "", file: null });
    } catch (err) {
      console.error("Error saving resource:", err);
      toast.error("Failed to save resource");
    }
  };

  const handleSaveEdit = async (form) => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.file) formData.append("file", form.file);

      await updateDocument(selectedResource.id, formData);
      toast.success("Resource updated successfully!");
      await fetchData();
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating resource:", err);
      toast.error("Failed to update resource");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDocument(deleteTarget.id);
      toast.success("Document deleted successfully");
      await fetchData();
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ---- Download helper ----
  const handleDownload = async (res) => {
    try {
      const fileRes = await downloadDocument(res.id);
      const url = URL.createObjectURL(
        new Blob([fileRes.data], { type: res.mimetype })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = res.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download file");
    }
  };

  // ---- Render ----
  return (
    <>
      {role === "client" && (
        <section>
          <div className="row g-4">
            {resources.map((res, index) => (
              <div className="col-12 col-md-6 col-lg-4" key={index}>
                <div className="card h-100 shadow-sm border-0 p-4 text-start rounded-3">
                  <div className="d-flex align-items-center gap-2 mb-2 justify-content-between" style={{ height: "35px" }}>
                    <div className="d-flex gap-2 document-header fw-bold px-3 py-1 rounded-5">
                      <Feed /> <p className="m-0">Document</p>
                    </div>
                    <Star className="star" />
                  </div>
                  <h5 className="fw-bold mb-1">{res.title}</h5>
                  <p className="text-muted text-justify">{res.description}</p>
                  <div className="d-flex gap-1 text-muted w-100 justify-content-end m-0">
                    <AccessTime className="m-0" />
                    <p className="m-0">
                      {new Date(res.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button label="Download" onClick={() => handleDownload(res)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {role === "admin" && (
        <section className="my-3 mx-2 bg-white rounded-4 py-5 px-3">
          <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle pb-2">
            <p className="fw-bold m-0">Manage Resources</p>
            <Button action="add" label="Add Resource" color="#FFFFFF" onClick={() => setShowAddModal(true)} />
          </div>

          {/* search + filter */}
          <div className="row g-3 m-3 align-items-end justify-content-between">
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
                <option value="application/pdf">PDF</option>
                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">XLSX</option>
                <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">PPTX</option>
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

          {/* resources table */}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th>Resource</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.length > 0 ? (
                  filteredResources.map((res) => (
                    <tr key={res.id}>
                      <td>{res.title}</td>
                      <td>{new Date(res.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1 align-items-center h-100">
                          <button
                            className="btn btn-sm text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                            onClick={() => handleDownload(res)}
                            style={{ background: "#37b137" }}
                          >
                            <DownloadIcon />
                          </button>
                          <button
                            className="btn btn-sm text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                            style={{ background: "#3ba6ff" }}
                            onClick={() => setShowViewModal(true) || setSelectedResource(res)}
                          >
                            <RemoveRedEyeIcon />
                          </button>
                          <button
                            className="btn btn-sm text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                            style={{ background: "#eb7d00" }}
                            onClick={() => setShowEditModal(true) || setSelectedResource(res)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="btn btn-sm bg-danger text-white d-flex align-items-center justify-content-center rounded-1 rc-action-button"
                            onClick={() => setShowDeleteModal(true) || setDeleteTarget(res)}
                          >
                            <DeleteForeverIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No resources found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modals */}
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
        onDownload={handleDownload}
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
