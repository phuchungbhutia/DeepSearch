class SearchController {
    constructor() {
        this.currentSearchType = 'google-drive';
        this.history = JSON.parse(localStorage.getItem('searchHistory')) || [];
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
        if (!query) return;

        document.getElementById('loading').classList.remove('d-none');
        document.getElementById('results-list').innerHTML = '';

        let searchUrl = '';
        if (this.currentSearchType === 'google-drive') {
            searchUrl = `https://www.google.com/search?q=site:drive.google.com ${fileType ? `filetype:${fileType}` : ''} ${encodeURIComponent(query)}`;
        }

        try {
            // Placeholder for actual API call
            const results = await this.mockApiCall(searchUrl);
            this.displayResults(results);
            this.saveSearch(query, this.currentSearchType);
        } catch (error) {
            document.getElementById('results-list').innerHTML = '<p class="text-danger">Error fetching results. Please try again.</p>';
        } finally {
            document.getElementById('loading').classList.add('d-none');
        }
    }

    async mockApiCall(url) {
        // Mock API response for Google Drive search
        return [
            { title: 'Sample PDF', link: url, snippet: 'This is a sample PDF found on Google Drive.' },
            { title: 'Sample Document', link: url, snippet: 'Another sample document.' }
        ];
    }

    displayResults(results) {
        const resultsList = document.getElementById('results-list');
        if (results.length === 0) {
            resultsList.innerHTML = '<p>No results found.</p>';
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