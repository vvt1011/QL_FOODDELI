const API_BASE = "https://localhost:7135/api";

// ======================================================
// BIẾN
// ======================================================

let allFoods = [];
let filteredFoods = [];


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// FORMAT GIÁ
// ======================================================

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "0 ₫";
    }

    const number = Number(price);

    if (Number.isNaN(number)) {
        return "0 ₫";
    }

    return number.toLocaleString("vi-VN") + " ₫";
}


// ======================================================
// LẤY TÊN MÓN
// ======================================================

function getFoodName(monAn) {

    return (
        monAn.tenMonAn ||
        monAn.TenMonAn ||
        "Món ăn"
    );
}


// ======================================================
// LẤY MÃ MÓN
// ======================================================

function getFoodId(monAn) {

    return (
        monAn.maMonAn ||
        monAn.MaMonAn ||
        ""
    );
}


// ======================================================
// LẤY GIÁ
// ======================================================

function getFoodPrice(monAn) {

    return (
        monAn.gia ??
        monAn.Gia ??
        0
    );
}


// ======================================================
// LẤY MÔ TẢ
// ======================================================

function getFoodDescription(monAn) {

    return (
        monAn.moTa ||
        monAn.MoTa ||
        "Món ăn ngon được phục vụ trên FoodDeli."
    );
}


// ======================================================
// LẤY ẢNH
// ======================================================

function getFoodImage(monAn) {

    return (
        monAn.anhMonAn ||
        monAn.AnhMonAn ||
        monAn.hinhAnh ||
        monAn.HinhAnh ||
        ""
    );
}


// ======================================================
// LẤY ĐÁNH GIÁ
// ======================================================

function getFoodRating(monAn) {

    return (
        monAn.danhGia ??
        monAn.DanhGia ??
        monAn.diemDanhGia ??
        monAn.DiemDanhGia ??
        0
    );
}


// ======================================================
// LẤY TRẠNG THÁI
// ======================================================

function getFoodStatus(monAn) {

    const status =
        monAn.trangThai ??
        monAn.TrangThai;

    // Nếu API không trả TrangThai
    // thì mặc định xem như đang bán
    if (
        status === null ||
        status === undefined ||
        status === ""
    ) {
        return 1;
    }

    // Hỗ trợ true / false
    if (status === true) {
        return 1;
    }

    if (status === false) {
        return 0;
    }

    return Number(status);
}


// ======================================================
// HIỂN THỊ STATE
// ======================================================

function showState(state) {

    const loginState =
        document.getElementById("foodsLoginState");

    const loadingState =
        document.getElementById("foodsLoadingState");

    const errorState =
        document.getElementById("foodsErrorState");

    const emptyState =
        document.getElementById("foodsEmptyState");

    const content =
        document.getElementById("foodsContent");


    if (loginState) {
        loginState.hidden = state !== "login";
    }

    if (loadingState) {
        loadingState.hidden = state !== "loading";
    }

    if (errorState) {
        errorState.hidden = state !== "error";
    }

    if (emptyState) {
        emptyState.hidden = state !== "empty";
    }

    if (content) {
        content.hidden = state !== "content";
    }
}


// ======================================================
// LOAD MÓN ĂN
// ======================================================

