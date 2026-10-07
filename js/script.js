/*
========================================================
SUPABASE
========================================================
*/

const SUPABASE_URL = "https://rikjkudscsqvudfltqum.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_3irD4ZSgdFnNCPG29pBFlQ_CWmnmGVi";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/*
========================================================
VETQON
EMAILJS
========================================================
*/

const EMAILJS_PUBLIC_KEY = "BWwQmBQbFyybXj1HJ";
const EMAILJS_SERVICE_ID = "service_vetqon";
const EMAILJS_TEMPLATE_ID = "template_cruhcpn";
const EMAILJS_ADMIN_TEMPLATE_ID = "template_7ctdvys";

if (
    typeof emailjs !== "undefined" &&
    EMAILJS_PUBLIC_KEY !== "TON_PUBLIC_KEY"
) {
    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });
}


/*
========================================================
STOCK
========================================================

Tous les produits commencent avec 20 pièces.

Pour les produits avec couleurs,
chaque couleur possède son propre stock.
========================================================
*/

const INITIAL_INVENTORY = {

    1: 20,

    2: {
        blue: 20,
        green: 20,
        orange: 20,
        red: 20,
        yellow: 20
    },

    3: 20,

    4: 20,

    5: {
        yellow: 20,
        orange: 20
    },

    6: 20,
    7: 20,
    8: 20,
    9: 20,
    10: 20,
    11: 20,
    12: 20,
    13: 20,
    14: 20,
    15: 20,
    16: 20,
    17: 20,

    18: {
        black: 20,
        blue: 20,
        white: 20
    },

    19: {
        black: 20,
        blue: 20,
        white: 20
    },

    20: {
        black: 20,
        blue: 20,
        red: 20
    },

    21: 20,
    22: 20,

    23: {
        black: 20,
        white: 20,
        green: 20
    },

    24: 20,
    25: 20,

    26: {
        black: 20,
        green: 20,
        grey: 20,
        pink: 20,
        yellow: 20
    }
};


const INVENTORY_STORAGE_KEY = "vetqon_inventory_v1";


function cloneInventory() {

    return JSON.parse(
        JSON.stringify(INITIAL_INVENTORY)
    );
}


function loadInventory() {

    try {

        const saved =
            localStorage.getItem(
                INVENTORY_STORAGE_KEY
            );

        if (!saved) {

            const fresh =
                cloneInventory();

            localStorage.setItem(
                INVENTORY_STORAGE_KEY,
                JSON.stringify(fresh)
            );

            return fresh;
        }

        const inventory =
            JSON.parse(saved);

        return inventory;

    } catch (error) {

        console.error(error);

        return cloneInventory();
    }
}


let inventory =
    loadInventory();


function saveInventory() {

    localStorage.setItem(
        INVENTORY_STORAGE_KEY,
        JSON.stringify(inventory)
    );
}


/*
========================================================
RESET STOCK
========================================================
*/

function resetAllStock() {

    inventory =
        cloneInventory();

    saveInventory();

    updateProductControls();

    updateCart();

    alert("Stock réinitialisé.");
}


/*
========================================================
MODIFIER STOCK
========================================================
*/

function setStock(
    productNumber,
    amount,
    color = null
) {

    amount =
        Math.max(
            0,
            Number(amount)
        );

    if (
        color &&
        typeof inventory[productNumber] === "object"
    ) {

        inventory[productNumber][color] =
            amount;

    } else {

        inventory[productNumber] =
            amount;
    }

    saveInventory();

    updateProductControls();
}


/*
========================================================
PANIER
========================================================
*/

let cart = [];


/*
========================================================
OUTILS PRODUITS
========================================================
*/

const COLOR_PRODUCTS = new Set([
    2,
    5,
    18,
    19,
    20,
    23,
    26
]);


function getProductCard(productNumber) {

    return document.querySelector(
        `.product-card[data-product-id="${productNumber}"]`
    );
}


function getProductColor(productNumber) {

    const card =
        getProductCard(productNumber);

    if (!card) return null;

    const select =
        card.querySelector(
            "select[id*='-color']"
        );

    if (!select) return null;

    return select.value;
}


function getStockKey(productNumber) {

    if (COLOR_PRODUCTS.has(productNumber)) {

        const color =
            getProductColor(productNumber);

        return `${productNumber}:${color}`;
    }

    return `${productNumber}`;
}


