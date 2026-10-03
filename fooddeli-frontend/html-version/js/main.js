document.addEventListener("DOMContentLoaded", function () {

    console.log("main.js đã được tải");

    const headerActions =
        document.getElementById("headerActions");

    if (!headerActions) {
        console.log(
            "Không tìm thấy headerActions trên trang này."
        );
        return;
    }


    // =====================================================
    // TÍNH TOÁN ĐƯỜNG DẪN TƯƠNG ĐỐI THÔNG MINH
    // =====================================================
    const isInPagesFolder =
        window.location.pathname.replace(/\\/g, '/').includes('/pages/');

    const homeUrl = isInPagesFolder ? '../index.html' : 'index.html';
    const loginUrl = isInPagesFolder ? 'dang-nhap.html' : 'pages/dang-nhap.html';
    const registerUrl = isInPagesFolder ? 'dang-ky.html' : 'pages/dang-ky.html';
    const cartUrl = isInPagesFolder ? '../gio-hang.html' : 'gio-hang.html';
    const adminUrl = isInPagesFolder ? '../admin/index.html' : 'admin/index.html';

    // =====================================================
    // LẤY TOKEN + USER
    // =====================================================

    const token =
        localStorage.getItem("token");

    const userJson =
        localStorage.getItem("user");


    // =====================================================
    // CHƯA ĐĂNG NHẬP
    // =====================================================

   if (!token || !userJson) {

    renderGuestHeader(loginUrl, registerUrl);

    lockHomepageSections();

    return;
}


    // =====================================================
    // ĐỌC USER
    // =====================================================

    let user;

    try {

        user =
            JSON.parse(userJson);

    } catch (error) {

        console.error(
            "Không đọc được thông tin người dùng.",
            error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        renderGuestHeader(loginUrl, registerUrl);

        return;
    }


    console.log(
        "Thông tin user:",
        user
    );


    // =====================================================
    // LẤY HỌ TÊN
    // =====================================================

    const hoTen =
        user.hoTen ||
        user.HoTen ||
        user.tenNguoiDung ||
        user.TenNguoiDung ||
        user.name ||
        user.Name ||
        user.email ||
        user.Email ||
        "Bạn";


    // =====================================================
    // LẤY ROLE
    // =====================================================

    const roles =
        getRolesFromUser(user);


    console.log(
        "Roles:",
        roles
    );


    // =====================================================
    // KIỂM TRA ROLE
    // =====================================================

    const isAdmin =
        roles.includes("Admin");

    const isQuanLy =
        roles.includes("QuanLy");

    const isChuShop =
        roles.includes("ChuShop");

    const isKhachHang =
        roles.includes("KhachHang");


    // =====================================================
    // NÚT QUẢN LÝ
    // =====================================================

    let managementButton = "";


    if (
        isAdmin ||
        isQuanLy
    ) {

        managementButton = `
            <a
                href="${adminUrl}"
                class="btn btn-outline"
            >
                Quản trị
            </a>
        `;

    } else if (isChuShop) {

        managementButton = `
            <a
                href="${adminUrl}"
                class="btn btn-outline"
            >
                Quản lý shop
            </a>
        `;

    }


    // =====================================================
    // NÚT GIỎ HÀNG
    // =====================================================

    let cartButton = "";


    if (
        isKhachHang ||
        (
            !isAdmin &&
            !isQuanLy &&
            !isChuShop
        )
    ) {

        cartButton = `
            <a
                href="${cartUrl}"
                class="btn btn-outline"
            >
                🛒 Giỏ hàng
            </a>
        `;

    }


    // =====================================================
    // HIỂN THỊ HEADER SAU ĐĂNG NHẬP
    // =====================================================

    headerActions.innerHTML = `

        ${managementButton}

        ${cartButton}

        <span class="user-name" style="font-weight: 700; color: #374151;">
            Xin chào, ${escapeHtml(hoTen)}
        </span>

        <button
            type="button"
            class="btn btn-outline"
            id="logoutButton"
        >
            Đăng xuất
        </button>

    `;


    // =====================================================
    // NÚT ĐĂNG XUẤT
    // =====================================================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                console.log(
                    "Đang đăng xuất..."
                );


                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                localStorage.removeItem(
                    "role"
                );


                window.location.href =
                    homeUrl;
            }
        );

    }

});


// =========================================================
// LẤY ROLE TỪ USER
// =========================================================

