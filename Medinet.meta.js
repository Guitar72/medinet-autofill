// ==UserScript==
// @name         Medinet
// @namespace    http://tampermonkey.net/
// @version      12.3
// @description  Nut Thao Tac Nhanh (KSK nguoi lon + Tre em duoi 6 tuoi + O to + Nguoi lai xe)
// @author       Auto-generated
// @match        https://quanlyskcd.medinet.org.vn/*
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js
// @downloadURL  https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js
// ==/UserScript==

// ==Changelog==
// 12.3 | 2026-09-03 | Sua loi tru du medi khi bam lai nut tren trang da dien (Tien su kham thuc the, Thong tin hanh chinh, M2) • Khong tinh phi khi thao tac khong tim thay muc de chon
// 12.2 | 2026-09-03 | Sua loi tru du khi tick checkbox/radio/o so da dien san • Sua loi so du hien thi sai (vot len) sau khi F5 do request tru medi bi huy khi chuyen trang
// ==/Changelog==
