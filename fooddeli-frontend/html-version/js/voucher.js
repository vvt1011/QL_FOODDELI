const API_BASE_URL = "https://localhost:7135/api";

let vouchers = [];
let vouchersHienThi = [];

let currentPage = 1;
const pageSize = 10;


// ======================================================
// DOM
// ======================================================

const tableBody =
    document.getElementById("voucherTableBody");

const searchInput =
    document.getElementById("searchVoucher");

const filterLoaiGiamGia =
    document.getElementById("filterLoaiGiamGia");

const recordCount =
    document.getElementById("recordCount");

const pagination =
    document.getElementById("pagination");

const formVoucherPanel =
    document.getElementById("formVoucherPanel");

const voucherForm =
    document.getElementById("voucherForm");

const chiTietPanel =
    document.getElementById("chiTietPanel");


// ======================================================
// HEADERS
// ======================================================

function getHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return headers;
}


// ======================================================
// INIT
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        ganSuKien();

        await taiVoucher();
    }
);


// ======================================================
// EVENTS
// ======================================================

function ganSuKien() {

    searchInput?.addEventListener(
        "input",
        () => {

            currentPage = 1;

            locDuLieu();
        }
    );


    filterLoaiGiamGia?.addEventListener(
        "input",
        () => {

            currentPage = 1;

            locDuLieu();
        }
    );


    document
        .getElementById("btnLamMoi")
        ?.addEventListener(
            "click",
            async () => {

                searchInput.value = "";
                filterLoaiGiamGia.value = "";

                currentPage = 1;

                await taiVoucher();
            }
        );


    document
        .getElementById("btnMoForm")
        ?.addEventListener(
            "click",
            moForm
        );


    document
        .getElementById("btnHuyForm")
        ?.addEventListener(
            "click",
            dongForm
        );


    document
        .getElementById("btnDongChiTiet")
        ?.addEventListener(
            "click",
            dongChiTiet
        );


    voucherForm?.addEventListener(
        "submit",
        taoVoucher
    );


    document
        .querySelector(".admin-logout")
        ?.addEventListener(
            "click",
            dangXuat
        );
}


// ======================================================
// GET VOUCHER
// Swagger:
// GET /api/Voucher/kha-dung
// ======================================================

