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
// HEADERS
// ======================================================

function getHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
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
    async () => {

        ganSuKienTabs();

        document
            .getElementById("btnTaiDoanhThu")
            ?.addEventListener(
                "click",
                taiDoanhThu
            );

        document
            .getElementById("btnTaiTopMon")
            ?.addEventListener(
                "click",
                taiTopMon
            );

        document
            .querySelector(".admin-logout")
            ?.addEventListener(
                "click",
                dangXuat
            );


        await taiTatCa();
    }
);


// ======================================================
// TAB
// ======================================================

function ganSuKienTabs() {

    document
        .querySelectorAll(".thong-ke-tab")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const tab =
                            button.dataset.tab;

                        moTab(tab);
                    }
                );
            }
        );
}


function moTab(tab) {

    document
        .querySelectorAll(".thong-ke-tab")
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.tab === tab
                );
            }
        );


    tabTongQuan.style.display =
        tab === "tong-quan"
            ? "block"
            : "none";


    tabDoanhThu.style.display =
        tab === "doanh-thu"
            ? "block"
            : "none";


    tabTopMon.style.display =
        tab === "top-mon"
            ? "block"
            : "none";
}


// ======================================================
// LOAD ALL
// ======================================================

async function taiTatCa() {

    anLoi();

    await Promise.all([
        taiTongQuan(),
        taiDoanhThu(),
        taiTopMon()
    ]);
}


// ======================================================
// GET TONG QUAN
// GET /api/ThongKe/tong-quan
// ======================================================

async function taiTongQuan() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/ThongKe/tong-quan`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        console.log(
            "GET /ThongKe/tong-quan ->",
            response.status
        );


        await xuLyAuth(response);


        if (!response.ok) {

            throw new Error(
                `Tong quan: HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Tong quan:",
            data
        );


        tongQuanData = data;

        hienThiTongQuan(
            data
        );

    } catch (error) {

        console.error(
            "Loi tong quan:",
            error
        );

        hienThiLoi(
            `Không tải được thống kê tổng quan: ${error.message}`
        );
    }
}


// ======================================================
// GET DOANH THU
// GET /api/ThongKe/doanh-thu
// ======================================================

async function taiDoanhThu() {

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


    revenueChart.innerHTML = `
        <div class="thong-ke-empty">
            Đang tải dữ liệu...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/ThongKe/doanh-thu`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        console.log(
            "GET /ThongKe/doanh-thu ->",
            response.status
        );


        await xuLyAuth(response);


        if (!response.ok) {

            const errorText =
                await response
                    .text()
                    .catch(
                        () => ""
                    );

            throw new Error(
                `Doanh thu: HTTP ${response.status} ${errorText}`
            );
        }


        const data =
            await response.json();


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


        revenueChart.innerHTML = `
            <div class="thong-ke-empty">
                Không tải được dữ liệu doanh thu.
            </div>
        `;


        hienThiLoi(
            error.message
        );
    }
}


// ======================================================
// GET TOP MON
// GET /api/ThongKe/top-mon-an
// ======================================================

async function taiTopMon() {

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


    topMonListTongQuan.innerHTML = `
        <div class="thong-ke-empty">
            Đang tải dữ liệu...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/ThongKe/top-mon-an`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        console.log(
            "GET /ThongKe/top-mon-an ->",
            response.status
        );


        await xuLyAuth(response);


        if (!response.ok) {

            const errorText =
                await response
                    .text()
                    .catch(
                        () => ""
                    );

            throw new Error(
                `Top món: HTTP ${response.status} ${errorText}`
            );
        }


        const data =
            await response.json();


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


        topMonListTongQuan.innerHTML = `
            <div class="thong-ke-empty">
                Không tải được dữ liệu top món.
            </div>
        `;


        hienThiLoi(
            error.message
        );
    }
}


// ======================================================
// HIEN THI TONG QUAN
// ======================================================