async function loadFoods() {

    showState("loading");

    try {

        // ==================================================
        // API PUBLIC
        // GET /api/MonAn
        // Không cần token
        // ==================================================

        const response =
            await fetch(
                `${API_BASE}/MonAn`,
                {
                    method: "GET"
                }
            );


        // ==================================================
        // XỬ LÝ LỖI
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                `HTTP ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData?.message) {
                    errorMessage =
                        errorData.message;
                }

            } catch (e) {
                // Không có JSON lỗi
            }

            throw new Error(errorMessage);
        }


        // ==================================================
        // LẤY DATA
        // ==================================================

        const data =
            await response.json();


        console.log(
            "Dữ liệu món ăn từ API:",
            data
        );


        // ==================================================
        // XỬ LÝ RESPONSE
        // ==================================================

        if (Array.isArray(data)) {

            allFoods = data;

        }
        else if (
            Array.isArray(data?.data)
        ) {

            allFoods = data.data;

        }
        else if (
            Array.isArray(data?.Data)
        ) {

            allFoods = data.Data;

        }
        else if (
            Array.isArray(data?.items)
        ) {

            allFoods = data.items;

        }
        else if (
            Array.isArray(data?.Items)
        ) {

            allFoods = data.Items;

        }
        else if (
            Array.isArray(data?.results)
        ) {

            allFoods = data.results;

        }
        else if (
            Array.isArray(data?.Results)
        ) {

            allFoods = data.Results;

        }
        else {

            allFoods = [];
        }


        console.log(
            "Tổng số món nhận được:",
            allFoods.length
        );


        // ==================================================
        // CHỈ HIỂN THỊ MÓN ĐANG BÁN
        // ==================================================

        allFoods =
            allFoods.filter(
                monAn =>
                    getFoodStatus(monAn) === 1
            );


        console.log(
            "Số món đang bán:",
            allFoods.length
        );


        // ==================================================
        // COPY RA DANH SÁCH HIỂN THỊ
        // ==================================================

        filteredFoods =
            [...allFoods];


        // ==================================================
        // RENDER
        // ==================================================

        renderFoods();

    }
    catch (error) {

        console.error(
            "Lỗi tải món ăn:",
            error
        );

        showError(
            "Không thể tải danh sách món ăn. Vui lòng thử lại."
        );
    }
}


// ======================================================
// HIỂN THỊ LỖI
// ======================================================

function showError(message) {

    showState("error");

    const errorMessage =
        document.getElementById(
            "foodsErrorMessage"
        );

    if (errorMessage) {

        errorMessage.textContent =
            message;
    }
}


// ======================================================
// HIỂN THỊ MÓN ĂN
// ======================================================

function renderFoods() {

    const foodsList =
        document.getElementById(
            "foodsList"
        );

    const resultCount =
        document.getElementById(
            "foodsResultCount"
        );


    if (!foodsList) {

        console.error(
            "Không tìm thấy #foodsList"
        );

        return;
    }


    // ==================================================
    // KHÔNG CÓ DỮ LIỆU
    // ==================================================

    if (
        !filteredFoods ||
        filteredFoods.length === 0
    ) {

        foodsList.innerHTML = "";

        if (resultCount) {

            resultCount.textContent =
                "0 món";
        }

        showState("empty");

        return;
    }


    // ==================================================
    // SỐ LƯỢNG
    // ==================================================

    if (resultCount) {

        resultCount.textContent =
            `${filteredFoods.length.toLocaleString("vi-VN")} món`;
    }


    // ==================================================
    // TẠO CARD
    // ==================================================

    foodsList.innerHTML =
        filteredFoods
            .map(
                (monAn, index) =>
                    createFoodCard(
                        monAn,
                        index
                    )
            )
            .join("");


    showState("content");
}


// ======================================================
// TẠO CARD MÓN ĂN
// ======================================================

function createFoodCard(monAn, index) {

    const id =
        getFoodId(monAn);

    const name =
        getFoodName(monAn);

    const price =
        getFoodPrice(monAn);

    const description =
        getFoodDescription(monAn);

    const image =
        getFoodImage(monAn);

    const rating =
        getFoodRating(monAn);


    let imageHtml;


    // ==================================================
    // CÓ ẢNH
    // ==================================================

    if (image) {

        imageHtml = `
            <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(name)}"
                class="food-card-image"
                loading="lazy"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="food-card-image-placeholder"
                style="display:none;"
            >
                🍽️
            </div>
        `;
    }


    // ==================================================
    // KHÔNG CÓ ẢNH
    // ==================================================

    else {

        imageHtml = `
            <div
                class="food-card-image-placeholder"
            >
                🍽️
            </div>
        `;
    }


    return `
        <article
            class="food-card"
            data-food-id="${escapeHtml(id)}"
        >

            <div class="food-card-image-wrapper">

                ${imageHtml}

            </div>


            <div class="food-card-content">

                <div class="food-card-top">

                    <h3 class="food-card-title">
                        ${escapeHtml(name)}
                    </h3>

                </div>


                <p class="food-card-description">
                    ${escapeHtml(description)}
                </p>


                <div class="food-card-meta">

                    <span class="food-card-rating">
                        ⭐ ${escapeHtml(rating)}
                    </span>

                </div>


                <div class="food-card-bottom">

                    <strong class="food-card-price">
                        ${formatPrice(price)}
                    </strong>


                    <button
                        type="button"
                        class="foods-primary-btn food-detail-btn"
                        data-food-id="${escapeHtml(id)}"
                    >
                        Xem món
                    </button>

                </div>

            </div>

        </article>
    `;
}


// ======================================================
// TÌM KIẾM
// ======================================================

function setupSearch() {

    const input =
        document.getElementById(
            "foodSearchInput"
        );

    const clearButton =
        document.getElementById(
            "btnClearFoodSearch"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            // ==================================================
            // HIỆN / ẨN NÚT XÓA
            // ==================================================

            if (clearButton) {

                clearButton.hidden =
                    keyword === "";
            }


            // ==================================================
            // KHÔNG CÓ TỪ KHÓA
            // ==================================================

            if (!keyword) {

                filteredFoods =
                    [...allFoods];
            }

            // ==================================================
            // CÓ TỪ KHÓA
            // ==================================================

            else {

                filteredFoods =
                    allFoods.filter(
                        monAn => {

                            const name =
                                String(
                                    getFoodName(monAn)
                                )
                                    .toLowerCase();

                            const description =
                                String(
                                    getFoodDescription(monAn)
                                )
                                    .toLowerCase();

                            const id =
                                String(
                                    getFoodId(monAn)
                                )
                                    .toLowerCase();


                            return (
                                name.includes(keyword) ||
                                description.includes(keyword) ||
                                id.includes(keyword)
                            );
                        }
                    );
            }


            renderFoods();
        }
    );


    // ==================================================
    // NÚT XÓA TÌM KIẾM
    // ==================================================

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                input.value = "";

                clearButton.hidden = true;

                filteredFoods =
                    [...allFoods];

                renderFoods();

                input.focus();
            }
        );
    }
}


// ======================================================
// RESET SEARCH
// ======================================================

function setupResetSearch() {

    const button =
        document.getElementById(
            "btnResetFoodSearch"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "foodSearchInput"
                );


            if (input) {

                input.value = "";
            }


            const clearButton =
                document.getElementById(
                    "btnClearFoodSearch"
                );


            if (clearButton) {

                clearButton.hidden = true;
            }


            filteredFoods =
                [...allFoods];


            renderFoods();
        }
    );
}


// ======================================================
// REFRESH
// ======================================================

function setupRefresh() {

    const button =
        document.getElementById(
            "btnRefreshFoods"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            button.disabled = true;

            const oldText =
                button.textContent;

            button.textContent =
                "↻ Đang tải...";


            try {

                await loadFoods();

            }
            finally {

                button.disabled = false;

                button.textContent =
                    oldText || "↻ Làm mới";
            }
        }
    );
}


// ======================================================
// CHI TIẾT MÓN ĂN
// ======================================================

function setupFoodDetails() {

    const foodsList =
        document.getElementById(
            "foodsList"
        );


    if (!foodsList) {
        return;
    }


    foodsList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".food-detail-btn"
                );


            if (!button) {
                return;
            }


            const foodId =
                button.dataset.foodId;


            if (!foodId) {
                return;
            }


            openFoodDetail(foodId);
        }
    );
}


// ======================================================
// MỞ MODAL CHI TIẾT
// ======================================================

function openFoodDetail(foodId) {

    const modal =
        document.getElementById(
            "foodDetailModal"
        );

    const body =
        document.getElementById(
            "foodDetailBody"
        );

    const title =
        document.getElementById(
            "foodDetailTitle"
        );


    if (!modal || !body) {
        return;
    }


    // ==================================================
    // TÌM MÓN
    // ==================================================

    const monAn =
        allFoods.find(
            item =>
                String(
                    getFoodId(item)
                ).toLowerCase() ===
                String(foodId).toLowerCase()
        );


    if (!monAn) {

        body.innerHTML = `
            <p>
                Không tìm thấy thông tin món ăn.
            </p>
        `;

        modal.hidden = false;

        document.body.style.overflow =
            "hidden";

        return;
    }


    // ==================================================
    // DATA
    // ==================================================

    const name =
        getFoodName(monAn);

    const price =
        getFoodPrice(monAn);

    const description =
        getFoodDescription(monAn);

    const image =
        getFoodImage(monAn);

    const rating =
        getFoodRating(monAn);

    const id =
        getFoodId(monAn);


    // ==================================================
    // TITLE
    // ==================================================

    if (title) {

        title.textContent =
            name;
    }


    // ==================================================
    // IMAGE
    // ==================================================

    const imageHtml =
        image
            ? `
                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    class="food-detail-image"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="food-detail-image-placeholder"
                    style="display:none;"
                >
                    🍽️
                </div>
              `
            : `
                <div
                    class="food-detail-image-placeholder"
                >
                    🍽️
                </div>
              `;


    // ==================================================
    // MODAL CONTENT
    // ==================================================

    body.innerHTML = `
        <div class="food-detail">

            <div class="food-detail-image-wrapper">

                ${imageHtml}

            </div>


            <div class="food-detail-info">

                <h3>
                    ${escapeHtml(name)}
                </h3>


                <p class="food-detail-description">
                    ${escapeHtml(description)}
                </p>


                <div class="food-detail-rating">
                    ⭐ ${escapeHtml(rating)}
                </div>


                <div class="food-detail-price">
                    ${formatPrice(price)}
                </div>


                <button
                    type="button"
                    class="foods-primary-btn"
                    data-add-food="${escapeHtml(id)}"
                >
                    🛒 Thêm vào giỏ hàng
                </button>

            </div>

        </div>
    `;


    // ==================================================
    // HIỆN MODAL
    // ==================================================

    modal.hidden = false;

    document.body.style.overflow =
        "hidden";
}


// ======================================================
// ĐÓNG MODAL
// ======================================================

function closeFoodDetail() {

    const modal =
        document.getElementById(
            "foodDetailModal"
        );


    if (!modal) {
        return;
    }


    modal.hidden = true;

    document.body.style.overflow =
        "";
}


// ======================================================
// SETUP MODAL
// ======================================================

function setupModal() {

    const closeButton =
        document.getElementById(
            "btnCloseFoodModal"
        );


    // ==================================================
    // NÚT ĐÓNG
    // ==================================================

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeFoodDetail
        );
    }


    // ==================================================
    // CLICK BACKDROP
    // ==================================================

    const modal =
        document.getElementById(
            "foodDetailModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.hasAttribute(
                        "data-close-food-modal"
                    )
                ) {

                    closeFoodDetail();
                }
            }
        );
    }


    // ==================================================
    // ESC
    // ==================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeFoodDetail();
            }
        }
    );
}


// ======================================================
// THÊM VÀO GIỎ HÀNG
// ======================================================

function setupAddToCart() {

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-add-food]"
                );


            if (!button) {
                return;
            }


            const foodId =
                button.dataset.addFood;


            if (!foodId) {
                return;
            }


            const monAn =
                allFoods.find(
                    item =>
                        String(
                            getFoodId(item)
                        ).toLowerCase() ===
                        String(foodId).toLowerCase()
                );


            if (!monAn) {

                alert(
                    "Không tìm thấy món ăn."
                );

                return;
            }


            // ==================================================
            // HIỆN TẠI
            // Lưu món vào localStorage
            // ==================================================

            let gioHang = [];


            try {

                const oldCart =
                    localStorage.getItem(
                        "gioHang"
                    );


                if (oldCart) {

                    gioHang =
                        JSON.parse(oldCart);
                }


                if (!Array.isArray(gioHang)) {

                    gioHang = [];
                }

            }
            catch (error) {

                console.error(
                    "Lỗi đọc giỏ hàng:",
                    error
                );

                gioHang = [];
            }


            // ==================================================
            // KIỂM TRA MÓN ĐÃ CÓ
            // ==================================================

            const existingIndex =
                gioHang.findIndex(
                    item =>
                        String(
                            item.maMonAn ||
                            item.MaMonAn ||
                            ""
                        ).toLowerCase() ===
                        String(foodId).toLowerCase()
                );


            if (existingIndex >= 0) {

                gioHang[existingIndex].soLuong =
                    Number(
                        gioHang[existingIndex].soLuong ||
                        gioHang[existingIndex].SoLuong ||
                        1
                    ) + 1;

            }
            else {

                gioHang.push({

                    maMonAn:
                        getFoodId(monAn),

                    tenMonAn:
                        getFoodName(monAn),

                    gia:
                        getFoodPrice(monAn),

                    soLuong: 1,

                    anhMonAn:
                        getFoodImage(monAn)

                });
            }


            // ==================================================
            // LƯU
            // ==================================================

            localStorage.setItem(
                "gioHang",
                JSON.stringify(gioHang)
            );


            alert(
                `Đã thêm "${getFoodName(monAn)}" vào giỏ hàng.`
            );


            // Đóng modal
            closeFoodDetail();
        }
    );
}


// ======================================================
// KHỞI TẠO
// ======================================================

async function initFoodsPage() {

    setupSearch();

    setupResetSearch();

    setupRefresh();

    setupFoodDetails();

    setupModal();

    setupAddToCart();


    await loadFoods();
}


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    initFoodsPage
);