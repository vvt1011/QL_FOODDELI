const API_BASE_URL = "https://localhost:7135/api";


// ======================================================
// STATE
// ======================================================

let tongQuanData = null;
let doanhThuData = [];
let topMonData = [];


// ======================================================
// DOM
// ======================================================

const thongKeError =
    document.getElementById("thongKeError");

const tabTongQuan =
    document.getElementById("tabTongQuan");

const tabDoanhThu =
    document.getElementById("tabDoanhThu");

const tabTopMon =
    document.getElementById("tabTopMon");

const tongDoanhThu =
    document.getElementById("tongDoanhThu");

const tongDonHang =
    document.getElementById("tongDonHang");

const tongKhachHang =
    document.getElementById("tongKhachHang");

const tongCuaHang =
    document.getElementById("tongCuaHang");

const revenueChart =
    document.getElementById("revenueChart");

const topMonListTongQuan =
    document.getElementById("topMonListTongQuan");

const doanhThuTableBody =
    document.getElementById("doanhThuTableBody");

const topMonTableBody =
    document.getElementById("topMonTableBody");


// ======================================================
// LAY TOKEN
// ======================================================

function layToken() {

    return localStorage.getItem("token");
}


// ======================================================
// HEADERS
// ======================================================

function getHeaders() {

    const token = layToken();

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return headers;
}


// ======================================================
// INIT
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log("ThongKe JS da khoi tao");

        ganSuKienTabs();

        const btnTaiDoanhThu =
            document.getElementById("btnTaiDoanhThu");

        const btnTaiTopMon =
            document.getElementById("btnTaiTopMon");

        const btnDangXuat =
            document.querySelector(".admin-logout");


        if (btnTaiDoanhThu) {

            btnTaiDoanhThu.addEventListener(
                "click",
                taiDoanhThu
            );
        }


        if (btnTaiTopMon) {

            btnTaiTopMon.addEventListener(
                "click",
                taiTopMon
            );
        }


        if (btnDangXuat) {

            btnDangXuat.addEventListener(
                "click",
                dangXuat
            );
        }


        const token = layToken();

        if (!token) {

            hienThiLoi(
                "Bạn chưa đăng nhập. Vui lòng đăng nhập lại."
            );

            return;
        }


        await taiTatCa();
    }
);


// ======================================================
// TAB
// ======================================================

function ganSuKienTabs() {

    const buttons =
        document.querySelectorAll(
            ".thong-ke-tab"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const tab =
                        button.dataset.tab;

                    moTab(tab);
                }
            );
        }
    );
}


// ======================================================
// MO TAB
// ======================================================

function moTab(tab) {

    document
        .querySelectorAll(".thong-ke-tab")
        .forEach(
            function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.tab === tab
                );
            }
        );


    if (tabTongQuan) {

        tabTongQuan.style.display =
            tab === "tong-quan"
                ? "block"
                : "none";
    }


    if (tabDoanhThu) {

        tabDoanhThu.style.display =
            tab === "doanh-thu"
                ? "block"
                : "none";
    }


    if (tabTopMon) {

        tabTopMon.style.display =
            tab === "top-mon"
                ? "block"
                : "none";
    }
}


// ======================================================
// TAI TAT CA
// ======================================================

async function taiTatCa() {

    anLoi();


    /*
       Không dùng Promise.all trực tiếp để tránh trường hợp
       một API lỗi làm ảnh hưởng các API còn lại.
    */

    await taiTongQuan();

    await taiDoanhThu();

    await taiTopMon();
}


// ======================================================
// API REQUEST CHUNG
// ======================================================

async function apiGet(url) {

    const response =
        await fetch(
            url,
            {
                method: "GET",
                headers: getHeaders()
            }
        );


    console.log(
        "API:",
        url,
        "STATUS:",
        response.status
    );


    if (response.status === 401) {

        dangXuat();

        throw new Error(
            "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
        );
    }


    if (response.status === 403) {

        throw new Error(
            "Tài khoản không có quyền xem thống kê."
        );
    }


    let data = null;

    const contentType =
        response.headers.get(
            "content-type"
        );


    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        data =
            await response.json();

    } else {

        const text =
            await response.text();

        data = text;
    }


    if (!response.ok) {

        let message =
            `HTTP ${response.status}`;


        if (data) {

            if (
                typeof data === "object"
            ) {

                message =
                    data.message ||
                    data.title ||
                    message;

            } else if (
                typeof data === "string" &&
                data.trim() !== ""
            ) {

                message =
                    data;
            }
        }


        throw new Error(
            message
        );
    }


    return data;
}


