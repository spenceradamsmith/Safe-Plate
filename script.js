const apiKey = 'DuZYEMbd7wZS8PNyfFYHznuwFd8RDfuXRr5svYrF';
let allergies = [];
let dietaryRestrictions = [];
let preferences = [];
let search = '';
let currentPage = 1;
const pageSize = 20;

document.addEventListener('DOMContentLoaded', () => {
    // Dropdown toggle
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.nextElementSibling.classList.toggle('show');
        });
    });
    
    // Close dropdowns if clicked outside
    window.addEventListener('click', function (e) {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            if (!content.previousElementSibling.contains(e.target) && !content.contains(e.target)) {
                content.classList.remove('show');
            }
        });
    });

    // Add event listeners for checkboxes
    document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const value = this.value;
            const isChecked = this.checked;
            const label = this.closest('.dropdown').querySelector('.dropdown-btn').textContent;
            if (label.includes('Allergies')) {
                updateFilter(allergies, value, isChecked);
            } else if (label.includes('Dietary Restrictions')) {
                updateFilter(dietaryRestrictions, value, isChecked);
            } else if (label.includes('Preferences')) {
                updateFilter(preferences, value, isChecked);
            }
        });
    });

    // Add event listener for search button
    document.getElementById('search-btn').addEventListener('click', () => {
        currentPage = 1;
        search = document.getElementById('search').value.trim();
        if (search) {
            performSearch();
        }
    });
});

// Update filter function
function updateFilter(filterArray, value, isChecked) {
    if (isChecked) {
        filterArray.push(value);
    } else {
        const index = filterArray.indexOf(value);
        if (index != -1) {
            filterArray.splice(index, 1);
        }
    }
}

// Call the API
async function fetchFoodData(query, page = 1) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${page}&api_key=${apiKey}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return { foods: [], totalHits: 0 };
    }
}