function getStockFromKey(stockKey) {

    const parts =
        stockKey.split(":");

    const productNumber =
        Number(parts[0]);

    const color =
        parts[1];

    if (
        color &&
        inventory[productNumber] &&
        typeof inventory[productNumber] === "object"
    ) {

        return Number(
            inventory[productNumber][color] || 0
        );
    }

    return Number(
        inventory[productNumber] || 0
    );
}


function getCartQuantityForStock(stockKey) {

    return cart.reduce(
        (total, item) => {

            if (item.stockKey === stockKey) {
                return total + item.quantity;
            }

            return total;

        },
        0
    );
}


function getAvailableStock(stockKey) {

    return Math.max(
        0,
        getStockFromKey(stockKey) -
        getCartQuantityForStock(stockKey)
    );
}


function getQuantityForProduct(productNumber) {

    const card =
        getProductCard(productNumber);

    if (!card) return 1;

    const input =
        card.querySelector(
            ".product-quantity"
        );

    if (!input) return 1;

    return Math.max(
        1,
        Number(input.value) || 1
    );
}


function setQuantityMax(
    productNumber,
    maximum
) {

    const card =
        getProductCard(productNumber);

    if (!card) return;

    const input =
        card.querySelector(
            ".product-quantity"
        );

    if (!input) return;

    input.max =
        Math.max(
            1,
            maximum
        );

    if (
        Number(input.value) >
        maximum
    ) {

        input.value =
            Math.max(
                1,
                maximum
            );
    }
}


/*
========================================================
STOCK STATUS
========================================================
*/

function updateProductStockStatus(
    productNumber
) {

    const card =
        getProductCard(productNumber);

    if (!card) return;

    const status =
        document.getElementById(
            `stock-status-${productNumber}`
        );

    if (!status) return;

    const stockKey =
        getStockKey(productNumber);

    const stock =
        getAvailableStock(stockKey);

    const button =
        card.querySelector(".add-btn");

    card.classList.remove(
        "sold-out"
    );

    status.classList.remove(
        "in-stock",
        "low-stock",
        "sold-out"
    );

    if (stock <= 0) {

        status.textContent =
            "Sold out";

        status.classList.add(
            "sold-out"
        );

        card.classList.add(
            "sold-out"
        );

        if (button) {

            button.disabled = true;

            button.textContent =
                "Sold out";
        }

        setQuantityMax(
            productNumber,
            1
        );

    } else if (stock <= 5) {

        status.textContent =
            `Only ${stock} left`;

        status.classList.add(
            "low-stock"
        );

        if (button) {

            button.disabled = false;

            button.textContent =
                "Ajouter au panier";
        }

        setQuantityMax(
            productNumber,
            stock
        );

    } else {

        status.textContent =
            "In stock";

        status.classList.add(
            "in-stock"
        );

        if (button) {

            button.disabled = false;

            button.textContent =
                "Ajouter au panier";
        }

        setQuantityMax(
            productNumber,
            stock
        );
    }
}


function updateProductControls() {

    for (
        let productNumber = 1;
        productNumber <= 26;
        productNumber++
    ) {

        const card =
            getProductCard(productNumber);

        if (!card) continue;

        updateProductStockStatus(
            productNumber
        );
    }
}


/*
========================================================
QUANTITY SUR CHAQUE PRODUIT
========================================================
*/

function createQuantityControls() {

    document
        .querySelectorAll(".product-card")
        .forEach(card => {

            if (
                card.querySelector(
                    ".product-quantity-box"
                )
            ) {
                return;
            }

            const productNumber =
                Number(
                    card.dataset.productId
                );

            const button =
                card.querySelector(
                    ".add-btn"
                );

            if (!button) return;

            const box =
                document.createElement("div");

            box.className =
                "product-quantity-box";

            box.innerHTML = `
                <label class="quantity-label">
                    Quantité
                </label>

                <input
                    type="number"
                    class="product-quantity"
                    min="1"
                    max="20"
                    value="1"
                    inputmode="numeric"
                    aria-label="Quantité">
            `;

            button.parentNode.insertBefore(
                box,
                button
            );

            const input =
                box.querySelector(
                    ".product-quantity"
                );

            input.addEventListener(
                "input",
                function() {

                    const stockKey =
                        getStockKey(
                            productNumber
                        );

                    const available =
                        getAvailableStock(
                            stockKey
                        );

                    let value =
                        Number(
                            input.value
                        ) || 1;

                    if (
                        value < 1
                    ) {
                        value = 1;
                    }

                    if (
                        value > available
                    ) {
                        value =
                            Math.max(
                                1,
                                available
                            );
                    }

                    input.value =
                        value;
                }
            );
        });
}


