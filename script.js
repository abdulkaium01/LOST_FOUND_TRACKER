        // Sample data for demonstration
        const sampleListings = [
            {
                id: 1,
                type: 'lost',
                name: 'Black iPhone 12',
                category: 'electronics',
                description: 'Lost my iPhone 12 with a black case. Has a crack on the top right corner of the screen.',
                location: 'Central Library, Study Area',
                date: '2023-10-15',
                contact: 'john.doe@example.com'
            },
            {
                id: 2,
                type: 'found',
                name: 'Blue Water Bottle',
                category: 'accessories',
                description: 'Found a blue Hydro Flask water bottle near the basketball court.',
                location: 'Sports Complex',
                date: '2023-10-16',
                contact: 'jane.smith@example.com'
            },
            {
                id: 3,
                type: 'lost',
                name: 'Silver Bracelet',
                category: 'jewelry',
                description: 'Lost a silver bracelet with heart charms. Has sentimental value.',
                location: 'Cafeteria',
                date: '2023-10-14',
                contact: '555-1234'
            },
            {
                id: 4,
                type: 'found',
                name: 'Calculus Textbook',
                category: 'documents',
                description: 'Found a calculus textbook with notes in the margin on a bench in the quad.',
                location: 'Main Quadrangle',
                date: '2023-10-17',
                contact: 'bookfinder@example.com'
            }
        ];

        // User data
        const users = [
            { email: 'user@example.com', password: 'password123', name: 'John Doe', type: 'user' },
            { email: 'admin@example.com', password: 'admin123', name: 'Admin User', type: 'admin' }
        ];

        // Store listings in localStorage if not present, otherwise load from localStorage
        let listings = JSON.parse(localStorage.getItem('findit-listings')) || sampleListings;
        let currentUser = null;
        
        // DOM Elements
        const loginScreen = document.getElementById('login-screen');
        const appContainer = document.getElementById('app-container');
        const adminPanel = document.getElementById('admin-panel');
        const userInterface = document.getElementById('user-interface');
        const reportLostBtn = document.getElementById('report-lost-btn');
        const reportFoundBtn = document.getElementById('report-found-btn');
        const browseBtn = document.getElementById('browse-btn');
        const searchBtn = document.getElementById('search-btn');
        const lostModal = document.getElementById('lost-modal');
        const foundModal = document.getElementById('found-modal');
        const closeButtons = document.querySelectorAll('.close');
        const lostForm = document.getElementById('lost-form');
        const foundForm = document.getElementById('found-form');
        const listingsContainer = document.getElementById('listings-container');
        const noListings = document.getElementById('no-listings');
        const searchContainer = document.getElementById('search-container');
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const filterOptions = document.getElementById('filter-options');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const loginForm = document.getElementById('login-form');
        const userTypeButtons = document.querySelectorAll('.user-type-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const switchToUserBtn = document.getElementById('switch-to-user');
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.getElementById('user-avatar');
        const registerToggle = document.getElementById('register-toggle');

        // Current filter state
        let currentFilter = 'all';
        let currentSearchTerm = '';
        let isRegistering = false;

        // Event Listeners
        reportLostBtn.addEventListener('click', () => lostModal.style.display = 'block');
        reportFoundBtn.addEventListener('click', () => foundModal.style.display = 'block');
        
        browseBtn.addEventListener('click', () => {
            currentSearchTerm = '';
            searchInput.value = '';
            currentFilter = 'all';
            updateFilterButtons();
            displayListings();
            searchContainer.style.display = 'block';
            filterOptions.style.display = 'flex';
        });
        
        searchBtn.addEventListener('click', () => {
            searchContainer.style.display = 'block';
            filterOptions.style.display = 'flex';
            searchInput.focus();
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                lostModal.style.display = 'none';
                foundModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === lostModal) lostModal.style.display = 'none';
            if (event.target === foundModal) foundModal.style.display = 'none';
        });

        // Login/Logout functionality
        userTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                userTypeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const userType = document.querySelector('.user-type-btn.active').dataset.type;
            
            if (isRegistering) {
                // Register new user
                const existingUser = users.find(user => user.email === email);
                if (existingUser) {
                    alert('User with this email already exists');
                    return;
                }
                
                users.push({
                    email,
                    password,
                    name: email.split('@')[0],
                    type: userType
                });
                
                alert('Registration successful! Please login.');
                isRegistering = false;
                loginForm.querySelector('button').textContent = 'Login';
                registerToggle.textContent = 'Register here';
                loginForm.reset();
                return;
            }
            
            // Login existing user
            const user = users.find(user => user.email === email && user.password === password && user.type === userType);
            
            if (user) {
                currentUser = user;
                userNameElement.textContent = user.name;
                userAvatarElement.textContent = user.name.charAt(0).toUpperCase();
                
                // Show admin panel if admin user
                if (user.type === 'admin') {
                    adminPanel.style.display = 'block';
                    userInterface.style.display = 'none';
                } else {
                    adminPanel.style.display = 'none';
                    userInterface.style.display = 'block';
                }
                
                loginScreen.style.display = 'none';
                appContainer.style.display = 'block';
            } else {
                alert('Invalid credentials or user type');
            }
        });

        registerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            isRegistering = !isRegistering;
            loginForm.querySelector('button').textContent = isRegistering ? 'Register' : 'Login';
            registerToggle.textContent = isRegistering ? 'Back to login' : 'Register here';
        });

        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            appContainer.style.display = 'none';
            loginScreen.style.display = 'block';
            loginForm.reset();
        });

        switchToUserBtn.addEventListener('click', () => {
            adminPanel.style.display = 'none';
            userInterface.style.display = 'block';
        });

        // Form Submissions
        lostForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newLostItem = {
                id: Date.now(),
                type: 'lost',
                name: document.getElementById('lost-item-name').value,
                category: document.getElementById('lost-category').value,
                description: document.getElementById('lost-description').value,
                location: document.getElementById('lost-location').value,
                date: document.getElementById('lost-date').value,
                contact: document.getElementById('lost-contact').value
            };
            
            listings.push(newLostItem);
            saveListings();
            lostForm.reset();
            lostModal.style.display = 'none';
            
            displayListings();
            showSuccessMessage('Your lost item has been reported successfully!');
        });

        foundForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newFoundItem = {
                id: Date.now(),
                type: 'found',
                name: document.getElementById('found-item-name').value,
                category: document.getElementById('found-category').value,
                description: document.getElementById('found-description').value,
                location: document.getElementById('found-location').value,
                date: document.getElementById('found-date').value,
                contact: document.getElementById('found-contact').value
            };
            
            listings.push(newFoundItem);
            saveListings();
            foundForm.reset();
            foundModal.style.display = 'none';
            
            displayListings();
            showSuccessMessage('Your found item has been reported successfully!');
        });

        // Search functionality
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentSearchTerm = searchInput.value.toLowerCase().trim();
            displayListings();
        });

        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentFilter = button.getAttribute('data-filter');
                updateFilterButtons();
                displayListings();
            });
        });

        // Functions
        function saveListings() {
            localStorage.setItem('findit-listings', JSON.stringify(listings));
        }

        function displayListings() {
            // Filter listings based on search term and current filter
            let filteredListings = listings.filter(listing => {
                const matchesSearch = currentSearchTerm === '' || 
                    listing.name.toLowerCase().includes(currentSearchTerm) ||
                    listing.description.toLowerCase().includes(currentSearchTerm) ||
                    listing.location.toLowerCase().includes(currentSearchTerm);
                
                const matchesFilter = currentFilter === 'all' || listing.type === currentFilter;
                
                return matchesSearch && matchesFilter;
            });
            
            // Clear the container
            listingsContainer.innerHTML = '';
            
            // Show message if no listings
            if (filteredListings.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-listings';
                noResults.innerHTML = `
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; color: #ccc;"></i>
                    <h3>No matching items found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                `;
                listingsContainer.appendChild(noResults);
                return;
            }
            
            // Display filtered listings
            filteredListings.forEach(listing => {
                const listingCard = document.createElement('div');
                listingCard.className = 'listing-card';
                
                const icon = listing.type === 'lost' ? 'fa-exclamation-circle' : 'fa-check-circle';
                const statusClass = listing.type === 'lost' ? 'status-lost' : 'status-found';
                
                listingCard.innerHTML = `
                    <div class="listing-image">
                        <i class="fas ${getCategoryIcon(listing.category)}"></i>
                    </div>
                    <div class="listing-details">
                        <h3 class="listing-title">${listing.name}</h3>
                        <p class="listing-description">${listing.description}</p>
                        <div class="listing-meta">
                            <span><i class="fas ${icon} ${statusClass}"></i> ${listing.type.toUpperCase()}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${listing.location}</span>
                        </div>
                        <div class="listing-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(listing.date)}</span>
                            <span><i class="fas fa-user"></i> ${listing.contact}</span>
                        </div>
                    </div>
                `;
                
                listingsContainer.appendChild(listingCard);
            });
        }

        function getCategoryIcon(category) {
            const icons = {
                'electronics': 'fa-mobile-alt',
                'clothing': 'fa-tshirt',
                'accessories': 'fa-key',
                'documents': 'fa-file-alt',
                'jewelry': 'fa-gem',
                'other': 'fa-question-circle'
            };
            return icons[category] || 'fa-question-circle';
        }

        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }

        function updateFilterButtons() {
            filterButtons.forEach(button => {
                if (button.getAttribute('data-filter') === currentFilter) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }

        function showSuccessMessage(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            
            listingsContainer.parentNode.insertBefore(successDiv, listingsContainer);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
