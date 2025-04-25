let cart = JSON.parse(localStorage.getItem('cart')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = localStorage.getItem('currentUser') || null;

document.addEventListener('DOMContentLoaded', () => {
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const closeCart = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const authToggle = document.getElementById('auth-toggle');
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.querySelector('.close-btn');
    const signInForm = document.getElementById('sign-in-form');
    const loginForm = document.getElementById('login-form');
    const tabs = document.querySelectorAll('.tab');
    const cartNotification = document.getElementById('cart-notification');
    const logoutBtn = document.getElementById('logout-btn');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const menuBox = document.getElementById('menu-box');
    const originalMenuCards = Array.from(document.querySelectorAll('.menu_card'));
    const orderForm = document.getElementById('order-form');
    const popupModal = document.getElementById('popup-modal');
    const popupMessage = document.getElementById('popup-message');
    const closePopup = document.querySelector('.close-popup');

    if (currentUser) {
        logoutBtn.style.display = 'inline-block';
    }

    cartToggle.addEventListener('click', () => {
        if (!cartSidebar.classList.contains('open')) {
            cartSidebar.classList.add('open');
            updateCart();
        }
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    authToggle.addEventListener('click', () => {
        authModal.style.display = 'flex';
        document.querySelector('.tab.active').click();
    });

    closeAuth.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(form => form.style.display = 'none');
            document.getElementById(`${tab.getAttribute('data-tab')}-form`).style.display = 'flex';
        });
    });

    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = signInForm.querySelector('input[type="text"]').value.trim();
        const password = signInForm.querySelector('input[type="password"]').value;
        const email = signInForm.querySelector('input[type="email"]').value.trim();

        if (!username || !password || !email) {
            alert('All fields are required!');
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            alert('Invalid email format!');
            return;
        }

        if (users.some(user => user.username === username)) {
            alert('Username already exists!');
            return;
        }

        users.push({ username, password, email });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Sign in successful! Please log in.');
        signInForm.reset();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            alert('Login successful!');
            authModal.style.display = 'none';
            loginForm.reset();
            logoutBtn.style.display = 'inline-block';
        } else {
            alert('Invalid username or password!');
        }
    });

    document.querySelectorAll('.menu_btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Please log in to add items to cart!');
                authModal.style.display = 'flex';
                return;
            }

            const item = button.getAttribute('data-item');
            const price = parseFloat(button.getAttribute('data-price'));
            const cartItem = { item, price, quantity: 1 };
            const existingItem = cart.find(i => i.item === item);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            showNotification(item);
            if (cartSidebar.classList.contains('open')) {
                updateCart();
            }
        });
    });

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${item.item} - $${(item.price * item.quantity).toFixed(2)} (x${item.quantity}) <button data-index="${index}">Remove</button>`;
            cartItems.appendChild(li);
            total += item.price * item.quantity;
        });
        cartTotal.textContent = total.toFixed(2);

        document.querySelectorAll('#cart-items button').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
        });
    }

    if (cartSidebar.classList.contains('open')) {
        updateCart();
    }

    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please log in to checkout!');
            authModal.style.display = 'flex';
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        document.getElementById('Order').scrollIntoView({ behavior: 'smooth' });
        const itemNames = cart.map(item => `${item.item} (x${item.quantity})`).join(', ');
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('order-items').value = itemNames;
        document.getElementById('order-quantity').value = totalQuantity;
        cartSidebar.classList.remove('open');
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please log in to place an order!');
            authModal.style.display = 'flex';
            return;
        }

        const name = document.getElementById('order-name').value.trim();
        const email = document.getElementById('order-email').value.trim();
        const number = document.getElementById('order-number').value.trim();
        const address = document.getElementById('order-address').value.trim();
        const items = document.getElementById('order-items').value.trim();
        const quantity = document.getElementById('order-quantity').value.trim();

        if (!name || !email || !number || !address || !items || !quantity) {
            alert('Please fill all required fields!');
            return;
        }

        popupMessage.textContent = 'Order Placed.Thank you!!';
        popupModal.style.display = 'flex';

        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        orderForm.reset();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        logoutBtn.style.display = 'none';
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        if (cartSidebar.classList.contains('open')) {
            updateCart();
            cartSidebar.classList.remove('open');
        }
        alert('Logged out successfully!');
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.toLowerCase().trim();
        menuBox.innerHTML = '';

        if (!query) {
            originalMenuCards.forEach(card => menuBox.appendChild(card.cloneNode(true)));
            return;
        }

        let hasResults = false;
        originalMenuCards.forEach(card => {
            const dishName = card.querySelector('.menu_info h2').textContent.toLowerCase();
            if (dishName.includes(query)) {
                menuBox.appendChild(card.cloneNode(true));
                hasResults = true;
            }
        });

        if (!hasResults) {
            menuBox.innerHTML = '<p>No dishes found matching your search.</p>';
        }
    });

    closePopup.addEventListener('click', () => {
        popupModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === popupModal) {
            popupModal.style.display = 'none';
        }
    });

    function showNotification(message) {
        cartNotification.textContent = message;
        cartNotification.style.display = 'block';
        setTimeout(() => {
            cartNotification.style.display = 'none';
        }, 3000);
    }
});
