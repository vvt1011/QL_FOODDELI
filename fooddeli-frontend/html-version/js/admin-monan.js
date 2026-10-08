const API_BASE = "https://localhost:7135/api";

// ======================================================
// STATE
// ======================================================

let allMonAn = [];
let filteredMonAn = [];

let allCuaHang = [];
let allDanhMuc = [];

let currentPage = 1;
const pageSize = 10;

let editingMonAnId = null;


// ======================================================
// TOKEN
// ======================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken") ||
        ""
    );
}


// ======================================================
// API REQUEST
// ======================================================

async function apiRequest(url, options = {}) {

    const token = getToken();

    const headers = {
        "Accept": "application/json",
        ...(options.headers || {})
    };

    // Có body JSON thì thêm Content-Type
    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    const text = await response.text();

    let data = null;

    if (text) {

        try {
            data = JSON.parse(text);
        }
        catch {
            data = text;
        }
    }


    if (!response.ok) {

        let message =
            `HTTP ${response.status}`;

        if (data?.message) {
            message = data.message;
        }
        else if (data?.Message) {
            message = data.Message;
        }
        else if (typeof data === "string" && data.trim()) {
            message = data;
        }

        throw new Error(message);
    }


    return data;
}


// ======================================================
// ESCAPE HTML
// ======================================================

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


// ======================================================
// ESCAPE JS
// ======================================================

function escapeJs(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}


// ======================================================
// FORMAT GIÁ
// ======================================================

function formatPrice(value) {

    const number = Number(value || 0);

    return number.toLocaleString("vi-VN") + " ₫";
}


// ======================================================
// LẤY GIÁ TRỊ OBJECT
// ======================================================

function getValue(object, ...names) {

    if (!object) {
        return "";
    }

    for (const name of names) {

        if (
            object[name] !== undefined &&
            object[name] !== null
        ) {
            return object[name];
        }
    }

    return "";
}


// ======================================================
// LẤY THUỘC TÍNH MÓN ĂN
// ======================================================

function getId(monAn) {

    return getValue(
        monAn,
        "maMonAn",
        "MaMonAn"
    );
}


function getTen(monAn) {

    return getValue(
        monAn,
        "tenMonAn",
        "TenMonAn"
    );
}


function getGia(monAn) {

    return getValue(
        monAn,
        "gia",
        "Gia"
    );
}


function getMaCuaHang(monAn) {

    return getValue(
        monAn,
        "maCuaHang",
        "MaCuaHang"
    );
}


function getMaDanhMuc(monAn) {

    return getValue(
        monAn,
        "maDanhMuc",
        "MaDanhMuc"
    );
}


function getDanhGia(monAn) {

    return getValue(
        monAn,
        "danhGia",
        "DanhGia"
    );
}


function getTrangThai(monAn) {

    return getValue(
        monAn,
        "trangThai",
        "TrangThai"
    );
}


function getAnh(monAn) {

    return getValue(
        monAn,
        "anhMonAn",
        "AnhMonAn"
    );
}


function getMoTa(monAn) {

    return getValue(
        monAn,
        "moTa",
        "MoTa"
    );
}


// ======================================================
// LẤY MẢNG DỮ LIỆU
// ======================================================

function getArray(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.Data)) {
        return data.Data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.Items)) {
        return data.Items;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    if (Array.isArray(data?.Results)) {
        return data.Results;
    }

    return [];
}


// ======================================================
// LOAD MÓN ĂN
// ======================================================

