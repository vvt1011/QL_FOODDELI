const API_BASE_URL =
    "https://localhost:7135/api";


let danhSachDonHang = [];

let currentTab = "all";


// =====================================================
// DOM
// =====================================================

const ordersContent =
    document.getElementById(
        "ordersContent"
    );


const ordersLoginState =
    document.getElementById(
        "ordersLoginState"
    );


const ordersLoadingState =
    document.getElementById(
        "ordersLoadingState"
    );


const ordersErrorState =
    document.getElementById(
        "ordersErrorState"
    );


const ordersEmptyState =
    document.getElementById(
        "ordersEmptyState"
    );


const ordersErrorMessage =
    document.getElementById(
        "ordersErrorMessage"
    );


const btnRefreshOrders =
    document.getElementById(
        "btnRefreshOrders"
    );


const btnRetryOrders =
    document.getElementById(
        "btnRetryOrders"
    );


const orderDetailModal =
    document.getElementById(
        "orderDetailModal"
    );


const orderDetailBody =
    document.getElementById(
        "orderDetailBody"
    );


const orderDetailTitle =
    document.getElementById(
        "orderDetailTitle"
    );


const btnCloseOrderModal =
    document.getElementById(
        "btnCloseOrderModal"
    );


const orderTabs =
    document.querySelectorAll(
        ".orders-tab"
    );



// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ganSuKien();

        khoiTaoDonHang();

    }
);



// =====================================================
// EVENTS
// =====================================================

function ganSuKien() {


    // TAB

    orderTabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    orderTabs.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    currentTab =
                        tab.dataset.tab ||
                        "all";


                    renderDanhSachDonHang();

                }
            );

        }
    );



    // LÀM MỚI

    btnRefreshOrders?.addEventListener(
        "click",
        taiDanhSachDonHang
    );



    // THỬ LẠI

    btnRetryOrders?.addEventListener(
        "click",
        taiDanhSachDonHang
    );



    // ĐÓNG MODAL

    btnCloseOrderModal?.addEventListener(
        "click",
        dongModalChiTiet
    );



    document
        .querySelector(
            "[data-close-order-modal]"
        )
        ?.addEventListener(
            "click",
            dongModalChiTiet
        );



    // ESC

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                orderDetailModal &&
                !orderDetailModal.hidden
            ) {

                dongModalChiTiet();

            }

        }
    );

}



// =====================================================
// KHOI TAO
// =====================================================

function khoiTaoDonHang() {

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

        hienThiLoginState();

        return;

    }


    taiDanhSachDonHang();

}



// =====================================================
// GET DON HANG CUA TOI
// GET /api/DonHang/user
// =====================================================

async function taiDanhSachDonHang() {

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

        hienThiLoginState();

        return;

    }


    hienThiLoading();


    try {

        const data =
            await apiRequest(
                `${API_BASE_URL}/DonHang/user`
            );


        danhSachDonHang =
            layMangDuLieu(
                data
            );


        console.log(
            "Danh sách đơn hàng của tôi:",
            danhSachDonHang
        );


        renderDanhSachDonHang();


    }
    catch (error) {

        console.error(
            "Lỗi tải đơn hàng:",
            error
        );


        if (
            error.code ===
            "UNAUTHORIZED"
        ) {

            hienThiLoginState();

            return;

        }


        hienThiLoi(
            error.message ||
            "Không thể tải danh sách đơn hàng."
        );

    }

}



// =====================================================
// API REQUEST
// =====================================================

async function apiRequest(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        const error =
            new Error(
                "Bạn cần đăng nhập để sử dụng chức năng này."
            );


        error.code =
            "UNAUTHORIZED";


        throw error;

    }



    const headers = {

        "Accept":
            "application/json",

        ...(options.headers || {})

    };



    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";

    }



    headers["Authorization"] =
        `Bearer ${token}`;



    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );



    let data = null;



    const contentType =
        response.headers.get(
            "content-type"
        ) || "";



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



    // TOKEN HẾT HẠN

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


        const error =
            new Error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );


        error.code =
            "UNAUTHORIZED";


        throw error;

    }



    // API ERROR

    if (!response.ok) {

        const message =
            data?.message ||
            (
                typeof data === "string" &&
                data.trim()
                    ? data
                    : `HTTP ${response.status}`
            );


        throw new Error(
            message
        );

    }


    return data;

}



// =====================================================
// RENDER DANH SACH
// =====================================================

