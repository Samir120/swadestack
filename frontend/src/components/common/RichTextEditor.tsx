import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  height?: string;
}

/**
 * RichTextEditor Component
 * Reusable WYSIWYG editor using ReactQuill
 * Supports HTML content creation and editing
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content...',
  label,
  height = '300px',
}) => {
  // Configure toolbar modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  // Configure editor formats
  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'align',
    'color',
    'background',
    'link',
    'image',
    'video',
  ];

  return (
    <div className="rich-text-editor">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">{label}</label>
      )}
      <div className="bg-white dark:bg-surface-850 rounded-lg border border-gray-300 dark:border-surface-600 overflow-hidden">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height }}
        />
      </div>
      <style>{`
        .rich-text-editor .quill {
          display: flex;
          flex-direction: column;
        }
        .rich-text-editor .ql-container {
          flex: 1;
          overflow-y: auto;
          font-size: 14px;
          border-color: var(--color-surface-700) !important;
        }
        .rich-text-editor .ql-editor {
          min-height: ${height};
          padding: 12px 15px;
          color: var(--editor-text);
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #737373;
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border-bottom: 1px solid var(--editor-border) !important;
          border-color: var(--editor-border) !important;
          background-color: var(--editor-toolbar-bg);
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: var(--editor-toolbar-btn);
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: var(--editor-toolbar-btn);
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: var(--editor-toolbar-btn);
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar .ql-picker-label:hover .ql-stroke {
          stroke: var(--editor-toolbar-btn-active);
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar .ql-picker-label:hover .ql-fill {
          fill: var(--editor-toolbar-btn-active);
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar .ql-picker-label:hover {
          color: var(--editor-toolbar-btn-active);
        }
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--editor-toolbar-btn-active);
        }
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: var(--editor-toolbar-btn-active);
        }
        .rich-text-editor .ql-toolbar .ql-picker-options {
          background-color: var(--editor-toolbar-bg);
          border-color: var(--editor-border);
        }
        .rich-text-editor .ql-toolbar .ql-picker-item {
          color: var(--editor-toolbar-btn);
        }
        .rich-text-editor .ql-toolbar .ql-picker-item:hover {
          color: var(--editor-toolbar-btn-active);
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
