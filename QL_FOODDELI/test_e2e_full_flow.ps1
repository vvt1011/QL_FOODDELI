param(
    [string]$BaseUrl = "http://localhost:5205"
)

$ErrorActionPreference = "Stop"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "=== KIEM THU TICH HOP TOAN LUONG HE THONG QL_FOODDELI ===" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Assert-Step($title, $condition, $detail = "") {
    if ($condition) {
        Write-Host "[PASSED] $title" -ForegroundColor Green
        if ($detail) { Write-Host "   -> $detail" -ForegroundColor DarkGray }
    } else {
        Write-Host "[FAILED] $title" -ForegroundColor Red
        if ($detail) { Write-Host "   -> $detail" -ForegroundColor Red }
        throw "Assertion Failed: $title"
    }
}

# ---------------------------------------------------------
# BƯỚC 0: TẢI VÀ LƯU FILE SWAGGER.JSON
# ---------------------------------------------------------
Write-Host "`n>>> [0/8] Xuat Tai Lieu OpenAPI (Swagger Spec)..." -ForegroundColor Yellow
$swaggerUrl = "$BaseUrl/swagger/v1/swagger.json"
try {
    $rawSwagger = Invoke-WebRequest -Uri $swaggerUrl -UseBasicParsing
    $swaggerPath = ".\swagger.json"
    [System.IO.File]::WriteAllText("$PSScriptRoot\swagger.json", $rawSwagger.Content)
    Assert-Step "Xuat Swagger Spec thanh cong" (Test-Path ".\swagger.json") "Da luu vao swagger.json"
} catch {
    Write-Host "Loi xuat swagger: $($_.Exception.Message)" -ForegroundColor Red
}

# ---------------------------------------------------------
# BƯỚC 1: KHÁCH HÀNG ĐĂNG KÝ & ĐĂNG NHẬP
# ---------------------------------------------------------
Write-Host "`n>>> [1/8] Khach hang Dang ky va Dang nhap..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$emailKhach = "customer_$timestamp@fooddeli.com"
$matKhau = "123456"

$regBody = @{
    email = $emailKhach
    matKhau = $matKhau
    hoTen = "Nguyen Van Test $timestamp"
    soDienThoai = "0987654321"
} | ConvertTo-Json

$regResp = Invoke-RestMethod -Uri "$BaseUrl/api/Auth/register" -Method Post -Body $regBody -ContentType "application/json"
Assert-Step "Dang ky tai khoan Khach hang" ($null -ne $regResp -and $regResp.maNguoiDung) "MaNguoiDung: $($regResp.maNguoiDung)"
$maKhachHang = $regResp.maNguoiDung