/*
========================================================
PRODUIT 1
========================================================
*/

function updateProduct1Price() {

    const size =
        document.getElementById(
            "product1-size"
        ).value;

    const price =
        ["4", "5", "6"].includes(size)
            ? 249
            : 239;

    document.getElementById(
        "product1-price"
    ).textContent =
        price + " DH";

    updateProductStockStatus(1);
}


function addProduct1ToCart() {

    const size =
        document.getElementById(
            "product1-size"
        ).value;

    const price =
        ["4", "5", "6"].includes(size)
            ? 249
            : 239;

    const quantity =
        getQuantityForProduct(1);

    addToCart(
        "Gants de gardien de but de football - Taille " + size,
        price,
        "1",
        1,
        quantity
    );
}


/*
========================================================
PRODUIT 2
========================================================
*/

function changeProduct2Image() {

    const color =
        document.getElementById(
            "product2-color"
        ).value;

    const image =
        document.getElementById(
            "product2-image"
        );

    const newImage =
        "images/product2-" +
        color +
        ".png";

    image.classList.add(
        "changing-image"
    );

    image.onload =
        function() {

            image.classList.remove(
                "changing-image"
            );
        };

    image.onerror =
        function() {

            image.src =
                "images/product2-blue.png";

            image.classList.remove(
                "changing-image"
            );
        };

    image.src =
        newImage;

    updateProductStockStatus(2);
}


function addProduct2ToCart() {

    const colorSelect =
        document.getElementById(
            "product2-color"
        );

    const sizeSelect =
        document.getElementById(
            "product2-size"
        );

    const color =
        colorSelect.value;

    const colorName =
        colorSelect.options[
            colorSelect.selectedIndex
        ].text;

    const size =
        sizeSelect.value;

    const quantity =
        getQuantityForProduct(2);

    addToCart(
        "Gants de gardien professionnels - " +
        colorName +
        " - Taille " +
        size,
        149,
        `2:${color}`,
        2,
        quantity
    );
}


/*
========================================================
PRODUIT 4
========================================================
*/

function updateProduct4Price() {

    const size =
        document.getElementById(
            "product4-size"
        ).value;

    const price =
        ["5", "6", "7"].includes(size)
            ? 189
            : 199;

    document.getElementById(
        "product4-price"
    ).textContent =
        price + " DH";

    updateProductStockStatus(4);
}


function addProduct4ToCart() {

    const size =
        document.getElementById(
            "product4-size"
        ).value;

    const price =
        ["5", "6", "7"].includes(size)
            ? 189
            : 199;

    const quantity =
        getQuantityForProduct(4);

    addToCart(
        "Gants de gardien de but pour l'entraînement - Taille " + size,
        price,
        "4",
        4,
        quantity
    );
}


/*
========================================================
CHANGEMENT DES IMAGES
========================================================
*/

function changeProductImage(
    productNumber,
    color,
    imageId
) {

    const image =
        document.getElementById(
            imageId
        );

    if (!image) return;

    const original =
        image.src;

    const newPath =
        "images/product" +
        productNumber +
        "-" +
        color +
        ".png";

    image.classList.add(
        "changing-image"
    );

    image.onload =
        function() {

            image.classList.remove(
                "changing-image"
            );
        };

    image.onerror =
        function() {

            image.onerror = null;

            image.src =
                original;

            image.classList.remove(
                "changing-image"
            );
        };

    image.src =
        newPath;

    updateProductStockStatus(
        productNumber
    );
}


/*
========================================================
PRODUITS AVEC COULEUR
========================================================
*/

function addColorProduct(
    productNumber,
    productName,
    price
) {

    const card =
        getProductCard(
            productNumber
        );

    if (!card) return;

    const select =
        card.querySelector(
            "select[id*='-color']"
        );

    const color =
        select
            ? select.value
            : "";

    const colorName =
        select
            ? select.options[
                select.selectedIndex
              ].text
            : "";

    const quantity =
        getQuantityForProduct(
            productNumber
        );

    addToCart(
        productName +
        (
            colorName
                ? " - Couleur " + colorName
                : ""
        ),
        price,
        `${productNumber}:${color}`,
        productNumber,
        quantity
    );
}


