const API_BASE_URL =
    "https://localhost:7135/api";

let maCuaHang = "";
let cuaHang = null;
let danhSachMonAn = [];


// =========================================================
// KHỞI CHẠY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =================================================
        // LẤY MÃ CỬA HÀNG TỪ URL
        // =================================================

        const params =
            new URLSearchParams(
                window.location.search
            );

        maCuaHang =
            params.get("maCuaHang");


        // =================================================
        // KIỂM TRA MÃ CỬA HÀNG
        // =================================================

        if (!maCuaHang) {

            showError(
                "Không tìm thấy mã cửa hàng."
            );

            return;
        }


        // =================================================
        // NÚT THỬ LẠI
        // =================================================

        document
            .getElementById("retryBtn")
            ?.addEventListener(
                "click",
                loadPage
            );


        // =================================================
        // NÚT QUAY LẠI
        // =================================================

        document
            .getElementById("backBtn")
            ?.addEventListener(
                "click",
                goBackToStores
            );


        // =================================================
        // TÌM KIẾM MÓN
        // =================================================

        document
            .getElementById("foodSearch")
            ?.addEventListener(
                "input",
                handleFoodSearch
            );


        // =================================================
        // TẢI TRANG
        // =================================================

        loadPage();

    }
);


// =========================================================
// QUAY LẠI CỬA HÀNG
// =========================================================

function goBackToStores() {

    window.location.href =
        "cua-hang.html";

}


// =========================================================
// TẢI TOÀN BỘ DỮ LIỆU
// =========================================================

async function loadPage() {

    setPageState(
        "loading"
    );


    try {

        // =================================================
        // API CỬA HÀNG
        // =================================================

        const storeResponse =
            await fetch(
                `${API_BASE_URL}/CuaHang/${encodeURIComponent(
                    maCuaHang
                )}`,
                {
                    method: "GET"
                }
            );


        const storeData =
            await parseJson(
                storeResponse
            );


        if (!storeResponse.ok) {

            throw new Error(
                storeData?.message ||
                storeData?.Message ||
                "Không thể tải thông tin cửa hàng."
            );

        }


        // =================================================
        // API MÓN ĂN
        // =================================================

        const foodResponse =
            await fetch(
                `${API_BASE_URL}/MonAn/CuaHang/${encodeURIComponent(
                    maCuaHang
                )}`,
                {
                    method: "GET"
                }
            );


        const foodData =
            await parseJson(
                foodResponse
            );


        if (!foodResponse.ok) {

            throw new Error(
                foodData?.message ||
                foodData?.Message ||
                "Không thể tải danh sách món ăn."
            );

        }


        // =================================================
        // LƯU DỮ LIỆU
        // =================================================

        cuaHang =
            storeData;

        danhSachMonAn =
            Array.isArray(foodData)
                ? foodData
                : extractArray(
                    foodData
                );


        // =================================================
        // HIỂN THỊ CỬA HÀNG
        // =================================================

        renderCuaHang(
            cuaHang
        );


        // =================================================
        // HIỂN THỊ MÓN
        // =================================================

        renderDanhSachMonAn(
            danhSachMonAn
        );


        // =================================================
        // HIỆN NỘI DUNG
        // =================================================

        setPageState(
            "content"
        );

    }
    catch (error) {

        console.error(
            "Lỗi tải trang cửa hàng:",
            error
        );


        showError(
            error.message ||
            "Không thể tải dữ liệu."
        );

    }

}


// =========================================================
// HIỂN THỊ THÔNG TIN CỬA HÀNG
// =========================================================

