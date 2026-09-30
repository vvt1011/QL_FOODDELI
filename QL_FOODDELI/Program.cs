using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QL_FOODDELI.Data;
using QL_FOODDELI.Hubs;
using QL_FOODDELI.Middlewares;
using QL_FOODDELI.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

// 🟢 VÒNG LẶP SỐ 1: Tắt tự động map Claim mặc định của .NET

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// 1. DAPPER DATA CONTEXT & REPOSITORIES
// =====================================================
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<INguoiDungRepository, NguoiDungRepository>();
builder.Services.AddScoped<IMonAnRepository, MonAnRepository>();
builder.Services.AddScoped<IDonHangRepository, DonHangRepository>();
builder.Services.AddScoped<ICuaHangRepository, CuaHangRepository>();
builder.Services.AddScoped<IDanhMucRepository, DanhMucRepository>();
builder.Services.AddScoped<IGioHangRepository, GioHangRepository>();
builder.Services.AddScoped<IDiaChiRepository, DiaChiRepository>();
builder.Services.AddScoped<IVoucherRepository, VoucherRepository>();
builder.Services.AddScoped<IThongKeRepository, ThongKeRepository>();
builder.Services.AddScoped<IThanhToanRepository, ThanhToanRepository>();

// =====================================================
// 2. SIGNALR REAL-TIME NOTIFICATIONS
// =====================================================
builder.Services.AddSignalR();

// =====================================================
// 3. CORS CONFIGURATION (Frontend Web & Mobile)
// =====================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
     "http://localhost:3000",
     "http://localhost:5173",
     "http://localhost:8080",
     "http://localhost:4200",
     "https://localhost:3000",
     "https://localhost:5173",
     "http://localhost:5500",
     "http://127.0.0.1:5500"
 )
 .AllowAnyMethod()
 .AllowAnyHeader()
 .AllowCredentials();
    });
});

// =====================================================
// 4. RATE LIMITING (Chống Spam / DDoS: 100 req/phút/IP)
// =====================================================
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"status\":429,\"message\":\"Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau ít phút!\"}",
            token
        );
    };

    options.AddPolicy("IpRateLimiter", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown_client",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// =====================================================
// 5. JWT AUTHENTICATION (Hỗ trợ cả REST API & SignalR Hub)
// =====================================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
        ),

        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };

    // Hỗ trợ truyền JWT Token qua Query String cho kết nối WebSocket SignalR
    options.Events = new JwtBearerEvents
    {
        // Lấy JWT từ query string cho SignalR
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        },

        // Kiểm tra JWT sau khi xác thực thành công
        OnTokenValidated = context =>
        {
            Console.WriteLine("========== JWT DEBUG ==========");

            Console.WriteLine(
                $"Authenticated: {context.Principal?.Identity?.IsAuthenticated}"
            );

            Console.WriteLine(
     $"RoleClaimType: {((ClaimsIdentity?)context.Principal?.Identity)?.RoleClaimType}"
 );

            Console.WriteLine(
                $"IsInRole Admin: {context.Principal?.IsInRole("Admin")}"
            );

            Console.WriteLine(
                $"IsInRole ChuShop: {context.Principal?.IsInRole("ChuShop")}"
            );

            Console.WriteLine(
                $"IsInRole QuanLy: {context.Principal?.IsInRole("QuanLy")}"
            );

            foreach (var claim in context.Principal!.Claims)
            {
                Console.WriteLine(
                    $"CLAIM: [{claim.Type}] = [{claim.Value}]"
                );
            }

            Console.WriteLine("===============================");

            return Task.CompletedTask;
        },

        // Chạy khi JWT hợp lệ nhưng không đủ quyền
        OnForbidden = context =>
        {
            Console.WriteLine("========== 403 FORBIDDEN ==========");

            Console.WriteLine(
                $"Authenticated: {context.HttpContext.User.Identity?.IsAuthenticated}"
            );

            Console.WriteLine(
     $"RoleClaimType: {((ClaimsIdentity?)context.Principal?.Identity)?.RoleClaimType}"
 );

            Console.WriteLine(
                $"IsInRole Admin: {context.HttpContext.User.IsInRole("Admin")}"
            );

            Console.WriteLine(
                $"IsInRole ChuShop: {context.HttpContext.User.IsInRole("ChuShop")}"
            );

            Console.WriteLine(
                $"IsInRole QuanLy: {context.HttpContext.User.IsInRole("QuanLy")}"
            );

            Console.WriteLine("===================================");

            return Task.CompletedTask;
        }
    };
});

// =====================================================
// 6. AUTHORIZATION
// =====================================================
builder.Services.AddAuthorization();

// =====================================================
// 7. CONTROLLERS
// =====================================================
builder.Services.AddControllers();

// =====================================================
// 8. SWAGGER SUPPORT (JWT Bearer Auth)
// =====================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "QL_FOODDELI API (Dapper & SignalR)",
        Version = "v1",
        Description = "Hệ thống backend API quản lý giao đồ ăn nhanh QL_FOODDELI - Sprint 5"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Dán mã JWT Token thu được sau khi Đăng nhập vào ô này (KHÔNG gõ chữ Bearer):",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// =====================================================
// 9. MIDDLEWARE PIPELINE
// =====================================================

// Middleware Xử lý Ngoại lệ tập trung
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QL_FOODDELI API v1");
    });
}

app.UseHttpsRedirection();

// Áp dụng Rate Limiting & CORS
app.UseRateLimiter();
app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

// Đăng ký SignalR Hub & Controllers với Rate Limiter
app.MapHub<DonHangHub>("/hubs/donhang");
app.MapControllers().RequireRateLimiting("IpRateLimiter");

app.Run();