function addVariantProduct(
    productNumber,
    productName,
    price,
    sizeId
) {

    const sizeElement =
        document.getElementById(
            sizeId
        );

    const size =
        sizeElement
            ? sizeElement.value
            : "";

    const card =
        getProductCard(
            productNumber
        );

    const select =
        card
            ? card.querySelector(
                "select[id*='-color']"
              )
            : null;

    const color =
        select
            ? select.value
            : "";

    const colorName =
        select
            ? select.options[
                select.selectedIndex
              ].text
            : "";

    let finalName =
        productName;

    if (colorName) {

        finalName +=
            " - " +
            colorName;
    }

    if (size) {

        finalName +=
            " - Taille " +
            size;
    }

    const quantity =
        getQuantityForProduct(
            productNumber
        );

    addToCart(
        finalName,
        price,
        `${productNumber}:${color}`,
        productNumber,
        quantity
    );
}


/*
========================================================
PRODUITS SIMPLES
========================================================
*/

function addSimpleProductToCart(
    productNumber,
    name,
    price
) {

    const quantity =
        getQuantityForProduct(
            productNumber
        );

    addToCart(
        name,
        price,
        `${productNumber}`,
        productNumber,
        quantity
    );
}


/*
========================================================
AJOUT AU PANIER
========================================================
*/

function animateCart() {

    const cartButton =
        document.querySelector(
            ".cart-btn"
        );

    if (!cartButton) return;

    cartButton.classList.remove(
        "cart-bounce"
    );

    void cartButton.offsetWidth;

    cartButton.classList.add(
        "cart-bounce"
    );
}


function addToCart(
    name,
    price,
    stockKey,
    productNumber,
    quantity = 1
) {

    quantity =
        Math.max(
            1,
            Number(quantity) || 1
        );

    const available =
        getAvailableStock(
            stockKey
        );

    if (available <= 0) {

        alert(
            "Ce produit est actuellement épuisé."
        );

        return;
    }

    if (quantity > available) {

        alert(
            `Il ne reste que ${available} pièce(s) disponible(s).`
        );

        return;
    }

    const existing =
        cart.find(
            item =>
                item.stockKey === stockKey
        );

    if (existing) {

        existing.quantity +=
            quantity;

    } else {

        cart.push({

            id:
                Date.now() +
                Math.random(),

            name:
                name,

            price:
                Number(price),

            quantity:
                quantity,

            stockKey:
                stockKey,

            productNumber:
                productNumber
        });
    }

    updateCart();

    updateProductControls();

    animateCart();

    openCart();
}


/*
========================================================
QUANTITÉ DANS LE PANIER
========================================================
*/

function changeCartQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            product =>
                product.id === id
        );

    if (!item) return;

    if (amount > 0) {

        const available =
            getAvailableStock(
                item.stockKey
            );

        if (available <= 0) {

            alert(
                "Vous avez atteint la quantité disponible."
            );

            return;
        }

        item.quantity +=
            amount;

    } else {

        item.quantity +=
            amount;

        if (
            item.quantity <= 0
        ) {

            removeFromCart(
                item.id
            );

            return;
        }
    }

    updateCart();

    updateProductControls();
}


/*
========================================================
SUPPRIMER DU PANIER
========================================================
*/

function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                item.id !== id
        );

    updateCart();

    updateProductControls();
}


/*
========================================================
CALCUL
========================================================
*/

function getSubtotal() {

    return cart.reduce(
        (total, item) =>
            total +
            Number(item.price) *
            Number(item.quantity),
        0
    );
}


function getDelivery() {

    const subtotal =
        getSubtotal();

    if (subtotal === 0) {
        return 0;
    }

    if (subtotal < 199) {
        return 35;
    }

    return 0;
}


function getTotal() {

    return (
        getSubtotal() +
        getDelivery()
    );
}


/*
========================================================
AFFICHER PANIER
========================================================
*/

