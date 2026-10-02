// ===============================
// QUAN LY DANH MUC - FOODDELI
// ===============================

// Doi API_BASE_URL nay thanh URL API dang dung trong cua-hang.js / mon-an.js neu khac.
const API_BASE_URL = "https://localhost:7135/api";

let danhMucs = [];
let danhMucHienThi = [];

let currentPage = 1;
const pageSize = 10;

let editingId = null;

// ===============================
// KHOI TAO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    khoiTaoSuKien();
    loadDanhMucs();
});


// ===============================
// SU KIEN
// ===============================

function khoiTaoSuKien() {

    // Them danh muc
    document.getElementById("btnThemDanhMuc")
        ?.addEventListener("click", () => {
            moFormThem();
        });

    // Huy
    document.getElementById("btnHuy")
        ?.addEventListener("click", () => {
            dongForm();
        });

    // Submit form
    document.getElementById("danhMucForm")
        ?.addEventListener("submit", async (e) => {
            e.preventDefault();
            await luuDanhMuc();
        });

    // Tim kiem
    document.getElementById("searchDanhMuc")
        ?.addEventListener("input", () => {
            currentPage = 1;
            locDanhMuc();
        });

    // Loc trang thai
    document.getElementById("filterDanhMuc")
        ?.addEventListener("change", () => {
            currentPage = 1;
            locDanhMuc();
        });

    // Phan trang
    document.getElementById("pagination")
        ?.addEventListener("click", (e) => {

            const button = e.target.closest("[data-page]");

            if (!button) return;

            const page = Number(button.dataset.page);

            if (!page || page === currentPage) return;

            currentPage = page;
            renderDanhMuc();
        });

    // Sua / xoa
    document.getElementById("danhMucTableBody")
        ?.addEventListener("click", (e) => {

            const button = e.target.closest("[data-action]");

            if (!button) return;

            const action = button.dataset.action;
            const id = button.dataset.id;

            if (!id) return;

            if (action === "edit") {
                moFormSua(id);
            }

            if (action === "delete") {
                xoaDanhMuc(id);
            }
        });

    // Dang xuat
    document.getElementById("btnLogout")
        ?.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "../dang-nhap.html";
        });
}


// ===============================
// LOAD DANH MUC
// ===============================

async function loadDanhMucs() {

    const tbody = document.getElementById("danhMucTableBody");

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-row">
                    Đang tải danh mục...
                </td>
            </tr>
        `;
    }

    try {

        const response = await fetch(`${API_BASE_URL}/DanhMuc`, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {

            const message = await getErrorMessage(response);

            throw new Error(message);
        }

        const data = await response.json();

        danhMucs = Array.isArray(data) ? data : [];

        // Sap xep theo ten
        danhMucs.sort((a, b) => {
            return layTen(a).localeCompare(
                layTen(b),
                "vi"
            );
        });

        currentPage = 1;

        locDanhMuc();

    } catch (error) {

        console.error("Loi load danh muc:", error);

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-row">
                        Không thể tải danh mục.
                    </td>
                </tr>
            `;
        }

        hienThongBao(
            error.message || "Không thể tải danh mục.",
            "error"
        );
    }
}


// ===============================
// LOC + TIM KIEM
// ===============================

function locDanhMuc() {

    const searchInput =
        document.getElementById("searchDanhMuc");

    const filterInput =
        document.getElementById("filterDanhMuc");

    const keyword =
        (searchInput?.value || "")
            .trim()
            .toLowerCase();

    const status =
        filterInput?.value ?? "";

    danhMucHienThi = danhMucs.filter(item => {

        const ten = layTen(item).toLowerCase();

        const matchSearch =
            ten.includes(keyword);

        const trangThai =
            layTrangThai(item);

        const matchStatus =
            status === "" ||
            String(trangThai) === String(status);

        return matchSearch && matchStatus;
    });

    // Neu page hien tai vuot qua so trang
    const totalPages =
        Math.max(
            1,
            Math.ceil(danhMucHienThi.length / pageSize)
        );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    renderDanhMuc();
}


// ===============================
// RENDER TABLE
// ===============================

