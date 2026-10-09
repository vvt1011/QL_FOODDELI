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

        window.location.href =
            "dang-nhap.html";

        return null;
    }
}


/* =========================
   FORMAT TIỀN
========================= */

function formatTien(value) {

    return Number(value || 0)
        .toLocaleString("vi-VN") + " đ";
}


/* =========================
   FORMAT NGÀY
========================= */

function formatNgay(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("vi-VN");
}


/* =========================
   LẤY TÊN TRẠNG THÁI
========================= */

function layTenTrangThai(trangThai) {

    switch (Number(trangThai)) {

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
            return "Không xác định";
    }
}


/* =========================
   CLASS TRẠNG THÁI
========================= */

function layClassTrangThai(trangThai) {

    switch (Number(trangThai)) {

        case 1:
            return "pending";

        case 2:
            return "confirmed";

        case 3:
            return "shipping";

        case 4:
            return "completed";

        case 5:
            return "cancelled";

        default:
            return "";
    }
}


/* =========================
   LẤY ĐƠN HÀNG CHỦ SHOP
========================= */

async function layDonHang() {

    const token =
        localStorage.getItem("token");

    const tbody =
        document.getElementById(
            "donHangTableBody"
        );

    if (!tbody) {

        console.error(
            "Không tìm thấy #donHangTableBody"
        );

        return;
    }


    tbody.innerHTML = `
        <tr>
            <td colspan="6"
                style="text-align:center;">
                Đang tải đơn hàng...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE}/DonHang/chushop`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text ||
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        danhSachDonHang =
            Array.isArray(data)
                ? data
                : [];


        hienThiDonHang(
            danhSachDonHang
        );


    } catch (error) {

        console.error(
            "Lỗi lấy đơn hàng:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;">
                    Không thể tải danh sách đơn hàng
                </td>
            </tr>
        `;
    }
}


/* =========================
   HIỂN THỊ ĐƠN HÀNG
========================= */

function hienThiDonHang(
    danhSach
) {

    const tbody =
        document.getElementById(
            "donHangTableBody"
        );


    if (!danhSach.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#777;
                    ">
                    Chưa có đơn hàng
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        danhSach.map(
            (don) => {

                const maDonHang =
                    don.maDonHang ||
                    don.MaDonHang ||
                    "";


                const hoTen =
                    don.hoTen ||
                    don.HoTen ||
                    don.tenNguoiDung ||
                    don.TenNguoiDung ||
                    don.tenKhachHang ||
                    don.TenKhachHang ||
                    "Khách hàng";


                const ngayDat =
                    don.ngayDat ||
                    don.NgayDat ||
                    "";


                const thanhTien =
                    don.thanhTien ??
                    don.ThanhTien ??
                    0;


                const trangThai =
                    don.trangThai ??
                    don.TrangThai ??
                    0;


                return `
                    <tr>

                        <td>
                            <strong>
                                ${maDonHang}
                            </strong>
                        </td>

                        <td>
                            ${hoTen}
                        </td>

                        <td>
                            ${formatNgay(
                                ngayDat
                            )}
                        </td>

                        <td>
                            ${formatTien(
                                thanhTien
                            )}
                        </td>

                        <td>
                            <span
                                class="shop-status ${layClassTrangThai(trangThai)}">
                                ${layTenTrangThai(
                                    trangThai
                                )}
                            </span>
                        </td>

                        <td>

                            <button
                                class="admin-btn secondary"
                                onclick="xemChiTietDonHang('${maDonHang}')">
                                Xem
                            </button>

                            ${taoNutTrangThai(
                                maDonHang,
                                trangThai
                            )}

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* =========================
   TẠO NÚT TRẠNG THÁI
========================= */

function taoNutTrangThai(
    maDonHang,
    trangThai
) {

    trangThai =
        Number(trangThai);


    /* CHỜ XÁC NHẬN */

    if (trangThai === 1) {

        return `
            <button
                class="admin-btn primary"
                onclick="capNhatTrangThai('${maDonHang}', 2)">
                Xác nhận
            </button>
        `;
    }


    /* ĐÃ XÁC NHẬN */

    if (trangThai === 2) {

        return `
            <button
                class="admin-btn primary"
                onclick="capNhatTrangThai('${maDonHang}', 3)">
                Giao hàng
            </button>
        `;
    }


    /* ĐANG GIAO */

    if (trangThai === 3) {

        return `
            <button
                class="admin-btn primary"
                onclick="capNhatTrangThai('${maDonHang}', 4)">
                Hoàn thành
            </button>
        `;
    }


    /* HOÀN THÀNH / ĐÃ HỦY */

    return "";
}


/* =========================
   CẬP NHẬT TRẠNG THÁI
========================= */

async function capNhatTrangThai(
    maDonHang,
    trangThaiMoi
) {

    const tenTrangThai =
        layTenTrangThai(trangThaiMoi);


    if (
        !confirm(
            `Bạn có chắc muốn chuyển đơn ${maDonHang} sang "${tenTrangThai}"?`
        )
    ) {
        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const response =
            await fetch(
                `${API_BASE}/DonHang/cap-nhat-trang-thai/${maDonHang}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        TrangThaiMoi: trangThaiMoi
                    })
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            console.error(
                "API trả về:",
                text
            );

            throw new Error(
                text ||
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Cập nhật thành công:",
            data
        );


        alert(
            "Cập nhật trạng thái thành công!"
        );


        await layDonHang();


    } catch (error) {

        console.error(
            "Lỗi cập nhật trạng thái:",
            error
        );


        alert(
            "Không thể cập nhật trạng thái đơn hàng."
        );
    }
}


/* =========================
   XEM CHI TIẾT
========================= */

function xemChiTietDonHang(
    maDonHang
) {

    const don =
        danhSachDonHang.find(
            x =>
                (
                    x.maDonHang ||
                    x.MaDonHang
                ) === maDonHang
        );


    if (!don) {

        alert(
            "Không tìm thấy đơn hàng."
        );

        return;
    }


    const tongTien =
        don.tongTien ??
        don.TongTien ??
        0;


    const phiGiaoHang =
        don.phiGiaoHang ??
        don.PhiGiaoHang ??
        0;


    const giamGia =
        don.giamGia ??
        don.GiamGia ??
        0;


    const thanhTien =
        don.thanhTien ??
        don.ThanhTien ??
        0;


    const trangThai =
        don.trangThai ??
        don.TrangThai ??
        0;


    const ghiChu =
        don.ghiChu ||
        don.GhiChu ||
        "Không có";


    alert(
        `ĐƠN HÀNG: ${maDonHang}\n\n` +

        `Ngày đặt: ${
            formatNgay(
                don.ngayDat ||
                don.NgayDat
            )
        }\n` +

        `Trạng thái: ${
            layTenTrangThai(
                trangThai
            )
        }\n\n` +

        `Tổng tiền: ${
            formatTien(
                tongTien
            )
        }\n` +

        `Phí giao hàng: ${
            formatTien(
                phiGiaoHang
            )
        }\n` +

        `Giảm giá: ${
            formatTien(
                giamGia
            )
        }\n` +

        `Thành tiền: ${
            formatTien(
                thanhTien
            )
        }\n\n` +

        `Ghi chú: ${ghiChu}`
    );
}


/* =========================
   ĐĂNG XUẤT
========================= */

function dangXuat() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


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