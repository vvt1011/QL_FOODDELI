const API_BASE = "https://localhost:7135/api";

let danhMucDangSua = null;

// ======================================================
// KHOI TAO
// ======================================================
document.addEventListener("DOMContentLoaded", function () {

    if (!kiemTraDangNhap()) {
        return;
    }

    taoModalDanhMuc();

    taiDanhMuc();

    const btnThem = document.querySelector(
        ".admin-panel-header .admin-btn.primary"
    );

    if (btnThem) {
        btnThem.addEventListener("click", function () {
            moModalThem();
        });
    }

    const btnLogout =
        document.getElementById("chushopLogout");

    if (btnLogout) {
        btnLogout.addEventListener(
            "click",
            dangXuat
        );
    }
});


// ======================================================
// KIEM TRA DANG NHAP
// ======================================================
function kiemTraDangNhap() {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const user =
        localStorage.getItem("user");

    if (!token || !user) {

        window.location.href =
            "dang-nhap.html";

        return false;
    }

    return true;
}


// ======================================================
// LAY TOKEN
// ======================================================
function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken")
    );
}


// ======================================================
// TAO MODAL
// ======================================================
function taoModalDanhMuc() {

    if (document.getElementById("modalDanhMuc")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "modalDanhMuc";

    modal.innerHTML = `

        <div class="danhmuc-modal-overlay">

            <div class="danhmuc-modal">

                <div class="danhmuc-modal-header">

                    <div>
                        <h2 id="modalDanhMucTitle">
                            Thêm danh mục
                        </h2>

                        <p>
                            Nhập thông tin danh mục món ăn
                        </p>
                    </div>

                    <button
                        type="button"
                        id="btnDongModal"
                        class="danhmuc-modal-close">
                        ×
                    </button>

                </div>


                <div class="danhmuc-modal-body">

                    <div class="form-group">

                        <label>
                            Mã danh mục
                        </label>

                        <input
                            type="text"
                            id="modalMaDanhMuc"
                            placeholder="Tự động tạo"
                            readonly>

                    </div>


                    <div class="form-group">

                        <label>
                            Tên danh mục
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="modalTenDanhMuc"
                            placeholder="Ví dụ: Đồ ăn, Đồ uống..."
                            maxlength="100">

                    </div>


                    <div class="form-group">

                        <label>
                            Mô tả
                        </label>

                        <textarea
                            id="modalMoTaDanhMuc"
                            rows="4"
                            placeholder="Nhập mô tả danh mục..."></textarea>

                    </div>


                    <div class="form-group">

                        <label>
                            Trạng thái
                        </label>

                        <select id="modalTrangThaiDanhMuc">

                            <option value="1">
                                Hoạt động
                            </option>

                            <option value="0">
                                Ngừng hoạt động
                            </option>

                        </select>

                    </div>

                </div>


                <div class="danhmuc-modal-footer">

                    <button
                        type="button"
                        id="btnHuyDanhMuc"
                        class="admin-btn secondary">
                        Hủy
                    </button>

                    <button
                        type="button"
                        id="btnLuuDanhMuc"
                        class="admin-btn primary">
                        Lưu danh mục
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    // Dong modal
    document
        .getElementById("btnDongModal")
        .addEventListener(
            "click",
            dongModal
        );


    document
        .getElementById("btnHuyDanhMuc")
        .addEventListener(
            "click",
            dongModal
        );


    document
        .getElementById("btnLuuDanhMuc")
        .addEventListener(
            "click",
            luuDanhMuc
        );


    // Click ra ngoai modal
    document
        .querySelector(".danhmuc-modal-overlay")
        .addEventListener(
            "click",
            function (event) {

                if (
                    event.target === this
                ) {
                    dongModal();
                }

            }
        );
}


// ======================================================
// MO MODAL THEM
// ======================================================
function moModalThem() {

    danhMucDangSua = null;

    document.getElementById(
        "modalDanhMucTitle"
    ).textContent = "Thêm danh mục";


    document.getElementById(
        "modalMaDanhMuc"
    ).value = "Tự động tạo";


    document.getElementById(
        "modalTenDanhMuc"
    ).value = "";


    document.getElementById(
        "modalMoTaDanhMuc"
    ).value = "";


    document.getElementById(
        "modalTrangThaiDanhMuc"
    ).value = "1";


    document.getElementById(
        "modalDanhMuc"
    ).style.display = "block";


    setTimeout(function () {

        document
            .getElementById(
                "modalTenDanhMuc"
            )
            .focus();

    }, 100);
}


// ======================================================
// MO MODAL SUA
// ======================================================
function moModalSua(danhMuc) {

    danhMucDangSua = danhMuc;


    document.getElementById(
        "modalDanhMucTitle"
    ).textContent = "Sửa danh mục";


    document.getElementById(
        "modalMaDanhMuc"
    ).value =
        danhMuc.maDanhMuc || "";


    document.getElementById(
        "modalTenDanhMuc"
    ).value =
        danhMuc.tenDanhMuc || "";


    document.getElementById(
        "modalMoTaDanhMuc"
    ).value =
        danhMuc.moTa || "";


    document.getElementById(
        "modalTrangThaiDanhMuc"
    ).value =
        Number(danhMuc.trangThai) === 1
            ? "1"
            : "0";


    document.getElementById(
        "modalDanhMuc"
    ).style.display = "block";


    setTimeout(function () {

        document
            .getElementById(
                "modalTenDanhMuc"
            )
            .focus();

    }, 100);
}


// ======================================================
// DONG MODAL
// ======================================================
function dongModal() {

    const modal =
        document.getElementById(
            "modalDanhMuc"
        );

    if (modal) {
        modal.style.display = "none";
    }

    danhMucDangSua = null;
}


// ======================================================
// TAI DANH MUC
// ======================================================
async function taiDanhMuc() {

    const tbody =
        document.querySelector(
            ".admin-table tbody"
        );

    if (!tbody) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/DanhMuc`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${getToken()}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn."
            );

            dangXuat();

            return;
        }


        if (response.status === 403) {

            alert(
                "Bạn không có quyền xem danh mục."
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const danhMucs =
            await response.json();


        hienThiDanhMuc(
            danhMucs
        );

    }
    catch (error) {

        console.error(
            "Lỗi tải danh mục:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;">
                    Không thể tải danh mục
                </td>

            </tr>

        `;
    }
}


// ======================================================
// HIEN THI DANH MUC
// ======================================================
function hienThiDanhMuc(danhMucs) {

    const tbody =
        document.querySelector(
            ".admin-table tbody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (
        !danhMucs ||
        danhMucs.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;">
                    Chưa có danh mục nào
                </td>

            </tr>

        `;

        return;
    }


    danhMucs.forEach(
        function (item, index) {

            const maDanhMuc =
                item.maDanhMuc || "";

            const tenDanhMuc =
                item.tenDanhMuc || "";

            const moTa =
                item.moTa || "";

            const trangThai =
                Number(item.trangThai) === 1;


            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        maDanhMuc
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        tenDanhMuc
                    )}
                </td>

                <td>

                    <span
                        class="shop-status ${
                            trangThai
                                ? "active"
                                : ""
                        }">

                        ${
                            trangThai
                                ? "Hoạt động"
                                : "Ngừng hoạt động"
                        }

                    </span>

                </td>

                <td>

                    <button
                        class="admin-btn secondary btn-sua">
                        Sửa
                    </button>

                    <button
                        class="admin-btn secondary btn-xoa">
                        Xóa
                    </button>

                </td>
            `;


            // SUA
            tr
                .querySelector(".btn-sua")
                .addEventListener(
                    "click",
                    function () {

                        moModalSua({
                            maDanhMuc:
                                maDanhMuc,

                            tenDanhMuc:
                                tenDanhMuc,

                            moTa:
                                moTa,

                            trangThai:
                                item.trangThai
                        });

                    }
                );


            // XOA
            tr
                .querySelector(".btn-xoa")
                .addEventListener(
                    "click",
                    function () {

                        xoaDanhMuc(
                            maDanhMuc,
                            tenDanhMuc
                        );

                    }
                );


            tbody.appendChild(tr);

        }
    );
}


// ======================================================
// LUU DANH MUC
// ======================================================
async function luuDanhMuc() {

    const ten =
        document
            .getElementById(
                "modalTenDanhMuc"
            )
            .value
            .trim();


    const moTa =
        document
            .getElementById(
                "modalMoTaDanhMuc"
            )
            .value
            .trim();


    const trangThai =
        Number(
            document
                .getElementById(
                    "modalTrangThaiDanhMuc"
                )
                .value
        );


    if (!ten) {

        alert(
            "Vui lòng nhập tên danh mục."
        );

        document
            .getElementById(
                "modalTenDanhMuc"
            )
            .focus();

        return;
    }


    const data = {

        tenDanhMuc: ten,

        moTa: moTa,

        trangThai: trangThai

    };


    try {

        const token =
            getToken();


        let url =
            `${API_BASE}/DanhMuc`;

        let method =
            "POST";


        // SUA
        if (danhMucDangSua) {

            url =
                `${API_BASE}/DanhMuc/` +
                encodeURIComponent(
                    danhMucDangSua.maDanhMuc
                );

            method =
                "PUT";


            data.maDanhMuc =
                danhMucDangSua.maDanhMuc;
        }


        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        const result =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn."
            );

            dangXuat();

            return;
        }


        if (response.status === 403) {

            alert(
                "Bạn không có quyền thực hiện thao tác này."
            );

            return;
        }


        if (!response.ok) {

            console.error(
                "API lỗi:",
                result
            );


            alert(
                result.message ||
                "Không thể lưu danh mục."
            );

            return;
        }


        alert(
            danhMucDangSua
                ? "Cập nhật danh mục thành công!"
                : "Thêm danh mục thành công!"
        );


        dongModal();


        await taiDanhMuc();

    }
    catch (error) {

        console.error(
            "Lỗi lưu danh mục:",
            error
        );


        alert(
            "Không thể kết nối tới server."
        );
    }
}


// ======================================================
// XOA DANH MUC
// ======================================================
async function xoaDanhMuc(
    maDanhMuc,
    tenDanhMuc
) {

    const xacNhan =
        confirm(
            `Bạn có chắc muốn xóa danh mục "${tenDanhMuc}" không?\n\n` +
            `Lưu ý: Nếu danh mục đang có món ăn, hệ thống có thể không cho phép xóa.`
        );


    if (!xacNhan) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/DanhMuc/${encodeURIComponent(maDanhMuc)}`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${getToken()}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const result =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (response.status === 401) {

            alert(
                "Phiên đăng nhập đã hết hạn."
            );

            dangXuat();

            return;
        }


        if (response.status === 403) {

            alert(
                "Bạn không có quyền xóa danh mục này."
            );

            return;
        }


        if (!response.ok) {

            console.error(
                "Lỗi xóa danh mục:",
                result
            );


            // Truong hop FK
            if (
                response.status === 400 &&
                (
                    result.message ||
                    ""
                )
                .toLowerCase()
                .includes("foreign")
            ) {

                alert(
                    "Không thể xóa danh mục này vì đang có món ăn sử dụng danh mục."
                );

                return;
            }


            alert(
                result.message ||
                "Không thể xóa danh mục. Có thể danh mục đang được sử dụng."
            );

            return;
        }


        alert(
            "Xóa danh mục thành công!"
        );


        await taiDanhMuc();

    }
    catch (error) {

        console.error(
            "Lỗi xóa danh mục:",
            error
        );


        alert(
            "Không thể kết nối tới server."
        );
    }
}


// ======================================================
// DANG XUAT
// ======================================================
function dangXuat() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "role"
    );


    window.location.href =
        "dang-nhap.html";
}


// ======================================================
// ESCAPE HTML
// ======================================================
function escapeHtml(value) {

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