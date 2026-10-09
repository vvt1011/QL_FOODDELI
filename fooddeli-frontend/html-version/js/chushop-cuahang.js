const API_BASE = "https://localhost:7135/api";

let cuaHangHienTai = null;


// =====================================================
// LẤY TOKEN
// =====================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        ""
    );
}


// =====================================================
// LẤY USER
// =====================================================

function getCurrentUser() {

    const userStr = localStorage.getItem("user");

    if (!userStr) {
        return null;
    }

    try {

        return JSON.parse(userStr);

    } catch (error) {

        console.error("Lỗi đọc user:", error);

        return null;
    }
}


// =====================================================
// LẤY MÃ NGƯỜI DÙNG
// =====================================================

function getUserId(user) {

    if (!user) {
        return null;
    }

    return (
        user.maNguoiDung ||
        user.MaNguoiDung ||
        user.id ||
        user.Id ||
        null
    );
}


// =====================================================
// HIỂN THỊ THÔNG BÁO
// =====================================================

function showMessage(message, type = "success") {

    const box = document.getElementById("messageBox");

    if (!box) {
        return;
    }

    box.style.display = "block";

    box.textContent = message;

    box.className = "shop-message " + type;

    setTimeout(() => {

        box.style.display = "none";

    }, 4000);
}


// =====================================================
// LOAD CỬA HÀNG
// =====================================================