async function loadMonAn() {

    const tbody =
        document.getElementById(
            "monAnTableBody"
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td colspan="10" class="loading-row">
                Đang tải dữ liệu...
            </td>
        </tr>
    `;


    try {

        const data =
            await apiRequest(
                `${API_BASE}/MonAn`
            );


        console.log(
            "GET /api/MonAn:",
            data
        );


        allMonAn =
            getArray(data);


        filteredMonAn =
            [...allMonAn];


        currentPage = 1;


        renderMonAn();


        // Sau khi có món ăn,
        // đảm bảo các select có giá trị hiện tại.
        ensureCurrentSelectValues();

    }
    catch (error) {

        console.error(
            "Lỗi tải món ăn:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="10"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#c0392b;
                    ">
                    Không thể tải danh sách món ăn.
                    <br>
                    <small>
                        ${escapeHtml(error.message)}
                    </small>
                </td>
            </tr>
        `;


        const recordCount =
            document.getElementById(
                "recordCount"
            );

        if (recordCount) {
            recordCount.textContent =
                "0 món ăn";
        }
    }
}


// ======================================================
// RENDER BẢNG
// ======================================================

function renderMonAn() {

    const tbody =
        document.getElementById(
            "monAnTableBody"
        );

    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (!tbody) {
        return;
    }


    const total =
        filteredMonAn.length;


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
        currentPage = totalPages;
    }


    const start =
        (currentPage - 1) *
        pageSize;


    const end =
        start + pageSize;


    const pageData =
        filteredMonAn.slice(
            start,
            end
        );


    if (recordCount) {

        recordCount.textContent =
            `${total} món ăn`;
    }


    // ==================================================
    // KHÔNG CÓ DỮ LIỆU
    // ==================================================

    if (pageData.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    Không có món ăn.
                </td>
            </tr>
        `;


        renderPagination(
            totalPages
        );

        return;
    }


    // ==================================================
    // RENDER
    // ==================================================

    tbody.innerHTML =
        pageData.map(
            (monAn, index) => {

                const id =
                    getId(monAn);

                const ten =
                    getTen(monAn);

                const gia =
                    getGia(monAn);

                const maCuaHang =
                    getMaCuaHang(monAn);

                const maDanhMuc =
                    getMaDanhMuc(monAn);

                const danhGia =
                    getDanhGia(monAn);

                const trangThai =
                    getTrangThai(monAn);

                const anh =
                    getAnh(monAn);


                const stt =
                    start + index + 1;


                // --------------------------------------
                // ẢNH
                // --------------------------------------

                let imageHtml = `
                    <div class="mon-an-no-image">
                        🍽️
                    </div>
                `;


                if (
                    anh &&
                    String(anh).trim()
                ) {

                    imageHtml = `
                        <img
                            src="${escapeHtml(anh)}"
                            alt="${escapeHtml(ten)}"
                            class="mon-an-image"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='flex';
                            "
                        >

                        <div
                            class="mon-an-no-image"
                            style="display:none;"
                        >
                            🍽️
                        </div>
                    `;
                }


                // --------------------------------------
                // TRẠNG THÁI
                // --------------------------------------

                const statusNumber =
                    Number(trangThai);


                let statusHtml;


                if (statusNumber === 1) {

                    statusHtml = `
                        <span class="mon-an-status active">
                            Đang bán
                        </span>
                    `;

                }
                else {

                    statusHtml = `
                        <span class="mon-an-status inactive">
                            Ngừng bán
                        </span>
                    `;
                }


                // --------------------------------------
                // RETURN ROW
                // --------------------------------------

                return `
                    <tr>

                        <!-- STT -->
                        <td>
                            ${stt}
                        </td>


                        <!-- MÃ MÓN -->
                        <td>
                            <strong>
                                ${escapeHtml(id)}
                            </strong>
                        </td>


                        <!-- ẢNH -->
                        <td>
                            <div class="mon-an-image-cell">
                                ${imageHtml}
                            </div>
                        </td>


                        <!-- TÊN -->
                        <td>
                            <div class="mon-an-name">
                                ${escapeHtml(ten)}
                            </div>
                        </td>


                        <!-- CỬA HÀNG -->
                        <td>
                            ${escapeHtml(
                                maCuaHang
                            )}
                        </td>


                        <!-- DANH MỤC -->
                        <td>
                            ${escapeHtml(
                                maDanhMuc
                            )}
                        </td>


                        <!-- GIÁ -->
                        <td>
                            <strong>
                                ${formatPrice(gia)}
                            </strong>
                        </td>


                        <!-- ĐÁNH GIÁ -->
                        <td>
                            <span class="mon-an-rating">
                                ⭐
                                ${escapeHtml(
                                    danhGia
                                )}
                            </span>
                        </td>


                        <!-- TRẠNG THÁI -->
                        <td>
                            ${statusHtml}
                        </td>


                        <!-- THAO TÁC -->
                        <td>

                            <div class="mon-an-actions">

                                <button
                                    type="button"
                                    class="btn-edit-mon-an"
                                    data-id="${escapeHtml(id)}"
                                >
                                    Sửa
                                </button>

                                <button
                                    type="button"
                                    class="btn-delete-mon-an"
                                    data-id="${escapeHtml(id)}"
                                >
                                    Xóa
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");


    renderPagination(
        totalPages
    );
}


