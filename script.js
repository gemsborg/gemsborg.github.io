/**
 * PDF Compressor - Browser-Based PDF Compression Tool
 * 
 * Multi-step workflow:
 * 1. Upload - User selects or drops PDF file
 * 2. Preview - Shows file info and allows user to start compression
 * 3. Processing - Shows progress while compressing
 * 4. Results - Shows before/after sizes and download option
 * 
 * All processing happens client-side using PDF-Lib
 */

// ========================================
// Constants and Configuration
// ========================================

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB in bytes

// ========================================
// DOM Element References
// ========================================

// Section containers
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

// Upload elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');

// Preview elements
const previewFileName = document.getElementById('previewFileName');
const previewFileSize = document.getElementById('previewFileSize');
const cancelBtn = document.getElementById('cancelBtn');
const compressBtn = document.getElementById('compressBtn');

// Processing elements
const processingText = document.getElementById('processingText');

// Results elements
const originalSizeEl = document.getElementById('originalSize');
const compressedSizeEl = document.getElementById('compressedSize');
const compressionPercentEl = document.getElementById('compressionPercent');
const downloadBtn = document.getElementById('downloadBtn');
const compressAnotherBtn = document.getElementById('compressAnotherBtn');

// Error elements
const errorMessage = document.getElementById('errorMessage');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// ========================================
// Global State Variables
// ========================================

let currentFile = null;
let compressedBlob = null;
let originalFileName = '';

// ========================================
// Event Listeners Setup
// ========================================

document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize all event listeners and app state
 */
function initializeApp() {
    console.log('PDF Compressor initialized');
    
    // Upload section listeners
    selectBtn.addEventListener('click', () => fileInput.click());
    uploadBox.addEventListener('click', handleUploadBoxClick);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop listeners
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    
    // Prevent default drag/drop on entire page
    ['dragover', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Preview section listeners
    cancelBtn.addEventListener('click', resetToUpload);
    compressBtn.addEventListener('click', startCompression);
    
    // Results section listeners
    downloadBtn.addEventListener('click', downloadCompressedFile);
    compressAnotherBtn.addEventListener('click', resetToUpload);
    
    // Error section listener
    tryAgainBtn.addEventListener('click', resetToUpload);
}

// ========================================
// File Upload Event Handlers
// ========================================

/**
 * Handle click on upload box (excluding button clicks)
 */
function handleUploadBoxClick(e) {
    if (e.target === selectBtn || selectBtn.contains(e.target)) {
        return; // Button click will handle this
    }
    fileInput.click();
}

/**
 * Handle file selection from file input
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

/**
 * Handle dragover event - visual feedback
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadBox.classList.add('drag-over');
}

/**
 * Handle dragleave event - remove visual feedback
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadBox.classList.remove('drag-over');
}

/**
 * Handle file drop event
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadBox.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        validateAndPreviewFile(files[0]);
    }
}

// ========================================
// File Validation and Preview
// ========================================

/**
 * Validate file and show preview if valid
 * @param {File} file - The file to validate and preview
 */
function validateAndPreviewFile(file) {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        showError('Please select a valid PDF file. Only PDF files are supported.');
        return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showError(
            `The selected file is ${fileSizeMB} MB, which exceeds the maximum size limit of ${maxSizeMB} MB. 
            Please choose a smaller file or split the PDF into smaller parts.`
        );
        return;
    }
    
    // File is valid - store it and show preview
    currentFile = file;
    originalFileName = file.name;
    showFilePreview(file);
}

/**
 * Display file preview with details
 * @param {File} file - The file to preview
 */
function showFilePreview(file) {
    previewFileName.textContent = file.name;
    previewFileSize.textContent = formatFileSize(file.size);
    showSection('preview');
}

// ========================================
// PDF Compression Logic
// ========================================

/**
 * Start the PDF compression process
 */
async function startCompression() {
    if (!currentFile) {
        showError('No file selected. Please select a PDF file to compress.');
        return;
    }
    
    // Show processing section
    showSection('processing');
    processingText.textContent = 'Reading PDF file...';
    
    try {
        // Step 1: Read the file
        const arrayBuffer = await readFileAsArrayBuffer(currentFile);
        
        // Step 2: Load PDF document
        processingText.textContent = 'Analyzing PDF structure...';
        await sleep(300); // Brief pause for UX
        
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // Step 3: Compress PDF
        processingText.textContent = 'Compressing PDF with optimization...';
        await sleep(300); // Brief pause for UX
        
        // Save with compression using object streams
        // This is the key compression technique
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,    // Primary compression method
            addDefaultPage: false,      // Don't add extra pages
            objectsPerTick: 50,        // Process objects in batches for better performance
        });
        
        // Step 4: Create downloadable blob
        processingText.textContent = 'Finalizing...';
        compressedBlob = new Blob([compressedBytes], { 
            type: 'application/pdf' 
        });
        
        // Step 5: Show results
        await sleep(200); // Brief pause for smooth transition
        displayResults(currentFile.size, compressedBlob.size);
        
    } catch (error) {
        console.error('Compression error:', error);
        handleCompressionError(error);
    }
}

