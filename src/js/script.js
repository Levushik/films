// Global variables
let allFilms = [];
let filteredFilms = [];
let currentPage = 1;
const filmsPerPage = 12;

// DOM elements
const filmsContainer = document.getElementById('films-container');
const filmTemplate = document.getElementById('film-template');
const loadingElement = document.getElementById('loading');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const filterYear = document.getElementById('filter-year');
const filterCountry = document.getElementById('filter-country');
const sortBy = document.getElementById('sort-by');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadFilmData();
        setupEventListeners();
        populateFilterOptions();
        applyFiltersAndDisplay();
    } catch (error) {
        console.error('Error initializing application:', error);
        showLoadingError();
    }
});

// Load film data from JSON file
async function loadFilmData() {
    try {
        const response = await fetch('../../data/films.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        allFilms = await response.json();
        console.log(`Loaded ${allFilms.length} films`);
        return allFilms;
    } catch (error) {
        console.error('Error loading film data:', error);
        throw error;
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Set up event listeners for interactive elements
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        applyFiltersAndDisplay();
    });
    
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            currentPage = 1;
            applyFiltersAndDisplay();
        }
    });
    
    // Filter and sort functionality
    filterYear.addEventListener('change', () => {
        currentPage = 1;
        applyFiltersAndDisplay();
    });
    
    filterCountry.addEventListener('change', () => {
        currentPage = 1;
        applyFiltersAndDisplay();
    });
    
    sortBy.addEventListener('change', () => {
        currentPage = 1;
        applyFiltersAndDisplay();
    });
    
    // Pagination functionality
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayFilms();
            updatePaginationControls();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const maxPages = Math.ceil(filteredFilms.length / filmsPerPage);
        if (currentPage < maxPages) {
            currentPage++;
            displayFilms();
            updatePaginationControls();
        }
    });
}

// Populate filter dropdowns with available options
function populateFilterOptions() {
    // Populate years filter
    const years = new Set();
    allFilms.forEach(film => {
        if (film.release_year) {
            years.add(film.release_year);
        }
    });
    
    const sortedYears = [...years].sort((a, b) => b - a); // Sort descending
    
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    });
    
    // Populate countries filter
    const countries = new Set();
    allFilms.forEach(film => {
        if (film.country && film.country.trim() !== '') {
            // Handle multiple countries separated by commas
            const countryList = film.country.split(',');
            countryList.forEach(country => {
                countries.add(country.trim());
            });
        }
    });
    
    const sortedCountries = [...countries].sort();
    
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        filterCountry.appendChild(option);
    });
}

// Apply filters and sorting, then display results
function applyFiltersAndDisplay() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const yearFilter = filterYear.value;
    const countryFilter = filterCountry.value;
    const sortOption = sortBy.value;
    
    // Apply filters
    filteredFilms = allFilms.filter(film => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            (film.title && film.title.toLowerCase().includes(searchTerm)) ||
            (film.director && film.director.toLowerCase().includes(searchTerm));
            
        // Year filter
        const matchesYear = !yearFilter || film.release_year === parseInt(yearFilter);
        
        // Country filter
        const matchesCountry = !countryFilter || 
            (film.country && film.country.toLowerCase().includes(countryFilter.toLowerCase()));
            
        return matchesSearch && matchesYear && matchesCountry;
    });
    
    // Apply sorting
    sortFilms(sortOption);
    
    // Reset to first page and display
    currentPage = 1;
    displayFilms();
    updatePaginationControls();
}

// Sort films based on selected option
function sortFilms(sortOption) {
    switch (sortOption) {
        case 'box_office_desc':
            filteredFilms.sort((a, b) => (b.box_office || 0) - (a.box_office || 0));
            break;
        case 'box_office_asc':
            filteredFilms.sort((a, b) => (a.box_office || 0) - (b.box_office || 0));
            break;
        case 'year_desc':
            filteredFilms.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
            break;
        case 'year_asc':
            filteredFilms.sort((a, b) => (a.release_year || 0) - (b.release_year || 0));
            break;
        case 'title_asc':
            filteredFilms.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title_desc':
            filteredFilms.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            filteredFilms.sort((a, b) => (b.box_office || 0) - (a.box_office || 0));
    }
}

// Display the current page of films
function displayFilms() {
    // Clear existing content
    filmsContainer.innerHTML = '';
    
    // Calculate page range
    const startIndex = (currentPage - 1) * filmsPerPage;
    const endIndex = startIndex + filmsPerPage;
    const filmsToDisplay = filteredFilms.slice(startIndex, endIndex);
    
    if (filmsToDisplay.length === 0) {
        showNoResults();
        return;
    }
    
    // Create and append film cards
    filmsToDisplay.forEach(film => {
        const filmCard = createFilmCard(film);
        filmsContainer.appendChild(filmCard);
    });
}

// Create a film card using the template
function createFilmCard(film) {
    const filmCard = filmTemplate.content.cloneNode(true);
    
    // Set film title
    filmCard.querySelector('.film-title').textContent = film.title;
    
    // Set release year
    const yearElement = filmCard.querySelector('.film-year span');
    yearElement.textContent = film.release_year || 'Unknown';
    
    // Set director
    const directorElement = filmCard.querySelector('.film-director span');
    directorElement.textContent = film.director || 'Unknown';
    
    // Set box office
    const boxOfficeElement = filmCard.querySelector('.film-box-office span');
    if (film.box_office) {
        // Format as currency
        const formattedBoxOffice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(film.box_office);
        boxOfficeElement.textContent = formattedBoxOffice;
    } else {
        boxOfficeElement.textContent = 'Unknown';
    }
    
    // Set country
    const countryElement = filmCard.querySelector('.film-country span');
    countryElement.textContent = film.country || 'Unknown';
    
    return filmCard;
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredFilms.length / filmsPerPage);
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
}

// Show message when no results are found
function showNoResults() {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
        <i class="fas fa-search fa-3x"></i>
        <h3>No films found</h3>
        <p>Try adjusting your search or filters</p>
    `;
    filmsContainer.appendChild(noResults);
}

// Show error message if data loading fails
function showLoadingError() {
    loadingElement.innerHTML = `
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Error loading data</h3>
        <p>Please try refreshing the page</p>
    `;
    loadingElement.style.display = 'flex';
}
