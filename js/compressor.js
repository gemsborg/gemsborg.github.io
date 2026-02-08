/**
 * PDF Compressor Module
 * 
 * ⚠️ IMPORTANT: This module contains placeholders for your existing compressor code.
 * DO NOT modify the compression logic - just paste your existing code in the marked sections.
 * 
 * This module handles:
 * - Rendering the compressor UI
 * - File upload handling
 * - PDF compression (YOUR EXISTING CODE)
 * - Results display and download
 */

// ========================================
// Module State (Keep your existing state variables here)
// ========================================

// 👉 PASTE YOUR EXISTING STATE VARIABLES HERE
// Example from your code:
// const MAX_FILE_SIZE = 30 * 1024 * 1024;
// let currentFile = null;
// let compressedBlob = null;
// let originalFileName = '';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB
let currentFile = null;
let compressedBlob = null;
let originalFileName = '';

// ========================================
// UI Rendering
// ========================================

/**
 * Render the compressor UI
 * This generates the HTML structure for the tool
 */
export function render() {
    return `
        <!-- Tool Header -->
        <div class="tool-header">
            <h2 class="tool-title">PDF Compressor</h2>
            <p class="tool-description">Reduce PDF file size while maintaining quality. All processing happens in your browser.</p>
        </div>

        <!-- Upload Section (Initial State) -->
        <div id="compressor-upload-section">
            <div class="upload-area" id="compressor-upload-area">
                <input type="file" id="compressor-file-input" accept=".pdf,application/pdf" class="d-none">
                <i class="bi bi-cloud-arrow-up upload-icon"></i>
                <h3 class="upload-text">Choose a PDF file</h3>
                <p class="upload-hint">or drag and drop it here</p>
                <p class="text-muted small mt-2">Maximum file size: 30 MB</p>
                <button class="btn btn-danger btn-lg mt-3" id="compressor-browse-btn">
                    <i class="bi bi-folder2-open me-2"></i>Browse Files
                </button>
            </div>

            <!-- AdSense Ad Below Upload -->
            <div class="adsense-container mt-4">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
                     data-ad-slot="HORIZONTAL-AD-SLOT"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>
        </div>

        <!-- File Preview Section -->
        <div id="compressor-preview-section" class="d-none">
            <div class="card-premium">
                <div class="d-flex align-items-center justify-content-between flex-wrap">
                    <div class="d-flex align-items-center mb-3 mb-md-0">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-1 me-3"></i>
                        <div>
                            <h5 class="mb-1" id="compressor-preview-filename">document.pdf</h5>
                            <p class="mb-0 text-muted small" id="compressor-preview-filesize">0 MB</p>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-outline-secondary" id="compressor-cancel-btn">
                            <i class="bi bi-x-circle me-2"></i>Cancel
                        </button>
                        <button class="btn btn-danger" id="compressor-compress-btn">
                            <i class="bi bi-file-zip me-2"></i>Compress PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Processing Section -->
        <div id="compressor-processing-section" class="d-none">
            <div class="processing-spinner">
                <div class="spinner-border text-danger mb-3" role="status" style="width: 4rem; height: 4rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h3>Compressing your PDF...</h3>
                <p class="text-muted" id="compressor-processing-text">Please wait while we optimize your file</p>
                <div class="progress mt-4" style="height: 8px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" 
                         role="progressbar" style="width: 100%"></div>
                </div>
            </div>
        </div>

        <!-- Results Section -->
        <div id="compressor-results-section" class="d-none">
            <div class="text-center mb-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
                <h3 class="mt-3">Your PDF is compressed!</h3>
                <p class="text-muted">File has been optimized successfully</p>
            </div>

            <div class="card-premium">
                <div class="row g-0 align-items-center text-center">
                    <div class="col-md-5">
                        <small class="text-muted d-block mb-2">ORIGINAL SIZE</small>
                        <h3 class="mb-0 fw-bold" id="compressor-original-size">-</h3>
                    </div>
                    <div class="col-md-2">
                        <i class="bi bi-arrow-right fs-1 text-muted d-none d-md-block"></i>
                        <i class="bi bi-arrow-down fs-1 text-muted d-md-none"></i>
                    </div>
                    <div class="col-md-5">
                        <small class="text-muted d-block mb-2">COMPRESSED SIZE</small>
                        <h3 class="mb-0 fw-bold text-success" id="compressor-compressed-size">-</h3>
                    </div>
                </div>
                
                <div class="text-center mt-4">
                    <div class="badge bg-success-subtle text-success p-3 fs-6">
                        <i class="bi bi-graph-down-arrow me-2"></i>
                        <span id="compressor-compression-percent">File optimized</span>
                    </div>
                </div>
            </div>

            <!-- AdSense Ad Before Download -->
            <div class="adsense-container mt-4">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
                     data-ad-slot="HORIZONTAL-AD-SLOT"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <div class="action-buttons justify-content-center mt-4">
                <button class="btn btn-danger btn-lg" id="compressor-download-btn">
                    <i class="bi bi-download me-2"></i>Download Compressed PDF
                </button>
                <button class="btn btn-outline-secondary btn-lg" id="compressor-another-btn">
                    <i class="bi bi-arrow-clockwise me-2"></i>Compress Another
                </button>
            </div>
        </div>

        <!-- Error Section -->
        <div id="compressor-error-section" class="d-none">
            <div class="text-center">
                <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 5rem;"></i>
                <h3 class="mt-3">Something went wrong</h3>
                <div class="alert alert-warning mt-3" role="alert" id="compressor-error-message">
                    An error occurred while processing your file.
                </div>
                <button class="btn btn-danger" id="compressor-retry-btn">
                    <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                </button>
            </div>
        </div>
    `;
}

