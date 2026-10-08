
// ======================================================
// FOODDELI - THANH TOAN
// Luong:
// Gio hang -> Thanh toan -> Tao DonHang
//                         -> COD: hoan tat
//                         -> MoMo: tao thanh toan -> payUrl
// ======================================================

// API BACKEND
const THANHTOAN_API = "https://localhost:7135/api";

let checkoutItems = [];
let addresses = [];
let selectedAddressId = null;
let submitting = false;
let appliedVoucher = null;
let toastTimer = null;


// ======================================================
// KHOI TAO
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    const token = getToken();

    // Chua dang nhap
    if (!token) {
        window.location.href =
            `dang-nhap.html?redirect=${encodeURIComponent("thanh-toan.html")}`;
        return;
    }

    bindEvents();

    try {

        loadCheckoutItems();

        renderCheckoutItems();

        await loadAddresses();

        calculateSummary();

    } catch (error) {

        console.error(
            "Loi khoi tao trang thanh toan:",
            error
        );

        showMessage(
            error.message ||
            "Khong the tai trang thanh toan."
        );
    }
});


// ======================================================
// EVENT
// ======================================================

function bindEvents() {

    // Them dia chi
    document
        .getElementById("btnAddAddress")
        ?.addEventListener(
            "click",
            openAddressModal
        );

    // Dong modal
    document
        .getElementById("btnCloseAddressModal")
        ?.addEventListener(
            "click",
            closeAddressModal
        );

    document
        .getElementById("btnCancelAddress")
        ?.addEventListener(
            "click",
            closeAddressModal
        );

    // Luu dia chi
    document
        .getElementById("addressForm")
        ?.addEventListener(
            "submit",
            saveAddress
        );

    // Ap dung voucher
    document
        .getElementById("btnApplyVoucher")
        ?.addEventListener(
            "click",
            applyVoucher
        );

    // Dat hang
    document
        .getElementById("btnPlaceOrder")
        ?.addEventListener(
            "click",
            createOrder
        );

    // Thay doi phuong thuc thanh toan
    document
        .querySelectorAll(
            'input[name="paymentMethod"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                updatePaymentUI
            );

        });

    updatePaymentUI();
}


// ======================================================
// TOKEN + API
// ======================================================

function getToken() {

    return localStorage.getItem("token");
}


async function apiRequest(url, options = {}) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    console.log(
        "API REQUEST:",
        options.method || "GET",
        url
    );

    const response = await fetch(
        url,
        {
            ...options,
            headers
        }
    );

    console.log(
        "API RESPONSE:",
        response.status,
        url
    );

    // Het phien dang nhap
    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            `dang-nhap.html?redirect=${encodeURIComponent("thanh-toan.html")}`;

        throw new Error(
            "Phien dang nhap da het han."
        );
    }

    let data = null;

    try {

        data = await response.json();

    } catch {

        try {

            data = await response.text();

        } catch {

            data = null;
        }
    }

    if (!response.ok) {

        const message =
            data?.message ||
            data?.Message ||
            data?.error ||
            data?.Error ||
            `Yeu cau that bai (${response.status}).`;

        throw new Error(message);
    }

    return data;
}


// ======================================================
// LAY SAN PHAM TU GIO HANG
// ======================================================

function loadCheckoutItems() {

    // Kiểm tra dữ liệu được truyền từ giohang.html
    const raw = sessionStorage.getItem(
        "foodDeliCheckoutItems"
    );

    console.log(
        "=== KIEM TRA CHECKOUT ==="
    );

    console.log(
        "foodDeliCheckoutItems:",
        raw
    );

    // Không có dữ liệu
    if (!raw) {

        console.error(
            "KHONG CO foodDeliCheckoutItems trong sessionStorage"
        );

        window.location.href =
            "giohang.html";

        return;
    }

    try {

        checkoutItems =
            JSON.parse(raw);

        console.log(
            "checkoutItems sau JSON.parse:",
            checkoutItems
        );

    } catch (error) {

        console.error(
            "Loi doc checkoutItems:",
            error
        );

        sessionStorage.removeItem(
            "foodDeliCheckoutItems"
        );

        window.location.href =
            "giohang.html";

        return;
    }

    // Kiểm tra mảng
    if (
        !Array.isArray(checkoutItems) ||
        checkoutItems.length === 0
    ) {

        console.error(
            "checkoutItems khong phai mang hoac dang rong:",
            checkoutItems
        );

        sessionStorage.removeItem(
            "foodDeliCheckoutItems"
        );

        window.location.href =
            "giohang.html";

        return;
    }

    console.log(
        "SO MON CHUYEN SANG THANH TOAN:",
        checkoutItems.length
    );
}