function renderCuaHang(
    store
) {

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


    // =================================================
    // TITLE
    // =================================================

    document.title =
        `${tenStore} - FoodDeli`;


    // =================================================
    // BREADCRUMB
    // =================================================

    const breadcrumb =
        document.getElementById(
            "breadcrumbStore"
        );


    if (breadcrumb) {

        breadcrumb.textContent =
            tenStore;

    }


    // =================================================
    // TÊN
    // =================================================

    const storeName =
        document.getElementById(
            "storeName"
        );


    if (storeName) {

        storeName.textContent =
            tenStore;

    }


    // =================================================
    // MÔ TẢ
    // =================================================

    const storeDescription =
        document.getElementById(
            "storeDescription"
        );


    if (storeDescription) {

        storeDescription.textContent =
            moTa;

    }


    // =================================================
    // ĐỊA CHỈ
    // =================================================

    const storeAddress =
        document.getElementById(
            "storeAddress"
        );


    if (storeAddress) {

        storeAddress.textContent =
            diaChi;

    }


    // =================================================
    // SỐ ĐIỆN THOẠI
    // =================================================

    const storePhone =
        document.getElementById(
            "storePhone"
        );


    if (storePhone) {

        storePhone.textContent =
            soDienThoai;

    }


    // =================================================
    // MÃ CỬA HÀNG
    // =================================================

    const storeCode =
        document.getElementById(
            "storeCode"
        );


    if (storeCode) {

        storeCode.textContent =
            maStore || "—";

    }


    // =================================================
    // CHỦ SHOP
    // =================================================

    const storeOwner =
        document.getElementById(
            "storeOwner"
        );


    if (storeOwner) {

        storeOwner.textContent =
            maChuShop;

    }


    // =================================================
    // ĐÁNH GIÁ
    // =================================================

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


    // =================================================
    // TRẠNG THÁI
    // =================================================

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


    // =================================================
    // ẢNH
    // =================================================

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

                this.onerror =
                    null;

                this.src =
                    getFallbackImage();

            };

    }

}


// =========================================================
// HIỂN THỊ DANH SÁCH MÓN
// =========================================================

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


    if (!Array.isArray(danhSach)) {

        danhSach = [];

    }


    // =================================================
    // SỐ MÓN
    // =================================================

    if (foodCount) {

        foodCount.textContent =
            `${danhSach.length} món`;

    }


    // =================================================
    // KHÔNG CÓ MÓN
    // =================================================

    if (
        danhSach.length === 0
    ) {

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


    // =================================================
    // RENDER MÓN
    // =================================================

    foodGrid.innerHTML =
        danhSach
            .map(
                renderFoodCard
            )
            .join("");

}


