@echo off
echo Resetting to React 18...

echo Cleaning caches...
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo Cleaning pnpm store...
call pnpm store prune

echo Installing React 18.3.1...
call pnpm add react@18.3.1 react-dom@18.3.1

echo Installing dependencies...
call pnpm install

echo Generating Prisma client...
call pnpm prisma generate

echo Done! Now run: pnpm dev
pause
