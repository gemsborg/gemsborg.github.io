/**
 * PDF Tools - Main App Controller
 * 
 * Handles:
 * - Tool routing and switching
 * - Sidebar navigation
 * - Mobile menu toggle
 * - Dynamic content loading
 * - Google Analytics tracking
 */

// ========================================
// App State
// ========================================
const AppState = {
    currentTool: 'compressor',
    loadedModules: {},
    isMobile: window.innerWidth < 992
};

// ========================================
// Tool Registry
// ========================================
const ToolRegistry = {
    'compressor': {
        name: 'PDF Compressor',
        module: './js/modules/compressor.js',
        requiresLibrary: 'pdf-lib',
        loaded: false
    },
    'viewer': {
        name: 'PDF Viewer',
        module: './js/modules/viewer.js',
        requiresLibrary: 'pdf.js',
        loaded: false
    },
    'merge': {
        name: 'Merge PDF',
        module: './js/modules/merge.js',
        requiresLibrary: 'pdf-lib',
        loaded: false
    },
    'split': {
        name: 'Split PDF',
        module: './js/modules/split.js',
        requiresLibrary: 'pdf-lib',
        loaded: false
    },
    'pdf-to-images': {
        name: 'PDF to Images',
        module: './js/modules/pdf-to-images.js',
        requiresLibrary: 'pdf.js',
        loaded: false
    },
    'images-to-pdf': {
        name: 'Images to PDF',
        module: './js/modules/images-to-pdf.js',
        requiresLibrary: 'pdf-lib',
        loaded: false
    },
    'text-extractor': {
        name: 'Text Extractor',
        module: './js/modules/text-extractor.js',
        requiresLibrary: 'pdf.js',
        loaded: false
    },
    'ocr': {
        name: 'OCR Tool',
        module: './js/modules/ocr.js',
        requiresLibrary: 'tesseract',
        loaded: false
    }
};

// ========================================
// Google Analytics Helper
// ========================================
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
        console.log('Analytics Event:', eventName, eventParams);
    }
}

function trackPageView(toolName) {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-XXXXXXXXXX', {
            'page_path': '/' + toolName
        });
    }
}

// ========================================
// Tool Switching Logic
// ========================================
async function switchTool(toolId) {
    const toolContent = document.getElementById('toolContent');
    const toolConfig = ToolRegistry[toolId];
    
    if (!toolConfig) {
        console.error('Tool not found:', toolId);
        return;
    }
    
    // Track tool switch
    trackEvent('tool_switched', {
        'from_tool': AppState.currentTool,
        'to_tool': toolId,
        'tool_name': toolConfig.name
    });
    trackPageView(toolId);
    
    // Update active state in sidebar
    document.querySelectorAll('.tool-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-tool="${toolId}"]`).classList.add('active');
    
    // Show loading state
    toolContent.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading ${toolConfig.name}...</p>
        </div>
    `;
    
    // Lazy load required library if needed
    if (toolConfig.requiresLibrary && !AppState.loadedModules[toolConfig.requiresLibrary]) {
        await loadLibrary(toolConfig.requiresLibrary);
        AppState.loadedModules[toolConfig.requiresLibrary] = true;
    }
    
    // Load tool module
    try {
        const module = await import(toolConfig.module);
        toolConfig.loaded = true;
        
        // Initialize tool
        if (module.init) {
            module.init(toolContent);
        } else if (module.render) {
            toolContent.innerHTML = module.render();
            if (module.attachEvents) {
                module.attachEvents();
            }
        }
        
        AppState.currentTool = toolId;
        
        // Close mobile sidebar if open
        if (AppState.isMobile) {
            closeMobileSidebar();
        }
        
    } catch (error) {
        console.error('Error loading tool:', error);
        toolContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Tool</h4>
                <p>Failed to load ${toolConfig.name}. Please try again.</p>
                <hr>
                <p class="mb-0">${error.message}</p>
            </div>
        `;
    }
}

// ========================================
// Library Lazy Loading
// ========================================
async function loadLibrary(libraryName) {
    console.log('Loading library:', libraryName);
    
    return new Promise((resolve, reject) => {
        // PDF-Lib is already loaded in HTML
        if (libraryName === 'pdf-lib') {
            if (typeof PDFLib !== 'undefined') {
                resolve();
            } else {
                reject(new Error('PDF-Lib not found'));
            }
            return;
        }
        
        // Lazy load other libraries
        const script = document.createElement('script');
        
        switch (libraryName) {
            case 'pdf.js':
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                break;
            case 'tesseract':
                script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
                break;
            default:
                reject(new Error('Unknown library: ' + libraryName));
                return;
        }
        
        script.onload = () => {
            console.log('Loaded:', libraryName);
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load ' + libraryName));
        
        document.head.appendChild(script);
    });
}

// ========================================
// Mobile Sidebar Toggle
// ========================================
function toggleMobileSidebar() {
    const sidebar = document.getElementById('toolsSidebar');
    const overlay = document.getElementById('sidebarOverlay') || createOverlay();
    
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('toolsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', closeMobileSidebar);
    document.body.appendChild(overlay);
    return overlay;
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Tool card clicks
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const toolId = card.getAttribute('data-tool');
            switchTool(toolId);
        });
    });
    
    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileSidebar);
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.tool) {
            switchTool(e.state.tool);
        }
    });
    
    // Handle hash changes for direct links
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash && ToolRegistry[hash]) {
            switchTool(hash);
        }
    });
    
    // Responsive handling
    window.addEventListener('resize', () => {
        AppState.isMobile = window.innerWidth < 992;
        if (!AppState.isMobile) {
            closeMobileSidebar();
        }
    });
}

// ========================================
// Initial Load
// ========================================
function initializeApp() {
    console.log('🚀 PDF Tools App Initialized');
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    const initialTool = (hash && ToolRegistry[hash]) ? hash : 'compressor';
    
    // Load initial tool (PDF Compressor by default)
    switchTool(initialTool);
    
    // Track app initialization
    trackEvent('app_initialized', {
        'initial_tool': initialTool,
        'user_agent': navigator.userAgent,
        'screen_width': window.innerWidth
    });
}

// ========================================
// App Entry Point
// ========================================
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for modules to access
window.PDFToolsApp = {
    switchTool,
    trackEvent,
    getState: () => AppState
};