function renderDanhMuc() {

    const tbody =
        document.getElementById("danhMucTableBody");

    if (!tbody) return;

    const total = danhMucHienThi.length;

    if (total === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-row">
                    Không tìm thấy danh mục nào.
                </td>
            </tr>
        `;

        capNhatRecordCount(0);
        renderPagination(0);

        return;
    }

    const start =
        (currentPage - 1) * pageSize;

    const end =
        Math.min(start + pageSize, total);

    const pageData =
        danhMucHienThi.slice(start, end);

    tbody.innerHTML = pageData.map((item, index) => {

        const ma =
            layMa(item);

        const ten =
            layTen(item);

        const moTa =
            layMoTa(item);

        const trangThai =
            layTrangThai(item);

        const stt =
            start + index + 1;

        const statusHtml =
            trangThai === 1
                ? `<span class="status-badge active">Hoạt động</span>`
                : `<span class="status-badge inactive">Không hoạt động</span>`;

        return `
            <tr>

                <td>${stt}</td>

                <td>
                    <strong>${escapeHtml(ma)}</strong>
                </td>

                <td>
                    ${escapeHtml(ten || "—")}
                </td>

                <td>
                    ${escapeHtml(moTa || "—")}
                </td>

                <td>
                    ${statusHtml}
                </td>

                <td>
                    <div class="table-actions">

                        <button
                            type="button"
                            class="action-btn edit"
                            data-action="edit"
                            data-id="${escapeAttribute(ma)}"
                            title="Sửa">
                            ✏️
                        </button>

                        <button
                            type="button"
                            class="action-btn delete"
                            data-action="delete"
                            data-id="${escapeAttribute(ma)}"
                            title="Xóa">
                            🗑️
                        </button>

                    </div>
                </td>

            </tr>
        `;

    }).join("");

    capNhatRecordCount(total, start + 1, end);

    renderPagination(total);
}


// ===============================
// PHAN TRANG
// ===============================

function renderPagination(total) {

    const pagination =
        document.getElementById("pagination");

    if (!pagination) return;

    const totalPages =
        Math.ceil(total / pageSize);

    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let html = "";

    // Previous
    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? "disabled" : ""}>
            ‹
        </button>
    `;

    // So trang
    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button
                type="button"
                class="pagination-btn ${i === currentPage ? "active" : ""}"
                data-page="${i}">
                ${i}
            </button>
        `;
    }

    // Next
    html += `
        <button
            type="button"
            class="pagination-btn"
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? "disabled" : ""}>
            ›
        </button>
    `;

    pagination.innerHTML = html;
}


// ===============================
// RECORD COUNT
// ===============================

function capNhatRecordCount(total, start = 0, end = 0) {

    const element =
        document.getElementById("recordCount");

    if (!element) return;

    if (total === 0) {
        element.textContent = "Không có danh mục";
        return;
    }

    element.textContent =
        `Hiển thị ${start} - ${end} trong ${total} danh mục`;
}


// ===============================
// MO FORM THEM
// ===============================

function moFormThem() {

    editingId = null;

    const panel =
        document.getElementById("danhMucFormPanel");

    const form =
        document.getElementById("danhMucForm");

    const title =
        document.getElementById("formTitle");

    const btnLuu =
        document.getElementById("btnLuu");

    if (form) {
        form.reset();
    }

    if (document.getElementById("trangThai")) {
        document.getElementById("trangThai").value = "1";
    }

    if (title) {
        title.textContent = "Thêm danh mục";
    }

    if (btnLuu) {
        btnLuu.textContent = "Lưu danh mục";
        btnLuu.disabled = false;
    }

    if (panel) {
        panel.style.display = "block";

        setTimeout(() => {
            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 50);
    }
}


// ===============================
// MO FORM SUA
// ===============================

function moFormSua(id) {

    const item =
        danhMucs.find(x => layMa(x) === id);

    if (!item) {
        hienThongBao(
            "Không tìm thấy danh mục cần sửa.",
            "error"
        );
        return;
    }

    editingId = id;

    const panel =
        document.getElementById("danhMucFormPanel");

    const title =
        document.getElementById("formTitle");

    const ten =
        document.getElementById("tenDanhMuc");

    const moTa =
        document.getElementById("moTa");

    const trangThai =
        document.getElementById("trangThai");

    const btnLuu =
        document.getElementById("btnLuu");

    if (title) {
        title.textContent =
            `Sửa danh mục: ${layTen(item)}`;
    }

    if (ten) {
        ten.value = layTen(item);
    }

    if (moTa) {
        moTa.value = layMoTa(item);
    }

    if (trangThai) {
        trangThai.value =
            String(layTrangThai(item));
    }

    if (btnLuu) {
        btnLuu.textContent = "Cập nhật danh mục";
        btnLuu.disabled = false;
    }

    if (panel) {

        panel.style.display = "block";

        setTimeout(() => {
            panel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 50);
    }
}


// ===============================
// DONG FORM
// ===============================

function dongForm() {

    editingId = null;

    const panel =
        document.getElementById("danhMucFormPanel");

    const form =
        document.getElementById("danhMucForm");

    if (form) {
        form.reset();
    }

    if (panel) {
        panel.style.display = "none";
    }
}


// ===============================
// THEM / SUA
// ===============================

async function luuDanhMuc() {

    const ten =
        document.getElementById("tenDanhMuc")
            ?.value
            .trim();

    const moTa =
        document.getElementById("moTa")
            ?.value
            .trim();

    const trangThai =
        Number(
            document.getElementById("trangThai")
                ?.value || 1
        );

    if (!ten) {

        hienThongBao(
            "Vui lòng nhập tên danh mục.",
            "error"
        );

        document.getElementById("tenDanhMuc")?.focus();

        return;
    }

    const btnLuu =
        document.getElementById("btnLuu");

    if (btnLuu) {
        btnLuu.disabled = true;
        btnLuu.textContent =
            editingId
                ? "Đang cập nhật..."
                : "Đang lưu...";
    }

    const data = {
        tenDanhMuc: ten,
        moTa: moTa || null,
        trangThai: trangThai
    };

    try {

        let response;

        if (editingId) {

            response = await fetch(
                `${API_BASE_URL}/DanhMuc/${encodeURIComponent(editingId)}`,
                {
                    method: "PUT",
                    headers: {
                        ...getHeaders(),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

        } else {

            response = await fetch(
                `${API_BASE_URL}/DanhMuc`,
                {
                    method: "POST",
                    headers: {
                        ...getHeaders(),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
        }

        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            throw new Error(message);
        }

        hienThongBao(
            editingId
                ? "Cập nhật danh mục thành công."
                : "Thêm danh mục thành công.",
            "success"
        );

        dongForm();

        await loadDanhMucs();

    } catch (error) {

        console.error("Loi luu danh muc:", error);

        hienThongBao(
            error.message ||
            "Không thể lưu danh mục.",
            "error"
        );

    } finally {

        if (btnLuu) {
            btnLuu.disabled = false;
            btnLuu.textContent =
                editingId
                    ? "Cập nhật danh mục"
                    : "Lưu danh mục";
        }
    }
}


// ===============================
// XOA
// ===============================

async function xoaDanhMuc(id) {

    const item =
        danhMucs.find(x => layMa(x) === id);

    const ten =
        item ? layTen(item) : id;

    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa danh mục "${ten}" không?`
        );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API_BASE_URL}/DanhMuc/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                headers: getHeaders()
            }
        );

        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            throw new Error(message);
        }

        hienThongBao(
            "Xóa danh mục thành công.",
            "success"
        );

        await loadDanhMucs();

    } catch (error) {

        console.error("Loi xoa danh muc:", error);

        hienThongBao(
            error.message ||
            "Không thể xóa danh mục.",
            "error"
        );
    }
}


