import { useState } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ref as dbRef, push, remove, update, serverTimestamp } from 'firebase/database';
import { storage, database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface FileData {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  relatedType: 'client' | 'project' | 'meeting';
  relatedId: string;
  userId: string;
  uploadedAt: Date;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { currentUser } = useAuth();

  const uploadFile = async (
    file: File, 
    relatedType: 'client' | 'project' | 'meeting', 
    relatedId: string
  ): Promise<FileData | null> => {
    if (!currentUser) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a reference to the file in Firebase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, `files/${currentUser.id}/${relatedType}/${relatedId}/${fileName}`);

      // Upload the file
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save file metadata to Realtime Database
      const filesRef = dbRef(database, 'files');
      const fileData = {
        name: file.name,
        url: downloadURL,
        size: file.size,
        type: file.type,
        relatedType,
        relatedId,
        userId: currentUser.id,
        uploadedAt: serverTimestamp()
      };

      const newFileRef = await push(filesRef, fileData);
      
      toast.success('File uploaded successfully');
      
      return {
        id: newFileRef.key!,
        ...fileData,
        uploadedAt: new Date()
      } as FileData;

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string, fileUrl: string) => {
    if (!currentUser) return;

    try {
      // Delete from Storage
      const fileRef = storageRef(storage, fileUrl);
      await deleteObject(fileRef);

      // Delete from Database
      const fileDbRef = dbRef(database, `files/${fileId}`);
      await remove(fileDbRef);

      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const uploadMultipleFiles = async (
    files: File[], 
    relatedType: 'client' | 'project' | 'meeting', 
    relatedId: string
  ): Promise<FileData[]> => {
    const uploadedFiles: FileData[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress((i / files.length) * 100);
      
      const uploadedFile = await uploadFile(file, relatedType, relatedId);
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile);
      }
    }
    
    return uploadedFiles;
  };

  return {
    uploadFile,
    deleteFile,
    uploadMultipleFiles,
    uploading,
    uploadProgress
  };
};