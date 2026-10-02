// =====================================================
// FOODDELI - QUAN LY GIAO HANG
// =====================================================

const API_BASE_URL = "https://localhost:7135/api";

let giaoHangs = [];
let giaoHangsHienThi = [];
let donHangs = [];

let currentPage = 1;
const pageSize = 10;

// =====================================================
// DOM
// =====================================================

const tableBody = document.getElementById("giaoHangTableBody");
const searchInput = document.getElementById("searchGiaoHang");
const filterTrangThai = document.getElementById("filterTrangThai");
const pagination = document.getElementById("pagination");
const paginationInfo = document.getElementById("paginationInfo");

const formGiaoHang = document.getElementById("formGiaoHang");
const formGiaoHangPanel = document.getElementById("formGiaoHangPanel");

const selectMaDonHang = document.getElementById("maDonHang");

const btnThemGiaoHang = document.getElementById("btnThemGiaoHang");
const btnLamMoi = document.getElementById("btnLamMoi");
const btnHuyThem = document.getElementById("btnHuyThem");

const modalChiTiet = document.getElementById("modalChiTiet");
const btnDongChiTiet = document.getElementById("btnDongChiTiet");
const btnDongChiTiet2 = document.getElementById("btnDongChiTiet2");

// =====================================================
// HEADERS
// =====================================================

function getHeaders() {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}

// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
    ganSuKien();
    await taiDuLieu();
});

// =====================================================
// EVENT
// =====================================================

function ganSuKien() {

    searchInput?.addEventListener("input", () => {
        currentPage = 1;
        locDuLieu();
    });

    filterTrangThai?.addEventListener("change", () => {
        currentPage = 1;
        locDuLieu();
    });

    btnLamMoi?.addEventListener("click", async () => {
        await taiDuLieu();
    });

    btnThemGiaoHang?.addEventListener("click", () => {
        moFormGiaoHang();
    });

    btnHuyThem?.addEventListener("click", () => {
        resetFormGiaoHang();
        anFormGiaoHang();
    });

    formGiaoHang?.addEventListener("submit", taoGiaoHang);

    btnDongChiTiet?.addEventListener("click", dongChiTiet);

    btnDongChiTiet2?.addEventListener("click", dongChiTiet);

    modalChiTiet?.addEventListener("click", (event) => {
        if (event.target === modalChiTiet) {
            dongChiTiet();
        }
    });

    document
        .querySelector(".admin-logout")
        ?.addEventListener("click", dangXuat);
}

// =====================================================
// TAI DU LIEU
// =====================================================

