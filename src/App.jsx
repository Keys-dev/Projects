import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

// DOM Elements
const addFileForm = document.getElementById('add-file-form');
const editFileForm = document.getElementById('edit-file-form');
const filesList = document.getElementById('files-list');
const fileCount = document.getElementById('file-count');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const clearSearchBtn = document.getElementById('clear-search');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const sortBy = document.getElementById('sort-by');
const editModal = document.getElementById('edit-modal');
const confirmModal = document.getElementById('confirm-modal');
const closeModalBtn = document.querySelector('.close-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// State
let files = [];
let currentFilters = {
    type: '',
    category: ''
};
let currentSort = 'dateAdded-desc';
let currentSearch = '';
let currentSearchType = 'all';
let fileToDelete = null;

// Initialize the app
function init() {
    loadFilesFromStorage();
    renderFiles();
    setCurrentDate();

    // Event listeners
    addFileForm.addEventListener('submit', handleAddFile);
    editFileForm.addEventListener('submit', handleEditFile);
    searchInput.addEventListener('input', handleSearch);
    searchType.addEventListener('change', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    sortBy.addEventListener('change', handleSort);
    closeModalBtn.addEventListener('click', closeModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closeConfirmModal);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

// Set current date in the date input
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-added').value = today;
    document.getElementById('edit-date-added').value = today;
}

// Load files from local storage
function loadFilesFromStorage() {
    const storedFiles = localStorage.getItem('physicalFiles');
    if (storedFiles) {
        files = JSON.parse(storedFiles);
    }
}

// Save files to local storage
function saveFilesToStorage() {
    localStorage.setItem('physicalFiles', JSON.stringify(files));
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Handle adding a new file
function handleAddFile(e) {
    e.preventDefault();

    const newFile = {
        id: generateId(),
        type: document.getElementById('file-type').value,
        name: document.getElementById('file-name').value,
        location: document.getElementById('file-location').value,
        category: document.getElementById('file-category').value,
        notes: document.getElementById('file-notes').value,
        dateAdded: document.getElementById('date-added').value || new Date().toISOString().split('T')[0]
    };

    files.unshift(newFile);
    saveFilesToStorage();
    renderFiles();
    addFileForm.reset();
    setCurrentDate();
    showToast('File added successfully!', 'success');
}

// Handle editing a file
function handleEditFile(e) {
    e.preventDefault();

    const fileId = document.getElementById('edit-file-id').value;
    const fileIndex = files.findIndex(file => file.id === fileId);

    if (fileIndex !== -1) {
        files[fileIndex] = {
            ...files[fileIndex],
            type: document.getElementById('edit-file-type').value,
            name: document.getElementById('edit-file-name').value,
            location: document.getElementById('edit-file-location').value,
            category: document.getElementById('edit-file-category').value,
            notes: document.getElementById('edit-file-notes').value,
            dateAdded: document.getElementById('edit-date-added').value
        };

        saveFilesToStorage();
        renderFiles();
        closeModal();
        showToast('File updated successfully!', 'success');
    }
}

// Open edit modal
function openEditModal(fileId) {
    const file = files.find(file => file.id === fileId);

    if (file) {
        document.getElementById('edit-file-id').value = file.id;
        document.getElementById('edit-file-type').value = file.type;
        document.getElementById('edit-file-name').value = file.name;
        document.getElementById('edit-file-location').value = file.location;
        document.getElementById('edit-file-category').value = file.category;
        document.getElementById('edit-file-notes').value = file.notes;
        document.getElementById('edit-date-added').value = file.dateAdded;

        editModal.style.display = 'block';
    }
}

// Close edit modal
function closeModal() {
    editModal.style.display = 'none';
}

// Open confirm delete modal
function openConfirmModal(fileId) {
    fileToDelete = fileId;
    confirmModal.style.display = 'block';
}

// Close confirm delete modal
function closeConfirmModal() {
    confirmModal.style.display = 'none';
    fileToDelete = null;
}

// Confirm delete file
function confirmDelete() {
    if (fileToDelete) {
        deleteFile(fileToDelete);
        closeConfirmModal();
    }
}

// Delete a file
function deleteFile(fileId) {
    files = files.filter(file => file.id !== fileId);
    saveFilesToStorage();
    renderFiles();
    showToast('File deleted successfully!', 'error');
}

// Handle search
function handleSearch() {
    currentSearch = searchInput.value.trim().toLowerCase();
    currentSearchType = searchType.value;
    renderFiles();
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    searchType.value = 'all';
    currentSearch = '';
    currentSearchType = 'all';
    renderFiles();
}

// Apply filters
function applyFilters() {
    currentFilters.type = filterType.value;
    currentFilters.category = filterCategory.value;
    renderFiles();
}

// Clear filters
function clearFilters() {
    filterType.value = '';
    filterCategory.value = '';
    currentFilters.type = '';
    currentFilters.category = '';
    renderFiles();
}

// Handle sort
function handleSort() {
    currentSort = sortBy.value;
    renderFiles();
}

// Filter files based on search and filters
function filterFiles() {
    return files.filter(file => {
        // Apply search
        if (currentSearch) {
            if (currentSearchType === 'name') {
                if (!file.name.toLowerCase().includes(currentSearch)) {
                    return false;
                }
            } else if (currentSearchType === 'location') {
                if (!file.location.toLowerCase().includes(currentSearch)) {
                    return false;
                }
            } else if (currentSearchType === 'category') {
                if (!file.category.toLowerCase().includes(currentSearch)) {
                    return false;
                }
            } else { // 'all'
                if (!file.name.toLowerCase().includes(currentSearch) &&
                    !file.location.toLowerCase().includes(currentSearch) &&
                    !file.category.toLowerCase().includes(currentSearch) &&
                    !file.notes.toLowerCase().includes(currentSearch)) {
                    return false;
                }
            }
        }

        // Apply type filter
        if (currentFilters.type && file.type !== currentFilters.type) {
            return false;
        }

        // Apply category filter
        if (currentFilters.category && file.category !== currentFilters.category) {
            return false;
        }

        return true;
    });
}

// Sort files
function sortFiles(filteredFiles) {
    const [field, direction] = currentSort.split('-');

    return filteredFiles.sort((a, b) => {
        if (field === 'dateAdded') {
            const dateA = new Date(a.dateAdded);
            const dateB = new Date(b.dateAdded);
            return direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (field === 'name') {
            return direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (field === 'type') {
            return a.type.localeCompare(b.type);
        } else if (field === 'category') {
            return a.category.localeCompare(b.category);
        }
        return 0;
    });
}

// Render files
function renderFiles() {
    const filteredFiles = filterFiles();
    const sortedFiles = sortFiles(filteredFiles);

    fileCount.textContent = `(${sortedFiles.length})`;

    if (sortedFiles.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open empty-icon"></i>
                <p>${files.length === 0 ? 'No files added yet. Add your first file using the form.' : 'No files match your search or filters.'}</p>
            </div>
        `;
        return;
    }

    filesList.innerHTML = '';

    sortedFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';

        // Get icon based on file type
        let typeIcon = 'fa-file';
        if (file.type === 'folder') typeIcon = 'fa-folder';
        else if (file.type === 'box') typeIcon = 'fa-box';
        else if (file.type === 'binder') typeIcon = 'fa-book';

        // Format date
        const dateAdded = new Date(file.dateAdded);
        const formattedDate = dateAdded.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        fileCard.innerHTML = `
            <div class="file-header">
                <div class="file-title">
                    <div class="file-type-icon">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <h3>${file.name}</h3>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn edit" title="Edit" onclick="openEditModal('${file.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="file-action-btn delete" title="Delete" onclick="openConfirmModal('${file.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="file-details">
                <div class="file-detail">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${file.location}</span>
                </div>
                <div class="file-detail">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${file.type.charAt(0).toUpperCase() + file.type.slice(1)}</span>
                </div>
                <div class="file-detail">
                    <span class="detail-label">Date Added</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                ${file.category ? `
                <div class="file-detail">
                    <span class="detail-label">Category</span>
                    <span class="file-category category-${file.category}">${file.category}</span>
                </div>
                ` : ''}
            </div>
            ${file.notes ? `
            <div class="file-notes">
                <div class="notes-label">Notes</div>
                <div class="notes-value">${file.notes}</div>
            </div>
            ` : ''}
        `;

        filesList.appendChild(fileCard);
    });
}

// Show toast notification
function showToast(message, type) {
    toastMessage.textContent = message;

    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    }

    toast.style.display = 'block';

    // Animate progress bar
    const progress = toast.querySelector('.toast-progress');
    progress.style.width = '100%';
    progress.style.transition = 'none';

    setTimeout(() => {
        progress.style.width = '0';
        progress.style.transition = 'width 3s linear';
    }, 100);

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Initialize the app
init();
}

export default App