function renderDanhSachDonHang() {

    const donHangLoc =
        danhSachDonHang.filter(
            donHang =>

                currentTab === "all" ||

                layTrangThaiDonHang(
                    donHang
                ) === currentTab
        );



    if (
        danhSachDonHang.length === 0
    ) {

        hienThiEmpty();

        return;

    }



    if (
        donHangLoc.length === 0
    ) {

        hienThiEmpty();

        return;

    }



    ordersLoginState.hidden =
        true;


    ordersLoadingState.hidden =
        true;


    ordersErrorState.hidden =
        true;


    ordersEmptyState.hidden =
        true;


    ordersContent.hidden =
        false;



    ordersContent.innerHTML =

        donHangLoc

            .map(
                donHang =>
                    renderOrderCard(
                        donHang
                    )
            )

            .join("");

}



// =====================================================
// ORDER CARD
// =====================================================

function renderOrderCard(
    donHang
) {

    const maDonHang =
        layGiaTri(
            donHang,
            [
                "maDonHang",
                "MaDonHang"
            ]
        ) || "-";



    const ngayDat =
        layGiaTri(
            donHang,
            [
                "ngayDat",
                "NgayDat"
            ]
        );



    const thanhTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "thanhTien",
                    "ThanhTien",
                    "tongTien",
                    "TongTien"
                ]
            ) || 0
        );



    const statusInfo =
        layThongTinTrangThai(
            donHang
        );



    const tenCuaHang =
        layGiaTri(
            donHang,
            [
                "tenCuaHang",
                "TenCuaHang"
            ]
        ) ||

        layGiaTri(
            donHang?.cuaHang,
            [
                "tenCuaHang",
                "TenCuaHang"
            ]
        ) ||

        "Đơn hàng FoodDeli";



    const items =
        layChiTiet(
            donHang
        );



    const itemSummary =
        taoTomTatMon(
            items
        );



    return `

        <article class="order-card">

            <div class="order-card-top">

                <div class="order-card-heading">

                    <div class="order-code-label">
                        Mã đơn hàng
                    </div>

                    <h2>
                        ${
                            escapeHtml(
                                String(
                                    maDonHang
                                )
                            )
                        }
                    </h2>

                </div>


                <span
                    class="order-status ${statusInfo.className}"
                >
                    ${statusInfo.label}
                </span>

            </div>


            <div class="order-card-meta">

                <span>
                    🏪
                    ${
                        escapeHtml(
                            String(
                                tenCuaHang
                            )
                        )
                    }
                </span>


                <span>
                    🕒
                    ${
                        escapeHtml(
                            formatDate(
                                ngayDat
                            )
                        )
                    }
                </span>

            </div>


            <div class="order-card-summary">

                <div>

                    <div class="order-summary-title">
                        Món ăn
                    </div>

                    <p>
                        ${
                            escapeHtml(
                                itemSummary
                            )
                        }
                    </p>

                </div>


                <div class="order-total-wrap">

                    <span>
                        Tổng tiền
                    </span>

                    <strong>
                        ${
                            formatMoney(
                                thanhTien
                            )
                        }
                    </strong>

                </div>

            </div>


            <div class="order-card-footer">

                <button
                    type="button"
                    class="order-detail-btn"
                    data-order-id="${
                        escapeAttribute(
                            String(
                                maDonHang
                            )
                        )
                    }"
                >
                    Xem chi tiết
                </button>

            </div>

        </article>

    `;

}



// =====================================================
// CLICK XEM CHI TIET
// =====================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".order-detail-btn"
            );


        if (!button) {
            return;
        }



        const maDonHang =
            button.dataset.orderId;



        if (!maDonHang) {

            alert(
                "Không xác định được mã đơn hàng."
            );


            return;

        }



        moChiTietDonHang(
            maDonHang
        );

    }
);



// =====================================================
// CHI TIET DON HANG
// GET /api/DonHang/{id}
// GET /api/DonHang/{id}/lich-su-trang-thai
// =====================================================

