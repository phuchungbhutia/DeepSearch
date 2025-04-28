/**
 * DeepSearch - Advanced File Search Tool
 * Handles searching across multiple sources with history tracking
 */
class DeepSearch {
    constructor() {
      // Configuration
      this.config = {
        maxHistoryItems: 10,
        defaultSearchType: 'google',
        demoMode: true // Set to false when using real APIs
      };
  
      // State
      this.currentSearchType = this.config.defaultSearchType;
      this.searchHistory = [];
      this.isSearching = false;
  
      // Initialize
      this.init();
    }
  
    /**
     * Initialize the application
     */
    init() {
      this.loadSearchHistory();
      this.setupEventListeners();
      this.updateSearchOptions();
      this.updateHistoryDisplay();
    }
  
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
      // Search type selection
      document.querySelectorAll('[data-search-type]').forEach(btn => {
        btn.addEventListener('click', () => this.setSearchType(btn.dataset.searchType));
      });
  
      // Search button
      document.getElementById('search-btn').addEventListener('click', () => this.performSearch());
  
      // Clear history button
      document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());
  
      // Keyboard shortcut (Enter to search)
      document.getElementById('keyword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.performSearch();
      });
    }
  
    /**
     * Set the current search type
     * @param {string} type - The search type to set
     */
    setSearchType(type) {
      this.currentSearchType = type;
      
      // Update UI
      document.querySelectorAll('[data-search-type]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.searchType === type);
      });
      
      this.updateSearchOptions();
    }
  
    /**
     * Perform a search based on current parameters
     */
    async performSearch() {
      const keyword = document.getElementById('keyword').value.trim();
      if (!keyword) return this.showAlert('Please enter a search term', 'warning');
      if (this.isSearching) return;
  
      this.isSearching = true;
      this.showLoading();
  
      try {
        const results = await this.executeSearch(keyword);
        this.displayResults(results);
        this.saveToHistory(keyword, this.currentSearchType);
      } catch (error) {
        console.error('Search error:', error);
        this.showAlert(`Search failed: ${error.message}`, 'danger');
      } finally {
        this.isSearching = false;
      }
    }
  
    /**
     * Execute the appropriate search based on current type
     * @param {string} query - The search query
     * @returns {Promise<Object>} Search results
     */
    async executeSearch(query) {
      switch(this.currentSearchType) {
        case 'google': return this.searchGoogle(query);
        case 'ftp': return this.searchFTP(query);
        case 'dir': return this.searchDirectory(query);
        case 'github': return this.searchGitHub(query);
        case 'shodan': return this.searchShodan(query);
        default: throw new Error('Invalid search type');
      }
    }
  
    /**
     * Search Google Drive
     * @param {string} query - Search query
     * @returns {Object} Results object
     */
    searchGoogle(query) {
      const fileType = document.getElementById('file-type')?.value || 'pdf';
      const domain = document.getElementById('domain')?.value || '';
      
      let searchQuery = `site:drive.google.com filetype:${fileType} "${query}"`;
      if (domain) searchQuery += ` site:${domain}`;
      
      return {
        type: 'google',
        query: searchQuery,
        results: this.config.demoMode ? [{
          title: `Google Drive results for "${query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
          description: `Click to view potential Google Drive files matching your query`,
          icon: 'bi-google'
        }] : await this.searchGoogleAPI(searchQuery)
      };
    }
  
    /**
     * Search FTP servers
     * @param {string} query - Search query
     * @returns {Object} Results object
     */
    searchFTP(query) {
      const anonOnly = document.getElementById('anon-ftp')?.checked || false;
      const deepScan = document.getElementById('deep-scan')?.checked || false;
      
      const searchQuery = `intitle:"index of" "${query}" -html -htm -php`;
      
      return {
        type: 'ftp',
        query: searchQuery,
        results: this.config.demoMode ? [{
          title: `FTP Server containing "${query}"`,
          url: `ftp://example.com/pub/${query.replace(/\s+/g, '_')}.zip`,
          description: `Potential FTP server found (demo result)`,
          icon: 'bi-hdd-network'
        }] : await this.searchFTPAPI(query, anonOnly, deepScan)
      };
    }
  
    /**
     * Search web directories
     * @param {string} query - Search query
     * @returns {Object} Results object
     */
    searchDirectory(query) {
      const searchQuery = `intitle:"index of" "parent directory" "${query}"`;
      
      return {
        type: 'directory',
        query: searchQuery,
        results: this.config.demoMode ? [{
          title: `Directory listing for "${query}"`,
          url: `http://example.com/files/${query.replace(/\s+/g, '_')}/`,
          description: `Potential directory listing found (demo result)`,
          icon: 'bi-folder-symlink'
        }] : await this.searchDirectoryAPI(query)
      };
    }
  
    /**
     * Search GitHub for secrets
     * @param {string} query - Search query
     * @returns {Object} Results object
     */
    searchGitHub(query) {
      const extensions = document.getElementById('github-ext')?.value || 'env,json,yml';
      const org = document.getElementById('github-org')?.value || '';
      
      let searchQuery = `"${query}" ext:${extensions.split(',').join(' OR ext:')}`;
      if (org) searchQuery += ` org:${org}`;
      
      return {
        type: 'github',
        query: searchQuery,
        results: this.config.demoMode ? [{
          title: `GitHub results for "${query}"`,
          url: `https://github.com/search?q=${encodeURIComponent(searchQuery)}`,
          description: `Click to view potential GitHub files matching your query`,
          icon: 'bi-github'
        }] : await this.searchGitHubAPI(searchQuery)
      };
    }
  
    /**
     * Search Shodan IoT devices
     * @param {string} query - Search query
     * @returns {Object} Results object
     */
    searchShodan(query) {
      const deviceType = document.getElementById('shodan-device')?.value || 'webcam';
      const country = document.getElementById('shodan-country')?.value || '';
      
      let searchQuery = `${deviceType} "${query}"`;
      if (country) searchQuery += ` country:${country}`;
      
      return {
        type: 'shodan',
        query: searchQuery,
        results: this.config.demoMode ? [{
          title: `Shodan results for ${deviceType} "${query}"`,
          url: `https://www.shodan.io/search?query=${encodeURIComponent(searchQuery)}`,
          description: `Click to view Shodan search results`,
          icon: 'bi-router'
        }] : await this.searchShodanAPI(searchQuery)
      };
    }
  
    /**
     * Display search results
     * @param {Object} data - Results data
     */
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
        <div class="alert alert-primary d-flex align-items-center">
          <i class="bi bi-${data.icon || 'search'} me-2"></i>
          <div>
            <strong>${this.capitalize(data.type)} Search:</strong> 
            ${data.query}
          </div>
        </div>
        <div class="list-group">
      `;
      
      data.results.forEach(result => {
        html += `
          <a href="${result.url}" target="_blank" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">
                <i class="bi bi-${result.icon || 'file-earmark'} me-2"></i>
                ${result.title}
              </h6>
              <small class="text-muted">${new Date().toLocaleTimeString()}</small>
            </div>
            <p class="mb-1">${result.description}</p>
            <small class="text-muted text-truncate d-block">${result.url}</small>
          </a>
        `;
      });
      
      html += `</div>`;
      resultsDiv.innerHTML = html;
    }
  
    /**
     * Update search options UI based on current search type
     */
    updateSearchOptions() {
      const optionsDiv = document.getElementById('search-options');
      if (!optionsDiv) return;
  
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
  
    /**
     * Get HTML for Google search options
     * @returns {string} HTML string
     */
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
              <option value="csv">CSV</option>
              <option value="txt">Text</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Domain (optional)</label>
            <input type="text" id="domain" class="form-control" placeholder="example.com">
          </div>
        </div>
      `;
    }
  
    /**
     * Get HTML for FTP search options
     * @returns {string} HTML string
     */
    getFTPOptions() {
      return `
        <div class="row g-3">
          <div class="col-md-6">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="anon-ftp" checked>
              <label class="form-check-label" for="anon-ftp">Anonymous FTP Only</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="deep-scan">
              <label class="form-check-label" for="deep-scan">Deep Scan (Slower)</label>
            </div>
          </div>
        </div>
      `;
    }
  
    /**
     * Get HTML for GitHub search options
     * @returns {string} HTML string
     */
    getGitHubOptions() {
      return `
        <div class="alert alert-warning mb-3">
          <i class="bi bi-exclamation-triangle"></i> GitHub search requires personal access token
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">File Extensions</label>
            <input type="text" id="github-ext" class="form-control" value="env,json,yml,config">
          </div>
          <div class="col-md-6">
            <label class="form-label">Organization (optional)</label>
            <input type="text" id="github-org" class="form-control" placeholder="google">
          </div>
        </div>
      `;
    }
  
    /**
     * Get HTML for Shodan search options
     * @returns {string} HTML string
     */
    getShodanOptions() {
      return `
        <div class="alert alert-info mb-3">
          <i class="bi bi-info-circle"></i> Requires Shodan API key
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Device Type</label>
            <select class="form-select" id="shodan-device">
              <option value="webcam">Webcams</option>
              <option value="printer">Printers</option>
              <option value="router">Routers</option>
              <option value="database">Databases</option>
              <option value="server">Servers</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Country Code</label>
            <input type="text" id="shodan-country" class="form-control" placeholder="US" maxlength="2">
          </div>
        </div>
      `;
    }
  
    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
      try {
        const history = localStorage.getItem('deepSearchHistory');
        this.searchHistory = history ? JSON.parse(history) : [];
      } catch (error) {
        console.error('Failed to load search history:', error);
        this.searchHistory = [];
        localStorage.setItem('deepSearchHistory', '[]');
      }
    }
  
    /**
     * Save search to history
     * @param {string} query - Search query
     * @param {string} type - Search type
     */
    saveToHistory(query, type) {
      try {
        this.searchHistory.unshift({
          query,
          type,
          timestamp: new Date().toISOString()
        });
        
        // Keep only the most recent items
        if (this.searchHistory.length > this.config.maxHistoryItems) {
          this.searchHistory = this.searchHistory.slice(0, this.config.maxHistoryItems);
        }
        
        localStorage.setItem('deepSearchHistory', JSON.stringify(this.searchHistory));
        this.updateHistoryDisplay();
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    }
  
    /**
     * Clear all search history
     */
    clearHistory() {
      if (confirm('Are you sure you want to clear all search history?')) {
        this.searchHistory = [];
        localStorage.setItem('deepSearchHistory', '[]');
        this.updateHistoryDisplay();
      }
    }
  
    /**
     * Update the history display UI
     */
    updateHistoryDisplay() {
      const historyDiv = document.getElementById('recent-searches');
      if (!historyDiv) return;
  
      if (this.searchHistory.length === 0) {
        historyDiv.innerHTML = `
          <div class="text-center text-muted p-3">
            <i class="bi bi-clock-history"></i>
            <p class="mt-2 mb-0">No recent searches</p>
          </div>
        `;
        return;
      }
  
      historyDiv.innerHTML = this.searchHistory.map(item => `
        <button class="list-group-item list-group-item-action text-start" 
                onclick="deepSearch.repeatSearch('${item.query}', '${item.type}')">
          <div class="d-flex justify-content-between align-items-center">
            <span>
              <span class="badge bg-secondary me-2">${item.type}</span>
              ${this.truncate(item.query, 25)}
            </span>
            <small class="text-muted">${new Date(item.timestamp).toLocaleTimeString()}</small>
          </div>
        </button>
      `).join('');
    }
  
    /**
     * Repeat a previous search
     * @param {string} query - Search query to repeat
     * @param {string} type - Search type to use
     */
    repeatSearch(query, type) {
      document.getElementById('keyword').value = query;
      this.setSearchType(type);
      this.performSearch();
    }
  
    /**
     * Show loading state
     */
    showLoading() {
      document.getElementById('results').innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3">Searching ${this.capitalize(this.currentSearchType)}...</p>
        </div>
      `;
    }
  
    /**
     * Show alert message
     * @param {string} message - Alert message
     * @param {string} type - Alert type (danger, warning, info, success)
     */
    showAlert(message, type = 'info') {
      document.getElementById('results').innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  
    /**
     * Capitalize first letter of string
     * @param {string} str - Input string
     * @returns {string} Capitalized string
     */
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    /**
     * Truncate string with ellipsis
     * @param {string} str - Input string
     * @param {number} n - Max length
     * @returns {string} Truncated string
     */
    truncate(str, n) {
      return str.length > n ? str.substring(0, n) + '...' : str;
    }
  
    /* API Methods (would be implemented for real usage) */
    
    async searchGoogleAPI(query) {
      // Implementation would use Google Custom Search API
      throw new Error('API not implemented in demo mode');
    }
  
    async searchFTPAPI(query, anonOnly, deepScan) {
      // Implementation would use FTP scanning service
      throw new Error('API not implemented in demo mode');
    }
  
    async searchGitHubAPI(query) {
      // Implementation would use GitHub API
      throw new Error('API not implemented in demo mode');
    }
  
    async searchShodanAPI(query) {
      // Implementation would use Shodan API
      throw new Error('API not implemented in demo mode');
    }
  }
  
  // Initialize the application
  const deepSearch = new DeepSearch();
  
  // Make available globally for history item clicks
  window.deepSearch = deepSearch;