async function taiVoucher() {

    hienThiLoading();

    try {

        const headers = getHeaders();

        // ==================================================
        // Endpoint GET Voucher chính xác theo Swagger
        // ==================================================

        const url =
            `${API_BASE_URL}/Voucher/kha-dung`;

        console.log(
            "Đang gọi GET Voucher:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: headers
                }
            );


        console.log(
            `GET ${url} ->`,
            response.status
        );


        // ==================================================
        // 401 - Chưa đăng nhập / Token hết hạn
        // ==================================================

        if (
            response.status === 401
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="12"
                        class="loading-cell"
                    >
                        Phiên đăng nhập đã hết.
                    </td>
                </tr>
            `;

            recordCount.textContent =
                "Chưa đăng nhập";

            pagination.innerHTML = "";

            alert(
                "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
            );

            return;
        }


        // ==================================================
        // 403 - Không có quyền
        // ==================================================

        if (
            response.status === 403
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="12"
                        class="loading-cell"
                    >
                        Tài khoản không có quyền xem Voucher.
                    </td>
                </tr>
            `;

            recordCount.textContent =
                "Không có quyền";

            pagination.innerHTML = "";

            return;
        }


        // ==================================================
        // Lỗi HTTP khác
        // ==================================================

        if (!response.ok) {

            const errorText =
                await response
                    .text()
                    .catch(
                        () => ""
                    );


            console.error(
                "GET Voucher lỗi:",
                response.status,
                errorText
            );


            throw new Error(
                `GET Voucher lỗi ${response.status}`
            );
        }


        // ==================================================
        // JSON
        // ==================================================

        const data =
            await response.json();


        console.log(
            "Dữ liệu Voucher từ API:",
            data
        );


        vouchers =
            layMangDuLieu(data);


        console.log(
            "Số Voucher:",
            vouchers.length
        );


        currentPage = 1;

        locDuLieu();

    } catch (error) {

        console.error(
            "Lỗi tải voucher:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="12"
                    class="loading-cell"
                >
                    Không thể tải danh sách Voucher.
                    <br>
                    <small>
                        ${escapeHtml(error.message)}
                    </small>
                </td>
            </tr>
        `;


        recordCount.textContent =
            "0 voucher";

        pagination.innerHTML = "";
    }
}


// ======================================================
// LẤY ARRAY
// ======================================================

function layMangDuLieu(data) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        Array.isArray(data?.data)
    ) {
        return data.data;
    }


    if (
        Array.isArray(data?.items)
    ) {
        return data.items;
    }


    if (
        Array.isArray(data?.result)
    ) {
        return data.result;
    }


    if (
        Array.isArray(data?.Data)
    ) {
        return data.Data;
    }


    if (
        Array.isArray(data?.Items)
    ) {
        return data.Items;
    }


    if (
        Array.isArray(data?.Result)
    ) {
        return data.Result;
    }


    return [];
}


// ======================================================
// FILTER
// ======================================================

function locDuLieu() {

    const keyword =
        normalizeText(
            searchInput?.value || ""
        );


    const loaiFilter =
        normalizeText(
            filterLoaiGiamGia?.value || ""
        );


    vouchersHienThi =
        vouchers.filter(
            voucher => {

                const maVoucher =
                    normalizeText(
                        voucher.maVoucher ??
                        voucher.MaVoucher ??
                        ""
                    );


                const tenVoucher =
                    normalizeText(
                        voucher.tenVoucher ??
                        voucher.TenVoucher ??
                        ""
                    );


                const loaiGiamGia =
                    normalizeText(
                        voucher.loaiGiamGia ??
                        voucher.LoaiGiamGia ??
                        ""
                    );


                const matchKeyword =
                    !keyword ||
                    maVoucher.includes(
                        keyword
                    ) ||
                    tenVoucher.includes(
                        keyword
                    );


                const matchLoai =
                    !loaiFilter ||
                    loaiGiamGia.includes(
                        loaiFilter
                    );


                return (
                    matchKeyword &&
                    matchLoai
                );
            }
        );


    currentPage = 1;

    renderBang();
}


// ======================================================
// RENDER TABLE
// ======================================================

function renderBang() {

    const total =
        vouchersHienThi.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / pageSize
            )
        );


    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages;
    }


    const start =
        (currentPage - 1) *
        pageSize;


    const end =
        start +
        pageSize;


    const items =
        vouchersHienThi.slice(
            start,
            end
        );


    recordCount.textContent =
        `${total} voucher`;


    if (
        items.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="12"
                    class="loading-cell"
                >
                    Không tìm thấy Voucher.
                </td>
            </tr>
        `;

    } else {

        tableBody.innerHTML =
            items
                .map(
                    (voucher, index) =>
                        renderRow(
                            voucher,
                            start + index + 1
                        )
                )
                .join("");
    }


    renderPagination(
        totalPages
    );
}


// ======================================================
// RENDER ROW
// ======================================================

