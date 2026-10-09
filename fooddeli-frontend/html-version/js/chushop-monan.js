const API_BASE = "https://localhost:7135/api";

let danhSachMonAn = [];
let danhSachDanhMuc = [];
let cuaHangCuaShop = null;

document.addEventListener("DOMContentLoaded", async function () {

    kiemTraDangNhap();

    taoModalMonAn();

    document
        .getElementById("btnThemMonAn")
        .addEventListener("click", function () {
            moModalThemMonAn();
        });

    document
        .getElementById("chushopLogout")
        .addEventListener("click", dangXuat);

    await khoiTao();

});


/* =========================================================
   KIEM TRA DANG NHAP
========================================================= */

function kiemTraDangNhap() {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const userText =
        localStorage.getItem("user");

    if (!token || !userText) {

        window.location.href = "dang-nhap.html";

        return;
    }

    try {

        const user = JSON.parse(userText);

        const role =
            user.vaiTro ||
            user.VaiTro ||
            user.role;

        let isChuShop = false;

        if (Array.isArray(role)) {

            isChuShop = role.some(x =>
                String(x).toLowerCase() === "chushop"
            );

        } else {

            isChuShop =
                String(role || "").toLowerCase() === "chushop";
        }

        if (!isChuShop) {

            alert("Bạn không có quyền truy cập trang này.");

            window.location.href = "../index.html";
        }

    } catch (error) {

        console.error(error);

        window.location.href = "dang-nhap.html";
    }
}


/* =========================================================
   KHOI TAO
========================================================= */

async function khoiTao() {

    try {

        await layCuaHang();

        if (!cuaHangCuaShop) {

            hienThiLoi(
                "Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước."
            );

            return;
        }

        await layDanhMuc();

        await layMonAn();

    } catch (error) {

        console.error(error);

        hienThiLoi(
            "Không thể tải dữ liệu. Vui lòng thử lại."
        );
    }
}


/* =========================================================
   LAY CUA HANG CUA SHOP
========================================================= */

async function layCuaHang() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const userId =
        user.maNguoiDung ||
        user.MaNguoiDung ||
        user.id;

    if (!userId) {

        throw new Error(
            "Không tìm thấy mã người dùng"
        );
    }

    const response = await fetch(
        `${API_BASE}/CuaHang`
    );

    if (!response.ok) {

        throw new Error(
            "Không thể lấy danh sách cửa hàng"
        );
    }

    const cuaHangs = await response.json();

    cuaHangCuaShop =
        cuaHangs.find(x =>
            String(x.maChuShop || x.MaChuShop || "")
                .toLowerCase() ===
            String(userId).toLowerCase()
        );

}


/* =========================================================
   LAY DANH MUC
========================================================= */

async function layDanhMuc() {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const response = await fetch(
        `${API_BASE}/DanhMuc`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            "Không thể lấy danh mục"
        );
    }

    danhSachDanhMuc =
        await response.json();

}


/* =========================================================
   LAY MON AN CUA CUA HANG
========================================================= */

async function layMonAn() {

    const maCuaHang =
        cuaHangCuaShop.maCuaHang ||
        cuaHangCuaShop.MaCuaHang;

    const response = await fetch(
        `${API_BASE}/MonAn/CuaHang/${encodeURIComponent(maCuaHang)}`
    );

    if (!response.ok) {

        throw new Error(
            "Không thể lấy danh sách món ăn"
        );
    }

    danhSachMonAn =
        await response.json();

    hienThiMonAn();
}


/* =========================================================
   HIEN THI MON AN
========================================================= */

