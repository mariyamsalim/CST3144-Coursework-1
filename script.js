var webstore = new Vue({
    el: '#App',
    data: {
        sitename: 'After School Activities',
        showSortModal: false,
        sortCriteria: 'title', 
        sortOrder: 'ascending', 
        products: [
            {
            id: 1001,
            title: "Swimming",
            description: "Swimming lessons for all ages and skill levels. Build confidence in the water while learning essential water safety and stroke techniques.",
            price: 850,
            image: "images/swimming.jpg",
            availableInventory: 15,
            location: "Dubai Sports City"
            },
            {
            id: 1002,
            title: "Horse Riding",
            description: "Learn to ride and care for horses in a safe, supervised environment. Develop balance, coordination, and a loving bond with these majestic animals.",
            price: 2800,
            image: "images/horseriding.jpg",
            availableInventory: 8,
            location: "Dubai Polo & Equestrian Club"
            },
            {
            id: 1003,
            title: "Coding",
            description: "An introduction to computer programming and logical thinking. Kids will learn to create games, apps, and websites using visual coding languages.",
            price: 950,
            image: "images/coding.jpg",
            availableInventory: 20,
            location: "Knowledge Village"
            },
            {
            id: 1004,
            title: "Gymnastics",
            description: "Develop flexibility, strength, and agility through fun tumbling, balancing, and apparatus work. Great for building coordination and body awareness.",
            price: 750,
            image: "images/gymnastics.jpg",
            availableInventory: 18,
            location: "Al Quoz"
            },
            {
            id: 1005,
            title: "Ballet",
            description: "Focus on grace, technique, and classical form. Students will learn fundamental positions, terminology, and barre work, building a strong foundation in discipline, posture, and fluid movement in a supportive and structured environment.",
            price: 650,
            image: "images/ballet.jpg",
            availableInventory: 25,
            location: "Jumeirah Lake Towers"
            },
            {
            id: 1006,
            title: "Theatre",
            description: "Unleash your child's inner star! Activities include improvisation, scene work, voice projection, and script reading, boosting confidence and public speaking skills.",
            price: 1100,
            image: "images/theatre.jpg",
            availableInventory: 12,
            location: "Alserkal Avenue"
            },
            {
            id: 1007,
            title: "Tennis",
            description: "Learn the fundamentals of tennis, including serving, volleying, and footwork. A high-energy sport that promotes fitness, focus, and good sportsmanship.",
            price: 1050,
            image: "images/tennis.jpg",
            availableInventory: 10,
            location: "Jumeirah Golf Estates"
            },
            {
            id: 1008,
            title: "Ice-hockey",
            description: "A thrilling team sport focused on skating, stickhandling, and teamwork. Suitable for beginners to intermediate players (basic skating ability is recommended).",
            price: 1200,
            image: "images/icehockey.jpg",
            availableInventory: 15,
            location: "Dubai Mall"
            },
            {
            id: 1009,
            title: "Padel Tennis",
            description: "The most popular racket sport in the UAE! Played in doubles on a walled court, this fast-paced game is excellent for developing quick reflexes, strategy, teamwork, and hand-eye coordination in a high-energy social environment.",
            price: 1100,
            image: "images/padel.jpeg",
            availableInventory: 14,
            location: "Dubai Marina"
            },
            {
            id: 1010,
            title: "Sailing",
            description: "Develop practical navigation, seamanship, water safety, and leadership skills on the Arabian Gulf. RYA-Certified dinghy training.",
            price: 2200,
            image: "images/sailing.jpg",
            availableInventory: 6,
            location: "Dubai Offshore Sailing Club"
            },
            {
            id: 1011,
            title: "Surfing (Summer Exclusive)",
            description: "Catch a wave with our exclusive summer program! Learn safety, ocean awareness, and basic board skills in the water with certified instructors.",
            price: 900,
            image: "images/surfing.jpg",
            availableInventory: 20,
            location: "Kite Beach"
            }
        ],
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
        submitForm: function () {
            {alert('Booking done!') }
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
        }
    }
});