// ======================================================
// TONG QUAN
// GET /api/ThongKe/tong-quan
// ======================================================

async function taiTongQuan() {

    try {

        console.log(
            "Dang tai tong quan..."
        );


        const data =
            await apiGet(
                `${API_BASE_URL}/ThongKe/tong-quan`
            );


        console.log(
            "Tong quan:",
            data
        );


        tongQuanData =
            data;


        hienThiTongQuan(
            data
        );


    } catch (error) {

        console.error(
            "Loi tong quan:",
            error
        );


        tongDoanhThu.textContent =
            "-";

        tongDonHang.textContent =
            "-";

        tongKhachHang.textContent =
            "-";

        tongCuaHang.textContent =
            "-";


        hienThiLoi(
            `Không tải được thống kê tổng quan: ${error.message}`
        );
    }
}


// ======================================================
// DOANH THU
// GET /api/ThongKe/doanh-thu
// ======================================================

async function taiDoanhThu() {

    if (doanhThuTableBody) {

        doanhThuTableBody.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="thong-ke-empty"
                >
                    Đang tải dữ liệu...
                </td>
            </tr>
        `;
    }


    if (revenueChart) {

        revenueChart.innerHTML = `
            <div class="thong-ke-empty">
                Đang tải dữ liệu...
            </div>
        `;
    }


    try {

        console.log(
            "Dang tai doanh thu..."
        );


        const data =
            await apiGet(
                `${API_BASE_URL}/ThongKe/doanh-thu`
            );


        console.log(
            "Doanh thu:",
            data
        );


        doanhThuData =
            layMangDuLieu(data);


        hienThiBangDoanhThu(
            doanhThuData
        );


        hienThiBieuDoDoanhThu(
            doanhThuData
        );


    } catch (error) {

        console.error(
            "Loi doanh thu:",
            error
        );


        if (doanhThuTableBody) {

            doanhThuTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="3"
                        class="thong-ke-empty"
                    >
                        Không tải được dữ liệu doanh thu.
                    </td>
                </tr>
            `;
        }


        if (revenueChart) {

            revenueChart.innerHTML = `
                <div class="thong-ke-empty">
                    Không tải được dữ liệu doanh thu.
                </div>
            `;
        }


        hienThiLoi(
            `Không tải được doanh thu: ${error.message}`
        );
    }
}


// ======================================================
// TOP MON
// GET /api/ThongKe/top-mon-an
// ======================================================

async function taiTopMon() {

    if (topMonTableBody) {

        topMonTableBody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="thong-ke-empty"
                >
                    Đang tải dữ liệu...
                </td>
            </tr>
        `;
    }


    if (topMonListTongQuan) {

        topMonListTongQuan.innerHTML = `
            <div class="thong-ke-empty">
                Đang tải dữ liệu...
            </div>
        `;
    }


    try {

        console.log(
            "Dang tai top mon..."
        );


        const data =
            await apiGet(
                `${API_BASE_URL}/ThongKe/top-mon-an`
            );


        console.log(
            "Top mon:",
            data
        );


        topMonData =
            layMangDuLieu(data);


        hienThiBangTopMon(
            topMonData
        );


        hienThiTopMonTongQuan(
            topMonData
        );


    } catch (error) {

        console.error(
            "Loi top mon:",
            error
        );


        if (topMonTableBody) {

            topMonTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="thong-ke-empty"
                    >
                        Không tải được dữ liệu top món.
                    </td>
                </tr>
            `;
        }


        if (topMonListTongQuan) {

            topMonListTongQuan.innerHTML = `
                <div class="thong-ke-empty">
                    Không tải được dữ liệu top món.
                </div>
            `;
        }


        hienThiLoi(
            `Không tải được top món: ${error.message}`
        );
    }
}


// ======================================================
// HIEN THI TONG QUAN
// ======================================================

