// ==UserScript==
// @name         Medinet
// @namespace    http://tampermonkey.net/
// @version      6.11
// @description  Nut Thao Tac Nhanh nam trong header + Phan loai nhom NCT (41-60, 61-70, 71-80, 81+) + Phim tat Shift+A an/hien nut
// @author       Auto-generated
// @match        https://quanlyskcd.medinet.org.vn/*
// @grant        GM_setClipboard
// @updateURL    https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet_user.meta.js
// @downloadURL  https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet_user.js
// ==/UserScript==

(function () {
    'use strict';

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

    function showToast(msg) {
        var old = document.getElementById('_medinet_toast');
        if (old) old.remove();
        var toast = document.createElement('div');
        toast.id = '_medinet_toast';
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed', bottom: '90px', right: '24px', zIndex: '999999',
            padding: '10px 16px', background: '#323232', color: '#fff',
            borderRadius: '6px', fontSize: '13px',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
            opacity: '1', transition: 'opacity 0.5s', maxWidth: '340px',
        });
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.opacity = '0'; }, 2800);
        setTimeout(function() { toast.remove(); }, 3400);
    }

    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

    function setNumberField(cls, value) {
        var fieldItem = document.querySelector('.' + cls);
        if (!fieldItem) return;
        var input = fieldItem.querySelector('dx-number-box input.dx-texteditor-input');
        if (!input) return;
        input.focus({ preventScroll: true });
        nativeSetter.call(input, value);
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.blur();
    }

    function clearNumberField(cls) { setNumberField(cls, ''); }

    function tickCheckbox(cb) {
        if (cb.getAttribute('aria-checked') === 'true') return;
        var icon = cb.querySelector('.dx-checkbox-container, .dx-checkbox-icon');
        pointerClick(icon || cb);
    }

    function untickCheckbox(cb) {
        if (cb.getAttribute('aria-checked') !== 'true') return;
        var icon = cb.querySelector('.dx-checkbox-container, .dx-checkbox-icon');
        pointerClick(icon || cb);
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

    function tickAllChuaPhatHien(skipClasses) {
        document.querySelectorAll('b').forEach(function(bEl) {
            if (!bEl.textContent.includes('Chưa phát hiện bất thường')) return;
            for (var s = 0; s < skipClasses.length; s++) {
                if (bEl.closest('.' + skipClasses[s])) return;
            }
            var cb = findCheckboxNear(bEl);
            if (cb) tickCheckbox(cb);
        });
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
            pointerClick(item);
            var icon = radio.querySelector('.dx-radiobutton-icon');
            if (icon) pointerClick(icon);
        });
    }

    function selectRadioMultiException(containerClasses, labelIn, labelOut) {
        document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
            var labelEl = item.querySelector('.dx-item-content.dx-list-item-content');
            if (!labelEl) return;
            var text = (labelEl.innerText || labelEl.textContent || '').replace(/\s+/g, ' ').trim();
            var inContainer = containerClasses.some(function(cls) { return !!item.closest('.' + cls); });
            var target = inContainer ? labelIn : labelOut;
            if (text !== target) return;
            var radio = item.querySelector('.dx-radiobutton[role="radio"]');
            if (!radio) return;
            pointerClick(item);
            var icon = radio.querySelector('.dx-radiobutton-icon');
            if (icon) pointerClick(icon);
        });
    }

    function clearTagBox(fieldCls) {
        var fieldItem = document.querySelector('.' + fieldCls);
        if (!fieldItem) return;
        fieldItem.querySelectorAll('.dx-tag-remove-button').forEach(function(btn) { pointerClick(btn); });
        var input = fieldItem.querySelector('dx-tag-box input.dx-texteditor-input');
        if (input && input.value) {
            nativeSetter.call(input, '');
            input.dispatchEvent(new Event('input',  { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
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

    function fillCommonNumbers() {
        setNumberField('TMH_TaiTrai_NoiThuong', '5');
        setNumberField('TMH_TaiPhai_NoiThuong', '5');
        setNumberField('TMH_TaiTrai_NoiTham',   '0,5');
        setNumberField('TMH_TaiPhai_NoiTham',   '0,5');
    }

    function resetAll() {
        clearNumberField('Mat_KhongKinh_MP');
        clearNumberField('Mat_KhongKinh_MT');
        clearNumberField('Mat_CoKinh_MP');
        clearNumberField('Mat_CoKinh_MT');
        clearTagBox('Mat_ChanDoanXacDinh_ICD');
        clearTagBox('RHM_ChanDoanXacDinh_ICD');
        var matCb = document.querySelector('.Mat_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
        if (matCb) untickCheckbox(matCb);
        var rhmCb = document.querySelector('.RHM_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
        if (rhmCb) untickCheckbox(rhmCb);
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
    //  TIEN ICH FORM HOI BENH NGUOI CAO TUOI (D1-D8)
    //
    //  Cau truc DOM thuc te (doc tu HTML):
    //    <tr role="row">
    //      <td aria-colindex="1">D1.1</td>   <- ma so
    //      <td aria-colindex="2">Tăng huyết áp</td>  <- noi dung
    //      <td aria-colindex="3">           <- cot bac si danh gia
    //        <div role="listbox">           <- dx-list
    //          <div role="option">          <- dx-list-item
    //            <div class="dx-list-select-radiobutton" role="radio" aria-checked="false">
    //            <div class="dx-item-content dx-list-item-content">Có</div>
    //          </div>
    //          <div role="option">... Không ...
    //        </div>
    //      </td>
    //    </tr>
    //
    //  => selectNCTRadio(code, label):
    //     1. Tim <tr> co <td[aria-colindex=1]> = code
    //     2. Trong <td[aria-colindex=3]>, tim option co text = label
    //     3. Click vao option do (giong nhu action "Khong/Hau nhu khong")
    // ================================================================

    function selectNCTRadio(code, optLabel) {
        var rows = document.querySelectorAll('tr[role="row"]');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var codeCell = row.querySelector('td[aria-colindex="1"]');
            if (!codeCell || codeCell.textContent.trim() !== code) continue;
            // Tim options trong cot bac si danh gia (aria-colindex=3)
            var evalCell = row.querySelector('td[aria-colindex="3"]');
            if (!evalCell) continue;
            var options = evalCell.querySelectorAll('.dx-item.dx-list-item[role="option"]');
            for (var j = 0; j < options.length; j++) {
                var opt = options[j];
                var lbl = opt.querySelector('.dx-item-content.dx-list-item-content');
                if (!lbl) continue;
                if ((lbl.textContent || '').trim() !== optLabel) continue;
                // Kiem tra da check chua
                var radio = opt.querySelector('.dx-list-select-radiobutton[role="radio"]');
                if (radio && radio.getAttribute('aria-checked') === 'true') break; // da chon roi
                // Click giong nhu action "Khong/Hau nhu khong"
                pointerClick(opt);
                break;
            }
            break;
        }
    }

    /**
     * selectNCTRadioBulk: Chon hang loat, delay nho giua moi click
     * list: [{code, opt}, ...]
     */
    function selectNCTRadioBulk(list, doneCallback) {
        var idx = 0;
        function next() {
            if (idx >= list.length) {
                if (doneCallback) doneCallback();
                return;
            }
            var item = list[idx++];
            selectNCTRadio(item.code, item.opt);
            setTimeout(next, 50);
        }
        next();
    }

    // Danh sach radio can chon cho preset "Benh nen THA & DTD"
    var NCT_THA_DTD = [
        // D1 - Header nhom benh nen
        { code: 'D1',    opt: 'Có' },        // Ong, ba co dang hoac da tung mac...
        // D1 - Benh nen
        { code: 'D1.1',  opt: 'Có' },        // Tang huyet ap -> Co
        { code: 'D1.2',  opt: 'Có' },        // Dai thao duong -> Co
        { code: 'D1.3',  opt: 'Không' },
        { code: 'D1.4',  opt: 'Không' },
        { code: 'D1.5',  opt: 'Không' },
        { code: 'D1.6',  opt: 'Không' },
        { code: 'D1.7',  opt: 'Không' },
        { code: 'D1.8',  opt: 'Không' },
        { code: 'D1.9',  opt: 'Có' },        // Benh tim thieu mau cuc bo -> Co
        { code: 'D1.10', opt: 'Không' },
        { code: 'D1.11', opt: 'Không' },
        { code: 'D1.12', opt: 'Không' },
        { code: 'D1.13', opt: 'Không' },
        { code: 'D1.14', opt: 'Không' },
        // D2 - Tam soat Dai thao duong
        { code: 'D2.1',  opt: 'Có' },
        { code: 'D2.2',  opt: 'Có' },
        { code: 'D2.3',  opt: 'Có' },
        { code: 'D2.4',  opt: 'Có' },
        { code: 'D2.5',  opt: 'Không' },
        // D3 - Tam soat COPD
        { code: 'D3.1',  opt: 'Không' },
        { code: 'D3.2',  opt: 'Không' },
        { code: 'D3.3',  opt: 'Không' },
        // D4 - Tam soat Hen
        { code: 'D4.1',  opt: 'Không' },
        { code: 'D4.2',  opt: 'Không' },
        { code: 'D4.3',  opt: 'Không' },
        { code: 'D4.4',  opt: 'Không' },
        { code: 'D4.5',  opt: 'Không' },
        { code: 'D4.6',  opt: 'Không' },
        { code: 'D4.7',  opt: 'Không' },
        { code: 'D4.8',  opt: 'Không' },
        // D5 - Tam soat Ung thu
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
        // D6 - Tram cam PHQ-9
        { code: 'D6.1',  opt: 'Hầu như không' },
        { code: 'D6.2',  opt: 'Hầu như không' },
        { code: 'D6.3',  opt: 'Hầu như không' },
        { code: 'D6.4',  opt: 'Một vài ngày' },
        { code: 'D6.5',  opt: 'Một vài ngày' },
        { code: 'D6.6',  opt: 'Hầu như không' },
        { code: 'D6.7',  opt: 'Hầu như không' },
        { code: 'D6.8',  opt: 'Hầu như không' },
        { code: 'D6.9',  opt: 'Hầu như không' },
        // D7 - Lo au GAD-7
        { code: 'D7.1',  opt: 'Hầu như không' },
        { code: 'D7.2',  opt: 'Hầu như không' },
        { code: 'D7.3',  opt: 'Một vài ngày' },
        { code: 'D7.4',  opt: 'Hầu như không' },
        { code: 'D7.5',  opt: 'Hầu như không' },
        { code: 'D7.6',  opt: 'Hầu như không' },
        { code: 'D7.7',  opt: 'Hầu như không' },
        // D8.1 - Sinh hoat co ban
        { code: 'D8.1.1', opt: 'Có' },
        { code: 'D8.1.2', opt: 'Có' },
        { code: 'D8.1.3', opt: 'Có' },
        { code: 'D8.1.4', opt: 'Có' },
        { code: 'D8.1.5', opt: 'Có' },
        { code: 'D8.1.6', opt: 'Có' },
        // D8.2 - Sinh hoat hang ngay
        { code: 'D8.2.1', opt: 'Có' },
        { code: 'D8.2.2', opt: 'Có' },
        { code: 'D8.2.3', opt: 'Có' },
        { code: 'D8.2.4', opt: 'Có' },
        { code: 'D8.2.5', opt: 'Có' },
        { code: 'D8.2.6', opt: 'Không' },   // Lai xe -> Khong
        { code: 'D8.2.7', opt: 'Có' },
        { code: 'D8.2.8', opt: 'Có' },
        // D8.3 - Suy yeu
        { code: 'D8.3.1', opt: 'Không/Một số lần' },
        { code: 'D8.3.2', opt: 'Không' },
        { code: 'D8.3.3', opt: 'Không' },
        // D8.4 - Te nga
        { code: 'D8.4.1', opt: 'Không' },
        { code: 'D8.4.2', opt: 'Không' },
        { code: 'D8.4.3', opt: 'Không' },
        // D8.5 - Giam nhan thuc
        { code: 'D8.5.1', opt: 'Có' },
        { code: 'D8.5.2', opt: 'Có' },
        { code: 'D8.5.3', opt: 'Không' },
    ];

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

    function openSubmenu(parentItem, subItems) {
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

        // Index nhom tuoi hien tai (0-4), null neu khong doc duoc
        var ageIdx = getAgeGroupIndex(getPatientAge());
        // subItems[0..4] la 5 nhom tuoi, subItems[5] la THA&DTD (luon sang)
        var AGE_ITEM_COUNT = 5;

        subItems.forEach(function(sub, i) {
            var btn = document.createElement('button');
            btn.textContent = sub.label;

            // Xac dinh sang/mo:
            // - Nhom tuoi (i < AGE_ITEM_COUNT): sang neu dung nhom, mo neu sai nhom
            //   (neu khong doc duoc tuoi thi tat ca deu sang binh thuong)
            // - THA&DTD (i >= AGE_ITEM_COUNT): luon sang
            var dimmed = (i < AGE_ITEM_COUNT) && (ageIdx !== null) && (i !== ageIdx);

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
                sub.fn();
            });
            sm.appendChild(btn);
        });

        document.body.appendChild(sm);

        // Vi tri: ben phai cua parentItem
        var rect = parentItem.getBoundingClientRect();
        var smW = 220;
        var top  = rect.top;
        var left = rect.right + 6;
        if (left + smW > window.innerWidth - 8) left = rect.left - smW - 6;
        if (top + sm.offsetHeight > window.innerHeight - 8) top = window.innerHeight - sm.offsetHeight - 8;
        if (top < 4) top = 4;
        sm.style.top  = top  + 'px';
        sm.style.left = left + 'px';
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
            emoji: '\ud83d\udcc2', label: 'Ph\u00e2n lo\u1ea1i theo nh\u00f3m',
            color: '#1565c0', hoverColor: '#0d47a1',
            hasFlyout: true,
            // Kha dung khi co it nhat 1 radio tren trang
            check: function() {
                return document.querySelectorAll('dx-radio-group').length > 0 ||
                       document.querySelectorAll('.dx-item.dx-list-item[role="option"]').length > 0;
            },
            flyoutItems: [
                {
                    label: '\ud83d\udc64 T\u1eeb 40 tu\u1ed5i tr\u1edf xu\u1ed1ng',
                    color: '#1565c0',
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
                            // D8.2
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
                        selectNCTRadioBulk(list, function() {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m \u226440 tu\u1ed5i');
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 41 \u0111\u1ebfn 60 tu\u1ed5i',
                    color: '#1565c0',
                    fn: function() {
                        // ============================================================
                        //  NHOM 41-60 TUOI - theo phieu 41-60.mhtml
                        //  Diem khac biet chinh so voi nhom <= 40 va nhom >= 61:
                        //  D8.2.6 (Lai xe / su dung phuong tien): tick "Co"
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
                        selectNCTRadioBulk(list, function() {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 41-60 tu\u1ed5i');
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 61 \u0111\u1ebfn 70 tu\u1ed5i',
                    color: '#1565c0',
                    fn: function() {
                        // ============================================================
                        //  NHOM 61-70 TUOI - cap nhat theo phieu 61-70.mhtml
                        //  Khac biet chinh so voi nhom 41-60:
                        //  - D6 PHQ-9: form 61-70 dung thang 4 muc (Hau nhu khong /
                        //    Mot vai ngay / Hon nua so ngay / Gan nhu moi ngay)
                        //    => chon "Hau nhu khong" (dung)
                        //  - D7 GAD-7: tuong tu D6, chon "Hau nhu khong" (dung)
                        //  - D8.1 (BADL): tat ca "Co" - van tu lam duoc sinh hoat co ban
                        //  - D8.2.6 (Lai xe): "Khong" - nguoi 61-70 bat dau giam
                        //    kha nang lai xe / su dung phuong tien (khac voi 41-60 = "Co")
                        //  - D8.2.1-5, 7-8: "Co" - cac sinh hoat hang ngay khac van ok
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
                        selectNCTRadioBulk(list, function() {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 61-70 tu\u1ed5i');
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 71 \u0111\u1ebfn 80 tu\u1ed5i',
                    color: '#1565c0',
                    fn: function() {
                        // ============================================================
                        //  NHOM 71-80 TUOI - cap nhat theo phieu 71-80.mhtml
                        //  Khac biet chinh so voi cac nhom tre hon:
                        //  - D1: Co (co benh nen) | D1.1 THA: Co | D1.9 Tim thieu mau: Co
                        //  - D6 PHQ-9: mot so muc "Mot vai ngay" (D6.3, D6.4, D6.5, D6.7)
                        //  - D7 GAD-7: D7.3 = "Mot vai ngay", con lai "Hau nhu khong"
                        //  - D8.1 (BADL): tat ca "Co" - van tu lam duoc sinh hoat co ban
                        //  - D8.2.1-4: "Khong" (khong tu nghe dt, mua sam, nau an, don nha)
                        //  - D8.2.5: "Co" (van tu giat do duoc)
                        //  - D8.2.6: "Khong" (khong lai xe)
                        //  - D8.2.7-8: "Co" (van tu uong thuoc, quan ly tien)
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
                        selectNCTRadioBulk(list, function() {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 71-80 tu\u1ed5i');
                        });
                    }
                },
                {
                    label: '\ud83d\udc64 T\u1eeb 81 tu\u1ed5i tr\u1edf l\u00ean',
                    color: '#1565c0',
                    fn: function() {
                        // ============================================================
                        //  NHOM 81 TUOI TRO LEN - theo phieu 81TRO LEN.mhtml
                        //  Khac biet chinh so voi nhom 71-80:
                        //  - D1/D1.1/D1.9: Co (THA + Tim thieu mau)
                        //  - D8.2.5: Khong (khong con tu giat do duoc, khac 71-80 = Co)
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
                        selectNCTRadioBulk(list, function() {
                            showToast('\ud83d\udc64 \u0110\u00e3 \u0111i\u1ec1n xong: nh\u00f3m 81 tu\u1ed5i tr\u1edf l\u00ean');
                        });
                    }
                },
                {
                    label: '\u2764\ufe0f B\u1ec7nh n\u1ec1n THA & \u0110T\u0110',
                    color: '#b71c1c',
                    fn: function() {
                        showToast('\u23f3 \u0110ang \u0111i\u1ec1n THA & \u0110T\u0110...');
                        selectNCTRadioBulk(NCT_THA_DTD, function() {
                            showToast('\u2764\ufe0f \u0110\u00e3 \u0111i\u1ec1n xong: B\u1ec7nh n\u1ec1n THA & \u0110T\u0110');
                        });
                    }
                }
            ],
            fn: function() { /* handled by flyout */ }
        },
        {
            emoji: '\ud83d\udccb', label: 'Ti\u1ec1n s\u1eed kh\u00e1m th\u1ef1c th\u1ec3',
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
                selectNCTRadioBulk(list, function() {
                    showToast('\ud83d\udccc \u0110\u00e3 \u0111i\u1ec1n xong: Ti\u1ec1n s\u1eed kh\u00e1m th\u1ef1c th\u1ec3');
                });
            }
        },
        {
            emoji: '\ud83c\udfe5', label: 'T\u00edch "Ch\u01b0a b\u1ea5t th\u01b0\u1eddng" + Lo\u1ea1i I',
            color: '#2e7d32', hoverColor: '#1b5e20',
            // Kha dung khi co radio "Loai I" VA co chu "Chua phat hien bat thuong"
            check: function() {
                var hasLoaiI = false;
                document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
                    if (hasLoaiI) return;
                    var lbl = item.querySelector('.dx-item-content.dx-list-item-content');
                    if (lbl && lbl.textContent.trim() === 'Lo\u1ea1i I') hasLoaiI = true;
                });
                var hasCBT = false;
                document.querySelectorAll('b').forEach(function(b) {
                    if (b.textContent.includes('Ch\u01b0a ph\u00e1t hi\u1ec7n b\u1ea5t th\u01b0\u1eddng')) hasCBT = true;
                });
                return hasLoaiI && hasCBT;
            },
            fn: function() {
                resetAll();
                setTimeout(function() {
                    tickAllChuaPhatHien([]);
                    selectRadioWithException('__none__', 'Lo\u1ea1i I', 'Lo\u1ea1i I');
                    setNumberField('Mat_KhongKinh_MP', '10');
                    setNumberField('Mat_KhongKinh_MT', '10');
                    fillCommonNumbers();
                    showToast('\ud83c\udfe5 \u0110\u00e3 \u0111i\u1ec1n: Ch\u01b0a b\u1ea5t th\u01b0\u1eddng + Lo\u1ea1i I + Kh\u00f4ng k\u00ednh + Th\u00ednh l\u1ef1c');
                }, 400);
            }
        },
        {
            emoji: '\u2764\ufe0f', label: 'B\u1ec7nh n\u1ec1n THA+\u0110T\u0110+BTTMCB',
            color: '#c62828', hoverColor: '#8e0000',
            // Kha dung khi co truong NoiKhoa_PhanLoai va NoiKhoa_ChanDoanXacDinh_ICD
            check: function() {
                return !!document.querySelector('.NoiKhoa_PhanLoai') &&
                       !!document.querySelector('.NoiKhoa_ChanDoanXacDinh_ICD');
            },
            fn: function() {
                // Buoc 1: thuc hien giong "Tich chua bat thuong + Loai I"
                resetAll();
                setTimeout(function() {
                    tickAllChuaPhatHien([]);
                    setNumberField('Mat_KhongKinh_MP', '10');
                    setNumberField('Mat_KhongKinh_MT', '10');
                    fillCommonNumbers();

                    // Buoc 2: rieng NoiKhoa -> bo tick "Chua phat hien bat thuong", chon Loai II
                    var noiKhoaCb = document.querySelector('.NoiKhoa_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
                    if (noiKhoaCb) untickCheckbox(noiKhoaCb);

                    // Chon Loai I cho tat ca ngoai NoiKhoa, chon Loai II cho NoiKhoa
                    selectRadioWithException('NoiKhoa_PhanLoai', 'Lo\u1ea1i II', 'Lo\u1ea1i I');

                    // Buoc 3: dien 3 ma ICD vao NoiKhoa_ChanDoanXacDinh_ICD lan luot
                    var icdCodes = ['I10', 'I25.5', 'E11.9'];
                    var icdDelay = 1500;
                    icdCodes.forEach(function(code, idx) {
                        setTimeout(function() {
                            fillTagBox('NoiKhoa_ChanDoanXacDinh_ICD', code);
                        }, icdDelay * (idx + 1));
                    });

                    showToast('\u2764\ufe0f THA+\u0110T\u0110+BTTMCB: \u0111ang \u0111i\u1ec1n ICD...');
                }, 400);
            }
        },
        {
            emoji: '\ud83d\udc53', label: 'C\u00f3 k\u00ednh + ICD H52',
            color: '#6a1b9a', hoverColor: '#4a148c',
            // Kha dung khi co truong phan loai mat va truong co kinh
            check: function() {
                return !!document.querySelector('.Mat_PhanLoai') &&
                       !!document.querySelector('.Mat_CoKinh_MP');
            },
            fn: function() {
                resetAll();
                setTimeout(function() {
                    tickAllChuaPhatHien(['Mat_ChuaPhatHienBatThuong']);
                    selectRadioWithException('Mat_PhanLoai', 'Lo\u1ea1i II', 'Lo\u1ea1i I');
                    setNumberField('Mat_CoKinh_MP', '10');
                    setNumberField('Mat_CoKinh_MT', '10');
                    fillCommonNumbers();
                    showICDPopup(function(icdCode) {
                        setTimeout(function() { fillTagBox('Mat_ChanDoanXacDinh_ICD', icdCode); }, 300);
                        showToast('\ud83d\udc53 Lo\u1ea1i II (M\u1eaft) + C\u00f3 k\u00ednh + ICD: ' + icdCode);
                    });
                }, 400);
            }
        },
        {
            emoji: '\ud83e\uddb7', label: 'RHM: Lo\u1ea1i II + K08.1',
            color: '#bf360c', hoverColor: '#8d1a00',
            // Kha dung khi co truong RHM_PhanLoai va tag box ICD cua RHM
            check: function() {
                return !!document.querySelector('.RHM_PhanLoai') &&
                       !!document.querySelector('.RHM_ChanDoanXacDinh_ICD');
            },
            fn: function() {
                resetAll();
                setTimeout(function() {
                    tickAllChuaPhatHien(['RHM_ChuaPhatHienBatThuong']);
                    selectRadioWithException('RHM_PhanLoai', 'Lo\u1ea1i II', 'Lo\u1ea1i I');
                    setNumberField('Mat_KhongKinh_MP', '10');
                    setNumberField('Mat_KhongKinh_MT', '10');
                    fillCommonNumbers();
                    setTimeout(function() { fillTagBox('RHM_ChanDoanXacDinh_ICD', 'K08.1'); }, 300);
                    showToast('\ud83e\uddb7 Lo\u1ea1i II (RHM) + K08.1 + Kh\u00f4ng k\u00ednh + Th\u00ednh l\u1ef1c');
                }, 400);
            }
        },
        {
            emoji: '\ud83d\udc53\ud83e\uddb7', label: 'C\u00f3 k\u00ednh + RHM: Lo\u1ea1i II + ICD',
            color: '#00695c', hoverColor: '#004d40',
            // Kha dung khi co ca phan loai mat + co kinh + phan loai RHM
            check: function() {
                return !!document.querySelector('.Mat_PhanLoai') &&
                       !!document.querySelector('.Mat_CoKinh_MP') &&
                       !!document.querySelector('.RHM_PhanLoai');
            },
            fn: function() {
                resetAll();
                setTimeout(function() {
                    tickAllChuaPhatHien(['Mat_ChuaPhatHienBatThuong', 'RHM_ChuaPhatHienBatThuong']);
                    selectRadioMultiException(['Mat_PhanLoai', 'RHM_PhanLoai'], 'Lo\u1ea1i II', 'Lo\u1ea1i I');
                    setNumberField('Mat_CoKinh_MP', '10');
                    setNumberField('Mat_CoKinh_MT', '10');
                    fillCommonNumbers();
                    setTimeout(function() { fillTagBox('RHM_ChanDoanXacDinh_ICD', 'K08.1'); }, 300);
                    showICDPopup(function(icdCode) {
                        setTimeout(function() { fillTagBox('Mat_ChanDoanXacDinh_ICD', icdCode); }, 300);
                        showToast('\ud83d\udc53\ud83e\uddb7 Lo\u1ea1i II (M\u1eaft+RHM) + C\u00f3 k\u00ednh + K08.1 + ICD: ' + icdCode);
                    });
                }, 400);
            }
        },
        {
            emoji: '\ud83d\udd04', label: 'C\u1eadp nh\u1eadt phi\u00ean b\u1ea3n',
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
                var RAW_URL  = 'https://raw.githubusercontent.com/Guitar72/medinet-autofill/main/Medinet_user.js';
                var META_URL = 'https://raw.githubusercontent.com/Guitar72/medinet-autofill/main/Medinet_user.meta.js';
                var CURRENT_VERSION = '6.11';
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
                    padding: '0', width: '420px', maxWidth: '94vw',
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
                    fontSize: '15px', color: '#6b7280', minHeight: '28px',
                    marginBottom: '18px', lineHeight: '1.6',
                    padding: '10px 14px', borderRadius: '8px',
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    textAlign: 'center',
                });
                body.appendChild(statusArea);

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
                    // Copy URL vào clipboard
                    try { GM_setClipboard(RAW_URL); } catch(e) {
                        try {
                            var ta = document.createElement('textarea');
                            ta.value = RAW_URL; document.body.appendChild(ta);
                            ta.select(); document.execCommand('copy');
                            document.body.removeChild(ta);
                        } catch(e2) {}
                    }
                    // Mở Tampermonkey Utilities tab
                    var tmId = null;
                    var knownIds = [
                        'dhdgffkkebhmkfjojejmpbldmpobfkfo', // Chrome stable
                        'gcalenpjmijncebpfijmoaglllgpjagf', // Chrome beta
                        'lcmhiflmkkekcbknnhgpnodjfldoecnf', // Edge
                    ];
                    for (var i = 0; i < knownIds.length; i++) {
                        try {
                            var url = 'chrome-extension://' + knownIds[i] + '/options.html#nav=utils';
                            window.open(url, '_blank');
                            tmId = knownIds[i]; break;
                        } catch(e) {}
                    }
                    // Hiện hướng dẫn ngay trong popup
                    installBtn.style.display = 'none';
                    var guide = document.createElement('div');
                    Object.assign(guide.style, {
                        background: '#fffbeb', border: '2px solid #fbbf24',
                        borderRadius: '10px', padding: '14px 16px',
                        marginBottom: '10px', fontSize: '15px',
                        color: '#92400e', lineHeight: '1.8',
                    });
                    guide.innerHTML =
                        '<b style="font-size:16px">\u2705 \u0110\u00e3 copy URL v\u00e0 m\u1edf Tampermonkey!</b><br>' +
                        '1\ufe0f\u20e3 Trong tab vừa mở → mục <b>Import from URL</b><br>' +
                        '2\ufe0f\u20e3 Nhấn vào ô trắng → <b>Ctrl+V</b> để dán<br>' +
                        '3\ufe0f\u20e3 Nhấn nút <b>Import</b> → <b>Install</b> là xong!';
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

                // note about auto-update
                var autoNote = document.createElement('div');
                autoNote.textContent = '\u24d8 Khi b\u1eadt, script s\u1ebd ki\u1ec3m tra t\u1ef1 \u0111\u1ed9ng m\u1ed7i l\u1ea7n t\u1ea3i trang v\u00e0 m\u1edf tab c\u00e0i \u0111\u1eb7t n\u1ebfu c\u00f3 phi\u00ean b\u1ea3n m\u1edbi.';
                Object.assign(autoNote.style, {
                    fontSize: '13px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.6',
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
            emoji: '\u2139\ufe0f', label: 'T\u00e1c gi\u1ea3',
            color: '#6d28d9', hoverColor: '#5b21b6',
            check: function() { return true; },
            fn: function() {
                var MODAL_ID = '_mtt_author_modal';
                if (document.getElementById(MODAL_ID)) {
                    document.getElementById(MODAL_ID).remove(); return;
                }
                var qrSrc = 'data:image/jpeg;base64,/9j/4QBqRXhpZgAATU0AKgAAAAgABAEBAAMAAAABAwMAAIdpAAQAAAABAAAAPgESAAMAAAABAAEAAAEAAAMAAAABAu8AAAAAAAAAApIIAAQAAAABAAAAAIiwAAEAAAABAAAAAAAAAAAAAAAAAAD/5AAwWElBT01JX0NVU1RPTUlaRQABAXsiODhiMCI6IjAiLCJ2ZXJzaW9uIjoiMzIiff/gABBKRklGAAEBAAABAAEAAP/iAdhJQ0NfUFJPRklMRQABAQAAAcgAAAAABDAAAG1udHJSR0IgWFlaIAfgAAEAAQAAAAAAAGFjc3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAD21gABAAAAANMtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACWRlc2MAAADwAAAAJHJYWVoAAAEUAAAAFGdYWVoAAAEoAAAAFGJYWVoAAAE8AAAAFHd0cHQAAAFQAAAAFHJUUkMAAAFkAAAAKGdUUkMAAAFkAAAAKGJUUkMAAAFkAAAAKGNwcnQAAAGMAAAAPG1sdWMAAAAAAAAAAQAAAAxlblVTAAAACAAAABwAcwBSAEcAQlhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z1hZWiAAAAAAAAD21gABAAAAANMtcGFyYQAAAAAABAAAAAJmZgAA8qcAAA1ZAAAT0AAAClsAAAAAAAAAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/bAEMBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAwMC7wMBIgACEQEDEQH/xAAfAAEAAgICAwEBAAAAAAAAAAAACgsICQYHAQMFBAL/xACDEAAABAUBAwQGDBQMDg4JAwUBAgMEAAUGBxEICRIhChMxQRQaIjlRYRUWGVhxdneBlrW21BcYIzI2NzhUVleRk5WXobTR0tPwJCYzNEJSc3ixs8HVJyg1REhTYnWGkpSy4fElKUNFVWRmZ3J0hKTCxEZjZWiFo6XD5EeCxeODh6Km/8QAHgEBAAEEAwEBAAAAAAAAAAAAAAYBBAUHAgMICQr/xABHEQACAQMDAgQDBQUGAwQLAAAAAQIDBBEFBiESMQcTQVEiYXEIFBWBkTKhsdHwFiNCUmLBM1PhCRc08RgkJVZjcnSSlbKz/9oADAMBAAIRAxEAPwCfxCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCPAmAvSIB6MeoXCIDjnCZ8G8X6mBEBiuG+ybKpN9k39E3/AAPdCP5E5ADImAA8IjH8FWSOIgRQhhDqAwD/AACOPXxDDayk2vfHAw3nCbx34fH1PbCEIoUEI9ZlUyfHHKHoiAfwjAiqZ/jTlHHUBij/AACMVw2spNr3xx+pXpljOHj3w8fqeyEeBEADIjw/DHmKFBCEIAQhCAEIQgBCEIFMrOMrPt6iEOiP53ij1/cH8ECp/UI8CIB0x5gBCEIDK9xCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQjwIgHTHmAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAR/BjAXOeAYEc/n4OnMf3HzJysdvK5guQcGSZuVCjxyByonEo+gAgA+GKxXVKMf8ANJL9Wln8jnTg6lSnTXepOMF9ZSUV/E0X7TratqaY5irae0qbKZ3HVbiZ/MHAlcNpImqAlKIplEQFyADvFKbgUcCIcAzHNDaja2QqEZ+N7amMoDkXHYXPJ9hbon3gb8xzYF5kAHc3f2oAGcx1BrUqCa1RqjvFMpu6UduT1pNUCnVUOoCaKTkyZE0xNncIQoABSBwDjjrjcA62etiCbLiUagySpyFzl6YNU608Bc+TqmfuG4NBR+M5gqaJcYDe3sjxEcjtO0s9M0uytFXpRqzuvLTlKPU3OcU1zh9lwu3qfU3bezPCbwl2dseluXbttrOpb2r2Gm1L6rZ07upK81ClGr8cquXSoR/Z+F4WE8P0xlr/AG2mrusaIltLSucsKWmSCRU39SSZsVGZvObACgYDmAxUzHxlTdAN4R4dMdV2k2tmsq29TtZ3NLlzStJYRcqjyS1CYjlm5TE5RULjcAxBEoCAGAcF6QCMI7DUGwuVeO3tBzVRVGW1NVcplL1RIfigN3LxNNYCm6AEyYmDIh+y6chG3za+aH7M6WZJa6oLUStaTmqAgy+ZtRXMsi4OigQ3ZY853QLKGHJ8Dgcj617O20ijWpWLtYKV1GTjiK9lj4uy7r588ZJzqm2/BLb24tE8O62y9NV5vGjeXNvKFhRlTj5UVOfmVn8VOT6s01FNJp9lgkpaDtbVJazLWoVZKyJy2ppWKbOqJDzhTKMXokAd9MM5FBbujJmwHABAc8MfT1q627caOLer1RVS5Hk+eFUQp+nUVSA8mbzmxEhRKIiYqJRxzighgAHHTgYjmcn8quby++txabTcqeRD+kE3izTeHmgdN3ae6uBc4393Jc46BjEfa+3xnN19XVbSNw9cmkdArFp6Xy4ypjNUlkAA7hwkTIlA6xlC7xsAIY4D0hEVht2jU1udslL7tCKquP8ApfTw/fv6fn658oWn2dNFv/H/AFPZsJVKe1tOtaWu1aKk/M+61ZJQs/M7xi6mY55fRjDzyfVvrtjtXd1J87c0tWbi3Mi59TsOWU8BEjC3ER5sjhcSmMscCdJgwOegOuOO2d2vGse2M9av5tcV9XMqKuQzmUVHuu0VUd4AUKmYClOmYxQECmzw4YziM7tllspLf37oBG9N7AdzGTTNYycgpxBUUW7humOBdOlC92IGNwIQghjjnpxHYu0w2Q1sLX2qm94rFN3EiClm/ZM6p46xl2azFMBMouiY4CcqxQEMhnAhGcldaBG4Wl+RDOVSb6Ukm+lJZfPPrxl9/kbvnuf7N1numPhRLa1g6vnx0uV7+HUnbRvpKNONKVy/7x1XJqPmJYU3jqUu+5DQXr+t9rRo0y8uMnJq5kyCIVDTaypedIcwAB3bMg4Oo1E/DeAB3d4AEQzGxEuevPV15yAdYeDMV7mzWvdUVk9XNpZjKn67aWVJUzGlaiaFOYEXErnCnYy4KJ726cye8B0hEB3DBkB4RYLy5yDxm3clDuVkUlQEekQUIB8/diG7i0qGmXcVReaNZOcV/l7cL5c/P8lg8dfaM8KLPwu3lToaQ5fgWs27vtOhJuTt31Yq26k8txg3GUM5ajLHofthCER489n8AoQTbgGKJg47uQzjw4j+46xYOnBq8domUOKIIHwnvdzwJkBAvAOA5Ho6Q6ePHs0AwGP5MfcgDzHjPHGOrOf5I8x4HoH0Bh/X6g8wjBbWDr3sxo7kRXtfTYHM7cpHUl9OsVEzTF1ugPdCnvAKSQmDd504YAejMa8NPO3v083juKwoKo5FNaAGcvE2MrnM2cIqy1ZysrzaBVlUwLzBTiId0fIBnjGGutf0ezu42Vzf0aVzOUUqUpNuLeFGMmk1BttPlrg2VpXg94i6ztx7r0/bF/W0NQnUp3slCl94p08eZUtqVScKtxTjh5nShOLaaTbRv2MPDACAccDnxh6A/gjz3ICAYAB6uEfjl0waTVk1mLFdJy0eIJOG66JyqJrIqkKdNQhyiIGIYpgEBARDjH6jCUMiIhwDID1gIZ6R6MB44y8ZdSUlhxkspr29HnPOVzx2NbShKE5U5qUakG4yjJNSUk8NST9U1h+z9jyJQwORHGd78PrR5yA9Yf6umNbGs7aWWa0frN5DPeeqWs3TfspGnJWqTslJATgUqjpQREECqf7nvAImAo4DhHVWlHa92I1H1K3o5+k4oKpX6nNS5lOl0hbvjmHBEknOSpiqoOCkTEMiPRGIqa/pFO+/Dql/QjduSiqLm1Lqf+Fy/ZUstJR6s+mDbtl4C+Luo7Ln4g2WxtbuNpxhKt+K07fqhKhBZlcU6HUripQik5OrGm4JZkpOKbNvZh4dz0hjoDPTHkByGcY8UetFQiqZVExASHADlMUQEpgMACAgICIYEBDoHEe2Mx/tx6/w/wBzULXTxLhxynnCaw8NY9MPjAhCEVAhHgRAOmPMAIQjwIgHTAHmEAEB4hHgBAc46umAPMI8ZDOOsY8wAhCEAIQjwIZx08M9HjgD+ecJvbm+Xf8A2ue6+p0x/cdaEcuPL6ZDnT8zzQACZjDu43c/G+HP3eMdlwAhCEAIQhACEI8CIAGRHhAHmEIQAhHjIeEPqx5gUyvdCEeAMA9A/wAMBEADOeH1f4IFTzCEIAQhHgBAc46umAyvc8wgIgHTHgBAejxfd6IA8whDohle4EI/gTgHEfjcfHdAdfDj6Hhjo65+oq0VoETq1xWUnlC4EUORkq7SM7VEgZEpECm394QHgBgDIDw8d3ZWF7qVeFrYWtxeXE38NG2pTrVHj/TCMnj347GM1TWdL0W3ld6tf2mn20VzWu69OhTz7dVSUVnnssv9x3mIAYMD4cx5jXnTG0y0v1PPiyJKrVZeoKvNEezJuDZibJgLvAuJhDdHpyIYxxjO2nKkkdVSttOpBMms0lr5Ejhs8ZrEWRVSOG8UxDJiYBDA+HPAc4jIartvXtDjTlq+lX1hGpxCdzb1KUJvGcKbXS3jnpTz344MVoe89rbkqTpaHrum6nVgszpWl3SrVIrhZcISclHP+JrGWffhkM468Z9aPACA9Ax8mcTyVyFoq/mrxFm0RLlRVY5SEL494whx6sej4Ijl1dW1lQqXN3XpW9vRg51a1acadOnCKy5TnJqMYpd22kiTtpZbaSXdtpY+vsfXAQHiEI6obXqt07dJM29SS9VwsqVFJIi5BMc5h3SgAAYekwgAcBz4OmOX1BWEgphqk8nUxbsEFgymddQpAPwAR3cmABwHEcD4ejHHBWu8dr31rd31nr2l3FnYJO8uaV5QnRtk8YdapGbjT9eJNZOCq0pJyjUi4xx1NNNLPbL9DlEI6eC+lswAf00y0R49LgmPq738kAvtbL6KpZ0Z/XCfRnH7cIxX/eb4f/8AvfoH/wCTtPdL/m/Pn1XqcfvND/nU/wD74/zO4YAIDxCOIUxW9O1iRc9PTFCYkaiUq5m5ynKUVAEShvAI44AIh4cRy4MZHHEeAD09XD88RLdP1Gx1W0pXunXVG9tKybpXNvUjVpVEnhuM4NxfOV37pnbGUZJSi1JPs08pnmEIRelRCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBHxqh/qHNf+oOv4hSPsx8mepmVk8yTIAiY7J0UoBxETCgoAAHjEeAeMY50+KkG+3XH+KO+1aV1bNvCVei2/ZKpFtlcRqxEPhkrv4+jmdD63ZqmP4IlGu+8kSP1MS+2z6I8mqHTRfyb6hbqTOWWnrV7L3taTZdq7bSF+oguio7UEiiRyoiU5DAICBgEQHiIZiSa7t1XAbHWS0IFMTfy3pW3K1PTvYS3ksVz5JvTggZoBOeBTcMU24Jc7ogIBxjZeq3FCdppCjWptxr27klOOUlGOcrPya9sn0r8Ztd0W60HwMjbapY1pWm5dv1LmNO5ozdvTp20FOdZKTcIxeE5NJLnlcEUvR4Ijqdsv4Rr+R8Org+J08er/XEgrlBvyBWS/vgv/EJxpo0m6aL9yfUhaGaTO1FbMZexrmSuXbpzIXySDdBN8mZRVVQ6JSETIHETGEMAGR6Y3rbdu1lwri0RZ5vRFIT2p1mL9yZ2nJpe4fHbAKBAAVit01BIAjwARAMjwAeMc724ovW9MkqtNwjTzKSmmo8w4bzjt29eGZbxB3Bodfx+8Jbyjq1hUtLbT9QjcXELmlKlRcqdPpVSan0wbxwpPnt3MA9gUXf1KVuUB+Oog5eHEeLtMPQjE3azWfnlrdYlw3kxaqEYVu88ssrd7hgQXSdhunImYQEphTMQAUKAjubweGNg2w0stde3mourZpW1A1LS8ucUedBJ5OJU6Yt1FQdJm5sii6RCifdARxnPDhw6N3O0K2f1I60aDTb76Mlr2REVXp2fAkUVN8SCPYbk4AJztlTAXeKI8Bwbqi1r6vQstfc3UjKhVpQhKUXlRy4pPPZ8c/n+ZENx+LeibD+0ndavc3dvc6Bq+hWOl313a1I3EKCcnKFVyptpqE1maWWlLKNSOyO2mtora2vaWOvNPEqTdSVwfyBnTwohLFmSggIouHAfqJ0x6BEMGAcAHCO09qTtS7JzizVRWcs7UbOt59WDTsJ/MZblaWMJesAgqJXAgAHWEoiAABeHSICIcdDN7tnDqqslP3comNs6gnzFJc5Gk4kEvcTBo7RKYQIrvtinFPfKGRKYCmx09IgHwbV7P3VVdueNJRJrUVSySdLppKTGby1yxZt0zHAplDKuSkKJSB3RgAc8OHVF7LTNEndrVHcxXPm9PWulvCeWs5zz2x8uXnE0q+F/gVf7xj4sS3hZqg7mOsTsfxG1VnK8j0VVVcX/AH0X1JTlS6sufp7/AN7Pe0lQXf1bWckUlZquUJfV8tqCdLEKYStJTKlwdu11DlyBcFIO7vYyOC8RwEWGssb9iS9m26kG6SQZ8CaZSfydfGNVuza2b9N6N6bWqCeGbzq50/ZpJzOaCmUxZaicpTqsWhxDeKUT8FDlEN7GMCGcbYChulAPBEP3LqdPULuKovNKiumMuPi4WXn1Txk8hfaX8U9O8St6Uloc/N0PQreVjZ3GGldVJSTrVoZ5dNuMYwb/AGlFvs0eYQhEbPN51XLvlhO/+rn9H4z8/wA+ntSOq5d8sJ3/ANXP6Pxn5/n09qQAj1K5wIB04EQ9EAH+DxeGPbHgejHHjw4dWeuD5TXuFw0/ZpkDjbPoV7MdXNymlTHmAMATZjSoOjHBuaUAgQQBoAju82K4K5EoZE3T1RpFauHEvdIuW5zoPGS5FU1EzCRRJZE4GKYpg4gYpigPDjkM+CJ2e2Y0XpXmtYN3aUlgKVpQTZZZyDZDfcTCUYE7hI24XfOKQFE5M7wFDPDpiD1W8iUlT5V0CRkyHVOi4T3RKKLgpt0wGD9jndHhjOQ446I81b30y503X7irUlOdO7qfebetmTypNNxTzw6b+HCfHH5/cfwb13Q/FbwA2nquhUaFLUtj6dR2vuXSKMUnS+7QjCneulFZcLqGK0ptfE5yy24snGbFDXO21IWMb20q2ZApce2LRrLXHZKpOfmklIQEmbxMDGA5xRApUlRwI9AjiNpuo+9dOWFtTVdw6hdotW0mlTtwlzihUxXcAicUUk88THOpgoAAZyOMRXaaGdU9RaSL/UbcyUOlSyhKYN2VUS8ihipP5I6UIi+IomAgU4ppCZQgmAwgYuQ6Ajc3tYNoTLNRCNLW8tfOwd0UaWMpxOHLRURReuXKJFSNFN0QzzAmEqqZg7k4dADE40jfdKjtevK5qL8Rsofd6EW/irOSSpVMf6e8n8ll8tryXb/ZG1TfXj9ounaVaVY7L1q9/F9au6cGqGn29vUhUvbZyScYyupPpoxfOZy6V8Jqc1DXrqbUBdysbn1M7XcuqgmjhVmiqoJispYRQxGLNEojukIigACJS8BUOc3SOY68opxPW1WU8tTR3ac9JOJeMrMyMcrrszstIEOZ5sQNvipugUOvPHhHFgDA8R6QzjqzwyP544Ruy2OWjc967tp3Wq+VnVomgV03jUHCAmbP5ukYDtyAY4AU5UjgBxxndEI1XpNtfa/rtCFOVSVxXuVVrVsv4EpqdScpeiS7Ps8ZXLwfZzxV3LszwK8FNYuru2tLfQdA29LS9P01QpxjdVVa/dbS0pUpLE6labhFLDb6svPJLmsApUCtm7cK1Tz/AJYVKPkJ5z2VnsjyRNLWwuufAeIK89zm+HUbMdwgICIgA8Q6QjWYTaQ2nYaqDaUDSuYo1A1cJSpKaFIHkcZ6KJDkblxxL3JihvYxkBDOeMdcaw9rNa7SjcotspnTk4qKeJMUn740vAoJNCOOKJDCfG+c4AI9z8aHo8PS71vSrS0lVrXtNUrSpCzrVH1PFeKUXF4i25cNvCfOefU/NzDwV8Ud27tt9N0rZd69U3XZV916Tp1NUYKrot3VdaFzSlOpGnGjBVIxSlKLXwrpWUjb3H8mzjgGc8Ijo9sA2r4/0NaoEPHzYev63H7vCO9LXbaK1txqYr2oy0XUrBGhZIrO3qSiXOncN0+AlSFMBKBxMIAAD09ORCLaluvQK8+ilqFOUsOTXTUWFFKWf2Mfv/XgkOqfZQ8edFtXe6jsS9o26q0qLmrqwm/MqzhShHphcyfM5LPHC5eFlrd0IAIY8GA8PR9T+SP6iOgblAdqQEwBbWqALvCACIpZwA8BHjjIgPj8WMx9CTbfi00xmcvYq25qtJJ68btjqlKQwplWVIkKgFKImNu7wmEAAREADAZ4R1x3ht6c+iOo0nNtJR6aifxNJf4eMt9/1awXtb7H/wBoWhZzvqnh7fxtKdKVadZ3WnOn0Ripyf8A4r4mo5eFiWV2JDwiADgR4jHjA8d7Ah0hw6A4+KMVrlawrHWetHKbx3MrGXUpTE5lCE3lwTNYiD54m4QK4TRbNFBK4WWEpgDmykEc8BxGjO4nKX9PMinjmW0NbyqKoYNHZkSzfuEW7xAhgDn25DYUADAPcgcA8eI2Ro209f1+l5+l6bWuKEkmq7ShSkvaM5tKXHGI5PK2rarYaFdVbHU7iNtd29WdCtbyxKpTq05uE4SjDLTUk03247+8nYMY4dHT4I8cN4OHVneDo6+nq9eNIWk3br6RdSc+YUhNpk5tnVczcJtJewqkxG7d65V7kCEdiIIE3zDukA5gEw4DpjbNdK68lthauqrruSjOZHS9PvajULL1CHF0zaNzOBBuoBubMKiZe4HIlHICHgG31Db2s6VdUrO/sK9tXrzjCjGpH4aspNRShP8AZly0uHxnkWurafe287i2uYVacIuU3CWZQS5ba/aXvyu3odr8BERAeIBjxZ4+KBRHiAh0dfh6ejhEZA/KbtNBFDpja2u8kOYgiAIYyURAf2QB4+Pgx1hjk9H8pW0oT+oZfKp7RtY0tL3ixEV5y+TTUbMyHEMqKkS3jiUueO6GeGQjPT8Od5Qg6ktFr9Kj1NKdKUsYTyoqbl29Euee7MZHdugTkoff6eW8cqaXGOW3FYXv9PmSRjlMYQwOC9fRx49eeMf2AY9EcZHw4jpyx1+rX6iKGllwrU1TLappuZokURdsHCapkjGKBhScJlMJ0Vi5wdNQAMUekI7kiG16Fe1rVLe4pVKNalJwqU6kXCcJLupReH+4kNKrTr04VaU41Kc0pRnFppp8rDQhCEdR2HVofLDN+5l/zY7Sjq0Plhm/cy/5sdpQAhCEAI/BMZpL5S3O8mj1nLmaYZVdvnKLRumGcd2suciZfXMGY/fEbPlI196rtbpxt5StHVE/kL6tqvUbzE0teKs3KkvZNFHH6ogcigEFUpQHiGREAjObc0SruLWbHR6NTyp3lXodVxc1Tik3Kbims4S7ZWXxnkxmsalT0nTrm/qRVSNCHUoZx1ttJRzz3bXPp3Nydfa79IltXThlWN+7dyqYNAPzzA89brOgEOAlAiHOFEeGMAbiMdX0ttTNCtXTIJTL7/0U3cmVBFLyRfA0SWUMbdKVJRQogbeHGBHAYHI4iANpC0F6nNf0wnjy2/ZM6bSFQhZ1N5xMlDFbqK8SlE66onOYwY4B63RiPka09n5qF0Izqm212JeZq0qZBw5kM5YuudQXMyOmVwnvkNlNVI6hBwIlMYByGcZjeFLwi2ir16JW3TOWtuDf3WLoxlnpykqbjl8Zbi3lrtxlrWlTfmvO3Wo09Gp/h8ZJec/Ma/aSb64tJ57Zwllln7IakkNTyptPaemzCcSd8gRy0mUvcpumjhA5d4qiayRjEEolEB6cgHTiMb7l63dKVn3zuV3BvjQVPTdmJwcyp3OkDP0jkEd5MyKXOCVQBAQEhhAQEMDxiPHyeLUNdy5VkL/Wsmc2mFQhQ9Oi6okjxdRZdu/eIqt0GhHCpjGImZQSAQANulHHoxhDNtgvrhv9XNYXAuTUkqo1epJ/MpwRCezU705E3rpRchMkVOBNwpwAC5AADq64g9DYmi2Wv6vpW4twQ0+hps6UaVSMYqrdKrBTj0xafaLxLpTw/VIkVXdWo3Gl2N9pWmu5qXcZOpBt9FFwfS05ZjnMuyyuO6fJKgpTakaF6vfhLJbqBohq5MoCKQTJ+DQqxzDulBIxyiU28YcAIiAdYxnTT1SyCq5S0nlNziXTyUPkirtJlLHSLto4SOACU6ayBzkHICGQzvB1gEVsmvLZX3y0Dyan6wq6oZVUVOTh4LFCcSJ4Ig2fFLvlTUIBwUKIlDIGAoB0BG5vk5mqq5c4ZX5tHV1QzGb0dR9DOazky80dquAlLluBm50G6qxz80koBwOJAHdyQO5AQjMbj8MNJt9vS3HtzWZ6ha05QjKnVjFqac1CThKKi1NN8xa+WF3LDSN631TU1per2ELapJNxcG8xxFSWU200/dPjKfJKsubqTsLZtIVrm3WoqjPjigScTpogtvF4iUUCHUVKYPAchRjFpptWdBzycjIiagKMIsCnNg7Ve7jExhHGSuBKJcZHgOMYyOeEV7OqK4lzdQ+qSvZYNQzmfvKhuLMpPIpetMXCrcx1poo0ZIoJnUFIhTCKZS7pccc464zarjYVa4aEtY5ui+pxF0lLpSE7mEnaPSqzFs0BHsg5ypFOImOkl3RwLkwcQxnMZiHhJtjTrbT/AO0G5ZWt7qdOnK3pf3NJOc1HMIRmpSn0uajlvDbSxzhWU99azdV7laXpUK9vaTaqz+OculP9ptYS4TeMLP05LCegbmUBc+St6ht7Vsjq+SuAAyUwkcwQfIGAeOTCiYxicRwAKFIIjHmvLk0DbKUHn9watkdIyVLO/MJ4/QYtslARECnVMAnEAzkpAMIdPCK7LZTa9rq6SdTlF0lO6imzi3lSVK1pOrKbful1Gzbs50RgLhFBU4kSXarGKJcFDiAhw6pQe2V0kan9b0vtNRNiGh0aUQKM5qCbjMewW6RnZCAkksmVQhlgBI+9ugBgwAj18IZrnhzS0DcljpuoarTo6TfwlWp6nNRj0UoJdakn8LnysPtzwl2M/p27amqaRcXlrZynf20ownaJvmTaxz3SfOeVjtkz2qLapaE6cmBJa61BUS7WOoKYqS58LpFMc4ETqlKBSgGeI4HHgjIO0WrLTpfVQW9qbu0VWT0qYKqS6VTdud+Qo9G83UFNQxuORAhTD4QDjEMudcm61Oy2nnk4+CTR7uaNmKzzyH7LOVyqqmkZTmCnOYCiocQEuRHGRDjiNK9BVjeXSDqHYtJPPZrTlY0JWbaXzNuyfLERVXavyIrt1ipKARdBYN4BKICUSm6AiYW/hXtPW7O6e3Ny1ru8s6XmVOqEZU28ZXVFQi1GTXDi17ZI/U3xrun16P4ppFOjb1qigmpS68NxXfql8SznHz7e9qpNZvLJKxXmc2ftJdL2aKjhy9eOEmzZuimXeOqqqsYiZCEDIiJjBj1wjBKstp9oeoiamks4v/RKz4jgzdckvmJXZWyqZhIcqxkw3SbogbeMAmABDHGI5u3D1+3Ya2YsDaOmZ5MKdWubbyUVbXDuWrqtF3ybpiiYzMF0hIcqSixhE5QEMgOByEasdAWyauRtAKDn1xJDdKm6bNLpuvLBl03emWmblwQpVBWOkCgqFIoY44MfiYcjxjE6J4X6ctFnr26NWnYWaqzpRjbwTwoVHT65yam8Sa4SSwmm212v9S3tevUI6do1jC5reVGcnVljLlGM8RWVjClzl8/IsA7QaorA35SUPae6lH1qqiQii7STzZBZ4gU/xvONjCRXIde4U2OvGI78EQxkR4D/AChn+CIaGzs2WmqnR1tCbdoV2acuLZAwqCYmqqn3To1PTBdkwUO1aTDmzCkmKy26QibgobwjguRiZbu9yADkcYzjpEQDH+vjGvt3aLpOiajSo6PqkNWsri3hcU68eluCk2lTm48OSab5Sa4TWSV7f1G/1G0lU1Cz+53FOo6U6bziWIxfXHLbw3LHdrjh8mEeufVGz0y2nfTtqZJWqJuRWX08zMYAMLo5BDsoU+k6aGd4wB0ju5iKjKpffHWJdBy3Znm9W1NOHCrxYyqyhmrFJQ3ExuIpt0EgEClAA+NLjHREqbVfonpvVY8katV1FM5e0kJFAaMmeObE6vx6hshxEwYDA8eARxPT9o9tHonZVZWaU555NZnzzqZzjmUzsm7cpjnKkoON0pw4CG8GRDHXG7/DXf8As/Ye0Lh6bZvU9+X8nGlCpaTnBTnOMKFGFTGeiKfVKMGnOTly3g8i+MvhZ4geJe/qEtYv/wAI8NNNjGVapTvI0mqUIKpcV5UupJ1JtOKlPKiorCwRZr8aebk6cqkaU1cJiVk+fNQdslmy/OoLEDAG5pQBDIpjwMGM54dHTuq2M94azn3lsttOZg6mEhkjVN/LOylFFxamUOBBRTOce5J/cBwDqjWlr51Ep6lL5LL06QziQyAx5JIhIXeO8MK26dVMoBkQVOAAn14HIZyEbwdmJp1PYm0C9fVe3Sl88qtsWYqGXAElGssBMFU01jHAMAJfinHq6ccI3D4s6y6/hBZf2rs7WlufWKdsrezpQxUp3k5RmnRpvM49EP2ufheY8nn/AMCNC+6ePV7/AGNv7yrtDb9W6dzqFeb8qpZUodMvPnxTaqTUlHK7JS+ZtUn8+lNNSp7OZw9by+Xy9uo5dOnByJJJIpFE5zHOcQKAAACPT1eGNMN/tXsuvMLuS26mhl6ZYPnDF4+RMJTOl0DCQxSgAiIJZARA4/HAOQyEYqbRrXhNLlz93Y20z5Y8lRehL5zMJaocx5q8E4pCySMkPdolNgBAom3z+HEcAoy0rXTfamkXlxTu2dWXcfkUlLVyYSJS5IpQVKK6R8bqi2QDugA2TBwyIR8+ftLeAO6Lv7POq6zZ6ndafuer0ahZ7dts/e9Q0m3p+dd06kIJ1W/JTrOEeIxhifOceq6n2gaOveIVXbOhUIVdqaXGdDWtfk+mhG9nNUqNOnUb6XB1f7uPL65PK4MqtNclGo7rU6zdpunTUHiR1TEUUEETFPvpnNxEAKAlAB9HAj1xse1Y0BV1wJRJpFTEucrCzAFxdoibdDJebOibdMUR7nI8fFwjGXQXTDh3V01n5gIozatTt1AMACZNwODImAOOM56Y24ABcdORwI8A6ujr8A5x1/cjxL9nLwxobj8GNa07V693Zw3NqNWNxVozcLhULSUIKOZJuPVJTTUuMJ+p6S0uhGtYSy30V2sSi85glFppvlqT9s9u5otPpUu4kmdRZkukRMpjKHOZQpSlKUTCYTGUDhgOkRjHOYsZjLpmvKVVVDukFzNRIkqc4GWKbdwUSmHORAQ4D9XMbftX18EaFp01LyZwUZ5OUzJH5tUOdQbnASmPgvdFEQEcCPAQDEYT6WrOPLmVgWoZuioaUS5wVyuoqQTFcrApvboKGASHERHjjIhkOEea/Ebwt21beIuleHXh3dajqupVK9OjqtxWrRq0rec5RzBOmkl5MMyqtvCeFkx1xaU1cxtrZynLhTcm8R7dsJ9vVvhcexsI0gUO8pO2bR1NWnYs1mxufWETGEyrUAAWpzAbiU26ocBDAYAOvhjLPABkfD0x+RmzSYtUGrYhUkkEk0kyFAAKUhCgUAAADwAHUHRH7I+pmxNr0dm7U0TblGbqR0yxo0J1H3nVUU6svn1VHKX54JRQpKjSp0lz0RUW8Yy13f5sQhCJcdohCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAj+T4xxABAc5Ac8eHAA/l8Uf1HpcLFQRVVOOCppmUMI9AFKAmHI9XAB9AIqllpLu2kvrkrFOUko8ttJJd8t4WPzOs7gVjbO2sndVJXcyp+QSxuQyqz2aGatyjugJjABlMCc/DgBcmEegBzGBxtrJojLOxpYbishIVfsUVwZG8jgU39wA3hHc3M8RNgAxEbLa5ayq1vNqAqu2crnL9jQFBTFaTJy1s4Oki/ftxAF3SvNmAFCifuSlNkAxxjXGOnS93wMUr0fA8qP4GjhQ5EqwK2E0uOZMwlOcDgYVQTA+S88KYJ7wGADiIDifWG2KNS1pVr26nGdWKlCPW0lnHSks92mn74+uT3xsD7Kmh6htXR9c37uq60y812nRlplnG5p0IUp3MIztqcPP5qXEo4flxec8Y45nnVlrc0j29pRnXE4uPR4Sp6QizJRio1cu1d8AEBIgiIqlEOkREAEvX08Ov7dbTTRrd2eI01K7hygsxWVBJqlOUSNUlTiIFLzay47hd4RwGcZz1ZiA6itUNQKy+SILzOaKLLptZdLQVcOTGWXOCZEW7cBN3ShzAUpShxEfHHZlyLIXpsOvJnFxaKqSg3E2bpzCSuH6R2ouETFBVJVFZE4gU4BgwpiYqhM8SgOYvHtKzS6JXlV1pJum3P4vTGFnOM4z8ufcmkvscbKt0rG83xqP47eKtPS41LmhTqyjT6XinQl/eVVBOPmOGce6b4slZMEjdN0ZjJSS9Vq5TKqk7ZFRFNZE4AYpyKpAIGIICAhgRAY+m7etmSCrl0uk3bpEE51VTFImQhQETCYxsABQAOIiPAIjwbDDWNVt16cqex9ezRecTGiGSEykMweKmUdHkxlCoGbLHOIifmlDE3DCYR3c8BwMcH20m0Mqa3r9LTraWeHlk1eMuyaxm7FXdctGq+8VJgiqmIGTVUKBhU4gYocB6QiJ/gVzPVHp7l1STTlUllro98tfks9v3nkpeBG7LvxWr+GcKvm3dvUVWpqU+udKGmPpkryWezcJdKg3/xMxzjk20Xg2iGkC1L1aUVnceQuZigoZJViyAkyMRUgiBiKc2JgKcBDAgI4yHij5NptpJo3ubMUZLStxJGwmK6gJotH5CS0DnMIFKUpziVPJhHgGQ49PjgwW3s3e7UXUThhbukaouJPlTnXeGZJKuxBQ45Mdw7XUIikJjCIgKqpRMPEM8I/TdLT/fnTtNWyNzaCqu37/JF2zl43VRS3s7xeaftjqtjHAS53AXE4dIliUra9go/d3fyVfCXT5naXw8dOfksLH+7PU6+yZ4bwgtuVPEC4W6J0VNWavrSMvM6Y5xYZ63T6uO3V8+WWS8umDGbNEXsvdIu2jhMqqC7ZQiqShDBkDEUIJimKYBznP1eMfQAQHiERWNjJtGammNZMNNV3Z4tM284bnJQ06mC4nWSeNkwMSUKKKCJlBckLutwHJhU7noiVKUwHKBgEBAQDo9DMQnVNNq6ZcyoVMuL5hPGFKPHb/r/seJPE/wAOdY8MN03W29W/vOmKr2V3GLVO8tJtqFWPLSaa6Zwz8Mk+6eT+oQhGNNdnVcu+WE7/AOrn9H4z8/z6e1I6rl3ywnf/AFc/o/Gfn+fT2pACEIQB8WfyRjUEomMnmKCbllMWi7RygsUDkUSXTMmcpiiHEBAw5z1cerjBG2o2jtxpvvrPAZyw/wAD6t3LmbyJXmTGbN1lVBUcsinxukMkcwnTKAhgoYDo4z0jZEBx0xrs2juk+Van7CVFKEmSRqtkDRebU07MX4qR21SMpzQGAplAKsBdwxQyA56Ih+89vrXdJqRhFO8tU61rJR+Jtcyp5z/jS4/1JHrb7HfjpLwZ8ULKnqs3U2ZuydLRdyWlXLtoU681Tt76VOScW7acvjl/ypSRX1N6KkyLgrgE1VAKbeKkqqY6WQ48SjgDAA4EA4YHgPi5cQoEKBQAA3QwUAxgpQ4AAB1B9TwdUfdqOQzKlp/N6cnDZRpM5LMHUvet1SmIomu1VMkcDFMAGLxDIAP7EQx4vi4yIeHo4dI+Lw9PVHmOpCpCc6clJThLolBvnKeGsd2+Pbnu8H6Ttt6RtrT7KnqG3rKxt7bUaMLqNe2hBRqUqsVUhNVFn4XFpp56cduDn1r7eT+6te0zQVNNFXc1qOaNWCJUiCoKZFlQKqscpciBEU945jD3IAA5EIn+aONOkj012Ipeg5U0RTepSxFzOHREikVdzFVEp3CqogGRNvCIAIj0BiNFGw70WnerTDUtXMp3UCnGWUIi8QEDKFAA7PmRSqAGC74kRRUDIKFE+ByUYlFrACTY5ChgASEodOAAC4AA9YP9Eb98N9uy06ylqt1TSub2K8jKXVTtuGn7p1Gsv5L5s+GP/aKfaFjvze9Dwu23febt3aFynrFShUzRvdb4U6TcX0zjYpyg+WvOck11QIfk4APNn1R6/L8h9xkgP8kcW2jjemnW0ykaFXpMlaZWVpQk7TmIALI7ETiC5XIGEA5sSCbeERD0Y5XOe/Pq+n5D6vYKOR+rmOvNp5RJLjbRllQ6j48tLUpKYlQvUyiY7YHQmS50CgJRHc3s9PgiOXrn+Eat0QVSX9rUowl2m+p4Tz6N8e2D0Xsr7svFDwrd5d1bC1/9F/Nxe26l51rSdCzVS4pKHxOpTjmUcZeVxyjdhLLZ7KI0tYi6kNmuyBaNxX3gaiYVRSJzm8PP9ImE2QDjwjJ+x1q9C82ZVFTFmaato9azxqZvUMukrZk47NaHLuHTdJgZQ5kRKYQ6i549IZHUgw2B6D1k1eEvu8IDluiuBBQWAS86mU+P1fAY3o2F6D9mjLtG9WzqsPgiP6xfzRkLBNA4qkaIJGHJzmTOocDqCIcDY4Z4ccxPNM/GZ3NGF3tzT7S3ljzbiEqEpRi1HPTGLbbftzn1ecnhrxPn4R2e3NZuNrfaH8Qdza/RnKpYaJf0NUpWtzcwrRcY1KtWFOEFCS6lPqTi0ny1h69tsdpQ0/2RsJJ5/bC2VM0jN3dStm6r+VMSoOBREpzmT394e5EfjgEMCHgjJvZuaPdMlX6V7b3NrS09JTepkGS82dTx9LyLOhVYK88VwYwjuiYgJ7wAJRKGOjpCPnbef5mynuH/AKWN+A/uRuAxlHsv2BptoSoKWEMBDTGnJsyKpx7kXRVEAMGOIbonDh4vDHTZ2NjLfV1TlbW6px023l0+XDpi3VhmajjCaXql6Eg3HvTd6+xLtTUY7m1z8QreJuqWtW8/E7v7zVtlp9Vxt6lbzfMnRT7UnLoz6EO3Xvdu4m0H2gh7IU9N3DOjWFbEtzQ8iaOFAkssl7J6EvM+RZEEEAOqUhlhHc7kR3QHGIlf6Y9iZohsxbaSyGsrTSC59WLS5qeoKjrNAZm4XmZkSmdCyIYxCNGxVDGKRFMN0N0DdPGIf1Pv09Ie1cUfXJSXl0spW9btSYOniKiX+xi83MKUxICoFEUTpHBYqnQJB3gHjE/W676dXs06z+cWCrtvL5/PaWUmtF1RJnDd2h2aDTspomKiYqJ7qphKkuT44giICADwD1xv+71DS9N2lpei3NTTdHubCg53Nu3ThOtKNJJ1atJJ4Sk5yXVzy+UfLDblK21G91zUNUgr3UI3NVuFdqdRxcm8xU28ycl3ff5esWTbR7IG21hqDW1Q6ZJS4o9hIJikrVtLy1wcsul6Cpw5iZSkmd9kKKoFKKSZgAREDZ4R2hs2NaNZag9m7qetRcKZLzme2otzOU5VNXixlnrmTLS1dJJusdQTHWFuIBhQw726GOIRrOujtVNRLW02qTSNqvUmdUVXON+n5A/WalSNJ5pK5gJFSrpCBBBq5RKKxFd0RwJB6+Hd2x0tnUDLR1rlue+ZuUJE+ttNZRK3ShRK3eOgZrHXIkPQYyRBEw4z9WJRW07UKez7eG5q1G8urLVrCelahGSnOtRqVrd0+mbzJ8zlTlltuKy+MmHp3drLXqj0iFS3oVrOvG7tsYjTnCElLMU+lYwmvzXPJjNsOLJ2TvhqlqSnL6UfTdY0k2p5+6BnU6ZDy9ByVUd1YBOdMhDBjgYTB1B0DgJB+0K2TmgmptMd0K4tJS1H26rG2tKzSq5dNaLeoIILKy5AVexJs3TXUIu3cY3CgfdEphKYg5AI0B7DO2DO8moG6Vunr99KyVHQM6aITGXLqNnbJ0cTlbuElkxKcopqCU3AQEQDq4jGOWsH4bvRxd26+mWpbk1qal60UJLQUmkwenY1LSy78qrFVJVycxSogYE0nXNmEMAJFOBgi91Sw1DVd5qFjuStplxY21jcfcPilSrW66XUkodShJyinFpx9Vle9vZ3NraaB1XGkwuoXNWvSV3x106jaUcyaykm01h8Zxx67N+TdXorin9RNZ2XLM5nMaJnEqcuhlvPqqyxg/aqCBXyaQiZNITgUQExQKBs5HMThwHIcQwPX/o8UR3dhfs2k9MlAlv7V87lVQVvcuStnEuJKHCb1lKpK8IRwmmZ0UBA7swGDnQJ8YO8UcxIiDPXniOcCOcf6I0f4m39hqG7LypYNShShSoVqij0KpcUk41ZJYXZ4i20steqNkbOtrm10WhG5ypTlKpTg31dNObTgs5a7LP5nmEIRr4lZ1aHywzfuZf82O0o6tD5YZv3Mv8Amx2lACPBhEA4BkY8x4HoH0BgH/L5ev8AX17A3V0fHB05/k6/R4RCI5TzccJpeyzlvmr8VW8kpeZTSYMwPkqTxy6RTQOJAEQKIo7/ABEoCIeEOETdDiJSCYcdyAmEfEUBERDx4DxdcVwm3TuGS5O0EuIMvXUeS+nGUpp5MpBFRNB02KsV2mXAmKBt8SbwBx6zBxjb3gtZxuN3RuZpdFjZ1q2ZNL4p4hFc+vOfyzlYIB4iXDpaEqMV8VzcU4LGX8MWpZ7dvy4/PBIk5NVa5al9MFYV2un3Fa1AIN1BLxErHBB3R4ZABDxcQHEYWcqLuG1c1Vp+t20dEF1LpNUM3mjYMb4A9dtCslDBkRADFSW3eAZ3R6gxG9nY12xLbDQTZxlgSnnknCoziIYNvTIpVsG4ZAcj0dMRF+UG3JTuJr+qOUy9ZRw2oWlqepZwkTJyJTBEHDpyUADIFMYjtDe6BHAZDiARJdqpaz4vanqEpJ07GpdzjJySS8qKtocp44y+O3DfoYXW/wD2fsSytYxalcRt49KTzJz6aknys8+r+TM0NkFe+ndBuhTUFqxqNuL1zOJkzpmmpWcRAsynqQioxbGMGDAmdXdFQS/sQxGJ8j16bU3aRXkmNJWVr6o5Ek6FVfyvUgoEmkEolu+IJndmSJvbxU8ZMZQDqGARHOYzwa6Fq+uzsOKdl9rZYtNqp8miXOcSNEDA8mbeUm33LdmiHdLuzJbwpo8DGEBAoCIgEaWtnPrvqzZt3nn9RzagXU7azFueU1JTj5M0smqCrc5gKBBdJAdBRE4iCiZigYc4wGBib2Nnpeq1d3a1p9nY6ruSlqFe3oUbyUJKnG3hTp01GM8qMZuMvixh9Pd4I1XuLyyjoen3Ve5s9KlbU6lWpQjOPW6jc5ZceW4rGV6HLNpBZvW5YGXUVSeqy7U0rNKoyrTeUSJ3OHT9Nsql8TUXOmucwAYu9ugYOv0cBsV2Lcsl1ttEOuy+8wEZe9So9el5W/MPN7wvJa6OQiag4yPZJUy5Ac5EA8cazNqLtFD7RG5dJ1iyox3RsspSTGlLKWuHZXqipllSqqqiKRSgGTBgA+71xtGkThpYjYFTo7tA8oqG9FZmZtzqEMgs8SbO0FkhDe3THIdsVYAEAEMb2BxF1rH36W0tC0vUre3tdR1fWLCjc2tqoQp04/eY1JxjGl8P/Cg1J+rTwdFk7da3qN5aVa1a1sbK4qUq9aUpTm/K6YNymuPiawuMZ4Rp22d9AO7368LRSXeFwvMbkM5yuqOTCYGkzB+oY/TneBIciP8ALmLJ6/8AU0moqylxp/Ol2jWWyyjp0qqZ0YhEMFl6pSpGE/cjvCG4BevgHgiro0p6l630m3jpy9dAy+XTCpKZcHcMkJqkoq0ETgYphUKTBs4MOB4YHAxsU1XbbjVrqyoBzayYoSulqdnBSN5ohTiLgr2ZkMAAZuc4DvCkc3QQnEc4HPEIsN/bE1jc24tEr0alCjpen0aMKsp1empDFWnOp0wxhfDCKTcvUu9sbksdH0rUadWnVqXl1ObpxhBNSbj0xUpfm88P95gLTwr3L1iShWnmuVKhvMwXYIMycNw9SoqF5kiYdG4AmwXhjA9HTJa2pu2xupaeqTaaNMz4kgm1MS9lJKprMrci81LNE2iKCrSVnPnsZRBYBIY+6JjGyHR0Y0bC3ZgXEuDeOn9Tt2qYmlO2/oZcs5phKdM1Wi1RzwA3mKrdByQih2qCgguoqJAKYAACCIxhBthtKd3NPOsm4dfTunJitSFc1W6q6mKlSZrLydwm6c9lEaGdFKZIizccJnRUEg9yIEAQ4xfXlba24N42Gi3Mra+loemTdGNWpGVCpdylRj5by+mc4Qh1SXOM9m8NWlGGt6VoNxf0YVreOoXkVKUIyVSNFc9eO8YybxnKzjGGu+XNCWI2yl9LXOL9Tm+VbSKlVpA6qRF5PKhdoLOZSRA7g6xEEhTKmQyRTCUpy9YdWI0k2vkU8udqioynKomTmoJ3UVzJbL5zNVlTOFpg5PN00nDk6pt4xxMYpjbwjgSjG82R8oFfNNHqunKa2jWVqcaBcUInUzOZIN2fNLMlGJHotQSAxDkTOBhJnIiHAesNbmyPt+a5+vqzjR8yWdtWs/cVA6OKR1ClOxKZ0Q5zYEoZWKUAOYcZMGRAcxkdKnqunWG6brVdO07S6NvTqw05WkaUHUt4xk4ynOKTk2sPEsY9u5bXn3K6utGoWV1dXtSrKlK6dw5yUKrlDKjGS4XEs4/IlDbVrZPTjVdZi2M+su/l57p2jpKWSU8iWUIIzuVoMUiCyExDCds5IIbyRjlApjAGQEOiJhMaE10aBagPM+xbl2jVl0wEDTWWLzBpJl3SZgDO+kIMl97dDicg5LwyMbb9X20x1gaNNe12ppSqU9Z0S7miKDak6uZvCySYM2ZASK5l4qFBLmzgQBKduIkEenrjGPW9tqbha0rNoWkmtradp8XK6S80nKKabl6sqmAcGY82CiJTGEd4d4wiAccjGE2fbbss7Sysrmhputbev/8A1iVapViq1pTuG6k4Tg+uNTpcmlyvrwZHXa2i1a1xcUql3YapbYpKEYy8uvKl0xi4tY6XLC/P09t6+xH2ulfaq6nW0737WbTivGEkUmVK1YREiL+cIS8gGfN5mBMFWcFQAVwcAAKG3d0cgaJOIDxEcDgevjjAAPi/liENycHR3ch7fma6nJ/IprIqIpGnX0pkb+YNFWqM+mc7TFqoiy54pBWI3aGUXMqmUyQbu5vAIlAZpFwakTpGi6mqM/xslk0wmI4/4q2UVwAdfEv1Y0j4maZpFDeVSw0GNKMK/kQqUaLTo07urLEoQx8MVzFuKwst8ZNi7V1K7p7ZnqGqubVtTrVfMqLE5UKMFLLbSb4WE33x3OK3XvdbyztPvKhraomEqbNEFFioquEyuHG4Ue4RRE2+c5jBguA4Z44iM7rW1/1rqWnR7c2yTfsKIFyDdJqyKoaYTxwJxIUyxke6FEc4KiGShkRHozGFWoq/VxL2V3UE1qKoJo/lRpm8JLGJ1FSNUGZVj8ymVAB3AwQSkEcCI4z0ZjqSh6yqC3tQsqmp3m0ZqxNvt1V2wOEyHAQHe5tQpiiYBDICYPXj1t4Y+BWk7Vt6Gv6lUttX3D5Mbi0pV5KNlZ1ZwjKGIvqbnFyw6ko9SafQl2Pmv4z/AGltf33eXG2tJp3eibVhdSt7ydqpO9vqFOajNymunEJJNxpRaUk+WzePoC2ay6syk92b3Md1FoohMJNSrsADn3ICVVFxMCmyJkyDgwpGDuxxveCO1NqjqwnVrpG0sjb5wnKFpwxBObPGY804aMMc2DVuCYl5oDkAAExQAQAcAIRq/o/X/qtnFRU/IEq7XQRmU1YS7BGhCETI4cJIAIYLgpSgfhkMAAB0BG8q5GzqpLUO7kddXEqB8tUa1PytB+qkXBFl02qfOqgUeAc4fJuAD058ARCN2Qr7c8QdG3P4r6lZX+myjcT0rS9NjVuaNpK38vyl5MoqOIuSk5tJyklxhJKf7D8reHhbr2zfBTRr/S9a6rSGu61qk4W1a9hXT85Kuk5fGouPQmkov3yyNbpyurRVp7jIV9XFIFrtWWGB3LGTxyciKczBYFCvVwyYFzFHIlBTPHAjxjurWZrQe6o5lSblnTydLMqUKB2DZBcygkXKJRA5R4bgABS4AoCGA49WNyUy2PtkpcwePlZ3M91o1XcGzuAGEkzH6RwGMlwGR+50xyrm0rLqfuXUlL0+VwaWy6eOZSyOqQRMcEXAoFOIhkBA2AHOfRja+3db8MvFDWrrVbSjdXV5pemVbSor1VKdpRsrqnOlUp07epPyczi5KTUepx7vsaP3ps/xY8IttW+gatOytdP3BqNOv02Uqde8urq3nTqQlVrwgqrhCphxTlzJ9k+SQJs2dRkvnUolEkZSYitRzczeWTt2dypwXaAUpVQQAd0oqlDnBEQADGE3HpzuDuhcGW27pOYz+YLJEURbHM3SOfdFRYSjulKGQMbuunHSHR4Y1w6BNGlN2boel7qzJ6unOpxIm02mLRyO62QWMQXCC6fHBMomLvZ4iGMeCOvtVt6JhcOp1aak5nJpFKXBkA5pM4JuVyG3REBAO7KI/G9A9QhkI+Ln2gNwaX9n6lvvTtr3yvbTV9dv4bN06jQUHp0LqblcxagsunQuJ1PLm8prpSfJ9N/C/UdxU/DnbtXc1GNLV56fbxwpKfXT8uLp1pvCanOm4uSl2llHSs1f1LfS5m+HOOXc5mAIoFKAgRszFThgOO6AEHIiGMjjiEburM21l1tKNlsjaJAVYG6Z3aoiBjqLmKAnETCGRADZ3chkMRiLovsYWTS7y/T1th+9KJZcisiIHRQHA86HOAA5HqHHSIYEQjYuAAXgAAAcMY/l/kjWn2W/Cy6sLW58S90051df3FKpXs/vMXKtQtq0ut1n15lGdZt4aw+hL0ZsHS7SUF96rc1aqbjnLajLGW88pvth847gM9Hgxgc9MeYQj2Z6+uPXtjOFz7/Lj1X65kQhCKgQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAR8aoREslmglHAgwd8ev9QP0fyx9mPi1DjyEmv973fDrxzJ/wAEc6f/ABKf/wA8f/2RcWn/AIq2/wDqKP8A/SJXGatDCfUrd8xhEwmrqdAYxsjnDw+OI9Po5HPrBiUowlzEuxVkf6Eb8bXKqY5omBUGaPxE+d0MmEeOekOnMRa9WXzSd3gDHGup1w68dmqdARKhZY8xVkHT8qxTHV/vm/8AqcPQjaOrNxtNHxlf39usrjhxjx/XyPp9431J09t+AyhKUF/abbrajJxTatYYzhr5kVPS8Qh9RlpyHIUSDX0hASGKAlH/AGUS4CUcgIcOgQHPXEhflA7RsjQdklEkEUzmerkMYhAKbc7HIGMgHj6M48UR69L3zSFpvT/Ic/ZRL7vHweOJDnKDB/SBZHwdnrhx8HY6Y+D8H8kdl83+M6UstJxeUm//AIf6/nkkPiNUqLx/8GsTkk9P1TKUnh5pUstrOOX8ucGIWwMUVT1H14BDCAjQp8gA9yfddpiGS8M4HiAeKNe20Ymk0mmsm+Cs1UVUVRq522Q50RyRumCZUyEKb9gAcS4yHEemNhuwHADamK0KOBA1FGL64vEw/h4R97bcaManou6y2oWlZOu9o6rSpkqE7FsdTyNmyZRAXDncKOE3BBD4oOAAQ7oeIRSFzRobhq06nTGVahGMJcJdXwvjPrxwv3e1nQ3HpGh/aj1m01KtRtqmtbWsbSyrVJRgvvKm6nlKcsKMppPpWcto25bFCibcSnSjJZ5TbaXK1DOXa6tRPSkRO9B6UcAgqoBedKUhAASlEQAMjwjuPavURbypNIlxn1YNpaR7KJao9kTtwVEjlKZJlEyBW6hsH3jmwG4QciHDriIlpB2hF9dHK7xpQEwbTKmZgrz76mZuQyjJRYMACiQ55xscAwAiljeDp4xybV7tL7/6v5ehTtWuWVPUg3MVYadkQHIg4cl4c45XOPPLcOgh8lKIjgMxj6mgX0tZV357+7+aqnX1PKimm1hP6LKT544eCB3/ANnLxCuPG5b0p6vQ/AZa3S1hai7yp96hbwlCo7RUsYaaTpL4ujofPLwY/aPZjNZVqksY9kx1fJBG5NOdiggIgoY3Z5CiTBcCIGKYQEByGOPRmLHKSHUUlMvUWAQWUZtzKZ6d8UiCOfHkfR8MQwNjJonqa7V8JDfGppM5a0BbZ4SbS526SOknM6hRDel5EBOUAVK3UHnlcAYggHTmJp6JCpJlTKAABClDHQAAAYDqDqDjGK3hcUat3SpU2pToxcZtdk+PZvL7r5YNUfbK3Po+s720fSNOq0Lq50LTpUdQuKLjJRr1pQkqEpR464Rj1Si2+nqXq8nthCAgA8BiGnjc6rl3ywnf/V1P8yO1I4c2p5dCqHE6McooqJCUpQzvZOXAgOfB0/y9UcwDPX1iI44cPqdPowB5hCACA5x1Dj14AR6HCJHCZ0VCAcipDEOA8SiUwCAlEOgc+P1+Ee+PGOOePRjxQKpuLUk2mmmmnhprlNNdmnyvmRW9qtswa5m9wJje6xtOqzpCeiK9TSBgQoKpuQEcvWyZShkTlyZYOkRwIRrb0wbM7UPeS4cjYVDQs2pikkJk3NPJnNm52xCtE1SmXImU5SmOcxAMUMeiA+GeEugmuUU1EynIbgYpilMUQ68gbID4wwOQ6Y9DeXMmm92M0boZ44QSIlnp6dwpePjiA3vh7o97qr1KU6tNTqKrUtoKKpzmmm3nGUpNNtcrl+jwveezP+0E8Xdn+GMfDuja6bqNW00+Wl6buC7lXd/aWjpeVTUoqXRWqUKbUaU5Ndl1Zaeev7P2zp+0FvKXt9TLNJlKaZlLaXNkUigUB5pMOcOOA4mUV3zmHiIiYfAAR2MqHOJmKADkSCGfWEOHiyMe4CgGfH0h4PFw9GPOADiAcQDAfw4/0xO4QjThCnBKMKcYwjFLCUYpRiljhJJL0PC1/f3epX91qV9WqXN7e3Na7urirJzqVbivVdWrUqSbzKU6knJt57vPGSOJMtCV83G1FVvgnJifA5GepVAWdifBOZI3TSO2EvUuJiDwAMbuPDHTm0x0Q6oKw1Wtr02cptzOW4sZaowesRAF5c/lojuicBEOImwYolzwAevhEpnm+IG3SgbwjxEOngA8eAhjP4IGRIoI75CjjgGSgPr8f5MZ+rEYuNpafcWl1aOpXpxur96hKcJ4nCt/pyuEucL0784PT23vtab80HdO190fhmh31bbGyobFoWV1QqStbvSIRpxbuYxmnKpNUodWPhaTWMMiFJy7bFopJopmq4qaRCpkIRQoFKUhQKQAwIBwAoB146vFtC2ajXXylW1QG1OrzAaOBiIMkpsYDODzARASmREMiCZQDrHjn6m7HsVDrTJn/ogH1AAMfwx5KiUmQIQChnPAA4h19HSI8MB92K2G2VZXVG5/FtTuFSfUqVespUqnCwpLvhP07HDfv2mo742zqe3X4UeHOhT1OCg9W0nSfJ1C2k5Rk6lvVbfRUbziXpnPuaoNrZpxuRqNsIwpy2csCbzqWz9q/Ox3t06rcCimfmx/bFEwDjwRkfs/7R1VZLTJb2gK0bla1BKZabs9sU28CJ1jgpzQmDiJkw7k3j6IzSMUBKACTIZHh0jjqHPEQwPV4Y/shSgUAAuAx0Y+r9Xp8fTGWhpdvDVa2rJz+8VbeNrJN/B0QakmljOcr3a9jUt54pa/e+F2m+FFWla/2e0zcFxuKhVUJfe3eXFF0ZQlPPS6ai21x1ZffhGibanbHOkdbaq90aDeIUleNoyAhHhUyEaT0UCDzKT8SgAgoOAKCxsiAdXAADRDaLTPtlNFNfyeT0NLa1qekJHNWii0ql80czKm3kuScEFwgm3XVMkRNZEDFECEDIjjrDE7mP4EoGABxgc54gHT4wjaOleIerWGmx0m6t7PVbGnB06NK/pOboxwlinL9pJJcJ/LnBoi92nZXN4763rV7K4c1KcreXSpvh/Euzzj+u6h6bUnZVXi1PTa12pmz1t1WVcVvJpd8FaijlTbLs50mkUzh0qmQA7pQ5VE1T53hKJA8EbhrNac6ipzZkz6yUmtclQlwHdu5vI3tNoJkTNMZ+tL1EOyzKlDKxnCg5E5xEwCOA4cI3Cbo8QKAFDwCHAeI8eID+fox/QBjhjwcfCOOPof6Yt7/fer6hYafp1aNNW+m3MLm2UZVMry59VOlUecThBJQi5c4S7tHdb7ZsbW5uruHV513RdGq+OXNRjKcXjMXLDbSwstkRHYmbOnVDpd1QTivLu0MtT1OPKfeNUXiigCArqqbyae705EOvgGeHo7S9sVs2JZrdsyef0cxSRvTQCasxpN2imQi04REMOZK6VAN86a5e6QAxt1NYpThjAY3RgABwx0dYgHHr4D4o8GARMAccdOfAPHrjqut8azc7gobjjKnb31CFKmlSTVKdOmsdE0/wBqM1xJPPyw8HZQ23YUdLqaU1Kpb1JyqNzac4ylj4ovHDTXGCPXsXaW1vaf5I5sJqOoidFoVqB1qQn7xYXASnd4dgnOYxjFbiAYIXOChgChwxEhQnQPo/n+fijzu4HgOA6wx0+v1R/UYXXNXnrmo1tSq21C2rXGJVo28emnKokk5tf5peuM59TI6ZYx060p2sKtStCmsQlVeZKOFiOcLheix/0QhH8mARxjj1CGeGOPEYxBkDq8Plhn/cy/5sdpRw4KeX8tAzvnSiiJAKJMd1vAGB8QB1/645jACEI8DnHAcD+fiGABgAxTFEMgYogIeEBDAh68Yd1ToH0oVrUM0qqprOUhNp/OXZ30ymTyVNVnLp0oIGOsoqdMTGOIgGREYzCHeAc9IZ6A6fF1R/XERAegMcQ68/U9CLm2vbuylKdpcVreU10zlRqSptxzym4tNp+3b3OitbULhdNelCrFNOKnFSUWsdlJNL8kcdpWlJDRVPSylqZlzeUyKTNE2UtlzNIiLZq2SKBU0UkiABSkIAdyUAAA+7GMtbaFdLdxarm9aVlZ+k57Us/dA9m02fytqu6eOebTTBVZVRMTmOBEyF6R+NAIy8ERAOAZgIZDH8EVo317bVale3ua9KtUT66lOpKM6nU+qXVJPLy0s5/f6Una29WEadWjSqQgkoQlCLjHGMdKxx2OHUfQ1KUDS7CjaTkjOTU3K0Ox2MpZoERaN0BDAkIiQoEKUQ+OAAwPR44xOvHs59Hl9355vcOytIzSZKqKKrvW8rbsXLlVQwmUVXVappnWOcw5Mc5hMPERHqjOEwZ4YHABngPX4OuPIdAcMeLwRzttS1CzrTuLW9ubetN9U6tKtOE5POcyal8TzzlnCtZWlxTjTr21GpTikowlCLUVwkllLC7ZXBrfojZN6EKCmCUzkNhqTI6QOBk+zWZXyYCAgbim5BQg8Q6wHPHMaPOUuVLTdvrNWFsXSkql8glTidvqhaymVt0mTNBrLm/YnNptkClTIXeXAw4IACPSIjEuPoxgB8HXw9H0P9EaUdpZsk/NCq9pGqpzctel5dSEodS2XS1Fnz26Z4qmo4VE2cDvimUeOcdQRN9mbnVLdGnajuTU7qrZ2bqVuqtOdbFVQcabjFtrOeO3b2I1uHRevRrq00iyo069fohimo08xcouWWku2OM8+vZcaSOTt6RbU35kV6Kiu1REnq6Vt0m8mZoTpii7TIDofip251kzimoUA4HIJTAOccR4yaqE2Yuie3c48m6csVRqT8qoLEUdytu9IU+d4DETckUIUQHiGA4DjHRHxtnJoGkGgW1czt5Kp6apXc1mh5g7nB0AQOsToTTOXiPcdXH1gDEbFBzjgOB/PxDHDeu8r3Vtw6ld6bqd3DT604RoRp1alOEoRhGOVBNY6pZz+857c29b2Ok2lC9s6ErqEXKpKcITkpOSljqw8pcLOX2wfMlEllUgYISyTS9pLZc1SKk2ZMW6bZuimQMFImikUpClDHclAoAHQEcLuNaO3F3JKrILjUfIqtlSpTlBpO5a2fJpc4USiZIHCanNnABHBiCUQGOxzCIBwDIx5iBwubilVVxCrVhXUurzYVJKqpN9+tNSz7vP6konQozh5U6cJU8Y8uUU4YWMfC1jjBq5d7G/Z+PZkrNVrC012UsqZU4lKoRPeMbeHCRRAgBkejdDHgx05V2e0eacbCnbuLYWqpKmHzYgpITNlKGhJkmQwABilfc0LkANgM/FOOOMZNYDID1h/p/DHgeIgAhkB458HT+fT1xkrjX9au6ToXOq31aljpdOpcVHDGFw11YaxjjsWdLSdNoVFVo2VvTqJp9UaUFLK9c4zkx/vLpcsPf1iqxurbWl6tBZIURdzKUtFnqaY5yVN4ZIV0wHP7E/EenrjEunNkJoEpWdoT2V2GpgH7dUrhMXCIukedIO8URRW3kxDIdAlEB689EbNh6B64/nuhAMcB8fr+L+SKW+u6zaUXb22qXtGg1h0qdxUjDHsl1cL6YFXStPr1FVq2VvOomn1SpxcsrHrjntn6859uNUrSFM0RJmlP0lI5ZT0oZpgm1lsrZosmiJChuhzaCBCJgOADOC8cZHrj988kkuqGUvpLNkCupbMmyrV83P8augsXcUTMH7U5REBDgGBj7GA6ccfDHgREA4BmMb51V1fPdWo63WqnmylJ1OtNNT6n8XUms5bzkvJUaM6Tt5UoSoSg6cqTivLcGsdDjjDi1lNdvfuYm/CTabTiIjbKnRN+yEWSQjkRzxyTpznPH/AE+PhItNnD+hjTnDgH6CS/E/Ph4AjLTAB0AAQjOrdu5kklr2qpLHCvrhLjGFjzPkiKPYGy5PL2xozbbk27C378d30fu7PkxYl2jLTtKXzOZMra08k7YLpOWyhGSW8RZEwHTMHc4ESmABD0IyhRQIgRJJIAKmkQqZCgGAApQ3SgABwAAAACPZuiOQMOePDHr+KAlHdwA/V8A58UY2+1bUtTdOWpX11eyprFN3VepXcOrCai5yk1lpZxhMzOl6Do+iRqQ0jTbPTo1WnUVpb0qKm0sJzVOMeprnGfd+nB+V4yQmLV0ydp842dJHQWIPADpKAYpyiPTgQHq+rGMbnRnp3dPlJi4tvIlnirgXSi52iZ1DLCfnBOJxKJhNv8cj0jGU4BgMR5hZapqWm+Z9wvrqz81JVPu1epR8xL0n0Sj1L0w8jU9B0bWnSeq6baag7dt0fvdCnW8uTw3Kn1xfS+Fysco44al5SMhJTRWxU5Qm0TYptUxFMhGqRCpppEAm7gpSFAvDGAAA49fWnwvNqhW589LszqifnDKGATGFTOd4c9IiPERz4enr7uj+AEwDgeID1gHR6PD6vHhEY1TQdG12pTr6vptpqNWGZQnd0adeUXJ9TadSMmm3y3+fcyMbehCFOlClTjTpRUIQUElCMYpRjFLCSSS9D8kvl7SVtUGDJIqDdukVJFIgYKRMgYKAY8AB1/6/3R/PTnhgQ4AI+v4vzzHkM449MZOjRpW9KnQoU4UqNKEadOnCKjCEIrEYxisJJJJJJcYO7CXZYPMIQjtAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAI/FMWpXjJ01MO6Dlus3E3WAKpmJkA6MhvZ9aP2x/I8RABDIDxz4On8+nriqbTTXdNNfVcnKMnCUZxeJRkpRfs4tNP8miOJdfYLyy5dyKtr493nzEannj2cGZklyJwbi7WMrzRTjxMBd7dyOM44hGzdPRpMEdHLHSUSpEBlbKmBpsKmMibss6ZnS7kXHMZ5rfysJBDowXgEbBBLxyHAQAQDwdfi8ceQzjj0xka2sX1aFGFWs5RoyTprC+FpYj6emOO6Ta9smyNY8XN969b6Ja6rrU7qht64oXekwlTgvute2jGFGcGlluEUks54+ayRvbX7BOXW6uLSteJ3eePVKZnzGeEZnl6RU3B2TkrgETGDAgU4lAomDiADkAjPrXrs+XOt6Q0ZJJxVxKRJSK6iySjBv2SZyJ0wTwcFs7oABc4KGM44gIRtIyI5DGMdAj19PHo/DAA4d1gRhPWdRqVqVedaXmUUlTksZWcZ7enHr+jO/UPGTxB1TXdJ3He67Ur6vocKlPTbqVKmpW8KqiqkUlFRfUkl2yaYtCOyqHRRcibXBlNwD1YvNpOMpUZPmhW6ZCisRUVSmS7oTdzgAHACPEeuNtVa0FTFxace0vWckl0+k0ybCg9l79um4bqgcolMG4qUwdeQHgIDxAenPNI8GEQDgGRi3r311c143FarJ10l0zTw1jhYxxxn95F9x723LuvWo7i1jUqtxrEY0VC+hijVgqDTpOLp4cXF8xaWU+XzyaF707BnTzcSoHc+oqoZ3bortY6y0slaaDpiChzCYwJJuCiKKYdAFIOCgGAxwj5VpNgVp/oqftZvW1W1FXrZscixZU9I3ZNDnTEDABxblA6hDCHdFMOBDgMb/cDnIYAOvwiPHxfyx5i+Wv6sqflfep9OOnPqku3Ofb5P1+pN4+PXizHTVpK3lqf3RUvJXxQdZU+np6fPcfN4XZ9WfmcBt5bajLV00wpOhZBL6fkctQIi2Yy9smgkUCABd43NgXfUEAyYxsiI5HMc84iGejgPciHXx6x9aP6hGJnOdSTnUblOXeUm28vHd/l/LualuLm4vK9S6uq1S5uK85VK1erOU6lSc23Kc5zblKTfdttnHlzVKCygNiSwUAN8SFUVQOJMBjewIBnOc44Yx6Eeneqz9pKPqrfjRyeEcTpOMb1WftJR9Vb8aG9Vn7SUfVW/Gjk8IA4zmq+OSSnwYAywZ+7w/0x9SX+Se6cZkVqU3ACg2E4l4eHfyPAP9Pi+lCAEIQgBCEIAQhCAP4U3903NiG/ujugYOG91CPi8MfMYeTAqn8kSswSAB5sWwnE4iI8N7eHGMdOA6Y+tCAPAeHGBHp456OiPMIQAhCEAfkeC8BEewQRFf8AYguJgT9fd4x8TeqzH6nKc/8ASWx4uv8APp8UcmhAHGN6rP2ko+qt+NDeqz9pKPqrfjRyeEAcY3qs/aSj6q340N6rP2ko+qt+NHJ4QBxjeqz9pKPqrfjQ3qs/aSj6q340cnhAHGN6rP2ko+qt+NH7GXk8K/8AsgVgCG6IZbGU53P7H48RDGenrj7cIABnjkc8fqB4IQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIRo92/+vy92zg0IPtQ1gwkA103uPQ1LphUbHyQl/kdUE3TZvhFDJcq8yYebNnuTDmIOXbfO1K/aWi9in/8AUgC1PhFVh23ztSv2lovYoP5WHbfO1K/aWi9ig/lYAtT4RVYdt87Ur9paL2KD+Vh23ztSv2lovYoP5WALU+EVWHbfO1K/aWi9ig/lYdt87Ur9paL2KD+VgC1PhFVh23ztSv2lovYoP5WHbfO1K/aWi9ig/lYAtT4RVYdt87Ur9paL2KD+Vh23ztSv2lovYoP5WALU+EVWAcr62pQD+p2hH0aUH8rFjPs1tQVcaptEtgL9XICXhWtyKHltQT8JWh2Mw7OdJFOr2MhkebTyI4LnhAGdEIQgBCEIAQyAdI4iL7ykna0anNlxSmnmcacS0mZ1cubVIzqEKolXkmTmZWiidt2MG8Xmzbxx3h6wiJl23ztSh6U7RD/gp/8A1IAtT4RpQ2BmvC9G0X0DyvUXfkJCWvHlzK1pRUKcY+R8u8jZCSUCyEG+TYVEXi3OHz3XDwRuvgBCEIAQhGjrlAGv292zg0JvdQ1gwkA10hcWhqXIFRsfJCXeRtQTcjN9lvkvxXmjDzZ89yPHEAbxYdEVWHbfW1K/aWi9in/9SJdfJvNqvqV2otsb91ZqNClQmVuqpkMokPlXlnkakLaYs111+ySbxucPvpl3RyGAzw4wBJk6YR4DPHOekekMcP5Q8ceYAQhCAEI19bUrUlX+kbQvfrUFa8JaNc26pY83kPku37Kl/ZRVSkDslDIc4TA/G5iu17b52pX7S0XsU/8A6kAWp8MhnHXjPrRVYdt87Ur9paL2KD+Vh231tS/2lovYp/8A1IAtT4RH65OxtIb+7TXSPcC8+oYtOFq2m7sTCjmHlZl3kaxGVN5a1dpiojvG31+dVNk/WXh1RIFgBCEIAQhCAEIQgBCPA54YHr4+MIgt7e/lBeuPZ1a+Jtp0sMW340EztpRVVJeWKRDMJj5Jz402B7lxvlyj+gkebJjue648YAnSwiq0R5XvtSTqpEElosHUIUf0qD0GMADj4r4B64sytKNx5/eDTRYW6tVA3Cpbi2koGtJ92GnzLTyWqOmZbNX/AGMl/uaPZTlXmyfsSYDqgDIGEIQAhGjjlAOv69+zf0KutQlggkA1yjcaiKXKFRsfJCX+R0/mpGb4Rb7xfivNGHmzZ7keMQd+2+dqV+0tF7FB/KQBanwyGRDwdPrxGc5N7tVdSm1FtdfyrtRpaVCaW6qqRSeQhS8sGWpC0mDNdwv2STfNzh99Iu4PDAejEmLAjgciAdOOjj4/5QgDzCK/DbE8pG1+6I9fF39Olny24Gg6KCT+RAzunheTH9GtlFVuecc4G/3RA3eHDjGr/tvnalftLRexQfysAWp8IqsO2+dqV+0tF7FB/Kw7b52pX7S0XsUH8rAFqfCKrDtvnalftLRexQfysO2+dqV+0tF7FB/KwBanwiqw7b52pX7S0XsUH8rDtvnalftLRexQfysAWp8IqsO2+dqV+0tF7FB/Kw7b52pX7S0XsUH8rAFqfCKrDtvnalftLRexQfysO2+dqV+0tF7FB/KwBanwAQHOOocevEBTYl8oy16a9NobaPTPeoluwt7WkprR5NhkNP8AYMzBWRU86mbLmHO+O4XshIvOBjui5CJ9YDnPT044/n0QAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEARW+WAd6Zmvq1Wq90SMVVcWqnLAO9MzX1arVe6JGKquAPamisrnmkVVcdPNpnPj0d0Bx68ezsJ586OfrCv4kTxuSEaQdMOpSzmqKZ37sbbu7EwkFZ0w1krytZA3nC8sbuGLkyyLRRbikmqYpTHKXgIgAxMl8yk2b4f2GFg/YMw/DAFIp2E8+dHP1hX8SHYTz50c/WFfxIu6/Mpdm/wCcwsH7BmH4YeZS7N/zmFg/YMw/DAFIp2E8+dHP1hX8SHYTz50c/WFfxIu6/Mpdm/5zCwfsGYfhh5lJs3/OYWD4/wDIZh+GAKRTsJ586OfrCv4kOwnnzo5+sK/iRd1+ZS7N/wA5hYP2DMPww8yk2b4/2GFg/YMw/DAFIp2E8+dHP1hX8SPSokqkIFVTUTMIZAFCGIIh4QAwAOIu8PMpNm+HRowsFnGAzQ7Do+rFdhytHT3ZHTlrxtXSFirY0haymJhY2WTZ9I6NlSMol7qZKTh2md8sgj3J3B0ygQTjxEpQCAIrcXTuxDHOy40gj/zVyT73J4g/gilii6c2IPet9IHqVyT+IJAG1yEIQB/J1CJlE6hyJlDpMcwFKGejImEA4+jHo7NZ5EOy23Dp+Lpdf/7o0b8o5u1cuyOyev1cW0dbVBb2uJPObfpSyqaYfqy2csU3tUNG7ojZ2l3aZXCBzJKgHxxDCEVbXmrG0e8+dfz2czD8+qAJmXLZhB3QGjgGog5ElQVrvA3+LCXLdtjeBPexnqzjMV6nYbv51c/WFfxYni8lxmcw2lNZ6lJRr2dr6spZbyS0w7odjes41i3pZzMllyP15Om94NFHZSEKuYnE4FAB6ImS+ZSbN/hjRhYLhw40Mw6Pq/wwBqB5IsmonsjZEVRM6Zgvlc/JVCGIb9Tp7qMAD6+IlBx1baCyNpLAUgnQFlrfUxbOi0n7qaJ0zSUtSlUoJMH3Ng7eFapdwC7gEUudP0m3C56I7SgBHgxilATGECgHERMIAAB4REeAR5jCbaO1VUVEaG9T1W0jOX9PVLILQVjMpLO5WuZtMJY/bShyo3dtHBO6SXRUKU5DhxAQ4QBmh2az+e2319L8eIrvK+lU3OyfmSTZQjhQb02rHm0DFVPuhUCYiO4mJjYDHEcYCK7TzVjaPefOv57OZhG/nk4V87wbQTaFsbDa2Li1Tqcs0ta+v6lVtvd2ZrVXSik/kUnUdyebHlbz4iL2XOQKu0W+OSUADBxAIAiG9hPPnRz9YV/Eixd5E6kqlYrVyVVJRIRr2kxAFCGIIh5GuuIbwBmJRY7KTZwBkPhMLCYwGMUMw4eEPR+rwzGSFj9MWn7TWwnEqsLaKh7Ty2oHCLqcs6KkyMnQmThuUSILOyI8FTpEMJSGMPABwEAd75DIh4On14R4DOR6enAAIY6P4QGPMABHACI9AcRj83ZjQOAumwD1gK6QCHiEBNkB8Qx8Ssl1mtI1Q5bqHRXb07O10Vkzbp0lUpa5OkoQQ4gYhygYoh0CADFL/fPakbRGVXsvDK5brFvsyl0sulcCXsGbetn6bdoyZVZN2zRqgmHAiLdBJNJIgcCkIUA6IAtFtva6an2UercpHKBjDQSmClWTMI/FydAAYRimVjNGvtotrnunSc4oS4uqe8lZUdP24tJ1Tc+q56+lUzbCICKLtqp3CqeQAd0euMLoAQhCALPLkYgf7XVd8f8A3hJwHV/wGx9f7uImDRD55GIH+11XfH/3hJwHV/wGx9f7uImDcch0Y6/D4sQB+cztqURKZy3KYOAlMsmAgPgEBMAhHjs1nkA7KbCI8AAF0hER8Hx0VHu1/wBo/rutttG9U9EUFqsvPSdJU9cucsJJT0krB6zlcsZpLnBNszbJ9wkkQuAKUOARh/pu2oe0NnmoCzEmm+sK+swlc0uZRrCYMXVbP1Wzxm6nrJFw2XTNwOkskcyahR6SmEIAui+nohHwKUWVcUvTbhdQyqy8hlCyqpxydRRSXtzqHOP7IxziJhMPERHMffgBCEIARVGcrjbuFdrlUJkkFlC/AQth3SaRzlzv1D1lKIfdH+QLXIQyA8M+LozGJt3tCOjm/wBV6lf3p04WquXWqzBpLFamq2mWs1m55ex5wWjMztYd8UG4rK80ToLvmx0wBRkt2TzshD9COf1ZL/cFf25f7iLyrZ+gJdDukkpgEBDTvaIBAQEBAQoaSZAQHiAgPSHhjrnzKTZwAYDF0Y2EAQEBwFDsA4hgQEOPAQEA4+KM7Kdp6SUnIpPTFNStnJKfkEtZyiSyeXpFQYyyWS9um1ZMWiJe5SbtW6SaKKZeBSEKAdEAfYMYpQExjAUocRMYQAADwiI4AI/P2az+e2319L8eMLdpBVVR0RoY1QVZSM5mFPVLILQVjMpLO5WuZtMJbMGspcKN3bRcndJLoqFA6Zy8SmABinl81Z2j4f2Z9/OnPyczDpgCxI5X4om52UL9JsoRwp8Gm1g82gcqp8BP0xEdxMTGwAcRHGAiq97CefOjn6wr+JEvTk4N8rv7QTaEsrDa2bi1Tqcs2rbCv6lUtvd6Zq1XSh5/I5Oo6lE2NLHnxIXsuclKs1W6U1AAwcQifqOyk2cI/wBhhYLgPAPKMw8PSI5znGeHRAEXXkTySqNh9XHPJKJZr+ksAoQ5Mh5GO+gDAGeI9UTkI6Kshpk0/aa2E4lVhLRURaeXVA4RdzpnRUlQk7eZuW5RTRWdkR4KqJEMJSGHiACMd654j08Pu+hAFPRyk/vuuo/0Kb+8lo0PRvh5Sf33XUf6FN/eS0aQqNbouqvpVq5TIs3cVHJEF0VA3iKoqzJsmomcvQYhyGMUwDwEBEIA+GDN2IAINXIgIZAQQVEBAegQHd4gMeewnnzo5+sK/iRdM2N2Wmzsm1lLPTWZaObEvZjM7W2/mD944oliou7evKTlDl05XOPE6y66iiqpx4mOcwj0x2l5lLs3/OYWD9gzD8MAUinYTz50c/WFfxIdhPPnRz9YV/Ei7r8yl2b/AJzCwfsGYfhh5lLs3/OYWD9gzD8MAUinYTz50c/WFfxIdhPPnRz9YV/Ei7r8yl2b/nMLB+wZh+GHmUmzf85hYPj/AMhmH4YApFOwnnzo5+sK/iQ7CefOjn6wr+JF3X5lLs3/ADmFg/YMw/DDzKTZvj/YYWD9gzD8MAUiYs3YAIi1cAABkRFBUAAPCIiXABH54uhdS2y52eEh093qnUn0eWLl01lVsazfS5+1opim5ZvGsierN3KCgDkiqKpCqJnDiBigOYpl6oRSb1NUSCCZUkUJ7N0UUiABSJpJTBwRNMhQ4AUhCgUoBwAAAIA398lv78tp09L9zvcc+i3giof5Lf35bTp6X7ne459FvBACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQBFb5YB3pma+rVar3RIxVVxaqcsA70xNfVqtTw/wAIkfz9eKquALF7kTPyjtXPp6pL2vdxOaiDLyJn5R2rn09Ul7Xu4nNcch0Y6/D4sQBjLXmtDSZa+pX1G3F1FWhoqq5aCYzCnqkreRyqbswVATJi4ZO3Sa6QHABEu8QMh0Rw3zRLQn57awf2yab9/RVhcpUcuSbXXUUUq6xABGmMFIqcpQyycdAFMAcQ8EaGOy3fzy4+vKfjQBeSeaJ6E/PbWD+2TTXv6HmiehPz21g/tk017+ijb7Ld/PLj68p+NDst388uPryn40AXkvmiWhQejVrYMf8A/JNN+/o7Rtbqk05XvmzuQ2gvbbW5U6YNhevZXRtWSmfPmrQo4Fwu3YOFlE0QHgJzFAueuKInst388uPryn40TLeRhuFlNb16wUVVVALROhADqHOAD2SXiAGEQgCzD6YrDuWd98Vs/wDvfJT7dvYs8eOR4egPhisO5Z33xWz/AO98lPt29gCHxF07sQxzsuNIA+G1ck+9yRSxRdPbEPjsudIPR8quSdA5D9bk64A2mzGYsJSxdzKZu0GEvYNlnj146UKi2atW5DKruF1TiBE0kkymOocwgUpSiIjgIxDV2h2hdFRRFbVnYVNVI50lUz3Ipsp01EzCQ5DlF9kpimASmAeICAgMdoapBENN19RARAQtTXIgIdID5Xn/ABDiH8MUVVXu3Xltqj9EuPkinf8Auyn/AAm6/uoAtWOUFahLHartl3fGyemm7FB3zu7U03oNxT9uLYVHLqvrGcIyupmjyYqy6RSddy/dJsmiZ3LkySJgRRIZQ+CgIxWj+Z366vOlX8+1rUvvGNpfJfFVV9shpzSXUOskaSXJ3k1jmVTNikHwhkhxMUcDxARDgPRFuyDNnxDsRtw4Z5lIc+HPcdMAQPOR1ab7+WKr7Vm5vLZ+4VsW87kFIJyhataYmlPpzJRBw4FYjM0wboguZIBATgmJhKAhmJ5seoiCKQiKKKSQiGBEiZSZ8Gd0AzH9hgoZHhnq6QDp6Onp6YAx2uXq80vWaqU9G3Wv5aq3lVps28wPT1XVlJpJNysne+DZ2Zk9cpLggvzanNKbm6fcNuiOBjr8NoloUEQANWthBERAAALk02IiIjgAAOzusYrW+V0OHCe1ynpSLqkL8Ay14gUihyl4q1H1FEAz4eERhG7t12Qh+inH6sl/uyn7cv8AdQBfrSSdSipJRLZ/IJizm8knLJtMpVNZeuRyxmEveIkXaPGjhITJrt3CKhFUVUzCQ5DFMURAYw02k1PTyq9CeqOnKalL+ez6cWdrNjKpRK2yryYTB4vJ3JEWrRsiUyq66pxApEyFExjCAAAjH3NnwIm0M6RzGERMOni0YiIjkREaHkuREesRjMExSmDBigYByAgbAhgeA5AeAh4hCAKNLzPDXT50u/f2tal94xJi5KVpK1OWZ2oUurC7Fh7pW7pYln7mMTVBV1HTiRykr15IlU2rUXr5skiC66mCJJibeOYcFARizEBmzH+tGweigln/ADY/orZukO+kgimYP2SaSZTCHWACUoDx9GAPfkMiHg6fXjo+6+pfT7Yp5LJfeS8lu7ZPpyiq4lLStaolcgXmKCJgIqq0TfuETLppmMBTmIAgURABju7GcZzxyICHDdDwD/BFdFy2FdZK++kgE1VUwGgqtEQIoYoDiZMw6CiGfX8PXxwBOT80S0Jhj+m1sHx6P6JNN9f/AG7x/ngYyboO4VDXRppjWVuqrkVa0pMucCX1DTcxbzWUPOaECqdjPmp1EFdwRADbhx3RHAxQgdmO/npx9fV/Gi4K5NWc59kTpzMc5jmFSpsmOYTCP6MQ6zZEfqwBu9rn5Cqv9LE+9q3UUR2oP5fd7/VeuV7s51F7jXPyFVd46Yn3tU7GKI7UH8vu9/qvXK92c6gDqGEIQB2jayyV3r3zZ3IbP23rK5U6YthevJXRsifz561aAOBcLt2CKyiaIDwFQwAUPDHfPmeGurzpV/Pta1L7x8YRJm5GEkkrrbvYCqaagBaN0IAoQpwAeyS8cGAQiy+7CZ8f0I29HmEuP/8ApwxAENHktFw6F0RaIbmW11fVZIdNtwZ1emZ1HKaNvJMW1CVFMZAtKWiCU4ZyufHaO15eosmdIjlMgpGOQxQNkBiTb5oloU89rYPj0f0Sab4/9+ivX5Zkc7XaKWfTbGM3IOnuUmEiAiiUTeTj0MiRMShnHXxEYiBdlu/npx9eU/GgDentXtJepu+u0E1NXXs1Ye6Vzra1ncabzek65oqjpzUFMVFK3CxjIP5RN5e1WZvmipeKayChyGDiAiEYuaadAGtuUahbKTSaaVr6MJdL7nUW8fPXVuqjRbNWrefMlV3C6p2QFTSSTKY6hzCBSlKIiOAi1i2JTdursvdIKirdFRQ1qZEJ1DpEOYwi2JxMcxRMY3hERHjG1UGbQBAQatgEOgQQSyHoDu8IA+RSaSiNLU0isQyaqVPyZJVM4CU6aicubEOQ5R4lMUwCUwDxAQEBjkEeC5AAz/J63Rw6I8wAhCEAIQhACEIQBg7tKKenlWaEtUlN0zKX89n84s7WTGVSeVtlXkwmDxeUOCItWjZEplV11TmAqaZCiYxhAAARimz8zv11edKv59rWpfeMXlhgKYogYoGKIYEogBgEB4CAgPAQ8Pij0dhM/nRt9YS/EgCs95KVpK1OWY2oLCsLs2Hulbqli2fuWxNUFX0dOZHKSvHciVTathevmyKILOFBAiSe9vHNwKAjFmUAgOcDnEekrZumYDJoIJm8JEkymEOsMgUB9GPcHoYwOOjH1PFAHmEIQBT0cpP77rqP9Cm/vJaNJFC/JtR/pokHtq0jdvyk/vuuo/0Kb+8lo0kUL8m1H+miQe2rSAL3DT58oSyHqQ219xkljm9ZVrSVvKcmVX11UcnpOlpMiLiaz+fPkJbKpcgA4FZ29cnIignnhvHMAZ4ZjhGnz5QlkPUhtr7jJLGtTb5GMTZQauTEMYhgoI+DFESmD9EE6BAQEPWgDL3zRLQp57Wwf2yab9/Q80T0J+e2sH9smmvf0UbfZbv56cfXlPxodlu/nlx9eU/GgC8k80T0J+e2sH9smmvf0PNE9CfntrB/bJpr39FG32W7+eXH15T8aHZbv55cfXlPxoAvJPNEtCfntrB/bJpv39GVVJ1dS9d0/LKsoyfSqp6anTYjyUz2SvEX8rmLVQMkcM3bcx0V0jgICU5DCUQ6Bigx7Ld/PLj68p+NF05sSzGNsvdIJjGMYxrUSEREwiIj+hU+ORyIiPWOYAzW1V/M0X59Seuvc8/iimq75K6n9MM69snMXrOqv5mm/PqT117nn8UU1XfJXU/phnXtk5gDfvyW/vy2nT0v3O9xz6LeCKh7kuAZ2y2nQB+h+53uOfRbwwAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEARW+WAd6Zmvq1Wq90SMVVcWqnLAO9MzX1arVe6JGKquALF7kTPyjtXPp6pL2vdxOaiDLyJn5R2rn09Ul7Xu4nNQBT4cpX77vqL4Y+I0xwzn+snHXGhaN9PKV++76i+GPiNMcM5/rJx1xoWgBCEIARMw5GB83Ber1IXf3yX8+n/AEQz4mYcjA+bgvV6kLv75L+fT/oAsyIrDuWd98Us/wDvfJT7dvYs8YrDuWd98Us/+98lPt29gCHxF07sQxzsuNII/wDNXJPvcniD+CKWKLpzYg9630gepXJP4gkAbB750pNa6s1dKjJGQik5qmg6nkMrTUNuJnfzSUOmbUpzDwKUVlSAY3UGRirkqHkoO1WmE/nkwbUfRBm76cTN4gI1GiAii5errJCIdQimoURDqHIeDNrhCAK0PQJsqNU+w41OURtG9bsnksg07WcazyV1hM6cmJJvNkHVaSxWnpMDdimO+qB5g6SIoIfGkyboiSQHKzNlIAj+m+ucD/ybW6evq4x3DyorvNeoz+/ttPdexioagC6s2eW170kbTSa17J9NU5n00d25aS95URZzLFGAJozI5yNhRMfAHERIbIBnGPHG0vGQEBx08Mfc9eK8jkSfyxdY/pdov75cxYcQBA15QLsFtd+0F2gM01BWAp6mZlQDq19D0sk5ms4TZOxmcjPOBekFE3HcKDxHdN15HEaQyck52raJyKno6h9xMxVDiFSIjgpBAxhwOM4AB4RbDR6HQgDZxnrQVD1+bNAEUezHKRNnNpGtNbjS7dqpquZ3O0+0XTdn6/aMJEq5ZNqvt9KWtMVAg1cFDdWbpTOWuSJKhwOQCmDgMdmdtmbKT6L659ja/wCCKzvaC8NcurkP/eJu57t5z6H8EYfQBbC9tm7KT6L659ja/wCCMz9Cm3e0MbQ696NgtPdQVNMa9Xp6dVKRvNpMoyajLJC1F4+MKxw3QOVIoiUvSYeEU1cSpeR/d9mlnqKXV9z6sAWqIgIiOc4wAejxznxeCIe3KWtjtq/2mF07AVTprkkhmkqt9Ss/lU/POJmRgdN3MHjdZAEin+PKJEzZHqGJhcIAqeO1Ndq3n5DqIx4fLGj+GLDXYwaVLp6Ldn3Z7T3eZmyYXAo086GcNpe5B21ID1wkoiKaxeBt4pBEQDojalCAPhVQxXmlNVDLWoAZzMJJNWLcojgBXdsV0EgEeoBUUKAj1BxirWu3yVbamVddW5tWSikaKUldT3CrOoZadSokSHPL51UkymTM5y57k5mzlMTF6hEQ6otRoQBT/wCpfk320a0pWUrm/d1aXpJnQlvpYM2n7hjPUnLpNqBgIIool4qGyPQHgHq4xoHi5x29/eotXHpCU/jyRTHQBI35N/tINOuzb1MXLudqNmc2llM1Nb9anpYpKGB36x5gosU4FOmQMlJuh0+EYmndtm7KT6Lq59ja/wCCKnqEASF+UebRDT5tI9YNvbxac5lNZnR9O2jl9ITBabsjsXBZu3mbl0oQqR8CZPmlSiBgDpyER6IQgC6g2I3eudIHDH9CmRfeyfGNrEap9iN3rrR/wx/QpkX3snx9eNrEAIxa1k6vLS6GbB1XqOve8fsLdUc5k7ScOpa2M7dkWnb9OXMgTQKAicDOFSgYegA4jGUsR6OVH95p1Gf3/tl7sGMAdQhyszZShkfLdXAiI/Q4uHDq6vz8Mee2zdlL9F1cexxf8WKnuEAWwvbZuyk66urn2OLj/IEO2zdlJ9F1c+xtb8EVPUIAthe2zNlJ9F9c+xtf8EO2zdlJ9F9c+xtf8EVPUIAthe2zdlJ9F1c+vTa/4Bh22bspPourn2Nr/gCKnqEAXKmhTbvaGNode1KwWnyf1NMq9Wp6dVMRvNZMoybeRsiai7fn544Y3yolESlz3QxujDOAz09f5hFVfyP3vsku9RS6nufVi1RgBCEIAp6OUn9911H+hTf3ktGkihfk2o/00SD21aRu35Sf33XUf6FN/eS0aSKF+Taj/TRIPbVpAF7hp8+UJZD1Iba+4ySxrS2+nentXXpCP98pxst0+fKEsh6kNtfcZJY1pbfTvT2rr0hG++U4ApkoQhACEIQAi6j2JXeu9IHqUSH71Tilci6k2JXeu9H/AIrTyH72TH+WAM1dVnzNF+vUmrr3PP4op6u+Sup/TDOvbJzF6xqs+Znv16k1d+51/FFPV3yV1P6YZ17ZOYA378lv78tp09L9zvcc+i3giof5Lf35bTp6X7ne459FvBACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQBFb5YB3pma+rVar3RIxVVxaqcsA70zNfVqtV7okYqq4AsXuRM/KO1c+nqkva93E5qIMvImflHaufT1SXte7ic1AFPhylfvu+ovhj4jTHDOf6ycdcaFo30cpW77tqL6viNMeP+s3EaF4AQhCAETMORgfNwXq9SF398l/Pp/wBEM+JmHIwBANcF6xH6ULv75L4oAsyIrDuWd98Us/8AvfJT7dvYs8emKw7lnffFbP8A73yU+3b2AIfEXTuxDHOy40gD4bVyT73JFLFF09sQ+Oy50g9Hyq5J0DkP1uTrgDa1CEIAj2cqK7zXqM/v7bT3XsYqGot5OVF95r1GBw4z22nXgceW9l0eOKhuAJ4HIk/li6x/S7Rf3y5iw4ivH5En8sXWP6XaL++XMWHEAI/O7/W6/T+oLeh+pm6f5I/RHodY7GcAI4ygt/Fm6uuAKM7aCiI65dXOch/TE3c6en5N5z+f4Iw/jMDaC/Ny6ucdHwxN3PdvOYw/gBEqTkf4/wC2zSwP+ZS6vofI8t1+tEVuJUvI/wDvs0s9RS6vueVgC1ThAM8chjj9UPDCAPHHPix92IbO015U9UGz/wBYVydLzPTIyrtCgglgkqZWqvI877yQQUWHLUEDc3ze5gO6HOYmTxT2cpT77tqO/wChTP3ktAG/Ht26quvRpL/ZuIf+WGPHbt1VdWjSXezYR/8ALBECqEAT4pdyh+dbal632aU0sE0s6x1QH8pK9xm9ReTStNFUAV+zSyzmk+yhDc3eb3y9Ocxz7tJCmPPmTD2Eh+XiLHsE++vaRPVAT+91IudAEB4hAECftJCmPPmTD2Eh+Xh2khTHnzJh7CQ/LxPYhAECftJCmPPmTD2Eh+Xh2khTHnzJh7CQ/LxPYhAFfRMOUkTzZCvF9nPLNPLS67LS0f4Gje4LipBlCtTEkwcwExPLgSODUVtzeFPeHGcZjmdqeWc1Rci5lBUAfSBL5eSs6tkNMmfFrMVBZlnMxbsBcgn2OG+KIL85u5De3cdcRQNtt30TWB6q89++DxhLpY+aTsR6q9C+6FhAF7VJX3kpJ5VNBJzQzKWsH4pZyCYvGqTgSAPXuipu568RghtPNDLXaNaO7h6UHlaqW+b14/pp6eqEmPkidiNPTdGalIDTeLznZAogkI57kBzxjN+jvkRpb0uSP2saxyOAIE/aSFMefMmHsID8vGgvbjbDCVbIWn7LzuXXsc3YG68wnjJRFeRBKAlYShNI4HKbnD87zvOYxwxiLcyIHPLbfkC0bf3+rb+IbQBXmwhCAEIQgDIDStZRLUbqJtBY1ecmp5K59cyKkFJ0RDsk0tLOHqTQXYICIc6KIKb+5kN7GInQdpIUx58yYewgPy8Q19lx3wjSP6t1De3LaLwCAIBs82bTLktDMdpjILiK6mn7E6dowty9lvlWROnccwyRSa+SYGWwaXlU54qO4POCG7kM5jhvbttVec1l/s3MH3AbhG3rlgXenn/q1Ws90CcVWMAXDew82xUy2utAXgrSY2jQtSa19QyiRkZN5wM4CZhNGyrgVxPuE5oUua3cYHOfFG92INfImhALD6ucj03ApIA+xjvq6vz8UTlIAp6OUn9911H+hTf3ktGkihfk2o/00SD21aRu35Sf33XUf6FN/eS0aSKF+Taj/TRIPbVpAF7hp8+UJZD1Iba+4ySxrS2+nentXXpCP98pxst0+fKEsh6kNtfcZJY1pbfTvT+rn0hG++U4ApkoQhACEIQAi6j2JXeu9IHqUSH71Silci6j2JXeu9IHqUSH71SgDNfVX8zTfn1J669zz+KKarvkrqf0wzr2ycxes6q/mab8+pPXXuefxRTVd8ldT+mGde2TmAN+/JcO/LadPS/c73HPot4IqH+S39+W06el+53uOfRbwAGPCPo9MAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAEVvlgHemZr6tVqvdEjFVXFqpywDvTM19Wq1XuiRiqrgCxe5Ez8o7Vz6eqS9r3cTmuOQ4+iHhiCfyKufSOT2Q1akm05lUrOtXVJikWYzFoyMqAS91kUyuVkhOAdYlAQDricT5dqM+i6mPs/KvfcAai9T+wS2bur68dS33vhZ5apbjVYVqWdTgk7ftCuQZkMmhhBFQEybhDiHAOPSMY/dq77IHzv7j2RzT8rG/Xy7UZ9F1MfZ+Ve+4eXajPoupj7Pyr33AGgrtXfZA+d/ceyOaflYdq77IHzv7j2RzT8rG/Xy7UZ9F1MfZ+Ve+4eXajPoupj7Pyr33AGgrtXfZA+d/ceyOaflYzY0R7HrQ1s968nlx9MdslKLqqopMeQzR8eavH/AD8uUMBzIgRwoYpcmAByAZjY75dqM+i6mPs/KvfcPLtRn0XUx9n5V77gDkwdJuHDID18RHp/MIrD+Wd98Us/+98lPt29izK8u9GfRdTH2flXvuKybllc1lc22h9oV5VMmEzQJp+lJDrS943eJFOE7ejuGUbKKEKbH7ETb3igCIPF07sQxzsuNII/81ck+9yeIP4IpYounNiD3rfSB6lck/iCQBtchH8nORIhlFDlTTIUTHOcwEIQpQyJjGMIFKUA4iIiAAHERjjY1rRoCIDVtMgICICAz6VAICHAQEBd5AQHpCAOmNVulazms+ylS6f7806aqbaVYvLHM6kpHKrQzlaTvE37EQXREqhObcpkPwHjjjGnDtXfZBed/ceySZ/lY3/s6opmYuCNJfUUifOlAMKbZnN5e6cHAoZMJEUHB1DAUOJhKUcBxHAR92AIDm2fpmU8nTkFoKp2W6I2PnV/385lVynKxhn3kyyp1NNWWJgWY86CHMHWOOU8Cbe49EaA+2htr/54JD2OSz8nEhvltvyvtG3pgrX73bRXlwBIZ7aG2v8A54JD2OSz8nH8n5UHtfTlMQ2oJASmKYo/pblnQYBAQ/U+sBjQExpuopmgDqWyCdTBsJjEBwxlb52gJy43iAs3QUTExchvF3shkMgGY/Z5Sqy+hKpvsDNfekAfsuJXtSXSrysbkVi98karrqpJxVdRvwIVIHk6nr5eYzFyCZAAiYLOnCqm4UAKXewAYjILQlbGkbz6wNPNrK8YDNKOrm6NK07UUuBQ6IvJXMpmg3doc4QQOTnEjmLvFEBDOQGMT1UlUFFEV01EVkjmTVSVIZNRM5REDEUIcAMQ5RAQMUwAICAgIAMZ47Lzvgukn1baG9uW0AWc/au+yCwGdP6+fFUc08I/+tjV7tbNEtgNgvpYca4dm/Sp7O6hmdZUvbxCrlXi87KWl62mBZXP2PYT8yiA9lszGT5zd3iZyUYmvRFX5YD3pyZerVar3QJwBDI7aG2v/ngkPY5LPycO2htr/wCeCQ9jks/JRHmj6svkU7m5VDyqTzWZkSECqnl8vdvSpmEMgVQzZFUCCIcQAwgIh0QBIEHlQ21/H+yDQ9jcs4+L9SiW5s5NlZo42vmk63uu7XBbxS5eoy7J5kStavSmTqVEmRZOqm3Y4ZMzkQSFJJU5REhQ3s5GKzDylVl9CVTfYGa+9It1eTfz2SU/sltPErn04lUkmbdWpefl03mDSWv0d54gJeeaPFkXCe8Gcb6ZcgHCAOBVVyYTZEyymKjmLSwLgjphIps9bH8sczHcXasHC6Jsc7gd1QhRwPTjEVQ14JDLaWu3dGmJMiLeUU5cWtpDKm4mE4oS2UVNM5exREw8TCk1bpE3h4ju5HiMXslb1pRx6Mq0hKspkxz01PSkKWfSsxjGNK3QFKUoOhExhHgAAAiI8ACKNe/1H1cvfe9a6NLVGsitdu46ySyUkmaiSqSlYzk6aqahGokOmoUQMQ5BEpiiAlEQEBgD4mn2/dydMd3KOvfaKchT9wqEmITSnJsZBNyDN4BRKCgoqgJD8BEMGAQjdn20Ntf/ADwaHsbln5KNArmlKoZIKOnlNz9o2SDKrhzJ5iggmHhUVVbETIHjMYAj4EASGe2htr/54JD2OSz8nDtoba/+eCQ9jks/JRH1l8qmk2UMjK5a/mSpC7x0pezcPFCF/bGI3TUMUvjEADxx9fylVl9CVTfYGa+9IAtl+TPa9dSO0G0Z3HuxqbrEta1pIbwzGlZbMiMUGJUZM3lbVym25puUpDCCqhjbwhnj0xI6ERDoAR/PrHqiHhyOR6ypPZ6XcY1S8a00+Vv9N10mU/XRkztVAZIyAFk28xM2XOkIgIAoUgkEQEAHIRLp8u9GfRdTHHj/AFflXvuANMl8+Tx7MLUXdas7z3SsotO69r2buJ5Uk0LPpigDyYOTCZVYEk1AITeEc4KAAHVGNdz+Ti7LCytua4u9QFjl5XW9tKWndb0lMhn8xVBhUFNy9eayp2KR1RIoCDxskpuGASm3cDwGJJ7Zy2eIpuWjhB03VLvJLtlU10VCj0GTVSMYhyj4SmEI6L1UfM1339Seuvc6/wDDAFVXNuU4bXKQzWZyKW3+QRl0lmD2UsEfK7LDc0ylzlVm1S3hTybm0EUy5HiOMx8/toba/wDngkPY5LPycaCKv+S2qPTFO/bN1Hx2bF7MXBGkvZun7pQDCm2Zt1XTg4FDJhIigQ6hgKACJt0o4AMjwgCQf20Ntf8AzwSHscln5ON42xhqKa8osn93qX2pK/wb5RYBhJpnbRBEoSEZK7qI6qc0UE0u5sV+fKgmGFMgXHCII3lKrL6Eqm+wM196ROf5FmU9I19rAUqspqYTdyGiytj1CAyUjkxF3QnKgaZA2KsJMgJgTEwlzxxAEhjtXfZA5+Z/ceh5Y5pj+Oiv55RHo0sPoT2iU5sTpzpc9IW5a2soSpEZOd2u9Es2nJpwEwX59wJlBBXsRHuciUN3h0jFv15d6M+i6mPs/KvfcVXfKy5ZMqn2s1QTSmpe+qGWGspbNEsxkbRxNmJlkj1BziQO2Ca7cVE94u+QFBMTeDeAMgEARdkSgdZIg9BlCFH0DGAB+4MWpekDk2mylulpY08XIrGxa8wqqurNW6quon4VBMkgeTme0rK5lMnIJlVApOeduVVN0oAUu9gAAAircb0VWXZCH6Uqm/Vkv94Zr+3L/wAUi7t0C1ZSzHRJpPZvalp9m7a6fLSoOWrqcy5u5brpURJSKoroLOSKoqpnAxVE1ClOQ4CUxQEBCANJmpzYLbN7RdYG6+qewlnlqWvHYujJ3ca3VRHnb92Enqmm2aswlT4WyyhklgQcokOKahRKbGBiFl20Ntf/ADwSHscln5KLMfae1TTEy0A6sGEuqKRP3zqy1bJNWTKbsHTpyqeTuQIkg3QcHWWUMIgBU0yGOYRwARSi+UqsvoSqb7AzX3pAEzPZKa19QG3o1Ut9D20hqwt4tPTqjKouItSSTNGSHNVFFMDzSQPezGAJr4aPCFU5sDbp+gwCESg+1eNkFw/pfnA8eP6ZJoHD691eAIhr8kalsxpfarS+Z1Mwe07LQsxdBEZhPWq8oYgqpIFSppC7mCbdAFFDcCE5zeOPAoCMWjvl3oz6LqY+z8q998YAw00M7NzSns66frGmdLlCnoiU11MWk0qNA79y/F48YpHRbKb7g5hIBEzmDBcAOcjGeWeI9PD7voR82XzmTzYiikqmstmZEhAFTy982elTEegFBbKqgQR6gNgY+lAFPRyk/vuuo/0Kb+8lo0kUL8m1H+miQe2rSN2/KT++66j/AEKb+8lo0j0MIFrWkDGEAKFTyERERAAAAmrURERHgAAHERHgAQBe46fPlCWQ9SG2vuMksfl1CWCtrqetFWNj7uyY0/t7XcvGWVHKSrqNheMxMB+bBZIQUT7oAHJRAY+Jp/rSjiWGsmQ9WU0Q5LR23Kch57KymKYtGyUDFMUXQCUxRAQEBABAQEBDMdueXajPoupj7Pyr33AGgrtXfZA+d/ceyOaflYdq77IHzv7j2RzT8rG/Xy7UZ9F1MfZ+Ve+4eXajPoupj7Pyr33AGgrtXfZA+d/ceyOaflYdq77IHzv7j2RzT8rG/Xy7UZ9F1MfZ+Ve+4eXajPoupj7Pyr33AGgrtXfZBAIf0vzgQ6/0yTTh/wDNz9SN4Ni7J0Bp1tTRlmbXSkZHQdByhvI6blRlTrmZy9qQCIoiqoJjnEpSh3RhERjmnl2oz6LqY+z8q99w8u1GfRdTH2flXvuAOp9VnzNF+vUmrr3PP4op6u+Sup/TDOvbJzF5nqprOj1dNd90k6rppRRS1FdFTTJPZWc5zDTz8AKQhXQmMYR4AAAIiPAAijLq0QGqqmEBAQGoJ0ICA5AQGZOcCAhwEB6hgDfxyW/vy2nT0v3O9xz6LeCKh/kt/fltOnpfud7jn0W8EAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAEVvlgHemJqP/PVan3RI/giqri2/wCVDac73an9mjMraWCtxUl0a7UuzbebJ0xSzQHkzPLZbPE13zwETHTDmmyRROobe7kuRxFcH5ixtTPOT3t9jyfvuAMDKBvXdy1jd60tvcesaIazJQiz9CmZ6/lCTxVMBKmo4I0WTKqchRECmMAiADwjsH4cTVR54K7Ps1nfvqMsvMWNqb5ya9vseS99w8xY2pvnJr2+x5L33AGJvw4eqjzwV2fZrO/fUPhw9VHngrs+zWd++oyy8xY2pvnJr2+x5L33DzFjam+cmvb7HkvfcAYm/Dh6qPPBXZ9ms799Q+HD1UeeCuz7NZ376jLLzFjam+cmvb7HkvfcPMWNqb5ya9vseS99wBib8OHqo88Fdn2azv31D4cPVR54K7Ps1nfvqMsvMWNqb5ya9vseS99w8xY2pvnJr2+x5L33AGJvw4eqjzwV2fZrO/fUdS13cq4Fz5ohO7iVjUVazds2KybzKpJo6mzxFoUwnK2TXdqKKERAwiYEyiBQERHGY2GeYsbU3zk17fY8l77h5ixtTfOTXt9jyXvuANXkXTmxB71xpAD/AJq5J/EE/BFVN5ixtTPOT3t9jyfvuLZDZEW3rm0ezs0v27uTTUypCtaXtxKZbP6cnCIITKVvkUSlVbOkgMYCKEEMCG8PHMAZaamXjqX6eL2vmThZo8aWvrVw1ctzikugulIHx0lUlC4MRQhwAxTAOSiGQ4xSU1ZrA1Sp1VUqaeoC7BE06gnJCELWk6ApCFmLkpSlAHWAKUoAAAHAADEXZuqb5m2+vqU1z7nn8UUdX/JbVHpinftm6gCS1yaXUjf2vtrvp7pitbwXCqmnX0muIZ5JZ5VE0mMucmQpN6qiZZq5cHSUFJQoHIJiiJTAAhxi17Aerjw6xDGfGEVDPJd+/Kacf7yXK9yD6LeeAIHfLbflf6NvTBW33u2ivLizN5XFo31O6tqJ0rMtOFma0u66pWd1avUKFIS8r5SVJO0G5Wx3YGVS3CrCUwEHjkQiDr5ixtTM4+Envb6PldTx99QBPL5KRp4sXcjZTSSpK+tLQVYT4967lNTTioabls0mJmrdOQcwgZ06QOqKSW+fcT3hKXeHHTElFzo60rg3XEuny02QRVwPlLkoYHcNgf1r1DEZnYAanrCbMjQFK9MmvS6FL6Yb8srnVtV7q2Fz3gyeqEaZqEkoLJZydmRNwAMpiLF2DZTnMn5hTgGI3ar7afZZqILEJrXsmY50zkKUKhUyJjkEoAAdih0iIBAFQJrzlkvk2tXVZKZSybS6WS6/91mTBgzSKg1ZtG1ZzhJBs3RIBSJIopEKmmmQoFKUoAAAAR2FsvO+C6SfVtob25bRmjqy2VG0Nvbqdv8AXftTpPuxXFs7m3dr+uaCrGRSRNzJqopKp6lmM3kM9la4uCCswmktdt3jVQSl30VSGwGcB2Xs8NkXtJLea29M1b1rpBvBTtKUzdyj5tPZ3MZEmkxlktaTZuq5eOVAcm3EUUymOc2BwUB4DAFvPEVflgPenJl6tVqvdAnEqcOPHOQHo4dHhiOJyofTle7U/s1JhbWwVt6kulXSl2bbzZOmaWaA9mZpdLZ4mu+dgiZRMOZbIgJ1TCbgXjgYAqQ4sD+Rs2StFdSyWqx3ci21G1w6ltc0qjL3NTyJhNlWaSkudGOk3O7RUMkU4gAmKQQyIAIhwiJn5ixtTPOT3t6PoeT+p+uun7njiX5ya+qqd2S1sL/UdtHZq00j1Nc2qpDOaCk13VPIJ7U8rljNdu/eyxNMHHPINllE01TCYoFMYAxxgCZKOjnSrjIafbTeHhRUlHIeD9axVl7f6812LG7UG/Nt7O3Eq+2dAyQlPDKKPouePpBT8tFdmqZbsOWS9ZFqgKpgAynNphvCACOYsgfNqdliHANa9k/ZCpj71/g4RVy7fS8tsL+bTu+9zrO1pJa/oKelp8JRVFPuBdSt+LdoqRbsdYSkE/NmEAN3IYEYAwapHV5qidVZTDVzf26y7ZzUMlbuEFaznR01kFpk2TVSUKZ0IHIomYxDlHIGKIgPAYuYrHaTNMs5spZ+cTaxFrpjNJra638zmUweUfJ13b6YPqTlDp48dLqNjHWcOnKqi66hxEyipzHMIiIjFIlRPyZ0j6Z5B7atIvctPfyg7H+pBbT3FyWANL+3L0v6dqP2XmquoaWsrben55LaFOtL5vKqUlTJ+zW7IIHON3SLcqiR8Z7ohgHxxUDRc47e/vUWrj0hKfx5IpjoAl88j7thbq6Gsy8squNRVN1rLWlqXLlsxqWVNJs1QXBwUAWSRdpqEIoAcAOUAMHhixq+E80qdAafLTD6FFSXj0cA/QvHw8OqK03komqvTxpR1c3bq3UTdek7T03N7YuJZLZvVj0zJm8fmXKINUTlTUEyohx3cBw64sAfNqtlj59iyfDo/TCp9z9C8IAg58rFq6qNMOu+1lFadp/NbLUhMrGyudP6cts+XpSTvJspOHiKkxcsZSdu3VdnSKVMy5yCoJCgURwERavhw9VHngrs+zWd++olg8ozszdDasavre302eNEzvVfaSl7SsKHn9dWnblnchldWNpo5eLyN05OdsJHyTZVNY6e4OCHKORiPh5ixtTfOTXt9jyXvuALXbYzVDPKq2aOk2f1JNn08ncztfJHMwmszcqu3zxc7cgmWcOFjGUVUN0mMcwiI5ERjMPVR8zXff1J668H0PP/AA8Pqxi1sjLc1vaXZ26XreXHpuZUhWtLW3k8sqCnJujzExlT5BuQqrZ0lvG3FSCGDF3hwPWMZTaqPma779PyqK66On5Hn8AUUlX/ACW1R6Yp37Zuo3mcmioyk6/2u+n2mK2p2UVVTr6R3HO8ks9YoTGWuTIUk9VRMs0ckOkoKShQOQTFESmABDjGjOr/AJLKo9MU79snMbneTt3vtRp32qlibqXqriR26t7IpNcBCb1XUbkWspYKzClnjVmRwuBDiUzhwcqSYbo5MIBAFtMGjrSrgMafLTeH5CpL71+5EMPleDNrpWorSm803IJWPdVPOquRqFxbIgUitOkmqLcWycyPKOxjOyICYwpFVEwEEREuMxKIDbU7LEP7NmyYiPSPlgU4+Dh2LENTlcWuHSfq3ozSqy033yoa7rqlZ1Vy1QoUjMTPlJUk7Qbg2O6AySW4VYSiBBDOcDAEQr4cPVR54K7Ps1nfvqLK7kwFtbf6j9l/I7j37o+nrwV6teG4kqVrC4Ura1PUCktYEkYsmJppNE13RmrXnlRRRFQSJiofdAN4YqwIsluTGbSXQ1pk2Y0ltjfrUpbW2FeoXfuHOFqXqibnZzQktmJJGDJ4ZEEFA5lwKCwJm3u65s3DIDAEslxo70rkQWMTT7aYBKiqID5SpJkBBMwlEMteAgIZAQinT1uan9RNHawtTtKUreq5FPU1Tl9boSWQyKUVXNmMrlEoltYzdpL5bL2aDgiLVmzbJJoN0EilTSSIUhQAoAEWvS+2n2WaiKyZNa9kzHOkoQhQqBTJjGIJSh+tesRAIrFtV+yo2h17NTV/bv2r0n3Yre2tzbvXArmg6wkckTcSap6Sqep5lOJBPZWuLkgrMJpLHbZ41UEpROisQ2AziAOodnNqUv8A19ri0w0ZW147h1TSdR3eo6VT6np7VE1mUom8tdzVuk5YzBi5cKIOmy6ZhIqkqQxDlEQMAgMW/wCGjrSt16fLTcB66Kkg58f61+5FUNog2X+vvTvq0sFe69elu6VubU2zuXTFXV5XFRyYjSR0xTcomKLqZTeaOSuFBRZs26Z1VlAIbdIURwMWYobarZZYDOtiyQD4qhU968IA018qUt7Q2mrZoPrh6f6UkNnK6Jdu3ErJVtvJa2pefll0wnaaL5iEzlZG7oGrtLKa6IKbihO5MAgIxW5/DiaqPPBXZ9ms799RYocoN1HWQ2oOg93ps0B3IpvVHfRa5FDVYlbS1rsZzUylOU7NiPZ3NyszkblFpLWpTLuVN/uEwEQAeiIMXmLG1M4f0k97OP8AyeT+7+ioAmw8jXuzcu6dkNVjq5Fd1TXDqW13SyMvcVNOHk3VZoqy50ZRNud4qoZIhzAAmKTACIAIxNTiH3ySXSFqV0k2a1NyfUdZ+sbRzOp61pp5IWVXMCsVpm1bMHKbhdqUqqm+mkcxSnEcYE3CJgnTAFPRyk8BDa66js9ZabH1uwlo0QpqHSUIqkcyaiRyqJqEESnIchgMQ5TBxAxTAAlEOICACES1dvjsvNf1+9p1fi5tntLV06/oKfBIfIiqKfkxHUrf9jtVSLdjrGcEE/NmEAN3IdIRpq8xY2pvnJr2+x5L33AGIzbV1qgZtm7Npfy6rdq0QSbNm6NZzpNJBugmVJFFIhXQFImkmQpCEKAAUpQAAwEe/wCHD1UeeCuz7NZ376jLLzFjam+cmvb7HkvfcPMWNqb5ya9vseS99wBib8OHqo88Fdn2azv31D4cPVR54K7Ps1nfvqMsvMWNqb5ya9vseS99w8xY2pvnJr2+x5L33AGJvw4eqjzwV2fZrO/fUPhw9VHngrs+zWd++oyy8xY2pvnJr2+x5L33DzFjam+cmvb7HkvfcAYm/Dh6qPPBXZ9ms799Q+HD1UeeCuz7NZ376jLLzFjam+cmvb7HkvfcPMWNqb5ya9vseS99wBiI81b6npg0csH1+rqO2TtFRs6auKynKqLhBUokVRVTO6Ep01CCJTlMAgYBEBjHk5zqHOooYx1FDGOc5hETHOYRMYxhHiJjCIiIjxEREY2g+YsbU3zk17fY8l77h5ixtTfOTXt9jyXvuAM1eS39+W06el+53uOfRbwRWGcnY2ZGvXTvtVbFXUvXpfujbm3sjklwUJvVdRycjSUsFZhSzxqzTcLlcKCQzhc5Ukw3e6MOIs8iiHQHV6P8sAeYQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAHjjkOnoyPDgPr+GPIZ45HPH6geCMANpFtDrU7MzTw41H3ip+oqkpFvVFPUoeXUwZuWZi+qJ6Vi0VDskpk+ZTUMBleGd3o4xH7Hll+z6+lBekf/wC5JvyMATA4RD87cv2fX0n70/XJN+Sh25fs+vpP3p+uSb8lAEwOAiAdPWOPXiH525fs+vpP3p+uSb8lH7pXyyDZ/wA1mculaNobzkWmT5owROdSTbhVXjhNumY+Es7pTqAJsdQDAEvWEcaoypmda0hSlZy5NVGX1dTUiqdgiuICsizn0razVqkru9zzpEHZCqbvATgOOEdIau9TdHaO9PdxtRdfS2Zzekrayc05nEvk3NeSTluU4E3GvPAKW+Ij+zAQgDJSEQ/O3L9n19J+9P1yTfkoduX7Pr6T96frkm/JQBMDhEPzty/Z9fSfvT9ck35KHbl+z6+k/en65JvyUATAsdYeDGOqABgAD+DhEP3ty/Z9fSfvT9ck35KHbl+z6+k/en65JvyUASidUvzN19fUprn3PP4oo6v+S2qPTFO/bN1FkPeflf8AoKuFaW5NCyq01420yq+iqkp1gu4UlAt0nc3lTpigosBEt7miKLFMfd47oDiK2uevk5nPJzMkSmKjMJrMXyRT/HFTdu1nBCmxw3gKoADjrAYA3+cl378ppx/vJcr3IPot54qGOS79+U04/wB5Lle5B9FvPAH8mz0hx6hDqEM+DwwzwyPAOHhyHhz6/RH9R4xxAesOHo+jAFUXyurvuk+45/oGWv8AW+KVFw/Pp6euIwTf9cIfuyX+eWLIrbo8nS1Z7SnXRM9Sln6/txTlHvLb0bSKcuqYkyGZg/p882M6VMLU5UuZOD5IE8BnuTZHojTgXka20EQMCxru2XEqIgqYATnWRKmO+IB8U6wCALDTZ78dDOkcf/d3tH0ekeS+GMwf2QdHRxDHHHiH0eqIZtveVKaLNFtD0lpHuHbK6s5rvTZT0oslV81kZ5UEnmFR21Yo0nOHksBZIVgYuX0rWVbAqIqAiYm8OcxkbYXlZmhrUDeO3dmKVtXdyX1FcmqJVScneTFSUixbPpu6TaoKuQTSA4pEOoBj7ogO6A4gCVMGMiGRHjkc9Wf5I8DwN19GOAcOnpHjHkOgOn1wwP1I8wAEMgIeGK5zlsny9tI/pCqz2xZxYxxXOctl+XvpH9IVWe2LSAINUIQgDk9E/JnSPpnkHtq0i9y09/KDsf6kFtPcXJYojaJ+TOkfTPIPbVpF7lp7+UHY/wBSC2nuLksAa19vf3qLVx6QlP48kUx0XOO3v71Fq49ISn8eSKY6AEI2abMbZcXp2pl06ptPZSpaVpmeUpTilSvnVVFdGZqs0zgQU0uxDFPzuRDp4RvM7TS2g303bL/W51+UgDfjyMTA7Ou7/H43UJOMh6MjYxMGHwhnI8A8AeMfwxA/0aaxKA5LXbycaItakonVzLkXNqBa9MnnNqhRJIm1OzJFOUIs3QTQqi/ZxF2hznEggTcMGAyPHL7ty/Z9fSgvT9ck35GAJgQBgPH1+MesY6E1UfM1349Seuvc6/j0aWNRVKasLCW31BUPL5jKqVuZT7SopMwmwpjMW7R4QDppuhSAExVKAhvCUADPVHNb00bMLh2juXQsqWSQmdYURUlNsFnG8LdJ3N5U5ZIKrAXuubIosUx8cd0BxAFDvV/yW1R6Yp37Zuo47ExWe8jg2gUznk5mSN27MkRmE1mL5Ip05zvlSdvFl0ymwrjeAigAOOuMINe/Jp9YOz60zVrqiupcS2U+ouh3ciZzKWU6SZhNV1J/MkpY1FAXJxSApFlimU3g+MAccYAjkwhCAEIRIO2c3J0tWm0p05s9Stn7gW4p2j3tVT6kkpdUxJkMzB9T5WRnSphbHKlzKnZqYJ8M9ybI9EAR92/64Q/dkv8APLF5ls+/mHNJA/8Au72h+5Q0k/DFeQXka+0EQMVc93bMCVEQVMAJzrO6mO+OPinTgo4jeJb7lS+ivRjQ9JaSrhWxurOK60209KLJVfNZIeVhKJjUdtWKFIzh5LAWTFYGLl/Kl1WwKiJwROTfHezAEjjakj/te+rb1Eq4HPVwkzmKQKLLa6XKZ9HW0Ht9Vuiy1duLnyC4epKSPrUUhOKiPLBkkvnlWomlbB1MwbplXFoisuUywJGA4lAcDGkntNLaDfTdsv8AW51+UgDqXkfwZ2skuD/mUun7n1YtUcdYdOMZH+WK67SFs8Lr8mZuwntG9Ys/py49pWUkmtqlKetiVyWpDTu4TcZNKnRRmZjtuxEHCgHcdzviQB3RAY2n9uX7Pr6T96frkm/JQBMCx0DjIgH3fz8MM9HAeOOjjj/QHhiH725fs+vpP3p+uSb8lDty/Z9fSfvT9ck35KAJgeeI9PD7voQiH525fs+vpP3p+uSb8lH0JTyx/QBN5rLZS3tDeci8zfs5eic6km3CqvHCbdMx8JZ3QOoAmx1AMAS84RxujalZ1pSNLVlLk1UZfVtNyOpmKK4hzyLOeytrNGySu7gvOkQdEKpjhvgOOEckgBCEIAQhxz1Yx6+fwRoe2m+380u7LW9dO2OvVQdwqnqSpaNbVsze0qeXgxTlrp2q0TRVB0QygLAoiYRwO7gYA3wwiH525fs+s5+BBeno6Ock2P4npiUFpa1EUpqvsLbfUDREvmMrpa5lPNKjkzCbCmMxbM3iZVE03QpACfOlA2DbgY8EAZAwhCAHHPRwx0+PwYgAAHAIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAit8sA70zNfVqtV7okYqq4tVOWAd6Ymvq1Wp4f4RI/n68VVcAIRKR5P/sMbI7We3t7avutcas6Id2yqKSyeWoUwDYUniMyarLqqOOfKYd8hkwAuOGBHPikPhyLXRqP9kBd3hw+Nl/1Q7jo6Pu+sBWnxyWjPkxpP0yyL20axZGdpa6NfPAXd/xZf4//AFfofd8PD0OuRqaPKTbOKpaX7uyu6ppBaftkFSy/m1nEmTNMUUlMJ55tRRsUh8YHdEcCEAS7dPHygLG+o9bP3FSSNbm3s71Hq49IKn3wSIcM45X1q6sjNppZeSWLtVMJNaKYvbYSl+8M/wCy30soFyrSjB463TbvZLlrKUl193uedOfHDGOZWp5QVf8A2ylfU9s4bxWwoWgrdamXYUVUtWUmLoaglDJUBW7IlwOBFHngMQA7sogIDw4wBB3hFlh2lro1x80Bd3Ph3Zd+TjQ7t6tgPYbZUafaAu3ay5tb1pNqsrdGmXbGpgag1QbKpGUFZLmCFNzgCXHEcQBExhCJc2wY5PtYLaraX65vjdK59dUXO6XuY9oprLqZBoLJZk2l7d2Vwrz5RPzwnWEBwOBKEARGYRZYdpa6NfPAXc/xZf8AiRAZ2gmnGndJOsC+Onik5tMJ5T9sKzmNNyyazTc7PeN2apiEWc82AE5wwBx3QxAGGsIQgCQjyXfvyenIfBJLlCPsQfRbzxRwbPXW1Wuz01TULqmt9T0nqmqKFaT9oxk0+FUJa5JP5WtK1zLCiIKbySSwnTwId0AZiTZ26TrN+kBaL/GmH40AWWcIjBcn623t7drVVF9ZHdi3lHUQha2VyB9K1KXFwJ3p5sqsmqVzz4iG6mCYCXd68+hEn3jnp4Y6PH4cwAj0Ov1s4/cFv4s0QzttxykDUbsy9bcx0y20tRb+rqaZ27pCsCTeohd+SJndRGmhXCBuZMBOaS7BIKfDPdGAR8GoE/LRtZihTkNYC0WDkMQe6mGd0wCA/s/H+eeAEX3aC/Ny6uf3xN3PdvOfEH8AehHNdl53wXST6ttDe3LaMWb13Pml7LvXMu/OmbaXze5lcVNXMyYM89iM31TTd1N3LZtvd1zCKzo5E97juFDMfV093lnOnq9dtL2U+waTSdW0q2UVbLZe/EwM3juTuk3aKDgSd1zSh0wKfHHAjAF8pCK0zt0nWb9IC0Of+lMPx43H7DrlGWonae60mmmu5tq6Bo+nHFAVnVhpvTguxmAO6clh3rZAAWMJOaVOUCqcM4ziAJkkVznLZfl76R/SFVnti0/Px+tFjEAY6xHo+54A6sxox2suwvshtZ6xtnWN17jVlRLy2clmcllqFLg2FF2jMl0l1FHHPlEd8hkgAMD0fcAp1oRZY9pa6NfPAXd/xZf+Th2lro188Bd3/Fl/j/8AV+h93w8AK3WifkzpH0zyD21aRe5ae/lB2P8AUgtp7i5LESaU8jF0cymayyao3+u2orLJgzmCSZiy/dOoycpuUymHm/jTGSApvEI+tMRoimG1E0ZSNGMllHDOkaYkFMNHC2OeXbSCVNJUgsrjhziqTQh1McN4w44QBqf29/eotXHpCU/jyRTHRc47e/vUWrj0hKfx5IpjoAmaci/+bcvZ6kbr75LFmJFKvsqdqldLZUXaq27drKMpmtJtVtMqUy7Y1MK4NUGyigKCslzAgbnAEMBnhG/Tt0nWb0fAAtF/jzHP1d/Pr54+AOoDr/lnffF7Pj1fC9Sj29e58UQ+4sJdNejOj+VVUfMdcuqSfTay9b2wm6tkpZTttATGSvJLLEiTdKYOOzSnU7MOs7MmbdMBNwoYABzGRfaWujXzwF3ej9rLunw/qf3IA347EfhsutIAYxi1Mi8f9bJ8Y2rxXEXN5RfqI2Stc1Fs87TWroGt7faYX6tt6ZqmqBdhPZxLpOIoou5iCBgSBwoBQE+4ABnIB1Y4F26TrN+kBaH/ABph4/7v0Pu+HgBZaRHo5Uf3mnUZ/f8Atl7sGMRYu3SdZv0gLQ/40w8f936H3fDwwk2hvKbdTG0O0sVzpYuDaK3VLUtXT2n3r6cyEXgzNsen5olNECoc6YSYVURKQ+Q+NEceICMtCESN+T97HGz+1qqa+0luvXtWUQjayW0+8lZ6XBuJ3p5souRUHPPlHuUwSDd3fD68ARyItduSK96Jp31cLof5lPRhyHItdGo4H4YC7odPASS/8T8/4JH+zM2e1AbMvTMx0y21qme1fTTGrqgq5Ob1ECQTEzuoQZA4QMCIATmkuwk+b4Z7oc9UAbAnX62cfuC38WaKMvaAfNxauP3xN3vdzO4vNHX62cfuC38WaKMvaAfNxauP3xN3vdzO4A53suO+EaR/Vuob25bReARR/wCy474RpH9W6hvbltF4BAEVXlgXen3/AKtVrPdAl/piqxi1O5YF3p5/6tVrPdAnFVjACEIQAjlVC/JtR/pokHtq0ibVsouS+aZdeuiO1epqu7xXGpqpa7Ga9nSiSAyGXNuwF00k+Z50gn7oD5MAj0hGxR3yNjR9R7VzVrO/V2XDul0FqhaoKll/NLOJMQ0yRSVwQB5tRRsUh8DndEceICXlp8EBsJZHxWhtqHr+UySx27kM46xitdm/K/NXdlJrM7NSWxlqphJ7STB7bKUv3hn/AGW+llBOVaVYPHW6fd7IctZUisvu9zzpz44CGM1tm3yqjVNrM1n2S031lZm2kgpu5lSBJpnNpQL0ZizRFI6nONucMJN/JQDugx09HUBPNgIgHT1jj14AOQAfCGY0MbezaqXT2U9gbe3ZtXRlNVpNqurVOmnbGphWBqg2OkZQVkuYEDCpkMBngEAb5shx49HT68VhXLOu+NWi/e8yb28fR2EPLSNZg4zYC0I4z+ymHX/+78PrRH32qe0+ubtVb6UxfS6dH05Rk9piiGtENpdTIrCyWYtXizwjhTnxE3PCZYSjjAYAOEAaw4uo9iV3rvSB6lEh+9UopXIlc6TOVe6q9Jenq2Gnmk7K2xndP2wptnTcsmk0M+7PeNmSYJkWcgQ27zhgKAm3eHT6MAWn+Qzjrxn1oAIDxCK5WzfLF9YFxbr24oKY2ItO0YVjWlO028dNzPxXbtpxNG7FVVEBOBecTIsJi54bweDhFirInykzksomSpQIrMZXL36hC/GkUdtEXByFz+xKZQQL4ggD6sIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAit8sA70xNR/wCeq1PuiR/BFVXF7fqb0oafNY1uFLR6lbY0/dm3K02l07UpWpUVV5aaaylcHMuemIkqkfnWq4AomO/gDAAiAxruHk9+xz6fhErNj6EtfeH/AK9+YcOiAI/3ImhALHauc8P09UkH/wBPdxOayADgRx1xiPpR0IaTdD8oqWQ6V7KUjZuUVg8bP6jY0o3WbozZ20IZNsu6BZZYTKJEOYpRKIBgeiMtzBnA8eA9ABnMAf1HGK1EAo2rfSxPhx148incVpe3f2x20s0ybSu99nrF6tLm25ttTaUgNJKTkL5olLJeLpqsouKBFGqpw50wAY2TjkQDxRqPkG352vk7n0kk011yXheSybzaXSuYtFpkxFF0wmD1Fq8bKgDEBFNduqokcAEB3TCACHCANWWoXjf2+I+G8Fy/dpOo2RbBbvrekX1QEf4g/wCYeOLKO1+wh2TFxbZ27uDWmim0c/rGu6FpGsqsnr2XPDvJ1U1TyCXzufTZ2YrwpTOZlNHzp4uYpSgKqxxAAAcRihtJ9lvoJ0BaLr36s9IOm2gLG6h7QUyeoLb3Ro5m5b1HSk5KoUhX8sWWcrJEXAoiUBOkcMD0QBKCyAdI4iGZy0DA6IrJ4wP9F1p97KRDQ7YM2xYf2dt5vskw94xvq2Bt6Ln7a3UNcGxm1Cq6aawbU0RQy1YUrRl0zkfymTVKiqCac1aJsyMzldFIYxSmMcQABHuYAg/xZ3cjD73deL98FNvaNjG3AeT4bHXAf0idmuOAx5GvuHHPEQfdAehEQjb438u7sVdU1C6ctl9XM40f2VrK2DG4dS2/taomwkk2rJ3MV2TifuknibtQz1VqgkiYwHAokTL3IDxECyQyHDx8A9eKWDbc99G1geqtPPvg8c/7YN2xfn7by/ZJh7wifvs9NlHs+dc2jqxmqnVZpjt5ea/94qMl9V3KuXVjNy4qCrKhfJlUdTSZrIuUUjuFjmExxImQuR4FCAKnGEXL/a+Gxz84nZr7GvvfsO179jn5xOzX2Nfe/oApoIRZbcoI2POzb0r7L2+F6LAaULaW0udTc3oRCSVfT7J0jNZejNKmaM3xG6irpUgFcNlDpKAJByQRAIrSYAngciT+WLrH9LtF/fLmLDfIZxnj4Iox9KOvfV1oefVRMdK18Kwsy9rNBo2qdxSblBuebosTGO0TdCsgsBgRMYwk3d0eI5zGa/bBm2L8/beb7JMPeMAZ28rq77pPvUMtf4P7bUfg/wBcRfIyA1K6pr+6wLlLXg1I3LqC69yHEol8hWqupVklpkpKZUK4y9iJ0Ukicy1FyvzYATIc4bIjGP8AACEIzE2ftv6PuprQ03W8r+Rs6loyr7r0lI6jkMwKY7Kayp/NEEHbJyUpimMiukYxDgBgEQEeMAYdxKl5H932aWB/zKXV+7T634Inddr37HPzidmvsa+9/Rpn252k3T1sc9FTvVxs1bYU7pN1FNrgUZRCF07ZIqsakSpaq5oSXVDJirOlHSXYk0ZnM3cFFLIkEQKIDxgCZgAgPQPRHkRAOIxTO9sGbYrz9l5eH/tJh7x8UTguSj67NWWuC0OpWf6qL1VdeWb0fWNNy+m31VuEHC0qZvGLlVyg2FFBECkVOQpjZAegMQBLghDjkePoB4IQAhkA6RxHHaudOGNK1K+aKmQdM5BOHTdUmN9Jw3l7hVFUoj0GTUIU5fGARUF3p2+m14p28d2ZBJdcN4ZfJ5Hcyu5PKmCEyYgiylssqiasWDREBYiIJNmqCSKYCIiBCFyOQgCyO294h5lFq4HPAKCU/jyRTHxJ/wBmxtQ9eev/AFpWQ0l6wNSVf3y073fqYtP3ItdWLts5pyq5OZMyhmEzQQbIKnRFQpTYIqQcgHHARPg7Xw2OfAfhE7NdX+9r7If9+6oApoIRcv8Aa9+xz84nZr7GPv4Ozo8dr4bHPPzCVmuPSPka+4f9+/ggDUlyMTvdV3x6/hg5x4P+BGPr/wAkTB4xj0s6N9NWimiJpbfS/aamLP0ROZ0rUUyp6lkFW7F3OlkSIKzBUqyqphXOkmQgiBsboBwDryb4+LGPXz/BiAKV3bbd9F1geqvPf488aqouo7sbEjZa3yuDU11LraO7V1nX9YzFabVLU01YPDzCbzFcRMs6dHI7IUyihhERECgGeOI667Xv2OfnE7N/Y196Pz9+fR0QBTQwi5f7Xv2OfnE7NfY18P8AC+jSpygvY9bNrSrsvL33psDpQtrbO51Nzmg28kq+nmLpGaS5GaVM0ZP00FFXShCg5bKGRUyQREojjHTAFaXE8PkSXywNZH94KJ/j3cQPIzA0oa+NXWh57VEx0q3wrCzL2tEWjep3FJuUG55uixMYzVN0KyC28VETmEu7u9MAXnAiAdPWOPXhFM72wZti+j4ey832SY+8fz9GLF/k1WqW/msDZqSW8GpC5VQXWuQ5u1X8iXqupVk15kpKZWSSiwZCokmkUUm3ZC3Nhu5DnByIwBv8dfrZx+4LfxZooy9oB83Fq4/fE3e93M7i80dfrZx+4LfxZooy9oB83Fq4/fE3e93M7gDney474RpH9W6hvbltF4BFBxb64FYWrrWmriUBPXtM1nSE2aTynJ9LzFI9lU1YqlWaPWxjFMUqqKpSnIIlEAEA4Rtl7YM2xfn7bzfZNj7xgCdvywPvT7/x3ptbj2QJfgiqyiZdsMdV2oPbG61WukfaVXPqLVnp1c2/rKt17W3NWSfU4eqaUlh5hT85FFok0V7LljwpV25udwU4BkBiZgHJ79jnj5hOzQ+PyNfeEf8Ajw+hAFNDCLl/tfDY5+cTs19jX3v2Ha+Gx0yGNCVmvR8jX3Dwf17AHWnJre9E6cf+lUn34hG7mvAzRFYh0/pXn/Af71Ooq6drHtFdaGzP1wXW0f6Gb+1tp103W28iRoi1FCOm7SmqeGZoKLvhYouG7hYnZKpCnU3lTZEoYxiNe9O7ffa9T6oZFI5vrjvC+lU5nEtlUzZLTFiKLthMHqLV42VAGICKa7dZRI4AIDumEAEIA1W6gfl9Xt9V25PuynUbKtgf31/SL6fydWf62U/PPV0xZQWx2EGyXuHbW3tf1lootHPqvrmhqTrCq549lzwzyc1JU0gl86ns2dmK8KUzmYzR66eLmKUoCqscQAAHEYlbSzZd6DNn7orvhq20fabqBsZqIs/TQz+290aOaOG1R0pOAVKmD6WrLuF0iLAQwlydI4YHogCULnAcRAP4MxDG5aFx0U2PEOIfBaQD/uxohr9sG7Yvz9t5vskw94xvu2Bd5Lmba7UFcOyG1Dq6Z6wbWUNRCtX0pRt0zkfymS1GmsCZJq0TZkZnK5KQRKAmOIY6uEAQe4RcuhyfDY6dehKzecZ4S199QB7O6fQiATypTRxpq0Va4raW20v2lpmz9EziycrqOZU9SyCqDF3Ol5u8QUmCpFlVjCudFMhBEDAGCgGOEARmIQi1O2UOxI2Wt8dn5pmupdXR1aus6/rG3Mnm1S1NNmDxSYTaYuG6Z1nTo5HZCmUUMIiYQKAZHogCst0r/NKWH9VihfdEwi9apD5EqX9Lsk9rW0aPLz7DDZR2ntJcm51vdGFp6XrqgKKqOraQqOXS94R/I6ikMrczGUzVmYzwxSuWL1ui4RMYpgBQhREB6Irlp3t+9r9Jp1N5TLNct4mkulc0mEuYNEpix5psyZO1mzVumAsRECIoJkTKGRHdKGRGALk0RAOkerPrZxHmK0rk+e2D2keqnaiWQsvqA1XXLuZbCo5LX7md0hUD1otK5gtKqYePWCi5EmiRxM2dJkWTwcAAxQzkOEWWodHRjxeCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAR4EQDh144B0ZjzHgekOGfW6MfweKAKjXlHloLs1JtZtQk3p211xJ9KXKNNdjzOS0VUs1ly+6zX3uYesZY4bK7o/HARU270DGk+jrCX0JV1KnPZe7BCEqORmOc1uawKUpSzNqJjGMMnAClKACIiIgAAAiI4i9Sf0PRs1cqPZnStPTB4rjnHT2UMXLhTd6N9ZZA6hsdWTDH4vgcW+IIGLRFLAYOJTFkMsyUQwICAg2AQEBABDHWEAcY0/IrN7DWSbuElEF0LRW2RXQWIZJZFZKjZKRRJVM4FOmomcpiHIcoGIYBKYAEBCNbG3r71Hq49IKn3wSNwCSZEkyJJkBNNIpU0yFKBSEIQAKUpChwKQpQApQAAAAAADgEaf9vX3qPVx6QVPvgkAUxcTMORgfNwXq9SF398l/Pp/wBEM+JmHIwPm4L1epC7++S/n0/6ALMiK0bli9srk1ntCLRzGj7e1xVcvRsFKm6z6mqTn09ZpOAnTwwoKOpWwdIJrAUQEUjHA4AORLiLLgcBkegcYz049b0Y47NaRpefOCOp3T0km7hNMEiLzGWM3ixSFHeAhVF0VDlIA8QKBsAPVAFEJ8AK+v0lbtfa4rH+ZouU9ivKppJNmPpJlc6lr+UTNna+SpO5dM2bhg+aqlbkAybho7SRcIqB1kVTIYB6QjYqNtrfBjFD0oOOryBlgY/7t4vuj4RjlrNkzlzZJmwaoM2iBQIi2bJEQQSIHQVNJMCkIUOoCgABAH6YQhAEezlRfea9RvV/s7bX3XsoqGot5eVFd5r1Gf39tp7r2MVDUAIQhAHPaetVdCrpeE3pS29e1PKjKqIFmdPUfUM6l5l0sc6iD2Wy5y2FVPeLziYK75N4N4AyEfdGwd9QARGy12gAOIiNuaxwAeEf9hos8uSTUZSU72SsjezimZFNHhr4XOT7Lfypk7cCmROnhKQVl0FD7pBEd0u9goDw6RiTe4ttb0Gzj9JFK8EVR/qDLM5Ag4/rbqwGOH8sAUJjtm7l7pwxftXDJ60WUbO2btBVs6auETiRVBw3WKRZBZI5TEUSVIU5DgJTFAQEIzi2Zb9jK9fOlGYTN60lzBpeiiV3T5+5RaM2yKc4bGOs4cuDpoopEKAidRQ5SFABERAI4hr+QRa639WjZukmg3Q1DXaSQRRICaSSRK2nJSJkTKBSkKQoAUpSgBSgAAAAARiU3cOGi6Tlquq2cIHKoiugodJZJQo5KdNQglOQxR4gYogIQBfLhf6xI9F6rS/bHo7+eYi78rfunbCr9lXMpTSdx6DqiajeS1ywSynavp6dzAUUqgSMqsDOWzFy5FJIvdKKAnuELxMIBFY98Ei4PD9O9V8Oj/Z+ae+fFHzppWFVztsLOcVJPZq0E5VBazCavXjcTkEBIfmV1lE94ogAlHdyA8QwMAccixi5Ez8onVz6fqS9rXcVzsWMXImflE6ufT9SXta7gCcsIgHEY66nV4LS03MFpRUV0bdSCatt3siWTqtqalcwQ3gyXnmT6ZoOUt4OJd9IuQ4hmOxRz1Djj9UPBFQpykOtqylW1t1FMZZVVQy9miSm+aaspu/bN095msI7iKK5Ey5HAjgoZEMwBa11pfixy9H1Wijea1Cyy1NztJJJK4lIKKKqKS1yRNNNMk4ExznMIFIQoCYxhAAAREAik3vvY69cwvheWYMLP3SfMX11riPGT1nb+rHLR40c1dOF27pq5RlB0XDdwiciyCyJzpKpHKomYxDAI9UUZcWvlKwpRM9aVScilSyIhyGnszMUxDTRoUxTFFyICUxeAgIYEOmLw+wNvqDdWJss5cUbTC7hxaW27hwutI5cossstR0mUUVVUO3E6iihxE5zmETHMIiYRERgCpT2H1srkUFtPtKtV1zb6uKLpeUV0m4mtSVZSc+p2QSxAEDhz0xnE4YM5cyRyOBVcuUiAPDe6ht4vg+2J+nVaX7Y9HfzzGrDbq0jS1N7LTVfOafpySSWasqEUUZzOVSxowmDVTnyd22dNkklkT4DG8mcpunjxink+CPcH6N6r+z808X/ABrxBAF8dTVy7c1m6VY0fX9E1W9QTFZZnTVVSKeukUg4Cqq3lb90qmmA8BOcgF8cc2itZ5GrVdUT3WteptOahnU2QJaVyomjMpk8eIkODggbxSOFlCFNgOAgGeEWUoAPHI5/0eLqEeuAPMIQgBCEIARoA5TlT0/qjY96hZNTMjnFRTdzPrbGbyqRSx7N5kuVKrmR1TIsZeg4dKgmQBOcSJGAhQExsAGY3/x+CZSyXThqowmrBpMmSu6ZRq+bJOmxzENvEE6KxTpnEpsGLvFHA8QgChw+AFfb6St2vtcVj/M0cUqe3tfUSRspWdD1fSJHgmKzPU9NTqQkdmJ8eVsaasmgLiTIbwJCcS544i+TC2tvQx+kilOAY/qBLPF/xbxBEFPlq9MU5IKD0dmkcilEnMvPq0BY0tl7VkZYCt226Cgt0kxOAdQGzjiMAV9MWu3JFe9E076uF0P8ynoqiYtduSK96Jp31cLof5lPQBJ7cgItnAAGRFBUAAOkR5s3CKR3XrY69cw1sar3zCz90nrJ3qDu04aPGlv6sctXTdatpydJdu4RlB0lkVSGA6aqZzEOUQMUwgIDF3QOfFjjnP5/Vjhy9vKEdLLOHNG0wu4XUOqqurJJcoqqoobfOoooduYx1DmyYxhERERERHIjAFEn8AK+30lbtfa4rH+ZofACvt9JW7X2uKx/maL2f4GtvcY8pFK+j5AyzPV/xXxBD4GtvcY8pFK+j5AyzPV/xXxBAFZDySC1lzqP2qkvm1W25ryl5UWzN0EBmdRUhUMkl4LLSFUqSIvJlLmzcFVTdymmKm8ceBQEeEWigdAcADxBgf4I45KqNpOROQeSampHKngEMn2VL5WyaOObOGDk55BFM+6YOBi72BDgIRyMOjox4sYgDh1TXFt9RSzdvWVd0bSS7shlGqFTVPJJCs5TIODHbpzV80OsQoiAGMmUxQEcCIRxf4PtiR6L1Wl+2PR388xAO5abU1SU/ffSYlI59OJQkvQFVnWJLZi7YkVOWZtN0yhW6qYHMUBwAmyIBEIb4I9wPo3qv7PzTxD89eEM/wCsYA3ucoat9X1ydqpqCq23dEVfX1KTIKe8jqnoump1VNPP+bZrAp2FOpGyfS11zY8D8w5U3R4GwMab6LsRfBvWNJrr2ausigjUkjVWWVt3V6aSSSczanUUUUPJwKRMhQExzmEClKAmMIAAjFrxycymKcqrZOaeJ1U0ilFQTh0aouyZpOZe1mUwcbjxACc88dpKrq7oCIF31BwAiAcI3Q1xbmgEqLq1ROiqWTOnTE+MRQkilpTJmLK3IkMUQbZAwGABAQEBAQzAHV1iL42Ul9j7NMH94LWsXzK1NvGb1k8uBSbZ20dtqRk6Llq6bLTcizdw3WIdJdBUhFUlSGTUKUxRANdu3Iubbevdl9qppShbg0RWlUzehzN5TTVJ1XIajn8zX7IIPMS+Tyd+8mL1bHHm2zZU+OO7FStfu4Ndtr6XobtqyqdBu3uzcZBBFKeTJNJFFKsJwmkkkmVyBE00yEKQhCgBSFKBSgABGxrYU1ZVFR7U3SfJqgqGdTuUPq7Ik8lk1mbx+wdJi3P3Dho6WVQVJwAd06Zg4QBqy+AFfb6St2vtcVj/ADNEu3khEnm9mdY15Z1eCWTK1EmfWrXaMptcli6oaVvHYuSiDZq/qhKVtXDkQ4ggkqdTHHdwEWPfwNre/QRSnD/2DLPF/wAW8QfnmIePLF2DKhNGllZhRLRvST5xdZBBd5TiRJM6WR7GOPNKLy8G6h088RIYwlEerjAEur4Ptifp1Wl+2PR388xW88rxkE9vLtAbVVHaCSza61PNLCyiXO57baXPK5kzWYEnT1Q7FxNKYRmjFF4QhinM2UXKsUhgMJAAQGIjYXHuAHRW9V/Z+aeL/jXiCLLPkd8tl9d7PW7U0rVi1q2ZIX/m7ZF/UaCU5eJNgkjE4IJuZgVwsREDiJgTKcCAIiIBxGAK3L4AV9fpK3a+1xWP8zRcG7HC6dsaJ2bGlGl6yuPQdJVLKLYSNpNqdqar6ekM9lbpNsmVRtMZRNZi0mDFwQQEDouW6ShR4CUI2ufA2t79BFKfYGWe9opsNs3WFVyDaZatpRI6knsnlTG6k9QZS6WzR6yYtUSuT7qTdq3XTRSTLgAAqZClDGADhAFttqdvbZia6db3yyV3dthMZi/tdWrRiwYV9Sjx68dLyF6mg2atW82UXcOFlDFIkiimdRQ5gKQpjCARSm1VYa+S1T1GqlZm66qSs+nCiSqdu6vOmomeYODEUTOWTiU5DlEDFMURKYogICICAxzPS7X9cPNR1jWjusKmdNXN1KIQcN153MVUVkVagYEUSVSO4Eh0zl7k5DAJRLkBAQzF3vSVuLfnpWmVD0VSpznp+THMc0hlgmMY0taiImEW2TCI8REeIjnPSMAVW/JjbR3WpfbCaepzU1sbhU7KG0huUVxNZ7RdSSmWoGUpB6RIqz6YSxu1SFQ4gQgHVKJjCAFyOItno4vLqJo6UPE38qpan5a9SKYEnjGUsWrlMDhunKRZFAihQMURA2DBkBEBzmOTgGPHxyI+EYA8whCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAMYNWusTT7ohtWrefUnXTW3tukZzK5ApUDxs6dIkms5cA1lzbm2iKyu8usIEAwEwAiGRjWAHKT9jwH9llT32Fn+R9H/Y6MOeV/wCPMmZr4fg1Wp+p5YkfwxVVwBcN9sobHjz2VPfYWf8A83Q7ZQ2PHnsqe+ws/wD5uinkhAFw32yhsePPZU99hZ//ADdH6GnKRNj/ADB40YtdV9PqOnrlBo2TLJp8AqLuVSIokyMuwAnUOUoCPAM8Yp3I5LRfyY0n6ZZF7aNYAvvKfnktqeRSWpZM5K8k1QyiWzyUuylEpXMtmzNF+xcFAwAYCrtXCSoAYAMAGwIAOQjUlt6+9R6uPSCp98EjZHp5+UDY31HrZ+4uSRrc29fepNXHpBU/jyQBTFxMw5GB83Ber1IXf3yX8+n/AEQz4mYcjA+bgvV6kLv75LAFmOPHIZwIh9z0I1r6wdrdoM0HXAlNrtT17pVbetJ5IUqmlkney+Zu1HMmWXO3TdgoyarpgUyyZybpjAYBDojZTFYdyzoc7RSz3DH9L5Kh48B/q28/1+vAExTtlDY8eeyp77Cz/wDm6HbKGx489lT32Fn/APN0U8kIAuGx5Shsdw6dWVOh6Mln/wDN8O2UNjuPRqyp0f8A4LP/AOb4p5IQBaAbVvaO6Q9rxonuXoW0D3Vl98dTV0X9LzGibcypm/lz2ctKUnKE7niqTqaN2rMgMpa3VcHBRYomKUQIAm4RDY7Wz2w/nTKh+zcg/nCOccl347ZTTj1f7CXK9yD6LeeAKQHWZsyNZ+gJhSEz1UWgmVsmVdOHjWmVnz6XvAmK7ApTuiEBk4XEgpFOUR393OeEYCxYactt+V/o29MFbfe7aK8uALCzk4O2V2emifZxSiyepC/Mpt9cdtdivqhWp55LZq6WJKZuSSgwd860aLJbrgWq2A394NziHRG+tXlJmx7WSUST1Y08J1UzpkDyFn/ExyiUoB/seHEREACKeiPc3/XCH7sl/nlgCR1qL2Ee091L36vFqFs1pundXWnvXcmsbn24qhtNpMg3qCi62nr2oKcnCKLh6muklMJU/auSEVTIoUqgAcoGAQDpjtbPbD+dMqH7NyD+cItW9nt8wzpH/e72j4+H9I8l6sBiMxIAp4O1s9sP50yofs3IP5wjGLVlsdtoLohtYrefUpYibW7t2lOZXIDz97MpU6SCazhwDaXtuaZu1ld5dYQIBtzdAR4iARdeRFY5YD3pyZerVar3Qp/UgCquixi5Ez8onVz6fqS9rXcVzsWMXImflE6ufT9SXta7gCctFaptydh/tKdVm0fvbeyxmnedVpbeqSyIJJULaaSdui8Fo1VTXAiTl4ksXmzGKHdEDOeGYsq4ccjx9APBAFPrIuTk7XiQTuTz2a6U6gayuSTWXzeZOTTqQmK3YS12i8eLmAr8TCCTdFRQQABEQLgAzE/q3PKGdk7bK31CW3rPVFIJRWFvqMpeiKrlKknniikrqSlJGxkM9lyiibA6ZzspowdNjGIYSGMkIlMICAxvnrn5Cqv9LE+9q3UUR2oP5fd7/VeuV7s51AFkjtfNu9sw9R+zy1HWbtDqQklV3CrWkDy2m6fbyqcorzF4ZYhgSIo4ZJpF7nI5MYPR6YrEIQgCTpyYHXdph0Haqbp3A1QXIZW3pWf24cSWVTJ60eO03UyOuUxW5SM0FzlMJQEcmKBfCMTph5SdseMYHVlTwj05CSz8B8XRL+A+j68U8sIAvQtHuuHTXrwt9NroaYbhs7kUVI58rTMynDJq8apt5yggRwqzMR4igoJypKEMJgKJePARjLaIfHIxMeZ1Xf8AD8MHOPB0eQjH1/5ImDwAhCEAIQhACIjXKodnRq51/Uhpllule1cwua8oWb1S5qdJi8YtBlqMwSQI0OcXq6IH50xTAAEERDHGJcseBx0Zx6+BgCnh7Wz2w/nTKh4f+2pD4QDqf8OnrxFhnycPSNfvRRs4ZNZPUfQ7q31yGt1q9qFen3jhs6WJKpwSTdgOudaKqoiVcWy2CgfeDcHIBkM76y4xgByAcIBnrx63+mAPMIQgDgVzrk0haCgqquZX03TkVGUXJXs/qSbqpnUTl8qlyJl3bo5UinUMCSRTGECFERxwDMaXg5SfseA/ssqfH0ZLPx//AI6M49qV3vbVv6iVce0zqKQKALhvtlDY8eeyp77Cz/8Am6PA8pP2PAhj4bGnvsLP/wCbwinlhAErzlTW0J0n6/Lv6cqk0sXQYXMlFFUbUUsqR0xZvmhZe8ev2yrZE5XrdAxhUTIYwCUBDAdXXFDhCALhTk1veidOP/SqT78QjeHVzNzMaVqWXsyCq7fSCcNGyYYyo4cy9wiimGeACdQ5S5HgGcjGjzk1veidOP8A0qk+/EI3yQBUT3j5Odtdalu7dSo5NpUqB3KJ/ciuJ3KnZZ1ISldS2a1PNH7FwUpn4GKVZqukqAGABADYEAGMitntsldeGzg1d2c1l6wLJTS0+niydRFqS5FfTCYyx60p6TlSMkLtZswdOHSpQUMUu6kkY3HgEWp0adNvp3p/Vz6Qj/fKcAdWhyk/Y8YD+myp4eH/AALPx/8A46NI22+vnbPbxWMoSwezAqJHUjdO31YJ1pVVMyRJaVLyynE0hSO/UVnKbJE5AOIBukOJuvHTFc7EzfkX3zbN7wz/APpI4HGP+Ml45gDVD2tnth+rSZUPrzuQh/5/8/qxKm2IupG0Gwh001npd2ntVt9N97K3uQ9udTdHTtFxNXMxox8wQlzacEXkyb1sVJR23WSAh1CqAJBES44xN46eoQznI9Ah4P8AR4IrCuWc98atEH/u8yb28fQBMZHlJ+x4x81lT3g4SWf59H+p/wB2IOOujY77QXX3qsvPq60sWIm1zLB3vq+YVnbWuWMylbNpUVOzJUyrN+i3fOkHSRFSGAQKqkQ4Z4gERcouo9iV3rzSB6lEg+9U/wAEAVu9peT97Veztz7f3WuDpjnshoa3NXyCs6unas4kiqUqp2nZk3mc2fqJovjqnI1ZNlljFTKY5gIIFAR4RPtkvKPNkLJJPKZLMtVlPt5jKJYwlcwQNJp8JkHrBqk0dIiJZeJRFJdJQgiAiAiXgIhG3HVZ8zRfnr/oTV1w/wAHn/giinq75K6n9MM69snMAXO2mfbabODV9d+n7E2A1ByaubnVQ3mTmSU21lk3bLvEZS0O+fnKs6ZoolBBqmdQQMcBEA4ZHhG2GKh/kt/fltOnpfud7jn0W74dGOsOnI5H14A8whCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAIrfLAO9MTX1arU8P8Ikfz9eKquLVTlgHemZr6tVqvdEjFVXAG/3Y57Be4G18oy6lY0bf6j7OoWunUrkztlUtKTmolZqeaIKrkWbqyx61IgVIEhKYqgGEREBAY3SdpC328/Laj7WFW/zxGXvImh/oHaufHXVJ+17uJzUAV0/aQt9vPy2o+1hVv88/ngfFn2JcimvjSKidVra3LWPEaYOSoVmads6rTUdJSUwTJRsmoecCQh1yNjJFOYBKUxt4QEAwNipHGK1EAo2rfSxPh9byLdwBB6acsnsvYpo1si/0XXOnz6zjZC1b2eNLj0s0aTl3b1MtIuZq1arSo6rZvMVpQd4igqcyiKSxUzmMcoiOGm0L5WjaLWvpCvLpnkmkS41ETO6NOmkjWp5pcCmpmwlShlCn59wyaS1FwuQADAlTUKbwDEN7ULxv7fEfDeC5fu0nUdPwAjd5sO9rJSOyUv1XV4qvtHUd3mVX0YtSyMmpyoJbT7pmqqqCgO1XEzbOUlEwAMCmQoG689UaQ4QBYq9u92M69DF1uv8A/U+kfW/3o6Pux0bcnRXPeVpTltrvtBW0r0iyC1TMtjXlBXHlrq4E3mz+WnGcHnraa00tLGaDRQjwqINVUTLFMmJhOICARAcizu5GIIBs7rw+PUHNg9fyDYwBqx7SFvt5+W1H2sKt/nn88D4s+e0hb7efltR9rCrf54ixXgAgPEIArpw5ELfbr1y2oDj9LGrejw/1Yjz2kLfbz8tqPtYVb/PH549DNivCAIZGyd5LZdfZya27Z6sKm1VW/uTKKBYVQzcUjJKFqGTTGYGqCTLytM6MwfTJw2RBsZbnVAOkYTlKJS4EQGJmwAPX0j9QPQ/ljyIgHT1jj14QBHy272xarja/05ZKR0beylrOKWnmM9fO3FS01NaiJNizdNJMibckrdtTNxR5vJhUEwGzwiNoHIhb7deuW1H2sKt/nj88D4s2LAiAdPWOPXhkMiHg6fXgCks2qmzmqXZc6qX2l2q7kSS6k2ZUXTVZGqqn5M/kUvUQqMz8qTIrGYruHIKtuwDc4qKm4fnA3QDA51wN/wBcIfuyX+eWJPvK6u+6T7H0jLX/AMZUURgm/wCuEP3ZL/PLAF5ds9vmGNI373e0fuHksZiRh3s9vmGNI373e0fuHksZiQAiKxywHvTkz9Wm1XuiSiVPEVjlgPenJl6tVquvp/TCn1fn0QBVXRYxciZ+UTq59P1Je1ruK52LGLkTI/0CdXIf8vqSH/6a7gCctCGQyAeHo9aEAcWrn5Cqv9LE+9q3UUR2oP5fd7/VeuV7s51F7jXIh5S6uDw0xPsetK3UUR2oP5fd7/VeuV7s51AHUMIQgBCEIAs8ORid7su/++CnHtIxiYREPfkYne67v/vgpx7SMYmEQAjgtzq1b23t3W1wXTFWZtqKpedVMvLkFSorPUpMwWfqNUljgYiSi5UBTIocpikMYDGAQAY50AgOcdQ49eOhNU/zNl9/Uorr3PP4AhyzXltdjpTNJlKz6HbqrGlsweMDKludSYFUMzcqNxUKUZQIlKcUxMUo5EAHA8en8PbvdjPOMXW+2fSX80fngfFmvMq/5Lao9MU79s3UcdgCxU7d7sb5xi632z6S/miN3Gxv26tBbX+eXcklHWEq2zilp2Mmeu16lqmTVESblnB1Spptyyxm1FuKIpCJhVE4GzwAMRT5xPD5Elj4IGsj+8FE48Xxd1/qgCw0DoDIAHiDojzCEAIQhAGAu1J73vq29ROuPaZzFIDF39tSe976tvUTrj2mcxSAwBs12UOzXqjaoaom+mSkrmSK1E0Xo6pqvCqKhkr+fMCo02xM+VZixlzhs4FRyUu4RTnN0gjkxRDhEmvtIW+w/wBnLajx5thV33P9mPu9HAYwG5H9w2sku9RS6nufVi1R6YApptsXsca12QtcWromsrz0xeFe6Ehmk8aPqbpuaU6lKk5Y5SbnQcJTN26OudUVQMUyZigABxCNMETkeWyfL80j+p9VntmziDdAE03ZecqotRs/NGlstLlRaT7g3DmtAjNBcVVJq8p2US+YeSC6apeZYvZau4R5sCCBt9Q2erHRGwjt3uxnnGLrfbPpL+aPzwPizXVQgCxV7d7sZ5xm632z6S+r/Uj6v3MxxqreUSW422dPzDZmUPpxrWx1UaokhomVXPqqsZHU0ipVcwg47OmEklLFo/fI4IJebbuEzZ4iIBFefG4fYH99f0i+n9Px/wBbqfn4umAJDIciFvsP9nLajxf0MKt6Or/fj88ehHZFtdKs35JPNHOry79WS7V5Jrwthtgyo63DBxb6ZSZ2uIOAmrqY1KrNGzluQCiUUEkiKCPEDYiwQ9GIYvLQvmKbH+q0h97GgDpXt3uxvnGLrfbPpH+aI6PuTomnvK0Zy317WgriVaRaftazJYp5b+40sd3AnE1mEqMM5PPm82ppeWM0Gaqb0qJWqiBlinTMcTiBgCIDcWenIxO9zXf/AHw049omMAaq+0hb7Y+bltT6HwMKtz7cRkrS/KU7Z7IORS7Zy1lplrm8VS6WG5LZTa5NNVrIadkdVupKANlJnLpNM2Dt+wbriTfKg5XUUKA4EwjE8OKVnbZd9C1geqxP/vlSAJe7/lhtmtSrJ3p8lmjW5dMzG9TdW2TKon1xqXes5I6rMgyJCaOmjeVpruUGSj0q6qCJyKKETMQhgEQGMWVORRXyqk56mR1vWraJVEc09TaqWzqtRRsnNzeSBG51CzcCnOiVyCZzlAAMYgmAAAQCIbWlT5paw/qsUL7oWEXrFIfIlS/pdkntY1gCHZsmuS33X2cOt22erGptVFAXKlFBS2qmTikZHQtQyaYzA1RSRxKkjozB/MnDZEGx1gVUA6RhOUogUQHAxM0AOkfDjh4PX648wgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAit8sA70zNfVqtV7okYqq4tVOWAd6Zmvq1Wq90SMVVcAbc9m9toNW+y7pmvaV04+UwJZcWaMJtP/LPJgma3ZMuSURQ7HOJy82TcUNvBgcjGzLtvfamiHEbRexIMY9Dnf5YitQgC6w2Nura6Gt/QJaLUXeLyJ8vtZqzos28hGnYUuwxcJJo8w3yO53Jzb3EcjGzuZMUZpL38rcgbseYsnTFxujg3Mu0FG6oFHqNuKGwPUPGNDPJqHTVLZE6diKOUCHBepxEp1kyGDLxv0lMYB8XR1Rvp7OZfPjX/KEvx4AjA1bySnZhVlVVS1fNRuyE0qqoJzUkzBGqzER7PnkxczN5zJNzuEuyHSvNl47pcB1Rrc2pHJltnlpI0L371BWvG5nl5t1Sp5vIfJapRdy/ssqhSALhuJA5wmBEd3PTjAxOqAQEAEBAQHiAgOQEPCAh0xp+29JTH2UurcpCmOYaBUwUpRMYfi5OgpQER9YIApiYkQcnV2Z2nrab6lbj2r1DjUwU3S9Ar1HLhpmZDLXXZ6axSFBVUAHeT3c9zEejsJ586OfrCv4kTKeRjkM01vXpUdFM2INonZQO4AUSCPZJeAGUApRHo4Zz4oAkO9qDbLPjxu8HHh+m0w8OHH4z0fz6dLO0U1aXO5Mtd2n9GezxGU/AnuRSbe8FQfBLa+WScjVUxcqStcWzwwk5tn2O1T3UcDg+RzxixF7OZfPjX/KEvx4rGuWaEO72iVn1GpTOUw0+ykonblFYgGCdvOAmTAxQHxZz4oA6c7b42pvhtH7Ei/lIsatmrqCrnVNok0/36uT5H+Xa49Dy2fz/AMi0OxWHZzpIp1OxkMjzaeR4FyMUfHYTz50c/WFfxIuldiIQ5NlzpBKcpiGC1ckASmKJTAPME4CAgAh64QBtahHgRAAEREAAOIiI4AA8IiPRH5uzmXz41/yhL8eANU22z1jXX0G7PG72peyoycLhUVM6NaSjydZ9nS3mp5P20tec82yG+PY6pubHPcmwMQD+299qb4bRgPDP6Ui8fF+qf6omccqHdNldjbqMIk5QUOM8trgpFkzGHFXsuIAUwjw68BwioigC0m5NttktWO1Gq3ULJtR/lOFpbWUU49p4KXk4Ss/OzRZYjnsk28bnAwQu4HDHHwxLQHe4BnpzkcdHg8XiivE5EusijcTWMKyySQDTtF4FRQhM/olz0bwhn1osM+zmXz41/wAoS/HgDRvr55Ptob2i9/HWou/Q3A8vjumJJSioU5Pxl0u8jJCLszIQbgUfi2XqwqH/AGXc8OHHConJCdlomchg+C8JimKYBGrTAACUwCH7Dj0BwiU72cy+fGv+UJfjw7OZfPjX/KEvx4A4Rae21P2dtlQVqaU7J8rNuqSkFGSHsxTnnXkTTssbSph2QrgOcW7Gap84fHdHyPXHTetq7lUWG0oX5vFRXYnlrt3bepaokPZyXPs/JKVS5Z027IR4c4lziZd8me6DIRlIUxTABiiBiiGQMUQEBAegQEOAh4wjAnailMbZ9atClATGGylcABSgIiIjJXWAAA4iPiCAK6Ttvjam+G0fsSL+UjOHZ/6/r48o9vyhs9dfXkB8Ap9Tc9uesNuWAU7UIVHQDQ05ke6/ATCDXstMoOEsfFCCIRCB7CefOjn6wr+JEqLkgTdwltZZYZVBZMvwFLq90okchcjT6vDeMUAz4swBKkHkguy04YG7vjzVpvufE427bN3ZUaa9l3TFfUlpxGqvIu4s0YTefDVE08k1uy5eiog37HMIBzZNxQ28HWOPBGzOPSo4QREAWXRSEeIAooQgiHhADGDPrQB7c9PSOA6cdPoRX4bY7lIWv/RFr7u9p0s8a3IUDRRZKMoCd04V7Mcvmyiq3PuROG/3RQx4OMWA3ZzL58a/5Ql+PFQBykZg9mW161Dpy5m6fqOfKum3IzQVcmXUMzWKUiIIkOKhzGEAApMiI8MQBmHLeVtbUCqZiwpiZDabyOqJ61kUw5qlAIr2HN105e65s3OdyfmHCm4PUbA9USfqT5KZs0rxUtTV3arNdXy03Tp+TXHqXsOqDItPJ+uJc2qacdio7nxJt5IzRzzCee4S3C9UQ+dmpyc3XhrOmtI3KqOlj2Gs2nMZXOvLncNsrLn00YtXLd6AyeSrgm6W7IRAp26yqZUVSGyU0WrtFT2Q28oah6DSfnnStG0fTNLGeNkwKm7PT0lZSnsnpwUHAtOdEoCIE38dWYrGLl+ym/p2/XsgRyO1Bdln1mu97LTB/wCAY8dqD7LHj3V3fZcP3e4iSFMLnuSAbsRgUocdwVB3hHgHEQ9EfHHE07q1Go7KiDdmUhhEBMZHiAAGekRHq4+Hh08QGOTpzjFyaSS+a/2z/P5BctL3I9Pag2yzHiBru49NpvX/AGPrx4Hkg2yzAM713R/wtN+JEiVS7b9iP6Lbtly9IgmAl8Q9A/UH6sfTlt75A4MVN63XamEwBvEDfJ4OIiICACOOofq9PRGrBvGe/bKx7cZ+Z2ujNemfo+39ZIEO0U1b3R5Mvd2n9F+zxNKBtJcekkLxz/4JbTyyzry1zJ0rKl+xngiQU2XYzRPdRxwPkc8Y1+Byvfamh12j6RHhSYB0+LnBiS9t+9g/cLarXBp/Uxp+uxIWlwKJtyjRza20+RBBnO27F24fgshMyjziLxcyoIppHKCe8ICYQAcxXX6q9DmqPRXXbq3uou0VV0BOkVlk2jt9LXKklmyaBilM4lM3SSMyeo92QRMkqO6JwKPGOaafZp/Tk62mnhpp+z4Zcv7Ni/8AXGqTRNp/v1cjyP8ALrcihZXUFQeRaHYzDs50iU6nY6GR5tMBEcFzw6I7r1UfM1339Seuvc6/8MYSbEgpi7LvSCUxTEMW1MiASmAQMA9jJ5yA4EPXCM29U4COmy+4AAiI2oroAAAyIj5XX/AAwORH0BipQopKv+S2qPTFO/bN1G0HYm6OLUa89odaLTReryZC3taSus3c38gXnYEz52RU+6mTLmXODbheyEi84GO6LkI1j1ezdjVlUCDVzgainYh8QV/4Sc/3Eb8OS7NnKe2T06HUbrkKEhuZkx0lClD9J77pExQAPqwBM07UF2Wfhu6H+Fphz/8A6BjrjV5tJqVl3JcZVbyrtnCKozXUs6mUouCN0DeWdIGtLlIrLfIwhtzsY++ufnRyO+GA6on2RA95bSisrQWjfmklFcT6ts82mY+PiDbp3QHHrwBpu7b32p3DurR9Wf0pF4+H/dOGY8jyvjam9Q2iD/BIPykRYuwnnzo5+sK/iR6TpnTNuqEOmYOIlOUSGwPQODAA8fQgCVMlyvXamKKpEN8CMSnUIUweVIOgxgAf908A/wCmLM7SjceoLw6ZrCXVqvsYKluJaOgKzn3YaXMtfJao6Yls1mHY6X+5o9lOlebJ+xJgvVFEc3/XCH7sl/nli8y2ffzDmkj97vaL3DST+WAO7L3Whpa/dp69s5W3ZflUuJTczpefdgK8w88jZq2O1c9jrcebV5tQ24fA4HjEartQXZZ/tru+y034kSqDGKUBMYwFKHETGEAAA8IiOACPzdnMvnxr/lCX48AaQtn9sA9EezfvujqEsENfDXKNNzyly+WOejMZeEun7QzN7lAShlXmjDzZs9ybjG8cM8cjnj9QPBH5ezmXz41/yhL8eHZzL58a/wCUJfjwBqQ2kWxb0k7USqaBq7Ud5cwmlu5U/k8i8q858jEgaTBZNdx2QUCjzpxOmUSj+xDIdcaz+1Btln4buhjHHy2mHPjxucIlSJrorZ5lZJXHTzahD49HdEcevHtgClI2xWku2GiPXxd/TpZ/yW8oVFBJ/Ijybdi9mP6NbKKrc+4EA3+6KG7w4BGtmmZehNqkp+VORMDaZTuVMHAkHB+YePkG6u6PUbm1Dbo9Q4GN5vKTGrk+1z1HGI3XOUQpvBioqGKP6CW6BAogMaSqFZuwrajxFq5AAqiQCIigrgA8lWvEe5gCzetRySnZhVja22tXTUbshNKpoCjajmYI1WYqPkhPKdl0zec0Xc7hPsh0puF4gUuA6o651UbCvRlsi7E19tB9Lo10N89OkrGrqC8t08GbU95KlOCIeSMvEpeyEdw49xvBxwOYljafXrMLC2SKZ22KYtorbFMBl0gEBCjZKAgICYBAQHgPjjWrt73LdfZRauEkV0VlDUEcCppKkUOYeyU+BSEMJhH0AGAIH3bfG1N8No/YkX8pGxLZ06krgcptuTUul/aIDL/gc2skJriU2Fsm3lamnk6icECC6dAJ+db7hjZSwGR454RBQ7CefOjn6wr+JEy/kYxTtNa97jugM1Ia0jgoHcFFEgj2SUcAZTdKJvF09cASF+1BtlnwDN3uPX5bDYD0e4/MY3T7OvZv2C2ZVoagstp5GoxpGpKtcVlMPLNMRmT3yWctUminNrCAbqPNJFwTqHIxnx2cy+fGv+UJfjx7k1klgEySqapQHAmTOU5QHwZKIhnxZgD2RSs7bLvoWsD1WJ/98qRdTRSs7bLvoWsD1WJ/98qQBrWoer5pQFZUvXEj5nyYpKfSuoZX2QTnEOzpS7SetueJw30+dRLvl6wyEScZfyuvakS1gyl6A2k5hg0bMkN6kw3uZaokQT3h5wcm3Ey5HrGIsoAIjgAyI8AAOkR8Efp7DefOrn6wr+JAFgHsSuUYa9deu0PtHpnvX8Dv4HtaSmtHk28gaeBhM+ekVPOpky5lyBx3A7ISLvhjui5CJ9gZ45HPH6geCKibkuTZyntlNOp1G65ChT9zsmOkoUofpOfdImKAB9WLdmAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgCK3ywDvTE19Wq1PD/AAiR/P14qq4tmOVZWjufejZezOj7TUFVNxaqPd+2T8tP0hJ3k8mxmbSfoqOnRWTFJVcUG6YCdVQCbpChkwgEVmfmdmuzp+FJv5x6P6GtS+8YAwzhGZnmdmuzzpN/PtbVL7xh5nZrs86Tfz7W1S+8YA/LbTaB617N0hLaAtZqbu9QdFycVRldM03VjyXShiK4gZYWzRLuExUMUBPjpEAzHb1I7U/aLOKrpluvrIvyqgvUMlRXSPXEwMRVFWZNiKJnAeAkOQRKYOsBEB4DHVfmdmuzzpN/PtbVL7xj7tLbPfXGxqenHrzShfhs0Zz6UOnTla3FRpot2zeYN1V11lDMgKRJJIhlFDmECkIUTCIAAjAF11YmYPZvZCzk1mblZ7Mpnaq3sxmDxwcVF3b57SMocu3S5x4nWcOFVFVTjxMc5jDxGOR1/b6irpUnN6FuJTEnrGjp+3FpOacnzQr6VTNuI5FF41P3CqY9O6PXGC1lNfeiimrNWkp2f6prHSeeyC2VBSSdyiYXCp5s/lc3lVKyljMpc+bKvCqN3jF4gs2coKFKdJZI6ZgAxRAO9KO1w6PrhVHLKPobUrZqrKpnK3Y8pkEhruRTGazFcQyCTRk2dnWXUwAjukKIwB1IGyo2cYBj4TOwg/4DS8P4IjN8pvt3Q2zp0s2vuVoYpaT6WK+qS4zeQT6rbNtCUjO5tJVEDnPLHr1l8UWaGOAGFI3ciIAMTZoiPcrssjd++Ojiz0gs9basrlzphdNq9eyujJC/nz5q0BucouV27BFZRNEBHAnMUCgPXAFfP5qptGw6NZt+w/w5mETsOTKWtt5tFdGdyLt65qOkWqa5lP3imNJyWt7yMSVdUMrppvKmjpGSs5g9+KIsEnCqipG4dyChzG6RiA55nZrtH+xIv7x6P6GtS+8Yn4clquHQ2h/RJc62usGrJDprr+dXomVRyijryzFtQdQzGQLSloglOGcrnp2jpeXqLJnSI6ImKRlCGKBsgIQBI78yo2cXnMrCewZhGatD0LR1tKWk9EUDTkqpKkafaJsZJT0kakZyuWM0gAqbZm2J3CSRAAAKUvAIxd80W0Ij0at7Bj//AJJpv37DzRXQj57ewf2yab9+wB3JqQmkwkdgLzTiUvXEumkrtpWT+Xv2pxScs3jWRPVm7lBQOJFUVSFOmcOJTFAQ6Ipjqq2p+0XQqeo0EdZN+U0UJ9OEUUyVxMAImknMHJE0yB1FIUAKUA4AAAEWz+pXaC6H5vp9vVK5ZqssU/mMwtjWbRiya3Fp1Zy7dLyF6miggkR6J1FVVDFImQoCYxhAoAIjFLFVaqa1UVIsicqiSs/nCqShBAxFE1Ji5OQ5DBwMUxRAxRDgICAhAGT10dfmtG9lGTK3l2tS927g0POFGys0pep6qeTKTvlGSxXDU7lor3ChkFylVTEfjTgAxiFHNbfW4r269UsaItpR9Q11V8zI4Ul9N0vLHU4nL0jVIy7k7ZgzTVXVKgiUyiglIIEIAiPCMl/M7NdnnSb+fa1qX3j44A6rsjqg1DabHM5d2FvBXVp3NRJoIzxeip24kyk0SbCYzcjwyHFUqImMJAHoERjIfzVTaN+fMv37OZhGNd2NN1/LEoytxeaz9wrYoTs6ycnWramJpT6cyUQABWIzPMG6JVzJAICcqYiJQEBEMR0pAGf/AJqptG/PmX79nMwj2obVPaNCuiA6zL9CAqpgIDXMwwOTlDA+IeuOhraaQ9UN5aaJWVqLB3VuHSijxxL06hpGjZzO5Qd803BctSvmTVVAV0AVTFVMD7xN8u8AbwR2Mhs7ddZVkTG0lX8ApVUxMYbbVLgAAwCIiPYPAAABEfFxgC580MVDO6s0baXqmqWaO53UE/sRa+bzqcTBYV30zmkwo+Uunr52sbulXDlwodZVQ3E5ziIxkXVNK05W9PTek6ukzCoabnzFeWzmSzRArmXzJg6IKbho7QN3KqCyYiRQhuBiiIDGrTRXrg0f230jaa6Ar3UpZukK2o2yVtaaqulqgruRSyeU9UEmpKVMJrJ5vLnLsjhlMZc9QWau2q5CKoLpHTOUDFEIy1p/Xpotqydy2m6a1Q2Rns/nLtFjKpPLLg0+7mEweODgmg1aNUXhlV11TiBU00yiYxhwAQB1p5lTs4vOZWE9g7CO1LP6GdIOn+riV5ZTTra22VZJsXctJUtI001lU2IxfJii8aA5R7vmHCQiRUnQcvAYytAQHo/PMIA8AA54jnHRjhnPhDxdUQKeV8au9Tmm29Gl6V2GvjcS1Eun9FVO7nTOiqgcydCZuW79qRFd2RDgqokUxikMI9yBsdfCev0RXscsUtlW95tW+hq19tqemVVVvXFPTynqckMparO3z+ZTKdMGzdJNBEpz7oHPvKH3d0iZTHMIAXMBlPs8kZSwWtPa76nbo0xZyyepnUnXNe1a/QYS2USmr5quJOeUKQzx8qQpk2bFuBuccOlxKmmQBHIjwiyh0Y7Py1thtOVoprrStlbHUDrTYNEp7WNz6kkjao6lLO1RI4ZNJhPpiVQz1SSh8TBUUhIY4nKQvDI9LbG3ZK2q2UNkZQ9qeWyep9WVwpUymVxKuXbt3S1J9lNyLeVeSuDEOZshLzKGRWOkYorrEOYREuI2wz+YM3y6jhZXnlVTCcyhzbwmERzxHweLh04COirV6eI90+XjOPZJY55f7vXJ306Wfil24wvf5v5f+fC7/Fm9d1HNTIIfEWEsQTKgylEvIVnL2aBAAiSCDdEpCFTSJghSgUpQKAAAAAR7ZbP5iiOObJkAzjhnPDp4ZDh+Dwx81ZQqbVZRoiRZYC/EwMAY3shgQ4dPDHVw4xxquKyktEU0pV9QzFhJ2Mmly7uYnXWTSIcUU9/cETiAZHAhjj6EdUbqVPh/E85b9vZLJeRtFVSaWMcey7LGPyS78+/odnGnMwXTOvzyJEicDiJwACD/AHQ/seHH6nX0eE1na3MnM7QIRcQKmpzhQA5h6ij056eAYEYh7axNutc9jcJ1T9hGMulcikb9Vk6mwiE0TnHNHMUVhZgAlKAiGOvw5jpWzm3s1CU1WCL26pZVVchcOEStmxEglnYJlFCEIcEMAHcmEAHh0DkcRyd45Lp6e/Hp649ef6/QfcnBdffGGuUuOO3fv3T+f5k3Z2zVRMYHJ98SDg4AIjxHoAQHjx/Yh1h09cfCOiiKxhIQ5dwRKYBDGDAICIeIQDHTxx4gCOoLH3MPey11C3QddiIpVxK0ppzLeZFEElTpAoCYgBsAIcMAOBGO00HiZwUKkBkhFQedAyoqCZToE28PRkADozx6cR0/1/X/AEOByBjOjStQF2zhRusTiUyagk6wwI4HiHAOnP1MR/Nayuw2oGWNKN1JWooS6cgSWTO0PVtPMJyDNcpyimcRcJGXSIBg3j8yoQoiAGOUwAAh8BWX86QTmUDAgJunqHoD1vEI/wAkfDO0RTHuBAeOOAiPj/0cPR68RyjKUeza+Xo/qjjKCmuUnx39Vz/XCNglu6QoagaOkdJ24kcmpqiZMyRZ0/JJA3I1lEvYkLhJuybp9wiiQuAAgYAuMdUcnm0ql88lj+TTdm3mErmjRdhMWLtMFWzxm6TMi4brpjwOkqmYxDkHgYoiAxhbbm6DuknaEtmB1XMkXUKQ4CIm7E3hABUT6igXORL0CHj4xlXUtx6FomnG9WVhVkjpqm3LliyQnU6mCDCXmdzNYjdg17JXMVMF3ThQiKKYm3jqGKQOIgEXcJqaz2a4a/TP5di0nBwfPKfZrt/0MOVdlfs53Cyq6+jWwyqyyh1llT0OwEyqqphOooYesxzmExh8IjHPrW6AtFtkq0ltxLSaZ7SW+riTpukpXVNMUs0ls4YpvUTN3abd2l3aZXCBjJKgHAxBEoxl4kqmukmsicqiSyZFUlCCBiKJqFA5DlMHASmKIGKIcBAQGOGXCuTQNpqXfVtcysKeoSkJYdBOYVJVEzbSeTMjulQRbkcv3iiaCRl1TFTSA5wE5xApciMczgc1DPWID4B6B9eOhr36XNPGpNCStb92eoW7DenVF1ZGjWskQnCcrUcgAODsyr8ETLAAAcS/HAAZjqvzRXQj57ewf2yab9+x3DafUnYG+y01b2ZvDb25y8jIipOEaKqaWVApLU3AiCB3hJeusKBVRAQTFQAAwgOM4GAMaR2VGzkyP9JnYPHDH6RmA4x4ujw/cis55UTZO01gtqLPaBsvb6mbaUWlZ23UzTpqkpalKpQSYPTz0HbsrVHuAXcAklzp+k24GeiLckBAc46hx68ViXKnNIWqK8m1Pn1ZWpsFdW4VKK2atwwTqGkqNnM7lB3rU8+Fy1K+ZNVUBXQBVMVUwOJiAcm8AbwQBD6b/rhD92S/zyxeZbPv5hzSR+93tF7hpJ/LFMwhs7ddYLoCOkm/gACyQiPwNal4Bvl4/rGLnrQrJZvTmjLS1IJ9LnkonUmsJauWzWVTBBRs+l0wZUXJ27tm7bKgVRBw3XTOkskoUpyKFMUwAIQBxLaP1VUdEaGNT9WUjOX9PVLIbQVjMpNOpWuZtMJa/bSlwo3dtFy90kuicoHIcOJTAAhFPB5qptG/PmX79nMwi3/2pPe99W3qJ1x7TOYpAYAz/wDNVNo358y/fs5mEPNVNo358y/fs5mEYAQgCzV5IRqXv/qSsrqiml+LuVvdaYSCt6YaSV5Wk5XnLiWtnEvdKLoNTr8Uk1DlKYxS9IgGYmRDkADHEeAdHD0Rx0BEGzkTXyhtXPqgUlj7GO+j14nKQBh1crZ86Jrx1fM6/unpitBXdaTjmvJSpqjpRpMJu/BEolR7Jdq92pzZREC56AHhHUdWbLbZ2yylqkmbDR1Ylm/l8gm71k7QolgRdq6ay9w4buEThxKqismRRMwcSnKAhGyGOMVsko4o6rG6CZ1V16aniSKSZRMdRRWWOk00yFDiY5zmApShxERAAgClzvDtNdoDSl27pUvTerm+Elp2m7jVvIJDJpfWj9BhKZLJ6mmculcsZIF7lFowYtkGrZIvBNFIhA4FjN/ZGa0dV2qbaDadLE6ir/XMvJZyv6vJKq1txXlSOp5SlSy0UTnFnN5W4yi6Q3igYSHwGQznhGvq+mz51wzK9t45gw0o33eMX11LhPWTtvbio1G7po6q2brtnCCpWIlURXRORVNQoiU5DFMAiAhGc2xz0rakdPO0Y01XfvnY+5lprW0ZWRJjVdf17SM2pylKeYAgcou5vOZk2QZMUN4QLzq6pCgIhxzAFniGyp2cWPmMrCDnr8ozAM+OIy3Kcbe0Rs6NL1q7j6F6Yk+livKmuIjIZ/Vdm2hKRnU3kxkDHNLXrxl8UWaCcAMKQ9zkAiU75oroS69W9g89eLk03j1v0bEWvlTVa0jri0qWloXR7Ucn1LVlIbkJTidUxZl8hXk7lcqKgYppg9l8hO7cN2gGECiuoQCAPDMAQaPNVNo358y/fs5mEWK3JLNQN69RWgm6dXXzubV906nl99ZrKGU8rKbLTeYtpanJmapGSLhfuiNyqGMcEw4AYRHrit28zs12+dIv7x6P6GtS9f8A2GJ+vJariULof0P3MtnrAq2Q6a7gzq9czqSU0beWZNqEqKYyBaUNG6U4ZyuenaOl5eoumdIjoiYpGUIYoGyAwBM3ilZ22XfQtYHqsT/75Ui3Y80W0I+e3sH4flk030eH9exVX7VvSRqevrtAtTN17NWFunc22laXGnE4pKuqKo6cz+l6jlThwc6Ewk84l7ZZm+aKlEBTWQUOQwcQHAgMAak9NUqls91B2Wk04ZN5lKppc2jGExYOyAq2eM3U9ZIuGy6ZuB0lUjmIcg8DFEQ64ua6V2VuznXpinF1tGthVFl5DKFllTUOwE6iqsvbnOc49ZjGMJjD1iIj1xUr6dtB+s+kb8WfqiqNMF7ZDTlPXGpGcTydzW31QM5bKZVL50zcvpg/drMyotmjVumdZdZQxSJpkMcwgACMW71M7QzQyypun2bvVjYdu6aSSVNnLda49OEVQcIMG6SyKpDPQEiiShDEOUQASmKIDxCAOV2t0BaLbI1nLriWk00Wkt7XEoTdJSyqaYpVpLZyxSeombuyN3aXdplcIGMkqAfHEESjwGMvQDGejpzw/P8Ag4RjRb3WbpPuzVLGiLZ6h7R13WEzTcKy+mqXraSzicvU2iQrOTtmDN0o4VKgiUyiokIIEIAmHABGTEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAHrUTIoGFClOXhkpylOUcDn40wCGfHHrBm0D+tm4+iinn/ADY/RCAPz9iNPnZv9ZT/ABYdiNPnZv8AWU/xY/RCAPz9iNPnZv8AWU/xY4xWzVqFG1aINm4YpifYHmUwEB8i3eMDu/U68xpP1c8oj2fGiy+lV6e7zVDVjK4FHFZmm7eXSRV20ID5MyqHNrlAQNkpBz4IxNqXlYOysmlOz+WtqsrkXEwkk1YoFGm1gAyztiugiAiJeAc4oXIwBV+6g3LgL93vAHCwAF3rlAAAqoAAAVnOgAAADYAADoCNkWwYcLn2rWkYplljlG4CICUypxAfiB+kBMICHoxq6u3UUvq661zqslBjnlVT3CrSopYdQu6oaXzqpJlMmRjl/YnM2cpCYvUYRDqjMjZXaiLe6U9eGn+/V03DtrQlvqsTm8/XYomcOk2hUjFEySJeJzbwhwCALu6PWqkkqAAqQhwzwA5AOAD1CACA4iMYHKztlMAfJbXQ4/5Nrhw8HRkfu+OM/dn/ALa/RhtJbiVFbDTlOqjmdTUzIj1BM0pvKlGCJZeQwEMZNQ4ABj7w43Q49cAbcQaNc4Fs26AEPiCefGI9zjpisY5ZqY7baI2fIgcUSDp9lIiRERSKJvJt73QlTEpc4HGcZizw6IhJ8o82IetfaR6vre3i05yKnJlSNO2kYUjMFpvNk2K5Zs3mbl0oQiZuJic0qUQP0ZyEAVvXZTn54X+vKfjQ7Kc/PC/15T8aJNnamW1b+hGhvZIj+GI+2oiw1d6ZLyV3Yy5bdq1ri3k6cyGoUGSwOGyb9qcSKlSWLwUKAhwMEAdOC5ciAgLhcQHgICqpgQ8A91HohCAJB3JeiEPtktORTlKcoyO5WSmKBgH9KD7qEBAR8HDpi3i7EafOzf6yn+LFL7sP9XVpdDe0Xs7qOvc8fsLdUbLKzazhzLGxnbwis6p51LmQJoFyJgM4VKBh/YhxiwU7bP2U30WV17G1/wAEAareW1IopW/0b82ikmI1BWuRIQpBHDdtwHdAM9MV58WCG1RqmV8ppk9sqR2axj1NN9OTyaze4hKyKMgTbNKlImjLRaGVAOfMY6J98C53ccY0xdqZbVv6EKG9kiP4YAl9ckWQQU2RsiMoikof4OV0AEx0yGEQ5unscTFEfzCJPjlo1Bs4HsZv+oK/7in/AGs39zEKDZwbQmwHJ8dODPZ86/ZhNqev9Kqrn10XUvpViedSoKYrkrIkkVK9SASiuoaTu+dT6Sbpc9IRnmvyszZTKIrECrK6ydJQgfpbX6TEEA/Y+EYArSNoG4cF1x6tylXWIUuoi7hSlKqcClAK3nIAUoAYAAADoAOAdUc12XrlwbaCaSgMusIDe2hwEBVOICHky24CAmwMdE6tLiU9dzU9qAuhSaiytMXBu/cCsKfVcEFNdST1BU0ymcvOsmIAJFDNnKYnJ+xNkI5JoguvStjdWlgbuVuquhSdv7mUxU0/WapCs4TlkrmKLl0dJIOJzgkmYSlDpHAQBenAGPwj0j6MeeiIxPbZ+yl+iyuvY2v+LGaGhPbw6Gdode9GwOnye1PMa8Xp6dVMRvNpOqybDLZC1F2/NzxgAN8qICJC/shCAN0uQwHgHh6OYwXvNphs/MdSdD6yq3lbWoLhWloOc0bbBm+RSVQkU2n7xBV1PmhVCmDyQBqmdskqIbzbnBWTEpwAYznHPEegAAccenx/g6wGMGL6VwWaVMpJEXJAZyMoc8AmwUXZwDfMYRwGUwEC56eMdFxVVKGW0nLiOfyz7+nyOUIOUsRXPfCWc8pdv6+fqzr2YTJ1NHjuYPlzLO3aplVFBETCImMI4AOgCl6ClDgUAEA4cI+coI9yIqbwF6QEekBEOjpEOHi9Dpj4Scw5wgKJqpqENgAOU4CUR4dA9AD0fV4R/C77dEpDKFKYwgUCiYAMYejBc8TceoA6+iLDrj0r411cPl/ReiWc59vX5nd5dwv86xjjjCXw8+79s845OTIzpJAgiZmKwI92ZMph3zgHDJADGeOeHXjxRoU2218lWdv6LspI1ppTc6uRNk0VZo2WUKAMlFSEUQKG8UpjHKYQEoj4fEEbp3s0BiJXBiKuHCBgM3ZojlVwoI4BMScBEMDxDxD62tfaV6M59qftC6qemZBMgr224p1VQ65Ujc67co7rh2yyHdCRPBi44hw6uiMTealQt805PqqJZ6k/Tj6/nj8u2DJabRu5XEOuDlRbWVh/Jvtxz2wl/MjIyXTJb+lWMzmrxo5fTEG5V1HTtcTETVFMpjq7hjCBxMbJxz15DoCMY6wp6kKoK/pym/Ig86UUKmCh2iPOpGTUAd4iuMlEgBvBjpEodWRjJqprfXhUqt5KprURpZShUiNnKaqgkWIqkkVN6mYREBESOCql8WBxgcxjxLqToWl6unJ2c1UerNRMdy5BQwiCgmABwOes+Q9fpxGIpas3VinN4k0u/C/Zbz6cd/fPrjJOK2mUZUM07Zp9Hxeq7R7PvhYzjvzjsiUnsQbtzqpbATq19RT1OY1PbqpRaMSvkylKnI0gSBNwkUR/Uzd0UOGB6Q6Rjdm/mDlWZPTlXb7oL7pRbJlSTEAIUeAF4dIdIdPRgAiOxskJZMk6jrGqiyReWU3OaUlsoRepAYpXMxRXE6iwiGAE5yiG8bpHhx6436FeiURSBPmgb4THJsicAKAgob0c8ciPR60SahXpy5dXj54/0+jS78ev7yAX1KtRrqnCEopyXDWcrjHp75X8TmQTNyUg7y44Ao8Ax4OPiDr4CH8Ee1o4TXMAGXMUBzkcCI/g4cPXjhoOjCUpjb3NCOBMHQIj17w8Bx14/BH6U5i1RHIHAcj1GAOPVw8fg48OrMVneUUl0z6s8cNcNY745T/LD9Pc7K1pWjGlLEoOaTl2xJ/Cs4ff1z/DvjnLjm0gLzS2/vBkwmIABkA6ujiAD1R2JTbOh7uUxMrJ3ZkzGp6Pn526zVnMAAxUXzNym7ambKCAmQcIuESLNVk91RJUoCQQzmOhlZuVQgCmYBxko5NgPq5AB/DnPUMfia1A6l75q9aHMVdoumumZMRAwCmYDBgQDPVxHrARx48hZVqUk+vhuL59uVhv6v6rl8ls7arLKbclj5cfsvu0vpj+Zt2ZtkmLRoxbk3W7Rsg1QKAiO4i3TKikXI8R3UyFAREc9YxH15UYc6exr1FnTOYhgn9s8GIYSm41gx/ZAICHrDxje7b2qUKupOVTtMwb7huQrggCAiRwQoFUAQAREByHQPo9caH+VHCA7GnUZj/h+2XuwY9XSHrxd5Tw12fYsWmnhp59fkVE3ZTn54X+vKfjRO/5EsqqpcDWOCqqigBIaJEN85jYHn3XRvCOIgcxKa5NDtU9LezKqzUXN9Ss1ncsa3GlVMtKcNJpapMDKqyxVwd0CwE/UwAFCiUR6RioLV0QDpEM4Afu9MekzdBQd5RukccAAGOmQxhDwCJiiPDxjEY8OVn7KXHyWV369OL5/wA2PPbZ+yl+iyuvY2v+LAEm7sRp87N/rKf4se0mALgMAAcAAAAAAA6AwHDHgxwxEY4nKzdlMc5SBVldZOYpQ/S2v0mEAD9j4RiRxa64dPXbtzQ90KTOqrTFwaVkVYSBVcnNLKyeoZc3mkvOsmPEihmrlMTkHiUwiEAYgbUrve2rf1Eq49pnUUgUXpWuW09VX00kX+tDQ6KLirbg20qemZAi5UBFupMppLVmzYqyo8EyCooUBMPQEVlHamW1b+hGhvZIj+GAIxkIk59qZbVv6EaG9kiP4YdqZbVv6EaG9kiP4YA35cib+UNq49P9J+1ruJyeQyIeDp9eIFOyyuXTnJm6SuParaTqLUzVOoKcS6raARo5MZ+i4lMgQUZPzulEs8wcFnCe4UQDeDI9UbYO2z9lN9Fldeh5W18/wYgCTtDp6Yxp0j6qrXa0bGUpqEs27evaArMXYSdxMGwtXZ+wlCpLc4iYAEuDHDGf9EZEzJ+hKpc/mjoRBtLmTp84EoZMCDRA7hUQDrEE0zCAdYwB7AaNR4i1QDiPSimIjkc5HJc5EfDGnjb4IIpbKHVwokikkctBHEDppkIcB7JT4lOUAMAh4h/DGGtT8qu2WtI1NUVKTaqq4LNaZns3p+ZkJTq50yTCSzBxLXhUzbvdEK5bKAU3WUAHrjErWBtutFW1f083H0D6V53Uk2vtqDk40pQEvnspUlsqcTYTguBXb04AVBPcIPdD4OkBgCsd7Kc/PC/15T8aJmPIxDGca173EcGFcoWlcCBFsqlAeySd0AH3gAQ8XGMOu1M9q2P/AKI0N7JEfwxI75N9sU9Z+za1LXNuZqOklOyymqnoBan5YpKJqm/WPMDrFOBTkJxKTdD44eHDxwBNC7EafOzf6yn+LFYlyzMxm+0YtERATNyDp6k4iREwplz5OPuIgnugIj4cZiz0zxAe64gIY6gx4fH4IhIco72IOtjaRaw7fXj05yKnJlSFPWil1ITBabzdNi4JN200dOlCETNxMnzSpRAwdY4gCt+7Kc/PC/15T8aLpfYmoIK7L7SCdVFJQ5rUSETHUTIc5h7FT4iYxRER9EYr1O1Mtq39CNDeyRH8MSi9K23g0MbMywdttDmpSe1PLL3aeKeZ0DcFjJpOo/lrafSpMqDtNo8IAlXSKcggU4cB6oAk6aqmzUmmu+5ioIkMFp67EolSTAQEKdf8QEC5AQ6Qii1q5058tdT4cL48sM6/3VT/AISc/wB1FpRcPlO2zQvzQtXWVoWpq0cVndWnZvQNLIOZAsi2Wn1UslpPLE11TBhNIzt0kBjjwKAiI8IiXTHkpW1QqGYP5/L6SogzCePHU4ZGPUaJTGaTNc71sJij0GFFcgmDqHIQB07yXFdc+2V06lOsqcvlfudkplDmL8hz7pAREOmLdoMgAZ6euK+7Yc8nv2gGhjaM2f1H3wp2lWFuqOlFbNJw5ls6SePCLTunXUtZAmgXiYDOFSgYeouRiwRKGOoM9eM/ywB5hCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQBT4cpX77vqL4Y+I0xwzn+snHXGhaN9PKV++76i+GPiNMcM5/rJx1xopkkvCbzmUSoVOZCZzNhLxVxnmgeukmwqY69znd7HXjEAfMhE/C3PIuqXrm3tCVsfWC/ZHrGjaXqk7MKMBQGhqhkjKbGbAfnw3wQF3zQHwG8Bd7Hhxp1/8AJOKc0WaSrwalmuqR9WDi2FPHnadOqUmDMkzMVQCAgZzzxuaAc5E2BgCFLEzDkYHzcF6vUhd/fJfz6f8ARDPiZhyMD5uC9XqQu/vkv59P+gCzIgAgPEID0DjwRFt213KH55sm9R9G2IlthGl0kapt2zrg07XqHyKO2O6fLsxZghzR98peZ3+cz+yxiAJSUUr+2576NrA9VaeffBxiTz27bV/nN5Z4/wBOo9H+T+jENPWnqUcavtTl3NRjqnU6TXulVL2pVKfTci7JLDPFBOLcrgQDnQII43sBmAMWoQhACEbEtlfobabRfWjbXSi9rVW37avWNTPD1QixCYqMfK/Jl5qUgNBMXnOyBR5oR3g3c5iYl2kjSfnypl7Cg/LwB03yJP5Yusf0u0X98uYsN8gOQ8HTEfnYs7C6UbIaobvz2W3rc3XNdaXSZgoi4kfkR5FhKFFVAOUQUPzvPc5gQ4YxEgeAKorldffdJ96hdrvB/bKi8H+vwxF8iUHyuvvuk+9Qu13g/tlReD/X4Yi+QAhCO/8ASxZVLUXqHtDY9acGp9K51cyGkFJ0RDsk0tJOHqTQXZUMhzopApvbmQzjpgDoCJUvI/8Avs0s9RS6vueV+pG3/tJGk/PlTL2FB+Xj4U/2bDDktTAdplT1xFtTExl6hLRhbl9LQpdBRK5I+Qak1GZAZbBpeVQVwR3B50Q3ch0wBPgmbsjJk6dKHKRFFuqocwiAAAAUcjvDwDAZ4iPAY1oX/p1tM7c1a/pBQJtVMzVOVBEHaZFwKuoJVnG8koCog3IIn4Z4F44jCvZk7WCtdrBo4vPeVK0Sdsl6YqhWiZXKmM3GaKzJUrdBVy4BYSJAkJQcELuhnHrxzmj7b3RfT5BeYpTSSM0D/FXDx2IpmbK9w4BJMDjvHFITCACUeI8A6Y1tvPXbiw1Czs6GcypyqPjCbbxHLx8v5cE02zpVtcW1e9uaqjGlVVJRay3hRb+rxL9WYqUnqmpuxU2Roetkp9XUqYoiaYBJm7lZ1LpwYMGJz6qYgoRFUBLjfEMB04jO2z9wrPXylZKzYeSTFSRzZq4FrUSoy92IkPkEU0Sc2RbIAAABimAwdI8cx2JPbBWzmsnWVpyXydWbMi8+qq7aEBaYOQDKhnCqiYbwmMGc73ARGMEKpcJSR9OJKEsTlyzV8zOVwww2IQ6RxyBOaEpDAAh+yzn0OiD1d1X9CcVUUsPlYXV7Y7e2Oe2OMrgmNtotheLFGSbyu+E8ZTws4fOOWvd4fHPbmoTUTRlsJISsZdTkuNUqE8O3lp588XRbqogqoACkg2MAKdAbuS4HojB64O06mLB9KgdTen5G0Skj1Ses1hekYrNnJ0yKponAoCJubOYpRDjnqj612qQpS56kqaVrPHDNlTROyDrulSiVysoXnEQSKQwgYQyAd0GchwjXvcaztsqoXSl0yn6r5NguqQomIUjZdpzwKJorG3QOYglKAGznIZDGR4ynQ6VfX4wuVGUuqXS+HhY6V278euU17YfJHNyaxp20W7e4cITSVRZabaajhP14eOP15MdNarG301K1rm2NREcy+oCmmAypgdYWyCroOdXAqigAqYgrHOfux6B9CNRc6kr9k9NMDvmzYjoxRXZEFLnnBN4DGADnHAqAHEu8PEwBmN6N6JLbd5QbimmEvlktcNZWJJcsx6B5pLdKJekRMIhkf7oRDxRodndCP5jMnrF8pMDAm9V7DOcxyGMZE5jpikICGQ7gPEIB6ETN7OuumGaTi3jDWF0/s9lw+V+fOPRGN0XxL0q+o1IRq020mllPPCjw/lnhv2Xflm+rZc6y6WoIyFoK7lM17AqaYIM6PeNztueRfKGIRM1QCJh7EaCYQETl5sQLnBshwkUXGttcGU0ZN60lNS0K3aM5epMHZWE7B8oCCqO8UxQK5VHfKUQEQ6j5HhEAuzLiraarxR+QyjfnXSfZrgTqc4u1SOAbpQyPMmwHAye4ICI+jG46Q6zKipeUKSCRoTB7LX7Q7J+zeTB2u3UTFPdAoAqqYc745EByGMYxjEZi32jU+79MqrU1F8dm+3q1x8+PzZENU3nbRv4Nxg4dUW8NNdOY8/P6duPdM3VacLnV/cevWNCz+qUj0i5I5Mg8aJpAuo7JkE0k1lcAYwmDBQMPXjHGM8K4tTWdJU/NqmagwVlklZ9nbswcGGYulEg3t9VNA4pkAeAiAFwPR0AIRHE0s6sacl9wJUW4qLum5JLnwLorShQElCAZQDAdQxhARKXhvYyPDrEIlUW2uXZS7FKy1xJawkU/lk6bJN3jZ1Nm4LKNjEAqhHKJ1gMKogON0pRERAevhGLhtu7s6z64ylBy4baxjhc+vpw/b5syd5umyvqVvKjOnFwiuvDw+rhcvl/ry/THZ6dLsX/qyjqno2k5GdNYs+XQdTly/MKSLQ7sSqESl65BAgplAwAbnz8OgI5aXUfNaInk/lk1lc0nk0PLUTykrNeWuW2+qmUOc3UlTqbpRPviON7AGxkQxGEe2QuFSVur12iom1r1s4QUK6VqOWsFSlQTKRUBbnVVAQVEiZMAPNmERDgGeiNoejS22m651i6BuXN6Vl0prqYtnBHExFZ+ssqjLzg2UWMiqJ8lMcoCAgUShvdQdMiWl1KVuqrg4pJ9nxj4e317eq57lrQ1F1seXKL5WWue2Oe/Z4bx8vXuZpbOO8M2r6U3BpmfTKRvXVPzhBy1LKVHAqpIPESqnRdpOMCRZIREp+bLuZDgHTjCPlRveadRnR/V+2XdcAz+nBl1B0Y6I2CaaJFaehri1EzoCXsyTaYMF1ptMGxFSGfLJkESFXyAJCYmAAN3usdMRktUu0knm2L1V3m2DlS21Rs4yntdziUr3pbTIZw5bFteVOrWywSIyae95KpopIGLzgc0Cgm44i0tJSlSWc/DKUec54x+7+uDjdRSrNrHMYt493GLa78en8vauJhFhIHIkaU69ZUy9aig/LxoJ25GwxlGyFp+y07ll6nV1xutMJ4yURcSMJQErCUJpHA5TAc/O87zmMcN3HXF0W5HRhCEAe5v+uEP3ZL/ADyxeZbPv5hzSR+93tF7hpJFGUmfcOQ4cRIcp8eHdEB/kibnYPljdVWQslaezqOkmXTpK2FvaSoRObmrAUDTIlLyRlJyvjI9jm5ozkGnPCTPcCfd6oAsgoRBa0q8sDqjUbqKs/Y5fSfL6eRufXMipBSdEq8XJ5aWcPUmguyodjl50UQU3wJkM4xmJ0sAeMhnHX0x5jU5tkdpK/2WmkhfUxLreI3McIVvSlI+VxeY+RZBJUkwKxM77J3DiAtwNvgTHdYxEToOW2VcAiIaNpZkf+Wpve8AcA5bL8vzSP6n1We2bOIN0btttBtiZptda6tNWkztK3tSa18gmskTZt5x5LhMgmblFwZYVBTTFLm+aAoF45z4o0kwBcKcmt70Tpx/6VSffiEbua7x5SKxz0eVef8AXj/ep31xWObOLlTtR6ANJlutLzLTMxrpvQQzESVKrVAsFHwzBZNUcteZNze4BMBxHIjmM6Q5aTVlZCWkD6Ppc0JVRi06Z0FZicWxZ0IS0XAE5gN8UeyRU3chvboBmAIROoH5fV7fVduT7sp1GyrYH99f0i+n8nVn+tlPzz1dMSl0eRw0zfBJK9K2rh/JVbvpkuirJy0eC5ZSpX5Qqw8sKvzwc8VgabC1BXAc4CW/jjx/JNeTxyTYpsF9pfK7+O7xv9L5fLq3t04p4JKjUpyDzAMzzLnT9ihg+9v7puIQBPl9GEV7PbttXZ+Y3luPTqOerP8AW/o/ch27bV3nN5b7NR8X/F/Dn7kAWE0Ir2e3bau85tLejj+nUenj/wAX6+HocY8du21dj5jeWZ6/06jj73/lgCwnilZ22XfQtYHqsT/75UiUB27bVw5zo3lvrVqPr/1vHYcs5NrItruxb7RaZ6h3lqX2qUgXLcW/QpsJulTSk6AHAy5OYiqTsoqIn3ed3A3sdEAQaNKnzS1hvVYoX3QsIvWKQ+RKl/S7JPaxrEEZxyP6mtNaCuoFDVjMKiWsuma5iUiNSANizhSjQGeFlxnALDzBXZmQIirgdwDibHDEdam5ahVlLiNMk0ey1yWnRGRFcmrMSi4LKBGXguJAb9yKoNwUEue5EwhxxmALCWPACA5wOcRDw2VPKhqi2jWtS2+lF/prY2+bV5LqpenqlCpvJFRiNPSZealIDUUSc4DgUeaEd4N3OeMTEMAHQGIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEOiEIA8ZDGc8PDHnP1cZxEMPlQO1h1pbO26unemtLlySUNKK6pOoZnUbc0rZv+zHbF43SbqbzkhhJuEUMGC4Ac5GIrPbQe1/88Knnw+VyV/kYA4lylfvu2ovhj4jTHD/ALEvGjujPkwpP0yyL20ax23qd1NXc1e3iqS+18agCp7jVYVqWdTkG6TUHIMyGTQwgiBUybhTiHchxjqSjPkwpP0yyL20awBe5aePlAWN9R62fuKkka3NvX3qPVx6QVPvgkbI9PHygLG+o9bP3FSSNbm3r71Hq49IKn3wSAKYuJmHIwPm4L1epC7++SxDPjNXRLtAdTWz5rueXH0x1sWiaqqKTHkM0fGYt33Py1Q4HMiBHBTFKImAO6AMwBeRxWHcs7D/AGxSzw+HT5KfuTt7GBo8qC2v44/phU+A5+RyV9PV/uX4YksbHXTLaTlBen6rtVu03kBr13moGvXdraaqRNwrIwZ0cxZITFvLhbS4ySJxI6cKKc4YomEDY6oArkoRbwdq9bIDzvi3sjmn5aPHavWyB874qPo1FNPy0AVEEIt3+1etkD53xX2RTX8vHntXrZAdentX1qjmofc56AIGHJd+/Kacf7yXK9yD6LeeIdW022ZOkfYyaP7hbQDQXQB7VamLTPqbltF1qpMXU3LLWlXzZCQzwnYL06jdXsqWuFkcnKIk3t4uBCImXbQe2A88Mn7HJWH/ANmALeHIZAOsY89EQ4eS87VTWXtFaz1JSrVJcctcsqAk1MO6aTLLWjAWS0wXXK6ETNiEE4KFIUMGHAY6ImPZ4j08Pu+hAFUVyuoQHa5z7H0jLXfxlRf6/D4Yi+RdE6w9iLs+ddd4nF9tRlpVKxuK6kMqptacFnD5kBpVJhciwQ5luoVP4kLtfJsZNv8ATwjFBfkvmyCIkscNPiuSJKHAfLHNPjilEQDHPeL0IAqJYz12XvfBNJPq20N7dNo6Y1gUFTdrNVOoi21HMvI6lKEvLcSlKdYb5lew5LIqpmculzbnDiJj8y0bpJ7xhybdyPEY6xtXc2rrM3Eo+6VBTAJVWNCz1hUdOzEUirAzmstXK4aLikcBIoCapCm3TAIDjAwBfcAIDxCIq/LAe9OTL1arVe6FOIYg8qD2wHnhkvH+luV/c+JBiMTtZO2t2gGvK0KtjtSN2SVnbxaeSmojygsoYshGaSRwDqXr88gmVQASWKBt3ODdA5gCavyR6cSs2ywu5LEUgCay+/8AU7l8qQQ5xRs8l0j7FKIeAnNKAHh3hxEjXIqmA4snO+b4xUyxTEJ/dAQByYBAeIYHxxEM5HLckjvT7rhtk8mbZMabnFKVhK5au4TTUMi7l70Jm8TTOYB5pMzVAqquN0oiUDCESOqk1cWtpHsdw5nrUqpDKkV3Zq1dJGOkUd4pSonNuYMAgO8IeAI1Zvi3cr+3qqGZeSoqSXCxLP68vP8A5Ymm26sXaXFvL9mVXqfyXTHD/WL+vp2M0V0yLtCtjLFcl3PiqKSYoHxjiAqYKA9Pi4ZjDu/Te2FI0y7nc6lyLfIuHK7NRZIJg7Bpgw8wAiBzb2BABAB+5GD91drdSMomJpJJiMzpgbcF8Q5M8B3c7wdPRnAdPRGtrUprPWuSrLp0vOjcz+t2pA5wSEBUQAQKBR3RznAhgc9HHoi92xtez1SUFdQis4Tcse0X7PC7c8c9zB7k1/UtJz+H9eY8rpT9MNc8d+eflwuTuevr8UZcc6y9vpC8lLJIyqC4TY4lFU7UxkckKO5kBEgiUQ6ox/WeDNTKou2qaYCI923HA9A4EBDPgHh0ZGMQKm1AEoREhHyQO266fZhVEpeubcIoPOCIiQmAARNkRHoERyPSEd2WrubJ64p9KeMFSnBwYCmSOmZMCGHADwUABDj+x8ID6Eb82ztnRNLUbem6cXlSSXS3l9L+Xyffv657ecN563uLWq0rq881QS6W5J/srpx3xnt9PZPg5HM6Slj0RXdnUFFk2UEgHMOFAyI445z0iA+LozGLF1KUkyzaSuGDIjNZR6qRNcCFLvYIfIiOAzkBxjIj4PHl3Pl3KRFilWamREnclOYnQYoDge6AB4jnwcQDA8MYr3DfTQ7dQQBq4SYgoqghkogQwgbJygA8BABHq8Y+KS6pp8c01RS6W1jHt8PDz6/16si+ja5O06owk+ttp4eWnxw8f9McY57dSMKOl0mAXKxCOV1AzkpQyOAyPH8/qYg4ZqprpqNC9j7oicUR4ZL+2wPj9DPV4Y5ylL13ckkE0artzqLIiZylvAYQNx6Q3uGBDr68CPhjrqpHot1RAhVXU1TIYTgC6bNmm3P3JDGcKiVIxiDneIBt7o7njiMBcUvuy59Fzn8vReuDJx1G91C7gkny0k+7eGk19HnjHq/fvxWaTlsedlK4mKbYW4gKxBMIFMUvSU5SiAmDHxwAIjgADpjue0uo0toZ1J5midaaIEnzdx2O2fPEW4NCrFE4CiK2N0CAOQAPF4Bjp2y9vaZrupVJhc5aYM5Eq6foGeswMkkmVETbp+zDAKC+OABzZh3ukPDHCqjthNZHVU/m8omCCtukX5pfTj1zkV3G8cSJCIjxyI7nHAejwjDVb2jKnLzGlJNLD59VhLHLx+vDRsOhp19C3pS6ZNSSylnGcr6Z4eW+35tG0q71baedYV6KTqmtkJ1R8qpqTEdO6ipt0m2OVwgkU3YLsjgDHWFwoAgbdDj15HMZzWn1aym1UipJVGZTVOi+yXVHyIzN4zUdS+UuHQFJMpm0IUTJi4BJITKHIXPOiImxEaCdLV3TD0zFEHotTplWUORBYyKhDlAxRASAICGMYHIB1Y4DH42d5alkLlUHM1UQIuVNNdFUi4lMmkYpikBM/clHJAEMAA/wjbanfU46Z8DXMUks85eOOe/z/LBMNCtbqEl1xl3WH7cpevPr7POO/oWU2myoKSnUipKZyyVtmU5njQ0zegVMguCNSpCYqqywdPZaYgoYBHpMPUHGCxovmkrnPK9btTKSpkSlri513Ct0yDkpTN7YsWzgQH+6dIrGHxiMb7thBqnrK+rW7ylVuRUpi2NJCsSbvt5MrQewjkKmZVQQKRJJNPnBARKBShkREMDFe5W2uG9enzaX351b2LqxOQ3OZXru+WQVKVBF+kEvfz6byAVE01QMkqm5lSKQJn4huGAxRxgYi2nOTtlKWcynJ8+zSx+XsSO7j0VennKjFvPu0v17F2REDnltvyBaNv7/AFbfxDaI8YcqD2wHXqFSHh9Dkr6fD+pfcjeTsX6im3KKZ9d+mNqU4+DnKLAMZLM7aN0gCQDJXdRnVTmigml3Nivz5ECBhQRAuOARflqQIIRbwdq9bIDh/S9q545HyxzXj/8AP4Yjx2r1sgfO+K+yKa/l4AqIIRbtL8l82QREVjhp8VyRJQwfpjmoYEpDCGPiw9YRVYavaDpu12qfURbij2Yy6lKFvLcWlKcYCcyos5LIaqmctlrbnDiJj8y0bJJiYwiJhLkemAO7dlx3wjSP6t1De3LaLwCKEi1VzqvsxcWj7p0DMAlNZULPWFR05MRTIsDOay1crhovzSgCQ/NqkKbdMAgOOIRvV7aD2v8A54VP2OSv8jAEzflgfen3/jvTa3HsgS/BFVlE1jZI61b/AO3n1VttD+0iq0LyaenVGVRcRakU2iEkMaqKLYHmkgfdmsCpr4aPCFU5ve3D9BgHqlEdq9bIDh/S+LeMPLHNeP8A87hAFQ/CJUHKf9m/pU2dt2tO9MaXKEPQ8oruj6hmtRtzv3T4Xbxi+bIt1N5yc4kAiahgwUeOcj1RFfgBHKqF+Taj/TRIPbVpFijsStgns29Xmzrstfa99mlKnuPVozsJ3OAncwag57DcopoYRRUKmTdIYwcA454xtQnvJldkhTUkm9RSiwCqE1kMrfTmWr+WKaGBF/LGqr1otumWwbm3CCZ90eA4wPCAN5+nz5QlkPUhtr7jJLGtLb6d6e1dekI/3ynFepXvKSNq5a2ua0tjR1+SS6kbdVZUdCUrLxkEtUFhTlIzh5T8jZ86dITqdiyyXtUN8w7xub3hHIxkdoT2xeuvac6p7T6IdXd0i3B0931nwUxcakSypnLxnEoMmZYW4PGqZF0e7KA7yZgEPQgCJfCLd8OS9bIDh/S+LeyOah6H+7Q7V62QPnfFR9Gopp+WgCoghFvB2r1sgevT4r7I5oH/AN7hEFblMGgzTfs+taFurS6ZaNNRNFT2zktqqYy0z5w+FacuJq7bKOedcHOcu8ikQu4A7oYz0wBHIi6k2JXeu9H/AIrTyH72TH+WKVuN3ljOUL7UDTraqjbM2tvgSR0FQcobyOm5V5BS5cWUuakAiKPPKJmOcSlAA3jDnhAFt7qtEPhaL8h1jaau8etTr+KKervkrqf0wzr2ycxIxtdyjTaoXsuPQ1oLgX1Tm1D3MqqR0RVss8gZckMwp6pZghKpszBUiQHT7IZuVk98ogYu9kBDETfZRyY/ZGz2UyyeTLT+qtMJzL2U1fLBUc0LzryYtknjpTdBXBecXWObAcAzgMQBBI5Lf35bTp6X7ne459FvBGnPSnsI9nLowvVTWoCwdnlKUubSbaatZLOzTp+8BsjOWSkvfl5hdUyZudbKnJxAcZyGI3Fh0Yx0cOjGfGHiGAPMIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgD8MwmctlSHZU0mDGWtgMUguJg7bs0AOYcFLzzhRNPeMPApd7IjwABj4nl5or6MKW9kEp99xGz5WVX9b232WM0qKgarntHz0t47XtCzanpi5lb8GzioEiLog6anTVBJUo7qhN7BijgQxmKwr4b/VL54C7Hs1nfvuAJhvLQ0lawvfpOWpJNSqEGtDVWRyrTpDTtJuc0waCUi6ktB0RE5gARApxKIgAiADgYhFjRFaB00hVAejIJr70iwn5IrLJdqks9qfm2o5i3vfM6brKmGkgfXKSLVruTtnDFyddCXrTcHJ2qKpyFMoRIxSmEAEQGJjJdHulgQAfhf7T5Hp/SVJfevrQBRgeUitB6KQqgf/gE296RySjaIrMKvpQRpGpwAKkkYiIyCagAAE0aiIiItMAABxER6IvGx0e6WR6NP9pw/wACpIP/AJWP7T0gaXEjkUTsFakiqZyqJqFouSgYhyGAxTFEGvAxRABAQ4gIAMAcv09kOnYOx5DlMQ5LQW0IchyiU5DlouSgYpiiACUxRAQMUQAQEBAQzGuLbxNHT3ZVatWzJs4duVaCUKk3aoqOF1Dc+TgmkkU6hx8RSiMbdWrZuybN2bRFNu1aIItmzdEgESQboJlSRRSIUAKRNJMhSEIUAApSgAAABHyqkpqn6ukz2nqok0vn8jmSfMv5TNGqT1g7SHjuOGyxTJKkz0lOUQ8UAUJflIrT6EKo+wE296R8+YU9P5QmVaayOcSxI5t0iswlj1kmc37Up3KCRTG8QCI+KL08dHmlnq0/2nD/AAKkg5/7rEQblgtirN2w0Y2bmtvLZUVRczdXWatnL+m6fl8pdLtxbqCKKqzRFM50xH9gIiGeqAK5GLNXkalR09KNnneBCbT6TStc+oCbHIjMZoxZKmIMkYgBypuV0jmKI8N4AEM9cVlUdsULfa81sZYvJbeXPrai5S5cmeOJdTdQzGUs1nZigQzhRBoummdYSgBROICYQAAzwgC938vNE/RhS3sglPvuHl4or6MKW9kEp6un+u4ovvhv9UvngLsezWd++48hrA1TB0agLsB/hrO/fcAXoZK1o1U5U06tplRQ5gKRMk+lRznMYQApSlK7ExjGEQAAABEREACOSgICACAgICACAgOQEB4gICHAQEOICHTFINpo1a6nH+oaybJ7fm6bpo7uhRLZ02XrKcqIuEFZ+xIoiqmZ0JTpqEESnKYBAxREByAjF21SRzq0pTKihjHUUp6SnOcw5Mc55a2MYxhHiJjGERER6RHMAaDOVFd5r1Gf39tp7r2MVDUW8vKi+816jer/AGdtr7r2UVDUATwORJ/LF1j+l2i/vlzFhwIgHT1jj14rx+RJ/LF1j+l2i/vlzFhxjiHTw+76MAfDf1PTUqX7FmdQyOWuQKU4tn82YM1wIbO6fmXDhNTdNgd027gcDgeEfMc1xRQtnABWFLCIoKgAeWCU8RFM3/G4rGuVbag74252rM8pygrsV7SEhJZS2rskop+pJlK5eVyurUALLg2arppAqrzZN8+7vG3S5HgERr2+r/VKK6ADqAuwICqmAgNazsQEBOUBAQ7L6BDgIeDhAHZuvukqqe63NWLxlTNQO2brUHdldq7ayaYuGzlBWtZwdJZuui2MksioQwHTUTMYhyiBiiICEYjeUitB6KQqgf8A4BNvekXTGhzTFp4rLRzpgqyq7L23qGpajsVbCdT6ezalJU9mk3m0xo+Uu38ymDxduZZ08eOVVF3C6pjKKKnMcwiJhjKcdHulkejT/acP8CpIP/lYAowPKRWgdNIVQH/wCbe9I/C/pqo5Uh2VNJBO5a23ik7Ifyp8zQ3zDgpeecIJp7xh4FLvZEegBi9NDR7pZ69P9ph4dPlKkuc5/wCq9ERieVlafbIW22WkxqKgbVUJR09LeO2LUs2p2nJbK5gDZxPkiLodktUU1ebWJ3KhAHdMAYGAItHJa9RUltHtDHdp6reos6a1LW2qG1hlXrsWzFvOXKQu5WsYMgU7lZVPsVuGBMJld0vTGS2qWV6grKagbx2bnppijLqVr6fN5U+OdVIz2VOnarpiukJhydEW6wEIPXzY9OMRFestdSpbH3Zt5d2kHajGpLeVbJKqlLhMcGI6lD5F0UuMhkFCpmIJR4CBuMWR1+adtfr/ANNFg9olQyCcwG5dGyinbmt2AFcBJa3lTdJB8D8UygCK/ZQHIpvAAiLkgCPCMLrNlTuqMZyim6T74WcNrPfun68PHcy+kXf3epUpt4VaOFlpLqTTS9OWuE18+CL0EorqppihLV371IXSaqxVwVUMphDAqGAR4gIZyAdfi6IzStpaN/MJNKkJ1Whn/YyiDhNm4lxjCUqZgMBDKCbuh4cRxmOQPqICWzyWTiUtyAxls9mcmciJAAALz4JCBsdGMDwH6kZU0XImiSye6gQC9zuiBQxjwBwAMZ6/B4BjDWdedjhUJNdPKfOc+/GPZ44z7GUrUqdxlVYKfZNtZxnC9c9uO+cHZNRWrsbce38spitGExRURRRRXmNMAaUTMSlTAgiLtIDHMkOMmTxgR454R1zL7MWwtNK05dbN1Ub5ic4GEaidKvxIcR4/qmBHd8OA8fgHINu3SI33U0Sb3NgHEodGMCHDwAA48McZrAizGTJrkQJ8cJs4DgHARHPgzjj63oTbbl9cXd/TlVqSSTSwm+y6c/u9vpzyiAb3sbOOkVIRowi1F8qKTfC9fXt/Ex8qVmsoBzuBOBjAGQRAUUh4B8YnkcBgcD6MdVqy2WlRdrL751BRWAE3JxIQ4nTEmMm4dIgYBDrz4Mx3g/M2mJU3Lx6VIyRd7sbgG+ABkC46BAcZ+oHCOoa4UVqBM0vYywWaZRKUXgAJREAEO6AwAAceviMbvkumhSeMy6YvMufRY59c9/X+B5OjTdveVOh8ueVHHqmlzn0azx/DlPrxuaTU7S6ZAKovMygsBkSGE6KYHAcYMHc444zjh18ejF2pZn2dNkG7xMykteJu036CqnPN0cJmFudNPIbqvObuTAOQDqju+snKFKy4rNusD5ysXdV4gcSCbgOenAhwxn+SMaZ6sk0REoqc44cHFfGQyXnOIE45xjowPDMRHXX/AHcmlhpP5JvKy+F7Z4/pbD2tGVS7g5U49XXB4wvde/C79+3HzTNqtmp9pcLaeUUJMQm/Z5GyJnZ1wO4SF6sQAclbBnKIgYR3TZ4BgQ4ZCOcLWc0mPJGWSnmFZzFm6dFfFTGZuEyS9cDFUDmwHIiBTB0B1B1hnOt2zJkzlTUc8DbwCURxnICHhHPHIeH7kZlydyiCQBw6M8ekOABx6BD6vAOngHHUlerOvWqRcpRUZZ+FtP6enHbv9MYR6YsaVOpaU1OnDCilwlnsuW8d89nx6ndyFvtOsqbHbtXU3mByJkTQGagd6UCpgBSlMCgAIlAvDGRz6McRnUnt6mgslJqftW4MKahCqz63rWZLgJiiQpwVUNnnC5yBukDAA9Q5+Cg5QwI7hT8MZ4Dgcfc/09cdvWDtTN763eoy2sgl6rleezhqm+UTSE5WkrSVIo/driUBAiSLcDiYw4D7ueU5zq0o28pNwykk3zy1j+HcvadOlQ+KMUlFZee2PXj+S+hmPQbOmdmZsaNYWpGbumXlmvDIakLIkBTCT9ku50xWk0qlsmRLg5N07jslqkmI5AgbvAMxWIkRms+mKooIPptNHyy7pUjdFZ48crqnMs4WFNEiiqhjGMZRQ26I5ETGGJvfK1tbEhp1hZbZnWnmTcKftrLJTVd0UJesQSBNm7chZFKHZU8Cm4SH9HKFERBQpwAwZCNMXJoaNpSvtrxp9pmtadlFU089kdxzu5LPGKExlzk6FJPVUTLNXJDpKCkoUDkExREpgAQjIUacaVOMI9klnnPOEn+9GBrVPNqzqf5nlfTsv69zRx5SK0+hCqPD/UCbdHh/WkTnuRakPR9e6wT1aU1LEdyKiwanqMoyQrkSLO98G5pmDUFhJkN4ExMJchnEToQ0e6WMfM+2nDxeUuSe9fBEMLleTRtpZorSk704IJWQdVNOqvSqFxbMoUkrOUmqLcWycyPKOxjOyICYwpFVEwEER3QDMdp1E6Xy80V9GFLdf/pBKerp/ruPuMJlLpq3B3K37KZNRMJAcsHSDxATlxvEBZuoonvFyG8XeyGQyARRR/Dg6pg/sgbs9GPk1nfR4v0Xwi0T5KTXtaXG2UsiqSvapnlXz9S9Nymp5xUExczOYGbIJyAUEBdOjqKimlvn3Cb26XeHABkQgCSe6/Wzj9wW/izRRl7QD5uLVx++Ju97uZ3F5o6/Wzj9wW/izRRl7QD5uLVx++Ju97uZ3AGI6KCzlVNBuiq4XVMBEkUUzqqqHMOAImmmBjnMI8AKUBER6AjkXlIrP6Ean+wE196Rl/s0JPK5/r10qSady9pNJTMrzUW0fy58iRw0eNlpu3Iqg4QUAyaqShREpiHKJTAOBCLoENHuljHzP1pw8XlKkoeL51gCtM5I3LZjSu1Wl80qdg9puWFsxdBEZjPmq8nYgsrIVSppC7mCbduCihhwQgqAY48CgI8ItG/LzRX0YUt7IJT77iKbypa31Eabtmg9uHYKlJFZ6uSXbtxKy1Zb2XNqXn5ZdMJ2mi9ZFmcrI3cg2dJCKbhEFNxQg7pgEIrcPhwNUvngLsezWd++4AmD8tCSVrC++k5ekklKoRa0DVablanSGnaTdQ0yaCVNdSWg6IicwAIlKoJTCGRABiEl5SK0+hCqPsBNvekWFnJFJTLNUlmNT031HMW17prTlbUyzkD+5iRatdydo4l7k67eXLTcHJ2qKpylMoRISgYwAIgOImJ/Ce6WOGNPtpun6C5JwDw/rXqwEAaluTiT6R09smNO0rn85lMjmbc1R8/LpxMWcsfo7zxAS86zerIOE94OJd9MuQ4hkI3U1xW1GKUXVxCVdS5znpifFIQs/lRjGMaVugApSg7ETCIiAAAcRHgEVQm39vJdex+1Bv3biz9w6utpQckCQeRFH0ZPH0gp6Wiu0VMt2FLJesk1Q50wAY/Npl3hDI8Y1C0bq41PuqupZq5v1dRw3c1FJG7hBWs50dJZBaZNk1UlCGdCU6aiZjEOUwCBiiICGBgDh1/KMrBe+t6V0KUqRZFa7NxlUVkpFNFElUlKwnJ01E1CNRIdM5BAxDlESmKIGKIgIDGx/YRU7UEk2qWkyZzmRziUS1rXiajqYTOWPWDFsTsdTu13TpBJBEmcBvqKFAM9MWutjtJ+midWWtDN5vYq10xms1tfb+ZTJ+7o+Trunr9/ScodPHbpc7UTrOHLhVRddUwiZRU5jmERERjX9trbD2ZtBs0dT9w7W2voigK5pyijO5DVtKU/L5LP5Q6BchQXl8yZIpOWyu7w30lCmxwz1QBu78vNFYDNYUt7IJTjx4/RcfQl9RU/N1DIyqeyeZqkKJzpS6ZsnqhSB0mMm2XVMBfGIAHjiiu+G/1S+eAux7NZ377iX9yPi+d4rnaybzyq4dza1rSXNbVuHLZjUk/mE2bILg4KALJIu1lCEUAOG8UANAFjZ0xWE8s6741aL97zJvbx/FntkM468Z9aKwnlnXfG7RfveZN7ePoAh+whCAO+9LChEtSdiVFDkTTJdahjHUOYCEIUtQMRMYxjCBSlAOIiIgABxEYvM6Rriiy0nTAGq+lwEKekoCAz+UgICEtbAICAu+AgPAQ6hihaZvHUvdN3zFws0eNFk3DVy3OZJduukYDpKpKFEDEUTOAGKYogJRABAYyDJq91RpkImS/11yJpkKRMha0nYFIQgAUpSh2XgClKAAAB0AABAF6cyqql5k4Izl1SSGYO1AMKbVlOJe6cKAUMmEiCDhRUwFDibdKOA4jwj72QyIeDp9eKofkzuo2/Ne7XnT9TNa3euDVNPPZDck7yTTyp5pMZa5M3pF6qiZZo5cHSUFJQoHIJiiJTAAhxi14gBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAjkcqF05Xu1QbNKZW0sFbio7o12pdq282Tpml2gPJoaXS6eJLvnZUROQBRbJFFRU2eBQ4RXC+Yq7U0f7Ci9fo+V4nvmLrARx/CIj0Y6/XjwHHIgOR4gHDGOsA/0wBD65JNo+1L6SLQam5PqOs9WFpJnU9Y0y8kLOrWBWK80atmLki67UpVFN9NI5ilOIiGBMAYiYPHgBEQzjjjo6OMeCiPX18QDHEA6OP8nXAH9QhCAEcAufdG39mKIn1yroVRK6LoemGgvZ9Us5WFvLZW0AcCu6VAptxMBEAyBRHIxz+NPe3rwGyj1cZ6PKAr/HkgDnfm1uyxyOdbFlMcMfpgUz6/6F+pEdTlGl1bebV7TTba0WzuquU6r7k0jX7ep6jpC1C4zqbymQJonTUmjtA5W4EakOYCmPvDgR6Ire4mYcjAEA1wXrEej4ELv75LAGhbzFTam+covX7Hie+YeYqbU3zlF6/Y8T3zF1jkMiHg6fXhAFKd5iptTfOUXr9jxPq/rmNd9xrb1xaOtJ/bu5FNTKkK1pd8rLZ/Ts3RBCYyt8iIlVbOkgMYCKEEBAwbw4EIvwB9HGOP8Ar8UUsG2576NrA9VWefx5+Pr9MAYP6XPmkLFeqtQ3uiYReu0d8iNK+lyR+1jWKKLS580hYr1VqG90TCL12jvkRpb0uSP2sawBpj5RFZG6+ojZXX2tTZWh53cS4M+m9Aryiladbg6mr9OX1Q0dPDoIicgGK3bkMqp3QYKAjFYb5iptTfOUXr9jxPfMXWA58ACGByA8fQ+7HkOgM+CAK9nk1snmWyQq7UPPNpAzW0jSi6kopxjb59dwvkGhVTuUrLKTJCVGJ2Rzx2hFCCsAgXAGDAjEtsNtbssR3f6deyoB4qhU6Q6h/QvQICHDpiMNy235X+jb0wVt97tory4AkN8py1D2V1O7Tic3OsJcSnbn0EtZ63knSqemHQu5YeZy9Sei9ZlWMQgis2Bwjzhd3hvliPU3/XCH7sl/nlj0x7m/64Q/dkv88sAXl2z2+YY0jfvd7R+4eSxmJGHez2+YY0jfvd7R+4eSxmIIgHT1jj14ARFX5YD3pyZerVar3QJxKoiKvywHvTky9Wq1XugTgCqviddyWHWNpcorS1qS0x6rL9UdQjGv6+kCVvqVrecmbCq7mjBwxUXkKaxFEWomfKtxOJBRKZcEzGNkMhBRj3N3C7Rwg6arKN3LZVNduuicyaqKyJwUSVSOUQMRRM5SnIYogJTAAgOQikoqScZLKfdFU2mmuGmmn812J6GtOz9ydK97ZnaqdIHf0dUtQPqlpSfN0gMwn8ofOOymb9m+T3klBFFUnOgkcS74CIdyYMcloaZiDdpvCBR5hMBAcCIZAMgIjxHwCPh458PQmyZ2qNl9f1nqT2fu0DqdnTd46QbIyfTjqAnSiZDvebRK2ltNT6ZuDAJHZN1JumddXcdpAUBEFCgMZj3d033R0w1mekK+la/YRzCaQVM2IZWR1FLxETt3kuekAyCnOoiVQyYH3igOQAQwMRi9sZ28+qCcqT5TS5jz2ePbK547khtLuFaKjJqNRYym/wBrCSys8/X/AHxxyVrMiqARM5iBvhul4gXusZLgQ6cdfodQcY4lVc4TdsCS0FCOViNnPOk5wQ+LgcpURHGBDAAPDo6/DHwU5o2R5hw9OoDdscFlCk6RDGMCIDwDo4ceMYZz3U/bA9e1lb5/Ok6bqtKaMG8qbP1wRVcFdJnMQyRTGwJTjuiGPDGe2lJQvYyk0l1rl8L/AAoh+93UqWNSEF1NqSSXOeFy+/6pJ9ucPJkLNQZIJcxMmxxcEKHNc2OASNgBATHAMnDw5zno4BkI6cqGfuJak5TUcpK75RK2IQwFOQB4cSlHuhAB6+sRxxyEfZVn00as8vXzOYJKJlEzghyqHIQxQEpjGLnHc8REBHhjEYl3JrmSyWbEUK7VeKrGEAFMxjIpGH9vjIBjoAcY8OY3xKtSdClHzIt4jnn6evryeYY2VZ38uqjNJzSb6Xxym+fX5444ff1/PUr9vITu3s1U7NVeFPzAGMI82Y+d3AZEAABEOnj9SMZpi6cpunSz5QVlFDGcNxyIAmgYe4T3QHqDhx6h4xySr6kO+KR2quCyZsGIUDZ3OjPDqwHR0cerpCOqJpUbYoKLuFiAQyAJImMYAAT/ANrDrEShgRzw9HjER1urTlRqJTi2+O6eU2srj9/OPc2jtqw6a9NqMliSbbTeVlflxjHv6ezMsrP1A3UaomPkVAUIXIDjoHAcA48MePgHjjMeTzNEyYYPwxwyOeIBgPq+DrjWTaaoTpACYlMUp1cpiIDgwCICAgPi6s+PEZyUEecVA/YymUNHczmcwXSbMmDNJVw6dOFjARNFBBIpzqHMYQAClKIjno4cNSYarVM5WXxn6Lt+/wDrJvy2io0KSxj4YuWFj0Tfy/24+pkLJlnL5yRkyTVdOnaybds3RIKiyyypgKRNJMoCYxjmEAAAAePDw5lGaANH1S6b7A15fSY0+eY30qqhJ29o6SHQKZ5J0E5W4cyiXppHDeK/mL4G6ixRwbcAiQ/HmAOpNmdsuXNHDI76agZWAVCJEZjS1CvEwUCWiYCqN383SOAgDkMlUTbGDJB4nABDASDiEIQgJlKBCplKUpSlAoEIAAAFIAcAKUAxgAxjhF9QpYanL2XSufVrn8nj6FheXSlmlTeY/wCKS9fXC+Xv3RTgaj9l7thdQ987oXkuLpIvnU9XV5WM8nkzm7iR87z4On65m5G4Hdm5pokgKZGyJBBNJIAKQpS8Iz82IujPU/s7tolaDVVrVsxWenbT3QkrrRlV11biS8JVSsidVBTzqVyZB89KosKZ5hMFkmrcATHeVOAcOmLUYo56sAHR4wiPVyo/vNOoz+/9svdgxi9MZnnHP6PH69jM0NtbsscjnWxZToDH6YD+Djj9C5xnwxFx5SnOJZtcKW07SXZvvEdXM0tXNakeXCZWjN5OL0q1m6SJJatNSnBvzBHZkzgiICbeEo+AYr34nh8iTDNf6yf7wUSH1Vnf4IFSMH5irtTej4Sm9efB5Xie+YnabATVBYLZjaApTpj16XQpfTFfpjcytqvd2wuc8GUVOhTVQllJZLODsyEXAGcxFi7BuoJ8n5g4YDdiX4IgUA8XCKojlc/fdKhxxzY+1/8An1D+eeuALCpfbVbLNVFVNPWvZUTnTOQpQqA4iYxiCUpQ/Q3SIiABFY5qu2Ue0PvXqav7d+1elC69bW1ubd24FdUHWEkkpHMnqekqnqeZTiQT2WL8+UVmM0ljts8aqCUonRWIYShnEaPm/wCuEP3ZL/PLF5ls+/mHNJH73e0XuFkkAVb2zt2RG0lt1rd0y1xW2kK71OUpTF3KQm8+nkxkZEWMslrOat1XLxyp2QIkRRTKY5zYHAAMW8ADnjwx1dOfHmA9IdPX0dHr/wAkeYAiqcsD70+/9Wm1vugSiqyi1O5YF3p9/wCrVaz3QJfn/qiqxgCddySfXbpH0kWa1NSXUdfehLRzSpq1pp7IWVXTEzFaaNW7Bymuu1AqSm+mkoYpTiIhjPQMTAPNrdljx/p17KD0cPLAcA6s4Hsbo49foRSowgCUbtkdD2rDXxr9vDqc0e2Ori/tha8CTBSFz6BlwTOmJ92A2USedgPDKpCr2OocpFO4DBhAI1q0zsZtqBJ6kp+bzPRjedlLpXO5VMZg8Wp8gItWTJ+g5dOVR7J4JoIJqKHHjgpRHAxZY8mt70Vpx/6VSffiEbuq7+QisOr9K8/49H+9TvrgDVBabbDbM+iLWW0ourNYlnpHVNIUBRtL1JJX09Om9k8+kFOy2UziVvEwbmBN1L5i0ctHBAEQIqkcuRxGvPbR7VrZ5Xp2bGpy21rNVtqa2rmp6LMykNNSWdncTGaOuyCG5hsiLcm+pugI43g4cIq+dQPy+r2+q7cn3ZTqOooARKy5KJqt08aUNW93Kt1EXXpS09OTi2a0rls2qx6Zk0ePzOCmBqioVNQTKiXIgXAB4RiKbCALq7za3ZYBnGteygjno8sKnEf8miFFyjCy90dq3rAoC++zxoqd6rrR0xaSXUNP67tS3CdSKV1Y0mbp44kbpyYyAkfJNlkljp7ogBDlHOcxCuiz05GJ3ua7/wC+GnHtExgCCl5iptTfOUXr9jxPfMa7ri24re0laT+3dx6bmVI1rSz5WWT+nZukCExlb5Ed1Vs6SAxgIoQeBg3h4xfgDneDAdPAR8Xg/AMUre2y76FrA9VifZ/yk/8AJAGsGSSWa1HOJZIJGxXmU5nL5tLJXL2xd9w9fPFSoNWyJMhvKrKnKQgZDJjAEbLW+xc2o7pBFy30WXpVQcJJroqEp8glUSWICiZyj2TxKchgMA9YDGHelXjqVsPgcf0WKF4/4QsIvWaQ+RKl/S7JPaxrAFZjydnZi69tOu1UsVdW9WmG51urfSKSXBQm1VVHJytJUxWmFLPGjJNdYFziUzhwcqSYbvE5gDhFneAYDHgEccc5DwwH1+A54deOr14BxAOOfHAHmEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQBr/2ke0PtTszNO7jUfeGnqjqWkW9UU/Sp5dS5mxZmL6onpWLRUBdFMlzKahgMrwzu9ER+g5Zhs/Azizt6eI5/VpL0/Wo7h5YB3pma+rVar3RIxVVwBZ59uYbPz6Tt6frsl/Iw7cx2fn0nb0/XZL+SisMhAF57oa1h0Drv04UXqVtnKJzI6Prc78ktls/FA0zQFgoRNXnxbgVLujKAJd0OjMZdxoU5NN3ojTr+71P9+No31wAjA3aZaZKx1iaJr56dKBmUrlFWXKpg8llEwnQLGlrZwZQp990CAgruAAD8YIDnEZ5QgCsJ7TR2gn037L/AFqd/lYzG0a6Xq05LNW861Za05lK7n0NdaUGtpJJTakqqc4azhycFyOXZptziPYoFKOdwANmLDCIZnLQPmIrJ+q60+9lIA5cHLMNn712evSPj52Sh/8AZh25hs/PpO3p+uyX8jFYZCALPMeWYbPweA2dvT9ekv5KK+HaI6iaT1Yayr7agqHl0ylVK3MrWY1FJ5fNxTGYtmjtUx003QpAVMVQAe63AAPBGFUIA740ufNIWK9VahvdEwi9do75EaW9Lkj9rGsUUWlz5pCxXqrUL9yomEXrtHfIjS3pckftY1gDkcIQgCNPyiLY/X72r1L2Dk1j6to6lnFrppUL2cnq0j0xHSc2SRTQK07DMUQMQUxE+/kMCGIiw9po7QT6cFl/rM74eL9Uiz2hAFYT2mjtBPpv2X+tTv8AKx7EeRp7QMiqZzXfsvghyGH4lO+IFMA4/VOvHXFnlCAOhdLVsZzZbThYy0dROWrye21tVQ1ETh2yAwM3MypqnZfKXi7UDiJ+YVXanMlvcdwQzH3L+Xjp/T5Zy4l6aqZvZhT1t6WmtVzdnLhID5yxlLVR0uk2FQBJzxyJiBN4BDI8Y7ejAfajd761a+onXHtK6gCPkHLMNn4GcWdvTxHP6tJen61GLWrvaJ2p5TNalXZxaPKeqS212n85lV1UqhueZspTRZJbtyE6mzUxZWVNz2W4bJmI2EDbm/jeAQiuxiVJyP8AEA2s0sz9JS6vH0afVgDt7tNHaCfTgsv9anf5SNLG1I2SF9dlJVtuaQvdVdIVS/uVKJjOJOrSZXhUWzeWrpoLEdA7MY2+YyhRLujjEXTvTFc5y2X5e+kf0hVZ7YtIAg5s3ruXO2z9g5XZPWa6blo7aqnQcNnCJwUSWQWTMVRJVM5QMQ5DAYpgAQHMWhuwGkGtLVdoXoNrrPcUDf8A01VDL5hL7b1BODOxvDRASvcbNmq06VMYr9k3MYgtzqG7JQTASkMcDYCrpi4P5NR3ojTn+61N9+N4pKMZJxkk01hprKaZVOUWpReGmmn7GOOrDZIXRolKd1Dp/fDWVOC1drkpqYGxP2hCpqHK3bqiAkfAXBSpAIAqcQ4iI9NcnrQkGoK399q3mt5KFrigapZVKukxWnclmUsAGsuXURaKIPFUQbqFMnunIKaw5LjHTF3CYCiIAPHpwHUPox0BebStpy1DyxWT3pszb64rI5FCCFS01LX6xBUKJTHScqIc+RQOkD74iA4EOqOmhQjbVFOk3HDz0+meP5d1jHHscrif3qn5dZKXGOp9/T+OPr8yn0sprwrxjK5fRM8UVfIFRBEH7gxzrKpmwACdUciIlDgGRH40PHHcs01R25bpvW8zdAM8OBTob+DEIYRATZAwDjpwHX6GYsGrq8mZ2WVxZqtPpTaebW7m6xznFekJ46RbkMcRH4kxXEzZIpf2JCF3egIxNqPkh2z3n6rpb4Id52Cjrd3jtncmOZMoGA24mZRuYQDhjIjnGfDEjhq8lGMZOWOM937JtJNLsvb95GKu3LWo5S6YqT5i8c5wsPPos5yufkiBHV+qKj2WXDRZR88EoimgA/Et8R7nJQwHTgOABjj6MdIyG81b3UrljJmkqcKlcLETZy2VNl3ay2ThuiRu3Iooc5sgUd0nXjGOixrt/wAka2YlJv0nlTGujcJJMSmFnPp4i0RU3eIgY8uTTOAGxjhnpwHCNumnTZFbPLSwVivaHTPQEtmsvMQ7SfTqWJVBPEFEsYUTmUyIqsQwiG8OOkfu2l3eRr56FJZ7NrHOOfXjn1XpwZLTtMo2Ki+ZSXL7d+OP3fyIOegrZNa1dS72VvWluZjQVDrA3OrV1btVpU2BscS7yrNmsUrp2JSiJgKAEHIcekYmUaXNllb7RZQL6rqGpuUXg1HJSZcskqOuDCnIGE9UQwgLRqmURYsCLgALLNw7MUSDgoU3GNwDRi0YNytmLRuybJFAqLZoimgimUAAAKVJIpCFAPAABjwR+sM8B4FDrDx58YdcYlUaak5OKbzlNpcdv91kzlS7qTgqaxCCSWI93jGMvv3WTq+zYXT+BzTo3o8rw3JVaGUqUlKJrJyBB2cwiVtLSriKxkESYTKdUwnPjeNxGOQV9WUvt5Q9WV3NEV3Eso+nptUUwbtgL2Qs0lDNd8umiJg3QUOmiYCZAQ3hDMczjoLVOP8AS2X57nGLUV16/wCl6YeL8PTHaWv+5GDmXLI9AMsmL+WrWevOZaXvXTFUxVpLumVaLqIKCX4lndEyYiGeoY1TbZflLekHaDaA7raXbWW2udIKzriaUe8l00qJSWGlSCcgnzeZugXBumVUTKIpGKnuiAbwhnhEHur/AJLao9MU79s3UcdgBE8TkSXyf6yP7w0T/HPIgdxPD5El8sDWR/eCif493AFhoP3OOQxnP5/diExtzuToastpTrnmmpW0Fwbb05R763NG0knLamTmQzMr+nzTQXSphanKlzKgPUub4ZyU2eoIm0QgCsNS5GntAyKpHG79l8EUIYcJTrOCmAR6VcdARY9aXbZTmy+nKxtpKhdNXs9ttaqhKInDtkBgZuZlTNNy6UPF2oHETggq4aKHS3u63BLnjHfHRDpgDp+/146e0+WbuLeqqmT2YU7bWlprVc3ZS4SA+csZS1O6XSbCoApgsciYgTfDdz0xFa7cw2fn0nb0/XZL+RiQVtSu97at/USrj2mdRSBQBNL27/KH9Ke000SOdOVnbe3GpqrVrhUZVZZlVB5aaWgyp6aEeO0hBqmVXnlEwEqfHG908IhaQhAG6nZb7D7UftW6RuNWNkK1oWlmFtZxLpLOEatI+Mu5cTJBRdE7XsM5Q3ClTMB9/jnGI2tByNDaCcf6MFlw/wD7U74//MjbDyJr5Q2rnx3ApP2sd9MTlIAhCabttdp32EtpKd2ampai63rm71jeyTVJUlBHYkph95OnK6bAwK/Id0HNkREFOcMPdCGOiO63/LD9BFXsnlKMLQ3kSe1O1cU+zVXVk3MpO5ykaXN1Fd1LIpEVclMoAYHdAcDmIfHKT++66j/Qpv7yWjSRQvybUf6aJB7atIAl3T/kjeuy9E9nV4qeuvaFnILsTaZXLkbN6lOBetZPXbxaqJY2diRQCC6QZTVBJxuABedKfd4YjFTV7yW7Wlo409XG1G3AubaucUlbWUDOZxLpMnNSzJy3A4E3GorqClv5MHxwCEWlmnwQGwlkcfShtr7jJLGtPb6d6f1c+kI/3ynAFMlGzfZibLa9O1NulVVqLK1NStMTukqcPUr51VZXZmirQigJikiDQxT86IjniOMBGsiJm3Ivs/Ds3vABEP6Ebj0P10Tx9PV0QBwvtNDaCcf6MFlvrU7/ACnVExbk/mzLvFstdKFd2PvTUlMVPUlTXTf1sze0qV0VglLnUtbMyIKg7MZQVwURMYd0d3dEOuN8AiAcRhAHgegen1hwP1Yr3NodyVjWzqt1kX31A0RdC1Erpa5tbzOo5OwmyU2GYtWjxYyiaToUVATFUoD3QkAA8EWEkIArKKW5Jrrk071JIr8VXdW0j+mbPTVjcefMZclN+z3cppBwnO37ZmKqgpg5WbM1CIicBKBxLkMRvJZ8sW0C000a028tBeZR3T7ZCSOlUlZNzSjiVJFYLnSylnmzKtzmJnjuiXPGJR+qz5me/XqTV37nX8UU9XfJXU/phnXtk5gC2d0D8pZ0gbQfU1RWly1lt7nU/Wdbs58+ls0qJSWDKkU6flis0dFcA3TKsJlEUTFT3Rxv4zwiR1FQ/wAlv78tp09L9zvcc+i3ggBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIA107TvZ0W82numxzprubVM/pCm3NV05VhpvTnNeSBXdOPiPmyAAsAl5pU5AKp17vREc/tLbRnw/o+3d68/1P8Ayf4fWiaNHgRAOmAKiblAGyEtHsmbiWSo+1Fc1VWzS5lOTqcTNep+Y51otLXKCCSbbmCgG4cqoibe45iPDE5flsg5vnpG8HlEqzH2QaRBogC4N5NN3ojTr+71P9+No3qVBMFJTIp1NESFOtLZTMpgkQ+dwyjJms5IU+OO6YyYAPiGNFfJpu9Eadf3ep/vxvG8WtRxRtW+lmfev/sU74B44ArqLn8sh1jURcq4dFsbE2lcMqQrmraXZuFgf88u1kE/mEqbrK4PjnVUmhDqY4b5hxGVWzf5VRqo1lazrI6cays1bOQ07cypk5JMptKezQmDNEyZj8425w4k38h+yAeEQOtQvy/b4+rBcv3aTuNkOwW763pF9UFH+IPAFzvEMzloHzEVk/VdafeykTMwEB4hEMzloHzEVk/VdafeykAVnUS59gvyfewO1V0vV1fC6dzq6oyeUvcx7RTWX0yDXsJZk2l7Z2VdXnyGNz5jrGKOBxugHXERiLO7kYfe7rxfvgpt7RsYA4J2ltozz8v67uPQl+fq83/JEBbaCacad0k6wL5aeaTm0wnlPWwrOY05K5pNNzs942ZqCQirnmwAnOGxkcBF5dFK/tue+jawPVWnn3wcYA1sW8rJ5byu6PruXt0XT6j6jlFSM2zjPMLuZO+RfIpK4482odEpT447ojiJgsr5Z3rLlcsl0sSsHaM6UuYtGCZzDMN46bRum3IY3d/HGKmAj4xGIZMIAmiduk6zvpA2h+rMPx48Dy0nWf1WCtCH2QH/AMcQvIQBNC7dI1ofSDtD/wDUPx48hy0nWf12CtCPrzAP/HELyEATRO3SdZ30gbQ/VmH48f0ny0bWcoqmT4AdoSgc5CDjyQEcGMACPE/gGIXMe5v+uEP3ZL/PLAF79pjuhM726d7J3gnTNtL5xc219EVxM2LPe7EaPqlp6Xzdy3bb3dcyis7ORPe47gBmP26hrMyfUNZS5Vk6gfu5ZJLl0nN6SmUwYbvZjRpN2qjRZdvvgJecTIoJiZAe6AI6i2e3zDGkb97vaP3DyWMxIAhddpbaMvp/Xd8f9T/ycbFtmJyc3TtswtSbfUpbK6lfVfUjek6jpMspqPsTyOFpUbEzFyuPMplPzqRDbyfHG8HGJF8IARXOctl+XvpH9IVWe2LSLGIRABwI8Riuc5bIIfB30j8emgqt+5MWfrdcAQa4uD+TUd6I05/utTffjeKfCLg/k1HeiNOf7rU3r/oxv/qgDejUUxUlEgnk2RIU60slEymCRD/GHUZs1nBCmxx3TGTAB8QxXNXN5ZFrEom5NwaMZWHtK4ZUjXFWUw0cLDMOeXayCfP5U3WVwfHOqpNCHUxw3zDjhFipXPyFVf6WJ97VuoojtQefg93vz0/BfuVn0fLnOswBPL2bvKqNU+szWfZHTfWVmbZyGm7m1KWSTOayjs0Zg0RMkY4qN+cPu7+QAOIRPOAMAAfw8Ypjdgl313SL6f0vvc/5/niLnOANDO3s2qd09lRp/t/dq1dG0zWc2q2tUqZdsam57sVBsokZQVkuYEpucAQDGchETDt0nWdjHwAbQ9HhmHT4cb8bfuWg/MTWR9Vtt97KRWfQBcXbBfaf3O2qulyuL5XUpCnKMntMXNfUS1l1M892Esxay9s7K5V58wm58x1jFHHDdAI3kjnhjwhno6PXiHxyMTvdl4PFqCm/tIxiYRAEBLaBcq71WaStX98dPNJWYtjOqdtfWcxpuVzSa9m9nvGzNUxCLOdw4E5wwBk2AxmMTJDyuPVvqKnUqsLUVkrWSqQ3imDW284mcv7O7OYS2sFiSN46ab5xJ2Qgg8OolvBjfKGeER/Ntt30XWB6q89/jzxhLpY+aTsR6q9C+6FhAFhi25Gno5qhshUrq/N2kXNQopTxwkn5H82ktNiFmCqafxMR3CHcGKXI53QDMe/tLbRl9P27v/0/8lEyKjvkRpb0uSP2saxyOAIXXaW2jL6ft3f/AKf+SjcXsmNiHZPZKzq6U7tPcKsq2XukylLKaJ1P2PuMySk6h0jNuYKUcnFUd/e8EbuoQB/PHOR48cFx1Z6c/wAvTEMXbb8pA1HbM3W5NNM1s7U2+q2mmVvaQq4k3qLsvyRM7qA0zK4QHmjATmkuwSc3gM90OYmeRVDcrn77pUPqH2w/z6h/Pr9HqADMZLlous5RVNM1g7RYOoQg48kA4GMBR/3TwD0RYg6ZbnzS9Wniyd3Z0zbS+b3LtdRFcTJiz3uxGj2pqdl83ctm29k3MIrOzpp7wiO6UMjmKH9v+uEP3ZL/ADyxeZbPv5hzSR+93tF7hpJ/LAHBNqV3vbVv6iVce0zqKQKLv7ak9731beonXHtM5ikBgBCEIA3mbJzbn3z2TNHXLo209uqLrVlcudS2dTNeqOyeeaLy1uq3TTb8wYobhyqiJs8chG3bt0jWh9IO0P8A9Q/KRC9hAFi3ZTYiWU29Nu5LtNL73CrC21zL688We0jRPY407LvIExWiAsuySmW+KkVEym8YeIBiOz3fI2NHdHtXNWNL8XYcO6YQVqFqgqDDmlnEmTNMUUlcEyKaijYpD4HO6I4jbVya3vROnH/pVJ9+IRu5rvHlIrHPEPKvP+H/AMKdjAFcLN+V96vbKTaaWakljrUzCTWkmL22UpfvOzuy3ssoJyrSrB263T7vZLlrKkll93uedObHCOa2n5QJqA2zVf09s3by2zoWgrcamXYUZUtWUj2V5YJQzMUVxcS7sgxkud3iAHdgIY4xDU1A/L6vdj6btyfdlOo2VbA/vr+kX0/E+9lPzz1dMATLA5FtoyH/APX67vHo/qf+SjGnUvpepjkqFMyrVjpXnExvPVl3JgFtZtJbm7nkYxlqxRXF417CAh+yCmKABvCIYGJ7YcQD0Ihi8tC+Ypsd6rSH3saANQfbpGtD6Qdof/qH48S7tgttPrn7VTSzXF9LqUhTlGz2mLnvqIay6mee7CWYtZc3eFcKc8Jjc8Y6wlHA4wAcIpz4s9ORid7mu/8Avhpx7RMYAmCYDID4Oj14gIbQDlXuq7SZq+vlp6pOy9sZ1T1sK1mVNSuaTTs3s942ZLGTIs55s4E5wwAGd3hmJ9+QyAeHo9aKVnbZd9C1geqxP/vlSAJA0g5XDq21GTuU2DqOyVrZVIbxzBpbacTKX9ndnMJbWCxJG8dtN84l7IboPDqpbwCG+UM8I2qN+RpaOqnboVK5v1dlFzUKKU8cJJgw5tJebEK/VTTynncIo4MUucjugEV6OlT5paw3qsUL7oWEXq9HiA0nTAB1U7JM/Y1tAEbjZ5cmT007PHVNQ2qe3t3biVRVNDMqgZMJNPgZ+RjglQStaVuDL80QD5SSWE6eBDugDOQiTUAAGcdY59eEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAI8PKaNVmoLR3s35jdvTZc6obT3FSurbqSJ1TTKySEyJK5tO0m0wZgdVJUvNOkDCmoG7kSjwEIruO2CNsP5+u8v2TZdX/Yf9fXE+DlbtK1RWGyomkppKm59VE0G81rVgllOyeYTuYCilUCJlVgZSxu6cikmUBMooCW4QvEwgEVc/wAAC+/0lLt/a3rH+ZoAntcnyoumdt5bu+FdbU6UtdZFV2hqOSSG3E6usUZg8pSUTdsu5mTGWHaCzBNF2skkooBinHJAwOOESLe19Njt5xWzf2Ne+/Yj5cjoes7J2Y1UsbzO21o3s3rWl3EpZ3OXSoJ1NEEWLoqq0ub1UeUrPUkjGAqijYipCGEAMYBEImj/AAwFh/p2Wj+2RRv88wB6bD2BtDpltpJLP2MoeT27tvThnBpJSkiSOjLZeLoxTr8wRQ6hw5wxSibJhyIR207aoPmzlk7SIs0dt1mrhE4ZKqi4TMksmYP2p0zmKPXgRjqv4YCw/wBOy0f2yKN/nmHwwFh/p2Wj+2RRv88wBrYnWwM2RNRTmbVBOtEFoH84nszfzmbPl5c9FZ7Mpm6Vev3awg9ABVcul1VlBAAATnEQAIwC2lOy60F6A9Ft8NWWkLTdQNjtQ1oaZPUFuLoUczcNqjpScFUKmV/LFlnCyZFwIYSgJkzBgeiJEnwwFhvp22j+2TRv89Rqe239z7aV7sw9VFKULcOhq0qmb0Mo3lNNUnVsgqOfzNfnyDzEvk8nmDyYvVscebbNlT447sAVq/bBG2I8/XeX7JsfePijfbsCrzXN21Ooa4NjdqBV001gWqoihlqwpWi7pHI/lMnqRJUEk5q0TaEaGI5KmIlAxjmDAiGIhtfAAvv9JS7f2t6x/maJhnI5bZ3IovWteV9WNvq3pNkvaZ2ig8qalJ9IWqy3ZBR5pJxNJe1RUU4fGEOJ/wC58AEvrtfTY74+YUs1nH/Bj3Gf8u/l4xEF2+d+7u7FjVNQmnLZg1xONIFlqxtgyuHU1AWtVIwkk2rJ5MF2LmfOknZHahnqrVBJAxyqAXcTKG7nAxZIZDj4umK0jli1sLlVntB7RzKj7eVzVkuRsFKmyr+mqTn89ZJOCzp4YUFHUrl7pAiwFEDCkZQDgA53cQBpS7YI2xHn67y/ZNj7xif7s8tlLs/NcejmxmqfVXpkt7eW/wBeKjJdVdybl1WzcuKgqyoHyRVHU0mayLlJM7lc5hMcxEyBkegIqyvgA33+kpdv7W9Y/wAzRcpbFeUzWR7MfSRKp1LZhKJmztdJUncumjNxL37VUrcgGScNHSaLhBQo8BIqmUwY4hAGKeoTYJ7I6lLF3eqan9EdoZZPJDbqrptKJi3lz0F2UxYyV44aOkRF4IAogsmRQgiAgBihwioZqZsgzqSoGbZMqLZrO5s2bpF+NSQQfuEkky5/YkTIUoeIAi9p1PN13WnS+DZqgs5cr2trZJBu3TOsusqeQPikTSSTKZRRQ5hApSEKJjCIAACIxR71bYO+p6rqY5LLXaMQ9QToxDFtzWJimKaZORKYpgkwgYohxAQEQEOIDAGyzk++nezOqbaiWNsxf2gpJcu2NSSmu153SFQJHWlcwVllMu3jE66aZ0ziZs5TIsng4YMUB4xZddr57Hbzitm/sa99+xXtcmxoKubXbXDT9WVzKMqy3dIS2TXDJMarrqnZxSNNsDuaUeotiPZ7P2cvlbUzhYxUkCrukxVUMBEwMYQCLV/4YCw307bR/bJo3+eoA1i9r6bHbzitm/sa99+w7X02O3nFbN/Y1779jbLS9xLf1udynRdc0dV6jIpTPE6XqaSz87Qp8gQzkkqfOzIFOIDuiqBANgcZjmMAaae19Njt5xWzf2Me+/Y9S3J+NjwikoonoVs4VRNM50zBLHvcnKUTFEP0b0gIAIB14CNrlQ3YtZSMxNKKruVQFMTYqRFzSuoqxp2STEqKueaWFlMpi2cgkpum5tQUtw+6bdMOBxxt1f8AsOLZwHwbLRiPMq4D4JFGiOebNjH+zPTAFTjqd2020909air32Ks1q+ulQVp7QXSri3NuKKkr9olKaUoqkKhfyOm5BLUztFDpspVKmTVm2Ic5jFSRKAmEQEY7Q2fu3K2rN0taGm63te6zrs1LRtXXYpGR1HIZhMGajOayp9NW6Ltk5IVmUxkl0jGIcAMAiUR4xpg18vGcw1uasX8vdt3zF5qDuw5aPGi6Tlq5brVpODpLt3CJjpLIqkEp01EzmIcpgMUwgIDHMtmW/YSvXzpRmE0etJdL2l6KJXdvn7lFmzaopzhsY6zhy4OmiikQAyZRQ5SFAMiIBAF4dCOow1AWGHovZaP7ZFG/zzH3qcuta6sJgEopK5NA1TNRSUXCWU5WFPTuYCikXeVWBlLJi6cikmUBMooCW4QoZMIBAHPuOQ4eiPgjB7VZs3tFGt6b03PtU+n6h7yTekGbiX02+qto4XWlTN2oVVyg3FFdECkVOQpjAICIiHTGcMIA00G5Ppsd+kNClm8hw/qY+6B6eh7xHo6YgrbWfaIazdmdriuro/0NX7rXTtpvtsWUGom1NCOkGlNU+MzbqLvxYoOEHCpOyVSFOpvKmyJQxiLUCKjHlHFn7t1LtZtRE3py1txp/KXJKb7HmkloipprLl9xksBuZesZYu2V3R4G5tU2OuAMYHe3+2wD5q5ZO9c141mrxus1conmTHdVbuEzIrJG/QPxqiZzEN4hGNQ06nEyqGcTafzl2q/nE8mb+cTV8uICs9mUzdKvXztYQAAFVy6XVWUEAABOcRAAjsc9g76kKY57LXZIQhRMc57c1gUpSlARMYxhkwAUpQAREREAAAERHEdVLIrN1lW7hJRBdBQ6K6CxDJLIrJGEiiSqZwKdNRM5TEOQ5QMQwCUwAICEAbgdgkH+2u6RfFX6Y/8Ad1Iuc4pjdgl313SN6fk/vdT8/wAHTFzlAGLeqbRZph1rUpKaH1QWhpa8FKyOZFm8rk1UoLLtWUyIUSldolRVSEFQARDImEMdUYG9r6bHbzitm/B/Ux779+70xuWhAGMmlrRxpr0V0RM7caYLTUzZ+iZxOlahmVO0sgqgxdTpZIiCswUKqqqYVjopkIIgYAwUOEZNwhAFK5ttu+i6wPVXnv3weMJdLHzSdiPVXoX3QsIza223fRdYHqrz3+PPGD+mBwg01GWOcul0WzZC6dEKruHChEUEUk6gYmOqqqoYqaaZCgJjnOYpSgAiIgAQBewUd8iNLelyR+1jWNOnKDtRF59LGy6vheiwNfTu2lzqbnFBN5JV1PKkRmkvRmlTtGb8iCiiahABy2UOipkg5IYQ4RsxpG/1iSUnTBD3qtIQ5KdkpTlNcejimKYstbAYpijOQEpiiAgICACAgIDxjRDynG79pqp2PmoWS0xdC3dRzhzPrbGbymQ1tTU3mbgqVXMjqGRYS+ZuHSoJkATnEiRgIUBMbAAIwBX69sEbYfz9d5fsmx94w7YI2xHn67y/ZNj7xjTZHK6YoOuK2O5ToyjKrq5RkUhnhKYp2bz87QpxECGcllTN2ZApxAQIKoEAwgOMwBto7YI2w/n67y/ZNj7xjXVqT1R371fXKWu/qPuVUF1rjuJRL5EtVdSrJLzJSUysVxYMjKJJJF5lsLlbmw3chzg5EY458AG+/wBJS7f2t6x/maHwAb7/AElLt/a3rH+ZoA6qb/rhD92S/wA8sXmWz7+Yc0kfvd7Re4aSfyxSToWCvsC6IjZW7QACqYiI24rEAAAOURERGTYAADpGLo7Qneiz1P6MNLEjn92LaSOdyiwdqpdNZPOK7peWzSWTBnRcmQdsZhL3s1QdsnjVciiLhq5RSXQVIdNUhTlEAA+htSe976tvUTrj2mcxSAxdW7Tu+FlproC1Xy6V3ftdMZg8svWyDRiwuBSbx46WUk7kpEW7ZvNlF1lTmEAKmkQxzDwABGKVKAEI+9TtK1RWEwCU0lTc+qmaikouEsp2TzCdzAUEg3lVgZSxu6cikmXiopze4QOJhAI578AG+/0lLt/a3rH+ZoAmVclH2b2ibW/Z7UpUGqfT7RF5JxSFZ03L6cfVW1cOFpUydsHKrlu2FFwiBU1VCFMYBAREQDjEt3tfTY7ecVs39jXvv2I/HI6XzKyVkdU8vvM8a2jfzeuaXcSllc5wlQTuaIIy90VZaXNqqPKVnqSRjAVRRsRUhDCAGEBGJoPwwFh/p2Wj+2RRv88wB67E2DtFpntrIrP2NoiT27tvTXP+QdKSJM6Utl/ZJgOvzBFDqHDnDFATZOPEI5rXfyEVj6V5/wBWf96nfVH1ZJPpFUsuRm9OTqU1BKXOex5pJJizmsucbo4NzL1gsu2V3R4DuKmwPAY+ZXJTnoqriJlMY56ZnpSFIUTnMY0rdAUpSFARMYwiAAAAIiI8AzAFEbqB+X1e31Xbk+7KdRsq2B/fX9Ivp+J97Kfnnq6Ywsv3Ya+Ti+l6HDezN110F7s3GWRWRt3V6qSyStYTk6aqShJOYiiahDFOQ5DCU5RAxREBAY2O7CWzN4JBtT9Js2ntqblSWVM68Io7mc2oWqJdL2qfY6gb7h48laLZAmeG+qoUoD1wBcThxAPQiGLy0L5imx3qtIfexomdejEOrljtF1hWmjOyjKjqTqWrHqF1kFl2lNSKaT10ij2MYOdVbytq6VTTAeAqHIBAHrgCsciz05GJ3ua7/wC+GnHtExitm+ADff6Sl2/tb1j/ADNFkHyQ6fyGzGz/ALr05eGdyi1FQvL9TaYs5DcqZM6FnLqXnkrJMj5tK6oWlT5dmdQpiFdJIGQMcpigoJgEAAmNDnqDPH6geGNVl1tiVst733Aqa6V1NHlrKyr6sZitNqlqWasHakwm0xcGE6zp0cjshTKKGEREQKAeKM9/hgLD/TstH9sijf55h8MBYf6dlo/tkUb/ADzAGnm9Gw12U9p7SXKubb3RlaemK6oGiajq2kajl0vdkfyOopDK3MxlM0ZnO7MUrlk9bouETGKYAOQMgIZCK5Cebffa9yedTeUy3XHeJpLpXNJhLmDVKZMgTbMmTtZs1bpgLIRAiKCSaZAEREClDIxbBanb4WWm2nW98sld37XTKZTC11atGEvYXApN4+eu15A+TQatGjebKLuXCyhikSRRTOoocQKQomEAilPqqwt81qnqNVKy92FUlZ9OFE1E7dVgdNRM8wcGIchyycSnIcogYpiiJTFEBARAYAlkcnx2v+0h1T7Uax9l7/arblXMtjUklr5xO6QqF81WlcwWldMO3rBRdNJqmcTNnKZFk8HDByhmLLeKmLkxlorsUtthNPU5qa2Fw6dk7aQXKK4ms9oqpJRLUDK0g+IkVZ9MJY3apCocQImB1SicwgUuRHEWzsAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAHzZpJ5VO2/Yc4lzGaMxMQ4tZg1RdtxUIO8Q4pLkOTeKPEo7uQHoGOODbe3wB8hNKhgOqQy33tx9fMdKatdYmn3RBatW9GpOuWtvrdITmVSFSfu2zp0kWazlwDWXNuaaJLKiZdYwEAdzdARyPDiGr7tlPY8eevkPHo/wBhJ94/+IeKAIwfLOFlaEvbpQb0SqpSTd7Q9VKO0acOaSpujpv2gEUcEl4tyqmKAjumOAiACOMZiEt8EWv/AKNaq+z0z98+L+HwjE5LbmUPU236r2z1xNljLj6lqTspIJxTlx5nJTklBKfm06cIuZc2WJORZnVFwigocDJFMUAL3QgMaGO1rtsRgB+FPn3HwTyQj/56ANKnwRa/+jWqvs9M/fPi/h8Iw+CLX/0a1V9npn758X8PhGN1fa122I4f0p8/4/8AtuRZD0f0dDta7bEcP6U+f8f/AG3Ish6P6OgDSp8EWvvo1qr7PTP3z4o237C+q6nqHalaT5RPqgnU6lT2vEkncsmkzePmLpPmD/E3DV0sqgqTh8achgjnva122I4f0p8+4/8AtyRcPR/R0ZmbP3ZH68tnFq4s7rK1e2SmVq9PVk6iJU1x67fzKWvWtPyYhDJmdrNmLhdyqUDmAN1JM5vFjjAFoz8De33AfKTSvDoHyClvX/2bjH1pVStMyJYziS0/JpSucgpnWl0taM1DEHpIY7dJMwl4BwEcRo97ZT2PAcPhr5CH/wAEnuOHDH6wjwPKVdjuH9lfIR9CST0f/IQBvhxgBwGc8ceHPT0xx+a0lTE9XTdTqnpNNXCaYJkWmEtZvFSJgOQTKouioYCAIj3ICAeKNHwcpV2O4/2V8hD0ZJPQ/wDIQ7ZV2O+cfDXyH0fISe4+r2BAG6v4G9ABgRoqlcZER/2ClmPEH626PFHLmbJpL2yTNi2QaNUCgRFu2SIigkQOgqaSZSkIUOoClAA8EaJ+2U9juPD4a+QDnq8hJ6PR/wBgx9WNx9lrzW91BWypK79qp6lU1A1vK0ZxTc8QTVRSmEvcFAyS5E1yJqkAwCA4OUB8UAdmrJJLJnSWTKqkoUxDpnKByHIYBAxTlHgYpg4CAgICA4jiA25t+YRMNFUsYRERERkUtERERyIiPY3ERHpEenj4Rj69UVHKKPpyeVVP3RWMjp2VvpzN3hymMVrLpc3UdO1xKQBMIJIJnOIFAREA4AIxpCdcpJ2PzB26ZOdVkiScM3C7VdMZLPR5tdsqZFYn6w6SqEMA+HGYA6t5TTTkgpLZAahZ5S0lldOzlrO7cFbTWSMW0smKBVatZEVKi8ZpouEwUJkpwIoG8URAcgIxUy/BFr76Naq8H9Xpn75izL2rO0f0hbXrRTcrQpoGuqwvhqbulMKXmNE26lbJ9Lnk4aUpOUJ3PFU3czQbM0wZS1uq4PzixRMBcFARwEQ4O1rtsPgBDSfPhz1eTciz9/dEAb/ORU1JUM+uFrCJO55NpuVCnqLMiWZTB09BIRcud4UwcKqAQTAGBEuM9eYsHQDpyOc+Ho+pEMTksGzG1naAK01MzTVTaKYWzZV1JaXa0ys9fMHgTFZguuZ0QgMnCwk5sDlzvgGc8B4DEzwBznp6ccfz6IAqreVsVfVcl2tU9ZSipJ5LGYWPtiqDWXzR60bgodWod4/MoLJp75gKXeNu5HHERiMX8EWvvo1qr7PTPwY+efz6emJKPK6++6T71C7XeD+2VF4P9fhiL5AHtXXWcrKuHCqi66yhlVllTmUVVUOImOooc4iY5zGERMYwiIiIiIx5buF2iyTlqsq3cInKoiugoZJVJQo5KdNQglOQxRDIGKICAx6Y5zbO3FX3er2lLZ0DKlJ5WVazplT9OSlI6aakwmswWKg0bEUVMVMhlVTFIBjmAoCPEYA9HwRa++jWqvs9NPfUSlOSI1dVU62r0sZzepJ5NGnwF7pqC2mE0evEBOSn1hIfmnCyhN4o8Sm3cgIcMRgt2tftiPOnT/7NyL39G2jYz6ONQmw/1etNaO0noN3p707NaGq2gF69mzlrNWpKprKXHllPy0WspVdut988OVIpwSEhRHJzAEAWWQCA5wOcQyGM54eGND3bKex5yAfDXSHHSG7JJ6Gf+49HHwBmNhOjHaG6Ttf0jqyotLFzmNypTRD9rLakcsmT1mWXvHqZlW6RyvEERMKhCGMAk3g4cYAzY6eOR4h+Y+jHF31E0fNHSj2Z0tT8wdq7vOOnsoYuXCmAwG+ssgdQ2OgMjw6o5Tjjnj0Yx1f641IajNuNs1dKN2KhslfPULKKLuRSwNhndPuZXNnCrMHZDKIbyrdookbfIUR7kw464A2J1vbmgC0ZVpi0VSxTFpmeiUwSKWgICErdCAgINuAgIAID0h1RRf6gCESvxexNMpSJp3cuQRMhCgUhCErKdFIUpQAAKUpQAClAAAAAAAMBFs3VfKSdj/MaYqSXtNVciVdPpDN2bZMJJPfijhzL3CKJAEWOMnUOUvHhkeMVKF5J5Lamu/dWpJM4B3J6huRXM8lTsoCUrqWzap5o/YuClMAGAF2rhJUAEAEANgQAeEAbPNgn313SL0/LAT+91OnxRc6RTF7BPvr2kT1QEvvdSLnSAEIw81i679MOg2jZLcDU/cdnbelqgmpZJKpm8avHZHUxOUTlbgmzRWOAiUBHJgAOrPg1w9sqbHjh/TXyDiHT5CT3HDp/rGAN8MBEA4jGh7tlTY7+evkH2FnvvCPHbKmx4zw1XyIeGMBJJ7gf+4dPjgCs+223fRdYHqrz3+PPGq1NRRI5FUjnTUTMByKEMJDkOUclMUxRAxTFEMgICAgPEIlH66NjrtBNf+qy8ur7StYqa3MsHfCrn9Z22rdlMpYzbVBT0xUFVo+SbPXKLlIipDFMBVkiGDPEIwtqfk6W1wo6nJ5VdQaWp4wkdOSp9Opu8POpIYGsulyCjl24MUr0TCCSKZziBQERAOAQBpwC4legAFCtKpAoABQAJ9MwAAAMAAADnAAABjh1R+OYVnV02aqMZpU8/mLJUSio0ezd86bqCQQEonRWXOmYSiACAiUcDx6Y+E7arsXTlk5IKblo4WauExEBFNduoZJUgiHARKoQxchw4R3ppn0y3m1e3fp6xNgqRcVxc6qUJi4klONXDdss8RlLQ75+cqzpRNEoINkzqCBjgIgGAyPCAOg4nV8ipp2Qz+vtYZJ5JpXNyoSGihRLMmLZ6VITLuhMKYOE1AII4DO7jPXGjIeTXbYfh/Snz4c+CeSL39G/7YXU/NtgDUN6ql2qDU2miUX2l8jltsnc6Es4LUTynzrKTVJEsmF4ZIWxFiGMKwEAchjMAT6Btxb7roqlcZz/AFClgf8AlofA5t+PHylUqOevyBlnvaNKPbKex4EMfDXSIcgPHyEnnHHARD9A+GNpOk7V3YTWzadvezThW7ev7buZ3M6eQqBq3ctUjzWUA3F+1BJ0kkqAoA5RER3N0d8MCPHAHbzm3FvwbOBCiqVAQQVEBCQyzpAhh+dvFFJRr0ris5drX1XMGFV1EyYstQV2WrNm0nMwbtmrZCtpymig3QScETSRSTKUiaZClIQhQKUAAACLwt1+tnH7gt/FmijL2gHzcWrj98Td73czuAMbnFeVu7QVauquqVy2WIKayC86mKqSpDBgxFEzuDFOQQ4CUwCA9YRxOEIAlK8kSk8qne1al7OcS1jNWnwFroqC1ftUXaAnJIVRIfmlyHIJiCOQHGQ6Qi0uC3FvxDPlJpXj/wCwpYP3QbeKKuPkfvfZJd6il1Pc+rFqfgcBjuRAc4zw6evHVAFc9yzhZag766UG1ErK0kg9oKqlXiNOKGkyTpQkyaARRwnLxblWOUBEAMoBhAOARCc+CLX30a1V9npn75ixn5UzsuNbGvy72nKpNLFnpjcuT0VR1RSyo3TJ9L2ZZe8evmyrdI4PXCJjioQhjAJAEoY4jmIona122Hzj4VCegIBnjPJF0ej2diALELk3kwfzTZJ6dXsyeupg8VNUfOuni6jlwpuvEADfWWMdQ2OreMMb1zFKYolMAGKYBAxRABAQHgICA8BAQ6QjUbsONOV3NKezhslZK+NKr0ZciljTwZ3T7hdBwqz7LcpKIbyrY6iRucKUTBunHxxtzgDhqluqCVOZRSjKYOocxjnOaRy0xjnOImMY5hbCJjGMImERERERERzmP0M6FouXOUnjCk6dZO0TbyLlrJ2CC6RujeTVSQKcg+MpgjlUIAR8mbSKSz1EqE6lMumyKZt9NKYs27xMhw6DFI4TUKBvGAAMfWhAHCRtvb8QEPKTS2eHHyBlnT4v0N4vWitK5YjMH9D7Qy00rox66pSWraf5O5WYU64VkzRVwadvimXUby87dI6pigBRUMQTCAYERCLOuKwnlnXfGrRfveZN7eP4AiX/AARa++jWqvs/NPfUPgi199GtVfZ+ae+o4bG46zGwR2o2oC2dJXetXptnNS0DXEqbzqmp4jN5MilMZc6KB0XBE1nhFSlOUQHBylEOsIAwa0vV7W7vUbY1q6q+pHLZxdSiEV2686mKyKySlQMSKJKpqODEOmcoiUxDAJTAIgIYGLvqkrdUCpStMqHoulzHPT8lOcx5FLTGMY0tbCYxhFsIiYRERERHIiIiPEYqe7S8n42q9nLoW/utcHTLO5DQ1uavkFZ1dO1ZxJVUpVTtOzJvM5tMFE0nhlDkas2yypikKYwgXBQEcBE+WTcpA2Qskk8qksy1UyJtMZRLWMrfoGks8EUXsvbJNHaIiDEQEUl0lCCIcB3REBxAG8xhRVISh0m+ldMSCWvEgMCbtjKWLVyQDhumAiyKBFCgYBwYCm7oBwPCOUBjqxw8EanNMu232b+sC79P2IsBqBlFcXOqlvMnMkp1rK5q3Wdoylmd8+OVV00SRLzLZM6ggY4ZAuA4xtjAMfy9WR8MAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAEVvlf4f7UxNR/56rUhj/CJKKquLonbQ7Niptqfo8d6YqUubIrUTRzXVI1cWqahkj+fMCI01MiP1WYsZc4bOBUdFJzaagKbqZh3jFEOERGe0g75+fotR9q6rv55gDLvkTXyjtXOPo6pP2ud9Piic16MQCbaXXa8kHbTCzd4JQ41jvdUSqdZyuc22cJ26a0qhTBRYqspg2qcs0VfqujOgUTVbnTIQCiBiiI8Ozh5b3Y8enQtdbiGMfBSpHHVx/qP09P1A8PACdRDIZx14z60YO7OvWtJNoNpToDVJT1DzW3Uqr1SZEb0pOpo0nMwl/kcqmkYVn7FFBssCgnyXcSLu4HPTGaM4mJZRKJrNjpmWJK5a+mJkSiBTKlZNlXJkymHgUxwSEoCPABHI8IA+jGnrb2D/ALVHq54ZDygKj/3gnDEaCa95alZWha5rSiHGiC6T9ejqsqOlVnyNzaTSSeK09OHkoUdpJHlAnTTcmZmWImcROQpwKYREBGOsqr5RVbrbWyF/sz6J03VrY+p9USQURKrn1TWciqeRUquoILA+mEklLBpMH6Qbgl5pu4SOPSBuqAK8+ETpO0g75+fptT9q6rv55h2kHfPz9NqftXVd/PMAQW4ROj7SDvn5+i1H2rqu/nn0fzHg7SDvn5+i1H2rqu/nn0fzHgBBci6c2IQCGy40ggP0q5J636HJEQftIO+fn6bU/auq7+eYnL6DdNE00e6TrMacJ1VDCs5naykWFNO6mljFeWsZsqzSKQzpuydKKrt0ziGQTUUMYA6RGAOw9UvzN19c9HwKa5z4fkef4x1dPTFFHV/yW1R6Yp37ZuovXNU3zNt9fUprn3PP4oo6v+S2qPTFO/bN1AG+/ku/HbJ6cg8MjuUH/wDyD6LefAZEfD0+tFJNsoNc8i2cmtu2erCpKDm9ypTQLCqGbikZHNWclmMwNUElcSpM6MwfortkQbHWBY4HSMJylEpcCOYmZ9u+WP8AOK3W+2jSP8z+j+Y8AJ02OOePRjHV/rjwGeOfCOOjoiC1275Y/wA4rdb7aNI/zP6P5jw8Dy3yx4/2Ct1ch0f0UaQ8XR/sOPj+p4+AGjHldXfdJ96hlr/B/baj8H+uIvkT2a/2W9V8qNqA+1FtZdWn9KlKzpqhZslqq/kMxryfoPbcioo5nRp7TrmWy4zWZBPiAg2BsCqPY5ucObfDHBlORD3yTTOoOui1IgQhziAWuq7juFEwhnyZ4ZwIfngAIL8Z67L3vgmkn1baG9um3o/n0xjDfe1buxt6bq2bfzZvPXtrq/qqg3U6aN1GjWauKXnLuTqzBu2WMdVBF2doKyaKhzHTKcCmMJgGOXaUL1stOWo2zl8plI3VSsLYV3IKwdSFi6RZO5qjJnyTs7Ju6XIoigquCe4VRQhiFEciAhAF7kGcjnw8A8Xh9f7kRWOWA96cmXq1Wqz7IU/5cRgAHLfLHhw+EVuqAeqlSI//AMPGo/bQ8pTtptUNHzrTJSumOubTzRxXNI1cFU1BW8gn7AqNNTIj5VmLGWy9s4FR0BRTTU5zcIODGAQ4QBEeixi5E0P9ArVyHWFe0n9TyNd/yxXOxJg2FG3roLZB2/vJRlX6f6vvItdGoZPO2r2m6sktOJSoksarNzIOE5oydHXMqKoGKZISgXGBAYAtlwHIgICGPu5/kint5Sn33bUd/wBCmfvJaJNfbvdjxEB+EVur0/TSpHHo8JPxGIW21D1qSTaCay7m6pKeoia27lVfFlYN6UnMzaTiYS/yPQURNzz9iig2W5wT5LuJF3QDA5HjAGviEIQBuE2CffXdInqgJfe6kXOkUxewT767pF6flgJfe6nT4v5cRc6QBDI5aD8xNZH1W233spFZ9FxztxdkvV+1ssVQdoKQu7TloHlH1klVC85qOnplULZ4kmkZMWqTaWOmqqagibIHOYS+KItPaQd8/P0Wo+1dV388+H8PigCC5CJ0faQd8/P0Wo+1dV388+j+fQ7SDvn5+i1H2rqu/nn0fzHgBL+2I/eutH/qUSL72TxGbWqn5mu+4dY2nrrHjxTr8YhcUzylG2uyAkcv2cdY6ZK5vLUmldAls5tcumq2kFOSSrHUmAEDzSXyWaS90/YIL7gmKg5cKKFyACYerjV2+WjWWuTa64Nv22iS6EscVpSE/phGYL3MpRdFipOpY4YEdKopygp1U0DLgcyZDFMcpRABARgCAlV/yW1R6Yp37Zuo35cl078ppz8UhuZ7j3wRH9nL8s0nE1mZExRJMZk+flSMYDGSK8dKuCpmMGAMJAUAomAAARDIRsO2T2umRbOLW3bPVjUlBTa5cpoKX1SycUjJJszksxmBqhkriVJqIzB+g4bIg2OsCxwOkYTlKJSiAjmALtcM8c46sY+792IHXLbs+ULRt/f6ts/WG0ff7d9sh5xW6v20qR/meOrLl1ilyv8ATltEWeZKaNnGlAys7mz65SpbjI1cnV4AiihLkqXCVHl52QtjGVM5MqVUDABALgYAgAxa7ckVDGyKp71cLn8PQTp4I0WdpB3z8/Raj7V1XfzzHe9v9qZS3JdKfJsubpWoqDVVVMidL3iUurQM+l1CSBwzuNuEbSUkiqJtMZiVzLRkSgruRciktz5ATKXdNAE9d1+tnH7gt/FmijL2gHzcWrj98Td73czqJyZuW7WQcAKAaFrqlMsAogYbo0iIFFUNzIgEn4gG9n1vHwximvJKbu64ZnMNY0i1e25oSTaoXji/EroubW9qaaTOlWF0lTVk1kD+ZNJog1fvJShNyMnDtsimg4VQMomQpDAAAQTIRMx1LcjxvLpvsNdS+kz1mWzqZha+jZzWDqQsbcVSyeTVGTs1HajJu6cTZRFBVYqYkIooQxSiICJRDhEM6AJU/I/e+yS71FLqe59WLVARAOkerPrZxFVfyP3vsku9RS6nufVi1QHOeGOgenp8XrZ6YA8w6Ij97Y3b20Dsg64tXRNYafqvvIvdCQzSeNX1NVbJqcSlScscpNzoOEpoydHXOqKoGKdMxQKAYEBzkNLvbvlj/OK3W+2jSP8AM/o/mPACdN0wjCDZ3a05JtA9KlvtUdPURNLdyqvhmAN6TnMzaTeYS7yPWIkbnn7JJFutzgn3i7iZd3GBjMudzMslk02nB0jLllUsfTIyBTAQyxWTVVyZIpjZApjgkJQMICACORCAPqQiEHXXLU7KUNW9ZUSvoguk+Xo+q6ipZZ8jc6k0knitPzh5KVHaSR5SY6abk7QyxEziJiFOBDCIgIxxXt3yx/nFbrfbRpH+Z/R/MeAE6aEQWO3fbIecVur9tGkf5nh277ZDzit1fto0j/M8ATp4rCeWdd8atF+95k3t4+jaf275Y/zit1fto0j/ADPEU/bf7VGldrTqZoy/lJWnqC0DClrbMqEVp+o5/LqheO12j9w8GYJu5Y2aoponKsBARMQTgJRETYHAAaXouo9iSH+1eaQPUokP3qn+GKVyJzOhLlc9otIGlCy+nGcaPLj1lMrV0hL6Zd1LLLiUxLmM2VZJETM6bsnUrVXbpqboiCaqhzB0CPgAnwarPmaL8+pNXXuef+GKKervkrqf0wzr2ycxYTP+WH2d1KsnWnyW6Mrl0vML0oK2yZVG/uPSz1lI3VZkGRIzR0zbypNdygyUeguqgkciipExIQwGMAhi8pyKG99UnPU6OuG1jVKozGnyTVW2NWnUbJzcRmBG6hyzgCnOiVwCZzlACmMURAAAcQBpx5Lhgdstp0AeP6X7ne459Fu+HSPDwcc5zjxdWIhnbJvkt11dnBrctpqxqXVXb+5cpoKW1UxXpGR0JUUlmMwNUUkcSlNRGYP5k4bIlbHWBY4HSMJylEpcDEzEOkejHVjp8eYA8whCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEI0dcoC193v2cWg99qFsCMgCukLj0NS5PLGwCZS/wAjqgm6bN9luIlDneZMPNnz3JsDiIN3beu1Q61bSexEofc5z8xwPogZ68tk+XppH9IlW+2DQIg0RYN7Nq2lP8qHpqv7q7R0XJqm06zOX0pQY2wV8q7TyMqBI7x/5Iol3+yFRVbk5swj3JchGzceSEbLHGALd3PEc+W43T08e46OoAHP3IAy75NN3ojTr+71P9+No3iVsOKNq0R+hmfe1bqK3XWVtidV+xCv/V+zp0dGpAlhLMFZK0kWtZOWd1DvT1Mzl52ZMRMUVg30Sc3w7kOHijGaW8rZ2odTzFhTcyVtP5H1C9ayN/zdJlIfsKbLpsHXNm5zuT8w4U3TfsTYN1cQI2OoXjf2+I+G8Fy/dpOo2Q7BbvrekXo+WAj0/uB/zCJ2NI8lQ2aF5KUpm7tWFup5abqU/Jrj1KLKqjINBqCuJa2qeci0SAmEmwzGaORQT6CJbhf2PHKDS9yZfZ4aSr50DqBteW5QVxbqalnEh8lqlO7YdllKJA7Jb7oc4ngR7nIccQBImhHgM8c+Hh6EeYAQgIAPAYhYcoq26utDZm6ubf2Y07noYtJVJahhWL/yyyMJm88lnEyctVObWE5d1Hmki4J1DkcwBNPhFVR23ptT+nnLSZHpxSJQz/8AM8Eee29dqh1q2k9akSh/9z8/4QLN3VKAjpuvqAfSprn3PP4ooqv+S2qPTFO/bN1Eqih+VObSi/NY0xZWtlLXDSF157LLf1N2BSxW73yCqt2lJpmDVYFB5pfsR2rzSmB3T7purjJ9l/JItl5UkvY1FMC3Z7Pn7NtOnvNVacifZk0QTfOebLudyTnl1NwvUXAdUAVXEItU+1CNliPSW7nrVccP/B6P3PBxdqEbLEekt3PWq44f+D0fueDiBVWQiWfykvY36T9lzSmnicabwrEHdy5tUjOofLPOBmZBSlaKJ23YwCUOaNvKG3h45DHgzETCALXLkiXei5D6uVz/AOLp6JP7r9bOP3Bb+LNFO1oI5QLrl2dNhGunWwh6BLQTSpp3VaQVDIAmMx8k58DMr3ecicMpYZJc2THciJh64zYJyvDanLHKkdW0m6qYqZ8UiUO5OIFNjCnAcCPr8fRA0N7QX5uXVz++Iu57t5z6H8ARh/FojabkzOzw1iWxoHVXdYty/gl6iaRkF5a9GTVMdnKhq24ssbVTPhlzXcHsZl5JTNz2OhkebS3C/sY7C7UI2WI9JbuetVxw/wDB6P3PBxAqrIRap9qEbLEekt3PWq44f+D0fueDjo65QFsBNEGzh0IvdQtgQr0K7QuPQ1Lk8sU/NMZf5HVBNk2b7LYSh8U5ow82fPcmx4IAg4whEu3k3Wxd0kbUS2N/Ks1HhWYzO3VUyGUyEaYnQytHsWYM113AOSAU3OGE6Zd03UEAREoRap9qEbLEekt3PWq44f8Ag9H7ng4u1CNliPSW7nrVccP/AAej9zwcQKqyEWnFTckX2XEqpyfzRsW7XZMuks0ft96rTCXnmjFdwlvBucS84mGQ6w4ejWDXXpyX0ddK5VIynnfIulq/rGnJbzxt9byPkdRTGWM+dP8As1ex2qfOG/ZGyPXAG0bYJd9d0jen9P8AiDxc5xTGbBLvrukX0/pfe5/z/PEXOcAIZDOOvGfWhAQAeAwAhkMgHh6PWiFfyirbra0NmZq6t/ZjTuehi0lUlp5fWUwCpZEWZPRmziZuWinNriYu6jzSRcExwNxiPyPK9dqeI/qlpPYiXxf+s9H6v1QNWW2176LrA9Vee/fB41VRZv6atgNoh2o9kLfa8dSAV6N69R8ia3Ar8aWn5pXIhns2ICzkZcxApgbNwMYd1PIgEchvjyTfZi0BZ259byQl1/JekqEqaoZYK9VmUR7PlMpdPG3Op7ndp86iUTlEcCXh6IFX/CPr1AyRls+ncub73MMJvMmSG8OTcy1eLIJ7w9ZtxMuR6xzG03Yl6ObUa8todaHTTesJwNva0ldZu5uEieCwmXOyOn3MyZ8y5ABEgdkJF5wMd0XIQBqbieHyJL5YOsj+8FE/x7qNyHahGyxHpLdz1quOH/g/h8Xg46udpRSst5LnK7d1ds4BVLNdSrqZSi4XwTzeWdIWtLlIrLfI0ptzsU++upzogI74CAcMZECfXFUPyufhtdKh9Q+1/wB09Q/n1/yByPtvban9alo+gOikSh0df6p1+LqjRfr213Xp2il/Heou/QyIa9e01JKVW8rrAJdLvI2Qi7FlutgE2Ff0Yrzh8913PggDDJv+uEP3ZL/PLF5ls+/mHNJH73e0XuGkkUZJTCQxTl6SGAweiUQEPuhEmG1XKrtphaC2lBWqpQ9rC01bqkpBRkh7LpUqrryJpyWNpUw7JV5wOcW7Fap84f8AZHybxQBZN7Unve+rb1E649pnMUgMS9bI8o81/a87tUDo7vYpbo1qdRFTSy11eBIacKwm403VTlOWTLyOdgc3Y7rsdc/NKgA7psD1cZL3ahGyxxgS3c9EKuOA+j8Z6P5hAEVPkfvfZJd6il1Pc+rFqjEHPaCaArIcnDsSrtB9Afk+W+jOpJHbBIbizAaip/yuV86CTzsBl5gIAuRaqG5hXOUz4HqjRr23rtT8gIqWjEQ/5Ikx9TnPBAGd/LZPl+aR/U+qz2zZxBujZdtH9qnqW2odU0FV2o81LGmtu5U/k8gGmJUErSBpMVk11wcEAxucPvpF3TcMBmNaMAXCnJre9E6cf+lUn34hG7mvAzRFYh0/pXn/AAH+9TqKjTR3ykHaAaI7CUhp0s6pboKBooXgygJ1ThXsx/RyhFVuecCcN/uiBu8OEZJTPlc21Jm0tmErdKWm7HmTJ0wcblJEKbmHaCjdUCjznAwpqGwPUOB6oAjkagfl9Xt9V25PuynUdRR9+q6jf1hVFSVbNeb8lKpn84qOZcyXcR7PncxczN5zRP2CfZDpTcL+xLgOqPgQAhCJEvJ09mZp52m+pG5VrtRHllGnKWoJWopaFMzIZY57PIsBC86sBTCZPdEe564AjtQi1THkhGyx4YJdweP0XnD6o83xx6HH1uMK7lE+zhsDszNXtA2W08BUQUjUdpZdWUwCpZkMze+SzmZumigprCBRKiKSJcExwHMAR/YQixw2bfJhtnRqj0T6f78XILc3y63IoWV1DPxldTHaMeznaJDq9jIAQQTT3hHBeIBw6wGAIBelf5pSw/qsUL7omEXrVIfIlS/pdkntY1iKjXfJZtm1YCjKpvhQ5boeXG0shmdwqX7Pqgy7HydpRopOZYLtESYVbg7aJ86mPxxMh44jCTDlbm1Ep1+9p+XqWnBhInbmTMgUpMplOxJWsZi25w3Od0fmUCb5v2RhEfFAFqXCIB+xJ5Rdr316bQ+0emi9qlvBt5WkprR5N/IGnSsJlzshp5zM2XMOQOIkL2QiXnAAO6LkIn344iPhx9yAPMIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgCK9yvxJRXZNTUqSZ1DfBqtUO6mQxzY8sSPHBQEfuRVZdgvfnN1/k6v4kXzV4LHWh1AUkeg71W7pa5tGqPWkyPTdXSxKbSkz9gpzzN2LVbuBXbKgB0j9JTcQjFPzKvZy9ejSwg/4DS/pz0/U4YgCLTyJ5JVCx+rkFklUhGuqTEAUTOQRDyPdBwAwBmJyoiHEOsOro6s/n4I6Nslpl0/6bmM3llh7R0RaiXz9dJ1OmlFyVCToTJwgUSIrO00OCqiZTCUhh4gAiEd44yPgAOGBAOPhwPgHogCn55Sm1dK7XTUUdNsucgo0xgxEVDlH9BuOgwFEB+rGj6jGL3y4Up+g3XySyL+t1f8AhRr/AHEXg9y9n5oovJV8yr+6emS0VeVpNwSCZ1NUtKM5jN3wIFEqIOHSvdqc2URAuegBjgyOyy2dTZZFw30bWGSXQVTWRVJREvKdJVI4KJqEHqMQ5SmKPSAhkIAyb08gIWBscAgICFnrZgIDwEBCi5JkBDqEI7gj8cul7GUy9jKpY1RYy2WM2svl7JuQE27NiyQI2aNUEw4ERboJJpJEDgUhClDoj9kAIQhAARAOIxWKcs3bOFdonZ8ySCypfhfZSGU0jnDITt7wyUohnxZ8MWdIhniHTjAfn4YxhvPot0o6iaiZ1dfSwFs7p1NL5enKGM7rKnGs4mLWWpnMqRmk4W7ojcqhjHAgcAMYR64AosewXvzm6/ydX8SHYL35zdf5Or+JF3f5lXs5POZ2E9g0vh5lXs5POZ2E9g0vgCmH0vM3ZdR1jDGauSlLdWhhMYyCoAABULDIiIlAAAOsRi9Jo9+xCkqWDsxoAhTkkDHZCIYxLGvDG/wxGtO/mzU0DURZK7FY0jpLsnT1UUxb6q55T09ldGsWsxlE4lsmdupfMWLgndIumblJNdBUvEihCmDiEVPFSbUbaHy+op8wZaxL7tWbKdTRo0bI1vMCIt2zZ8uiggkQBwRNFIhEyFDgUpQAOAQBdrdnsfn1p/lKP48Oz2Pz60/ylH8eKQ/zVHaM+fLv37Opj+GHmqO0Z8+Xfv2dTH8MATNuWyCD23+jjsMQd7lQVrv9jDz+5lu2xvc1v7uerOMxXrdgvfnN1/k6v4kTxOS2zJ/tI601KynXk7X1Xyy3slph3RDK9Sg1i3pdzMl1yP15Om+yDRR2UhCrGJxOBQAYmVBsq9nKHTo0sII+HyjS8IApCjpqJG3VCHTNgB3TlMQ2B6BwYAHA9Q4j+2/64Q/dkv8APLEi3lRtk7TWC2os6oGzFvqYtpRiVmrcTNOmqSlqUqlJJg9UnwO3hWqPcAu4BFLnT9JtwueiI6Tf9cIfuyX+eWALy7Z7fMMaRv3u9o/cPJYzEjDvZ7fMMaRv3u9o/cPJYzEgBEVjlgOfMnJl471WqD6lQpj+CJU8RV+WA96cmXq1Wr90Cf4YAqr4sYuRM/KJ1c+n6kva13Fc7FjFyJn5ROrn0/Ul7Wu4AnLR+c7xomYSKOmyZw6SnXSKYPRKYwCH1I/Rnjjj0Zz1f64qrOUE7QHWtZzakX8oG1upu71CUXJyU8Mrpqm6sey6UMefaLHV7HaJDuJicwAJhDiIgGYAtIK4fsRourgB40ERpifYAHCIiP8AsW66t+KJjUEOb9XuEBAQG71yhAQ4gOaznQ5DHDA+KMml9qXtE3KKzZxrHvysg4SUQWSPXMxMRVJUgpqJnKI4EpyGMUwdYCIRgnMJg9mz99NJk5WezGZPHMwfvHBxUXdvXix3DpyuoPE6y66iiqpx4mOcwj0wBt52CXfXdI3p/T+9z/n+CLnOKYzYJd9d0i9Pyfp9H/V1OnxRc5wB61VkUQAyyqSRRHACqoVMBHwAJhABGPR2ex+fWn+Uo/jxE55W1qIvjp10g2fqSxl0qxtZPpldBuwfzajZutKHrtkLc5hbLrId0dERABEg8MxXq+apbRnz5d+/ZzMfwwBIK5Zmmd3tFbQKNCGdJhp7lBRO3KZcgG8nHoiAmTAxQHGOGc+GIgXYL35zdf5Or+JFlTyZO1lutolovuPd3XLRsi1TXNkF45jSUkre8bElX1FLKbQlTR0jJWkwejziMuScKqLEQL3JVDmN1xJG8yr2cnnM7CewaXwB1RsSCmJsu9IJDkMQxbUyIDFOAlMA9jJ9ICACHT1hGbeqf5my+/qUV17nn8dn0PQtH21peUUTQVOyuk6SkDRNjJaekrYjOVyxmkAFTbM2xO5RSIAABShwAACOsNVHzNd9/Unrr3Ov/DAFFJV/yW1R6Yp37Zuo338l3UIntktOh1DkTIEhuZkxzAQofpPfdJjCAB9WNCFX/JbVHpinftm6jkFrrsXJsnWUuuHaWtagt9XEoTcpSyqKYfqS2cMU3qJm7ojd2l3aZXCBjJKgHxxBEBgC+qB+xDpfNB/7QiH/AI4gictkEHtBaOAZiDsST6td8Gwgvu5QbY3ua393PjxEMvzVHaM+fLv37Opj+GJafJbZk/2kdYalpTrydr6r5db2UUu6odleo41i3pdxMlXBX60nTfZBoo7KmQFjE+PAoAMAQOewXvzm6/ydX8SHYL35zdf5Or+JF3f5lXs5POZ2E9g0vh5lXs5POZ2E9g0vgCkQ7Be/Obr/ACdX8SHYL35zdf5Or+JF3f5lXs5POZ2E9g0vh5lXs5POZ2E9g0vgCoF2XbV0ltBdJKijZwmQt7aHExzoqEIUAnLbImMYoAAB1iIgEXd3Z7H59af5Sj+PGk/Xxs/tFVktHGom7FpNMtore3JoK1tVVJRla0vSjOW1BTc+lksXcy+bSl+l8UavWi5CKoLE7ohygIdEVX/mqO0Z8+Xfv2dTH8MAWJXK/nTVbZQPyJOUFTfBqtYO6msmc2An6eRwUwjgOvhwiq4jKi8GuDV3f+kzULerUPdK5tHmetZkanKvqZ3NpUL9koCrR2LVbuOebqAB0j9JTBkIxXgD2pt11siiiqqAdIppnPj0d0o49ePb2C9+c3X+Tq/iRPN5IPpC0x6kbLaoZrfix9vLrzGQVxTDWTPK0kDacLyxsvL3R1kGh1wykmqYpTHKHAwgAxMi8yr2cnnM7CewaXwBSIdgvfnN1/k6v4kOwXvzm6/ydX8SLu/zKvZyeczsJ7BpfDzKvZyeczsJ7BpfAFIh2C9+c3X+Tq/iR/J2jpMomO2cEKHSY6KhSh6IiUAD6sXePmVezk85nYT2DS+NU2212duhu1mzK1R13brS1ZyjaxkFEmdSWo5DSLJjNZY4BwQAWaOk+7SUxw3i8YAqX4mZcjCWSR1sXuFVYiIDaRwACocpCiPZJesxgAR8UQzY7msvqIvlp1nb6pLGXSrG1k+mTQWD+bUbN1pQ9dshHeFsusj3R0hHiJR4ZgC+H7PY/PrT/KUfx4rEOWarJLbRm0RkVU1Shp6kwCZM5VCgPk4+4CJREM+KI/3mqO0Z8+Xfv2dTH8MYw3nv/erUTUbOr75XNq66VTsJcSUsp5WU2Wm8xbSxNQyqbJJwv3ZW5FDmOVMOAGERgDqCLprYmPWZNl7pAId22IYtqJCAlOukUwfoZPpKY4CHoYilljNOidozrqtvS8nomg9VN5qTpKn2ibCSU/JawfM5ZLGaQAVNs0bJjuJJEKAAUocAAMQBdO6qnrM+mm/BCO2pjGtPXRSlK4SExhGnn4AAAB8iIj0AEUXVWsno1XUwg0dCA1DOhAQbq4EPJJzx+MjZhYDaUa9q4vhaWjav1ZXsqKlaouHSciqKRTSsnzqWziTTOdM2kwlr5ufuV2jxqqogukbuTpnMUemLYSm9lvs7phT0hfPdHNiXLx7JZU7duVqIYHVcOXLFBZddQ48TqKqnOooYeInMIj0wBWf8lzaOk9spp1Oo2cJkCn7m5MdFQpQ/Sc+xkxigAcfH6HGLdmMQ7W6BNF9kqzl1xLSaabSW9riUJukpZVNL0qzlk5YpPUTN3ZG7tLu0yuEDGSVAPjiCIDGXkAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAHXVzru2vsrTZqxu3X1K25pUjtsxPUNYTlnI5SV48U5pq1M9fKpIAu4UECJJifeObgUBGMdPNGNB/nubA/bKpr39Gi3lfpzk2TM1EhzEH4NVqgyUwlH5IkesBD8xiqv7Icf29b66f8AGgC8i80Y0H+e5sD9sqmvf0PNGNB3nubA/bLpr39FG72Q4/t6310/40OyHH9vW+un/GgC8i80Y0Hee5sD9sumvf0PNGNB/nubA/bKpr39FG72Q4/t6310/wCNDshx/b1vrp/xoAvIvNGNB/nubA/bKpr39DzRjQf57mwP2yqa9/RRu9kOP7et9dP+NDshx/b1vrp/xoAvIvNGNB/nubA/bKpr39DzRjQf57mwP2yqa9/RRu9kOP7et9dP+NDshx/b1vrp/wAaALyLzRjQf57mwP2yqa9/Q80Y0Hee5sD9sumvf0UbvZDj+3rfXT/jQ7Icf29b66f8aALyLzRjQf57mwP2yqa9/RlZSNYUtXtPSyraKqCU1TTE6bEeSifSR6jMJXMWqgZTcM3jcx0V0ThxKchhKIdAxQY9kOP7et9dP+NF0xsRBE2y60gmMImEbVyPJhEREw9jk6RERHPhyPSMAZwapvmbb6+pTXPuefxRR1f8ltUemKd+2bqL1zVLj4W6+ufpU1z0el5/FFHV/wAltUemKd+2bqAOOwhCAJ4HIk/li6x/S7Rf3y5iw4ivH5En8sXWP6XaL++XMWGw8eg2MZAeH4fBAFYzyp/SDqjvNtTp3Wdp7A3WuJSall7by9OoqRoyczuUHfNFJ+LpoV8xaqoCuhzqYqp7++TnC7wBkIjhN9nVruBdER0j3+AAWTER+BpU3AAOXP8AWMXkBkEVDCY6KJxwGDGTKY2PGIgPDwR/HYrbIfodDAh/aU+A+ER3YAxX0IyWb03ov0syCfy15J53JrC2slk2lUwQUavpdMGVGydu7Zu2yoFUQcN10zpLJHKBiHKYpgAQGMlqhqOQ0lJZlUdTTdhIpDJma0wms3mjlNnL5eybkE67p26WEqSCCRCiZRQ5gKUoCIjH2QAAAAAAAADAAAYAA8AAHAAjAnaiiJdn1q0EoiUQsnXAgICICA+QrroEOIDAHJ/NGNB/nubA/bKpr39EeHlMt3rXa0tnI+s9pKr6ldRd1FbqW8nqdvrQTlnXFWHk0onRHM0mhZLI1Xb0WTBuArOnAJc2imAmOYAAYq++yHH9vW+un/GiVByQQ5ltrHLCLmMsT4Ct1B3FBFQoiFPq4HdOIhkOnOMhAGifzOnXf50e/wB9rSpveMT8eR42CvXYmyuqeX3mtZXNsH05ril3MpaVtTsxp9eYt0Ze5Iqs0TmCCJl00zGApzEAQKIgAxMx7Fahn9DofWifi8I/siSSYiBCEJnBsEKBejhkd0Az68AezIcOPTnHrRVFcoX0V6tro7VG/wDWdutOV4K2pOaEp3yOqKmqGns2lD3mmaxVexnzRoogruGEANunHAiGemLXQOGQwOA6OHT4f9EesW6BxExkUjGNjImTII/VEoj6PGAKNvzOrXf50e/32tKm94w8zq13+dHv99rSpveMXkfYrb53Q+sp/iw7FbfO6H1lP8WAKhLY7aVNSennaLaa7v30sbc+01raMrIkyqyv68pGb03SlOsAROUXk4nUybIMmTcDCACouqUuRAMxaSeaMaDvPc2B4f8AOVTXv6MQ9vYkglspNW6hEk0zloI4lOmmUpij2QTiBigBg9YYpmeyHH9vW+un/GgCyS5UxW9Ia49KVqKE0d1JJtS9ZyG5KE5nVL2YfIV7O5XKiIHKaYvZfITvHDdoUwgUV1CFTARxmIGvmdWu/wA6Pf77WlTe8Ykz8jEMK+tq9hVxFYvwI3QgVUecKA9kl4gB94AHxxZdi1bZD9Do9fQknj1+5gCGdyWy4lCaHdEVzLaawqtkGmm4U6vTM6jlNGXmmTagqjmMgWlLRBKcM5XPjs3a8vUXTOkRyRMUjKFMUDZCJNPmjGg7z3NgftlU17+ivd5ZsYyG0VtARARRIOnuUmEqQimUR8nHvEQJgM+OIf8A2Q4/t6310/40AX51JVhS1e09LKsouoJVVFMzpsR5KZ9JHqMwlcxaqBlNwzeNzHRXSOHEp0zmKPhjrTUvLn0309XrlcraLv5jMLYVozYsmqZlnLt04kL1JBugkUBMoqsoYpEyFARMYwAACIxgxsSBMbZdaQBMImEbUyIRERERH9DJ9IjxEcRtVNu4EDYEB4CAhkBDwY64Ao9ar2d2utaqKkWS0lX8USWn84VSUJbWpTEUTUmLkxDkMDHBimKIGKIcBAchHwPM6dd/nR7/AH2tKm94xeR9itvndD10iD/CWHYrb53Q+sp/iwBRueZ1a7/Oj3++1pU3vGJgHJRGLzQfWep+Zazmq+mBhW8mpRtSDy9iZrft6kcMFXBnqMmUqAGZX6jUpyiuVuJxTAwCbGYsI+xW3zuh9ZT/ABYgf8toAG9BaN+YAEN6fVrvcyHN72EG2M7m7nHjgCXv5oxoO89zYHh/zlU17+h5oxoP89zYH7ZVNe/oo3eyHH9vW+un/Gh2Q4/t6310/wCNAF5GG0X0HiIAGrmwIiIgAAFyqayIjwAP191xl3JJ3KKklEsn8gmLObyScsW0zlM1l65HLGYy96iRw0eNHCYmTXbOEFCKoqkMJFCGKYoiAxQTt3DjshD4ut+rJf7qf9uX+6i8t2fgiOhzSQIiIj8LvaLiI5Ef0jSQeIjxEfGPGAOO7SinZ7VuhLVJTdMyh/Pp/ObPVkwlUnlbZV5MJg9cShwRFq0aolMquuqcQKRMhRMYwgABmKbbzOrXf50e/wB9rSpveMXlBgA3cmKAlxxzxAfEIdYY8PCPV2K2+d0PrSf4sAUS9ztI2p+y1NmrC7VhLqW6pYrtuwNUFYUbOZHKSvHZwTatRevmqSALuFBAiSYn3jm4FARjHaLUnlgCKKeyfmBk0UiG+DVawMkTIUceT6fDJQAYqtoAsZORNfKG1c+qBSftY7icpEGvkTXyh9XPqgUl7WO4nKQBjBXmtbSPa6pn1GXG1G2fomrJZzYzGnalrmRymbsudATJ9ksXbtNdLfABEu+QMgGQjiSO0S0JuFkm6GrWwiy66hEkUk7kU2c6iqhgImmQoPRExzmEClKHEREADjFVzyk1ZYu1z1HAVZUoYpvAFUOAfrNfqAcBxjSRQzhx5dqP+LrfJRIOlU+P6qtOnuoAvv2L1pMmTOYy9yi8YP2rd6ydtzlVbumjpIi7ZygoURKoiuioRVI5REpyGKYBEBjT9t9O9PauvSEf75TjZZp8ERsJZER+lDbXI5zxGjJKI56wEB8Ma09vp3p7V16Qj/fKcAUyUdp2rsfeC+M2dyGzttazuXOmDUXr2V0XIH8/etWgDui4XbsEVlE0QHgJzABc9cdWRMz5GCmRXWxe4pykOHwJHGAOQpgD9El490A+h92AIzXmdOu8P7Ee/wB4flaVN7xjH+6dlrtWPnramLw26q+2lQvWJJk0ktZyN9IZk4l6hzJkeItH6SKp25zlMQqpSiQTFEAHIRfRdituH6HQ4dPxFPj6+7FYdyzdNNPaM2iBMhCB8LzJuBClKGfJx91FAAzAEQCMrKT0Max67p6WVZRmmW9NT0zOmxHkonskoCfzCVzFqoGU3DN43ZnRXSOA5KdMwlHwxinF07sS26Btl7pAMZBEwjaiQiImSIIj+hU+ORLkYAqoNM+z61wSnULZOaTPSlfZhLpdc+i3j587tzUaLZo0bz5iqu4cLHZARJFJMpjqHMIFKUBERxF03SiaiNL02iqQyaqUgk6aqZwEpyKJy5sU5DFHiBimASmAeICAgMfY7FbAICCCICHRhJMP/D1dUe/o6IAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgCK3ywDvTM19Wq1XuiRiqri1U5YB3pma+rVar3RIxVVwBtZ2eWx11e7TOnK6qjTZJ6fmUst7MmMqn55zMyMDpupgkdZAESm+PKJEzbw9Qxse7Uv2rP0KUJ7JEY3z8iZ+Udq59PVJe17uJzUAVP3al+1a+hShPZIlDtS/atfQpQnskSi2BhAFT92pftWvoUoT2SJQ7Uv2rX0KUJ7JEotgYQBU/dqX7Vr6FKE9kiUO1L9q19ClCeyRKLYGEAVP3al+1a+hShPZIlGnfaAbO7UHs27rSGzuoyXSmXVfUVLIVdL0pO+I/bmlLhyo1TOdUo9ypzqRgEvgwMXhMVh3LO++KWf/e+Sn27ewBD4i6d2IY52XGkEf8Amrkn3uTxB/BFLFF05sQe9b6QPUrkn8QSAM4tUvzN19c/Sprn3PP8fdiijrD5Lao9MU79s3UXrmqb5m2+vqU1z7nn8UUdX/JbVHpinftm6gDILRtpEu1rlv7SenCyLSXvri1k2m7qTtpm6KzZnSkrBSYvecXNwIIN0jCUB6R4RvT7Uv2rX0KUJ7JEo6Z5Lv35TTj/AHkuV7kH0W88ARFeTRbILVvsyqv1EzjUrKJBLWlxpRTbOnRkszJMDKLS1ZY7kFgL+pgAHLuiIcYl0iHj6cZAeIY8Hiz1wEQDGevgEeYA0ma59vdoU2e983Wnu/8AO6pYV81pyTVSo3lMmUetAlU8F0ViYFiAICcRZrbxc5DAeGMOicrQ2VBzlIWqK8ycxSh+ltbpMIAHV4RiIFyurvuk+9Qy1/g/ttR+D/XEYJv+uEP3ZL/PLAF9ray4tPXdtxQ10qTUWVpi4VKyKsJAo4IKax5RUEtbzSXnVTHimoZs5TE5B+NMIh1R0hrhtPVV89JV/bR0QkgvVlwLaVPTMgRcqAkgpM5pLVmzUqqo8CEFQ4AYw8AAc9UfH2e3zDGkb97vaP3DyWMxIAqfu1L9qz9ClCeyRGN6fJ7dg/rn2eGvdlf7UFIqXYUGhbWu6ZUXlM4TeugmU+lJ2bEoIl4iQypgA5v2IcYnXQgDx4c46fuePPXGqLaH7YzSFszKloWltSU3qGWzS4MsfTWQFksrPMCKNGCqaLgVTFDuDAdQuA68xteiuc5bL8vfSP6Qqs9sWkAb6B5Whsp8/JTXogAiPGm1vW6uGPBxjfHpF1WWt1p2KpPULZp0+e0BWQvCydxMW4tXZxZKFTW5xA3EmDHDGekOMUT8XB/JqO9Eac/3WpvX/Rjf/VAG+mEIQBrx2q2nW4Wq7Qdf+wlq27R1XdwaVNKZAg+XBs1UdiqU4AssPAhcAPEYrjO1L9q19ClCeyRL1/z/AIItgYQBXa7MPTncTk2d1Kp1N7Rpszp221zacUt9TTijlwnr1WfrnBYiazdLiRHcKIicQ6QjegPK0tlP1VTXnsbW/BGIXLQfmJrI+q22+9lIrPoAnN7TrSjdXlJF6qa1i7OhoxqO0NvKMb2hqF3WLkJFMU6tl7tWaOEkWqoAKjcGzlISqB+yEQzw4a2+1L9q19ClCeP9MiX5j9yJPfIxA/2uq74/+8JOA6v+A2Pr/dxEwaAIgelfbwaG9mRYO22hnUrO6ol17dPFPM6CuCyksnUfyxvPZUmCLpNo7KG6ukBijunDgPT1xlRRnKpdl3XlXUzRcjqeuTziqp3LpBKyK06qRMz+aukmbUpziHcFFZUoGN4OPiiuw223fRNYHjuvPRD/ACg8YS6WPmk7EeqvQvuhYQBe5MHiMxYMpg3ERbvmjZ4gJvjhRdIkXSEfGJDlEfHGMmsvV7aXQvYGq9R973cwZW6o51J2k4cSxsLt4RWdv05cyBNAvEwGcKlAw9QcYyDo75EaW9Lkj9rGsaC+VH95p1Gf3/tl7sGMAdOBytLZT9dU14Pj8ra38GI1IbU6qJbymyUWypPZrmUqSa6cXc0m1xCVmXyAI3a1MQiUtFmZXHPmMdBQDgHxoAAj0xX4RPD5EmOLgayOOA8gKJz9fdwBqz7Uw2rP0KUJ7JEfwxpO1zaHb2bPm+brT5f5lLWFfs6ck1ULN5S7K9aBLJ4LsGRgXLwFQRZrb5f2OA8MXmUVQ3K5++6VD6h9sP8APqHxfh9HqACMIiYCKpHHoKoQw+gUwCP3Aiz20mcqO2Y9o9MVgLX1XUtbpVNb+0Nv6PqBJCnllEU5vT1MSyVTAiKgBhRMrlqqBDdBi4HrisFhAFr922lsp/oorz2Nrfgh22lsp/oorz2NrfgiqBhAE6jlCe3g0NbRHQY6sFp9ndUP68WuTQ1TEQm8nUYtPI2QzYjt8YVjcN8EgESF/ZCHjiCvCEAWMnImvlDaufVApLH2Md9HrxOUiDXyJscWG1cZ+j+k/uS14P8ABE5TpgCvL2zPJ2toRrR2gV49Qlm6fpJ7QFZhJvIdxMZ2m0dn7CbKJLc4gPEmDGDHhjWfS/JPtqlK6lp6ZuqVoUraXTyVPnAlqNIRBBo+QcKiUOsQImbHhGLWSEAde2kp6YUjaq2dJzYhSTWmLfUZT0zImO8mWYSanJbLXpSGD44pXLZQCm6wAB641bbfTvT2rr0hH++U43Fxp02+nentXXpCP98pwBTJRI35ODtJNOmzY1K3MuZqNmE5l9NVPQC1PyxSTMDP1jTA6wHAqiZQESk3Q+O6IjkQgC19DlaOynD/ANKa96OgacWHrzx4dMQlOUc7RDT7tJNYdv7yac383mFH09aOXUhMFpwxMwcFm7aaOnShCJGABMnzSpBA/WOQiPbCAEXUexK713pA9SiQ/eqcUrkXUmxK713o/wDFaeQ/eyY/ywBtUhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQBFb5YB3pma+rVar3RIxVVxaqcsA70zNfVqtV7okYqq4AsXuRM/KO1c+nqkva93E5kQyHSIehEGbkTPyjtXPp6pL2vdxOagCGptOOVNVNs/dYdydLzHTQxrptQZJWclSrVP2Co+8kUFFhy2BE4J83uboYHj0xgD27ZWPnOZZ7M//AMeNDPKV++76i+GPiNMcM5/rJx1xoWgCef27ZWPnOZZ7M/8A8eHbtlY+c5lnsz//AB4gYQgCef27ZWPnOZZ7M/8A8eN1WxO5QbPdrNfSuLPTSxDS1yNJUctVBZu3n4zUzoyagJg1FHmiAQBznfzFUNEzDkYHzcF6vUhd/fJfz6f9AFmQAYDHgisO5Z33xSz/AO98lPt29izxisO5Z33xWz/73yU+3b2AIfEXTuxDHOy40gD4bVyT73JFLFF09sQ+Oy50g9Hyq5J0DkP1uTrgDODVN8zbfX1Ka59zz+KKOr/ktqj0xTv2zdReuapfmbr6hxyNqa6xgMj8jz/MUUdX/JbVHpinftm6gDffyXfvymnH+8lyvcg+i3nioY5Lv35TTj/eS5XuQfRbzwBoH25W2dm+yHp6y08lVoW11RutMJ4xURcTjyJ8i/IhNJQDlNzZxV57nMCAYxjxxHNDltlYB/YcSv2aD9T9QDh4OuO5uW2/K/0bemCtvvdtFeXAFgTT2y8l/KgpcXagVFcpfTbMp0qpZw1tmUr8sqCKNusKJzcJmJ0t40xGemyjuBzfMBxHej7g8iYpFuAr/DjTIwo/FQL5TADeFPuwL+r9e7iNpvJEu9FyH1crn/xdPRJ/dfrZx+4K/wAWaAK+R3ysWptDzlxo5ZaXmFZtNMKyliW9WK1ULJSpEbXmGkE52dnzJuxTzIkpB2ZDeHmhV3Mjux3xpX5YFVeovURaCx7jShL5Ajc6upDSKk5JVvZBpaWcPkmguwQ5gOdFEFBPuZDOIg5bQX5ubVz49RN3On07zmOZ7L0M7QTSV0h/Rtobo6f6tNoAvBIQhAAegcdPVEeTbQbByT7XaubTVnNL3OrVHthIZrJU2beR+SwTIJm4RXFYx+cJzXNilugXjnOYkNwAQHOOocevAEC3tJKkfPjzL2GB+XiXRs4NFrTZ+6S7eaXWNYK122oI0yMSpVmfYCj7yQWTVEBa7xub5sSYDjxzmM6oQAhDIZAPD0etABAc46hx68AIQhAEMjloPzE1kfVbbfeykVn0WYPLQfmJrI+q22+9lIrPoAku7HTlD8+2TmnurrESuwbO6CNU1+7rg08cVAMqO2O6ZIMxZA35o4GAvM7/ADmeO9iNuXbtlY446OJX4/05jx+q3iBhCALBeWcm5kO16Yt9ovNNQry1L/VKmW5Tm37enfJdGmVJyHPmlycw5wnZRURPu85uhnGcR+lfkftL6b0Vb/Iar5hUC1mUz3MSkZ6RBuSbqUaAz0ktM454eZB2LIERUwO4B97A4xEoDYjd660f8Mf0KZF97J8fXjN3VPw02X39Siuvc8/gCCkblp1XUuJqYDR/LHJacEZEVyNZCQVwlAjLwX3eY7nnQb74lHON7HVH1ZJtopvyjCYo7KOf2gbWAll+CnnS1z2c58sLiRmt6UapTRLKhTS58H5mYNTG3w5sD7/VEDyr/ktqj0xTv2zdRvy5Lp35TTn/AHhuZ7jn0ASEu0kqR8+RM/Q8pYcPQ+L/AMMcVqajy8kOK3rWl3Y6qz6rRNJXTKYE8qZaYLSPxcixD/FuyhdC4EBDAbm744n+RA55bb8gWjb+/wBW38Q2gDpvt2usOONHMs4/8tBD/wAvw9aIse1j2icw2n+rKYaoJlQCNtnL6iaZo8aaQmAzNNMtOmmBgdg6EpMi47OHJN3udzrzGs2EAIQhAGQOlWyiWo3UTZ+xq85NT6Nz65kNIKToiHZJpaScPUmguyoZDnBSBTeAmeOMROl7SSpHz5Ey9hgfloho7LjvhGkf1bqG9uW0XgEAVZW2R5NvINlppHcamJdqFeXLcIVvSlI+VxenAlhDEqSYFYmddk86bAtwNvgTHddERPItTuWBiHmT78PDeq1mPWn6cVWMASGdjBt453siqFuxRcrsk1uqS58/lM8UeOJ6MpGWmljZZuCBSc2fnQV53eEchjHRG7UeW11gPAdHMs9mY+94gYwgCef27ZWPnOZZ7M//AMeHbtlY+c5lnsz/APx4gYQgCef27ZWPnOZZ7M//AMeMQ9d/Kw6n1raVrs6aHml9hR7e6EhGSKVElVQvDy0BUKpzxW3Ml5343G7kOmIdkIARus2Juydlm1mvjXVoZndBxa1Kj6PUqck1byoJqLsxFQT7GMlvk3AHIjvZjSnEzbkX+fh2b38RD+hI449X65L48ZgDO8eRJUljPw48zDxBRZRH+OGIte2u2Wkt2TmpOjrCyy5i90Uaotyyro07XlnkUdsd2/cM+wgQ3z7wFBDf5zPERxjhFzPkPCEVhPLOu+NWi/e8yb28fQBD9iZZov5WzVGkTTJaPTm10sy6qm9raVYU0lUClVi0PMyskipg5M35keaE4FyJMiARDThAFghablm1XXIudQFvlNIsul6dZ1dIKZO+LWHOmZlnMybsDOAT5gN8UQW3wLnusYietJXwzOTyqZiTmhmMtYvxTAcgmLxqk4EmevcFTdz14iiX0qfNLWG9VihfdCwi9YpD5EqX9Lsk9rW0AcihHgRAOkemPMAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhAEVvlgHemZr6tVqvdEjFVXFqpywDvTM19Wq1XuiRiqrgCxe5Ez8o7Vz6eqS9r3cTmogy8iZ+Udq59PVJe17uJzUAU+HKV++76i+GPiNMcM5/rJx1xoWjfTylfvu+ovhj4jTHDOf6ycdcaFoAQhCAETMORgfNwXq9SF398l/Pp/0Qz4mYcjA+bgvV6kLv75L+fT/oAsyIrDuWd98Vs/+98lPt29izxisO5Z33xWz/73yU+3b2AIfEXTuxDHOy40gj/zVyT73J4g/gilii6c2IPet9IHqVyT+IJAGzyrKZlFZ0zP6Rn7YXckqWUP5HNmoGEouJfMmyjR2jvFEDF5xBU5d4ByGchGhJ3yYjZDTB27futPRzOXrld2ubyxzXulnKpllTYBYMbyhzDjqzEgs6hEiGUUORNMhRMdQ5gIQhShkxjGMIFKUA4iIiAAHERjjA1zRICIDWNLAICICA1BKQEBDgICAu8gIDwEB6IAiK7TjZlaR9jPo+uHr+0FW/NanUxaZ9TctomtjTF3NgljWr5ujIZ4QWL5RRur2VLXKqOTlESb28UQEIiWByoDbABn+mIJx/5OSv8AkS/hid9ynCeySpdj3qHlFOziVz+auJ3bgyEskkwazWYrlSq1kdQyLJgqu5UBMgCY4kTHdKAmHABmKljyjVr9B9U+x+be9IAnabFypJtyiiobv0rtSnHwdJNYGXSaa2zbkKEh8hHtQqKJTRQTy7mzLguREgYUyBcZDxyBe1fNj/j5nk/sjmv5YP4Ijv8AItiHo64Wr9SrympVN3T1GlanqQoyMjkxHDnfK3NMwalWEuQ3gTEwlzxxFgZ5eqI+jGlfZDKPfkAVu+1l12ajthTqyfaFdnNWQWb05yyiKYuSzo4zNCdCnVdZmmBJ9MOzX4KLiDsspZBzQm3Sc13IBvDGso3Kf9sAcpiG1EEEpyiUweVyV9BgEBD9S6wGO5eVtzKXTXa2T11K37KZNRsdbAgOWDpu8QE5Vai3iAs2OomJi5ARLvbwZDPTEYmAOZXErypLpV3WFyKxe+SVV11Uk4quo3+4VIHk6nr5aYzJyCZMFTBZ04VU3Chul3sBwj91q7m1dZq4lH3SoKY+RNY0NPWFR07MRTIsDOay1crhouKRwEh+bVIU26YBAcR1/HtRQWcqpoN0VXC6pgIkiimdVVQ5hwBE00wMc5hHgBSgIiPQEASDu2gdsD54gnsclf5KN+fJyNtZtA9eW0JYWP1IXbLWdu1rYV/UKknCUMWQjNJJJ1HUvX55BMqnxFYoG3c4N0CAh0QIvKNWv0H1T7H5t70iUTyR6WTKlNqxLZpVMvfU1LC2YuiiMxn7ReTMAWVkCpUkheTFNs3BVQ3ckTFTeOIgBQEYAtRc9PAeA46OI+h4ohgcqD2sGtTZ3XY0701pauWFCymuqSqGZ1GgMsaP+zHjF62RbKZckMJNwihgwXAD1xMW8vVEfRjSvshlHvyK8rloKStY3y0nL0impVKLWhKrTcrU4Q08SbnNMGglIupLAdEROYAESlUEpjAAiACAQBp47aB2wPniSD6NOSv+RII89tA7YHzxBPY5K/yUaFfKNW30H1T7H5t70h5Rq2+g+qfY/NvekASB6X5TrteZjU1Oy91qFIo1fT2UM3JPK7Kw30HUwboLEzzXDeTOYM9WYtgbOz6Z1TaO1lTzlbsmcVHbmiJ7NXOAL2RMpvTMrmD5fdLwLzzpwqpuhwLvYDhFE7RVD1qFZUkI0hVAAFTSEREafmwAABNWgiIiLTAAAcREeiL0zT8Q6dhbIkOUxDktFbYhyHKJTkOWjJKBimKIAJTFEBAxRABAQEBDMAduwhCAIZHLQfmJrI+q22+9lIrPos0uWYSibTfRVZRGUyuYzRYl2WxzpS5k5eqEJ2MfujEbJKmKX+6EADxxWreUatfoPqn2Pzb3pAHFoRynyjVt9B9U+x+be9IeUatvoPqn2Pzb3pAG4+xnKFNqDp0tVRtmbWXzCRUFQcpbySm5SMilzjsKXtigRFHnlUhOfdKABkwiMZK2v5RntU703Goe0Vf34LN6HuXVMkoirZX5AS1HyQp6pJghKpsz51NIDp9kMnKye+QQMXeyA5CI7flGrb6D6p9j8296R3tpfo2r2uo2xrlzStSN26F06IVWXXkU0SRRSJUDEx1FVFGpSJkIUBMY5jAUoAIiIBAFplKOTJbIyfSmVzyZafVFpjOpcymz9UKimhQVezFsk8dKboLYDnF1lDYDgGcBwjBHac7M3SRsY9Htw9f+gmgDWp1M2nf01K6LrY0wdTcJYzrCboSGep9gvTnbK9ly1yqhk5REu9vFwIRLKpGuKKJSdLkPWFLFOSnZKUxTVBKSmKYstbAYpii7AQMAgICAgAgICA8Y0P8AKdJ5JKl2PWoaUU5OJXP5s4n1tjISySTBpNZguVOrmR1BRZMVV3KoJkATHEiZtwoCY2ADMAQRB5UDtgfPEkD/AAclf8qQxvN2LdRTXlE8/vBS+1LcfB1lFgWElmds25ShIfIR3USiqc1UE0s5oV+fIgmGFBEC7vDEQSfKNW30H1T7H5t70ic5yLYp6Nr7WApVxTUqm7kNFlanqQBkZHRiLut8rc0zBqVYSZDeBMTCXPHEASHu1fNj/wCd5P7I5r+Xiv15RLo1sNoV2ik5sVpypU1HW4a2soSo0ZMZ2u9Es2nJpwEwcc84MZQee7FR7nO6G5wwIiEW+vl7oj6MaV9kMp99xVgcrJlU0qnay1BNaYlr+o5Yayls0SzKQs3E4YGWTPUHOJA8lybhuKqe8XfT5wTkyG8AZAIAi6IlA6qRRDIGUIUQ6MgYwAIZ8YDFqlo/5Nzso7paVtO9yKxsIeY1XXVmbdVXUb/ywTNPsydT2lZXMpk55siwEJzztwspulDBd7AcMRVsN6GrUHCGaPqn9WS/9H5t+3L/AMUi7n0DVhSbDRLpPZPqop1m8a6fLSt3LR3O5a3ctl0qIkpFUF0FnRFUVUzgYiiahCnIcBKYoCAhAGlTU9sGtm7owsBdjVPYSzJ6UvHYyip3cW3VRDO5g7CT1VTjNWYSp+LZdU6S3Y7lEh+bOAlNjA8IhT9tA7YEP7IgnsclfHx/qUWZe08qylpnoB1YMJbUtPzB86stWyLVkynMudu3Kx5O5AiSDZu5UWWUOIgBSJkMcwjgAEYpSvKNW30H1T7H5t70gCZfsj9auoDbyaq2+h/aRVaF5tPLujKouGtSBWaElMaqKKYHmlPvuzWAJuABo8IVTmwMBT4wYBCJRfavmx/87wf2Rzb8vENHkjssmVKbVaXzSqZe+pqWBZi6CIzGftF5OwBVWQKlTSF3MU2zcFFDdyQgqbxx4FARi0Z8vVEfRjSvshlHvyAKtPlQOzf0qbO67WnemNLlBGoWUV1SFQzSo25pg5f9mPGL5si2UA7g5xJuJqGDdLgBzmIrsTleWhJK1jfXSc4pFNSqUGlBVYm6Wpwhp2k2UNMmYlI4UlgOiInMACJSqGKJgDIAIRCT8o1bfQfVPsfm3vSAOLR9+lGTeZVRTkudk5xq/n0oZOU84327qYN0FiZDiG8mcxchxDPCP1eUatvoPqn2Pzb3pHKKIoms060pE56RqchCVNITHOeQTUpSlLNGomMYwtAApQABEREQAADIjiALUuz3JmtkjVNpLW1POdP6jib1HbmiJ9NXHlhmZefmU3pmWTB8tugsAF5104VPgAwG9gOEdjdq+bH/AM7yp7I5r+WjclYKtaNb2JsqgvVtMoro2ltwksirPpUmqkqnR0mIokqmd2U6aiZyiQ5DgBimASmABAQjtry9UR9GNK+yGUe/IA0Kdq+bH/zvJx/wjmv8i4Rp02yFg7a8nzsxROofZiyb4CN0bjVWnQ1VTw6yk9B/TqqRljswQmJlU08qFKO+QAN1Z4xN28vVEfRjSvshlHvyIc/LIHjSr9GVk2dJum9UO0LroKrNadXSnblFLsY3xRVCWmcqpp/3ZygXxwBFbDlQG2AD+yIJ7HJXwDwcEuiJMGx00xWh5QRp5q3VjtN6eG9t6qDuA8tXTlTEcrSMGdGMGKEybS3sWXGSRPzbtyqpzpgE472M4iu28o1bfQfVPsfm3vSLMHkcz9jSGzyu3L6seNKXfragZu4SZVE4RkjtVAZGyKC6baZHbLHREwCUFCkEgiAgBshAGfPavux/87wf2Rzb8vHjtXzY/wDneVA/wjmv8qwxvs8vVEfRjSvshlHvyORtnTZ6gm5ZuEHbZUoGScNlk10FSj0GTVSMdM5R6hKYQHwwBGzulyczZX2TtvXV37f2JUlNcWzpSe1vSU1GfzJbyOqGmpevNZS85o6okV7HetkVNwwCU27gQwMQe5tymva6SKaTKRy3UKVCXSaYPJUwR8rsrNzTKXOFGjVPeFHJhIgiQoiPERDMWrGqz5me/XqTV37nX8UU9XfJXU/phnXtk5gCb7sGtuxtHNZ20tsxYC/l5S1ZbOrJPXLqdSQJLL2guVpNTbqYMDc+gmVQnNOUiHwBgAcYHhFi1FQ/yW/vy2nT0v3O9xz6LeCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgCK3ywDvTE1H/AJ6rU+6JH8EVVcWqnK/+9MTX1arU+6JH1vz9GKquALF7kTPyjtXPp6pL2vdxOaEcAI+AMxBl5Ez8o7Vz6eqS9r3cTmePrY9fMAU+HKVu+7ai+r4jTHj/AKzcRoXiXHt9dlxr+v8AbTm+lz7O6XLn19QU+Rp4JRU8hlBHMsfi3arkW5hUVyCYUzCAGyUMCPgjTN5ijtTvOVXo+wKfvmANWsI2leYo7U7zlV6PsCn75h5ijtTvOVXo+wCfvmANWsTMORgYDXBesfBaF39TsksaGfMUdqd5yq9H2AT98xKs5KNs/dZGk/V5dmr9RFgK/tRTc3ti5lctnFVSwjNm8fmcFODVFQqqgiqJQyAYDh6EAWAXTFYdyzvvitn/AN75Kfbt7FnjFYdyzvvitn/3vkp9u3sAQ+IunNiD3rfSB6lck/iCRSxxdO7EMc7LjSCP/NXJPvcniD+CAM6tTTtzL9PF7H7JdVq8Z2vrVw1coKGSWQXSkD46aqShBAxFEzgBiGKICUwAIDmKSWrNXeqFOqqlTTv7dYiadQTkhCFrOdAUhCzFyUpSgDrAFKUAAADgABiLtHVLj4W6+ufpU1z0el5/FFHV/wAltUemKd+2bqAJGfJ0Lt3PvztXLC20vRXtVXRt9O5PX6s3o2uJy9qGnJkoxpd45ZneSqYqrtFztnBCrImUTEU1CgYogIRaKfCf6WvpAWoHOMj5S5Lx+o16+nhFSjyeC+FqNO21SsTdW9VcSS3dvZDKK+Rm9V1C4FtKmCr+l3jVmRdYCHEpnDg5Ukw3R3jiARZ4ebY7LDHzall/AH+z5/4Oxv8AR44AjAcr0aNdLdEaUnmnJulZJ3U08q5GoXFtCBSS05SaINzNk5ieUA2M6IgJhFMqomAuRwHEYgv/AA3uqP6f92PZrPPfcS+OVva5dJ2rqidK7HTffGiLtu6UndWr1ChScwM9UlSTtBuVso6AySYEKsJTATiOcDEHuAOWVpXlaXGnRqjryqJ5V8+O3RaHm9QTFzM5gZs33uYQF06OoqKSW+fmyb26XeNgOIxxOM4bDbNnXJqeoNK59hNNtx7nUEtM3smSqemZUR3LDzOXAiL1mVYVyDzzcF0ucLu8N8vhjug2xS2ppSiYdFV6AAoCIj5Ap8AAMiP658EAatozj2aknlc/15aVpNO2DWaSqY3lopq/l75Ejho7bKzdsVVBwiqBk1EjlESnIYBAQEQEIw7qql5/RFSz6j6rlbqSVNTE2fyKfSd6Tm3krm8scqNH7F0mAiBF2rlJRFUuR3TkEMxlds8a0pa3WtrTPW9azplTtKUzdykJvPp3MVBSZSyWs5q3Vcu3KgAYSJIplMc5sDgAHhAF058J/paHH9L/AGn9hclD/wAqERtuVLW+ofTfszZhcKwdKSKz9cp3bttLCVbb2XN6Xn5ZdMJ4mg+YlmcrI3dA2dJDza6IKARQgiUwCHCNxfm2OywD+zVsx4P6vnHo/wCzfd64jj8qD2kOh/VHs1ZhbSwOo63V0K7UuxbibEpmmJod3MzS6WzxNd87BEUSBzLZEBOobe4FARwMAQGfhvdUf0/7r8P+Wk7D/wA19yJ4vJE5bLdUNmtT821GMm17ZpTtbUw0kD65SRKtdShq5YOjrt5evNwcnaoqnKUyhEhKUxgARDgEV1sTquSUa79I+kazupuTaj760NaSZ1PWdNPZCyqyYmZLTNq1YOU112pSpKb5EjmApxyGBMHCAJ3waP8AS0P/AOgFqPQ8pkl4D1hwax5+E+0ted/tR7C5L71jEANtjssPPqWXyPTifKAH3W38MZ/2evPa+/8AQUouhZ2s5NX1BT4VglFTyFcXMsfi3MBFgQWEpd7mzGADcAwIwBwFPSFpeSUIqlYO1SaqZinTOWjJKBiHIYDFOUexcgYpgAQEB4CGQ4xkM2bN2TZuzaIpt2rRBJs2bolAiSDdBMqSKKRC4KRNJMhSEKAABSlAA4BHvhACEIQBwWurZW8ucxbyu4dF05WkuaLA5bMqklTSatUHAcAWSRdpqEIqAdBgABAOuOqvhP8AS153+1HsLkvvWMj4QBjh8J9pa87/AGo9hcl96w+E+0ted/tR7C5L71jgGofaG6L9J9Wy+hNRGoS39qatmkqTnkvkVVTMzN86lKqhkU3ySZUlMoGVIYgGyHdFHhHQHm2Oyw8+pZj7PKe9oAy++E+0ted/tR7C5L71jpTUjpW03U/YC808klj7ZSqbym2lZTCWzJjSMnbPWD5pInqzV41cEbFUQcN1iEUSUTMBiHKBgHIR1Z5tlssPPq2Y+zynvaOl9Ru2X2YlSWDvJIJJrIs9MpxObbVhLZZL289UMu9fPJG8QatkS9jhvKLLHImQM8TGAIAqZqp1b6nm1TVE2b36uoig3ns3QQRTrOdFTSRSmDhNNMhQdYKQhClKUocAKAAHRG63k512rnX62rthraXpryqbo2+nUluEtNqNricvaipyYqsaVeOWajyVTFVdouds4IVZEyiZhTUKBi4EIjiVO4RdVJULpuoVVBzPJs4QVL8aqis/cKJqF/uTkMUweIY3Q8nevjajTrtU7FXVvXXEkt3b2RSa4CE3qqoXAtZUwVmFLPGrMi6wFOJRcODlST7kcmEAgC2s+E/0ted/tR7C5L71iF/yvNm10t0VpSd6ckErJOqlnVXJVA4toUKSWnKTVFuLZOYqSjsYzoiAmMKRVRMBBEcAGRiUCG2x2WPXrUsv60+U97RF05ShOZZtc6W07yXZvu0tW80tVNKke3CZWmHyaWpVrN0kSS1aaFP2OCJHZkzlREBNvCUfBAEGz4b3VHnPwf7sezWd/wAHZeIstOS+23oHUZsvpHca/FH0/d2vFrwXElStXXAljapp+pLWBZGLJieaTNNd0Zs155XmERU3E+cNugG8MQCPMUdqd5yq9P2AT6/+0/ViyU5Mdp4vTpi2Y8kthfq3lQ2xr1vd64U3WpipmoNJknLJiSSAyeCiBzhzLnmFebNvZHcHgGIA3DONIOlsjdcxbAWoAQRUEBCi5LkBAhhAQ/QvUOB9bMU5mt3U3qFo/WHqepWlbz3Hp6mqdvtdGTSGRSmqpsylcolMurGbtWEul7NBwRFqzZtkk0G6CRSppJEKQgAUoBF2C6/Wzj9wW/izRRl7QD5uLVx++Ju97uZ3AGUuzl1IX8r3XJpho6tLwXCqmlaiu/R0qn1PTyqJpMZTN5a7mzdNyxmDJw4Og5arpmEiqKpDEUKIlMAhwi4H+E/0tDjNgLUZxjhRclx636Film2dta0tbnW7plritp0yp2lKYu5SE3n07mKgpMpZLWc1QVcu3KgAYSJIplE5zYHAAMW7nm2Oyw8+rZfpx/V8/vbo8cAaceVL2+ojTfsz3twrB0rIrP1yS7dt5WWrLey5vTE+LLphO00XrIJlKyN3QNnSWU10QU3FSCJTgIRW2/De6o/p/wB2OnPyazv330eLoixT5QRqQsftRtCDvTVoDuPTuqG+i1yKHq1K2tsXQzepT05Tk1I9nc2K0ORABaS5oBlnB9/JSAI4GINXmKO1O85Vej7Ap++oAmFckSlUt1RWY1QTbUYya3smlO1vTDOQvrlJEqx3KGriXuVF0JetNgcqNUVjlKZQiQlKcxQEQEYmK/Cf6WuuwFqBH0lyUPuA1xENbk2tW05skLXX8o3aOTZppJqm51VyGdUHJbsH8hXtTymWMl0H72WkIDjnkWyyiaahhEu6Y4BjjEmvzbHZYY+bVsx6Hk8pn72gDL74T7S153+1HsLkvvWONVnpH0ws6Pqp21sLatBy2pydOG66VGyYiqKyMtcqJKpnBrkiiZygchiiAgYAEOIBHctnrzWwv7QUoufZ6s5PX9BT7nvIip5E4FzLH/MGAi3MLCUgm5swgBu5DAjHJK7z5SKxxxHyrT8P/pTuAKQ+9+q3UrJ703elEqvnc+XyuV3Qr+XS1g0q+cINGLBjVc2bM2bVBNyUiLds3STRRSIAETTIUhQAAAI6v+G+1SfT/uv7NJ176jh+oH5fV7fVduT7sp1HwbX2suBemuZDbW11LTStK6qh0DGQU1JUQcTKaOhATAg1SExQOfACON4OEAdnfDfapPp/3X9mk699RLE5JlUk/wBTmru79LahpzMb0U7KrYrTGWyO5Dpaq5YyfFclAHjVpNjOUUXAFyUFCFA2OGYj8eYo7U7zlV6PsCn75iRZycy1twNk/qTuVdvaI0tNNKNuKvoJamabq26qISaUTefHWBQksaOCGXE7oxAEwEEocA6YAn4jpA0s9AWAtRkej9JclHo/7LjxRXecrHq6qNMuvO19F6ep9NbMUlMrFymcv6btw9WpWTu5srOHiSkwcMZSdu3VeHTIVMy5iCoYpQARwAROGDbYbK8B4a1bMcAx/V5Tw5+dohTcotstdHau6vqAvvs8KKnWqy0VMWkl9DT6u7VoBOZFK6saTN08cSN05OdASPkmyySx090cEOUc8YAid/De6o/p/wB1/B8ms799/d6YuLdjRUE7qjZpaTZ9Uc1fTudTK10jcP5pM3Kjt88XO2TEyzhwsYyiqhhHInOYRHrGKo/zFHanecqvR9gE/fMWPezY2kGh/SLok0/ad9R+o63VpL1WuoSV01X9vKsmpmVQ0vPWSJU3UtmjUEVARcoqAYpygcwAPDMAbtdVfzNN+fUnrr3PP4opqu+Sup/TDOvbJzFxBqQ2y2zFqWwF5afkesez0ynE6trWMslkvbz05nD188kbxBs2RL2OG8osqciZA4AJjAGQinZqZdF1UlQOm5yqoOZ3Nl0FSjkqiKz9womco9ZTkMUwD4BCAN/vJb+/LadPS/c73HPot4IqHuS4hnbK6dA/5P3N9xz6LeGAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgBCEIAQhCAEIQgCK3ywDvTM19Wq1XuiRiqri1U5YB3pma+rVar3RIxVVwBYvciZ+Udq59PVJe17uJzI4Ac4HPRw8Hj8UVXnJ5duDpy2UVub50le2h67qt/cqpJJN5QtSR2BEWyEtaLoKkddlkObfMdUBKJOGAHMSO+3NNn99Jm9f16SfkYAmEwiHr25ps/+qzN6vr0lD/7Ix57c02f30mb1/XpJ+RgCYTCIe3bmmz++kzev69JPyUeB5Zns/8AHCzN68/u0k4f/JgCYVDjnp4Y6PH4cxD1Dlmez/45s1evxBz0k4evzIR57c02f30mb1/XpJ+SgCYTFYdyzvvitn/3vkp9u3sb5x5Zns/88LNXrxx/3aScR6v9x4ej9yIePKANpxZ7am6qqCvfZemKopanKYtcyop4xqszU75SYtpi4dnXSFoQifMGIqABkN4DAMAaH4unNiF3rfSB6lck/iCRSxxdO7EPvXGkD1KpH97pwBnDqm+Ztvr6lNc+55/FFHV/yW1R6Yp37ZuovXNU3zNt9fUprn3PP4oo6v8Aktqj0xTv2zdQBx2EIQAhG23ZZbH6/O1fnVzJJZGr6NpRza9lK305PVpHhyOk5qdRNArXsQ5B3iCmIn3s8BDEbmu0ztoD9OSy31md/lYAk18kS70XIfVyuh6P6nT38HVEn9zwbOB/9Qr/ABZogxaS9pdaHk09pkNmrq8pqqLlXdk87md3F6ktiZqnTB5FcAG5JW0ISaFUdA8QGSOOyRE24O+nu9cZMn5ZdoAXIZAtmr1AZYopFEVpIAAKgCQBH4iPQJggCvT2gvzcurn98Tdz3bzmMPomZ19yWnWjrSrerNXFvLoWpk1C6lKhm17aQlE8SmwziW07cp6tVkoYzMW6gIC+bMZqgk5FIATFYp9wALgI4l2mdtAvpx2V+szv8rAEPmETBh5GdtAeq8llfXRnYf8A3RjX9tJOTu6rNmXp4X1H3huHbipaSb1RT9KmltLpzIsyF7UT0rJoqAujmS5pNQwGU4Z3c4HMAR+oQjdTstdh9qO2rtJ3Hq+yNbULSjC2s4l0mnCVWpvzrOXEyQUXRO1FmcpdwhUxA4H45EMDAGlaLg/k1GfMiNOfHhztTY/yxDiHoxD37TO2gP05LLfWJ3+VieFsjNHdfaD9C1qNNNzJxJp7V9Dnm5pjMpAVcsrXCYLpKpdjlcCKoboEEDbw9PRAGy+EIQAhGNOr3U7R2jnT1cbUXX0rms4pO2snGczeXSQUizJy3KcCCRqZYDJApkc92GMRGM7c02f30mb1/XpJ+RgCYTHjgIh0jjiHg8H1QjRfsw9vVpm2p11KptPZWgbgUtPKUpxSpXzurFJeZoqzTOBBSRBoQp+dER4ZHEb0AD1ujh4PD6MAVhnLOs+aL2fyGP6XqU8On/f17EPuJgvLO++MWf8A3vUo9vXvrRD6gBCJQmljkq+tbVhYO2+oOh7p2nlVLXMp5pUcml82Sm5pi2aOyAdNJ0KKgJiqAD3W4ABnhHalf8j/ANeNvKIq6u5td6zi8so+nprUb9FujOgXWaShms9cJIiZUSgqdNExSb2Q3hDMARJ4R+2ZMVJZMX8tWMUy0veumKpiZ3TKNF1EFDFzx3RMmIlzxwIRl7oH0U3D2g2pqidLtrZ1I6frOuGk9eS6aVEC5pUgnIZYtM3QLg2EqomURRMRPdEO6EM8IAw1ieHyJL5YOsj+8FE/x7uMQu0ztoF9OOyv1md/lYzl0X0k/wCSgv6wrLW6qjdaX6oUGUmo1C0m8kvK16UMZZ8pNfJfnAMRUrgoIgiADkB3hgCwLNnA445wABjo8P1fuR5DoD0PDn7sQ9e3M9AACOLNXrHPhXkvD/5PR4vuxIW2cW0BtdtKtODLUraGn6hpqkHtVz+kk5bU5mxpmD6nwZmdLCLUpUuZU7NT5vAb3cmzAGdzr9bOP3Bb+LNFGXtAPm4tXH74m73u5ncXmy5ROiqmGcqJqEAcZABMUSgI+LIxXD6n+SM66rz6jL5Xbp67Vn2ciuVdWuq3lDR8lOezG0uqao5hN2aDrcU3OfSbukyK7oAXfKbAYgCEJCJg3aZ20C+nHZX6zO/ykO0ztoF9OOyv1md/lIA6f5H/AN9jl3DP9BS6fDOP94FYtUorr9I+zvutyZa6qe0d1hVBTdzLTspNNLVHpy15XKdSmndwm5pNKnYGmhlG3YjdwoU7gN3f3AHdEBjaMPLM9AHVZm9QePnpIP3OZ/lgDVDy2Qf6Pmkj1P6tD/6mziDfE+DWhaud8q5n1J3j0SOmlqZBprl7ui6uZXaA6z2ZTCo1SP2a0sGUc0QqCaTY5VQVATbwhjhGEvaZ20B+nJZXxfEZ3+V4fdgCYdya3vROnDw71SZx/wBcQjdzXgZoisQ6f0rz/gP96nUQrdOG2w08bCO0tO7NPUrRNcV3d6xouRqSpaBOxJTD7ydOV027ALMCHdBuEREFOcMPEQxHdL/liOgmsGTuk2FnrzIvanauKfaKrrSbmU3U5SPLm6iu6jvc2ms4IY+BzugOIAreNQPy+r2+q7cn3ZTqNlewP76/pF9PxPvZSNyk/wCSM66r0T2dXip67Vn2UguxNplcuRs3yU5F60k9dvFqoljZ2KagEF0gymqCTgSABOdIfdDdxHY9idgTqf2OF1KS2jV/q9t9WFptNT8Kyq+nKLTmJKlmcvKUUBQlhnpzNSrCY4DlUolxmALJQM9ePW/l8cQx+WhfMUWP9Vtv97H/AD/MY5h25ps/vpM3r+vST8jGHGsjU9R3KnaNkmlPRZK5ra2t7TTUtyZ5NbrikrKHcoRKKAtmhZSCawOhMbICcRLjPCAK9eLPTkYne5rv/vhpx7RMY0JdpnbQH6cllvrM7/Kxsu0dayaB5LRbycaHdZ8mnV0rkXMqBW9knnlqRQSkTWnZogSUIsnRZsVVcXxV2ahziUwJ7ghgM5gCeEIZx0dPHOf5OuKVrbZd9C1geqxP/vlSJzfbmegDOfgNXr9Dn5LgP/k8eP1PHGmm9HJ3dVm1dubV20DshcO3FK2u1NTVe41H0/VqcyNUMslM4MLhu2mhmZytjOSFOAHFIoEz0QBCohEta4HJANeVu6Gq6vJtd6zbiV0fTs2qOYINkp12Qs0lDJZ6umjvqbvOnTRMUm9w3hDMRNZiyUlswfy5YxTLS966ZKmJ8aZRquogcxc8d0TJiIZ6hCAJBnJb+/LadPS/c73HPot4IqH+S39+W06el+53uOfRbwQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEARW+WAd6Zmvq1Wq90SMVVcXcm062dNutp5ptcaa7nVRP6RppzVdOVYabU4KQTEHdOPivmyAc8UxOaWUKBVevdHhxiOh2lvox+n3d3/Gl/5KAK0qEWWvaW+jD6fd3f8Zh+Sh2lvow+n3d3/GYfkoArSoRZa9pb6MPp93d/xmH5KHaW+jD6fd3f8Zh+SgCtKhFlr2lvow+n3d3/ABmH5KHaW+jD6fd3f8Zh+SgCtKhFlr2lvow+n3d3/GYfkodpb6MPp93d/wAZh+SgCtKhFlr2lvow+n3d3/GYfkodpb6MPp93d/xmH5KAK0qLp7Yh9650g+pXJOjj/W6caFu0t9GH0+7u/wCMw/JRK10k6cKc0kaerY6eaSmswndPWxp1pTkrmk0Eov3bZmQCEVciQALzggGR3QAOMAfU1TfM2319Smufc8/iijq/5Lao9MU79s3UX0lxKOZ3DoSsKEmC6zZjV9OTenHjhvjn0W04YrMVlUs8OcTTXMYueG8AZ4RD8mnIxdGc0mUwmSt+btkVmL52+UIUzDdKd24UcGIXKQ9yUyggHHOIArPIRZa9pb6MPp93d/xmH5KHaW+jD6fd3f8AGYfkoAwK5En8sXWP6XaL++XMWHHRGkXZM7EOyWyWnl0p3aa4NZVovdJjKWM0JVAtxTZklKiiiJmwIlKO8cVBA29kMdEbuBEejd6REOnq8Pi9CAKozldXHa5z0Q6BsXa7+NqP8+PHwxGCb/rhD92S/wA8sW220x5OBpy2mepd5qZuZdSv6RqZ5SFPUeeUU4LXyOKzp4z4zdcvPEMfnVezlOc447kMRr7T5F1oxTUIf4Pd3R3DlPjeYcd0wDj9S8UASfNnt8wxpG/e72j9w8ljMSOr7J2vllkrQ20tBJXbh/KLZ0RTVDyx87x2U7Y0zKGkoauHG6AF55VFoQ6m6GN4RxHaEAIiscsB705M/VptV7oUolTxrp2nWzot1tPNN7jTZc+qKgpGmnFVU5VhptTgpBMAd04+K+bIAKxTEBJVQoFU4Z3RHHHEAUjsWMXImflE6ufT9SXta7jtPtLjRgHEb9XeHxAZhkf/AJUby9k3shLQ7Jmj7mUfaet6qrRpcycy2czNeqBQFVotLUFEEk23MlKG4cqgibIZyEAbeIR445HwcMfyx5gBCEIA08be/vUWrj0hKfx5IpjovV9Zel+mNZenK5Wm+spvMpDTdzJMaTTObSjcCYNEROB99uKgCQD5DHdAPTEV3tLfRh9Pu7v+Mw/JQBp+5F/825ez1I3X3ySLMSNBeyr2BFg9lTdqrLtWruTXFZzaraZUpl2yqYzbsRFsooCgqpAgQpudAQDAiOMZjfnjw8eOQ6seD0YArDeWd98Ys/8AvepR7evfWiH1FvltUuT7aftqpfKmL53UuZXVHT2l6JbUQ1l1Mi2BksxbO1nhXCnPEMfnzHVEo4HGADh4dYYci30X9d+7vdIdbDo6/wDcoA31bEbvXWj/AIY/oUyL72T4+vGbeqkM6ar74+lRXPuefR8/SXpxpzSVp6tjp5pKazCdU9bCnGdNyuaTTdF+8bMyAQirncAC84YAybdAAz0R21cWjGdxaCrGgpi4WaMKxpub028ct8c+3bThksxWWRzw5xNNYxiZ4bwBnhAFC5V/yW1R6Yp37Zuo35cl078ppz/vDcz3HPolXzTkYujSaTKYTJW/N3CKzB87fKFKZhulO7cKODFL8S+NKZQQDxRmZs9OTJaZtnnqlobVPb27dxaoqqhWc/ZsZNPhaDLHBJ/K1pWuZbmiFPvJJLGOTA/HAEASachkQ8HT68QOeW3D+kLRsHhn1bfxDWJ40ac9rPscrO7WmT2tkt2a6q2ikbWPJs9lSlLigBnh5sVMixXPPlMGCAmAlx4YApk4tduSK96Jp31cLof5lPRh/wBpcaMOj4PV3fDneYfUxzcSPNmfs97fbM3TQy0zWzqee1bTLKrqgq5ObVEKQzEzyoQZA5QNzRSk5pLsJPm8BnujZ6ggDYNCEIAQhCAIqvLAu9PTD1arWe6BOKrGLuHad7Oa3W0903rabrnVTP6Rppaq6dqw01pwUgmIO6delet0A54pic0qcu6pwzgeER1O0uNGH0+rujx/bMOIeD9S+7AHVvImvlDaufVApP2sdxOUjUPsnNkLaLZM0dcyjbTVxVVaM7mzmWzqZuKoFEVmi8tbqN0iNuYKUu4YqgibIZyARt4DoDrgCno5Sf33XUf6FN/eS0aSKF+Taj/TRIPbVpFqhry5L9ph16amK61M15d249N1NXYMAfymRi08jm/YCRkk+YBVMT90UwibI8RjEyT8jI0aSebSybJX5u4orK5gzmKRDGYbh1WTlNyQh/iWd0xkwA2OOBgCWnp8+UJZD1Iba+4ySxrS2+nentXXpCP98pxtkommG1E0bSVGMllHDKkaYkFMM11v1ZdrIZU0lSCy2OHOKJNCHPjhvGGOhNZmlymNZunC5em6s5xMpDTVzJMMmmc1lG4ExaIioVTnGwqAJd/JccQ6PHAFFTEzbkX2fh2b3gAiH9CNx6H66J4+nq6I3ADyLfRh9Pu7ocR/ZMOjqD9S6o2n7KvYFWE2VF2Kuuzaq5NcVnNqupo9Mu2VTGbdiINjqAoKyXMlKbnAEMehAG/LIYznh+YRWFcs6741aL97zJvbx9Fnt6MR99qlyfTT/tVL6UzfS6lza6o2eUzRDWiGsupkWwMlmLV2s8K4V54hjc8Y6xijgcboBAFQfF1HsSu9d6QPUokP3qlGhHtLjRgAh/R7u8P/AO5h1eEea4ZiVvpM0507pL092x09UnNJhOqethTjOm5XM5oJBfvGzJMqZFnO4AF5wwFyOADjAH7dVnHTRfkOsbTV17nn8UU9XfJXU/phnXtk5i+iuNRbK41BVjQMxXWasKypqb028dN8c+g2nDJZisqiIgIc4RNYxiZDG8AZiH/M+Ri6M5nMphMlL83cIpMHzt8oUpmG6U7tc65ilyl8aUyggHigCKpyW/vy2nT0v3O9xz6LeCIy+z05Mnpn2eOqWh9U9vbt3FqiqaGY1AyYyaei08jXJKgla0rcGW5pMp8ppLGOTAh3QBnhEmcM9PhxgMdEAeYQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQAhCEAIQhACEIQB//9k=';
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
                    background: 'linear-gradient(145deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)',
                    borderRadius: '18px',
                    padding: '32px 28px 24px',
                    maxWidth: '380px',
                    width: '90vw',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)',
                    color: '#fff',
                    textAlign: 'center',
                    position: 'relative',
                });
                // Close button
                var closeBtn = document.createElement('button');
                closeBtn.innerHTML = '\u00d7';
                Object.assign(closeBtn.style, {
                    position: 'absolute', top: '12px', right: '16px',
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    borderRadius: '50%', width: '28px', height: '28px',
                    color: '#fff', fontSize: '18px', cursor: 'pointer',
                    lineHeight: '28px', textAlign: 'center', padding: '0',
                });
                closeBtn.addEventListener('click', function() { overlay.remove(); });
                card.appendChild(closeBtn);
                // Avatar placeholder / icon
                var icon = document.createElement('div');
                icon.innerHTML = '\ud83d\udc68\u200d\u2695\ufe0f';
                Object.assign(icon.style, {
                    fontSize: '42px', marginBottom: '8px', lineHeight: '1',
                });
                card.appendChild(icon);
                // Name
                var name = document.createElement('div');
                name.textContent = 'Ho\u00e0ng Anh Jupiter';
                Object.assign(name.style, {
                    fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px',
                    marginBottom: '4px',
                    background: 'linear-gradient(90deg,#a5b4fc,#c4b5fd,#f0abfc)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                });
                card.appendChild(name);
                // Divider
                var div1 = document.createElement('div');
                Object.assign(div1.style, {
                    height: '1px', background: 'rgba(255,255,255,0.15)',
                    margin: '14px 0',
                });
                card.appendChild(div1);
                // Contact
                var contact = document.createElement('div');
                contact.innerHTML = '\ud83d\udce7 <a href="mailto:bsdha.btu@gmail.com" style="color:#a5b4fc;text-decoration:none;font-weight:600;">bsdha.btu@gmail.com</a>';
                Object.assign(contact.style, { fontSize: '14px', marginBottom: '10px' });
                card.appendChild(contact);
                // Copyright
                var copy = document.createElement('div');
                copy.textContent = 'Copyright \u00a9 Hoang Anh Jupiter';
                Object.assign(copy.style, {
                    fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px',
                });
                card.appendChild(copy);
                // Donate label
                var donateLabel = document.createElement('div');
                donateLabel.innerHTML = '\u2615 H\u00e3y \u1ee7ng h\u1ed9 t\u00f4i 1 ly Tr\u00e0 b\u1eb1ng c\u00e1ch Donate';
                Object.assign(donateLabel.style, {
                    fontSize: '14px', fontWeight: '600',
                    color: '#fde68a', marginBottom: '14px',
                });
                card.appendChild(donateLabel);
                // QR image
                var qrImg = document.createElement('img');
                qrImg.src = qrSrc;
                Object.assign(qrImg.style, {
                    width: '220px', height: '220px', borderRadius: '12px',
                    border: '3px solid rgba(255,255,255,0.2)',
                    display: 'block', margin: '0 auto',
                    objectFit: 'contain', background: '#fff',
                });
                card.appendChild(qrImg);
                overlay.appendChild(card);
                // Close on overlay click
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) overlay.remove();
                });
                document.body.appendChild(overlay);
            }
        }
    ];

    // ================================================================
    //  DROPDOWN MENU (gan vao body, position:fixed)
    // ================================================================

    var MENU_ID    = '_mtt_menu';
    var WRAPPER_ID = '_mtt_wrapper';
    var _styleInjected = false;

    function injectStyle() {
        if (_styleInjected || document.getElementById('_mtt_style')) return;
        _styleInjected = true;
        var s = document.createElement('style');
        s.id = '_mtt_style';
        s.textContent =
            '#_mtt_menu{display:none;position:fixed;z-index:2000000;background:#fff;' +
            'border:1px solid #d1d5db;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,0.22);' +
            'min-width:275px;padding:8px;flex-direction:column;gap:6px;}' +
            '._mtt_item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;' +
            'border-width:1.5px;border-style:solid;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;' +
            'text-align:left;background:#fff;transition:opacity 0.2s,transform 0.1s;}' +
            '._mtt_item:not([data-unavailable]):hover{opacity:0.78;transform:translateX(2px);}' +
            '._mtt_item:active:not([data-unavailable]){transform:scale(0.97);}' +
            '._mtt_item[data-unavailable]{opacity:0.32;cursor:not-allowed;filter:grayscale(0.5);}' +
            '._mtt_sep{display:none;}';
        document.head.appendChild(s);
    }

    function getOrBuildMenu() {
        var existing = document.getElementById(MENU_ID);
        if (existing) return existing;

        injectStyle();
        var menu = document.createElement('div');
        menu.id = MENU_ID;

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
                    openSubmenu(item, action.flyoutItems);
                    return;
                }
                menu.style.display = 'none';
                action.fn();
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        return menu;
    }

    // Dong menu khi click ngoai — bind 1 lan duy nhat
    document.addEventListener('click', function(e) {
        var menu = document.getElementById(MENU_ID);
        if (!menu || menu.style.display === 'none') return;
        var wrapper = document.getElementById(WRAPPER_ID);
        if (wrapper && wrapper.contains(e.target)) return;
        if (menu.contains(e.target)) return;
        var sm = document.getElementById(SUBMENU_ID);
        if (sm && sm.contains(e.target)) return;
        menu.style.display = 'none';
        closeSubmenu();
    }, true);

    function updateMenuAvailability(menu) {
        menu.querySelectorAll('._mtt_item').forEach(function(item) {
            var idx = parseInt(item.dataset.actionIdx, 10);
            var action = ACTIONS[idx];
            if (!action) return;
            var available = !action.check || action.check();
            if (available) {
                item.removeAttribute('data-unavailable');
                item.title = '';
            } else {
                item.setAttribute('data-unavailable', '1');
                item.title = 'Không khả dụng trên trang này';
            }
        });
    }

    function openMenu(anchorBtn) {
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
            if (label.indexOf('Lưu thay đổi') !== -1 && !luuThayDoiParent)
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
        // Kiem tra co nut "Luu thay doi" khong (dieu kien can)
        var saveBtnEl = null;
        container.querySelectorAll('dx-button[aria-label]').forEach(function(btn) {
            if (!saveBtnEl && (btn.getAttribute('aria-label') || '').indexOf('Lưu thay đổi') !== -1)
                saveBtnEl = btn;
        });
        if (!saveBtnEl) return;

        // Lay hoac tao wrapper
        var wrapper = container.querySelector('#' + WRAPPER_ID);
        if (!wrapper) {
            wrapper = buildWrapper();
            // Bo order CSS, dung vi tri DOM thuc de dinh vi
            wrapper.style.order = '';
            container.appendChild(wrapper); // tam chen vao, se doi vi tri ngay duoi
            if (_injectedContainers) _injectedContainers.add(container);

            // Theo doi: neu wrapper bi Angular tach ra, xoa dau kiem de inject lai
            var wrapperObserver = new MutationObserver(function() {
                if (!container.contains(wrapper)) {
                    wrapperObserver.disconnect();
                    if (_injectedContainers) _injectedContainers.delete(container);
                }
            });
            wrapperObserver.observe(container, { childList: true });
        }

        // Dat wrapper vao dung vi tri: sau "Them moi phieu", truoc "Luu thay doi"
        ensureWrapperPosition(container, wrapper);
    }

    function scanAndInject() {
        document.querySelectorAll('.footer-dynamic-form_btn_container').forEach(function(container) {
            tryInjectIntoContainer(container);
        });
    }

    // ================================================================
    //  OBSERVER: lang nghe moi khi co phan tu moi them vao DOM
    //  Neu phan tu do LA hoac CHUA footer-dynamic-form_btn_container => inject ngay
    // ================================================================

    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var target = mutations[i].target;
            var added  = mutations[i].addedNodes;

            // Neu target chinh la container (Angular them/xoa ng-star-inserted con)
            // => goi lai de dam bao wrapper dung vi tri
            if (target && target.classList && target.classList.contains('footer-dynamic-form_btn_container')) {
                tryInjectIntoContainer(target);
                continue;
            }

            for (var j = 0; j < added.length; j++) {
                var node = added[j];
                if (node.nodeType !== 1) continue;
                // Neu chinh no la container
                if (node.classList && node.classList.contains('footer-dynamic-form_btn_container')) {
                    tryInjectIntoContainer(node);
                    break;
                }
                // Neu chua container ben trong
                var inner = node.querySelector && node.querySelector('.footer-dynamic-form_btn_container');
                if (inner) {
                    tryInjectIntoContainer(inner);
                    break;
                }
                // Neu node duoc them vao la con cua container
                // (Angular them ng-star-inserted => wrapper co the bi doi cho)
                var parent = node.parentElement;
                if (parent && parent.classList && parent.classList.contains('footer-dynamic-form_btn_container')) {
                    tryInjectIntoContainer(parent);
                    break;
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

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

    // ================================================================
    //  KHOI DONG
    // ================================================================
    scanAndInject();
    // Fallback them o cac moc thoi gian de bat nhung truong hop load cham
    [200, 600, 1200, 2500].forEach(function(ms) {
        setTimeout(scanAndInject, ms);
    });

})();
