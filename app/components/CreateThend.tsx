"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface CreateThendProps {
  onThendCreated?: () => void; 
}

export default function CreateThend({ onThendCreated }: CreateThendProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "w-full min-h-[120px] max-h-[300px] overflow-y-auto p-4 bg-gray-50 border-2 border-gray-100 rounded-b-xl focus:outline-none focus:border-orange-500 focus:bg-white text-sm text-black transition-all font-medium prose max-w-none disabled:opacity-60",
      },
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image (JPEG, PNG, WEBP)");
      return;
    }
    setError(null);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    const htmlContent = editor.getHTML();
    
    if (editor.isEmpty) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", htmlContent); 
      
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/`, {
        method: "POST",
        credentials: "include", 
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired or you are not authorized. Please log in again.");
        }
        throw new Error("Failed to publish thend. Please try again.");
      }

      editor.commands.clearContent();
      removeImage();
      
      if (onThendCreated) {
        onThendCreated();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error creating thend:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-2xl shadow-sm space-y-4 max-w-full">
      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black">Create New Thend</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex flex-col border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-orange-500 transition-colors">
          
          {editor && (
            <div className="flex flex-wrap items-center gap-1 bg-gray-50/80 backdrop-blur-sm p-2 border-b border-gray-100 select-none">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg cursor-pointer transition-all ${
                  editor.isActive("bold") 
                    ? "bg-orange-500 text-black shadow-sm" 
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title="Жирный текст"
              >
                B
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={loading}
                className={`px-3 py-1.5 text-xs italic font-serif rounded-lg cursor-pointer transition-all ${
                  editor.isActive("italic") 
                    ? "bg-orange-500 text-black shadow-sm" 
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title="Курсив"
              >
                I
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                disabled={loading}
                className={`px-2.5 py-1.5 text-xs font-mono rounded-lg cursor-pointer transition-all ${
                  editor.isActive("codeBlock") 
                    ? "bg-orange-500 text-black shadow-sm" 
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title="Блок кода"
              >
                &lt;/&gt;
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={loading}
                className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${
                  editor.isActive("blockquote") 
                    ? "bg-orange-500 text-black shadow-sm" 
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                title="Цитата"
              >
                “ ”
              </button>
            </div>
          )}

          <EditorContent editor={editor} disabled={loading} />
        </div>

        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          disabled={loading}
        />

        {!imagePreview ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-6 sm:py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none
              ${isDragActive 
                ? "border-orange-500 bg-orange-50/30 text-orange-600" 
                : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-400 hover:border-gray-300"
              }`}
          >
            <svg className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold px-4 text-center">
              {isDragActive ? "Drop photo here!" : "Click or drag photo here to attach"}
            </span>
          </div>
        ) : (
          <div className="relative w-full max-h-48 sm:max-h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-48 sm:max-h-64 object-contain w-full"
            />
            <button
              type="button"
              onClick={removeImage}
              disabled={loading}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 sm:p-2 rounded-full transition-all cursor-pointer disabled:opacity-50"
              title="Remove image"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs sm:text-sm font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in duration-200">
            ⚠ {error}
          </p>
        )}

        <div className="flex items-center justify-end pt-1">
          <button 
            type="submit"
            disabled={loading || editor?.isEmpty}
            className="w-full sm:w-auto px-6 h-10 sm:h-11 bg-black hover:bg-gray-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Publishing...
              </>
            ) : (
              "Publish Thend"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}