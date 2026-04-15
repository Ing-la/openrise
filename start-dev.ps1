# ============================================================
# 开发环境一键启动脚本
# 功能：
#   1. 启动 PostgreSQL 和 MinIO 容器
#   2. 检查容器健康状态
#   3. 安装前端依赖（如果需要）
#   4. 启动 Next.js 开发服务器
# ============================================================

param(
    [switch]$SkipDocker,      # 跳过 Docker 容器启动
    [switch]$SkipFrontend,    # 跳过前端启动
    [switch]$Help             # 显示帮助信息
)

if ($Help) {
    Write-Host "使用说明:" -ForegroundColor Cyan
    Write-Host "  .\start-dev.ps1                    # 正常启动所有服务"
    Write-Host "  .\start-dev.ps1 -SkipDocker       # 仅启动前端（假设容器已在运行）"
    Write-Host "  .\start-dev.ps1 -SkipFrontend     # 仅启动容器"
    Write-Host "  .\start-dev.ps1 -Help             # 显示此帮助信息"
    Write-Host ""
    Write-Host "数据库管理界面启动方法:" -ForegroundColor Cyan
    Write-Host "  cd frontend && npm run studio    # 启动 Prisma Studio (http://localhost:5555)"
    exit 0
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Cyan
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [错误] $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [成功] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  [警告] $Message" -ForegroundColor Yellow
}

# ============================================================
# 1. 启动 Docker 容器
# ============================================================
if (-not $SkipDocker) {
    Write-Step "1. 启动基础设施容器 (PostgreSQL + MinIO)"

    # 检查 Docker 是否正在运行
    try {
        docker version 2>&1 | Out-Null
        Write-Info "Docker 正在运行"
    } catch {
        Write-Error "Docker 未运行或无法访问。请启动 Docker Desktop。"
        exit 1
    }

    # 启动 db 和 minio 服务
    Write-Info "启动 PostgreSQL 和 MinIO 容器..."
    docker-compose up -d db minio

    if ($LASTEXITCODE -ne 0) {
        Write-Error "容器启动失败。请检查 docker-compose 配置。"
        exit 1
    }

    # 等待容器健康检查
    Write-Info "等待容器就绪（最长30秒）..."
    $maxWait = 30
    $waited = 0
    $dbHealthy = $false
    $minioHealthy = $false

    while ($waited -lt $maxWait -and (-not $dbHealthy -or -not $minioHealthy)) {
        Start-Sleep -Seconds 2
        $waited += 2

        if (-not $dbHealthy) {
            $dbStatus = docker inspect --format='{{.State.Health.Status}}' ai-web-community-db-1 2>$null
            if ($dbStatus -eq 'healthy') {
                $dbHealthy = $true
                Write-Info "PostgreSQL 已就绪"
            }
        }

        if (-not $minioHealthy) {
            $minioStatus = docker inspect --format='{{.State.Health.Status}}' ai-web-community-minio-1 2>$null
            if ($minioStatus -eq 'healthy') {
                $minioHealthy = $true
                Write-Info "MinIO 已就绪"
            }
        }

        if ($waited % 10 -eq 0) {
            Write-Info "已等待 ${waited}秒..."
        }
    }

    if (-not $dbHealthy) {
        Write-Warning "PostgreSQL 健康检查超时，但将继续启动..."
    }
    if (-not $minioHealthy) {
        Write-Warning "MinIO 健康检查超时，但将继续启动..."
    }

    Write-Success "基础设施容器已启动"
    Write-Info "  PostgreSQL: localhost:5432 (openrise/openrise_secret)"
    Write-Info "  MinIO API: http://localhost:9000"
    Write-Info "  MinIO 控制台: http://localhost:9001 (minioadmin/minioadmin)"
}

# ============================================================
# 2. 启动前端开发服务器
# ============================================================
if (-not $SkipFrontend) {
    Write-Step "2. 启动前端开发服务器"

    # 切换到 frontend 目录
    $frontendDir = Join-Path $PSScriptRoot "frontend"
    if (-not (Test-Path $frontendDir)) {
        Write-Error "找不到 frontend 目录: $frontendDir"
        exit 1
    }

    Set-Location $frontendDir

    # 检查是否需要安装或更新依赖
    $needInstall = $false

    # 情况1: node_modules目录不存在
    if (-not (Test-Path "node_modules")) {
        $needInstall = $true
        Write-Info "node_modules目录不存在，需要安装依赖"
    }
    # 情况2: 检查package.json是否比package-lock.json更新
    elseif (Test-Path "package.json" -And Test-Path "package-lock.json") {
        $packageJsonTime = (Get-Item "package.json").LastWriteTime
        $packageLockTime = (Get-Item "package-lock.json").LastWriteTime
        if ($packageJsonTime -gt $packageLockTime) {
            $needInstall = $true
            Write-Info "检测到package.json更新，需要重新安装依赖"
        }
    }
    # 情况3: 检查关键依赖是否存在（例如@aws-sdk/client-s3）
    elseif (-not (Test-Path "node_modules/@aws-sdk/client-s3")) {
        $needInstall = $true
        Write-Info "检测到缺失的关键依赖包，需要重新安装"
    }

    if ($needInstall) {
        Write-Info "安装/更新 npm 依赖包..."
        # 清理可能损坏的安装
        Remove-Item -Force -Recurse node_modules -ErrorAction SilentlyContinue
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install 失败"
            exit 1
        }
        Write-Success "依赖包安装完成"
    } else {
        Write-Info "依赖包已是最新，跳过安装"
    }

    # 检查 .env.local 是否存在
    if (-not (Test-Path ".env.local")) {
        Write-Warning "未找到 .env.local 文件"
        Write-Info "请复制 .env.example 为 .env.local 并配置环境变量"
        Write-Info "  cp .env.example .env.local"
    }

    # 显示访问信息
    Write-Host "`n" + ("="*60) -ForegroundColor DarkGray
    Write-Host "开发环境访问信息:" -ForegroundColor Cyan
    Write-Host "  前端应用:   http://localhost:3000" -ForegroundColor Green
    Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Green
    Write-Host "  MinIO API:  http://localhost:9000" -ForegroundColor Green
    Write-Host "  MinIO 控制台: http://localhost:9001" -ForegroundColor Green
    Write-Host "  用户名/密码: minioadmin/minioadmin" -ForegroundColor Green
    Write-Host "  Prisma Studio: http://localhost:5555 (cd frontend && npm run studio)" -ForegroundColor Green
    Write-Host ("="*60) -ForegroundColor DarkGray
    Write-Host "`n正在启动 Next.js 开发服务器...`n" -ForegroundColor Cyan

    # 启动开发服务器
    npm run dev
} else {
    Write-Success "前端启动已跳过"
}

Write-Step "启动完成"
Write-Info "按 Ctrl+C 停止所有服务"
Write-Info "停止容器命令: docker-compose down"