const API_BASE_URL = "https://localhost:7135/api";

let danhSachDonHang = [];
let danhSachDonHangHienThi = [];

let currentPage = 1;
const pageSize = 10;

let donHangDangXem = null;


// =====================================================
// DOM
// =====================================================

const tableBody =
    document.getElementById("donHangTableBody");

const searchInput =
    document.getElementById("searchDonHang");

const filterTrangThai =
    document.getElementById("filterTrangThai");

const btnResetFilter =
    document.getElementById("btnResetFilter");

const recordCount =
    document.getElementById("recordCount");

const pagination =
    document.getElementById("pagination");

const detailPanel =
    document.getElementById("donHangDetailPanel");

const btnDongChiTiet =
    document.getElementById("btnDongChiTiet");

const btnHuyChiTiet =
    document.getElementById("btnHuyChiTiet");

const btnCapNhatTrangThai =
    document.getElementById("btnCapNhatTrangThai");


// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    ganSuKien();

    taiDanhSachDonHang();

});


// =====================================================
// EVENTS
// =====================================================

function ganSuKien() {

    searchInput?.addEventListener(
        "input",
        () => {

            currentPage = 1;

            locVaHienThi();

        }
    );


    filterTrangThai?.addEventListener(
        "change",
        () => {

            currentPage = 1;

            locVaHienThi();

        }
    );


    btnResetFilter?.addEventListener(
        "click",
        () => {

            if (searchInput) {
                searchInput.value = "";
            }

            if (filterTrangThai) {
                filterTrangThai.value = "";
            }

            currentPage = 1;

            locVaHienThi();

        }
    );


    btnDongChiTiet?.addEventListener(
        "click",
        dongChiTiet
    );


    btnHuyChiTiet?.addEventListener(
        "click",
        dongChiTiet
    );


    btnCapNhatTrangThai?.addEventListener(
        "click",
        capNhatTrangThai
    );


    tableBody?.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action='detail']"
                );

            if (!button) {
                return;
            }

            const maDonHang =
                button.dataset.id;

            if (maDonHang) {
                xemChiTiet(maDonHang);
            }

        }
    );

}


// =====================================================
// LOAD DANH SÁCH
// GET /api/DonHang
// =====================================================

