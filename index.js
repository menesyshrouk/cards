let cart = []; // This array will hold our cart items

// Function to save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load cart from localStorage
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Function to update the cart display (right sidebar)
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const orderTotalSpan = document.getElementById('order-total');
    const cartItemCountSpan = document.getElementById('cart-item-count');
    let total = 0;
    let itemCount = 0;

    // Clear previous items
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #888; margin-top: 50px;">Your added items will appear here</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            // Using a specific class for item name to allow separate styling if needed
            itemElement.innerHTML = `
                <div class="item-info">
                    <span>${item.quantity}x</span> @ $${item.price.toFixed(2)} <span class="item-name">- ${item.name}</span>
                </div>
                <div class="item-controls">
                    <button class="remove-item" data-id="${item.id}">X</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);

            total += item.price * item.quantity;
            itemCount += item.quantity;
        });
    }

    orderTotalSpan.textContent = total.toFixed(2);
    cartItemCountSpan.textContent = itemCount;
    saveCart(); // Save cart whenever it's updated
}

// Function to add/update item in cart
function addItemToCart(id, name, price) {
    const existingItemIndex = cart.findIndex(item => item.id === id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartDisplay();
    updateProductCardQuantity(id); // Update quantity displayed on the product card
}

// Function to remove item from cart
function removeItemFromCart(id) {
    // Find the item in the cart to get its current quantity before removing
    const existingItemIndex = cart.findIndex(item => item.id === id);
    if (existingItemIndex > -1) {
        cart.splice(existingItemIndex, 1); // Remove the item
    }

    updateCartDisplay();
    resetProductCardQuantity(id); // Reset quantity on the product card
}

// Function to update the quantity shown on the product card's controls (the 0, 1, 2...)
function updateProductCardQuantity(productId) {
    // Make sure we query for '.product-card' as per our HTML
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        const itemQuantitySpan = productCard.querySelector('.qty'); // Correct class for the span
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            itemQuantitySpan.textContent = cartItem.quantity;
        } else {
            itemQuantitySpan.textContent = 0;
        }
    }
}

// Function to reset quantity on product card when item is removed from cart (or quantity becomes 0)
function resetProductCardQuantity(productId) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        const itemQuantitySpan = productCard.querySelector('.qty');
        itemQuantitySpan.textContent = 0;
    }
}

// Get elements for the modal
const orderModal = document.getElementById('orderModal');
const modalOrderList = document.getElementById('modal-order-list');
const modalOrderTotal = orderModal.querySelector('strong'); // Assuming total is inside a strong tag in modal
const closeModalBtn = document.getElementById('closemodal');

// Universal Event Listener for click events
document.addEventListener('click', (event) => {
    // --- Handling "Add to Cart" button clicks ---
    if (event.target.classList.contains('add-btn') || event.target.closest('.add-btn')) {
        const addBtn = event.target.closest('.add-btn');
        const card = addBtn.closest('.product-card');

        const id = parseInt(card.dataset.id);
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);

        addItemToCart(id, name, price);
    }

    // --- Handling '+' (increase quantity) button clicks on product cards ---
    if (event.target.classList.contains('plus')) {
        const card = event.target.closest('.product-card');
        const id = parseInt(card.dataset.id);
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            addItemToCart(id, name, price);
            return;
        }
        updateCartDisplay();
        updateProductCardQuantity(id);
    }

    // --- Handling '-' (decrease quantity) button clicks on product cards ---
    if (event.target.classList.contains('minus')) {
        const card = event.target.closest('.product-card');
        const id = parseInt(card.dataset.id);
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex > -1) {
            if (cart[existingItemIndex].quantity > 1) {
                cart[existingItemIndex].quantity--;
            } else {
                cart.splice(existingItemIndex, 1);
            }
        }
        updateCartDisplay();
        updateProductCardQuantity(id);
    }

    // --- Handling 'X' (remove item) button clicks in the cart display ---
    if (event.target.classList.contains('remove-item')) {
        const idToRemove = parseInt(event.target.dataset.id);
        removeItemFromCart(idToRemove);
    }

    // --- Handling "Confirm Order" button click ---
    if (event.target.classList.contains('confirm-order-btn')) {
        if (cart.length > 0) { // Only open modal if cart is not empty
            modalOrderList.innerHTML = ''; // Clear previous list
            let total = 0;

            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.quantity}x ${item.name} - $${(item.quantity * item.price).toFixed(2)}`;
                modalOrderList.appendChild(listItem);
                total += item.quantity * item.price;
            });

            modalOrderTotal.textContent = `Order Total: $${total.toFixed(2)}`;
            orderModal.style.display = 'block'; // Show the modal
        } else {
            alert('Your cart is empty. Please add items before confirming your order.');
        }
    }

    // --- Handling "Start New Order" button click in the modal ---
    if (event.target.id === 'closemodal') {
        orderModal.style.display = 'none'; // Hide the modal
        cart = []; // Clear the cart
        saveCart(); // Save the empty cart to localStorage
        updateCartDisplay(); // Update the cart display
        // Reset quantities on all product cards
        document.querySelectorAll('.product-card').forEach(card => {
            const id = parseInt(card.dataset.id);
            resetProductCardQuantity(id);
        });
    }
});

// Initial load:
loadCart();
updateCartDisplay();

// Update quantities on all product cards on initial load based on cart content
document.querySelectorAll('.product-card').forEach(card => {
    const id = parseInt(card.dataset.id);
    updateProductCardQuantity(id);
});
