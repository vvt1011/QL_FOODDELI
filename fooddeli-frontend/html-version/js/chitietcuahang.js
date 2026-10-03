const API_BASE_URL = "https://localhost:7135/api";

let maCuaHang = "";
let cuaHang = null;
let danhSachMonAn = [];


document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       LẤY MÃ CỬA HÀNG TRÊN URL
       Ví dụ:
       chi-tiet-cua-hang.html?maCuaHang=CH001
    ========================================== */

    const params =
        new URLSearchParams(window.location.search);

    maCuaHang =
        params.get("maCuaHang");


    /* ==========================================
       KIỂM TRA MÃ CỬA HÀNG
    ========================================== */

    if (!maCuaHang) {

        showError(
            "Không tìm thấy mã cửa hàng."
        );

        return;
    }


    /* ==========================================
       NÚT THỬ LẠI
    ========================================== */

    document
        .getElementById("retryBtn")
        ?.addEventListener(
            "click",
            loadPage
        );


    /* ==========================================
       NÚT QUAY LẠI
    ========================================== */

    document
        .getElementById("backBtn")
        ?.addEventListener(
            "click",
            () => {

                window.location.href =
                    "cua-hang.html";

            }
        );


    /* ==========================================
       TÌM KIẾM MÓN ĂN
    ========================================== */

    document
        .getElementById("foodSearch")
        ?.addEventListener(
            "input",
            handleFoodSearch
        );


    /* ==========================================
       TẢI DỮ LIỆU
    ========================================== */

    loadPage();

});


/* =========================================================
   TẢI DỮ LIỆU TRANG
========================================================= */

async function loadPage() {

    setPageState("loading");


    try {

        /* ==========================================
           API CỬA HÀNG
        ========================================== */

        const storeResponse =
            await fetch(
                `${API_BASE_URL}/CuaHang/${encodeURIComponent(maCuaHang)}`
            );


        const storeData =
            await parseJson(storeResponse);


        if (!storeResponse.ok) {

            throw new Error(
                storeData?.message ||
                storeData?.Message ||
                "Không thể tải thông tin cửa hàng."
            );

        }


        /* ==========================================
           API MÓN ĂN
        ========================================== */

        const foodResponse =
            await fetch(
                `${API_BASE_URL}/MonAn/CuaHang/${encodeURIComponent(maCuaHang)}`
            );


        const foodData =
            await parseJson(foodResponse);


        if (!foodResponse.ok) {

            throw new Error(
                foodData?.message ||
                foodData?.Message ||
                "Không thể tải danh sách món ăn."
            );

        }


        /* ==========================================
           LƯU DỮ LIỆU
        ========================================== */

        cuaHang =
            storeData;

        danhSachMonAn =
            Array.isArray(foodData)
                ? foodData
                : extractArray(foodData);


        /* ==========================================
           HIỂN THỊ
        ========================================== */

        renderCuaHang(
            cuaHang
        );

        renderDanhSachMonAn(
            danhSachMonAn
        );


        /* ==========================================
           HIỆN TRANG
        ========================================== */

        setPageState(
            "content"
        );

    }
    catch (error) {

        console.error(
            "Lỗi tải trang:",
            error
        );

        showError(
            error.message ||
            "Không thể tải dữ liệu."
        );

    }

}


/* =========================================================
   HIỂN THỊ CỬA HÀNG
========================================================= */