// ========================================
// Event Handlers Setup
// ========================================

/**
 * Attach event listeners after rendering
 */
export function attachEvents() {
    // Get DOM elements
    const uploadArea = document.getElementById('compressor-upload-area');
    const fileInput = document.getElementById('compressor-file-input');
    const browseBtn = document.getElementById('compressor-browse-btn');
    const cancelBtn = document.getElementById('compressor-cancel-btn');
    const compressBtn = document.getElementById('compressor-compress-btn');
    const downloadBtn = document.getElementById('compressor-download-btn');
    const anotherBtn = document.getElementById('compressor-another-btn');
    const retryBtn = document.getElementById('compressor-retry-btn');

    // Browse button
    browseBtn.addEventListener('click', () => fileInput.click());
    
    // Upload area click
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== browseBtn && !browseBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Action buttons
    cancelBtn.addEventListener('click', resetToUpload);
    compressBtn.addEventListener('click', startCompression);
    downloadBtn.addEventListener('click', downloadCompressedFile);
    anotherBtn.addEventListener('click', resetToUpload);
    retryBtn.addEventListener('click', resetToUpload);

    // Initialize AdSense ads
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('AdSense error:', e);
    }
}

// ========================================
// 👉 PASTE YOUR EXISTING COMPRESSION LOGIC BELOW
// Keep all your functions exactly as they are
// ========================================

// File handling functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('compressor-upload-area').classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('compressor-upload-area').classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('compressor-upload-area').classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        validateAndPreviewFile(files[0]);
    }
}

function validateAndPreviewFile(file) {
    // Track upload attempt
    if (window.PDFToolsApp) {
        window.PDFToolsApp.trackEvent('file_upload_attempt', {
            'tool': 'compressor',
            'file_size': file.size,
            'file_type': file.type
        });
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        showError('Please select a valid PDF file. Only PDF files are supported.');
        return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showError(`The selected file is ${fileSizeMB} MB, which exceeds the maximum size limit of ${maxSizeMB} MB.`);
        return;
    }

    // Store file and show preview
    currentFile = file;
    originalFileName = file.name;
    showFilePreview(file);
}

function showFilePreview(file) {
    document.getElementById('compressor-preview-filename').textContent = file.name;
    document.getElementById('compressor-preview-filesize').textContent = formatFileSize(file.size);
    showSection('preview');
}

