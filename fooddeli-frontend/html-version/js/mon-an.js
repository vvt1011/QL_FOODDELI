const API_BASE = "https://localhost:7135/api";


// ======================================================
// BIẾN
// ======================================================

let currentPage = 1;
const pageSize = 10;

let searchKeyword = "";
let selectedDanhMuc = "";

let danhMucList = [];
let cuaHangList = [];

let editingMonAnId = null;

let searchTimeout = null;


// ======================================================
// TOKEN
// ======================================================

function getToken() {
    return localStorage.getItem("token");
}


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

    return Number(price).toLocaleString("vi-VN") + " ₫";
}


// ======================================================
// LẤY TÊN DANH MỤC
// ======================================================

function getTenDanhMuc(maDanhMuc) {

    if (!maDanhMuc) {
        return "Chưa phân loại";
    }

    const danhMuc = danhMucList.find(item =>
        String(item.maDanhMuc).toLowerCase() ===
        String(maDanhMuc).toLowerCase()
    );

    return danhMuc
        ? (danhMuc.tenDanhMuc || maDanhMuc)
        : maDanhMuc;
}


// ======================================================
// TRẠNG THÁI
// ======================================================

function getTrangThaiText(trangThai) {

    return Number(trangThai) === 1
        ? "Đang bán"
        : "Ngừng bán";
}


function getTrangThaiClass(trangThai) {

    return Number(trangThai) === 1
        ? "status-active"
        : "status-inactive";
}


// ======================================================
// LOAD DANH MỤC
// ======================================================

async function loadDanhMuc() {

    try {

        const response =
            await fetch(`${API_BASE}/DanhMuc`);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        danhMucList =
            await response.json();

        renderDanhMucFilter();
        renderDanhMucForm();

    }
    catch (error) {

        console.error(
            "Lỗi tải danh mục:",
            error
        );

        danhMucList = [];

    }
}


// ======================================================
// FILTER DANH MỤC
// ======================================================

function renderDanhMucFilter() {

    const filter =
        document.getElementById(
            "filterDanhMuc"
        );

    if (!filter) {
        return;
    }

    filter.innerHTML = `
        <option value="">
            Tất cả danh mục
        </option>
    `;

    danhMucList.forEach(danhMuc => {

        const option =
            document.createElement("option");

        option.value =
            danhMuc.maDanhMuc || "";

        option.textContent =
            danhMuc.tenDanhMuc ||
            danhMuc.maDanhMuc ||
            "Không tên";

        filter.appendChild(option);

    });

    filter.value =
        selectedDanhMuc;
}


// ======================================================
// DANH MỤC TRONG FORM
// ======================================================

