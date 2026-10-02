// ==========================================
// QUAN LY DON HANG - FOODDELI
// ==========================================

const API_BASE_URL = "https://localhost:7135/api";

let donHangs = [];
let donHangsHienThi = [];

let currentPage = 1;
const pageSize = 10;

let donHangDangXem = null;


// ==========================================
// KHOI TAO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    khoiTaoSuKien();
    loadDonHangs();
});


// ==========================================
// SU KIEN
// ==========================================

function khoiTaoSuKien() {

    document
        .getElementById("searchDonHang")
        ?.addEventListener("input", () => {
            currentPage = 1;
            locDonHang();
        });


    document
        .getElementById("filterTrangThai")
        ?.addEventListener("change", () => {
            currentPage = 1;
            locDonHang();
        });


    document
        .getElementById("btnResetFilter")
        ?.addEventListener("click", () => {

            const search =
                document.getElementById("searchDonHang");

            const filter =
                document.getElementById("filterTrangThai");

            if (search) {
                search.value = "";
            }

            if (filter) {
                filter.value = "";
            }

            currentPage = 1;

            locDonHang();
        });


    document
        .getElementById("pagination")
        ?.addEventListener("click", (e) => {

            const button =
                e.target.closest("[data-page]");

            if (!button || button.disabled) {
                return;
            }

            const page =
                Number(button.dataset.page);

            if (!page || page === currentPage) {
                return;
            }

            currentPage = page;

            renderDonHang();
        });


    // Xem chi tiet
    document
        .getElementById("donHangTableBody")
        ?.addEventListener("click", (e) => {

            const button =
                e.target.closest("[data-action='view']");

            if (!button) {
                return;
            }

            const id =
                button.dataset.id;

            if (id) {
                xemChiTietDonHang(id);
            }
        });


    document
        .getElementById("btnDongChiTiet")
        ?.addEventListener("click", dongChiTiet);


    document
        .getElementById("btnHuyChiTiet")
        ?.addEventListener("click", dongChiTiet);


    document
        .getElementById("btnCapNhatTrangThai")
        ?.addEventListener("click", capNhatTrangThai);


    // Dang xuat
    document
        .getElementById("btnLogout")
        ?.addEventListener("click", () => {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "../dang-nhap.html";
        });
}


// ==========================================
// LOAD DON HANG
// ==========================================