function hienThiMonAn() {

    const tbody =
        document.getElementById("monAnTableBody");

    if (!danhSachMonAn.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center; padding:30px;">
                    Chưa có món ăn nào
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        danhSachMonAn.map((mon, index) => {

            const maMon =
                mon.maMonAn ||
                mon.MaMonAn ||
                "";

            const tenMon =
                mon.tenMonAn ||
                mon.TenMonAn ||
                "";

            const maDanhMuc =
                mon.maDanhMuc ||
                mon.MaDanhMuc ||
                "";

            const gia =
                mon.gia ??
                mon.Gia ??
                0;

            const anh =
                mon.anhMonAn ||
                mon.AnhMonAn ||
                "";

            const trangThai =
                mon.trangThai ??
                mon.TrangThai ??
                1;

            const tenDanhMuc =
                layTenDanhMuc(maDanhMuc);


            const anhHTML =
                anh
                    ? `
                        <img
                            src="${escapeHtml(anh)}"
                            class="monan-table-image"
                            onerror="this.style.display='none';"
                        >
                      `
                    : `
                        <div class="monan-no-image">
                            🍔
                        </div>
                      `;


            const trangThaiHTML =
                Number(trangThai) === 1
                    ? `
                        <span class="shop-status active">
                            Hoạt động
                        </span>
                      `
                    : `
                        <span class="shop-status inactive">
                            Ngừng bán
                        </span>
                      `;


            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        ${anhHTML}
                    </td>

                    <td>
                        ${escapeHtml(maMon)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(tenMon)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(tenDanhMuc)}
                    </td>

                    <td>
                        ${formatTien(gia)}
                    </td>

                    <td>
                        ${trangThaiHTML}
                    </td>

                    <td>

                        <button
                            class="admin-btn secondary"
                            onclick="moModalSuaMonAn('${escapeAttribute(maMon)}')">
                            Sửa
                        </button>

                        <button
                            class="admin-btn secondary"
                            onclick="xoaMonAn('${escapeAttribute(maMon)}')">
                            Xóa
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================================
   TEN DANH MUC
========================================================= */

function layTenDanhMuc(maDanhMuc) {

    const danhMuc =
        danhSachDanhMuc.find(x =>
            String(
                x.maDanhMuc ||
                x.MaDanhMuc ||
                ""
            ).toLowerCase() ===
            String(maDanhMuc || "").toLowerCase()
        );

    if (!danhMuc) {

        return maDanhMuc || "Chưa phân loại";
    }

    return (
        danhMuc.tenDanhMuc ||
        danhMuc.TenDanhMuc ||
        maDanhMuc
    );
}


/* =========================================================
   TAO MODAL
========================================================= */

function taoModalMonAn() {

    const modal = document.createElement("div");

    modal.id = "modalMonAn";

    modal.innerHTML = `

        <div class="monan-modal-overlay"></div>

        <div class="monan-modal">

            <div class="monan-modal-header">

                <h3 id="modalMonAnTitle">
                    Thêm món ăn
                </h3>

                <button
                    type="button"
                    id="btnDongModalMonAn"
                    class="monan-modal-close">
                    ×
                </button>

            </div>


            <div class="monan-modal-body">

                <input
                    type="hidden"
                    id="modalMaMonAn">


                <div class="monan-form-group">

                    <label>Tên món ăn *</label>

                    <input
                        type="text"
                        id="modalTenMonAn"
                        placeholder="Nhập tên món ăn">

                </div>


                <div class="monan-form-group">

                    <label>Danh mục *</label>

                    <select id="modalMaDanhMuc">

                        <option value="">
                            -- Chọn danh mục --
                        </option>

                    </select>

                </div>


                <div class="monan-form-row">

                    <div class="monan-form-group">

                        <label>Giá *</label>

                        <input
                            type="number"
                            id="modalGiaMonAn"
                            min="0"
                            step="1000"
                            placeholder="VD: 35000">

                    </div>


                    <div class="monan-form-group">

                        <label>Trạng thái</label>

                        <select id="modalTrangThaiMonAn">

                            <option value="1">
                                Hoạt động
                            </option>

                            <option value="0">
                                Ngừng bán
                            </option>

                        </select>

                    </div>

                </div>


                <div class="monan-form-group">

                    <label>Mô tả</label>

                    <textarea
                        id="modalMoTaMonAn"
                        placeholder="Nhập mô tả món ăn"></textarea>

                </div>


                <div class="monan-form-group">

                    <label>Ảnh món ăn</label>

                    <input
                        type="text"
                        id="modalAnhMonAn"
                        placeholder="Nhập URL ảnh món ăn">

                </div>


                <div
                    id="monAnPreview"
                    class="monan-image-preview"
                    style="display:none;">

                    <img
                        id="monAnPreviewImg"
                        src=""
                        alt="Ảnh món ăn">

                </div>

            </div>


            <div class="monan-modal-footer">

                <button
                    type="button"
                    id="btnHuyMonAn"
                    class="admin-btn secondary">
                    Hủy
                </button>

                <button
                    type="button"
                    id="btnLuuMonAn"
                    class="admin-btn primary">
                    Lưu
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    document
        .getElementById("btnDongModalMonAn")
        .addEventListener(
            "click",
            dongModalMonAn
        );


    document
        .getElementById("btnHuyMonAn")
        .addEventListener(
            "click",
            dongModalMonAn
        );


    document
        .getElementById("btnLuuMonAn")
        .addEventListener(
            "click",
            luuMonAn
        );


    document
        .getElementById("modalAnhMonAn")
        .addEventListener(
            "input",
            previewAnhMonAn
        );
}


/* =========================================================
   LOAD DANH MUC VAO SELECT
========================================================= */

function loadDanhMucSelect(selectedId = "") {

    const select =
        document.getElementById("modalMaDanhMuc");

    select.innerHTML = `
        <option value="">
            -- Chọn danh mục --
        </option>
    `;


    danhSachDanhMuc.forEach(danhMuc => {

        const id =
            danhMuc.maDanhMuc ||
            danhMuc.MaDanhMuc ||
            "";

        const ten =
            danhMuc.tenDanhMuc ||
            danhMuc.TenDanhMuc ||
            id;


        select.innerHTML += `
            <option
                value="${escapeAttribute(id)}"
                ${String(id).toLowerCase() ===
                  String(selectedId).toLowerCase()
                    ? "selected"
                    : ""}>
                ${escapeHtml(ten)}
            </option>
        `;

    });
}


/* =========================================================
   MO MODAL THEM
========================================================= */

function moModalThemMonAn() {

    document.getElementById(
        "modalMonAnTitle"
    ).textContent = "Thêm món ăn";


    document.getElementById(
        "modalMaMonAn"
    ).value = "";


    document.getElementById(
        "modalTenMonAn"
    ).value = "";


    document.getElementById(
        "modalGiaMonAn"
    ).value = "";


    document.getElementById(
        "modalMoTaMonAn"
    ).value = "";


    document.getElementById(
        "modalAnhMonAn"
    ).value = "";


    document.getElementById(
        "modalTrangThaiMonAn"
    ).value = "1";


    loadDanhMucSelect();


    document.getElementById(
        "monAnPreview"
    ).style.display = "none";


    document.getElementById(
        "modalMonAn"
    ).style.display = "flex";
}


/* =========================================================
   MO MODAL SUA
========================================================= */

function moModalSuaMonAn(maMonAn) {

    const mon =
        danhSachMonAn.find(x =>
            String(
                x.maMonAn ||
                x.MaMonAn ||
                ""
            ).toLowerCase() ===
            String(maMonAn).toLowerCase()
        );


    if (!mon) {

        alert("Không tìm thấy món ăn.");

        return;
    }


    document.getElementById(
        "modalMonAnTitle"
    ).textContent = "Sửa món ăn";


    document.getElementById(
        "modalMaMonAn"
    ).value =
        mon.maMonAn ||
        mon.MaMonAn ||
        "";


    document.getElementById(
        "modalTenMonAn"
    ).value =
        mon.tenMonAn ||
        mon.TenMonAn ||
        "";


    const maDanhMuc =
        mon.maDanhMuc ||
        mon.MaDanhMuc ||
        "";


    loadDanhMucSelect(maDanhMuc);


    document.getElementById(
        "modalGiaMonAn"
    ).value =
        mon.gia ??
        mon.Gia ??
        "";


    document.getElementById(
        "modalMoTaMonAn"
    ).value =
        mon.moTa ||
        mon.MoTa ||
        "";


    document.getElementById(
        "modalAnhMonAn"
    ).value =
        mon.anhMonAn ||
        mon.AnhMonAn ||
        "";


    document.getElementById(
        "modalTrangThaiMonAn"
    ).value =
        mon.trangThai ??
        mon.TrangThai ??
        1;


    previewAnhMonAn();


    document.getElementById(
        "modalMonAn"
    ).style.display = "flex";
}


/* =========================================================
   DONG MODAL
========================================================= */

function dongModalMonAn() {

    document.getElementById(
        "modalMonAn"
    ).style.display = "none";
}


/* =========================================================
   LUU MON AN
========================================================= */

async function luuMonAn() {

    const maMonAn =
        document.getElementById(
            "modalMaMonAn"
        ).value.trim();


    const tenMonAn =
        document.getElementById(
            "modalTenMonAn"
        ).value.trim();


    const maDanhMuc =
        document.getElementById(
            "modalMaDanhMuc"
        ).value;


    const gia =
        document.getElementById(
            "modalGiaMonAn"
        ).value;


    const moTa =
        document.getElementById(
            "modalMoTaMonAn"
        ).value.trim();


    const anhMonAn =
        document.getElementById(
            "modalAnhMonAn"
        ).value.trim();


    const trangThai =
        Number(
            document.getElementById(
                "modalTrangThaiMonAn"
            ).value
        );


    if (!tenMonAn) {

        alert("Vui lòng nhập tên món ăn.");

        return;
    }


    if (!maDanhMuc) {

        alert("Vui lòng chọn danh mục.");

        return;
    }


    if (
        gia === "" ||
        Number(gia) < 0
    ) {

        alert("Vui lòng nhập giá món ăn hợp lệ.");

        return;
    }


    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");


    const body = {

        maDanhMuc: maDanhMuc,

        tenMonAn: tenMonAn,

        moTa: moTa,

        gia: Number(gia),

        anhMonAn: anhMonAn,

        trangThai: trangThai

    };


    try {

        let response;


        /* =========================
           THEM
        ========================= */

        if (!maMonAn) {

            body.maCuaHang =
                cuaHangCuaShop.maCuaHang ||
                cuaHangCuaShop.MaCuaHang;


            response = await fetch(
                `${API_BASE}/MonAn`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(body)
                }
            );

        }


        /* =========================
           SUA
        ========================= */

        else {

            response = await fetch(
                `${API_BASE}/MonAn/${encodeURIComponent(maMonAn)}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(body)
                }
            );
        }


        const result =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            console.error(
                "Loi API MonAn:",
                result
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                alert(
                    "Bạn không có quyền thực hiện thao tác này."
                );

            } else {

                alert(
                    result?.message ||
                    "Không thể lưu món ăn."
                );
            }

            return;
        }


        alert(
            result?.message ||
            "Lưu món ăn thành công."
        );


        dongModalMonAn();

        await layMonAn();

    } catch (error) {

        console.error(error);

        alert(
            "Không thể kết nối tới máy chủ."
        );
    }
}


