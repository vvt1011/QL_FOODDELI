const API_BASE = "https://localhost:7135/api";

let danhSachDonHang = [];


/* =========================
   KIỂM TRA ĐĂNG NHẬP
========================= */

function kiemTraDangNhap() {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
        window.location.href = "dang-nhap.html";
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem("user");
        window.location.href = "dang-nhap.html";
        return null;
    }
}


/* =========================
   FORMAT TIỀN
========================= */

function formatTien(value) {

    const soTien = Number(value || 0);

    return soTien.toLocaleString("vi-VN") + " đ";
}


/* =========================
   FORMAT NGÀY
========================= */

function formatNgay(value) {

    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("vi-VN");
}


/* =========================
   LẤY USER ID
========================= */

function layMaNguoiDung(user) {

    return (
        user.maNguoiDung ||
        user.MaNguoiDung ||
        user.id ||
        user.Id ||
        ""
    );
}


/* =========================
   LẤY ĐƠN HÀNG CHỦ SHOP
========================= */

async function layDonHang() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_BASE}/DonHang/chushop`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            const text = await response.text();

            throw new Error(
                text || `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        danhSachDonHang = Array.isArray(data)
            ? data
            : [];

        xuLyDoanhThu();

    } catch (error) {

        console.error(
            "Lỗi lấy đơn hàng:",
            error
        );

        document.getElementById(
            "doanhThuTableBody"
        ).innerHTML = `
            <tr>
                <td colspan="7"
                    class="doanh-thu-empty">
                    Không thể tải dữ liệu doanh thu
                </td>
            </tr>
        `;
    }
}


/* =========================
   XỬ LÝ DOANH THU
========================= */

function xuLyDoanhThu() {

    /*
       TrangThai:
       1 = Chờ xác nhận
       2 = Đã xác nhận
       3 = Đang giao
       4 = Hoàn thành
       5 = Đã hủy

       Chỉ tính doanh thu đơn hoàn thành
    */

    const donHoanThanh =
        danhSachDonHang.filter(
            don => Number(don.trangThai) === 4
        );


    /* TỔNG DOANH THU */

    const tongDoanhThu =
        donHoanThanh.reduce(
            (tong, don) => {
                return tong + Number(
                    don.thanhTien || 0
                );
            },
            0
        );


    /* DOANH THU HÔM NAY */

    const homNay = new Date();

    const ngay =
        homNay.getDate();

    const thang =
        homNay.getMonth();

    const nam =
        homNay.getFullYear();


    const doanhThuHomNay =
        donHoanThanh.reduce(
            (tong, don) => {

                if (!don.ngayDat) {
                    return tong;
                }

                const date =
                    new Date(don.ngayDat);

                if (
                    date.getDate() === ngay &&
                    date.getMonth() === thang &&
                    date.getFullYear() === nam
                ) {
                    return tong +
                        Number(
                            don.thanhTien || 0
                        );
                }

                return tong;
            },
            0
        );


    /* HIỂN THỊ */

    document.getElementById(
        "tongDoanhThu"
    ).textContent =
        formatTien(tongDoanhThu);


    document.getElementById(
        "doanhThuHomNay"
    ).textContent =
        formatTien(doanhThuHomNay);


    document.getElementById(
        "donHoanThanh"
    ).textContent =
        donHoanThanh.length;


    hienThiBangDoanhThu(
        donHoanThanh
    );
}


/* =========================
   HIỂN THỊ BẢNG
========================= */

function hienThiBangDoanhThu(
    donHoanThanh
) {

    const tbody =
        document.getElementById(
            "doanhThuTableBody"
        );

    if (!donHoanThanh.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="doanh-thu-empty">
                    Chưa có đơn hàng hoàn thành
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        donHoanThanh.map(
            (don, index) => {

                const maDon =
                    don.maDonHang ||
                    don.MaDonHang ||
                    "";

                const ngayDat =
                    don.ngayDat ||
                    don.NgayDat ||
                    "";

                const tongTien =
                    Number(
                        don.tongTien ||
                        don.TongTien ||
                        0
                    );

                const phiGiaoHang =
                    Number(
                        don.phiGiaoHang ||
                        don.PhiGiaoHang ||
                        0
                    );

                const giamGia =
                    Number(
                        don.giamGia ||
                        don.GiamGia ||
                        0
                    );

                const thanhTien =
                    Number(
                        don.thanhTien ||
                        don.ThanhTien ||
                        0
                    );


                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${maDon}
                        </td>

                        <td>
                            ${formatNgay(ngayDat)}
                        </td>

                        <td>
                            ${formatTien(tongTien)}
                        </td>

                        <td>
                            ${formatTien(phiGiaoHang)}
                        </td>

                        <td>
                            ${formatTien(giamGia)}
                        </td>

                        <td>
                            <strong>
                                ${formatTien(thanhTien)}
                            </strong>
                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* =========================
   ĐĂNG XUẤT
========================= */

function dangXuat() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "dang-nhap.html";
}


/* =========================
   KHỞI CHẠY
========================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const user =
            kiemTraDangNhap();

        if (!user) {
            return;
        }

        const logoutButton =
            document.getElementById(
                "chushopLogout"
            );

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                dangXuat
            );
        }

        await layDonHang();
    }
);