/**
 * Read file as ArrayBuffer for PDF-Lib
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>}
 */
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Handle compression errors with user-friendly messages
 * @param {Error} error - The error that occurred
 */
function handleCompressionError(error) {
    let errorMsg = 'We encountered an issue while compressing your PDF. ';
    
    if (error.message.includes('Invalid') || error.message.includes('parse')) {
        errorMsg += 'The file appears to be corrupted or is not a valid PDF document.';
    } else if (error.message.includes('encrypted') || error.message.includes('password')) {
        errorMsg += 'This PDF is password-protected. Please remove the password protection and try again.';
    } else if (error.message.includes('memory') || error.message.includes('size')) {
        errorMsg += 'The file is too complex to process. Try compressing a smaller or simpler PDF.';
    } else {
        errorMsg += 'Please try again with a different PDF file. Error: ' + error.message;
    }
    
    showError(errorMsg);
}

// ========================================
// Results Display
// ========================================

/**
 * Display compression results with size comparison
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 */
function displayResults(originalSize, compressedSize) {
    // Update size displays
    originalSizeEl.textContent = formatFileSize(originalSize);
    compressedSizeEl.textContent = formatFileSize(compressedSize);
    
    // Calculate compression statistics
    const savedBytes = originalSize - compressedSize;
    const percentReduction = ((savedBytes / originalSize) * 100).toFixed(1);
    
    // Display compression message
    if (savedBytes > 0) {
        compressionPercentEl.innerHTML = `
            <i class="bi bi-check-circle-fill me-2"></i>
            Reduced by ${percentReduction}% • Saved ${formatFileSize(savedBytes)}
        `;
    } else if (savedBytes === 0) {
        compressionPercentEl.innerHTML = `
            <i class="bi bi-info-circle-fill me-2"></i>
            File is already fully optimized
        `;
    } else {
        // In rare cases, "compression" might increase size slightly
        // This can happen with already-optimized PDFs
        compressionPercentEl.innerHTML = `
            <i class="bi bi-info-circle-fill me-2"></i>
            File is already optimized (no reduction possible)
        `;
    }
    
    // Show results section
    showSection('results');
}

// ========================================
// Download Functionality
// ========================================

/**
 * Download the compressed PDF file
 */
function downloadCompressedFile() {
    if (!compressedBlob) {
        showError('No compressed file available. Please try compressing the file again.');
        return;
    }
    
    // Create a temporary download link
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with "-compressed" suffix
    const fileName = originalFileName.replace(/\.pdf$/i, '-compressed.pdf');
    a.download = fileName;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// ========================================
// UI Section Management
// ========================================

/**
 * Show specific section and hide all others
 * @param {string} sectionName - Which section to show: 'upload', 'preview', 'processing', 'results', 'error'
 */
function showSection(sectionName) {
    // Hide all sections
    const sections = [uploadSection, previewSection, processingSection, resultsSection, errorSection];
    sections.forEach(section => section.classList.add('d-none'));
    
    // Show requested section
    const sectionMap = {
        upload: uploadSection,
        preview: previewSection,
        processing: processingSection,
        results: resultsSection,
        error: errorSection
    };
    
    const targetSection = sectionMap[sectionName];
    if (targetSection) {
        targetSection.classList.remove('d-none');
        
        // Scroll to top for better UX on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    showSection('error');
}

/**
 * Reset application to initial upload state
 */
function resetToUpload() {
    // Clear state
    currentFile = null;
    compressedBlob = null;
    originalFileName = '';
    
    // Reset file input
    fileInput.value = '';
    
    // Reset display values
    previewFileName.textContent = '';
    previewFileSize.textContent = '';
    originalSizeEl.textContent = '-';
    compressedSizeEl.textContent = '-';
    compressionPercentEl.textContent = '-';
    errorMessage.textContent = '';
    
    // Show upload section
    showSection('upload');
}

// ========================================
// Utility Functions
// ========================================

/**
 * Format bytes into human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Simple sleep function for UX delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// Cleanup on Page Unload
// ========================================

/**
 * Clean up resources before page unload
 */
window.addEventListener('beforeunload', () => {
    if (compressedBlob) {
        URL.revokeObjectURL(compressedBlob);
    }
});

// ========================================
// Console Info
// ========================================

console.log('🔧 PDF Compressor Ready');
console.log('📏 Max file size:', formatFileSize(MAX_FILE_SIZE));
console.log('📚 PDF-Lib loaded:', typeof PDFLib !== 'undefined');
