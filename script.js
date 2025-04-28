class DeepSearch {
    constructor() {
        this.currentSearchType = 'google';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSearchHistory();
        this.updateSearchOptions();
    }

    setupEventListeners() {
        // Search type selection
        document.querySelectorAll('[data-search-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-search-type]').forEach(b => 
                    b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSearchType = btn.dataset.searchType;
                this.updateSearchOptions();
            });
        });

        // Search button
        document.getElementById('search-btn').addEventListener('click', () => 
            this.performSearch());

        // Clear history
        document.getElementById('clear-history')?.addEventListener('click', () => 
            this.clearHistory());
    }

    async performSearch() {
        const keyword = document.getElementById('keyword').value.trim();
        if (!keyword) return this.showAlert('Please enter a search term', 'warning');

        this.showLoading();

        try {
            const results = await this.executeSearch(keyword);
            this.displayResults(results);
            this.saveToHistory(keyword, this.currentSearchType);
        } catch (error) {
            console.error('Search error:', error);
            this.showAlert(`Search failed: ${error.message}`, 'danger');
        }
    }

    async executeSearch(keyword) {
        switch(this.currentSearchType) {
            case 'google': return this.searchGoogle(keyword);
            case 'ftp': return this.searchFTP(keyword);
            case 'dir': return this.searchDirectory(keyword);
            case 'github': return this.searchGitHub(keyword);
            case 'shodan': return this.searchShodan(keyword);
            default: throw new Error('Invalid search type');
        }
    }

    async searchGoogle(query) {
        const fileType = document.getElementById('file-type')?.value || 'pdf';
        const domain = document.getElementById('domain')?.value || '';
        
        let searchQuery = `site:drive.google.com filetype:${fileType} "${query}"`;
        if (domain) searchQuery += ` site:${domain}`;
        
        return {
            type: 'google',
            query: searchQuery,
            results: [{
                title: `Google Drive results for "${query}"`,
                url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
                description: `Click to view search results on Google`
            }]
        };
    }

    // Other search methods (ftp, directory, github, shodan) would follow similar patterns

    displayResults(data) {
        const resultsDiv = document.getElementById('results');
        
        if (!data.results || data.results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="alert alert-info">
                    No results found for your search.
                </div>
            `;
            return;
        }

        let html = `
            <div class="alert alert-primary">
                <strong>Search Query:</strong> ${data.query}
            </div>
            <div class="list-group">
        `;
        
        data.results.forEach(result => {
            html += `
                <a href="${result.url}" target="_blank" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${result.title}</h6>
                        <small class="text-muted">${data.type}</small>
                    </div>
                    <p class="mb-1">${result.description}</p>
                    <small class="text-muted">${result.url}</small>
                </a>
            `;
        });
        
        html += `</div>`;
        resultsDiv.innerHTML = html;
    }

    // History management methods
    loadSearchHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('deepSearchHistory') || '[]');
            this.updateHistoryDisplay(history);
        } catch (error) {
            console.error('Failed to load history:', error);
            localStorage.setItem('deepSearchHistory', '[]');
        }
    }

    saveToHistory(query, type) {
        try {
            const history = JSON.parse(localStorage.getItem('deepSearchHistory') || '[]');
            history.unshift({ 
                query, 
                type, 
                timestamp: new Date().toISOString() 
            });
            localStorage.setItem('deepSearchHistory', JSON.stringify(history.slice(0, 10)));
            this.updateHistoryDisplay(history);
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    clearHistory() {
        localStorage.setItem('deepSearchHistory', '[]');
        this.updateHistoryDisplay([]);
    }

    updateHistoryDisplay(history) {
        const historyDiv = document.getElementById('recent-searches');
        if (!historyDiv) return;

        historyDiv.innerHTML = history.length > 0 
            ? history.map(item => `
                <button class="list-group-item list-group-item-action small">
                    <span class="badge bg-secondary me-1">${item.type}</span>
                    ${item.query.substring(0, 20)}${item.query.length > 20 ? '...' : ''}
                </button>
              `).join('')
            : `<div class="text-center text-muted p-2">No recent searches</div>`;
    }

    // UI Helper methods
    showLoading() {
        document.getElementById('results').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2">Searching...</p>
            </div>
        `;
    }

    showAlert(message, type = 'info') {
        document.getElementById('results').innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;
    }

    updateSearchOptions() {
        const optionsDiv = document.getElementById('search-options');
        let html = '';

        switch(this.currentSearchType) {
            case 'google':
                html = this.getGoogleOptions();
                break;
            case 'ftp':
                html = this.getFTPOptions();
                break;
            case 'github':
                html = this.getGitHubOptions();
                break;
            case 'shodan':
                html = this.getShodanOptions();
                break;
            default:
                html = '';
        }

        optionsDiv.innerHTML = html;
    }

    getGoogleOptions() {
        return `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">File Types</label>
                    <select class="form-select" id="file-type">
                        <option value="pdf">PDF</option>
                        <option value="doc,docx">Word</option>
                        <option value="xls,xlsx">Excel</option>
                        <option value="ppt,pptx">PowerPoint</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Domain (optional)</label>
                    <input type="text" id="domain" class="form-control" placeholder="example.com">
                </div>
            </div>
        `;
    }

    // Other options methods would follow similar patterns
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DeepSearch();
});