var webstore = new Vue({
    el: '#App',
    data: {
        sitename: 'After School Activities',
        showSortModal: false,
        sortCriteria: 'title', 
        sortOrder: 'ascending', 
        searchQuery: '',
        products: [],
        cart: [],
        showProduct: true,
        checkoutConfirmed: false,
        order: {
            firstName: ' ',
            lastName: ' ',
            phone: ' ',
            email: ' ',
        },
    },
    created: function() {
    fetch('https://cst3144-server-fi5v.onrender.com/collection/lessons')
        .then(response => response.json())
        .then(json => {
            this.products = json;
        })
        .catch(error => console.error('Error fetching lessons:', error));
    },
    methods: {
        addToCart(product) {
            let cartItem = this.cart.find(item => item.id === product.id);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                this.cart.push({ id: product.id, quantity: 1 });
            }
            product.availableInventory--;
        },
        showCheckout: function () {
            this.showProduct = !this.showProduct;
            if (this.showProduct) {
                this.checkoutConfirmed = false;
            }
        },
        proceedToContact: function() {
            this.checkoutConfirmed = true;
        },
        submitForm: function() {
            const newOrder = {
                firstName: this.order.firstName,
                lastName: this.order.lastName,
                phone: this.order.phone,
                email: this.order.email,
                cart: this.cart, 
                spaces: this.cartItemCount 
            };

            fetch('https://cst3144-server-fi5v.onrender.com/collection/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newOrder),
            })
            .then(response => response.json())
            .then(data => {
                this.cart.forEach(item => {
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        const newSpace = product.availableInventory - item.quantity;

                        fetch(`https://cst3144-server-fi5v.onrender.com/collection/lessons/${item.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ availableInventory: newSpace })
                        });
                    }
                });
                alert('Order submitted!');
                this.cart = [];
                this.showProduct = true;
            })
            .catch(error => console.error('Error submitting order:', error));
        },
        removeItem(productInCart) {
            let cartIndex = this.cart.findIndex(item => item.id === productInCart.id);
            if (cartIndex > -1) {
                this.cart[cartIndex].quantity--;
                let product = this.products.find(p => p.id === productInCart.id);
                if (product) {
                    product.availableInventory++;
                }
                if (this.cart[cartIndex].quantity === 0) {
                    this.cart.splice(cartIndex, 1);
                }
            }
        },
        performSearch: function() {
            fetch(`https://cst3144-server-fi5v.onrender.com/search/lessons?q=${this.searchQuery}`)
            .then(response => response.json())
            .then(json => {
                this.products = json;
            })
            .catch(error => console.error('Error fetching search results:', error));
        }
    },
    computed: {
        cartItemCount() {
            return this.cart.reduce((total, item) => total + item.quantity, 0);
        },
        isCartEmpty() {
            return this.cartItemCount === 0;
        },
        canAddToCart() {
            return (product) => product.availableInventory > 0;
        },
        sortedProducts() {
            let productsArray = this.products.slice(); 
            productsArray.sort((a, b) => {
                const criteria = this.sortCriteria;
                const aValue = a[criteria];
                const bValue = b[criteria];
                let comparison = 0;
                if (typeof aValue === 'string') {
                    comparison = aValue.localeCompare(bValue);
                } else {
                    comparison = aValue - bValue;
                }
                return this.sortOrder === 'ascending' ? comparison : comparison * -1;
            });
            return productsArray;
        },
        cartProducts() {
            return this.cart.map(cartItem => {
                let product = this.products.find(p => p.id === cartItem.id);
                if (product) {
                    return {
                        ...product, 
                        quantity: cartItem.quantity 
                    };
                }
                return null; 
            }).filter(item => item !== null); 
        },
        cartTotal() {
            return this.cartProducts.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
        },
        isValidOrder() {
            const nameRegex = /^[A-Za-z\s]+$/;
            const phoneRegex = /^[0-9]+$/;

            return nameRegex.test(this.order.firstName) && 
                nameRegex.test(this.order.lastName) && 
                phoneRegex.test(this.order.phone);
        }
    }
});

//commit all changes