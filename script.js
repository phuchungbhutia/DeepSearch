class SearchController {
    constructor() {
        this.currentSearchType = 'google-drive';
        this.history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        this.apiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with your Google API key
        this.cx = 'YOUR_SEARCH_ENGINE_ID'; // Replace with your Search Engine ID
        this.proxyUrl = 'http://localhost:3000/api/search'; // Proxy server URL
        this.initEventListeners();
        this.renderHistory();
    }

    initEventListeners() {
        // Search type selection
        document.querySelectorAll('.nav-link[data-search-type]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.nav-link.active').classList.remove('active');
                link.classList.add('active');
                this.currentSearchType = link.dataset.searchType;
                this.updateSearchOptions();
            });
        });

        // Search form submission
        document.getElementById('search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        // Theme toggle
        document.getElementById('toggle-theme').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    updateSearchOptions() {
        const optionsDiv = document.getElementById('search-options');
        optionsDiv.innerHTML = `
            <label for="file-type" class="form-label">File Type</label>
            <select class="form-select" id="file-type">
                <option value="">All</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="xls">XLS</option>
            </select>
        `;
    }

    async performSearch() {
        const query = document.getElementById('search-query').value.trim();
        const fileType = document.getElementById('file-type').value;
        if (!query) {
            document.getElementById('results-list').innerHTML = '<p class="text-warning">Please enter a search query.</p>';
            return;
        }

        document.getElementById('loading').classList.remove('d-none');
        document.getElementById('results-list').innerHTML = '';

        let searchQuery = `site:drive.google.com ${fileType ? `filetype:${fileType}` : ''} ${encodeURIComponent(query)}`;

        try {
            const results = await this.fetchGoogleSearchResults(searchQuery);
            this.displayResults(results);
            this.saveSearch(query, this.currentSearchType);
        } catch (error) {
            document.getElementById('results-list').innerHTML = `<p class="text-danger">Error: ${error.message}. Please try again or check your API setup.</p>`;
        } finally {
            document.getElementById('loading').classList.add('d-none');
        }
    }

    async fetchGoogleSearchResults(query) {
        const url = `${this.proxyUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&cx=${this.cx}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            return [];
        }
        return data.items.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        }));
    }

    displayResults(results) {
        const resultsList = document.getElementById('results-list');
        if (results.length === 0) {
            resultsList.innerHTML = '<p>No results found. Try broadening your search terms or check the search type.</p>';
            return;
        }

        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <h5><a href="${result.link}" target="_blank">${result.title}</a></h5>
                <p>${result.snippet}</p>
                <small>Source: ${this.currentSearchType}</small>
            `;
            resultsList.appendChild(div);
        });
    }

    saveSearch(query, type) {
        this.history.unshift({ query, type, timestamp: new Date().toISOString() });
        this.history = this.history.slice(0, 10); // Keep last 10 searches
        localStorage.setItem('searchHistory', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('recent-searches');
        historyList.innerHTML = '';
        this.history.forEach(search => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a class="nav-link" href="#" data-query="${search.query}" data-type="${search.type}">
                    <i class="bi bi-clock-history"></i> ${search.query}
                </a>`;
            historyList.appendChild(li);
            li.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('search-query').value = search.query;
                document.querySelector('.nav-link.active').classList.remove('active');
                document.querySelector(`[data-search-type="${search.type}"]`).classList.add('active');
                this.currentSearchType = search.type;
                this.updateSearchOptions();
                this.performSearch();
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SearchController();
});