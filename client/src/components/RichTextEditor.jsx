import React, { useState, useCallback, useId } from 'react';
import { createEditor, Editor, Transforms, Text } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';


// Helper object for custom editor commands
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    });
    return !!match;
  },

  isItalicMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.italic === true,
      universal: true,
    });
    return !!match;
  },

  isUnderlineMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.underline === true,
      universal: true,
    });
    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    });
    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    Transforms.setNodes(
      editor,
      { italic: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    );
  },
  
  toggleUnderlineMark(editor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor);
    Transforms.setNodes(
      editor,
      { underline: isActive ? null : true },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },
};

// The Rich Text Editor Component
export const RichTextEditor = ({ value, onChange, label, error, success }) => {
  const [editor] = useState(() => withReact(createEditor()))
  const id = useId();

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />;
  }, []);

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div
        className={`form-control ${error ? "is-invalid" : ""} ${
          success && !error ? "is-valid" : ""
        }`}
      >
        <Slate
          initialValue={value}
          editor={editor}
          value={value}
          onChange={onChange}
        >
          <Toolbar />
          <div className="p-2">
            <Editable
              id={id}
              style={{ minHeight: "150px", outline: 'none' }}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Enter some rich text..."
              spellCheck
              onKeyDown={event => {
                  if (!event.ctrlKey) {
                      return;
                  }
                  switch (event.key) {
                      case '`': {
                          event.preventDefault();
                          CustomEditor.toggleCodeBlock(editor);
                          break;
                      }
                      case 'b': {
                          event.preventDefault();
                          CustomEditor.toggleBoldMark(editor);
                          break;
                      }
                      case 'i': {
                          event.preventDefault();
                          CustomEditor.toggleItalicMark(editor);
                          break;
                      }
                      case 'u': {
                          event.preventDefault();
                          CustomEditor.toggleUnderlineMark(editor);
                          break;
                      }
                  }
              }}
            />
          </div>
        </Slate>
      </div>
      {error && (
        <div className="invalid-feedback">{error}</div>
      )}
      {success && !error && (
        <div className="valid-feedback">{success}</div>
      )}
    </div>
  );
};


// Toolbar component with formatting buttons
const Toolbar = () => {
  return (
    <div className="border-bottom mb-2">
      <MarkButton format="bold" icon="B" />
      <MarkButton format="italic" icon="I" />
      <MarkButton format="underline" icon="U" />
      {/* <BlockButton format="code" icon="<>" /> */}
    </div>
  );
};

// Button for toggling marks (bold, italic, etc.)
const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  let isActive;
  switch (format) {
      case 'bold':
        isActive = CustomEditor.isBoldMarkActive(editor);
        break;
      case 'italic':
        isActive = CustomEditor.isItalicMarkActive(editor);
        break;
      case 'underline':
        isActive = CustomEditor.isUnderlineMarkActive(editor);
        break;
      default:
        isActive = false;
  }
  
  const baseClasses = "btn btn-sm";
  const activeClasses = "btn-primary active";
  const inactiveClasses = "btn-outline-secondary";

  return (
    <button
    type='button'
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onMouseDown={event => {
        event.preventDefault();
        switch (format) {
            case 'bold':
                CustomEditor.toggleBoldMark(editor);
                break;
            case 'italic':
                CustomEditor.toggleItalicMark(editor);
                break;
            case 'underline':
                CustomEditor.toggleUnderlineMark(editor);
                break;
        }
      }}
    >
      <span className={`${format === 'bold' ? 'fw-bold' : ''} ${format === 'italic' ? 'fst-italic' : ''} ${format === 'underline' ? 'text-decoration-underline' : ''}`}>{icon}</span>
    </button>
  );
};

// Button for toggling block types (code block)
const BlockButton = ({ icon }) => {
    const editor = useSlate();
    const isActive = CustomEditor.isCodeBlockActive(editor);

    const baseClasses = "btn btn-sm";
    const activeClasses = "btn-primary active";
    const inactiveClasses = "btn-outline-secondary";

    return (
        <button
            type='button'
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            onMouseDown={event => {
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
            }}
        >
          <span className="font-monospace">{icon}</span>
        </button>
    );
}

// Renderer for code block elements
const CodeElement = props => {
  return (
    <pre {...props.attributes} className="bg-light p-3 rounded">
      <code className="font-monospace">{props.children}</code>
    </pre>
  );
};

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>;
};


const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};