function renderRow(
    voucher,
    stt
) {

    const maVoucher =
        voucher.maVoucher ??
        voucher.MaVoucher ??
        "-";


    const tenVoucher =
        voucher.tenVoucher ??
        voucher.TenVoucher ??
        "-";


    const loaiGiamGia =
        voucher.loaiGiamGia ??
        voucher.LoaiGiamGia ??
        "-";


    const giaTri =
        voucher.giaTri ??
        voucher.GiaTri;


    const giamToiDa =
        voucher.giamToiDa ??
        voucher.GiamToiDa;


    const giaTriDonToiThieu =
        voucher.giaTriDonToiThieu ??
        voucher.GiaTriDonToiThieu;


    const ngayBatDau =
        voucher.ngayBatDau ??
        voucher.NgayBatDau;


    const ngayKetThuc =
        voucher.ngayKetThuc ??
        voucher.NgayKetThuc;


    const soLuong =
        voucher.soLuong ??
        voucher.SoLuong;


    const trangThai =
        tinhTrangThai(
            voucher
        );


    return `
        <tr>

            <td>
                ${stt}
            </td>

            <td>
                <strong>
                    ${escapeHtml(maVoucher)}
                </strong>
            </td>

            <td>
                ${escapeHtml(tenVoucher)}
            </td>

            <td>
                ${escapeHtml(loaiGiamGia)}
            </td>

            <td>
                ${formatMoney(giaTri)}
            </td>

            <td>
                ${formatMoneyNullable(giamToiDa)}
            </td>

            <td>
                ${formatMoney(giaTriDonToiThieu)}
            </td>

            <td>
                ${formatDate(ngayBatDau)}
            </td>

            <td>
                ${formatDate(ngayKetThuc)}
            </td>

            <td>
                ${escapeHtml(
                    soLuong ?? "-"
                )}
            </td>

            <td>
                ${renderTrangThai(
                    trangThai
                )}
            </td>

            <td>

                <button
                    type="button"
                    class="btn btn-small"
                    onclick='xemChiTiet(${JSON.stringify(voucher)})'
                >
                    Xem
                </button>

            </td>

        </tr>
    `;
}


// ======================================================
// STATUS
// ======================================================

function tinhTrangThai(
    voucher
) {

    const soLuong =
        Number(
            voucher.soLuong ??
            voucher.SoLuong ??
            0
        );


    const ngayBatDau =
        new Date(
            voucher.ngayBatDau ??
            voucher.NgayBatDau
        );


    const ngayKetThuc =
        new Date(
            voucher.ngayKetThuc ??
            voucher.NgayKetThuc
        );


    const now =
        new Date();


    if (
        soLuong <= 0
    ) {

        return "het-luot";
    }


    if (
        !isNaN(
            ngayKetThuc.getTime()
        ) &&
        now > ngayKetThuc
    ) {

        return "het-han";
    }


    if (
        !isNaN(
            ngayBatDau.getTime()
        ) &&
        now < ngayBatDau
    ) {

        return "chua-bat-dau";
    }


    return "hoat-dong";
}


function renderTrangThai(
    trangThai
) {

    if (
        trangThai ===
        "hoat-dong"
    ) {

        return `
            <span
                class="status-badge status-success"
            >
                Hoat dong
            </span>
        `;
    }


    if (
        trangThai ===
        "het-luot"
    ) {

        return `
            <span
                class="status-badge status-danger"
            >
                Het luot
            </span>
        `;
    }


    if (
        trangThai ===
        "het-han"
    ) {

        return `
            <span
                class="status-badge status-danger"
            >
                Het han
            </span>
        `;
    }


    return `
        <span
            class="status-badge"
        >
            Chua bat dau
        </span>
    `;
}


// ======================================================
// PAGINATION
// ======================================================

function renderPagination(
    totalPages
) {

    if (
        totalPages <= 1
    ) {

        pagination.innerHTML = "";

        return;
    }


    let html = "";


    html += `
        <button
            type="button"
            class="pagination-btn"
            ${
                currentPage === 1
                    ? "disabled"
                    : ""
            }
            onclick="goToPage(${currentPage - 1})"
        >
            «
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
                class="pagination-btn ${
                    i === currentPage
                        ? "active"
                        : ""
                }"
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
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            onclick="goToPage(${currentPage + 1})"
        >
            »
        </button>
    `;


    pagination.innerHTML =
        html;
}


function goToPage(page) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                vouchersHienThi.length /
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


// ======================================================
// OPEN CREATE FORM
// ======================================================