async function moChiTietDonHang(
    maDonHang
) {

    if (
        !orderDetailModal ||
        !orderDetailBody
    ) {

        console.error(
            "Không tìm thấy modal chi tiết đơn hàng."
        );

        return;

    }


    orderDetailModal.hidden =
        false;


    document.body.classList.add(
        "order-modal-open"
    );



    if (orderDetailTitle) {

        orderDetailTitle.textContent =
            `Đơn hàng ${maDonHang}`;

    }



    orderDetailBody.innerHTML = `

        <div class="orders-detail-loading">

            <div class="orders-spinner"></div>

            Đang tải chi tiết đơn hàng...

        </div>

    `;



    try {

        const [
            donHang,
            lichSu
        ] =

            await Promise.all([

                apiRequest(
                    `${API_BASE_URL}/DonHang/${encodeURIComponent(maDonHang)}`
                ),

                apiRequest(
                    `${API_BASE_URL}/DonHang/${encodeURIComponent(maDonHang)}/lich-su-trang-thai`
                )

            ]);



        console.log(
            "Chi tiết đơn hàng:",
            donHang
        );


        console.log(
            "Lịch sử trạng thái:",
            lichSu
        );



        const detail =
            donHang?.data ||
            donHang;



        const history =
            layMangDuLieu(
                lichSu
            );



        console.log(
            "Lịch sử sau khi xử lý:",
            history
        );



        hienThiChiTietDonHang(
            detail,
            history
        );


    }
    catch (error) {

        console.error(
            "Lỗi tải chi tiết đơn hàng:",
            error
        );



        if (
            error.code ===
            "UNAUTHORIZED"
        ) {

            dongModalChiTiet();

            hienThiLoginState();

            return;

        }



        orderDetailBody.innerHTML = `

            <div class="orders-detail-error">

                <div class="orders-state-icon">
                    ⚠️
                </div>

                <h3>
                    Không thể tải chi tiết
                </h3>

                <p>
                    ${
                        escapeHtml(
                            error.message ||
                            "Đã xảy ra lỗi."
                        )
                    }
                </p>

            </div>

        `;

    }

}



// =====================================================
// HIEN THI CHI TIET
// =====================================================

function hienThiChiTietDonHang(
    donHang,
    history
) {

    const maDonHang =
        layGiaTri(
            donHang,
            [
                "maDonHang",
                "MaDonHang"
            ]
        ) || "-";



    const maDiaChi =
        layGiaTri(
            donHang,
            [
                "maDiaChi",
                "MaDiaChi"
            ]
        ) || "-";



    const ngayDat =
        layGiaTri(
            donHang,
            [
                "ngayDat",
                "NgayDat"
            ]
        );



    const ghiChu =
        layGiaTri(
            donHang,
            [
                "ghiChu",
                "GhiChu"
            ]
        );



    const tongTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "tongTien",
                    "TongTien"
                ]
            ) || 0
        );



    const phiGiaoHang =
        Number(
            layGiaTri(
                donHang,
                [
                    "phiGiaoHang",
                    "PhiGiaoHang"
                ]
            ) || 0
        );



    const giamGia =
        Number(
            layGiaTri(
                donHang,
                [
                    "giamGia",
                    "GiamGia"
                ]
            ) || 0
        );



    const thanhTien =
        Number(
            layGiaTri(
                donHang,
                [
                    "thanhTien",
                    "ThanhTien"
                ]
            ) || 0
        );



    const statusInfo =
        layThongTinTrangThai(
            donHang
        );



    const items =
        layChiTiet(
            donHang
        );



    const historyHtml =
        renderLichSu(
            history
        );



    orderDetailBody.innerHTML = `

        <!-- TONG QUAN -->

        <div class="order-detail-overview">

            <div class="order-detail-main-info">

                <div class="order-detail-label">
                    Trạng thái hiện tại
                </div>


                <span
                    class="order-status ${statusInfo.className}"
                >
                    ${statusInfo.label}
                </span>

            </div>


            <div class="order-detail-grid">

                <div>

                    <span>
                        Mã đơn
                    </span>

                    <strong>
                        ${
                            escapeHtml(
                                String(
                                    maDonHang
                                )
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Ngày đặt
                    </span>

                    <strong>
                        ${
                            escapeHtml(
                                formatDate(
                                    ngayDat
                                )
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Mã địa chỉ
                    </span>

                    <strong>
                        ${
                            escapeHtml(
                                String(
                                    maDiaChi
                                )
                            )
                        }
                    </strong>

                </div>

            </div>

        </div>



        <!-- MON AN -->

        <section class="order-detail-section">

            <div class="order-detail-section-heading">

                <h3>
                    Món ăn
                </h3>

                <span>
                    ${items.length} món
                </span>

            </div>


            <div class="order-detail-items">

                ${
                    items.length

                        ? items
                            .map(
                                renderDetailItem
                            )
                            .join("")

                        : `

                            <div class="order-detail-empty">
                                Không có dữ liệu chi tiết món ăn từ API.
                            </div>

                        `
                }

            </div>

        </section>



        <!-- THANH TOAN -->

        <section class="order-detail-section">

            <div class="order-detail-section-heading">

                <h3>
                    Tóm tắt thanh toán
                </h3>

            </div>


            <div class="order-detail-money">

                <div>

                    <span>
                        Tạm tính
                    </span>

                    <strong>
                        ${
                            formatMoney(
                                tongTien
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Phí giao hàng
                    </span>

                    <strong>
                        ${
                            formatMoney(
                                phiGiaoHang
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Giảm giá
                    </span>

                    <strong
                        class="order-money-discount"
                    >
                        -
                        ${
                            formatMoney(
                                Math.max(
                                    0,
                                    giamGia
                                )
                            )
                        }
                    </strong>

                </div>


                <div
                    class="order-detail-money-total"
                >

                    <span>
                        Thành tiền
                    </span>

                    <strong>
                        ${
                            formatMoney(
                                thanhTien
                            )
                        }
                    </strong>

                </div>

            </div>

        </section>



        <!-- LICHSU -->

        <section class="order-detail-section">

            <div class="order-detail-section-heading">

                <h3>
                    Lịch sử trạng thái
                </h3>

                <span>
                    ${history.length} lần cập nhật
                </span>

            </div>


            <div class="order-timeline">

                ${historyHtml}

            </div>

        </section>



        <!-- GHI CHU -->

        ${
            ghiChu

                ? `

                    <section class="order-detail-note">

                        <strong>
                            Ghi chú
                        </strong>

                        <p>
                            ${
                                escapeHtml(
                                    String(
                                        ghiChu
                                    )
                                )
                            }
                        </p>

                    </section>

                `

                : ""
        }

    `;

}



