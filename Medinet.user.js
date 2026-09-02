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

(function () {
    'use strict';

    // Fix: lay cac class Event tu unsafeWindow de hoat dong dung trong sandbox Tampermonkey
    var _pageWin = (typeof unsafeWindow !== 'undefined' && unsafeWindow) ? unsafeWindow : window;
    var MouseEvent = _pageWin.MouseEvent;
    var PointerEvent = _pageWin.PointerEvent;
    var KeyboardEvent = _pageWin.KeyboardEvent;
    var Event = _pageWin.Event;
    var DataTransfer = _pageWin.DataTransfer;
    var HTMLInputElement = _pageWin.HTMLInputElement;

    // ================================================================
    //  TIEN ICH CHUNG
    // ================================================================

    function pointerClick(el) {
        ['pointerdown', 'pointerup', 'click'].forEach(function(evtName) {
            el.dispatchEvent(new PointerEvent(evtName, {
                bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse',
            }));
        });
    }

    // showToast: dinh nghia o phan "AUTO UPLOAD ANH THONG MINH" phia duoi
    // (ham moi showToast(msg, type) tuong thich nguoc 100% voi cac loi goi showToast(msg) cu)

    var nativeSetter = Object.getOwnPropertyDescriptor(_pageWin.HTMLInputElement.prototype, 'value').set;
    var nativeTextAreaSetter = Object.getOwnPropertyDescriptor(_pageWin.HTMLTextAreaElement.prototype, 'value').set;

    // Tra ve true neu tim thay field VA gia tri THAT SU thay doi (dung tinh
    // phi theo o). BUG FIX: ban truoc luon tra ve true moi khi field ton
    // tai, ke ca khi gia tri can set TRUNG voi gia tri dang co san (vd bam
    // lai nut "Thao tac nhanh" lan 2 tren trang da dien du liệu roi) - khien
    // bi tru phi trung cho nhung o khong co thay doi gi ca. Nay so sanh
    // gia tri hien tai truoc khi set, chi tinh phi khi thuc su ghi de.
    function setNumberField(cls, value) {
        var fieldItem = document.querySelector('.' + cls);
        if (!fieldItem) return false;
        var input = fieldItem.querySelector('dx-number-box input.dx-texteditor-input');
        if (!input) return false;
        var current = (input.value == null) ? '' : String(input.value).trim();
        var target = (value == null) ? '' : String(value).trim();
        if (current === target) return false; // da dung gia tri can dien, khong tinh phi
        input.focus({ preventScroll: true });
        nativeSetter.call(input, value);
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.blur();
        return true;
    }

    function clearNumberField(cls) { return setNumberField(cls, ''); }

    // BUG FIX: truoc day ham nay LUON tra ve true (ke ca khi checkbox DA
    // duoc tick tu truoc, khong lam gi ca) khien noi goi dung ket qua nay
    // de tinh phi (vd tickAllChuaPhatHien) bi TINH PHI TRUNG moi lan quet
    // lai / bam lai nut cho nhung o da tick san. Nay CHI tra ve true khi
    // co thao tac click THAT SU (tu chua tick -> tick), giong dung ban
    // chat "1 luot = 1 hanh dong thuc su" ma toan bo script dang ap dung
    // o cac ham khac (vd tcProcessRadioGroup, tickAllBinhThuongRadio).
    function tickCheckbox(cb) {
        if (cb.getAttribute('aria-checked') === 'true') return false;
        var icon = cb.querySelector('.dx-checkbox-container, .dx-checkbox-icon');
        pointerClick(icon || cb);
        return true;
    }

    // Tra ve true neu co thao tac thuc su (tu checked -> unchecked)
    function untickCheckbox(cb) {
        if (cb.getAttribute('aria-checked') !== 'true') return false;
        var icon = cb.querySelector('.dx-checkbox-container, .dx-checkbox-icon');
        pointerClick(icon || cb);
        return true;
    }

    function findCheckboxNear(bEl) {
        var root = bEl.parentElement;
        for (var i = 0; i < 8 && root; i++) {
            var cb = root.querySelector('dx-check-box[role="checkbox"]');
            if (cb) return cb;
            root = root.parentElement;
        }
        return null;
    }

    // Tra ve so o "Chua phat hien bat thuong" da tick
    // BUG FIX: dung seenCbs de chong dem trung khi nhieu the <b> gan cung 1 checkbox
    function tickAllChuaPhatHien(skipClasses) {
        var count = 0;
        var seenCbs = []; // track checkboxes da xu ly, tranh dem trung
        document.querySelectorAll('b').forEach(function(bEl) {
            if (!bEl.textContent.includes('Chưa phát hiện bất thường')) return;
            for (var s = 0; s < skipClasses.length; s++) {
                if (bEl.closest('.' + skipClasses[s])) return;
            }
            var cb = findCheckboxNear(bEl);
            if (!cb) return;
            if (seenCbs.indexOf(cb) !== -1) return; // da xu ly checkbox nay roi
            seenCbs.push(cb);
            if (tickCheckbox(cb)) count++;
        });
        return count;
    }

    function selectRadioWithException(containerClass, labelIn, labelOut) {
        document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
            var labelEl = item.querySelector('.dx-item-content.dx-list-item-content');
            if (!labelEl) return;
            var text = (labelEl.innerText || labelEl.textContent || '').replace(/\s+/g, ' ').trim();
            var inContainer = containerClass !== '__none__' && !!item.closest('.' + containerClass);
            var target = inContainer ? labelIn : labelOut;
            if (text !== target) return;
            var radio = item.querySelector('.dx-radiobutton[role="radio"]');
            if (!radio) return;
            if (radio.getAttribute('aria-checked') === 'true') return; // da chon roi, khong lam gi
            pointerClick(item);
            var icon = radio.querySelector('.dx-radiobutton-icon');
            if (icon) pointerClick(icon);
        });
    }

    // Tra ve so o thuc su MOI duoc chon lan nay (dung tinh phi theo o).
    // BUG FIX: ban truoc dem CA cac o DA duoc chon san tu truoc (khong
    // kiem tra aria-checked truoc khi click+dem), khien moi lan bam lai
    // nut "Thao tac nhanh" tren trang da dien roi se BI TRU PHI TRUNG cho
    // toan bo cac o do, du khong co thao tac thuc su nao xay ra.
    function selectRadioMultiException(containerClasses, labelIn, labelOut) {
        var count = 0;
        document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
            var labelEl = item.querySelector('.dx-item-content.dx-list-item-content');
            if (!labelEl) return;
            var text = (labelEl.innerText || labelEl.textContent || '').replace(/\s+/g, ' ').trim();
            var inContainer = containerClasses.some(function(cls) { return !!item.closest('.' + cls); });
            var target = inContainer ? labelIn : labelOut;
            if (text !== target) return;
            var radio = item.querySelector('.dx-radiobutton[role="radio"]');
            if (!radio) return;
            if (radio.getAttribute('aria-checked') === 'true') return; // da chon roi, khong tinh phi lai
            pointerClick(item);
            var icon = radio.querySelector('.dx-radiobutton-icon');
            if (icon) pointerClick(icon);
            count++;
        });
        return count;
    }

    // Tra ve true neu field duoc tim thay va co thao tac xoa
    function clearTagBox(fieldCls) {
        var fieldItem = document.querySelector('.' + fieldCls);
        if (!fieldItem) return false;
        var didSomething = false;
        var removeBtns = fieldItem.querySelectorAll('.dx-tag-remove-button');
        if (removeBtns.length > 0) didSomething = true;
        removeBtns.forEach(function(btn) { pointerClick(btn); });
        var input = fieldItem.querySelector('dx-tag-box input.dx-texteditor-input');
        if (input && input.value) {
            didSomething = true;
            nativeSetter.call(input, '');
            input.dispatchEvent(new Event('input',  { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return didSomething;
    }

    function fillTagBox(fieldCls, code) {
        var fieldItem = document.querySelector('.' + fieldCls);
        if (!fieldItem) return;
        var input = fieldItem.querySelector('dx-tag-box input.dx-texteditor-input');
        if (!input) return;
        input.focus({ preventScroll: true });
        nativeSetter.call(input, code);
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown', keyCode: 40 }));
        setTimeout(function() {
            var allItems = document.querySelectorAll(
                '.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible), ' +
                '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)'
            );
            var target = null;
            var codeUpper = code.trim().toUpperCase();

            // Uu tien 1: text bat dau bang "<code> " hoac "<code> --" (chinh xac, co dau phan cach)
            allItems.forEach(function(item) {
                if (target) return;
                var txt = (item.textContent || '').trim().toUpperCase();
                if (txt === codeUpper ||
                    txt.startsWith(codeUpper + ' ') ||
                    txt.startsWith(codeUpper + '--') ||
                    txt.startsWith(codeUpper + ' --')) {
                    target = item;
                }
            });

            if (target) {
                pointerClick(target);
            } else {
                // Khong tim thay item phu hop -> Enter de the app tu xu ly
                input.dispatchEvent(new KeyboardEvent('keydown',  { bubbles: true, key: 'Enter', keyCode: 13 }));
                input.dispatchEvent(new KeyboardEvent('keyup',    { bubbles: true, key: 'Enter', keyCode: 13 }));
                input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'Enter', keyCode: 13 }));
            }
        }, 800);
    }


    // cb(ok) - ok=true neu field ton tai tren trang (da thuc su thao tac),
    // false neu khong tim thay field (khong tinh phi).
    function typeAndEnterSelectBox(fieldCls, label, cb) {
        var fieldItem = document.querySelector('.' + fieldCls);
        if (!fieldItem) { if (cb) cb(false, false); return; }
        var selectBox = fieldItem.querySelector('dx-select-box');
        if (!selectBox) { if (cb) cb(false, false); return; }

        var mainInput = selectBox.querySelector('input.dx-texteditor-input');
        if (!mainInput) { if (cb) cb(false, false); return; }

        // BUG FIX: neu o da dang hien dung gia tri can dien roi, KHONG xoa/
        // go lai va KHONG tinh phi - tranh tinh phi trung khi bam lai nut
        // tren trang da dien du lieu roi (nguyen nhan gay "tru qua nhieu").
        var labelNorm = label.trim().toLowerCase();
        var currentVal = (mainInput.value || '').trim().toLowerCase();
        if (currentVal && (currentVal === labelNorm || currentVal.indexOf(labelNorm) !== -1)) {
            if (cb) cb(true, false);
            return;
        }

        // Xoa gia tri cu, focus, roi go text moi
        mainInput.focus({ preventScroll: true });
        nativeSetter.call(mainInput, '');
        mainInput.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(function() {
            nativeSetter.call(mainInput, label);
            mainInput.dispatchEvent(new Event('input', { bubbles: true }));
            mainInput.dispatchEvent(new Event('change', { bubbles: true }));

            // Doi DevExtreme loc danh sach xong roi Enter
            setTimeout(function() {
                ['keydown', 'keypress', 'keyup'].forEach(function(evtType) {
                    mainInput.dispatchEvent(new KeyboardEvent(evtType, {
                        bubbles: true, cancelable: true,
                        key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    }));
                });
                // Fallback: neu Enter khong an, thu click item dau tien trong popup
                setTimeout(function() {
                    var firstItem = document.querySelector(
                        '.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' +
                        '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)'
                    );
                    if (firstItem) {
                        pointerClick(firstItem);
                        setTimeout(function() { if (cb) cb(true, true); }, 300);
                    } else {
                        if (cb) setTimeout(function() { cb(true, true); }, 200);
                    }
                }, 200);
            }, 400);
        }, 50);
    }

    function selectDxSelectBox(fieldCls, label, cb) {
        var fieldItem = document.querySelector('.' + fieldCls);
        if (!fieldItem) { if (cb) cb(false, false); return; }
        var selectBox = fieldItem.querySelector('dx-select-box');
        if (!selectBox) { if (cb) cb(false, false); return; }

        // BUG FIX: neu o da dang hien dung gia tri can chon roi, KHONG mo
        // dropdown lai va KHONG tinh phi - tranh tinh phi trung khi bam lai
        // nut tren trang da dien du lieu roi.
        var mainInputEarly = selectBox.querySelector('input.dx-texteditor-input');
        var labelNormEarly = label.trim().toLowerCase();
        var currentValEarly = (mainInputEarly && mainInputEarly.value) ? mainInputEarly.value.trim().toLowerCase() : '';
        if (currentValEarly && (currentValEarly === labelNormEarly || currentValEarly.indexOf(labelNormEarly) !== -1)) {
            if (cb) cb(true, false);
            return;
        }

        // Mo dropdown
        var dropBtn = selectBox.querySelector('.dx-dropdowneditor-button');
        var mainInput = selectBox.querySelector('input.dx-texteditor-input');
        if (dropBtn) pointerClick(dropBtn);
        else if (mainInput) pointerClick(mainInput);

        // Doi popup mo
        setTimeout(function() {
            // Tim overlay popup dang hien (visible, khong an)
            // dx-select-box voi search=true se co dx-list-search input ben trong popup
            var overlayVisible = null;
            document.querySelectorAll(
                '.dx-dropdowneditor-overlay, .dx-popup-wrapper'
            ).forEach(function(el) {
                if (overlayVisible) return;
                // Kiem tra visibility: khong phai display:none va khong co aria-hidden=true
                if (el.style.display === 'none') return;
                if (el.getAttribute('aria-hidden') === 'true') return;
                // Kiem tra co list-item ben trong (popup dang mo)
                if (el.querySelector('.dx-list-item')) overlayVisible = el;
            });

            // Tim search input: la input type=text co role=textbox trong popup
            // (khac voi main input cua select-box)
            var searchInput = null;
            if (overlayVisible) {
                // dx-list-search: class dac trung cua search box trong dx-select-box popup
                var listSearch = overlayVisible.querySelector('.dx-list-search input, .dx-searchbox input');
                if (listSearch) searchInput = listSearch;
                else {
                    // Fallback: input text trong popup (khong phai hidden)
                    var allInputs = overlayVisible.querySelectorAll('input[type="text"]');
                    if (allInputs.length > 0) searchInput = allInputs[allInputs.length - 1];
                }
            }
            // Mot so dx-select-box (vd: "Nghe nghiep") KHONG render search box
            // rieng trong popup - viec loc duoc thuc hien ngay tren CHINH input
            // chinh cua select-box (nhan biet qua aria-autocomplete="list").
            // Neu khong tim duoc searchInput trong popup, dung luon mainInput.
            if (!searchInput && mainInput && mainInput.getAttribute('aria-autocomplete') === 'list') {
                searchInput = mainInput;
            }

            function doSearch(inp) {
                inp.focus({ preventScroll: true });
                nativeSetter.call(inp, label);
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
                // Sau khi go, doi Angular/DevExtreme filter xong
                setTimeout(function() {
                    // Cach 1 (hieu qua nhat): bam Enter de DevExtreme tu chon
                    // item dau tien dang highlight trong danh sach da loc
                    ['keydown', 'keypress', 'keyup'].forEach(function(evtType) {
                        inp.dispatchEvent(new KeyboardEvent(evtType, {
                            bubbles: true, cancelable: true,
                            key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                        }));
                    });
                    // Cach 2 (fallback): neu dropdown van con mo (Enter khong
                    // an dc), thu click truc tiep vao item khop label
                    setTimeout(function() {
                        var stillOpen = document.querySelector(
                            '.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' +
                            '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)'
                        );
                        if (stillOpen) {
                            pickFirstMatch(label, cb);
                        } else if (cb) {
                            setTimeout(function() { cb(true, true); }, 200);
                        }
                    }, 400);
                }, 1000);
            }

            if (searchInput) {
                doSearch(searchInput);
            } else {
                // Khong co search => chon truc tiep
                pickFirstMatch(label, cb);
            }
        }, 700);
    }

    /** Chon item dau tien trong dropdown dang mo co text khop label.
     *  cb(ok, billable) - ok=true CHI khi thuc su tim thay va click duoc
     *  item (BUG FIX: ban truoc goi cb(true) vo dieu kien ke ca khi KHONG
     *  tim thay item nao, gay tinh phi cho thao tac that bai). */
    function pickFirstMatch(label, cb) {
        var labelNorm = label.trim().toLowerCase();
        var found = null;
        var candidates = document.querySelectorAll(
            '.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' +
            '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)'
        );
        candidates.forEach(function(item) {
            if (found) return;
            var txt = (item.textContent || '').trim().toLowerCase();
            if (txt.indexOf(labelNorm) !== -1) found = item;
        });
        if (!found) {
            // Fallback: tim trong toan trang
            document.querySelectorAll('.dx-list-item[role="option"]').forEach(function(item) {
                if (found) return;
                var txt = (item.textContent || '').trim().toLowerCase();
                if (txt.indexOf(labelNorm) !== -1) found = item;
            });
        }
        if (found) {
            pointerClick(found);
        } else {
            showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y: ' + label);
        }
        if (cb) setTimeout(function() { cb(!!found, !!found); }, 400);
    }

    // ================================================================
    //  DROPDOWN "KET LUAN" (kham lam sang) - mac dinh "Du dieu kien suc khoe"
    //  Dung cho kskdk_Oto (KSKOT_ThongTinKham) va kskdk_NguoiLaiXe
    //  (KSKLX_ThongTinKham): moi chuyen khoa (Tuan hoan, Ho hap, Mat,
    //  RHM, ...) deu co 1 o "Ket luan" dang dx-select-box voi class
    //  dang "<ChuyenKhoa>_KetLuan". Ham nay quet toan bo cac class do
    //  tren trang va chon "Du dieu kien suc khoe" cho tung o (tuan tu,
    //  vi cac lenh selectDxSelectBox chay dong thoi se cuop dropdown
    //  cua nhau - giong luu y da ghi o fillTagBox/ICD ben tren).
    // ================================================================
    var KET_LUAN_LABEL = '\u0110\u1ee7 \u0111i\u1ec1u ki\u1ec7n s\u1ee9c kh\u1ecfe';

    function getKetLuanFieldClasses() {
        var classes = {};
        document.querySelectorAll('[class*="_KetLuan"]').forEach(function(el) {
            (el.className || '').toString().split(/\s+/).forEach(function(tok) {
                if (/_KetLuan$/.test(tok)) classes[tok] = true;
            });
        });
        return Object.keys(classes).filter(function(cls) {
            var fieldItem = document.querySelector('.' + cls);
            return !!(fieldItem && fieldItem.querySelector('dx-select-box'));
        });
    }

    /** Tim option dang hien (khong an) trong 1 popup CU THE (scope theo id),
     *  khop chinh xac (hoac chua) voi label. */
    function findVisibleListItemByLabelWithin(rootEl, label) {
        var labelNorm = label.trim().toLowerCase();
        var candidates = rootEl.querySelectorAll('.dx-list-item[role="option"]:not(.dx-state-invisible)');
        var exact = null, partial = null;
        candidates.forEach(function(item) {
            var txt = (item.textContent || '').trim().toLowerCase();
            if (!exact && txt === labelNorm) exact = item;
            if (!partial && txt.indexOf(labelNorm) !== -1) partial = item;
        });
        return exact || partial;
    }

    /** Tim option dang hien (khong an) trong popup dx-select-box dang mo,
     *  khop chinh xac (hoac chua) voi label. */
    function findVisibleListItemByLabel(label) {
        var labelNorm = label.trim().toLowerCase();
        var candidates = document.querySelectorAll(
            '.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' +
            '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)'
        );
        var exact = null, partial = null;
        candidates.forEach(function(item) {
            var txt = (item.textContent || '').trim().toLowerCase();
            if (!exact && txt === labelNorm) exact = item;
            if (!partial && txt.indexOf(labelNorm) !== -1) partial = item;
        });
        return exact || partial;
    }

    /** Doi popup CUA CHINH mainInput nay mo (nhan biet qua aria-owns - ID
     *  popup rieng DevExtreme gan cho tung o select-box, KHONG doi khi mo
     *  lai nhieu lan) roi click thang vao item khop label BEN TRONG popup
     *  do - tranh bi "lac" sang popup cua o khac dang mo dong thoi (nguyen
     *  nhan chinh gay treo khi dien lien tuc nhieu o Ket luan: truoc day
     *  code tim item TREN TOAN TRANG nen hay bat nham item cua popup cu/
     *  popup khac, khien o dang mo khong bao gio duoc click dung). */
    function pickOptionInOwnDropdown(mainInput, label, cb, attempt) {
        attempt = attempt || 0;
        var popupId = mainInput && mainInput.getAttribute('aria-owns');
        var popupEl = popupId ? document.getElementById(popupId) : null;
        if (popupEl) {
            var item = findVisibleListItemByLabelWithin(popupEl, label);
            if (item) {
                pointerClick(item);
                setTimeout(function() { cb(true); }, 150);
                return;
            }
        }
        if (attempt < 15) {
            setTimeout(function() { pickOptionInOwnDropdown(mainInput, label, cb, attempt + 1); }, 60);
        } else {
            // Fallback: neu khong xac dinh duoc popup rieng (vd DevExtreme
            // ban cu khong co aria-owns), quay ve cach tim toan trang cu.
            pickOptionInOpenDropdown(label, function(found) { cb(!!found); });
        }
    }

    /** Doi popup mo roi click thang vao item khop label (khong go chu,
     *  khong doi filter) - poll nhanh (60ms/lan, toi da ~10 lan) de bat
     *  dung luc DevExtreme render xong danh sach. */
    function pickOptionInOpenDropdown(label, cb, attempt) {
        attempt = attempt || 0;
        var item = findVisibleListItemByLabel(label);
        if (item) {
            pointerClick(item);
            if (cb) setTimeout(function() { cb(true); }, 120);
            return;
        }
        if (attempt < 12) {
            setTimeout(function() { pickOptionInOpenDropdown(label, cb, attempt + 1); }, 60);
        } else if (cb) {
            cb(false);
        }
    }

    /** Kiem tra con overlay/popup dx-dropdowneditor nao dang mo (hien,
     *  khong bi an) tren trang hay khong - dung de dam bao dropdown CU
     *  da dong HAN truoc khi mo dropdown TIEP THEO, tranh 2 overlay
     *  chong len nhau (nguyen nhan gay "treo" khi dien lien tuc nhieu
     *  o Ket luan: dropdown truoc chua kip dong, code da bam mo o sau,
     *  khien pickOptionInOpenDropdown lay nham/khong thay item dung). */
    function isAnyDxOverlayOpen() {
        var overlays = document.querySelectorAll(
            '.dx-dropdowneditor-overlay:not(.dx-state-invisible), ' +
            '.dx-popup-wrapper:not(.dx-state-invisible), ' +
            '.dx-overlay-content.dx-popup-normal:not(.dx-state-invisible)'
        );
        for (var i = 0; i < overlays.length; i++) {
            var el = overlays[i];
            var rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return true;
        }
        return false;
    }

    /** Doi cho toi khi khong con overlay nao mo (poll 40ms/lan, toi da
     *  ~15 lan ~600ms) roi moi goi cb - dung truoc khi mo dropdown moi.
     *  Neu qua 600ms van con overlay cu ket dinh (vi ly do nao do khong
     *  tu dong), CHU DONG dong het cac overlay con sot lai (bam Escape /
     *  click ra ngoai) truoc khi tiep tuc, tranh chong chat vo han. */
    function waitForNoOpenOverlay(cb, attempt) {
        attempt = attempt || 0;
        if (!isAnyDxOverlayOpen()) { if (cb) cb(); return; }
        if (attempt >= 15) {
            // Cuong che dong: bam ESC + click ra vung trong body de DevExtreme
            // tu dong an cac popup con mo dang do dang.
            document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', keyCode: 27 }));
            try { document.body.click(); } catch (e) {}
            setTimeout(function() { if (cb) cb(); }, 100);
            return;
        }
        setTimeout(function() { waitForNoOpenOverlay(cb, attempt + 1); }, 40);
    }

    /** Chon nhanh 1 dx-select-box bang cach mo dropdown roi click thang
     *  vao item (khong go text/tim kiem) - danh cho cac select-box co
     *  danh sach ngan, tinh (vd "Ket luan": chi 2 lua chon). Nhanh va
     *  chac chan hon nhieu so voi typeAndEnterSelectBox/selectDxSelectBox
     *  (von phai go chu + doi filter + Enter, de bi treo neu box khong
     *  co o tim kiem thuc su). Luon cho overlay CU dong han truoc khi
     *  mo overlay MOI, va CHI click item BEN TRONG popup cua DUNG o dang
     *  thao tac (qua aria-owns) de tranh bi lan sang popup cua o khac. */
    function quickSelectDxSelectBox(fieldCls, label, cb) {
        var fieldItem = document.querySelector('.' + fieldCls);
        if (!fieldItem) { if (cb) cb(false, false); return; }
        var selectBox = fieldItem.querySelector('dx-select-box');
        if (!selectBox) { if (cb) cb(false, false); return; }

        // BUG FIX: neu o "Ket luan" da dang la gia tri can chon roi, KHONG
        // mo dropdown lai va KHONG tinh phi - tranh tinh phi trung khi bam
        // lai nut tren trang da dien du lieu roi.
        var mainInputEarly = selectBox.querySelector('input.dx-texteditor-input');
        var labelNormEarly = label.trim().toLowerCase();
        var currentValEarly = (mainInputEarly && mainInputEarly.value) ? mainInputEarly.value.trim().toLowerCase() : '';
        if (currentValEarly && (currentValEarly === labelNormEarly || currentValEarly.indexOf(labelNormEarly) !== -1)) {
            if (cb) cb(true, false);
            return;
        }

        waitForNoOpenOverlay(function() {
            // Cuon field vao vung nhin thay (mot so trinh duyet/DevExtreme
            // khong mo dropdown dung vi tri neu field dang nam ngoai vung
            // nhin thay).
            try { fieldItem.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (e) {}

            var dropBtn = selectBox.querySelector('.dx-dropdowneditor-button');
            var mainInput = selectBox.querySelector('input.dx-texteditor-input');
            if (dropBtn) pointerClick(dropBtn);
            else if (mainInput) pointerClick(mainInput);

            pickOptionInOwnDropdown(mainInput, label, function(ok) {
                // Sau khi click chon, doi overlay dong han roi moi bao xong -
                // dam bao field/dropdown ke tiep khong bi vuong overlay nay.
                waitForNoOpenOverlay(function() { if (cb) cb(ok, ok); });
            });
        });
    }

    function selectAllKetLuanDuDieuKien(doneCallback) {
        var classes = getKetLuanFieldClasses();
        var idx = 0, count = 0;
        function next() {
            if (idx >= classes.length) {
                if (doneCallback) doneCallback(count);
                return;
            }
            var cls = classes[idx++];
            quickSelectDxSelectBox(cls, KET_LUAN_LABEL, function(ok, billable) {
                if (billable) count++;
                setTimeout(next, 120);
            });
        }
        next();
    }

    // Tra ve true neu tim thay va click duoc option
    function selectListRadioByLabel(label) {
        var labelNorm = label.trim().toLowerCase();
        var found = null;
        document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
            if (found) return;
            var lbl = item.querySelector('.dx-item-content.dx-list-item-content');
            if (!lbl) return;
            var txt = (lbl.textContent || '').trim().toLowerCase();
            if (txt.indexOf(labelNorm) !== -1) found = item;
        });
        if (found) {
            // BUG FIX: neu muc nay DA duoc chon tu truoc, khong click lai va
            // khong tinh phi (tranh tinh phi trung khi bam lai nut).
            var isSelected = found.classList.contains('dx-list-item-selected') ||
                found.getAttribute('aria-selected') === 'true';
            if (isSelected) return false;
            pointerClick(found);
            var icon = found.querySelector('.dx-radiobutton-icon');
            if (icon) pointerClick(icon);
            return true;
        }
        return false;
    }

    /** Chon 1 option trong dx-radio-group (khac voi selectListRadioByLabel
     *  dung cho dx-list). containerCls: class cha bao ngoai dx-radio-group. */
    /** Click day du bo su kien (pointer + mouse + click) len 1 phan tu,
     *  de tuong thich voi cac widget DevExtreme doi hoi mousedown/mouseup
     *  chu khong chi pointerdown/pointerup. */
    function fullClick(el) {
        if (!el) return;
        var opts = { bubbles: true, cancelable: true, view: _pageWin };
        el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ pointerId: 1, pointerType: 'mouse' }, opts)));
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        el.dispatchEvent(new PointerEvent('pointerup', Object.assign({ pointerId: 1, pointerType: 'mouse' }, opts)));
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.dispatchEvent(new MouseEvent('click', opts));
    }

    /** Chon 1 option trong dx-radio-group (khac voi selectListRadioByLabel
     *  dung cho dx-list). containerCls: class cha bao ngoai dx-radio-group.
     *  Co retry: click xong kiem tra aria-checked, neu chua an thi thu lai
     *  bang cach click vao icon/dx-item-content truoc khi bao loi. */
    function selectRadioGroupByLabel(containerCls, label, cb, _attempt) {
        _attempt = _attempt || 0;
        var container = document.querySelector('.' + containerCls);
        if (!container) { if (cb) cb(false, false); return; }
        var labelNorm = label.trim().toLowerCase();
        var found = null;
        container.querySelectorAll('.dx-item.dx-radiobutton[role="radio"]').forEach(function(item) {
            if (found) return;
            var lbl = item.querySelector('.dx-item-content');
            if (!lbl) return;
            var txt = (lbl.textContent || '').trim().toLowerCase();
            if (txt === labelNorm) found = item;
        });
        if (!found) { if (cb) cb(false, false); return; }

        // BUG FIX: neu da chon dung muc nay tu truoc (chi kiem tra o lan
        // goi dau tien, khong phai luc retry), khong click lai va khong
        // tinh phi - tranh tinh phi trung khi bam lai nut.
        if (_attempt === 0 && found.getAttribute('aria-checked') === 'true') {
            if (cb) cb(true, false);
            return;
        }

        // Thu cac muc tieu click khac nhau tuy theo lan thu:
        // 0: icon; 1: item-content (chu); 2: ca item container
        var targets = [
            found.querySelector('.dx-radiobutton-icon'),
            found.querySelector('.dx-item-content'),
            found,
        ];
        var target = targets[Math.min(_attempt, targets.length - 1)] || found;
        fullClick(target);

        setTimeout(function() {
            var ok = found.getAttribute('aria-checked') === 'true';
            if (ok) {
                if (cb) cb(true, true);
            } else if (_attempt < 2) {
                selectRadioGroupByLabel(containerCls, label, cb, _attempt + 1);
            } else {
                if (cb) cb(false, false);
            }
        }, 250);
    }

    // ----------------------------------------------------------------
    //  CHON "DA TIEM" cho bang Tiem chung (KSKTE_ThongTinPhieu_Tab)
    //  Quet 1 lan toan bo cot tiem/uong (td[aria-colindex="6"]), tick
    //  "Da tiem" cho cac o chua co lua chon hoac dang la "Khong nho ro".
    //  Chi chay khi user tu bam nut trong Thao tac nhanh (khong tu dong).
    //  Chuyen tu userscript rieng "AUTOMATICALLY SELECT DA TIEM".
    // ----------------------------------------------------------------
    var TC_TEXT_TARGET = '\u0110\u00e3 ti\u00eam';
    var TC_COL_INDEX = '6';
    var TC_SELECTOR_CANDIDATES = ['.dx-radiogroup', '.dx-radio-group', '[role="radiogroup"]'];

    function tcNormalize(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

    function tcTriggerClick(el) {
        if (!el) return;
        var opts = { bubbles: true, cancelable: true, composed: true };
        try {
            el.dispatchEvent(new PointerEvent('pointerdown', opts));
            el.dispatchEvent(new PointerEvent('pointerup', opts));
        } catch (e) {
            el.dispatchEvent(new MouseEvent('mousedown', opts));
            el.dispatchEvent(new MouseEvent('mouseup', opts));
        }
        el.dispatchEvent(new MouseEvent('click', opts));
    }

    function tcFindRadioItemByText(rgEl, text) {
        if (!rgEl) return null;
        var items = rgEl.querySelectorAll('.dx-item, .dx-radiobutton, [role="radio"]');
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var label = it.querySelector('.dx-item-content') || it;
            if (label && tcNormalize(label.textContent) === text) return it;
        }
        return null;
    }

    function tcGetCheckedText(rgEl) {
        var checkedLabel =
            rgEl.querySelector('.dx-radiobutton-checked .dx-item-content') ||
            rgEl.querySelector('[aria-checked="true"] .dx-item-content') ||
            rgEl.querySelector('[aria-selected="true"] .dx-item-content') ||
            rgEl.querySelector('[aria-checked="true"]') ||
            rgEl.querySelector('[aria-selected="true"]');
        return checkedLabel ? tcNormalize(checkedLabel.textContent || checkedLabel.innerText || '') : null;
    }

    // Tra ve true neu co click "Da tiem" thuc su (tinh phi theo o)
    function tcProcessRadioGroup(rgEl) {
        if (!rgEl) return false;
        var checkedText = tcGetCheckedText(rgEl);
        // Chi xu ly khi chua co lua chon HOAC dang la "Khong nho ro"
        if (checkedText === null || checkedText === 'Kh\u00f4ng nh\u1edb r\u00f5') {
            var targetItem = tcFindRadioItemByText(rgEl, TC_TEXT_TARGET);
            if (targetItem) {
                tcTriggerClick(targetItem);
                return true;
            }
        }
        return false;
    }

    // Quet 1 lan toan bo cot tiem/uong tren trang, tra ve so o da tick
    function tcScanTableColumnOnce() {
        var count = 0;
        var tds = document.querySelectorAll('td[aria-colindex="' + TC_COL_INDEX + '"]');
        tds.forEach(function(td) {
            var found = false;
            for (var s = 0; s < TC_SELECTOR_CANDIDATES.length; s++) {
                var rg = td.querySelector(TC_SELECTOR_CANDIDATES[s]);
                if (rg) { if (tcProcessRadioGroup(rg)) count++; found = true; break; }
            }
            if (!found) {
                var fallback = td.querySelector('.dx-widget.dx-collection, .dx-item');
                if (fallback && tcProcessRadioGroup(fallback)) count++;
            }
        });
        return count;
    }

    // Quet toan trang, tick "Binh thuong" cho cac radiogroup co option
    // do (vd cau hoi San khoa: Binh thuong / Khong binh thuong).
    // Tra ve so o thuc su duoc tick (dung tinh phi theo o).
    function tickAllBinhThuongRadio() {
        var done = 0;
        document.querySelectorAll('.dx-radiogroup.dx-widget, [role="radiogroup"]').forEach(function(group) {
            var items = group.querySelectorAll('.dx-item.dx-radiobutton, [role="radio"]');
            var found = null;
            for (var k = 0; k < items.length; k++) {
                var lbl = items[k].querySelector('.dx-item-content') || items[k];
                var txt = (lbl.textContent || '').trim();
                if (txt === 'B\u00ecnh th\u01b0\u1eddng') { found = items[k]; break; }
            }
            if (!found) return;
            var isChecked = found.classList.contains('dx-radiobutton-checked') || found.getAttribute('aria-checked') === 'true';
            if (isChecked) return;
            var icon = found.querySelector('.dx-radiobutton-icon');
            fullClick(icon || found);
            done++;
        });
        return done;
    }

    // ----------------------------------------------------------------
    //  KSKD18_TAB_DANHGIATAMTHAN - Danh gia suc khoe tam than
    //  2 tab: "Giam chu y - tang dong" (3 dap an: Khong co / Thinh
    //  thoang / Thuong xuyen) va "Pho tu ky" (4 dap an: Hoan toan dong y /
    //  Co chut dong y / Co chut khong dong y / Hoan toan khong dong y).
    //  Chuyen tu 2 userscript rieng "SUC KHOE TAM THAN" (v3.3.1 / M-CHAT-R
    //  v3.6), gop lai thanh 2 nut Thao tac nhanh - chi chay khi bam,
    //  khong tu dong chay ngam nhu ban goc.
    // ----------------------------------------------------------------
    var TAMTHAN_ADHD_TARGET = 'Kh\u00f4ng c\u00f3';
    var TAMTHAN_AUTISM_TARGET_AGREE = 'Ho\u00e0n to\u00e0n \u0111\u1ed3ng \u00fd';
    var TAMTHAN_AUTISM_TARGET_DISAGREE = 'Ho\u00e0n to\u00e0n kh\u00f4ng \u0111\u1ed3ng \u00fd';
    // Cac cau "nguoc" trong Pho tu ky -> chon "Hoan toan khong dong y" thay
    // vi "Hoan toan dong y" (ke thua tu userscript SKTT v3.3.1 goc).
    var TAMTHAN_AUTISM_DISAGREE_ROWS = [5, 7, 10];

    function tamThanBuildAutismExceptionMap() {
        var map = {};
        TAMTHAN_AUTISM_DISAGREE_ROWS.forEach(function(r) { map[r] = TAMTHAN_AUTISM_TARGET_DISAGREE; });
        return map;
    }

    // Quet 1 lan toan bo bang cau hoi hien tai, click dap an mac dinh
    // (hoac ngoai le theo so thu tu cau) neu chua co lua chon.
    // Tra ve so cau thuc su duoc tick (dung tinh phi theo cau).
    function tamThanScanRowsOnce(defaultText, exceptionMap) {
        var done = 0;
        document.querySelectorAll('.dx-data-row[aria-rowindex]').forEach(function(row) {
            var idxCell = row.querySelector('td[aria-colindex="1"]');
            if (!idxCell) return;
            var rowIndex = parseInt((idxCell.textContent || '').trim(), 10);
            if (isNaN(rowIndex)) return;
            // Bo qua dong thuoc tab dang bi an (display:none) - tranh dem/dien
            // nham cau hoi cua tab kia khi ca 2 bang van con trong DOM.
            if (!row.offsetParent) return;
            var target = (exceptionMap && exceptionMap[rowIndex]) || defaultText;

            // Cau tra loi la 1 danh sach dx-list (role="listbox"), moi dap an
            // la 1 item .dx-item.dx-list-item[role="option"] chua ben trong
            // 1 nut radio .dx-radiobutton[role="radio"] - KHONG phai
            // .dx-radiogroup[role="radiogroup"] nhu cac cho khac trong trang.
            var items = row.querySelectorAll('.dx-item.dx-list-item[role="option"]');
            if (!items.length) return;
            var found = null;
            items.forEach(function(it) {
                if (found) return;
                var lbl = it.querySelector('.dx-item-content.dx-list-item-content') || it;
                var txt = (lbl.textContent || '').trim();
                if (txt === target) found = it;
            });
            if (!found) return;
            var radio = found.querySelector('.dx-radiobutton[role="radio"]');
            if (!radio) return;
            var isChecked = radio.getAttribute('aria-checked') === 'true';
            if (isChecked) return;
            fullClick(found);
            var icon = radio.querySelector('.dx-radiobutton-icon');
            if (icon) fullClick(icon);
            done++;
        });
        return done;
    }

    // Chay 3 lan cach nhau 350ms de bat cac dong render tre (virtual scroll)
    function tamThanAutoFill(defaultText, exceptionMap, doneCallback) {
        var total = 0;
        total += tamThanScanRowsOnce(defaultText, exceptionMap);
        setTimeout(function() {
            total += tamThanScanRowsOnce(defaultText, exceptionMap);
            setTimeout(function() {
                total += tamThanScanRowsOnce(defaultText, exceptionMap);
                if (doneCallback) doneCallback(total);
            }, 350);
        }, 350);
    }

    // Dien "Binh thuong" vao o textarea "Ket qua danh gia" (.KetQua) cua
    // DUNG tab dang mo. Ca 2 tab deu co field cung class ".KetQua" nen phai
    // loc theo offsetParent (tab dang an co display:none -> offsetParent
    // null) - cung ly do nhu bug 2 nut hien trung nhau da sua o tren.
    // Chi dien khi o dang trong (khong ghi de noi dung bac si da go san).
    function tamThanFillKetQua(text) {
        var filled = false;
        document.querySelectorAll('.KetQua').forEach(function(item) {
            if (filled) return; // moi tab chi co 1 o Ket qua dang hien, dien xong la thoi
            if (!item.offsetParent) return; // bo qua o thuoc tab dang an
            var ta = item.querySelector('textarea.dx-texteditor-input');
            if (!ta) return;
            if ((ta.value || '').trim()) return; // da co noi dung -> khong ghi de
            ta.focus({ preventScroll: true });
            nativeTextAreaSetter.call(ta, text);
            ta.dispatchEvent(new Event('input',  { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
            ta.blur();
            filled = true;
        });
        return filled;
    }


    //  Tick "Am Tinh" cho toan bo 5 xet nghiem ma tuy bat buoc:
    //  Amphetamin, Marijuana, Morphin, Codein, Heroin.
    //  Dien 1 luot tuc thi (giong co che TE6_TTHC_FIELDS / te6ClickRadioInGroup):
    //  vong lap forEach dong bo, khong setTimeout/retry, vi chi co 5 muc va
    //  cac o deu da render san tren trang (khong phai virtual-scroll).
    // ----------------------------------------------------------------
    var DRUG_TEST_FIELDS = ['XN_Amphetamin', 'XN_Marijuana', 'XN_Morphin', 'XN_Codein', 'XN_Heroin'];

    function autoDrugTestAmTinh() {
        var done = 0, clicked = 0, missed = [];
        DRUG_TEST_FIELDS.forEach(function(field) {
            var r = te6ClickRadioInGroup(field, '\u00c2m T\u00ednh');
            if (r.found) { done++; if (r.clicked) clicked++; } else missed.push(field);
        });
        if (missed.length) console.warn('[DrugTest] Khong xu ly duoc:', missed);
        return { done: done, total: DRUG_TEST_FIELDS.length, clicked: clicked, missed: missed };
    }

    // ----------------------------------------------------------------
    //  KSKD18_ThongTinKham (Thong tin kham benh nhan duoi 18 tuoi)
    //  Quet toan trang: tick "Loai I" cho moi khoi "Phan loai" (dx-list),
    //  va tick option chua chu "Binh thuong" cho moi radiogroup co option
    //  do (vd: Cot song, ...). Dien 1 luot tuc thi, khong setTimeout.
    // ----------------------------------------------------------------
    function autoSelectLoaiIAndBinhThuong() {
        var done = 0, missed = 0;

        // 1) Phan loai -> "Loai I" (dx-list, item la .dx-item.dx-list-item)
        document.querySelectorAll('.dx-list.dx-widget').forEach(function(list) {
            var items = list.querySelectorAll('.dx-item.dx-list-item');
            var found = null;
            for (var j = 0; j < items.length; j++) {
                var c2 = items[j].querySelector('.dx-list-item-content') || items[j];
                var t2 = (c2.textContent || '').trim();
                if (t2 === 'Lo\u1ea1i I') { found = items[j]; break; }
            }
            if (!found) return;
            var isSelected = found.classList.contains('dx-list-item-selected') || found.getAttribute('aria-selected') === 'true';
            if (isSelected) return; // da chon roi - KHONG tinh phi
            var icon = found.querySelector('.dx-list-select-radiobutton, .dx-radio-value-container');
            fullClick(icon || found);
            done++;
        });

        // 2) Cac radiogroup co option chua chu "Binh thuong" -> tick option do
        document.querySelectorAll('.dx-radiogroup.dx-widget').forEach(function(group) {
            var items = group.querySelectorAll('.dx-item.dx-radiobutton');
            var found = null;
            for (var k = 0; k < items.length; k++) {
                var txt = (items[k].textContent || '').trim();
                if (txt.indexOf('B\u00ecnh th\u01b0\u1eddng') !== -1) { found = items[k]; break; }
            }
            if (!found) return;
            if (found.classList.contains('dx-radiobutton-checked')) return; // da chon roi - KHONG tinh phi
            var icon2 = found.querySelector('.dx-radiobutton-icon');
            fullClick(icon2 || found);
            done++;
        });

        return { done: done, missed: missed };
    }

    // onDone(count) - count la so o thuc su duoc dien (dung tinh phi 1 o = 1 nhiem vu)
    function fillThongTinHanhChinh(onDone) {
        showToast('\u23f3 \u0110ang \u0111i\u1ec1n Th\u00f4ng tin h\u00e0nh ch\u00ednh...');
        var count = 0;

        // Trang rieng: KSK Viec lam + Lai xe
        // (kskdk_thongtinkhamtren18/.../KSKT18_TTHC) co quy tac dien khac:
        // - KHONG can dien Xa/Phuong
        // - Dia diem kham -> "Co so kham chua benh" (thay vi "Kham luu dong")
        // - Hinh thuc chi tra -> "Nguoi su dung lao dong chi tra" (thay vi
        //   "Ngan sach thanh pho ho tro")
        var isKSKT18 = window.location.href.indexOf('kskdk_thongtinkhamtren18') !== -1;
        var hinhThucChiTraLabel = isKSKT18
            ? 'Ng\u01b0\u1eddi s\u1eed d\u1ee5ng lao \u0111\u1ed9ng chi tr\u1ea3'
            : 'Ng\u00e2n s\u00e1ch th\u00e0nh ph\u1ed1 h\u1ed7 tr\u1ee3';
        var diaDiemKhamLabel = isKSKT18
            ? 'C\u01a1 s\u1edf kh\u00e1m ch\u1eefa b\u1ec7nh'
            : 'Kh\u00e1m l\u01b0u \u0111\u1ed9ng';

        function finish() {
            showToast('\u2705 \u0110\u00e3 \u0111i\u1ec1n xong: Th\u00f4ng tin h\u00e0nh ch\u00ednh');
            if (onDone) onDone(count);
        }

        function step2() {
            // B2: Hinh thuc chi tra
            setTimeout(function() {
                if (selectListRadioByLabel(hinhThucChiTraLabel)) count++;
                // B3: Dia diem kham
                setTimeout(function() {
                    selectDxSelectBox('DoiTuongKham', diaDiemKhamLabel, function(ok, billable) {
                        if (billable) count++;
                        // B4 (neu co truong DoiTuong_M13): chon "Nguoi lao dong phi chinh thuc"
                        setTimeout(function() {
                            function finishFillTTHC() {
                                // B5 (neu co truong NgheNghiepId - dropdown "Nghe nghiep",
                                // rieng trang kskdk_thongtinkham/.../KSKDK_TTHC):
                                // chon "Lao dong tu do"
                                setTimeout(function() {
                                    function step6() {
                                        // B6: Dan toc -> "Kinh" (neu co truong DanTocId)
                                        setTimeout(function() {
                                            function step7() {
                                                // B7: Hinh thuc kham -> "Kham Theo Hop Dong"
                                                // (neu co truong HinhThucChiTraKhamSK_ChiTiet)
                                                setTimeout(function() {
                                                    if (document.querySelector('.HinhThucChiTraKhamSK_ChiTiet')) {
                                                        selectRadioGroupByLabel('HinhThucChiTraKhamSK_ChiTiet', 'Kh\u00e1m Theo H\u1ee3p \u0110\u1ed3ng', function(ok, billable) {
                                                            if (billable) count++;
                                                            if (!ok) showToast('\u26a0 Kh\u00f4ng ch\u1ecdn \u0111\u01b0\u1ee3c H\u00ecnh th\u1ee9c kh\u00e1m, vui l\u00f2ng ch\u1ecdn tay');
                                                            finish();
                                                        });
                                                    } else {
                                                        finish();
                                                    }
                                                }, 300);
                                            }
                                            if (document.querySelector('.DanTocId')) {
                                                typeAndEnterSelectBox('DanTocId', 'Kinh', function(ok, billable) { if (billable) count++; step7(); });
                                            } else {
                                                step7();
                                            }
                                        }, 300);
                                    }
                                    if (document.querySelector('.NgheNghiepId')) {
                                        selectDxSelectBox('NgheNghiepId', 'Lao \u0111\u1ed9ng t\u1ef1 do', function(ok, billable) { if (billable) count++; step6(); });
                                    } else {
                                        step6();
                                    }
                                }, 300);
                            }
                            if (document.querySelector('.DoiTuong_M13')) {
                                selectDxSelectBox('DoiTuong_M13', 'Ng\u01b0\u1eddi lao \u0111\u1ed9ng phi ch\u00ednh th\u1ee9c', function(ok, billable) { if (billable) count++; finishFillTTHC(); });
                            } else {
                                finishFillTTHC();
                            }
                        }, 300);
                    });
                }, 300);
            }, 200);
        }

        // B1: Xa/Phuong -> "Xa Bac Tan Uyen" (bo qua tren trang KSKT18_TTHC)
        if (isKSKT18) {
            step2();
        } else {
            typeAndEnterSelectBox('DiaChiHienTai_XaPhuong', 'X\u00e3 B\u1eafc T\u00e2n Uy\u00ean', function(ok, billable) { if (billable) count++; step2(); });
        }
    }

    // Tra ve so o thuc su duoc dien (0-4)
    function fillCommonNumbers() {
        var c = 0;
        if (setNumberField('TMH_TaiTrai_NoiThuong', '5')) c++;
        if (setNumberField('TMH_TaiPhai_NoiThuong', '5')) c++;
        if (setNumberField('TMH_TaiTrai_NoiTham',   '0,5')) c++;
        if (setNumberField('TMH_TaiPhai_NoiTham',   '0,5')) c++;
        return c;
    }

    // Tra ve so o thuc su co thao tac (dung tinh phi)
    function resetAll() {
        var c = 0;
        if (clearNumberField('Mat_KhongKinh_MP')) c++;
        if (clearNumberField('Mat_KhongKinh_MT')) c++;
        if (clearNumberField('Mat_CoKinh_MP')) c++;
        if (clearNumberField('Mat_CoKinh_MT')) c++;
        if (clearTagBox('Mat_ChanDoanXacDinh_ICD')) c++;
        if (clearTagBox('RHM_ChanDoanXacDinh_ICD')) c++;
        var matCb = document.querySelector('.Mat_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
        if (matCb && untickCheckbox(matCb)) c++;
        var rhmCb = document.querySelector('.RHM_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
        if (rhmCb && untickCheckbox(rhmCb)) c++;
        return c;
    }

    function showICDPopup(onSelect) {
        var overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '3000000',
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
        });
        var box = document.createElement('div');
        Object.assign(box.style, {
            background: '#fff', borderRadius: '12px',
            padding: '24px 28px', width: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)', fontFamily: 'sans-serif',
        });
        box.innerHTML =
            '<div style="font-size:15px;font-weight:700;margin-bottom:16px;color:#1a1a1a">' +
                '\ud83d\udc41\ufe0f Ch\u1ecdn m\u00e3 ch\u1ea9n \u0111o\u00e1n x\u00e1c \u0111\u1ecbnh (M\u1eaft)' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<button id="_icd_h520" style="padding:12px 16px;background:#1976d2;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">H52.0 \u2014 T\u1eadt vi\u1ec5n th\u1ecb</button>' +
                '<button id="_icd_h521" style="padding:12px 16px;background:#1976d2;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">H52.1 \u2014 T\u1eadt c\u1eadn th\u1ecb</button>' +
                '<button id="_icd_cancel" style="padding:10px 16px;background:#e0e0e0;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Hu\u1ef7</button>' +
            '</div>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        overlay.querySelector('#_icd_h520').onclick = function() { overlay.remove(); onSelect('H52.0'); };
        overlay.querySelector('#_icd_h521').onclick = function() { overlay.remove(); onSelect('H52.1'); };
        overlay.querySelector('#_icd_cancel').onclick = function() { overlay.remove(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    }

    // ================================================================
    //  POPUP TRUNG TAM: KSK Viec lam + Lai xe
    //  Cho phep chon to hop ket qua kham mat/rang voi 4 lua chon:
    //  Binh thuong | Co kinh: Can thi | Co kinh: Vien thi | Mat rang.
    //  Quy tac loai tru: Binh thuong / Can thi / Vien thi la nhom
    //  "chi chon 1" (giong radio); Mat rang doc lap, chi bi mo khi
    //  "Binh thuong" duoc chon (vi Binh thuong nghia la khong co bat
    //  thuong nao ca).
    // ================================================================
    function showVLOptionsPopup(onConfirm) {
        var overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '3000000',
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
        });
        var box = document.createElement('div');
        Object.assign(box.style, {
            background: '#fff', borderRadius: '12px',
            padding: '24px 28px', width: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)', fontFamily: 'sans-serif',
        });
        function rowHtml(id, text) {
            return '<label id="_vlrow_' + id + '" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e0e0e0;border-radius:8px;cursor:pointer;transition:opacity .15s;">' +
                       '<input type="checkbox" id="_vlcb_' + id + '" style="width:18px;height:18px;flex-shrink:0;">' +
                       '<span style="font-size:14px;font-weight:600;color:#1a1a1a;">' + text + '</span>' +
                   '</label>';
        }
        box.innerHTML =
            '<div style="font-size:15px;font-weight:700;margin-bottom:16px;color:#1a1a1a">' +
                '\ud83d\udccb Ch\u1ecdn k\u1ebft qu\u1ea3 kh\u00e1m' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">' +
                rowHtml('bt', 'B\u00ecnh th\u01b0\u1eddng') +
                rowHtml('ct', 'C\u00f3 k\u00ednh: C\u1eadn th\u1ecb') +
                rowHtml('vt', 'C\u00f3 k\u00ednh: Vi\u1ec5n th\u1ecb') +
                rowHtml('mr', 'M\u1ea5t r\u0103ng') +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<button id="_vl_ok" style="flex:1;padding:10px 16px;background:#2e7d32;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">OK</button>' +
                '<button id="_vl_cancel" style="flex:1;padding:10px 16px;background:#e0e0e0;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Hu\u1ef7</button>' +
            '</div>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        var cbBT = overlay.querySelector('#_vlcb_bt');
        var cbCT = overlay.querySelector('#_vlcb_ct');
        var cbVT = overlay.querySelector('#_vlcb_vt');
        var cbMR = overlay.querySelector('#_vlcb_mr');
        var rowBT = overlay.querySelector('#_vlrow_bt');
        var rowCT = overlay.querySelector('#_vlrow_ct');
        var rowVT = overlay.querySelector('#_vlrow_vt');
        var rowMR = overlay.querySelector('#_vlrow_mr');

        function setRowEnabled(row, cb, enabled) {
            cb.disabled = !enabled;
            row.style.opacity = enabled ? '1' : '0.4';
            row.style.cursor = enabled ? 'pointer' : 'not-allowed';
            if (!enabled) cb.checked = false;
        }

        function updateStates() {
            if (cbBT.checked) {
                setRowEnabled(rowCT, cbCT, false);
                setRowEnabled(rowVT, cbVT, false);
                setRowEnabled(rowMR, cbMR, false);
            } else if (cbCT.checked) {
                setRowEnabled(rowBT, cbBT, false);
                setRowEnabled(rowVT, cbVT, false);
                setRowEnabled(rowMR, cbMR, true);
            } else if (cbVT.checked) {
                setRowEnabled(rowBT, cbBT, false);
                setRowEnabled(rowCT, cbCT, false);
                setRowEnabled(rowMR, cbMR, true);
            } else {
                setRowEnabled(rowBT, cbBT, true);
                setRowEnabled(rowCT, cbCT, true);
                setRowEnabled(rowVT, cbVT, true);
                setRowEnabled(rowMR, cbMR, true);
            }
        }
        [cbBT, cbCT, cbVT, cbMR].forEach(function(cb) {
            cb.addEventListener('change', updateStates);
        });
        updateStates();

        overlay.querySelector('#_vl_ok').onclick = function() {
            var opts = {
                binhThuong: cbBT.checked,
                canThi: cbCT.checked,
                vienThi: cbVT.checked,
                matRang: cbMR.checked,
            };
            if (!opts.binhThuong && !opts.canThi && !opts.vienThi && !opts.matRang) {
                showToast('\u26a0\ufe0f Vui l\u00f2ng ch\u1ecdn \u00edt nh\u1ea5t 1 m\u1ee5c');
                return;
            }
            overlay.remove();
            onConfirm(opts);
        };
        overlay.querySelector('#_vl_cancel').onclick = function() { overlay.remove(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    }

    // onDone(count) - count la so o thuc su duoc dien (KHONG tinh phan
    // "Ket luan" cua KSK O to/Lai xe, phan do tu bill rieng qua callback
    // cua selectAllKetLuanDuDieuKien vi no hoan tat muon hon).
    function applyVLSelections(opts, onDone) {
        // BUG FIX: resetAll() chi la buoc chuan bi (xoa gia tri cu), KHONG dem vao
        // phi vi cac truong do se duoc set lai ngay sau (tinh phi 1 lan qua setNumberField).
        // Dem ca clear lan set cua cung 1 o = tru phi 2x cho 1 thao tac.
        resetAll();
        var total = 0;
        setTimeout(function() {
            var hasEyeIssue = opts.canThi || opts.vienThi;

            // B1: tick "Chua phat hien bat thuong" cho tat ca, tru cac
            // chuyen khoa co bat thuong duoc chon (Mat / RHM)
            var cbExceptions = [];
            if (hasEyeIssue) cbExceptions.push('Mat_ChuaPhatHienBatThuong');
            if (opts.matRang) cbExceptions.push('RHM_ChuaPhatHienBatThuong');
            total += tickAllChuaPhatHien(cbExceptions);

            // B2: chon "Loai I" cho tat ca, tru cac chuyen khoa o tren ->
            // chon "Loai II"
            var radioExceptions = [];
            if (hasEyeIssue) radioExceptions.push('Mat_PhanLoai');
            if (opts.matRang) radioExceptions.push('RHM_PhanLoai');
            if (radioExceptions.length > 0) {
                total += selectRadioMultiException(radioExceptions, 'Lo\u1ea1i II', 'Lo\u1ea1i I');
            } else {
                selectRadioWithException('__none__', 'Lo\u1ea1i I', 'Lo\u1ea1i I');
            }

            // B3: dien thi luc - co kinh neu can/vien thi, khong kinh neu binh thuong
            if (hasEyeIssue) {
                if (setNumberField('Mat_CoKinh_MP', '10')) total++;
                if (setNumberField('Mat_CoKinh_MT', '10')) total++;
            } else {
                if (setNumberField('Mat_KhongKinh_MP', '10')) total++;
                if (setNumberField('Mat_KhongKinh_MT', '10')) total++;
            }
            total += fillCommonNumbers();

            // B4: dien ICD tuong ung va thong bao
            // Luu y: fillTagBox tim item trong dropdown bang selector toan
            // trang (khong gioi han theo field), nen 2 lenh fillTagBox goi
            // dong thoi (cung delay) se cuop focus/dropdown cua nhau. Phai
            // giai cach cac lenh de chay tuan tu.
            var parts = [];
            var icdDelay = 300;
            if (opts.binhThuong) parts.push('B\u00ecnh th\u01b0\u1eddng');
            if (opts.canThi) {
                setTimeout(function() { fillTagBox('Mat_ChanDoanXacDinh_ICD', 'H52.1'); }, icdDelay);
                parts.push('C\u1eadn th\u1ecb (H52.1)');
                total++;
                icdDelay += 1500;
            }
            if (opts.vienThi) {
                setTimeout(function() { fillTagBox('Mat_ChanDoanXacDinh_ICD', 'H52.0'); }, icdDelay);
                parts.push('Vi\u1ec5n th\u1ecb (H52.0)');
                total++;
                icdDelay += 1500;
            }
            if (opts.matRang) {
                setTimeout(function() { fillTagBox('RHM_ChanDoanXacDinh_ICD', 'K08.1'); }, icdDelay);
                parts.push('M\u1ea5t r\u0103ng (K08.1)');
                total++;
                icdDelay += 1500;
            }
            showToast('\u2705 \u0110\u00e3 \u0111i\u1ec1n: ' + parts.join(' + '));
            if (onDone) onDone(total);

            // B5: rieng trang KSK O to / Nguoi lai xe (muc kham lam sang)
            // - tu dong chon "Du dieu kien suc khoe" cho toan bo o "Ket luan"
            //   cua tat ca chuyen khoa (Tuan hoan, Ho hap, Mat, RHM, ...).
            // Bill rieng (setTimeout khac, hoan tat muon hon phan tren).
            var isOtoOrLaiXe =
                window.location.href.indexOf('KSKOT_ThongTinKham') !== -1 ||
                window.location.href.indexOf('KSKLX_ThongTinKham') !== -1;
            if (isOtoOrLaiXe) {
                setTimeout(function() {
                    selectAllKetLuanDuDieuKien(function(count) {
                        if (count > 0) {
                            showToast('\u2705 \u0110\u00e3 ch\u1ecdn "' + KET_LUAN_LABEL + '" cho ' + count + ' m\u1ee5c K\u1ebft lu\u1eadn');
                            spendCredits(count);
                        }
                    });
                }, icdDelay + 300);
            }
        }, 400);
    }

    // Tra ve true neu TIM THAY va DA DAT DUNG gia tri (moi click hoac da
    // dung san tu truoc) - dung de tinh CHINH XAC so o da xu ly, phuc vu
    // tinh phi "1 o = 1 nhiem vu" (khong con khoan phi co dinh nua).
    function selectNCTRadio(code, optLabel) {
        var rows = document.querySelectorAll('tr[role="row"]');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var codeCell = row.querySelector('td[aria-colindex="1"]');
            if (!codeCell || codeCell.textContent.trim() !== code) continue;
            // Tim options trong cot bac si danh gia (aria-colindex=3)
            var evalCell = row.querySelector('td[aria-colindex="3"]');
            if (!evalCell) return false;
            var options = evalCell.querySelectorAll('.dx-item.dx-list-item[role="option"]');
            for (var j = 0; j < options.length; j++) {
                var opt = options[j];
                var lbl = opt.querySelector('.dx-item-content.dx-list-item-content');
                if (!lbl) continue;
                if ((lbl.textContent || '').trim() !== optLabel) continue;
                var radio = opt.querySelector('.dx-list-select-radiobutton[role="radio"]');
                // BUG FIX: truoc day o da chon san van duoc tinh la 1 luot
                // ("da chon roi - van tinh 1 o") - day la nguyen nhan khien
                // bam lai nut "Tien su kham thuc the" tren trang DA DIEN ROI
                // bi tru phi TRUNG cho toan bo 8 o (B1..B1.7) du khong co
                // thao tac nao moi ca. Nay CHI tinh phi khi vua thuc su click.
                if (radio && radio.getAttribute('aria-checked') === 'true') return false; // da chon roi - KHONG tinh phi
                // Click giong nhu action "Khong/Hau nhu khong"
                pointerClick(opt);
                return true;
            }
            return false;
        }
        return false;
    }

    // doneCallback(count) - count la so O THUC SU duoc xac nhan dung gia
    // tri (tim thay + da/dang dung), dung de tinh phi CHINH XAC 1 o = 1
    // nhiem vu thay vi khoan co dinh.
    function selectNCTRadioBulk(list, doneCallback) {
        var idx = 0;
        var count = 0;
        function next() {
            if (idx >= list.length) {
                if (doneCallback) doneCallback(count);
                return;
            }
            var item = list[idx++];
            if (selectNCTRadio(item.code, item.opt)) count++;
            setTimeout(next, 30);
        }
        next();
    }

    // Quet toan bo cac cap radio "Co" / "Khong" tren trang "Tien su benh cua
    // doi tuong" (bao gom cac dong trong bang STT 1..N va cac cau hoi rieng
    // le nhu "Cau hoi khac") va tu dong chon "Khong".
    // Ho tro ca 2 kieu widget: dx-list option (giong cot Bac si danh gia
    // trong bang) va dx-radiobutton/dx-radiogroup (cau hoi don le ngoai bang).
    // Luu y: JS regex \b khong nhan dien dung bien tu sau ky tu co dau
    // tieng Viet (vd "Co" ket thuc bang "o" co dau, khong phai ky tu \w
    // ASCII), nen KHONG dung /^Co\b/ de so khop. Dung startsWith thay the.
    function isCoText(txt) {
        return txt === 'C\u00f3' || txt.indexOf('C\u00f3,') === 0 ||
            txt.indexOf('C\u00f3 ') === 0 || txt.indexOf('C\u00f3(') === 0;
    }
    function isKhongText(txt) {
        return txt === 'Kh\u00f4ng' || txt.indexOf('Kh\u00f4ng,') === 0 ||
            txt.indexOf('Kh\u00f4ng ') === 0 || txt.indexOf('Kh\u00f4ng(') === 0;
    }

    function tickKhongTrongBangNCT() {
        var count = 0;
        document.querySelectorAll('tr[role="row"]').forEach(function(row) {
            var evalCell = row.querySelector('td[aria-colindex="3"]') || row;
            var options = evalCell.querySelectorAll('.dx-item.dx-list-item[role="option"]');
            if (options.length < 2) return;
            var found = null, hasCo = false, hasKhong = false;
            options.forEach(function(opt) {
                var lbl = opt.querySelector('.dx-item-content.dx-list-item-content');
                var txt = lbl ? (lbl.textContent || '').trim() : '';
                if (isCoText(txt)) hasCo = true;
                if (isKhongText(txt)) { hasKhong = true; found = opt; }
            });
            if (!hasCo || !hasKhong || !found) return;
            var radio = found.querySelector('.dx-list-select-radiobutton[role="radio"]');
            if (radio && radio.getAttribute('aria-checked') === 'true') return;
            pointerClick(found);
            count++;
        });
        return count;
    }

    function tickKhongRadioGroupNCT() {
        var count = 0;
        document.querySelectorAll('[role="radiogroup"], .dx-radiogroup').forEach(function(group) {
            var items = group.querySelectorAll('.dx-item.dx-radiobutton[role="radio"]');
            if (items.length < 2) return;
            var hasCo = false, target = null;
            items.forEach(function(it) {
                var lbl = it.querySelector('.dx-item-content');
                var txt = lbl ? (lbl.textContent || '').trim() : '';
                // Nhan dien linh hoat: "Co" co the co hau to nhu
                // "Co, (Neu co, xin hay liet ke...)"
                if (isCoText(txt)) hasCo = true;
                if (isKhongText(txt)) target = it;
            });
            if (!hasCo || !target) return;
            if (target.getAttribute('aria-checked') === 'true') return;
            var icon = target.querySelector('.dx-radiobutton-icon');
            fullClick(icon || target.querySelector('.dx-item-content') || target);
            count++;
        });
        return count;
    }

    function tickKhongNativeRadioNCT() {
        var count = 0;
        var handledGroups = {};
        // Radio kieu Angular Material (mat-radio-button) hoac input[type=radio] thuong,
        // dung cho cac cau hoi don le nhu "3. Cau hoi khac" (khong phai dx-widget).
        document.querySelectorAll('mat-radio-group, [role="radiogroup"]:not(.dx-radiogroup)').forEach(function(group) {
            if (group.querySelector('.dx-radiobutton')) return; // da xu ly o pass dx-radiogroup
            var buttons = group.querySelectorAll('mat-radio-button, label');
            if (buttons.length < 2) return;
            var hasCo = false, target = null, targetInput = null;
            buttons.forEach(function(btn) {
                var txt = (btn.textContent || '').replace(/\s+/g, ' ').trim();
                if (isCoText(txt)) hasCo = true;
                if (isKhongText(txt)) {
                    target = btn;
                    targetInput = btn.querySelector('input[type="radio"]') || btn.closest('mat-radio-button');
                }
            });
            if (!hasCo || !target) return;
            var isChecked = target.matches('[class*="checked"], [aria-checked="true"]') ||
                (targetInput && targetInput.tagName === 'INPUT' && targetInput.checked) ||
                (target.querySelector('input[type="radio"]') && target.querySelector('input[type="radio"]').checked);
            if (isChecked) return;
            pointerClick(target.querySelector('.mat-radio-container') || target.querySelector('input[type="radio"]') || target);
            count++;
        });

        // Fallback: cap input[type=radio] thuong nam gan nhau, nhom theo "name",
        // co 1 option la "Co" va 1 option la "Khong" (khong thuoc mat-radio-group/dx).
        var byName = {};
        document.querySelectorAll('input[type="radio"]').forEach(function(inp) {
            if (inp.closest('.dx-radiobutton, mat-radio-group')) return;
            var key = inp.name || ('__noname_' + (inp.closest('form, .dx-item, tr') ? 1 : 0));
            if (!byName[key]) byName[key] = [];
            byName[key].push(inp);
        });
        Object.keys(byName).forEach(function(key) {
            if (handledGroups[key]) return;
            var inputs = byName[key];
            if (inputs.length < 2) return;
            var hasCo = false, target = null;
            inputs.forEach(function(inp) {
                var lbl = inp.closest('label') ||
                    (inp.id ? document.querySelector('label[for="' + inp.id + '"]') : null) ||
                    inp.parentElement;
                var txt = lbl ? (lbl.textContent || '').replace(/\s+/g, ' ').trim() : '';
                if (isCoText(txt)) hasCo = true;
                if (isKhongText(txt)) target = inp;
            });
            if (!hasCo || !target || target.checked) return;
            pointerClick(target);
            target.checked = true;
            target.dispatchEvent(new Event('change', { bubbles: true }));
            count++;
        });
        return count;
    }

    function autoTienSuCoNangKhong(doneCallback) {
        var total = 0;
        function pass() {
            return tickKhongTrongBangNCT() + tickKhongRadioGroupNCT() + tickKhongNativeRadioNCT();
        }
        total += pass();
        // Chay lai 2 lan nua (cach nhau 350ms) de bat cac dong render tre
        // (vd Angular/DevExtreme dung virtual scroll hoac vua chuyen tab).
        setTimeout(function() {
            total += pass();
            setTimeout(function() {
                total += pass();
                if (doneCallback) doneCallback(total);
            }, 350);
        }, 350);
    }

    var NCT_THA_DTD = [
        { code: 'D1',    opt: 'Có' },
        { code: 'D1.1',  opt: 'Có' },
        { code: 'D1.2',  opt: 'Có' },
        { code: 'D1.3',  opt: 'Không' },
        { code: 'D1.4',  opt: 'Không' },
        { code: 'D1.5',  opt: 'Không' },
        { code: 'D1.6',  opt: 'Không' },
        { code: 'D1.7',  opt: 'Không' },
        { code: 'D1.8',  opt: 'Không' },
        { code: 'D1.9',  opt: 'Có' },
        { code: 'D1.10', opt: 'Không' },
        { code: 'D1.11', opt: 'Không' },
        { code: 'D1.12', opt: 'Không' },
        { code: 'D1.13', opt: 'Không' },
        { code: 'D1.14', opt: 'Không' },
        { code: 'D2.1',  opt: 'Có' },
        { code: 'D2.2',  opt: 'Có' },
        { code: 'D2.3',  opt: 'Có' },
        { code: 'D2.4',  opt: 'Có' },
        { code: 'D2.5',  opt: 'Không' },
        { code: 'D3.1',  opt: 'Không' },
        { code: 'D3.2',  opt: 'Không' },
        { code: 'D3.3',  opt: 'Không' },
        { code: 'D4.1',  opt: 'Không' },
        { code: 'D4.2',  opt: 'Không' },
        { code: 'D4.3',  opt: 'Không' },
        { code: 'D4.4',  opt: 'Không' },
        { code: 'D4.5',  opt: 'Không' },
        { code: 'D4.6',  opt: 'Không' },
        { code: 'D4.7',  opt: 'Không' },
        { code: 'D4.8',  opt: 'Không' },
        { code: 'D5.1',  opt: 'Không' },
        { code: 'D5.2',  opt: 'Không' },
        { code: 'D5.3',  opt: 'Không' },
        { code: 'D5.4',  opt: 'Không' },
        { code: 'D5.5',  opt: 'Không' },
        { code: 'D5.6',  opt: 'Không' },
        { code: 'D5.7',  opt: 'Không' },
        { code: 'D5.8',  opt: 'Không' },
        { code: 'D5.9',  opt: 'Không' },
        { code: 'D5.10', opt: 'Không' },
        { code: 'D5.11', opt: 'Không' },
        { code: 'D6.1',  opt: 'Hầu như không' },
        { code: 'D6.2',  opt: 'Hầu như không' },
        { code: 'D6.3',  opt: 'Hầu như không' },
        { code: 'D6.4',  opt: 'Một vài ngày' },
        { code: 'D6.5',  opt: 'Một vài ngày' },
        { code: 'D6.6',  opt: 'Hầu như không' },
        { code: 'D6.7',  opt: 'Hầu như không' },
        { code: 'D6.8',  opt: 'Hầu như không' },
        { code: 'D6.9',  opt: 'Hầu như không' },
        { code: 'D7.1',  opt: 'Hầu như không' },
        { code: 'D7.2',  opt: 'Hầu như không' },
        { code: 'D7.3',  opt: 'Một vài ngày' },
        { code: 'D7.4',  opt: 'Hầu như không' },
        { code: 'D7.5',  opt: 'Hầu như không' },
        { code: 'D7.6',  opt: 'Hầu như không' },
        { code: 'D7.7',  opt: 'Hầu như không' },
        { code: 'D8.1.1', opt: 'Có' },
        { code: 'D8.1.2', opt: 'Có' },
        { code: 'D8.1.3', opt: 'Có' },
        { code: 'D8.1.4', opt: 'Có' },
        { code: 'D8.1.5', opt: 'Có' },
        { code: 'D8.1.6', opt: 'Có' },
        { code: 'D8.2.1', opt: 'Có' },
        { code: 'D8.2.2', opt: 'Có' },
        { code: 'D8.2.3', opt: 'Có' },
        { code: 'D8.2.4', opt: 'Có' },
        { code: 'D8.2.5', opt: 'Có' },
        { code: 'D8.2.6', opt: 'Không' },
        { code: 'D8.2.7', opt: 'Có' },
        { code: 'D8.2.8', opt: 'Có' },
        { code: 'D8.3.1', opt: 'Không/Một số lần' },
        { code: 'D8.3.2', opt: 'Không' },
        { code: 'D8.3.3', opt: 'Không' },
        { code: 'D8.4.1', opt: 'Không' },
        { code: 'D8.4.2', opt: 'Không' },
        { code: 'D8.4.3', opt: 'Không' },
        { code: 'D8.5.1', opt: 'Có' },
        { code: 'D8.5.2', opt: 'Có' },
        { code: 'D8.5.3', opt: 'Không' },
    ];

    // ================================================================
    //  TRE EM DUOI 6 TUOI - AUTO FILL THEO TRANG
    // ================================================================
    var TE6_AUTO_FILL_PAGES = [
        { match: 'DauHieuSinhTon_MC', mode: 'text',  text: 'Bình thường' },
        { match: 'DinhDuong_MC',      mode: 'text',  text: 'Bình thường' },
        { match: 'TinhThanVanDong_MC',mode: 'index', values: ['Có', 'Có', 'Không'] },
        { match: 'TiemChung_MC',      mode: 'index', values: ['Có', 'Có', 'Có'] },
    ];
    var _te6AutoFillDonePath = null;

    function te6GetAutoFillConfig() {
        var path = location.pathname;
        for (var i = 0; i < TE6_AUTO_FILL_PAGES.length; i++) {
            if (path.indexOf(TE6_AUTO_FILL_PAGES[i].match) !== -1) return TE6_AUTO_FILL_PAGES[i];
        }
        return null;
    }

    function te6AutoFillCurrentPage(silent) {
        var config = te6GetAutoFillConfig();
        var path = location.pathname;
        if (!config) { _te6AutoFillDonePath = null; return 0; }

        var allGroups = document.querySelectorAll('.dx-radiogroup');
        if (!allGroups.length) return 0;

        var groups;
        if (config.mode === 'index') {
            groups = [];
            allGroups.forEach(function (group) {
                var items = group.querySelectorAll('.dx-item.dx-radiobutton');
                if (items.length !== 2) return;
                var texts = [];
                items.forEach(function (it) { texts.push((it.textContent || '').trim()); });
                var isCoKhong = texts.some(function (t) { return t.indexOf('Có') !== -1; })
                    && texts.some(function (t) { return t.indexOf('Không') !== -1; });
                if (isCoKhong) groups.push(group);
            });
        } else {
            groups = allGroups;
        }
        if (!groups.length) return 0;

        groups.forEach(function (group, idx) {
            var wantText = config.mode === 'text' ? config.text : config.values[idx];
            if (!wantText) return;
            var items = group.querySelectorAll('.dx-item.dx-radiobutton');
            for (var i = 0; i < items.length; i++) {
                var text = (items[i].textContent || '').trim();
                if (text.indexOf(wantText) !== -1) {
                    if (!items[i].classList.contains('dx-radiobutton-checked')) items[i].click();
                    break;
                }
            }
        });

        // Dem lai TU DAU (doc DOM tuoi, KHONG dua vao co "vua click" o
        // tren) so o hien DANG DUNG gia tri mong muon - tranh dem trung
        // neu MutationObserver goi ham nay nhieu lan lien tiep cho CUNG 1
        // thay doi truoc khi DOM kip cap nhat class "checked".
        var doneCount = 0;
        groups.forEach(function (group, idx) {
            var wantText = config.mode === 'text' ? config.text : config.values[idx];
            if (!wantText) return;
            var items = group.querySelectorAll('.dx-item.dx-radiobutton');
            for (var i = 0; i < items.length; i++) {
                var text = (items[i].textContent || '').trim();
                if (text.indexOf(wantText) !== -1) {
                    if (items[i].classList.contains('dx-radiobutton-checked')) doneCount++;
                    break;
                }
            }
        });

        if (!silent && doneCount > 0 && _te6AutoFillDonePath !== path) {
            showToast('✅ Đã tự động điền giá trị mặc định');
        }
        _te6AutoFillDonePath = path;
        te6BillDelta(location.href + '|main', doneCount);
        return doneCount;
    }

    // ---- Kham lam sang (tre duoi 6 tuoi): 48 truong radio ----
    var TE6_KLS_FIELD_MAP = {
        'ToanTrang_MauSacDa': 0, 'Da_LongBanTay': 0, 'DauCo_Thop': 0,
        'DauCo_KichThuoc': 0, 'DauCo_VanDongCo': 0, 'DauCo_KhoiBatThuong': 0,
        'Mat_ViTri2Mat': 0, 'Mat_DongTu': 0, 'Mat_MiMatKetMac': 0, 'LacMat': 0,
        'Tai_TaiVaMangNhi': 0, 'Tai_ThinhLuc': 0, 'Tai_CoKhoiSungSauTai': 0,
        'Tai_DauHieuChayMu': 0, 'Mui_HinhDang': 0, 'ChayNuocMui': 0, 'NghetMui': 0,
        'Hong': 0, 'KhamMieng_HinhDang': 0, 'KhamMieng_RangSuaSauSinh': 1,
        'KhamMieng_HinhDangLuoi': 0, 'KhamMieng_DinhThangLuoi': 0,
        'KhamMieng_NamMieng': 0, 'KhamMieng_CamNho': 0,
        'VetSauMangBamLoTrenRang': 0, 'HoHap_NhipThoKhongDeu': 0,
        'HoHap_ThoRutLom': 0, 'HoHap_TiengThoBatThuong': 0, 'HoHap_SuyHoHap': 0,
        'HoHap_NghePhoi': 0, 'Tim_ViTriMomTim': 0, 'Tim_MachNgoaiVi': 0,
        'Tim_NgheTim': 0, 'Bung_HinhDang': 0, 'Bung_GanLachTo': 0,
        'Bung_KhoiBatThuong': 0, 'Bung_LoHauMon': 0, 'Bung_CoQuanSinhDucNgoai': 0,
        'CoXuong_VanDongKDX': 0, 'CoXuong_PhanXaBu': 1, 'CoXuong_PhanXaNam': 1,
        'CoXuong_PhanXaMoro': 1, 'CoXuong_TruongLuc': 0, 'CoXuong_KhopHang': 0,
        'CoXuong_PhanXaCo': 0, 'CoXuong_Lung': 0, 'CoXuong_TuChi': 0,
        'CoXuong_DangDi': 0, 'CoXuong_DauHinhCoiXuong': 0,
    };

    function te6KlsSelectRadio(fieldClass, optionIndex) {
        var wrapper = document.querySelector('.h-item.' + CSS.escape(fieldClass));
        if (!wrapper) return { ok: false, reason: 'khong-tim-thay-truong', clicked: false };
        var radioGroup = wrapper.querySelector('.dx-radiogroup');
        if (!radioGroup) return { ok: false, reason: 'khong-co-radiogroup', clicked: false };
        var items = radioGroup.querySelectorAll('.dx-item.dx-radiobutton');
        if (!items || !items[optionIndex]) return { ok: false, reason: 'khong-co-option', clicked: false };
        var target = items[optionIndex];
        var wasChecked = target.classList.contains('dx-radiobutton-checked');
        if (!wasChecked) target.click();
        return { ok: true, clicked: !wasChecked };
    }

    function te6FillKhamLamSang(silent) {
        var done = 0, clicked = 0, missed = [];
        Object.keys(TE6_KLS_FIELD_MAP).forEach(function (fieldClass) {
            var result = te6KlsSelectRadio(fieldClass, TE6_KLS_FIELD_MAP[fieldClass]);
            if (result.ok) { done++; if (result.clicked) clicked++; } else missed.push(fieldClass + ' (' + result.reason + ')');
        });
        var total = Object.keys(TE6_KLS_FIELD_MAP).length;
        if (missed.length) console.warn('[TE6] Khong xu ly duoc:', missed);
        if (silent) return { done: done, total: total, clicked: clicked };
        if (done === total) {
            showToast('✅ Đã điền ' + done + '/' + total + ' trường Khám lâm sàng');
        } else if (done > 0) {
            showToast('⚠️ Đã điền ' + done + '/' + total + ' trường, thiếu ' + missed.length + ' (xem console)', 'warn');
        } else {
            showToast('❌ Không tìm thấy trường nào để điền. Kiểm tra lại trang.', 'error');
        }
        return { done: done, total: total, clicked: clicked };
    }

    var _te6KlsAutoFillDonePath = null;

    // Tra ve SO LUONG truong VUA duoc click that su (khong tinh cac truong
    // da dung san tu truoc) - dung de tinh CHINH XAC so luot can tru (moi
    // 1 truong click that = 1 luot = 0.01 Medi), tranh tru tien khi khong
    // lam gi ca (vd trang da dien san, hoac trang khong co truong nao
    // thuoc dang nay).
    function te6AutoFillKhamLamSang() {
        var path = location.pathname;
        if (path.indexOf('KhamLamSang_MC') === -1) { _te6KlsAutoFillDonePath = null; return 0; }
        var firstField = document.querySelector('.h-item.' + CSS.escape(Object.keys(TE6_KLS_FIELD_MAP)[0]));
        if (!firstField) return 0;
        var result = te6FillKhamLamSang(true);
        if (result.done > 0 && _te6KlsAutoFillDonePath !== path) {
            if (result.done === result.total) {
                showToast('✅ Đã tự động điền ' + result.done + '/' + result.total + ' trường Khám lâm sàng');
            } else {
                showToast('⚠️ Đã tự động điền ' + result.done + '/' + result.total + ' trường, xem console', 'warn');
            }
        }
        _te6KlsAutoFillDonePath = path;
        te6BillDelta(location.href + '|kls', result.done);
        return result.clicked;
    }

    // ---- Thong tin hanh chinh (tre duoi 6 tuoi): tich cac muc Tien su / Doi tuong-chi tra ----
    function te6ClickRadioInGroup(fieldClass, wantText) {
        var wrapper = document.querySelector('.h-item.' + CSS.escape(fieldClass));
        if (!wrapper) return { found: false, clicked: false };
        var group = wrapper.querySelector('.dx-radiogroup');
        if (!group) return { found: false, clicked: false };
        var items = group.querySelectorAll('.dx-item.dx-radiobutton');
        for (var i = 0; i < items.length; i++) {
            var text = (items[i].textContent || '').trim();
            if (text.indexOf(wantText) !== -1) {
                var wasChecked = items[i].classList.contains('dx-radiobutton-checked');
                if (!wasChecked) items[i].click();
                return { found: true, clicked: !wasChecked };
            }
        }
        return { found: false, clicked: false };
    }

    function te6SimulateClick(el) {
        var opts = { bubbles: true, cancelable: true, view: window };
        try { el.dispatchEvent(new PointerEvent('pointerdown', opts)); } catch (e) {}
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        try { el.dispatchEvent(new PointerEvent('pointerup', opts)); } catch (e) {}
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.dispatchEvent(new MouseEvent('click', opts));
    }

    function te6ClickListItem(fieldClass, wantText) {
        var wrapper = document.querySelector('.h-item.' + CSS.escape(fieldClass));
        if (!wrapper) return { found: false, clicked: false };
        var items = wrapper.querySelectorAll('.dx-list-item');
        for (var i = 0; i < items.length; i++) {
            var contentEl = items[i].querySelector('.dx-list-item-content') || items[i];
            var text = (contentEl.textContent || '').trim();
            if (text.indexOf(wantText) === -1) continue;

            var isSelected = function () {
                return items[i].classList.contains('dx-list-item-selected')
                    || items[i].getAttribute('aria-selected') === 'true';
            };
            if (isSelected()) return { found: true, clicked: false };

            // Thu 1: click truc tiep vao dong
            items[i].click();
            if (isSelected()) return { found: true, clicked: true };

            // Thu 2: click vao o radio/checkbox ben trong (mot so widget chi bat su kien o do)
            var icon = items[i].querySelector('.dx-list-select-radiobutton, .dx-list-select-checkbox, .dx-radio-value-container, .dx-checkbox-container');
            if (icon) {
                icon.click();
                if (isSelected()) return { found: true, clicked: true };
            }

            // Thu 3: mo phong day du chuoi su kien con tro/chuot
            te6SimulateClick(items[i]);
            if (isSelected()) return { found: true, clicked: true };
            if (icon) {
                te6SimulateClick(icon);
                if (isSelected()) return { found: true, clicked: true };
            }

            return { found: true, clicked: false }; // tim thay nhung khong tick duoc, de poll thu lai
        }
        return { found: false, clicked: false };
    }

    var TE6_TTHC_FIELDS = [
        { field: 'TienSuBanThanCokhong', mode: 'radio', value: 'Không' },
        { field: 'TienSuGiaDinhCoKhong', mode: 'radio', value: 'Không' },
        { field: 'TienSu_TX_NguoiBenhLao', mode: 'radio', value: 'Không' },
        { field: 'HinhThucKham', mode: 'list', value: 'Ngân sách thành phố hỗ trợ' },
        { field: 'HinhThucChiTra', mode: 'radio', value: 'Khám theo hợp đồng' },
        { field: 'DiaDiemKham', mode: 'list', value: 'Trường học' },
    ];

    function te6FillThongTinHanhChinh(silent) {
        var done = 0, clicked = 0, missed = [];
        TE6_TTHC_FIELDS.forEach(function (item) {
            var r = item.mode === 'radio'
                ? te6ClickRadioInGroup(item.field, item.value)
                : te6ClickListItem(item.field, item.value);
            if (r.found) { done++; if (r.clicked) clicked++; } else missed.push(item.field);
        });
        var total = TE6_TTHC_FIELDS.length;
        if (missed.length) console.warn('[TE6] Khong xu ly duoc (Thong tin hanh chinh):', missed);
        if (!silent) {
            if (done === total) showToast('✅ Đã điền ' + done + '/' + total + ' mục Thông tin hành chính');
            else if (done > 0) showToast('⚠️ Đã điền ' + done + '/' + total + ' mục, thiếu ' + missed.length + ' (xem console)', 'warn');
            else showToast('❌ Không tìm thấy mục nào để điền. Kiểm tra lại trang.', 'error');
        }
        return { done: done, total: total, clicked: clicked };
    }

    var _te6TthcAutoFillDonePath = null;
    var _te6TthcPollTimer = null;
    var _te6TthcPollPath = null;

    // Tra ve so muc VUA duoc click that su o lan goi nay (dung tham khao,
    // viec tinh phi thuc te da chuyen sang te6BillDelta ben duoi - tu
    // dong chi tinh dung phan tang them, an toan voi ca F5 lan poll lai).
    function te6AutoFillThongTinHanhChinh() {
        var path = location.pathname;
        if (path.indexOf('ThongTinHanhChinh_MC') === -1) {
            _te6TthcAutoFillDonePath = null;
            if (_te6TthcPollTimer) { clearInterval(_te6TthcPollTimer); _te6TthcPollTimer = null; _te6TthcPollPath = null; }
            return 0;
        }
        var firstField = document.querySelector('.h-item.' + CSS.escape(TE6_TTHC_FIELDS[0].field));
        if (!firstField) return 0;

        var result = te6FillThongTinHanhChinh(true);
        if (result.done > 0 && _te6TthcAutoFillDonePath !== path) {
            if (result.done === result.total) {
                showToast('✅ Đã tự động điền ' + result.done + '/' + result.total + ' mục Thông tin hành chính');
            } else {
                showToast('⚠️ Đã tự động điền ' + result.done + '/' + result.total + ' mục, xem console', 'warn');
            }
        }
        if (result.done === result.total) _te6TthcAutoFillDonePath = path;
        te6BillDelta(location.href + '|tthc', result.done);

        // Mot so danh sach (Hinh thuc chi tra, Dia diem kham) tai du lieu bat dong bo
        // va co the chua kip render ngay lan dau -> thu lai vai lan trong vai giay.
        // Cac truong PHAT SINH THEM trong luc poll nay se duoc tinh phi
        // rieng qua te6BillDelta, tu dong chi tinh dung phan tang them.
        if (result.done < result.total && _te6TthcPollPath !== path) {
            _te6TthcPollPath = path;
            if (_te6TthcPollTimer) clearInterval(_te6TthcPollTimer);
            var attempts = 0;
            _te6TthcPollTimer = setInterval(function () {
                attempts++;
                if (location.pathname.indexOf('ThongTinHanhChinh_MC') === -1 || attempts > 30) {
                    clearInterval(_te6TthcPollTimer);
                    _te6TthcPollTimer = null;
                    _te6TthcPollPath = null;
                    return;
                }
                var r = te6FillThongTinHanhChinh(true);
                te6BillDelta(location.href + '|tthc', r.done);
                if (r.done === r.total) {
                    showToast('✅ Đã tự động điền ' + r.done + '/' + r.total + ' mục Thông tin hành chính');
                    _te6TthcAutoFillDonePath = location.pathname;
                    clearInterval(_te6TthcPollTimer);
                    _te6TthcPollTimer = null;
                    _te6TthcPollPath = null;
                }
            }, 500);
        }
        return result.clicked;
    }

    // ================================================================
    //  TINH PHI THEO "PHAN TANG THEM" (delta billing) - moi 1 truong/o
    //  DUOC XAC NHAN DUNG = 1 luot = 0.01 Medi, tinh CHINH XAC theo dung
    //  so luong cong viec thuc te, khong con muc khoan co dinh nhu truoc.
    //
    //  Co che: moi "key" (1 trang + 1 khu vuc dien, vd URL + "|kls") duoc
    //  luu 1 con so "da tung tru phi cho bao nhieu truong DUNG tren key
    //  nay" trong sessionStorage - moi lan quet lai, CHI tru phan CHENH
    //  LECH TANG THEM so voi con so da luu, roi cap nhat lai con so do.
    //  Uu diem so voi cach "chi tru 1 lan/URL" truoc day:
    //  - Khong bao gio tru trung cho 1 truong da duoc tinh phi truoc do
    //    (an toan ngay ca khi MutationObserver goi lai nhieu lan cho CUNG
    //    1 thay doi, vi con so "hien dang dung" doc tuoi tu DOM moi lan,
    //    khong dua vao co "vua click" de roi).
    //  - Van tinh phi dung neu SAU DO co THEM truong moi duoc dien dung
    //    (vd danh sach tai du lieu cham, poll lai vai giay sau van tinh
    //    dung), thay vi khoa cung "chi 1 lan cho ca URL" nhu ban truoc.
    //  - Song sot qua F5/tai lai trang (sessionStorage), nen refresh
    //    trang KHONG BAO GIO tru phi lai cho nhung truong da tinh roi.
    // ================================================================
    function te6GetBilledCount(key) {
        try {
            var v = parseInt(sessionStorage.getItem('_mtt_billed_count:' + key), 10);
            return isNaN(v) ? 0 : v;
        } catch (e) { return 0; }
    }
    function te6SetBilledCount(key, v) {
        try { sessionStorage.setItem('_mtt_billed_count:' + key, String(v)); } catch (e) {}
    }
    function te6BillDelta(key, currentDoneCount) {
        var billedSoFar = te6GetBilledCount(key);
        var delta = currentDoneCount - billedSoFar;
        if (delta <= 0) return;
        te6SetBilledCount(key, currentDoneCount);
        spendCredits(delta); // delta don vi = delta luot (1 luot = 0.01 Medi)
    }

    function te6RunAutoFillIfLicensed() {
        if (!isLicenseValid()) return;
        te6AutoFillCurrentPage();
        te6AutoFillKhamLamSang();
        te6AutoFillThongTinHanhChinh();
    }

    // ================================================================
    //  SUBMENU FLYOUT (hien thi ben phai item chinh)
    // ================================================================

    var SUBMENU_ID = '_mtt_submenu';

    function closeSubmenu() {
        var sm = document.getElementById(SUBMENU_ID);
        if (sm) sm.remove();
    }

    // Doc tuoi benh nhan tu field NgaySinh
    // Tra ve so tuoi (so nguyen), hoac null neu khong doc duoc
    function getPatientAge() {
        var el = document.querySelector('.NgaySinh input[type="hidden"]');
        if (!el) el = document.querySelector('.NgaySinh dx-date-box input[type="hidden"]');
        if (!el || !el.value) return null;
        var m = el.value.match(/^(\d{4})/);
        if (!m) return null;
        return new Date().getFullYear() - parseInt(m[1], 10);
    }

    // Tra ve index (0-4) cua nhom tuoi phu hop
    // 0: <=40 | 1: 41-60 | 2: 61-70 | 3: 71-80 | 4: 81+
    // null: khong xac dinh duoc tuoi
    function getAgeGroupIndex(age) {
        if (age === null) return null;
        if (age <= 40)  return 0;
        if (age <= 60)  return 1;
        if (age <= 70)  return 2;
        if (age <= 80)  return 3;
        return 4;
    }

    function openSubmenu(parentItem, subItems, noAgeLogic) {
        closeSubmenu();
        var sm = document.createElement('div');
        sm.id = SUBMENU_ID;
        Object.assign(sm.style, {
            position: 'fixed',
            zIndex: '2000001',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
            minWidth: '220px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        });

        var ageIdx = getAgeGroupIndex(getPatientAge());
        var AGE_ITEM_COUNT = 5;

        var visibleSubCount = 0;
        subItems.forEach(function(sub, i) {
            if (sub.check && !sub.check()) return;

            var btn = document.createElement('button');
            btn.innerHTML = (sub.emoji ? '<span style="margin-right:6px">' + sub.emoji + '</span>' : '') + sub.label;

            var dimmed = !noAgeLogic && (i < AGE_ITEM_COUNT) && (ageIdx !== null) && (i !== ageIdx);

            Object.assign(btn.style, {
                display: 'block',
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid ' + sub.color,
                borderRadius: '6px',
                background: dimmed ? '#f5f5f5' : '#fff',
                color: dimmed ? '#aaa' : sub.color,
                borderColor: dimmed ? '#ddd' : sub.color,
                fontSize: '13px',
                fontWeight: '600',
                cursor: dimmed ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'opacity 0.15s',
                opacity: dimmed ? '0.38' : '1',
            });

            if (!dimmed) {
                btn.addEventListener('mouseenter', function() { btn.style.opacity = '0.75'; });
                btn.addEventListener('mouseleave', function() { btn.style.opacity = '1'; });
            }

            btn.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                if (dimmed) return; // mo thi khong lam gi
                closeSubmenu();
                var menu = document.getElementById('_mtt_menu');
                if (menu) menu.style.display = 'none';
                if (!isLicenseValid()) { showLicenseExpiredPopup(); return; }
                sub.fn();
                if (!sub.selfBills) spendCredits(sub.creditCost || DEFAULT_ACTION_COST);
            });
            sm.appendChild(btn);
            visibleSubCount++;
        });

        if (visibleSubCount === 0) {
            var emptySub = document.createElement('div');
            emptySub.style.cssText = 'padding:10px 12px;font-size:12.5px;color:#888;text-align:center;font-weight:500;';
            emptySub.textContent = 'Không có thao tác nào khả dụng trên trang này';
            sm.appendChild(emptySub);
        }

        document.body.appendChild(sm);

        var rect = parentItem.getBoundingClientRect();
        var smW  = sm.offsetWidth || 240;
        var smH  = sm.offsetHeight || 200;
        var top  = rect.top;
        var mainMenu = document.getElementById('_mtt_menu');
        var mainRect = mainMenu ? mainMenu.getBoundingClientRect() : rect;
        var leftCandidate = mainRect.right + 6;
        if (leftCandidate + smW > window.innerWidth - 4) {
            leftCandidate = mainRect.left - smW - 6;
        }
        if (leftCandidate < 4) leftCandidate = 4;
        if (top + smH > window.innerHeight - 8) top = window.innerHeight - smH - 8;
        if (top < 4) top = 4;
        sm.style.top  = top  + 'px';
        sm.style.left = leftCandidate + 'px';
    }

    // Dong submenu khi click ngoai
    document.addEventListener('click', function(e) {
        var sm = document.getElementById(SUBMENU_ID);
        if (!sm) return;
        if (sm.contains(e.target)) return;
        // Kiem tra co phai item cua menu chinh khong
        var menu = document.getElementById('_mtt_menu');
        if (menu && menu.contains(e.target)) return;
        closeSubmenu();
    }, true);

    // ================================================================
    //  DANH SACH ACTIONS
    // ================================================================

    var ACTIONS = [
        {
            emoji: '\ud83d\udcc4', label: 'Thông tin hành chính TE <6T',
            tier: 'lite',
            color: '#0369a1', hoverColor: '#075985',
            check: function() { return location.pathname.indexOf('ThongTinHanhChinh_MC') !== -1; },
            selfBills: true, // da bill chinh xac qua te6BillDelta ben trong
            fn: function() { te6FillThongTinHanhChinh(false); }
        },
        {
            emoji: '\ud83c\udf21\ufe0f', label: 'Dấu hiệu sinh tồn TE <6T',
            tier: 'lite',
            color: '#0369a1', hoverColor: '#075985',
            check: function() { return location.pathname.indexOf('DauHieuSinhTon_MC') !== -1; },
            selfBills: true, // da bill chinh xac qua te6BillDelta ben trong
            fn: function() { te6AutoFillCurrentPage(false); }
        },
        {
            emoji: '\ud83c\udf7c', label: 'Dinh dưỡng TE <6T',
            tier: 'lite',
            color: '#0369a1', hoverColor: '#075985',
            check: function() { return location.pathname.indexOf('DinhDuong_MC') !== -1; },
            selfBills: true, // da bill chinh xac qua te6BillDelta ben trong
            fn: function() { te6AutoFillCurrentPage(false); }
        },
        {
            emoji: '\ud83e\udde9', label: 'Tinh thần - vận động TE <6T',
            tier: 'lite',
            color: '#0369a1', hoverColor: '#075985',
            check: function() { return location.pathname.indexOf('TinhThanVanDong_MC') !== -1; },
            selfBills: true, // da bill chinh xac qua te6BillDelta ben trong
            fn: function() { te6AutoFillCurrentPage(false); }
        },
        {
            emoji: '\ud83d\udc89', label: 'Tiêm chủng TE <6T',
            tier: 'lite',
            color: '#0369a1', hoverColor: '#075985',
            check: function() { return location.pathname.indexOf('TiemChung_MC') !== -1; },
            selfBills: true, // da bill chinh xac qua te6BillDelta ben trong
            fn: function() { te6AutoFillCurrentPage(false); }
        },
        {
            emoji: '\ud83d\udcdd', label: 'Ti\u1ec1n s\u1eed b\u1ea3n th\u00e2n',
            tier: 'lite',
            color: '#c62828', hoverColor: '#8e0000',
            noAgeLogic: true,
            // Kha dung tren trang Tien su benh nhan duoi 18 tuoi: co bang
            // tiem chung, hoac co cac radiogroup Binh thuong / Co-Khong
            check: function() {
                if (document.querySelector('td[aria-colindex="' + TC_COL_INDEX + '"]')) return true;
                var ths = document.querySelectorAll('th, .dx-header-row td, [role="columnheader"]');
                for (var i = 0; i < ths.length; i++) {
                    var t = (ths[i].textContent || '').toUpperCase();
                    if (t.indexOf('T\u00ccNH TR\u1ea0NG TI\u00caM') !== -1) return true;
                }
                return window.location.href.indexOf('KSKD18_TTHC_TienSu') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                var doneBT = tickAllBinhThuongRadio();
                var doneTC = tcScanTableColumnOnce();
                autoTienSuCoNangKhong(function(countKhong) {
                    var total = doneBT + doneTC + countKhong;
                    if (total > 0) {
                        showToast('\u2705 \u0110\u00e3 t\u00edch ' + total + ' m\u1ee5c (B\u00ecnh th\u01b0\u1eddng / Kh\u00f4ng / \u0110\u00e3 ti\u00eam)');
                        spendCredits(total);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 t\u00edch');
                    }
                });
            }
        },
        {
            emoji: '\ud83e\udde0', label: 'Gi\u1ea3m ch\u00fa \u00fd - t\u0103ng \u0111\u1ed9ng',
            tier: 'lite',
            color: '#7b3f00', hoverColor: '#5c2d00',
            noAgeLogic: true,
            // Kha dung tren trang Danh gia suc khoe tam than, khi tab "Giam
            // chu y - tang dong" dang mo (nhan dien qua tieu de cau hoi)
            check: function() {
                if (window.location.href.indexOf('KSKD18_TAB_DANHGIATAMTHAN') === -1) return false;
                // Dung innerText (chi lay text dang HIEN THI tren man hinh)
                // thay vi textContent (lay ca text cua tab dang bi an bang
                // display:none) - vi DevExtreme TabPanel van giu noi dung
                // ca 2 tab trong DOM, textContent doc duoc ca tab dang an
                // nen truoc day 2 nut xuat hien cung luc bat ke dang mo tab nao.
                var txt = document.body.innerText || '';
                return txt.indexOf('gi\u1ea3m ch\u00fa \u00fd') !== -1 && txt.indexOf('t\u0103ng \u0111\u1ed9ng') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                showToast('\u23f3 \u0110ang ch\u1ecdn "Kh\u00f4ng c\u00f3" cho to\u00e0n b\u1ed9 c\u00e2u h\u1ecfi...');
                tamThanAutoFill(TAMTHAN_ADHD_TARGET, null, function(count) {
                    var ketQuaFilled = tamThanFillKetQua('B\u00ecnh th\u01b0\u1eddng');
                    var total = count + (ketQuaFilled ? 1 : 0);
                    if (total > 0) {
                        var msg = '\u2705 \u0110\u00e3 ch\u1ecdn "Kh\u00f4ng c\u00f3" cho ' + count + ' c\u00e2u';
                        if (ketQuaFilled) msg += ', \u0111i\u1ec1n "B\u00ecnh th\u01b0\u1eddng" v\u00e0o K\u1ebft qu\u1ea3 \u0111\u00e1nh gi\u00e1';
                        showToast(msg);
                        spendCredits(total);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng c\u00f3 c\u00e2u n\u00e0o c\u1ea7n ch\u1ecdn');
                    }
                });
            }
        },
        {
            emoji: '\ud83e\udde9', label: 'Ph\u1ed5 t\u1ef1 k\u1ef7',
            tier: 'lite',
            color: '#7b3f00', hoverColor: '#5c2d00',
            noAgeLogic: true,
            // Kha dung tren trang Danh gia suc khoe tam than, khi tab "Pho
            // tu ky" dang mo (nhan dien qua tieu de cau hoi)
            check: function() {
                if (window.location.href.indexOf('KSKD18_TAB_DANHGIATAMTHAN') === -1) return false;
                // Dung innerText thay vi textContent - ly do xem chu thich
                // o nut "Giam chu y - tang dong" phia tren.
                var txt = document.body.innerText || '';
                return txt.indexOf('ph\u1ed5 t\u1ef1 k\u1ef7') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                showToast('\u23f3 \u0110ang ch\u1ecdn "Ho\u00e0n to\u00e0n \u0111\u1ed3ng \u00fd" cho to\u00e0n b\u1ed9 c\u00e2u h\u1ecfi...');
                tamThanAutoFill(TAMTHAN_AUTISM_TARGET_AGREE, tamThanBuildAutismExceptionMap(), function(count) {
                    var ketQuaFilled = tamThanFillKetQua('B\u00ecnh th\u01b0\u1eddng');
                    var total = count + (ketQuaFilled ? 1 : 0);
                    if (total > 0) {
                        var msg = '\u2705 \u0110\u00e3 ch\u1ecdn xong ' + count + ' c\u00e2u (c\u00e2u 5, 7, 10 ch\u1ecdn ng\u01b0\u1ee3c)';
                        if (ketQuaFilled) msg += ', \u0111i\u1ec1n "B\u00ecnh th\u01b0\u1eddng" v\u00e0o K\u1ebft qu\u1ea3 \u0111\u00e1nh gi\u00e1';
                        showToast(msg);
                        spendCredits(total);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng c\u00f3 c\u00e2u n\u00e0o c\u1ea7n ch\u1ecdn');
                    }
                });
            }
        },
        {
            emoji: '\ud83d\udcdd', label: 'Khám lâm sàng TE <6T',
            tier: 'lite',
            color: '#2e7d32', hoverColor: '#1b5e20',
            check: function() { return location.pathname.indexOf('KhamLamSang_MC') !== -1; },
            selfBills: true, // da bill chinh xac qua te6BillDelta ben trong
            fn: function() { te6FillKhamLamSang(false); }
        },
        {
            emoji: '\ud83c\udfe0', label: 'Th\u00f4ng tin h\u00e0nh ch\u00ednh',
            tier: 'pro',
            color: '#00796b', hoverColor: '#004d40',
            // Kha dung khi co field DoiTuongKham (dia diem kham) tren trang
            check: function() {
                return !!document.querySelector('.DoiTuongKham');
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                fillThongTinHanhChinh(function(count) { spendCredits(count); });
            }
        },
        {
            emoji: '\ud83d\udccb', label: 'Ti\u1ec1n s\u1eed kh\u00e1m th\u1ef1c th\u1ec3',
            tier: 'pro',
            color: '#7b3f00', hoverColor: '#5c2d00',
            // Kha dung khi co cac dong B1, B1.1 ... B1.7 tren trang
            check: function() {
                var rows = document.querySelectorAll('tr[role="row"]');
                for (var i = 0; i < rows.length; i++) {
                    var cell = rows[i].querySelector('td[aria-colindex="1"]');
                    if (cell && cell.textContent.trim() === 'B1') return true;
                }
                return false;
            },
            selfBills: true, // bill theo count thuc te, khong dung phi co dinh
            fn: function() {
                var list = [
                    { code: 'B1',    opt: 'Kh\u00f4ng' },
                    { code: 'B1.1',  opt: 'Kh\u00f4ng' },
                    { code: 'B1.2',  opt: 'Kh\u00f4ng' },
                    { code: 'B1.3',  opt: 'Kh\u00f4ng' },
                    { code: 'B1.4',  opt: 'Kh\u00f4ng' },
                    { code: 'B1.5',  opt: 'Kh\u00f4ng' },
                    { code: 'B1.6',  opt: 'Kh\u00f4ng' },
                    { code: 'B1.7',  opt: 'Kh\u00f4ng' },
                ];
                showToast('\u23f3 \u0110ang \u0111i\u1ec1n ti\u1ec1n s\u1eed kh\u00e1m th\u1ef1c th\u1ec3...');
                selectNCTRadioBulk(list, function(count) {
                    showToast('\ud83d\udccc \u0110\u00e3 \u0111i\u1ec1n xong: Ti\u1ec1n s\u1eed kh\u00e1m th\u1ef1c th\u1ec3' + ' (' + count + ' \u00f4)');
                    spendCredits(count);
                });
            }
        },
        {
            emoji: '\ud83e\udde0', label: 'Ti\u1ec1n s\u1eed kh\u00e1m c\u01a1 n\u0103ng',
            tier: 'pro',
            color: '#8.34aa', hoverColor: '#6a1b9a',
            // Kha dung tren trang "Tien su benh cua doi tuong" (NCT)
            check: function() {
                return window.location.href.indexOf('TienSuBenhCuaDoiTuong') !== -1;
            },
            selfBills: true, // bill theo count thuc te, khong dung phi co dinh
            fn: function() {
                showToast('\u23f3 \u0110ang t\u00edch "Kh\u00f4ng" cho to\u00e0n b\u1ed9 ti\u1ec1n s\u1eed...');
                autoTienSuCoNangKhong(function(count) {
                    if (count > 0) {
                        showToast('\u2705 \u0110\u00e3 t\u00edch "Kh\u00f4ng" cho ' + count + ' m\u1ee5c ti\u1ec1n s\u1eed');
                        spendCredits(count);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 t\u00edch, vui l\u00f2ng ki\u1ec3m tra l\u1ea1i trang');
                    }
                });
            }
        },
        {
            emoji: '\ud83e\udde0', label: 'Ti\u1ec1n s\u1eed b\u1ea3n th\u00e2n',
            tier: 'pro',
            color: '#8.34aa', hoverColor: '#6a1b9a',
            // Kha dung tren trang "Tien su" cua phieu Thong tin hanh chinh (KSKDK_TTHC_TienSu)
            check: function() {
                return window.location.href.indexOf('KSKDK_TTHC_TienSu') !== -1;
            },
            selfBills: true, // bill theo count thuc te, khong dung phi co dinh
            fn: function() {
                showToast('\u23f3 \u0110ang t\u00edch "Kh\u00f4ng" cho to\u00e0n b\u1ed9 ti\u1ec1n s\u1eed...');
                autoTienSuCoNangKhong(function(count) {
                    if (count > 0) {
                        showToast('\u2705 \u0110\u00e3 t\u00edch "Kh\u00f4ng" cho ' + count + ' m\u1ee5c ti\u1ec1n s\u1eed');
                        spendCredits(count);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 t\u00edch, vui l\u00f2ng ki\u1ec3m tra l\u1ea1i trang');
                    }
                });
            }
        },
        {
            emoji: '\ud83d\ude97', label: 'Ti\u1ec1n s\u1eed \u00d4 t\u00f4 (l\u00e1i xe)',
            tier: 'pro',
            color: '#8.34aa', hoverColor: '#6a1b9a',
            // Kha dung tren trang "Tien su" cua phieu KSK Lai xe O to (KSKOT_TienSu)
            // - dung chung ham autoTienSuCoNangKhong (generic theo cau truc
            // widget DevExtreme/Angular Material dung chung toan site, khong
            // phu thuoc rieng trang NCT) de tich "Khong" cho tat ca cac cau
            // hoi dang Co/Khong trong trang.
            check: function() {
                return window.location.href.indexOf('KSKOT_TienSu') !== -1;
            },
            selfBills: true, // bill theo count thuc te, khong dung phi co dinh
            fn: function() {
                showToast('\u23f3 \u0110ang t\u00edch "Kh\u00f4ng" cho to\u00e0n b\u1ed9 ti\u1ec1n s\u1eed \u00d4 t\u00f4...');
                autoTienSuCoNangKhong(function(count) {
                    if (count > 0) {
                        showToast('\u2705 \u0110\u00e3 t\u00edch "Kh\u00f4ng" cho ' + count + ' m\u1ee5c ti\u1ec1n s\u1eed');
                        spendCredits(count);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 t\u00edch t\u1ef1 \u0111\u1ed9ng - c\u00f3 th\u1ec3 trang n\u00e0y d\u00f9ng widget kh\u00e1c, b\u00e1o l\u1ea1i \u0111\u1ec3 t\u00f4i \u0111i\u1ec1u ch\u1ec9nh th\u00eam');
                    }
                });
            }
        },
        {
            emoji: '\ud83d\udcdd', label: 'Kh\u00e1m l\u00e2m s\u00e0ng ng\u01b0\u1eddi >18 tu\u1ed5i (M3)',
            tier: 'lite',
            color: '#2e7d32', hoverColor: '#1b5e20',
            // Kha dung khi URL chua "KSKDK_ThongTinKham" (trang M3 - Nguoi tu du 18-59 tuoi, Kham dinh ky)
            check: function() {
                return window.location.href.indexOf('KSKDK_ThongTinKham') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                // Dong bo logic voi "Thong tin kham NCT binh thuong (M4)":
                // resetAll -> tick toan bo "Chua phat hien bat thuong" -> chon
                // "Loai I" toan bo -> dien so TMH mac dinh. Khong tu dien thi
                // luc (Mat_KhongKinh) nua de giong M4.
                // BUG FIX: khong dem resetAll() vao phi - chi la buoc xoa truoc,
                // cac truong do duoc set lai ngay sau (tinh phi qua setNumberField).
                resetAll();
                var total = 0;
                setTimeout(function() {
                    total += tickAllChuaPhatHien([]);
                    total += selectRadioMultiException([], '', 'Lo\u1ea1i I');
                    if (setNumberField('Mat_KhongKinh_MP', '10')) total++;
                    if (setNumberField('Mat_KhongKinh_MT', '10')) total++;
                    total += fillCommonNumbers();
                    showToast('\ud83d\udcdd \u0110\u00e3 \u0111i\u1ec1n: Ch\u01b0a ph\u00e1t hi\u1ec7n b\u1ea5t th\u01b0\u1eddng + Lo\u1ea1i I (M3)');
                    spendCredits(total);
                }, 400);
            }
        },

        {
            emoji: '\ud83d\udcc2', label: 'H\u1ecfi b\u1ec7nh v\u00e0 kh\u00e1m l\u00e2m s\u00e0ng NCT (M4)',
            tier: 'lite',
            color: '#1565c0', hoverColor: '#0d47a1',
            hasFlyout: true,
            // Kha dung khi co row D1 (trang Hoi benh va kham lam sang)
            check: function() {
                var rows = document.querySelectorAll('tr[role="row"]');
                for (var i = 0; i < rows.length; i++) {
                    var cell = rows[i].querySelector('td[aria-colindex="1"]');
                    if (cell && cell.textContent.trim() === 'D1') return true;
                }
                return false;
            },
            flyoutItems: [
                {
                    label: '\ud83d\udc64 T\u1eeb 40 tu\u1ed5i tr\u1edf xu\u1ed1ng',
                    color: '#1565c0',
                    selfBills: true, // bill theo count thuc te
                    fn: function() {
                        var list = [
                            // D1 header + D1.1-D1.14
                            { code: 'D1',    opt: 'Kh\u00f4ng' },
                            { code: 'D1.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.5',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.7',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.9',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.10', opt: 'Kh\u00f4ng' },
                            { code: 'D1.11', opt: 'Kh\u00f4ng' },
                            { code: 'D1.12', opt: 'Kh\u00f4ng' },
                            { code: 'D1.13', opt: 'Kh\u00f4ng' },
                            { code: 'D1.14', opt: 'Kh\u00f4ng' },
                            // D2
                            { code: 'D2.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.5',  opt: 'Kh\u00f4ng' },
                            // D3
                            { code: 'D3.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.3',  opt: 'Kh\u00f4ng' },
                            // D4
                            { code: 'D4.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.5',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.7',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.8',  opt: 'Kh\u00f4ng' },
                            // D5
                            { code: 'D5.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.5',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.7',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.9',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.10', opt: 'Kh\u00f4ng' },
                            { code: 'D5.11', opt: 'Kh\u00f4ng' },
                            // D6
                            { code: 'D6.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.3',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.8',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.9',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D7
                            { code: 'D7.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.3',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D8.1
                            { code: 'D8.1.1', opt: 'C\u00f3' },
                            { code: 'D8.1.2', opt: 'C\u00f3' },
                            { code: 'D8.1.3', opt: 'C\u00f3' },
                            { code: 'D8.1.4', opt: 'C\u00f3' },
                            { code: 'D8.1.5', opt: 'C\u00f3' },
                            { code: 'D8.1.6', opt: 'C\u00f3' },
                            // D8.2 - Sinh hoat hang ngay (IADL)
                            { code: 'D8.2.1', opt: 'C\u00f3' },
                            { code: 'D8.2.2', opt: 'C\u00f3' },
                            { code: 'D8.2.3', opt: 'C\u00f3' },
                            { code: 'D8.2.4', opt: 'C\u00f3' },
                            { code: 'D8.2.5', opt: 'C\u00f3' },
                            { code: 'D8.2.6', opt: 'C\u00f3' },   // Lai xe: Co (duoi 40 tuoi con lai duoc)
                            { code: 'D8.2.7', opt: 'C\u00f3' },
                            { code: 'D8.2.8', opt: 'C\u00f3' },
                            // D8.3
                            { code: 'D8.3.1', opt: 'Kh\u00f4ng/M\u1ed9t s\u1ed1 l\u1ea7n' },
                            { code: 'D8.3.2', opt: 'Kh\u00f4ng' },
                            { code: 'D8.3.3', opt: 'Kh\u00f4ng' },
                            // D8.4
                            { code: 'D8.4.1', opt: 'Kh\u00f4ng' },
                            { code: 'D8.4.2', opt: 'Kh\u00f4ng' },
                            { code: 'D8.4.3', opt: 'Kh\u00f4ng' },
                            // D8.5
                            { code: 'D8.5.1', opt: 'C\u00f3' },
                            { code: 'D8.5.2', opt: 'C\u00f3' },
                            { code: 'D8.5.3', opt: 'Kh\u00f4ng' },
                        ];
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n nh\u00f3m \u226440 tu\u1ed5i...');
                        selectNCTRadioBulk(list, function(count) {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m \u226440 tu\u1ed5i' + ' (' + count + ' \u00f4)');
                            spendCredits(count);
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 41 \u0111\u1ebfn 60 tu\u1ed5i',
                    color: '#1565c0',
                    selfBills: true, // bill theo count thuc te
                    fn: function() {
                        // ============================================================
                        //  NHOM 41-60 TUOI - theo phieu 41-60.mhtml
                        //  Diem khac biet chinh so voi nhom <= 40 va nhom >= 61:
                        //  D8.3.6 (Lai xe / su dung phuong tien): tick "Co"
                        //    + Nguoi 41-60 van co kha nang lai xe binh thuong
                        //    + Nhom >= 61 tick "Khong" vi giam kha nang lai xe
                        //    + Nhom <= 40 tick "Co" tuong tu nhom nay
                        // ============================================================
                        var list = [
                            // D1 - Benh nen (mac dinh Khong)
                            { code: 'D1',    opt: 'Kh\u00f4ng' },
                            { code: 'D1.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.5',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.7',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.9',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.10', opt: 'Kh\u00f4ng' },
                            { code: 'D1.11', opt: 'Kh\u00f4ng' },
                            { code: 'D1.12', opt: 'Kh\u00f4ng' },
                            { code: 'D1.13', opt: 'Kh\u00f4ng' },
                            { code: 'D1.14', opt: 'Kh\u00f4ng' },
                            // D2 - Tam soat Dai thao duong
                            { code: 'D2.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.5',  opt: 'Kh\u00f4ng' },
                            // D3 - Tam soat COPD
                            { code: 'D3.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.3',  opt: 'Kh\u00f4ng' },
                            // D4 - Tam soat Hen phe quan
                            { code: 'D4.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.5',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.7',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.8',  opt: 'Kh\u00f4ng' },
                            // D5 - Tam soat Ung thu
                            { code: 'D5.1',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.3',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.5',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.7',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.9',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.10', opt: 'Kh\u00f4ng' },
                            { code: 'D5.11', opt: 'Kh\u00f4ng' },
                            // D6 - Tram cam PHQ-9 (Hau nhu khong)
                            { code: 'D6.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.3',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.8',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.9',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D7 - Lo au GAD-7 (Hau nhu khong)
                            { code: 'D7.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.3',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D8.1 - Sinh hoat co ban (BADL): tat ca tu lam duoc
                            { code: 'D8.1.1', opt: 'C\u00f3' },
                            { code: 'D8.1.2', opt: 'C\u00f3' },
                            { code: 'D8.1.3', opt: 'C\u00f3' },
                            { code: 'D8.1.4', opt: 'C\u00f3' },
                            { code: 'D8.1.5', opt: 'C\u00f3' },
                            { code: 'D8.1.6', opt: 'C\u00f3' },
                            // D8.2 - Sinh hoat hang ngay (IADL)
                            // D8.2.6 (Lai xe): "Co" - khac voi nhom >= 61 tick "Khong"
                            { code: 'D8.2.1', opt: 'C\u00f3' },
                            { code: 'D8.2.2', opt: 'C\u00f3' },
                            { code: 'D8.2.3', opt: 'C\u00f3' },
                            { code: 'D8.2.4', opt: 'C\u00f3' },
                            { code: 'D8.2.5', opt: 'C\u00f3' },
                            { code: 'D8.2.6', opt: 'C\u00f3' },   // Lai xe: Co (41-60 con lai xe binh thuong)
                            { code: 'D8.2.7', opt: 'C\u00f3' },
                            { code: 'D8.2.8', opt: 'C\u00f3' },
                            // D8.3 - Suy yeu the chat
                            { code: 'D8.3.1', opt: 'Kh\u00f4ng/M\u1ed9t s\u1ed1 l\u1ea7n' },
                            { code: 'D8.3.2', opt: 'Kh\u00f4ng' },
                            { code: 'D8.3.3', opt: 'Kh\u00f4ng' },
                            // D8.4 - Te nga
                            { code: 'D8.4.1', opt: 'Kh\u00f4ng' },
                            { code: 'D8.4.2', opt: 'Kh\u00f4ng' },
                            { code: 'D8.4.3', opt: 'Kh\u00f4ng' },
                            // D8.5 - Giam nhan thuc / Sa sut tri tue
                            { code: 'D8.5.1', opt: 'C\u00f3' },
                            { code: 'D8.5.2', opt: 'C\u00f3' },
                            { code: 'D8.5.3', opt: 'Kh\u00f4ng' },
                        ];
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n nh\u00f3m 41-60 tu\u1ed5i...');
                        selectNCTRadioBulk(list, function(count) {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 41-60 tu\u1ed5i' + ' (' + count + ' \u00f4)');
                            spendCredits(count);
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 61 \u0111\u1ebfn 70 tu\u1ed5i',
                    color: '#1565c0',
                    selfBills: true, // bill theo count thuc te
                    fn: function() {
                        // ============================================================
                        //  NHOM 61-70 TUOI - cap nhat theo phieu 61-70.mhtml
                        //  Khac biet chinh so voi nhom 41-60:
                        //  - D6 PHQ-9: form 61-70 dung thang 4 muc (Hau nhu khong /
                        //    Mot vai ngay / Hon nua so ngay / Gan nhu moi ngay)
                        //    => chon "Hau nhu khong" (dung)
                        //  - D7 GAD-7: tuong tu D6, chon "Hau nhu khong" (dung)
                        //  - D8.1 (BADL): tat ca "Co" - van tu lam duoc sinh hoat co ban
                        //  - D8.3.6 (Lai xe): "Khong" - nguoi 61-70 bat dau giam
                        //    kha nang lai xe / su dung phuong tien (khac voi 41-60 = "Co")
                        //  - D8.3.1-5, 7-8: "Co" - cac sinh hoat hang ngay khac van ok
                        //  - D8.3.1: "Khong/Mot so lan" (chua suy yeu ro ret)
                        //  - D8.3.2-3: "Khong"
                        //  - D8.4 (Te nga): tat ca "Khong"
                        //  - D8.5.1-2: "Co" (nhan thuc con tot)
                        //  - D8.5.3: "Khong" (chua sa sut tri tue)
                        // ============================================================
                        var list = [
                            // D1 - Benh nen (mac dinh Khong)
                            { code: 'D1',    opt: 'Kh\u00f4ng' },
                            { code: 'D1.1',  opt: 'Kh\u00f4ng' }, { code: 'D1.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.3',  opt: 'Kh\u00f4ng' }, { code: 'D1.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.5',  opt: 'Kh\u00f4ng' }, { code: 'D1.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.7',  opt: 'Kh\u00f4ng' }, { code: 'D1.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.9',  opt: 'Kh\u00f4ng' }, { code: 'D1.10', opt: 'Kh\u00f4ng' },
                            { code: 'D1.11', opt: 'Kh\u00f4ng' }, { code: 'D1.12', opt: 'Kh\u00f4ng' },
                            { code: 'D1.13', opt: 'Kh\u00f4ng' }, { code: 'D1.14', opt: 'Kh\u00f4ng' },
                            // D2 - Tam soat Dai thao duong
                            { code: 'D2.1',  opt: 'Kh\u00f4ng' }, { code: 'D2.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.3',  opt: 'Kh\u00f4ng' }, { code: 'D2.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.5',  opt: 'Kh\u00f4ng' },
                            // D3 - Tam soat COPD
                            { code: 'D3.1',  opt: 'Kh\u00f4ng' }, { code: 'D3.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.3',  opt: 'Kh\u00f4ng' },
                            // D4 - Tam soat Hen phe quan
                            { code: 'D4.1',  opt: 'Kh\u00f4ng' }, { code: 'D4.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.3',  opt: 'Kh\u00f4ng' }, { code: 'D4.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.5',  opt: 'Kh\u00f4ng' }, { code: 'D4.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.7',  opt: 'Kh\u00f4ng' }, { code: 'D4.8',  opt: 'Kh\u00f4ng' },
                            // D5 - Tam soat Ung thu
                            { code: 'D5.1',  opt: 'Kh\u00f4ng' }, { code: 'D5.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.3',  opt: 'Kh\u00f4ng' }, { code: 'D5.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.5',  opt: 'Kh\u00f4ng' }, { code: 'D5.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.7',  opt: 'Kh\u00f4ng' }, { code: 'D5.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.9',  opt: 'Kh\u00f4ng' }, { code: 'D5.10', opt: 'Kh\u00f4ng' },
                            { code: 'D5.11', opt: 'Kh\u00f4ng' },
                            // D6 - Tram cam PHQ-9 (thang 4 muc trong form 61-70)
                            // => chon "Hau nhu khong" = muc thap nhat, phu hop NCT khoe manh
                            { code: 'D6.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.3',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.8',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.9',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D7 - Lo au GAD-7 (thang 4 muc trong form 61-70)
                            // => chon "Hau nhu khong" = muc thap nhat
                            { code: 'D7.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.3',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D8.1 - Sinh hoat co ban (BADL): tat ca "Co"
                            { code: 'D8.1.1', opt: 'C\u00f3' }, { code: 'D8.1.2', opt: 'C\u00f3' },
                            { code: 'D8.1.3', opt: 'C\u00f3' }, { code: 'D8.1.4', opt: 'C\u00f3' },
                            { code: 'D8.1.5', opt: 'C\u00f3' }, { code: 'D8.1.6', opt: 'C\u00f3' },
                            // D8.2 - Sinh hoat hang ngay (IADL)
                            // D8.2.6 (Lai xe): "Khong" - nguoi 61-70 giam kha nang lai xe
                            // khac voi nhom 41-60 tick "Co"
                            { code: 'D8.2.1', opt: 'C\u00f3' }, { code: 'D8.2.2', opt: 'C\u00f3' },
                            { code: 'D8.2.3', opt: 'C\u00f3' }, { code: 'D8.2.4', opt: 'C\u00f3' },
                            { code: 'D8.2.5', opt: 'C\u00f3' }, { code: 'D8.2.6', opt: 'Kh\u00f4ng' }, // Lai xe: Khong
                            { code: 'D8.2.7', opt: 'C\u00f3' }, { code: 'D8.2.8', opt: 'C\u00f3' },
                            // D8.3 - Suy yeu the chat
                            { code: 'D8.3.1', opt: 'Kh\u00f4ng/M\u1ed9t s\u1ed1 l\u1ea7n' },
                            { code: 'D8.3.2', opt: 'Kh\u00f4ng' }, { code: 'D8.3.3', opt: 'Kh\u00f4ng' },
                            // D8.4 - Te nga
                            { code: 'D8.4.1', opt: 'Kh\u00f4ng' }, { code: 'D8.4.2', opt: 'Kh\u00f4ng' },
                            { code: 'D8.4.3', opt: 'Kh\u00f4ng' },
                            // D8.5 - Giam nhan thuc / Sa sut tri tue
                            { code: 'D8.5.1', opt: 'C\u00f3' }, { code: 'D8.5.2', opt: 'C\u00f3' },
                            { code: 'D8.5.3', opt: 'Kh\u00f4ng' },
                        ];
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n nh\u00f3m 61-70 tu\u1ed5i...');
                        selectNCTRadioBulk(list, function(count) {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 61-70 tu\u1ed5i' + ' (' + count + ' \u00f4)');
                            spendCredits(count);
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 71 \u0111\u1ebfn 80 tu\u1ed5i',
                    color: '#1565c0',
                    selfBills: true, // bill theo count thuc te
                    fn: function() {
                        // ============================================================
                        //  NHOM 71-80 TUOI - cap nhat theo phieu 71-80.mhtml
                        //  Khac biet chinh so voi cac nhom tre hon:
                        //  - D1: Co (co benh nen) | D1.1 THA: Co | D1.9 Tim thieu mau: Co
                        //  - D6 PHQ-9: mot so muc "Mot vai ngay" (D6.3, D6.4, D6.5, D6.7)
                        //  - D7 GAD-7: D7.3 = "Mot vai ngay", con lai "Hau nhu khong"
                        //  - D8.1 (BADL): tat ca "Co" - van tu lam duoc sinh hoat co ban
                        //  - D8.3.1-4: "Khong" (khong tu nghe dt, mua sam, nau an, don nha)
                        //  - D8.3.5: "Co" (van tu giat do duoc)
                        //  - D8.3.6: "Khong" (khong lai xe)
                        //  - D8.3.7-8: "Co" (van tu uong thuoc, quan ly tien)
                        //  - D8.3.1: "Khong/Mot so lan" | D8.3.2-3: "Co" (kho leo thang, di bo)
                        //  - D8.4.1: "Co" (da bi te nga) | D8.4.2-3: "Khong"
                        //  - D8.5.1: "Co" (tri nho giam) | D8.5.2-3: "Khong"
                        // ============================================================
                        var list = [
                            // D1 - Benh nen: Co THA va Benh tim thieu mau cuc bo
                            { code: 'D1',    opt: 'C\u00f3' },
                            { code: 'D1.1',  opt: 'C\u00f3' },    // Tang huyet ap: Co
                            { code: 'D1.2',  opt: 'Kh\u00f4ng' }, // Dai thao duong: Khong
                            { code: 'D1.3',  opt: 'Kh\u00f4ng' }, { code: 'D1.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.5',  opt: 'Kh\u00f4ng' }, { code: 'D1.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.7',  opt: 'Kh\u00f4ng' }, { code: 'D1.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.9',  opt: 'C\u00f3' },    // Benh tim thieu mau cuc bo: Co
                            { code: 'D1.10', opt: 'Kh\u00f4ng' }, { code: 'D1.11', opt: 'Kh\u00f4ng' },
                            { code: 'D1.12', opt: 'Kh\u00f4ng' }, { code: 'D1.13', opt: 'Kh\u00f4ng' },
                            { code: 'D1.14', opt: 'Kh\u00f4ng' },
                            // D2 - Tam soat Dai thao duong
                            { code: 'D2.1',  opt: 'Kh\u00f4ng' }, { code: 'D2.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.3',  opt: 'Kh\u00f4ng' }, { code: 'D2.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.5',  opt: 'Kh\u00f4ng' },
                            // D3 - Tam soat COPD
                            { code: 'D3.1',  opt: 'Kh\u00f4ng' }, { code: 'D3.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.3',  opt: 'Kh\u00f4ng' },
                            // D4 - Tam soat Hen phe quan
                            { code: 'D4.1',  opt: 'Kh\u00f4ng' }, { code: 'D4.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.3',  opt: 'Kh\u00f4ng' }, { code: 'D4.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.5',  opt: 'Kh\u00f4ng' }, { code: 'D4.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.7',  opt: 'Kh\u00f4ng' }, { code: 'D4.8',  opt: 'Kh\u00f4ng' },
                            // D5 - Tam soat Ung thu
                            { code: 'D5.1',  opt: 'Kh\u00f4ng' }, { code: 'D5.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.3',  opt: 'Kh\u00f4ng' }, { code: 'D5.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.5',  opt: 'Kh\u00f4ng' }, { code: 'D5.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.7',  opt: 'Kh\u00f4ng' }, { code: 'D5.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.9',  opt: 'Kh\u00f4ng' }, { code: 'D5.10', opt: 'Kh\u00f4ng' },
                            { code: 'D5.11', opt: 'Kh\u00f4ng' },
                            // D6 - Tram cam PHQ-9
                            // Mot so muc "Mot vai ngay" phu hop voi nguoi cao tuoi co benh nen
                            { code: 'D6.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.3',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Kho ngu: Mot vai ngay
                            { code: 'D6.4',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Met moi: Mot vai ngay
                            { code: 'D6.5',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // An khong ngon: Mot vai ngay
                            { code: 'D6.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.7',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Kho tap trung: Mot vai ngay
                            { code: 'D6.8',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.9',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D7 - Lo au GAD-7
                            { code: 'D7.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.3',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Lo lang qua muc: Mot vai ngay
                            { code: 'D7.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D8.1 - Sinh hoat co ban (BADL): tat ca "Co" - van tu lam duoc
                            { code: 'D8.1.1', opt: 'C\u00f3' }, { code: 'D8.1.2', opt: 'C\u00f3' },
                            { code: 'D8.1.3', opt: 'C\u00f3' }, { code: 'D8.1.4', opt: 'C\u00f3' },
                            { code: 'D8.1.5', opt: 'C\u00f3' }, { code: 'D8.1.6', opt: 'C\u00f3' },
                            // D8.2 - Sinh hoat hang ngay (IADL): giam nhieu kha nang
                            { code: 'D8.2.1', opt: 'Kh\u00f4ng' }, // Tu nghe dt: Khong
                            { code: 'D8.2.2', opt: 'Kh\u00f4ng' }, // Tu mua sam: Khong
                            { code: 'D8.2.3', opt: 'Kh\u00f4ng' }, // Tu nau an: Khong
                            { code: 'D8.2.4', opt: 'Kh\u00f4ng' }, // Tu don nha: Khong
                            { code: 'D8.2.5', opt: 'C\u00f3' },    // Tu giat do: Co
                            { code: 'D8.2.6', opt: 'Kh\u00f4ng' }, // Lai xe: Khong
                            { code: 'D8.2.7', opt: 'C\u00f3' },    // Tu uong thuoc: Co
                            { code: 'D8.2.8', opt: 'C\u00f3' },    // Quan ly tien: Co
                            // D8.3 - Suy yeu the chat: bat dau co dau hieu suy yeu
                            { code: 'D8.3.1', opt: 'Kh\u00f4ng/M\u1ed9t s\u1ed1 l\u1ea7n' },
                            { code: 'D8.3.2', opt: 'C\u00f3' },    // Kho leo 10 bac thang: Co
                            { code: 'D8.3.3', opt: 'C\u00f3' },    // Kho di bo 300m: Co
                            // D8.4 - Te nga
                            { code: 'D8.4.1', opt: 'C\u00f3' },    // Da bi te nga trong nam qua: Co
                            { code: 'D8.4.2', opt: 'Kh\u00f4ng' }, // So te nga: Khong
                            { code: 'D8.4.3', opt: 'Kh\u00f4ng' }, // Cam giac di dung khong vung: Khong
                            // D8.5 - Giam nhan thuc / Sa sut tri tue
                            { code: 'D8.5.1', opt: 'C\u00f3' },    // Tri nho giam: Co
                            { code: 'D8.5.2', opt: 'Kh\u00f4ng' }, // Nho 3 tu / dinh huong: Khong
                            { code: 'D8.5.3', opt: 'Kh\u00f4ng' }, // Nho lai 3 tu: Khong
                        ];
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n nh\u00f3m 71-80 tu\u1ed5i...');
                        selectNCTRadioBulk(list, function(count) {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 71-80 tu\u1ed5i' + ' (' + count + ' \u00f4)');
                            spendCredits(count);
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 81 tu\u1ed5i tr\u1edf l\u00ean',
                    color: '#1565c0',
                    selfBills: true, // bill theo count thuc te
                    fn: function() {
                        // ============================================================
                        //  NHOM 81 TUOI TRO LEN - theo phieu 81TRO LEN.mhtml
                        //  Khac biet chinh so voi nhom 71-80:
                        //  - D1/D1.1/D1.9: Co (THA + Tim thieu mau)
                        //  - D8.3.5: Khong (khong con tu giat do duoc, khac 71-80 = Co)
                        //  - D8.3.1: "Tat ca moi luc/ hau het thoi gian" (nang hon 71-80)
                        //  - D8.5.2: Khong (khong nho duoc 3 tu / dinh huong)
                        // ============================================================
                        var list = [
                            // D1 - Benh nen: Co THA va Benh tim thieu mau cuc bo
                            { code: 'D1',    opt: 'C\u00f3' },
                            { code: 'D1.1',  opt: 'C\u00f3' },    // Tang huyet ap: Co
                            { code: 'D1.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.3',  opt: 'Kh\u00f4ng' }, { code: 'D1.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.5',  opt: 'Kh\u00f4ng' }, { code: 'D1.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.7',  opt: 'Kh\u00f4ng' }, { code: 'D1.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D1.9',  opt: 'C\u00f3' },    // Benh tim thieu mau cuc bo: Co
                            { code: 'D1.10', opt: 'Kh\u00f4ng' }, { code: 'D1.11', opt: 'Kh\u00f4ng' },
                            { code: 'D1.12', opt: 'Kh\u00f4ng' }, { code: 'D1.13', opt: 'Kh\u00f4ng' },
                            { code: 'D1.14', opt: 'Kh\u00f4ng' },
                            // D2 - Tam soat Dai thao duong
                            { code: 'D2.1',  opt: 'Kh\u00f4ng' }, { code: 'D2.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.3',  opt: 'Kh\u00f4ng' }, { code: 'D2.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D2.5',  opt: 'Kh\u00f4ng' },
                            // D3 - Tam soat COPD
                            { code: 'D3.1',  opt: 'Kh\u00f4ng' }, { code: 'D3.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D3.3',  opt: 'Kh\u00f4ng' },
                            // D4 - Tam soat Hen phe quan
                            { code: 'D4.1',  opt: 'Kh\u00f4ng' }, { code: 'D4.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.3',  opt: 'Kh\u00f4ng' }, { code: 'D4.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.5',  opt: 'Kh\u00f4ng' }, { code: 'D4.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D4.7',  opt: 'Kh\u00f4ng' }, { code: 'D4.8',  opt: 'Kh\u00f4ng' },
                            // D5 - Tam soat Ung thu
                            { code: 'D5.1',  opt: 'Kh\u00f4ng' }, { code: 'D5.2',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.3',  opt: 'Kh\u00f4ng' }, { code: 'D5.4',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.5',  opt: 'Kh\u00f4ng' }, { code: 'D5.6',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.7',  opt: 'Kh\u00f4ng' }, { code: 'D5.8',  opt: 'Kh\u00f4ng' },
                            { code: 'D5.9',  opt: 'Kh\u00f4ng' }, { code: 'D5.10', opt: 'Kh\u00f4ng' },
                            { code: 'D5.11', opt: 'Kh\u00f4ng' },
                            // D6 - Tram cam PHQ-9
                            { code: 'D6.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.3',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Kho ngu: Mot vai ngay
                            { code: 'D6.4',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Met moi: Mot vai ngay
                            { code: 'D6.5',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // An khong ngon: Mot vai ngay
                            { code: 'D6.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.7',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Kho tap trung: Mot vai ngay
                            { code: 'D6.8',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D6.9',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D7 - Lo au GAD-7
                            { code: 'D7.1',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.2',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.3',  opt: 'M\u1ed9t v\u00e0i ng\u00e0y' },  // Lo lang qua muc: Mot vai ngay
                            { code: 'D7.4',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.5',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.6',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            { code: 'D7.7',  opt: 'H\u1ea7u nh\u01b0 kh\u00f4ng' },
                            // D8.1 - Sinh hoat co ban (BADL): tat ca "Co" - van tu lam duoc
                            { code: 'D8.1.1', opt: 'C\u00f3' }, { code: 'D8.1.2', opt: 'C\u00f3' },
                            { code: 'D8.1.3', opt: 'C\u00f3' }, { code: 'D8.1.4', opt: 'C\u00f3' },
                            { code: 'D8.1.5', opt: 'C\u00f3' }, { code: 'D8.1.6', opt: 'C\u00f3' },
                            // D8.2 - Sinh hoat hang ngay (IADL): giam nang, chi con uong thuoc & quan ly tien
                            { code: 'D8.2.1', opt: 'Kh\u00f4ng' }, // Tu nghe dt: Khong
                            { code: 'D8.2.2', opt: 'Kh\u00f4ng' }, // Tu mua sam: Khong
                            { code: 'D8.2.3', opt: 'Kh\u00f4ng' }, // Tu nau an: Khong
                            { code: 'D8.2.4', opt: 'Kh\u00f4ng' }, // Tu don nha: Khong
                            { code: 'D8.2.5', opt: 'Kh\u00f4ng' }, // Tu giat do: Khong (khac 71-80)
                            { code: 'D8.2.6', opt: 'Kh\u00f4ng' }, // Lai xe: Khong
                            { code: 'D8.2.7', opt: 'C\u00f3' },    // Tu uong thuoc: Co
                            { code: 'D8.2.8', opt: 'C\u00f3' },    // Quan ly tien: Co
                            // D8.3 - Suy yeu the chat: nang hon, met hau het thoi gian
                            { code: 'D8.3.1', opt: 'T\u1ea5t c\u1ea3 m\u1ecdi l\u00fac/ h\u1ea7u h\u1ebft th\u1eddi gian' },
                            { code: 'D8.3.2', opt: 'C\u00f3' },    // Kho leo 10 bac thang: Co
                            { code: 'D8.3.3', opt: 'C\u00f3' },    // Kho di bo 300m: Co
                            // D8.4 - Te nga
                            { code: 'D8.4.1', opt: 'C\u00f3' },    // Da bi te nga: Co
                            { code: 'D8.4.2', opt: 'Kh\u00f4ng' }, // So te nga: Khong
                            { code: 'D8.4.3', opt: 'Kh\u00f4ng' }, // Cam giac di dung khong vung: Khong
                            // D8.5 - Giam nhan thuc / Sa sut tri tue
                            { code: 'D8.5.1', opt: 'C\u00f3' },    // Tri nho giam: Co
                            { code: 'D8.5.2', opt: 'Kh\u00f4ng' }, // Nho 3 tu / dinh huong: Khong
                            { code: 'D8.5.3', opt: 'Kh\u00f4ng' }, // Nho lai 3 tu: Khong
                        ];
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n nh\u00f3m 81 tu\u1ed5i tr\u1edf l\u00ean...');
                        selectNCTRadioBulk(list, function(count) {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 81 tu\u1ed5i tr\u1edf l\u00ean' + ' (' + count + ' \u00f4)');
                            spendCredits(count);
                        });
                    }
                },
                {
                    label: '\u2764\ufe0f B\u1ec7nh n\u1ec1n THA & \u0110T\u0110',
                    color: '#b71c1c',
                    selfBills: true, // bill theo count thuc te
                    fn: function() {
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n THA & \u0110T\u0110...');
                        selectNCTRadioBulk(NCT_THA_DTD, function(count) {
                            showToast('\u2764\ufe0f \u0110\u00e3 \u0111i\u1ec1n xong: B\u1ec7nh n\u1ec1n THA & \u0110T\u0110' + ' (' + count + ' \u00f4)');
                            spendCredits(count);
                        });
                    }
                }
            ],
            fn: function() { /* handled by flyout */ }
        },
        {
            emoji: '\u2705', label: 'Th\u00f4ng tin kh\u00e1m NCT b\u00ecnh th\u01b0\u1eddng (M4)',
            tier: 'lite',
            color: '#2e7d32', hoverColor: '#1b5e20',
            // Chi kha dung tren trang KNCT_ThongTinKham
            check: function() {
                return window.location.href.indexOf('KNCT_ThongTinKham') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                // BUG FIX: khong dem resetAll() vao phi - chi la buoc xoa truoc,
                // cac truong do duoc set lai ngay sau (tinh phi qua setNumberField).
                resetAll();
                var total = 0;
                setTimeout(function() {
                    total += tickAllChuaPhatHien([]);
                    total += selectRadioMultiException([], '', 'Lo\u1ea1i I');
                    if (setNumberField('Mat_KhongKinh_MP', '10')) total++;
                    if (setNumberField('Mat_KhongKinh_MT', '10')) total++;
                    total += fillCommonNumbers();
                    showToast('\u2705 NCT b\u00ecnh th\u01b0\u1eddng \u2014 \u0111\u00e3 tick Ch\u01b0a ph\u00e1t hi\u1ec7n + Lo\u1ea1i I to\u00e0n b\u1ed9!');
                    spendCredits(total);
                }, 400);
            }
        },
        {
            emoji: '\ud83d\udcc1', label: 'KSK Vi\u1ec7c l\u00e0m + L\u00e1i xe',
            tier: 'pro',
            color: '#2e7d32', hoverColor: '#1b5e20',
            noAgeLogic: true,
            check: function() {
                // Chi kha dung tren trang "KSK Viec lam + Lai xe"
                // (nav_group/kskdk_thongtinkhamtren18/...), khong hien o cac
                // trang khac (M3, NCT, ...) du co cac truong PhanLoai trung ten.
                if (window.location.href.indexOf('kskdk_thongtinkhamtren18') === -1) return false;
                return !!document.querySelector('.TuanHoan_PhanLoai') ||
                       !!document.querySelector('.Mat_PhanLoai') ||
                       !!document.querySelector('.RHM_PhanLoai');
            },
            selfBills: true, // bill theo count thuc te (VL popup tra count qua applyVLSelections)
            fn: function() {
                showVLOptionsPopup(function(opts) { applyVLSelections(opts, function(count) { spendCredits(count); }); });
            }
        },
        {
            emoji: '\ud83d\udc66', label: 'Kh\u00e1m l\u00e2m s\u00e0ng <18 (M2)',
            tier: 'lite',
            color: '#e65100', hoverColor: '#bf360c',
            // Kha dung tren trang KSKD18_ThongTinKham (M2 - Tre duoi 18 tuoi)
            // Gop 2 chuc nang: xoa ICD + tick "Chua phat hien bat thuong" +
            // dien thi luc/TMH mac dinh, VA tick "Loai I" + "Binh thuong"
            // cho cac Phan loai / radiogroup con lai.
            check: function() {
                return window.location.href.indexOf('KSKD18_ThongTinKham') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                // Xoa ICD truoc, sau do tick "Chua phat hien bat thuong" + dien TMH mac dinh
                var icdClasses = [
                    'TuanHoan_ChanDoanSoBo_ICD', 'TuanHoan_ChanDoanXacDinh_ICD',
                    'HoHap_ChanDoanSoBo_ICD',    'HoHap_ChanDoanXacDinh_ICD',
                    'TieuHoa_ChanDoanSoBo_ICD',  'TieuHoa_ChanDoanXacDinh_ICD',
                    'ThanTietNieu_ChanDoanSoBo_ICD', 'ThanTietNieu_ChanDoanXacDinh_ICD',
                    'NoiTiet_ChanDoanSoBo_ICD',  'NoiTiet_ChanDoanXacDinh_ICD',
                    'TamThan_ChanDoanSoBo_ICD',  'TamThan_ChanDoanXacDinh_ICD',
                    'Mat_ChanDoanSoBo_ICD',      'Mat_ChanDoanXacDinh_ICD',
                    'TMH_ChanDoanSoBo_ICD',      'TMH_ChanDoanXacDinh_ICD',
                    'RHM_ChanDoanSoBo_ICD',      'RHM_ChanDoanXacDinh_ICD'
                ];
                var total = 0;
                icdClasses.forEach(function(cls) { if (clearTagBox(cls)) total++; });
                setTimeout(function() {
                    // BUG FIX: dung seenCbs de chong dem trung (giong tickAllChuaPhatHien)
                    var seenCbsM2 = [];
                    document.querySelectorAll('b').forEach(function(bEl) {
                        if (!bEl.textContent.includes('Ch\u01b0a ph\u00e1t hi\u1ec7n b\u1ea5t th\u01b0\u1eddng')) return;
                        var cb = findCheckboxNear(bEl);
                        if (!cb || seenCbsM2.indexOf(cb) !== -1) return;
                        seenCbsM2.push(cb);
                        if (tickCheckbox(cb)) total++;
                    });
                    if (setNumberField('Mat_KhongKinh_MP', '10')) total++;
                    if (setNumberField('Mat_KhongKinh_MT', '10')) total++;
                    total += fillCommonNumbers();

                    // Tick "Loai I" cho moi Phan loai + tick "Binh thuong" cho
                    // cac radiogroup co option do (vd Cot song...)
                    var r = autoSelectLoaiIAndBinhThuong();
                    total += r.done;

                    showToast('\u2705 \u0110\u00e3 t\u00edch Ch\u01b0a ph\u00e1t hi\u1ec7n b\u1ea5t th\u01b0\u1eddng + Lo\u1ea1i I / B\u00ecnh th\u01b0\u1eddng to\u00e0n b\u1ed9 (M2)');
                    spendCredits(total);
                }, 300);
            }
        },

        // ----------------------------------------------------------------
        //  KSK O TO - THONG TIN KHAM (KSKOT_ThongTinKham)
        //  URL: kskdk_Oto/.../KSKOT_ThongTinKham
        //  Cau truc giong KSK Viec lam: PhanLoai Loai I/II + Chua phat hien
        //  + thi luc + ICD. Dung chung popup + ham applyVLSelections.
        // ----------------------------------------------------------------
        {
            emoji: '\ud83d\ude97', label: 'KSK \u00d4 t\u00f4 \u2014 Th\u00f4ng tin kh\u00e1m',
            tier: 'pro',
            color: '#1565c0', hoverColor: '#0d47a1',
            noAgeLogic: true,
            check: function() {
                return window.location.href.indexOf('KSKOT_ThongTinKham') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                showVLOptionsPopup(function(opts) { applyVLSelections(opts, function(count) { spendCredits(count); }); });
            }
        },

        // ----------------------------------------------------------------
        //  KSK NGUOI LAI XE - TIEN SU (KSKLX_TienSu)
        //  URL: kskdk_NguoiLaiXe/.../KSKLX_TienSu
        //  Cau truc Co/Khong tuong tu KSKOT_TienSu -> dung chung ham
        //  autoTienSuCoNangKhong (generic, quet toan bo widget Co/Khong).
        // ----------------------------------------------------------------
        {
            emoji: '\ud83d\udcdd', label: 'KSK Ng\u01b0\u1eddi l\u00e1i xe \u2014 Ti\u1ec1n s\u1eed',
            tier: 'pro',
            color: '#6a1b9a', hoverColor: '#4a148c',
            check: function() {
                return window.location.href.indexOf('KSKLX_TienSu') !== -1;
            },
            selfBills: true, // bill theo count thuc te, khong dung phi co dinh
            fn: function() {
                showToast('\u23f3 \u0110ang t\u00edch "Kh\u00f4ng" cho to\u00e0n b\u1ed9 ti\u1ec1n s\u1eed l\u00e1i xe...');
                autoTienSuCoNangKhong(function(count) {
                    if (count > 0) {
                        showToast('\u2705 \u0110\u00e3 t\u00edch "Kh\u00f4ng" cho ' + count + ' m\u1ee5c ti\u1ec1n s\u1eed (l\u00e1i xe)');
                        spendCredits(count);
                    } else {
                        showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 t\u00edch, ki\u1ec3m tra l\u1ea1i trang');
                    }
                });
            }
        },

        // ----------------------------------------------------------------
        //  KSK NGUOI LAI XE - THONG TIN KHAM (KSKLX_ThongTinKham)
        //  URL: kskdk_NguoiLaiXe/.../KSKLX_ThongTinKham
        //  Cau truc giong KSK Viec lam / KSKOT_ThongTinKham: PhanLoai +
        //  Chua phat hien + thi luc + ICD. Dung chung popup VL.
        // ----------------------------------------------------------------
        {
            emoji: '\ud83e\uddd1\u200d\ud83d\ude97', label: 'KSK Ng\u01b0\u1eddi l\u00e1i xe \u2014 Th\u00f4ng tin kh\u00e1m',
            tier: 'pro',
            color: '#1565c0', hoverColor: '#0d47a1',
            noAgeLogic: true,
            check: function() {
                return window.location.href.indexOf('KSKLX_ThongTinKham') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                showVLOptionsPopup(function(opts) { applyVLSelections(opts, function(count) { spendCredits(count); }); });
            }
        },

        // ----------------------------------------------------------------
        //  KSK NGUOI LAI XE - PHIEU CAN LAM SANG (KSKLX_Phieu_CanLamSang)
        //  URL: kskdk_NguoiLaiXe/.../KSKLX_Phieu_CanLamSang
        //  Tick mac dinh "Am Tinh" cho 5 xet nghiem ma tuy bat buoc.
        // ----------------------------------------------------------------
        {
            emoji: '\ud83e\uddea', label: 'KSK Ng\u01b0\u1eddi l\u00e1i xe \u2014 C\u1eadn l\u00e2m s\u00e0ng (Xet nghi\u1ec7m ma t\u00fay \u00c2m T\u00ednh)',
            tier: 'pro',
            color: '#2e7d32', hoverColor: '#1b5e20',
            noAgeLogic: true,
            check: function() {
                return window.location.href.indexOf('KSKLX_Phieu_CanLamSang') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                var r = autoDrugTestAmTinh();
                if (r.done === r.total) {
                    showToast('\u2705 \u0110\u00e3 ch\u1ecdn "\u00c2m T\u00ednh" cho ' + r.done + '/' + r.total + ' x\u00e9t nghi\u1ec7m ma t\u00fay');
                    spendCredits(r.done);
                } else if (r.done > 0) {
                    showToast('\u26a0\ufe0f \u0110\u00e3 ch\u1ecdn ' + r.done + '/' + r.total + ', thi\u1ebfu ' + r.missed.length + ' m\u1ee5c (xem console)', 'warn');
                    spendCredits(r.done);
                } else {
                    showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 ch\u1ecdn, ki\u1ec3m tra l\u1ea1i trang');
                }
            }
        },

        // ----------------------------------------------------------------
        //  KSK O TO - PHIEU CAN LAM SANG (KSKOT_Phieu_CanLamSang)
        //  URL: kskdk_Oto/.../KSKOT_Phieu_CanLamSang
        //  Giong het co che cua KSKLX_Phieu_CanLamSang o tren: tick mac
        //  dinh "Am Tinh" cho 5 xet nghiem ma tuy bat buoc.
        // ----------------------------------------------------------------
        {
            emoji: '\ud83e\uddea', label: 'KSK \u00d4 t\u00f4 \u2014 C\u1eadn l\u00e2m s\u00e0ng (Xet nghi\u1ec7m ma t\u00fay \u00c2m T\u00ednh)',
            tier: 'pro',
            color: '#2e7d32', hoverColor: '#1b5e20',
            noAgeLogic: true,
            check: function() {
                return window.location.href.indexOf('KSKOT_Phieu_CanLamSang') !== -1;
            },
            selfBills: true, // bill theo count thuc te
            fn: function() {
                var r = autoDrugTestAmTinh();
                if (r.done === r.total) {
                    showToast('\u2705 \u0110\u00e3 ch\u1ecdn "\u00c2m T\u00ednh" cho ' + r.done + '/' + r.total + ' x\u00e9t nghi\u1ec7m ma t\u00fay');
                    spendCredits(r.done);
                } else if (r.done > 0) {
                    showToast('\u26a0\ufe0f \u0110\u00e3 ch\u1ecdn ' + r.done + '/' + r.total + ', thi\u1ebfu ' + r.missed.length + ' m\u1ee5c (xem console)', 'warn');
                    spendCredits(r.done);
                } else {
                    showToast('\u26a0 Kh\u00f4ng t\u00ecm th\u1ea5y m\u1ee5c n\u00e0o \u0111\u1ec3 ch\u1ecdn, ki\u1ec3m tra l\u1ea1i trang');
                }
            }
        },
    ];

    // ================================================================
    //  DROPDOWN MENU (gan vao body, position:fixed)
    // ================================================================
    //  HE THONG LICENSE V2
    //  - Machine ID: fingerprint trinh duyet (chi doc, khong the gia mao)
    //  - So du Medi: luu tren Cloudflare Worker + D1 (nguon su that duy nhat),
    //    client CHI cache lai de hien thi nhanh + tru lac quan, khong tu
    //    sinh duoc so du - moi thay doi thuc su deu qua goi API Worker.
    //  - 2.000d = 1 Medi = 100 luot autofill/autoclick
    //  - Dung thu: +5 Medi, CHI 1 LAN/MAY (Worker khoa qua co trial_used)
    // ================================================================

    // TODO: doi thanh URL Worker that sau khi deploy (xem huong dan trien khai)
    var WALLET_API = 'https://medinet-wallet.dha-medinet.workers.dev';
    var WALLET_KEY = '_mtt_wallet_cache_v1';
    var DEFAULT_ACTION_COST = 8; // uoc luong so luot (click/dien truong) trung binh 1 lan bam "Thao tac nhanh"

    // ================================================================
    //  XAC THUC SO DU BANG CHU KY SO (ECDSA P-256) - CHONG khach tu sua
    //  tay so du trong Tampermonkey Dashboard > Storage (khong can dung
    //  code van sua duoc gia tri luu trong GM storage). Worker giu KHOA
    //  RIENG TU (bi mat, chi o server) de KY moi lan tra ve so du; script
    //  nay chi giu KHOA CONG KHAI (an toan khi bi doc - chi dung de KIEM
    //  TRA chu ky, khong the dung de TAO chu ky moi). Neu ai do sua tay
    //  gia tri trong token (vd doi balance) ma khong co khoa rieng tu,
    //  chu ky se KHONG con khop -> script tu dong coi nhu KHONG HOP LE,
    //  balance hieu luc = 0, bat buoc phai lay token that tu Worker.
    // ================================================================
    // ================================================================
    //  MA BI MAT THIET BI (device secret) - KHAC voi Ma may (mid): mid
    //  duoc PHEP hien thi cong khai (de ghi noi dung chuyen khoan), con
    //  chuoi nay KHONG BAO GIO hien ra man hinh, tu sinh ngau nhien 1
    //  lan duy nhat va gui kem moi request tru tien/heartbeat/dung thu -
    //  la bang chung "day dung la script that dang chay tren dung may
    //  da tao vi nay", chan viec ai do biet duoc mid (vd nhin thay trong
    //  anh chup man hinh) roi tu goi thang API de tru/pha vi cua ho.
    // ================================================================
    var DEVICE_SECRET_KEY = '_mtt_device_secret_v1';
    var _deviceSecret = null;
    function getDeviceSecret() {
        if (_deviceSecret) return _deviceSecret;
        try {
            var saved = GM_getValue(DEVICE_SECRET_KEY, null);
            if (saved && typeof saved === 'string' && saved.length >= 32) {
                _deviceSecret = saved;
                return _deviceSecret;
            }
        } catch (e) {}
        var bytes = new Uint8Array(24);
        crypto.getRandomValues(bytes);
        var hex = Array.prototype.map.call(bytes, function(b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
        try { GM_setValue(DEVICE_SECRET_KEY, hex); } catch (e) {}
        _deviceSecret = hex;
        return _deviceSecret;
    }

    var WALLET_PUBLIC_JWK = {
        kty: 'EC', crv: 'P-256',
        x: 'l6Z_atNLQ_jvgC3uk6J3hqAJy7FgvH4qVT0qkpRLuQ0',
        y: 'RL9H0U5QVyH7aL7gufqygwz-n9KtIuESjK6qYyTH3zU'
    };
    var _walletPublicKeyPromise = null;
    function getWalletPublicKey() {
        if (!_walletPublicKeyPromise) {
            _walletPublicKeyPromise = crypto.subtle.importKey(
                'jwk', WALLET_PUBLIC_JWK, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
            ).catch(function() { return null; });
        }
        return _walletPublicKeyPromise;
    }

    function base64UrlToBytes(b64url) {
        var b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    // So du DA XAC THUC hien tai - CHI bien nay (trong bo nho, khong luu
    // storage) duoc dung de QUYET DINH mo/khoa tinh nang. Reset ve 0 moi
    // lan tai trang, chi duoc nap lai sau khi VERIFY chu ky thanh cong.
    var _verifiedWallet = { balance: 0, estimatedBalance: 0, trialUsed: false, exp: 0 };

    function isVerifiedWalletFresh() {
        return _verifiedWallet.exp > Math.floor(Date.now() / 1e3);
    }

    // Dinh dang so du Medi LUON DUNG 2 CHU SO THAP PHAN (vd "4.99", "5.00",
    // khong bao gio "4.9" hay "4.899999999999995") - dung 1 cho DUY NHAT
    // nay cho MOI noi hien thi so Medi ra man hinh, tranh moi truong hop
    // hien so le sai dinh dang. Math.round(...*100)/100 truoc khi toFixed
    // de chan luon ca truong hop sai so dau phay dong lam lech chu so cuoi.
    function fmtMedi(n) {
        var v = Math.round((typeof n === 'number' ? n : 0) * 100) / 100;
        if (v < 0) v = 0;
        return v.toFixed(2);
    }

    // Kiem tra chu ky cua 1 token "payload.sig" (dang Worker tra ve).
    // Tra ve Promise<boolean|object> - object khi hop le (da parse payload),
    // false khi chu ky sai / het han / mid khong khop may hien tai.
    function verifyWalletToken(token, expectMid) {
        if (!token || token.indexOf('.') === -1) return Promise.resolve(false);
        var parts = token.split('.');
        if (parts.length !== 2) return Promise.resolve(false);
        var payloadPart = parts[0], sigPart = parts[1];
        return getWalletPublicKey().then(function(pubKey) {
            if (!pubKey) return false;
            var sigBytes = base64UrlToBytes(sigPart);
            var msgBytes = new TextEncoder().encode(payloadPart);
            return crypto.subtle.verify(
                { name: 'ECDSA', hash: 'SHA-256' }, pubKey, sigBytes, msgBytes
            ).then(function(ok) {
                if (!ok) return false;
                var payload;
                try {
                    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadPart)));
                } catch (e) { return false; }
                if (expectMid && payload.mid !== expectMid) return false;
                if (!payload.exp || payload.exp < Math.floor(Date.now() / 1e3)) return false;
                return payload;
            });
        }).catch(function() { return false; });
    }

    // Ap dung 1 token da xac thuc THANH CONG vao _verifiedWallet + luu lai
    // token tho (de lan tai trang sau co the verify lai ngay, khong can
    // cho goi mang). KHONG BAO GIO ghi thang so balance vao storage nua -
    // chi ghi token (sua tay token se lam sai chu ky, vo dung).
    //
    // QUAN TRONG: dung "estimatedBalance" (da tru di phan live_clicks dang
    // dung do NHUNG CHUA DU 100 luot de tru chinh thuc) lam SO DU THAT DUY
    // NHAT cho ca gating (isLicenseValid) lan hien thi - KHONG con phan
    // biet "so du chinh thuc" rieng nua, tranh tinh trang refresh trang
    // lai thay so "nhay nguoc len" ve muc chua tru cua phan dang dung do.
    //
    // BUG FIX - CHONG "SO DU VOT LEN": neu server tra ve balance CAO HON
    // gia tri optimistic hien tai cua client (vi server chua nhan duoc
    // heartbeat cho so click moi tich luy), tru them phan pending do de
    // tranh hien thi so dU "nhay len" sau moi lan deduct.
    // Khi nguoi dung NAP THEM MEDI that su, realBalance se cao hon nhieu
    // (khong chi vi pending) nen phan bu bang unsyncedClicks van cho ket
    // qua dung (hien balance moi - pending).
    function applyVerifiedToken(payload, rawToken) {
        var realBalance = (typeof payload.estimatedBalance === 'number') ? payload.estimatedBalance : payload.balance;

        // Neu vi hien tai dang con hop le VA server bao so du CAO HON
        // gia tri optimistic client dang giu, kiem tra xem co phai vi
        // server chua biet ve cac click pending chua? Neu co -> tru bo de
        // tranh balance "vot len" tren man hinh.
        if (isVerifiedWalletFresh() && realBalance > _verifiedWallet.balance) {
            var pendingClicks = getUnsyncedClicks();
            if (pendingClicks > 0) {
                realBalance = Math.round(Math.max(0, realBalance - pendingClicks / 100) * 100) / 100;
            }
        }

        _verifiedWallet = {
            balance: realBalance,
            estimatedBalance: realBalance,
            trialUsed: !!payload.trialUsed,
            exp: payload.exp
        };
        try { GM_setValue(WALLET_KEY, rawToken); } catch (e) {}
    }

    // Tai token da luu tu lan truoc (neu con han) ngay khi script khoi
    // dong, de khong phai cho goi mang moi lan mo trang van co the mo
    // khoa tinh nang (token con han toi da 20 phut).
    function initWalletFromCache() {
        var raw = null;
        try { raw = GM_getValue(WALLET_KEY, null); } catch (e) {}
        if (!raw || typeof raw !== 'string') return;
        verifyWalletToken(raw, getMachineId()).then(function(payload) {
            if (payload) applyVerifiedToken(payload, raw);
        });
    }

    // Ham hash djb2 don gian (dung de tinh Machine ID)
    function _djb2(str) {
        var h = 5381;
        for (var i = 0; i < str.length; i++) {
            h = (((h << 5) + h) ^ str.charCodeAt(i)) & 0xffffffff;
        }
        return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
    }

    // ================================================================
    //  MACHINE ID - fingerprint da lop, uu tien dac trung GAN VOI PHAN
    //  CUNG VAT LY (GPU qua WebGL, canvas rendering, font da cai, man
    //  hinh thuc te...) thay vi chi dua vao User-Agent/ngon ngu nhu ban
    //  cu - 2 may CUNG MODEL/CAU HINH (mua nguyen lo, cung image Windows)
    //  van co kha nang ra MA KHAC NHAU nho cac sai bien nho giua tung
    //  may vat ly (driver GPU, font da tung cai qua cac phan mem khac
    //  nhau theo thoi gian, man hinh thuc gan vao...).
    //
    //  GIOI HAN KHACH QUAN (khong the vuot qua tu JavaScript): trinh
    //  duyet KHONG cho phep doc cac ID phan cung tuyet doi duy nhat nhu
    //  so serial CPU/o cung/mainboard hay dia chi MAC - day la gioi han
    //  bao mat co chu dich cua trinh duyet/Tampermonkey, ap dung cho MOI
    //  script, khong co API nao "lach" duoc. Cach lam duoi day la
    //  PHUONG AN MANH NHAT co the dat duoc tu phia JS: ket hop nhieu dac
    //  trung doc duoc (it bien dong theo thoi gian, gan voi phan cung
    //  thuc te) de giam toi da xac suat 2 may KHAC NHAU bi trung ma,
    //  ke ca khi chung giong nhau ve model/cau hinh tren giay.
    //
    //  LUU Y QUAN TRONG: thuat toan nay thay doi cong thuc tinh Machine
    //  ID so voi ban cu (vd: 6.22.x tro xuong). Sau khi cap nhat, voi
    //  may NAO DA KICH HOAT TRUOC DAY van dung binh thuong cho den khi
    //  het han (vi script chi kiem tra machineId LUC NHAP MA, khong doi
    //  chieu lai sau do). Nhung khi can cap MA MOI (kich hoat lai/may
    //  moi), TRANG TAO MA cua tac gia cung phai dung CHINH XAC cong thuc
    //  getMachineId() moi nay de tinh ra cung 1 chuoi "Ma may" thi ma
    //  moi tao ra moi khop.
    // ================================================================

    // Lay thong tin GPU qua WebGL (vendor/renderer thuc te cua card man
    // hinh) - kha on dinh theo thoi gian (khong doi khi Chrome/Windows
    // cap nhat), gan chat voi phan cung vat ly hon hau het cac chi so
    // trinh duyet khac.
    function _fpWebGL() {
        try {
            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'nogl';
            var dbg = gl.getExtension('WEBGL_debug_renderer_info');
            var vendor   = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR);
            var renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
            return (vendor || '') + '|' + (renderer || '');
        } catch (e) { return 'errgl'; }
    }

    // Canvas fingerprint: ve chu + hinh roi xuat ra du lieu pixel. Cach
    // GPU/driver/he dieu hanh render chu/anti-alias thuong tao ra sai
    // bien nho giua cac may vat ly khac nhau, ke ca cung model.
    function _fpCanvas() {
        try {
            var canvas = document.createElement('canvas');
            canvas.width = 240; canvas.height = 40;
            var ctx = canvas.getContext('2d');
            if (!ctx) return 'noctx';
            ctx.textBaseline = 'top';
            ctx.font = '15px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 90, 22);
            ctx.fillStyle = '#069';
            ctx.fillText('MedinetTTT \u00c1\u00c2\u00caO \u0111\u1eb7c 0123', 2, 16);
            ctx.fillStyle = 'rgba(102, 200, 0, 0.65)';
            ctx.fillText('MedinetTTT \u00c1\u00c2\u00caO \u0111\u1eb7c 0123', 4, 19);
            return canvas.toDataURL();
        } catch (e) { return 'errcanvas'; }
    }

    // Font fingerprint: do chieu rong text khi render bang tung font so
    // voi font goc (fallback) de phat hien font do CO duoc cai tren may
    // hay khong. Danh sach font tung duoc cai (vd cac font Vietnamese cu
    // .VnTime/VNI tu phan mem y te khac, hoac font day kem may in...)
    // thuong khac nhau giua tung may vat ly theo thoi gian su dung.
    function _fpFonts() {
        try {
            if (!document.body) return 'nobody';
            var testFonts = [
                'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Tahoma',
                'Segoe UI', 'Calibri', 'Cambria', 'Consolas', 'Comic Sans MS',
                'Vni-Times', 'VNI-Times', '.VnTime', 'UTM Avo', 'Roboto Condensed',
            ];
            var baseFonts = ['monospace', 'sans-serif', 'serif'];
            var testString = 'mmmmmmmmmmlli0123';
            var span = document.createElement('span');
            span.style.position = 'absolute';
            span.style.left = '-9999px';
            span.style.top = '-9999px';
            span.style.fontSize = '72px';
            span.textContent = testString;
            document.body.appendChild(span);
            var baseWidths = {};
            baseFonts.forEach(function(bf) {
                span.style.fontFamily = bf;
                baseWidths[bf] = span.offsetWidth;
            });
            var detected = [];
            testFonts.forEach(function(font) {
                var found = baseFonts.some(function(bf) {
                    span.style.fontFamily = '"' + font + '", ' + bf;
                    return span.offsetWidth !== baseWidths[bf];
                });
                if (found) detected.push(font);
            });
            document.body.removeChild(span);
            return detected.join(',');
        } catch (e) { return 'errfont'; }
    }

    // Tinh Machine ID: ket hop tat ca dac trung tren thanh 1 chuoi roi
    // hash bang djb2 - GIU NGUYEN dinh dang dau ra "MID-" + 8 ky tu hex
    // (giong ban cu) de tuong thich voi trang tao ma cua tac gia, chi
    // CONG THUC BEN TRONG (chuoi "raw") la duoc nang cap.
    function getMachineId() {
        var raw = [
            navigator.platform || '',
            (screen.width || 0) + 'x' + (screen.height || 0),
            (screen.availWidth || 0) + 'x' + (screen.availHeight || 0),
            (screen.colorDepth || 0) + '',
            (window.devicePixelRatio || 1) + '',
            navigator.language || '',
            (navigator.languages || []).join(','),
            (navigator.hardwareConcurrency || 0) + '',
            (navigator.deviceMemory || 0) + '',
            (navigator.maxTouchPoints || 0) + '',
            (new Date().getTimezoneOffset()) + '',
            _fpWebGL(),
            _fpCanvas(),
            _fpFonts(),
        ].join('||');
        return 'MID-' + _djb2(raw);
    }

    // Doc cache vi (dang tuong thich nguoc cho cac cho hien thi UI cu) -
    // GIA TRI THAT nam trong _verifiedWallet (chi cap nhat sau khi verify
    // chu ky thanh cong), khong con lay thang tu storage nua.
    var WALLET_UNSYNCED_KEY = '_mtt_unsynced_clicks_v1';
    function getUnsyncedClicks() {
        try { var v = GM_getValue(WALLET_UNSYNCED_KEY, 0); return typeof v === 'number' ? v : 0; }
        catch (e) { return 0; }
    }
    function setUnsyncedClicks(v) {
        try { GM_setValue(WALLET_UNSYNCED_KEY, v); } catch (e) {}
    }
    function getWalletCache() {
        return {
            balance: _verifiedWallet.balance,
            estimatedBalance: _verifiedWallet.estimatedBalance,
            trialUsed: _verifiedWallet.trialUsed,
            unsyncedClicks: getUnsyncedClicks()
        };
    }

    // Con Medi (dung de khoa/mo tinh nang). CHI doc _verifiedWallet (da
    // qua kiem tra chu ky + con han) - khong goi mang o day vi ham nay
    // duoc goi RAT THUONG XUYEN (moi lan mo menu, moi lan chay autofill).
    function isLicenseValid() {
        return isVerifiedWalletFresh() && _verifiedWallet.balance > 0;
    }
    function getWalletBalance() {
        return isVerifiedWalletFresh() ? _verifiedWallet.balance : 0;
    }

    // Dong bo so du moi nhat tu Worker (goi khi mo menu License / bam
    // "Lam moi so du" - KHONG chan luong autofill, chay ngam). Token tra
    // ve PHAI qua verifyWalletToken() truoc khi duoc tin - khong con gan
    // thang data.balance/data.estimatedBalance vao cache nhu truoc.
    function refreshWalletBalance(cb) {
        var mid = getMachineId();
        fetch(WALLET_API + '/balance?mid=' + encodeURIComponent(mid))
            .then(function(r) { return r.json(); })
            .then(function(data) {
                return verifyWalletToken(data.token, mid).then(function(payload) {
                    if (payload) applyVerifiedToken(payload, data.token);
                    if (cb) cb(!!payload, getWalletCache());
                });
            })
            .catch(function() { if (cb) cb(false, getWalletCache()); });
    }

    // Kich hoat dung thu: +5 Medi, CHI 1 LAN/MAY - Worker tu chan lan 2
    // (co trial_used trong D1, khong phu thuoc du lieu cuc bo nen xoa
    // cache/cai lai script cung khong dung thu lai duoc). Token tra ve
    // cung phai qua verify truoc khi duoc ap dung.
    function activateTrial(onDone) {
        var mid = getMachineId();
        fetch(WALLET_API + '/trial', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Device-Secret': getDeviceSecret() },
            body: JSON.stringify({ mid: mid }),
        })
        .then(function(r) { return r.json().then(function(d) { return { status: r.status, data: d }; }); })
        .then(function(res) {
            if (res.status === 200) {
                return verifyWalletToken(res.data.token, mid).then(function(payload) {
                    if (!payload) { onDone(false, 'loi'); return; }
                    applyVerifiedToken(payload, res.data.token);
                    onDone(true, payload.balance);
                });
            } else {
                var reason = 'loi';
                if (res.data && res.data.error === 'trial_already_used') reason = 'da_dung_thu';
                else if (res.data && res.data.error === 'trial_limit_ip') reason = 'gioi_han_ip';
                else if (res.data && res.data.error === 'device_mismatch') reason = 'sai_thiet_bi';
                else if (res.data && res.data.error === 'wallet_blocked') reason = 'vi_da_khoa';
                onDone(false, reason);
            }
        })
        .catch(function() { onDone(false, 'network'); });
    }

    // Nguong canh bao sap het Medi (tinh theo luot con lai, khong phai Medi
    // nguyen, de canh bao som truoc khi thuc su bi khoa).
    var LOW_BALANCE_CLICKS = 300; // ~3 Medi

    // Tru credit khi 1 "Thao tac nhanh" vua chay xong.
    // - Tru LAC QUAN o bo nho NGAY LAP TUC (uoc luong theo ty le) de UI/
    //   khoa tinh nang phan hoi tuc thi, KHONG cho action.fn() phai cho
    //   ket qua mang -> khong lam cham qua trinh dien tu dong. Buoc tru
    //   lac quan nay CHI LAM GIAM _verifiedWallet.balance (khong bao gio
    //   tang), nen khong the bi loi dung de "ve" them so du - muon TANG
    //   so du bat buoc phai co token ky hop le tu Worker.
    // - KHONG BAO GIO xoa/lam mat luot da dung khi thieu so du: neu Worker
    //   bao khong du de tru het, phan CHUA TRU DUOC van duoc GIU LAI ben
    //   Worker (cong don cho lan nap tiep theo) - tranh thiet hai cho khach.
    // - Chi thuc su GOI WORKER khi gop du >= 100 luot (dung 1 lan goi cho
    //   ca ngan luot, dung nhu yeu cau "khong tinh tung click cho nang
    //   he thong"). Worker moi la noi TRU CHINH XAC va tra ve token moi.
    // Bao cho Worker biet dang dung do bao nhieu luot (KHONG tru tien, chi
    // GHI DE 1 con so de tinh SO DU THAT gan-real-time - ca script lan
    // Admin deu doc so nay). Dung DEBOUNCE (2 giay) - neu bam lien tuc
    // nhieu "Thao tac nhanh" chi 1 request duoc gui sau khi ngung bam,
    // tranh spam Worker ma van khong lam cham luong dien tu dong.
    // Dung { keepalive: true } de request VAN DUOC GUI DI ngay ca khi
    // trang dong/chuyen huong ngay sau do (browser giu request song song
    // ngam, khong huy nhu fetch thuong) - tranh tinh trang refresh trang
    // qua nhanh lam server chua kip nhan luot dung moi nhat, khien so du
    // hien thi "nhay nguoc len" sau khi tai lai trang.
    var _heartbeatTimer = null;
    var _lastHeartbeatLiveClicks = null;
    function doSendHeartbeatNow(liveClicks) {
        var mid = getMachineId();
        fetch(WALLET_API + '/heartbeat', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Device-Secret': getDeviceSecret() },
            body: JSON.stringify({ mid: mid, liveClicks: liveClicks }),
            keepalive: true,
        }).catch(function() {}); // loi mang thi bo qua, khong anh huong tinh tien that
    }
    function sendHeartbeat(liveClicks) {
        _lastHeartbeatLiveClicks = liveClicks;
        clearTimeout(_heartbeatTimer);
        _heartbeatTimer = setTimeout(function() {
            doSendHeartbeatNow(liveClicks);
        }, 2000);
    }
    // Gui NGAY (bo qua debounce) khi nguoi dung sap roi trang/tai lai
    // trang - dam bao Worker nhan duoc so luot moi nhat truoc khi trang
    // dong, thay vi cho het 2 giay debounce co the khong kip.
    function flushHeartbeatNow() {
        if (_lastHeartbeatLiveClicks === null) return;
        clearTimeout(_heartbeatTimer);
        doSendHeartbeatNow(_lastHeartbeatLiveClicks);
    }
    window.addEventListener('pagehide', flushHeartbeatNow);
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') flushHeartbeatNow();
    });

    function spendCredits(cost) {
        var unsynced = getUnsyncedClicks() + cost;
        setUnsyncedClicks(unsynced);
        // Tru lac quan CHI de UI phan hoi nhanh - khong lam thay doi token
        // da luu (token that van la ban ky boi Worker gan nhat). LUON lam
        // TRON VE LUOI 0.01 ngay sau khi tru (khong de phep tru don thuan
        // ma khong lam tron) - neu khong, sai so dau phay dong (floating
        // point) se DON DAN NGAY CANG LON qua nhieu lan tru lien tiep,
        // gay hien thi so le dai ngoang kieu "4.8999999999999995" thay vi
        // "4.90" gon gang.
        _verifiedWallet.balance = Math.round(Math.max(0, _verifiedWallet.balance - cost / 100) * 100) / 100;
        sendHeartbeat(unsynced); // bao Worker de Admin xem duoc so uoc tinh gan-real-time

        // Canh bao sap het Medi (khong chan thao tac, chi bao truoc)
        var clickBudget = Math.round(_verifiedWallet.balance * 100);
        if (clickBudget > 0 && clickBudget <= LOW_BALANCE_CLICKS) {
            showToast('\u26a0\ufe0f S\u1eafp h\u1ebft Medi \u2014 c\u00f2n \u2248' + clickBudget +
                ' l\u01b0\u1ee3t, n\u1ea1p th\u00eam \u0111\u1ec3 kh\u00f4ng b\u1ecb gi\u00e1n \u0111o\u1ea1n', 'warn');
        } else if (clickBudget <= 0) {
            showToast('\ud83d\udd34 \u0110\u00e3 h\u1ebft Medi \u2014 v\u00e0o V\u00ed Medi \u0111\u1ec3 n\u1ea1p th\u00eam', 'warn');
        }

        if (unsynced >= 100) {
            var toSend = unsynced;
            setUnsyncedClicks(0);
            var mid = getMachineId();
            fetch(WALLET_API + '/deduct', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Device-Secret': getDeviceSecret() },
                body: JSON.stringify({ mid: mid, clicks: toSend }),
                keepalive: true, // BUG FIX: dam bao request van duoc gui du trang dieu huong/dong ngay sau do
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.error === 'device_mismatch') {
                    // Vi nay da bi gan voi 1 "thiet bi" khac (hiem gap - vd
                    // trinh duyet bi xoa sach du lieu, hoac co nghi van bat
                    // thuong) - khong tu y thu lai, bao khach lien he ho tro
                    // de Admin go khoa thiet bi (khong lam mat luot da dung,
                    // Worker van giu nguyen o pending_clicks).
                    showToast('\u26a0\ufe0f Kh\u00f4ng x\u00e1c nh\u1eadn \u0111\u01b0\u1ee3c thi\u1ebft b\u1ecb cho v\u00ed n\u00e0y \u2014 ' +
                        'nh\u1eafn Zalo 0868.91.97.90 \u0111\u1ec3 \u0111\u01b0\u1ee3c h\u1ed7 tr\u1ee3', 'warn');
                    return;
                }
                verifyWalletToken(data.token, mid).then(function(payload) {
                    if (payload) {
                        applyVerifiedToken(payload, data.token); // dong bo chinh xac tu Worker
                        // BUG FIX: cap nhat popup Vi Medi neu dang mo (element ton tai tren DOM)
                        // de so du hien thi dung ngay sau khi deduct thanh cong, khong phai doi
                        // nguoi dung bam "Lam moi" thu cong moi thay so dung.
                        var numEl = document.getElementById('_mtt_balance_num');
                        var subEl = document.getElementById('_mtt_balance_sub');
                        var boxEl = document.getElementById('_mtt_balance_box');
                        var bal = _verifiedWallet.balance;
                        if (numEl) numEl.innerHTML = fmtMedi(bal) + ' <span style="font-size:19px;font-weight:700">Medi</span>';
                        if (subEl) subEl.textContent = '\u2248 ' + Math.round(bal * 100) + ' l\u01b0\u1ee3t autofill/autoclick c\u00f2n l\u1ea1i';
                        if (numEl) numEl.style.color = bal > 0 ? '#2e7d32' : '#e65100';
                        if (boxEl) {
                            boxEl.style.background = bal > 0 ? '#e8f5e9' : '#fff3e0';
                            boxEl.style.border = '1.5px solid ' + (bal > 0 ? '#a5d6a7' : '#ffcc80');
                        }
                    }
                });
                if (data.insufficientBalance) {
                    // Worker khong du de tru het - phan CHUA TRU van duoc GIU
                    // LAI ben Worker (khong mat), chi bao cho khach biet de nap them.
                    showToast('\u26a0\ufe0f V\u00ed kh\u00f4ng \u0111\u1ee7 Medi cho m\u1ed9t ph\u1ea7n l\u01b0\u1ee3t \u0111\u00e3 d\u00f9ng \u2014 ' +
                        'ph\u1ea7n \u0111\u00f3 v\u1eabn \u0111\u01b0\u1ee3c gi\u1eef l\u1ea1i ch\u1edd b\u1ea1n n\u1ea1p th\u00eam, kh\u00f4ng b\u1ecb m\u1ea5t', 'warn');
                }
            })
            .catch(function() {
                // Loi mang: cong lai vao unsyncedClicks de thu lai o lan tru tiep theo,
                // tranh mat luot da dung nhung chua kip bao Worker.
                setUnsyncedClicks(getUnsyncedClicks() + toSend);
            });
        }
    }

    // Dinh dang ngay theo DD-MM-YYYY (dung dau "-", KHONG dung "/" cua toLocaleDateString
    // vi-VN) - con dung cho vai cho hien thi khac trong script.
    function formatDDMMYYYY(date) {
        var d = String(date.getDate()).padStart(2, '0');
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var y = date.getFullYear();
        return d + '-' + m + '-' + y;
    }

    // ================================================================
    //  DIEU KHOAN SU DUNG - hien DUY NHAT 1 LAN (ngay lan dau bam Dung
    //  thu/Mua sau khi cai script), truoc khi cho mo popup Vi Medi. Da
    //  dong y roi thi GM_setValue co danh dau lai, tu lan sau tro di se
    //  khong hien popup nay nua. Noi dung co dong lai tu phan "Luu y
    //  quan trong" + gia/chinh sach trong index.html quang cao.
    // ================================================================
    var TOS_ACCEPTED_KEY = '_mtt_tos_accepted_v1';
    function showTermsPopup(onAccepted) {
        try {
            if (GM_getValue(TOS_ACCEPTED_KEY, false)) { onAccepted(); return; }
        } catch (e) { onAccepted(); return; }

        var POPUP_ID = '_mtt_tos_popup';
        if (document.getElementById(POPUP_ID)) return;

        var overlay = document.createElement('div');
        overlay.id = POPUP_ID;
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '999999999',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            backdropFilter: 'blur(5px)',
        });

        var card = document.createElement('div');
        Object.assign(card.style, {
            background: '#fff', borderRadius: '18px',
            padding: '26px 26px 22px', maxWidth: '440px', width: '92vw',
            maxHeight: '88vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            boxSizing: 'border-box',
        });

        var titleEl = document.createElement('div');
        titleEl.innerHTML = '\ud83d\udcdd <b>\u0110i\u1ec1u kho\u1ea3n s\u1eed d\u1ee5ng</b>';
        Object.assign(titleEl.style, { fontSize: '19px', color: '#0d47a1', marginBottom: '12px' });
        card.appendChild(titleEl);

        var body = document.createElement('div');
        Object.assign(body.style, { fontSize: '13.5px', color: '#374151', lineHeight: '1.7', textAlign: 'left' });
        body.innerHTML =
            '<ul style="margin:0 0 12px;padding-left:18px">' +
            '<li>Medinet AutoFill ch\u1ec9 h\u1ed7 tr\u1ee3 <b>\u0111i\u1ec1n nhanh</b> gi\u00e1 tr\u1ecb th\u00f4ng th\u01b0\u1eddng, <b>kh\u00f4ng kh\u00e1m b\u1ec7nh</b> v\u00e0 kh\u00f4ng bi\u1ebft k\u1ebft qu\u1ea3 th\u1ef1c t\u1ebf.</li>' +
            '<li>Sau khi d\u00f9ng "Thao t\u00e1c nhanh", b\u1ea1n <b>b\u1eaft bu\u1ed9c ki\u1ec3m tra, ch\u1ec9nh l\u1ea1i</b> to\u00e0n b\u1ed9 s\u1ed1 li\u1ec7u cho \u0111\u00fang v\u1edbi Phi\u1ebfu kh\u00e1m th\u1eadt do b\u00e1c s\u0129 x\u00e1c nh\u1eadn tr\u01b0\u1edbc khi l\u01b0u h\u1ed3 s\u01a1.</li>' +
            '<li>B\u1ea1n t\u1ef1 ch\u1ecbu tr\u00e1ch nhi\u1ec7m v\u1ec1 t\u00ednh ch\u00ednh x\u00e1c c\u1ee7a d\u1eef li\u1ec7u \u0111\u00e3 nh\u1eadp; t\u00e1c gi\u1ea3 kh\u00f4ng ch\u1ecbu tr\u00e1ch nhi\u1ec7m v\u1edbi h\u1eadu qu\u1ea3 ph\u00e1p l\u00fd/y khoa ph\u00e1t sinh do kh\u00f4ng ki\u1ec3m tra l\u1ea1i.</li>' +
            '<li>D\u00f9ng th\u1eed: t\u1eb7ng 5 Medi mi\u1ec5n ph\u00ed, <b>ch\u1ec9 1 l\u1ea7n/m\u00e1y</b>. Medi \u0111\u00e3 mua <b>kh\u00f4ng h\u1ebft h\u1ea1n</b> nh\u01b0ng <b>kh\u00f4ng ho\u00e0n ti\u1ec1n</b> sau khi \u0111\u00e3 n\u1ea1p/s\u1eed d\u1ee5ng.</li>' +
            '<li>M\u00e3 m\u00e1y g\u1eafn v\u1edbi 1 thi\u1ebft b\u1ecb; kh\u00f4ng chia s\u1ebb/can thi\u1ec7p k\u1ef9 thu\u1eadt \u0111\u1ec3 gian l\u1eadn s\u1ed1 d\u01b0 hay d\u00f9ng thu\u0301 nhi\u1ec1u l\u1ea7n.</li>' +
            '</ul>';
        card.appendChild(body);

        var checkLabel = document.createElement('label');
        Object.assign(checkLabel.style, {
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13.5px', color: '#1f2937', fontWeight: '700',
            margin: '4px 0 16px', cursor: 'pointer', userSelect: 'none',
        });
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        Object.assign(checkbox.style, { width: '17px', height: '17px', cursor: 'pointer', flexShrink: '0' });
        checkLabel.appendChild(checkbox);
        checkLabel.appendChild(document.createTextNode('T\u00f4i \u0111\u00e3 \u0111\u1ecdc v\u00e0 \u0111\u1ed3ng \u00fd v\u1edbi \u0111i\u1ec1u kho\u1ea3n s\u1eed d\u1ee5ng tr\u00ean'));
        card.appendChild(checkLabel);

        var okBtn = document.createElement('button');
        okBtn.textContent = 'OK, ti\u1ebfp t\u1ee5c';
        Object.assign(okBtn.style, {
            width: '100%', padding: '13px', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '800', color: '#fff',
            background: '#c8c8c8', cursor: 'not-allowed', transition: 'background .15s',
        });
        okBtn.disabled = true;
        checkbox.onchange = function() {
            okBtn.disabled = !checkbox.checked;
            okBtn.style.background = checkbox.checked ? '#1565c0' : '#c8c8c8';
            okBtn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
        };
        okBtn.onclick = function() {
            if (!checkbox.checked) return;
            try { GM_setValue(TOS_ACCEPTED_KEY, true); } catch (e) {}
            overlay.remove();
            onAccepted();
        };
        card.appendChild(okBtn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }

    // Popup Vi Medi (thay cho popup nhap ma license cu) - hien so du,
    // nut dung thu, huong dan nap them. Dung chung cho ca truong hop
    // chua kich hoat / het Medi (bam vao 1 muc Thao tac nhanh khi
    // balance = 0 se mo popup nay).
    function showLicenseExpiredPopup(forceTitle) {
        var POPUP_ID = '_mtt_license_popup';
        if (document.getElementById(POPUP_ID)) return;
        showTermsPopup(function() { _renderWalletPopup(forceTitle); });
    }

    function _renderWalletPopup(forceTitle) {
        var POPUP_ID = '_mtt_license_popup';
        if (document.getElementById(POPUP_ID)) return;

        var mid = getMachineId();
        var cache = getWalletCache();

        var overlay = document.createElement('div');
        overlay.id = POPUP_ID;
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '99999999',
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            backdropFilter: 'blur(5px)',
        });

        var card = document.createElement('div');
        Object.assign(card.style, {
            background: '#fff', borderRadius: '20px',
            padding: '32px 32px 26px', maxWidth: '480px', width: '94vw',
            maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            textAlign: 'center', position: 'relative', boxSizing: 'border-box',
        });

        // Nut dong
        var closeX = document.createElement('button');
        closeX.textContent = '\u00d7';
        Object.assign(closeX.style, {
            position: 'absolute', top: '12px', right: '16px',
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#bbb', lineHeight: '1', padding: '0',
        });
        closeX.onclick = function() { overlay.remove(); };
        card.appendChild(closeX);

        // Icon + tieu de
        var iconEl = document.createElement('div');
        iconEl.textContent = '\ud83d\udcb0';
        Object.assign(iconEl.style, { fontSize: '44px', marginBottom: '10px' });
        card.appendChild(iconEl);

        var titleEl = document.createElement('div');
        titleEl.textContent = 'V\u00ed Medi';
        Object.assign(titleEl.style, {
            fontSize: '24px', fontWeight: '800', color: '#0d47a1', marginBottom: '4px',
        });
        card.appendChild(titleEl);

        // O so du lon, ro rang
        var balanceBox = document.createElement('div');
        balanceBox.id = '_mtt_balance_box';
        Object.assign(balanceBox.style, {
            background: cache.balance > 0 ? '#e8f5e9' : '#fff3e0',
            border: '1.5px solid ' + (cache.balance > 0 ? '#a5d6a7' : '#ffcc80'),
            borderRadius: '14px', padding: '18px', margin: '14px 0 6px',
        });
        balanceBox.innerHTML =
            '<div style="font-size:13px;color:#4b5563;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">S\u1ed1 d\u01b0 hi\u1ec7n t\u1ea1i</div>' +
            '<div id="_mtt_balance_num" style="font-size:40px;font-weight:900;color:' + (cache.balance > 0 ? '#2e7d32' : '#e65100') + '">' +
            fmtMedi(cache.balance) + ' <span style="font-size:19px;font-weight:700">Medi</span></div>' +
            '<div id="_mtt_balance_sub" style="font-size:14px;color:#374151;font-weight:600;margin-top:4px">\u2248 ' + Math.round(cache.balance * 100) + ' l\u01b0\u1ee3t autofill/autoclick c\u00f2n l\u1ea1i</div>';
        card.appendChild(balanceBox);

        // Cap nhat DONG BO ca so, dong chu "luot con lai" va mau nen hop -
        // dung chung cho ca 3 noi goi (dung thu / lam moi / mo popup) de
        // tranh bug chi cap nhat rieng le tung phan nhu truoc.
        function updateBalanceDisplay(balance) {
            var numEl = document.getElementById('_mtt_balance_num');
            var subEl = document.getElementById('_mtt_balance_sub');
            var boxEl = document.getElementById('_mtt_balance_box');
            if (numEl) numEl.innerHTML = fmtMedi(balance) + ' <span style="font-size:19px;font-weight:700">Medi</span>';
            if (subEl) subEl.textContent = '\u2248 ' + Math.round(balance * 100) + ' l\u01b0\u1ee3t autofill/autoclick c\u00f2n l\u1ea1i';
            if (numEl) numEl.style.color = balance > 0 ? '#2e7d32' : '#e65100';
            if (boxEl) {
                boxEl.style.background = balance > 0 ? '#e8f5e9' : '#fff3e0';
                boxEl.style.border = '1.5px solid ' + (balance > 0 ? '#a5d6a7' : '#ffcc80');
            }
        }

        var refreshBtn = document.createElement('button');
        refreshBtn.textContent = '\ud83d\udd04 L\u00e0m m\u1edbi s\u1ed1 d\u01b0';
        Object.assign(refreshBtn.style, {
            border: 'none', background: 'none', color: '#1565c0',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            marginBottom: '16px', padding: '6px',
        });
        refreshBtn.onclick = function() {
            refreshBtn.textContent = '\u23f3 \u0110ang t\u1ea3i...';
            refreshWalletBalance(function(ok, c) {
                updateBalanceDisplay(c.balance);
                refreshBtn.textContent = ok ? '\u2705 \u0110\u00e3 c\u1eadp nh\u1eadt' : '\u26a0\ufe0f L\u1ed7i m\u1ea1ng, th\u1eed l\u1ea1i';
                setTimeout(function() { refreshBtn.textContent = '\ud83d\udd04 L\u00e0m m\u1edbi s\u1ed1 d\u01b0'; }, 1800);
            });
        };
        card.appendChild(refreshBtn);

        // Tu dong lam moi so du NGAY khi mo popup (khong can bam nut) -
        // dam bao luon hien dung so du THAT tinh den thoi diem hien tai,
        // khong phu thuoc token cache co the hoi cu (vd vua tai lai trang).
        refreshWalletBalance(function(ok, c) {
            if (ok) updateBalanceDisplay(c.balance);
        });

        // Nut dung thu (chi hien neu chua dung, tu Worker bao ve chinh)
        if (!cache.trialUsed) {
            var trialBtn = document.createElement('button');
            trialBtn.textContent = '\u23f3 D\u00f9ng th\u1eed +5 Medi (mi\u1ec5n ph\u00ed, 1 l\u1ea7n/m\u00e1y)';
            Object.assign(trialBtn.style, {
                width: '100%', padding: '15px', border: 'none', borderRadius: '12px',
                background: '#e65100', color: '#fff', fontSize: '16px', fontWeight: '800',
                cursor: 'pointer', marginBottom: '14px',
            });
            trialBtn.onclick = function() {
                trialBtn.disabled = true;
                trialBtn.textContent = '\u23f3 \u0110ang k\u00edch ho\u1ea1t...';
                activateTrial(function(ok, result) {
                    if (ok) {
                        trialBtn.textContent = '\ud83c\udf89 \u0110\u00e3 nh\u1eadn +5 Medi!';
                        updateBalanceDisplay(result);
                        setTimeout(function() { trialBtn.remove(); }, 1400);
                    } else {
                        trialBtn.disabled = false;
                        if (result === 'da_dung_thu') {
                            trialBtn.textContent = '\u26a0\ufe0f M\u00e1y n\u00e0y \u0111\u00e3 d\u00f9ng th\u1eed r\u1ed3i';
                        } else if (result === 'gioi_han_ip') {
                            trialBtn.textContent = '\u26a0\ufe0f M\u1ea1ng n\u00e0y \u0111\u00e3 d\u00f9ng h\u1ebft l\u01b0\u1ee3t th\u1eed';
                        } else if (result === 'sai_thiet_bi') {
                            trialBtn.textContent = '\u26a0\ufe0f L\u1ed7i thi\u1ebft b\u1ecb, nh\u1eafn Zalo h\u1ed7 tr\u1ee3';
                        } else if (result === 'vi_da_khoa') {
                            trialBtn.textContent = '\u26a0\ufe0f M\u00e3 m\u00e1y n\u00e0y \u0111\u00e3 kh\u00f3a, nh\u1eafn Zalo h\u1ed7 tr\u1ee3';
                        } else {
                            trialBtn.textContent = '\u26a0\ufe0f L\u1ed7i m\u1ea1ng, th\u1eed l\u1ea1i';
                        }
                    }
                });
            };
            card.appendChild(trialBtn);
        }

        // Duong ke
        var divEl = document.createElement('div');
        Object.assign(divEl.style, { height: '1px', background: '#eee', margin: '4px 0 16px' });
        card.appendChild(divEl);

        // Huong dan nap them
        var topupMsg = document.createElement('div');
        topupMsg.innerHTML =
            '<div style="font-size:15px;color:#374151;font-weight:700;margin-bottom:8px;text-align:left">N\u1ea1p th\u00eam Medi</div>' +
            '<div style="font-size:14px;color:#4b5563;text-align:left;line-height:1.8">' +
            '\u2022 2.000\u0111 = 1 Medi = 100 l\u01b0\u1ee3t<br>' +
            '\u2022 T\u1ed1i thi\u1ec3u 100.000\u0111 (50 Medi)<br>' +
            '\u2022 T\u1eb7ng 5% khi n\u1ea1p \u2265 500.000\u0111, t\u1eb7ng 10% khi n\u1ea1p \u2265 1.000.000\u0111, t\u1eb7ng 15% khi n\u1ea1p \u2265 2.000.000\u0111' +
            '</div>';
        Object.assign(topupMsg.style, { marginBottom: '14px' });
        card.appendChild(topupMsg);

        // O hien thi + copy Machine ID (gui kem khi chuyen khoan)
        var midBox = document.createElement('div');
        Object.assign(midBox.style, {
            background: '#f5f7fa', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '16px',
            textAlign: 'left', border: '1px solid #e0e4ea',
        });
        midBox.innerHTML =
            '<div style="font-size:12.5px;color:#4b5563;font-weight:700;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">M\u00e3 m\u00e1y c\u1ee7a b\u1ea1n (ghi v\u00e0o n\u1ed9i dung CK)</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
            '<b style="font-size:19px;color:#1565c0;letter-spacing:1px;flex:1">' + mid + '</b>' +
            '<button id="_mtt_copy_mid" style="padding:7px 12px;background:#1565c0;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;white-space:nowrap">\ud83d\udccb Sao ch\u00e9p</button>' +
            '</div>';
        card.appendChild(midBox);

        // O nhap Thong tin lien he (SDT bat buoc, Ten/Zalo tuy chon) - luu
        // vao he thong (bang customers) TRUOC khi khach chuyen khoan, de
        // Admin co san lien lac tra cuu khi khach hoi lai sau nay (lich
        // su mua, bao hanh...). Gia tri duoc nho lai (GM_setValue) cho
        // lan mo popup sau khong phai nhap lai.
        var CONTACT_STORE_KEY = '_mtt_contact_info_v1';
        var savedContact = {};
        try { savedContact = JSON.parse(GM_getValue(CONTACT_STORE_KEY, '{}')) || {}; } catch (e) { savedContact = {}; }

        var contactBox = document.createElement('div');
        Object.assign(contactBox.style, {
            background: '#fff8e1', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '14px',
            textAlign: 'left', border: '1px solid #ffe082',
        });
        contactBox.innerHTML =
            '<div style="font-size:12.5px;color:#6d4c00;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">\ud83d\udcde Th\u00f4ng tin li\u00ean h\u1ec7 (\u0111\u1ec3 h\u1ed7 tr\u1ee3/b\u1ea3o h\u00e0nh sau n\u00e0y)</div>' +
            '<input id="_mtt_contact_phone" type="tel" placeholder="S\u1ed1 \u0111i\u1ec7n tho\u1ea1i (b\u1eaft bu\u1ed9c \u0111\u1ec3 t\u1ea1o QR)" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e0c896;border-radius:8px;font-size:14px;margin-bottom:8px" value="' + (savedContact.phone || '').replace(/"/g, '') + '">' +
            '<input id="_mtt_contact_name" type="text" placeholder="T\u00ean c\u1ee7a b\u1ea1n (kh\u00f4ng b\u1eaft bu\u1ed9c)" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e0c896;border-radius:8px;font-size:14px;margin-bottom:8px" value="' + (savedContact.name || '').replace(/"/g, '') + '">' +
            '<input id="_mtt_contact_zalo" type="text" placeholder="Zalo (n\u1ebfu kh\u00e1c SDT, kh\u00f4ng b\u1eaft bu\u1ed9c)" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e0c896;border-radius:8px;font-size:14px" value="' + (savedContact.zalo || '').replace(/"/g, '') + '">' +
            '<div id="_mtt_contact_hint" style="font-size:12px;color:#e65100;margin-top:8px;line-height:1.6"></div>';
        card.appendChild(contactBox);

        // O hien thi thong tin STK VA để khach TU CHUYEN KHOAN, he thong se
        // tu dong cong Medi trong vai giay - vai phut (khong can nhan Zalo
        // cho Admin nua). Doi BANK_NAME/VA_NUMBER/VA_HOLDER neu doi ngan
        // hang/tai khoan sau nay.
        var BANK_NAME = 'BIDV';
        var VA_NUMBER = '96247MEDINET';
        var VA_HOLDER = 'DOAN HOANG ANH';
        var vaBox = document.createElement('div');
        Object.assign(vaBox.style, {
            background: '#e8f5e9', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '10px',
            textAlign: 'left', border: '1px solid #a5d6a7',
        });
        vaBox.innerHTML =
            '<div style="font-size:12.5px;color:#2e7d32;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;font-weight:700">Chuy\u1ec3n kho\u1ea3n v\u00e0o (t\u1ef1 \u0111\u1ed9ng c\u1ed9ng Medi)</div>' +
            '<div style="font-size:14px;color:#555;margin-bottom:4px">Ng\u00e2n h\u00e0ng: <b>' + BANK_NAME + '</b></div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<div style="font-size:14px;color:#555">S\u1ed1 TK: <b style="font-size:17px;color:#2e7d32;letter-spacing:.5px">' + VA_NUMBER + '</b></div>' +
            '<button id="_mtt_copy_va" style="padding:6px 11px;background:#2e7d32;color:#fff;border:none;border-radius:6px;font-size:12.5px;cursor:pointer;font-weight:600;white-space:nowrap;margin-left:auto">\ud83d\udccb Sao ch\u00e9p</button>' +
            '</div>' +
            '<div style="font-size:14px;color:#555">Ch\u1ee7 TK: ' + VA_HOLDER + '</div>' +
            '<div style="font-size:13px;color:#e65100;margin-top:8px;line-height:1.6">\u26a0\ufe0f N\u1ed9i dung CK PH\u1ea2I ghi \u0111\u00fang M\u00e3 m\u00e1y ' + mid + ' \u1edf tr\u00ean, n\u1ebfu kh\u00f4ng h\u1ec7 th\u1ed1ng kh\u00f4ng nh\u1eadn di\u1ec7n \u0111\u01b0\u1ee3c.</div>';
        card.appendChild(vaBox);

        // Chip chon muc tien + QR VietQR, tu dong dien dung Ma may (mid) va
        // so tien da chon vao noi dung CK - khach chi can quet QR bang app
        // ngan hang, khong can go tay so TK / noi dung nua. Moi muc nam 1
        // hang rieng, ghi ro so tien day du + % khuyen mai (giong web).
        var qrChipsBox = document.createElement('div');
        Object.assign(qrChipsBox.style, {
            display: 'flex', flexDirection: 'column', gap: '8px',
            marginBottom: '14px',
        });
        var QR_AMOUNTS = [
            { amt: 100000, label: '100.000 VN\u0110', bonus: '', medi: '50 Medi' },
            { amt: 500000, label: '500.000 VN\u0110', bonus: '+5%', medi: '262 Medi' },
            { amt: 1000000, label: '1.000.000 VN\u0110', bonus: '+10%', medi: '550 Medi' },
            { amt: 2000000, label: '2.000.000 VN\u0110', bonus: '+15%', medi: '1.150 Medi' },
        ];
        var qrImgEl = document.createElement('img');
        var currentQrAmt = 100000;
        function renderQrImg() {
            qrImgEl.src = 'https://img.vietqr.io/image/' + BANK_NAME + '-' + VA_NUMBER +
                '-compact2.png?amount=' + currentQrAmt + '&addInfo=' + encodeURIComponent(mid);
        }

        // ================================================================
        // Xac thuc + luu Thong tin lien he - CHAN chon muc tien/tao QR cho
        // toi khi SDT hop le (Ten/Zalo van tuy chon). Luu ca cuc bo
        // (GM_setValue, de lan sau khong phai nhap lai) VA day len he
        // thong (POST /customer/register - KHONG can Admin Key) de Admin
        // co san lien lac tra cuu.
        // ================================================================
        function isPhoneValid(v) { return /^[0-9+ ]{8,15}$/.test((v || '').trim()); }
        function getContactValues() {
            return {
                phone: (document.getElementById('_mtt_contact_phone') || {}).value || '',
                name: (document.getElementById('_mtt_contact_name') || {}).value || '',
                zalo: (document.getElementById('_mtt_contact_zalo') || {}).value || '',
            };
        }
        function setChipsEnabled(enabled) {
            qrChipsBox.style.opacity = enabled ? '1' : '.45';
            qrChipsBox.style.pointerEvents = enabled ? 'auto' : 'none';
            qrBox.style.opacity = enabled ? '1' : '.45';
            qrBox.style.pointerEvents = enabled ? 'auto' : 'none';
        }
        var contactRegisteredFor = ''; // gia tri phone da dang ky thanh cong lan gan nhat, tranh spam goi lai
        function syncContactState() {
            var c = getContactValues();
            var hintEl = document.getElementById('_mtt_contact_hint');
            var ok = isPhoneValid(c.phone);
            if (hintEl) {
                hintEl.textContent = ok ? '' : 'Nh\u1eadp S\u1ed1 \u0111i\u1ec7n tho\u1ea1i \u0111\u1ec3 t\u1ea1o m\u00e3 QR (b\u1eaft bu\u1ed9c, gi\u00fap h\u1ed7 tr\u1ee3/b\u1ea3o h\u00e0nh sau n\u00e0y).';
            }
            setChipsEnabled(ok);
            try { GM_setValue(CONTACT_STORE_KEY, JSON.stringify(c)); } catch (e) {}
            if (ok && contactRegisteredFor !== c.phone) {
                contactRegisteredFor = c.phone;
                fetch(WALLET_API + '/customer/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mid: mid, phone: c.phone.trim(), name: c.name.trim(), zalo: c.zalo.trim() }),
                }).catch(function() { /* khong chan trai nghiem neu loi mang, se thu lai lan sua tiep theo */ });
                if (typeof reportPendingOrder === 'function') reportPendingOrder(currentQrAmt);
            }
            return ok;
        }
        setTimeout(function() {
            ['_mtt_contact_phone', '_mtt_contact_name', '_mtt_contact_zalo'].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) { el.addEventListener('input', syncContactState); el.addEventListener('blur', syncContactState); }
            });
            syncContactState();
        }, 50);

        // Bao truoc cho Worker biet khach dang chuan bi chuyen khoan muc
        // tien nao (tao 1 don "Cho thanh toan" de Admin theo doi trong
        // Dashboard) - khong chan trai nghiem QR neu goi that bai.
        var reportedOrderFor = '';
        function reportPendingOrder(amt) {
            var key = mid + '|' + amt;
            if (reportedOrderFor === key) return;
            reportedOrderFor = key;
            fetch(WALLET_API + '/order/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mid: mid, amountVnd: amt }),
            }).catch(function() {});
        }
        QR_AMOUNTS.forEach(function(opt, idx) {
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.dataset.amt = opt.amt;
            var isActive = idx === 0;
            chip.innerHTML =
                '<span style="font-weight:800;font-size:14.5px">' + opt.label + '</span>' +
                (opt.bonus ? '<span style="font-weight:800;font-size:12px;background:' + (isActive ? 'rgba(255,255,255,0.25)' : '#e8f5e9') + ';color:' + (isActive ? '#fff' : '#2e7d32') + ';border-radius:999px;padding:2px 9px;margin-left:8px">' + opt.bonus + '</span>' : '') +
                '<span style="float:right;font-size:12.5px;font-weight:700;opacity:.9">' + opt.medi + '</span>';
            Object.assign(chip.style, {
                display: 'block', width: '100%', padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
                border: '1.5px solid ' + (isActive ? '#2e7d32' : '#c8e0cb'),
                background: isActive ? '#2e7d32' : '#fff',
                color: isActive ? '#fff' : '#2e7d32',
                textAlign: 'left', boxSizing: 'border-box',
            });
            chip.addEventListener('click', function() {
                Array.prototype.forEach.call(qrChipsBox.children, function(c, i) {
                    c.style.background = '#fff';
                    c.style.color = '#2e7d32';
                    c.style.borderColor = '#c8e0cb';
                    var badge = c.querySelector('span:nth-child(2)');
                    if (badge && QR_AMOUNTS[i].bonus) { badge.style.background = '#e8f5e9'; badge.style.color = '#2e7d32'; }
                });
                chip.style.background = '#2e7d32';
                chip.style.color = '#fff';
                chip.style.borderColor = '#2e7d32';
                var activeBadge = chip.querySelector('span:nth-child(2)');
                if (activeBadge && opt.bonus) { activeBadge.style.background = 'rgba(255,255,255,0.25)'; activeBadge.style.color = '#fff'; }
                currentQrAmt = parseInt(chip.dataset.amt, 10);
                renderQrImg();
                reportPendingOrder(currentQrAmt);
            });
            qrChipsBox.appendChild(chip);
        });
        card.appendChild(qrChipsBox);

        var qrBox = document.createElement('div');
        Object.assign(qrBox.style, {
            background: '#fff', border: '1.5px solid #a5d6a7', borderRadius: '12px',
            padding: '14px', marginBottom: '10px', textAlign: 'center',
        });
        Object.assign(qrImgEl.style, {
            width: '190px', height: '190px', borderRadius: '8px', display: 'block', margin: '0 auto',
        });
        qrImgEl.alt = 'QR chuy\u1ec3n kho\u1ea3n';
        renderQrImg();
        qrBox.appendChild(qrImgEl);
        var qrNote = document.createElement('div');
        qrNote.textContent = '\ud83d\udcf1 M\u1edf app ng\u00e2n h\u00e0ng \u2192 qu\u00e9t m\u00e3 n\u00e0y \u2014 s\u1ed1 ti\u1ec1n & n\u1ed9i dung M\u00e3 m\u00e1y \u0111\u01b0\u1ee3c \u0111i\u1ec1n s\u1eb5n, kh\u00f4ng c\u1ea7n g\u00f5 tay';
        Object.assign(qrNote.style, {
            fontSize: '12.5px', color: '#2e7d32', marginTop: '10px', lineHeight: '1.6', fontWeight: '600',
        });
        qrBox.appendChild(qrNote);
        card.appendChild(qrBox);

        setTimeout(function() {
            var copyVaBtn = document.getElementById('_mtt_copy_va');
            if (copyVaBtn) {
                copyVaBtn.addEventListener('click', function() {
                    try { GM_setClipboard(VA_NUMBER); } catch(e) {
                        try {
                            var ta2 = document.createElement('textarea');
                            ta2.value = VA_NUMBER; document.body.appendChild(ta2);
                            ta2.select(); document.execCommand('copy'); document.body.removeChild(ta2);
                        } catch(e2) {}
                    }
                    copyVaBtn.textContent = '\u2705 \u0110\u00e3 sao!';
                    setTimeout(function() { copyVaBtn.textContent = '\ud83d\udccb Sao ch\u00e9p'; }, 1800);
                });
            }
        }, 50);

        setTimeout(function() {
            var copyMidBtn = document.getElementById('_mtt_copy_mid');
            if (!copyMidBtn) return;
            copyMidBtn.addEventListener('click', function() {
                try { GM_setClipboard(mid); } catch(e) {
                    try {
                        var ta = document.createElement('textarea');
                        ta.value = mid; document.body.appendChild(ta);
                        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                    } catch(e2) {}
                }
                copyMidBtn.textContent = '\u2705 \u0110\u00e3 sao!';
                setTimeout(function() { copyMidBtn.textContent = '\ud83d\udccb Sao ch\u00e9p'; }, 1800);
            });
        }, 50);

        // Nut nap Medi qua Zalo
        var zaloBtn = document.createElement('a');
        zaloBtn.href = 'https://zalo.me/0868919790';
        zaloBtn.target = '_blank';
        zaloBtn.rel = 'noopener';
        zaloBtn.innerHTML =
            '<img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" ' +
            'alt="Zalo" style="width:18px;height:18px;vertical-align:middle;margin-right:7px">' +
            '<span>Nh\u1eafn Zalo 0868.91.97.90<br><span style="font-weight:600;font-size:12.5px;opacity:.9">H\u1ed7 tr\u1ee3 n\u1ebfu chuy\u1ec3n kho\u1ea3n b\u1ecb l\u1ed7i</span></span>';
        Object.assign(zaloBtn.style, {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: '12px', borderRadius: '12px',
            background: '#1565c0', color: '#fff', fontSize: '14px', fontWeight: '700',
            textDecoration: 'none', boxSizing: 'border-box', textAlign: 'center', lineHeight: '1.5',
        });
        card.appendChild(zaloBtn);

        overlay.appendChild(card);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);

        // Tu dong lam moi so du 1 lan khi mo popup, cho chinh xac hon cache cu
        refreshWalletBalance(function(ok, c) {
            updateBalanceDisplay(c.balance);
        });
    }

    // ================================================================

    var MENU_ID    = '_mtt_menu';
    var WRAPPER_ID = '_mtt_wrapper';
    var _styleInjected = false;

    var CONTEXT_MENU_ID = '_mtt_context_menu';

    var CONTEXT_ACTIONS = [
                {
            emoji: '\ud83d\udd04', label: 'C\u1eadp nh\u1eadt phi\u00ean b\u1ea3n',
            tier: 'lite',
            color: '#0369a1', hoverColor: '#075985',
            check: function() { return true; },
            fn: function() {
                var MODAL_ID = '_mtt_update_modal';
                if (document.getElementById(MODAL_ID)) {
                    document.getElementById(MODAL_ID).remove(); return;
                }

                // ============================================================
                //  C\u1ea4U H\u00ccNH UPDATE - ch\u1ec9 c\u1ea7n s\u1eeda 2 d\u00f2ng n\u00e0y khi c\u00f3 phi\u00ean b\u1ea3n m\u1edbi
                //  RAW_URL: \u0111\u01b0\u1eddng d\u1eabn raw t\u1edbi file .user.js tr\u00ean GitHub
                //  META_URL: \u0111\u01b0\u1eddng d\u1eabn raw t\u1edbi file .meta.js (ch\u1ec9 ch\u1ee9a ==UserScript== header)
                // ============================================================
                var RAW_URL  = 'https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js';
                var META_URL = 'https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js';
                // Lay phien ban hien tai TU CHINH GM_info (Tampermonkey tu dong bom
                // san, luon khop voi @version trong header) - khong hardcode chuoi
                // rieng nua de tranh bi le voi header nhu truoc day.
                var CURRENT_VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '8.0';
                var AUTO_UPDATE_KEY = '_mtt_auto_update';

                // ---- helpers ----
                function getAutoUpdate() {
                    try { return localStorage.getItem(AUTO_UPDATE_KEY) === '1'; } catch(e) { return false; }
                }
                function setAutoUpdate(v) {
                    try { localStorage.setItem(AUTO_UPDATE_KEY, v ? '1' : '0'); } catch(e) {}
                }
                function extractVersion(text) {
                    var m = text.match(/@version\s+([\d.]+)/);
                    return m ? m[1] : null;
                }
                function versionGt(a, b) {
                    var pa = a.split('.').map(Number);
                    var pb = b.split('.').map(Number);
                    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
                        var na = pa[i] || 0, nb = pb[i] || 0;
                        if (na > nb) return true;
                        if (na < nb) return false;
                    }
                    return false;
                }
                // Doc khoi "==Changelog==" ... "==/Changelog==" trong file meta -
                // moi dong dang: // X.Y.Z | YYYY-MM-DD | Mo ta 1 \u2022 Mo ta 2 ...
                // (dau \u2022 de tach nhieu y trong cung 1 phien ban)
                function escHtml(s) {
                    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
                function extractChangelog(text) {
                    var block = text.match(/==Changelog==([\s\S]*?)==\/Changelog==/);
                    if (!block) return [];
                    var entries = [];
                    block[1].split('\n').forEach(function(line) {
                        var m = line.match(/^\s*\/\/\s*([\d.]+)\s*\|\s*([^|]*)\|\s*(.+?)\s*$/);
                        if (m) entries.push({ version: m[1], date: m[2].trim(), desc: m[3].trim() });
                    });
                    return entries;
                }
                // Hien danh sach "co gi moi" cho cac phien ban LON HON ban hien
                // tai (gop tat ca neu nguoi dung bo lo nhieu ban), moi moi nhat
                // hien tren cung.
                function buildChangelogHtml(entries, curVer) {
                    var newer = entries.filter(function(e) { return versionGt(e.version, curVer); });
                    if (!newer.length) return '';
                    return newer.map(function(e) {
                        var items = e.desc.split('\u2022').map(function(s) { return s.trim(); }).filter(Boolean);
                        return '<div style="margin-bottom:10px">' +
                            '<div style="font-weight:700;color:#0369a1;font-size:13px;margin-bottom:4px">' +
                                '\ud83c\udd95 v' + escHtml(e.version) + (e.date ? ' \u2014 ' + escHtml(e.date) : '') +
                            '</div>' +
                            '<ul style="margin:0;padding-left:18px;font-size:13.5px;color:#374151;line-height:1.7">' +
                                items.map(function(it) { return '<li>' + escHtml(it) + '</li>'; }).join('') +
                            '</ul>' +
                        '</div>';
                    }).join('');
                }

                // ---- build overlay ----
                var overlay = document.createElement('div');
                overlay.id = MODAL_ID;
                Object.assign(overlay.style, {
                    position: 'fixed', inset: '0', zIndex: '9999999',
                    background: 'rgba(0,0,0,0.55)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    backdropFilter: 'blur(4px)',
                });
                var card = document.createElement('div');
                Object.assign(card.style, {
                    background: '#fff', borderRadius: '18px',
                    padding: '0', width: '640px', maxWidth: '94vw',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                    position: 'relative', overflow: 'hidden',
                });

                // header strip
                var header = document.createElement('div');
                Object.assign(header.style, {
                    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                    padding: '20px 24px 18px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                });
                var headerIcon = document.createElement('span');
                headerIcon.textContent = '\ud83d\udd04';
                Object.assign(headerIcon.style, { fontSize: '28px', lineHeight: '1' });
                var headerText = document.createElement('div');
                var headerTitle = document.createElement('div');
                headerTitle.textContent = 'C\u1eadp nh\u1eadt phi\u00ean b\u1ea3n';
                Object.assign(headerTitle.style, {
                    fontSize: '20px', fontWeight: '700', color: '#fff', lineHeight: '1.2',
                });
                var headerSub = document.createElement('div');
                headerSub.textContent = 'Medinet Script';
                Object.assign(headerSub.style, {
                    fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '2px',
                });
                headerText.appendChild(headerTitle);
                headerText.appendChild(headerSub);
                header.appendChild(headerIcon);
                header.appendChild(headerText);
                card.appendChild(header);

                // close button
                var closeBtn2 = document.createElement('button');
                closeBtn2.innerHTML = '\u00d7';
                Object.assign(closeBtn2.style, {
                    position: 'absolute', top: '12px', right: '16px',
                    background: 'rgba(255,255,255,0.25)', border: 'none',
                    fontSize: '22px', color: '#fff', cursor: 'pointer',
                    lineHeight: '1', width: '32px', height: '32px',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: '300',
                });
                closeBtn2.addEventListener('mouseenter', function() { closeBtn2.style.background = 'rgba(255,255,255,0.4)'; });
                closeBtn2.addEventListener('mouseleave', function() { closeBtn2.style.background = 'rgba(255,255,255,0.25)'; });
                closeBtn2.addEventListener('click', function() { overlay.remove(); });
                card.appendChild(closeBtn2);

                // body
                var body = document.createElement('div');
                Object.assign(body.style, { padding: '22px 24px 20px' });

                // version info row
                var verBox = document.createElement('div');
                Object.assign(verBox.style, {
                    background: '#f0f9ff', border: '1px solid #bae6fd',
                    borderRadius: '10px', padding: '14px 18px',
                    marginBottom: '16px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                });
                var verLabel = document.createElement('span');
                verLabel.textContent = 'Phi\u00ean b\u1ea3n hi\u1ec7n t\u1ea1i';
                Object.assign(verLabel.style, { fontSize: '15px', color: '#374151' });
                var verValue = document.createElement('span');
                verValue.textContent = CURRENT_VERSION;
                Object.assign(verValue.style, {
                    fontSize: '18px', fontWeight: '700', color: '#0369a1',
                    background: '#e0f2fe', padding: '3px 12px', borderRadius: '20px',
                });
                verBox.appendChild(verLabel);
                verBox.appendChild(verValue);
                body.appendChild(verBox);

                // status area
                var statusArea = document.createElement('div');
                statusArea.textContent = '\u23f3 \u0110ang ki\u1ec3m tra ph\u00eci\u00ean b\u1ea3n m\u1edbi...';
                Object.assign(statusArea.style, {
                    fontSize: '15px', color: '#374151', fontWeight: '600', minHeight: '28px',
                    marginBottom: '18px', lineHeight: '1.6',
                    padding: '10px 14px', borderRadius: '8px',
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    textAlign: 'center',
                });
                body.appendChild(statusArea);

                // changelog box ("co gi moi") - an san, chi hien khi co ban moi
                var changelogBox = document.createElement('div');
                Object.assign(changelogBox.style, {
                    display: 'none', background: '#f8fafc',
                    border: '1px solid #e2e8f0', borderRadius: '10px',
                    padding: '12px 14px', marginBottom: '16px',
                    maxHeight: '180px', overflowY: 'auto',
                });
                body.appendChild(changelogBox);

                // --- check button ---
                var checkBtn = document.createElement('button');
                checkBtn.textContent = '\ud83d\udd0d Ki\u1ec3m tra c\u1eadp nh\u1eadt';
                Object.assign(checkBtn.style, {
                    display: 'block', width: '100%', padding: '13px',
                    background: '#0369a1', color: '#fff',
                    border: 'none', borderRadius: '10px',
                    fontSize: '16px', fontWeight: '700',
                    cursor: 'pointer', marginBottom: '10px',
                    transition: 'background 0.15s, transform 0.1s',
                    letterSpacing: '0.3px',
                });
                checkBtn.addEventListener('mouseenter', function() { checkBtn.style.background = '#075985'; checkBtn.style.transform = 'translateY(-1px)'; });
                checkBtn.addEventListener('mouseleave', function() { checkBtn.style.background = '#0369a1'; checkBtn.style.transform = 'translateY(0)'; });

                // install button (hidden by default)
                var installBtn = document.createElement('button');
                installBtn.textContent = '\u2b07\ufe0f C\u00e0i \u0111\u1eb7t phi\u00ean b\u1ea3n m\u1edbi';
                Object.assign(installBtn.style, {
                    display: 'none', width: '100%', padding: '13px',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontSize: '16px', fontWeight: '700',
                    cursor: 'pointer', marginBottom: '10px',
                    transition: 'filter 0.15s, transform 0.1s',
                    letterSpacing: '0.3px',
                });
                installBtn.addEventListener('mouseenter', function() { installBtn.style.filter = 'brightness(1.1)'; installBtn.style.transform = 'translateY(-1px)'; });
                installBtn.addEventListener('mouseleave', function() { installBtn.style.filter = ''; installBtn.style.transform = 'translateY(0)'; });
                installBtn.addEventListener('click', function() {
                    // Copy URL vao clipboard
                    var copied = false;
                    try { GM_setClipboard(RAW_URL); copied = true; } catch(e) {
                        try {
                            var ta = document.createElement('textarea');
                            ta.value = RAW_URL; document.body.appendChild(ta);
                            ta.select(); document.execCommand('copy');
                            document.body.removeChild(ta);
                            copied = true;
                        } catch(e2) {}
                    }
                    // Chrome chan window.open chrome-extension://, huong dan thu cong
                    installBtn.style.display = 'none';
                    var guide = document.createElement('div');
                    Object.assign(guide.style, {
                        background: '#fffbeb', border: '2px solid #fbbf24',
                        borderRadius: '10px', padding: '14px 16px',
                        marginBottom: '10px', fontSize: '14px',
                        color: '#92400e', lineHeight: '2.0', textAlign: 'left',
                    });
                    guide.innerHTML =
                        '<b style="font-size:15px">' + (copied ? '\u2705 \u0110\u00e3 copy URL!' : '\ud83d\udccb Sao ch\u00e9p URL b\u00ean d\u01b0\u1edbi') + '</b><br>' +
                        '1\ufe0f\u20e3 M\u1edf trang Tampermonkey b\u00ean d\u01b0\u1edbi<br>' +
                        '2\ufe0f\u20e3 M\u1ee5c <b>Import t\u1eeb URL</b> \u2192 d\u00e1n URL \u2192 <b>Import</b><br>' +
                        '3\ufe0f\u20e3 Nh\u1ea5n <b>C\u00e0i \u0111\u1eb7t</b> \u2192 xong!';
                    var urlBox = document.createElement('div');
                    Object.assign(urlBox.style, {
                        marginTop: '8px', padding: '8px 10px',
                        background: '#fef3c7', borderRadius: '6px',
                        fontSize: '11px', wordBreak: 'break-all',
                        color: '#78350f', fontFamily: 'monospace',
                        cursor: 'pointer', border: '1px solid #fbbf24',
                        userSelect: 'all',
                    });
                    var urlLabel = document.createElement('div');
                    urlLabel.textContent = '\ud83d\udccb URL \u0111\u1ec3 d\u00e1n v\u00e0o Tampermonkey (click \u0111\u1ec3 copy):';
                    Object.assign(urlLabel.style, { fontSize: '12px', color: '#92400e', marginTop: '10px', marginBottom: '3px', fontWeight: '600' });
                    guide.appendChild(urlLabel);
                    urlBox.title = 'Click \u0111\u1ec3 ch\u1ecdn to\u00e0n b\u1ed9';
                    urlBox.textContent = RAW_URL;
                    urlBox.addEventListener('click', function() {
                        try { GM_setClipboard(RAW_URL); } catch(e) {}
                        window.getSelection().selectAllChildren(urlBox);
                    });
                    guide.appendChild(urlBox);
                    // Nut mo TM bang GM_openInTab (userscript co quyen mo chrome-extension://)
                    var tmBtn = document.createElement('button');
                    tmBtn.textContent = '\ud83d\udd17 M\u1edf Tampermonkey \u2192 Ti\u1ec7n \u00edch';
                    Object.assign(tmBtn.style, {
                        display: 'block', width: '100%', marginTop: '10px',
                        padding: '9px 12px', background: '#16a34a', color: '#fff',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '14px', textAlign: 'center',
                    });
                    tmBtn.addEventListener('click', function() {
                        try { GM_openInTab('chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=utils', false); } catch(e) {
                            window.open('chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=utils', '_blank');
                        }
                    });
                    guide.appendChild(tmBtn);
                    installBtn.parentNode.insertBefore(guide, installBtn);
                });

                checkBtn.addEventListener('click', function() {
                    checkBtn.disabled = true;
                    checkBtn.textContent = '\u23f3 \u0110ang ki\u1ec3m tra\u2026';
                    checkBtn.style.background = '#7dd3fc';
                    statusArea.style.color = '#6b7280';
                    statusArea.style.background = '#f9fafb';
                    statusArea.style.borderColor = '#e5e7eb';
                    statusArea.textContent = '\u23f3 \u0110ang k\u1ebft n\u1ed1i t\u1edbi server...';
                    installBtn.style.display = 'none';
                    changelogBox.style.display = 'none';
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', META_URL + '?t=' + Date.now(), true);
                    xhr.timeout = 10000;
                    xhr.onload = function() {
                        checkBtn.disabled = false;
                        checkBtn.textContent = '\ud83d\udd0d Ki\u1ec3m tra c\u1eadp nh\u1eadt';
                        checkBtn.style.background = '#0369a1';
                        if (xhr.status === 200) {
                            var remoteVer = extractVersion(xhr.responseText);
                            if (!remoteVer) {
                                statusArea.style.color = '#b91c1c';
                                statusArea.style.background = '#fef2f2';
                                statusArea.style.borderColor = '#fca5a5';
                                statusArea.textContent = '\u26a0\ufe0f Kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c phi\u00ean b\u1ea3n t\u1eeb server.';
                            } else if (versionGt(remoteVer, CURRENT_VERSION)) {
                                statusArea.style.color = '#15803d';
                                statusArea.style.background = '#f0fdf4';
                                statusArea.style.borderColor = '#86efac';
                                statusArea.innerHTML = '\u2705 C\u00f3 phi\u00ean b\u1ea3n m\u1edbi: <b style="font-size:17px">' + remoteVer + '</b>';
                                installBtn.style.display = 'block';
                                var clHtml = buildChangelogHtml(extractChangelog(xhr.responseText), CURRENT_VERSION);
                                if (clHtml) {
                                    changelogBox.innerHTML = clHtml;
                                    changelogBox.style.display = 'block';
                                } else {
                                    changelogBox.style.display = 'none';
                                }
                            } else {
                                statusArea.style.color = '#15803d';
                                statusArea.style.background = '#f0fdf4';
                                statusArea.style.borderColor = '#86efac';
                                statusArea.textContent = '\u2705 B\u1ea1n \u0111ang d\u00f9ng phi\u00ean b\u1ea3n m\u1edbi nh\u1ea5t!';
                            }
                        } else {
                            statusArea.style.color = '#b91c1c';
                            statusArea.style.background = '#fef2f2';
                            statusArea.style.borderColor = '#fca5a5';
                            statusArea.textContent = '\u26a0\ufe0f L\u1ed7i k\u1ebft n\u1ed1i (' + xhr.status + '). Ki\u1ec3m tra l\u1ea1i sau.';
                        }
                    };
                    xhr.onerror = xhr.ontimeout = function() {
                        checkBtn.disabled = false;
                        checkBtn.textContent = '\ud83d\udd0d Ki\u1ec3m tra c\u1eadp nh\u1eadt';
                        checkBtn.style.background = '#0369a1';
                        statusArea.style.color = '#b91c1c';
                        statusArea.style.background = '#fef2f2';
                        statusArea.style.borderColor = '#fca5a5';
                        statusArea.textContent = '\u26a0\ufe0f Kh\u00f4ng th\u1ec3 k\u1ebft n\u1ed1i. Ki\u1ec3m tra l\u1ea1i sau.';
                    };
                    xhr.send();
                });

                body.appendChild(checkBtn);
                body.appendChild(installBtn);

                // divider
                var div2 = document.createElement('div');
                Object.assign(div2.style, { height: '1px', background: '#e5e7eb', margin: '14px 0' });
                body.appendChild(div2);

                // --- auto-update checkbox ---
                var autoRow = document.createElement('label');
                Object.assign(autoRow.style, {
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '15px', color: '#374151', cursor: 'pointer',
                });
                var chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = getAutoUpdate();
                Object.assign(chk.style, { cursor: 'pointer', width: '18px', height: '18px', accentColor: '#0369a1' });
                chk.addEventListener('change', function() { setAutoUpdate(chk.checked); });
                var chkLabel = document.createElement('span');
                chkLabel.textContent = 'T\u1ef1 \u0111\u1ed9ng c\u1eadp nh\u1eadt khi c\u00f3 phi\u00ean b\u1ea3n m\u1edbi';
                autoRow.appendChild(chk);
                autoRow.appendChild(chkLabel);
                body.appendChild(autoRow);

                // note ve tu dong cap nhat - giai thich ro thay vi lap
                // lai dieu nguoi dung da thay (script tu kiem tra khi mo
                // popup nay roi), tap trung vao cho khac biet thuc su:
                // Tampermonkey van can nguoi dung tu bam "Install" de
                // hoan tat, khong tu cai ngam sau lung.
                var autoNote = document.createElement('div');
                autoNote.textContent = '\u2139\ufe0f T\u1eaft: b\u1ea1n c\u1ea7n t\u1ef1 m\u1edf m\u1ee5c n\u00e0y m\u1edbi bi\u1ebft c\u00f3 b\u1ea3n m\u1edbi. B\u1eadt: script t\u1ef1 ki\u1ec3m tra m\u1ed7i l\u1ea7n t\u1ea3i trang, m\u1edf s\u1eb5n tab c\u00e0i \u0111\u1eb7t n\u1ebfu c\u00f3 b\u1ea3n m\u1edbi \u2014 Tampermonkey v\u1eabn c\u1ea7n b\u1ea1n b\u1ea5m "Install" \u0111\u1ec3 ho\u00e0n t\u1ea5t, kh\u00f4ng t\u1ef1 c\u00e0i ng\u1ea7m.';
                Object.assign(autoNote.style, {
                    fontSize: '13px', color: '#4b5563', fontWeight: '600', marginTop: '8px', lineHeight: '1.6',
                    paddingLeft: '28px',
                });
                body.appendChild(autoNote);

                card.appendChild(body);
                overlay.appendChild(card);
                overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
                document.body.appendChild(overlay);

                // auto-check on open
                checkBtn.click();
            }
        },
        {
            emoji: '\ud83d\udcde', label: 'Li\u00ean h\u1ec7 v\u00e0 b\u1ea3o h\u00e0nh',
            tier: 'lite',
            color: '#6d28d9', hoverColor: '#5b21b6',
            check: function() { return true; },
            fn: function() {
                var MODAL_ID = '_mtt_contact_modal';
                if (document.getElementById(MODAL_ID)) {
                    document.getElementById(MODAL_ID).remove(); return;
                }
                var overlay = document.createElement('div');
                overlay.id = MODAL_ID;
                Object.assign(overlay.style, {
                    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.55)', zIndex: '9999999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    backdropFilter: 'blur(3px)',
                });
                var card = document.createElement('div');
                Object.assign(card.style, {
                    background: '#fff', borderRadius: '20px',
                    width: '640px', maxWidth: '94vw',
                    boxSizing: 'border-box',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
                    position: 'relative', overflow: 'hidden',
                });

                // header strip (giong phong cach modal "Cap nhat phien ban")
                var header = document.createElement('div');
                Object.assign(header.style, {
                    background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
                    padding: '26px 30px 22px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                });
                var headerIcon = document.createElement('span');
                headerIcon.textContent = '\ud83d\udc68\u200d\u2695\ufe0f';
                Object.assign(headerIcon.style, { fontSize: '38px', lineHeight: '1' });
                var headerText = document.createElement('div');
                var headerTitle = document.createElement('div');
                headerTitle.textContent = 'Li\u00ean h\u1ec7 v\u00e0 b\u1ea3o h\u00e0nh';
                Object.assign(headerTitle.style, {
                    fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1.2',
                });
                var headerSub = document.createElement('div');
                headerSub.textContent = 'Medinet AutoFill \u2014 medinetautofill.github.io';
                Object.assign(headerSub.style, {
                    fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontWeight: '600',
                });
                headerText.appendChild(headerTitle);
                headerText.appendChild(headerSub);
                header.appendChild(headerIcon);
                header.appendChild(headerText);
                card.appendChild(header);

                var closeBtn = document.createElement('button');
                closeBtn.innerHTML = '\u00d7';
                Object.assign(closeBtn.style, {
                    position: 'absolute', top: '14px', right: '18px',
                    background: 'rgba(255,255,255,0.25)', border: 'none',
                    fontSize: '24px', color: '#fff', cursor: 'pointer',
                    lineHeight: '1', width: '34px', height: '34px',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: '300',
                });
                closeBtn.addEventListener('mouseenter', function() { closeBtn.style.background = 'rgba(255,255,255,0.4)'; });
                closeBtn.addEventListener('mouseleave', function() { closeBtn.style.background = 'rgba(255,255,255,0.25)'; });
                closeBtn.addEventListener('click', function() { overlay.remove(); });
                card.appendChild(closeBtn);

                // body - 2 cot: Ho tro nhanh (Zalo) + Bao hanh, khong can cuon
                var body = document.createElement('div');
                Object.assign(body.style, {
                    padding: '26px 30px 28px', display: 'grid',
                    gridTemplateColumns: '1fr 1fr', gap: '18px',
                });

                function infoCard(bg, border, titleColor, titleText, innerHtml) {
                    var box = document.createElement('div');
                    Object.assign(box.style, {
                        background: bg, border: '1.5px solid ' + border, borderRadius: '14px',
                        padding: '18px 20px', boxSizing: 'border-box',
                    });
                    var t = document.createElement('div');
                    t.textContent = titleText;
                    Object.assign(t.style, {
                        fontSize: '13px', fontWeight: '800', color: titleColor,
                        textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px',
                    });
                    box.appendChild(t);
                    var inner = document.createElement('div');
                    inner.innerHTML = innerHtml;
                    box.appendChild(inner);
                    return box;
                }

                var zaloCard = infoCard('#ecfdf5', '#a7f3d0', '#047857', '\ud83d\udcac H\u1ed7 tr\u1ee3 tr\u1ef1c ti\u1ebfp',
                    '<div style="font-size:17px;font-weight:800;color:#065f46;margin-bottom:6px">Zalo: 0868.91.97.90</div>' +
                    '<div style="font-size:14px;color:#374151;line-height:1.7">Nh\u1eafn tin khi c\u1ea7n h\u1ed7 tr\u1ee3 c\u00e0i \u0111\u1eb7t, l\u1ed7i chuy\u1ec3n kho\u1ea3n, ho\u1eb7c b\u1ea5t k\u1ef3 v\u1ea5n \u0111\u1ec1 n\u00e0o v\u1edbi Vi\u0301 Medi.</div>');
                var zaloOpenBtn = document.createElement('a');
                zaloOpenBtn.href = 'https://zalo.me/0868919790';
                zaloOpenBtn.target = '_blank';
                zaloOpenBtn.rel = 'noopener';
                zaloOpenBtn.textContent = '\ud83d\udcac Nh\u1eafn Zalo ngay';
                Object.assign(zaloOpenBtn.style, {
                    display: 'block', width: '100%', marginTop: '12px', padding: '11px',
                    background: '#1565c0', color: '#fff', textAlign: 'center',
                    borderRadius: '10px', fontWeight: '800', fontSize: '15px',
                    textDecoration: 'none', boxSizing: 'border-box',
                });
                zaloCard.appendChild(zaloOpenBtn);
                body.appendChild(zaloCard);

                var warrantyCard = infoCard('#eff6ff', '#bfdbfe', '#1d4ed8', '\ud83d\udee1\ufe0f Ch\u00ednh s\u00e1ch b\u1ea3o h\u00e0nh',
                    '<ul style="margin:0;padding-left:18px;font-size:14px;color:#374151;line-height:1.8">' +
                    '<li>H\u1ed7 tr\u1ee3 c\u00e0i \u0111\u1eb7t l\u1ea1i mi\u1ec5n ph\u00ed khi \u0111\u1ed5i m\u00e1y/tr\u00ecnh duy\u1ec7t</li>' +
                    '<li>Medi \u0111\u00e3 mua kh\u00f4ng h\u1ebft h\u1ea1n, gi\u1eef nguy\u00ean khi n\u00e2ng c\u1ea5p phi\u00ean b\u1ea3n</li>' +
                    '<li>H\u1ed7 tr\u1ee3 g\u1ee1 kho\u00e1 thi\u1ebft b\u1ecb n\u1ebfu b\u1ecb kho\u00e1 nh\u1ea7m</li>' +
                    '<li>Ph\u1ea3n h\u1ed3i l\u1ed7i k\u1ef9 thu\u1eadt qua Zalo, x\u1eed l\u00fd trong ng\u00e0y</li>' +
                    '</ul>');
                body.appendChild(warrantyCard);

                card.appendChild(body);

                // footer: copyright
                var footer = document.createElement('div');
                footer.textContent = 'Copyright \u00a9 Medinet AutoFill. All rights reserved.';
                Object.assign(footer.style, {
                    textAlign: 'center', fontSize: '12.5px', color: '#9ca3af',
                    padding: '0 30px 22px',
                });
                card.appendChild(footer);

                overlay.appendChild(card);
                overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
                document.body.appendChild(overlay);
            }
        },
        {
            emoji: '\ud83d\udcb0', label: 'Qu\u1ea3n l\u00fd v\u00ed Medi',
            tier: 'lite',
            color: '#0d47a1', hoverColor: '#0a3a82',
            check: function() { return true; },
            fn: function() {
                var MODAL_ID = '_mtt_author_modal';
                if (document.getElementById(MODAL_ID)) {
                    document.getElementById(MODAL_ID).remove(); return;
                }
                var overlay = document.createElement('div');
                overlay.id = MODAL_ID;
                Object.assign(overlay.style, {
                    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.55)', zIndex: '9999999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                    backdropFilter: 'blur(3px)',
                });
                var card = document.createElement('div');
                Object.assign(card.style, {
                    background: '#fff', borderRadius: '20px',
                    width: '640px', maxWidth: '94vw',
                    boxSizing: 'border-box',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
                    position: 'relative', overflow: 'hidden',
                });

                // header strip
                var header = document.createElement('div');
                Object.assign(header.style, {
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                    padding: '26px 30px 22px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                });
                var headerIcon = document.createElement('span');
                headerIcon.textContent = '\ud83d\udcb0';
                Object.assign(headerIcon.style, { fontSize: '38px', lineHeight: '1' });
                var headerText = document.createElement('div');
                var headerTitle = document.createElement('div');
                headerTitle.textContent = 'Qu\u1ea3n l\u00fd v\u00ed Medi';
                Object.assign(headerTitle.style, {
                    fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1.2',
                });
                var headerSub = document.createElement('div');
                headerSub.textContent = 'Medinet AutoFill';
                Object.assign(headerSub.style, {
                    fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontWeight: '600',
                });
                headerText.appendChild(headerTitle);
                headerText.appendChild(headerSub);
                header.appendChild(headerIcon);
                header.appendChild(headerText);
                card.appendChild(header);

                // Close button
                var closeBtn = document.createElement('button');
                closeBtn.innerHTML = '\u00d7';
                Object.assign(closeBtn.style, {
                    position: 'absolute', top: '14px', right: '18px',
                    background: 'rgba(255,255,255,0.25)', border: 'none',
                    fontSize: '24px', color: '#fff', cursor: 'pointer',
                    lineHeight: '1', width: '34px', height: '34px',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: '300',
                });
                closeBtn.addEventListener('mouseenter', function() { closeBtn.style.background = 'rgba(255,255,255,0.4)'; });
                closeBtn.addEventListener('mouseleave', function() { closeBtn.style.background = 'rgba(255,255,255,0.25)'; });
                closeBtn.addEventListener('click', function() { overlay.remove(); });
                card.appendChild(closeBtn);

                // body
                var body = document.createElement('div');
                Object.assign(body.style, { padding: '26px 30px 28px' });

                // Vi Medi info - 2 cot: So du + Ma may
                var walletC = getWalletCache();
                var isPositive = walletC.balance > 0;
                var licInfoBox = document.createElement('div');
                Object.assign(licInfoBox.style, {
                    background: isPositive ? '#ecfdf5' : '#fef2f2',
                    border: '1.5px solid ' + (isPositive ? '#a7f3d0' : '#fecaca'),
                    borderRadius: '14px', padding: '20px 22px', marginBottom: '18px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px',
                    boxSizing: 'border-box',
                });
                var balCol = document.createElement('div');
                balCol.innerHTML =
                    '<div style="font-size:12.5px;font-weight:800;color:' + (isPositive ? '#047857' : '#b91c1c') + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' +
                    (isPositive ? '\ud83d\udfe2 S\u1ed1 d\u01b0 hi\u1ec7n t\u1ea1i' : '\ud83d\udd34 Tr\u1ea1ng th\u00e1i') + '</div>' +
                    '<div style="font-size:22px;font-weight:800;color:' + (isPositive ? '#065f46' : '#991b1b') + '">' +
                    (isPositive ? fmtMedi(walletC.balance) + ' Medi' : 'H\u1ebft Medi') + '</div>' +
                    (isPositive ? '<div style="font-size:13px;color:#374151;margin-top:4px">\u2248 ' + Math.round(walletC.balance * 100) + ' l\u01b0\u1ee3t d\u00f9ng</div>' : '<div style="font-size:13px;color:#7f1d1d;margin-top:4px">Ch\u01b0a k\u00edch ho\u1ea1t / c\u1ea7n n\u1ea1p th\u00eam</div>');
                var midCol = document.createElement('div');
                midCol.innerHTML =
                    '<div style="font-size:12.5px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">\ud83d\udda5\ufe0f M\u00e3 m\u00e1y c\u1ee7a b\u1ea1n</div>' +
                    '<div style="font-size:16px;font-weight:800;color:#111827;word-break:break-all;font-family:monospace">' + getMachineId() + '</div>' +
                    '<div style="font-size:12.5px;color:#6b7280;margin-top:4px">D\u00f9ng \u0111\u1ec3 tra c\u1ee9u/b\u1ea3o h\u00e0nh khi c\u1ea7n h\u1ed7 tr\u1ee3</div>';
                licInfoBox.appendChild(balCol);
                licInfoBox.appendChild(midCol);
                body.appendChild(licInfoBox);

                // Button quan ly / nap them
                var licBtn = document.createElement('button');
                licBtn.textContent = '\ud83d\udcb3 N\u1ea1p / Qu\u1ea3n l\u00fd Medi chi ti\u1ebft';
                Object.assign(licBtn.style, {
                    display: 'block', width: '100%', padding: '15px',
                    background: '#0d47a1', color: '#fff',
                    border: 'none', borderRadius: '12px',
                    fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                    letterSpacing: '.3px',
                });
                licBtn.addEventListener('mouseenter', function() { licBtn.style.background = '#0a3a82'; });
                licBtn.addEventListener('mouseleave', function() { licBtn.style.background = '#0d47a1'; });
                licBtn.addEventListener('click', function() {
                    var authModal = document.getElementById('_mtt_author_modal');
                    if (authModal) authModal.remove();
                    showLicenseExpiredPopup();
                });
                body.appendChild(licBtn);

                card.appendChild(body);
                overlay.appendChild(card);
                overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
                document.body.appendChild(overlay);
            }
        }
    ];

    // ================================================================
    //  NUT BAT/TAT SCRIPT (toggle) - nam tren dau menu "Thao tac nhanh".
    //  Khi TAT: toan bo cac muc thao tac nhanh trong menu nay bi vo hieu
    //  hoa (mo + khong bam duoc), tranh kich hoat nham. Trang thai duoc
    //  luu vao GM storage de giu nguyen qua cac lan tai lai trang.
    // ================================================================
    var SCRIPT_ENABLED_KEY = '_mtt_script_enabled';

    function isScriptEnabled() {
        try {
            var v = GM_getValue(SCRIPT_ENABLED_KEY, true);
            return v !== false; // mac dinh BAT neu chua tung luu
        } catch (e) { return true; }
    }

    function setScriptEnabled(enabled) {
        try { GM_setValue(SCRIPT_ENABLED_KEY, !!enabled); } catch (e) {}
    }

    function injectStyle() {
        if (_styleInjected || document.getElementById('_mtt_style')) return;
        _styleInjected = true;
        var s = document.createElement('style');
        s.id = '_mtt_style';
        s.textContent =
            '#_mtt_menu,#_mtt_context_menu{display:none;position:fixed;z-index:2000000;background:#fff;' +
            'border:1px solid #d1d5db;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,0.22);' +
            'min-width:275px;padding:8px;flex-direction:column;gap:6px;}' +
            '._mtt_item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;' +
            'border-width:1.5px;border-style:solid;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;' +
            'text-align:left;background:#fff;transition:opacity 0.2s,transform 0.1s;}' +
            '._mtt_item:not([data-unavailable]):not([data-nocredit]):hover{opacity:0.78;transform:translateX(2px);}' +
            '._mtt_item:active:not([data-unavailable]):not([data-nocredit]){transform:scale(0.97);}' +
            '._mtt_item[data-unavailable]{opacity:0.32;cursor:not-allowed;filter:grayscale(0.5);}' +
            '._mtt_item[data-nocredit]{opacity:0.5;filter:grayscale(0.3);}' +
            '._mtt_sep{display:none;}' +
            '._mtt_toggle_row{display:flex;align-items:center;justify-content:space-between;width:100%;' +
            'padding:9px 12px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;' +
            'background:#f3f4f6;border:1.5px solid #e5e7eb;transition:background 0.2s;}' +
            '._mtt_toggle_row:hover{background:#e9ebee;}' +
            '._mtt_toggle_label{display:flex;align-items:center;gap:8px;}' +
            '._mtt_toggle_row[data-on="0"] ._mtt_toggle_label{color:#b91c1c;}' +
            '._mtt_toggle_row[data-on="1"] ._mtt_toggle_label{color:#15803d;}' +
            '._mtt_switch{position:relative;width:38px;height:20px;border-radius:10px;background:#cbd5e1;' +
            'flex-shrink:0;transition:background 0.2s;}' +
            '._mtt_switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;' +
            'border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.35);}' +
            '._mtt_toggle_row[data-on="1"] ._mtt_switch{background:#16a34a;}' +
            '._mtt_toggle_row[data-on="1"] ._mtt_switch::after{left:20px;}' +
            '._mtt_toggle_sep{height:1px;background:#e5e7eb;margin:2px 0 4px;}';
        document.head.appendChild(s);
    }

    function getOrBuildMenu() {
        var existing = document.getElementById(MENU_ID);
        if (existing) return existing;

        injectStyle();
        var menu = document.createElement('div');
        menu.id = MENU_ID;

        // --- Hang dau menu: nut bat/tat toan bo script ---
        var toggleRow = document.createElement('div');
        toggleRow.id = '_mtt_toggle_row';
        toggleRow.className = '_mtt_toggle_row';
        toggleRow.innerHTML =
            '<span class="_mtt_toggle_label"><span style="font-size:15px">\u26a1</span><span id="_mtt_toggle_text">B\u1eadt</span></span>' +
            '<span class="_mtt_switch"></span>';
        toggleRow.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            var newState = !isScriptEnabled();
            setScriptEnabled(newState);
            updateMenuAvailability(menu);
            showToast(newState ? '\u26a1 Đã BẬT script' : '\ud83d\udd0c Đã TẮT script - các thao tác nhanh sẽ không chạy', newState ? 'success' : 'warn');
        });
        menu.appendChild(toggleRow);
        var toggleSep = document.createElement('div');
        toggleSep.className = '_mtt_toggle_sep';
        menu.appendChild(toggleSep);

        ACTIONS.forEach(function(action, idx) {
            var item = document.createElement('button');
            item.className = '_mtt_item';
            item.dataset.actionIdx = idx;
            item.style.borderColor = action.color;
            item.style.color = action.color;
            var arrowHtml = action.hasFlyout ? ' <span style="margin-left:auto;opacity:0.6">\u25b6</span>' : '';
            item.innerHTML = '<span style="font-size:15px">' + action.emoji + '</span><span>' + action.label + '</span>' + arrowHtml;
            item.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                if (item.hasAttribute('data-unavailable')) return;
                if (action.hasFlyout && action.flyoutItems) {
                    // Toggle submenu
                    var existing = document.getElementById(SUBMENU_ID);
                    if (existing) { closeSubmenu(); return; }
                    openSubmenu(item, action.flyoutItems, action.noAgeLogic);
                    return;
                }
                if (!isLicenseValid()) {
                    menu.style.display = 'none';
                    showLicenseExpiredPopup();
                    return;
                }
                menu.style.display = 'none';
                action.fn();
                if (!action.selfBills) spendCredits(action.creditCost || DEFAULT_ACTION_COST);
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        return menu;
    }

    // ================================================================
    //  MENU CHUOT PHAI (context menu): chi chua "Cap nhat phien ban"
    //  va "Tac gia va ban quyen" - khong hien trong menu chuot trai nua.
    // ================================================================
    function getOrBuildContextMenu() {
        var existing = document.getElementById(CONTEXT_MENU_ID);
        if (existing) return existing;

        injectStyle();
        var menu = document.createElement('div');
        menu.id = CONTEXT_MENU_ID;

        CONTEXT_ACTIONS.forEach(function(action) {
            var item = document.createElement('button');
            item.className = '_mtt_item';
            item.style.borderColor = action.color;
            item.style.color = action.color;
            item.innerHTML = '<span style="font-size:15px">' + action.emoji + '</span><span>' + action.label + '</span>';
            item.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                menu.style.display = 'none';
                action.fn();
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        return menu;
    }

    function openContextMenu(x, y) {
        var menu = getOrBuildContextMenu();
        var menuW = 275;
        var left = x;
        var top  = y;
        if (left + menuW > window.innerWidth - 8) left = window.innerWidth - 8 - menuW;
        if (left < 4) left = 4;
        menu.style.top  = top  + 'px';
        menu.style.left = left + 'px';
        menu.style.display = 'flex';
    }

    // Dong menu khi click ngoai — bind 1 lan duy nhat
    document.addEventListener('click', function(e) {
        var menu = document.getElementById(MENU_ID);
        var ctxMenu = document.getElementById(CONTEXT_MENU_ID);
        var wrapper = document.getElementById(WRAPPER_ID);
        var sm = document.getElementById(SUBMENU_ID);

        if (menu && menu.style.display !== 'none') {
            var insideMain = (wrapper && wrapper.contains(e.target)) || menu.contains(e.target) || (sm && sm.contains(e.target));
            if (!insideMain) { menu.style.display = 'none'; closeSubmenu(); }
        }
        if (ctxMenu && ctxMenu.style.display !== 'none' && !ctxMenu.contains(e.target)) {
            ctxMenu.style.display = 'none';
        }
    }, true);

    function updateMenuAvailability(menu) {
        var scriptEnabled = isScriptEnabled();

        // Dong bo UI hang toggle (chu "Bật"/"Tắt" + vi tri cong gat)
        var toggleRow = menu.querySelector('#_mtt_toggle_row');
        if (toggleRow) {
            toggleRow.setAttribute('data-on', scriptEnabled ? '1' : '0');
            var toggleText = toggleRow.querySelector('#_mtt_toggle_text');
            if (toggleText) toggleText.textContent = scriptEnabled ? 'B\u1eadt' : 'T\u1eaft';
        }

        // Con Medi hay khong (bat ky > 0 la du dieu kien dung DAY DU tinh nang,
        // khong con phan biet goi "lite" nua).
        var hasCredits = isLicenseValid();
        var visibleCount = 0;
        menu.querySelectorAll('._mtt_item').forEach(function(item) {
            var idx = parseInt(item.dataset.actionIdx, 10);
            var action = ACTIONS[idx];
            if (!action) return;
            // Khong kha dung tren trang hien tai -> AN HOAN TOAN (truoc day chi
            // lam mo + khong bam duoc, gio an luon de menu "thong minh" hon,
            // chi hien dung muc dung voi trang dang xem).
            var available = !action.check || action.check();
            if (!available) {
                item.style.display = 'none';
                item.removeAttribute('data-unavailable');
                return;
            }
            item.style.display = '';
            visibleCount++;
            // Script dang TAT (nut toggle dau menu) -> vo hieu hoa TOAN BO muc
            // (van hien, chi lam mo + khong bam duoc) de nguoi dung biet ly do.
            if (!scriptEnabled) {
                item.setAttribute('data-unavailable', '1');
                item.title = 'Script đang TẮT - bật lên ở đầu menu để sử dụng';
                return;
            }
            // Het Medi -> van hien nhung lam mo, dung attribute RIENG (data-nocredit)
            // de o click handler biet mo popup Vi Medi thay vi chan im lang.
            if (!hasCredits) {
                item.setAttribute('data-nocredit', '1');
                item.title = 'H\u1ebft Medi - bam \u0111\u1ec3 n\u1ea1p th\u00eam';
            } else {
                item.removeAttribute('data-nocredit');
            }
        });

        // Khong co muc nao kha dung tren trang hien tai -> hien thong bao
        var emptyHint = menu.querySelector('#_mtt_empty_hint');
        if (visibleCount === 0) {
            if (!emptyHint) {
                emptyHint = document.createElement('div');
                emptyHint.id = '_mtt_empty_hint';
                emptyHint.style.cssText = 'padding:10px 12px;font-size:12.5px;color:#888;text-align:center;font-weight:500;';
                emptyHint.textContent = 'Không có thao tác nào khả dụng trên trang này';
                menu.appendChild(emptyHint);
            }
            emptyHint.style.display = '';
        } else if (emptyHint) {
            emptyHint.style.display = 'none';
        }
    }

    function openMenu(anchorBtn) {
        // Kiem tra license truoc khi mo menu
        if (!isLicenseValid()) {
            // An menu, chi hien popup thong bao
            showLicenseExpiredPopup();
            return;
        }
        var menu = getOrBuildMenu();
        updateMenuAvailability(menu);
        var rect = anchorBtn.getBoundingClientRect();
        var menuW = 275;
        var top  = rect.bottom + 4;
        var left = rect.left;
        if (left + menuW > window.innerWidth - 8) left = rect.right - menuW;
        if (left < 4) left = 4;
        menu.style.top  = top  + 'px';
        menu.style.left = left + 'px';
        menu.style.display = 'flex';
    }

    // ================================================================
    //  INJECT NUT VAO CONTAINER
    //  Chien luoc: thay vi giu wrapper trong container (se bi Angular xoa),
    //  ta theo doi container moi xuat hien va inject lai ngay lap tuc.
    //  Dung WeakSet de danh dau container nao da duoc inject roi.
    // ================================================================

    injectStyle();
    initWalletFromCache(); // nap + xac thuc token da luu tu lan truoc, dong thoi lay ban moi nhat tu Worker chay ngam
    refreshWalletBalance();
    var _injectedContainers = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

    function buildWrapper() {
        var mainBtn = document.createElement('button');
        mainBtn.innerHTML = '\u26a1 Thao t\u00e1c nhanh <span style="font-size:10px;opacity:0.8">\u25bc</span>';
        mainBtn.title = 'M\u1edf menu thao t\u00e1c nhanh';
        Object.assign(mainBtn.style, {
            padding: '6px 14px',
            background: 'transparent',
            color: '#0369a1',
            border: '1px solid #000',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            transition: 'background 0.15s',
            flexShrink: '0',
        });
        mainBtn.addEventListener('mouseenter', function() { mainBtn.style.background = '#e0f2fe'; });
        mainBtn.addEventListener('mouseleave', function() { mainBtn.style.background = 'transparent'; });
        mainBtn.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            var menu = document.getElementById(MENU_ID);
            if (menu && menu.style.display !== 'none') {
                menu.style.display = 'none';
            } else {
                openMenu(mainBtn);
            }
        });
        mainBtn.addEventListener('contextmenu', function(e) {
            e.preventDefault(); e.stopPropagation();
            var mainMenu = document.getElementById(MENU_ID);
            if (mainMenu) mainMenu.style.display = 'none';
            closeSubmenu();
            var ctxMenu = document.getElementById(CONTEXT_MENU_ID);
            if (ctxMenu && ctxMenu.style.display !== 'none') {
                ctxMenu.style.display = 'none';
            } else {
                openContextMenu(e.clientX, e.clientY);
            }
        });

        var wrapper = document.createElement('div');
        wrapper.id = WRAPPER_ID;
        Object.assign(wrapper.style, {
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: '0',
        });
        wrapper.appendChild(mainBtn);
        return wrapper;
    }

    function getDirectParentInContainer(container, el) {
        // Tra ve con truc tiep cua container chua el
        var node = el;
        while (node && node.parentElement !== container) {
            node = node.parentElement;
        }
        return node || null;
    }

    function ensureWrapperPosition(container, wrapper) {
        // Tim div cha truc tiep chua "Them moi phieu" va "Luu thay doi"
        var themMoiParent = null, luuThayDoiParent = null;
        container.querySelectorAll('dx-button[aria-label]').forEach(function(btn) {
            var label = btn.getAttribute('aria-label') || '';
            if (label.indexOf('Thêm mới phiếu') !== -1 && !themMoiParent)
                themMoiParent = getDirectParentInContainer(container, btn);
            if ((label.indexOf('Lưu thay đổi') !== -1 || label.trim() === 'Lưu') && !luuThayDoiParent)
                luuThayDoiParent = getDirectParentInContainer(container, btn);
        });

        // Can chen wrapper ngay truoc luuThayDoiParent
        // nhung chi khi wrapper chua o dung vi tri do
        if (luuThayDoiParent && wrapper.nextSibling !== luuThayDoiParent) {
            container.insertBefore(wrapper, luuThayDoiParent);
        } else if (!luuThayDoiParent && themMoiParent && wrapper.previousSibling !== themMoiParent) {
            // Fallback: khong co "Luu thay doi", chen sau "Them moi phieu"
            themMoiParent.after
                ? themMoiParent.after(wrapper)
                : container.insertBefore(wrapper, themMoiParent.nextSibling);
        } else if (!luuThayDoiParent && !themMoiParent) {
            // Fallback cuoi: chen dau container
            if (wrapper.parentElement !== container)
                container.insertBefore(wrapper, container.firstChild);
        }
    }

    function tryInjectIntoContainer(container) {
        var saveBtnEl = null;
        container.querySelectorAll('dx-button[aria-label]').forEach(function(btn) {
            var label = (btn.getAttribute('aria-label') || '').trim();
            if (!saveBtnEl && (label.indexOf('Lưu thay đổi') !== -1 || label === 'Lưu'))
                saveBtnEl = btn;
        });
        if (!saveBtnEl) return;

        var wrapper = container.querySelector('#' + WRAPPER_ID);
        if (!wrapper) {
            wrapper = buildWrapper();
            wrapper.style.order = '';
            container.appendChild(wrapper);
            if (_injectedContainers) _injectedContainers.add(container);

            var wrapperObserver = new MutationObserver(function() {
                if (!container.contains(wrapper)) {
                    wrapperObserver.disconnect();
                    if (_injectedContainers) _injectedContainers.delete(container);
                }
            });
            wrapperObserver.observe(container, { childList: true });
        }

        ensureWrapperPosition(container, wrapper);
    }

    // ---- Fallback: trang co nut "Luu" nam o toolbar tren (khong co footer-dynamic-form_btn_container) ----
    function findToolbarSaveButtons() {
        var result = [];
        document.querySelectorAll('dx-button[aria-label]').forEach(function(btn) {
            if (btn.closest('.footer-dynamic-form_btn_container')) return; // da xu ly o nhanh khac
            var label = (btn.getAttribute('aria-label') || '').trim();
            if (label === 'Lưu' || label === 'Lưu thay đổi') result.push(btn);
        });
        return result;
    }

    function tryInjectToolbarButton(btn) {
        var item = btn.closest('.dx-toolbar-item') || btn.closest('.dx-item') || btn.parentElement;
        var container = item && item.parentElement;
        if (!item || !container) return;

        if (container.querySelector('#' + WRAPPER_ID)) return; // da chen roi

        var wrapper = buildWrapper();
        wrapper.style.order = '';
        container.insertBefore(wrapper, item);
        if (_injectedContainers) _injectedContainers.add(container);

        var wrapperObserver = new MutationObserver(function() {
            if (!container.contains(wrapper)) wrapperObserver.disconnect();
        });
        wrapperObserver.observe(container, { childList: true });
    }

    function scanToolbarInject() {
        findToolbarSaveButtons().forEach(tryInjectToolbarButton);
    }

    function scanAndInject() {
        document.querySelectorAll('.footer-dynamic-form_btn_container').forEach(function(container) {
            tryInjectIntoContainer(container);
        });
        scanToolbarInject();
        te6RunAutoFillIfLicensed();
    }

    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var target = mutations[i].target;
            var added  = mutations[i].addedNodes;

            if (target && target.classList && target.classList.contains('footer-dynamic-form_btn_container')) {
                tryInjectIntoContainer(target);
                continue;
            }

            for (var j = 0; j < added.length; j++) {
                var node = added[j];
                if (node.nodeType !== 1) continue;
                if (node.classList && node.classList.contains('footer-dynamic-form_btn_container')) {
                    tryInjectIntoContainer(node);
                    break;
                }
                var inner = node.querySelector && node.querySelector('.footer-dynamic-form_btn_container');
                if (inner) {
                    tryInjectIntoContainer(inner);
                    break;
                }
                var parent = node.parentElement;
                if (parent && parent.classList && parent.classList.contains('footer-dynamic-form_btn_container')) {
                    tryInjectIntoContainer(parent);
                    break;
                }
                if (node.querySelector && node.querySelector('dx-button[aria-label]')) {
                    scanToolbarInject();
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ================================================================
    //  DONG BO 2 CHIEU: "Loai I" <-> "Chua phat hien bat thuong" (M4 - NCT)
    //  - Chon Loai I  => tick "Chua phat hien" + xoa ICD
    //  - Tick "Chua phat hien" => chon Loai I + xoa ICD
    //  - Bo tick "Chua phat hien" => bo chon Loai I (tat ca radio)
    //  - Chon Loai II..V => bo tick "Chua phat hien" + xoa ICD
    // ================================================================
    // Luu y: ten bien/ham ben duoi (M14_SPECIALTIES, setupM14Sync...) la
    // dinh danh NOI BO con lai tu he thong so M cu, KHONG doi de tranh
    // rui ro sai sot tham chieu - chi nhan M hien thi cho nguoi dung (label
    // nut, showToast) va comment mo ta moi duoc cap nhat theo M4/M3 hien tai.
    var M14_SPECIALTIES = [
        { radio: 'NoiKhoa_PhanLoai',  cb: 'NoiKhoa_ChuaPhatHienBatThuong',  icds: ['NoiKhoa_ChanDoanSoBo_ICD',  'NoiKhoa_ChanDoanXacDinh_ICD']  },
        { radio: 'NgoaiKhoa_PhanLoai', cb: 'NgoaiKhoa_ChuaPhatHienBatThuong', icds: ['NgoaiKhoa_ChanDoanSoBo_ICD', 'NgoaiKhoa_ChanDoanXacDinh_ICD'] },
        { radio: 'DaLieu_PhanLoai',    cb: 'DaLieu_ChuaPhatHienBatThuong',    icds: ['DaLieu_ChanDoanSoBo_ICD',   'DaLieu_ChanDoanXacDinh_ICD']   },
        { radio: 'SanKhoa_PhanLoai',   cb: 'SanKhoa_ChuaPhatHienBatThuong',   icds: ['SanKhoa_ChanDoanSoBo_ICD',  'SanKhoa_ChanDoanXacDinh_ICD']  },
        { radio: 'PhuKhoa_PhanLoai',   cb: 'PhuKhoa_ChuaPhatHienBatThuong',   icds: ['PhuKhoa_ChanDoanSoBo_ICD',  'PhuKhoa_ChanDoanXacDinh_ICD']  },
        { radio: 'Mat_PhanLoai',       cb: 'Mat_ChuaPhatHienBatThuong',       icds: ['Mat_ChanDoanSoBo_ICD',      'Mat_ChanDoanXacDinh_ICD']      },
        { radio: 'TMH_PhanLoai',       cb: 'TMH_ChuaPhatHienBatThuong',       icds: ['TMH_ChanDoanSoBo_ICD',      'TMH_ChanDoanXacDinh_ICD']      },
        { radio: 'RHM_PhanLoai',       cb: 'RHM_ChuaPhatHienBatThuong',       icds: ['RHM_ChanDoanSoBo_ICD',      'RHM_ChanDoanXacDinh_ICD']      },
    ];

    var _m14SyncGuard = false;

    function m14GetSelectedLabel(radioContainerCls) {
        var container = document.querySelector('.' + radioContainerCls);
        if (!container) return null;
        var selected = container.querySelector('.dx-list-item-selected .dx-item-content.dx-list-item-content');
        return selected ? (selected.textContent || '').trim() : null;
    }

    function m14SelectLoaiI(radioContainerCls) {
        var container = document.querySelector('.' + radioContainerCls);
        if (!container) return;
        var items = container.querySelectorAll('.dx-item.dx-list-item[role="option"]');
        for (var i = 0; i < items.length; i++) {
            var lbl = items[i].querySelector('.dx-item-content.dx-list-item-content');
            if (lbl && (lbl.textContent || '').trim() === 'Lo\u1ea1i I') {
                if (!items[i].classList.contains('dx-list-item-selected')) {
                    pointerClick(items[i]);
                    var icon = items[i].querySelector('.dx-radiobutton-icon');
                    if (icon) pointerClick(icon);
                }
                break;
            }
        }
    }

    function m14SyncFromRadio(spec, selectedLabel) {
        if (_m14SyncGuard) return;
        _m14SyncGuard = true;
        try {
            var cb = document.querySelector('.' + spec.cb + ' dx-check-box[role="checkbox"]');
            if (selectedLabel === 'Lo\u1ea1i I') {
                spec.icds.forEach(function(cls) { clearTagBox(cls); });
                if (cb && cb.getAttribute('aria-checked') !== 'true') tickCheckbox(cb);
            } else {
                if (cb && cb.getAttribute('aria-checked') === 'true') untickCheckbox(cb);
                spec.icds.forEach(function(cls) { clearTagBox(cls); });
            }
        } finally {
            setTimeout(function() { _m14SyncGuard = false; }, 50);
        }
    }

    function m14SyncFromCheckbox(spec, checked) {
        if (_m14SyncGuard) return;
        _m14SyncGuard = true;
        try {
            if (checked) {
                spec.icds.forEach(function(cls) { clearTagBox(cls); });
                m14SelectLoaiI(spec.radio);
            } else {
                var current = m14GetSelectedLabel(spec.radio);
                if (current === 'Lo\u1ea1i I') {
                    var container = document.querySelector('.' + spec.radio);
                    if (container) {
                        var sel = container.querySelector('.dx-list-item-selected');
                        if (sel) pointerClick(sel);
                    }
                }
            }
        } finally {
            setTimeout(function() { _m14SyncGuard = false; }, 50);
        }
    }

    function setupM14Sync() {
        if (window.location.href.indexOf('KNCT_ThongTinKham') === -1) return;

        M14_SPECIALTIES.forEach(function(spec) {
            var radioContainer = document.querySelector('.' + spec.radio);
            var cbContainer = document.querySelector('.' + spec.cb);
            if (!radioContainer || !cbContainer) return;

            radioContainer.addEventListener('click', function(e) {
                var item = e.target.closest('.dx-item.dx-list-item[role="option"]');
                if (!item) return;
                setTimeout(function() {
                    var lbl = m14GetSelectedLabel(spec.radio);
                    if (lbl) m14SyncFromRadio(spec, lbl);
                }, 80);
            }, true);

            cbContainer.addEventListener('click', function() {
                setTimeout(function() {
                    var cb = cbContainer.querySelector('dx-check-box[role="checkbox"]');
                    if (!cb) return;
                    var isChecked = cb.getAttribute('aria-checked') === 'true';
                    m14SyncFromCheckbox(spec, isChecked);
                }, 80);
            }, true);
        });
    }

    var _m14SyncSetup = false;
    var m14SyncObserver = new MutationObserver(function() {
        if (_m14SyncSetup) return;
        if (window.location.href.indexOf('KNCT_ThongTinKham') === -1) return;
        if (!document.querySelector('.NoiKhoa_PhanLoai')) return;
        _m14SyncSetup = true;
        m14SyncObserver.disconnect();
        setupM14Sync();
    });
    m14SyncObserver.observe(document.body, { childList: true, subtree: true });

    // ================================================================
    //  DONG BO 2 CHIEU: "Loai I" <-> "Chua phat hien bat thuong" (M3 - 18-59 tuoi)
    //  Giong het co che M4 (NCT) nhung danh cho trang KSKDK_ThongTinKham
    //  va cac chuyen khoa tuong ung cua phieu nguoi 18-59 tuoi.
    // ================================================================
    var M13_SPECIALTIES = [
        { radio: 'NoiKhoa_PhanLoai',     cb: 'NoiKhoa_ChuaPhatHienBatThuong',     icds: ['NoiKhoa_ChanDoanSoBo_ICD',     'NoiKhoa_ChanDoanXacDinh_ICD']     },
        { radio: 'HoHap_PhanLoai',       cb: 'HoHap_ChuaPhatHienBatThuong',       icds: ['HoHap_ChanDoanSoBo_ICD',       'HoHap_ChanDoanXacDinh_ICD']       },
        { radio: 'TieuHoa_PhanLoai',     cb: 'TieuHoa_ChuaPhatHienBatThuong',     icds: ['TieuHoa_ChanDoanSoBo_ICD',     'TieuHoa_ChanDoanXacDinh_ICD']     },
        { radio: 'ThanTietNieu_PhanLoai',cb: 'ThanTietNieu_ChuaPhatHienBatThuong',icds: ['ThanTietNieu_ChanDoanSoBo_ICD','ThanTietNieu_ChanDoanXacDinh_ICD'] },
        { radio: 'NoiTiet_PhanLoai',     cb: 'NoiTiet_ChuaPhatHienBatThuong',     icds: ['NoiTiet_ChanDoanSoBo_ICD',     'NoiTiet_ChanDoanXacDinh_ICD']     },
        { radio: 'TamThan_PhanLoai',     cb: 'TamThan_ChuaPhatHienBatThuong',     icds: ['TamThan_ChanDoanSoBo_ICD',     'TamThan_ChanDoanXacDinh_ICD']     },
        { radio: 'CoXuongKhop_PhanLoai', cb: 'CoXuongKhop_ChuaPhatHienBatThuong', icds: ['CoXuongKhop_ChanDoanSoBo_ICD', 'CoXuongKhop_ChanDoanXacDinh_ICD'] },
        { radio: 'ThanKinh_PhanLoai',    cb: 'ThanKinh_ChuaPhatHienBatThuong',    icds: ['ThanKinh_ChanDoanSoBo_ICD',    'ThanKinh_ChanDoanXacDinh_ICD']    },
        { radio: 'NgoaiKhoa_PhanLoai',   cb: 'NgoaiKhoa_ChuaPhatHienBatThuong',   icds: ['NgoaiKhoa_ChanDoanSoBo_ICD',   'NgoaiKhoa_ChanDoanXacDinh_ICD']   },
        { radio: 'DaLieu_PhanLoai',      cb: 'DaLieu_ChuaPhatHienBatThuong',      icds: ['DaLieu_ChanDoanSoBo_ICD',      'DaLieu_ChanDoanXacDinh_ICD']      },
        { radio: 'SanKhoa_PhanLoai',     cb: 'SanKhoa_ChuaPhatHienBatThuong',     icds: ['SanKhoa_ChanDoanSoBo_ICD',     'SanKhoa_ChanDoanXacDinh_ICD']     },
        { radio: 'PhuKhoa_PhanLoai',     cb: 'PhuKhoa_ChuaPhatHienBatThuong',     icds: ['PhuKhoa_ChanDoanSoBo_ICD',     'PhuKhoa_ChanDoanXacDinh_ICD']     },
        { radio: 'Mat_PhanLoai',         cb: 'Mat_ChuaPhatHienBatThuong',         icds: ['Mat_ChanDoanSoBo_ICD',         'Mat_ChanDoanXacDinh_ICD']         },
        { radio: 'TMH_PhanLoai',         cb: 'TMH_ChuaPhatHienBatThuong',         icds: ['TMH_ChanDoanSoBo_ICD',         'TMH_ChanDoanXacDinh_ICD']         },
        { radio: 'RHM_PhanLoai',         cb: 'RHM_ChuaPhatHienBatThuong',         icds: ['RHM_ChanDoanSoBo_ICD',         'RHM_ChanDoanXacDinh_ICD']         },
    ];

    var _m13SyncGuard = false;

    function m13GetSelectedLabel(radioContainerCls) {
        var container = document.querySelector('.' + radioContainerCls);
        if (!container) return null;
        var selected = container.querySelector('.dx-list-item-selected .dx-item-content.dx-list-item-content');
        return selected ? (selected.textContent || '').trim() : null;
    }

    function m13SelectLoaiI(radioContainerCls) {
        var container = document.querySelector('.' + radioContainerCls);
        if (!container) return;
        var items = container.querySelectorAll('.dx-item.dx-list-item[role="option"]');
        for (var i = 0; i < items.length; i++) {
            var lbl = items[i].querySelector('.dx-item-content.dx-list-item-content');
            if (lbl && (lbl.textContent || '').trim() === 'Lo\u1ea1i I') {
                if (!items[i].classList.contains('dx-list-item-selected')) {
                    pointerClick(items[i]);
                    var icon = items[i].querySelector('.dx-radiobutton-icon');
                    if (icon) pointerClick(icon);
                }
                break;
            }
        }
    }

    function m13SyncFromRadio(spec, selectedLabel) {
        if (_m13SyncGuard) return;
        _m13SyncGuard = true;
        try {
            var cb = document.querySelector('.' + spec.cb + ' dx-check-box[role="checkbox"]');
            if (selectedLabel === 'Lo\u1ea1i I') {
                spec.icds.forEach(function(cls) { clearTagBox(cls); });
                if (cb && cb.getAttribute('aria-checked') !== 'true') tickCheckbox(cb);
            } else {
                if (cb && cb.getAttribute('aria-checked') === 'true') untickCheckbox(cb);
                spec.icds.forEach(function(cls) { clearTagBox(cls); });
            }
        } finally {
            setTimeout(function() { _m13SyncGuard = false; }, 50);
        }
    }

    function m13SyncFromCheckbox(spec, checked) {
        if (_m13SyncGuard) return;
        _m13SyncGuard = true;
        try {
            if (checked) {
                spec.icds.forEach(function(cls) { clearTagBox(cls); });
                m13SelectLoaiI(spec.radio);
            } else {
                var current = m13GetSelectedLabel(spec.radio);
                if (current === 'Lo\u1ea1i I') {
                    var container = document.querySelector('.' + spec.radio);
                    if (container) {
                        var sel = container.querySelector('.dx-list-item-selected');
                        if (sel) pointerClick(sel);
                    }
                }
            }
        } finally {
            setTimeout(function() { _m13SyncGuard = false; }, 50);
        }
    }

    function setupM13Sync() {
        if (window.location.href.indexOf('KSKDK_ThongTinKham') === -1) return;

        M13_SPECIALTIES.forEach(function(spec) {
            var radioContainer = document.querySelector('.' + spec.radio);
            var cbContainer = document.querySelector('.' + spec.cb);
            if (!radioContainer || !cbContainer) return;

            radioContainer.addEventListener('click', function(e) {
                var item = e.target.closest('.dx-item.dx-list-item[role="option"]');
                if (!item) return;
                setTimeout(function() {
                    var lbl = m13GetSelectedLabel(spec.radio);
                    if (lbl) m13SyncFromRadio(spec, lbl);
                }, 80);
            }, true);

            cbContainer.addEventListener('click', function() {
                setTimeout(function() {
                    var cb = cbContainer.querySelector('dx-check-box[role="checkbox"]');
                    if (!cb) return;
                    var isChecked = cb.getAttribute('aria-checked') === 'true';
                    m13SyncFromCheckbox(spec, isChecked);
                }, 80);
            }, true);
        });
    }

    var _m13SyncSetup = false;
    var m13SyncObserver = new MutationObserver(function() {
        if (_m13SyncSetup) return;
        if (window.location.href.indexOf('KSKDK_ThongTinKham') === -1) return;
        if (!document.querySelector('.NoiKhoa_PhanLoai')) return;
        _m13SyncSetup = true;
        m13SyncObserver.disconnect();
        setupM13Sync();
    });
    m13SyncObserver.observe(document.body, { childList: true, subtree: true });

    // ================================================================
    //  DONG BO 2 CHIEU: "Loai I" <-> "Chua phat hien bat thuong"
    //  KSK Viec lam + Lai xe (kskdk_thongtinkhamtren18 - KSKT18_ThongTinKham)
    //  Cau truc chuyen khoa khac M3: muc "Noi khoa" duoc tach rieng thanh
    //  7 nhom nho (Tuan hoan, Ho hap, Tieu hoa, Than-Tiet nieu, Noi tiet,
    //  Co-xuong-khop, Than kinh) thay vi 1 nhom "Noi khoa" gop chung, nen
    //  KHONG the tai su dung nguyen M13_SPECIALTIES (thieu "Tuan hoan" va
    //  co du "Noi khoa" khong ton tai tren trang nay).
    //  Dung chung cac ham xu ly chung voi M3 (m13GetSelectedLabel,
    //  m13SyncFromRadio, m13SyncFromCheckbox) vi logic giong hoan toan M4.
    // ================================================================
    var VL_SPECIALTIES = [
        { radio: 'TuanHoan_PhanLoai',     cb: 'TuanHoan_ChuaPhatHienBatThuong',     icds: ['TuanHoan_ChanDoanSoBo_ICD',     'TuanHoan_ChanDoanXacDinh_ICD']     },
        { radio: 'HoHap_PhanLoai',        cb: 'HoHap_ChuaPhatHienBatThuong',        icds: ['HoHap_ChanDoanSoBo_ICD',        'HoHap_ChanDoanXacDinh_ICD']        },
        { radio: 'TieuHoa_PhanLoai',      cb: 'TieuHoa_ChuaPhatHienBatThuong',      icds: ['TieuHoa_ChanDoanSoBo_ICD',      'TieuHoa_ChanDoanXacDinh_ICD']      },
        { radio: 'ThanTietNieu_PhanLoai', cb: 'ThanTietNieu_ChuaPhatHienBatThuong', icds: ['ThanTietNieu_ChanDoanSoBo_ICD', 'ThanTietNieu_ChanDoanXacDinh_ICD'] },
        { radio: 'NoiTiet_PhanLoai',      cb: 'NoiTiet_ChuaPhatHienBatThuong',      icds: ['NoiTiet_ChanDoanSoBo_ICD',      'NoiTiet_ChanDoanXacDinh_ICD']      },
        { radio: 'CoXuongKhop_PhanLoai',  cb: 'CoXuongKhop_ChuaPhatHienBatThuong',  icds: ['CoXuongKhop_ChanDoanSoBo_ICD',  'CoXuongKhop_ChanDoanXacDinh_ICD']  },
        { radio: 'ThanKinh_PhanLoai',     cb: 'ThanKinh_ChuaPhatHienBatThuong',     icds: ['ThanKinh_ChanDoanSoBo_ICD',     'ThanKinh_ChanDoanXacDinh_ICD']     },
        { radio: 'TamThan_PhanLoai',      cb: 'TamThan_ChuaPhatHienBatThuong',      icds: ['TamThan_ChanDoanSoBo_ICD',      'TamThan_ChanDoanXacDinh_ICD']      },
        { radio: 'NgoaiKhoa_PhanLoai',    cb: 'NgoaiKhoa_ChuaPhatHienBatThuong',    icds: ['NgoaiKhoa_ChanDoanSoBo_ICD',    'NgoaiKhoa_ChanDoanXacDinh_ICD']    },
        { radio: 'DaLieu_PhanLoai',       cb: 'DaLieu_ChuaPhatHienBatThuong',       icds: ['DaLieu_ChanDoanSoBo_ICD',       'DaLieu_ChanDoanXacDinh_ICD']       },
        { radio: 'SanKhoa_PhanLoai',      cb: 'SanKhoa_ChuaPhatHienBatThuong',      icds: ['SanKhoa_ChanDoanSoBo_ICD',      'SanKhoa_ChanDoanXacDinh_ICD']      },
        { radio: 'PhuKhoa_PhanLoai',      cb: 'PhuKhoa_ChuaPhatHienBatThuong',      icds: ['PhuKhoa_ChanDoanSoBo_ICD',      'PhuKhoa_ChanDoanXacDinh_ICD']      },
        { radio: 'Mat_PhanLoai',          cb: 'Mat_ChuaPhatHienBatThuong',          icds: ['Mat_ChanDoanSoBo_ICD',          'Mat_ChanDoanXacDinh_ICD']          },
        { radio: 'TMH_PhanLoai',          cb: 'TMH_ChuaPhatHienBatThuong',          icds: ['TMH_ChanDoanSoBo_ICD',          'TMH_ChanDoanXacDinh_ICD']          },
        { radio: 'RHM_PhanLoai',          cb: 'RHM_ChuaPhatHienBatThuong',          icds: ['RHM_ChanDoanSoBo_ICD',          'RHM_ChanDoanXacDinh_ICD']          },
    ];

    function setupVLSync() {
        VL_SPECIALTIES.forEach(function(spec) {
            var radioContainer = document.querySelector('.' + spec.radio);
            var cbContainer    = document.querySelector('.' + spec.cb);
            if (!radioContainer || !cbContainer) return;

            radioContainer.addEventListener('click', function(e) {
                var item = e.target.closest('.dx-item.dx-list-item[role="option"]');
                if (!item) return;
                setTimeout(function() {
                    var lbl = m13GetSelectedLabel(spec.radio);
                    if (lbl) m13SyncFromRadio(spec, lbl);
                }, 80);
            }, true);

            cbContainer.addEventListener('click', function() {
                setTimeout(function() {
                    var cb = cbContainer.querySelector('dx-check-box[role="checkbox"]');
                    if (!cb) return;
                    var isChecked = cb.getAttribute('aria-checked') === 'true';
                    m13SyncFromCheckbox(spec, isChecked);
                }, 80);
            }, true);
        });
    }

    var _vl_SyncSetup = false;
    var vlSyncObserver = new MutationObserver(function() {
        if (_vl_SyncSetup) return;
        if (window.location.href.indexOf('kskdk_thongtinkhamtren18') === -1) return;
        // "Tuan hoan" la muc dau cua phieu nay, chi ton tai tren trang
        // KSKT18 (khong dung ".NoiKhoa_PhanLoai" vi truong nay khong co
        // tren trang nay, khien guard cu khong bao gio kich hoat duoc).
        if (!document.querySelector('.TuanHoan_PhanLoai')) return;
        _vl_SyncSetup = true;
        vlSyncObserver.disconnect();
        setupVLSync();
    });
    vlSyncObserver.observe(document.body, { childList: true, subtree: true });

    // ================================================================
    //  PHIM TAT: Shift + A => an / hien nut "Thao tac nhanh"
    // ================================================================
    var _wrapperHidden = false;

    document.addEventListener('keydown', function(e) {
        if (!e.shiftKey || e.key !== 'A') return;
        _wrapperHidden = !_wrapperHidden;
        document.querySelectorAll('#' + WRAPPER_ID).forEach(function(w) {
            w.style.display = _wrapperHidden ? 'none' : 'inline-flex';
        });
        if (_wrapperHidden) {
            var menu = document.getElementById(MENU_ID);
            if (menu) menu.style.display = 'none';
            closeSubmenu();
        }
    });


    /* ======================================================================
     *  TOAST (thong bao nho o goc man hinh)
     * ====================================================================== */

    function showToast(msg, type) {
        var old = document.getElementById('_medinet_toast');
        if (old) old.remove();
        var toast = document.createElement('div');
        toast.id = '_medinet_toast';
        toast.textContent = msg;
        var bg = type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : type === 'warn' ? '#e67e22' : '#323232';
        Object.assign(toast.style, {
            position: 'fixed', bottom: '90px', right: '24px', zIndex: '2147483000',
            padding: '10px 16px', background: bg, color: '#fff',
            borderRadius: '6px', fontSize: '13px', fontFamily: 'Segoe UI, Arial, sans-serif',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
            opacity: '1', transition: 'opacity 0.5s', maxWidth: '360px',
        });
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.opacity = '0'; }, 2800);
        setTimeout(function() { toast.remove(); }, 3400);
    }

    // ================================================================
    //  KHOI DONG
    // ================================================================

    // ================================================================
    //  KHOI DONG
    // ================================================================
    scanAndInject();
    // Fallback them o cac moc thoi gian de bat nhung truong hop load cham
    [200, 600, 1200, 2500].forEach(function(ms) {
        setTimeout(scanAndInject, ms);
    });

    // ================================================================
    //  TU DONG KIEM TRA CAP NHAT KHI LOAD TRANG
    // ================================================================
    (function autoCheckUpdate() {
        var AUTO_UPDATE_KEY = '_mtt_auto_update';
        var META_URL = 'https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js';
        var RAW_URL  = 'https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js';
        // Lay phien ban hien tai TU CHINH GM_info, khong hardcode (xem giai
        // thich o khoi "Kiem tra cap nhat" thu cong phia tren).
        var CURRENT_VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '8.0';

        try {
            if (localStorage.getItem(AUTO_UPDATE_KEY) !== '1') return;
        } catch(e) { return; }

        function extractVersion(text) {
            var m = text.match(/@version\s+([\S]+)/);
            return m ? m[1] : null;
        }
        function versionGt(a, b) {
            var pa = a.split('.').map(Number);
            var pb = b.split('.').map(Number);
            for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
                var na = pa[i] || 0, nb = pb[i] || 0;
                if (na > nb) return true;
                if (na < nb) return false;
            }
            return false;
        }
        function escHtml(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        function extractChangelog(text) {
            var block = text.match(/==Changelog==([\s\S]*?)==\/Changelog==/);
            if (!block) return [];
            var entries = [];
            block[1].split('\n').forEach(function(line) {
                var m = line.match(/^\s*\/\/\s*([\d.]+)\s*\|\s*([^|]*)\|\s*(.+?)\s*$/);
                if (m) entries.push({ version: m[1], date: m[2].trim(), desc: m[3].trim() });
            });
            return entries;
        }
        function buildChangelogHtml(entries, curVer) {
            var newer = entries.filter(function(e) { return versionGt(e.version, curVer); });
            if (!newer.length) return '';
            return newer.map(function(e) {
                var items = e.desc.split('\u2022').map(function(s) { return s.trim(); }).filter(Boolean);
                return '<div style="margin-bottom:10px">' +
                    '<div style="font-weight:700;color:#0369a1;font-size:13px;margin-bottom:4px">' +
                        '\ud83c\udd95 v' + escHtml(e.version) + (e.date ? ' \u2014 ' + escHtml(e.date) : '') +
                    '</div>' +
                    '<ul style="margin:0;padding-left:18px;font-size:13.5px;color:#374151;line-height:1.7">' +
                        items.map(function(it) { return '<li>' + escHtml(it) + '</li>'; }).join('') +
                    '</ul>' +
                '</div>';
            }).join('');
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', META_URL + '?t=' + Date.now(), true);
        xhr.timeout = 10000;
        xhr.onload = function() {
            if (xhr.status !== 200) return;
            var remoteVer = extractVersion(xhr.responseText);
            if (!remoteVer || !versionGt(remoteVer, CURRENT_VERSION)) return;

            // ---- POPUP GIUA MAN HINH ----
            var overlay2 = document.createElement('div');
            Object.assign(overlay2.style, {
                position: 'fixed', inset: '0', zIndex: '9999999',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                backdropFilter: 'blur(5px)',
            });

            var card2 = document.createElement('div');
            Object.assign(card2.style, {
                background: '#fff', borderRadius: '20px',
                width: '440px', maxWidth: '94vw',
                boxShadow: '0 30px 70px rgba(0,0,0,0.4)',
                overflow: 'hidden', position: 'relative',
                animation: 'mtt_popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            });

            // inject keyframe
            if (!document.getElementById('_mtt_anim')) {
                var st = document.createElement('style');
                st.id = '_mtt_anim';
                st.textContent = '@keyframes mtt_popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}';
                document.head.appendChild(st);
            }

            // header
            var hdr2 = document.createElement('div');
            Object.assign(hdr2.style, {
                background: 'linear-gradient(135deg,#0369a1 0%,#0ea5e9 100%)',
                padding: '24px 28px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
            });
            hdr2.innerHTML =
                '<div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">\uD83D\uDD04</div>' +
                '<div>' +
                  '<div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.3px">C\u00f3 phi\u00ean b\u1ea3n m\u1edbi!</div>' +
                  '<div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:3px">Medinet Script \u2014 phi\u00ean b\u1ea3n <b style=\"background:rgba(255,255,255,0.25);padding:2px 10px;border-radius:20px\">' + remoteVer + '</b> s\u1eb5n s\u00e0ng</div>' +
                '</div>';

            // close X
            var closeX = document.createElement('button');
            closeX.innerHTML = '&times;';
            Object.assign(closeX.style, {
                position: 'absolute', top: '14px', right: '16px',
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: '#fff', fontSize: '22px', width: '34px', height: '34px',
                borderRadius: '50%', cursor: 'pointer', lineHeight: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            });
            closeX.addEventListener('click', function() { overlay2.remove(); });
            closeX.addEventListener('mouseenter', function() { closeX.style.background = 'rgba(255,255,255,0.35)'; });
            closeX.addEventListener('mouseleave', function() { closeX.style.background = 'rgba(255,255,255,0.2)'; });

            // body
            var body2 = document.createElement('div');
            Object.assign(body2.style, { padding: '24px 28px 20px' });

            // version compare row
            var verRow = document.createElement('div');
            Object.assign(verRow.style, {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px', marginBottom: '20px',
                background: '#f8fafc', borderRadius: '12px', padding: '14px',
                border: '1px solid #e2e8f0',
            });
            verRow.innerHTML =
                '<div style="text-align:center">' +
                  '<div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Hi\u1ec7n t\u1ea1i</div>' +
                  '<div style="font-size:20px;font-weight:700;color:#64748b">' + CURRENT_VERSION + '</div>' +
                '</div>' +
                '<div style="font-size:24px;color:#0ea5e9">&#8594;</div>' +
                '<div style="text-align:center">' +
                  '<div style="font-size:12px;color:#0369a1;margin-bottom:4px">Ph\u00eci\u00ean b\u1ea3n m\u1edbi</div>' +
                  '<div style="font-size:24px;font-weight:800;color:#0369a1">' + remoteVer + '</div>' +
                '</div>';
            body2.appendChild(verRow);

            // changelog box ("co gi moi trong ban nay")
            var clHtml2 = buildChangelogHtml(extractChangelog(xhr.responseText), CURRENT_VERSION);
            if (clHtml2) {
                var changelogBox2 = document.createElement('div');
                Object.assign(changelogBox2.style, {
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: '12px', padding: '14px 16px',
                    marginBottom: '18px', maxHeight: '220px', overflowY: 'auto',
                });
                changelogBox2.innerHTML = clHtml2;
                body2.appendChild(changelogBox2);
            }

            // step guide (hidden initially)
            var guideBox = document.createElement('div');
            Object.assign(guideBox.style, {
                display: 'none', background: '#f0fdf4',
                border: '2px solid #86efac', borderRadius: '12px',
                padding: '16px 18px', marginBottom: '16px',
            });
            guideBox.innerHTML =
                '<div style="font-size:15px;font-weight:700;color:#15803d;margin-bottom:10px">\u2705 URL \u0111\u00e3 copy!</div>' +
                '<div style="font-size:15px;color:#166534;line-height:2.2">' +
                  '<b style="display:inline-block;background:#bbf7d0;border-radius:6px;padding:1px 8px;margin-right:6px">1</b>Nh\u1ea5n v\u00e0o n\u00fat b\u00ean d\u01b0\u1edbi<br>' +
                  '<b style="display:inline-block;background:#bbf7d0;border-radius:6px;padding:1px 8px;margin-right:6px">2</b>D\u00e1n v\u00e0o \u00f4 <b>\u201cC\u00e0i t\u1eeb URL\u201d</b> v\u00e0 nh\u1ea5n <b>\u201cC\u00e0i \u0111\u1eb7t\u201d</b><br>' +
                  '<b style="display:inline-block;background:#bbf7d0;border-radius:6px;padding:1px 8px;margin-right:6px">3</b>Reload l\u1ea1i trang web <b>(F5)</b>' +
                '</div>';
            // Nut mo TM bang GM_openInTab
            var tmBtn2 = document.createElement('button');
            tmBtn2.textContent = 'Nh\u1ea5n v\u00e0o \u0111\u00e2y';
            Object.assign(tmBtn2.style, {
                display: 'block', width: '100%', padding: '10px',
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '700',
                fontSize: '14px', marginTop: '12px',
            });
            tmBtn2.addEventListener('click', function() {
                try { GM_openInTab('chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=utils', false); } catch(e) {}
            });
            guideBox.appendChild(tmBtn2);
            body2.appendChild(guideBox);

            // install button
            var installBtn2 = document.createElement('button');
            installBtn2.innerHTML = '\u2B07\uFE0F &nbsp;C\u00e0i \u0111\u1eb7t phi\u00ean b\u1ea3n m\u1edbi';
            Object.assign(installBtn2.style, {
                display: 'block', width: '100%', padding: '15px',
                background: 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '17px', fontWeight: '800', cursor: 'pointer',
                marginBottom: '10px', letterSpacing: '0.2px',
                boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
                transition: 'transform 0.1s, filter 0.1s',
            });
            installBtn2.addEventListener('mouseenter', function() { installBtn2.style.filter = 'brightness(1.08)'; installBtn2.style.transform = 'translateY(-2px)'; });
            installBtn2.addEventListener('mouseleave', function() { installBtn2.style.filter = ''; installBtn2.style.transform = ''; });
            installBtn2.addEventListener('click', function() {
                try { GM_setClipboard(RAW_URL); } catch(e) {
                    try {
                        var ta = document.createElement('textarea');
                        ta.value = RAW_URL; document.body.appendChild(ta);
                        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                    } catch(e2) {}
                }
                installBtn2.style.display = 'none';
                guideBox.style.display = 'block';
            });
            body2.appendChild(installBtn2);

            // dismiss button
            var dismiss2 = document.createElement('button');
            dismiss2.textContent = 'B\u1ecf qua, nh\u1eafc l\u1ea7n sau';
            Object.assign(dismiss2.style, {
                display: 'block', width: '100%', padding: '11px',
                background: 'none', color: '#94a3b8',
                border: '1px solid #e2e8f0', borderRadius: '12px',
                fontSize: '14px', cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
            });
            dismiss2.addEventListener('mouseenter', function() { dismiss2.style.color = '#64748b'; dismiss2.style.borderColor = '#cbd5e1'; });
            dismiss2.addEventListener('mouseleave', function() { dismiss2.style.color = '#94a3b8'; dismiss2.style.borderColor = '#e2e8f0'; });
            dismiss2.addEventListener('click', function() { overlay2.remove(); });
            body2.appendChild(dismiss2);

            card2.appendChild(hdr2);
            card2.appendChild(closeX);
            card2.appendChild(body2);
            overlay2.appendChild(card2);
            overlay2.addEventListener('click', function(e) { if (e.target === overlay2) overlay2.remove(); });
            document.body.appendChild(overlay2);
        };
        xhr.send();
    })();

    // ================================================================
    //  OBSERVER: Loai I <-> Chua phat hien bat thuong (2 chieu)
    //  - Khi user chon Loai I   -> tu dong tick   "Chua phat hien"
    //  - Khi user chon Loai II+ -> tu dong untick "Chua phat hien"
    //  - (Chi xu ly khi user tu click, khong anh huong den auto-fill)
    //
    //  Map: class container PhanLoai -> class container ChuaPhatHien
    // ================================================================
    (function() {
        var PHAN_LOAI_MAP = {
            'NoiKhoa_PhanLoai': 'NoiKhoa_ChuaPhatHienBatThuong',
            'Mat_PhanLoai':     'Mat_ChuaPhatHienBatThuong',
            'RHM_PhanLoai':     'RHM_ChuaPhatHienBatThuong',
            'TMH_PhanLoai':     'TMH_ChuaPhatHienBatThuong',
            'ThanKinh_PhanLoai':'ThanKinh_ChuaPhatHienBatThuong',
            'TamThan_PhanLoai': 'TamThan_ChuaPhatHienBatThuong',
        };

        function getSelectedLabel(plContainer) {
            var checked = plContainer.querySelector('.dx-item.dx-list-item[role="option"] .dx-list-select-radiobutton[aria-checked="true"]');
            if (!checked) return null;
            var item = checked.closest('.dx-item.dx-list-item[role="option"]');
            if (!item) return null;
            var lbl = item.querySelector('.dx-item-content.dx-list-item-content');
            return lbl ? (lbl.textContent || '').trim() : null;
        }

        function syncChuaPhatHien(plCls, cbtCls) {
            var plEl  = document.querySelector('.' + plCls);
            var cbtEl = document.querySelector('.' + cbtCls);
            if (!plEl || !cbtEl) return;
            var label = getSelectedLabel(plEl);
            if (!label) return;
            var cb = cbtEl.querySelector('dx-check-box[role="checkbox"]');
            if (!cb) return;
            if (label === 'Lo\u1ea1i I') {
                tickCheckbox(cb);
            } else if (/Lo\u1ea1i (II|III|IV|V)/.test(label)) {
                untickCheckbox(cb);
            }
        }

        var obs = new MutationObserver(function() {
            Object.keys(PHAN_LOAI_MAP).forEach(function(plCls) {
                syncChuaPhatHien(plCls, PHAN_LOAI_MAP[plCls]);
            });
        });

        function startObserver() {
            obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-checked'] });
        }

        // Start immediately and re-attach after Angular re-renders
        if (document.body) {
            startObserver();
        } else {
            document.addEventListener('DOMContentLoaded', startObserver);
        }
    })();


})();
