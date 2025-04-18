---
title: Trạng thái hệ thống
description: Theo dõi tình trạng hoạt động của các dịch vụ WeGreat trong thời gian thực
imageUrl: /images/system-status.jpg
tags: ['hệ thống', 'status', 'uptime']
category: technical
type: page
format: html
createdAt: '2024-12-16T02:28:17+07:00'
updatedAt: '2024-12-16T02:28:17+07:00'
---

<div class="bg-white py-24 sm:py-32">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mx-auto max-w-2xl lg:text-center">
      <h2 class="text-base font-semibold leading-7 text-indigo-600">Trạng thái hệ thống</h2>
      <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Tình trạng hoạt động</p>
      <p class="mt-6 text-lg leading-8 text-gray-600">Theo dõi tình trạng hoạt động của các dịch vụ WeGreat trong thời gian thực.</p>
    </div>

    <div class="mx-auto mt-16 max-w-2xl lg:max-w-none">
      <div class="grid grid-cols-1 gap-6">
        <!-- API Service -->
        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
              <h3 class="ml-3 text-sm font-medium text-gray-900">API Service</h3>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Hoạt động</span>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Uptime</span>
              <span>99.99%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-2 rounded-full bg-green-500" style="width: 99.99%"></div>
            </div>
          </div>
        </div>

        <!-- Database -->
        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
              <h3 class="ml-3 text-sm font-medium text-gray-900">Database</h3>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Hoạt động</span>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Uptime</span>
              <span>99.95%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-2 rounded-full bg-green-500" style="width: 99.95%"></div>
            </div>
          </div>
        </div>

        <!-- Real-time Data -->
        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
              <h3 class="ml-3 text-sm font-medium text-gray-900">Dữ liệu thời gian thực</h3>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Hoạt động</span>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Uptime</span>
              <span>99.90%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-2 rounded-full bg-green-500" style="width: 99.90%"></div>
            </div>
          </div>
        </div>

        <!-- Authentication -->
        <div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
              <h3 class="ml-3 text-sm font-medium text-gray-900">Xác thực</h3>
            </div>
            <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Hoạt động</span>
          </div>
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Uptime</span>
              <span>100%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100">
              <div class="h-2 rounded-full bg-green-500" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-16">
        <h3 class="text-lg font-semibold text-gray-900">Sự cố gần đây</h3>
        <div class="mt-6 space-y-4">
          <div class="flex items-start space-x-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">Bảo trì định kỳ</p>
              <p class="text-sm text-gray-500">15/12/2024 - Nâng cấp hệ thống database để cải thiện hiệu suất</p>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">Đã khắc phục</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