async function loadDonHangs() {

    const tbody =
        document.getElementById("donHangTableBody");

    if (tbody) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    Đang tải đơn hàng...
                </td>
            </tr>
        `;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/DonHang`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );
        }


        const data =
            await response.json();


        donHangs =
            Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];


        donHangs.sort((a, b) => {

            const dateA =
                new Date(layNgayDat(a) || 0);

            const dateB =
                new Date(layNgayDat(b) || 0);

            return dateB - dateA;
        });


        currentPage = 1;

        locDonHang();


    } catch (error) {

        console.error(
            "Lỗi load đơn hàng:",
            error
        );


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-row">
                        Không thể tải danh sách đơn hàng.
                    </td>
                </tr>
            `;
        }


        hienThongBao(
            error.message ||
            "Không thể tải danh sách đơn hàng.",
            "error"
        );
    }
}


// ==========================================
// LOC DON HANG
// ==========================================

function locDonHang() {

    const searchInput =
        document.getElementById("searchDonHang");

    const filterInput =
        document.getElementById("filterTrangThai");


    const keyword =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();


    const status =
        filterInput?.value || "";


    donHangsHienThi =
        donHangs.filter(item => {

            const maDon =
                layMaDonHang(item)
                    .toLowerCase();


            const matchSearch =
                maDon.includes(keyword);


            const trangThai =
                layTrangThai(item);


            const matchStatus =
                status === "" ||
                String(trangThai) === String(status);


            return matchSearch && matchStatus;
        });


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                donHangsHienThi.length / pageSize
            )
        );


    if (currentPage > totalPages) {
        currentPage = totalPages;
    }


    renderDonHang();
}


// ==========================================
// RENDER TABLE
// ==========================================

function renderDonHang() {

    const tbody =
        document.getElementById("donHangTableBody");

    if (!tbody) {
        return;
    }


    const total =
        donHangsHienThi.length;


    if (total === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    Không tìm thấy đơn hàng nào.
                </td>
            </tr>
        `;

        capNhatRecordCount(0);
        renderPagination(0);

        return;
    }


    const start =
        (currentPage - 1) * pageSize;


    const end =
        Math.min(
            start + pageSize,
            total
        );


    const pageData =
        donHangsHienThi.slice(
            start,
            end
        );


    tbody.innerHTML =
        pageData.map((item, index) => {

            const maDon =
                layMaDonHang(item);


            const khachHang =
                layKhachHang(item);


            const thanhTien =
                layThanhTien(item);


            const ngayDat =
                layNgayDat(item);


            const trangThai =
                layTrangThai(item);


            const stt =
                start + index + 1;


            return `
                <tr>

                    <td>
                        ${stt}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(maDon || "—")}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            khachHang || "—"
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatTien(thanhTien)}
                        </strong>
                    </td>

                    <td>
                        ${formatNgay(ngayDat)}
                    </td>

                    <td>
                        ${renderTrangThai(trangThai)}
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                type="button"
                                class="action-btn"
                                data-action="view"
                                data-id="${escapeAttribute(maDon)}"
                                title="Xem chi tiết">

                                👁️

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    capNhatRecordCount(
        total,
        start + 1,
        end
    );


    renderPagination(total);
}


// ==========================================
// RENDER TRANG THAI
// ==========================================

function renderTrangThai(trangThai) {

    switch (Number(trangThai)) {

        case 1:
            return `
                <span class="status-badge pending">
                    Chờ xác nhận
                </span>
            `;

        case 2:
            return `
                <span class="status-badge active">
                    Đã xác nhận
                </span>
            `;

        case 3:
            return `
                <span class="status-badge active">
                    Đang giao
                </span>
            `;

        case 4:
            return `
                <span class="status-badge active">
                    Hoàn thành
                </span>
            `;

        case 5:
            return `
                <span class="status-badge inactive">
                    Đã hủy
                </span>
            `;

        default:
            return `
                <span class="status-badge">
                    Không xác định
                </span>
            `;
    }
}


// ==========================================
// PHAN TRANG
// ==========================================

function renderPagination(total) {

    const pagination =
        document.getElementById("pagination");

    if (!pagination) {
        return;
    }


    const totalPages =
        Math.ceil(total / pageSize);


    if (totalPages <= 1) {

        pagination.innerHTML = "";

        return;
    }


    let html = "";


    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? "disabled" : ""}>

            ‹

        </button>
    `;


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        html += `
            <button
                type="button"
                class="pagination-btn
                    ${i === currentPage ? "active" : ""}"
                data-page="${i}">

                ${i}

            </button>
        `;
    }


    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? "disabled" : ""}>

            ›

        </button>
    `;


    pagination.innerHTML = html;
}


// ==========================================
// RECORD COUNT
// ==========================================

function capNhatRecordCount(
    total,
    start = 0,
    end = 0
) {

    const element =
        document.getElementById("recordCount");


    if (!element) {
        return;
    }


    if (total === 0) {

        element.textContent =
            "Không có đơn hàng";

        return;
    }


    element.textContent =
        `Hiển thị ${start} - ${end} trong ${total} đơn hàng`;
}


// ==========================================
// XEM CHI TIET DON HANG
// ==========================================

async function xemChiTietDonHang(id) {

    const panel =
        document.getElementById(
            "donHangDetailPanel"
        );


    if (!panel) {
        return;
    }


    panel.style.display = "block";


    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    document.getElementById(
        "detailTitle"
    ).textContent =
        `Chi tiết đơn hàng ${id}`;


    document.getElementById(
        "chiTietDonHangBody"
    ).innerHTML = `
        <tr>
            <td colspan="4" class="loading-row">
                Đang tải chi tiết...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/DonHang/${encodeURIComponent(id)}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );
        }


        const data =
            await response.json();


        console.log(
            "CHI TIET DON HANG API:",
            data
        );


        donHangDangXem =
            data?.data || data;


        await hienThiChiTiet(
            donHangDangXem
        );


        loadLichSuTrangThai(id);


    } catch (error) {

        console.error(
            "Lỗi xem chi tiết đơn hàng:",
            error
        );


        hienThongBao(
            error.message ||
            "Không thể tải chi tiết đơn hàng.",
            "error"
        );
    }
}