// ===============================
// HEADER
// ===============================

function getHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Accept": "application/json"
    };

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return headers;
}


// ===============================
// DOC LOI API
// ===============================

async function getErrorMessage(response) {

    try {

        const data =
            await response.json();

        if (data?.message) {
            return data.message;
        }

        if (data?.title) {
            return data.title;
        }

        if (typeof data === "string") {
            return data;
        }

    } catch (error) {
        // Khong parse duoc JSON
    }

    if (response.status === 401) {
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }

    if (response.status === 403) {
        return "Bạn không có quyền thực hiện thao tác này.";
    }

    if (response.status === 404) {
        return "Không tìm thấy dữ liệu.";
    }

    if (response.status === 500) {
        return "Lỗi máy chủ. Không thể thực hiện thao tác.";
    }

    return `Thao tác thất bại. Mã lỗi: ${response.status}`;
}


// ===============================
// LAY DU LIEU
// ===============================

function layMa(item) {
    return String(
        item?.maDanhMuc ??
        item?.MaDanhMuc ??
        ""
    );
}

function layTen(item) {
    return String(
        item?.tenDanhMuc ??
        item?.TenDanhMuc ??
        ""
    );
}

function layMoTa(item) {
    return String(
        item?.moTa ??
        item?.MoTa ??
        ""
    );
}

function layTrangThai(item) {

    const value =
        item?.trangThai ??
        item?.TrangThai;

    return Number(value) === 1 ? 1 : 0;
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}


// ===============================
// THONG BAO
// ===============================

function hienThongBao(message, type = "success") {

    const oldToast =
        document.getElementById("adminToast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast =
        document.createElement("div");

    toast.id = "adminToast";

    toast.textContent = message;

    toast.style.position = "fixed";
    toast.style.top = "24px";
    toast.style.right = "24px";
    toast.style.zIndex = "99999";
    toast.style.padding = "14px 20px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.15)";
    toast.style.maxWidth = "400px";

    if (type === "error") {
        toast.style.background = "#fee2e2";
        toast.style.color = "#b91c1c";
        toast.style.border =
            "1px solid #fecaca";
    } else {
        toast.style.background = "#dcfce7";
        toast.style.color = "#15803d";
        toast.style.border =
            "1px solid #bbf7d0";
    }

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transition =
            "opacity 0.3s ease";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2500);
}