// =========================================================
// CARD MÓN ĂN
// =========================================================

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


    // =================================================
    // ID Ô SỐ LƯỢNG
    // =================================================

    const quantityId =
        `foodQuantity_${encodeURIComponent(
            String(
                maMonAn ||
                Math.random()
            )
        )}`;


    // =================================================
    // CARD
    // =================================================

    return `

        <article
            class="food-card"
        >

            <div class="food-card-image-box">

                <img
                    class="food-card-image"
                    src="${escapeAttribute(
                        buildImageUrl(
                            anh
                        )
                    )}"
                    alt="${escapeAttribute(
                        tenMonAn
                    )}"

                    onerror="
                        this.onerror=null;
                        this.src='${escapeAttribute(
                            getFallbackImage()
                        )}'
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

                <h3
                    class="food-card-name"
                >
                    ${escapeHtml(
                        tenMonAn
                    )}
                </h3>


                <p
                    class="food-card-description"
                >
                    ${escapeHtml(
                        moTa
                    )}
                </p>


                <div
                    class="food-card-footer"
                >

                    <span
                        class="food-card-price"
                    >
                        ${formatMoney(
                            gia
                        )}
                    </span>


                    <span
                        class="food-card-rating"
                    >

                        ${
                            danhGia > 0
                                ? `★ ${danhGia.toFixed(1)}`
                                : "Chưa đánh giá"
                        }

                    </span>

                </div>


                <!-- =================================
                     CHỌN SỐ LƯỢNG + NÚT MUA
                ================================== -->

                ${
                    dangBan

                        ? `

                            <div
                                class="food-buy-area"
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:10px;
                                    width:100%;
                                    margin-top:14px;
                                "
                            >


                                <!-- =================================
                                     BỘ CHỌN SỐ LƯỢNG
                                ================================== -->

                                <div
                                    class="food-quantity-control"
                                    style="
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        height:43px;
                                        border:1px solid #ddd;
                                        border-radius:9px;
                                        overflow:hidden;
                                        background:#fff;
                                        flex-shrink:0;
                                    "
                                >


                                    <!-- GIẢM -->

                                    <button
                                        type="button"
                                        class="food-quantity-btn"
                                        aria-label="Giảm số lượng"
                                        style="
                                            width:36px;
                                            height:43px;
                                            padding:0;
                                            border:0;
                                            background:#f5f5f5;
                                            cursor:pointer;
                                            font-size:20px;
                                            font-weight:700;
                                            line-height:43px;
                                        "
                                        onclick="giamSoLuongMon(this)"
                                    >
                                        −
                                    </button>


                                    <!-- SỐ LƯỢNG -->

                                    <input
                                        type="number"
                                        id="${escapeAttribute(
                                            quantityId
                                        )}"
                                        class="food-quantity-input"
                                        min="1"
                                        max="99"
                                        step="1"
                                        value="1"
                                        inputmode="numeric"
                                        aria-label="Số lượng ${escapeAttribute(
                                            tenMonAn
                                        )}"
                                        style="
                                            width:42px;
                                            height:43px;
                                            padding:0;
                                            border:0;
                                            border-left:1px solid #eee;
                                            border-right:1px solid #eee;
                                            text-align:center;
                                            font-size:15px;
                                            font-weight:700;
                                            outline:none;
                                            box-sizing:border-box;
                                        "
                                        oninput="giuSoLuongHopLe(this)"
                                        onblur="giuSoLuongHopLe(this)"
                                    >


                                    <!-- TĂNG -->

                                    <button
                                        type="button"
                                        class="food-quantity-btn"
                                        aria-label="Tăng số lượng"
                                        style="
                                            width:36px;
                                            height:43px;
                                            padding:0;
                                            border:0;
                                            background:#f5f5f5;
                                            cursor:pointer;
                                            font-size:20px;
                                            font-weight:700;
                                            line-height:43px;
                                        "
                                        onclick="tangSoLuongMon(this)"
                                    >
                                        +
                                    </button>


                                </div>


                                <!-- =================================
                                     NÚT MUA
                                ================================== -->

                                <button
                                    type="button"
                                    class="food-buy-btn"
                                    style="
                                        flex:1;
                                        min-width:0;
                                    "
                                    onclick="themMonVaoGioHang(
                                        '${escapeJs(maMonAn)}',
                                        '${escapeJs(tenMonAn)}',
                                        this
                                    )"
                                >
                                    🛒 Mua
                                </button>


                            </div>

                        `

                        : `

                            <button
                                type="button"
                                class="food-buy-btn disabled"
                                disabled
                                style="
                                    width:100%;
                                    margin-top:14px;
                                "
                            >
                                Tạm ngừng bán
                            </button>

                        `
                }


            </div>

        </article>

    `;

}


// =========================================================
// LẤY INPUT SỐ LƯỢNG TRONG CARD
// =========================================================

function layInputSoLuong(
    button
) {

    if (!button) {

        return null;

    }


    const card =
        button.closest(
            ".food-card"
        );


    if (!card) {

        return null;

    }


    return card.querySelector(
        ".food-quantity-input"
    );

}


// =========================================================
// GIỮ SỐ LƯỢNG HỢP LỆ
// =========================================================

function giuSoLuongHopLe(
    input
) {

    if (!input) {

        return;

    }


    let value =
        Number(
            input.value
        );


    if (
        !Number.isFinite(value)
    ) {

        value = 1;

    }


    value =
        Math.floor(
            value
        );


    if (
        value < 1
    ) {

        value = 1;

    }


    if (
        value > 99
    ) {

        value = 99;

    }


    input.value =
        value;

}


// =========================================================
// TĂNG SỐ LƯỢNG
// =========================================================

function tangSoLuongMon(
    button
) {

    const input =
        layInputSoLuong(
            button
        );


    if (!input) {

        return;

    }


    let value =
        Number(
            input.value
        ) || 1;


    value =
        Math.min(
            99,
            Math.floor(
                value
            ) + 1
        );


    input.value =
        value;

}