// =====================================================
// CHI TIET MON
// =====================================================

function renderDetailItem(
    item
) {

    const tenMon =
        layGiaTri(
            item,
            [
                "tenMonAn",
                "TenMonAn"
            ]
        ) || "Món ăn";



    const soLuong =
        Number(
            layGiaTri(
                item,
                [
                    "soLuong",
                    "SoLuong"
                ]
            ) || 0
        );



    const donGia =
        Number(
            layGiaTri(
                item,
                [
                    "donGia",
                    "DonGia"
                ]
            ) || 0
        );



    const thanhTien =
        Number(
            layGiaTri(
                item,
                [
                    "thanhTien",
                    "ThanhTien"
                ]
            ) || 0
        );



    const anhMonAn =
        layGiaTri(
            item,
            [
                "anhMonAn",
                "AnhMonAn"
            ]
        );



    const imageSrc =
        anhMonAn
            ? escapeAttribute(
                String(
                    anhMonAn
                )
            )
            : "";



    return `

        <div class="order-detail-item">

            <div class="order-detail-item-image">

                ${
                    imageSrc

                        ? `

                            <img
                                src="${imageSrc}"
                                alt="${escapeAttribute(
                                    String(
                                        tenMon
                                    )
                                )}"
                                loading="lazy"
                            >

                        `

                        : `

                            <div class="order-detail-item-placeholder">
                                🍔
                            </div>

                        `
                }

            </div>


            <div class="order-detail-item-info">

                <h4>
                    ${
                        escapeHtml(
                            String(
                                tenMon
                            )
                        )
                    }
                </h4>


                <p>
                    ${soLuong}
                    ×
                    ${formatMoney(
                        donGia
                    )}
                </p>

            </div>


            <strong
                class="order-detail-item-total"
            >
                ${
                    formatMoney(
                        thanhTien
                    )
                }
            </strong>

        </div>

    `;

}



// =====================================================
// LỊCH SỬ TRẠNG THÁI
// =====================================================

