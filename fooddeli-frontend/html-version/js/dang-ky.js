const form = document.querySelector("#registerForm");

const hoTenInput = document.querySelector("#hoTen");
const emailInput = document.querySelector("#email");
const soDienThoaiInput = document.querySelector("#soDienThoai");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const hoTen = hoTenInput.value.trim();
    const email = emailInput.value.trim();
    const soDienThoai = soDienThoaiInput.value.trim();
    const matKhau = passwordInput.value;
    const xacNhanMatKhau = confirmPasswordInput.value;

    // =========================
    // KIỂM TRA DỮ LIỆU
    // =========================

    if (!hoTen) {
        alert("Vui lòng nhập họ và tên.");
        hoTenInput.focus();
        return;
    }

    if (!email) {
        alert("Vui lòng nhập email.");
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        alert("Email không hợp lệ.");
        emailInput.focus();
        return;
    }

    if (!soDienThoai) {
        alert("Vui lòng nhập số điện thoại.");
        soDienThoaiInput.focus();
        return;
    }

    if (!isValidPhone(soDienThoai)) {
        alert("Số điện thoại không hợp lệ.");
        soDienThoaiInput.focus();
        return;
    }

    if (!matKhau) {
        alert("Vui lòng nhập mật khẩu.");
        passwordInput.focus();
        return;
    }

    if (matKhau.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự.");
        passwordInput.focus();
        return;
    }

    if (matKhau !== xacNhanMatKhau) {
        alert("Mật khẩu xác nhận không khớp.");
        confirmPasswordInput.focus();
        return;
    }

    // =========================
    // GỌI API ĐĂNG KÝ
    // =========================

    const requestData = {
        hoTen: hoTen,
        email: email,
        matKhau: matKhau,
        soDienThoai: soDienThoai
    };

    try {
        const response = await fetch(
            "https://localhost:7135/api/Auth/dang-ky",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Đăng ký thất bại.");
            return;
        }

        alert("Đăng ký tài khoản thành công!");

        window.location.href = "dang-nhap.html";

    } catch (error) {
        console.error("Lỗi kết nối API:", error);

        alert(
            "Không thể kết nối đến máy chủ. " +
            "Hãy kiểm tra Backend đang chạy."
        );
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phone);
}