// ======================================================
// HIEN THI SAN PHAM
// ======================================================

function renderCheckoutItems() {

    const container =
        document.getElementById(
            "checkoutItems"
        );

    if (!container) return;

    if (!checkoutItems.length) {

        container.innerHTML = `
            <div class="checkout-empty">
                Gio hang dang trong.
            </div>
        `;

        return;
    }

    container.innerHTML =
        checkoutItems.map(item => {

            const maMonAn =
                item.MaMonAn ??
                item.maMonAn ??
                "";

            const tenMonAn =
                item.TenMonAn ??
                item.tenMonAn ??
                "Mon an";

            const soLuong =
                Math.max(
                    1,
                    Number(
                        item.SoLuong ??
                        item.soLuong
                    ) || 1
                );

            const gia =
                Number(
                    item.Gia ??
                    item.gia ??
                    item.DonGia ??
                    item.donGia
                ) || 0;

            const thanhTien =
                gia * soLuong;

            return `
                <div class="checkout-item">

                    <div class="checkout-item-info">

                        <div class="checkout-item-name">
                            ${escapeHtml(tenMonAn)}
                        </div>

                        <div class="checkout-item-meta">
                            Ma mon: ${escapeHtml(maMonAn)}
                            · SL: ${soLuong}
                        </div>

                    </div>

                    <div class="checkout-item-price">
                        ${formatMoney(thanhTien)}
                    </div>

                </div>
            `;

        }).join("");
}


// ======================================================
// DIA CHI
// ======================================================

async function loadAddresses() {

    const container =
        document.getElementById(
            "addressList"
        );

    if (container) {

        container.innerHTML = `
            <div class="loading-address">
                Dang tai dia chi...
            </div>
        `;
    }

    console.log(
        "=== BAT DAU LOAD DIA CHI ==="
    );

    const data =
    await apiRequest(
        `${THANHTOAN_API}/DiaChi/cua-toi`
    );

    console.log(
        "DU LIEU DIA CHI TU API:",
        data
    );

    addresses =
        normalizeList(data);

    console.log(
        "DANH SACH DIA CHI SAU NORMALIZE:",
        addresses
    );

    renderAddresses();
}


function normalizeList(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.Data)) {
        return data.Data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.Items)) {
        return data.Items;
    }

    if (Array.isArray(data?.danhSachDiaChi)) {
        return data.danhSachDiaChi;
    }

    if (Array.isArray(data?.DanhSachDiaChi)) {
        return data.DanhSachDiaChi;
    }

    if (Array.isArray(data?.diaChis)) {
        return data.diaChis;
    }

    if (Array.isArray(data?.DiaChis)) {
        return data.DiaChis;
    }

    return [];
}