// ======================================================
// PHÂN TRANG
// ======================================================

function renderPagination(totalPages) {

    const pagination =
        document.getElementById(
            "monAnPagination"
        );


    if (!pagination) {
        return;
    }


    if (totalPages <= 1) {

        pagination.innerHTML = "";

        return;
    }


    let html = "";


    // --------------------------------------
    // PREVIOUS
    // --------------------------------------

    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${currentPage - 1}"
            ${currentPage <= 1 ? "disabled" : ""}
        >
            ‹
        </button>
    `;


    // --------------------------------------
    // PAGE NUMBERS
    // --------------------------------------

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `
            <button
                type="button"
                class="pagination-btn
                    ${
                        page === currentPage
                            ? "active"
                            : ""
                    }"
                data-page="${page}"
            >
                ${page}
            </button>
        `;
    }


    // --------------------------------------
    // NEXT
    // --------------------------------------

    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${currentPage + 1}"
            ${
                currentPage >= totalPages
                    ? "disabled"
                    : ""
            }
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
                    function () {

                        const page =
                            Number(
                                this.dataset.page
                            );


                        if (
                            page < 1 ||
                            page > totalPages
                        ) {
                            return;
                        }


                        currentPage =
                            page;


                        renderMonAn();
                    }
                );
            }
        );
}


// ======================================================
// LOAD DANH MỤC
// ======================================================

async function loadDanhMuc() {

    const filter =
        document.getElementById(
            "filterDanhMuc"
        );

    const select =
        document.getElementById(
            "maDanhMuc"
        );


    try {

        const data =
            await apiRequest(
                `${API_BASE}/DanhMuc`
            );


        allDanhMuc =
            getArray(data);


        console.log(
            "GET /api/DanhMuc:",
            allDanhMuc
        );


        // --------------------------------------
        // FILTER
        // --------------------------------------

        if (filter) {

            filter.innerHTML = `
                <option value="">
                    Tất cả danh mục
                </option>
            `;


            allDanhMuc.forEach(
                item => {

                    const id =
                        getValue(
                            item,
                            "maDanhMuc",
                            "MaDanhMuc"
                        );


                    const name =
                        getValue(
                            item,
                            "tenDanhMuc",
                            "TenDanhMuc"
                        ) || id;


                    filter.innerHTML += `
                        <option
                            value="${escapeHtml(id)}"
                        >
                            ${escapeHtml(name)}
                        </option>
                    `;
                }
            );
        }


        // --------------------------------------
        // FORM
        // --------------------------------------

        if (select) {

            select.innerHTML = `
                <option value="">
                    -- Chọn danh mục --
                </option>
            `;


            allDanhMuc.forEach(
                item => {

                    const id =
                        getValue(
                            item,
                            "maDanhMuc",
                            "MaDanhMuc"
                        );


                    const name =
                        getValue(
                            item,
                            "tenDanhMuc",
                            "TenDanhMuc"
                        ) || id;


                    select.innerHTML += `
                        <option
                            value="${escapeHtml(id)}"
                        >
                            ${escapeHtml(name)}
                        </option>
                    `;
                }
            );
        }

    }
    catch (error) {

        console.warn(
            "Không tải được danh mục:",
            error
        );

        // Không làm trang chết.
        // Khi sửa, giá trị hiện tại vẫn được thêm.
    }
}


// ======================================================
// LOAD CỬA HÀNG
// ======================================================

async function loadCuaHang() {

    const select =
        document.getElementById(
            "maCuaHang"
        );


    if (!select) {
        return;
    }


    try {

        const data =
            await apiRequest(
                `${API_BASE}/CuaHang`
            );


        allCuaHang =
            getArray(data);


        console.log(
            "GET /api/CuaHang:",
            allCuaHang
        );


        select.innerHTML = `
            <option value="">
                -- Chọn cửa hàng --
            </option>
        `;


        allCuaHang.forEach(
            item => {

                const id =
                    getValue(
                        item,
                        "maCuaHang",
                        "MaCuaHang"
                    );


                const name =
                    getValue(
                        item,
                        "tenCuaHang",
                        "TenCuaHang"
                    ) || id;


                if (!id) {
                    return;
                }


                select.innerHTML += `
                    <option
                        value="${escapeHtml(id)}"
                    >
                        ${escapeHtml(name)}
                        (${escapeHtml(id)})
                    </option>
                `;
            }
        );

    }
    catch (error) {

        console.warn(
            "Không tải được cửa hàng:",
            error
        );

        // Không làm trang chết.
    }
}


// ======================================================
// ĐẢM BẢO VALUE SELECT KHI SỬA
// ======================================================

function ensureSelectValue(
    selectId,
    value,
    defaultText
) {

    const select =
        document.getElementById(
            selectId
        );


    if (!select) {
        return;
    }


    const stringValue =
        String(value ?? "").trim();


    if (!stringValue) {
        return;
    }


    const exists =
        Array.from(
            select.options
        ).some(
            option =>
                String(option.value) ===
                stringValue
        );


    if (!exists) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            stringValue;


        option.textContent =
            `${stringValue}`;


        select.appendChild(
            option
        );
    }


    select.value =
        stringValue;
}


// ======================================================
// ĐẢM BẢO SELECT HIỆN GIÁ TRỊ
// ======================================================

function ensureCurrentSelectValues() {

    if (!allMonAn.length) {
        return;
    }


    const first =
        allMonAn[0];


    ensureSelectValue(
        "maCuaHang",
        getMaCuaHang(first),
        "-- Chọn cửa hàng --"
    );


    ensureSelectValue(
        "maDanhMuc",
        getMaDanhMuc(first),
        "-- Chọn danh mục --"
    );
}


// ======================================================
// TÌM KIẾM
// ======================================================

function filterMonAn() {

    const search =
        document.getElementById(
            "searchMonAn"
        );

    const filter =
        document.getElementById(
            "filterDanhMuc"
        );


    const keyword =
        String(
            search?.value || ""
        )
            .trim()
            .toLowerCase();


    const danhMuc =
        String(
            filter?.value || ""
        );


    filteredMonAn =
        allMonAn.filter(
            monAn => {

                const ten =
                    String(
                        getTen(monAn)
                    )
                        .toLowerCase();


                const id =
                    String(
                        getId(monAn)
                    )
                        .toLowerCase();


                const matchKeyword =
                    !keyword ||
                    ten.includes(keyword) ||
                    id.includes(keyword);


                const matchDanhMuc =
                    !danhMuc ||
                    String(
                        getMaDanhMuc(monAn)
                    ) === danhMuc;


                return (
                    matchKeyword &&
                    matchDanhMuc
                );
            }
        );


    currentPage = 1;


    renderMonAn();
}


// ======================================================
// FORM - MỞ THÊM
// ======================================================

function openAddForm() {

    editingMonAnId =
        null;


    const panel =
        document.getElementById(
            "monAnFormPanel"
        );


    const form =
        document.getElementById(
            "monAnForm"
        );


    const title =
        document.getElementById(
            "monAnFormTitle"
        );


    if (form) {
        form.reset();
    }


    if (title) {

        title.textContent =
            "Thêm món ăn";
    }


    const maMonAn =
        document.getElementById(
            "maMonAn"
        );


    if (maMonAn) {

        maMonAn.value =
            "";

        maMonAn.disabled =
            false;

        maMonAn.placeholder =
            "Để trống hệ thống tự tạo";
    }


    const danhGia =
        document.getElementById(
            "danhGia"
        );


    if (danhGia) {
        danhGia.value = "0";
    }


    const trangThai =
        document.getElementById(
            "trangThai"
        );


    if (trangThai) {
        trangThai.value = "1";
    }


    showForm(panel);
}


// ======================================================
// FORM - MỞ SỬA
// ======================================================

function openEditForm(id) {

    const monAn =
        allMonAn.find(
            item =>
                String(
                    getId(item)
                ) ===
                String(id)
        );


    if (!monAn) {

        alert(
            "Không tìm thấy món ăn."
        );

        return;
    }


    editingMonAnId =
        String(id);


    const panel =
        document.getElementById(
            "monAnFormPanel"
        );


    const title =
        document.getElementById(
            "monAnFormTitle"
        );


    if (title) {

        title.textContent =
            "Sửa món ăn";
    }


    // --------------------------------------
    // MÃ MÓN
    // --------------------------------------

    const maMonAn =
        document.getElementById(
            "maMonAn"
        );


    if (maMonAn) {

        maMonAn.value =
            getId(monAn);

        maMonAn.disabled =
            true;
    }


    // --------------------------------------
    // CỬA HÀNG
    // --------------------------------------

    ensureSelectValue(
        "maCuaHang",
        getMaCuaHang(monAn),
        "-- Chọn cửa hàng --"
    );


    // --------------------------------------
    // DANH MỤC
    // --------------------------------------

    ensureSelectValue(
        "maDanhMuc",
        getMaDanhMuc(monAn),
        "-- Chọn danh mục --"
    );


    // --------------------------------------
    // TÊN
    // --------------------------------------

    const tenMonAn =
        document.getElementById(
            "tenMonAn"
        );


    if (tenMonAn) {

        tenMonAn.value =
            getTen(monAn);
    }


    // --------------------------------------
    // GIÁ
    // --------------------------------------

    const gia =
        document.getElementById(
            "gia"
        );


    if (gia) {

        gia.value =
            getGia(monAn);
    }


    // --------------------------------------
    // ĐÁNH GIÁ
    // --------------------------------------

    const danhGia =
        document.getElementById(
            "danhGia"
        );


    if (danhGia) {

        danhGia.value =
            getDanhGia(monAn);
    }


    // --------------------------------------
    // TRẠNG THÁI
    // --------------------------------------

    const trangThai =
        document.getElementById(
            "trangThai"
        );


    if (trangThai) {

        trangThai.value =
            String(
                getTrangThai(monAn)
            );
    }


    // --------------------------------------
    // ẢNH
    // --------------------------------------

    const anhMonAn =
        document.getElementById(
            "anhMonAn"
        );


    if (anhMonAn) {

        anhMonAn.value =
            getAnh(monAn);
    }


    // --------------------------------------
    // MÔ TẢ
    // --------------------------------------

    const moTa =
        document.getElementById(
            "moTa"
        );


    if (moTa) {

        moTa.value =
            getMoTa(monAn);
    }


    // --------------------------------------
    // HIỆN FORM
    // --------------------------------------

    showForm(panel);
}


// ======================================================
// HIỆN FORM
// ======================================================

function showForm(panel) {

    if (!panel) {
        return;
    }


    // HTML hiện tại có:
    // style="display:none"
    // nên phải đổi display trực tiếp.

    panel.hidden =
        false;

    panel.style.display =
        "block";


    setTimeout(
        () => {

            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        50
    );
}


// ======================================================
// ĐÓNG FORM
// ======================================================

function closeForm() {

    const panel =
        document.getElementById(
            "monAnFormPanel"
        );


    if (panel) {

        panel.style.display =
            "none";

        panel.hidden =
            true;
    }


    editingMonAnId =
        null;


    const form =
        document.getElementById(
            "monAnForm"
        );


    if (form) {
        form.reset();
    }


    const maMonAn =
        document.getElementById(
            "maMonAn"
        );


    if (maMonAn) {

        maMonAn.disabled =
            false;

        maMonAn.placeholder =
            "Để trống hệ thống tự tạo";
    }
}


// ======================================================
// LƯU MÓN ĂN
// ======================================================

async function saveMonAn() {

    const maMonAnInput =
        document.getElementById(
            "maMonAn"
        );


    const maCuaHang =
        document.getElementById(
            "maCuaHang"
        )?.value.trim();


    const maDanhMuc =
        document.getElementById(
            "maDanhMuc"
        )?.value.trim();


    const tenMonAn =
        document.getElementById(
            "tenMonAn"
        )?.value.trim();


    const gia =
        Number(
            document.getElementById(
                "gia"
            )?.value || 0
        );


    const danhGia =
        Number(
            document.getElementById(
                "danhGia"
            )?.value || 0
        );


    const trangThai =
        Number(
            document.getElementById(
                "trangThai"
            )?.value || 0
        );


    const anhMonAn =
        document.getElementById(
            "anhMonAn"
        )?.value.trim();


    const moTa =
        document.getElementById(
            "moTa"
        )?.value.trim();


    // ==================================================
    // VALIDATE
    // ==================================================

    if (!maCuaHang) {

        alert(
            "Vui lòng chọn cửa hàng."
        );

        return;
    }


    if (!maDanhMuc) {

        alert(
            "Vui lòng chọn danh mục."
        );

        return;
    }


    if (!tenMonAn) {

        alert(
            "Vui lòng nhập tên món ăn."
        );

        return;
    }


    if (
        !Number.isFinite(gia) ||
        gia < 0
    ) {

        alert(
            "Giá món ăn không hợp lệ."
        );

        return;
    }


    if (
        !Number.isFinite(danhGia) ||
        danhGia < 0 ||
        danhGia > 5
    ) {

        alert(
            "Đánh giá phải từ 0 đến 5."
        );

        return;
    }


    // ==================================================
    // MÃ MÓN
    // ==================================================

    const maMonAn =
        maMonAnInput?.value.trim() ||
        "";


    // ==================================================
    // DATA
    // ==================================================

    const data = {

        MaMonAn:
            maMonAn,

        MaCuaHang:
            maCuaHang,

        MaDanhMuc:
            maDanhMuc,

        TenMonAn:
            tenMonAn,

        Gia:
            gia,

        DanhGia:
            danhGia,

        TrangThai:
            trangThai,

        AnhMonAn:
            anhMonAn,

        MoTa:
            moTa
    };


    console.log(
        "Dữ liệu gửi:",
        data
    );


    try {

        let result;


        // ==================================================
        // THÊM
        // ==================================================

        if (!editingMonAnId) {

            result =
                await apiRequest(
                    `${API_BASE}/MonAn`,
                    {
                        method: "POST",
                        body: JSON.stringify(data)
                    }
                );


            console.log(
                "POST /api/MonAn:",
                result
            );


            alert(
                "Thêm món ăn thành công."
            );
        }


        // ==================================================
        // SỬA
        // ==================================================

        else {

            // Backend không cho thay đổi MaMonAn.
            // Gán lại ID đang sửa.

            data.MaMonAn =
                editingMonAnId;


            result =
                await apiRequest(
                    `${API_BASE}/MonAn/${encodeURIComponent(
                        editingMonAnId
                    )}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(data)
                    }
                );


            console.log(
                "PUT /api/MonAn:",
                result
            );


            alert(
                "Cập nhật món ăn thành công."
            );
        }


        closeForm();


        await loadMonAn();

    }
    catch (error) {

        console.error(
            "Lỗi lưu món ăn:",
            error
        );


        alert(
            "Không thể lưu món ăn.\n\n" +
            error.message
        );
    }
}