async function taiDuLieu() {

    hienThiLoading();

    try {

        await taiGiaoHang();
        await taiDonHang();

        locDuLieu();

    } catch (error) {

        console.error("Loi tai du lieu giao hang:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    Khong the tai du lieu.
                </td>
            </tr>
        `;

        pagination.innerHTML = "";
        paginationInfo.textContent = "";

    }

}

// =====================================================
// GET GIAO HANG
// GET /api/GiaoHang
// =====================================================

async function taiGiaoHang() {

    const response = await fetch(
        `${API_BASE_URL}/GiaoHang`,
        {
            method: "GET",
            headers: getHeaders()
        }
    );

    if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (response.status === 403) {
        throw new Error("FORBIDDEN");
    }

    if (!response.ok) {
        throw new Error(
            `GET GiaoHang failed: ${response.status}`
        );
    }

    const data = await response.json();

    giaoHangs =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];

}

// =====================================================
// GET DON HANG
// GET /api/DonHang
// =====================================================

async function taiDonHang() {

    const response = await fetch(
        `${API_BASE_URL}/DonHang`,
        {
            method: "GET",
            headers: getHeaders()
        }
    );

    if (!response.ok) {
        console.warn(
            "Khong lay duoc danh sach don hang:",
            response.status
        );

        donHangs = [];

        return;
    }

    const data = await response.json();

    donHangs =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];

}

// =====================================================
// LOC DU LIEU
// =====================================================

function locDuLieu() {

    const keyword =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();

    const trangThai =
        (filterTrangThai?.value || "")
            .trim()
            .toLowerCase();

    giaoHangsHienThi =
        giaoHangs.filter(item => {

            const maGiaoHang =
                String(
                    item.maGiaoHang ??
                    item.MaGiaoHang ??
                    ""
                ).toLowerCase();

            const maDonHang =
                String(
                    item.maDonHang ??
                    item.MaDonHang ??
                    ""
                ).toLowerCase();

            const maNguoiGiaoHang =
                String(
                    item.maNguoiGiaoHang ??
                    item.MaNguoiGiaoHang ??
                    ""
                ).toLowerCase();

            const status =
                String(
                    item.trangThai ??
                    item.TrangThai ??
                    ""
                ).toLowerCase();

            const matchKeyword =
                !keyword ||
                maGiaoHang.includes(keyword) ||
                maDonHang.includes(keyword) ||
                maNguoiGiaoHang.includes(keyword);

            const matchStatus =
                !trangThai ||
                status === trangThai;

            return matchKeyword && matchStatus;
        });

    renderBang();
}

// =====================================================
// RENDER TABLE
// =====================================================

function renderBang() {

    const total = giaoHangsHienThi.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(total / pageSize)
        );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start =
        (currentPage - 1) * pageSize;

    const end =
        start + pageSize;

    const pageItems =
        giaoHangsHienThi.slice(start, end);

    if (pageItems.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    Khong co thong tin giao hang.
                </td>
            </tr>
        `;

    } else {

        tableBody.innerHTML =
            pageItems
                .map((item, index) => {

                    const maGiaoHang =
                        item.maGiaoHang ??
                        item.MaGiaoHang ??
                        "-";

                    const maDonHang =
                        item.maDonHang ??
                        item.MaDonHang ??
                        "-";

                    const maNguoiGiaoHang =
                        item.maNguoiGiaoHang ??
                        item.MaNguoiGiaoHang ??
                        "-";

                    const trangThai =
                        item.trangThai ??
                        item.TrangThai ??
                        "-";

                    const thoiGianNhan =
                        item.thoiGianNhan ??
                        item.ThoiGianNhan;

                    return `
                        <tr>

                            <td>
                                ${start + index + 1}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(maGiaoHang)}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(maDonHang)}
                            </td>

                            <td>
                                ${escapeHtml(maNguoiGiaoHang)}
                            </td>

                            <td>
                                ${renderTrangThai(trangThai)}
                            </td>

                            <td>
                                ${formatDate(thoiGianNhan)}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="btn btn-small"
                                    onclick="xemChiTiet('${escapeJs(maGiaoHang)}')"
                                >
                                    Xem
                                </button>
                            </td>

                        </tr>
                    `;
                })
                .join("");
    }

    renderPagination(total, totalPages);
}

// =====================================================
// TRANG THAI
// =====================================================

function renderTrangThai(trangThai) {

    const status =
        String(trangThai || "")
            .trim()
            .toLowerCase();

    let className = "status-badge";

    if (
        status === "cho giao" ||
        status === "chờ giao"
    ) {
        className += " status-warning";
    }

    else if (
        status === "dang giao" ||
        status === "đang giao"
    ) {
        className += " status-info";
    }

    else if (
        status === "da giao" ||
        status === "đã giao"
    ) {
        className += " status-success";
    }

    else {
        className += " status-default";
    }

    return `
        <span class="${className}">
            ${escapeHtml(trangThai)}
        </span>
    `;
}

// =====================================================
// PAGINATION
// =====================================================

function renderPagination(total, totalPages) {

    const start =
        total === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const end =
        Math.min(
            currentPage * pageSize,
            total
        );

    paginationInfo.textContent =
        `Hien thi ${start}-${end} / ${total} giao hang`;

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let html = "";

    html += `
        <button
            type="button"
            class="pagination-btn"
            ${currentPage === 1 ? "disabled" : ""}
            onclick="goToPage(${currentPage - 1})"
        >
            «
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button
                type="button"
                class="pagination-btn ${i === currentPage ? "active" : ""}"
                onclick="goToPage(${i})"
            >
                ${i}
            </button>
        `;
    }

    html += `
        <button
            type="button"
            class="pagination-btn"
            ${currentPage === totalPages ? "disabled" : ""}
            onclick="goToPage(${currentPage + 1})"
        >
            »
        </button>
    `;

    pagination.innerHTML = html;
}

