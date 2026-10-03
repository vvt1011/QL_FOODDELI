const API_BASE_URL =
    "https://localhost:7135/api";


const PAGE_SIZE = 9;


let danhSachCuaHang = [];
let danhSachHienThi = [];

let currentPage = 1;


// ======================================================
// DOM
// ======================================================

const shopGrid =
    document.getElementById("shopGrid");

const shopSearch =
    document.getElementById("shopSearch");

const shopStatusFilter =
    document.getElementById(
        "shopStatusFilter"
    );

const shopCount =
    document.getElementById("shopCount");

const shopPagination =
    document.getElementById(
        "shopPagination"
    );

const btnRefreshShop =
    document.getElementById(
        "btnRefreshShop"
    );


// ======================================================
// INIT
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        ganSuKien();

        await taiDanhSachCuaHang();

    }
);


// ======================================================
// EVENTS
// ======================================================

function ganSuKien() {


    shopSearch?.addEventListener(
        "input",
        () => {

            currentPage = 1;

            locCuaHang();

        }
    );


    shopStatusFilter?.addEventListener(
        "change",
        () => {

            currentPage = 1;

            locCuaHang();

        }
    );


    btnRefreshShop?.addEventListener(
        "click",
        async () => {

            shopSearch.value = "";

            shopStatusFilter.value =
                "all";

            currentPage = 1;

            await taiDanhSachCuaHang();

        }
    );

}


// ======================================================
// GET CUA HANG
// GET /api/CuaHang
// Public
// ======================================================

