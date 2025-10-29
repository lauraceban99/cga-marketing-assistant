import { useState } from 'react';
import type { UploadProgress } from '../types';
import {
  uploadPDF,
  saveBrandGuideline,
  updateBrandGuideline,
} from '../services/firebaseService';
import {
  extractTextFromPDF,
  parseGuidelinesWithAI,
} from '../services/geminiService';

/**
 * Hook for uploading PDFs and processing them
 */
export const usePDFUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const uploadAndProcess = async (
    brandId: string,
    brandName: string,
    file: File,
    isUpdate: boolean = false
  ) => {
    setIsUploading(true);
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    });

    try {
      // Step 1: Upload PDF to Firebase Storage
      const uploadTask = uploadPDF(brandId, file, (progress) => {
        setUploadProgress({
          fileName: file.name,
          progress: Math.round(progress),
          status: 'uploading',
        });
      });

      const snapshot = await uploadTask;
      const pdfUrl = await snapshot.ref.getDownloadURL();

      // Step 2: Extract text from PDF using Gemini
      setUploadProgress({
        fileName: file.name,
        progress: 100,
        status: 'processing',
      });

      const extractedText = await extractTextFromPDF(file);

      // Step 3: Parse guidelines using AI
      const parsedGuidelines = await parseGuidelinesWithAI(
        extractedText,
        brandName
      );

      // Step 4: Save to Firestore
      const guidelineData = {
        brandId,
        brandName,
        pdfUrl,
        pdfFileName: file.name,
        fileSize: file.size,
        extractedText,
        guidelines: parsedGuidelines.guidelines || {},
        colors: parsedGuidelines.colors || {
          primary: [],
          secondary: [],
          accent: [],
          all: [],
        },
        typography: parsedGuidelines.typography,
        logoRules: parsedGuidelines.logoRules,
        uploadedBy: 'admin', // TODO: Replace with actual user ID
      };

      if (isUpdate) {
        await updateBrandGuideline(brandId, guidelineData);
      } else {
        await saveBrandGuideline(guidelineData);
      }

      setUploadProgress({
        fileName: file.name,
        progress: 100,
        status: 'complete',
      });

      setIsUploading(false);
      return guidelineData;
    } catch (error) {
      console.error('Upload and process error:', error);
      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      setIsUploading(false);
      throw error;
    }
  };

  const resetProgress = () => {
    setUploadProgress(null);
    setIsUploading(false);
  };

  return {
    uploadAndProcess,
    uploadProgress,
    isUploading,
    resetProgress,
  };
};