function hienThiTongQuan(data) {

    const tongQuan =
        data?.data ??
        data?.Data ??
        data;

    if (!tongQuan) {
        return;
    }

    const doanhThu =
        docGiaTri(
            tongQuan,
            [
                "tongDoanhThu",
                "TongDoanhThu",
                "doanhThu",
                "DoanhThu"
            ]
        );

    const donHang =
        docGiaTri(
            tongQuan,
            [
                "tongSoDonHang",
                "TongSoDonHang",
                "tongDonHang",
                "TongDonHang",
                "soDonHang",
                "SoDonHang"
            ]
        );

    const khachHang =
        docGiaTri(
            tongQuan,
            [
                "tongSoKhachHang",
                "TongSoKhachHang",
                "tongKhachHang",
                "TongKhachHang",
                "soKhachHang",
                "SoKhachHang"
            ]
        );

    const cuaHang =
        docGiaTri(
            tongQuan,
            [
                "tongSoCuaHang",
                "TongSoCuaHang",
                "tongCuaHang",
                "TongCuaHang",
                "soCuaHang",
                "SoCuaHang"
            ]
        );

    tongDoanhThu.textContent =
        formatMoney(doanhThu);

    tongDonHang.textContent =
        formatNumber(donHang);

    tongKhachHang.textContent =
        formatNumber(khachHang);

    tongCuaHang.textContent =
        formatNumber(cuaHang);
}


// ======================================================
// BANG DOANH THU
// ======================================================

function hienThiBangDoanhThu(data) {

    if (!doanhThuTableBody) {

        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        doanhThuTableBody.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="thong-ke-empty"
                >
                    Chưa có dữ liệu doanh thu.
                </td>
            </tr>
        `;

        return;
    }


    doanhThuTableBody.innerHTML =
        data
            .map(
                function (item, index) {

                    const thoiGian =
                        docGiaTri(
                            item,
                            [
                                "ngay",
                                "Ngay",
                                "thoiGian",
                                "ThoiGian",
                                "date",
                                "Date",
                                "label",
                                "Label",
                                "ky",
                                "Ky"
                            ]
                        );


                    const doanhThu =
                        docGiaTri(
                            item,
                            [
                                "doanhThu",
                                "DoanhThu",
                                "revenue",
                                "Revenue",
                                "tongDoanhThu",
                                "TongDoanhThu"
                            ]
                        );


                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHtml(
                                    thoiGian ?? "-"
                                )}
                            </td>

                            <td>
                                ${formatMoney(
                                    doanhThu
                                )}
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


// ======================================================
// BIEU DO DOANH THU
// ======================================================

function hienThiBieuDoDoanhThu(data) {

    if (!revenueChart) {

        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        revenueChart.innerHTML = `
            <div class="thong-ke-empty">
                Chưa có dữ liệu doanh thu.
            </div>
        `;

        return;
    }


    const items =
        data.slice(-12);


    const values =
        items.map(
            function (item) {

                return Number(
                    docGiaTri(
                        item,
                        [
                            "doanhThu",
                            "DoanhThu",
                            "revenue",
                            "Revenue",
                            "tongDoanhThu",
                            "TongDoanhThu"
                        ]
                    )
                ) || 0;
            }
        );


    const max =
        Math.max(
            ...values,
            1
        );


    revenueChart.innerHTML =
        items
            .map(
                function (item, index) {

                    const thoiGian =
                        docGiaTri(
                            item,
                            [
                                "ngay",
                                "Ngay",
                                "thoiGian",
                                "ThoiGian",
                                "date",
                                "Date",
                                "label",
                                "Label",
                                "ky",
                                "Ky"
                            ]
                        );


                    const value =
                        values[index];


                    const percent =
                        Math.max(
                            3,
                            (value / max) * 100
                        );


                    return `
                        <div
                            class="revenue-column"
                            title="${escapeHtml(
                                thoiGian ?? ""
                            )}"
                        >

                            <div class="revenue-value">
                                ${formatCompactMoney(
                                    value
                                )}
                            </div>


                            <div class="revenue-bar-wrap">

                                <div
                                    class="revenue-bar"
                                    style="height:${percent}%"
                                ></div>

                            </div>


                            <div class="revenue-label">
                                ${escapeHtml(
                                    thoiGian ?? "-"
                                )}
                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


// ======================================================
// BANG TOP MON
// ======================================================