function renderAddresses() {

    const container =
        document.getElementById(
            "addressList"
        );

    if (!container) return;

    if (!addresses.length) {

        selectedAddressId = null;

        container.innerHTML = `
            <div class="empty-address">
                <p>Ban chua co dia chi giao hang.</p>
                <p>Hay them mot dia chi de tiep tuc.</p>
            </div>
        `;

        return;
    }

    // Tim dia chi mac dinh
    const defaultAddress =
        addresses.find(address => {

            return Boolean(
                address.MacDinh ??
                address.macDinh ??
                address.IsDefault ??
                address.isDefault ??
                address.isMacDinh
            );

        });

    const firstAddress =
        defaultAddress ||
        addresses[0];

    selectedAddressId =
        String(
            firstAddress.MaDiaChi ??
            firstAddress.maDiaChi ??
            firstAddress.Id ??
            firstAddress.id ??
            ""
        );

    container.innerHTML =
        addresses.map(address => {

            const id =
                String(
                    address.MaDiaChi ??
                    address.maDiaChi ??
                    address.Id ??
                    address.id ??
                    ""
                );

            const tenNguoiNhan =
                address.NguoiNhan ??
                address.nguoiNhan ??
                address.TenNguoiNhan ??
                address.tenNguoiNhan ??
                address.HoTen ??
                address.hoTen ??
                "Nguoi nhan";

            const soDienThoai =
                address.SoDienThoai ??
                address.soDienThoai ??
                address.SDT ??
                address.sdt ??
                address.Phone ??
                address.phone ??
                "";

            const diaChiChiTiet =
                address.DiaChiChiTiet ??
                address.diaChiChiTiet ??
                address.DiaChi ??
                address.diaChi ??
                "";

            const phuongXa =
                address.PhuongXa ??
                address.phuongXa ??
                "";

            const quanHuyen =
                address.QuanHuyen ??
                address.quanHuyen ??
                "";

            const tinhThanh =
                address.TinhThanh ??
                address.tinhThanh ??
                "";

            const diaChi = [
                diaChiChiTiet,
                phuongXa,
                quanHuyen,
                tinhThanh
            ]
                .filter(Boolean)
                .join(", ");

            const checked =
                id === selectedAddressId;

            return `
                <label
                    class="address-option ${checked ? "selected" : ""}"
                >

                    <input
                        type="radio"
                        name="shippingAddress"
                        value="${escapeAttribute(id)}"
                        ${checked ? "checked" : ""}
                    >

                    <div class="address-option-content">

                        <div class="address-name">
                            ${escapeHtml(tenNguoiNhan)}
                        </div>

                        <div class="address-phone">
                            ${escapeHtml(soDienThoai)}
                        </div>

                        <div class="address-detail">
                            ${escapeHtml(
                                diaChi ||
                                "Chua co thong tin dia chi"
                            )}
                        </div>

                    </div>

                </label>
            `;

        }).join("");

    // Chon dia chi
    container
        .querySelectorAll(
            'input[name="shippingAddress"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    selectedAddressId =
                        input.value;

                    container
                        .querySelectorAll(
                            ".address-option"
                        )
                        .forEach(item => {

                            item.classList.remove(
                                "selected"
                            );

                        });

                    input
                        .closest(
                            ".address-option"
                        )
                        ?.classList.add(
                            "selected"
                        );
                }
            );

        });
}




// ======================================================
// MODAL DIA CHI
// ======================================================

function openAddressModal() {

    const modal =
        document.getElementById(
            "addressModal"
        );

    if (!modal) return;

    // HTML đang dùng style="display: none;"
    modal.style.display = "flex";

    document
        .getElementById("addressName")
        ?.focus();
}


function closeAddressModal() {

    const modal =
        document.getElementById(
            "addressModal"
        );

    if (!modal) return;

    // Ẩn lại modal
    modal.style.display = "none";

    const form =
        document.getElementById(
            "addressForm"
        );

    form?.reset();

    const message =
        document.getElementById(
            "addressFormMessage"
        );

    if (message) {
        message.textContent = "";
    }
}


// ======================================================
// THEM DIA CHI
// ======================================================

