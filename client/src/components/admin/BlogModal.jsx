import React, { useState } from "react";
import Input, { Select } from "../../utils/Input";
import { ToggleSwitch } from "../../utils/ToggleSwitch.jsx";
import { DropdownButton } from "../../utils/DropdownButton.jsx";
import { RichTextEditor } from "../RichTextEditor";

// Define initial value for the editor
const initialEditorValue = [
  {
    type: "paragraph",
    children: [
      { text: "This is a rich text editor built with " },
      { text: "Slate.js", bold: true },
      { text: " and " },
      { text: "React", italic: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "You can format text as bold, italic, underlined, or as a code block. Try using keyboard shortcuts like Ctrl+B!",
      },
    ],
  },
];

const PostCreationModal = ({ isOpen, onClose }) => {
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Select category");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState(initialEditorValue);
  const [isNewsletter, setIsNewsletter] = useState(false);
  const [status, setStatus] = useState("Draft");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Post Submitted:", {
      title,
      category,
      excerpt,
      content,
      isNewsletter,
      status,
    });
    onClose();
  };

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
              {/* Plus icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-success me-2"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Blog Post
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
                    label={"Title"}
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter blog post title..."
                    className="form-control form-control-lg rounded-3 border-light shadow-sm"
                    required
                  />
                </div>

                {/* Category Select */}
                <div className="col-md-6">
                  <Select
                    id="category"
                    label={"Category"}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className=" form-select-lg rounded-3 border-light shadow-sm"
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
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the blog post..."
                  className="form-control form-control-lg rounded-3 border-light shadow-sm"
                  required
                />
              </div>

              {/* Content Textarea */}
              <div className="mb-2">
                <RichTextEditor
                  id="content"
                  label="Content"
                  value={content}
                  onChange={setContent}
                />
              </div>
            </div>

            {/* Modal Footer: Actions */}
            <div className="modal-footer d-flex justify-content-between align-items-center p-4 pt-3 border-top-0">
              {/* Left side actions (Toggle and Dropdown) */}
              <div className="d-flex align-items-center">
                <ToggleSwitch
                  label="Newsletter"
                  checked={isNewsletter}
                  onChange={(e) => setIsNewsletter(e.target.checked)}
                />

                {/* Space between toggle and dropdown */}
                <span className="mx-3 text-light">|</span>

                <DropdownButton
                  options={statuses}
                  selected={status}
                  onSelect={setStatus}
                />
              </div>

              {/* Right side buttons */}
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-link text-secondary fw-semibold text-decoration-none me-3"
                >
                  {/* Close/Cancel icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="me-1"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success fw-semibold rounded-3 shadow-sm px-4 py-2"
                >
                  {/* Save/Create Post icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="me-1"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Create Post
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCreationModal;
