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
    // TÍNH TOÁN ĐƯỜNG DẪN
    // =====================================================

    const isInPagesFolder =
        window.location.pathname
            .replace(/\\/g, "/")
            .includes("/pages/");


    const homeUrl =
        isInPagesFolder
            ? "../index.html"
            : "index.html";


    const loginUrl =
        isInPagesFolder
            ? "dang-nhap.html"
            : "pages/dang-nhap.html";


    const registerUrl =
        isInPagesFolder
            ? "dang-ky.html"
            : "pages/dang-ky.html";


    // =====================================================
    // GIỎ HÀNG
    // giohang.html nằm trong thư mục pages
    // =====================================================

    const cartUrl =
        isInPagesFolder
            ? "giohang.html"
            : "pages/giohang.html";


    const adminUrl =
        isInPagesFolder
            ? "../admin/index.html"
            : "admin/index.html";


    // =====================================================
    // LẤY TOKEN + USER
    // =====================================================

    const token =
        localStorage.getItem("token");


    const userJson =
        localStorage.getItem("user");


    console.log("Có token:", !!token);
    console.log("Có user:", !!userJson);


    // =====================================================
    // CHƯA ĐĂNG NHẬP
    // =====================================================

    if (!token || !userJson) {

        console.log(
            "main.js xác định: CHƯA ĐĂNG NHẬP"
        );

        renderGuestHeader(
            loginUrl,
            registerUrl
        );

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

        renderGuestHeader(
            loginUrl,
            registerUrl
        );

        lockHomepageSections();

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

    let roles =
        getRolesFromUser(user);


    // Nếu user không chứa role
    // thì thử lấy từ localStorage
    if (roles.length === 0) {

        const savedRole =
            localStorage.getItem("role");

        if (savedRole) {

            roles =
                getRolesFromUser({
                    role: savedRole
                });

        }

    }


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
        data-spa-route="cart"
    >
        🛒 Giỏ hàng
    </a>
`;

    }


    // =====================================================
    // HIỂN THỊ HEADER SAU ĐĂNG NHẬP
    // =====================================================

    console.log(
        "main.js xác định: ĐÃ ĐĂNG NHẬP"
    );


    headerActions.innerHTML = `

        ${managementButton}

        ${cartButton}

        <span
            class="user-name"
            style="font-weight: 700; color: #374151;"
        >
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

function renderGuestHeader(
    loginUrl,
    registerUrl
) {

    const headerActions =
        document.getElementById(
            "headerActions"
        );


    if (!headerActions) {
        return;
    }


    const resolvedLoginUrl =
        loginUrl ||
        "pages/dang-nhap.html";


    const resolvedRegisterUrl =
        registerUrl ||
        "pages/dang-ky.html";


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
// KHÓA DANH MỤC + CỬA HÀNG NỔI BẬT
// =========================================================

function lockHomepageSections() {

    const sections = [

        document.getElementById(
            "categorySection"
        ),

        document.getElementById(
            "featuredShopSection"
        )

    ];


    sections.forEach(function (section) {

        if (!section) {
            return;
        }


        section.classList.add(
            "homepage-locked"
        );


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

            <div
                class="homepage-login-overlay-box"
            >

                <div
                    class="homepage-login-overlay-icon"
                >
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


        button?.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();


                alert(
                    "Bạn cần đăng nhập để xem nội dung này."
                );

            }
        );


        section.appendChild(
            overlay
        );

    });

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


        // =====================================================
        // ĐÃ ĐĂNG NHẬP
        // =====================================================

        if (token && user) {

            return;

        }


        // =====================================================
        // TÌM PHẦN TỬ ĐƯỢC CLICK
        // =====================================================

        const target =
            event.target.closest(
                "a, button"
            );


        if (!target) {

            return;

        }


        // =====================================================
        // 1. CÁC CHỨC NĂNG BẮT BUỘC ĐĂNG NHẬP
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
        // 2. XEM CHI TIẾT CỬA HÀNG
        // =====================================================

        if (
            target.classList.contains(
                "shop-view-btn"
            )
        ) {

            event.preventDefault();
            event.stopPropagation();


            alert(
                "Bạn cần đăng nhập để xem chi tiết cửa hàng."
            );


            return;

        }

    }
);


// =========================================================
// XÁC ĐỊNH URL SPA
//
// CẤU TRÚC CUSTOMER:
// html-version/
// ├── index.html
// └── pages/
//     ├── cua-hang.html
//     ├── mon-an.html
//     ├── don-hang.html
//     └── giohang.html
// =========================================================