// ======================================================
// XÓA MÓN ĂN
// ======================================================

async function deleteMonAn(id) {

    const monAn =
        allMonAn.find(
            item =>
                String(
                    getId(item)
                ) ===
                String(id)
        );


    if (!monAn) {

        alert(
            "Không tìm thấy món ăn."
        );

        return;
    }


    const ten =
        getTen(monAn);


    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa món "${ten}" không?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `${API_BASE}/MonAn/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Xóa món ăn thành công."
        );


        await loadMonAn();

    }
    catch (error) {

        console.error(
            "Lỗi xóa món ăn:",
            error
        );


        alert(
            "Không thể xóa món ăn.\n\n" +
            error.message
        );
    }
}


// ======================================================
// BUTTON + EVENTS
// ======================================================

function setupEvents() {

    // --------------------------------------
    // THÊM
    // --------------------------------------

    const btnThem =
        document.getElementById(
            "btnThemMonAn"
        );


    if (btnThem) {

        btnThem.addEventListener(
            "click",
            openAddForm
        );
    }


    // --------------------------------------
    // HỦY
    // --------------------------------------

    const btnHuy =
        document.getElementById(
            "btnHuyMonAn"
        );


    if (btnHuy) {

        btnHuy.addEventListener(
            "click",
            closeForm
        );
    }


    // --------------------------------------
    // FORM SUBMIT
    // --------------------------------------

    const form =
        document.getElementById(
            "monAnForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                // Rất quan trọng:
                // ngăn HTML reload trang.

                event.preventDefault();

                saveMonAn();
            }
        );
    }


    // --------------------------------------
    // SEARCH
    // --------------------------------------

    const search =
        document.getElementById(
            "searchMonAn"
        );


    if (search) {

        search.addEventListener(
            "input",
            filterMonAn
        );
    }


    // --------------------------------------
    // FILTER DANH MỤC
    // --------------------------------------

    const filter =
        document.getElementById(
            "filterDanhMuc"
        );


    if (filter) {

        filter.addEventListener(
            "change",
            filterMonAn
        );
    }


    // --------------------------------------
    // TABLE ACTIONS
    // --------------------------------------

    const tbody =
        document.getElementById(
            "monAnTableBody"
        );


    if (tbody) {

        tbody.addEventListener(
            "click",
            function (event) {

                const editButton =
                    event.target.closest(
                        ".btn-edit-mon-an"
                    );


                if (editButton) {

                    openEditForm(
                        editButton.dataset.id
                    );

                    return;
                }


                const deleteButton =
                    event.target.closest(
                        ".btn-delete-mon-an"
                    );


                if (deleteButton) {

                    deleteMonAn(
                        deleteButton.dataset.id
                    );

                    return;
                }
            }
        );
    }
}


// ======================================================
// STYLE BỔ SUNG CHO BẢNG
// ======================================================

function addAdminMonAnStyles() {

    if (
        document.getElementById(
            "admin-mon-an-js-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "admin-mon-an-js-style";


    style.textContent = `

        /* =========================================
           BẢNG MÓN ĂN
           ========================================= */

        .mon-an-table-wrapper {
            overflow-x: auto;
            width: 100%;
        }


        .mon-an-table {
            min-width: 1200px;
            width: 100%;
            border-collapse: collapse;
        }


        .mon-an-table th,
        .mon-an-table td {
            vertical-align: middle;
            white-space: nowrap;
        }


        .mon-an-table th:nth-child(1),
        .mon-an-table td:nth-child(1) {
            width: 55px;
            text-align: center;
        }


        .mon-an-table th:nth-child(2),
        .mon-an-table td:nth-child(2) {
            width: 130px;
        }


        .mon-an-table th:nth-child(3),
        .mon-an-table td:nth-child(3) {
            width: 90px;
            text-align: center;
        }


        .mon-an-table th:nth-child(4),
        .mon-an-table td:nth-child(4) {
            min-width: 190px;
            white-space: normal;
        }


        .mon-an-table th:nth-child(5),
        .mon-an-table td:nth-child(5) {
            width: 140px;
        }


        .mon-an-table th:nth-child(6),
        .mon-an-table td:nth-child(6) {
            width: 130px;
        }


        .mon-an-table th:nth-child(7),
        .mon-an-table td:nth-child(7) {
            width: 120px;
        }


        .mon-an-table th:nth-child(8),
        .mon-an-table td:nth-child(8) {
            width: 100px;
        }


        .mon-an-table th:nth-child(9),
        .mon-an-table td:nth-child(9) {
            width: 110px;
        }


        .mon-an-table th:nth-child(10),
        .mon-an-table td:nth-child(10) {
            width: 140px;
        }


        /* =========================================
           ẢNH
           ========================================= */

        .mon-an-image-cell {
            width: 60px;
            height: 60px;
            margin: auto;
        }


        .mon-an-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            display: block;
        }


        .mon-an-no-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            background: #f3f3f3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
        }


        /* =========================================
           TÊN
           ========================================= */

        .mon-an-name {
            font-weight: 600;
            line-height: 1.4;
            white-space: normal;
            min-width: 160px;
        }


        /* =========================================
           ĐÁNH GIÁ
           ========================================= */

        .mon-an-rating {
            color: #ff6500;
            font-weight: 600;
        }


        /* =========================================
           TRẠNG THÁI
           ========================================= */

        .mon-an-status {
            display: inline-block;
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
        }


        .mon-an-status.active {
            background: #e8f8ed;
            color: #218838;
        }


        .mon-an-status.inactive {
            background: #f3f3f3;
            color: #777;
        }


        /* =========================================
           NÚT
           ========================================= */

        .mon-an-actions {
            display: flex;
            align-items: center;
            gap: 6px;
        }


        .btn-edit-mon-an,
        .btn-delete-mon-an {
            border: 1px solid #bbb;
            background: #fff;
            border-radius: 5px;
            padding: 7px 11px;
            cursor: pointer;
            font-size: 14px;
        }


        .btn-edit-mon-an:hover {
            background: #fff4e8;
            border-color: #ff6500;
        }


        .btn-delete-mon-an:hover {
            background: #fff0f0;
            border-color: #d9534f;
        }


        /* =========================================
           FORM
           ========================================= */

        #monAnFormPanel {
            width: 100%;
            box-sizing: border-box;
            margin-top: 25px;
        }


        #monAnFormPanel[hidden] {
            display: none !important;
        }


        #monAnFormPanel:not([hidden]) {
            display: block !important;
        }


        /* =========================================
           PAGINATION
           ========================================= */

        #monAnPagination {
            display: flex;
            align-items: center;
            gap: 5px;
        }


        .pagination-btn {
            min-width: 34px;
            height: 34px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 5px;
            cursor: pointer;
        }


        .pagination-btn:hover:not(:disabled) {
            border-color: #ff6500;
        }


        .pagination-btn.active {
            background: #ff6500;
            color: #fff;
            border-color: #ff6500;
        }


        .pagination-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

    `;


    document.head.appendChild(
        style
    );
}


// ======================================================
// KHỞI TẠO
// ======================================================

async function initAdminMonAn() {

    console.log(
        "================================"
    );

    console.log(
        "ADMIN MON AN JS - START"
    );

    console.log(
        "================================"
    );


    addAdminMonAnStyles();


    setupEvents();


    // Tải song song danh mục + cửa hàng
    // rồi tải món ăn.

    await Promise.all([
        loadDanhMuc(),
        loadCuaHang()
    ]);


    await loadMonAn();


    console.log(
        "ADMIN MON AN JS - READY"
    );
}


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    initAdminMonAn
);