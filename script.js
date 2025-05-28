let allFoods = [];
let allergies = [];
let dietaryRestrictions = [];
let preferences = [];
let search = '';
let currentPage = 1;
const pageSize = 20;
const foods = window.foods;

document.addEventListener('DOMContentLoaded', () => {
    // Dropdown toggle
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
              if (dropdown !== btn.nextElementSibling) {
                dropdown.classList.remove('show');
              }
            });
            btn.nextElementSibling.classList.toggle('show');
            document.getElementById('food-popup').classList.add('hidden');
        });
    });
    
    // Close dropdowns when clicking outside
    window.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    });

    // Close popup when clicking outside
    window.addEventListener('click', (e) => {
        const popup = document.getElementById('food-popup');
        const popupContent = document.querySelector('.popup-content');
        if (!popup || !popupContent || popup.classList.contains('hidden')) {
          return;
        }
        if (!popupContent.contains(e.target)) {
          popup.classList.add('hidden');
        }
    });

    // Prevent popup from closing when clicking inside
    document.querySelector('.popup-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Prevent dropdown from closing when clicking inside it
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.addEventListener('click', e => {
        e.stopPropagation();
      });
    });

    // Event listeners for checkboxes
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
            document.getElementById('search').value = '';
            search = '';
            performSearch();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    });

    // Add event listener for header click to scroll to top
    document.getElementById('header').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('food-popup').classList.add('hidden');
      document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.classList.remove('show');
      });
      window.scrollTo({top: 0, behavior: 'smooth'});
    });

    // Add event listener for search button
    document.getElementById('search-btn').addEventListener('click', () => {
        currentPage = 1;
        search = document.getElementById('search').value.trim();
        performSearch();
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
    
    // Add event listener for exit button for popup
    document.querySelector('.close-popup').addEventListener('click', () => {
      document.getElementById('food-popup').classList.add('hidden');
    });

    window.scrollTo({top: 0, behavior: 'smooth'});

    setFoods(foods);
});

// updateFilter function to manage the selected filters
function updateFilter(filterArray, value, isChecked) {
    if (isChecked && !filterArray.includes(value)) {
        filterArray.push(value);
    } else if (!isChecked) {
        const index = filterArray.indexOf(value);
        if (index !== -1) {
            filterArray.splice(index, 1);
        }
    }
}

function performSearch() {
    let results = allFoods.filter(item => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        for (let allergy of allergies) {
            if (allergy === 'milk' && item.milk) {
                return false;
            }
            if (allergy === 'egg' && item.egg) {
                return false;
            }
            if (allergy === 'fish' && item.fish) {
                return false;
            }
            if (allergy === 'shellfish' && item.shellfish) {
                return false;
            }
            if (allergy === 'treeNuts' && item.treeNuts) {
                return false;
            }
            if (allergy === 'peanuts' && item.peanuts) {
                return false;
            }
            if (allergy === 'wheat' && item.wheat) {
                return false;
            }
            if (allergy === 'soy' && item.soy) {
                return false;
            }
        }
        for (let restriction of dietaryRestrictions) {
            if (!item[restriction]) {
                return false;
            }
        }
        for (let preference of preferences) {
            if (preference === 'highProtein' && item.protein / item.servingGrams < 0.1) {
                return false;
            }
            if (preference === 'lowSugar' && item.sugars / item.servingGrams > 0.05) {
                return false;
            }
            if (preference === 'lowSodium' && item.sodium / item.servingGrams > 1.2) {
                return false;
            }
            if (preference === 'lowCalorie' && item.calories / item.servingGrams > 1.5) {
                return false;
            }
            if (preference === 'lowHistamine' && !item.lowHistamine) {
                return false;
            }
          }
        return true;
    });
    renderPage(results);
}

function renderPage(results) {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResults = results.slice(start, end);
    const foodList = document.getElementById('results-list');
    foodList.innerHTML = '';

    if (paginatedResults.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No results found.';
        foodList.appendChild(noResults);
        return;
    }

    paginatedResults.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.innerHTML = `
            <div class="food-card">
                <img src="${food.image}" alt="${food.name}" class="food-image">
                <div class="food-name">${food.name}</div>
            </div>
        `;
        foodList.appendChild(foodItem);
        foodItem.addEventListener('click', (e) => {
            e.stopPropagation();
            openFoodPopup(food);
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
              dropdown.classList.remove('show');
            });
        });
    });

    // Pagination
    const totalPages = Math.ceil(results.length / pageSize);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.className = 'page-btn prev-btn';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(results);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    });
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'page-btn';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderPage(results);
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.className = 'page-btn next-btn';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(results);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    });
    pagination.appendChild(nextBtn);
}

