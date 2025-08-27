import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  text: string;
  fileName: string;
  fileType: string;
  processingMethod: 'text' | 'ocr' | 'pdf-extract' | 'hybrid';
  confidence?: number;
}

export async function processDocument(file: File): Promise<ProcessedDocument> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // Handle different file types
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await processPDF(file);
    } else if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
      return await processImage(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await processTextFile(file);
    } else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await processWordDocument(file);
    } else {
      // Try to process as text
      return await processTextFile(file);
    }
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processPDF(file: File): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    let hasText = false;
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      if (textContent.items.length > 0) {
        hasText = true;
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
    }
    
    if (hasText && fullText.trim().length > 100) {
      return {
        text: fullText.trim(),
        fileName: file.name,
        fileType: 'application/pdf',
        processingMethod: 'pdf-extract'
      };
    } else {
      // If no text found, try OCR on the PDF pages
      console.log('No text found in PDF, attempting OCR...');
      return await processPDFWithOCR(file, pdf);
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function processPDFWithOCR(file: File, pdf: any): Promise<ProcessedDocument> {
  try {
    const worker = await createWorker('eng');
    let ocrText = '';
    let totalConfidence = 0;
    let pageCount = 0;
    
    // Convert PDF pages to images and run OCR
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Limit to first 5 pages for performance
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const imageData = canvas.toDataURL('image/png');
      const { data } = await worker.recognize(imageData);
      
      if (data.text.trim().length > 50) {
        ocrText += data.text + '\n';
        totalConfidence += data.confidence;
        pageCount++;
      }
    }
    
    await worker.terminate();
    
    const averageConfidence = pageCount > 0 ? totalConfidence / pageCount : 0;
    
    if (ocrText.trim().length > 100) {
      return {
        text: ocrText.trim(),
        fileName: file.name,
        fileType: 'application/pdf',
        processingMethod: 'ocr',
        confidence: averageConfidence
      };
    } else {
      throw new Error('Unable to extract readable text from PDF');
    }
  } catch (error) {
    console.error('Error with PDF OCR:', error);
    throw new Error('Failed to process PDF with OCR');
  }
}

async function processImage(file: File): Promise<ProcessedDocument> {
  try {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();
    
    if (data.text.trim().length < 50) {
      throw new Error('Unable to extract sufficient text from image');
    }
    
    return {
      text: data.text.trim(),
      fileName: file.name,
      fileType: file.type,
      processingMethod: 'ocr',
      confidence: data.confidence
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to extract text from image using OCR');
  }
}

async function processTextFile(file: File): Promise<ProcessedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text || text.trim().length < 10) {
        reject(new Error('File appears to be empty or contains no readable text'));
        return;
      }
      resolve({
        text: text.trim(),
        fileName: file.name,
        fileType: file.type,
        processingMethod: 'text'
      });
    };
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file, 'utf-8');
  });
}

async function processWordDocument(file: File): Promise<ProcessedDocument> {
  // For Word documents, we'll try to read as text first
  // In a production environment, you'd want to use a proper Word parser
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Try to extract readable text from Word document
      let extractedText = text;
      
      // Remove common binary markers and try to extract readable text
      extractedText = extractedText.replace(/[^\x20-\x7E\s]/g, ' ');
      extractedText = extractedText.replace(/\s+/g, ' ').trim();
      
      // Look for actual content (more than just metadata)
      const meaningfulContent = extractedText.match(/[A-Za-z0-9\s.,!?;:()\[\]{}"'-]{20,}/g);
      
      if (meaningfulContent && meaningfulContent.length > 0) {
        const cleanContent = meaningfulContent.join(' ').trim();
        if (cleanContent.length > 100) {
          resolve({
            text: cleanContent,
            fileName: file.name,
            fileType: file.type,
            processingMethod: 'text'
          });
          return;
        }
      }
      
      reject(new Error('Unable to extract readable text from Word document. Please save as PDF or plain text.'));
    };
    reader.onerror = () => reject(new Error('Failed to read Word document'));
    reader.readAsText(file, 'utf-8');
  });
}