/* =========================================================
   XOA / NGUNG BAN MON AN
========================================================= */

async function xoaMonAn(maMonAn) {

    const mon =
        danhSachMonAn.find(x =>
            String(
                x.maMonAn ||
                x.MaMonAn ||
                ""
            ).toLowerCase() ===
            String(maMonAn).toLowerCase()
        );


    if (!mon) {

        alert("Không tìm thấy món ăn.");

        return;
    }


    const tenMon =
        mon.tenMonAn ||
        mon.TenMonAn ||
        maMonAn;


    const xacNhan =
        confirm(
            `Bạn có chắc muốn ngừng bán món "${tenMon}" không?`
        );


    if (!xacNhan) {

        return;
    }


    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");


    try {

        const response =
            await fetch(
                `${API_BASE}/MonAn/${encodeURIComponent(maMonAn)}`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            console.error(
                "Loi xoa MonAn:",
                result
            );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                alert(
                    "Bạn không có quyền ngừng bán món này."
                );

            } else {

                alert(
                    result?.message ||
                    "Không thể ngừng bán món ăn."
                );
            }

            return;
        }


        alert(
            result?.message ||
            "Đã ngừng bán món ăn."
        );


        await layMonAn();

    } catch (error) {

        console.error(error);

        alert(
            "Không thể kết nối tới máy chủ."
        );
    }
}


/* =========================================================
   PREVIEW ANH
========================================================= */

function previewAnhMonAn() {

    const url =
        document.getElementById(
            "modalAnhMonAn"
        ).value.trim();


    const preview =
        document.getElementById(
            "monAnPreview"
        );

    const img =
        document.getElementById(
            "monAnPreviewImg"
        );


    if (!url) {

        preview.style.display = "none";

        return;
    }


    img.src = url;

    preview.style.display = "block";


    img.onerror = function () {

        preview.style.display = "none";

    };
}


/* =========================================================
   FORMAT TIEN
========================================================= */

function formatTien(gia) {

    return Number(gia || 0)
        .toLocaleString("vi-VN")
        + " đ";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================================================
   HIEN THI LOI
========================================================= */

function hienThiLoi(message) {

    const tbody =
        document.getElementById(
            "monAnTableBody"
        );

    tbody.innerHTML = `
        <tr>
            <td colspan="8"
                style="text-align:center; padding:30px; color:#d33;">
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}


/* =========================================================
   DANG XUAT
========================================================= */

function dangXuat() {

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    window.location.href =
        "dang-nhap.html";
}