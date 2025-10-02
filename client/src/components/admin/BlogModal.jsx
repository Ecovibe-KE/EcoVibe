import React, { useState, useEffect } from "react";
import Input, { Select, FileInput } from "../../utils/Input";
import { ToggleSwitch } from "../../utils/ToggleSwitch.jsx";
import { DropdownButton } from "../../utils/DropdownButton.jsx";
import { RichTextEditor } from "../RichTextEditor";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { createBlog, updateBlog } from "../../api/services/blog.js";
import { toast } from "react-toastify";

// Define initial value for the editor
const initialEditorValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const PostCreationModal = ({ isOpen, onClose, post }) => {
  const isEditing = post != null;

  // Form State
  const [postFormState, setPostFormState] = useState({
    title: "",
    category: "Select category",
    excerpt: "",
    content: initialEditorValue,
    isNewsletter: false,
    status: "Draft",
    image: null,
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setPostFormState({
          title: post.title || "",
          category: post.category || "Select category",
          excerpt: post.excerpt || "",
          content: post.content ? JSON.parse(post.content) : initialEditorValue,
          isNewsletter: post.type == "newsletter" || false,
          status: post.status || "Draft",
          image: null, // User must re-upload image on edit
          type: post.type || "article",
        });
      } else {
        setPostFormState({
          title: "",
          category: "Select category",
          excerpt: "",
          content: initialEditorValue,
          isNewsletter: false,
          status: "Draft",
          image: null,
          type: "article",
        });
      }
    }
  }, [post, isOpen, isEditing]);

  const [isLoading, setIsLoading] = useState(false);

  const updateFormState = (field, value) => {
    setPostFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (
      postFormState.title.trim() === "" ||
      postFormState.content.length === 0
    ) {
      toast.error("Title and Content are required fields.");
      setIsLoading(false);
      return;
    }

    const payload = {
      ...postFormState,
      content: JSON.stringify(postFormState.content),
    };

    try {
      let response;
      if (isEditing) {
        response = await updateBlog(post.id, payload);
        toast.success("Blog post updated successfully!");
      } else {
        response = await createBlog(payload);
        toast.success("Blog post created successfully!");
      }

      if (response) {
        onClose();
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} blog post.`);
      }
    } catch (error) {
      toast.error(
        `Error ${isEditing ? "updating" : "creating"} blog post: ${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Static options
  const categories = [
    "Select category",
    "Technology",
    "Design",
    "Marketing",
    "Finance",
  ];
  const statuses = ["Draft", "Review", "Published", "Archived"];

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1 }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content rounded-4 shadow-lg">
          {/* Modal Header */}
          <div className="modal-header border-bottom-0 p-4">
            <h5
              className="modal-title fw-semibold d-flex align-items-center text-dark"
              id="postModalLabel"
            >
              <NoteAddIcon className="me-2 text-success" />
              {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
            </h5>
            {/* Close button (X icon) */}
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Modal Body: Form Fields */}
            <div className="modal-body p-4 pt-0">
              {/* Title and Category (Two Columns, responsive) */}
              <div className="row g-4 mb-4">
                {/* Title Input */}
                <div className="col-md-6">
                  <Input
                    label={"Title *"}
                    type="text"
                    id="title"
                    name="title"
                    value={postFormState.title}
                    onChange={(e) => updateFormState("title", e.target.value)}
                    placeholder="Enter blog post title..."
                    className="form-control-lg rounded-3 border-light"
                    required
                  />
                </div>

                {/* Category Select */}
                <div className="col-md-6">
                  <Select
                    id="category"
                    name="category"
                    label={"Category"}
                    value={postFormState.category}
                    onChange={(e) =>
                      updateFormState("category", e.target.value)
                    }
                    className=" form-select-lg rounded-3 border-light"
                    aria-label="Select category"
                  >
                    {categories.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        disabled={cat === "Select category"}
                      >
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Excerpt Textarea */}
              <div className="mb-4">
                <Input
                  label={"Excerpt"}
                  rows={4}
                  type="textarea"
                  id="excerpt"
                  name="excerpt"
                  value={postFormState.excerpt}
                  onChange={(e) => updateFormState("excerpt", e.target.value)}
                  placeholder="Brief description of the blog post..."
                  className=" form-control-lg rounded-3 border-secondary"
                />
              </div>

              {/* Featured Image Input */}
              <div className="mb-4">
                <FileInput
                  type="file"
                  id="image"
                  name="image"
                  label={"Thumbnail *"}
                  accept="image/*"
                  onChange={(e) => updateFormState("image", e.target.files[0])}
                  className="form-control-lg rounded-3"
                  aria-label="Upload featured image"
                />
              </div>

              {/* Content Textarea */}
              <div className="mb-2">
                <RichTextEditor
                  id="content"
                  label="Content *"
                  value={postFormState.content}
                  onChange={(value) => updateFormState("content", value)}
                  placeholder="Write your blog content here..."
                  className="form-control-lg rounded-3 border-secondary"
                  required
                />
              </div>
            </div>

            {/* Modal Footer: Actions */}
            <div className="modal-footer d-flex justify-content-between align-items-center p-4 pt-3 border-top-0">
              {/* Left side actions (Toggle and Dropdown) */}
              <div className="d-flex align-items-center">
                <ToggleSwitch
                  label="Newsletter"
                  checked={postFormState.isNewsletter}
                  onChange={(e) => {
                    updateFormState("isNewsletter", e.target.checked);
                    updateFormState(
                      "type",
                      e.target.checked ? "newsletter" : "article",
                    );
                  }}
                />

                {/* Space between toggle and dropdown */}
                <span className="mx-3 text-light">|</span>

                <DropdownButton
                  options={statuses}
                  selected={postFormState.status}
                  onSelect={(option) => updateFormState("status", option)}
                />
              </div>

              {isLoading && (
                <div className="text-secondary me-3">Saving...</div>
              )}

              {/* Right side buttons */}
              {!isLoading && (
                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-link align-items-center border border-secondary text-secondary fw-semibold text-decoration-none me-3"
                  >
                    {/* Close/Cancel icon */}
                    <CancelIcon className="me-1" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-success fw-semibold rounded-3 shadow-sm px-4 py-2 d-flex align-items-center justify-content-center"
                  >
                    {/* Save/Create Post icon */}
                    <SaveAsIcon className="me-1" />
                    {isEditing ? "Update Post" : "Create Post"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCreationModal;