function renderCuaHang(store) {

    const maStore =
        getValue(
            store,
            "MaCuaHang"
        );

    const tenStore =
        getValue(
            store,
            "TenCuaHang"
        ) ||
        "Cửa hàng FoodDeli";

    const moTa =
        getValue(
            store,
            "MoTa"
        ) ||
        "Cửa hàng chưa có mô tả.";

    const diaChi =
        getValue(
            store,
            "DiaChi"
        ) ||
        "Chưa cập nhật";

    const soDienThoai =
        getValue(
            store,
            "SoDienThoai"
        ) ||
        "Chưa cập nhật";

    const maChuShop =
        getValue(
            store,
            "MaChuShop"
        ) ||
        "—";

    const anh =
        getValue(
            store,
            "AnhCuaHang"
        );

    const danhGia =
        Number(
            getValue(
                store,
                "DanhGia"
            )
        ) || 0;

    const trangThai =
        getValue(
            store,
            "TrangThai"
        );


    /* ==========================================
       TITLE
    ========================================== */

    document.title =
        `${tenStore} - FoodDeli`;


    /* ==========================================
       BREADCRUMB
    ========================================== */

    const breadcrumb =
        document.getElementById(
            "breadcrumbStore"
        );

    if (breadcrumb) {

        breadcrumb.textContent =
            tenStore;

    }


    /* ==========================================
       TÊN CỬA HÀNG
    ========================================== */

    document
        .getElementById("storeName")
        .textContent =
            tenStore;


    /* ==========================================
       MÔ TẢ
    ========================================== */

    document
        .getElementById("storeDescription")
        .textContent =
            moTa;


    /* ==========================================
       ĐỊA CHỈ
    ========================================== */

    document
        .getElementById("storeAddress")
        .textContent =
            diaChi;


    /* ==========================================
       SỐ ĐIỆN THOẠI
    ========================================== */

    document
        .getElementById("storePhone")
        .textContent =
            soDienThoai;


    /* ==========================================
       MÃ CỬA HÀNG
    ========================================== */

    document
        .getElementById("storeCode")
        .textContent =
            maStore || "—";


    /* ==========================================
       CHỦ SHOP
    ========================================== */

    document
        .getElementById("storeOwner")
        .textContent =
            maChuShop;


    /* ==========================================
       ĐÁNH GIÁ
    ========================================== */

    const rating =
        document.getElementById(
            "storeRating"
        );

    if (rating) {

        rating.textContent =
            danhGia > 0
                ? `★ ${danhGia.toFixed(1)} / 5`
                : "★ Chưa có đánh giá";

    }


    /* ==========================================
       TRẠNG THÁI
    ========================================== */

    const status =
        document.getElementById(
            "storeStatus"
        );

    const dangHoatDong =
        isActiveStatus(
            trangThai
        );

    if (status) {

        status.textContent =
            dangHoatDong
                ? "Đang hoạt động"
                : "Ngừng hoạt động";

        status.className =
            dangHoatDong
                ? "active"
                : "inactive";

    }


    /* ==========================================
       ẢNH
    ========================================== */

    const image =
        document.getElementById(
            "storeImage"
        );

    if (image) {

        image.src =
            buildImageUrl(
                anh
            );

        image.alt =
            tenStore;


        image.onerror =
            function () {

                this.onerror = null;

                this.src =
                    getFallbackImage();

            };

    }

}


/* =========================================================
   HIỂN THỊ DANH SÁCH MÓN
========================================================= */

function renderDanhSachMonAn(
    danhSach
) {

    const foodGrid =
        document.getElementById(
            "foodGrid"
        );

    const foodCount =
        document.getElementById(
            "foodCountText"
        );


    if (!foodGrid) {
        return;
    }


    /* ==========================================
       ĐẢM BẢO LÀ ARRAY
    ========================================== */

    if (!Array.isArray(danhSach)) {

        danhSach = [];

    }


    /* ==========================================
       SỐ LƯỢNG
    ========================================== */

    if (foodCount) {

        foodCount.textContent =
            `${danhSach.length} món`;

    }


    /* ==========================================
       KHÔNG CÓ MÓN
    ========================================== */

    if (danhSach.length === 0) {

        foodGrid.innerHTML = `

            <div class="empty-menu">

                <div class="empty-menu-icon">
                    🍽️
                </div>

                <h3>
                    Chưa có món ăn
                </h3>

                <p>
                    Cửa hàng hiện chưa có món ăn nào.
                </p>

            </div>

        `;

        return;
    }


    /* ==========================================
       HIỂN THỊ MÓN
    ========================================== */

    foodGrid.innerHTML =
        danhSach
            .map(
                renderFoodCard
            )
            .join("");

}


