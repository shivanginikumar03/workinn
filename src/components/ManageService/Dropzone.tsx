import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Control, useController } from 'react-hook-form';

type DropzoneProps = {
  control: Control<any, any>;
  name: string;
  setFiles: React.Dispatch<React.SetStateAction<ExtendedFile[]>>;
  files: ExtendedFile[];
};

type ExtendedFile = FileWithPath & {
  preview: string;
};

function Dropzone({ control, name, files, setFiles }: DropzoneProps) {
  const {
    field: { onChange },
  } = useController({ name, control });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      );
      onChange(acceptedFiles);
    },
    maxFiles: 5,
  });

  const removeFile = (file: ExtendedFile) => {
    const newFiles = files.filter((f) => f !== file);
    setFiles(newFiles);
    const acceptedFiles = newFiles.map((f) => {
      const { preview, ...rest } = f;
      return rest;
    });
    onChange(acceptedFiles);
  };

  const thumbs = files.map((file) => (
    <div
      className="inline-flex border border-gray-300 rounded m-1 p-1"
      key={file.name}
    >
      <div className="flex h-20 w-20 relative flex-1 min-w-0 overflow-hidden">
        <button
          className="absolute top-0 z-20 right-0 p-1 rounded-full h-5 aspect-square flex items-center justify-center cursor-pointer bg-red-500 text-white"
          onClick={() => removeFile(file)}
        >
          X
        </button>
        <Image
          src={file.preview}
          className="block w-full h-full"
          fill
          alt={file.name}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  return (
    <div className="container mx-auto p-4">
      <div
        {...getRootProps({
          className: 'dropzone border-dashed border-2 border-gray-300 p-4',
        })}
      >
        <input {...getInputProps()} />
        <p className="text-center">
          Drag &apos;n&apos; drop some files here (Max 5), or click to select
          files
        </p>
      </div>
      <div className="flex flex-wrap mt-4">{thumbs}</div>
    </div>
  );
}

export default Dropzone;
