// ==UserScript==
// @name         Medinet
// @namespace    http://tampermonkey.net/
// @version      6.24.6
// @description  Nut Thao Tac Nhanh
// @author       Auto-generated
// @match        https://quanlyskcd.medinet.org.vn/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @updateURL    https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js
// @downloadURL  https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js
// ==/UserScript==

// ==Changelog==
// (Khi ra ban moi: them 1 dong MOI o ngay duoi dong nay, dung dinh dang:
//  X.Y.Z | YYYY-MM-DD | Y 1 • Y 2 • Y 3  -- dau • de tach nhieu y trong cung ban)
// 6.24.6 | 2026-06-24 | Nâng cấp bảo mật Mã máy (Machine ID): kết hợp GPU/canvas/font... giảm khả năng trùng mã giữa 2 máy cùng cấu hình • Sửa lỗi hiển thị sai phiên bản hiện tại trong khung kiểm tra cập nhật • Thêm khung "Có gì mới" hiển thị thay đổi khi có bản mới
// 6.23.0 | 2026-06-24 | Menu "Thao tác nhanh" thông minh hơn: ẩn hẳn mục không khả dụng trên trang hiện tại (trước đây chỉ làm mờ) • "KSK Việc làm + Lái xe" chỉ hiện đúng 1 trang quy định • Ẩn/hiện mục con theo chuyên khoa trong submenu KSK Việc làm + Lái xe
// ==/Changelog==
