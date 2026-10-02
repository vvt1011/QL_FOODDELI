// =====================================================
// FOODDELI - QUAN LY NGUOI DUNG
// =====================================================

const API_BASE_URL =
    "https://localhost:7135/api";


let nguoiDungs = [];

let nguoiDungsHienThi = [];

let vaiTroCache = {};

let currentPage = 1;

const pageSize = 10;


// =====================================================
// DOM
// =====================================================

const tableBody =
    document.getElementById(
        "nguoiDungTableBody"
    );


const searchInput =
    document.getElementById(
        "searchNguoiDung"
    );


const filterTrangThai =
    document.getElementById(
        "filterTrangThai"
    );


const filterVaiTro =
    document.getElementById(
        "filterVaiTro"
    );


const recordCount =
    document.getElementById(
        "recordCount"
    );


const pagination =
    document.getElementById(
        "pagination"
    );


const chiTietPanel =
    document.getElementById(
        "chiTietPanel"
    );


// =====================================================
// HEADERS
// =====================================================

function getHeaders() {

    const token =
        localStorage.getItem(
            "token"
        );


    const headers = {
        "Content-Type":
            "application/json"
    };


    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;

    }


    return headers;

}


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        ganSuKien();

        await taiNguoiDung();

    }
);


// =====================================================
// EVENTS
// =====================================================

function ganSuKien() {

    // Tìm kiếm
    searchInput?.addEventListener(
        "input",
        () => {

            currentPage = 1;

            locDuLieu();

        }
    );


    // Lọc trạng thái
    filterTrangThai?.addEventListener(
        "change",
        () => {

            currentPage = 1;

            locDuLieu();

        }
    );


    // Lọc vai trò
    filterVaiTro?.addEventListener(
        "change",
        () => {

            currentPage = 1;

            locDuLieu();

        }
    );


    // Làm mới
    document
        .getElementById(
            "btnLamMoi"
        )
        ?.addEventListener(
            "click",
            async () => {

                searchInput.value = "";

                filterTrangThai.value = "";

                filterVaiTro.value = "";

                currentPage = 1;

                await taiNguoiDung();

            }
        );


    // Đóng chi tiết
    document
        .getElementById(
            "btnDongChiTiet"
        )
        ?.addEventListener(
            "click",
            dongChiTiet
        );


    // Đăng xuất
    document
        .querySelector(
            ".admin-logout"
        )
        ?.addEventListener(
            "click",
            dangXuat
        );

}


// =====================================================
// GET ALL NGUOI DUNG
// GET /api/NguoiDung
// =====================================================