async function saveAddress(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("addressName")
            ?.value
            .trim();

    const phone =
        document
            .getElementById("addressPhone")
            ?.value
            .trim();

    const detail =
        document
            .getElementById("addressDetail")
            ?.value
            .trim();

    const isDefault =
        document
            .getElementById("addressDefault")
            ?.checked ||
        false;

    const message =
        document.getElementById(
            "addressFormMessage"
        );

    if (!name || !phone || !detail) {

        if (message) {

            message.textContent =
                "Vui long nhap day du nguoi nhan, so dien thoai va dia chi.";
        }

        return;
    }

    // Tao ma dia chi
    const maDiaChi =
        "DC" +
        Date.now()
            .toString(36)
            .toUpperCase();

    const payload = {

        MaDiaChi:
            maDiaChi,

        NguoiNhan:
            name,

        SoDienThoai:
            phone,

        DiaChiChiTiet:
            detail,

        PhuongXa:
            "",

        QuanHuyen:
            "",

        TinhThanh:
            "",

        MacDinh:
            isDefault
    };

    try {

        const button =
            document.getElementById(
                "btnCancelAddress"
            );

        if (button) {
            button.disabled = true;
        }

        await apiRequest(
            `${THANHTOAN_API}/DiaChi`,
            {
                method: "POST",
                body: JSON.stringify(payload)
            }
        );

        closeAddressModal();

        await loadAddresses();

        selectedAddressId =
            maDiaChi;

        // Neu backend tra ve ma khac thi tim lai
        const savedAddress =
            addresses.find(address =>
                String(
                    address.MaDiaChi ??
                    address.maDiaChi ??
                    address.Id ??
                    address.id ??
                    ""
                ) === maDiaChi
            );

        if (savedAddress) {

            selectedAddressId =
                String(
                    savedAddress.MaDiaChi ??
                    savedAddress.maDiaChi ??
                    savedAddress.Id ??
                    savedAddress.id ??
                    maDiaChi
                );
        }

        renderAddresses();

        showMessage(
            "Da them dia chi giao hang."
        );

    } catch (error) {

        console.error(
            "Loi them dia chi:",
            error
        );

        if (message) {

            message.textContent =
                error.message ||
                "Khong the them dia chi.";
        }

    } finally {

        const button =
            document.getElementById(
                "btnCancelAddress"
            );

        if (button) {
            button.disabled = false;
        }
    }
}


// ======================================================
// TINH TIEN
// ======================================================

function calculateSubtotal() {

    return checkoutItems.reduce(
        (total, item) => {

            const quantity =
                Math.max(
                    1,
                    Number(
                        item.SoLuong ??
                        item.soLuong
                    ) || 1
                );

            const price =
                Number(
                    item.Gia ??
                    item.gia ??
                    item.DonGia ??
                    item.donGia
                ) || 0;

            return total +
                price *
                quantity;

        },
        0
    );
}


function calculateShippingFee() {

    // Hien tai de 0 de dong bo voi backend.
    // Sau nay co the thay bang API tinh phi giao hang.
    return 0;
}


function calculateDiscount() {

    if (!appliedVoucher) {
        return 0;
    }

    return Number(
        appliedVoucher.SoTienGiam ||
        appliedVoucher.soTienGiam ||
        0
    );
}


function calculateTotal() {

    const subtotal =
        calculateSubtotal();

    const shipping =
        calculateShippingFee();

    const discount =
        calculateDiscount();

    return Math.max(
        0,
        subtotal +
        shipping -
        discount
    );
}


function calculateSummary() {

    const subtotal =
        calculateSubtotal();

    const shipping =
        calculateShippingFee();

    const discount =
        calculateDiscount();

    const total =
        Math.max(
            0,
            subtotal +
            shipping -
            discount
        );

    setText(
        "subtotal",
        formatMoney(subtotal)
    );

    setText(
        "shippingFee",
        formatMoney(shipping)
    );

    setText(
        "discountAmount",
        formatMoney(discount)
    );

    setText(
        "totalAmount",
        formatMoney(total)
    );

    const discountRow =
        document.getElementById(
            "discountRow"
        );

    if (discountRow) {

        discountRow.hidden =
            discount <= 0;
    }
}


// ======================================================
// VOUCHER
// ======================================================