async function taiDanhSachDonHang() {

    hienThiDangTai();

    try {

        const data =
            await apiRequest(
                `${API_BASE_URL}/DonHang`
            );


        danhSachDonHang =
            layMangDuLieu(data);


        console.log(
            "Danh sách đơn hàng Admin:",
            danhSachDonHang
        );


        currentPage = 1;

        locVaHienThi();

    }
    catch (error) {

        console.error(
            "Lỗi tải đơn hàng Admin:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    Không thể tải danh sách đơn hàng.
                    ${escapeHtml(error.message || "")}
                </td>
            </tr>
        `;


        if (recordCount) {
            recordCount.textContent =
                "Không tải được dữ liệu";
        }

    }

}


// =====================================================
// LỌC + PHÂN TRANG
// =====================================================

function locVaHienThi() {

    const keyword =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();


    const trangThai =
        filterTrangThai?.value || "";


    danhSachDonHangHienThi =
        danhSachDonHang.filter(
            donHang => {

                const maDonHang =
                    String(
                        layGiaTri(
                            donHang,
                            [
                                "maDonHang",
                                "MaDonHang"
                            ]
                        ) || ""
                    ).toLowerCase();


                const trangThaiDonHang =
                    String(
                        layGiaTri(
                            donHang,
                            [
                                "trangThai",
                                "TrangThai"
                            ]
                        ) ?? ""
                    );


                const dungTimKiem =
                    !keyword ||
                    maDonHang.includes(keyword);


                const dungTrangThai =
                    !trangThai ||
                    trangThaiDonHang === trangThai;


                return (
                    dungTimKiem &&
                    dungTrangThai
                );

            }
        );


    renderBang();

}


// =====================================================
// RENDER BẢNG
// =====================================================

function renderBang() {

    if (!tableBody) {
        return;
    }


    const total =
        danhSachDonHangHienThi.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / pageSize
            )
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        pageSize;


    const end =
        start + pageSize;


    const danhSachTrang =
        danhSachDonHangHienThi.slice(
            start,
            end
        );


    if (!danhSachTrang.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-row">
                    Không có đơn hàng phù hợp.
                </td>
            </tr>
        `;

    }
    else {

        tableBody.innerHTML =
            danhSachTrang
                .map(
                    (
                        donHang,
                        index
                    ) =>
                        renderDongDonHang(
                            donHang,
                            start + index + 1
                        )
                )
                .join("");

    }


    if (recordCount) {

        if (total === 0) {

            recordCount.textContent =
                "Không có đơn hàng";

        }
        else {

            recordCount.textContent =
                `Hiển thị ${start + 1} - ${Math.min(
                    end,
                    total
                )} / ${total} đơn hàng`;

        }

    }


    renderPagination(totalPages);

}


// =====================================================
// RENDER 1 DÒNG
// =====================================================

function renderDongDonHang(
    donHang,
    stt
) {

    const maDonHang =
        layGiaTri(
            donHang,
            [
                "maDonHang",
                "MaDonHang"
            ]
        ) || "-";


    const khachHang =
        layGiaTri(
            donHang,
            [
                "tenNguoiDung",
                "TenNguoiDung",
                "hoTen",
                "HoTen",
                "tenKhachHang",
                "TenKhachHang"
            ]
        ) ||
        layGiaTri(
            donHang?.nguoiDung,
            [
                "hoTen",
                "HoTen",
                "tenNguoiDung",
                "TenNguoiDung"
            ]
        ) ||
        layGiaTri(
            donHang,
            [
                "maNguoiDung",
                "MaNguoiDung"
            ]
        ) ||
        "-";


    const tongTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "tongTien",
                    "TongTien"
                ]
            ) || 0
        );


    const thanhTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "thanhTien",
                    "ThanhTien"
                ]
            ) ??
            tongTien
        );


    const ngayDat =
        layGiaTri(
            donHang,
            [
                "ngayDat",
                "NgayDat"
            ]
        );


    const status =
        layThongTinTrangThai(
            donHang
        );


    return `
        <tr>

            <td>
                ${stt}
            </td>


            <td>
                <strong>
                    ${escapeHtml(
                        String(maDonHang)
                    )}
                </strong>
            </td>


            <td>
                ${escapeHtml(
                    String(khachHang)
                )}
            </td>


            <td>
                <strong>
                    ${formatMoney(
                        thanhTien
                    )}
                </strong>
            </td>


            <td>
                ${escapeHtml(
                    formatDate(ngayDat)
                )}
            </td>


            <td>

                <span
                    class="order-status ${status.className}"
                >
                    ${status.label}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="action-btn"
                    data-action="detail"
                    data-id="${escapeAttribute(
                        String(maDonHang)
                    )}"
                    title="Xem chi tiết"
                >
                    👁️
                </button>

            </td>

        </tr>
    `;

}


// =====================================================
// PHÂN TRANG
// =====================================================

function renderPagination(
    totalPages
) {

    if (!pagination) {
        return;
    }


    if (totalPages <= 1) {

        pagination.innerHTML = "";

        return;

    }


    let html = "";


    html += `
        <button
            type="button"
            class="action-btn"
            ${currentPage === 1 ? "disabled" : ""}
            data-page="${currentPage - 1}"
        >
            ‹
        </button>
    `;


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        if (
            i === 1 ||
            i === totalPages ||
            Math.abs(i - currentPage) <= 2
        ) {

            html += `
                <button
                    type="button"
                    class="action-btn ${
                        i === currentPage
                            ? "active"
                            : ""
                    }"
                    data-page="${i}"
                >
                    ${i}
                </button>
            `;

        }
        else if (
            i === currentPage - 3 ||
            i === currentPage + 3
        ) {

            html += `
                <span style="padding: 0 5px;">
                    ...
                </span>
            `;

        }

    }


    html += `
        <button
            type="button"
            class="action-btn"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            data-page="${currentPage + 1}"
        >
            ›
        </button>
    `;


    pagination.innerHTML =
        html;


    pagination
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const page =
                            Number(
                                button.dataset.page
                            );


                        if (
                            page < 1 ||
                            page > totalPages
                        ) {
                            return;
                        }


                        currentPage =
                            page;


                        renderBang();

                    }
                );

            }
        );

}


// =====================================================
// CHI TIẾT ĐƠN HÀNG
// GET /api/DonHang/{id}
// =====================================================

