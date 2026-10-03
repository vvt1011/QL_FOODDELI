/**
 * =============================================================================
 * DANG-NHAP.JS - XỬ LÝ ĐĂNG NHẬP KHÁCH HÀNG FULL CHỨC NĂNG (FOODDELI)
 * =============================================================================
 * Hỗ trợ:
 * - Đăng nhập tài khoản khách hàng (KhachHang) kết nối trực tiếp C# Backend
 * - Lưu JWT Token & User Profile vào LocalStorage
 * - Toggle ẩn/hiện mật khẩu
 * - Ghi nhớ email đăng nhập (Remember Me)
 * - Tự động phát hiện phiên đăng nhập cũ (Already logged in)
 * - Inline Alert & Validation trực tiếp chuẩn UI FoodDeli (thay thế window.alert)
 * - Điều hướng thông minh (Smart Redirect theo query param ?redirect=...)
 * - Modal hỗ trợ Quên mật khẩu
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
    console.log("FoodDeli - Đăng nhập khách hàng đã sẵn sàng.");

    // =========================================================================
    // 1. CẤU HÌNH & KHỞI TẠO DOM
    // =========================================================================
    const API_BASE_URL = "https://localhost:7135/api";
    const LOGIN_API_URL = `${API_BASE_URL}/Auth/dang-nhap`;

    // Form & Input elements
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailGroup = document.getElementById("emailGroup");
    const passwordGroup = document.getElementById("passwordGroup");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const togglePasswordBtn = document.getElementById("togglePasswordBtn");
    const rememberMeCheckbox = document.getElementById("rememberMe");
    const submitBtn = document.getElementById("submitBtn");
    const btnSpinner = document.getElementById("btnSpinner");
    const btnText = document.getElementById("btnText");

    // Thông báo & Card trạng thái
    const alertBox = document.getElementById("alertBox");
    const alertIcon = document.getElementById("alertIcon");
    const alertMessage = document.getElementById("alertMessage");
    const alertCloseBtn = document.getElementById("alertCloseBtn");
    const alreadyLoggedInBox = document.getElementById("alreadyLoggedInBox");
    const alreadyUserName = document.getElementById("alreadyUserName");
    const alreadyUserEmail = document.getElementById("alreadyUserEmail");
    const alreadyUserAvatar = document.getElementById("alreadyUserAvatar");
    const alreadyLogoutBtn = document.getElementById("alreadyLogoutBtn");
    const alreadyGoHomeBtn = document.getElementById("alreadyGoHomeBtn");

    // Modal Quên mật khẩu
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const closeForgotModalBtn = document.getElementById("closeForgotModalBtn");
    const confirmForgotModalBtn = document.getElementById("confirmForgotModalBtn");

    // =========================================================================
    // 2. CÁC HÀM TIỆN ÍCH HIỂN THỊ UI (ALERT, ERROR, LOADING)
    // =========================================================================

    /**
     * Hiển thị thông báo Alert chuẩn UI
     * @param {string} message - Nội dung thông báo
     * @param {'error'|'success'|'info'} type - Loại thông báo
     */
    function showAlert(message, type = "error") {
        if (!alertBox || !alertMessage) return;

        alertBox.className = `login-alert alert-${type}`;
        alertMessage.textContent = message;

        if (alertIcon) {
            if (type === "success") alertIcon.textContent = "✅";
            else if (type === "info") alertIcon.textContent = "ℹ️";
            else alertIcon.textContent = "⚠️";
        }

        alertBox.style.display = "flex";

        // Hiệu ứng rung nhẹ khi xảy ra lỗi
        if (type === "error") {
            const formContainer = document.getElementById("loginFormContainer");
            if (formContainer) {
                formContainer.classList.remove("shake");
                void formContainer.offsetWidth; // Trigger reflow
                formContainer.classList.add("shake");
            }
        }
    }

    /**
     * Ẩn thông báo Alert
     */
    function hideAlert() {
        if (alertBox) {
            alertBox.style.display = "none";
        }
    }

    /**
     * Đặt lỗi cho từng trường nhập liệu
     */
    function setFieldError(group, errorSpan, message) {
        if (group) group.classList.add("has-error");
        if (errorSpan) errorSpan.textContent = message;
    }

    /**
     * Xóa lỗi trường nhập liệu
     */
    function clearFieldError(group, errorSpan) {
        if (group) group.classList.remove("has-error");
        if (errorSpan) errorSpan.textContent = "";
    }

    /**
     * Xóa tất cả các lỗi hiển thị trên form
     */
    function clearAllErrors() {
        clearFieldError(emailGroup, emailError);
        clearFieldError(passwordGroup, passwordError);
        hideAlert();
    }

    /**
     * Bật/tắt trạng thái đang xử lý (loading) của nút bấm
     */
    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;

        if (btnSpinner) {
            btnSpinner.style.display = isLoading ? "inline-block" : "none";
        }

        if (btnText) {
            btnText.textContent = isLoading ? "Đang đăng nhập..." : "Đăng nhập";
        }
    }

    /**
     * Kiểm tra định dạng Email hợp lệ
     */
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // =========================================================================
    // 3. XỬ LÝ PHIÊN ĐĂNG NHẬP & LOCALSTORAGE
    // =========================================================================

    /**
     * Kiểm tra xem JWT Token có còn hiệu lực không
     */
    function isTokenValid(token) {
        if (!token || typeof token !== "string") return false;
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return false;
            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            if (!payload.exp) return true;
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
        } catch {
            return false;
        }
    }

    /**
     * Kiểm tra xem người dùng đã đăng nhập chưa khi mở trang
     */
    function checkCurrentSession() {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");

        if (token && userJson && isTokenValid(token)) {
            try {
                const user = JSON.parse(userJson);
                const hoTen = user.hoTen || user.HoTen || user.name || user.email || "Khách hàng";
                const email = user.email || user.Email || "";

                if (alreadyLoggedInBox) {
                    alreadyLoggedInBox.style.display = "block";
                    if (alreadyUserName) alreadyUserName.textContent = `Xin chào, ${hoTen}!`;
                    if (alreadyUserEmail) alreadyUserEmail.textContent = `Bạn đang đăng nhập bằng email: ${email}`;
                    if (alreadyUserAvatar) alreadyUserAvatar.textContent = hoTen.charAt(0).toUpperCase();

                    // Ẩn form chính để khách hàng không bị bối rối
                    if (form) form.style.display = "none";
                }
                return true;
            } catch (e) {
                console.warn("Lỗi đọc dữ liệu người dùng cũ:", e);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("role");
            }
        }
        return false;
    }

    // Xử lý nút Đăng xuất từ thẻ đã đăng nhập
    if (alreadyLogoutBtn) {
        alreadyLogoutBtn.addEventListener("click", function () {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");

            if (alreadyLoggedInBox) alreadyLoggedInBox.style.display = "none";
            if (form) form.style.display = "block";

            showAlert("Đã đăng xuất tài khoản cũ. Mời bạn đăng nhập tài khoản mới.", "info");
            if (emailInput) emailInput.focus();
        });
    }

    // =========================================================================
    // 4. KHỞI TẠO DỮ LIỆU BAN ĐẦU & QUERY PARAMS
    // =========================================================================

    // Đọc URL Params (đăng ký thành công, bắt buộc đăng nhập, redirect...)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get("redirect");
    const isRegistered = urlParams.get("registered");
    const reason = urlParams.get("reason");

    if (isRegistered === "1" || isRegistered === "true") {
        showAlert("Tạo tài khoản thành công! Mời bạn đăng nhập để bắt đầu đặt món.", "success");
    } else if (reason === "require_login") {
        showAlert("Vui lòng đăng nhập để xem giỏ hàng và đặt món.", "info");
    }

    // Tự động điền email nếu người dùng đã chọn Ghi nhớ trước đó
    const savedEmail = localStorage.getItem("fooddeli_remember_email");
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
        if (passwordInput) passwordInput.focus();
    } else if (emailInput) {
        emailInput.focus();
    }

    // Kiểm tra xem khách hàng đã đăng nhập chưa
    checkCurrentSession();

    // =========================================================================
    // 5. TƯƠNG TÁC GIAO DIỆN (TOGGLE PASSWORD, MODAL, LIVE CLEAR ERROR)
    // =========================================================================

    // Ẩn/Hiện mật khẩu
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", function () {
            const isPassword = passwordInput.getAttribute("type") === "password";
            passwordInput.setAttribute("type", isPassword ? "text" : "password");
            togglePasswordBtn.textContent = isPassword ? "🙈" : "👁️";
            togglePasswordBtn.setAttribute("title", isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu");
        });
    }

    // Xóa cảnh báo khi người dùng gõ
    if (emailInput) {
        emailInput.addEventListener("input", function () {
            clearFieldError(emailGroup, emailError);
            hideAlert();
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            clearFieldError(passwordGroup, passwordError);
            hideAlert();
        });
    }

    // Đóng Alert thủ công
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener("click", hideAlert);
    }

    // Modal Quên mật khẩu
    function openForgotModal() {
        if (forgotPasswordModal) forgotPasswordModal.style.display = "flex";
    }

    function closeForgotModal() {
        if (forgotPasswordModal) forgotPasswordModal.style.display = "none";
    }

    if (forgotPasswordBtn) forgotPasswordBtn.addEventListener("click", openForgotModal);
    if (closeForgotModalBtn) closeForgotModalBtn.addEventListener("click", closeForgotModal);
    if (confirmForgotModalBtn) confirmForgotModalBtn.addEventListener("click", closeForgotModal);

    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener("click", function (e) {
            if (e.target === forgotPasswordModal) {
                closeForgotModal();
            }
        });
    }

    // =========================================================================
    // 6. XỬ LÝ SUBMIT ĐĂNG NHẬP & KẾT NỐI BACKEND API
    // =========================================================================

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            clearAllErrors();

            const email = emailInput ? emailInput.value.trim() : "";
            const matKhau = passwordInput ? passwordInput.value : "";

            // --- BƯỚC 1: VALIDATION CLIENT-SIDE ---
            let hasError = false;

            if (!email) {
                setFieldError(emailGroup, emailError, "Vui lòng nhập địa chỉ email.");
                if (!hasError && emailInput) emailInput.focus();
                hasError = true;
            } else if (!isValidEmail(email)) {
                setFieldError(emailGroup, emailError, "Email không hợp lệ (ví dụ: khachhang@gmail.com).");
                if (!hasError && emailInput) emailInput.focus();
                hasError = true;
            }

            if (!matKhau) {
                setFieldError(passwordGroup, passwordError, "Vui lòng nhập mật khẩu của bạn.");
                if (!hasError && passwordInput) passwordInput.focus();
                hasError = true;
            }

            if (hasError) {
                showAlert("Vui lòng điền đầy đủ và chính xác thông tin đăng nhập.", "error");
                return;
            }

            // --- BƯỚC 2: GỬI REQUEST LÊN BACKEND ---
            setLoading(true);

            try {
                const response = await fetch(LOGIN_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        matKhau: matKhau
                    })
                });

                let data;
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    data = await response.json();
                } else {
                    data = { message: await response.text() };
                }

                console.log("Phản hồi từ Backend Auth API:", response.status, data);

                // --- BƯỚC 3: XỬ LÝ LỖI PHẢN HỒI ---
                if (!response.ok) {
                    let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

                    if (response.status === 401) {
                        errorMessage = data.message || "Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa!";
                        setFieldError(passwordGroup, passwordError, "Mật khẩu hoặc email chưa đúng.");
                    } else if (response.status === 429) {
                        errorMessage = "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng chờ 1 phút rồi thử lại!";
                    } else if (data && data.message) {
                        errorMessage = data.message;
                    }

                    showAlert(errorMessage, "error");
                    setLoading(false);
                    return;
                }

                // --- BƯỚC 4: LƯU TOKEN & THÔNG TIN USER ---
                const token = data.token || data.Token;
                if (!token) {
                    showAlert("Hệ thống xác thực thành công nhưng không nhận được mã token. Vui lòng liên hệ hỗ trợ.", "error");
                    setLoading(false);
                    return;
                }

                // Lưu JWT Token
                localStorage.setItem("token", token);

                // Chuẩn bị thông tin User để lưu
                const userObj = {
                    maNguoiDung: data.maNguoiDung || data.MaNguoiDung || "",
                    hoTen: data.hoTen || data.HoTen || data.tenNguoiDung || "Khách hàng",
                    email: data.email || data.Email || email,
                    vaiTro: data.vaiTro || data.VaiTro || ["KhachHang"]
                };

                // Trích xuất và chuẩn hóa Role
                let role = getRoleFromUser(userObj);
                if (!role) {
                    role = getRoleFromJWT(token);
                }
                if (!role) {
                    role = "KhachHang"; // Mặc định khách hàng
                }

                userObj.role = role;
                localStorage.setItem("user", JSON.stringify(userObj));
                localStorage.setItem("role", role);

                // Ghi nhớ Email nếu được chọn
                if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                    localStorage.setItem("fooddeli_remember_email", email);
                } else {
                    localStorage.removeItem("fooddeli_remember_email");
                }

                // --- BƯỚC 5: THÔNG BÁO THÀNH CÔNG VÀ ĐIỀU HƯỚNG ---
                showAlert(`🎉 Đăng nhập thành công! Chào mừng ${userObj.hoTen}. Đang chuyển hướng...`, "success");

                setTimeout(function () {
                    redirectAfterLogin(role, redirectParam);
                }, 700);

            } catch (error) {
                console.error("Lỗi kết nối Backend:", error);
                showAlert(
                    "Không thể kết nối đến máy chủ Backend (https://localhost:7135). Vui lòng kiểm tra lại dịch vụ Backend đang chạy!",
                    "error"
                );
                setLoading(false);
            }
        });
    }

    // =========================================================================
    // 7. CÁC HÀM XÁC ĐỊNH ROLE & ĐIỀU HƯỚNG
    // =========================================================================

    /**
     * Điều hướng thông minh sau khi đăng nhập thành công
     */
    function redirectAfterLogin(role, customRedirectUrl) {
        // Nếu có custom redirect an toàn
        if (customRedirectUrl && isValidRedirectUrl(customRedirectUrl)) {
            window.location.href = customRedirectUrl;
            return;
        }

        // Điều hướng theo Role
        switch (role) {
            case "KhachHang":
                // Chuyển về trang chủ mua hàng của khách
                window.location.href = "../index.html";
                break;

            case "Admin":
            case "QuanLy":
            case "ChuShop":
                // Tài khoản quản trị chuyển về trang Admin
                window.location.href = "../admin/index.html";
                break;

            default:
                window.location.href = "../index.html";
                break;
        }
    }

    /**
     * Kiểm tra URL redirect hợp lệ
     */
    function isValidRedirectUrl(url) {
        if (!url || typeof url !== "string") return false;
        // Tránh open-redirect vulnerability: chỉ chấp nhận relative path
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return false;
        }
        return true;
    }

    /**
     * Lấy role từ thông tin User
     */
    function getRoleFromUser(user) {
        if (!user) return "";
        let role = user.vaiTro || user.VaiTro || user.role || user.Role || user.tenVaiTro || user.TenVaiTro;

        if (Array.isArray(role) && role.length > 0) {
            role = role[0];
        }

        if (typeof role === "object" && role !== null) {
            role = role.tenVaiTro || role.TenVaiTro || role.name || role.Name || role.role || role.Role;
        }

        return normalizeRole(role);
    }

    /**
     * Lấy role từ JWT Payload khi cần thiết
     */
    function getRoleFromJWT(token) {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return "";
            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

            let role = payload.role || payload.Role ||
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

            if (Array.isArray(role) && role.length > 0) {
                role = role[0];
            }

            return normalizeRole(role);
        } catch {
            return "";
        }
    }

    /**
     * Chuẩn hóa chuỗi Role thành định dạng thống nhất
     */
    function normalizeRole(role) {
        if (!role) return "";
        const val = String(role).trim().toLowerCase();

        if (val === "khachhang" || val === "khách hàng" || val === "customer" || val === "user") {
            return "KhachHang";
        }
        if (val === "admin" || val === "administrator") {
            return "Admin";
        }
        if (val === "quanly" || val === "quản lý" || val === "manager") {
            return "QuanLy";
        }
        if (val === "chushop" || val === "chủ shop" || val === "shopowner") {
            return "ChuShop";
        }

        return String(role).trim();
    }
});