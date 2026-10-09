// =====================================================
// FOODDELI - DASHBOARD CHUSHOP
// =====================================================

const API_BASE = "https://localhost:7135/api";

// =====================================================
// LẤY TOKEN
// =====================================================

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt") ||
        ""
    );
}

// =====================================================
// LẤY USER ĐANG ĐĂNG NHẬP
// =====================================================

function getCurrentUser() {
    try {
        const user = JSON.parse(
            localStorage.getItem("user") || "null"
        );

        return user;
    }
    catch (error) {
        console.error(
            "Không đọc được thông tin user:",
            error
        );

        return null;
    }
}

// =====================================================
// LẤY MÃ NGƯỜI DÙNG
// =====================================================

function getUserId() {
    const user = getCurrentUser();

    if (!user) {
        return "";
    }

    return (
        user.maNguoiDung ||
        user.MaNguoiDung ||
        user.userId ||
        user.UserId ||
        user.id ||
        user.Id ||
        ""
    );
}

// =====================================================
// HEADER
// =====================================================

function getHeaders() {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// =====================================================
// API REQUEST
// =====================================================

async function apiRequest(url, options = {}) {

    const response = await fetch(
        url,
        {
            ...options,
            headers: {
                ...getHeaders(),
                ...(options.headers || {})
            }
        }
    );

    let data = null;

    try {
        data = await response.json();
    }
    catch (error) {
        data = null;
    }

    // -------------------------------------------------
    // 401
    // -------------------------------------------------

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");

        alert(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );

        window.location.href =
            "../pages/dang-nhap.html";

        throw new Error(
            "Unauthorized"
        );
    }

    // -------------------------------------------------
    // 403
    // -------------------------------------------------

    if (response.status === 403) {

        throw new Error(
            "Bạn không có quyền thực hiện thao tác này."
        );
    }

    // -------------------------------------------------
    // LỖI KHÁC
    // -------------------------------------------------

    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.Message ||
            `HTTP ${response.status}`
        );
    }

    return data;
}

// =====================================================
// LẤY GIÁ TRỊ KHÔNG PHÂN BIỆT HOA THƯỜNG
// =====================================================

function getValue(object, ...keys) {

    if (!object) {
        return "";
    }

    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {
            return object[key];
        }
    }

    return "";
}

// =====================================================
// FORMAT TIỀN
// =====================================================

function formatMoney(value) {

    const number = Number(value || 0);

    return (
        number.toLocaleString("vi-VN") +
        " ₫"
    );
}

// =====================================================
// FORMAT NGÀY
// =====================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    try {

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("vi-VN");

    }
    catch (error) {

        return value;
    }
}

// =====================================================
// CHUYỂN TRẠNG THÁI SANG CHỮ
// =====================================================

function getTrangThaiText(trangThai) {

    const status = Number(trangThai);

    switch (status) {

        case 1:
            return "Chờ xác nhận";

        case 2:
            return "Đã xác nhận";

        case 3:
            return "Đang giao";

        case 4:
            return "Hoàn thành";

        case 5:
            return "Đã hủy";

        default:
            return String(
                trangThai || "Không xác định"
            );
    }
}

// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        // -------------------------------------------------
        // Kiểm tra đăng nhập
        // -------------------------------------------------

        const token = getToken();

        if (!token) {

            alert(
                "Vui lòng đăng nhập bằng tài khoản ChuShop."
            );

            window.location.href =
                "../pages/dang-nhap.html";

            return;
        }

        // -------------------------------------------------
        // Lấy thông tin user
        // -------------------------------------------------

        const userId = getUserId();

        console.log(
            "Mã người dùng hiện tại:",
            userId
        );

        if (!userId) {

            throw new Error(
                "Không xác định được mã người dùng."
            );
        }

        // -------------------------------------------------
        // Lấy toàn bộ cửa hàng
        // GET /api/CuaHang
        // -------------------------------------------------

        const data =
            await apiRequest(
                `${API_BASE}/CuaHang`
            );

        console.log(
            "Danh sách cửa hàng:",
            data
        );

        const danhSachCuaHang =
            Array.isArray(data)
                ? data
                : (
                    data?.data ||
                    data?.items ||
                    data?.result ||
                    []
                );

        // -------------------------------------------------
        // Tìm cửa hàng của ChuShop
        // -------------------------------------------------

        const cuaHang =
            danhSachCuaHang.find(
                function (item) {

                    const maChuShop =
                        getValue(
                            item,
                            "maChuShop",
                            "MaChuShop"
                        );

                    return (
                        String(maChuShop)
                            .toLowerCase()
                        ===
                        String(userId)
                            .toLowerCase()
                    );
                }
            );

        if (!cuaHang) {

            throw new Error(
                "Không tìm thấy cửa hàng thuộc tài khoản ChuShop này."
            );
        }

        console.log(
            "Cửa hàng của ChuShop:",
            cuaHang
        );

        // -------------------------------------------------
        // Hiển thị thông tin cửa hàng
        // -------------------------------------------------

        hienThiCuaHang(
            cuaHang
        );

        // -------------------------------------------------
        // Lấy món ăn của cửa hàng
        // -------------------------------------------------

        const maCuaHang =
            getValue(
                cuaHang,
                "maCuaHang",
                "MaCuaHang"
            );

        if (maCuaHang) {

            try {

                const monAnData =
                    await apiRequest(
                        `${API_BASE}/MonAn/CuaHang/${encodeURIComponent(
                            maCuaHang
                        )}`
                    );

                const danhSachMonAn =
                    Array.isArray(monAnData)
                        ? monAnData
                        : (
                            monAnData?.data ||
                            monAnData?.items ||
                            []
                        );

                console.log(
                    "Món ăn của cửa hàng:",
                    danhSachMonAn
                );

                console.log(
                    "Tổng số món:",
                    danhSachMonAn.length
                );

            }
            catch (error) {

                console.warn(
                    "Không lấy được danh sách món ăn:",
                    error
                );
            }
        }

        // =================================================
        // LẤY ĐƠN HÀNG CỦA CHUSHOP
        // GET /api/DonHang/chushop
        // =================================================

        console.log(
            "Đang lấy đơn hàng của ChuShop..."
        );

        const donHangData =
            await apiRequest(
                `${API_BASE}/DonHang/chushop`
            );

        console.log(
            "Đơn hàng của ChuShop:",
            donHangData
        );

        const danhSachDonHang =
            Array.isArray(donHangData)
                ? donHangData
                : (
                    donHangData?.data ||
                    donHangData?.items ||
                    donHangData?.result ||
                    []
                );

        // -------------------------------------------------
        // Hiển thị thống kê
        // -------------------------------------------------

        hienThiThongKe(
            danhSachDonHang
        );

        // -------------------------------------------------
        // Hiển thị đơn hàng gần đây
        // -------------------------------------------------

        hienThiDonHangGanDay(
            danhSachDonHang
        );

    }
    catch (error) {

        console.error(
            "Lỗi Dashboard ChuShop:",
            error
        );

        hienThiLoi(
            error.message ||
            "Không thể tải Dashboard ChuShop."
        );
    }
}

// =====================================================
// HIỂN THỊ CỬA HÀNG
// =====================================================

function hienThiCuaHang(cuaHang) {

    const maCuaHang =
        getValue(
            cuaHang,
            "maCuaHang",
            "MaCuaHang"
        );

    const tenCuaHang =
        getValue(
            cuaHang,
            "tenCuaHang",
            "TenCuaHang"
        );

    const soDienThoai =
        getValue(
            cuaHang,
            "soDienThoai",
            "SoDienThoai"
        );

    const trangThai =
        getValue(
            cuaHang,
            "trangThai",
            "TrangThai"
        );

    const elementMa =
        document.getElementById(
            "maCuaHang"
        );

    const elementTen =
        document.getElementById(
            "tenCuaHang"
        );

    const elementPhone =
        document.getElementById(
            "soDienThoai"
        );

    const elementStatus =
        document.getElementById(
            "trangThaiCuaHang"
        );

    if (elementMa) {

        elementMa.textContent =
            maCuaHang || "—";
    }

    if (elementTen) {

        elementTen.textContent =
            tenCuaHang || "—";
    }

    if (elementPhone) {

        elementPhone.textContent =
            soDienThoai || "—";
    }

    if (elementStatus) {

        elementStatus.textContent =
            trangThai || "—";
    }
}

// =====================================================
// THỐNG KÊ ĐƠN HÀNG
// =====================================================