async function taiDanhSachCuaHang() {

    hienThiLoading();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/CuaHang`,
                {
                    method: "GET"
                }
            );


        console.log(
            "GET /api/CuaHang ->",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response
                    .text()
                    .catch(
                        () => ""
                    );


            throw new Error(
                errorText ||
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Danh sách cửa hàng:",
            data
        );


        danhSachCuaHang =
            layMangDuLieu(data);


        currentPage = 1;


        locCuaHang();


    } catch (error) {

        console.error(
            "Lỗi tải cửa hàng:",
            error
        );


        hienThiLoi(
            error.message
        );

    }

}


// ======================================================
// FILTER
// ======================================================

function locCuaHang() {

    const keyword =
        normalizeText(
            shopSearch?.value || ""
        );


    const status =
        shopStatusFilter?.value ||
        "all";


    danhSachHienThi =
        danhSachCuaHang.filter(
            cuaHang => {

                const maCuaHang =
                    normalizeText(
                        doc(
                            cuaHang,
                            [
                                "maCuaHang",
                                "MaCuaHang"
                            ]
                        )
                    );


                const tenCuaHang =
                    normalizeText(
                        doc(
                            cuaHang,
                            [
                                "tenCuaHang",
                                "TenCuaHang"
                            ]
                        )
                    );


                const diaChi =
                    normalizeText(
                        doc(
                            cuaHang,
                            [
                                "diaChi",
                                "DiaChi"
                            ]
                        )
                    );


                const matchesKeyword =
                    !keyword ||
                    maCuaHang.includes(
                        keyword
                    ) ||
                    tenCuaHang.includes(
                        keyword
                    ) ||
                    diaChi.includes(
                        keyword
                    );


                const trangThai =
                    layTrangThai(
                        cuaHang
                    );


                const matchesStatus =
                    status === "all" ||
                    (
                        status ===
                        "active" &&
                        trangThai === "active"
                    ) ||
                    (
                        status ===
                        "inactive" &&
                        trangThai === "inactive"
                    );


                return (
                    matchesKeyword &&
                    matchesStatus
                );

            }
        );


    renderDanhSach();

}


// ======================================================
// RENDER
// ======================================================

function renderDanhSach() {

    const total =
        danhSachHienThi.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / PAGE_SIZE
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
        PAGE_SIZE;


    const end =
        start +
        PAGE_SIZE;


    const items =
        danhSachHienThi.slice(
            start,
            end
        );


    shopCount.textContent =
        `${total} cửa hàng`;


    if (
        items.length === 0
    ) {

        shopGrid.innerHTML = `
            <div class="shop-state">
                Không tìm thấy cửa hàng phù hợp.
            </div>
        `;

    } else {

        shopGrid.innerHTML =
            items
                .map(
                    (cuaHang, index) =>
                        renderCard(
                            cuaHang,
                            start + index
                        )
                )
                .join("");

    }


    renderPagination(
        totalPages
    );

}


// ======================================================
// CARD
// ======================================================

function renderCard(
    cuaHang,
    index
) {

    const maCuaHang =
        doc(
            cuaHang,
            [
                "maCuaHang",
                "MaCuaHang"
            ]
        ) || "";


    const tenCuaHang =
        doc(
            cuaHang,
            [
                "tenCuaHang",
                "TenCuaHang"
            ]
        ) ||
        "Cửa hàng FoodDeli";


    const moTa =
        doc(
            cuaHang,
            [
                "moTa",
                "MoTa"
            ]
        ) ||
        "Cửa hàng đang phục vụ đồ ăn trên FoodDeli.";


    const diaChi =
        doc(
            cuaHang,
            [
                "diaChi",
                "DiaChi"
            ]
        ) ||
        "Chưa cập nhật địa chỉ";


    const soDienThoai =
        doc(
            cuaHang,
            [
                "soDienThoai",
                "SoDienThoai"
            ]
        );


    const anhCuaHang =
        doc(
            cuaHang,
            [
                "anhCuaHang",
                "AnhCuaHang"
            ]
        );


    const danhGia =
        Number(
            doc(
                cuaHang,
                [
                    "danhGia",
                    "DanhGia"
                ]
            )
        );


    const trangThai =
        layTrangThai(
            cuaHang
        );


    const imageUrl =
        anhCuaHang &&
        String(anhCuaHang).trim()
            ? escapeHtml(
                String(anhCuaHang)
            )
            : taoAnhMacDinh(
                tenCuaHang
            );


    const statusHtml =
        trangThai === "active"
            ? `
                <span class="shop-status active">
                    <span class="shop-status-dot"></span>
                    Đang hoạt động
                </span>
            `
            : `
                <span class="shop-status inactive">
                    <span class="shop-status-dot"></span>
                    Ngừng hoạt động
                </span>
            `;


    const button =
        trangThai === "active"
            ? `
                <button
                    type="button"
                    class="shop-view-btn"
                    onclick="xemCuaHang('${escapeJs(maCuaHang)}')"
                >
                    Xem cửa hàng
                </button>
            `
            : `
                <button
                    type="button"
                    class="shop-view-btn disabled"
                    disabled
                >
                    Cửa hàng tạm ngừng
                </button>
            `;


    return `
        <article class="shop-card">

            <div class="shop-image-wrap">

                <img
                    src="${imageUrl}"
                    alt="${escapeHtml(tenCuaHang)}"
                    class="shop-image"
                    loading="lazy"
                    onerror="this.src='data:image/svg+xml;charset=UTF-8,${taoSvgFallback(tenCuaHang)}'"
                >

                ${statusHtml}

            </div>


            <div class="shop-card-body">

                <h3 class="shop-name">
                    ${escapeHtml(tenCuaHang)}
                </h3>


                <div class="shop-rating">

                    <span class="shop-stars">
                        ${renderStars(danhGia)}
                    </span>

                    <span class="shop-rating-number">
                        ${
                            Number.isFinite(danhGia)
                                ? danhGia.toFixed(1)
                                : "0.0"
                        }
                    </span>

                </div>


                <div class="shop-description">
                    ${escapeHtml(moTa)}
                </div>


                <div class="shop-info-row">

                    <span class="shop-info-icon">
                        📍
                    </span>

                    <span>
                        ${escapeHtml(diaChi)}
                    </span>

                </div>


                ${
                    soDienThoai
                        ? `
                            <div class="shop-info-row">

                                <span class="shop-info-icon">
                                    ☎
                                </span>

                                <span class="shop-phone">
                                    ${escapeHtml(
                                        soDienThoai
                                    )}
                                </span>

                            </div>
                        `
                        : ""
                }


                <div class="shop-card-footer">

                    ${button}

                </div>

            </div>

        </article>
    `;

}


// ======================================================
// TRANG THAI
// ======================================================

function layTrangThai(
    cuaHang
) {

    const value =
        doc(
            cuaHang,
            [
                "trangThai",
                "TrangThai"
            ]
        );


    if (
        value === 1 ||
        value === "1" ||
        normalizeText(value) ===
            "hoat dong" ||
        normalizeText(value) ===
            "hoatdong"
    ) {

        return "active";
    }


    return "inactive";

}


// ======================================================
// STARS
// ======================================================

function renderStars(
    rating
) {

    const value =
        Number(rating);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return "☆☆☆☆☆";

    }


    const rounded =
        Math.round(value);


    let html = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html +=
            i <= rounded
                ? "★"
                : "☆";

    }


    return html;

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

        shopPagination.innerHTML =
            "";

        return;

    }


    let html = "";


    html += `
        <button
            type="button"
            class="shop-page-btn"
            ${
                currentPage === 1
                    ? "disabled"
                    : ""
            }
            onclick="goToShopPage(${currentPage - 1})"
        >
            ‹
        </button>
    `;


    const maxVisiblePages =
        7;


    let startPage =
        Math.max(
            1,
            currentPage -
            Math.floor(
                maxVisiblePages / 2
            )
        );


    let endPage =
        Math.min(
            totalPages,
            startPage +
            maxVisiblePages -
            1
        );


    if (
        endPage -
        startPage +
        1 <
        maxVisiblePages
    ) {

        startPage =
            Math.max(
                1,
                endPage -
                maxVisiblePages +
                1
            );

    }


    for (
        let i = startPage;
        i <= endPage;
        i++
    ) {

        html += `
            <button
                type="button"
                class="shop-page-btn ${
                    i === currentPage
                        ? "active"
                        : ""
                }"
                onclick="goToShopPage(${i})"
            >
                ${i}
            </button>
        `;

    }


    html += `
        <button
            type="button"
            class="shop-page-btn"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            onclick="goToShopPage(${currentPage + 1})"
        >
            ›
        </button>
    `;


    shopPagination.innerHTML =
        html;

}


// ======================================================
// CHUYEN TRANG
// ======================================================

function goToShopPage(
    page
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                danhSachHienThi.length /
                PAGE_SIZE
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


    renderDanhSach();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================================
// XEM CUA HANG
// ======================================================

function xemCuaHang(
    maCuaHang
) {

    if (
        !maCuaHang
    ) {

        return;

    }


    window.location.href =
        `chi-tiet-cua-hang.html?maCuaHang=${encodeURIComponent(maCuaHang)}`;

}


// ======================================================
// LOADING
// ======================================================

function hienThiLoading() {

    shopCount.textContent =
        "Đang tải...";


    shopPagination.innerHTML =
        "";


    shopGrid.innerHTML = `
        <div class="shop-state">

            <div class="shop-loading-spinner"></div>

            Đang tải cửa hàng...

        </div>
    `;

}


// ======================================================
// ERROR
// ======================================================

function hienThiLoi(
    message
) {

    shopCount.textContent =
        "0 cửa hàng";


    shopPagination.innerHTML =
        "";


    shopGrid.innerHTML = `
        <div class="shop-state shop-error">

            <div style="
                font-size: 38px;
                margin-bottom: 10px;
            ">
                ⚠
            </div>

            <div style="
                font-size: 17px;
                font-weight: 700;
                margin-bottom: 7px;
            ">
                Không thể tải danh sách cửa hàng
            </div>

            <div>
                ${escapeHtml(
                    message ||
                    "Có lỗi xảy ra khi kết nối máy chủ."
                )}
            </div>

            <button
                type="button"
                class="shop-refresh-btn"
                style="
                    margin-top: 18px;
                "
                onclick="taiDanhSachCuaHang()"
            >
                Thử lại
            </button>

        </div>
    `;

}


// ======================================================
// ARRAY DATA
// ======================================================

function layMangDuLieu(
    data
) {

    if (
        Array.isArray(data)
    ) {

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
// DOC FIELD
// ======================================================

function doc(
    object,
    keys
) {

    if (
        !object ||
        typeof object !==
            "object"
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


// ======================================================
// NORMALIZE
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


// ======================================================
// ESCAPE HTML
// ======================================================

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


// ======================================================
// ESCAPE JS
// ======================================================

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
        )
        .replace(
            /\r?\n/g,
            "\\n"
        );

}


// ======================================================
// IMAGE FALLBACK SVG
// ======================================================

function taoSvgFallback(
    tenCuaHang
) {

    const safeText =
        escapeXml(
            String(
                tenCuaHang ||
                "FoodDeli"
            )
                .slice(0, 20)
        );


    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="800"
             height="500"
             viewBox="0 0 800 500">

            <rect
                width="800"
                height="500"
                fill="#f3f4f6"
            />

            <text
                x="400"
                y="235"
                text-anchor="middle"
                font-family="Arial"
                font-size="34"
                font-weight="700"
                fill="#9ca3af"
            >
                ${safeText}
            </text>

            <text
                x="400"
                y="285"
                text-anchor="middle"
                font-family="Arial"
                font-size="20"
                fill="#9ca3af"
            >
                FoodDeli
            </text>

        </svg>
    `;


    return encodeURIComponent(
        svg
    );

}