/* =========================================================
   CARD MÓN ĂN
========================================================= */

function renderFoodCard(
    monAn
) {

    const maMonAn =
        getValue(
            monAn,
            "MaMonAn"
        );

    const tenMonAn =
        getValue(
            monAn,
            "TenMonAn"
        ) ||
        "Món ăn";

    const moTa =
        getValue(
            monAn,
            "MoTa"
        ) ||
        "Chưa có mô tả.";

    const gia =
        Number(
            getValue(
                monAn,
                "Gia"
            )
        ) || 0;

    const anh =
        getValue(
            monAn,
            "AnhMonAn"
        );

    const danhGia =
        Number(
            getValue(
                monAn,
                "DanhGia"
            )
        ) || 0;

    const trangThai =
        getValue(
            monAn,
            "TrangThai"
        );

    const dangBan =
        isActiveStatus(
            trangThai
        );


    return `

        <article
            class="food-card"
            tabindex="0"
            role="button"
            onclick="xemChiTietMon('${escapeJs(maMonAn)}')"
            onkeydown="handleFoodCardKey(event, '${escapeJs(maMonAn)}')"
        >

            <div class="food-card-image-box">

                <img
                    class="food-card-image"
                    src="${escapeAttribute(buildImageUrl(anh))}"
                    alt="${escapeAttribute(tenMonAn)}"

                    onerror="
                        this.onerror=null;
                        this.src='${escapeAttribute(getFallbackImage())}'
                    "
                >


                <span
                    class="food-card-status ${
                        dangBan
                            ? "active"
                            : "inactive"
                    }"
                >
                    ${
                        dangBan
                            ? "Đang bán"
                            : "Tạm ngừng"
                    }
                </span>

            </div>


            <div class="food-card-body">

                <h3 class="food-card-name">

                    ${escapeHtml(
                        tenMonAn
                    )}

                </h3>


                <p class="food-card-description">

                    ${escapeHtml(
                        moTa
                    )}

                </p>


                <div class="food-card-footer">

                    <span class="food-card-price">

                        ${formatMoney(
                            gia
                        )}

                    </span>


                    <span class="food-card-rating">

                        ${
                            danhGia > 0
                                ? `★ ${danhGia.toFixed(1)}`
                                : "Chưa đánh giá"
                        }

                    </span>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   TÌM KIẾM
========================================================= */

function handleFoodSearch(
    event
) {

    const keyword =
        event.target.value
            .trim()
            .toLowerCase();


    if (!keyword) {

        renderDanhSachMonAn(
            danhSachMonAn
        );

        return;
    }


    const ketQua =
        danhSachMonAn.filter(
            (monAn) => {

                const ten =
                    getValue(
                        monAn,
                        "TenMonAn"
                    )
                    .toLowerCase();

                const moTa =
                    getValue(
                        monAn,
                        "MoTa"
                    )
                    .toLowerCase();

                const ma =
                    getValue(
                        monAn,
                        "MaMonAn"
                    )
                    .toLowerCase();


                return (
                    ten.includes(keyword) ||
                    moTa.includes(keyword) ||
                    ma.includes(keyword)
                );

            }
        );


    renderDanhSachMonAn(
        ketQua
    );

}


/* =========================================================
   CHUYỂN SANG CHI TIẾT MÓN
========================================================= */

function xemChiTietMon(
    maMonAn
) {

    if (!maMonAn) {
        return;
    }


    window.location.href =
        `chi-tiet-mon-an.html?maMonAn=${
            encodeURIComponent(
                maMonAn
            )
        }`;

}


/* =========================================================
   BÀN PHÍM
========================================================= */

function handleFoodCardKey(
    event,
    maMonAn
) {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();

        xemChiTietMon(
            maMonAn
        );

    }

}


/* =========================================================
   TRẠNG THÁI TRANG
========================================================= */

function setPageState(
    state
) {

    const loading =
        document.getElementById(
            "loadingState"
        );

    const error =
        document.getElementById(
            "errorState"
        );

    const content =
        document.getElementById(
            "storeContent"
        );


    if (loading) {

        loading.hidden =
            state !== "loading";

    }

    if (error) {

        error.hidden =
            state !== "error";

    }

    if (content) {

        content.hidden =
            state !== "content";

    }

}


/* =========================================================
   HIỂN THỊ LỖI
========================================================= */

function showError(
    message
) {

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );


    if (errorMessage) {

        errorMessage.textContent =
            message ||
            "Đã xảy ra lỗi.";

    }


    setPageState(
        "error"
    );

}


/* =========================================================
   PARSE JSON
========================================================= */

async function parseJson(
    response
) {

    try {

        return await response.json();

    }
    catch {

        return null;

    }

}


/* =========================================================
   EXTRACT ARRAY
========================================================= */

function extractArray(
    data
) {

    if (
        Array.isArray(data)
    ) {

        return data;

    }

    if (
        Array.isArray(data?.items)
    ) {

        return data.items;

    }

    if (
        Array.isArray(data?.Items)
    ) {

        return data.Items;

    }

    if (
        Array.isArray(data?.data)
    ) {

        return data.data;

    }

    if (
        Array.isArray(data?.Data)
    ) {

        return data.Data;

    }

    return [];

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(
    object,
    key
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return "";

    }


    if (
        object[key] !== undefined &&
        object[key] !== null
    ) {

        return String(
            object[key]
        );

    }


    const camelKey =
        key.charAt(0).toLowerCase() +
        key.slice(1);


    if (
        object[camelKey] !== undefined &&
        object[camelKey] !== null
    ) {

        return String(
            object[camelKey]
        );

    }


    return "";

}


/* =========================================================
   TRẠNG THÁI ACTIVE
========================================================= */

function isActiveStatus(
    value
) {

    if (
        typeof value === "boolean"
    ) {

        return value;

    }


    if (
        typeof value === "number"
    ) {

        return value === 1;

    }


    const valueText =
        String(
            value ?? ""
        )
        .trim()
        .toLowerCase();


    return (
        valueText === "1" ||
        valueText === "true" ||
        valueText === "active" ||
        valueText === "danghoatdong"
    );

}


/* =========================================================
   FORMAT TIỀN
========================================================= */

function formatMoney(
    value
) {

    return new Intl.NumberFormat(
        "vi-VN",
        {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );

}


/* =========================================================
   XỬ LÝ ẢNH
========================================================= */

function buildImageUrl(
    value
) {

    const src =
        String(
            value ?? ""
        ).trim();


    if (!src) {

        return getFallbackImage();

    }


    if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("data:")
    ) {

        return src;

    }


    return src;

}


/* =========================================================
   FALLBACK IMAGE
========================================================= */

function getFallbackImage() {

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="500"
                height="500"
            >

                <rect
                    width="100%"
                    height="100%"
                    fill="#eeeeee"
                />

                <text
                    x="50%"
                    y="50%"
                    dominant-baseline="middle"
                    text-anchor="middle"

                    font-family="Arial"

                    font-size="34"

                    fill="#888888"
                >
                    FoodDeli
                </text>

            </svg>

        `)
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   ESCAPE JAVASCRIPT
========================================================= */

function escapeJs(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "\\",
        "\\\\"
    )
    .replaceAll(
        "'",
        "\\'"
    )
    .replaceAll(
        "\n",
        "\\n"
    )
    .replaceAll(
        "\r",
        "\\r"
    );

}