async function startCompression() {
    if (!currentFile) {
        showError('No file selected. Please select a PDF file to compress.');
        return;
    }

    const startTime = Date.now();
    showSection('processing');

    try {
        // Read file
        document.getElementById('compressor-processing-text').textContent = 'Reading PDF file...';
        const arrayBuffer = await readFileAsArrayBuffer(currentFile);

        // Load PDF
        document.getElementById('compressor-processing-text').textContent = 'Analyzing PDF structure...';
        await sleep(300);
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        // Compress
        document.getElementById('compressor-processing-text').textContent = 'Compressing PDF...';
        await sleep(300);
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50,
        });

        // Create blob
        compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });

        // Track success
        const compressionTime = (Date.now() - startTime) / 1000;
        if (window.PDFToolsApp) {
            window.PDFToolsApp.trackEvent('compression_completed', {
                'tool': 'compressor',
                'original_size': currentFile.size,
                'compressed_size': compressedBlob.size,
                'compression_time': compressionTime.toFixed(2)
            });
        }

        // Show results
        await sleep(200);
        displayResults(currentFile.size, compressedBlob.size);

    } catch (error) {
        console.error('Compression error:', error);
        if (window.PDFToolsApp) {
            window.PDFToolsApp.trackEvent('compression_error', {
                'tool': 'compressor',
                'error_message': error.message
            });
        }
        handleCompressionError(error);
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

function handleCompressionError(error) {
    let errorMsg = 'We encountered an issue while compressing your PDF. ';
    
    if (error.message.includes('Invalid') || error.message.includes('parse')) {
        errorMsg += 'The file appears to be corrupted or is not a valid PDF document.';
    } else if (error.message.includes('encrypted') || error.message.includes('password')) {
        errorMsg += 'This PDF is password-protected. Please remove the password protection and try again.';
    } else {
        errorMsg += 'Please try again with a different PDF file.';
    }
    
    showError(errorMsg);
}

function displayResults(originalSize, compressedSize) {
    document.getElementById('compressor-original-size').textContent = formatFileSize(originalSize);
    document.getElementById('compressor-compressed-size').textContent = formatFileSize(compressedSize);

    const savedBytes = originalSize - compressedSize;
    const percentReduction = ((savedBytes / originalSize) * 100).toFixed(1);

    if (savedBytes > 0) {
        document.getElementById('compressor-compression-percent').innerHTML = `
            Reduced by ${percentReduction}% • Saved ${formatFileSize(savedBytes)}
        `;
    } else {
        document.getElementById('compressor-compression-percent').textContent = 'File is already optimized';
    }

    showSection('results');
    
    // Reinitialize AdSense
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('AdSense error:', e);
    }
}

function downloadCompressedFile() {
    if (!compressedBlob) {
        showError('No compressed file available. Please try compressing the file again.');
        return;
    }

    // Track download
    if (window.PDFToolsApp) {
        window.PDFToolsApp.trackEvent('file_downloaded', {
            'tool': 'compressor',
            'original_size': currentFile.size,
            'compressed_size': compressedBlob.size
        });
    }

    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFileName.replace(/\.pdf$/i, '-compressed.pdf');
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function showSection(sectionName) {
    const sections = ['upload', 'preview', 'processing', 'results', 'error'];
    sections.forEach(section => {
        document.getElementById(`compressor-${section}-section`).classList.add('d-none');
    });
    document.getElementById(`compressor-${sectionName}-section`).classList.remove('d-none');
}

function showError(message) {
    document.getElementById('compressor-error-message').textContent = message;
    showSection('error');
}

function resetToUpload() {
    currentFile = null;
    compressedBlob = null;
    originalFileName = '';
    document.getElementById('compressor-file-input').value = '';
    showSection('upload');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// Module Initialization (Alternative to render + attachEvents)
// ========================================

/**
 * Initialize the compressor tool
 * This is called by the app controller
 */
export function init(container) {
    container.innerHTML = render();
    attachEvents();
}