async function loadCuaHang() {

    try {

        const user = getCurrentUser();

        if (!user) {

            alert("Bạn chưa đăng nhập.");

            window.location.href = "pages/dang-nhap.html";

            return;
        }


        const userId = getUserId(user);

        if (!userId) {

            showMessage(
                "Không xác định được mã người dùng.",
                "error"
            );

            return;
        }


        const token = getToken();

        const response = await fetch(
            `${API_BASE}/CuaHang`,
            {
                method: "GET",

                headers: token
                    ? {
                        "Authorization":
                            `Bearer ${token}`
                    }
                    : {}
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const cuaHangs = await response.json();


        // Tìm cửa hàng thuộc ChuShop hiện tại
        cuaHangHienTai = cuaHangs.find(
            item =>
                String(item.maChuShop || "")
                    .toLowerCase() ===
                String(userId)
                    .toLowerCase()
        );


        if (!cuaHangHienTai) {

            showMessage(
                "Tài khoản ChuShop chưa có cửa hàng.",
                "error"
            );

            return;
        }


        fillForm(cuaHangHienTai);

        updatePreview();

    } catch (error) {

        console.error(
            "Lỗi load cửa hàng:",
            error
        );

        showMessage(
            "Không thể tải thông tin cửa hàng.",
            "error"
        );
    }
}


// =====================================================
// ĐIỀN FORM
// =====================================================

function fillForm(cuaHang) {

    document.getElementById("maCuaHang").value =
        cuaHang.maCuaHang || "";


    document.getElementById("maChuShop").value =
        cuaHang.maChuShop || "";


    document.getElementById("tenCuaHang").value =
        cuaHang.tenCuaHang || "";


    document.getElementById("soDienThoai").value =
        cuaHang.soDienThoai || "";


    document.getElementById("trangThai").value =
        cuaHang.trangThai ?? 1;


    document.getElementById("diaChi").value =
        cuaHang.diaChi || "";


    document.getElementById("moTa").value =
        cuaHang.moTa || "";


    document.getElementById("anhCuaHang").value =
        cuaHang.anhCuaHang || "";


    updateImagePreview();
}


// =====================================================
// CẬP NHẬT PREVIEW
// =====================================================

function updatePreview() {

    const tenCuaHang =
        document.getElementById("tenCuaHang").value.trim();


    const soDienThoai =
        document.getElementById("soDienThoai").value.trim();


    const diaChi =
        document.getElementById("diaChi").value.trim();


    const moTa =
        document.getElementById("moTa").value.trim();


    const trangThai =
        document.getElementById("trangThai").value;


    document.getElementById(
        "previewTenCuaHang"
    ).textContent =
        tenCuaHang || "Cửa hàng của tôi";


    document.getElementById(
        "previewSoDienThoai"
    ).textContent =
        soDienThoai ||
        "Chưa có số điện thoại";


    document.getElementById(
        "previewDiaChi"
    ).textContent =
        diaChi ||
        "Chưa có địa chỉ";


    document.getElementById(
        "previewMoTa"
    ).textContent =
        moTa ||
        "Chưa có mô tả.";


    const statusElement =
        document.getElementById(
            "previewTrangThai"
        );


    if (String(trangThai) === "1") {

        statusElement.textContent =
            "Đang hoạt động";

        statusElement.className =
            "shop-status active";

    } else {

        statusElement.textContent =
            "Tạm đóng";

        statusElement.className =
            "shop-status inactive";
    }


    updateImagePreview();
}


// =====================================================
// PREVIEW ẢNH FORM
// =====================================================

function updateImagePreview() {

    const url =
        document.getElementById(
            "anhCuaHang"
        ).value.trim();


    const preview =
        document.getElementById(
            "imagePreview"
        );


    const image =
        document.getElementById(
            "previewImage"
        );


    const cardImage =
        document.getElementById(
            "previewCardImage"
        );


    const noImage =
        document.getElementById(
            "previewNoImage"
        );


    if (!url) {

        preview.style.display = "none";

        cardImage.style.display = "none";

        noImage.style.display = "flex";

        return;
    }


    image.src = url;

    cardImage.src = url;


    image.onload = function () {

        preview.style.display = "block";

        cardImage.style.display = "block";

        noImage.style.display = "none";
    };


    image.onerror = function () {

        preview.style.display = "none";

        cardImage.style.display = "none";

        noImage.style.display = "flex";
    };
}


// =====================================================
// LƯU CỬA HÀNG
// =====================================================

async function updateCuaHang(event) {

    event.preventDefault();


    if (!cuaHangHienTai) {

        showMessage(
            "Chưa tải được thông tin cửa hàng.",
            "error"
        );

        return;
    }


    const maCuaHang =
        document.getElementById(
            "maCuaHang"
        ).value;


    const tenCuaHang =
        document.getElementById(
            "tenCuaHang"
        ).value.trim();


    const soDienThoai =
        document.getElementById(
            "soDienThoai"
        ).value.trim();


    const trangThai =
        Number(
            document.getElementById(
                "trangThai"
            ).value
        );


    const diaChi =
        document.getElementById(
            "diaChi"
        ).value.trim();


    const moTa =
        document.getElementById(
            "moTa"
        ).value.trim();


    const anhCuaHang =
        document.getElementById(
            "anhCuaHang"
        ).value.trim();


    if (!tenCuaHang) {

        showMessage(
            "Vui lòng nhập tên cửa hàng.",
            "error"
        );

        return;
    }


    if (!soDienThoai) {

        showMessage(
            "Vui lòng nhập số điện thoại.",
            "error"
        );

        return;
    }


    const token = getToken();

    if (!token) {

        alert("Phiên đăng nhập đã hết.");

        window.location.href =
            "pages/dang-nhap.html";

        return;
    }


    const btn =
        document.getElementById(
            "btnLuu"
        );


    btn.disabled = true;

    btn.textContent = "Đang lưu...";


    const data = {

        maCuaHang: maCuaHang,

        maChuShop:
            cuaHangHienTai.maChuShop,

        tenCuaHang: tenCuaHang,

        soDienThoai: soDienThoai,

        trangThai: trangThai,

        diaChi: diaChi,

        moTa: moTa,

        anhCuaHang: anhCuaHang

    };


    try {

        const response = await fetch(
            `${API_BASE}/CuaHang/${encodeURIComponent(maCuaHang)}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify(data)
            }
        );


        const result =
            await response.json()
                .catch(() => ({}));


        if (!response.ok) {

            console.error(
                "Update CuaHang:",
                result
            );

            throw new Error(
                result.message ||
                `HTTP ${response.status}`
            );
        }


        showMessage(
            "Cập nhật cửa hàng thành công!",
            "success"
        );


        // Cập nhật object hiện tại
        cuaHangHienTai = {

            ...cuaHangHienTai,

            ...data

        };


        updatePreview();


    } catch (error) {

        console.error(
            "Lỗi cập nhật cửa hàng:",
            error
        );

        showMessage(
            error.message ||
            "Không thể cập nhật cửa hàng.",
            "error"
        );

    } finally {

        btn.disabled = false;

        btn.textContent =
            "Lưu thay đổi";
    }
}


// =====================================================
// ĐĂNG XUẤT
// =====================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("accessToken");

    localStorage.removeItem("user");

    localStorage.removeItem("role");

    window.location.href =
        "pages/dang-nhap.html";
}


// =====================================================
// SỰ KIỆN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCuaHang();


        document
            .getElementById(
                "cuaHangForm"
            )
            .addEventListener(
                "submit",
                updateCuaHang
            );


        document
            .getElementById(
                "chushopLogout"
            )
            .addEventListener(
                "click",
                logout
            );


        document
            .getElementById(
                "btnQuayLai"
            )
            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        "chushop.html";

                }
            );


        [
            "tenCuaHang",
            "soDienThoai",
            "diaChi",
            "moTa",
            "trangThai"
        ].forEach(id => {

            document
                .getElementById(id)
                .addEventListener(
                    "input",
                    updatePreview
                );

            document
                .getElementById(id)
                .addEventListener(
                    "change",
                    updatePreview
                );
        });


        document
            .getElementById(
                "anhCuaHang"
            )
            .addEventListener(
                "input",
                updateImagePreview
            );
    }
);