async function taiNguoiDung() {

    hienThiLoading();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/NguoiDung`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        // 401
        if (
            response.status ===
            401
        ) {

            alert(
                "Phien dang nhap da het. Vui long dang nhap lai."
            );

            return;

        }


        // 403
        if (
            response.status ===
            403
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="loading-cell"
                    >
                        Tai khoan khong co quyen xem danh sach nguoi dung.
                    </td>
                </tr>
            `;


            recordCount.textContent =
                "Khong co quyen";


            pagination.innerHTML =
                "";


            return;

        }


        if (!response.ok) {

            throw new Error(
                `GET NguoiDung loi: ${response.status}`
            );

        }


        const data =
            await response.json();


        nguoiDungs =
            layMangDuLieu(
                data
            );


        // Xóa cache vai trò
        vaiTroCache = {};


        // Tải vai trò trước
        await napVaiTroTatCa();


        // Lọc
        locDuLieu();

    }
    catch (error) {

        console.error(
            "Loi tai nguoi dung:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="loading-cell"
                >
                    Khong the tai du lieu nguoi dung.
                </td>
            </tr>
        `;


        recordCount.textContent =
            "0 nguoi dung";


        pagination.innerHTML =
            "";

    }

}


// =====================================================
// LAY MANG DATA
// =====================================================

function layMangDuLieu(
    data
) {

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        Array.isArray(
            data?.data
        )
    ) {

        return data.data;

    }


    if (
        Array.isArray(
            data?.items
        )
    ) {

        return data.items;

    }


    if (
        Array.isArray(
            data?.result
        )
    ) {

        return data.result;

    }


    return [];

}


// =====================================================
// NAP VAI TRO TAT CA
// =====================================================

async function napVaiTroTatCa() {

    if (
        nguoiDungs.length ===
        0
    ) {

        return;

    }


    // Chạy 5 request cùng lúc
    const batchSize = 5;


    for (
        let i = 0;
        i < nguoiDungs.length;
        i += batchSize
    ) {

        const batch =
            nguoiDungs.slice(
                i,
                i + batchSize
            );


        await Promise.all(
            batch.map(
                async user => {

                    const maNguoiDung =
                        user.maNguoiDung ??
                        user.MaNguoiDung;


                    if (
                        maNguoiDung ===
                            null ||
                        maNguoiDung ===
                            undefined ||
                        maNguoiDung ===
                            ""
                    ) {

                        return;

                    }


                    const key =
                        String(
                            maNguoiDung
                        );


                    // ------------------------------------------------
                    // Trường hợp GET danh sách đã có vai trò
                    // ------------------------------------------------

                    const roleFromList =
                        layVaiTro(
                            user
                        );


                    if (
                        roleFromList !==
                        "Chua co"
                    ) {

                        vaiTroCache[key] =
                            roleFromList;

                        return;

                    }


                    // ------------------------------------------------
                    // Gọi GET /api/NguoiDung/{id}
                    // ------------------------------------------------

                    try {

                        const response =
                            await fetch(
                                `${API_BASE_URL}/NguoiDung/${encodeURIComponent(
                                    key
                                )}`,
                                {
                                    method:
                                        "GET",
                                    headers:
                                        getHeaders()
                                }
                            );


                        if (
                            !response.ok
                        ) {

                            vaiTroCache[key] =
                                "Chua co";

                            return;

                        }


                        const data =
                            await response.json();


                        const detailUser =
                            data?.data ??
                            data;


                        vaiTroCache[key] =
                            layVaiTro(
                                detailUser
                            );

                    }
                    catch (error) {

                        console.warn(
                            `Khong lay duoc vai tro cua ${key}:`,
                            error
                        );


                        vaiTroCache[key] =
                            "Chua co";

                    }

                }
            )
        );

    }

}


// =====================================================
// LOC DU LIEU
// =====================================================

function locDuLieu() {

    const keyword =
        normalizeText(
            searchInput?.value ||
            ""
        );


    const keywordRole =
        normalizeRole(
            searchInput?.value ||
            ""
        );


    const trangThaiFilter =
        String(
            filterTrangThai?.value ||
            ""
        ).trim();


    const vaiTroFilter =
        normalizeRole(
            filterVaiTro?.value ||
            ""
        );


    nguoiDungsHienThi =
        nguoiDungs.filter(
            user => {

                // ---------------------------------------------
                // THÔNG TIN CƠ BẢN
                // ---------------------------------------------

                const maNguoiDung =
                    normalizeText(
                        user.maNguoiDung ??
                        user.MaNguoiDung ??
                        ""
                    );


                const hoTen =
                    normalizeText(
                        user.hoTen ??
                        user.HoTen ??
                        ""
                    );


                const email =
                    normalizeText(
                        user.email ??
                        user.Email ??
                        ""
                    );


                const soDienThoai =
                    normalizeText(
                        user.soDienThoai ??
                        user.SoDienThoai ??
                        ""
                    );


                // ---------------------------------------------
                // VAI TRÒ
                // ---------------------------------------------

                const maKey =
                    String(
                        user.maNguoiDung ??
                        user.MaNguoiDung ??
                        ""
                    );


                const vaiTro =
                    getVaiTroHienTai(
                        maKey
                    );


                const vaiTroText =
                    normalizeText(
                        vaiTro
                    );


                const vaiTroChuan =
                    normalizeRole(
                        vaiTro
                    );


                // ---------------------------------------------
                // TRẠNG THÁI
                // ---------------------------------------------

                const trangThai =
                    getTrangThaiValue(
                        user
                    );


                // ---------------------------------------------
                // TÌM KIẾM
                // ---------------------------------------------

                const matchKeyword =
                    !keyword ||

                    maNguoiDung.includes(
                        keyword
                    ) ||

                    hoTen.includes(
                        keyword
                    ) ||

                    email.includes(
                        keyword
                    ) ||

                    soDienThoai.includes(
                        keyword
                    ) ||

                    vaiTroText.includes(
                        keyword
                    ) ||

                    vaiTroChuan.includes(
                        keywordRole
                    );


                // ---------------------------------------------
                // LỌC TRẠNG THÁI
                // ---------------------------------------------

                const matchTrangThai =
                    !trangThaiFilter ||
                    trangThai ===
                        trangThaiFilter;


                // ---------------------------------------------
                // LỌC VAI TRÒ
                // ---------------------------------------------

                const matchVaiTro =
                    !vaiTroFilter ||
                    kiemTraVaiTro(
                        vaiTro,
                        vaiTroFilter
                    );


                return (
                    matchKeyword &&
                    matchTrangThai &&
                    matchVaiTro
                );

            }
        );


    // Sau khi lọc, luôn về trang 1
    currentPage = 1;


    renderBang();

}


// =====================================================
// KIEM TRA VAI TRO
// =====================================================

function kiemTraVaiTro(
    vaiTro,
    roleFilter
) {

    if (
        !vaiTro ||
        vaiTro ===
            "Chua co"
    ) {

        return false;

    }


    const roles =
        String(
            vaiTro
        )
        .split(",")
        .map(
            role =>
                normalizeRole(
                    role
                )
        )
        .filter(Boolean);


    return roles.includes(
        roleFilter
    );

}


// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


// =====================================================
// NORMALIZE ROLE
// =====================================================

function normalizeRole(
    value
) {

    const text =
        normalizeText(
            value
        )
        .replace(
            /\s+/g,
            ""
        );


    // Admin
    if (
        text ===
            "admin" ||
        text ===
            "administrator"
    ) {

        return "admin";

    }


    // Quản trị viên
    if (
        text ===
            "quantrivien"
    ) {

        return "quantrivien";

    }


    // Quản lý
    if (
        text ===
            "quanly"
    ) {

        return "quanly";

    }


    // Chủ shop
    if (
        text ===
            "chushop"
    ) {

        return "chushop";

    }


    // Khách hàng
    if (
        text ===
            "khachhang"
    ) {

        return "khachhang";

    }


    return text;

}


// =====================================================
// LAY VAI TRO
// =====================================================

function layVaiTro(
    user
) {

    const candidates = [

        user?.vaiTro,

        user?.VaiTro,

        user?.vaiTros,

        user?.VaiTros,

        user?.tenVaiTro,

        user?.TenVaiTro,

        user?.role,

        user?.Role,

        user?.roles,

        user?.Roles,

        user?.userRole,

        user?.UserRole

    ];


    for (
        const rawRole
        of candidates
    ) {

        if (
            rawRole === null ||
            rawRole === undefined ||
            rawRole === ""
        ) {

            continue;

        }


        // Array
        if (
            Array.isArray(
                rawRole
            )
        ) {

            const roles =
                rawRole
                    .map(
                        item =>
                            layRoleValue(
                                item
                            )
                    )
                    .filter(Boolean);


            if (
                roles.length > 0
            ) {

                return [
                    ...new Set(
                        roles
                    )
                ].join(
                    ", "
                );

            }


            continue;

        }


        // Object
        if (
            typeof rawRole ===
            "object"
        ) {

            const role =
                layRoleValue(
                    rawRole
                );


            if (role) {

                return role;

            }


            continue;

        }


        // String / number
        const role =
            String(
                rawRole
            ).trim();


        if (role) {

            return role;

        }

    }


    return "Chua co";

}


// =====================================================
// LAY VALUE ROLE
// =====================================================

function layRoleValue(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (
        typeof value ===
        "string"
    ) {

        return value.trim();

    }


    if (
        typeof value ===
        "number"
    ) {

        return String(
            value
        );

    }


    if (
        typeof value ===
        "object"
    ) {

        const result =
            value.tenVaiTro ??
            value.TenVaiTro ??

            value.vaiTro ??
            value.VaiTro ??

            value.tenRole ??
            value.TenRole ??

            value.role ??
            value.Role ??

            value.name ??
            value.Name ??
            "";


        return String(
            result
        ).trim();

    }


    return "";

}


// =====================================================
// GET ROLE CACHE
// =====================================================

function getVaiTroHienTai(
    maNguoiDung
) {

    const key =
        String(
            maNguoiDung ??
            ""
        );


    if (
        Object.prototype.hasOwnProperty.call(
            vaiTroCache,
            key
        )
    ) {

        return vaiTroCache[
            key
        ];

    }


    return "Chua co";

}


// =====================================================
// TRANG THAI VALUE
// =====================================================

function getTrangThaiValue(
    user
) {

    const value =
        user?.trangThai ??
        user?.TrangThai;


    // true / 1
    if (
        value === true ||
        value === 1 ||
        value === "1"
    ) {

        return "1";

    }


    // string
    if (
        typeof value ===
        "string"
    ) {

        const text =
            normalizeText(
                value
            );


        if (
            text ===
                "true" ||
            text ===
                "active" ||
            text ===
                "hoatdong" ||
            text ===
                "danghoatdong" ||
            text ===
                "hoat dong" ||
            text ===
                "dang hoat dong"
        ) {

            return "1";

        }


        if (
            text ===
                "false" ||
            text ===
                "inactive" ||
            text ===
                "ngunghoatdong" ||
            text ===
                "ngung hoat dong"
        ) {

            return "0";

        }

    }


    return "0";

}


// =====================================================
// TRANG THAI DISPLAY
// =====================================================

function renderTrangThai(
    user
) {

    const value =
        getTrangThaiValue(
            user
        );


    if (
        value ===
        "1"
    ) {

        return `
            <span class="status-badge status-success">
                Hoat dong
            </span>
        `;

    }


    return `
        <span class="status-badge status-danger">
            Ngung hoat dong
        </span>
    `;

}


// =====================================================
// RENDER TABLE
// =====================================================

function renderBang() {

    const total =
        nguoiDungsHienThi.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                pageSize
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
        (
            currentPage -
            1
        ) *
        pageSize;


    const end =
        start +
        pageSize;


    const items =
        nguoiDungsHienThi.slice(
            start,
            end
        );


    recordCount.textContent =
        `${total} nguoi dung`;


    if (
        items.length ===
        0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="loading-cell"
                >
                    Khong tim thay nguoi dung.
                </td>
            </tr>
        `;

    }
    else {

        tableBody.innerHTML =
            items
                .map(
                    (
                        user,
                        index
                    ) => {

                        const maNguoiDung =
                            user.maNguoiDung ??
                            user.MaNguoiDung ??
                            "-";


                        const hoTen =
                            user.hoTen ??
                            user.HoTen ??
                            "-";


                        const email =
                            user.email ??
                            user.Email ??
                            "-";


                        const soDienThoai =
                            user.soDienThoai ??
                            user.SoDienThoai ??
                            "-";


                        const vaiTro =
                            getVaiTroHienTai(
                                String(
                                    maNguoiDung
                                )
                            );


                        const ngayTao =
                            user.ngayTao ??
                            user.NgayTao;


                        return `
                            <tr>


                                <td>
                                    ${
                                        start +
                                        index +
                                        1
                                    }
                                </td>


                                <td>

                                    <strong>
                                        ${escapeHtml(
                                            maNguoiDung
                                        )}
                                    </strong>

                                </td>


                                <td>
                                    ${escapeHtml(
                                        hoTen
                                    )}
                                </td>


                                <td>
                                    ${escapeHtml(
                                        email
                                    )}
                                </td>


                                <td>
                                    ${escapeHtml(
                                        soDienThoai
                                    )}
                                </td>


                                <td>

                                    <span
                                        class="role-text"
                                    >
                                        ${escapeHtml(
                                            hienThiVaiTro(
                                                vaiTro
                                            )
                                        )}
                                    </span>

                                </td>


                                <td>

                                    ${renderTrangThai(
                                        user
                                    )}

                                </td>


                                <td>
                                    ${formatDate(
                                        ngayTao
                                    )}
                                </td>


                                <td>

                                    <button
                                        type="button"
                                        class="btn btn-small"
                                        onclick="xemChiTiet('${escapeJs(
                                            String(
                                                maNguoiDung
                                            )
                                        )}')"
                                    >
                                        Xem
                                    </button>

                                </td>


                            </tr>
                        `;

                    }
                )
                .join("");

    }


    renderPagination(
        totalPages
    );

}


