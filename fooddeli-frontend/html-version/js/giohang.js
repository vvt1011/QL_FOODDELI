const API_BASE_URL = "https://localhost:7135/api";

// =========================
// DOM
// =========================

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");
const cartContent = document.getElementById("cartContent");

const errorMessage = document.getElementById("errorMessage");

const cartItems = document.getElementById("cartItems");
const cartCountText = document.getElementById("cartCountText");

const subtotalElement = document.getElementById("subtotal");
const shippingFeeElement = document.getElementById("shippingFee");
const totalPriceElement = document.getElementById("totalPrice");

const clearCartBtn = document.getElementById("clearCartBtn");
const retryBtn = document.getElementById("retryBtn");

const backStoreBtn = document.getElementById("backStoreBtn");
const errorBackBtn = document.getElementById("errorBackBtn");
const shoppingBtn = document.getElementById("shoppingBtn");
const continueShoppingBtn =
    document.getElementById("continueShoppingBtn");

const checkoutBtn = document.getElementById("checkoutBtn");


// =========================
// TOKEN
// =========================

function getToken() {
    return localStorage.getItem("token");
}


// =========================
// FORMAT GIÁ
// =========================

function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0đ";
    }

    return number.toLocaleString("vi-VN") + "đ";
}


// =========================
// LẤY GIÁ TRỊ LINH HOẠT
// =========================

function getValue(obj, ...keys) {
    if (!obj) {
        return "";
    }

    for (const key of keys) {
        if (
            obj[key] !== undefined &&
            obj[key] !== null
        ) {
            return obj[key];
        }
    }

    return "";
}


// =========================
// TÌM DANH SÁCH CHI TIẾT
// =========================

function extractItems(data) {

    if (Array.isArray(data)) {
        return data;
    }

    const possibleKeys = [
        "chiTietGioHangs",
        "ChiTietGioHangs",
        "chiTietGioHang",
        "ChiTietGioHang",
        "items",
        "Items",
        "cartItems",
        "CartItems",
        "danhSachMon",
        "DanhSachMon"
    ];

    for (const key of possibleKeys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
}


// =========================
// TRẠNG THÁI GIAO DIỆN
// =========================

function showLoading() {

    loadingState.hidden = false;
    errorState.hidden = true;
    emptyState.hidden = true;
    cartContent.hidden = true;

}

function showError(message) {

    loadingState.hidden = true;
    errorState.hidden = false;
    emptyState.hidden = true;
    cartContent.hidden = true;

    errorMessage.textContent = message;

}

function showEmpty() {

    loadingState.hidden = true;
    errorState.hidden = true;
    emptyState.hidden = false;
    cartContent.hidden = true;

}

function showCart() {

    loadingState.hidden = true;
    errorState.hidden = true;
    emptyState.hidden = true;
    cartContent.hidden = false;

}


// =========================
// FETCH API
// =========================

async function apiRequest(
    url,
    options = {}
) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
    }

    let data = null;

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {

        let message =
            `API trả về lỗi HTTP ${response.status}`;

        if (data?.message) {
            message = data.message;
        } else if (typeof data === "string" && data.trim()) {
            message = data;
        }

        throw new Error(message);
    }

    return data;
}


// =========================
// LOAD GIỎ HÀNG
// =========================

let currentCartItems = [];


async function loadCart() {

    if (!getToken()) {

        showError(
            "Bạn cần đăng nhập để xem giỏ hàng."
        );

        return;
    }

    showLoading();

    try {

        const data = await apiRequest(
            `${API_BASE_URL}/GioHang`
        );

        console.log(
            "Dữ liệu giỏ hàng:",
            data
        );

        currentCartItems = extractItems(data);

        renderCart();

    } catch (error) {

        console.error(
            "Lỗi tải giỏ hàng:",
            error
        );

        showError(
            error.message ||
            "Không thể tải giỏ hàng."
        );
    }
}