function getRolesFromUser(user) {

    if (!user) {
        return [];
    }


    let roles = [];


    // 1. vaiTro
    if (user.vaiTro !== undefined) {

        roles = user.vaiTro;

    }

    // 2. VaiTro
    else if (user.VaiTro !== undefined) {

        roles = user.VaiTro;

    }

    // 3. roles
    else if (user.roles !== undefined) {

        roles = user.roles;

    }

    // 4. Roles
    else if (user.Roles !== undefined) {

        roles = user.Roles;

    }

    // 5. role
    else if (user.role !== undefined) {

        roles = user.role;

    }

    // 6. Role
    else if (user.Role !== undefined) {

        roles = user.Role;

    }


    // =====================================================
    // ROLE LÀ OBJECT
    // =====================================================

    if (
        typeof roles === "object" &&
        roles !== null &&
        !Array.isArray(roles)
    ) {

        const nestedRole =
            roles.tenVaiTro ||
            roles.TenVaiTro ||
            roles.role ||
            roles.Role ||
            roles.name ||
            roles.Name;


        if (nestedRole) {

            roles = [nestedRole];

        } else {

            roles = [];

        }
    }


    // =====================================================
    // CHUỖI → MẢNG
    // =====================================================

    if (!Array.isArray(roles)) {

        roles = [roles];

    }


    // =====================================================
    // CHUẨN HÓA ROLE
    // =====================================================

    return roles

        .filter(function (role) {

            return (
                role !== null &&
                role !== undefined &&
                String(role).trim() !== ""
            );

        })

        .map(function (role) {

            return normalizeRole(role);

        });

}


// =========================================================
// CHUẨN HÓA ROLE
// =========================================================

function normalizeRole(role) {

    const value =
        String(role)
            .trim()
            .toLowerCase();


    switch (value) {

        case "admin":
        case "administrator":

            return "Admin";


        case "quanly":
        case "quan ly":
        case "quản lý":
        case "manager":

            return "QuanLy";


        case "chushop":
        case "chu shop":
        case "chủ shop":
        case "shopowner":

            return "ChuShop";


        case "khachhang":
        case "khach hang":
        case "khách hàng":
        case "customer":
        case "user":

            return "KhachHang";


        default:

            return String(role).trim();

    }

}


// =========================================================
// HEADER CHƯA ĐĂNG NHẬP
// =========================================================

function renderGuestHeader(loginUrl, registerUrl) {

    const headerActions =
        document.getElementById(
            "headerActions"
        );

    if (!headerActions) {
        return;
    }

    const resolvedLoginUrl = loginUrl || "pages/dang-nhap.html";
    const resolvedRegisterUrl = registerUrl || "pages/dang-ky.html";

    headerActions.innerHTML = `

        <a
            href="${resolvedLoginUrl}"
            class="btn btn-outline"
        >
            Đăng nhập
        </a>

        <a
            href="${resolvedRegisterUrl}"
            class="btn"
        >
            Đăng ký
        </a>

    `;

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}
// =========================================================
// BẢO VỆ CHỨC NĂNG KHI CHƯA ĐĂNG NHẬP
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        const token =
            localStorage.getItem("token");

        const user =
            localStorage.getItem("user");


        // Đã đăng nhập → cho phép thao tác bình thường
        if (token && user) {
            return;
        }


        // Tìm phần tử được click
        const target =
            event.target.closest(
                "a, button"
            );


        if (!target) {
            return;
        }


        // =====================================================
        // 1. GIỎ HÀNG / MÓN ĂN / ĐƠN HÀNG
        // =====================================================

        const requiresLogin =
            target.dataset.requiresLogin === "true";


        if (requiresLogin) {

    event.preventDefault();
    event.stopPropagation();

    alert(
        "Bạn cần đăng nhập để sử dụng chức năng này."
    );

    return;
}


        // =====================================================
        // 2. NÚT XEM CHI TIẾT CỬA HÀNG
        // =====================================================

       // =====================================================
// CHẶN XEM CHI TIẾT CỬA HÀNG KHI CHƯA ĐĂNG NHẬP
// =====================================================

if (
    target.classList.contains("shop-view-btn")
) {

    const token =
        localStorage.getItem("token");

    const user =
        localStorage.getItem("user");

    // Chưa đăng nhập → chặn
    if (!token || !user) {

        event.preventDefault();
        event.stopPropagation();

        alert(
            "Bạn cần đăng nhập để xem chi tiết cửa hàng."
        );

        return;
    }

    // Đã đăng nhập → cho phép JS cũ xử lý bình thường
}
// =========================================================
// KHÓA DANH MỤC + CỬA HÀNG NỔI BẬT KHI CHƯA ĐĂNG NHẬP
// =========================================================

function lockHomepageSections() {

    const sections = [
        document.getElementById("categorySection"),
        document.getElementById("featuredShopSection")
    ];

    sections.forEach(function (section) {

        if (!section) {
            return;
        }

        section.classList.add("homepage-locked");

        // Không tạo overlay trùng
        if (
            section.querySelector(
                ".homepage-login-overlay"
            )
        ) {
            return;
        }

        const overlay =
            document.createElement("div");

        overlay.className =
            "homepage-login-overlay";

        overlay.innerHTML = `
            <div class="homepage-login-overlay-box">

                <div class="homepage-login-overlay-icon">
                    🔒
                </div>

                <h3>
                    Yêu cầu đăng nhập
                </h3>

                <p>
                    Bạn cần đăng nhập để xem nội dung này.
                </p>

                <button
                    type="button"
                    class="homepage-login-required"
                >
                    Đăng nhập để xem
                </button>

            </div>
        `;

        const button =
            overlay.querySelector(
                ".homepage-login-required"
            );

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                alert(
                    "Bạn cần đăng nhập để xem nội dung này."
                );

            }
        );

        section.appendChild(overlay);

    });
}