// =====================================================
// HIEN THI VAI TRO
// =====================================================

function hienThiVaiTro(
    value
) {

    if (
        !value ||
        value ===
            "Chua co"
    ) {

        return "Chua co";

    }


    return String(
        value
    )
        .split(",")
        .map(
            role => {

                const normalized =
                    normalizeRole(
                        role
                    );


                if (
                    normalized ===
                    "admin"
                ) {

                    return "Admin";

                }


                if (
                    normalized ===
                    "quantrivien"
                ) {

                    return "Quan tri vien";

                }


                if (
                    normalized ===
                    "quanly"
                ) {

                    return "Quan ly";

                }


                if (
                    normalized ===
                    "chushop"
                ) {

                    return "Chu shop";

                }


                if (
                    normalized ===
                    "khachhang"
                ) {

                    return "Khach hang";

                }


                return role.trim();

            }
        )
        .join(
            ", "
        );

}


// =====================================================
// PAGINATION
// =====================================================

function renderPagination(
    totalPages
) {

    if (
        totalPages <=
        1
    ) {

        pagination.innerHTML =
            "";

        return;

    }


    let html = "";


    // Previous

    html += `
        <button
            type="button"
            class="pagination-btn"
            ${
                currentPage ===
                1
                    ? "disabled"
                    : ""
            }
            onclick="goToPage(${
                currentPage -
                1
            })"
        >
            «
        </button>
    `;


    // Pages

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


    // Next

    html += `
        <button
            type="button"
            class="pagination-btn"
            ${
                currentPage ===
                totalPages
                    ? "disabled"
                    : ""
            }
            onclick="goToPage(${
                currentPage +
                1
            })"
        >
            »
        </button>
    `;


    pagination.innerHTML =
        html;

}


