// js/app.js
document.addEventListener('DOMContentLoaded', function () { if (window.lucide) lucide.replace(); });

// Data produk dan path gambar lokal
const products = [
    { id: 1, name: "Gayo Arabica", price: 28000, category: "Manual Brew", image: "images/product1.jpg", desc: "Kopi Aceh Gayo dengan notes fruity dan acidity seimbang." },
    { id: 2, name: "Caramel Latte", price: 32000, category: "Espresso Base", image: "images/product2.jpg", desc: "Espresso, susu segar, dan saus karamel homemade." },
    { id: 3, name: "Iced Palm Sugar", price: 25000, category: "Signature", image: "images/product3.jpg", desc: "Kopi susu kekinian dengan gula aren asli yang legit." },
    { id: 4, name: "Matcha Latte", price: 30000, category: "Non-Coffee", image: "images/product4.jpg", desc: "Pure matcha Jepang dipadu dengan susu creamy." },
    { id: 5, name: "Butter Croissant", price: 22000, category: "Pastry", image: "images/product5.jpg", desc: "Renya, bermentega, dan dipanggang fresh setiap pagi." },
    { id: 6, name: "Choco Muffin", price: 20000, category: "Pastry", image: "images/product6.jpg", desc: "Muffin cokelat lumer yang sempurna untuk teman ngopi." }
];

// State aplikasi
let activePage = 'home';
let cart = [];

// Elemen DOM utama
const pages = {
    home: document.getElementById('page-home'),
    history: document.getElementById('page-history'),
    about: document.getElementById('page-about'),
    products: document.getElementById('page-products'),
    feedback: document.getElementById('page-feedback')
};

const productsGrid = document.getElementById('products-grid');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartFooter = document.getElementById('cart-footer');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const feedbackForm = document.getElementById('feedback-form');