function renderDanhMucForm() {

    const select =
        document.getElementById(
            "maDanhMuc"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            -- Chọn danh mục --
        </option>
    `;

    danhMucList.forEach(danhMuc => {

        const option =
            document.createElement("option");

        option.value =
            danhMuc.maDanhMuc || "";

        option.textContent =
            danhMuc.tenDanhMuc ||
            danhMuc.maDanhMuc ||
            "Không tên";

        select.appendChild(option);

    });
}


// ======================================================
// LOAD CỬA HÀNG
// ======================================================

async function loadCuaHang() {

    try {

        const response =
            await fetch(`${API_BASE}/CuaHang`);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        cuaHangList =
            await response.json();

        renderCuaHangForm();

    }
    catch (error) {

        console.error(
            "Lỗi tải cửa hàng:",
            error
        );

        cuaHangList = [];

        const select =
            document.getElementById(
                "maCuaHang"
            );

        if (select) {

            select.innerHTML = `
                <option value="">
                    Không tải được cửa hàng
                </option>
            `;
        }
    }
}


// ======================================================
// CỬA HÀNG TRONG FORM
// ======================================================

function renderCuaHangForm() {

    const select =
        document.getElementById(
            "maCuaHang"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            -- Chọn cửa hàng --
        </option>
    `;

    cuaHangList.forEach(cuaHang => {

        const ma =
            cuaHang.maCuaHang || "";

        const ten =
            cuaHang.tenCuaHang ||
            ma ||
            "Không tên";

        const option =
            document.createElement("option");

        option.value = ma;

        option.textContent =
            `${ten} (${ma})`;

        select.appendChild(option);

    });
}


// ======================================================
// LOAD MÓN ĂN
// ======================================================

async function loadMonAn() {

    const tableBody =
        document.getElementById(
            "monAnTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="10"
                class="loading-row">

                Đang tải dữ liệu...

            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/MonAn/search`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        PageIndex:
                            currentPage,

                        PageSize:
                            pageSize,

                        TenMonAn:
                            searchKeyword,

                        MaDanhMuc:
                            selectedDanhMuc

                    })
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        const items =
            data.items || [];

        renderMonAn(items);

        renderPagination(
            data.totalItems || 0,
            data.pageIndex ||
                currentPage,
            data.pageSize ||
                pageSize
        );

        updateRecordCount(
            data.totalItems || 0
        );

    }
    catch (error) {

        console.error(
            "Lỗi tải món ăn:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="empty-row">

                    Không thể tải danh sách món ăn.

                </td>
            </tr>
        `;

        updateRecordCount(0);

        const pagination =
            document.getElementById(
                "monAnPagination"
            );

        if (pagination) {
            pagination.innerHTML = "";
        }
    }
}


// ======================================================
// RENDER MÓN ĂN
// ======================================================

function renderMonAn(monAns) {

    const tableBody =
        document.getElementById(
            "monAnTableBody"
        );

    if (!tableBody) {
        return;
    }

    if (
        !monAns ||
        monAns.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="empty-row">

                    Không tìm thấy món ăn.

                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        monAns.map(
            (monAn, index) => {

                const maMonAn =
                    monAn.maMonAn || "";

                const tenMonAn =
                    monAn.tenMonAn ||
                    "Chưa có tên";

                const maCuaHang =
                    monAn.maCuaHang || "-";

                const maDanhMuc =
                    monAn.maDanhMuc || "";

                const gia =
                    monAn.gia ?? 0;

                const danhGia =
                    monAn.danhGia ?? 0;

                const trangThai =
                    monAn.trangThai;


                // STT
                const stt =
                    ((currentPage - 1) *
                        pageSize) +
                    index +
                    1;


                // ẢNH
                let imageHtml = "";

                if (monAn.anhMonAn) {

                    imageHtml = `
                        <img
                            src="${escapeHtml(
                                monAn.anhMonAn
                            )}"
                            alt="${escapeHtml(
                                tenMonAn
                            )}"
                            class="food-image"
                            onerror="
                                this.outerHTML =
                                '<div class=&quot;food-image-placeholder&quot;>🍽️</div>'
                            "
                        >
                    `;

                }
                else {

                    imageHtml = `
                        <div
                            class="food-image-placeholder">

                            🍽️

                        </div>
                    `;
                }


                const tenDanhMuc =
                    getTenDanhMuc(
                        maDanhMuc
                    );


                const trangThaiText =
                    getTrangThaiText(
                        trangThai
                    );

                const trangThaiClass =
                    getTrangThaiClass(
                        trangThai
                    );


                return `
                    <tr>

                        <td
                            class="col-stt">

                            ${stt}

                        </td>


                        <td
                            class="col-ma-mon">

                            <strong>
                                ${escapeHtml(
                                    maMonAn
                                )}
                            </strong>

                        </td>


                        <td
                            class="col-image">

                            ${imageHtml}

                        </td>


                        <td
                            class="col-ten-mon">

                            <div class="food-name">

                                ${escapeHtml(
                                    tenMonAn
                                )}

                            </div>

                            ${
                                monAn.moTa
                                    ? `
                                        <div
                                            class="food-description">

                                            ${escapeHtml(
                                                monAn.moTa
                                            )}

                                        </div>
                                      `
                                    : ""
                            }

                        </td>


                        <td
                            class="col-cua-hang">

                            ${escapeHtml(
                                maCuaHang
                            )}

                        </td>


                        <td
                            class="col-danh-muc">

                            ${escapeHtml(
                                tenDanhMuc
                            )}

                        </td>


                        <td
                            class="col-gia">

                            <strong
                                class="food-price">

                                ${formatPrice(
                                    gia
                                )}

                            </strong>

                        </td>


                        <td
                            class="col-danh-gia">

                            <span
                                class="rating">

                                ⭐
                                ${escapeHtml(
                                    danhGia
                                )}

                            </span>

                        </td>


                        <td
                            class="col-trang-thai">

                            <span
                                class="status-badge
                                ${trangThaiClass}">

                                ${trangThaiText}

                            </span>

                        </td>


                        <td
                            class="col-thao-tac">

                            <div
                                class="action-buttons">

                                <button
                                    type="button"
                                    class="btn-action btn-edit"
                                    data-id="${escapeHtml(
                                        maMonAn
                                    )}"
                                    title="Sửa món ăn">

                                    ✏️

                                </button>


                                <button
                                    type="button"
                                    class="btn-action btn-delete"
                                    data-id="${escapeHtml(
                                        maMonAn
                                    )}"
                                    title="Ngừng bán món ăn">

                                    🗑️

                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


// ======================================================
// PHÂN TRANG
// ======================================================

function renderPagination(
    totalItems,
    pageIndex,
    pageSize
) {

    const pagination =
        document.getElementById(
            "monAnPagination"
        );

    if (!pagination) {
        return;
    }

    const totalPages =
        Math.ceil(
            totalItems / pageSize
        );

    if (totalPages <= 1) {

        pagination.innerHTML = "";

        return;
    }


    let html = "";


    // PREVIOUS
    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${pageIndex - 1}"
            ${pageIndex <= 1
                ? "disabled"
                : ""}>

            ‹

        </button>
    `;


    // PAGE
    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        html += `
            <button
                type="button"
                class="pagination-btn
                    ${i === pageIndex
                        ? "active"
                        : ""}"
                data-page="${i}">

                ${i}

            </button>
        `;
    }


    // NEXT
    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${pageIndex + 1}"
            ${pageIndex >= totalPages
                ? "disabled"
                : ""}>

            ›

        </button>
    `;


    pagination.innerHTML =
        html;
}


// ======================================================
// RECORD COUNT
// ======================================================

function updateRecordCount(total) {

    const recordCount =
        document.getElementById(
            "recordCount"
        );

    if (!recordCount) {
        return;
    }

    recordCount.textContent =
        `Tổng số ${
            Number(total)
                .toLocaleString("vi-VN")
        } món ăn`;
}


// ======================================================
// SEARCH
// ======================================================

function setupSearch() {

    const input =
        document.getElementById(
            "searchMonAn"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        function () {

            searchKeyword =
                this.value.trim();

            currentPage = 1;

            clearTimeout(
                searchTimeout
            );

            searchTimeout =
                setTimeout(
                    () => {
                        loadMonAn();
                    },
                    400
                );
        }
    );
}


// ======================================================
// FILTER DANH MỤC
// ======================================================

function setupDanhMucFilter() {

    const filter =
        document.getElementById(
            "filterDanhMuc"
        );

    if (!filter) {
        return;
    }

    filter.addEventListener(
        "change",
        function () {

            selectedDanhMuc =
                this.value;

            currentPage = 1;

            loadMonAn();
        }
    );
}


// ======================================================
// PAGINATION
// ======================================================

function setupPagination() {

    const pagination =
        document.getElementById(
            "monAnPagination"
        );

    if (!pagination) {
        return;
    }

    pagination.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".pagination-btn"
                );

            if (
                !button ||
                button.disabled
            ) {
                return;
            }

            const page =
                Number(
                    button.dataset.page
                );

            if (
                !page ||
                page < 1
            ) {
                return;
            }

            currentPage =
                page;

            loadMonAn();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}


// ======================================================
// MỞ FORM
// ======================================================

function showMonAnForm(title) {

    const panel =
        document.getElementById(
            "monAnFormPanel"
        );

    const titleElement =
        document.getElementById(
            "monAnFormTitle"
        );

    if (!panel) {
        return;
    }

    if (titleElement) {
        titleElement.textContent =
            title;
    }

    panel.style.display =
        "block";

    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ======================================================
// ẨN FORM
// ======================================================

function hideMonAnForm() {

    const panel =
        document.getElementById(
            "monAnFormPanel"
        );

    if (panel) {
        panel.style.display =
            "none";
    }

    editingMonAnId =
        null;
}


// ======================================================
// RESET FORM
// ======================================================

function resetMonAnForm() {

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
    }

    const trangThai =
        document.getElementById(
            "trangThai"
        );

    if (trangThai) {
        trangThai.value = "1";
    }

    editingMonAnId =
        null;
}


// ======================================================
// THÊM MÓN ĂN
// ======================================================

function setupAddButton() {

    const button =
        document.getElementById(
            "btnThemMonAn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            resetMonAnForm();

            showMonAnForm(
                "Thêm món ăn"
            );
        }
    );
}


// ======================================================
// HỦY FORM
// ======================================================

function setupCancelButton() {

    const button =
        document.getElementById(
            "btnHuyMonAn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            resetMonAnForm();

            hideMonAnForm();
        }
    );
}


// ======================================================
// LẤY DỮ LIỆU FORM
// ======================================================

function getFormData() {

    const giaValue =
        document.getElementById(
            "gia"
        ).value;

    const danhGiaValue =
        document.getElementById(
            "danhGia"
        ).value;

    return {

        maMonAn:
            document.getElementById(
                "maMonAn"
            ).value.trim(),

        maCuaHang:
            document.getElementById(
                "maCuaHang"
            ).value,

        maDanhMuc:
            document.getElementById(
                "maDanhMuc"
            ).value,

        tenMonAn:
            document.getElementById(
                "tenMonAn"
            ).value.trim(),

        moTa:
            document.getElementById(
                "moTa"
            ).value.trim(),

        gia:
            giaValue === ""
                ? null
                : Number(giaValue),

        anhMonAn:
            document.getElementById(
                "anhMonAn"
            ).value.trim(),

        danhGia:
            danhGiaValue === ""
                ? 0
                : Number(danhGiaValue),

        trangThai:
            Number(
                document.getElementById(
                    "trangThai"
                ).value
            )
    };
}


// ======================================================
// VALIDATE FORM
// ======================================================

function validateMonAn(data) {

    if (!data.maCuaHang) {

        alert(
            "Vui lòng chọn cửa hàng."
        );

        return false;
    }

    if (!data.maDanhMuc) {

        alert(
            "Vui lòng chọn danh mục."
        );

        return false;
    }

    if (!data.tenMonAn) {

        alert(
            "Vui lòng nhập tên món ăn."
        );

        return false;
    }

    if (
        data.gia === null ||
        Number.isNaN(data.gia) ||
        data.gia < 0
    ) {

        alert(
            "Giá món ăn không hợp lệ."
        );

        return false;
    }

    if (
        data.danhGia < 0 ||
        data.danhGia > 5
    ) {

        alert(
            "Đánh giá phải từ 0 đến 5."
        );

        return false;
    }

    return true;
}


// ======================================================
// SUBMIT FORM
// ======================================================

async function submitMonAn(event) {

    event.preventDefault();

    const token =
        getToken();

    if (!token) {

        alert(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );

        return;
    }


    const data =
        getFormData();


    if (!validateMonAn(data)) {
        return;
    }


    const isEdit =
        !!editingMonAnId;


    const url =
        isEdit
            ? `${API_BASE}/MonAn/${encodeURIComponent(
                editingMonAnId
            )}`
            : `${API_BASE}/MonAn`;


    const method =
        isEdit
            ? "PUT"
            : "POST";


    const button =
        document.getElementById(
            "btnLuuMonAn"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            isEdit
                ? "Đang cập nhật..."
                : "Đang thêm...";
    }


    try {

        const response =
            await fetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            MaMonAn:
                                data.maMonAn,

                            MaCuaHang:
                                data.maCuaHang,

                            MaDanhMuc:
                                data.maDanhMuc,

                            TenMonAn:
                                data.tenMonAn,

                            MoTa:
                                data.moTa,

                            Gia:
                                data.gia,

                            AnhMonAn:
                                data.anhMonAn,

                            DanhGia:
                                data.danhGia,

                            TrangThai:
                                data.trangThai
                        })
                }
            );


        let result = {};

        try {

            result =
                await response.json();

        }
        catch {

            result = {};
        }


        // 401
        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            return;
        }


        // 403
        if (response.status === 403) {

            alert(
                "Bạn không có quyền thực hiện thao tác này."
            );

            return;
        }


        // ERROR
        if (!response.ok) {

            alert(
                result.message ||
                `Không thể ${
                    isEdit
                        ? "cập nhật"
                        : "thêm"
                } món ăn.`
            );

            console.error(
                "API MonAn error:",
                result
            );

            return;
        }


        // SUCCESS
        alert(
            result.message ||
            (
                isEdit
                    ? "Cập nhật món ăn thành công."
                    : "Thêm món ăn thành công."
            )
        );


        resetMonAnForm();

        hideMonAnForm();

        await loadMonAn();

    }
    catch (error) {

        console.error(
            "Lỗi lưu món ăn:",
            error
        );

        alert(
            "Không thể kết nối đến máy chủ."
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Lưu món ăn";
        }
    }
}


// ======================================================
// SỬA MÓN ĂN
// ======================================================

async function editMonAn(maMonAn) {

    if (!maMonAn) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/MonAn/${encodeURIComponent(
                    maMonAn
                )}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const monAn =
            await response.json();


        editingMonAnId =
            maMonAn;


        // MÃ MÓN
        document.getElementById(
            "maMonAn"
        ).value =
            monAn.maMonAn || maMonAn;


        document.getElementById(
            "maMonAn"
        ).disabled = true;


        // CỬA HÀNG
        document.getElementById(
            "maCuaHang"
        ).value =
            monAn.maCuaHang || "";


        // DANH MỤC
        document.getElementById(
            "maDanhMuc"
        ).value =
            monAn.maDanhMuc || "";


        // TÊN
        document.getElementById(
            "tenMonAn"
        ).value =
            monAn.tenMonAn || "";


        // MÔ TẢ
        document.getElementById(
            "moTa"
        ).value =
            monAn.moTa || "";


        // GIÁ
        document.getElementById(
            "gia"
        ).value =
            monAn.gia ?? "";


        // ẢNH
        document.getElementById(
            "anhMonAn"
        ).value =
            monAn.anhMonAn || "";


        // ĐÁNH GIÁ
        document.getElementById(
            "danhGia"
        ).value =
            monAn.danhGia ?? 0;


        // TRẠNG THÁI
        document.getElementById(
            "trangThai"
        ).value =
            Number(
                monAn.trangThai
            ) === 1
                ? "1"
                : "0";


        showMonAnForm(
            "Sửa món ăn"
        );

    }
    catch (error) {

        console.error(
            "Lỗi lấy món ăn:",
            error
        );

        alert(
            "Không thể tải thông tin món ăn."
        );
    }
}


// ======================================================
// NGỪNG BÁN
// ======================================================

async function deleteMonAn(maMonAn) {

    if (!maMonAn) {

        alert(
            "Không xác định được mã món ăn."
        );

        return;
    }


    const confirmed =
        confirm(
            `Bạn có chắc muốn ngừng bán món ăn "${maMonAn}" không?`
        );


    if (!confirmed) {
        return;
    }


    const token =
        getToken();


    if (!token) {

        alert(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/MonAn/${encodeURIComponent(
                    maMonAn
                )}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );

            return;
        }


        if (response.status === 403) {

            alert(
                "Bạn không có quyền ngừng bán món ăn này."
            );

            return;
        }


        let data = {};

        try {

            data =
                await response.json();

        }
        catch {

            data = {};
        }


        if (!response.ok) {

            alert(
                data.message ||
                "Không thể ngừng bán món ăn."
            );

            console.error(
                "Delete MonAn error:",
                data
            );

            return;
        }


        alert(
            data.message ||
            "Đã ngừng bán món ăn thành công."
        );


        await loadMonAn();

    }
    catch (error) {

        console.error(
            "Lỗi ngừng bán món ăn:",
            error
        );

        alert(
            "Không thể kết nối đến máy chủ."
        );
    }
}


// ======================================================
// TABLE ACTIONS
// ======================================================

function setupTableActions() {

    const tableBody =
        document.getElementById(
            "monAnTableBody"
        );

    if (!tableBody) {
        return;
    }


    tableBody.addEventListener(
        "click",
        function (event) {

            const editButton =
                event.target.closest(
                    ".btn-edit"
                );


            const deleteButton =
                event.target.closest(
                    ".btn-delete"
                );


            // EDIT
            if (editButton) {

                const id =
                    editButton.dataset.id;

                editMonAn(id);

                return;
            }


            // DELETE
            if (deleteButton) {

                const id =
                    deleteButton.dataset.id;

                deleteMonAn(id);
            }

        }
    );
}


// ======================================================
// FORM SUBMIT
// ======================================================

function setupForm() {

    const form =
        document.getElementById(
            "monAnForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        submitMonAn
    );
}


// ======================================================
// KHỞI TẠO
// ======================================================

async function initMonAnPage() {

    setupSearch();

    setupDanhMucFilter();

    setupPagination();

    setupAddButton();

    setupCancelButton();

    setupTableActions();

    setupForm();


    await Promise.all([
        loadDanhMuc(),
        loadCuaHang()
    ]);


    await loadMonAn();
}


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    initMonAnPage
);