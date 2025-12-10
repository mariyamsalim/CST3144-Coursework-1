var webstore = new Vue({
    //Connect Vue instance to the HTML element with id 'App'
    el: '#App',
    //App data
    data: {
        sitename: 'After School Activities',
        //Controls sort modal visibility
        showSortModal: false,
        //Default sorting set (by title in ascending order)
        sortCriteria: 'title', 
        sortOrder: 'ascending', 
        //Search text entered by user
        searchQuery: '',
        //Activities fetched from server
        products: [],
        //Shopping cart contents (id and quantity)
        cart: [],
        //Controls product listing and checkout form visibility
        showProduct: true,
        //Controls checkout confirmation and contact form visibility
        checkoutConfirmed: false,
        //Whether final confirmation modal is shown
        orderSubmitted: false,
        // Stores user input from contact form
        order: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
        },
    },

    //Fetch activities from server when Vue loads
    created: function() {
    fetch('https://cst3144-server-fi5v.onrender.com/collection/activities')
        .then(response => response.json())
        .then(json => {
            //Save activities to products array
            this.products = json;
        })
        .catch(error => console.error('Error fetching activities:', error));
    },

    methods: {
        //Add selected activity to cart
        addToCart(product) {
            //Check if activity is already in cart
            let cartItem = this.cart.find(item => item.id === product.id);
            if (cartItem) {
                //If found, increase quantity
                cartItem.quantity++;
            } else {
                //Otherwise, add activity to cart
                this.cart.push({ id: product.id, quantity: 1 });
            }
            //Decrease the available slots for the activity
            product.availableInventory--;
        },
        //Toggle between product listing and checkout form
        showCheckout: function () {
            this.showProduct = !this.showProduct;
            //Reset contact form if user goes back to product listing
            if (this.showProduct) {
                this.checkoutConfirmed = false;
            }
        },
        //Proceed to contact information form
        proceedToContact: function() {
            this.checkoutConfirmed = true;
        },
        //Submit order to server
        submitForm: function() {
            //Create order object with user details and cart contents
            const newOrder = {
                firstName: this.order.firstName,
                lastName: this.order.lastName,
                phone: this.order.phone,
                email: this.order.email,
                cart: this.cart, 
                spaces: this.cartItemCount 
            };
            //Send order to server
            fetch('https://cst3144-server-fi5v.onrender.com/collection/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder),
            })
            .then(response => response.json())
            .then(data => {
                //Update available slots for each activity after saving order
                this.cart.forEach(item => {
                    const product = this.products.find(p => p.id === item.id);
                    if (product) {
                        //Calculate new available slots
                        const newSpace = product.availableInventory - item.quantity;
                        //Send update to server
                        fetch(`https://cst3144-server-fi5v.onrender.com/collection/activities/${item.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ availableInventory: newSpace })
                        });
                    }
                });
                //Show order confirmation modal
                this.orderSubmitted = true; 
            })
            .catch(error => console.error('Error submitting order:', error));
        },
        //Remove one quantity of an activity from cart
        removeItem(productInCart) {
            let cartIndex = this.cart.findIndex(item => item.id === productInCart.id);
            if (cartIndex > -1) {
                //Decrease quantity in cart
                this.cart[cartIndex].quantity--;
                //Increase available slots for the activity
                let product = this.products.find(p => p.id === productInCart.id);
                if (product) {
                    product.availableInventory++;
                }
                //If quantity reaches zero, remove activity completely from cart
                if (this.cart[cartIndex].quantity === 0) {
                    this.cart.splice(cartIndex, 1);
                }
            }
        },
        //Perform search based on user query
        performSearch: function() {
            //If search query is empty, fetch all activities
            if (this.searchQuery.trim() === '') {
                fetch('https://cst3144-server-fi5v.onrender.com/collection/activities')
                .then(response => response.json())
                .then(json => {
                    this.products = json;
                })
                .catch(error => console.error('Error fetching activities:', error));
            //Otherwise, fetch search results from server
            } else {
                fetch(`https://cst3144-server-fi5v.onrender.com/search/activities?q=${this.searchQuery}`)
                .then(response => response.json())
                .then(json => {
                    this.products = json;
                })
                .catch(error => console.error('Error fetching search results:', error));
            }
        },
        //Reset everything after order completion
        resetCart() {
            this.cart = [];
            this.showProduct = true;
            this.checkoutConfirmed = false;
            this.orderSubmitted = false;
            //Clear contact form
            this.order.firstName = '';
            this.order.lastName = '';
            this.order.phone = '';
            this.order.email = '';
        }
    },

    computed: {
        //Total number of items in cart
        cartItemCount() {
            return this.cart.reduce((total, item) => total + item.quantity, 0);
        },
        //Used to disable checkout button if cart is empty
        isCartEmpty() {
            return this.cartItemCount === 0;
        },
        //Check if activity can be added to cart based on available slots
        canAddToCart() {
            return (product) => product.availableInventory > 0;
        },
        //Return products sorted based on selected criteria and order
        sortedProducts() {
            //Clone original products array
            let productsArray = this.products.slice(); 
            productsArray.sort((a, b) => {
                const criteria = this.sortCriteria;
                const aValue = a[criteria];
                const bValue = b[criteria];
                let comparison = 0;
                //Using localeCompare for strings, numerical comparison for numbers
                if (typeof aValue === 'string') {
                    comparison = aValue.localeCompare(bValue);
                } else {
                    comparison = aValue - bValue;
                }
                //Reverse order if descending is selected in sorting
                return this.sortOrder === 'ascending' ? comparison : comparison * -1;
            });
            return productsArray;
        },
        //Get detailed product info for items in cart
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
        //Calculate total cost of items in cart
        cartTotal() {
            return this.cartProducts.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
        },
        //Validate contact form inputs
        isValidOrder() {
            const nameRegex = /^[A-Za-z\s]+$/;
            const phoneRegex = /^[0-9]+$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            //Check each field against its respective regex
            return nameRegex.test(this.order.firstName) && 
                nameRegex.test(this.order.lastName) && 
                phoneRegex.test(this.order.phone) &&
                emailRegex.test(this.order.email);
        }
    }
});