async function xemChiTiet(
    maDonHang
) {

    if (!detailPanel) {
        return;
    }


    detailPanel.style.display =
        "block";


    detailPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    datGiaTri(
        "detailMaDonHang",
        maDonHang
    );


    datGiaTri(
        "detailKhachHang",
        "Đang tải..."
    );


    datGiaTri(
        "detailNgayDat",
        "Đang tải..."
    );


    datGiaTri(
        "detailDiaChi",
        "Đang tải..."
    );


    datGiaTri(
        "detailGhiChu",
        ""
    );


    datGiaTri(
        "detailTongTien",
        "0đ"
    );


    datGiaTri(
        "detailPhiGiaoHang",
        "0đ"
    );


    datGiaTri(
        "detailGiamGia",
        "0đ"
    );


    datGiaTri(
        "detailThanhTien",
        "0đ"
    );


    if (detailTitle) {

        detailTitle.textContent =
            `Chi tiết đơn hàng ${maDonHang}`;

    }


    if (chiTietDonHangBody) {

        chiTietDonHangBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading-row">
                    Đang tải chi tiết...
                </td>
            </tr>
        `;

    }


    try {

        const data =
            await apiRequest(
                `${API_BASE_URL}/DonHang/${encodeURIComponent(
                    maDonHang
                )}`
            );


        const donHang =
            data?.data ||
            data;


        donHangDangXem =
            donHang;


        hienThiChiTiet(
            donHang
        );

    }
    catch (error) {

        console.error(
            "Lỗi tải chi tiết đơn hàng:",
            error
        );


        if (chiTietDonHangBody) {

            chiTietDonHangBody.innerHTML = `
                <tr>
                    <td colspan="4" class="loading-row">
                        Không thể tải chi tiết:
                        ${escapeHtml(
                            error.message || ""
                        )}
                    </td>
                </tr>
            `;

        }

    }

}


// =====================================================
// HIỂN THỊ CHI TIẾT
// =====================================================

function hienThiChiTiet(
    donHang
) {

    const maDonHang =
        layGiaTri(
            donHang,
            [
                "maDonHang",
                "MaDonHang"
            ]
        ) || "-";


    const maNguoiDung =
        layGiaTri(
            donHang,
            [
                "maNguoiDung",
                "MaNguoiDung"
            ]
        ) || "-";


    const tenNguoiDung =
        layGiaTri(
            donHang,
            [
                "tenNguoiDung",
                "TenNguoiDung",
                "hoTen",
                "HoTen",
                "tenKhachHang",
                "TenKhachHang"
            ]
        ) ||
        layGiaTri(
            donHang?.nguoiDung,
            [
                "hoTen",
                "HoTen",
                "tenNguoiDung",
                "TenNguoiDung"
            ]
        ) ||
        maNguoiDung;


    const ngayDat =
        layGiaTri(
            donHang,
            [
                "ngayDat",
                "NgayDat"
            ]
        );


    const maDiaChi =
        layGiaTri(
            donHang,
            [
                "maDiaChi",
                "MaDiaChi"
            ]
        ) || "-";


    const diaChi =
        layGiaTri(
            donHang,
            [
                "diaChi",
                "DiaChi",
                "diaChiGiaoHang",
                "DiaChiGiaoHang"
            ]
        ) ||
        layGiaTri(
            donHang?.diaChi,
            [
                "diaChi",
                "DiaChi",
                "diaChiChiTiet",
                "DiaChiChiTiet"
            ]
        ) ||
        maDiaChi;


    const ghiChu =
        layGiaTri(
            donHang,
            [
                "ghiChu",
                "GhiChu"
            ]
        ) || "";


    const tongTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "tongTien",
                    "TongTien"
                ]
            ) || 0
        );


    const phiGiaoHang =
        Number(
            layGiaTri(
                donHang,
                [
                    "phiGiaoHang",
                    "PhiGiaoHang"
                ]
            ) || 0
        );


    const giamGia =
        Number(
            layGiaTri(
                donHang,
                [
                    "giamGia",
                    "GiamGia"
                ]
            ) || 0
        );


    const thanhTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "thanhTien",
                    "ThanhTien"
                ]
            ) || 0
        );


    const trangThai =
        layGiaTri(
            donHang,
            [
                "trangThai",
                "TrangThai"
            ]
        );


    datGiaTri(
        "detailMaDonHang",
        maDonHang
    );


    datGiaTri(
        "detailKhachHang",
        tenNguoiDung
    );


    datGiaTri(
        "detailNgayDat",
        formatDate(ngayDat)
    );


    datGiaTri(
        "detailDiaChi",
        diaChi
    );


    datGiaTri(
        "detailGhiChu",
        ghiChu
    );


    datGiaTri(
        "detailTongTien",
        formatMoney(tongTien)
    );


    datGiaTri(
        "detailPhiGiaoHang",
        formatMoney(phiGiaoHang)
    );


    datGiaTri(
        "detailGiamGia",
        formatMoney(giamGia)
    );


    datGiaTri(
        "detailThanhTien",
        formatMoney(thanhTien)
    );


    const selectTrangThai =
        document.getElementById(
            "detailTrangThai"
        );


    if (selectTrangThai) {

        selectTrangThai.value =
            String(
                trangThai ?? ""
            );

    }


    const items =
        layChiTiet(
            donHang
        );


    if (!chiTietDonHangBody) {
        return;
    }


    if (!items.length) {

        chiTietDonHangBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading-row">
                    Không có dữ liệu món ăn.
                </td>
            </tr>
        `;

        return;

    }


    chiTietDonHangBody.innerHTML =
        items
            .map(
                item =>
                    renderChiTietMon(
                        item
                    )
            )
            .join("");

}