async function applyVoucher() {

    const input =
        document.getElementById("voucherCode");

    const message =
        document.getElementById("voucherMessage");

    if (!input) return;

    const code =
        input.value.trim();

    if (!code) {

        if (message) {
            message.textContent =
                "Vui long nhap ma voucher.";
        }

        return;
    }

    try {

        if (message) {
            message.textContent =
                "Dang kiem tra voucher...";
        }

        // Tong tien don hang truoc khi giam
        const tongTienDonHang =
            calculateSubtotal();

        const payload = {

            MaVoucher:
                code,

            TongTienDonHang:
                tongTienDonHang
        };

        console.log(
            "REQUEST KIEM TRA VOUCHER:",
            payload
        );

        const result =
            await apiRequest(
                `${THANHTOAN_API}/Voucher/kiem-tra`,
                {
                    method: "POST",
                    body: JSON.stringify(payload)
                }
            );

        console.log(
            "KET QUA KIEM TRA VOUCHER:",
            result
        );

        // Backend tra ve:
        // HopLe
        // ThongBao
        // SoTienGiam

        if (!result?.HopLe) {

            appliedVoucher = null;

            if (message) {
                message.textContent =
                    result?.ThongBao ||
                    "Voucher khong hop le.";
            }

            calculateSummary();

            return;
        }

        // Luu ket qua voucher
        appliedVoucher = result;

        if (message) {

            message.textContent =
                result.ThongBao ||
                "Ap dung voucher thanh cong.";
        }

        calculateSummary();

    } catch (error) {

        console.error(
            "LOI AP DUNG VOUCHER:",
            error
        );

        appliedVoucher = null;

        if (message) {

            message.textContent =
                error.message ||
                "Voucher khong hop le.";
        }

        calculateSummary();
    }
}


// ======================================================
// PHUONG THUC THANH TOAN
// ======================================================

function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    return selected?.value ||
        "COD";
}


function updatePaymentUI() {

    const method =
        getPaymentMethod();

    document
        .querySelectorAll(
            ".payment-option"
        )
        .forEach(option => {

            option.classList.remove(
                "selected"
            );

            const input =
                option.querySelector(
                    'input[name="paymentMethod"]'
                );

            if (
                input &&
                input.checked
            ) {

                option.classList.add(
                    "selected"
                );
            }

        });
}


// ======================================================
// TAO DON HANG
// ======================================================

