import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getCurrentUser,
  updateUserProfile,
  changePassword,
} from "../api/services/profile";
import Button from "../utils/Button";
import Input from "../utils/Input";
import styles from "../css/ProfilePage.module.css";

const ProfilePage = () => {
  // form state for editable fields
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    industry: "",
    profile_image_url: "",
    role: "",
  });

  // keep a copy of the server data so we can reset/cancel changes
  const [originalData, setOriginalData] = useState(null);

  // loading + saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // password change form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
  });
  const [changingPw, setChangingPw] = useState(false);

  // load profile data on first render
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUser();
        if (response?.status === "success") {
          setFormData(response.data);
          setOriginalData(response.data);
        } else {
          toast.error(
            `Error: ${response?.message || "Failed to load profile"}`,
          );
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

  // handle text input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // save profile updates to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        industry: formData.industry,
        profile_image_url: formData.profile_image_url,
      };

      const response = await updateUserProfile(payload);
      if (response?.status === "success") {
        toast.success("Profile updated successfully 🎉");

        // merge new changes with safe fallback if baseline wasn't set
        const updatedBaseline = response?.data ?? {
          ...(originalData ?? formData),
          ...payload,
        };

        setFormData((prev) => ({ ...prev, ...updatedBaseline }));
        setOriginalData(updatedBaseline);
      } else {
        if (response?.errors) {
          Object.values(response.errors).forEach((msg) => toast.error(msg));
        } else {
          toast.error(`Error: ${response?.message || "Update failed"}`);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  // restore form values back to the original data
  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  // update password for logged-in user
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      const response = await changePassword(passwords);
      if (response?.status === "success") {
        toast.success("Password changed successfully 🔑");
        setPasswords({ current_password: "", new_password: "" });
        setShowPasswordForm(false);
      } else {
        toast.error(`Error: ${response?.message || "Change failed"}`);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password ❌");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return <p className="p-4">Loading profile...</p>;
  }

  return (
    <div className={`container-fluid py-4 ${styles.profilePage}`}>
      {/* header: shows name, role, and action buttons */}
      <div className="card shadow-sm mb-4 p-4 d-flex flex-row align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className={`${styles.avatarCircle} me-3`}>
            <span className={styles.initials}>
              {formData.full_name ? formData.full_name.charAt(0) : "?"}
            </span>
          </div>
          <div>
            <h5 className="mb-0">{formData.full_name}</h5>
            <small className="text-muted">
              {formData.role === "ADMIN" ? "Admin" : "Client"}
            </small>
            <div>
              {formData.role === "CLIENT" && (
                <>
                  <span className="badge bg-success mt-1">Client</span>{" "}
                  <span className="badge bg-light text-dark">
                    {formData.industry}
                  </span>
                </>
              )}
              {formData.role === "ADMIN" && (
                <span className="badge bg-primary mt-1">Admin</span>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button
            type="submit"
            form="profileForm"
            variant="success"
            disabled={saving}
            aria-label="Save Profile"
          >
            💾 {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="white"
            disabled={saving || !originalData}
            aria-label="Cancel Changes"
          >
            ✕ Cancel
          </Button>
        </div>
      </div>

      {/* profile form section */}
      <div className="card shadow-sm p-4 mb-4">
        <h6 className="mb-3">Personal Information</h6>
        <form id="profileForm" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <Input
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Email"
                name="email"
                value={formData.email}
                disabled
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <Input
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </div>

      {/* password change section */}
      <div className="card shadow-sm p-4">
        <h6 className="mb-3">Password</h6>
        {!showPasswordForm ? (
          <div className="d-flex justify-content-start">
            <Button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              variant="outline-primary"
              className="btn-sm"
            >
              Change Password
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  type="password"
                  label="Current Password"
                  name="current_password"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      current_password: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <Input
                  type="password"
                  label="New Password"
                  name="new_password"
                  value={passwords.new_password}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      new_password: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <Button type="submit" variant="success" disabled={changingPw}>
                {changingPw ? "Changing…" : "Update Password"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                variant="white"
                disabled={changingPw}
              >
                ✕ Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