// ==========================================
// HIEN THI CHI TIET
// ==========================================

async function hienThiChiTiet(item) {

    if (!item) {
        return;
    }


    const maDon =
        layMaDonHang(item);


    document.getElementById(
        "detailTitle"
    ).textContent =
        `Chi tiết đơn hàng ${maDon}`;


    document.getElementById(
        "detailMaDonHang"
    ).value =
        maDon;


    document.getElementById(
        "detailKhachHang"
    ).value =
        layKhachHang(item);


    document.getElementById(
        "detailNgayDat"
    ).value =
        formatNgay(
            layNgayDat(item)
        );


    document.getElementById(
        "detailTrangThai"
    ).value =
        String(
            layTrangThai(item)
        );


    document.getElementById(
        "detailDiaChi"
    ).value =
        layDiaChi(item);


    document.getElementById(
        "detailGhiChu"
    ).value =
        layGhiChu(item);


    document.getElementById(
        "detailTongTien"
    ).textContent =
        formatTien(
            layTongTien(item)
        );


    document.getElementById(
        "detailPhiGiaoHang"
    ).textContent =
        formatTien(
            layPhiGiaoHang(item)
        );


    document.getElementById(
        "detailGiamGia"
    ).textContent =
        formatTien(
            layGiamGia(item)
        );


    document.getElementById(
        "detailThanhTien"
    ).textContent =
        formatTien(
            layThanhTien(item)
        );


    await hienThiChiTietMonAn(item);
}


// ==========================================
// HIEN THI CHI TIET MON AN
// ==========================================

