document.addEventListener("click", function (event) {

    const adminLogout = event.target.closest("#adminLogout");

    if (!adminLogout) {
        return;
    }

    console.log("Đang đăng xuất Admin...");

    // Xóa thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Về trang đăng nhập
    window.location.href = "../pages/dang-nhap.html";

});