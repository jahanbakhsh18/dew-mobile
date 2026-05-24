import { useState, useCallback } from 'react';
import FileUploadService from '../services/file-upload.service';
import { TemporaryFileResponse, FileAttachment } from '../types/ticket.types'

interface UploadedFile {
  temporaryFile: TemporaryFileResponse;
  originalName: string;
  uploading: boolean;
  error?: string;
}

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (file: { uri: string; name: string; type: string }) => {
    setIsUploading(true);
    const newFile: UploadedFile = {
      temporaryFile: null as any,
      originalName: file.name,
      uploading: true,
    };

    setUploadedFiles(prev => [...prev, newFile]);

    try {
      const response = await FileUploadService.uploadTemporaryFile(file.uri, file.name, file.type);

      setUploadedFiles(prev =>
        prev.map(f =>
          f.originalName === file.name && f.uploading
            ? { ...f, temporaryFile: response, uploading: false }
            : f
        )
      );

      return response;
    } catch (error) {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.originalName === file.name && f.uploading
            ? { ...f, error: error instanceof Error ? error.message : 'Upload failed', uploading: false }
            : f
        )
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((originalName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.originalName !== originalName));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const getFilesPathJson = useCallback((): string => {
    const attachments: FileAttachment[] = uploadedFiles
      .filter(f => f.temporaryFile && !f.uploading)
      .map(f => ({
        OriginalName: f.originalName,
        Filename: f.temporaryFile.TemporaryFile,
      }));

    return JSON.stringify(attachments);
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isUploading,
    uploadFile,
    removeFile,
    clearAllFiles,
    getFilesPathJson,
  };
};