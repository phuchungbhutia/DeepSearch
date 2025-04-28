document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsList = document.getElementById('resultsList');
    const noResultsMessage = document.getElementById('noResults');
    const searchTypeLinks = document.querySelectorAll('aside .nav-link');
    const optionsPanels = {
        'google-drive': document.getElementById('google-drive-options'),
        'ftp': document.getElementById('ftp-options'),
        'github': document.getElementById('github-options'),
        'shodan': document.getElementById('shodan-options')
    };
    let currentSearchType = 'google-drive';

    // Function to update visibility of options panels
    function updateOptionsVisibility(searchType) {
        for (const key in optionsPanels) {
            optionsPanels[key].style.display = key === searchType ? 'block' : 'none';
        }
    }

    // Event listener for sidebar navigation
    searchTypeLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            searchTypeLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentSearchType = link.dataset.searchType;
            updateOptionsVisibility(currentSearchType);
            searchInput.placeholder = `Enter your ${currentSearchType.replace('-', ' ')} search query...`;
        });
    });

    // Basic Google Drive search function (for demonstration - needs actual API integration)
    async function performGoogleDriveSearch(query, fileType, safeSearch) {
        // In a real application, you would use the Google Custom Search JSON API here.
        // This is a placeholder to simulate results.
        const fakeResults = [
            { title: `Sample PDF on Google Drive for "${query}"`, link: 'https://example.com/drive/sample.pdf', source: 'Google Drive' },
            { title: `Another Document related to "${query}"`, link: 'https://example.com/drive/document.docx', source: 'Google Drive' }
        ].filter(result => fileType === '' || result.link.endsWith(fileType));

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(fakeResults);
            }, 500); // Simulate network delay
        });
    }

    // Handle search button click
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter a search query.');
            return;
        }

        resultsList.innerHTML = ''; // Clear previous results
        noResultsMessage.style.display = 'none';

        switch (currentSearchType) {
            case 'google-drive':
                const fileTypeFilter = document.getElementById('fileTypeFilter').value;
                const safeSearchToggle = document.getElementById('safeSearchToggle').checked;
                const googleDriveResults = await performGoogleDriveSearch(query, fileTypeFilter, safeSearchToggle);
                displayResults(googleDriveResults);
                break;
            case 'ftp':
                alert('FTP search functionality will be implemented.');
                break;
            case 'github':
                alert('GitHub secrets search functionality will be implemented.');
                break;
            case 'shodan':
                alert('Shodan search functionality will be implemented.');
                break;
            default:
                alert('Invalid search type.');
        }
    });

    // Function to display search results
    function displayResults(results) {
        if (results && results.length > 0) {
            results.forEach(result => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="mb-2">
                        <strong><a href="${result.link}" target="_blank" rel="noopener noreferrer">${result.title}</a></strong>
                        <p class="text-muted small">Source: ${result.source}</p>
                    </div>
                `;
                resultsList.appendChild(listItem);
            });
        } else {
            noResultsMessage.style.display = 'block';
        }
    }

    // Basic dark/light mode toggle (can be expanded in settings)
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function toggleDarkMode(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
    }
    toggleDarkMode(darkModeMediaQuery.matches);
    darkModeMediaQuery.addEventListener('change', (event) => toggleDarkMode(event.matches));

    // Placeholder for recent searches (will use local storage later)
    const recentSearchesPanel = document.getElementById('recentSearches');
    const recentSearchesList = document.getElementById('recentSearchesList');
    const clearHistoryButton = document.getElementById('clearHistoryButton');

    // Initially hide recent searches
    recentSearchesPanel.style.display = 'none';

    // Placeholder for settings save
    const saveSettingsButton = document.getElementById('saveSettings');
    const resultsPerPageSelect = document.getElementById('resultsPerPage');

    saveSettingsButton.addEventListener('click', () => {
        const resultsPerPage = resultsPerPageSelect.value;
        console.log('Results per page saved:', resultsPerPage);
        // In a real application, you would save this to local storage or handle it differently.
        bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    });

    // Placeholder for clear history
    clearHistoryButton.addEventListener('click', () => {
        recentSearchesList.innerHTML = ''; // Clear displayed history
        console.log('Search history cleared.');
        // In a real application, you would clear local storage here.
        recentSearchesPanel.style.display = 'none'; // Hide if empty
    });
});