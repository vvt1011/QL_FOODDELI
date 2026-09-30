export default function DangNhapPage() {
  return (
    <main className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid md:grid-cols-2">

        {/* Bên trái */}
        <section className="hidden bg-orange-500 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <h1 className="mb-4 text-4xl font-bold">
              FoodDeli
            </h1>

            <p className="text-2xl font-semibold">
              Đặt món ngon,
              <br />
              giao tận nơi.
            </p>

            <p className="mt-4 text-orange-100">
              Nhanh chóng, tiện lợi và dễ dàng.
            </p>
          </div>

          <p className="text-sm text-orange-100">
            © 2026 FoodDeli
          </p>
        </section>

        {/* Bên phải */}
        <section className="p-8 md:p-12">
          <div className="mx-auto max-w-md">

            <h2 className="text-3xl font-bold text-gray-900">
              Đăng nhập
            </h2>

            <p className="mt-2 text-gray-500">
              Đăng nhập để tiếp tục sử dụng FoodDeli
            </p>

            <form className="mt-8 space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Mật khẩu */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Quên mật khẩu */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Nút đăng nhập */}
              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Đăng nhập
              </button>

            </form>

            {/* Đăng ký */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <a
                href="/dang-ky"
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                Đăng ký
              </a>
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}