// Navigasi halaman
function showPage(pageId) {
    activePage = pageId;
    Object.keys(pages).forEach(k => pages[k].classList.toggle('hidden', k !== pageId));
    document.getElementById('mobile-menu').classList.add('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('text-[#D4A373]', btn.dataset.page === pageId));
}

// Render produk ke grid
function renderProducts() {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-[#FAF7F2] rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300 flex flex-col';
        card.innerHTML = `
            <div class="relative h-64 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#2C1810] uppercase tracking-wide">${product.category}</div>
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-bold text-[#2C1810] font-serif">${product.name}</h3>
                    <span class="text-[#D4A373] font-bold text-lg">Rp ${Math.round(product.price/1000)}k</span>
                </div>
                <p class="text-gray-500 text-sm mb-6 flex-1">${product.desc}</p>
                <button data-id="${product.id}" class="add-to-cart w-full bg-[#2C1810] text-[#F5E6D3] py-3 rounded-lg font-bold hover:bg-[#D4A373] hover:text-[#2C1810] transition flex justify-center items-center gap-2">
                    <i data-lucide="shopping-bag"></i> Tambah ke Keranjang
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
    if (window.lucide) lucide.replace();
}

// Update jumlah di ikon keranjang (Navbar & Menu Page)
function updateCartCount() {
    const totalQty = cart.reduce((s, it) => s + it.quantity, 0);
    
    // Update badge navbar
    if (totalQty > 0) {
        cartCountEl.textContent = totalQty;
        cartCountEl.classList.remove('hidden');
    } else {
        cartCountEl.classList.add('hidden');
    }

    // Update badge di halaman menu (produk)
    const pageCartCount = document.getElementById('page-cart-count');
    if (pageCartCount) {
        if (totalQty > 0) {
            pageCartCount.textContent = totalQty;
            pageCartCount.classList.remove('hidden');
        } else {
            pageCartCount.classList.add('hidden');
        }
    }
}

// Buka / tutup keranjang
function openCart() {
    cartModal.classList.remove('hidden');
    renderCart();
}
function closeCart() {
    cartModal.classList.add('hidden');
}

// Tambah, ubah qty, hapus item
function addToCart(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ ...prod, quantity: 1 });
    updateCartCount();
    openCart();
}

function updateQty(id, delta) {
    cart = cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
    renderCart();
    updateCartCount();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
    updateCartCount();
}

// Render isi keranjang
function renderCart() {
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <i data-lucide="shopping-bag" style="width:64px;height:64px;opacity:.3"></i>
                <p>Keranjang masih kosong.</p>
                <button id="see-menu" class="text-[#2C1810] font-bold underline">Lihat Menu</button>
            </div>
        `;
        cartFooter.classList.add('hidden');
        if (window.lucide) lucide.replace();
        document.getElementById('see-menu')?.addEventListener('click', () => {
            closeCart();
            showPage('products');
        });
        return;
    }

    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-4';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md" />
            <div class="flex-1">
                <h4 class="font-bold text-[#2C1810]">${item.name}</h4>
                <p class="text-[#D4A373] text-sm font-semibold">Rp ${item.price.toLocaleString('id-ID')}</p>
                <div class="flex items-center gap-3 mt-2">
                    <button data-action="dec" data-id="${item.id}" class="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"><i data-lucide="minus" style="width:14px;height:14px"></i></button>
                    <span class="text-sm font-bold">${item.quantity}</span>
                    <button data-action="inc" data-id="${item.id}" class="w-6 h-6 bg-[#2C1810] text-white rounded flex items-center justify-center hover:bg-[#4a2c20]"><i data-lucide="plus" style="width:14px;height:14px"></i></button>
                </div>
            </div>
            <button data-action="remove" data-id="${item.id}" class="text-gray-400 hover:text-red-500 self-start"><i data-lucide="trash-2"></i></button>
        `;
        cartItemsEl.appendChild(itemEl);
    });

    const totalPrice = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
    cartTotalEl.textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
    cartFooter.classList.remove('hidden');
    if (window.lucide) lucide.replace();

    cartItemsEl.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const id = parseInt(btn.getAttribute('data-id'), 10);
            if (action === 'dec') updateQty(id, -1);
            if (action === 'inc') updateQty(id, 1);
            if (action === 'remove') removeItem(id);
        });
    });
}

// Event bindings
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));
document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));

document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
    const icon = document.getElementById('mobile-menu-toggle').querySelector('i');
    if (icon) {
        icon.setAttribute('data-lucide', mobileMenu.classList.contains('hidden') ? 'menu' : 'x');
        if (window.lucide) lucide.replace();
    }
});

document.getElementById('order-now').addEventListener('click', () => showPage('products'));
document.getElementById('brand').addEventListener('click', () => showPage('home'));
document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) addToCart(parseInt(addBtn.getAttribute('data-id'), 10));
});

// Listener Cart
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

// Listener Tombol Cart di Halaman Menu (Baru)
document.getElementById('page-cart-btn')?.addEventListener('click', openCart);

(function () {
    const floatingCart = cartBtn.cloneNode(true);
    floatingCart.id = "floating-cart-btn";
    floatingCart.style.position = "fixed";
    floatingCart.style.top = "16px";
    floatingCart.style.right = "16px";
    floatingCart.style.zIndex = "9999";
    floatingCart.style.display = "none";
    document.body.appendChild(floatingCart);

    floatingCart.addEventListener("click", openCart);

    function updateFloatingCart(pageId) {
        floatingCart.style.display = pageId === "products" ? "flex" : "none";
        if (window.lucide) lucide.replace();
    }

    // Update tiap nav ditekan
    document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => updateFloatingCart(btn.dataset.page));
    });
    

    // Sync perubahan manual pada activePage
    setInterval(() => updateFloatingCart(activePage), 250);

    // Set awal
    updateFloatingCart(activePage);
})();


// Checkout Logic (DIUBAH: Bukan WA, tapi notifikasi biasa & clear cart)
checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    const totalPrice = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
    
    // Notifikasi berhasil
    alert(`Checkout Berhasil!\nTotal Pembayaran: Rp ${totalPrice.toLocaleString('id-ID')}\nTerima kasih telah berbelanja di Senja Coffee.`);
    
    // Kosongkan keranjang
    cart = [];
    renderCart();
    updateCartCount();
    closeCart();
});

feedbackForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Terima kasih atas masukan Anda!');
    feedbackForm.reset();
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const brandText = document.getElementById('brand-text');
    if (window.scrollY > 50) {
        navbar.classList.add('bg-[#2C1810]', 'shadow-lg', 'py-3');
        navbar.classList.remove('bg-transparent', 'py-6');
        brandText.classList.remove('text-white');
        brandText.classList.add('text-[#F5E6D3]');
    } else {
        navbar.classList.remove('bg-[#2C1810]', 'shadow-lg', 'py-3');
        navbar.classList.add('bg-transparent', 'py-6');
        brandText.classList.remove('text-[#F5E6D3]');
        brandText.classList.add('text-white');
    }
});

// Inisialisasi awal
renderProducts();
updateCartCount();
showPage('home');

// Pastikan ikon Lucide tetap ter-render saat DOM berubah
const observer = new MutationObserver(() => {
    if (window.lucide) lucide.replace();
});
observer.observe(document.body, { childList: true, subtree: true });