async function hienThiChiTietMonAn(item) {

    const tbody =
        document.getElementById(
            "chiTietDonHangBody"
        );


    if (!tbody) {
        return;
    }


    let chiTiet =
        layChiTietDonHang(item);


    console.log(
        "CHI TIET MON AN:",
        chiTiet
    );


    if (!Array.isArray(chiTiet)) {
        chiTiet = [];
    }


    if (chiTiet.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="loading-row">
                    Không có dữ liệu món ăn trong đơn hàng.
                </td>
            </tr>
        `;

        return;
    }


    // Hiển thị tạm trong lúc lấy tên món
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="loading-row">
                Đang tải thông tin món ăn...
            </td>
        </tr>
    `;


    /*
     * Lấy thông tin từng món.
     *
     * ChiTietDonHang có thể chỉ chứa:
     *
     * MaMonAn
     * SoLuong
     * DonGia
     *
     * nên ta gọi API MonAn để lấy TenMonAn.
     */

    const danhSachMon =
        await Promise.all(
            chiTiet.map(async ct => {

                const maMon =
                    layMaMonAn(ct);


                let monAn = null;


                // Nếu API DonHang đã trả sẵn thông tin món
                if (
                    ct?.monAn ||
                    ct?.MonAn
                ) {

                    monAn =
                        ct.monAn ??
                        ct.MonAn;
                }


                // Nếu chưa có tên món -> gọi API MonAn
                if (
                    !monAn &&
                    maMon
                ) {

                    monAn =
                        await layThongTinMonAn(
                            maMon
                        );
                }


                return {
                    chiTiet: ct,
                    monAn: monAn
                };
            })
        );


    tbody.innerHTML =
        danhSachMon.map(itemMon => {

            const ct =
                itemMon.chiTiet;


            const monAn =
                itemMon.monAn;


            const tenMon =
                layTenMonTuChiTietVaMonAn(
                    ct,
                    monAn
                );


            const soLuong =
                laySoLuong(ct);


            const donGia =
                layDonGia(ct);


            const thanhTien =
                layThanhTienChiTiet(
                    ct,
                    donGia,
                    soLuong
                );


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                tenMon || "Không xác định"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${soLuong}
                    </td>

                    <td>
                        ${formatTien(
                            donGia
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatTien(
                                thanhTien
                            )}
                        </strong>
                    </td>

                </tr>
            `;

        }).join("");
}


// ==========================================
// LAY THONG TIN MON AN
// ==========================================

async function layThongTinMonAn(maMonAn) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/MonAn/${encodeURIComponent(maMonAn)}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (!response.ok) {

            console.warn(
                `Không lấy được món ${maMonAn}. Status: ${response.status}`
            );

            return null;
        }


        const data =
            await response.json();


        return data?.data || data;


    } catch (error) {

        console.warn(
            `Lỗi lấy món ${maMonAn}:`,
            error
        );

        return null;
    }
}


// ==========================================
// LAY MA MON AN
// ==========================================

function layMaMonAn(item) {

    return String(
        item?.maMonAn ??
        item?.MaMonAn ??
        item?.monAn?.maMonAn ??
        item?.MonAn?.MaMonAn ??
        ""
    );
}


// ==========================================
// LAY TEN MON
// ==========================================

function layTenMonTuChiTietVaMonAn(
    chiTiet,
    monAn
) {

    // Ưu tiên tên có sẵn trong ChiTiet
    const tenTrongChiTiet =
        chiTiet?.tenMonAn ??
        chiTiet?.TenMonAn ??
        chiTiet?.tenMon ??
        chiTiet?.TenMon;


    if (
        tenTrongChiTiet &&
        String(tenTrongChiTiet).trim() !== ""
    ) {

        return String(
            tenTrongChiTiet
        );
    }


    // Sau đó lấy từ object MonAn
    const tenTuMonAn =
        monAn?.tenMonAn ??
        monAn?.TenMonAn ??
        monAn?.tenMon ??
        monAn?.TenMon ??
        monAn?.ten;


    if (
        tenTuMonAn &&
        String(tenTuMonAn).trim() !== ""
    ) {

        return String(
            tenTuMonAn
        );
    }


    // Không có tên thì dùng mã món
    return layMaMonAn(chiTiet);
}


// ==========================================
// CHI TIET DON HANG
// ==========================================

function layChiTietDonHang(item) {

    let data =
        item?.chiTietDonHangs ??
        item?.ChiTietDonHangs ??
        item?.chiTietDonHang ??
        item?.ChiTietDonHang;


    if (Array.isArray(data)) {
        return data;
    }


    let json =
        item?.listjson_chitiet ??
        item?.ListjsonChitiet ??
        item?.listJsonChiTiet;


    if (Array.isArray(json)) {
        return json;
    }


    if (typeof json === "string") {

        try {

            const parsed =
                JSON.parse(json);


            if (Array.isArray(parsed)) {
                return parsed;
            }


        } catch (error) {

            console.error(
                "Không parse được listjson_chitiet:",
                error
            );
        }
    }


    return [];
}


// ==========================================
// SO LUONG
// ==========================================

function laySoLuong(item) {

    return Number(
        item?.soLuong ??
        item?.SoLuong ??
        0
    );
}


// ==========================================
// DON GIA
// ==========================================

function layDonGia(item) {

    return Number(
        item?.donGia ??
        item?.DonGia ??
        item?.gia ??
        item?.Gia ??
        0
    );
}


// ==========================================
// THANH TIEN CHI TIET
// ==========================================

function layThanhTienChiTiet(
    item,
    donGia,
    soLuong
) {

    const value =
        item?.thanhTien ??
        item?.ThanhTien;


    if (
        value !== undefined &&
        value !== null
    ) {

        return Number(value);
    }


    return Number(donGia) *
        Number(soLuong);
}


// ==========================================
// LOAD LICH SU TRANG THAI
// ==========================================

async function loadLichSuTrangThai(id) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/DonHang/${encodeURIComponent(id)}/lich-su-trang-thai`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        console.log(
            "Lịch sử trạng thái:",
            data
        );


    } catch (error) {

        console.warn(
            "Không load được lịch sử:",
            error
        );
    }
}


// ==========================================
// CAP NHAT TRANG THAI
// ==========================================

async function capNhatTrangThai() {

    if (!donHangDangXem) {

        hienThongBao(
            "Chưa chọn đơn hàng.",
            "error"
        );

        return;
    }


    const maDon =
        layMaDonHang(
            donHangDangXem
        );


    const select =
        document.getElementById(
            "detailTrangThai"
        );


    const trangThaiMoi =
        Number(
            select?.value
        );


    if (!maDon || !trangThaiMoi) {

        hienThongBao(
            "Dữ liệu trạng thái không hợp lệ.",
            "error"
        );

        return;
    }


    const trangThaiCu =
        layTrangThai(
            donHangDangXem
        );


    if (
        trangThaiMoi === trangThaiCu
    ) {

        hienThongBao(
            "Trạng thái chưa thay đổi.",
            "error"
        );

        return;
    }


    const btn =
        document.getElementById(
            "btnCapNhatTrangThai"
        );


    if (btn) {

        btn.disabled = true;

        btn.textContent =
            "Đang cập nhật...";
    }


    try {

        const ghiChu =
            `Cập nhật trạng thái đơn hàng thành: ${
                tenTrangThai(trangThaiMoi)
            }`;


        const url =
            `${API_BASE_URL}/DonHang/cap-nhat-trang-thai/` +
            `${encodeURIComponent(maDon)}` +
            `?trangThaiMoi=${trangThaiMoi}` +
            `&ghiChu=${encodeURIComponent(ghiChu)}`;


        const response =
            await fetch(
                url,
                {
                    method: "PUT",
                    headers: getHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );
        }


        hienThongBao(
            "Cập nhật trạng thái thành công.",
            "success"
        );


        donHangDangXem.trangThai =
            trangThaiMoi;

        donHangDangXem.TrangThai =
            trangThaiMoi;


        await loadDonHangs();


        await hienThiChiTiet(
            donHangDangXem
        );


    } catch (error) {

        console.error(
            "Lỗi cập nhật trạng thái:",
            error
        );


        hienThongBao(
            error.message ||
            "Không thể cập nhật trạng thái.",
            "error"
        );


    } finally {

        if (btn) {

            btn.disabled = false;

            btn.textContent =
                "Cập nhật trạng thái";
        }
    }
}


// ==========================================
// DONG CHI TIET
// ==========================================

function dongChiTiet() {

    const panel =
        document.getElementById(
            "donHangDetailPanel"
        );


    if (panel) {
        panel.style.display = "none";
    }


    donHangDangXem = null;
}


// ==========================================
// TEN TRANG THAI
// ==========================================

function tenTrangThai(trangThai) {

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


// ==========================================
// LAY MA DON HANG
// ==========================================

function layMaDonHang(item) {

    return String(
        item?.maDonHang ??
        item?.MaDonHang ??
        ""
    );
}


// ==========================================
// LAY TRANG THAI
// ==========================================

function layTrangThai(item) {

    return Number(
        item?.trangThai ??
        item?.TrangThai ??
        0
    );
}


// ==========================================
// LAY NGAY DAT
// ==========================================

function layNgayDat(item) {

    return (
        item?.ngayDat ??
        item?.NgayDat ??
        ""
    );
}


// ==========================================
// LAY GHI CHU
// ==========================================

function layGhiChu(item) {

    return String(
        item?.ghiChu ??
        item?.GhiChu ??
        ""
    );
}


// ==========================================
// LAY TONG TIEN
// ==========================================

function layTongTien(item) {

    return Number(
        item?.tongTien ??
        item?.TongTien ??
        0
    );
}


// ==========================================
// LAY PHI GIAO HANG
// ==========================================

function layPhiGiaoHang(item) {

    return Number(
        item?.phiGiaoHang ??
        item?.PhiGiaoHang ??
        0
    );
}


// ==========================================
// LAY GIAM GIA
// ==========================================

function layGiamGia(item) {

    return Number(
        item?.giamGia ??
        item?.GiamGia ??
        0
    );
}


// ==========================================
// LAY THANH TIEN
// ==========================================

function layThanhTien(item) {

    return Number(
        item?.thanhTien ??
        item?.ThanhTien ??
        0
    );
}


// ==========================================
// KHACH HANG
// ==========================================

function layKhachHang(item) {

    const nguoiDung =
        item?.nguoiDung ??
        item?.NguoiDung;


    if (nguoiDung) {

        return String(
            nguoiDung?.hoTen ??
            nguoiDung?.HoTen ??
            nguoiDung?.tenNguoiDung ??
            nguoiDung?.TenNguoiDung ??
            nguoiDung?.hoTenNguoiDung ??
            nguoiDung?.HoTenNguoiDung ??
            nguoiDung?.email ??
            nguoiDung?.Email ??
            ""
        );
    }


    return String(
        item?.tenNguoiDung ??
        item?.TenNguoiDung ??
        item?.hoTen ??
        item?.HoTen ??
        item?.email ??
        item?.Email ??
        item?.maNguoiDung ??
        item?.MaNguoiDung ??
        ""
    );
}


// ==========================================
// DIA CHI
// ==========================================

function layDiaChi(item) {

    const diaChi =
        item?.diaChi ??
        item?.DiaChi;


    if (diaChi) {

        if (typeof diaChi === "string") {
            return diaChi;
        }


        return [
            diaChi?.diaChiChiTiet ??
            diaChi?.DiaChiChiTiet,

            diaChi?.soNha ??
            diaChi?.SoNha,

            diaChi?.duong ??
            diaChi?.Duong,

            diaChi?.phuong ??
            diaChi?.Phuong,

            diaChi?.quan ??
            diaChi?.Quan,

            diaChi?.tinh ??
            diaChi?.Tinh
        ]
            .filter(Boolean)
            .join(", ");
    }


    return String(
        item?.diaChiGiaoHang ??
        item?.DiaChiGiaoHang ??
        item?.diaChiChiTiet ??
        item?.DiaChiChiTiet ??
        ""
    );
}


// ==========================================
// FORMAT TIEN
// ==========================================

function formatTien(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    ) + "đ";
}


// ==========================================
// FORMAT NGAY
// ==========================================

function formatNgay(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return escapeHtml(
            String(value)
        );
    }


    return date.toLocaleString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ==========================================
// HEADER
// ==========================================

function getHeaders() {

    const token =
        localStorage.getItem("token");


    const headers = {
        "Accept": "application/json"
    };


    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;
    }


    return headers;
}


// ==========================================
// DOC LOI API
// ==========================================

async function getErrorMessage(response) {

    try {

        const data =
            await response.json();


        if (data?.message) {
            return data.message;
        }


        if (data?.Message) {
            return data.Message;
        }


        if (data?.title) {
            return data.title;
        }


        if (data?.detail) {
            return data.detail;
        }


        if (typeof data === "string") {
            return data;
        }


    } catch (error) {
        // Khong parse duoc JSON
    }


    if (response.status === 400) {
        return "Dữ liệu không hợp lệ.";
    }


    if (response.status === 401) {
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }


    if (response.status === 403) {
        return "Bạn không có quyền thực hiện thao tác này.";
    }


    if (response.status === 404) {
        return "Không tìm thấy dữ liệu.";
    }


    if (response.status === 500) {
        return "Lỗi máy chủ. Không thể thực hiện thao tác.";
    }


    return `Thao tác thất bại. Mã lỗi: ${response.status}`;
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


// ==========================================
// THONG BAO
// ==========================================

function hienThongBao(
    message,
    type = "success"
) {

    const oldToast =
        document.getElementById(
            "adminToast"
        );


    if (oldToast) {
        oldToast.remove();
    }


    const toast =
        document.createElement("div");


    toast.id = "adminToast";

    toast.textContent = message;


    toast.style.position = "fixed";
    toast.style.top = "24px";
    toast.style.right = "24px";
    toast.style.zIndex = "99999";
    toast.style.padding = "14px 20px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.15)";
    toast.style.maxWidth = "400px";
    toast.style.transition =
        "opacity 0.3s ease";


    if (type === "error") {

        toast.style.background =
            "#fee2e2";

        toast.style.color =
            "#b91c1c";

        toast.style.border =
            "1px solid #fecaca";

    } else {

        toast.style.background =
            "#dcfce7";

        toast.style.color =
            "#15803d";

        toast.style.border =
            "1px solid #bbf7d0";
    }


    document.body.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2500);
}