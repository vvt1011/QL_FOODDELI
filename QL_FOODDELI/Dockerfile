# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["QL_FOODDELI.csproj", "./"]
RUN dotnet restore "QL_FOODDELI.csproj"

# Copy all source files and build Release
COPY . .
RUN dotnet publish "QL_FOODDELI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "QL_FOODDELI.dll"]
