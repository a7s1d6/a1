document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if(navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Fade-in animation on scroll
    const checkVisibility = () => {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50) {
                element.classList.add('visible');
            }
        });
    };
    checkVisibility(); // Run initially
    window.addEventListener('scroll', checkVisibility);

    // Dynamic Products initialization (Updated with Code and Stock)
    const defaultProducts = [
        { id: 1, name: "عطر السلطان الفاخر", price: 550, code: "1", stock: 15, img: "./assets/perfume_product_1775042964798.png" },
        { id: 2, name: "صندوق تمور عجوة المدينة", price: 250, code: "2", stock: 50, img: "./assets/dates_product_1775042989153.png" },
        { id: 3, name: "ساعة فاخرة - إصدار خاص", price: 1200, code: "3", stock: 5, img: "./assets/watch_product_1775043002729.png" },
        { id: 4, name: "بن عربي محمص فاخر", price: 120, code: "4", stock: 30, img: "./assets/coffee_product_1775043359483.png" }
    ];

    let storeProducts = JSON.parse(localStorage.getItem('admin_products')) || defaultProducts;

    // --- DOM Elements ---
    const productGrid = document.getElementById('product-grid');
    const productModal = document.getElementById('product-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');
    const modalQtyInput = document.getElementById('modal-qty-input');
    const modalQtyPlus = document.getElementById('modal-qty-plus');
    const modalQtyMinus = document.getElementById('modal-qty-minus');
    const modalAddBtn = document.getElementById('modal-add-btn');
    const modalThumbnails = document.getElementById('modal-thumbnails');
    
    // New Modal Elements for Code and Stock
    const modalCodeBadge = document.getElementById('modal-code-badge');
    const modalStockBadge = document.getElementById('modal-stock-badge');

    const cartCountElement = document.querySelector('.cart-count');
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // --- State ---
    let cartCount = 0;
    let totalPrice = 0;
    let cartItemsList = [];
    let currentModalProductId = null;

    // --- Functions ---
    const renderProducts = () => {
        if (!productGrid) return; 
        productGrid.innerHTML = '';
        storeProducts.forEach((product, idx) => {
            const delayClass = idx % 2 === 0 ? 'delay-1' : 'delay-2';
            productGrid.innerHTML += `
                <div class="product-card fade-in ${delayClass}" data-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.img}" alt="${product.name}">
                        <div class="overlay">
                            <button class="btn btn-secondary open-details" data-id="${product.id}">عرض التفاصيل</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">${product.price} ريال</p>
                    </div>
                </div>
            `;
        });
    };

    const openCart = () => {
        if(cartSidebar) cartSidebar.classList.add('open');
        if(cartOverlay) cartOverlay.classList.add('open');
    };

    const closeCart = () => {
        if(cartSidebar) cartSidebar.classList.remove('open');
        if(cartOverlay) cartOverlay.classList.remove('open');
    };

    const openProductModal = (productId) => {
        const product = storeProducts.find(p => p.id === parseInt(productId));
        if (!product) return;

        currentModalProductId = product.id;
        modalImg.src = product.img;
        modalImg.alt = product.name;
        modalName.textContent = product.name;
        modalPrice.textContent = `${product.price} ريال`;
        modalQtyInput.value = 1;

        // Render Thumbnails
        if (modalThumbnails) {
            modalThumbnails.innerHTML = '';
            const images = product.images || [product.img];
            if (images.length > 1) {
                images.forEach((imgSrc, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = imgSrc;
                    thumb.style.width = '60px';
                    thumb.style.height = '60px';
                    thumb.style.objectFit = 'cover';
                    thumb.style.borderRadius = '8px';
                    thumb.style.cursor = 'pointer';
                    thumb.style.border = index === 0 ? '2px solid var(--gold)' : '2px solid transparent';
                    thumb.style.transition = '0.3s';
                    thumb.style.opacity = index === 0 ? '1' : '0.6';
                    
                    thumb.addEventListener('mouseover', () => {
                        modalImg.src = imgSrc;
                        document.querySelectorAll('#modal-thumbnails img').forEach(img => {
                            img.style.borderColor = 'transparent';
                            img.style.opacity = '0.6';
                        });
                        thumb.style.borderColor = 'var(--gold)';
                        thumb.style.opacity = '1';
                    });
                    modalThumbnails.appendChild(thumb);
                });
                modalThumbnails.style.display = 'flex';
            } else {
                modalThumbnails.style.display = 'none';
            }
        }

        // Update Code and Stock UI
        if(modalCodeBadge) modalCodeBadge.textContent = `رمز المنتج: ${product.code || 'غير متوفر'}`;
        
        if(modalStockBadge) {
            const stock = product.stock || 0;
            if (stock <= 0) {
                modalStockBadge.textContent = "نفد من المخزون";
                modalStockBadge.style.color = "#f44336";
                modalStockBadge.style.background = "rgba(244, 67, 54, 0.1)";
                modalStockBadge.style.borderColor = "rgba(244, 67, 54, 0.3)";
                if(modalAddBtn) modalAddBtn.disabled = true;
            } else {
                modalStockBadge.textContent = `المتوفر: ${stock} قطع`;
                modalStockBadge.style.color = "#4caf50";
                modalStockBadge.style.background = "rgba(76, 175, 80, 0.1)";
                modalStockBadge.style.borderColor = "rgba(76, 175, 80, 0.3)";
                if(modalAddBtn) modalAddBtn.disabled = false;
            }
        }

        productModal.classList.add('open');
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    };

    const closeProductModal = () => {
        productModal.classList.remove('open');
        modalOverlay.classList.remove('open');
        document.body.style.overflow = 'auto';
        currentModalProductId = null;
    };

    const updateCartUI = () => {
        if (!cartItemsContainer) return;
        if (cartItemsList.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">السلة فارغة حالياً</p>';
        } else {
            cartItemsContainer.innerHTML = cartItemsList.map(item => `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="price">${item.price} ريال</div>
                        <div class="cart-qty-control">
                            <button class="cart-qty-btn minus" data-id="${item.id}">-</button>
                            <span>${item.qty}</span>
                            <button class="cart-qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}" title="حذف">&times;</button>
                </div>
            `).join('');
        }
        if(totalPriceElement) totalPriceElement.textContent = `${totalPrice} ريال`;
    };

    const addToCart = (product, qty) => {
        let existingItem = cartItemsList.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cartItemsList.push({ 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                code: product.code, // Keep code for reference
                img: product.img, 
                qty: qty 
            });
        }
        
        totalPrice += (product.price * qty);
        cartCount += qty;
        
        if(cartCountElement) {
            cartCountElement.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);
            cartCountElement.textContent = cartCount;
        }
        updateCartUI();
    };

    // --- Event Listeners ---
    if(cartIcon) cartIcon.addEventListener('click', openCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeProductModal);
    if(modalOverlay) modalOverlay.addEventListener('click', closeProductModal);

    if(modalQtyPlus) modalQtyPlus.addEventListener('click', () => {
        modalQtyInput.value = parseInt(modalQtyInput.value) + 1;
    });
    if(modalQtyMinus) modalQtyMinus.addEventListener('click', () => {
        if(parseInt(modalQtyInput.value) > 1) {
            modalQtyInput.value = parseInt(modalQtyInput.value) - 1;
        }
    });

    if(modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {
            const product = storeProducts.find(p => p.id === currentModalProductId);
            const qty = parseInt(modalQtyInput.value) || 1;
            if(!product) return;

            // Check if adding more than stock
            if (qty > product.stock) {
                alert(`عذراً، المتوفر في المخزن فقط ${product.stock} قطع.`);
                return;
            }

            addToCart(product, qty);
            closeProductModal();
            openCart();
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const productId = parseInt(target.getAttribute('data-id'));
            if (!productId) return;

            let item = cartItemsList.find(i => i.id === productId);
            if (!item) return;

            if (target.classList.contains('plus')) {
                const product = storeProducts.find(p => p.id === productId);
                if (item.qty < product.stock) {
                   item.qty++;
                   cartCount++;
                   totalPrice += item.price;
                } else {
                   alert("لقد وصلت للحد الأقصى المتوفر في المخزن!");
                }
            } else if (target.classList.contains('minus')) {
                if (item.qty > 1) {
                    item.qty--;
                    cartCount--;
                    totalPrice -= item.price;
                }
            } else if (target.classList.contains('remove-item')) {
                cartCount -= item.qty;
                totalPrice -= (item.price * item.qty);
                cartItemsList = cartItemsList.filter(i => i.id !== productId);
            }

            if (cartCountElement) cartCountElement.textContent = cartCount;
            updateCartUI();
        });
    }

    if(productGrid) {
        productGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const productId = card.getAttribute('data-id');
                openProductModal(productId);
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItemsList.length === 0) {
                alert('السلة فارغة حالياً!');
                return;
            }

            let message = "مرحباً مجموعة بن صعبان التجارية،\nأود طلب المنتجات التالية:\n\n";
            cartItemsList.forEach((item, index) => {
                const symbolCode = item.code ? `[رقم: ${item.code}]` : "";
                message += `${index + 1}. ${item.name} ${symbolCode} - الكمية: ${item.qty} - السعر: ${item.price * item.qty} ريال\n`;
            });

            message += `\nإجمالي الطلب: ${totalPrice} ريال\n\nالرجاء إخباري بخطوات الدفع والتوصيل.`;
            
            const encodedMessage = encodeURIComponent(message);
            const waNumber = "967771643727";
            const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
            window.open(waUrl, '_blank');
        });
    }

    // --- Initial Render ---
    renderProducts();
});