function getSpaRouteUrl(routeKey) {

    const currentPath =
        window.location.pathname
            .replace(/\\/g, "/");


    const marker =
        "/html-version/";


    const index =
        currentPath.indexOf(marker);


    // -----------------------------------------------------
    // Nếu không xác định được html-version
    // -----------------------------------------------------

    if (index === -1) {

        switch (routeKey) {

            case "home":
                return new URL(
                    "index.html",
                    window.location.href
                ).href;

            case "shops":
                return new URL(
                    "pages/cua-hang.html",
                    window.location.href
                ).href;

            case "food":
                return new URL(
                    "pages/mon-an.html",
                    window.location.href
                ).href;

            case "orders":
                return new URL(
                    "pages/don-hang.html",
                    window.location.href
                ).href;

            case "cart":
                return new URL(
                    "pages/giohang.html",
                    window.location.href
                ).href;

            default:
                return new URL(
                    "index.html",
                    window.location.href
                ).href;
        }
    }


    // -----------------------------------------------------
    // Lấy đúng thư mục html-version
    // -----------------------------------------------------

    const htmlVersionRoot =
        window.location.origin +
        currentPath.substring(
            0,
            index + marker.length
        );


    switch (routeKey) {

        case "home":
            return htmlVersionRoot +
                "index.html";

        case "shops":
            return htmlVersionRoot +
                "pages/cua-hang.html";

        case "food":
            return htmlVersionRoot +
                "pages/mon-an.html";

        case "orders":
            return htmlVersionRoot +
                "pages/don-hang.html";

        case "cart":
            return htmlVersionRoot +
                "pages/giohang.html";

        default:
            return htmlVersionRoot +
                "index.html";
    }

}


// =========================================================
// FOODDELI SPA
// CHỈ THAY <main>
// KHÔNG THAY HEADER / NAVBAR / FOOTER
// =========================================================

