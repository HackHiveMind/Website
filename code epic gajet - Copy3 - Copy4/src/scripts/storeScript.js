        const allProducts = [
            { id: 'mac-1', name: 'MacBook Pro 16"', price: 2499, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Pro', description: 'Apple M2 Pro chip. Supercharged for pros.', category: 'mac' },
            { id: 'mac-2', name: 'MacBook Air 13"', price: 1199, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Air', description: 'Light. Speed. Power.', category: 'mac' },
            { id: 'mac-3', name: 'MacBook Air M1', price: 999, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Air+M1', description: 'The M1 chip changes everything.', category: 'mac' },
            { id: 'mac-4', name: 'iMac 24"', price: 1299, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iMac+24', description: 'Colorful. Powerful. Personal.', category: 'mac' },
            { id: 'ipad-1', name: 'iPad Pro', price: 799, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Pro', description: 'Supercharged by M2 chip.', category: 'ipad' },
            { id: 'ipad-2', name: 'iPad Air', price: 599, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Air', description: 'Light. Bright. Full of might.', category: 'ipad' },
            { id: 'ipad-3', name: 'iPad Air (5th Gen)', price: 599, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Air+M1', description: 'Supercharged by the Apple M1 chip.', category: 'ipad' },
            { id: 'iphone-1', name: 'iPhone 15 Pro Max', price: 1199, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+15+Pro+Max', description: 'Titanium. Strong. Light. Pro.', category: 'iphone' },
            { id: 'iphone-2', name: 'iPhone 15', price: 899, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+15', description: 'Dynamic Island. 48MP Main camera.', category: 'iphone' },
            { id: 'iphone-3', name: 'iPhone 13', price: 799, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+13', description: 'Powerful. Durable. Essential.', category: 'iphone' },
            { id: 'watch-1', name: 'Apple Watch Ultra 2', price: 799, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Ultra+2', description: 'Next-level adventure.', category: 'watch' },
            { id: 'watch-2', name: 'Apple Watch SE', price: 249, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+SE', description: 'A great deal to love.', category: 'watch' },
            { id: 'watch-3', name: 'Apple Watch Series 9', price: 399, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Series+9', description: 'A more powerful way to stay connected.', category: 'watch' },
            { id: 'other-1', name: 'AirPods Pro (2nd Gen)', price: 249, image: 'https://placehold.co/600x400/f5f5f7/1d1d1f?text=AirPods+Pro', description: 'Rebuilt from the sound up.', category: 'other' },
            // 2020 Products
            {
                id: 1,
                name: "iPhone 12 Pro",
                description: "A14 Bionic chip, Pro camera system, 5G capable",
                price: 999,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+12+Pro",
                category: "phones",
                year: 2020
            },
            {
                id: 2,
                name: "MacBook Air M1",
                description: "Apple M1 chip, 13-inch Retina display, 18-hour battery life",
                price: 999,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Air+M1",
                category: "laptops",
                year: 2020
            },
            {
                id: 3,
                name: "iPad Air (4th generation)",
                description: "A14 Bionic chip, 10.9-inch Liquid Retina display, USB-C",
                price: 599,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Air+4",
                category: "tablets",
                year: 2020
            },
            {
                id: 4,
                name: "Apple Watch Series 6",
                description: "Blood oxygen sensor, Always-On Retina display, GPS",
                price: 399,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Series+6",
                category: "watches",
                year: 2020
            },

            // 2021 Products
            {
                id: 5,
                name: "iPhone 13 Pro",
                description: "A15 Bionic chip, ProMotion display, Cinematic mode",
                price: 999,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+13+Pro",
                category: "phones",
                year: 2021
            },
            {
                id: 6,
                name: "MacBook Pro 14\"",
                description: "M1 Pro/Max chip, Liquid Retina XDR display, ProMotion",
                price: 1999,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Pro+14",
                category: "laptops",
                year: 2021
            },
            {
                id: 7,
                name: "iPad Pro M1",
                description: "M1 chip, 12.9-inch Liquid Retina XDR display, Thunderbolt",
                price: 1099,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Pro+M1",
                category: "tablets",
                year: 2021
            },
            {
                id: 8,
                name: "Apple Watch Series 7",
                description: "Larger display, faster charging, more durable design",
                price: 399,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Series+7",
                category: "watches",
                year: 2021
            },

            // 2022 Products
            {
                id: 9,
                name: "iPhone 14 Pro",
                description: "A16 Bionic chip, Dynamic Island, 48MP camera",
                price: 999,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+14+Pro",
                category: "phones",
                year: 2022
            },
            {
                id: 10,
                name: "MacBook Air M2",
                description: "M2 chip, 13.6-inch Liquid Retina display, MagSafe",
                price: 1199,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Air+M2",
                category: "laptops",
                year: 2022
            },
            {
                id: 11,
                name: "iPad Air (5th generation)",
                description: "M1 chip, 10.9-inch Liquid Retina display, 5G",
                price: 599,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Air+5",
                category: "tablets",
                year: 2022
            },
            {
                id: 12,
                name: "Apple Watch Ultra",
                description: "Titanium case, dual-frequency GPS, 36-hour battery",
                price: 799,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Ultra",
                category: "watches",
                year: 2022
            },

            // 2023 Products
            {
                id: 13,
                name: "iPhone 15 Pro",
                description: "A17 Pro chip, Titanium design, USB-C, Action button",
                price: 999,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+15+Pro",
                category: "phones",
                year: 2023
            },
            {
                id: 14,
                name: "MacBook Pro 16\" M3",
                description: "M3 Pro/Max chip, Space Black finish, 22-hour battery",
                price: 2499,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Pro+16+M3",
                category: "laptops",
                year: 2023
            },
            {
                id: 15,
                name: "iPad Pro M2",
                description: "M2 chip, 12.9-inch Liquid Retina XDR, Apple Pencil hover",
                price: 1099,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Pro+M2",
                category: "tablets",
                year: 2023
            },
            {
                id: 16,
                name: "Apple Watch Series 9",
                description: "S9 chip, Double tap gesture, brighter display",
                price: 399,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Series+9",
                category: "watches",
                year: 2023
            },

            // 2024 Products (Projected)
            {
                id: 17,
                name: "iPhone 16 Pro",
                description: "A18 Pro chip, Periscope camera, AI features",
                price: 1099,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+16+Pro",
                category: "phones",
                year: 2024
            },
            {
                id: 18,
                name: "MacBook Air M4",
                description: "M4 chip, OLED display, AI capabilities",
                price: 1299,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Air+M4",
                category: "laptops",
                year: 2024
            },
            {
                id: 19,
                name: "iPad Pro M3",
                description: "M3 chip, OLED display, Thunderbolt 4",
                price: 1199,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Pro+M3",
                category: "tablets",
                year: 2024
            },
            {
                id: 20,
                name: "Apple Watch Series 10",
                description: "S10 chip, Blood pressure monitoring, MicroLED display",
                price: 449,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Series+10",
                category: "watches",
                year: 2024
            },

            // 2025 Products (Projected)
            {
                id: 21,
                name: "iPhone 17 Pro",
                description: "A19 Pro chip, Under-display Face ID, AR features",
                price: 1199,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPhone+17+Pro",
                category: "phones",
                year: 2025
            },
            {
                id: 22,
                name: "MacBook Pro M5",
                description: "M5 chip, Neural Engine, Advanced AI features",
                price: 2799,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=MacBook+Pro+M5",
                category: "laptops",
                year: 2025
            },
            {
                id: 23,
                name: "iPad Pro M4",
                description: "M4 chip, Foldable display, Advanced AR",
                price: 1299,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=iPad+Pro+M4",
                category: "tablets",
                year: 2025
            },
            {
                id: 24,
                name: "Apple Watch Series 11",
                description: "S11 chip, Glucose monitoring, Advanced health features",
                price: 499,
                image: "https://placehold.co/600x400/f5f5f7/1d1d1f?text=Watch+Series+11",
                category: "watches",
                year: 2025
            }
        ];
        let currentCategory = 'all';
        let currentSort = 'default';
        let lastFiltered = allProducts;

        function renderProducts(products) {
            // Apply sorting
            let sorted = [...products];
            switch (currentSort) {
                case 'price-low':
                    sorted.sort((a, b) => a.price - b.price); break;
                case 'price-high':
                    sorted.sort((a, b) => b.price - a.price); break;
                case 'name':
                    sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
                default: break;
            }
            lastFiltered = sorted;
            const container = document.getElementById('products-container');
            container.innerHTML = '';
            sorted.forEach(product => {
                const el = document.createElement('div');
                el.className = 'grid-item';
                el.innerHTML = `
                    <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit;display:block;width:100%">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <h3 class="product-item-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                    </a>
                    <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                `;
                el.querySelector('.add-to-cart').addEventListener('click', (e) => {
                    e.stopPropagation();
                    addToCart(product);

                    // Add animation
                    const button = e.target;
                    const originalText = button.textContent;

                    button.textContent = 'Added!';
                    button.classList.add('animated', 'success'); /* Add success class for styling */
                    button.disabled = true; // Disable button temporarily

                    // Remove animation classes and revert text after a delay
                    setTimeout(() => {
                        button.classList.remove('animated', 'success');
                        button.textContent = originalText;
                        button.disabled = false; // Re-enable button
                    }, 2000); // Animation duration + slight delay

                });
                container.appendChild(el);
            });
        }

        function addToCart(product) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount(true);
        }

        function updateCartCount(animate) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelectorAll('.cart-count').forEach(el => {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
                if (animate) {
                    el.classList.add('animated');
                    setTimeout(() => el.classList.remove('animated'), 350);
                }
            });
        }

        function showCategory(category, el) {
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            if (el) el.classList.add('active');

            // Scroll smoothly to the products section (container)
            const productsContainerSection = document.querySelector('.container');
            if (productsContainerSection) {
                 const offsetTop = productsContainerSection.getBoundingClientRect().top + window.scrollY;
                 window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            } else {
                 // Fallback to scrolling to top if container not found
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            currentCategory = category;
            if (category === 'all') {
                document.querySelector('.products-title').textContent = 'All Products';
                renderProducts(allProducts);
            } else if (category === 'support') {
                document.querySelector('.products-title').textContent = 'Support';
                document.getElementById('products-container').innerHTML = '<p style="font-size:1.2rem;">Support page coming soon!</p>';
            } else if (category === 'other') {
                 document.querySelector('.products-title').textContent = 'Other Products';
                 renderProducts(allProducts.filter(p => p.category === 'other'));
            }
            else {
                document.querySelector('.products-title').textContent = category.charAt(0).toUpperCase() + category.slice(1);
                renderProducts(allProducts.filter(p => p.category === category));
            }
        }

        document.getElementById('sort-products').addEventListener('change', function() {
            currentSort = this.value;
            // Re-filter by current category
            if (currentCategory === 'all') {
                renderProducts(allProducts);
            } else if (currentCategory === 'support') {
                document.querySelector('.products-title').textContent = 'Support';
                document.getElementById('products-container').innerHTML = '<p style="font-size:1.2rem;">Support page coming soon!</p>';
            } else {
                renderProducts(allProducts.filter(p => p.category === currentCategory));
            }
        });

        // On page load
        renderProducts(allProducts);
        updateCartCount();