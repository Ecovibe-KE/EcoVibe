import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCurrentUser, updateUserProfile } from "../api/services/profile";
import styles from "../css/ProfilePage.module.css";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUser();
        if (response?.status === "success") {
          setFormData(response.data);
        } else {
          toast.error(`Error: ${response?.message || "Failed to load profile"}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await updateUserProfile(formData);
      if (response?.status === "success") {
        toast.success("Profile updated successfully 🎉");
      } else {
        toast.error(`Error: ${response?.message || "Update failed"}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-4">Loading profile...</p>;
  }

  return (
    <div className={`container-fluid py-4 ${styles.profilePage}`}>
      {/* Header */}
      <div className="card shadow-sm mb-4 p-4 d-flex flex-row align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className={`${styles.avatarCircle} me-3`}>
            <span className={styles.initials}>
              {formData.name ? formData.name[0] : "?"}
            </span>
          </div>
          <div>
            <h5 className="mb-0">{formData.name}</h5>
            <small className="text-muted">Sustainability Manager</small>
            <div>
              <span className="badge bg-success mt-1">Client</span>{" "}
              <span className="badge bg-light text-dark">
                GreenTech Solutions Ltd
              </span>
            </div>
          </div>
        </div>
        <div>
          <button
            type="submit"
            form="profileForm"
            className="btn btn-success me-2"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn btn-outline-secondary">Cancel</button>
        </div>
      </div>

      {/* Form */}
      <div className="card shadow-sm p-4">
        <h6 className="mb-3">Personal Information</h6>
        <form id="profileForm" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