function moForm() {

    formVoucherPanel.style.display =
        "block";


    chiTietPanel.style.display =
        "none";


    formVoucherPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function dongForm() {

    formVoucherPanel.style.display =
        "none";


    voucherForm.reset();


    document.getElementById(
        "giaTriDonToiThieu"
    ).value = "0";


    document.getElementById(
        "soLuong"
    ).value = "1";
}


// ======================================================
// CREATE VOUCHER
// POST /api/Voucher
// ======================================================

async function taoVoucher(
    event
) {

    event.preventDefault();


    const maVoucher =
        document
            .getElementById(
                "maVoucher"
            )
            .value
            .trim();


    const tenVoucher =
        document
            .getElementById(
                "tenVoucher"
            )
            .value
            .trim();


    const loaiGiamGia =
        document
            .getElementById(
                "loaiGiamGia"
            )
            .value
            .trim();


    const giaTri =
        Number(
            document
                .getElementById(
                    "giaTri"
                )
                .value
        );


    const giamToiDaInput =
        document
            .getElementById(
                "giamToiDa"
            )
            .value
            .trim();


    const giaTriDonToiThieu =
        Number(
            document
                .getElementById(
                    "giaTriDonToiThieu"
                )
                .value
        );


    const ngayBatDau =
        document
            .getElementById(
                "ngayBatDau"
            )
            .value;


    const ngayKetThuc =
        document
            .getElementById(
                "ngayKetThuc"
            )
            .value;


    const soLuong =
        Number(
            document
                .getElementById(
                    "soLuong"
                )
                .value
        );


    // ==================================================
    // VALIDATE
    // ==================================================

    if (!maVoucher) {

        alert(
            "Vui lòng nhập mã voucher."
        );

        return;
    }


    if (!tenVoucher) {

        alert(
            "Vui lòng nhập tên voucher."
        );

        return;
    }


    if (!loaiGiamGia) {

        alert(
            "Vui lòng nhập loại giảm giá."
        );

        return;
    }


    if (
        !Number.isFinite(
            giaTri
        ) ||
        giaTri < 0
    ) {

        alert(
            "Giá trị giảm giá không hợp lệ."
        );

        return;
    }


    if (
        !Number.isFinite(
            giaTriDonToiThieu
        ) ||
        giaTriDonToiThieu < 0
    ) {

        alert(
            "Giá trị đơn tối thiểu không hợp lệ."
        );

        return;
    }


    if (!ngayBatDau) {

        alert(
            "Vui lòng nhập ngày bắt đầu."
        );

        return;
    }


    if (!ngayKetThuc) {

        alert(
            "Vui lòng nhập ngày kết thúc."
        );

        return;
    }


    if (
        new Date(ngayKetThuc) <=
        new Date(ngayBatDau)
    ) {

        alert(
            "Ngày kết thúc phải lớn hơn ngày bắt đầu."
        );

        return;
    }


    if (
        !Number.isInteger(
            soLuong
        ) ||
        soLuong <= 0
    ) {

        alert(
            "Số lượng phải là số nguyên lớn hơn 0."
        );

        return;
    }


    let giamToiDa = null;


    if (
        giamToiDaInput !== ""
    ) {

        giamToiDa =
            Number(
                giamToiDaInput
            );


        if (
            !Number.isFinite(
                giamToiDa
            ) ||
            giamToiDa < 0
        ) {

            alert(
                "Giảm tối đa không hợp lệ."
            );

            return;
        }
    }


    // ==================================================
    // BODY
    // ==================================================

    const body = {

        MaVoucher:
            maVoucher,

        TenVoucher:
            tenVoucher,

        LoaiGiamGia:
            loaiGiamGia,

        GiaTri:
            giaTri,

        GiamToiDa:
            giamToiDa,

        GiaTriDonToiThieu:
            giaTriDonToiThieu,

        NgayBatDau:
            ngayBatDau,

        NgayKetThuc:
            ngayKetThuc,

        SoLuong:
            soLuong
    };


    console.log(
        "POST Voucher:",
        body
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/Voucher`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        // ==================================================
        // 401
        // ==================================================

        if (
            response.status ===
            401
        ) {

            alert(
                "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
            );

            return;
        }


        // ==================================================
        // 403
        // ==================================================

        if (
            response.status ===
            403
        ) {

            alert(
                "Tài khoản không có quyền tạo Voucher."
            );

            return;
        }


        // ==================================================
        // ERROR
        // ==================================================

        if (
            !response.ok
        ) {

            console.error(
                "POST Voucher lỗi:",
                response.status,
                data
            );


            const message =
                data?.message ||
                data?.title ||
                "Không thể tạo Voucher.";


            alert(
                message
            );

            return;
        }


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            data?.message ||
            "Tạo Voucher thành công."
        );


        dongForm();

        await taiVoucher();

    } catch (error) {

        console.error(
            "Lỗi tạo voucher:",
            error
        );


        alert(
            "Không thể kết nối đến server."
        );
    }
}


// ======================================================
// DETAIL
// ======================================================

function xemChiTiet(
    voucher
) {

    const maVoucher =
        voucher.maVoucher ??
        voucher.MaVoucher ??
        "-";


    const tenVoucher =
        voucher.tenVoucher ??
        voucher.TenVoucher ??
        "-";


    const loaiGiamGia =
        voucher.loaiGiamGia ??
        voucher.LoaiGiamGia ??
        "-";


    const giaTri =
        voucher.giaTri ??
        voucher.GiaTri;


    const giamToiDa =
        voucher.giamToiDa ??
        voucher.GiamToiDa;


    const giaTriDonToiThieu =
        voucher.giaTriDonToiThieu ??
        voucher.GiaTriDonToiThieu;


    const ngayBatDau =
        voucher.ngayBatDau ??
        voucher.NgayBatDau;


    const ngayKetThuc =
        voucher.ngayKetThuc ??
        voucher.NgayKetThuc;


    const soLuong =
        voucher.soLuong ??
        voucher.SoLuong;


    const trangThai =
        tinhTrangThai(
            voucher
        );


    document.getElementById(
        "detailMaVoucher"
    ).value =
        maVoucher;


    document.getElementById(
        "detailTenVoucher"
    ).value =
        tenVoucher;


    document.getElementById(
        "detailLoaiGiamGia"
    ).value =
        loaiGiamGia;


    document.getElementById(
        "detailGiaTri"
    ).value =
        formatMoney(
            giaTri
        );


    document.getElementById(
        "detailGiamToiDa"
    ).value =
        formatMoneyNullable(
            giamToiDa
        );


    document.getElementById(
        "detailGiaTriDonToiThieu"
    ).value =
        formatMoney(
            giaTriDonToiThieu
        );


    document.getElementById(
        "detailNgayBatDau"
    ).value =
        formatDate(
            ngayBatDau
        );


    document.getElementById(
        "detailNgayKetThuc"
    ).value =
        formatDate(
            ngayKetThuc
        );


    document.getElementById(
        "detailSoLuong"
    ).value =
        soLuong ?? "-";


    document.getElementById(
        "detailTrangThai"
    ).value =
        hienThiTenTrangThai(
            trangThai
        );


    formVoucherPanel.style.display =
        "none";


    chiTietPanel.style.display =
        "block";


    chiTietPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function hienThiTenTrangThai(
    trangThai
) {

    if (
        trangThai ===
        "hoat-dong"
    ) {

        return "Hoat dong";
    }


    if (
        trangThai ===
        "het-luot"
    ) {

        return "Het luot";
    }


    if (
        trangThai ===
        "het-han"
    ) {

        return "Het han";
    }


    return "Chua bat dau";
}


function dongChiTiet() {

    chiTietPanel.style.display =
        "none";
}


// ======================================================
// HELPERS
// ======================================================

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );
}


function formatMoney(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(
            Number(value)
        )
    ) {

        return "-";
    }


    return Number(value)
        .toLocaleString(
            "vi-VN"
        ) + " đ";
}


function formatMoneyNullable(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    return formatMoney(
        value
    );
}


function formatDate(
    value
) {

    if (!value) {

        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }


    return date.toLocaleString(
        "vi-VN"
    );
}


function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

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


function hienThiLoading() {

    tableBody.innerHTML = `
        <tr>

            <td
                colspan="12"
                class="loading-cell"
            >
                Đang tải danh sách Voucher...
            </td>

        </tr>
    `;


    recordCount.textContent =
        "Đang tải...";


    pagination.innerHTML =
        "";
}


// ======================================================
// LOGOUT
// ======================================================

function dangXuat() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "../dang-nhap.html";
}