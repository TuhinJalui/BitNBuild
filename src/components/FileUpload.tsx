import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';
import { FileAttachment } from '../types';
import { processFile } from '../utils/fileProcessors';

interface FileUploadProps {
  onFilesProcessed: (files: FileAttachment[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesProcessed,
  maxFiles = 10,
  acceptedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/*'
  ]
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setError(null);

    try {
      const processedFiles: FileAttachment[] = [];
      
      for (const file of acceptedFiles) {
        if (uploadedFiles.length + processedFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          break;
        }
        
        const processed = await processFile(file);
        processedFiles.push(processed);
      }

      const newFiles = [...uploadedFiles, ...processedFiles];
      setUploadedFiles(newFiles);
      onFilesProcessed(newFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, maxFiles, onFilesProcessed]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: isProcessing
  });

  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    onFilesProcessed(newFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('word')) return '📝';
    if (type.includes('text')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'error' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
          {isProcessing ? (
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Processing files...</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {isDragActive ? 'Drop files here' : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF, Word, Excel, CSV, images, and text files
              </p>
              <p className="text-xs text-gray-400">
                Max {maxFiles} files, up to 10MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-error-600" />
          <span className="text-sm text-error-700">{error}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};