// ======================================================
// IMAGE DEFAULT
// ======================================================

function taoAnhMacDinh(
    tenCuaHang
) {

    return `
        data:image/svg+xml;charset=UTF-8,
        ${taoSvgFallback(tenCuaHang)}
    `.replace(
        /\s+/g,
        ""
    );

}


// ======================================================
// XML ESCAPE
// ======================================================

function escapeXml(
    value
) {

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
            "&apos;"
        );

}
// ======================================================
// XEM CUA HANG
// ======================================================

function xemCuaHang(
    maCuaHang
) {

    // ------------------------------------------
    // KIỂM TRA MÃ CỬA HÀNG
    // ------------------------------------------

    if (
        !maCuaHang
    ) {

        alert(
            "Không xác định được cửa hàng."
        );

        return;

    }


    // ------------------------------------------
    // KIỂM TRA ĐĂNG NHẬP
    // ------------------------------------------

    const token =
        localStorage.getItem(
            "token"
        );

    const user =
        localStorage.getItem(
            "user"
        );


    if (
        !token ||
        !user
    ) {

        alert(
            "Bạn cần đăng nhập để xem chi tiết cửa hàng."
        );

        return;

    }


    // ------------------------------------------
    // CHUYỂN SANG CHI TIẾT CỬA HÀNG
    // ------------------------------------------

    try {

        const url =
            `pages/chitietcuahang.html?maCuaHang=${encodeURIComponent(
                maCuaHang
            )}`;


        window.location.href =
            url;

    }
    catch (error) {

        console.error(
            "Lỗi mở chi tiết cửa hàng:",
            error
        );


        alert(
            "Không thể mở trang chi tiết cửa hàng."
        );

    }

}