// =====================================================
// CHUYEN TRANG
// =====================================================

function goToPage(
    page
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                nguoiDungsHienThi.length /
                pageSize
            )
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


// =====================================================
// XEM CHI TIET
// GET /api/NguoiDung/{id}
// =====================================================

async function xemChiTiet(
    maNguoiDung
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/NguoiDung/${encodeURIComponent(
                    maNguoiDung
                )}`,
                {
                    method: "GET",
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (
            response.status ===
            401
        ) {

            alert(
                "Phien dang nhap da het."
            );

            return;

        }


        if (
            response.status ===
            403
        ) {

            alert(
                "Tai khoan khong co quyen xem nguoi dung nay."
            );

            return;

        }


        if (
            response.status ===
            404
        ) {

            alert(
                data.message ||
                "Khong tim thay nguoi dung."
            );

            return;

        }


        if (!response.ok) {

            alert(
                data.message ||
                "Khong lay duoc thong tin nguoi dung."
            );

            return;

        }


        const user =
            data?.data ??
            data;


        // Cập nhật cache role
        vaiTroCache[
            String(
                maNguoiDung
            )
        ] =
            layVaiTro(
                user
            );


        hienThiChiTiet(
            user
        );


        // Cập nhật luôn bảng
        locDuLieu();

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

function hienThiChiTiet(
    user
) {

    const maNguoiDung =
        user.maNguoiDung ??
        user.MaNguoiDung ??
        "-";


    const hoTen =
        user.hoTen ??
        user.HoTen ??
        "-";


    const email =
        user.email ??
        user.Email ??
        "-";


    const soDienThoai =
        user.soDienThoai ??
        user.SoDienThoai ??
        "-";


    const anhDaiDien =
        user.anhDaiDien ??
        user.AnhDaiDien ??
        "-";


    const vaiTro =
        layVaiTro(
            user
        );


    const ngayTao =
        user.ngayTao ??
        user.NgayTao;


    document.getElementById(
        "detailMaNguoiDung"
    ).value =
        maNguoiDung;


    document.getElementById(
        "detailHoTen"
    ).value =
        hoTen;


    document.getElementById(
        "detailEmail"
    ).value =
        email;


    document.getElementById(
        "detailSoDienThoai"
    ).value =
        soDienThoai;


    document.getElementById(
        "detailVaiTro"
    ).value =
        hienThiVaiTro(
            vaiTro
        );


    document.getElementById(
        "detailTrangThai"
    ).value =
        getTrangThaiValue(
            user
        ) === "1"
            ? "Hoat dong"
            : "Ngung hoat dong";


    document.getElementById(
        "detailNgayTao"
    ).value =
        formatDate(
            ngayTao
        );


    document.getElementById(
        "detailAnhDaiDien"
    ).value =
        anhDaiDien;


    chiTietPanel.style.display =
        "block";


    chiTietPanel.scrollIntoView({
        behavior:
            "smooth",
        block:
            "start"
    });

}


// =====================================================
// DONG CHI TIET
// =====================================================

function dongChiTiet() {

    chiTietPanel.style.display =
        "none";

}


// =====================================================
// LOADING
// =====================================================

function hienThiLoading() {

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="9"
                class="loading-cell"
            >
                Dang tai danh sach nguoi dung...
            </td>
        </tr>
    `;


    recordCount.textContent =
        "Dang tai...";


    pagination.innerHTML =
        "";

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        isNaN(
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


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
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


// =====================================================
// ESCAPE JS
// =====================================================

function escapeJs(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );

}


// =====================================================
// DANG XUAT
// =====================================================

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