function goToPage(page) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                giaoHangsHienThi.length /
                pageSize
            )
        );

    if (
        page < 1 ||
        page > totalPages
    ) {
        return;
    }

    currentPage = page;

    renderBang();
}

// =====================================================
// MO FORM
// =====================================================

function moFormGiaoHang() {

    resetFormGiaoHang();

    taoDanhSachDonHang();

    if (formGiaoHangPanel) {
        formGiaoHangPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    setTimeout(() => {

        selectMaDonHang?.focus();

    }, 400);
}

// =====================================================
// AN FORM
// =====================================================

function anFormGiaoHang() {

    if (formGiaoHangPanel) {

        formGiaoHangPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

// =====================================================
// RESET FORM
// =====================================================

function resetFormGiaoHang() {

    formGiaoHang?.reset();

    const trangThai =
        document.getElementById("trangThai");

    if (trangThai) {
        trangThai.value = "Cho giao";
    }

}

// =====================================================
// TAO DANH SACH DON HANG
// =====================================================

function taoDanhSachDonHang() {

    if (!selectMaDonHang) {
        return;
    }

    const daCoGiaoHang =
        new Set(
            giaoHangs
                .map(item =>
                    String(
                        item.maDonHang ??
                        item.MaDonHang ??
                        ""
                    )
                )
                .filter(Boolean)
        );

    const donHangChuaCoGiao =
        donHangs.filter(donHang => {

            const maDon =
                String(
                    donHang.maDonHang ??
                    donHang.MaDonHang ??
                    ""
                );

            return (
                maDon &&
                !daCoGiaoHang.has(maDon)
            );
        });

    selectMaDonHang.innerHTML = `
        <option value="">
            -- Chon don hang --
        </option>
    `;

    if (donHangChuaCoGiao.length === 0) {

        selectMaDonHang.innerHTML += `
            <option value="" disabled>
                Khong co don hang chua tao giao hang
            </option>
        `;

        return;
    }

    donHangChuaCoGiao.forEach(donHang => {

        const maDonHang =
            donHang.maDonHang ??
            donHang.MaDonHang;

        const thanhTien =
            donHang.thanhTien ??
            donHang.ThanhTien ??
            donHang.tongTien ??
            donHang.TongTien;

        const option =
            document.createElement("option");

        option.value = maDonHang;

        option.textContent =
            thanhTien != null
                ? `${maDonHang} - ${formatMoney(thanhTien)}`
                : maDonHang;

        selectMaDonHang.appendChild(option);
    });
}

// =====================================================
// POST GIAO HANG
// =====================================================

async function taoGiaoHang(event) {

    event.preventDefault();

    const maDonHang =
        selectMaDonHang?.value.trim() || "";

    const maNguoiGiaoHang =
        document
            .getElementById("maNguoiGiaoHang")
            ?.value.trim() || "";

    const trangThai =
        document
            .getElementById("trangThai")
            ?.value || "Cho giao";

    const thoiGianNhanInput =
        document
            .getElementById("thoiGianNhan")
            ?.value || "";

    const ghiChu =
        document
            .getElementById("ghiChu")
            ?.value.trim() || "";

    if (!maDonHang) {

        alert(
            "Vui long chon don hang."
        );

        selectMaDonHang?.focus();

        return;
    }

    let thoiGianNhan = null;

    if (thoiGianNhanInput) {

        const date =
            new Date(thoiGianNhanInput);

        if (!isNaN(date.getTime())) {
            thoiGianNhan =
                date.toISOString();
        }
    }

    const payload = {

        MaDonHang:
            maDonHang,

        MaNguoiGiaoHang:
            maNguoiGiaoHang
                ? maNguoiGiaoHang
                : null,

        TrangThai:
            trangThai || "Chờ giao",

        ThoiGianNhan:
            thoiGianNhan,

        GhiChu:
            ghiChu
                ? ghiChu
                : null
    };

    console.log(
        "POST /api/GiaoHang:",
        payload
    );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/GiaoHang`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify(payload)
                }
            );

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (response.status === 401) {

            alert(
                "Phien dang nhap da het. Vui long dang nhap lai."
            );

            return;
        }

        if (response.status === 403) {

            alert(
                "Tai khoan khong co quyen tao giao hang."
            );

            return;
        }

        if (response.status === 404) {

            alert(
                data.message ||
                "Khong tim thay don hang."
            );

            return;
        }

        if (response.status === 409) {

            alert(
                data.message ||
                "Don hang nay da co thong tin giao hang."
            );

            await taiDuLieu();

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "Tao giao hang that bai."
            );

            return;
        }

        alert(
            `Tao giao hang thanh cong.\nMa giao hang: ${
                data.maGiaoHang || "-"
            }`
        );

        resetFormGiaoHang();

        await taiDuLieu();

        moFormGiaoHang();

    }
    catch (error) {

        console.error(
            "Loi tao giao hang:",
            error
        );

        alert(
            "Khong the ket noi den server."
        );
    }
}

// =====================================================
// XEM CHI TIET
// GET /api/GiaoHang/{id}
// =====================================================

async function xemChiTiet(maGiaoHang) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/GiaoHang/${encodeURIComponent(maGiaoHang)}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (response.status === 401) {

            alert(
                "Phien dang nhap da het."
            );

            return;
        }

        if (response.status === 403) {

            alert(
                "Tai khoan khong co quyen xem giao hang nay."
            );

            return;
        }

        if (!response.ok) {

            alert(
                data.message ||
                "Khong lay duoc thong tin giao hang."
            );

            return;
        }

        const item =
            data?.data || data;

        hienThiChiTiet(item);

    }
    catch (error) {

        console.error(
            "Loi xem chi tiet:",
            error
        );

        alert(
            "Khong the ket noi den server."
        );
    }
}

// =====================================================
// HIEN THI CHI TIET
// =====================================================

function hienThiChiTiet(item) {

    const maGiaoHang =
        item.maGiaoHang ??
        item.MaGiaoHang ??
        "-";

    const maDonHang =
        item.maDonHang ??
        item.MaDonHang ??
        "-";

    const maNguoiGiaoHang =
        item.maNguoiGiaoHang ??
        item.MaNguoiGiaoHang ??
        "-";

    const trangThai =
        item.trangThai ??
        item.TrangThai ??
        "-";

    const thoiGianNhan =
        item.thoiGianNhan ??
        item.ThoiGianNhan;

    const ghiChu =
        item.ghiChu ??
        item.GhiChu ??
        "-";

    document.getElementById(
        "detailMaGiaoHang"
    ).textContent = maGiaoHang;

    document.getElementById(
        "detailMaDonHang"
    ).textContent = maDonHang;

    document.getElementById(
        "detailMaNguoiGiaoHang"
    ).textContent = maNguoiGiaoHang;

    document.getElementById(
        "detailTrangThai"
    ).textContent = trangThai;

    document.getElementById(
        "detailThoiGianNhan"
    ).textContent =
        formatDate(thoiGianNhan);

    document.getElementById(
        "detailGhiChu"
    ).textContent = ghiChu;

    modalChiTiet?.classList.add("show");
}

// =====================================================
// DONG CHI TIET
// =====================================================

function dongChiTiet() {
    modalChiTiet?.classList.remove("show");
}

// =====================================================
// LOADING
// =====================================================

function hienThiLoading() {

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="loading-cell">
                Dang tai du lieu...
            </td>
        </tr>
    `;

    pagination.innerHTML = "";
    paginationInfo.textContent = "";
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("vi-VN");
}

// =====================================================
// FORMAT MONEY
// =====================================================

function formatMoney(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    const number =
        Number(value);

    if (isNaN(number)) {
        return String(value);
    }

    return (
        number.toLocaleString("vi-VN") +
        " đ"
    );
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =====================================================
// ESCAPE JS
// =====================================================

function escapeJs(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}

// =====================================================
// DANG XUAT
// =====================================================

function dangXuat() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "../dang-nhap.html";
}