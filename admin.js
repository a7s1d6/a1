document.addEventListener('DOMContentLoaded', () => {

    // --- Authentication System ---
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form-submit');
    const loginUser = document.getElementById('login-user');
    const loginPass = document.getElementById('login-pass');
    const loginError = document.getElementById('login-error');

    const EXPECTED_USER_HASH = 'YWRtaW4=';
    const EXPECTED_PASS_HASH = 'YWRtaW4xMjM=';

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userHash = btoa(loginUser.value);
            const passHash = btoa(loginPass.value);

            if (userHash === EXPECTED_USER_HASH && passHash === EXPECTED_PASS_HASH) {
                loginScreen.style.display = 'none';
                adminDashboard.style.display = 'flex';
                initDashboard();
            } else {
                loginError.style.display = 'block';
                loginPass.value = '';
            }
        });
    }

    // --- Admin Dashboard Logic ---
    function initDashboard() {
        const defaultProducts = [
            { id: 1, name: "عطر السلطان الفاخر", price: 550, code: "1", stock: 15, images: ["./assets/perfume_product_1775042964798.png"], img: "./assets/perfume_product_1775042964798.png" },
            { id: 2, name: "صندوق تمور عجوة المدينة", price: 250, code: "2", stock: 50, images: ["./assets/dates_product_1775042989153.png"], img: "./assets/dates_product_1775042989153.png" },
            { id: 3, name: "ساعة فاخرة - إصدار خاص", price: 1200, code: "3", stock: 5, images: ["./assets/watch_product_1775043002729.png"], img: "./assets/watch_product_1775043002729.png" },
            { id: 4, name: "بن عربي محمص فاخر", price: 120, code: "4", stock: 30, images: ["./assets/coffee_product_1775043359483.png"], img: "./assets/coffee_product_1775043359483.png" }
        ];

        let storeProducts = JSON.parse(localStorage.getItem('admin_products')) || defaultProducts;

        // Force-update existing products to use images array structure
        storeProducts.forEach(p => {
            if (!p.images) {
                p.images = [p.img]; // Move single img to array
            }
        });

        let isEditMode = false;
        let activeEditId = null;

        const tbody = document.getElementById('products-tbody');
        const form = document.getElementById('add-product-form');
        const resetBtn = document.getElementById('reset-default');
        const codeInput = document.getElementById('product-code');
        const formTitle = document.getElementById('form-title');
        const submitBtn = document.getElementById('submit-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const previewsContainer = document.getElementById('image-previews');

        const saveProducts = () => {
            localStorage.setItem('admin_products', JSON.stringify(storeProducts));
        };

        const updateNextCode = () => {
            if (!codeInput || isEditMode) return;
            const nextId = storeProducts.length > 0 ? Math.max(...storeProducts.map(p => p.id)) + 1 : 1;
            codeInput.value = nextId.toString();
        };

        const renderTable = () => {
            tbody.innerHTML = '';
            if (storeProducts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">لا توجد منتجات حالياً. أضف منتجاً جديداً!</td></tr>';
                return;
            }

            storeProducts.forEach((product) => {
                const tr = document.createElement('tr');
                const stockColor = product.stock <= 5 ? '#f44336' : (product.stock <= 10 ? '#ff9800' : '#4caf50');
                
                tr.innerHTML = `
                    <td>
                        <div style="position: relative;">
                            <img src="${product.img}" alt="${product.name}">
                            ${product.images.length > 1 ? `<span style="position: absolute; bottom: 0; right: 0; background: var(--gold); color: #000; font-size: 0.7rem; padding: 2px 5px; border-radius: 4px;">+${product.images.length - 1}</span>` : ''}
                        </div>
                    </td>
                    <td style="font-weight: bold;">${product.name}</td>
                    <td><code>${product.code || product.id}</code></td>
                    <td>${product.price} ريال</td>
                    <td style="color: ${stockColor}; font-weight: 800;">${product.stock || 0}</td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-small btn-primary edit-btn" data-id="${product.id}" style="background: #2196F3; color: white; border: none;">تعديل</button>
                            <button class="btn btn-small btn-danger delete-btn" data-id="${product.id}">حذف</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                        storeProducts = storeProducts.filter(p => p.id !== id);
                        saveProducts();
                        renderTable();
                        if(!isEditMode) updateNextCode();
                    }
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    startEdit(id);
                });
            });
        };

        const startEdit = (id) => {
            const product = storeProducts.find(p => p.id === id);
            if (!product) return;

            isEditMode = true;
            activeEditId = id;

            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-code').value = product.code;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-image-urls').value = (product.images || [product.img]).join('\n');

            // Render existing image previews
            previewsContainer.innerHTML = '';
            (product.images || [product.img]).forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.style.width = '50px';
                img.style.height = '50px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                img.style.border = '1px solid var(--gold)';
                previewsContainer.appendChild(img);
            });

            formTitle.textContent = "تعديل المنتج";
            submitBtn.textContent = "تحديث المنتج";
            cancelEditBtn.style.display = "block";
            document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
        };

        const cancelEdit = () => {
            isEditMode = false;
            activeEditId = null;
            form.reset();
            previewsContainer.innerHTML = '';
            formTitle.textContent = "إضافة منتج جديد";
            submitBtn.textContent = "حفظ المنتج";
            cancelEditBtn.style.display = "none";
            updateNextCode();
        };

        if(cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEdit);

        if(form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('product-name').value;
                const price = document.getElementById('product-price').value;
                const code = document.getElementById('product-code').value;
                const stock = document.getElementById('product-stock').value;
                const fileInput = document.getElementById('product-image-file');
                const urlsInput = document.getElementById('product-image-urls').value;

                let imageArray = urlsInput.split('\n').map(u => u.trim()).filter(u => u !== '');

                // Read files
                if (fileInput.files && fileInput.files.length > 0) {
                    const filePromises = Array.from(fileInput.files).map(file => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (event) => resolve(event.target.result);
                            reader.readAsDataURL(file);
                        });
                    });
                    const base64Images = await Promise.all(filePromises);
                    imageArray = [...imageArray, ...base64Images];
                }

                if (imageArray.length === 0) {
                    alert('يرجى اختيار صورة واحدة على الأقل.');
                    return;
                }

                if (isEditMode) {
                    const index = storeProducts.findIndex(p => p.id === activeEditId);
                    if (index !== -1) {
                        storeProducts[index] = {
                            ...storeProducts[index],
                            name,
                            price: parseFloat(price),
                            code,
                            stock: parseInt(stock),
                            images: imageArray,
                            img: imageArray[0]
                        };
                        alert('تم تحديث المنتج بنجاح!');
                    }
                } else {
                    const newId = storeProducts.length > 0 ? Math.max(...storeProducts.map(p => p.id)) + 1 : 1;
                    storeProducts.push({
                        id: newId,
                        name,
                        price: parseFloat(price),
                        code: code,
                        stock: parseInt(stock),
                        images: imageArray,
                        img: imageArray[0]
                    });
                    alert('تمت إضافة المنتج بنجاح!');
                }

                saveProducts();
                renderTable();
                cancelEdit();
            });
        }

        if(resetBtn) {
            resetBtn.addEventListener('click', () => {
                if(confirm('سيتم استعادة المنتجات الأساسية! هل توافق؟')) {
                    storeProducts = [...defaultProducts];
                    saveProducts();
                    renderTable();
                    cancelEdit();
                }
            });
        }

        renderTable();
        updateNextCode();
    }
});