// =========================
// RENDER GIỎ HÀNG
// =========================

function renderCart() {

    const items = currentCartItems;

    cartItems.innerHTML = "";

    // Không có món
    if (items.length === 0) {

        cartCountText.textContent =
            "Chưa có sản phẩm nào";

        clearCartBtn.hidden = true;

        subtotalElement.textContent = "0đ";
        shippingFeeElement.textContent = "0đ";
        totalPriceElement.textContent = "0đ";

        showEmpty();

        return;
    }

    // Có món
    showCart();

    clearCartBtn.hidden = false;

    let subtotal = 0;
    let totalQuantity = 0;

    items.forEach(item => {

        const maChiTiet =
            getValue(
                item,
                "maChiTietGioHang",
                "MaChiTietGioHang"
            );

        const maMonAn =
            getValue(
                item,
                "maMonAn",
                "MaMonAn"
            );

        const tenMonAn =
            getValue(
                item,
                "tenMonAn",
                "TenMonAn"
            ) ||
            getValue(
                item?.monAn,
                "tenMonAn",
                "TenMonAn"
            ) ||
            "Món ăn";

        const anhMonAn =
            getValue(
                item,
                "anhMonAn",
                "AnhMonAn"
            ) ||
            getValue(
                item?.monAn,
                "anhMonAn",
                "AnhMonAn"
            );

        const soLuong =
            Number(
                getValue(
                    item,
                    "soLuong",
                    "SoLuong"
                )
            ) || 1;

        const gia =
            Number(
                getValue(
                    item,
                    "gia",
                    "Gia"
                )
            ) || 0;

        const thanhTien =
            gia * soLuong;

        subtotal += thanhTien;
        totalQuantity += soLuong;


        // =========================
        // CARD
        // =========================

        const card =
            document.createElement("article");

        card.className = "cart-item";

        card.innerHTML = `
            <div class="cart-item-image">

                <img
                    src="${escapeHtml(
                        anhMonAn ||
                        "https://via.placeholder.com/300x300?text=Food"
                    )}"
                    alt="${escapeHtml(tenMonAn)}"
                >

            </div>


            <div class="cart-item-info">

                <h3>
                    ${escapeHtml(tenMonAn)}
                </h3>

                <p>
                    Mã món:
                    ${escapeHtml(String(maMonAn || "—"))}
                </p>

                <div class="cart-item-price">
                    ${formatPrice(gia)}
                </div>

            </div>


            <div class="cart-quantity">

                <button
                    type="button"
                    class="quantity-minus"
                    data-id="${escapeHtml(String(maChiTiet))}"
                    data-quantity="${soLuong}"
                >
                    −
                </button>

                <span>
                    ${soLuong}
                </span>

                <button
                    type="button"
                    class="quantity-plus"
                    data-id="${escapeHtml(String(maChiTiet))}"
                    data-quantity="${soLuong}"
                >
                    +
                </button>

            </div>


            <div class="cart-item-total">

                ${formatPrice(thanhTien)}

            </div>


            <button
                type="button"
                class="cart-remove"
                data-id="${escapeHtml(String(maChiTiet))}"
                title="Xóa món"
            >
                Xóa
            </button>
        `;


        // fallback ảnh
        const image =
            card.querySelector("img");

        image.addEventListener(
            "error",
            function () {

                this.src =
                    "https://via.placeholder.com/300x300?text=Food";

            }
        );


        // Giảm
        const minusBtn =
            card.querySelector(".quantity-minus");

        minusBtn.addEventListener(
            "click",
            async function () {

                const id =
                    this.dataset.id;

                const quantity =
                    Number(this.dataset.quantity);

                if (
                    !id ||
                    quantity <= 1
                ) {
                    return;
                }

                await updateQuantity(
                    id,
                    quantity - 1
                );
            }
        );


        // Tăng
        const plusBtn =
            card.querySelector(".quantity-plus");

        plusBtn.addEventListener(
            "click",
            async function () {

                const id =
                    this.dataset.id;

                const quantity =
                    Number(this.dataset.quantity);

                if (!id) {
                    return;
                }

                await updateQuantity(
                    id,
                    quantity + 1
                );
            }
        );


        // Xóa
        const removeBtn =
            card.querySelector(".cart-remove");

        removeBtn.addEventListener(
            "click",
            async function () {

                const id =
                    this.dataset.id;

                if (!id) {
                    return;
                }

                await removeItem(id);
            }
        );


        cartItems.appendChild(card);

    });


    cartCountText.textContent =
        `${totalQuantity} sản phẩm`;

    subtotalElement.textContent =
        formatPrice(subtotal);

    // Tạm thời chưa có API tính phí giao hàng
    const shippingFee = 0;

    shippingFeeElement.textContent =
        formatPrice(shippingFee);

    totalPriceElement.textContent =
        formatPrice(
            subtotal + shippingFee
        );
}