// =========================================================
// GIẢM SỐ LƯỢNG
// =========================================================

function giamSoLuongMon(
    button
) {

    const input =
        layInputSoLuong(
            button
        );


    if (!input) {

        return;

    }


    let value =
        Number(
            input.value
        ) || 1;


    value =
        Math.max(
            1,
            Math.floor(
                value
            ) - 1
        );


    input.value =
        value;

}


// =========================================================
// THÊM MÓN VÀO GIỎ HÀNG
// POST /api/GioHang/them-mon
// =========================================================

async function themMonVaoGioHang(
    maMonAn,
    tenMonAn = "",
    buttonOrQuantity = 1
) {

    // =====================================================
    // KIỂM TRA MÃ MÓN
    // =====================================================

    if (
        maMonAn === null ||
        maMonAn === undefined ||
        String(
            maMonAn
        ).trim() === ""
    ) {

        alert(
            "Không xác định được mã món ăn."
        );

        return;

    }


    // =====================================================
    // LẤY SỐ LƯỢNG
    // =====================================================

    let soLuong =
        1;


    // ------------------------------------------
    // NẾU GỌI TỪ NÚT MUA
    // ------------------------------------------

    if (
        buttonOrQuantity &&
        typeof buttonOrQuantity === "object" &&
        typeof buttonOrQuantity.closest === "function"
    ) {

        const input =
            layInputSoLuong(
                buttonOrQuantity
            );


        soLuong =
            Number(
                input?.value
            ) || 1;

    }

    // ------------------------------------------
    // NẾU GỌI TRỰC TIẾP BẰNG SỐ
    // ------------------------------------------

    else {

        soLuong =
            Number(
                buttonOrQuantity
            ) || 1;

    }


    soLuong =
        Math.floor(
            soLuong
        );


    if (
        soLuong < 1
    ) {

        soLuong = 1;

    }


    if (
        soLuong > 99
    ) {

        soLuong = 99;

    }


    // =====================================================
    // KIỂM TRA ĐĂNG NHẬP
    // =====================================================

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
            "Bạn cần đăng nhập để thêm món vào giỏ hàng."
        );

        return;

    }


    // =====================================================
    // XÁC ĐỊNH NÚT MUA
    // =====================================================

    const buyButton =
        buttonOrQuantity &&
        typeof buttonOrQuantity === "object" &&
        typeof buttonOrQuantity.closest === "function"

            ? buttonOrQuantity

            : null;


    // =====================================================
    // CHỐNG BẤM NHIỀU LẦN
    // =====================================================

    if (buyButton) {

        if (
            buyButton.dataset.loading === "true"
        ) {

            return;

        }


        buyButton.dataset.loading =
            "true";


        buyButton.disabled =
            true;


        buyButton.dataset.oldText =
            buyButton.innerHTML;


        buyButton.innerHTML =
            "⏳ Đang thêm...";

    }


    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {

        MaMonAn:
            String(
                maMonAn
            ),

        SoLuong:
            soLuong

    };


    console.log(
        "POST /api/GioHang/them-mon:",
        payload
    );


    // =====================================================
    // GỌI API
    // =====================================================

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/GioHang/them-mon`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        // =================================================
        // ĐỌC RESPONSE
        // =================================================

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data =
            null;


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


        console.log(
            "POST /api/GioHang/them-mon ->",
            response.status,
            data
        );


        // =================================================
        // 401 - HẾT PHIÊN
        // =================================================

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            localStorage.removeItem(
                "role"
            );


            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );


            return;

        }


        // =================================================
        // 403
        // =================================================

        if (
            response.status === 403
        ) {

            alert(
                "Bạn không có quyền thêm món vào giỏ hàng."
            );


            return;

        }


        // =================================================
        // 404
        // =================================================

        if (
            response.status === 404
        ) {

            alert(
                data?.message ||
                data?.Message ||
                "Không tìm thấy món ăn."
            );


            return;

        }


        // =================================================
        // 409
        // =================================================

        if (
            response.status === 409
        ) {

            alert(
                data?.message ||
                data?.Message ||
                "Món ăn này đã có trong giỏ hàng."
            );


            return;

        }


        // =================================================
        // CÁC LỖI KHÁC
        // =================================================

        if (
            !response.ok
        ) {

            alert(
                data?.message ||
                data?.Message ||
                data ||
                `Không thể thêm món vào giỏ hàng. HTTP ${response.status}`
            );


            return;

        }


        // =================================================
        // THÀNH CÔNG
        // =================================================

        alert(
            data?.message ||
            data?.Message ||
            `Đã thêm ${soLuong} món${
                tenMonAn
                    ? ` ${tenMonAn}`
                    : ""
            } vào giỏ hàng.`
        );


        console.log(
            "Thêm món vào giỏ hàng thành công:",
            data
        );

    }

    catch (error) {

        console.error(
            "Lỗi thêm món vào giỏ hàng:",
            error
        );


        alert(
            "Không thể kết nối đến máy chủ."
        );

    }

    finally {

        if (buyButton) {

            buyButton.dataset.loading =
                "false";


            buyButton.disabled =
                false;


            buyButton.innerHTML =
                buyButton.dataset.oldText ||
                "🛒 Mua";

        }

    }

}


// =========================================================
// CHO PHÉP INLINE ONCLICK GỌI HÀM
// =========================================================

window.themMonVaoGioHang =
    themMonVaoGioHang;


window.tangSoLuongMon =
    tangSoLuongMon;


window.giamSoLuongMon =
    giamSoLuongMon;


window.giuSoLuongHopLe =
    giuSoLuongHopLe;


// =========================================================
// TÌM KIẾM MÓN
// =========================================================

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
            function (monAn) {

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
                    ten.includes(
                        keyword
                    ) ||
                    moTa.includes(
                        keyword
                    ) ||
                    ma.includes(
                        keyword
                    )
                );

            }
        );


    renderDanhSachMonAn(
        ketQua
    );

}


// =========================================================
// TRẠNG THÁI TRANG
// =========================================================

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


// =========================================================
// HIỂN THỊ LỖI
// =========================================================

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


// =========================================================
// PARSE JSON
// =========================================================

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


// =========================================================
// EXTRACT ARRAY
// =========================================================

function extractArray(
    data
) {

    if (
        Array.isArray(data)
    ) {

        return data;

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
            data?.Items
        )
    ) {

        return data.Items;

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
            data?.Data
        )
    ) {

        return data.Data;

    }


    if (
        Array.isArray(
            data?.result
        )
    ) {

        return data.result;

    }


    if (
        Array.isArray(
            data?.Result
        )
    ) {

        return data.Result;

    }


    return [];

}


// =========================================================
// GET VALUE
// =========================================================

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


// =========================================================
// TRẠNG THÁI ACTIVE
// =========================================================

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
        valueText === "danghoatdong" ||
        valueText === "đang hoạt động" ||
        valueText === "đang bán"
    );

}


// =========================================================
// FORMAT TIỀN
// =========================================================

function formatMoney(
    value
) {

    return new Intl.NumberFormat(
        "vi-VN",
        {
            style:
                "currency",

            currency:
                "VND",

            maximumFractionDigits:
                0
        }
    ).format(
        Number(value) || 0
    );

}


// =========================================================
// XỬ LÝ ẢNH
// =========================================================

function buildImageUrl(
    value
) {

    const src =
        String(
            value ?? ""
        )
        .trim();


    if (!src) {

        return getFallbackImage();

    }


    if (
        src.startsWith(
            "http://"
        ) ||
        src.startsWith(
            "https://"
        ) ||
        src.startsWith(
            "data:"
        )
    ) {

        return src;

    }


    return src;

}


// =========================================================
// ẢNH FALLBACK
// =========================================================

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


// =========================================================
// ESCAPE HTML
// =========================================================

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


// =========================================================
// ESCAPE ATTRIBUTE
// =========================================================

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


// =========================================================
// ESCAPE JAVASCRIPT
// =========================================================

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