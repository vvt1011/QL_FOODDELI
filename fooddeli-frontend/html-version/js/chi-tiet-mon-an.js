// =========================================================
// FOODDELI - CHI TIET MON AN
// KET NOI API
// =========================================================

(function () {

    "use strict";


    // =====================================================
    // API
    // =====================================================

    const API_BASE_URL =
        "https://localhost:7135/api";


    // =====================================================
    // BIẾN DỮ LIỆU
    // =====================================================

    let maMonAn = "";

    let monAn = null;


    // =====================================================
    // KHỞI TẠO
    // =====================================================

    function initChiTietMonAn() {

        // -----------------------------------------------
        // LẤY MÃ MÓN TỪ URL
        // -----------------------------------------------

        const params =
            new URLSearchParams(
                window.location.search
            );


        maMonAn =
            params.get("maMonAn") ||
            params.get("MaMonAn") ||
            "";


        // -----------------------------------------------
        // KIỂM TRA MÃ MÓN
        // -----------------------------------------------

        if (!maMonAn) {

            showError(
                "Không tìm thấy mã món ăn."
            );

            return;
        }


        // -----------------------------------------------
        // NÚT THỬ LẠI
        // -----------------------------------------------

        const retryBtn =
            document.getElementById(
                "retryBtn"
            );


        if (retryBtn) {

            retryBtn.onclick =
                function () {

                    loadChiTietMonAn();

                };

        }


        // -----------------------------------------------
        // NÚT QUAY LẠI
        // -----------------------------------------------

        const backBtn =
            document.getElementById(
                "backBtn"
            );


        if (backBtn) {

            backBtn.onclick =
                function () {

                    quayLaiCuaHang();

                };

        }


        // -----------------------------------------------
        // NÚT THÊM GIỎ HÀNG
        // -----------------------------------------------

        const addCartBtn =
            document.getElementById(
                "addToCartBtn"
            );


        if (addCartBtn) {

            addCartBtn.onclick =
                function () {

                    themVaoGioHang();

                };

        }


        // -----------------------------------------------
        // LOAD DỮ LIỆU
        // -----------------------------------------------

        loadChiTietMonAn();

    }


    // =====================================================
    // LOAD CHI TIẾT MÓN
    // GET /api/MonAn/{id}
    // =====================================================

    async function loadChiTietMonAn() {

        setPageState(
            "loading"
        );


        try {

            console.log(
                "Đang tải món ăn:",
                maMonAn
            );


            const response =
                await fetch(
                    `${API_BASE_URL}/MonAn/${encodeURIComponent(maMonAn)}`,
                    {
                        method: "GET",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const data =
                await parseResponse(
                    response
                );


            console.log(
                "GET /api/MonAn/{id}:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    data?.Message ||
                    `Không thể tải món ăn. HTTP ${response.status}`
                );

            }


            // -------------------------------------------
            // TRƯỜNG HỢP API BỌC DATA
            // -------------------------------------------

            monAn =
                data?.data ||
                data?.Data ||
                data;


            if (
                !monAn ||
                typeof monAn !== "object"
            ) {

                throw new Error(
                    "Dữ liệu món ăn không hợp lệ."
                );

            }


            // -------------------------------------------
            // HIỂN THỊ
            // -------------------------------------------

            renderChiTietMonAn(
                monAn
            );


            // -------------------------------------------
            // HIỆN NỘI DUNG
            // -------------------------------------------

            setPageState(
                "content"
            );

        }
        catch (error) {

            console.error(
                "Lỗi tải chi tiết món ăn:",
                error
            );


            showError(
                error.message ||
                "Không thể tải thông tin món ăn."
            );

        }

    }


    // =====================================================
    // HIỂN THỊ CHI TIẾT
    // =====================================================

    function renderChiTietMonAn(
        data
    ) {

        const ma =
            getValue(
                data,
                [
                    "MaMonAn",
                    "maMonAn"
                ]
            );


        const ten =
            getValue(
                data,
                [
                    "TenMonAn",
                    "tenMonAn"
                ]
            ) ||
            "Món ăn";


        const moTa =
            getValue(
                data,
                [
                    "MoTa",
                    "moTa"
                ]
            ) ||
            "Chưa có mô tả.";


        const gia =
            parseFloat(
                getValue(
                    data,
                    [
                        "Gia",
                        "gia"
                    ]
                )
            ) || 0;


        const anh =
            getValue(
                data,
                [
                    "AnhMonAn",
                    "anhMonAn",
                    "HinhAnh",
                    "hinhAnh",
                    "Anh",
                    "anh"
                ]
            );


        const danhGia =
            parseFloat(
                getValue(
                    data,
                    [
                        "DanhGia",
                        "danhGia",
                        "Rating",
                        "rating"
                    ]
                )
            ) || 0;


        const trangThai =
            getValue(
                data,
                [
                    "TrangThai",
                    "trangThai"
                ]
            );


        const maCuaHang =
            getValue(
                data,
                [
                    "MaCuaHang",
                    "maCuaHang"
                ]
            );


        const tenCuaHang =
            getValue(
                data,
                [
                    "TenCuaHang",
                    "tenCuaHang"
                ]
            );


        const danhMuc =
            getValue(
                data,
                [
                    "TenDanhMuc",
                    "tenDanhMuc",
                    "DanhMuc",
                    "danhMuc"
                ]
            );


        // =================================================
        // TITLE
        // =================================================

        document.title =
            `${ten} - FoodDeli`;


        // =================================================
        // TÊN MÓN
        // HỖ TRỢ NHIỀU ID KHÁC NHAU
        // =================================================

        setText(
            [
                "foodName",
                "monAnName",
                "detailFoodName",
                "foodTitle",
                "monAnTitle"
            ],
            ten
        );


        // =================================================
        // MÃ MÓN
        // =================================================

        setText(
            [
                "foodCode",
                "monAnCode",
                "detailFoodCode"
            ],
            ma || "—"
        );


        // =================================================
        // MÔ TẢ
        // =================================================

        setText(
            [
                "foodDescription",
                "monAnDescription",
                "detailFoodDescription"
            ],
            moTa
        );


        // =================================================
        // GIÁ
        // =================================================

        setText(
            [
                "foodPrice",
                "monAnPrice",
                "detailFoodPrice",
                "price"
            ],
            formatMoney(gia)
        );


        // =================================================
        // DANH MỤC
        // =================================================

        setText(
            [
                "foodCategory",
                "monAnCategory",
                "detailFoodCategory",
                "categoryName"
            ],
            danhMuc || "Chưa phân loại"
        );


        // =================================================
        // CỬA HÀNG
        // =================================================

        setText(
            [
                "foodStore",
                "monAnStore",
                "detailFoodStore",
                "storeName"
            ],
            tenCuaHang || maCuaHang || "FoodDeli"
        );


        // =================================================
        // TRẠNG THÁI
        // =================================================

        hienThiTrangThai(
            trangThai
        );


        // =================================================
        // ĐÁNH GIÁ
        // =================================================

        hienThiDanhGia(
            danhGia
        );


        // =================================================
        // ẢNH
        // =================================================

        hienThiAnh(
            anh,
            ten
        );


        // =================================================
        // LƯU MÃ CỬA HÀNG ĐỂ QUAY LẠI
        // =================================================

        if (maCuaHang) {

            sessionStorage.setItem(
                "foodDeliCurrentStore",
                maCuaHang
            );

        }


        // =================================================
        // LƯU MÃ MÓN
        // =================================================

        sessionStorage.setItem(
            "foodDeliCurrentFood",
            ma || maMonAn
        );


        // =================================================
        // DATA ATTRIBUTE CHO NÚT
        // =================================================

        const addCartBtn =
            document.getElementById(
                "addToCartBtn"
            );


        if (addCartBtn) {

            addCartBtn.dataset.maMonAn =
                ma || maMonAn;

        }


        // =================================================
        // BREADCRUMB
        // =================================================

        const breadcrumb =
            document.getElementById(
                "breadcrumbFood"
            );


        if (breadcrumb) {

            breadcrumb.textContent =
                ten;

        }


        // =================================================
        // CÁC ID BREADCRUMB KHÁC NẾU CÓ
        // =================================================

        setText(
            [
                "breadcrumbMonAn",
                "breadcrumbFoodName"
            ],
            ten
        );

    }


    // =====================================================
    // HIỂN THỊ ẢNH
    // =====================================================

    function hienThiAnh(
        imageValue,
        tenMon
    ) {

        const imageIds = [

            "foodImage",
            "monAnImage",
            "detailFoodImage",
            "foodDetailImage",
            "mainFoodImage"

        ];


        let image = null;


        for (
            const id of imageIds
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                image =
                    element;

                break;

            }

        }


        if (!image) {

            return;

        }


        image.alt =
            tenMon ||
            "Ảnh món ăn";


        image.src =
            buildImageUrl(
                imageValue
            );


        image.onerror =
            function () {

                this.onerror = null;

                this.src =
                    getFallbackImage();

            };

    }


    // =====================================================
    // HIỂN THỊ TRẠNG THÁI
    // =====================================================

    function hienThiTrangThai(
        trangThai
    ) {

        const elementIds = [

            "foodStatus",
            "monAnStatus",
            "detailFoodStatus",
            "statusFood"

        ];


        let element = null;


        for (
            const id of elementIds
        ) {

            const item =
                document.getElementById(
                    id
                );


            if (item) {

                element =
                    item;

                break;

            }

        }


        if (!element) {

            return;

        }


        const active =
            isActiveStatus(
                trangThai
            );


        element.textContent =
            active
                ? "Đang bán"
                : "Tạm ngừng";


        element.classList.remove(
            "active",
            "inactive"
        );


        element.classList.add(
            active
                ? "active"
                : "inactive"
        );

    }


    // =====================================================
    // HIỂN THỊ ĐÁNH GIÁ
    // =====================================================

    function hienThiDanhGia(
        danhGia
    ) {

        const ratingIds = [

            "foodRating",
            "monAnRating",
            "detailFoodRating",
            "foodDetailRating"

        ];


        let element = null;


        for (
            const id of ratingIds
        ) {

            const item =
                document.getElementById(
                    id
                );


            if (item) {

                element =
                    item;

                break;

            }

        }


        if (!element) {

            return;

        }


        if (
            !Number.isFinite(
                danhGia
            ) ||
            danhGia <= 0
        ) {

            element.textContent =
                "★ Chưa có đánh giá";

            return;

        }


        element.textContent =
            `★ ${danhGia.toFixed(1)} / 5`;

    }


    // =====================================================
    // QUAY LẠI CỬA HÀNG
    // =====================================================

    function quayLaiCuaHang() {

        let maCuaHang =
            "";


        // -----------------------------------------------
        // ƯU TIÊN MÃ CỬA HÀNG TỪ MÓN HIỆN TẠI
        // -----------------------------------------------

        if (monAn) {

            maCuaHang =
                getValue(
                    monAn,
                    [
                        "MaCuaHang",
                        "maCuaHang"
                    ]
                );

        }


        // -----------------------------------------------
        // FALLBACK SESSION
        // -----------------------------------------------

        if (!maCuaHang) {

            maCuaHang =
                sessionStorage.getItem(
                    "foodDeliCurrentStore"
                ) || "";

        }


        // -----------------------------------------------
        // NẾU CÓ MÃ CỬA HÀNG
        // -----------------------------------------------

        if (maCuaHang) {

            window.location.href =
                `chitietcuahang.html?maCuaHang=${encodeURIComponent(
                    maCuaHang
                )}`;

            return;

        }


        // -----------------------------------------------
        // KHÔNG CÓ MÃ CỬA HÀNG
        // QUAY VỀ DANH SÁCH
        // -----------------------------------------------

        window.location.href =
            "cua-hang.html";

    }


    // =====================================================
    // THÊM VÀO GIỎ HÀNG
    // =====================================================

    function themVaoGioHang() {

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


        // -------------------------------------------------
        // CHƯA tự gọi API POST vì backend cần đúng route
        // và payload thêm giỏ hàng của project.
        // -------------------------------------------------

        alert(
            "Món ăn đã được chọn. Bạn có thể kết nối nút này với API Giỏ hàng."
        );

    }


    // =====================================================
    // PAGE STATE
    // =====================================================

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
                "foodContent"
            );


        // -------------------------------------------------
        // Nếu HTML của bạn dùng foodDetailContent
        // -------------------------------------------------

        const contentAlternative =
            document.getElementById(
                "foodDetailContent"
            );


        // -------------------------------------------------
        // LOADING
        // -------------------------------------------------

        if (loading) {

            loading.hidden =
                state !== "loading";

        }


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        if (error) {

            error.hidden =
                state !== "error";

        }


        // -------------------------------------------------
        // CONTENT
        // -------------------------------------------------

        if (content) {

            content.hidden =
                state !== "content";

        }


        if (contentAlternative) {

            contentAlternative.hidden =
                state !== "content";

        }

    }


    // =====================================================
    // HIỂN THỊ LỖI
    // =====================================================

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
                "Không thể tải dữ liệu.";

        }


        setPageState(
            "error"
        );

    }


    // =====================================================
    // PARSE RESPONSE
    // =====================================================

    async function parseResponse(
        response
    ) {

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (
            contentType
                .toLowerCase()
                .includes(
                    "application/json"
                )
        ) {

            return await response
                .json()
                .catch(
                    () => null
                );

        }


        const text =
            await response
                .text()
                .catch(
                    () => ""
                );


        return {
            message:
                text ||
                "Máy chủ không trả về dữ liệu."
        };

    }


    // =====================================================
    // GET VALUE
    // =====================================================

    function getValue(
        object,
        keys
    ) {

        if (
            !object ||
            typeof object !== "object"
        ) {

            return "";

        }


        if (
            !Array.isArray(keys)
        ) {

            keys = [
                keys
            ];

        }


        for (
            const key of keys
        ) {

            if (
                object[key] !==
                    undefined &&
                object[key] !==
                    null
            ) {

                return String(
                    object[key]
                );

            }

        }


        return "";

    }


    // =====================================================
    // SET TEXT
    // =====================================================

    function setText(
        ids,
        value
    ) {

        for (
            const id of ids
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value ?? "";

            }

        }

    }


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    function formatMoney(
        value
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "0đ";

        }


        return number.toLocaleString(
            "vi-VN"
        ) + "đ";

    }


    // =====================================================
    // TRẠNG THÁI ACTIVE
    // =====================================================

    function isActiveStatus(
        value
    ) {

        if (
            value ===
                1 ||
            value ===
                "1"
        ) {

            return true;

        }


        const text =
            String(
                value ?? ""
            )
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );


        return (
            text === "hoat dong" ||
            text === "hoatdong" ||
            text === "dang ban" ||
            text === "dangban" ||
            text === "active" ||
            text === "true"
        );

    }


    // =====================================================
    // ẢNH
    // =====================================================

    function buildImageUrl(
        imageValue
    ) {

        if (
            !imageValue
        ) {

            return getFallbackImage();

        }


        const value =
            String(
                imageValue
            ).trim();


        if (!value) {

            return getFallbackImage();

        }


        // URL đầy đủ
        if (
            /^https?:\/\//i.test(
                value
            )
        ) {

            return value;

        }


        // Data URL
        if (
            value.startsWith(
                "data:"
            )
        ) {

            return value;

        }


        // Đường dẫn bắt đầu bằng /
        if (
            value.startsWith(
                "/"
            )
        ) {

            return (
                window.location.origin +
                value
            );

        }


        // Các đường dẫn tương đối
        return value;

    }


    // =====================================================
    // ẢNH FALLBACK
    // =====================================================

    function getFallbackImage() {

        const svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="800"
                height="500"
                viewBox="0 0 800 500"
            >

                <rect
                    width="800"
                    height="500"
                    fill="#f3f4f6"
                />

                <text
                    x="400"
                    y="240"
                    text-anchor="middle"
                    font-family="Arial"
                    font-size="36"
                    font-weight="700"
                    fill="#9ca3af"
                >
                    FoodDeli
                </text>

                <text
                    x="400"
                    y="285"
                    text-anchor="middle"
                    font-family="Arial"
                    font-size="20"
                    fill="#9ca3af"
                >
                    Chưa có hình ảnh
                </text>

            </svg>
        `;


        return (
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
                svg
            )
        );

    }


    // =====================================================
    // CHỐNG GỌI INIT TRÙNG
    // =====================================================

    let initialized =
        false;


    function start() {

        if (initialized) {

            return;

        }


        initialized =
            true;


        initChiTietMonAn();

    }


    // =====================================================
    // DOM READY
    // =====================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );

    } else {

        start();

    }


    // =====================================================
    // PUBLIC
    // Cho phép main.js gọi lại nếu cần
    // =====================================================

    window.initChiTietMonAn =
        function () {

            initialized =
                false;

            start();

        };


    window.loadChiTietMonAn =
        loadChiTietMonAn;


})();