function hienThiBangTopMon(data) {

    if (!topMonTableBody) {

        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        topMonTableBody.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="thong-ke-empty"
                >
                    Chưa có dữ liệu top món.
                </td>
            </tr>
        `;

        return;
    }


    topMonTableBody.innerHTML =
        data
            .map(
                function (item, index) {

                    const tenMon =
                        docGiaTri(
                            item,
                            [
                                "tenMonAn",
                                "TenMonAn",
                                "monAn",
                                "MonAn",
                                "tenMon",
                                "TenMon",
                                "name",
                                "Name"
                            ]
                        ) ?? "-";


                    const soLuong =
                        docGiaTri(
                            item,
                            [
                                "tongSoLuongBan",
                                "TongSoLuongBan",
                                "soLuongBan",
                                "SoLuongBan",
                                "soLuong",
                                "SoLuong",
                                "quantity",
                                "Quantity"
                            ]
                        ) ?? 0;


                    const doanhThu =
                        docGiaTri(
                            item,
                            [
                                "tongDoanhThu",
                                "TongDoanhThu",
                                "doanhThu",
                                "DoanhThu",
                                "revenue",
                                "Revenue"
                            ]
                        ) ?? 0;


                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        tenMon
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${formatNumber(
                                    soLuong
                                )}
                            </td>

                            <td>
                                ${formatMoney(
                                    doanhThu
                                )}
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


// ======================================================
// TOP MON TONG QUAN
// ======================================================

function hienThiTopMonTongQuan(data) {

    if (!topMonListTongQuan) {

        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        topMonListTongQuan.innerHTML = `
            <div class="thong-ke-empty">
                Chưa có dữ liệu.
            </div>
        `;

        return;
    }


    topMonListTongQuan.innerHTML =
        data
            .slice(0, 5)
            .map(
                function (item, index) {

                    const tenMon =
                        docGiaTri(
                            item,
                            [
                                "tenMonAn",
                                "TenMonAn",
                                "monAn",
                                "MonAn",
                                "tenMon",
                                "TenMon",
                                "name",
                                "Name"
                            ]
                        ) ?? "-";


                    const soLuong =
                        docGiaTri(
                            item,
                            [
                                "tongSoLuongBan",
                                "TongSoLuongBan",
                                "soLuongBan",
                                "SoLuongBan",
                                "soLuong",
                                "SoLuong",
                                "quantity",
                                "Quantity"
                            ]
                        ) ?? 0;


                    return `
                        <div class="top-mon-item">

                            <div class="top-mon-rank">
                                ${index + 1}
                            </div>


                            <div class="top-mon-info">

                                <div class="top-mon-name">
                                    ${escapeHtml(
                                        tenMon
                                    )}
                                </div>


                                <div class="top-mon-sub">
                                    Đã bán:
                                    ${formatNumber(
                                        soLuong
                                    )}
                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


// ======================================================
// LAY MANG DU LIEU
// ======================================================

function layMangDuLieu(data) {

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


    if (Array.isArray(data?.result)) {

        return data.result;
    }


    if (Array.isArray(data?.Result)) {

        return data.Result;
    }


    return [];
}


// ======================================================
// DOC GIA TRI
// ======================================================

function docGiaTri(
    object,
    keys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return null;
    }


    for (
        const key of keys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];
        }
    }


    return null;
}


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(
            Number(value)
        )
    ) {

        return "-";
    }


    return Number(value)
        .toLocaleString(
            "vi-VN"
        ) + " đ";
}


// ======================================================
// FORMAT MONEY COMPACT
// ======================================================

function formatCompactMoney(value) {

    const number =
        Number(value) || 0;


    if (
        number >= 1000000000
    ) {

        return (
            number / 1000000000
        ).toFixed(1) + "B";
    }


    if (
        number >= 1000000
    ) {

        return (
            number / 1000000
        ).toFixed(1) + "M";
    }


    if (
        number >= 1000
    ) {

        return (
            number / 1000
        ).toFixed(0) + "K";
    }


    return number.toLocaleString(
        "vi-VN"
    );
}


// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return String(value);
    }


    return number.toLocaleString(
        "vi-VN"
    );
}


// ======================================================
// HIEN THI LOI
// ======================================================

function hienThiLoi(message) {

    if (!thongKeError) {

        return;
    }


    thongKeError.textContent =
        message;


    thongKeError.style.display =
        "block";
}


// ======================================================
// AN LOI
// ======================================================

function anLoi() {

    if (!thongKeError) {

        return;
    }


    thongKeError.textContent =
        "";


    thongKeError.style.display =
        "none";
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


// ======================================================
// DANG XUAT
// ======================================================

function dangXuat() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "../dang-nhap.html";
}