function hienThiThongKe(danhSachDonHang) {

    if (!Array.isArray(danhSachDonHang)) {
        danhSachDonHang = [];
    }

    // -------------------------------------------------
    // Các trạng thái
    // -------------------------------------------------

    let tongDon = danhSachDonHang.length;

    let choXacNhan = 0;

    let dangGiao = 0;

    let hoanThanh = 0;

    let doanhThu = 0;

    danhSachDonHang.forEach(
        function (donHang) {

            const trangThai =
                Number(
                    getValue(
                        donHang,
                        "trangThai",
                        "TrangThai"
                    )
                );

            // Trạng thái 1 = Chờ xác nhận
            if (trangThai === 1) {
                choXacNhan++;
            }

            // Trạng thái 3 = Đang giao
            if (trangThai === 3) {
                dangGiao++;
            }

            // Trạng thái 4 = Hoàn thành
            if (trangThai === 4) {

                hoanThanh++;

                const thanhTien =
                    Number(
                        getValue(
                            donHang,
                            "thanhTien",
                            "ThanhTien"
                        ) || 0
                    );

                doanhThu += thanhTien;
            }
        }
    );

    console.log(
        "Thống kê ChuShop:",
        {
            tongDon,
            choXacNhan,
            dangGiao,
            hoanThanh,
            doanhThu
        }
    );

    // -------------------------------------------------
    // Gán lên giao diện
    // -------------------------------------------------

    const elementTongDon =
        document.getElementById(
            "tongSoDonHang"
        );

    const elementChoXacNhan =
        document.getElementById(
            "donChoXacNhan"
        );

    const elementDangGiao =
        document.getElementById(
            "donDangGiao"
        );

    const elementHoanThanh =
        document.getElementById(
            "donHoanThanh"
        );

    const elementDoanhThu =
        document.getElementById(
            "doanhThu"
        );

    if (elementTongDon) {

        elementTongDon.textContent =
            tongDon;
    }

    if (elementChoXacNhan) {

        elementChoXacNhan.textContent =
            choXacNhan;
    }

    if (elementDangGiao) {

        elementDangGiao.textContent =
            dangGiao;
    }

    if (elementHoanThanh) {

        elementHoanThanh.textContent =
            hoanThanh;
    }

    if (elementDoanhThu) {

        elementDoanhThu.textContent =
            formatMoney(doanhThu);
    }
}

// =====================================================
// HIỂN THỊ ĐƠN HÀNG GẦN ĐÂY
// =====================================================

function hienThiDonHangGanDay(
    danhSachDonHang
) {

    const tbody =
        document.getElementById(
            "donHangGanDay"
        );

    if (!tbody) {
        return;
    }

    if (
        !Array.isArray(danhSachDonHang) ||
        danhSachDonHang.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="loading-cell"
                >
                    Chưa có đơn hàng
                </td>
            </tr>
        `;

        return;
    }

    // -------------------------------------------------
    // Sắp xếp đơn mới nhất
    // -------------------------------------------------

    const danhSachSapXep =
        [...danhSachDonHang].sort(
            function (a, b) {

                const ngayA =
                    new Date(
                        getValue(
                            a,
                            "ngayDat",
                            "NgayDat"
                        ) || 0
                    );

                const ngayB =
                    new Date(
                        getValue(
                            b,
                            "ngayDat",
                            "NgayDat"
                        ) || 0
                    );

                return ngayB - ngayA;
            }
        );

    // -------------------------------------------------
    // Lấy 5 đơn gần nhất
    // -------------------------------------------------

    const donGanDay =
        danhSachSapXep.slice(0, 5);

    tbody.innerHTML = "";

    donGanDay.forEach(
        function (donHang) {

            const maDonHang =
                getValue(
                    donHang,
                    "maDonHang",
                    "MaDonHang"
                );

            const tongTien =
                getValue(
                    donHang,
                    "thanhTien",
                    "ThanhTien"
                );

            const trangThai =
                getValue(
                    donHang,
                    "trangThai",
                    "TrangThai"
                );

            const ngayDat =
                getValue(
                    donHang,
                    "ngayDat",
                    "NgayDat"
                );

            const ghiChu =
                getValue(
                    donHang,
                    "ghiChu",
                    "GhiChu"
                );

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${maDonHang || "—"}
                </td>

                <td>
                    ${formatMoney(tongTien)}
                </td>

                <td>
                    ${getTrangThaiText(trangThai)}
                </td>

                <td>
                    ${formatDate(ngayDat)}
                </td>

                <td>
                    ${ghiChu || "—"}
                </td>
            `;

            tbody.appendChild(row);
        }
    );
}

// =====================================================
// HIỂN THỊ LỖI
// =====================================================

function hienThiLoi(message) {

    const tbody =
        document.getElementById(
            "donHangGanDay"
        );

    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="loading-cell"
                >
                    ${message}
                </td>
            </tr>
        `;
    }
}

// =====================================================
// ĐĂNG XUẤT
// =====================================================

function dangXuat() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "jwt"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "../pages/dang-nhap.html";
}

// =====================================================
// KHỞI TẠO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const logoutButton =
            document.getElementById(
                "chushopLogout"
            );

        logoutButton?.addEventListener(
            "click",
            dangXuat
        );

        await loadDashboard();

    }
);