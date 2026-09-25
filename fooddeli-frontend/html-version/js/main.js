document.addEventListener("DOMContentLoaded", function () {

    const headerActions = document.getElementById("headerActions");

    if (!headerActions) {
        return;
    }

    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    // Chưa đăng nhập
    if (!token || !userJson) {
        return;
    }

    let user;

    try {
        user = JSON.parse(userJson);
    } catch (error) {
        console.error("Không đọc được thông tin người dùng.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return;
    }

    const hoTen = user.hoTen || "Bạn";

    let roles = user.vaiTro || [];

    // Nếu backend trả về 1 chuỗi thay vì mảng
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    const isAdmin = roles.includes("Admin");
    const isQuanLy = roles.includes("QuanLy");
    const isChuShop = roles.includes("ChuShop");

    let managementButton = "";

    if (isAdmin || isQuanLy) {
        managementButton = `
            <a href="admin/index.html" class="btn btn-outline">
                Quản trị
            </a>
        `;
    } else if (isChuShop) {
        managementButton = `
            <a href="#" class="btn btn-outline">
                Quản lý shop
            </a>
        `;
    }

    headerActions.innerHTML = `
        ${managementButton}

        <span class="user-name">
            Xin chào, ${hoTen}
        </span>

        <button
            type="button"
            class="btn btn-outline"
            id="logoutButton"
        >
            Đăng xuất
        </button>
    `;

    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    });

});