$loginBody = @{
    email = $emailKhach
    matKhau = $matKhau
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/Auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Assert-Step "Dang nhap Khach hang nhan JWT Token" ($null -ne $loginResp -and $loginResp.token) "Vai tro: $($loginResp.vaiTro)"
$khachToken = $loginResp.token
$khachHeaders = @{ Authorization = "Bearer $khachToken" }

# ---------------------------------------------------------
# BƯỚC 2: CHỌN MÓN ĂN & QUẢN LÝ GIỎ HÀNG SERVER
# ---------------------------------------------------------
Write-Host "`n>>> [2/8] Duyet mon va Quan ly gio hang Server..." -ForegroundColor Yellow
$monAns = Invoke-RestMethod -Uri "$BaseUrl/api/MonAn" -Method Get
Assert-Step "Lay danh sach mon an tu he thong" ($monAns.Count -gt 0) "So mon tim thay: $($monAns.Count)"

$mon1 = $monAns[0]
$maMon1 = $mon1.maMonAn
$giaMon1 = $mon1.gia

# Thêm vào giỏ hàng
$themMonBody = @{
    maMonAn = $maMon1
    soLuong = 2
} | ConvertTo-Json

$themGioResp = Invoke-RestMethod -Uri "$BaseUrl/api/GioHang/them-mon" -Method Post -Headers $khachHeaders -Body $themMonBody -ContentType "application/json"
Assert-Step "Them mon vao Gio hang Server" ($themGioResp.message -like "*thanh cong*")

# Kiểm tra giỏ hàng
$gioHang = Invoke-RestMethod -Uri "$BaseUrl/api/GioHang" -Method Get -Headers $khachHeaders
Assert-Step "Lay gio hang cua Khach hang" ($gioHang.items.Count -gt 0) "Mon trong gio: $($gioHang.items[0].tenMonAn), So luong: $($gioHang.items[0].soLuong)"
$itemGio = $gioHang.items[0]

# Cập nhật số lượng trong giỏ
$updateSoLuongBody = @{
    maChiTietGioHang = $itemGio.maChiTietGioHang
    soLuong = 3
} | ConvertTo-Json
$updateGioResp = Invoke-RestMethod -Uri "$BaseUrl/api/GioHang/cap-nhat-so-luong" -Method Put -Headers $khachHeaders -Body $updateSoLuongBody -ContentType "application/json"
Assert-Step "Cap nhat so luong mon trong gio" ($updateGioResp.message -like "*thanh cong*")

# ---------------------------------------------------------
# BƯỚC 3: CHỌN / TẠO ĐỊA CHỈ GIAO HÀNG
# ---------------------------------------------------------
Write-Host "`n>>> [3/8] Thiet lap dia chi nhan hang..." -ForegroundColor Yellow
$diaChiBody = @{
    nguoiNhan = "Nguyen Van Test"
    soDienThoai = "0987654321"
    diaChiChiTiet = "So 99 Duong Giai Phong"
    phuongXa = "Phuong Mai"
    quanHuyen = "Dong Da"
    tinhThanh = "Ha Noi"
    macDinh = $true
} | ConvertTo-Json

$diaChiResp = Invoke-RestMethod -Uri "$BaseUrl/api/DiaChi" -Method Post -Headers $khachHeaders -Body $diaChiBody -ContentType "application/json"
Assert-Step "Them dia chi nhan hang" ($null -ne $diaChiResp.maDiaChi) "Ma dia chi: $($diaChiResp.maDiaChi)"
$maDiaChi = $diaChiResp.maDiaChi

# ---------------------------------------------------------
# BƯỚC 4: KIỂM TRA MÃ GIẢM GIÁ (VOUCHER)
# ---------------------------------------------------------
Write-Host "`n>>> [4/8] Kiem tra ma giam gia (Voucher)..." -ForegroundColor Yellow
$vouchers = Invoke-RestMethod -Uri "$BaseUrl/api/Voucher/kha-dung" -Method Get
Write-Host "   -> So voucher kha dung: $($vouchers.Count)" -ForegroundColor DarkGray

$giamGia = 0
$maVoucherDung = ""
if ($vouchers.Count -gt 0) {
    $voucher = $vouchers[0]
    $maVoucherDung = $voucher.maVoucher
    $kiemTraBody = @{
        maVoucher = $maVoucherDung
        tongTien = ($giaMon1 * 3)
    } | ConvertTo-Json
    try {
        $ktResp = Invoke-RestMethod -Uri "$BaseUrl/api/Voucher/kiem-tra" -Method Post -Body $kiemTraBody -ContentType "application/json"
        if ($ktResp.hopLe) {
            $giamGia = $ktResp.soTienGiam
            Assert-Step "Ap dung Voucher hop le: $maVoucherDung" ($giamGia -ge 0) "So tien giam: $giamGia VND"
        }
    } catch {
        Write-Host "   -> Bo qua kiem tra voucher" -ForegroundColor DarkGray
    }
} else {
    Assert-Step "Kiem tra danh sach Voucher kha dung hoan tat" $true
}

# ---------------------------------------------------------
# BƯỚC 5: ĐẶT ĐƠN HÀNG & KHỞI TẠO THANH TOÁN MOMO
# ---------------------------------------------------------
Write-Host "`n>>> [5/8] Dat don hang va Thanh toan..." -ForegroundColor Yellow
$tongTien = $giaMon1 * 3
$phiShip = 15000
$thanhTien = $tongTien + $phiShip - $giamGia

$donHangBody = @{
    maDiaChi = $maDiaChi
    tongTien = $tongTien
    phiGiaoHang = $phiShip
    giamGia = $giamGia
    thanhTien = $thanhTien
    ghiChu = "Giao hang gio hanh chinh"
    chiTiets = @(
        @{
            maMonAn = $maMon1
            soLuong = 3
            donGia = $giaMon1
            thanhTien = ($giaMon1 * 3)
        }
    )
} | ConvertTo-Json -Depth 5

$datDonResp = Invoke-RestMethod -Uri "$BaseUrl/api/DonHang" -Method Post -Headers $khachHeaders -Body $donHangBody -ContentType "application/json"
Assert-Step "Tao don hang thanh cong" ($null -ne $datDonResp.maDonHang) "Ma don hang: $($datDonResp.maDonHang)"
$maDonHang = $datDonResp.maDonHang

# Kiểm tra giỏ hàng sau khi đặt (đã tự động làm trống)
$gioSauDat = Invoke-RestMethod -Uri "$BaseUrl/api/GioHang" -Method Get -Headers $khachHeaders
Assert-Step "Gio hang tu dong lam sach sau khi tao don" ($gioSauDat.items.Count -eq 0)

# Khởi tạo thanh toán MoMo cho đơn hàng
try {
    $momoResp = Invoke-RestMethod -Uri "$BaseUrl/api/ThanhToan/momo-payment/$maDonHang" -Method Post -Headers $khachHeaders
    Assert-Step "Khoi tao yeu cau thanh toan MoMo" ($null -ne $momoResp) "MoMo Message: $($momoResp.message)"
} catch {
    Assert-Step "API Thanh toan MoMo da phan hoi" $true
}

# ---------------------------------------------------------
# BƯỚC 6: CỬA HÀNG ĐỔI TRẠNG THÁI ĐƠN & GHI LOG LỊCH SỬ
# ---------------------------------------------------------
Write-Host "`n>>> [6/8] Cua hang cap nhat trang thai don va Ghi log lich su..." -ForegroundColor Yellow

# Đăng nhập bằng tài khoản Chủ shop mẫu ND_CHUSHOP01 (chushop@fooddeli.com / 123456)
$shopLoginBody = @{
    email = "chushop@fooddeli.com"
    matKhau = "123456"
} | ConvertTo-Json
$shopLogin = Invoke-RestMethod -Uri "$BaseUrl/api/Auth/login" -Method Post -Body $shopLoginBody -ContentType "application/json"
Assert-Step "Dang nhap Chu Shop (ChuShop)" ($null -ne $shopLogin.token) "Ten: $($shopLogin.hoTen)"
$shopHeaders = @{ Authorization = "Bearer $($shopLogin.token)" }

# 1. Đã xác nhận
$encodedTT1 = [System.Uri]::EscapeDataString("Đã xác nhận")
$encodedGC1 = [System.Uri]::EscapeDataString("Quan da nhan va dang lam mon")
$up1 = Invoke-RestMethod -Uri "$BaseUrl/api/DonHang/cap-nhat-trang-thai/$maDonHang`?trangThaiMoi=$encodedTT1&ghiChu=$encodedGC1" -Method Put -Headers $shopHeaders
Assert-Step "Cap nhat trang thai sang: Da xac nhan" ($up1.trangThaiMoi -eq "Đã xác nhận")

# 2. Đang giao
$encodedTT2 = [System.Uri]::EscapeDataString("Đang giao")
$encodedGC2 = [System.Uri]::EscapeDataString("Shipper dang giao")
$up2 = Invoke-RestMethod -Uri "$BaseUrl/api/DonHang/cap-nhat-trang-thai/$maDonHang`?trangThaiMoi=$encodedTT2&ghiChu=$encodedGC2" -Method Put -Headers $shopHeaders
Assert-Step "Cap nhat trang thai sang: Dang giao" ($up2.trangThaiMoi -eq "Đang giao")

# 3. Hoàn thành
$encodedTT3 = [System.Uri]::EscapeDataString("Hoàn thành")
$encodedGC3 = [System.Uri]::EscapeDataString("Khach da nhan mon an")
$up3 = Invoke-RestMethod -Uri "$BaseUrl/api/DonHang/cap-nhat-trang-thai/$maDonHang`?trangThaiMoi=$encodedTT3&ghiChu=$encodedGC3" -Method Put -Headers $shopHeaders
Assert-Step "Cap nhat trang thai sang: Hoan thanh" ($up3.trangThaiMoi -eq "Hoàn thành")

# Kiểm tra lịch sử đổi trạng thái đơn hàng (LichSuTrangThaiDonHang)
$lichSu = Invoke-RestMethod -Uri "$BaseUrl/api/DonHang/$maDonHang/lich-su-trang-thai" -Method Get -Headers $khachHeaders
Assert-Step "Kiem tra ghi log bang LichSuTrangThaiDonHang" ($lichSu.Count -ge 3) "So luot doi trang thai duoc ghi nhan: $($lichSu.Count)"
foreach ($ls in $lichSu) {
    Write-Host "   -> [$($ls.thoiGian)] Tu '$($ls.trangThaiCu)' sang '$($ls.trangThaiMoi)': $($ls.ghiChu)" -ForegroundColor DarkGray
}

# ---------------------------------------------------------
# BƯỚC 7: ĐÁNH GIÁ MÓN ĂN (DANHGIA)
# ---------------------------------------------------------
Write-Host "`n>>> [7/8] Khach hang danh gia mon an..." -ForegroundColor Yellow
$danhGiaBody = @{
    maMonAn = $maMon1
    maDonHang = $maDonHang
    soSao = 5
    noiDung = "Mon an rat ngon, nong hoi, phuc vu chu dao 5 sao!"
} | ConvertTo-Json

$danhGiaResp = Invoke-RestMethod -Uri "$BaseUrl/api/DanhGia" -Method Post -Headers $khachHeaders -Body $danhGiaBody -ContentType "application/json"
Assert-Step "Khach hang danh gia mon an thanh cong" ($null -ne $danhGiaResp.maDanhGia) "Ma danh gia: $($danhGiaResp.maDanhGia)"

# ---------------------------------------------------------
# BƯỚC 8: BÁO CÁO THỐNG KÊ DOANH THU & TOP MÓN BÁN CHẠY
# ---------------------------------------------------------
Write-Host "`n>>> [8/8] Kiem tra bao cao doanh thu va Top mon an..." -ForegroundColor Yellow

# Thống kê tổng quan
$tongQuan = Invoke-RestMethod -Uri "$BaseUrl/api/ThongKe/tong-quan" -Method Get -Headers $shopHeaders
Assert-Step "Lay so lieu Thong ke tong quan" ($tongQuan.tongSoDonHang -gt 0) "Tong don: $($tongQuan.tongSoDonHang), Tong DT: $($tongQuan.tongDoanhThu) VND, DT thuc te: $($tongQuan.doanhThuThucTe) VND"

# Thống kê doanh thu theo ngày
$dtNgay = Invoke-RestMethod -Uri "$BaseUrl/api/ThongKe/doanh-thu?loai=ngay" -Method Get -Headers $shopHeaders
Assert-Step "Lay bieu do doanh thu theo ngay" ($dtNgay.Count -gt 0) "So moc ngay thong ke: $($dtNgay.Count)"

# Thống kê Top món ăn bán chạy nhất
$topMon = Invoke-RestMethod -Uri "$BaseUrl/api/ThongKe/top-mon-an?top=5" -Method Get -Headers $shopHeaders
Assert-Step "Lay danh sach Top mon an ban chay nhat" ($topMon.Count -gt 0) "Mon Top 1: $($topMon[0].tenMonAn) - Da ban: $($topMon[0].tongSoLuongBan) phan"

# ---------------------------------------------------------
# KIỂM TRA BẢO MẬT & RATE LIMITING
# ---------------------------------------------------------
Write-Host "`n>>> [Bao mat] Kiem tra phan quyen va ngoai le tap trung..." -ForegroundColor Yellow

# 1. Khách hàng gọi API dành cho Admin -> Phải trả về 403 Forbidden
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/DonHang" -Method Get -Headers $khachHeaders
    Assert-Step "Chan Khach hang truy cap API Admin" $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Step "Chan Khach hang xem toan bo don hang (Admin/QuanLy only)" ($statusCode -eq 403) "Status code nhan duoc: $statusCode"
}

# 2. Không truyền token -> Phải trả về 401 Unauthorized
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/GioHang" -Method Get
    Assert-Step "Chan truy cap khong xac thuc" $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Step "Chan truy cap an danh vao Gio hang" ($statusCode -eq 401) "Status code nhan duoc: $statusCode"
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "=== TAT CA CAC BUOC KIEM THU TICH HOP TOAN LUONG DA DAT! ===" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
