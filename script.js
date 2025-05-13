const apiKey = 'DuZYEMbd7wZS8PNyfFYHznuwFd8RDfuXRr5svYrF';
let allFoods = [];
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
    currentPage = 1;
    performSearch();
}

// Call the API (Fetch Food Data)
async function fetchFoodData(query, page = 1, size = pageSize) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=${size}&pageNumber=${page}&api_key=${apiKey}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return { foods: [], totalHits: 0 };
    }
}

// Fetch all Food Data
async function fetchAllFoodData(query) {
    const maxItems = 200;
    const perPage = 50;
    const all = [];

    const firstPage = await fetchFoodData(query, 1, perPage);
    if (!firstPage.foods) {
        return [];
    }
    all.push(...firstPage.foods);
    const totalHits = Math.min(firstPage.totalHits || 0, maxItems);
    const totalPages = Math.ceil(totalHits / perPage);
    for (let i = 2; i <= totalPages; i++) {
        const pageData = await fetchFoodData(query, i, perPage);
        if (pageData && pageData.foods) {
            all.push(...pageData.foods);
        }
    }
    return all.slice(0, maxItems);
}

// Perform Search
async function performSearch() {
    const resultList = document.getElementById('results-list');
    resultList.innerHTML = '';
    search = document.getElementById('search').value.trim() || 'food';
    try {
        const data = await fetchAllFoodData(search);
        allFoods = randomizeArray(data || []);
        currentPage = 1;
        displayCurrentPageResults();
    } catch (error) {
        console.error('Error fetching data:', error);
        resultList.innerHTML = '<p>Error fetching data. Please try again.</p>';
    }
}

// Randomize array function
function randomizeArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Display current page results
function displayCurrentPageResults() {
    const resultList = document.getElementById('results-list');
    const filteredFoods = filterFoods(allFoods);
    const start = (currentPage - 1) * pageSize;
    const pageFoods = filteredFoods.slice(start, start + pageSize);
    resultList.innerHTML = '';
    if (pageFoods.length === 0) {
        resultList.innerHTML = '<p>No results found.</p>';
        return;
    }
    pageFoods.forEach(food => {
        const item = document.createElement('li');
        item.textContent = food.description;
        resultList.appendChild(item);
    });
    renderPagination(filteredFoods.length);
}

// Render pagination
function renderPagination(totalHits) {
    let pagination = document.querySelector('.pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.innerHTML = `
            <button id="prev-btn">Previous</button>
            <span id="page-info"></span>
            <button id="next-btn">Next</button>
    `   ;
        document.querySelector('.results-container').appendChild(pagination);

        document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayCurrentPageResults();
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            currentPage++;
            displayCurrentPageResults();
        });
    }
    const totalPages = Math.ceil(totalHits / pageSize);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage >= totalPages;
}

// Filter foods based on allergies and dietary restrictions
function filterFoods(foods) {
    return foods.filter(food => {
        const description = food.description.toLowerCase();
       
       // Exclude drinks
        const drinkKeywords = [
            'drink', 'beverage', 'juice', 'soda', 'cola', 'pop', 'smoothie', 'milkshake',
            'tea', 'coffee', 'latte', 'mocha', 'espresso',
            'alcohol', 'cocktail', 'beer', 'wine', 'whiskey', 'vodka', 'rum', 'gin', 'tequila',
            'liquor', 'liqueur', 'kombucha', 'cider', 'energy drink', 'sports drink',
            'matcha', 'chai', 'martini', 'lager', 'ipa'
        ];       
        if (drinkKeywords.some(keyword => description.includes(keyword))) {
            return false;
        }

        // Check for Allergies
        for (let allergen of allergies) {
            if (description.includes(allergen)) {
                return false;
            }
        }

        // Check for Dietary Restrictions
        for (let restriction of dietaryRestrictions) {
            if (restriction === 'vegan') {
                const nonVegan = [
                    'meat', 'chicken', 'hamburger', 'cheeseburger' , 'sausage' , 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp',
                    'egg', 'eggs', 'cheese', 'milk', 'butter', 'yogurt', 'cream', 'honey', 'gelatin', 'casein', 'whey'
                ];
                if (nonVegan.some(keyword => description.includes(keyword))) {
                    return false;
                }
            }
            
            if (restriction === 'vegetarian') {
                const nonVegetarian = [
                    'meat', 'chicken', 'beef', 'hamburger', 'cheeseburger' , 'sausage', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'gelatin'
                ];
                if (nonVegetarian.some(keyword => description.includes(keyword))) {
                    return false;
                }
            }

            if (restriction === 'gluten-free') {
                const glutenSources = [
                    'wheat', 'barley', 'rye', 'oats', 'malt', 'gluten', 'bread', 'cracker', 'couscous', 'farro', 'bulgur', 'semolina', 'pasta', 'spelt', 'bran', 'cake', 'biscuit', 'breaded'
                ];
                if (glutenSources.some(keyword => description.includes(keyword))) {
                    return false;
                }
            }

            if (restriction === 'dairy-free') {
                const dairySources = [
                    'milk', 'cheese', , 'cheeseburger', 'yogurt', 'cream', 'butter', 'casein', 'whey', 'lactose'
                ];
                if (dairySources.some(keyword => description.includes(keyword))) {
                    return false;
                }
            }
        }
        const nutrients = food.foodNutrients || [];
        const getNutrient = (name) => {
            const mapping = {
                protein: 'protein',
                sugar: 'total sugars',
                sodium: 'sodium, na',
                energy: 'energy',
            };
            const matchName = mapping[name.toLowerCase()] || name.toLowerCase();
            const nutrient = nutrients.find(n => n.name.toLowerCase() === matchName);
            return nutrient && typeof nutrient.value === 'number' ? nutrient.value : null;
        };
        for (let preference of preferences) {
            if (preference === 'high-protein') {
                const protein = getNutrient('protein');
                if (protein !== null && protein < 5) {
                    return false;
                }
            }
            if (preference === 'low-sugar') {
                const sugar = getNutrient('sugar');
                if (sugar !== null && sugar > 5) {
                    return false
                }
            }
            if (preference === 'low-sodium') {
                const sodium = getNutrient('sodium');
                if (sodium !== null && sodium > 140) {
                    return false;
                }
            }
            if (preference === 'low-calorie') {
                const energy = getNutrient('energy');
                if (energy !== null && energy > 200) {
                    return false;
                }
            }
            if (preference === 'low-histamine') {
                const histamineTriggers = ['cheese', 'vinegar', 'fermented', 'sauerkraut', 'soy sauce', 'wine', 'beer', 'yeast', 'smoked', 'salami', 'pepperoni', 'canned', 'preserved', 'pickled', 'anchovy', 'miso'];
                if (histamineTriggers.some(trigger => description.includes(trigger))) {
                    return false;
                }
            }
        }
        return true;
    });
}