// =====================================================
// RENDER CHI TIẾT MÓN
// =====================================================

function renderChiTietMon(
    item
) {

    const tenMon =
        layGiaTri(
            item,
            [
                "tenMonAn",
                "TenMonAn",
                "tenMon",
                "TenMon"
            ]
        ) || "Món ăn";


    const soLuong =
        Number(
            layGiaTri(
                item,
                [
                    "soLuong",
                    "SoLuong"
                ]
            ) || 0
        );


    const donGia =
        Number(
            layGiaTri(
                item,
                [
                    "donGia",
                    "DonGia",
                    "gia",
                    "Gia"
                ]
            ) || 0
        );


    const thanhTien =
        Number(
            layGiaTri(
                item,
                [
                    "thanhTien",
                    "ThanhTien"
                ]
            ) ||
            donGia * soLuong
        );


    return `
        <tr>

            <td>
                ${escapeHtml(
                    String(tenMon)
                )}
            </td>

            <td>
                ${soLuong}
            </td>

            <td>
                ${formatMoney(
                    donGia
                )}
            </td>

            <td>
                <strong>
                    ${formatMoney(
                        thanhTien
                    )}
                </strong>
            </td>

        </tr>
    `;

}


// =====================================================
// CẬP NHẬT TRẠNG THÁI
// PUT /api/DonHang/cap-nhat-trang-thai/{id}
// =====================================================

async function capNhatTrangThai() {

    if (!donHangDangXem) {

        alert(
            "Chưa chọn đơn hàng."
        );

        return;

    }


    const maDonHang =
        layGiaTri(
            donHangDangXem,
            [
                "maDonHang",
                "MaDonHang"
            ]
        );


    const select =
        document.getElementById(
            "detailTrangThai"
        );


    const trangThai =
        Number(
            select?.value
        );


    if (!maDonHang || !trangThai) {

        alert(
            "Không xác định được trạng thái."
        );

        return;

    }


    const xacNhan =
        confirm(
            `Bạn có chắc muốn cập nhật đơn hàng ${maDonHang} sang trạng thái ${tenTrangThai(
                trangThai
            )}?`
        );


    if (!xacNhan) {
        return;
    }


    try {

        btnCapNhatTrangThai.disabled =
            true;


        btnCapNhatTrangThai.textContent =
            "Đang cập nhật...";


       await apiRequest(
    `${API_BASE_URL}/DonHang/cap-nhat-trang-thai/${encodeURIComponent(
        maDonHang
    )}`,
    {
        method: "PUT",
        body: JSON.stringify({
            trangThaiMoi: trangThai
        })
    }
);


        alert(
            "Cập nhật trạng thái thành công."
        );


        await taiDanhSachDonHang();


        await xemChiTiet(
            maDonHang
        );

    }
    catch (error) {

        console.error(
            "Lỗi cập nhật trạng thái:",
            error
        );


        alert(
            error.message ||
            "Không thể cập nhật trạng thái."
        );

    }
    finally {

        btnCapNhatTrangThai.disabled =
            false;


        btnCapNhatTrangThai.textContent =
            "Cập nhật trạng thái";

    }

}


// =====================================================
// ĐÓNG CHI TIẾT
// =====================================================

function dongChiTiet() {

    if (detailPanel) {

        detailPanel.style.display =
            "none";

    }


    donHangDangXem =
        null;

}


// =====================================================
// API REQUEST
// =====================================================