function renderLichSu(
    history
) {

    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        return `

            <div class="order-detail-empty">

                Chưa có lịch sử trạng thái.

            </div>

        `;

    }



    return history
        .map(
            (
                item,
                index
            ) => {


                const rawStatus =
                    layGiaTri(
                        item,
                        [
                            "trangThaiMoi",
                            "TrangThaiMoi",
                            "trangThai",
                            "TrangThai",
                            "status",
                            "Status"
                        ]
                    );



                const status =
                    layTenTrangThai(
                        rawStatus
                    );



                const time =
                    layGiaTri(
                        item,
                        [
                            "thoiGian",
                            "ThoiGian",
                            "ngayTao",
                            "NgayTao",
                            "ngayCapNhat",
                            "NgayCapNhat"
                        ]
                    );



                const note =
                    layGiaTri(
                        item,
                        [
                            "ghiChu",
                            "GhiChu",
                            "moTa",
                            "MoTa"
                        ]
                    );



                return `

                    <div
                        class="order-timeline-item ${
                            index ===
                            history.length - 1
                                ? "current"
                                : ""
                        }"
                    >

                        <span
                            class="order-timeline-dot"
                        ></span>


                        <div
                            class="order-timeline-content"
                        >

                            <strong>
                                ${
                                    escapeHtml(
                                        String(
                                            status
                                        )
                                    )
                                }
                            </strong>


                            <span>
                                ${
                                    escapeHtml(
                                        formatDate(
                                            time
                                        )
                                    )
                                }
                            </span>


                            ${
                                note

                                    ? `

                                        <p>
                                            ${
                                                escapeHtml(
                                                    String(
                                                        note
                                                    )
                                                )
                                            }
                                        </p>

                                    `

                                    : ""
                            }

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}



// =====================================================
// ĐỔI MÃ TRẠNG THÁI → TÊN TRẠNG THÁI
// =====================================================

function layTenTrangThai(
    value
) {

    const text =
        normalizeText(
            value
        );


    switch (text) {

        case "1":
            return "Chờ xác nhận";


        case "2":
            return "Đã xác nhận";


        case "3":
            return "Đang giao";


        case "4":
            return "Hoàn thành";


        case "5":
            return "Đã hủy";


        default:

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return "Cập nhật trạng thái";

            }


            return String(
                value
            );

    }

}



// =====================================================
// STATUS
// =====================================================

function layTrangThaiDonHang(
    donHang
) {

    const raw =
        layGiaTri(
            donHang,
            [
                "trangThai",
                "TrangThai"
            ]
        );


    const text =
        normalizeText(
            raw
        );


    // 1 - CHỜ XÁC NHẬN

    if (

        text === "1" ||

        text.includes(
            "cho xac nhan"
        ) ||

        text.includes(
            "cho duyet"
        ) ||

        text.includes(
            "moi dat"
        ) ||

        text === "new" ||

        text === "pending"

    ) {

        return "pending";

    }



    // 2 - ĐÃ XÁC NHẬN

    if (

        text === "2" ||

        text.includes(
            "da xac nhan"
        ) ||

        text === "confirmed"

    ) {

        return "confirmed";

    }



    // 3 - ĐANG GIAO

    if (

        text === "3" ||

        text.includes(
            "dang giao"
        ) ||

        text.includes(
            "dang van chuyen"
        ) ||

        text.includes(
            "van chuyen"
        ) ||

        text === "shipping" ||

        text === "delivering"

    ) {

        return "shipping";

    }



    // 4 - HOÀN THÀNH

    if (

        text === "4" ||

        text.includes(
            "hoan thanh"
        ) ||

        text.includes(
            "da giao"
        ) ||

        text === "completed" ||

        text === "complete" ||

        text === "delivered"

    ) {

        return "completed";

    }



    // 5 - ĐÃ HỦY

    if (

        text === "5" ||

        text.includes(
            "da huy"
        ) ||

        text === "huy" ||

        text.includes(
            "cancel"
        )

    ) {

        return "cancelled";

    }



    return "other";

}



// =====================================================
// LABEL STATUS
// =====================================================

function layThongTinTrangThai(
    donHang
) {

    const key =
        layTrangThaiDonHang(
            donHang
        );


    const mapping = {

        pending: {

            label:
                "Chờ xác nhận",

            className:
                "pending"

        },


        confirmed: {

            label:
                "Đã xác nhận",

            className:
                "shipping"

        },


        shipping: {

            label:
                "Đang giao",

            className:
                "shipping"

        },


        completed: {

            label:
                "Hoàn thành",

            className:
                "completed"

        },


        cancelled: {

            label:
                "Đã hủy",

            className:
                "cancelled"

        },


        other: {

            label:
                "Đang xử lý",

            className:
                "other"

        }

    };


    return (
        mapping[key] ||
        mapping.other
    );

}



// =====================================================
// LẤY CHI TIẾT
// =====================================================

function layChiTiet(
    donHang
) {

    const possible = [

        donHang?.chiTietDonHangs,

        donHang?.ChiTietDonHangs,

        donHang?.chiTietDonHang,

        donHang?.ChiTietDonHang,

        donHang?.items,

        donHang?.Items,

        donHang?.danhSachMon,

        donHang?.DanhSachMon

    ];



    for (
        const value of possible
    ) {

        if (
            Array.isArray(
                value
            )
        ) {

            return value;

        }

    }



    const listJson =
        layGiaTri(
            donHang,
            [
                "listjson_chitiet",
                "ListJsonChiTiet",
                "listJsonChiTiet",
                "listjsonChiTiet"
            ]
        );



    if (
        typeof listJson ===
        "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    listJson
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                return parsed;

            }

        }
        catch (error) {

            console.warn(
                "Không parse được listjson_chitiet:",
                error
            );

        }

    }



    return [];

}



// =====================================================
// TÓM TẮT MÓN
// =====================================================

function taoTomTatMon(
    items
) {

    if (
        !items.length
    ) {

        return (
            "Xem chi tiết để xem danh sách món ăn."
        );

    }



    const parts =
        items
            .slice(
                0,
                3
            )
            .map(
                item => {

                    const tenMon =
                        layGiaTri(
                            item,
                            [
                                "tenMonAn",
                                "TenMonAn"
                            ]
                        ) ||
                        "Món ăn";



                    const soLuong =
                        Number(
                            layGiaTri(
                                item,
                                [
                                    "soLuong",
                                    "SoLuong"
                                ]
                            ) || 0
                        );



                    return (
                        `${tenMon} x${soLuong}`
                    );

                }
            );



    if (
        items.length > 3
    ) {

        parts.push(
            `+ ${items.length - 3} món khác`
        );

    }



    return parts.join(
        ", "
    );

}



// =====================================================
// STATES
// =====================================================

function anTatCaTrangThai() {

    if (ordersLoginState) {

        ordersLoginState.hidden =
            true;

    }


    if (ordersLoadingState) {

        ordersLoadingState.hidden =
            true;

    }


    if (ordersErrorState) {

        ordersErrorState.hidden =
            true;

    }


    if (ordersEmptyState) {

        ordersEmptyState.hidden =
            true;

    }


    if (ordersContent) {

        ordersContent.hidden =
            true;

    }

}



function hienThiLoginState() {

    anTatCaTrangThai();


    if (ordersLoginState) {

        ordersLoginState.hidden =
            false;

    }

}



function hienThiLoading() {

    anTatCaTrangThai();


    if (ordersLoadingState) {

        ordersLoadingState.hidden =
            false;

    }

}



function hienThiLoi(
    message
) {

    anTatCaTrangThai();


    if (ordersErrorState) {

        ordersErrorState.hidden =
            false;

    }


    if (ordersErrorMessage) {

        ordersErrorMessage.textContent =
            message ||
            "Đã xảy ra lỗi khi tải đơn hàng.";

    }

}



function hienThiEmpty() {

    anTatCaTrangThai();


    if (ordersEmptyState) {

        ordersEmptyState.hidden =
            false;

    }

}



// =====================================================
// MODAL
// =====================================================

function dongModalChiTiet() {

    if (!orderDetailModal) {
        return;
    }


    orderDetailModal.hidden =
        true;


    document.body.classList.remove(
        "order-modal-open"
    );

}



// =====================================================
// UTIL
// =====================================================

function layMangDuLieu(
    data
) {

    if (
        Array.isArray(data)
    ) {

        return data;

    }



    const keys = [

        "data",

        "items",

        "result",

        "Data",

        "Items",

        "Result",

        "donHangs",

        "DonHangs"

    ];



    for (
        const key of keys
    ) {

        if (
            Array.isArray(
                data?.[key]
            )
        ) {

            return data[key];

        }

    }



    return [];

}



// =====================================================
// GET VALUE
// =====================================================

function layGiaTri(
    object,
    keys
) {

    if (

        !object ||

        typeof object !==
            "object"

    ) {

        return null;

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

            return object[key];

        }

    }



    return null;

}



// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )

        .trim()

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}



// =====================================================
// MONEY
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



    return (

        number.toLocaleString(
            "vi-VN"
        ) +

        "đ"

    );

}



// =====================================================
// DATE
// =====================================================

function formatDate(
    value
) {

    if (!value) {

        return "Chưa cập nhật";

    }



    const date =
        new Date(
            value
        );



    if (

        Number.isNaN(
            date.getTime()
        )

    ) {

        return String(
            value
        );

    }



    return date.toLocaleString(
        "vi-VN"
    );

}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

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



// =====================================================
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}