function setFoods(foodData) {
    allFoods = foodData;
    performSearch();
}

function openFoodPopup(food) {
    document.getElementById('popup-title').textContent = food.name;
    document.getElementById('popup-image').src = food.image;
    document.getElementById('popup-image').alt = food.name;
    document.getElementById('popup-serving-size').innerHTML = `
      <span class="label"><strong>Serving Size:</strong></span>
      <span class="value">${food.servingSize} (${food.servingGrams} g)</span>
    `;

    const nutrition = `
        <li><strong>Calories:</strong> ${food.calories} kcal</li>
        <li><strong>Protein:</strong> ${food.protein} g</li>
        <li><strong>Total Fat:</strong> ${food.fat} g</li>
        <li><strong>Carbohydrates:</strong> ${food.carbohydrate} g</li>
        <li><strong>Total Sugars:</strong> ${food.sugars} g</li>
        <li><strong>Sodium:</strong> ${food.sodium} mg</li>
        <li><strong>Category:</strong> ${food.category}</li>
    `;
    document.getElementById('popup-nutrition').innerHTML = nutrition;

    // Tags
    document.getElementById('allergen-tags').innerHTML = '';
    document.getElementById('diet-tags').innerHTML = '';
    document.getElementById('preference-tags').innerHTML = '';

    // Function to add tags
    function addTag(containerId, text, isGood) {
      const tag = document.createElement('div');
      tag.className = `tag ${isGood ? 'green' : 'red'}`;
      tag.textContent = text;
      document.getElementById(containerId).appendChild(tag);
    }

    // Allergies
    addTag('allergen-tags', food.milk ? 'Contains Milk' : 'Milk Free', !food.milk);
    addTag('allergen-tags', food.egg ? 'Contains Egg' : 'Egg Free', !food.egg);
    addTag('allergen-tags', food.fish ? 'Contains Fish' : 'Fish Free', !food.fish);
    addTag('allergen-tags', food.shellfish ? 'Contains Shellfish' : 'Shellfish Free', !food.shellfish);
    addTag('allergen-tags', food.treeNuts ? 'Contains Tree Nuts' : 'Tree Nut Free', !food.treeNuts);
    addTag('allergen-tags', food.peanuts ? 'Contains Peanuts' : 'Peanut Free', !food.peanuts);
    addTag('allergen-tags', food.wheat ? 'Contains Wheat' : 'Wheat Free', !food.wheat);
    addTag('allergen-tags', food.soy ? 'Contains Soy' : 'Soy Free', !food.soy);

    // Restrictions
    addTag('diet-tags', food.vegan ? 'Vegan' : 'Not Vegan', food.vegan);
    addTag('diet-tags', food.vegetarian ? 'Vegetarian' : 'Not Vegetarian', food.vegetarian);
    addTag('diet-tags', food.kosher ? 'Kosher' : 'Not Kosher', food.kosher);
    addTag('diet-tags', food.glutenFree ? 'Gluten-Free' : 'Contains Gluten', food.glutenFree);
    addTag('diet-tags', food.dairyFree ? 'Dairy-Free' : 'Contains Dairy', food.dairyFree);

    // Preferences (with thresholds)
    const proteinPerGram = food.protein / food.servingGrams;
    const sugarPerGram = food.sugars / food.servingGrams;
    const sodiumPerGram = food.sodium / food.servingGrams;
    const caloriesPerGram = food.calories / food.servingGrams;

    addTag('preference-tags', proteinPerGram >= 0.1 ? 'High Protein' : 'Not High Protein', proteinPerGram >= 0.1);
    addTag('preference-tags', sugarPerGram <= 0.05 ? 'Low Sugar' : 'Not Low Sugar', sugarPerGram <= 0.05);
    addTag('preference-tags', sodiumPerGram <= 1.2 ? 'Low Sodium' : 'Not Low Sodium', sodiumPerGram <= 1.2);
    addTag('preference-tags', caloriesPerGram <= 1.5 ? 'Low Calorie' : 'Not Low Calorie', caloriesPerGram <= 1.5);
    addTag('preference-tags', food.lowHistamine ? 'Low Histamine' : 'Not Low Histamine', food.lowHistamine);

    // === Show the popup ===
    document.getElementById('food-popup').classList.remove('hidden');
}

// Close popup when X is clicked
document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('food-popup').classList.add('hidden');
});
