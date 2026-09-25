const form = document.getElementById("loginForm");

console.log("dang-nhap.js đã được tải");

if (!form) {
    console.error("Không tìm thấy form loginForm");
} else {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        console.log("Đã bấm nút Đăng nhập");

        const email = document.getElementById("email").value.trim();
        const matKhau = document.getElementById("password").value;

        console.log("Email:", email);

        if (!email) {
            alert("Vui lòng nhập email.");
            return;
        }

        if (!matKhau) {
            alert("Vui lòng nhập mật khẩu.");
            return;
        }

        try {
            const response = await fetch(
                "https://localhost:7135/api/Auth/dang-nhap",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        matKhau: matKhau
                    })
                }
            );

            console.log("HTTP status:", response.status);

            const data = await response.json();

            console.log("API trả về:", data);

            if (!response.ok) {
                alert(data.message || "Đăng nhập thất bại.");
                return;
            }

            alert("Đăng nhập thành công!");

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data)
            );

            window.location.href = "../index.html";

        } catch (error) {
            console.error("Lỗi:", error);

            alert(
                "Đã xảy ra lỗi. Vui lòng thử lại sau."
            );
        }
    });
}