function updateCart() {

    const cartItems =
        document.getElementById(
            "cart-items"
        );

    const cartCount =
        document.getElementById(
            "cart-count"
        );

    const cartSubtotal =
        document.getElementById(
            "cart-subtotal"
        );

    const deliveryCost =
        document.getElementById(
            "delivery-cost"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );

    const deliveryMessage =
        document.getElementById(
            "delivery-message"
        );

    if (!cartItems) return;

    cartItems.innerHTML = "";

    const subtotal =
        getSubtotal();

    const delivery =
        getDelivery();

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                Votre panier est vide.
            </div>
        `;

    } else {

        cart.forEach(item => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "cart-item";

            div.innerHTML = `
                <div class="cart-item-info">
                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        ${item.price} DH × ${item.quantity}
                        = ${item.price * item.quantity} DH
                    </span>
                </div>

                <div class="cart-item-actions">

                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="changeCartQuantity(${item.id}, -1)">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            onclick="changeCartQuantity(${item.id}, 1)">
                            +
                        </button>

                    </div>

                    <button
                        type="button"
                        class="remove-item"
                        onclick="removeFromCart(${item.id})">
                        Supprimer
                    </button>

                </div>
            `;

            cartItems.appendChild(
                div
            );
        });
    }


    if (subtotal === 0) {

        deliveryMessage.textContent =
            "Livraison gratuite à partir de 199 DH";

    } else if (subtotal < 199) {

        deliveryMessage.textContent =
            "Ajoutez " +
            (199 - subtotal) +
            " DH pour bénéficier de la livraison gratuite.";

    } else {

        deliveryMessage.textContent =
            "🎉 Livraison gratuite !";
    }


    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    cartCount.textContent =
        totalQuantity;

    cartSubtotal.textContent =
        subtotal;

    deliveryCost.textContent =
        delivery === 0
            ? "Gratuite"
            : delivery + " DH";

    cartTotal.textContent =
        subtotal + delivery;
}


/*
========================================================
PANIER OUVRIR / FERMER
========================================================
*/

function openCart() {

    const overlay =
        document.getElementById(
            "cart-overlay"
        );

    if (overlay) {

        overlay.style.display =
            "block";

        document.body.style.overflow =
            "hidden";
    }
}


function closeCart() {

    const overlay =
        document.getElementById(
            "cart-overlay"
        );

    if (overlay) {

        overlay.style.display =
            "none";

        document.body.style.overflow =
            "";
    }
}


/*
========================================================
CHECKOUT
========================================================
*/

function checkout() {

    if (cart.length === 0) {

        alert(
            "Votre panier est vide."
        );

        return;
    }

    closeCart();

    updateCheckoutPreview();

    const form =
        document.getElementById(
            "checkout-form"
        );

    form.style.display =
        "block";

    document.body.style.overflow =
        "hidden";
}


function closeCheckout() {

    const form =
        document.getElementById(
            "checkout-form"
        );

    form.style.display =
        "none";

    document.body.style.overflow =
        "";
}


function updateCheckoutPreview() {

    const container =
        document.getElementById(
            "checkout-items"
        );

    const subtotalElement =
        document.getElementById(
            "checkout-subtotal"
        );

    const deliveryElement =
        document.getElementById(
            "checkout-delivery"
        );

    const totalElement =
        document.getElementById(
            "checkout-total-price"
        );

    if (!container) return;

    container.innerHTML = "";

    cart.forEach(item => {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "checkout-item";

        row.innerHTML = `
            <span>
                ${escapeHTML(item.name)}
                <br>
                <small>
                    Quantité : ${item.quantity}
                </small>
            </span>

            <strong>
                ${item.price * item.quantity} DH
            </strong>
        `;

        container.appendChild(
            row
        );
    });

    const subtotal =
        getSubtotal();

    const delivery =
        getDelivery();

    const total =
        getTotal();

    subtotalElement.textContent =
        subtotal;

    deliveryElement.textContent =
        delivery === 0
            ? "Gratuite"
            : delivery + " DH";

    totalElement.textContent =
        total;
}


/*
========================================================
VÉRIFIER STOCK AVANT COMMANDE
========================================================
*/

function checkStockBeforeOrder() {

    for (
        const item of cart
    ) {

        const currentStock =
            getStockFromKey(
                item.stockKey
            );

        if (
            item.quantity >
            currentStock
        ) {

            return {

                valid: false,

                message:
                    `Stock insuffisant pour : ${item.name}. Il reste seulement ${currentStock} pièce(s).`
            };
        }
    }

    return {
        valid: true
    };
}


/*
========================================================
DIMINUER LE STOCK
========================================================
*/

function decreaseStockAfterOrder() {

    cart.forEach(item => {

        const parts =
            item.stockKey.split(":");

        const productNumber =
            Number(parts[0]);

        const color =
            parts[1];

        if (
            color &&
            inventory[productNumber] &&
            typeof inventory[productNumber] === "object"
        ) {

            inventory[productNumber][color] =
                Math.max(
                    0,
                    Number(
                        inventory[productNumber][color]
                    ) -
                    item.quantity
                );

        } else {

            inventory[productNumber] =
                Math.max(
                    0,
                    Number(
                        inventory[productNumber]
                    ) -
                    item.quantity
                );
        }
    });

    saveInventory();

    updateProductControls();
}


/*
========================================================
ENVOI DE LA COMMANDE
========================================================
*/

async function submitOrder(event) {

    event.preventDefault();

    if (cart.length === 0) {

        alert(
            "Votre panier est vide."
        );

        return;
    }


    /*
    ============================================
    VÉRIFICATION STOCK
    ============================================
    */

    const stockCheck =
        checkStockBeforeOrder();

    if (!stockCheck.valid) {

        alert(
            stockCheck.message
        );

        updateProductControls();

        return;
    }


    /*
    ============================================
    INFORMATIONS CLIENT
    ============================================
    */

    const fullName =
        document
            .getElementById("customer-name")
            .value
            .trim();

    const city =
        document
            .getElementById("customer-city")
            .value
            .trim();

    const address =
        document
            .getElementById("customer-address")
            .value
            .trim();

    const email =
        document
            .getElementById("customer-email")
            .value
            .trim();

    const phone =
        document
            .getElementById("customer-phone")
            .value
            .trim();


    /*
    ============================================
    CHAMPS OBLIGATOIRES
    ============================================
    */

    if (
        !fullName ||
        !city ||
        !address ||
        !phone
    ) {

        alert(
            "Veuillez remplir tous les champs obligatoires."
        );

        return;
    }


    /*
    ============================================
    PRODUITS DE LA COMMANDE
    ============================================
    */

    const orderItems =
        cart
            .map(item => {

                const productCard =
                    getProductCard(
                        item.productNumber
                    );

                const productImage =
                    productCard
                        ? productCard.querySelector("img")
                        : null;

                const imageUrl =
                    productImage
                        ? productImage.src
                        : "";

                return `
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin-bottom:15px;"
                    >

                        <tr>

                            <td
                                width="90"
                                valign="middle"
                                style="padding-right:15px;"
                            >

                                ${
                                    imageUrl
                                        ? `
                                        <img
                                            src="${imageUrl}"
                                            width="80"
                                            height="80"
                                            alt="${escapeHTML(item.name)}"
                                            style="
                                                display:block;
                                                width:80px;
                                                height:80px;
                                                object-fit:cover;
                                                border-radius:8px;
                                            "
                                        >
                                        `
                                        : ""
                                }

                            </td>

                            <td
                                valign="middle"
                                style="
                                    font-family:Arial, Helvetica, sans-serif;
                                    color:#222;
                                "
                            >

                                <div
                                    style="
                                        font-size:15px;
                                        font-weight:bold;
                                        margin-bottom:6px;
                                    "
                                >
                                    ${escapeHTML(item.name)}
                                </div>

                                <div
                                    style="
                                        font-size:14px;
                                        color:#666;
                                    "
                                >
                                    Quantité : ${item.quantity}
                                </div>

                                <div
                                    style="
                                        font-size:14px;
                                        color:#666;
                                        margin-top:3px;
                                    "
                                >
                                    Prix : ${item.price * item.quantity} DH
                                </div>

                            </td>

                        </tr>

                    </table>
                `;
            })
            .join("");


    /*
    ============================================
    CALCULS
    ============================================
    */

    const subtotal =
        getSubtotal();

    const delivery =
        getDelivery();

    const total =
        getTotal();


    /*
    ============================================
    BOUTON
    ============================================
    */

    const button =
        document.querySelector(
            ".confirm-order-btn"
        );

    if (button) {

        button.classList.add(
            "loading"
        );

        button.disabled = true;

        button.textContent =
            "Envoi de la commande...";
    }


    /*
    ============================================
    SUPABASE
    ============================================
    */

    if (
        typeof supabaseClient === "undefined"
    ) {

        if (button) {

            button.classList.remove(
                "loading"
            );

            button.disabled = false;

            button.textContent =
                "✓ Confirmer la commande";
        }

        alert(
            "La connexion à Supabase n'est pas configurée."
        );

        return;
    }


    try {

        /*
        ========================================
        DONNÉES COMMANDE
        ========================================
        */

        const orderData = {

            customer_name:
                fullName,

            customer_phone:
                phone,

            customer_email:
                email || null,

            customer_city:
                city,

            customer_address:
                address,

            order_items:
                orderItems,

            subtotal:
                subtotal,

            delivery:
                delivery,

            total:
                total,

            payment_method:
                "Paiement à la livraison",

            status:
                "new"
        };


        /*
        ========================================
        ENREGISTRER DANS SUPABASE
        ========================================
        */

        const { data: savedOrder, error: supabaseError } =
    await supabaseClient
        .from("orders")
        .insert([orderData])
        .select();

console.log("SUPABASE SAVED ORDER:", savedOrder);
console.log("SUPABASE ERROR:", supabaseError);

if (supabaseError) {

    console.error(
        "Supabase error:",
        supabaseError
    );

    throw new Error(
        "Impossible d'enregistrer la commande."
    );
}


        if (supabaseError) {

            console.error(
                "Supabase error:",
                supabaseError
            );

            throw new Error(
                "Impossible d'enregistrer la commande."
            );
        }


        /*
        ========================================
        VÉRIFICATION EMAILJS
        ========================================
        */

        if (
            typeof emailjs === "undefined" ||
            EMAILJS_PUBLIC_KEY === "TON_PUBLIC_KEY" ||
            EMAILJS_SERVICE_ID === "TON_SERVICE_ID" ||
            EMAILJS_TEMPLATE_ID === "TON_TEMPLATE_ID" ||
            EMAILJS_ADMIN_TEMPLATE_ID === "TON_ADMIN_TEMPLATE_ID"
        ) {

            throw new Error(
                "EmailJS n'est pas configuré."
            );
        }


        /*
        ========================================
        DONNÉES EMAIL
        ========================================
        */

        const emailData = {

            customer_name:
                fullName,

            customer_city:
                city,

            customer_address:
                address,

            customer_email:
                email,

            customer_phone:
                phone,

            order_items:
                orderItems,

            subtotal:
                subtotal + " DH",

            delivery:
                delivery === 0
                    ? "Gratuite"
                    : delivery + " DH",

            total:
                total + " DH",

            payment_method:
                "Paiement à la livraison"
        };


        /*
        ========================================
        EMAIL CLIENT
        ========================================
        */

        if (email) {

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                emailData
            );
        }


        /*
        ========================================
        EMAIL ADMIN
        ========================================
        */

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_ADMIN_TEMPLATE_ID,
            emailData
        );


        /*
        ========================================
        DIMINUER LE STOCK
        ========================================
        */

        decreaseStockAfterOrder();


        /*
        ========================================
        SUCCÈS
        ========================================
        */

        alert(
            "Merci " +
            fullName +
            " ! Votre commande a bien été envoyée. Nous allons vous contacter pour la confirmer."
        );


        /*
        ========================================
        RESET FORMULAIRE
        ========================================
        */

        const orderForm =
            document.getElementById(
                "order-form"
            );

        if (orderForm) {
            orderForm.reset();
        }


        /*
        ========================================
        VIDER PANIER
        ========================================
        */

        cart = [];

        updateCart();

        closeCheckout();


    } catch (error) {

        console.error(
            "Order error:",
            error
        );

        alert(
            "Une erreur est survenue pendant l'envoi de la commande. Vérifiez la connexion à Supabase et la configuration EmailJS."
        );

    } finally {

        if (button) {

            button.classList.remove(
                "loading"
            );

            button.disabled = false;

            button.textContent =
                "✓ Confirmer la commande";
        }
    }
}


/*
========================================================
PROTECTION TEXTE
========================================================
*/

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}


/*
========================================================
FERMETURE PANIER
========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        createQuantityControls();

        updateCart();

        updateProduct1Price();

        updateProduct4Price();

        updateProductControls();

        const cartOverlay =
            document.getElementById(
                "cart-overlay"
            );

        if (cartOverlay) {

            cartOverlay.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target === this
                    ) {

                        closeCart();
                    }
                }
            );
        }

    }
);