function hienThiTongQuan(data) {

    const tongQuan =
        data?.data ??
        data;


    const doanhThu =
        docGiaTri(
            tongQuan,
            [
                "tongDoanhThu",
                "TongDoanhThu",
                "doanhThu",
                "DoanhThu",
                "totalRevenue",
                "TotalRevenue"
            ]
        );


    const donHang =
        docGiaTri(
            tongQuan,
            [
                "tongDonHang",
                "TongDonHang",
                "soDonHang",
                "SoDonHang",
                "totalOrders",
                "TotalOrders"
            ]
        );


    const khachHang =
        docGiaTri(
            tongQuan,
            [
                "tongKhachHang",
                "TongKhachHang",
                "soKhachHang",
                "SoKhachHang",
                "totalCustomers",
                "TotalCustomers"
            ]
        );


    const cuaHang =
        docGiaTri(
            tongQuan,
            [
                "tongCuaHang",
                "TongCuaHang",
                "soCuaHang",
                "SoCuaHang",
                "totalStores",
                "TotalStores"
            ]
        );


    tongDoanhThu.textContent =
        formatMoney(
            doanhThu
        );


    tongDonHang.textContent =
        formatNumber(
            donHang
        );


    tongKhachHang.textContent =
        formatNumber(
            khachHang
        );


    tongCuaHang.textContent =
        formatNumber(
            cuaHang
        );
}


// ======================================================
// BANG DOANH THU
// ======================================================

function hienThiBangDoanhThu(
    data
) {

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
                (item, index) => {

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
// BIEU DO
// ======================================================

function hienThiBieuDoDoanhThu(
    data
) {

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
        data.slice(
            -12
        );


    const values =
        items.map(
            item =>
                Number(
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
                ) || 0
        );


    const max =
        Math.max(
            ...values,
            1
        );


    revenueChart.innerHTML =
        items
            .map(
                (item, index) => {

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

function hienThiBangTopMon(
    data
) {

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
                (item, index) => {

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
                        );


                    const soLuong =
                        docGiaTri(
                            item,
                            [
                                "soLuong",
                                "SoLuong",
                                "soLuongBan",
                                "SoLuongBan",
                                "quantity",
                                "Quantity"
                            ]
                        );


                    const doanhThu =
                        docGiaTri(
                            item,
                            [
                                "doanhThu",
                                "DoanhThu",
                                "revenue",
                                "Revenue"
                            ]
                        );


                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        tenMon ?? "-"
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

function hienThiTopMonTongQuan(
    data
) {

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
            .slice(
                0,
                5
            )
            .map(
                (item, index) => {

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
                        );


                    const soLuong =
                        docGiaTri(
                            item,
                            [
                                "soLuong",
                                "SoLuong",
                                "soLuongBan",
                                "SoLuongBan",
                                "quantity",
                                "Quantity"
                            ]
                        );


                    return `
                        <div class="top-mon-item">

                            <div class="top-mon-rank">
                                ${index + 1}
                            </div>

                            <div class="top-mon-info">

                                <div class="top-mon-name">
                                    ${escapeHtml(
                                        tenMon ?? "-"
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
// LAY ARRAY
// ======================================================

function layMangDuLieu(
    data
) {

    if (
        Array.isArray(data)
    ) {
        return data;
    }


    if (
        Array.isArray(data?.data)
    ) {
        return data.data;
    }


    if (
        Array.isArray(data?.items)
    ) {
        return data.items;
    }


    if (
        Array.isArray(data?.result)
    ) {
        return data.result;
    }


    if (
        Array.isArray(data?.Data)
    ) {
        return data.Data;
    }


    if (
        Array.isArray(data?.Items)
    ) {
        return data.Items;
    }


    if (
        Array.isArray(data?.Result)
    ) {
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
// AUTH
// ======================================================

async function xuLyAuth(
    response
) {

    if (
        response.status === 401
    ) {

        alert(
            "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
        );

        dangXuat();

        throw new Error(
            "401 Unauthorized"
        );
    }


    if (
        response.status === 403
    ) {

        throw new Error(
            "Tài khoản không có quyền xem thống kê."
        );
    }
}


// ======================================================
// FORMAT
// ======================================================

function formatMoney(
    value
) {

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


function formatCompactMoney(
    value
) {

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


function formatNumber(
    value
) {

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
// ERROR
// ======================================================

function hienThiLoi(
    message
) {

    if (!thongKeError) {
        return;
    }


    thongKeError.textContent =
        message;


    thongKeError.style.display =
        "block";
}


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
// ESCAPE
// ======================================================

function escapeHtml(
    value
) {

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
// LOGOUT
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