document.addEventListener("DOMContentLoaded", function () {

    const API_URL = "https://localhost:7135/api/CuaHang";

    const tableBody = document.getElementById("shopTableBody");
    const recordCount = document.getElementById("recordCount");

    const searchInput = document.getElementById("searchShop");
    const statusSelect = document.getElementById("shopStatus");

    const shopForm = document.getElementById("shopForm");

    const btnThemCuaHang =
        document.getElementById("btnThemCuaHang");

    const btnHuyCuaHang =
        document.getElementById("btnHuyCuaHang");

    const btnLuuCuaHang =
        document.getElementById("btnLuuCuaHang");


    // =====================================================
    // BIẾN
    // =====================================================

    let allShops = [];
    let filteredShops = [];

    let currentPage = 1;

    const pageSize = 10;

    let editingShopId = null;


    // =====================================================
    // LẤY TOKEN
    // =====================================================

    function getToken() {

        return localStorage.getItem("token");

    }


    // =====================================================
    // LOAD DANH SÁCH CỬA HÀNG
    // =====================================================

    async function loadShops() {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    Đang tải dữ liệu...
                </td>
            </tr>
        `;

        try {

            const response =
                await fetch(API_URL);

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            allShops =
                await response.json();

            filteredShops =
                [...allShops];

            currentPage = 1;

            renderShops();

        }
        catch (error) {

            console.error(
                "Lỗi tải cửa hàng:",
                error
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-cell">
                        Không thể tải dữ liệu cửa hàng.
                    </td>
                </tr>
            `;

            recordCount.textContent = "Lỗi";

        }

    }


    // =====================================================
    // TÌM KIẾM + LỌC
    // =====================================================

    function filterShops() {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();

        const status =
            statusSelect.value;


        filteredShops =
            allShops.filter(function (shop) {

                const shopName =
                    String(
                        shop.tenCuaHang ?? ""
                    ).toLowerCase();


                // Tìm theo tên cửa hàng

                const matchName =
                    shopName.includes(keyword);


                // Lọc trạng thái

                let matchStatus = true;


                if (status !== "") {

                    matchStatus =
                        String(
                            shop.trangThai
                        ) === status;

                }


                return (
                    matchName &&
                    matchStatus
                );

            });


        currentPage = 1;

        renderShops();

    }


    // =====================================================
    // HIỂN THỊ DANH SÁCH
    // =====================================================

    function renderShops() {

        if (
            !Array.isArray(filteredShops) ||
            filteredShops.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-cell">
                        Không tìm thấy cửa hàng phù hợp.
                    </td>
                </tr>
            `;

            recordCount.textContent =
                "0 cửa hàng";

            renderPagination();

            return;

        }


        // Vị trí bắt đầu

        const startIndex =
            (currentPage - 1) *
            pageSize;


        // Vị trí kết thúc

        const endIndex =
            startIndex +
            pageSize;


        const shopsToShow =
            filteredShops.slice(
                startIndex,
                endIndex
            );


        tableBody.innerHTML = "";


        shopsToShow.forEach(function (shop) {

            const row =
                document.createElement("tr");


            const active =
                shop.trangThai == 1;


            row.innerHTML = `

                <td>
                    ${shop.maCuaHang ?? ""}
                </td>


                <td>

                    <strong>
                        ${shop.tenCuaHang ?? ""}
                    </strong>

                </td>


                <td>
                    ${shop.maChuShop ?? "—"}
                </td>


                <td>
                    ${shop.soDienThoai ?? "—"}
                </td>


                <td>
                    ${shop.diaChi ?? "—"}
                </td>


                <td>

                    <span class="status-badge ${
                        active
                            ? "status-active"
                            : "status-inactive"
                    }">

                        ${
                            active
                                ? "Hoạt động"
                                : "Ngừng hoạt động"
                        }

                    </span>

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            type="button"
                            class="action-btn edit"
                            data-id="${shop.maCuaHang}"
                        >
                            Sửa
                        </button>


                        <button
                            type="button"
                            class="action-btn delete"
                            data-id="${shop.maCuaHang}"
                        >
                            Xóa
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        });


        recordCount.textContent =
            `${filteredShops.length} cửa hàng`;


        renderPagination();

    }


    // =====================================================
    // PHÂN TRANG
    // =====================================================

    function renderPagination() {

        const oldPagination =
            document.getElementById(
                "shopPagination"
            );


        if (oldPagination) {

            oldPagination.remove();

        }


        const totalPages =
            Math.ceil(
                filteredShops.length /
                pageSize
            );


        if (totalPages <= 1) {

            return;

        }


        const pagination =
            document.createElement("div");


        pagination.id =
            "shopPagination";


        pagination.className =
            "shop-pagination";


        // NÚT TRANG TRƯỚC

        const prevButton =
            document.createElement("button");


        prevButton.type = "button";


        prevButton.className =
            "pagination-btn";


        prevButton.textContent =
            "‹";


        prevButton.disabled =
            currentPage === 1;


        prevButton.addEventListener(
            "click",
            function () {

                if (currentPage > 1) {

                    currentPage--;

                    renderShops();

                }

            }
        );


        pagination.appendChild(
            prevButton
        );


        // CÁC TRANG

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const pageButton =
                document.createElement("button");


            pageButton.type =
                "button";


            pageButton.className =
                "pagination-btn";


            if (
                page === currentPage
            ) {

                pageButton.classList.add(
                    "active"
                );

            }


            pageButton.textContent =
                page;


            pageButton.addEventListener(
                "click",
                function () {

                    currentPage =
                        page;

                    renderShops();

                }
            );


            pagination.appendChild(
                pageButton
            );

        }


        // NÚT TRANG SAU

        const nextButton =
            document.createElement("button");


        nextButton.type =
            "button";


        nextButton.className =
            "pagination-btn";


        nextButton.textContent =
            "›";


        nextButton.disabled =
            currentPage === totalPages;


        nextButton.addEventListener(
            "click",
            function () {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderShops();

                }

            }
        );


        pagination.appendChild(
            nextButton
        );


        const tableWrapper =
            document.querySelector(
                ".admin-table-wrapper"
            );


        if (tableWrapper) {

            tableWrapper.after(
                pagination
            );

        }

    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function resetShopForm() {

        editingShopId = null;


        if (shopForm) {

            shopForm.reset();

        }


        const trangThai =
            document.getElementById(
                "trangThai"
            );


        if (trangThai) {

            trangThai.value = "1";

        }


        if (btnLuuCuaHang) {

            btnLuuCuaHang.textContent =
                "Lưu cửa hàng";

        }

    }


    // =====================================================
    // NÚT THÊM CỬA HÀNG
    // =====================================================

    if (btnThemCuaHang) {

        btnThemCuaHang.addEventListener(
            "click",
            function () {

                resetShopForm();


                if (shopForm) {

                    shopForm.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    // =====================================================
    // SỬA CỬA HÀNG
    // =====================================================

    async function editShop(shopId) {

        const token =
            getToken();


        if (!token) {

            alert(
                "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/${encodeURIComponent(shopId)}`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {

                let message =
                    `Không thể lấy cửa hàng. HTTP ${response.status}`;


                try {

                    const errorData =
                        await response.json();


                    message =
                        errorData.message ||
                        message;

                }
                catch (e) {}


                throw new Error(
                    message
                );

            }


            const shop =
                await response.json();


            console.log(
                "Cửa hàng đang sửa:",
                shop
            );


            editingShopId =
                shop.maCuaHang;


            // Điền dữ liệu vào form

            document.getElementById(
                "maCuaHang"
            ).value =
                shop.maCuaHang ?? "";


            document.getElementById(
                "maChuShop"
            ).value =
                shop.maChuShop ?? "";


            document.getElementById(
                "tenCuaHang"
            ).value =
                shop.tenCuaHang ?? "";


            document.getElementById(
                "soDienThoai"
            ).value =
                shop.soDienThoai ?? "";


            document.getElementById(
                "diaChi"
            ).value =
                shop.diaChi ?? "";


            document.getElementById(
                "moTa"
            ).value =
                shop.moTa ?? "";


            document.getElementById(
                "anhCuaHang"
            ).value =
                shop.anhCuaHang ?? "";


            document.getElementById(
                "trangThai"
            ).value =
                String(
                    shop.trangThai ?? 1
                );


            // Đổi tên nút

            if (btnLuuCuaHang) {

                btnLuuCuaHang.textContent =
                    "Cập nhật cửa hàng";

            }


            // Cuộn tới form

            if (shopForm) {

                shopForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
        catch (error) {

            console.error(
                "Lỗi lấy thông tin cửa hàng:",
                error
            );


            alert(
                error.message ||
                "Không thể lấy thông tin cửa hàng."
            );

        }

    }


    // =====================================================
    // XÓA CỬA HÀNG
    // =====================================================

    async function deleteShop(shopId) {

        const token =
            getToken();


        if (!token) {

            alert(
                "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
            );

            return;

        }


        // Xác nhận trước khi xóa

        const confirmed =
            confirm(
                `Bạn có chắc chắn muốn xóa cửa hàng "${shopId}" không?`
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/${encodeURIComponent(shopId)}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            let data = {};


            try {

                data =
                    await response.json();

            }
            catch (e) {}


            if (!response.ok) {

                console.error(
                    "API xóa lỗi:",
                    data
                );


                alert(
                    data.message ||
                    `Không thể xóa cửa hàng. HTTP ${response.status}`
                );


                return;

            }


            alert(
                data.message ||
                "Xóa cửa hàng thành công."
            );


            // Tải lại danh sách

            await loadShops();

        }
        catch (error) {

            console.error(
                "Lỗi xóa cửa hàng:",
                error
            );


            alert(
                "Không thể kết nối đến máy chủ."
            );

        }

    }


    // =====================================================
    // SUBMIT FORM
    // THÊM = POST
    // SỬA = PUT
    // =====================================================

    if (shopForm) {

        shopForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const maCuaHang =
                    document.getElementById(
                        "maCuaHang"
                    ).value.trim();


                const maChuShop =
                    document.getElementById(
                        "maChuShop"
                    ).value.trim();


                const tenCuaHang =
                    document.getElementById(
                        "tenCuaHang"
                    ).value.trim();


                const soDienThoai =
                    document.getElementById(
                        "soDienThoai"
                    ).value.trim();


                const diaChi =
                    document.getElementById(
                        "diaChi"
                    ).value.trim();


                const moTa =
                    document.getElementById(
                        "moTa"
                    ).value.trim();


                const anhCuaHang =
                    document.getElementById(
                        "anhCuaHang"
                    ).value.trim();


                const trangThai =
                    document.getElementById(
                        "trangThai"
                    ).value;


                // Kiểm tra dữ liệu

                if (!tenCuaHang) {

                    alert(
                        "Vui lòng nhập tên cửa hàng."
                    );

                    return;

                }


                if (!maChuShop) {

                    alert(
                        "Vui lòng nhập mã chủ shop."
                    );

                    return;

                }


                const cuaHang = {

                    maCuaHang:
                        maCuaHang || null,

                    maChuShop:
                        maChuShop,

                    tenCuaHang:
                        tenCuaHang,

                    soDienThoai:
                        soDienThoai || null,

                    diaChi:
                        diaChi || null,

                    moTa:
                        moTa || null,

                    anhCuaHang:
                        anhCuaHang || null,

                    trangThai:
                        Number(trangThai)

                };


                const token =
                    getToken();


                if (!token) {

                    alert(
                        "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết."
                    );

                    return;

                }


                try {

                    let url =
                        API_URL;


                    let method =
                        "POST";


                    // Nếu đang sửa

                    if (editingShopId) {

                        url =
                            `${API_URL}/${encodeURIComponent(editingShopId)}`;

                        method =
                            "PUT";


                        cuaHang.maCuaHang =
                            editingShopId;

                    }


                    console.log(
                        `${method} ${url}`,
                        cuaHang
                    );


                    const response =
                        await fetch(
                            url,
                            {
                                method: method,

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`

                                },

                                body:
                                    JSON.stringify(
                                        cuaHang
                                    )

                            }
                        );


                    let data = {};


                    try {

                        data =
                            await response.json();

                    }
                    catch (e) {}


                    if (!response.ok) {

                        console.error(
                            "API lỗi:",
                            data
                        );


                        alert(
                            data.message ||
                            `Không thể ${
                                method === "PUT"
                                    ? "cập nhật"
                                    : "thêm"
                            } cửa hàng. HTTP ${response.status}`
                        );


                        return;

                    }


                    alert(
                        data.message ||
                        (
                            method === "PUT"
                                ? "Cập nhật cửa hàng thành công."
                                : "Thêm cửa hàng thành công."
                        )
                    );


                    // Reset form

                    resetShopForm();


                    // Load lại danh sách

                    await loadShops();

                }
                catch (error) {

                    console.error(
                        "Lỗi kết nối:",
                        error
                    );


                    alert(
                        "Không thể kết nối đến máy chủ."
                    );

                }

            }
        );

    }


    // =====================================================
    // NÚT HỦY
    // =====================================================

    if (btnHuyCuaHang) {

        btnHuyCuaHang.addEventListener(
            "click",
            function () {

                resetShopForm();

            }
        );

    }


    // =====================================================
    // XỬ LÝ NÚT SỬA / XÓA
    // =====================================================

    tableBody.addEventListener(
        "click",
        function (event) {


            // -----------------------------
            // NÚT SỬA
            // -----------------------------

            const editButton =
                event.target.closest(
                    ".action-btn.edit"
                );


            if (editButton) {

                const shopId =
                    editButton.dataset.id;


                if (shopId) {

                    editShop(shopId);

                }


                return;

            }


            // -----------------------------
            // NÚT XÓA
            // -----------------------------

            const deleteButton =
                event.target.closest(
                    ".action-btn.delete"
                );


            if (deleteButton) {

                const shopId =
                    deleteButton.dataset.id;


                if (shopId) {

                    deleteShop(shopId);

                }


                return;

            }

        }
    );


    // =====================================================
    // TÌM KIẾM
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterShops
        );

    }


    // =====================================================
    // LỌC TRẠNG THÁI
    // =====================================================

    if (statusSelect) {

        statusSelect.addEventListener(
            "change",
            filterShops
        );

    }


    // =====================================================
    // TẢI DỮ LIỆU BAN ĐẦU
    // =====================================================

    loadShops();

});