async function createOrder() {

    if (submitting) {
        return;
    }

    // Kiem tra san pham
    if (!checkoutItems.length) {

        showMessage(
            "Gio hang dang trong."
        );

        return;
    }

    // Kiem tra dia chi
    if (!selectedAddressId) {

        showMessage(
            "Vui long chon dia chi giao hang."
        );

        return;
    }

    const paymentMethod =
        getPaymentMethod();

    const subtotal =
        calculateSubtotal();

    const shippingFee =
        calculateShippingFee();

    const discount =
        calculateDiscount();

    const thanhTien =
        Math.max(
            0,
            subtotal +
            shippingFee -
            discount
        );


    // ==================================================
    // CHI TIET DON HANG
    // ==================================================

    const chiTiets =
        checkoutItems.map(item => {

            const maMonAn =
                String(
                    item.MaMonAn ??
                    item.maMonAn ??
                    ""
                );

            const soLuong =
                Math.max(
                    1,
                    Number(
                        item.SoLuong ??
                        item.soLuong
                    ) || 1
                );

            const donGia =
                Number(
                    item.Gia ??
                    item.gia ??
                    item.DonGia ??
                    item.donGia
                ) || 0;

            return {

                MaChiTietDonHang:
                    "CTDH" +
                    randomId(),

                MaMonAn:
                    maMonAn,

                SoLuong:
                    soLuong,

                DonGia:
                    donGia,

                ThanhTien:
                    donGia *
                    soLuong
            };

        });


    // Kiem tra ma mon
    const invalidItem =
        chiTiets.find(
            item => !item.MaMonAn
        );

    if (invalidItem) {

        showMessage(
            "Co mon an khong co MaMonAn. Khong the tao don."
        );

        return;
    }


    // ==================================================
    // REQUEST TAO DON
    // ==================================================

    const request = {

        MaDiaChi:
            selectedAddressId,

        TongTien:
            subtotal,

        PhiGiaoHang:
            shippingFee,

        GiamGia:
            discount,

        ThanhTien:
            thanhTien,

        GhiChu:
            document
                .getElementById(
                    "orderNote"
                )
                ?.value
                ?.trim() ||
            "",

        ChiTiets:
            chiTiets
    };


    console.log(
        "REQUEST TAO DON:",
        request
    );


    // ==================================================
    // KHONG CHO CLICK NHIEU LAN
    // ==================================================

    submitting = true;

    const button =
        document.getElementById(
            "btnPlaceOrder"
        );

    if (button) {

        button.disabled =
            true;

        button.textContent =
            paymentMethod === "MOMO"
                ? "Dang tao don va thanh toan..."
                : "Dang tao don hang...";
    }


    try {

        // ==================================================
        // BUOC 1: TAO DON HANG
        // ==================================================

        const orderResult =
            await apiRequest(
                `${THANHTOAN_API}/DonHang`,
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            request
                        )
                }
            );


        console.log(
            "KET QUA TAO DON:",
            orderResult
        );


        // Lay MaDonHang
        const maDonHang =
            orderResult?.maDonHang ??
            orderResult?.MaDonHang ??
            orderResult?.data?.maDonHang ??
            orderResult?.data?.MaDonHang;


        if (!maDonHang) {

            throw new Error(
                "Backend khong tra ve MaDonHang."
            );
        }


        // ==================================================
        // BUOC 2: MOMO
        // ==================================================

        if (
            paymentMethod === "MOMO"
        ) {

            if (button) {

                button.textContent =
                    "Dang ket noi MoMo...";
            }


            const momoResult =
                await apiRequest(
                    `${THANHTOAN_API}/ThanhToan/momo-payment/${encodeURIComponent(maDonHang)}`,
                    {
                        method: "POST"
                    }
                );


            console.log(
                "KET QUA MOMO:",
                momoResult
            );


            // MoMo co the tra ve mot trong cac field nay
            const payUrl =
                momoResult?.payUrl ??
                momoResult?.PayUrl ??
                momoResult?.deeplink ??
                momoResult?.Deeplink ??
                momoResult?.qrCodeUrl ??
                momoResult?.QrCodeUrl;


            if (!payUrl) {

                throw new Error(
                    momoResult?.message ||
                    momoResult?.Message ||
                    "MoMo khong tra ve payUrl."
                );
            }


            // Xoa du lieu tam
            sessionStorage.removeItem(
                "foodDeliCheckoutItems"
            );


            // Chuyen sang MoMo
            window.location.href =
                payUrl;

            return;
        }


        // ==================================================
        // BUOC 3: COD
        // ==================================================

        sessionStorage.removeItem(
            "foodDeliCheckoutItems"
        );


        // Backend da tao don va da xoa gio hang.
       window.location.href =
    `don-hang.html?maDonHang=${encodeURIComponent(maDonHang)}&created=1`;

    } catch (error) {

        console.error(
            "LOI DAT HANG:",
            error
        );

        showMessage(
            error.message ||
            "Khong the tao don hang."
        );

        submitting = false;

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Dat hang";
        }
    }
}


// ======================================================
// HIEN THI THONG BAO
// ======================================================

function showMessage(message) {

    const element =
        document.getElementById(
            "checkoutMessage"
        );

    if (!element) {

        alert(message);

        return;
    }

    element.textContent =
        message;

    element.hidden =
        false;

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                element.hidden =
                    true;

            },
            4000
        );
}


// ======================================================
// HELPER
// ======================================================

function setText(id, value) {

    const element =
        document.getElementById(
            id
        );

    if (element) {

        element.textContent =
            value;
    }
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ======================================================
// ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#39;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );
}


// ======================================================
// FORMAT TIEN
// ======================================================

function formatMoney(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {

        return "0đ";
    }

    return (
        number.toLocaleString("vi-VN") +
        "đ"
    );
}


// ======================================================
// RANDOM ID
// ======================================================

function randomId() {

    return (
        Date.now()
            .toString(36)
            .toUpperCase() +

        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );
}

