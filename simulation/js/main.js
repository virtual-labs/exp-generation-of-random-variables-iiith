// Main simulation class
class RandomVariableSimulation {
    constructor() {
        console.log('Initializing RandomVariableSimulation...');
        this.canvas = document.getElementById('visualization-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.distribution = null;
        this.animationId = null;
        this.isAnimating = false;
        this.sampleSize = 500;
        this.histogramBins = 30;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeEventListeners();
                this.setupCanvas();
                this.updateUI();
            });
        } else {
            this.initializeEventListeners();
            this.setupCanvas();
            this.updateUI();
        }
        console.log('RandomVariableSimulation initialized');
    }

    setupCanvas() {
        console.log('Setting up canvas...');
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
            this.draw();
        };

        // Initial resize
        resizeCanvas();

        // Resize on window resize
        window.addEventListener('resize', resizeCanvas);

        // Force a resize after a short delay to ensure proper sizing
        setTimeout(resizeCanvas, 100);
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // Distribution selection
        const distributionSelect = document.getElementById('distribution-type-select');
        console.log('Distribution select element:', distributionSelect);
        
        if (distributionSelect) {
            distributionSelect.addEventListener('change', (e) => {
                console.log('Distribution changed to:', e.target.value);
                this.distribution = e.target.value;
                this.updateDistributionParameters();
                this.updateUI();
                this.generateData();
            });

            // Set default distribution
            console.log('Setting default distribution to normal...');
            distributionSelect.value = 'normal';
            this.distribution = 'normal';
            this.updateDistributionParameters();
            this.generateData();
        } else {
            console.error('Distribution select element not found');
        }

        // Sample size control
        const sampleSizeInput = document.getElementById('sample-size-input');
        const sampleSizeDisplay = document.getElementById('sample-size-display');
        const sampleSizeStatus = document.getElementById('sample-size-status');
        console.log('Sample size elements:', { 
            input: sampleSizeInput, 
            display: sampleSizeDisplay,
            status: sampleSizeStatus 
        });
        
        if (sampleSizeInput && sampleSizeDisplay && sampleSizeStatus) {
            // Set initial value
            sampleSizeInput.value = this.sampleSize;
            sampleSizeDisplay.textContent = this.sampleSize;
            sampleSizeStatus.textContent = this.sampleSize;
            
            sampleSizeInput.addEventListener('input', (e) => {
                const newSize = parseInt(e.target.value);
                console.log('Sample size changed to:', newSize);
                this.sampleSize = newSize;
                sampleSizeDisplay.textContent = newSize;
                sampleSizeStatus.textContent = newSize;
                this.updateUI();
                this.generateData();
            });
        } else {
            console.error('Sample size elements not found:', { 
                input: sampleSizeInput, 
                display: sampleSizeDisplay,
                status: sampleSizeStatus 
            });
        }

        // Simulation controls
        const generateBtn = document.getElementById('generate-btn');
        const animateBtn = document.getElementById('animate-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        console.log('Control buttons:', { generateBtn, animateBtn, resetBtn });

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('Generate button clicked');
                this.generateData();
            });
        }

        if (animateBtn) {
            animateBtn.addEventListener('click', () => {
                console.log('Animate button clicked');
                this.toggleAnimation();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset button clicked');
                this.reset();
            });
        }

        // Canvas controls
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetViewBtn = document.getElementById('reset-view');
        
        console.log('Canvas control buttons:', { zoomInBtn, zoomOutBtn, resetViewBtn });

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                console.log('Zoom in clicked');
                this.zoomIn();
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                console.log('Zoom out clicked');
                this.zoomOut();
            });
        }

        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                console.log('Reset view clicked');
                this.resetView();
            });
        }
    }

    updateDistributionParameters() {
        console.log('Updating distribution parameters for:', this.distribution);
        const container = document.getElementById('distribution-parameters');
        if (!container) {
            console.error('Distribution parameters container not found');
            return;
        }

        container.innerHTML = '';

        switch (this.distribution) {
            case 'uniform':
                console.log('Adding uniform distribution parameters');
                this.addParameterInput(container, 'min', 'Minimum', -10, 10, 0);
                this.addParameterInput(container, 'max', 'Maximum', -10, 10, 1);
                break;
            case 'normal':
                console.log('Adding normal distribution parameters');
                this.addParameterInput(container, 'mean', 'Mean', -10, 10, 0);
                this.addParameterInput(container, 'stddev', 'Standard Deviation', 0.1, 5, 1);
                break;
            case 'exponential':
                console.log('Adding exponential distribution parameters');
                this.addParameterInput(container, 'lambda', 'Rate (λ)', 0.1, 5, 1);
                break;
        }

        // Update UI after parameters are set
        this.updateUI();
    }

    addParameterInput(container, id, label, min, max, value) {
        console.log(`Adding parameter input: ${id} (${label})`);
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label for="${id}">${label}:</label>
            <div class="range-with-value">
                <input type="range" id="${id}" min="${min}" max="${max}" step="0.01" value="${value}" class="form-range">
                <span id="${id}-display" class="range-value">${value}</span>
            </div>
        `;
        container.appendChild(div);

        const input = div.querySelector('input');
        const display = div.querySelector('.range-value');
        if (input && display) {
            input.addEventListener('input', (e) => {
                const newValue = parseFloat(e.target.value);
                console.log(`Parameter ${id} changed to:`, newValue);
                display.textContent = newValue.toFixed(2);
                this.generateData();
            });
        }
    }

    generateData() {
        console.log('Generating data...');
        if (!this.distribution) {
            console.warn('No distribution selected');
            return;
        }

        this.data = [];
        const params = this.getDistributionParameters();
        console.log('Distribution parameters:', params);

        switch (this.distribution) {
            case 'uniform':
                console.log('Generating uniform distribution');
                this.data = this.generateUniform(params.min, params.max);
                break;
            case 'normal':
                console.log('Generating normal distribution');
                this.data = this.generateNormal(params.mean, params.stddev);
                break;
            case 'exponential':
                console.log('Generating exponential distribution');
                this.data = this.generateExponential(params.lambda);
                break;
        }

        console.log(`Generated ${this.data.length} data points`);
        this.updateStatistics();
        this.draw();
        this.updateUI(); // Update UI after data generation
        this.showNotification('Data generated successfully', 'success');
    }

    generateUniform(min, max) {
        console.log(`Generating uniform distribution: min=${min}, max=${max}`);
        return Array.from({ length: this.sampleSize }, () => 
            min + Math.random() * (max - min)
        );
    }

    generateNormal(mean, stddev) {
        console.log(`Generating normal distribution: mean=${mean}, stddev=${stddev}`);
        return Array.from({ length: this.sampleSize }, () => {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return mean + z0 * stddev;
        });
    }

    generateExponential(lambda) {
        console.log(`Generating exponential distribution: lambda=${lambda}`);
        return Array.from({ length: this.sampleSize }, () => 
            -Math.log(1 - Math.random()) / lambda
        );
    }

    getDistributionParameters() {
        console.log('Getting distribution parameters for:', this.distribution);
        const params = {};
        switch (this.distribution) {
            case 'uniform':
                params.min = parseFloat(document.getElementById('min').value);
                params.max = parseFloat(document.getElementById('max').value);
                break;
            case 'normal':
                params.mean = parseFloat(document.getElementById('mean').value);
                params.stddev = parseFloat(document.getElementById('stddev').value);
                break;
            case 'exponential':
                params.lambda = parseFloat(document.getElementById('lambda').value);
                break;
        }
        console.log('Parameters:', params);
        return params;
    }

    updateStatistics() {
        console.log('Updating statistics...');
        if (this.data.length === 0) {
            console.warn('No data to calculate statistics');
            return;
        }

        const mean = this.data.reduce((a, b) => a + b, 0) / this.data.length;
        const variance = this.data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.data.length;
        const stddev = Math.sqrt(variance);

        console.log('Statistics:', { mean, variance, stddev });

        const meanValue = document.getElementById('mean-value');
        const stdDevValue = document.getElementById('std-dev-value');
        
        if (meanValue) meanValue.textContent = mean.toFixed(4);
        if (stdDevValue) stdDevValue.textContent = stddev.toFixed(4);

        // Update UI after statistics
        this.updateUI();
    }

    draw() {
        console.log('Drawing visualization...');
        if (!this.ctx) {
            console.error('Canvas context not available');
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        if (this.data.length === 0) {
            console.warn('No data to draw');
            return;
        }

        this.drawGrid();
        this.drawHistogram();
        this.drawPDF();
        console.log('Drawing completed');
    }

    drawGrid() {
        console.log('Drawing grid...');
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;

        // Draw vertical grid lines
        for (let x = 0; x <= width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y <= height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawHistogram() {
        console.log('Drawing histogram...');
        const width = this.canvas.width;
        const height = this.canvas.height;
        const min = Math.min(...this.data);
        const max = Math.max(...this.data);
        const range = max - min;
        const binWidth = range / this.histogramBins;

        // Count frequencies
        const frequencies = new Array(this.histogramBins).fill(0);
        this.data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), this.histogramBins - 1);
            frequencies[binIndex]++;
        });

        // Find maximum frequency for scaling
        const maxFreq = Math.max(...frequencies);

        // Draw histogram bars
        this.ctx.fillStyle = 'rgba(33, 150, 243, 0.5)';
        this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)';
        this.ctx.lineWidth = 1;

        frequencies.forEach((freq, i) => {
            const x = (i / this.histogramBins) * width;
            const barHeight = (freq / maxFreq) * height;
            this.ctx.fillRect(x, height - barHeight, width / this.histogramBins - 1, barHeight);
            this.ctx.strokeRect(x, height - barHeight, width / this.histogramBins - 1, barHeight);
        });
    }

    drawPDF() {
        console.log('Drawing PDF...');
        if (!this.distribution) {
            console.warn('No distribution selected for PDF');
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        const min = Math.min(...this.data);
        const max = Math.max(...this.data);
        const range = max - min;

        this.ctx.strokeStyle = '#f44336';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const params = this.getDistributionParameters();
        let pdf;

        for (let x = 0; x < width; x++) {
            const value = min + (x / width) * range;
            switch (this.distribution) {
                case 'uniform':
                    pdf = value >= params.min && value <= params.max ? 1 / (params.max - params.min) : 0;
                    break;
                case 'normal':
                    pdf = Math.exp(-Math.pow(value - params.mean, 2) / (2 * Math.pow(params.stddev, 2))) /
                          (params.stddev * Math.sqrt(2 * Math.PI));
                    break;
                case 'exponential':
                    pdf = value >= 0 ? params.lambda * Math.exp(-params.lambda * value) : 0;
                    break;
            }

            const y = height - (pdf * height * 5); // Scale for visibility
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    toggleAnimation() {
        console.log('Toggling animation...');
        if (this.isAnimating) {
            this.pauseAnimation();
        } else {
            this.startAnimation();
        }
        this.updateUI(); // Update UI after animation state change
    }

    startAnimation() {
        console.log('Starting animation...');
        if (this.isAnimating) return;
        this.isAnimating = true;
        document.getElementById('animate-btn').textContent = 'Stop';
        this.animate();
    }

    pauseAnimation() {
        console.log('Pausing animation...');
        if (!this.isAnimating) return;
        this.isAnimating = false;
        document.getElementById('animate-btn').textContent = 'Animate';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        if (!this.isAnimating) return;

        this.generateData();
        this.animationId = requestAnimationFrame(() => {
            setTimeout(() => this.animate(), 1000);
        });
    }

    reset() {
        console.log('Resetting simulation...');
        this.data = [];
        this.pauseAnimation();
        this.draw();
        this.updateUI(); // Update UI after reset
        this.showNotification('Simulation reset', 'info');
    }

    updateUI() {
        console.log('Updating UI...');
        
        // Update sample size elements
        const sampleSizeInput = document.getElementById('sample-size-input');
        const sampleSizeDisplay = document.getElementById('sample-size-display');
        const sampleSizeStatus = document.getElementById('sample-size-status');
        
        if (sampleSizeInput && sampleSizeDisplay && sampleSizeStatus) {
            sampleSizeInput.value = this.sampleSize;
            sampleSizeDisplay.textContent = this.sampleSize;
            sampleSizeStatus.textContent = this.sampleSize;
            console.log('Updated sample size elements:', {
                input: this.sampleSize,
                display: this.sampleSize,
                status: this.sampleSize
            });
        }

        // Update status panel elements
        const statusElements = {
            distribution: document.getElementById('distribution-type'),
            generationStatus: document.getElementById('generation-status'),
            meanValue: document.getElementById('mean-value'),
            stdDevValue: document.getElementById('std-dev-value')
        };

        // Update distribution type in status
        if (statusElements.distribution) {
            // Get the distribution display text
            let distributionText = 'Not selected';
            if (this.distribution) {
                switch (this.distribution) {
                    case 'uniform':
                        distributionText = 'Uniform';
                        break;
                    case 'normal':
                        distributionText = 'Normal (Gaussian)';
                        break;
                    case 'exponential':
                        distributionText = 'Exponential';
                        break;
                }
            }
            
            statusElements.distribution.textContent = distributionText;
            console.log('Updated distribution type:', distributionText);
        }

        // Update generation status
        if (statusElements.generationStatus) {
            const status = this.data.length > 0 ? 'Generated' : 'Not started';
            statusElements.generationStatus.textContent = status;
            statusElements.generationStatus.className = `status-value ${this.data.length > 0 ? 'status-success' : 'status-waiting'}`;
            console.log('Updated generation status:', status);
        }

        // Update statistics
        if (this.data.length > 0) {
            const mean = this.data.reduce((a, b) => a + b, 0) / this.data.length;
            const variance = this.data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.data.length;
            const stddev = Math.sqrt(variance);

            if (statusElements.meanValue) {
                statusElements.meanValue.textContent = mean.toFixed(4);
                console.log('Updated mean:', mean.toFixed(4));
            }
            
            if (statusElements.stdDevValue) {
                statusElements.stdDevValue.textContent = stddev.toFixed(4);
                console.log('Updated std dev:', stddev.toFixed(4));
            }
        }

        // Update animation status
        const animateBtn = document.getElementById('animate-btn');
        if (animateBtn) {
            animateBtn.textContent = this.isAnimating ? 'Stop' : 'Animate';
            console.log('Updated animation status:', this.isAnimating ? 'Stop' : 'Animate');
        }

        console.log('UI updated with:', {
            distribution: this.distribution,
            sampleSize: this.sampleSize,
            dataPoints: this.data.length,
            isAnimating: this.isAnimating
        });
    }

    showNotification(message, type = 'info') {
        console.log(`Showing notification: ${message} (${type})`);
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        container.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    zoomIn() {
        console.log('Zooming in...');
        this.zoom *= 1.2;
        this.draw();
    }

    zoomOut() {
        console.log('Zooming out...');
        this.zoom /= 1.2;
        this.draw();
    }

    resetView() {
        console.log('Resetting view...');
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.draw();
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing simulation...');
    new RandomVariableSimulation();
});
