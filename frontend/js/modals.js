// ===== MODAL MANAGEMENT =====

/**
 * Show a modal
 * @param {string} modalId - Modal element ID
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Close a modal
 * @param {string} modalId - Modal element ID
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Setup modal click-outside-to-close handlers
 * @param {string[]} modalIds - Array of modal IDs
 */
export function setupModalClosers(modalIds) {
    modalIds.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === modalId) {
                    closeModal(modalId);
                }
            });
        }
    });
}

/**
 * Setup ESC key to close modals
 * @param {string[]} modalIds - Array of modal IDs to close on ESC
 */
export function setupEscapeKey(modalIds) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalIds.forEach(modalId => closeModal(modalId));
        }
    });
}

/**
 * Setup all modal event listeners
 * @param {string[]} modalIds - Array of modal IDs
 */
export function setupModals(modalIds) {
    setupModalClosers(modalIds);
    setupEscapeKey(modalIds);
}

