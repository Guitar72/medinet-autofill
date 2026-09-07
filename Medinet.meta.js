// ==UserScript==
// @name         Medinet
// @namespace    http://tampermonkey.net/
// @version      12.4
// @description  Nut Thao Tac Nhanh (KSK nguoi lon + Tre em duoi 6 tuoi + O to + Nguoi lai xe)
// @author       Auto-generated
// @match        https://quanlyskcd.medinet.org.vn/*
// @icon         https://quanlyskcd.medinet.org.vn/favicon.ico
// @run-at       document-idle
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js
// @downloadURL  https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js
// @supportURL   https://zalo.me/0868919790
// @homepageURL  https://medinetautofill.github.io
// ==/UserScript==

// ==Changelog==
// 12.4 | 2026-09-07 | Popup Ví Medi: bắt buộc cả Số điện thoại Zalo và Tên mới mở khoá chọn mức nạp (bỏ ô Zalo riêng) • Thêm nút phóng to QR khi rê chuột, bấm để xem QR to hơn
// 12.3 | 2026-09-03 | Sửa lỗi trừ dư Medi khi bấm lại nút trên trang đã điền (Tiền sử khám thực thể, Thông tin hành chính, M2) • Không tính phí khi thao tác không tìm thấy mục để chọn
// 12.2 | 2026-09-03 | Sửa lỗi trừ dư khi tick checkbox/radio/ô số đã điền sẵn • Sửa lỗi số dư hiển thị sai (vọt lên) sau khi F5 do request trừ Medi bị huỷ khi chuyển trang
// ==/Changelog==