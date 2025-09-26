import React, { useMemo, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/UserManagement.css";
import Button from "../../utils/Button.jsx";
import AddUserModal from "./AddUserModal.jsx";
import EditUserModal from "./EditUserModal.jsx";
import DeleteUserModal from "./DeleteUserModal.jsx";
import ViewUserModal from "./ViewUserModal.jsx";
import BlockUserModal from "./BlockUserModal.jsx";
import StatusInfo from "./StatusInfo.jsx";
import {
  fetchUsers,
  addUsers,
  editUsers,
  blockUser,
  activateUser,
  deleteUsers,
} from "../../api/services/usermanagement.js";
import {
  validateEmail,
  validateName,
  validatePhone,
} from "../../utils/Validations.js";
import { toast } from "react-toastify";

const Card = ({ children }) => (
  <div className="w-100">
    <div
      className="shadow-sm"
      style={{ background: "#fff", borderRadius: 12, padding: 16 }}
    >
      {children}
    </div>
  </div>
);
const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [editErrors, setEditErrors] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Client",
    status: "Inactive",
  });
  const [addError, setAddError] = useState("");
  const [addFieldErrors, setAddFieldErrors] = useState({});
  const currentUserRole =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("userRole") || "Admin"
      : "Admin";

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersList = await fetchUsers();
        setUsers(usersList);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const totalItems = users.length;
  const totalPages = useMemo(() => {
    if (pageSize === "All") return 1;
    return Math.max(1, Math.ceil(totalItems / Number(pageSize)));
  }, [totalItems, pageSize]);

  const pagedUsers = useMemo(() => {
    if (pageSize === "All") return users;
    const start = (page - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    return users.slice(start, end);
  }, [page, pageSize, users]);

  const handlePageSizeChange = (e) => {
    const value = e.target.value === "All" ? "All" : Number(e.target.value);
    setPageSize(value);
    setPage(1);
  };

  const gotoPage = (p) => {
    const next = Math.min(Math.max(p, 1), totalPages);
    setPage(next);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUsers(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      closeDelete();
      toast.success("User deleted Successfully!");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const openBlock = (user) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const closeBlock = () => {
    setShowBlockModal(false);
    setSelectedUser(null);
  };
  const openUnblock = (user) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
  };
  const closeUnblock = () => {
    setShowUnblockModal(false);
    setSelectedUser(null);
  };

  const confirmBlock = async () => {
    if (!selectedUser) return;

    try {
      await blockUser(selectedUser.id, "Suspended");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Suspended" } : u,
        ),
      );
      closeBlock();
      toast.success("User Blocked Successfully!");
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Failed to block user. Please try again.");
    }
  };

  const confirmUnblock = async () => {
    if (!selectedUser) return;

    try {
      await activateUser(selectedUser.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Active" } : u,
        ),
      );
      closeUnblock();
      toast.success("User Unblocked Successfully!");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Failed to unblock user. Please try again.");
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const saveEdit = async () => {
    const errs = validateUserPayload(editForm);
    setEditErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (!selectedUser) return;

    try {
      const userData = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      };

      const updatedUser = await editUsers(selectedUser.id, userData);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)),
      );
      toast.success("User Successfully edited");
      closeEdit();
    } catch (error) {
      console.error("Failed to edit user:", error);
      toast.error("Failed to update user. Please try again.");
      setEditErrors({ general: "Failed to update user. Please try again." });
    }
  };

  const openView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const closeView = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  const openAdd = () => {
    setAddForm({
      name: "",
      email: "",
      phone: "",
      role: "Client",
      status: "Inactive",
    });
    setAddError("");
    setShowAddModal(true);
  };

  const viewAllUsers = () => {
    setPageSize("All");
    setPage(1);
  };

  const closeAdd = () => {
    setShowAddModal(false);
  };

  const onAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addError) setAddError("");
    setAddFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const saveAdd = async () => {
    // Enforce role restriction: only SuperAdmin may create Admins
    if (currentUserRole !== "SuperAdmin" && addForm.role === "Admin") {
      toast.error("Only SuperAdmin can create Admin accounts.");
      setAddError("Only SuperAdmin can create Admin accounts.");
      return;
    }
    const errs = validateUserPayload(addForm);
    setAddFieldErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    try {
      const userData = {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        role: addForm.role,
        status: "Inactive",
      };

      const newUser = await addUsers(userData);
      setUsers((prev) => [newUser, ...prev]);
      setShowAddModal(false);
      toast.success("User added successfully.");
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user. Please try again.");
      setAddError("Failed to add user. Please try again.");
    }
  };

  const validateField = (name, value) => {
    if (name === "email") return validateEmail(value);
    if (name === "phone") return validatePhone(value);
    if (name === "name") return validateName(value);
    return "";
  };

  const validateUserPayload = (payload) => {
    return {
      name: validateName(payload.name),
      email: validateEmail(payload.email),
      phone: validatePhone(payload.phone),
    };
  };

  return (
    <div className="container-fluid mt-4 mb-4">
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">User Management</h5>
          <div>
            <Button
              action="add"
              label="Add User"
              size="sm"
              hoverTextColor="#000000"
              onClick={openAdd}
            />
            <Button
              action="view"
              label="View All"
              size="sm"
              onClick={viewAllUsers}
            />
          </div>
        </div>

        <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
          <span className="text-muted">Show</span>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{ width: 90 }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value="All">All</option>
          </select>
          <span className="text-muted">entries</span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th className="fw-semibold">Name</th>
                <th className="fw-semibold">Email</th>
                <th className="fw-semibold">Phone</th>
                <th className="fw-semibold">Role</th>
                <th className="fw-semibold">Status</th>
                <th className="fw-semibold text-nowrap text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {pagedUsers.length > 0 ? (
                    pagedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.role}</td>
                        <td>
                          <StatusInfo status={user.status} />
                        </td>
                        <td className="text-nowrap text-end">
                          <Button
                            action="view"
                            label="View"
                            size="sm"
                            className="btn-fixed-width"
                            onClick={() => openView(user)}
                          />
                          <Button
                            action="update"
                            label="Edit"
                            size="sm"
                            className="btn-fixed-width"
                            onClick={() => openEdit(user)}
                          />

                          {/* Block/Unblock button logic */}
                          {user.status === "Active" && (
                            <Button
                              action="block"
                              label="Block"
                              size="sm"
                              className="btn-fixed-width"
                              onClick={() => openBlock(user)}
                            />
                          )}
                          {user.status === "Suspended" && (
                            <Button
                              action="unblock"
                              label="Unblock"
                              size="sm"
                              className="btn-fixed-width"
                              onClick={() => openUnblock(user)}
                            />
                          )}
                          {(user.status === "Inactive" ||
                            user.status === "Blocked") && (
                            <Button
                              action="block"
                              label="Block"
                              size="sm"
                              className="btn-fixed-width"
                              disabled
                            />
                          )}

                          <Button
                            action="delete"
                            label="Delete"
                            size="sm"
                            className="btn-fixed-width"
                            onClick={() => openDelete(user)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No users
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {pageSize !== "All" && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Showing {(page - 1) * Number(pageSize) + 1} to{" "}
              {Math.min(page * Number(pageSize), totalItems)} of {totalItems}{" "}
              entries
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => gotoPage(page - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${page === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => gotoPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => gotoPage(page + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </Card>
      <AddUserModal
        visible={showAddModal}
        addForm={addForm}
        addFieldErrors={addFieldErrors}
        currentUserRole={currentUserRole}
        addError={addError}
        onChange={onAddChange}
        onCancel={closeAdd}
        onSave={saveAdd}
      />
      <ViewUserModal
        visible={showViewModal}
        user={selectedUser}
        onClose={closeView}
      />
      <EditUserModal
        visible={showEditModal}
        form={editForm}
        errors={editErrors}
        onChange={onEditChange}
        onCancel={closeEdit}
        onSave={saveEdit}
      />
      {/* Block/Unblock Modal */}
      <BlockUserModal
        visible={showBlockModal}
        user={selectedUser}
        type="block"
        onCancel={closeBlock}
        onConfirm={confirmBlock}
      />
      <BlockUserModal
        visible={showUnblockModal}
        user={selectedUser}
        type="unblock"
        onCancel={closeUnblock}
        onConfirm={confirmUnblock}
      />
      <DeleteUserModal
        visible={showDeleteModal}
        user={selectedUser}
        onCancel={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UserManagement;
