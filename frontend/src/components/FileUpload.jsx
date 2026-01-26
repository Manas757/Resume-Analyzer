import React, { useRef, useState } from "react";
import { cn } from "../lib/utils"; 
import { motion } from "motion/react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export function FileUpload({ onChange }) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (newFiles) => {
    const selectedFile = newFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange && onChange(selectedFile);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    onChange && onChange(null);
  };

  const handleClick = () => fileInputRef.current?.click();

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: { "application/pdf": [".pdf"] },
    onDrop: handleFileChange,
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        
        {/* Updated Mask for better visibility on dark backgrounds */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
          <GridPattern />
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-bold text-neutral-200 text-base">
            Upload Resume
          </p>
          <p className="relative z-20 text-neutral-400 text-sm mt-2">
            Drag & drop your PDF here or click to browse
          </p>

          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {file ? (
              <motion.div
                layoutId="file-upload"
                className="relative overflow-hidden z-40 bg-neutral-900 border border-neutral-800 flex flex-col items-start justify-start p-4 mt-4 w-full mx-auto rounded-md shadow-xl"
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <motion.p className="text-base text-neutral-300 truncate font-medium">
                    {file.name}
                  </motion.p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg px-2 py-1 text-xs bg-neutral-800 text-neutral-400 border border-neutral-700">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <button onClick={removeFile} className="p-1 hover:bg-red-900/30 rounded-full transition-colors">
                      <IconX className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative group-hover/file:shadow-2xl z-40 bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-2xl border border-neutral-800"
                >
                  <IconUpload className="h-6 w-6 text-neutral-400" />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-neutral-950"
                  : "bg-neutral-900 shadow-[0px_0px_1px_3px_rgba(255,255,255,0.02)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}