(function () {

    // =====================================================
    // BẢO VỆ KHU VỰC ADMIN
    // =====================================================
    // Nếu đang ở /admin/ thì KHÔNG chạy Customer SPA.
    // Các trang khách hàng vẫn hoạt động hoàn toàn bình thường.
    // =====================================================

    const currentPath =
        window.location.pathname
            .replace(/\\/g, "/")
            .toLowerCase();

    const isAdminPage =
        currentPath.includes("/admin/");


    if (isAdminPage) {

        console.log(
            "main.js: Đang ở Admin -> bỏ qua Customer SPA."
        );

        return;
    }


    // =====================================================
    // CUSTOMER SPA
    // =====================================================

    let spaBusy = false;

    let loadedPageScripts = [];

    let loadedPageStyles = [];

    // =====================================================
    // XÁC ĐỊNH ROUTE TỪ LINK
    // =====================================================

function getSpaRouteFromLink(link) {

    if (!link) {
        return null;
    }

    // Ưu tiên route được gán trực tiếp
    if (
        link.dataset &&
        link.dataset.spaRoute
    ) {
        return link.dataset.spaRoute;
    }

    const href =
        link.getAttribute("href") || "";

    const cleanHref =
        href
            .split("?")[0]
            .split("#")[0]
            .toLowerCase();


    // =====================================================
    // KHÔNG XỬ LÝ LINK ADMIN BẰNG SPA
    // =====================================================
    // Ví dụ:
    // admin/index.html
    // ../admin/index.html
    // /fooddeli-frontend/html-version/admin/index.html
    //
    // Những link này phải để trình duyệt chuyển trang
    // bình thường.
    // =====================================================

    if (
        cleanHref.includes("/admin/") ||
        cleanHref.startsWith("admin/") ||
        cleanHref.startsWith("../admin/")
    ) {
        return null;
    }


    // Trang chủ
    if (
        cleanHref === "index.html" ||
        cleanHref.endsWith("/index.html") ||
        cleanHref === "./index.html" ||
        cleanHref === "../index.html"
    ) {
        return "home";
    }


    // Cửa hàng
    if (
        cleanHref === "cua-hang.html" ||
        cleanHref.endsWith("/cua-hang.html")
    ) {
        return "shops";
    }


    // Món ăn
    if (
        cleanHref === "pages/mon-an.html" ||
        cleanHref.endsWith("/pages/mon-an.html")
    ) {
        return "food";
    }


    // Đơn hàng
    if (
        cleanHref === "pages/don-hang.html" ||
        cleanHref.endsWith("/pages/don-hang.html")
    ) {
        return "orders";
    }


    // Giỏ hàng
    if (
        cleanHref === "pages/giohang.html" ||
        cleanHref.endsWith("/pages/giohang.html") ||
        cleanHref === "giohang.html" ||
        cleanHref.endsWith("/giohang.html")
    ) {
        return "cart";
    }


    return null;
}


    // =====================================================
    // KIỂM TRA ĐĂNG NHẬP
    // =====================================================

    function spaIsLoggedIn() {

        return (
            !!localStorage.getItem("token") &&
            !!localStorage.getItem("user")
        );

    }


    // =====================================================
    // ROUTE NÀO BẮT BUỘC ĐĂNG NHẬP
    // =====================================================

    function spaRequiresLogin(route) {

        return (
            route === "food" ||
            route === "orders" ||
            route === "cart"
        );

    }


    // =====================================================
    // XÓA SCRIPT TRANG CŨ
    // =====================================================

    function removeLoadedPageScripts() {

        loadedPageScripts.forEach(
            function (script) {

                if (
                    script &&
                    script.parentNode
                ) {

                    script.parentNode
                        .removeChild(script);

                }

            }
        );


        loadedPageScripts = [];

    }


    // =====================================================
    // XÓA STYLE INLINE TRANG CŨ
    // =====================================================

    function removeLoadedPageStyles() {

        loadedPageStyles.forEach(
            function (style) {

                if (
                    style &&
                    style.parentNode
                ) {

                    style.parentNode
                        .removeChild(style);

                }

            }
        );


        loadedPageStyles = [];

    }


    // =====================================================
    // LOAD JS CỦA TRANG ĐÍCH
    // =====================================================

    async function loadSpaScripts(
        targetDocument,
        targetUrl
    ) {

        removeLoadedPageScripts();


        const scripts =
            Array.from(
                targetDocument.querySelectorAll(
                    "script[src]"
                )
            );


        for (
            const oldScript of scripts
        ) {

            const src =
                oldScript.getAttribute(
                    "src"
                );


            if (!src) {
                continue;
            }


            const absoluteUrl =
                new URL(
                    src,
                    targetUrl
                ).href;


            // Không load lại main.js
            if (
                absoluteUrl
                    .toLowerCase()
                    .includes("/js/main.js")
            ) {

                continue;

            }


            // Không nạp trùng script do SPA
            const alreadyLoaded =
                loadedPageScripts.some(
                    function (script) {

                        return (
                            script.src ===
                            absoluteUrl
                        );

                    }
                );


            if (alreadyLoaded) {
                continue;
            }


            const newScript =
                document.createElement(
                    "script"
                );


            newScript.src =
                absoluteUrl;


            newScript.type =
                oldScript.type ||
                "text/javascript";


            newScript.dataset.foodDeliSpa =
                "true";


            document.body.appendChild(
                newScript
            );


            loadedPageScripts.push(
                newScript
            );


            // Chờ file JS load xong
            await new Promise(
                function (resolve) {

                    newScript.onload =
                        function () {

                            resolve();

                        };


                    newScript.onerror =
                        function (error) {

                            console.error(
                                "Không tải được script:",
                                absoluteUrl,
                                error
                            );

                            resolve();

                        };

                }
            );

        }

    }


    // =====================================================
    // LOAD STYLE INLINE CỦA TRANG ĐÍCH
    // =====================================================

    function loadSpaStyles(
        targetDocument
    ) {

        removeLoadedPageStyles();


        const targetStyles =
            targetDocument.querySelectorAll(
                "head style"
            );


        targetStyles.forEach(
            function (oldStyle) {

                const newStyle =
                    document.createElement(
                        "style"
                    );


                newStyle.textContent =
                    oldStyle.textContent;


                newStyle.dataset.foodDeliSpa =
                    "true";


                document.head.appendChild(
                    newStyle
                );


                loadedPageStyles.push(
                    newStyle
                );

            }
        );

    }


    // =====================================================
    // LẤY ROUTE HIỆN TẠI
    // =====================================================

    function getCurrentSpaRoute() {

        const pathname =
            window.location.pathname
                .replace(/\\/g, "/")
                .toLowerCase();


        // -------------------------------------------------
        // Món ăn
        // -------------------------------------------------

        if (
            pathname.endsWith(
                "/pages/mon-an.html"
            )
        ) {

            return "food";

        }


        // -------------------------------------------------
        // Đơn hàng
        // -------------------------------------------------

        if (
            pathname.endsWith(
                "/pages/don-hang.html"
            )
        ) {

            return "orders";

        }


        // -------------------------------------------------
        // Giỏ hàng
        // -------------------------------------------------

        if (
            pathname.endsWith(
                "/pages/giohang.html"
            )
        ) {

            return "cart";

        }


        // -------------------------------------------------
        // Cửa hàng
        // -------------------------------------------------

        if (
            pathname.endsWith(
                "/pages/cua-hang.html"
            ) ||
            pathname.endsWith(
                "/cua-hang.html"
            )
        ) {

            return "shops";

        }


        // -------------------------------------------------
        // Trang chủ
        // -------------------------------------------------

        return "home";

    }


    // =====================================================
    // ACTIVE MENU
    // =====================================================

    function updateSpaActiveMenu(route) {

        const links =
            document.querySelectorAll(
                ".navbar .nav-link"
            );


        links.forEach(
            function (link) {

                const linkRoute =
                    getSpaRouteFromLink(
                        link
                    );


                link.classList.toggle(
                    "active",
                    linkRoute === route
                );

            }
        );

    }


    // =====================================================
    // SPA NAVIGATION
    // =====================================================

    async function navigateSpa(
        route,
        pushHistory
    ) {

        // Không cho click liên tiếp
        if (spaBusy) {
            return;
        }


        if (!route) {
            return;
        }


        // =================================================
        // KIỂM TRA ĐĂNG NHẬP
        // =================================================

        if (
            spaRequiresLogin(route) &&
            !spaIsLoggedIn()
        ) {

            alert(
                "Bạn cần đăng nhập để sử dụng chức năng này."
            );

            return;
        }


        // =================================================
        // LẤY URL ĐÍCH
        // =================================================

        const targetUrl =
            getSpaRouteUrl(route);


        if (!targetUrl) {

            console.error(
                "Không xác định được URL SPA.",
                route
            );

            return;
        }


        // =================================================
        // LẤY MAIN HIỆN TẠI
        // =================================================

        const currentMain =
            document.querySelector(
                "main"
            );


        // Không chuyển trang nữa.
        // Nếu không có main thì báo lỗi.
        if (!currentMain) {

            console.error(
                "Không tìm thấy thẻ <main>."
            );

            alert(
                "Không tìm thấy khu vực nội dung trang."
            );

            return;
        }


        // =================================================
        // KIỂM TRA CÓ ĐANG Ở TRANG ĐÍCH KHÔNG
        // =================================================

        const currentUrl =
            window.location.origin +
            window.location.pathname;


        const parsedTarget =
            new URL(
                targetUrl,
                window.location.href
            );


        const targetAbsolute =
            parsedTarget.origin +
            parsedTarget.pathname;


        if (
            currentUrl ===
            targetAbsolute
        ) {

            updateSpaActiveMenu(
                route
            );

            return;
        }


        spaBusy = true;


        const oldMainHtml =
            currentMain.innerHTML;


        try {

            // =================================================
            // TẢI HTML TRANG ĐÍCH
            // =================================================

            console.log(
                "SPA đang tải:",
                targetUrl
            );


            const response =
                await fetch(
                    targetUrl,
                    {
                        method: "GET",
                        cache: "no-cache"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status
                );
            }


            const html =
                await response.text();


            // =================================================
            // PARSE HTML
            // =================================================

            const parser =
                new DOMParser();


            const targetDocument =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            // Kiểm tra parser có báo lỗi không
            const parserError =
                targetDocument.querySelector(
                    "parsererror"
                );


            if (parserError) {

                throw new Error(
                    "Không thể phân tích HTML trang đích."
                );
            }


            // =================================================
            // LẤY MAIN
            // =================================================

            const targetMain =
                targetDocument.querySelector(
                    "main"
                );


            if (!targetMain) {

                throw new Error(
                    "Trang đích không có thẻ <main>."
                );
            }


            // =================================================
            // TẠO MAIN MỚI
            // =================================================

            const newMain =
                targetMain.cloneNode(
                    true
                );


            // =================================================
            // THAY CHỈ MAIN
            //
            // HEADER KHÔNG ĐỤNG
            // NAVBAR KHÔNG ĐỤNG
            // FOOTER KHÔNG ĐỤNG
            // =================================================

            currentMain.replaceWith(
                newMain
            );


            // =================================================
            // CẬP NHẬT TITLE
            // =================================================

            const targetTitle =
                targetDocument.querySelector(
                    "title"
                );


            if (targetTitle) {

                document.title =
                    targetTitle.textContent;
            }


            // =================================================
            // LOAD STYLE RIÊNG
            // =================================================

            loadSpaStyles(
                targetDocument
            );


            // =================================================
            // PUSH URL
            //
            // ĐỔI URL NHƯNG KHÔNG RELOAD
            // =================================================

            if (pushHistory) {

                window.history.pushState(
                    {
                        foodDeliSPA: true,
                        route: route
                    },
                    "",
                    targetUrl
                );
            }


            // =================================================
            // ACTIVE MENU
            // =================================================

            updateSpaActiveMenu(
                route
            );


            // =================================================
            // LOAD JS RIÊNG
            // =================================================

            await loadSpaScripts(
                targetDocument,
                targetUrl
            );


            // =================================================
            // CHẠY LẠI DOMContentLoaded
            //
            // Để:
            // mon-an.js
            // don-hang.js
            // giohang.js
            // cua-hang-khach.js
            //
            // có thể khởi tạo lại.
            // =================================================

            setTimeout(
                function () {

                    document.dispatchEvent(
                        new Event(
                            "DOMContentLoaded"
                        )
                    );

                },
                0
            );


            console.log(
                "SPA chuyển thành công:",
                route
            );


        } catch (error) {

            console.error(
                "Lỗi SPA FoodDeli:",
                error
            );


            // =================================================
            // KHÔI PHỤC MAIN CŨ
            // =================================================

            const mainAfterError =
                document.querySelector(
                    "main"
                );


            if (mainAfterError) {

                mainAfterError.innerHTML =
                    oldMainHtml;
            }


            // =================================================
            // KHÔNG ĐƯỢC window.location.href
            //
            // Vì như vậy sẽ mở trang riêng.
            // =================================================

            alert(
                "Không thể tải nội dung trang. Vui lòng thử lại."
            );


        } finally {

            spaBusy = false;

        }

    }


    // =========================================================
    // CHẶN CLICK MENU
    //
    // TRUE = CAPTURE
    //
    // Chặn trước khi href mặc định được thực hiện.
    // =========================================================

    document.addEventListener(
        "click",
        function (event) {

            // -----------------------------------------------
            // Đảm bảo target là Element
            // -----------------------------------------------

            if (
                !event.target ||
                typeof event.target.closest !==
                    "function"
            ) {

                return;
            }


            // -----------------------------------------------
            // CHỈ BẮT:
            //
            // 1. Menu navbar
            // 2. Nút Giỏ hàng trong header
            //
            // Không bắt Đăng nhập / Đăng ký / Quản trị.
            // -----------------------------------------------

            const link =
                event.target.closest(
                    ".navbar .nav-link, .header-actions a, [data-spa-route]"
                );


            if (!link) {
                return;
            }

            // Chỉ xử lý phần tử có thể tương tác
            // hoặc phần tử được gắn data-spa-route.
            const isInteractiveSpaElement =
                link.matches("a, button, [data-spa-route]");

            if (!isInteractiveSpaElement) {
                return;
            }


            // -----------------------------------------------
            // Không xử lý mở tab mới
            // -----------------------------------------------

            if (
                link.target &&
                link.target !== "_self"
            ) {

                return;
            }


            // -----------------------------------------------
            // Không xử lý Ctrl / Shift / Alt / Command
            // -----------------------------------------------

            if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {

                return;
            }


            // -----------------------------------------------
            // Xác định route
            // -----------------------------------------------

            const route =
                getSpaRouteFromLink(
                    link
                );


            // -----------------------------------------------
            // Không phải route SPA
            //
            // Đăng nhập
            // Đăng ký
            // Quản trị
            // Quản lý shop
            //
            // sẽ hoạt động bình thường.
            // -----------------------------------------------

            if (!route) {

                return;
            }


            // =================================================
            // CHẶN LINK GỐC
            // =================================================

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            // =================================================
            // CHẠY SPA
            // =================================================

            navigateSpa(
                route,
                true
            );

        },
        true
    );


    // =========================================================
    // BACK / FORWARD CỦA TRÌNH DUYỆT
    // =========================================================

    window.addEventListener(
        "popstate",
        function () {

            const route =
                getCurrentSpaRoute();


            navigateSpa(
                route,
                false
            );

        }
    );


    // =========================================================
    // ACTIVE MENU LÚC MỞ TRANG
    // =========================================================

    function initializeSpaMenu() {

        updateSpaActiveMenu(
            getCurrentSpaRoute()
        );

    }


    // Nếu DOM đã sẵn sàng
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSpaMenu,
            {
                once: true
            }
        );

    } else {

        initializeSpaMenu();

    }

})();