async function apiRequest(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        throw new Error(
            "Bạn chưa đăng nhập."
        );

    }


    const headers = {

        Accept:
            "application/json",

        ...(options.headers || {})

    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";

    }


    headers.Authorization =
        `Bearer ${token}`;


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data;


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response
                .json()
                .catch(
                    () => ({})
                );

    }
    else {

        data =
            await response
                .text()
                .catch(
                    () => ""
                );

    }


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "token"
        );


        throw new Error(
            "Phiên đăng nhập đã hết hạn."
        );

    }


    if (
        response.status === 403
    ) {

        throw new Error(
            "Bạn không có quyền thực hiện thao tác này."
        );

    }


    if (!response.ok) {

        const message =
            data?.message ||
            (
                typeof data === "string" &&
                data.trim()
                    ? data
                    : `HTTP ${response.status}`
            );


        throw new Error(
            message
        );

    }


    return data;

}


// =====================================================
// TRẠNG THÁI
// =====================================================

function layThongTinTrangThai(
    donHang
) {

    const value =
        layGiaTri(
            donHang,
            [
                "trangThai",
                "TrangThai"
            ]
        );


    const status =
        String(
            value ?? ""
        )
            .trim()
            .toLowerCase();


    switch (status) {

        case "1":
        case "cho xac nhan":
        case "chờ xác nhận":

            return {
                label: "Chờ xác nhận",
                className: "pending"
            };


        case "2":
        case "da xac nhan":
        case "đã xác nhận":

            return {
                label: "Đã xác nhận",
                className: "shipping"
            };


        case "3":
        case "dang giao":
        case "đang giao":

            return {
                label: "Đang giao",
                className: "shipping"
            };


        case "4":
        case "hoan thanh":
        case "hoàn thành":

            return {
                label: "Hoàn thành",
                className: "completed"
            };


        case "5":
        case "da huy":
        case "đã hủy":

            return {
                label: "Đã hủy",
                className: "cancelled"
            };


        default:

            return {
                label:
                    value || "Không xác định",

                className:
                    "other"
            };

    }

}


function tenTrangThai(
    value
) {

    const map = {

        1: "Chờ xác nhận",
        2: "Đã xác nhận",
        3: "Đang giao",
        4: "Hoàn thành",
        5: "Đã hủy"

    };


    return (
        map[value] ||
        "Không xác định"
    );

}


// =====================================================
// CHI TIẾT MÓN
// =====================================================

function layChiTiet(
    donHang
) {

    const possible = [

        donHang?.chiTietDonHangs,

        donHang?.ChiTietDonHangs,

        donHang?.chiTietDonHang,

        donHang?.ChiTietDonHang,

        donHang?.items,

        donHang?.Items,

        donHang?.danhSachMon,

        donHang?.DanhSachMon

    ];


    for (
        const value of possible
    ) {

        if (
            Array.isArray(value)
        ) {

            return value;

        }

    }


    const listJson =
        layGiaTri(
            donHang,
            [
                "listjson_chitiet",
                "ListJsonChiTiet",
                "listJsonChiTiet",
                "listjsonChiTiet"
            ]
        );


    if (
        typeof listJson ===
        "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    listJson
                );


            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }

        }
        catch (error) {

            console.warn(
                "Không parse được listjson_chitiet:",
                error
            );

        }

    }


    return [];

}


// =====================================================
// LẤY MẢNG DATA
// =====================================================

function layMangDuLieu(
    data
) {

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    const keys = [

        "data",
        "items",
        "result",
        "Data",
        "Items",
        "Result",
        "donHangs",
        "DonHangs"

    ];


    for (
        const key of keys
    ) {

        if (
            Array.isArray(
                data?.[key]
            )
        ) {

            return data[key];

        }

    }


    return [];

}


// =====================================================
// GET VALUE
// =====================================================

function layGiaTri(
    object,
    keys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return null;

    }


    for (
        const key of keys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }


    return null;

}


// =====================================================
// GÁN VALUE
// =====================================================

function datGiaTri(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.value =
        value ?? "";

}


// =====================================================
// MONEY
// =====================================================

function formatMoney(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0đ";

    }


    return (
        number.toLocaleString("vi-VN") +
        "đ"
    );

}


// =====================================================
// DATE
// =====================================================

function formatDate(
    value
) {

    if (!value) {

        return "Chưa cập nhật";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        "vi-VN"
    );

}


// =====================================================
// LOADING
// =====================================================

function hienThiDangTai() {

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="loading-row">
                Đang tải đơn hàng...
            </td>
        </tr>
    `;


    if (recordCount) {

        recordCount.textContent =
            "Đang tải...";

    }

}


// =====================================================
// ESCAPE
// =====================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}