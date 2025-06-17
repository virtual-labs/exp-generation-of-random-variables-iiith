// Responsive behavior handling
class ResponsiveHandler {
    constructor() {
        this.initializeEventListeners();
        this.checkScreenSize();
    }

    initializeEventListeners() {
        window.addEventListener('resize', () => this.checkScreenSize());
        window.addEventListener('orientationchange', () => this.checkScreenSize());
    }

    checkScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;

        // Update layout based on screen size
        this.updateLayout(width, isLandscape);

        // Update control panel visibility
        this.updateControlPanelVisibility(width);

        // Update canvas size
        this.updateCanvasSize(width, height);
    }

    updateLayout(width, isLandscape) {
        const visualizationSection = document.querySelector('.visualization-section');
        const infoPanel = document.querySelector('.info-panel');
        const controlSection = document.querySelector('.control-section');

        if (width <= 991) {
            // Stack layout for small screens
            visualizationSection.style.flexDirection = 'column';
            infoPanel.style.minWidth = '100%';
            controlSection.style.marginTop = '1rem';
        } else if (width <= 767 && isLandscape) {
            // Side-by-side layout for mobile landscape
            visualizationSection.style.flexDirection = 'row';
            infoPanel.style.minWidth = '300px';
        } else {
            // Default layout for larger screens
            visualizationSection.style.flexDirection = 'row';
            infoPanel.style.minWidth = '300px';
            controlSection.style.marginTop = '0';
        }
    }

    updateControlPanelVisibility(width) {
        const controlPanel = document.querySelector('.control-panel');
        const buttonGroups = document.querySelectorAll('.button-group');

        if (width <= 767) {
            // Stack buttons vertically on small screens
            buttonGroups.forEach(group => {
                group.style.flexDirection = 'column';
                group.querySelectorAll('.btn').forEach(btn => {
                    btn.style.width = '100%';
                });
            });
        } else {
            // Horizontal button layout for larger screens
            buttonGroups.forEach(group => {
                group.style.flexDirection = 'row';
                group.querySelectorAll('.btn').forEach(btn => {
                    btn.style.width = 'auto';
                });
            });
        }
    }

    updateCanvasSize(width, height) {
        const canvas = document.getElementById('visualization-canvas');
        const container = canvas.parentElement;

        // Set minimum height for canvas
        const minHeight = Math.min(400, height * 0.6);
        container.style.minHeight = `${minHeight}px`;

        // Adjust canvas size to maintain aspect ratio
        if (width <= 767) {
            canvas.style.maxHeight = `${height * 0.4}px`;
        } else {
            canvas.style.maxHeight = 'none';
        }
    }
}

// Initialize responsive handler when the page loads
window.addEventListener('load', () => {
    new ResponsiveHandler();
}); 