// =========================
// CẬP NHẬT SỐ LƯỢNG
// =========================

async function updateQuantity(
    maChiTietGioHang,
    soLuong
) {

    if (soLuong <= 0) {
        return;
    }

    try {

        await apiRequest(
            `${API_BASE_URL}/GioHang/cap-nhat-so-luong`,
            {
                method: "PUT",

                body: JSON.stringify({
                    MaChiTietGioHang:
                        maChiTietGioHang,

                    SoLuong:
                        soLuong
                })
            }
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Lỗi cập nhật số lượng:",
            error
        );

        alert(
            error.message ||
            "Không thể cập nhật số lượng."
        );
    }
}


// =========================
// XÓA MỘT MÓN
// =========================

async function removeItem(
    maChiTietGioHang
) {

    const confirmDelete =
        confirm(
            "Bạn có chắc muốn xóa món này khỏi giỏ hàng?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        await apiRequest(
            `${API_BASE_URL}/GioHang/xoa-mon/${encodeURIComponent(maChiTietGioHang)}`,
            {
                method: "DELETE"
            }
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Lỗi xóa món:",
            error
        );

        alert(
            error.message ||
            "Không thể xóa món."
        );
    }
}


// =========================
// XÓA TOÀN BỘ
// =========================

async function clearCart() {

    if (currentCartItems.length === 0) {
        return;
    }

    const confirmClear =
        confirm(
            "Bạn có chắc muốn xóa toàn bộ giỏ hàng?"
        );

    if (!confirmClear) {
        return;
    }

    try {

        await apiRequest(
            `${API_BASE_URL}/GioHang/xoa-het`,
            {
                method: "DELETE"
            }
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Lỗi xóa giỏ hàng:",
            error
        );

        alert(
            error.message ||
            "Không thể xóa giỏ hàng."
        );
    }
}


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =========================
// ĐIỀU HƯỚNG
// =========================

function goToStores() {

    window.location.href =
        "cua-hang.html";
}


// =========================
// SỰ KIỆN
// =========================

backStoreBtn?.addEventListener(
    "click",
    goToStores
);

errorBackBtn?.addEventListener(
    "click",
    goToStores
);

shoppingBtn?.addEventListener(
    "click",
    goToStores
);

continueShoppingBtn?.addEventListener(
    "click",
    goToStores
);

retryBtn?.addEventListener(
    "click",
    loadCart
);

clearCartBtn?.addEventListener(
    "click",
    clearCart
);


// =========================
// THANH TOÁN
// =========================

checkoutBtn?.addEventListener(
    "click",
    function () {

        if (
            currentCartItems.length === 0
        ) {
            alert(
                "Giỏ hàng đang trống."
            );

            return;
        }

        // Chưa chuyển trang checkout ở bước này
        alert(
            "Giỏ hàng đã sẵn sàng. Phần thanh toán sẽ được nối ở bước tiếp theo."
        );
    }
);


// =========================
// KHỞI CHẠY
// =========================

loadCart();