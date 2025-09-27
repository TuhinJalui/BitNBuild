import React, { useCallback, useState } from 'react';
import { Upload, File, X, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Eye, Download } from 'lucide-react';
import { FileAttachment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface EnhancedFileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  uploadedFiles: FileAttachment[];
  onRemoveFile: (fileId: string) => void;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFilesUploaded,
  uploadedFiles,
  onRemoveFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File): Promise<FileAttachment> => {
    const fileAttachment: FileAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      processingStatus: 'processing'
    };

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract content based on file type
      let extractedData = {};
      let documentType = 'other';

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        extractedData = analyzeTextContent(text, file.name);
        documentType = identifyDocumentType(text, file.name);
      } else if (file.type === 'application/pdf') {
        // PDF processing would go here
        extractedData = { content: 'PDF content extraction would be implemented here' };
        documentType = 'pdf_document';
      } else if (file.type.includes('image/')) {
        extractedData = { type: 'image', description: 'Image file uploaded' };
        documentType = 'image';
      } else if (file.type.includes('spreadsheet') || file.name.endsWith('.csv')) {
        const text = await file.text();
        extractedData = parseCSVContent(text);
        documentType = 'spreadsheet';
      }

      return {
        ...fileAttachment,
        extractedData,
        documentType: documentType as any,
        processingStatus: 'completed'
      };
    } catch (error) {
      console.error('File processing error:', error);
      return {
        ...fileAttachment,
        processingStatus: 'error'
      };
    }
  };

  const analyzeTextContent = (content: string, fileName: string) => {
    const analysis: any = { content };
    
    // Look for tax-related keywords and extract data
    const lowerContent = content.toLowerCase();
    
    // W-2 detection
    if (lowerContent.includes('w-2') || lowerContent.includes('wage and tax statement')) {
      const wagesMatch = content.match(/wages.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      const federalTaxMatch = content.match(/federal.*?tax.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      
      analysis.wages = wagesMatch ? parseFloat(wagesMatch[1].replace(/,/g, '')) : null;
      analysis.federalTaxWithheld = federalTaxMatch ? parseFloat(federalTaxMatch[1].replace(/,/g, '')) : null;
    }
    
    // Receipt detection
    if (lowerContent.includes('receipt') || lowerContent.includes('total')) {
      const totalMatch = content.match(/total.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      const dateMatch = content.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      
      analysis.amount = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : null;
      analysis.date = dateMatch ? dateMatch[1] : null;
      analysis.category = categorizeExpense(content);
    }
    
    return analysis;
  };

  const identifyDocumentType = (content: string, fileName: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('w-2')) return 'w2';
    if (lowerContent.includes('1099')) return '1099';
    if (lowerContent.includes('1040')) return '1040';
    if (lowerContent.includes('receipt')) return 'receipt';
    if (lowerContent.includes('bank statement')) return 'bank_statement';
    
    return 'other';
  };

  const categorizeExpense = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('medical') || lowerContent.includes('pharmacy')) return 'medical';
    if (lowerContent.includes('charity') || lowerContent.includes('donation')) return 'charitable';
    if (lowerContent.includes('office') || lowerContent.includes('business')) return 'business';
    if (lowerContent.includes('education') || lowerContent.includes('tuition')) return 'education';
    
    return 'other';
  };

  const parseCSVContent = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0]?.split(',') || [];
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim();
      });
      return row;
    });
    
    return { headers, data, rowCount: data.length };
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsProcessing(true);

    const files = Array.from(e.dataTransfer.files);
    
    try {
      const processedFiles = await Promise.all(files.map(processFile));
      onFilesUploaded(processedFiles);
      toast.success(`Successfully processed ${files.length} file(s)`);
    } catch (error) {
      toast.error('Error processing files');
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesUploaded]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    
    try {
      const processedFiles = await Promise.all(files.map(processFile));
      onFilesUploaded(processedFiles);
      toast.success(`Successfully processed ${files.length} file(s)`);
    } catch (error) {
      toast.error('Error processing files');
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesUploaded]);

  const getStatusIcon = (status: FileAttachment['processingStatus']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      w2: 'W-2 Form',
      '1099': '1099 Form',
      '1040': '1040 Form',
      receipt: 'Receipt',
      bank_statement: 'Bank Statement',
      spreadsheet: 'Spreadsheet',
      image: 'Image',
      pdf_document: 'PDF Document',
      other: 'Document'
    };
    return labels[type] || 'Document';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-300">Processing files...</span>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to upload
                </label>
                <span className="text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500">
                PDF, Word, Excel, CSV, Images, Text files up to 10MB
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.processingStatus)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        {file.documentType && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {getDocumentTypeLabel(file.documentType)}
                            </span>
                          </>
                        )}
                      </div>
                      {file.extractedData && file.processingStatus === 'completed' && (
                        <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                          ✓ Data extracted successfully
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.url && (
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Preview file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};