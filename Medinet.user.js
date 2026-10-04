// ==UserScript==
// @name         Medinet
// @namespace    http://tampermonkey.net/
// @version      14.21
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
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @updateURL    https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js
// @downloadURL  https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js
// @supportURL   https://zalo.me/0868919790
// @homepageURL  https://medinetautofill.github.io
// ==/UserScript==

// ==Changelog==
// 14.21 | 2026-10-01 | Chế độ hàng loạt: TẠM KHÓA vì chưa hoàn chỉnh - nút đổi tên "Chế độ hàng loạt (đang phát triển)", làm mờ, không bấm được; khi cần mở lại chỉ đổi BATCH_ENABLED = true
// 14.20 | 2026-09-30 | CO DINH Ma may: luu MID ben vung (GM + localStorage), khong tinh lai moi lan; tu khoi phuc MID cu tu cache vi; sao luu Device Secret. Thuat toan van tay cu GIU NGUYEN de khong doi MID khach hien tai
// 14.19 | 2026-09-30 | Chế độ hàng loạt: hộp thoại hiển thị phụ thu theo Medi (0.3 Medi/người khi Lưu tay, 0.5 Medi/người khi tự động Lưu) thay vì theo lượt — mức phí thực tế không đổi
// 14.18 | 2026-09-30 | Chế độ hàng loạt: hộp thoại bắt đầu có 3 chế độ CHỌN 1 (không bật cùng lúc): "Bấm Lưu tay" (mặc định) • "Tự động bấm Lưu sau khi điền, dừng lại khi lỗi" (lưu lỗi/không xác nhận được thì dừng tại người đó) • "Tự động hàng loạt, bỏ qua lỗi" (lưu lỗi thì ghi log "Lỗi: chưa lưu được" rồi chạy tiếp người sau, bạn sửa tay sau khi chạy xong và xuất log Excel) • Thanh trạng thái hiện chế độ đang chạy; hộp thoại kết thúc nhắc số người cần sửa tay
// 14.17 | 2026-09-30 | Chế độ hàng loạt: CHỈ CHUYỂN NGƯỜI KHI CHẮC CHẮN ĐÃ LƯU - sau khi bấm Lưu (tự bấm hoặc bấm tay) script chờ Medinet báo lưu thành công (thông báo/hộp thoại) và không có lỗi/ô chưa hợp lệ mới ghi "Thành công" và chuyển tiếp • Lưu chưa xác nhận được (lỗi validate, không thấy thông báo, trang tải lại): DỪNG tại người đó, hiện lý do trên thanh trạng thái, bạn sửa rồi bấm Lưu lại, hoặc bấm "Đã lưu — chuyển tiếp" nếu thấy Medinet đã lưu, hoặc "Bỏ qua người này" (log ghi "Lỗi: chưa lưu được") • Sửa lỗi điền lại + tính phí lặp mỗi ~2 giây trong lúc chờ Lưu (giờ có trạng thái riêng sau khi điền) • Không điền được ô nào thì không Lưu, bỏ qua người đó
// 14.16 | 2026-09-30 | Chế độ hàng loạt: CHỐNG TRÙNG - dòng trùng CCCD trong file Excel chỉ xử lý 1 lần (các dòng sau ghi "Bỏ qua: trùng CCCD" trong log) • Nhớ người đã điền THÀNH CÔNG (lưu 7 ngày) để lần chạy sau/chạy lại cùng file tự bỏ qua, không điền lại và không tốn Medi; có ô tích để bỏ chức năng này và nút xóa danh sách đã điền • Đổi tên nút "Autofill Data XN" thành "Điền kết quả CLS", nút "Auto Search" thành "Chế độ hàng loạt"
// 14.15 | 2026-09-30 | Khung "THONG TIN DOI TUONG KHAM" (Ho ten, CCCD, Ngay sinh, Gioi tinh) tren trang Kham can lam sang NGUOI CAO TUOI: CCCD doc NGAM qua iframe an trang Thong tin hanh chinh (khong chuyen tab; that bai 30s thi quay ve cach bam tab Ket luan), ghi nho theo cdId; ho ten/gioi tinh/nam sinh lay tu Excel theo CCCD, ngay sinh lay tu Medinet, canh bao do neu lech ten/nam sinh. Doc Excel THEO TIEU DE COT (doi cho/chen cot van dung, thieu cot se bao ro). Reset CCCD khi doi benh nhan (cdId). Bo cach bam tab Ket luan
// 14.10 | 2026-09-29 | Sua loi Auto Search dung im o o Dinh danh ca nhan (0 thanh cong): them fullClick (pointerdown+mousedown+click) truoc khi go CCCD - o nay can duoc "bam vao" that su moi nhan gia tri qua script; xac nhan gia tri da vao o dung roi moi bam Enter + bam luon nut Xem (fullClick), phan biet ro loi "khong go duoc vao o" voi loi "go duoc nhung tim khong ra ket qua" de de chan doan
// 14.9 | 2026-09-29 | Auto Search: cho ket qua tim kiem, gio BAT BUOC kiem tra dung so CCCD hien tren dong ket qua trung voi CCCD dang tim (khong chi thay-co-dong-la-vao) - tranh truong hop bam vao dong ket qua cu con sot lai cua nguoi truoc khi bang chua kip cap nhat
// 14.8 | 2026-09-29 | Sua loi tu doc CCCD (Ket luan <-> Kham can lam sang) LAP LAI moi ~10-15s khong ngung do cache het han: gio CHI TU CHAY 1 LAN cho moi lan tai trang, cache giu nguyen suot vong doi trang (khong con het han), khong tu bam lai nua sau khi da thu (thanh cong hay that bai)
// 14.7 | 2026-09-29 | Trang Kham can lam sang cua NGUOI CAO TUOI khong hien CCCD nen script khong doc duoc (loi "Khong doc duoc CCCD"). Tu dong xu ly ngam: khi phat hien thieu CCCD, tu bam sang tab Ket luan de doc CCCD roi tu bam quay lai Kham can lam sang, khong can nguoi dung thao tac. Ap dung cho ca nut Autofill Data XN, dien tu dong, va Auto Search
// 14.6 | 2026-09-29 | Auto Search: khi tim khong ra ket qua (co the nguoi nhap lieu da xep benh nhan sang nhom tuoi con lai), TU DONG thu lai 1 lan o danh sach nhom doi dien truoc khi bo qua han, khong can nguoi dung tu kiem tra thu cong
// 14.5 | 2026-09-29 | Auto Search: BO hop thoai hoi nhom tuoi - vi 1 file Excel co the lan lon ca 2 doi tuong, script TU DOC nam sinh tung dong (cot Tuoi) de xep dung nguoi vao dung link M3 hoac NCT, xep M3 chay truoc roi den NCT de han che chuyen trang qua lai. Dong khong xac dinh duoc nam sinh hoac <18 tuoi bi loai va ghi ro trong log xuat ra
// 14.4 | 2026-09-29 | Auto Search: log Excel xuat ra gio GIONG HET file goc da upload (du cot, du dong, ke ca dong khong thuoc nhom da chon) + CHEN 1 cot "Ket qua" ngay truoc cot Ho ten: Thanh cong / Loi: <chi tiet ro> / Bo qua: khac nhom tuoi / Chua xu ly. Nut Dung Auto Search gio cung mo hop thoai ket qua (xuat duoc log) thay vi tat lang le
// 14.3 | 2026-09-29 | Auto Search: ghi log tung benh nhan (thanh cong / bo qua kem ly do / thoi gian), nut "Xuat log Excel" ngay tren thanh trang thai (xuat duoc giua chung, khong can cho chay xong) va hop thoai ket qua sau khi chay xong danh sach
// 14.2 | 2026-09-29 | Auto Search: BO doc nhom tuoi tu trang dang mo (de nham lan) - thay bang HOI NGUOI DUNG chon nhom "Nguoi 18-59 tuoi (M3)" / "Nguoi cao tuoi (M4)" NGAY khi bat dau, chon xong moi chon file Excel, xu ly het danh sach theo dung nhom da chon; chon file/nhom khac phai bam lai tu dau. Tu dong dieu huong den dung trang tim kiem cho nhom da chon (khong can nguoi dung tu mo truoc). Van doi chieu nam sinh trong Excel de canh bao neu co dong lech nhom
// 14.1 | 2026-09-29 | Auto Search: dung nam sinh co san trong Excel (cot E) de xac dinh nhom tuoi thay vi giai ma CCCD (chinh xac hon); CHI xu ly cac dong dung nhom voi trang dang mo (M3 hoac NCT) - khong tu chuyen link giua 2 trang nua, ban tu mo dung trang truoc khi bam Auto Search; luon xoa trang o Dinh danh ca nhan (bo den + xoa) truoc khi dan CCCD moi, tranh dinh so cu
// 14.0 | 2026-09-28 | THEM "Auto Search" (thu nghiem): tu doc CCCD tu Excel, tu mo trang tim kiem M3 (18-59t) / NCT (>=60t theo CCCD), tu bam Xem, mo Chinh sua, vao Kham can lam sang, tu dien, roi DUNG lai cho ban bam Luu (mac dinh) hoac TU bam Luu (tuy chon, canh bao ro). Sau khi xong 1 nguoi tu chuyen sang nguoi tiep theo trong Excel. Phu thu: +30 luot/benh nhan (chi tu tim, tu Luu tay) hoac +50 luot/benh nhan (tu tim VA tu Luu), cong voi so o dien nhu binh thuong. Nut noi rieng "Auto Search". CANH BAO: tinh nang moi, hay thu vai benh nhan voi tu Luu TAT truoc khi dung that
// 13.4 | 2026-09-28 | Sửa số dư Medi hiển thị sai/nhảy lên xuống sau khi load trang & điền tự động: số dư nay = số dư đã trừ chính thức (Worker) − lượt chưa/đang gửi trừ (lưu bền qua F5), không còn cộng dồn 2 lần với live_clicks • Heartbeat không còn gửi số lượt cũ sau khi đã trừ • Bỏ qua token cũ đến muộn • Điền tự động chờ ví xác thực xong mới chạy (không hiện nhầm popup hết Medi)
// 13.3 | 2026-09-28 | Đổi cơ chế tính Medi: MỖI LẦN bấm điền (bấm tay, Excel, điền tự động...) đều tính 1 lượt cho MỖI ô điền / mỗi mục tích, kể cả ô đã có sẵn đúng dữ liệu (ghi đè trùng vẫn tính). Ô đã đúng thì không click lại (tránh bỏ tích), chỉ tính phí • Các trang Trẻ <6 tuổi tự chạy nền vẫn giữ chống trừ trùng khi F5
// 13.2 | 2026-09-28 | Đổi tên nút nổi thành "Autofill Data XN" • Chuột phải nút này thêm tùy chọn "Điền tự động sau khi load trang xong" (mặc định TẮT): bật lên thì mỗi lần mở trang Cận lâm sàng sẽ tự đọc Excel mới nhất, điền và hiện thông báo, không cần bấm nút
// 13.1 | 2026-09-28 | Thêm nút nổi "Điền Excel" trên trang Cận lâm sàng: bấm 1 lần là tự đọc file Excel mới nhất và điền • Chuột phải vào mục "Upload Excel..." (hoặc vào nút nổi) để bật/tắt, mặc định BẬT
// 13.0 | 2026-09-28 | Upload Excel CLS: mỗi lần điền đọc lại file Excel MỚI NHẤT từ ổ đĩa (không còn dùng bản cũ đã tải) • Hematocrit làm tròn 2 chữ số thập phân (0,407 → 0,41)
// 12.9 | 2026-09-28 | Sửa Upload Excel CLS: trang có 2 nhóm Nitrit (1 nhóm bị khoá) nên script click nhầm nhóm - nay chỉ chọn nhóm đang hoạt động và hiển thị
// 12.8 | 2026-09-28 | Sửa Upload Excel CLS: ô Nitrit không chọn được Dương Tính (radio không ăn click) - dùng click đầy đủ + thử lại, và báo lệch nếu Nitrit trên trang không khớp Excel
// 12.7 | 2026-09-28 | Upload Excel CLS: tự đọc lại giá trị sau khi điền, báo ô nào lệch so với Excel (vd bị làm tròn)
// 12.6 | 2026-09-28 | Sửa Upload Excel Cận lâm sàng: đổi dấu chấm thập phân thành dấu phẩy (4.78 không còn bị điền thành 478)
(function() {
  "use strict";
  if (window.name === "_mtt_cccd_frame") {
    (function() {
      var t0 = Date.now(), lastClick = 0, clicks = 0;
      var mCd = window.location.href.match(/[?&]cdId=(\d+)/i), cdId0 = mCd ? mCd[1] : "";
      var PE = (typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window).PointerEvent;
      function tap(el) {
        [ "pointerdown", "pointerup", "click" ].forEach(function(n) {
          el.dispatchEvent(new PE(n, {
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            pointerType: "mouse"
          }));
        });
      }
      function val(cls) {
        var i = document.querySelector("." + cls + " input.dx-texteditor-input");
        return i && i.value ? String(i.value).trim() : "";
      }
      function dob() {
        var v = val("NgaySinh");
        if (v) return v;
        var h = document.querySelector(".NgaySinh input[type=hidden]");
        var m = h && String(h.value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? m[3] + "/" + m[2] + "/" + m[1] : "";
      }
      function gender() {
        var e = document.querySelector(".GioiTinh .dx-radiobutton-checked .dx-item-content");
        return e ? e.textContent.trim() : "";
      }
      (function poll() {
        var inp = document.querySelector(".DinhDanhCaNhan input.dx-texteditor-input");
        var v = inp ? String(inp.value || "").replace(/\D/g, "") : "";
        if (v.length >= 9 && v.length <= 12) {
          setTimeout(function() {
            window.parent.postMessage({
              mttCccd: v,
              cdId: cdId0,
              name: val("HoTen"),
              dob: dob(),
              gender: gender()
            }, window.location.origin);
          }, 600);
          return;
        }
        var now = Date.now();
        if (now - lastClick > 2500 && clicks < 6) {
          var li = document.querySelector('li[data-item-id="KNCT_TTHC"]');
          if (li) {
            tap(li.querySelector(".dx-item-content") || li);
            lastClick = now;
            clicks++;
          }
        }
        if (now - t0 < 3e4) setTimeout(poll, 250);
      })();
    })();
    return;
  }
  var _pageWin = typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window;
  var MouseEvent = _pageWin.MouseEvent;
  var PointerEvent = _pageWin.PointerEvent;
  var KeyboardEvent = _pageWin.KeyboardEvent;
  var Event = _pageWin.Event;
  var DataTransfer = _pageWin.DataTransfer;
  var HTMLInputElement = _pageWin.HTMLInputElement;
  function pointerClick(el) {
    [ "pointerdown", "pointerup", "click" ].forEach(function(evtName) {
      el.dispatchEvent(new PointerEvent(evtName, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse"
      }));
    });
  }
  var nativeSetter = Object.getOwnPropertyDescriptor(_pageWin.HTMLInputElement.prototype, "value").set;
  var nativeTextAreaSetter = Object.getOwnPropertyDescriptor(_pageWin.HTMLTextAreaElement.prototype, "value").set;
  function setNumberField(cls, value, noCountSame) {
    var fieldItem = document.querySelector("." + cls);
    if (!fieldItem) return false;
    var input = fieldItem.querySelector("dx-number-box input.dx-texteditor-input");
    if (!input) return false;
    var current = input.value == null ? "" : String(input.value).trim();
    var target = value == null ? "" : String(value).trim();
    if (current === target) return !noCountSame;
    input.focus({
      preventScroll: true
    });
    nativeSetter.call(input, value);
    input.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    input.dispatchEvent(new Event("change", {
      bubbles: true
    }));
    input.blur();
    return true;
  }
  function clearNumberField(cls) {
    return setNumberField(cls, "", true);
  }
  function tickCheckbox(cb) {
    if (cb.getAttribute("aria-checked") === "true") return true;
    var icon = cb.querySelector(".dx-checkbox-container, .dx-checkbox-icon");
    pointerClick(icon || cb);
    return true;
  }
  function untickCheckbox(cb) {
    if (cb.getAttribute("aria-checked") !== "true") return false;
    var icon = cb.querySelector(".dx-checkbox-container, .dx-checkbox-icon");
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
  function tickAllChuaPhatHien(skipClasses) {
    var count = 0;
    var seenCbs = [];
    document.querySelectorAll("b").forEach(function(bEl) {
      if (!bEl.textContent.includes("Chưa phát hiện bất thường")) return;
      for (var s = 0; s < skipClasses.length; s++) {
        if (bEl.closest("." + skipClasses[s])) return;
      }
      var cb = findCheckboxNear(bEl);
      if (!cb) return;
      if (seenCbs.indexOf(cb) !== -1) return;
      seenCbs.push(cb);
      if (tickCheckbox(cb)) count++;
    });
    return count;
  }
  function selectRadioWithException(containerClass, labelIn, labelOut) {
    document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
      var labelEl = item.querySelector(".dx-item-content.dx-list-item-content");
      if (!labelEl) return;
      var text = (labelEl.innerText || labelEl.textContent || "").replace(/\s+/g, " ").trim();
      var inContainer = containerClass !== "__none__" && !!item.closest("." + containerClass);
      var target = inContainer ? labelIn : labelOut;
      if (text !== target) return;
      var radio = item.querySelector('.dx-radiobutton[role="radio"]');
      if (!radio) return;
      if (radio.getAttribute("aria-checked") === "true") return;
      pointerClick(item);
      var icon = radio.querySelector(".dx-radiobutton-icon");
      if (icon) pointerClick(icon);
    });
  }
  function selectRadioMultiException(containerClasses, labelIn, labelOut) {
    var count = 0;
    document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
      var labelEl = item.querySelector(".dx-item-content.dx-list-item-content");
      if (!labelEl) return;
      var text = (labelEl.innerText || labelEl.textContent || "").replace(/\s+/g, " ").trim();
      var inContainer = containerClasses.some(function(cls) {
        return !!item.closest("." + cls);
      });
      var target = inContainer ? labelIn : labelOut;
      if (text !== target) return;
      var radio = item.querySelector('.dx-radiobutton[role="radio"]');
      if (!radio) return;
      if (radio.getAttribute("aria-checked") === "true") {
        count++;
        return;
      }
      pointerClick(item);
      var icon = radio.querySelector(".dx-radiobutton-icon");
      if (icon) pointerClick(icon);
      count++;
    });
    return count;
  }
  function clearTagBox(fieldCls) {
    var fieldItem = document.querySelector("." + fieldCls);
    if (!fieldItem) return false;
    var didSomething = false;
    var removeBtns = fieldItem.querySelectorAll(".dx-tag-remove-button");
    if (removeBtns.length > 0) didSomething = true;
    removeBtns.forEach(function(btn) {
      pointerClick(btn);
    });
    var input = fieldItem.querySelector("dx-tag-box input.dx-texteditor-input");
    if (input && input.value) {
      didSomething = true;
      nativeSetter.call(input, "");
      input.dispatchEvent(new Event("input", {
        bubbles: true
      }));
      input.dispatchEvent(new Event("change", {
        bubbles: true
      }));
    }
    return didSomething;
  }
  function fillTagBox(fieldCls, code) {
    var fieldItem = document.querySelector("." + fieldCls);
    if (!fieldItem) return;
    var input = fieldItem.querySelector("dx-tag-box input.dx-texteditor-input");
    if (!input) return;
    input.focus({
      preventScroll: true
    });
    nativeSetter.call(input, code);
    input.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    input.dispatchEvent(new Event("change", {
      bubbles: true
    }));
    input.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      key: "ArrowDown",
      keyCode: 40
    }));
    setTimeout(function() {
      var allItems = document.querySelectorAll('.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible), ' + '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)');
      var target = null;
      var codeUpper = code.trim().toUpperCase();
      allItems.forEach(function(item) {
        if (target) return;
        var txt = (item.textContent || "").trim().toUpperCase();
        if (txt === codeUpper || txt.startsWith(codeUpper + " ") || txt.startsWith(codeUpper + "--") || txt.startsWith(codeUpper + " --")) {
          target = item;
        }
      });
      if (target) {
        pointerClick(target);
      } else {
        input.dispatchEvent(new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          keyCode: 13
        }));
        input.dispatchEvent(new KeyboardEvent("keyup", {
          bubbles: true,
          key: "Enter",
          keyCode: 13
        }));
        input.dispatchEvent(new KeyboardEvent("keypress", {
          bubbles: true,
          key: "Enter",
          keyCode: 13
        }));
      }
    }, 800);
  }
  function typeAndEnterSelectBox(fieldCls, label, cb) {
    var fieldItem = document.querySelector("." + fieldCls);
    if (!fieldItem) {
      if (cb) cb(false, false);
      return;
    }
    var selectBox = fieldItem.querySelector("dx-select-box");
    if (!selectBox) {
      if (cb) cb(false, false);
      return;
    }
    var mainInput = selectBox.querySelector("input.dx-texteditor-input");
    if (!mainInput) {
      if (cb) cb(false, false);
      return;
    }
    var labelNorm = label.trim().toLowerCase();
    var currentVal = (mainInput.value || "").trim().toLowerCase();
    if (currentVal && (currentVal === labelNorm || currentVal.indexOf(labelNorm) !== -1)) {
      if (cb) cb(true, true);
      return;
    }
    mainInput.focus({
      preventScroll: true
    });
    nativeSetter.call(mainInput, "");
    mainInput.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    setTimeout(function() {
      nativeSetter.call(mainInput, label);
      mainInput.dispatchEvent(new Event("input", {
        bubbles: true
      }));
      mainInput.dispatchEvent(new Event("change", {
        bubbles: true
      }));
      setTimeout(function() {
        [ "keydown", "keypress", "keyup" ].forEach(function(evtType) {
          mainInput.dispatchEvent(new KeyboardEvent(evtType, {
            bubbles: true,
            cancelable: true,
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13
          }));
        });
        setTimeout(function() {
          var firstItem = document.querySelector('.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' + '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)');
          if (firstItem) {
            pointerClick(firstItem);
            setTimeout(function() {
              if (cb) cb(true, true);
            }, 300);
          } else {
            if (cb) setTimeout(function() {
              cb(true, true);
            }, 200);
          }
        }, 200);
      }, 400);
    }, 50);
  }
  function selectDxSelectBox(fieldCls, label, cb) {
    var fieldItem = document.querySelector("." + fieldCls);
    if (!fieldItem) {
      if (cb) cb(false, false);
      return;
    }
    var selectBox = fieldItem.querySelector("dx-select-box");
    if (!selectBox) {
      if (cb) cb(false, false);
      return;
    }
    var mainInputEarly = selectBox.querySelector("input.dx-texteditor-input");
    var labelNormEarly = label.trim().toLowerCase();
    var currentValEarly = mainInputEarly && mainInputEarly.value ? mainInputEarly.value.trim().toLowerCase() : "";
    if (currentValEarly && (currentValEarly === labelNormEarly || currentValEarly.indexOf(labelNormEarly) !== -1)) {
      if (cb) cb(true, true);
      return;
    }
    var dropBtn = selectBox.querySelector(".dx-dropdowneditor-button");
    var mainInput = selectBox.querySelector("input.dx-texteditor-input");
    if (dropBtn) pointerClick(dropBtn); else if (mainInput) pointerClick(mainInput);
    setTimeout(function() {
      var overlayVisible = null;
      document.querySelectorAll(".dx-dropdowneditor-overlay, .dx-popup-wrapper").forEach(function(el) {
        if (overlayVisible) return;
        if (el.style.display === "none") return;
        if (el.getAttribute("aria-hidden") === "true") return;
        if (el.querySelector(".dx-list-item")) overlayVisible = el;
      });
      var searchInput = null;
      if (overlayVisible) {
        var listSearch = overlayVisible.querySelector(".dx-list-search input, .dx-searchbox input");
        if (listSearch) searchInput = listSearch; else {
          var allInputs = overlayVisible.querySelectorAll('input[type="text"]');
          if (allInputs.length > 0) searchInput = allInputs[allInputs.length - 1];
        }
      }
      if (!searchInput && mainInput && mainInput.getAttribute("aria-autocomplete") === "list") {
        searchInput = mainInput;
      }
      function doSearch(inp) {
        inp.focus({
          preventScroll: true
        });
        nativeSetter.call(inp, label);
        inp.dispatchEvent(new Event("input", {
          bubbles: true
        }));
        inp.dispatchEvent(new Event("change", {
          bubbles: true
        }));
        setTimeout(function() {
          [ "keydown", "keypress", "keyup" ].forEach(function(evtType) {
            inp.dispatchEvent(new KeyboardEvent(evtType, {
              bubbles: true,
              cancelable: true,
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13
            }));
          });
          setTimeout(function() {
            var stillOpen = document.querySelector('.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' + '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)');
            if (stillOpen) {
              pickFirstMatch(label, cb);
            } else if (cb) {
              setTimeout(function() {
                cb(true, true);
              }, 200);
            }
          }, 400);
        }, 1e3);
      }
      if (searchInput) {
        doSearch(searchInput);
      } else {
        pickFirstMatch(label, cb);
      }
    }, 700);
  }
  function pickFirstMatch(label, cb) {
    var labelNorm = label.trim().toLowerCase();
    var found = null;
    var candidates = document.querySelectorAll('.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' + '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)');
    candidates.forEach(function(item) {
      if (found) return;
      var txt = (item.textContent || "").trim().toLowerCase();
      if (txt.indexOf(labelNorm) !== -1) found = item;
    });
    if (!found) {
      document.querySelectorAll('.dx-list-item[role="option"]').forEach(function(item) {
        if (found) return;
        var txt = (item.textContent || "").trim().toLowerCase();
        if (txt.indexOf(labelNorm) !== -1) found = item;
      });
    }
    if (found) {
      pointerClick(found);
    } else {
      showToast("⚠ Không tìm thấy: " + label);
    }
    if (cb) setTimeout(function() {
      cb(!!found, !!found);
    }, 400);
  }
  var KET_LUAN_LABEL = "Đủ điều kiện sức khỏe";
  function getKetLuanFieldClasses() {
    var classes = {};
    document.querySelectorAll('[class*="_KetLuan"]').forEach(function(el) {
      (el.className || "").toString().split(/\s+/).forEach(function(tok) {
        if (/_KetLuan$/.test(tok)) classes[tok] = true;
      });
    });
    return Object.keys(classes).filter(function(cls) {
      var fieldItem = document.querySelector("." + cls);
      return !!(fieldItem && fieldItem.querySelector("dx-select-box"));
    });
  }
  function findVisibleListItemByLabelWithin(rootEl, label) {
    var labelNorm = label.trim().toLowerCase();
    var candidates = rootEl.querySelectorAll('.dx-list-item[role="option"]:not(.dx-state-invisible)');
    var exact = null, partial = null;
    candidates.forEach(function(item) {
      var txt = (item.textContent || "").trim().toLowerCase();
      if (!exact && txt === labelNorm) exact = item;
      if (!partial && txt.indexOf(labelNorm) !== -1) partial = item;
    });
    return exact || partial;
  }
  function findVisibleListItemByLabel(label) {
    var labelNorm = label.trim().toLowerCase();
    var candidates = document.querySelectorAll('.dx-dropdowneditor-overlay .dx-list-item[role="option"]:not(.dx-state-invisible),' + '.dx-popup-wrapper .dx-list-item[role="option"]:not(.dx-state-invisible)');
    var exact = null, partial = null;
    candidates.forEach(function(item) {
      var txt = (item.textContent || "").trim().toLowerCase();
      if (!exact && txt === labelNorm) exact = item;
      if (!partial && txt.indexOf(labelNorm) !== -1) partial = item;
    });
    return exact || partial;
  }
  function pickOptionInOwnDropdown(mainInput, label, cb, attempt) {
    attempt = attempt || 0;
    var popupId = mainInput && mainInput.getAttribute("aria-owns");
    var popupEl = popupId ? document.getElementById(popupId) : null;
    if (popupEl) {
      var item = findVisibleListItemByLabelWithin(popupEl, label);
      if (item) {
        pointerClick(item);
        setTimeout(function() {
          cb(true);
        }, 150);
        return;
      }
    }
    if (attempt < 15) {
      setTimeout(function() {
        pickOptionInOwnDropdown(mainInput, label, cb, attempt + 1);
      }, 60);
    } else {
      pickOptionInOpenDropdown(label, function(found) {
        cb(!!found);
      });
    }
  }
  function pickOptionInOpenDropdown(label, cb, attempt) {
    attempt = attempt || 0;
    var item = findVisibleListItemByLabel(label);
    if (item) {
      pointerClick(item);
      if (cb) setTimeout(function() {
        cb(true);
      }, 120);
      return;
    }
    if (attempt < 12) {
      setTimeout(function() {
        pickOptionInOpenDropdown(label, cb, attempt + 1);
      }, 60);
    } else if (cb) {
      cb(false);
    }
  }
  function isAnyDxOverlayOpen() {
    var overlays = document.querySelectorAll(".dx-dropdowneditor-overlay:not(.dx-state-invisible), " + ".dx-popup-wrapper:not(.dx-state-invisible), " + ".dx-overlay-content.dx-popup-normal:not(.dx-state-invisible)");
    for (var i = 0; i < overlays.length; i++) {
      var el = overlays[i];
      var rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return true;
    }
    return false;
  }
  function waitForNoOpenOverlay(cb, attempt) {
    attempt = attempt || 0;
    if (!isAnyDxOverlayOpen()) {
      if (cb) cb();
      return;
    }
    if (attempt >= 15) {
      document.dispatchEvent(new KeyboardEvent("keydown", {
        bubbles: true,
        key: "Escape",
        keyCode: 27
      }));
      try {
        document.body.click();
      } catch (e) {}
      setTimeout(function() {
        if (cb) cb();
      }, 100);
      return;
    }
    setTimeout(function() {
      waitForNoOpenOverlay(cb, attempt + 1);
    }, 40);
  }
  function quickSelectDxSelectBox(fieldCls, label, cb) {
    var fieldItem = document.querySelector("." + fieldCls);
    if (!fieldItem) {
      if (cb) cb(false, false);
      return;
    }
    var selectBox = fieldItem.querySelector("dx-select-box");
    if (!selectBox) {
      if (cb) cb(false, false);
      return;
    }
    var mainInputEarly = selectBox.querySelector("input.dx-texteditor-input");
    var labelNormEarly = label.trim().toLowerCase();
    var currentValEarly = mainInputEarly && mainInputEarly.value ? mainInputEarly.value.trim().toLowerCase() : "";
    if (currentValEarly && (currentValEarly === labelNormEarly || currentValEarly.indexOf(labelNormEarly) !== -1)) {
      if (cb) cb(true, true);
      return;
    }
    waitForNoOpenOverlay(function() {
      try {
        fieldItem.scrollIntoView({
          block: "center",
          behavior: "instant"
        });
      } catch (e) {}
      var dropBtn = selectBox.querySelector(".dx-dropdowneditor-button");
      var mainInput = selectBox.querySelector("input.dx-texteditor-input");
      if (dropBtn) pointerClick(dropBtn); else if (mainInput) pointerClick(mainInput);
      pickOptionInOwnDropdown(mainInput, label, function(ok) {
        waitForNoOpenOverlay(function() {
          if (cb) cb(ok, ok);
        });
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
  function selectListRadioByLabel(label) {
    var labelNorm = label.trim().toLowerCase();
    var found = null;
    document.querySelectorAll('.dx-item.dx-list-item[role="option"]').forEach(function(item) {
      if (found) return;
      var lbl = item.querySelector(".dx-item-content.dx-list-item-content");
      if (!lbl) return;
      var txt = (lbl.textContent || "").trim().toLowerCase();
      if (txt.indexOf(labelNorm) !== -1) found = item;
    });
    if (found) {
      var isSelected = found.classList.contains("dx-list-item-selected") || found.getAttribute("aria-selected") === "true";
      if (isSelected) return true;
      pointerClick(found);
      var icon = found.querySelector(".dx-radiobutton-icon");
      if (icon) pointerClick(icon);
      return true;
    }
    return false;
  }
  function fullClick(el) {
    if (!el) return;
    var opts = {
      bubbles: true,
      cancelable: true,
      view: _pageWin
    };
    el.dispatchEvent(new PointerEvent("pointerdown", Object.assign({
      pointerId: 1,
      pointerType: "mouse"
    }, opts)));
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new PointerEvent("pointerup", Object.assign({
      pointerId: 1,
      pointerType: "mouse"
    }, opts)));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  }
  function selectRadioGroupByLabel(containerCls, label, cb, _attempt) {
    _attempt = _attempt || 0;
    var container = document.querySelector("." + containerCls);
    if (!container) {
      if (cb) cb(false, false);
      return;
    }
    var labelNorm = label.trim().toLowerCase();
    var found = null;
    container.querySelectorAll('.dx-item.dx-radiobutton[role="radio"]').forEach(function(item) {
      if (found) return;
      var lbl = item.querySelector(".dx-item-content");
      if (!lbl) return;
      var txt = (lbl.textContent || "").trim().toLowerCase();
      if (txt === labelNorm) found = item;
    });
    if (!found) {
      if (cb) cb(false, false);
      return;
    }
    if (_attempt === 0 && found.getAttribute("aria-checked") === "true") {
      if (cb) cb(true, true);
      return;
    }
    var targets = [ found.querySelector(".dx-radiobutton-icon"), found.querySelector(".dx-item-content"), found ];
    var target = targets[Math.min(_attempt, targets.length - 1)] || found;
    fullClick(target);
    setTimeout(function() {
      var ok = found.getAttribute("aria-checked") === "true";
      if (ok) {
        if (cb) cb(true, true);
      } else if (_attempt < 2) {
        selectRadioGroupByLabel(containerCls, label, cb, _attempt + 1);
      } else {
        if (cb) cb(false, false);
      }
    }, 250);
  }
  var TC_TEXT_TARGET = "Đã tiêm";
  var TC_COL_INDEX = "6";
  var TC_SELECTOR_CANDIDATES = [ ".dx-radiogroup", ".dx-radio-group", '[role="radiogroup"]' ];
  function tcNormalize(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }
  function tcTriggerClick(el) {
    if (!el) return;
    var opts = {
      bubbles: true,
      cancelable: true,
      composed: true
    };
    try {
      el.dispatchEvent(new PointerEvent("pointerdown", opts));
      el.dispatchEvent(new PointerEvent("pointerup", opts));
    } catch (e) {
      el.dispatchEvent(new MouseEvent("mousedown", opts));
      el.dispatchEvent(new MouseEvent("mouseup", opts));
    }
    el.dispatchEvent(new MouseEvent("click", opts));
  }
  function tcFindRadioItemByText(rgEl, text) {
    if (!rgEl) return null;
    var items = rgEl.querySelectorAll('.dx-item, .dx-radiobutton, [role="radio"]');
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var label = it.querySelector(".dx-item-content") || it;
      if (label && tcNormalize(label.textContent) === text) return it;
    }
    return null;
  }
  function tcGetCheckedText(rgEl) {
    var checkedLabel = rgEl.querySelector(".dx-radiobutton-checked .dx-item-content") || rgEl.querySelector('[aria-checked="true"] .dx-item-content') || rgEl.querySelector('[aria-selected="true"] .dx-item-content') || rgEl.querySelector('[aria-checked="true"]') || rgEl.querySelector('[aria-selected="true"]');
    return checkedLabel ? tcNormalize(checkedLabel.textContent || checkedLabel.innerText || "") : null;
  }
  function tcProcessRadioGroup(rgEl) {
    if (!rgEl) return false;
    var checkedText = tcGetCheckedText(rgEl);
    if (checkedText === TC_TEXT_TARGET) return true;
    if (checkedText === null || checkedText === "Không nhớ rõ") {
      var targetItem = tcFindRadioItemByText(rgEl, TC_TEXT_TARGET);
      if (targetItem) {
        tcTriggerClick(targetItem);
        return true;
      }
    }
    return false;
  }
  function tcScanTableColumnOnce() {
    var count = 0;
    var tds = document.querySelectorAll('td[aria-colindex="' + TC_COL_INDEX + '"]');
    tds.forEach(function(td) {
      var found = false;
      for (var s = 0; s < TC_SELECTOR_CANDIDATES.length; s++) {
        var rg = td.querySelector(TC_SELECTOR_CANDIDATES[s]);
        if (rg) {
          if (tcProcessRadioGroup(rg)) count++;
          found = true;
          break;
        }
      }
      if (!found) {
        var fallback = td.querySelector(".dx-widget.dx-collection, .dx-item");
        if (fallback && tcProcessRadioGroup(fallback)) count++;
      }
    });
    return count;
  }
  function tickAllBinhThuongRadio() {
    var done = 0;
    document.querySelectorAll('.dx-radiogroup.dx-widget, [role="radiogroup"]').forEach(function(group) {
      var items = group.querySelectorAll('.dx-item.dx-radiobutton, [role="radio"]');
      var found = null;
      for (var k = 0; k < items.length; k++) {
        var lbl = items[k].querySelector(".dx-item-content") || items[k];
        var txt = (lbl.textContent || "").trim();
        if (txt === "Bình thường") {
          found = items[k];
          break;
        }
      }
      if (!found) return;
      var isChecked = found.classList.contains("dx-radiobutton-checked") || found.getAttribute("aria-checked") === "true";
      if (isChecked) {
        done++;
        return;
      }
      var icon = found.querySelector(".dx-radiobutton-icon");
      fullClick(icon || found);
      done++;
    });
    return done;
  }
  var TAMTHAN_ADHD_TARGET = "Không có";
  var TAMTHAN_AUTISM_TARGET_AGREE = "Hoàn toàn đồng ý";
  var TAMTHAN_AUTISM_TARGET_DISAGREE = "Hoàn toàn không đồng ý";
  var TAMTHAN_AUTISM_DISAGREE_ROWS = [ 5, 7, 10 ];
  function tamThanBuildAutismExceptionMap() {
    var map = {};
    TAMTHAN_AUTISM_DISAGREE_ROWS.forEach(function(r) {
      map[r] = TAMTHAN_AUTISM_TARGET_DISAGREE;
    });
    return map;
  }
  function tamThanScanRowsOnce(defaultText, exceptionMap, seen) {
    var done = 0;
    seen = seen || {};
    document.querySelectorAll(".dx-data-row[aria-rowindex]").forEach(function(row) {
      var idxCell = row.querySelector('td[aria-colindex="1"]');
      if (!idxCell) return;
      var rowIndex = parseInt((idxCell.textContent || "").trim(), 10);
      if (isNaN(rowIndex)) return;
      if (!row.offsetParent) return;
      var target = exceptionMap && exceptionMap[rowIndex] || defaultText;
      var items = row.querySelectorAll('.dx-item.dx-list-item[role="option"]');
      if (!items.length) return;
      var found = null;
      items.forEach(function(it) {
        if (found) return;
        var lbl = it.querySelector(".dx-item-content.dx-list-item-content") || it;
        var txt = (lbl.textContent || "").trim();
        if (txt === target) found = it;
      });
      if (!found) return;
      var radio = found.querySelector('.dx-radiobutton[role="radio"]');
      if (!radio) return;
      if (seen[rowIndex]) return;
      seen[rowIndex] = true;
      var isChecked = radio.getAttribute("aria-checked") === "true";
      if (isChecked) {
        done++;
        return;
      }
      fullClick(found);
      var icon = radio.querySelector(".dx-radiobutton-icon");
      if (icon) fullClick(icon);
      done++;
    });
    return done;
  }
  function tamThanAutoFill(defaultText, exceptionMap, doneCallback) {
    var total = 0;
    var seenRows = {};
    total += tamThanScanRowsOnce(defaultText, exceptionMap, seenRows);
    setTimeout(function() {
      total += tamThanScanRowsOnce(defaultText, exceptionMap, seenRows);
      setTimeout(function() {
        total += tamThanScanRowsOnce(defaultText, exceptionMap, seenRows);
        if (doneCallback) doneCallback(total);
      }, 350);
    }, 350);
  }
  function tamThanFillKetQua(text) {
    var filled = false;
    document.querySelectorAll(".KetQua").forEach(function(item) {
      if (filled) return;
      if (!item.offsetParent) return;
      var ta = item.querySelector("textarea.dx-texteditor-input");
      if (!ta) return;
      var curKq = (ta.value || "").trim();
      if (curKq === text) {
        filled = true;
        return;
      }
      if (curKq) return;
      ta.focus({
        preventScroll: true
      });
      nativeTextAreaSetter.call(ta, text);
      ta.dispatchEvent(new Event("input", {
        bubbles: true
      }));
      ta.dispatchEvent(new Event("change", {
        bubbles: true
      }));
      ta.blur();
      filled = true;
    });
    return filled;
  }
  var DRUG_TEST_FIELDS = [ "XN_Amphetamin", "XN_Marijuana", "XN_Morphin", "XN_Codein", "XN_Heroin" ];
  function autoDrugTestAmTinh() {
    var done = 0, clicked = 0, missed = [];
    DRUG_TEST_FIELDS.forEach(function(field) {
      var r = te6ClickRadioInGroup(field, "Âm Tính");
      if (r.found) {
        done++;
        if (r.clicked) clicked++;
      } else missed.push(field);
    });
    if (missed.length) console.warn("[DrugTest] Khong xu ly duoc:", missed);
    return {
      done: done,
      total: DRUG_TEST_FIELDS.length,
      clicked: clicked,
      missed: missed
    };
  }
  function autoSelectLoaiIAndBinhThuong() {
    var done = 0, missed = 0;
    document.querySelectorAll(".dx-list.dx-widget").forEach(function(list) {
      var items = list.querySelectorAll(".dx-item.dx-list-item");
      var found = null;
      for (var j = 0; j < items.length; j++) {
        var c2 = items[j].querySelector(".dx-list-item-content") || items[j];
        var t2 = (c2.textContent || "").trim();
        if (t2 === "Loại I") {
          found = items[j];
          break;
        }
      }
      if (!found) return;
      var isSelected = found.classList.contains("dx-list-item-selected") || found.getAttribute("aria-selected") === "true";
      if (isSelected) {
        done++;
        return;
      }
      var icon = found.querySelector(".dx-list-select-radiobutton, .dx-radio-value-container");
      fullClick(icon || found);
      done++;
    });
    document.querySelectorAll(".dx-radiogroup.dx-widget").forEach(function(group) {
      var items = group.querySelectorAll(".dx-item.dx-radiobutton");
      var found = null;
      for (var k = 0; k < items.length; k++) {
        var txt = (items[k].textContent || "").trim();
        if (txt.indexOf("Bình thường") !== -1) {
          found = items[k];
          break;
        }
      }
      if (!found) return;
      if (found.classList.contains("dx-radiobutton-checked")) {
        done++;
        return;
      }
      var icon2 = found.querySelector(".dx-radiobutton-icon");
      fullClick(icon2 || found);
      done++;
    });
    return {
      done: done,
      missed: missed
    };
  }
  function fillThongTinHanhChinh(onDone) {
    showToast("⏳ Đang điền Thông tin hành chính...");
    var count = 0;
    var isKSKT18 = window.location.href.indexOf("kskdk_thongtinkhamtren18") !== -1;
    var hinhThucChiTraLabel = isKSKT18 ? "Người sử dụng lao động chi trả" : "Ngân sách thành phố hỗ trợ";
    var diaDiemKhamLabel = isKSKT18 ? "Cơ sở khám chữa bệnh" : "Khám lưu động";
    function finish() {
      showToast("✅ Đã điền xong: Thông tin hành chính");
      if (onDone) onDone(count);
    }
    function step2() {
      setTimeout(function() {
        if (selectListRadioByLabel(hinhThucChiTraLabel)) count++;
        setTimeout(function() {
          selectDxSelectBox("DoiTuongKham", diaDiemKhamLabel, function(ok, billable) {
            if (billable) count++;
            setTimeout(function() {
              function finishFillTTHC() {
                setTimeout(function() {
                  function step6() {
                    setTimeout(function() {
                      function step7() {
                        setTimeout(function() {
                          if (document.querySelector(".HinhThucChiTraKhamSK_ChiTiet")) {
                            selectRadioGroupByLabel("HinhThucChiTraKhamSK_ChiTiet", "Khám Theo Hợp Đồng", function(ok, billable) {
                              if (billable) count++;
                              if (!ok) showToast("⚠ Không chọn được Hình thức khám, vui lòng chọn tay");
                              finish();
                            });
                          } else {
                            finish();
                          }
                        }, 300);
                      }
                      if (document.querySelector(".DanTocId")) {
                        typeAndEnterSelectBox("DanTocId", "Kinh", function(ok, billable) {
                          if (billable) count++;
                          step7();
                        });
                      } else {
                        step7();
                      }
                    }, 300);
                  }
                  if (document.querySelector(".NgheNghiepId")) {
                    selectDxSelectBox("NgheNghiepId", "Lao động tự do", function(ok, billable) {
                      if (billable) count++;
                      step6();
                    });
                  } else {
                    step6();
                  }
                }, 300);
              }
              if (document.querySelector(".DoiTuong_M13")) {
                selectDxSelectBox("DoiTuong_M13", "Người lao động phi chính thức", function(ok, billable) {
                  if (billable) count++;
                  finishFillTTHC();
                });
              } else {
                finishFillTTHC();
              }
            }, 300);
          });
        }, 300);
      }, 200);
    }
    if (isKSKT18) {
      step2();
    } else {
      typeAndEnterSelectBox("DiaChiHienTai_XaPhuong", "Xã Bắc Tân Uyên", function(ok, billable) {
        if (billable) count++;
        step2();
      });
    }
  }
  function fillCommonNumbers() {
    var c = 0;
    if (setNumberField("TMH_TaiTrai_NoiThuong", "5")) c++;
    if (setNumberField("TMH_TaiPhai_NoiThuong", "5")) c++;
    if (setNumberField("TMH_TaiTrai_NoiTham", "0,5")) c++;
    if (setNumberField("TMH_TaiPhai_NoiTham", "0,5")) c++;
    return c;
  }
  function resetAll() {
    var c = 0;
    if (clearNumberField("Mat_KhongKinh_MP")) c++;
    if (clearNumberField("Mat_KhongKinh_MT")) c++;
    if (clearNumberField("Mat_CoKinh_MP")) c++;
    if (clearNumberField("Mat_CoKinh_MT")) c++;
    if (clearTagBox("Mat_ChanDoanXacDinh_ICD")) c++;
    if (clearTagBox("RHM_ChanDoanXacDinh_ICD")) c++;
    var matCb = document.querySelector('.Mat_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
    if (matCb && untickCheckbox(matCb)) c++;
    var rhmCb = document.querySelector('.RHM_ChuaPhatHienBatThuong dx-check-box[role="checkbox"]');
    if (rhmCb && untickCheckbox(rhmCb)) c++;
    return c;
  }
  function showICDPopup(onSelect) {
    var overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "3000000",
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    var box = document.createElement("div");
    Object.assign(box.style, {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px 28px",
      width: "320px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      fontFamily: "sans-serif"
    });
    box.innerHTML = '<div style="font-size:15px;font-weight:700;margin-bottom:16px;color:#1a1a1a">' + "👁️ Chọn mã chẩn đoán xác định (Mắt)" + "</div>" + '<div style="display:flex;flex-direction:column;gap:10px;">' + '<button id="_icd_h520" style="padding:12px 16px;background:#1976d2;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">H52.0 — Tật viễn thị</button>' + '<button id="_icd_h521" style="padding:12px 16px;background:#1976d2;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">H52.1 — Tật cận thị</button>' + '<button id="_icd_cancel" style="padding:10px 16px;background:#e0e0e0;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Huỷ</button>' + "</div>";
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.querySelector("#_icd_h520").onclick = function() {
      overlay.remove();
      onSelect("H52.0");
    };
    overlay.querySelector("#_icd_h521").onclick = function() {
      overlay.remove();
      onSelect("H52.1");
    };
    overlay.querySelector("#_icd_cancel").onclick = function() {
      overlay.remove();
    };
    overlay.onclick = function(e) {
      if (e.target === overlay) overlay.remove();
    };
  }
  function showVLOptionsPopup(onConfirm) {
    var overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "3000000",
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    var box = document.createElement("div");
    Object.assign(box.style, {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px 28px",
      width: "320px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      fontFamily: "sans-serif"
    });
    function rowHtml(id, text) {
      return '<label id="_vlrow_' + id + '" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e0e0e0;border-radius:8px;cursor:pointer;transition:opacity .15s;">' + '<input type="checkbox" id="_vlcb_' + id + '" style="width:18px;height:18px;flex-shrink:0;">' + '<span style="font-size:14px;font-weight:600;color:#1a1a1a;">' + text + "</span>" + "</label>";
    }
    box.innerHTML = '<div style="font-size:15px;font-weight:700;margin-bottom:16px;color:#1a1a1a">' + "📋 Chọn kết quả khám" + "</div>" + '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">' + rowHtml("bt", "Bình thường") + rowHtml("ct", "Có kính: Cận thị") + rowHtml("vt", "Có kính: Viễn thị") + rowHtml("mr", "Mất răng") + "</div>" + '<div style="display:flex;gap:10px;">' + '<button id="_vl_ok" style="flex:1;padding:10px 16px;background:#2e7d32;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">OK</button>' + '<button id="_vl_cancel" style="flex:1;padding:10px 16px;background:#e0e0e0;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Huỷ</button>' + "</div>";
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    var cbBT = overlay.querySelector("#_vlcb_bt");
    var cbCT = overlay.querySelector("#_vlcb_ct");
    var cbVT = overlay.querySelector("#_vlcb_vt");
    var cbMR = overlay.querySelector("#_vlcb_mr");
    var rowBT = overlay.querySelector("#_vlrow_bt");
    var rowCT = overlay.querySelector("#_vlrow_ct");
    var rowVT = overlay.querySelector("#_vlrow_vt");
    var rowMR = overlay.querySelector("#_vlrow_mr");
    function setRowEnabled(row, cb, enabled) {
      cb.disabled = !enabled;
      row.style.opacity = enabled ? "1" : "0.4";
      row.style.cursor = enabled ? "pointer" : "not-allowed";
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
    [ cbBT, cbCT, cbVT, cbMR ].forEach(function(cb) {
      cb.addEventListener("change", updateStates);
    });
    updateStates();
    overlay.querySelector("#_vl_ok").onclick = function() {
      var opts = {
        binhThuong: cbBT.checked,
        canThi: cbCT.checked,
        vienThi: cbVT.checked,
        matRang: cbMR.checked
      };
      if (!opts.binhThuong && !opts.canThi && !opts.vienThi && !opts.matRang) {
        showToast("⚠️ Vui lòng chọn ít nhất 1 mục");
        return;
      }
      overlay.remove();
      onConfirm(opts);
    };
    overlay.querySelector("#_vl_cancel").onclick = function() {
      overlay.remove();
    };
    overlay.onclick = function(e) {
      if (e.target === overlay) overlay.remove();
    };
  }
  function applyVLSelections(opts, onDone) {
    resetAll();
    var total = 0;
    setTimeout(function() {
      var hasEyeIssue = opts.canThi || opts.vienThi;
      var cbExceptions = [];
      if (hasEyeIssue) cbExceptions.push("Mat_ChuaPhatHienBatThuong");
      if (opts.matRang) cbExceptions.push("RHM_ChuaPhatHienBatThuong");
      total += tickAllChuaPhatHien(cbExceptions);
      var radioExceptions = [];
      if (hasEyeIssue) radioExceptions.push("Mat_PhanLoai");
      if (opts.matRang) radioExceptions.push("RHM_PhanLoai");
      if (radioExceptions.length > 0) {
        total += selectRadioMultiException(radioExceptions, "Loại II", "Loại I");
      } else {
        selectRadioWithException("__none__", "Loại I", "Loại I");
      }
      if (hasEyeIssue) {
        if (setNumberField("Mat_CoKinh_MP", "10")) total++;
        if (setNumberField("Mat_CoKinh_MT", "10")) total++;
      } else {
        if (setNumberField("Mat_KhongKinh_MP", "10")) total++;
        if (setNumberField("Mat_KhongKinh_MT", "10")) total++;
      }
      total += fillCommonNumbers();
      var parts = [];
      var icdDelay = 300;
      if (opts.binhThuong) parts.push("Bình thường");
      if (opts.canThi) {
        setTimeout(function() {
          fillTagBox("Mat_ChanDoanXacDinh_ICD", "H52.1");
        }, icdDelay);
        parts.push("Cận thị (H52.1)");
        total++;
        icdDelay += 1500;
      }
      if (opts.vienThi) {
        setTimeout(function() {
          fillTagBox("Mat_ChanDoanXacDinh_ICD", "H52.0");
        }, icdDelay);
        parts.push("Viễn thị (H52.0)");
        total++;
        icdDelay += 1500;
      }
      if (opts.matRang) {
        setTimeout(function() {
          fillTagBox("RHM_ChanDoanXacDinh_ICD", "K08.1");
        }, icdDelay);
        parts.push("Mất răng (K08.1)");
        total++;
        icdDelay += 1500;
      }
      showToast("✅ Đã điền: " + parts.join(" + "));
      if (onDone) onDone(total);
      var isOtoOrLaiXe = window.location.href.indexOf("KSKOT_ThongTinKham") !== -1 || window.location.href.indexOf("KSKLX_ThongTinKham") !== -1;
      if (isOtoOrLaiXe) {
        setTimeout(function() {
          selectAllKetLuanDuDieuKien(function(count) {
            if (count > 0) {
              showToast('✅ Đã chọn "' + KET_LUAN_LABEL + '" cho ' + count + " mục Kết luận");
              spendCredits(count);
            }
          });
        }, icdDelay + 300);
      }
    }, 400);
  }
  function selectNCTRadio(code, optLabel) {
    var rows = document.querySelectorAll('tr[role="row"]');
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var codeCell = row.querySelector('td[aria-colindex="1"]');
      if (!codeCell || codeCell.textContent.trim() !== code) continue;
      var evalCell = row.querySelector('td[aria-colindex="3"]');
      if (!evalCell) return false;
      var options = evalCell.querySelectorAll('.dx-item.dx-list-item[role="option"]');
      for (var j = 0; j < options.length; j++) {
        var opt = options[j];
        var lbl = opt.querySelector(".dx-item-content.dx-list-item-content");
        if (!lbl) continue;
        if ((lbl.textContent || "").trim() !== optLabel) continue;
        var radio = opt.querySelector('.dx-list-select-radiobutton[role="radio"]');
        if (radio && radio.getAttribute("aria-checked") === "true") return true;
        pointerClick(opt);
        return true;
      }
      return false;
    }
    return false;
  }
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
  function isCoText(txt) {
    return txt === "Có" || txt.indexOf("Có,") === 0 || txt.indexOf("Có ") === 0 || txt.indexOf("Có(") === 0;
  }
  function isKhongText(txt) {
    return txt === "Không" || txt.indexOf("Không,") === 0 || txt.indexOf("Không ") === 0 || txt.indexOf("Không(") === 0;
  }
  var _nctSeen = null;
  function nctCountOnce(el) {
    if (!_nctSeen) return true;
    if (_nctSeen.has(el)) return false;
    _nctSeen.add(el);
    return true;
  }
  function tickKhongTrongBangNCT() {
    var count = 0;
    document.querySelectorAll('tr[role="row"]').forEach(function(row) {
      var evalCell = row.querySelector('td[aria-colindex="3"]') || row;
      var options = evalCell.querySelectorAll('.dx-item.dx-list-item[role="option"]');
      if (options.length < 2) return;
      var found = null, hasCo = false, hasKhong = false;
      options.forEach(function(opt) {
        var lbl = opt.querySelector(".dx-item-content.dx-list-item-content");
        var txt = lbl ? (lbl.textContent || "").trim() : "";
        if (isCoText(txt)) hasCo = true;
        if (isKhongText(txt)) {
          hasKhong = true;
          found = opt;
        }
      });
      if (!hasCo || !hasKhong || !found) return;
      var radio = found.querySelector('.dx-list-select-radiobutton[role="radio"]');
      if (radio && radio.getAttribute("aria-checked") === "true") {
        if (nctCountOnce(found)) count++;
        return;
      }
      pointerClick(found);
      if (nctCountOnce(found)) count++;
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
        var lbl = it.querySelector(".dx-item-content");
        var txt = lbl ? (lbl.textContent || "").trim() : "";
        if (isCoText(txt)) hasCo = true;
        if (isKhongText(txt)) target = it;
      });
      if (!hasCo || !target) return;
      if (target.getAttribute("aria-checked") === "true") {
        if (nctCountOnce(target)) count++;
        return;
      }
      var icon = target.querySelector(".dx-radiobutton-icon");
      fullClick(icon || target.querySelector(".dx-item-content") || target);
      if (nctCountOnce(target)) count++;
    });
    return count;
  }
  function tickKhongNativeRadioNCT() {
    var count = 0;
    var handledGroups = {};
    document.querySelectorAll('mat-radio-group, [role="radiogroup"]:not(.dx-radiogroup)').forEach(function(group) {
      if (group.querySelector(".dx-radiobutton")) return;
      var buttons = group.querySelectorAll("mat-radio-button, label");
      if (buttons.length < 2) return;
      var hasCo = false, target = null, targetInput = null;
      buttons.forEach(function(btn) {
        var txt = (btn.textContent || "").replace(/\s+/g, " ").trim();
        if (isCoText(txt)) hasCo = true;
        if (isKhongText(txt)) {
          target = btn;
          targetInput = btn.querySelector('input[type="radio"]') || btn.closest("mat-radio-button");
        }
      });
      if (!hasCo || !target) return;
      var isChecked = target.matches('[class*="checked"], [aria-checked="true"]') || targetInput && targetInput.tagName === "INPUT" && targetInput.checked || target.querySelector('input[type="radio"]') && target.querySelector('input[type="radio"]').checked;
      if (isChecked) {
        if (nctCountOnce(target)) count++;
        return;
      }
      pointerClick(target.querySelector(".mat-radio-container") || target.querySelector('input[type="radio"]') || target);
      if (nctCountOnce(target)) count++;
    });
    var byName = {};
    document.querySelectorAll('input[type="radio"]').forEach(function(inp) {
      if (inp.closest(".dx-radiobutton, mat-radio-group")) return;
      var key = inp.name || "__noname_" + (inp.closest("form, .dx-item, tr") ? 1 : 0);
      if (!byName[key]) byName[key] = [];
      byName[key].push(inp);
    });
    Object.keys(byName).forEach(function(key) {
      if (handledGroups[key]) return;
      var inputs = byName[key];
      if (inputs.length < 2) return;
      var hasCo = false, target = null;
      inputs.forEach(function(inp) {
        var lbl = inp.closest("label") || (inp.id ? document.querySelector('label[for="' + inp.id + '"]') : null) || inp.parentElement;
        var txt = lbl ? (lbl.textContent || "").replace(/\s+/g, " ").trim() : "";
        if (isCoText(txt)) hasCo = true;
        if (isKhongText(txt)) target = inp;
      });
      if (!hasCo || !target) return;
      if (target.checked) {
        if (nctCountOnce(target)) count++;
        return;
      }
      pointerClick(target);
      target.checked = true;
      target.dispatchEvent(new Event("change", {
        bubbles: true
      }));
      if (nctCountOnce(target)) count++;
    });
    return count;
  }
  function autoTienSuCoNangKhong(doneCallback) {
    var total = 0;
    _nctSeen = new Set;
    function pass() {
      return tickKhongTrongBangNCT() + tickKhongRadioGroupNCT() + tickKhongNativeRadioNCT();
    }
    total += pass();
    setTimeout(function() {
      total += pass();
      setTimeout(function() {
        total += pass();
        _nctSeen = null;
        if (doneCallback) doneCallback(total);
      }, 350);
    }, 350);
  }
  var NCT_THA_DTD = [ {
    code: "D1",
    opt: "Có"
  }, {
    code: "D1.1",
    opt: "Có"
  }, {
    code: "D1.2",
    opt: "Có"
  }, {
    code: "D1.3",
    opt: "Không"
  }, {
    code: "D1.4",
    opt: "Không"
  }, {
    code: "D1.5",
    opt: "Không"
  }, {
    code: "D1.6",
    opt: "Không"
  }, {
    code: "D1.7",
    opt: "Không"
  }, {
    code: "D1.8",
    opt: "Không"
  }, {
    code: "D1.9",
    opt: "Có"
  }, {
    code: "D1.10",
    opt: "Không"
  }, {
    code: "D1.11",
    opt: "Không"
  }, {
    code: "D1.12",
    opt: "Không"
  }, {
    code: "D1.13",
    opt: "Không"
  }, {
    code: "D1.14",
    opt: "Không"
  }, {
    code: "D2.1",
    opt: "Có"
  }, {
    code: "D2.2",
    opt: "Có"
  }, {
    code: "D2.3",
    opt: "Có"
  }, {
    code: "D2.4",
    opt: "Có"
  }, {
    code: "D2.5",
    opt: "Không"
  }, {
    code: "D3.1",
    opt: "Không"
  }, {
    code: "D3.2",
    opt: "Không"
  }, {
    code: "D3.3",
    opt: "Không"
  }, {
    code: "D4.1",
    opt: "Không"
  }, {
    code: "D4.2",
    opt: "Không"
  }, {
    code: "D4.3",
    opt: "Không"
  }, {
    code: "D4.4",
    opt: "Không"
  }, {
    code: "D4.5",
    opt: "Không"
  }, {
    code: "D4.6",
    opt: "Không"
  }, {
    code: "D4.7",
    opt: "Không"
  }, {
    code: "D4.8",
    opt: "Không"
  }, {
    code: "D5.1",
    opt: "Không"
  }, {
    code: "D5.2",
    opt: "Không"
  }, {
    code: "D5.3",
    opt: "Không"
  }, {
    code: "D5.4",
    opt: "Không"
  }, {
    code: "D5.5",
    opt: "Không"
  }, {
    code: "D5.6",
    opt: "Không"
  }, {
    code: "D5.7",
    opt: "Không"
  }, {
    code: "D5.8",
    opt: "Không"
  }, {
    code: "D5.9",
    opt: "Không"
  }, {
    code: "D5.10",
    opt: "Không"
  }, {
    code: "D5.11",
    opt: "Không"
  }, {
    code: "D6.1",
    opt: "Hầu như không"
  }, {
    code: "D6.2",
    opt: "Hầu như không"
  }, {
    code: "D6.3",
    opt: "Hầu như không"
  }, {
    code: "D6.4",
    opt: "Một vài ngày"
  }, {
    code: "D6.5",
    opt: "Một vài ngày"
  }, {
    code: "D6.6",
    opt: "Hầu như không"
  }, {
    code: "D6.7",
    opt: "Hầu như không"
  }, {
    code: "D6.8",
    opt: "Hầu như không"
  }, {
    code: "D6.9",
    opt: "Hầu như không"
  }, {
    code: "D7.1",
    opt: "Hầu như không"
  }, {
    code: "D7.2",
    opt: "Hầu như không"
  }, {
    code: "D7.3",
    opt: "Một vài ngày"
  }, {
    code: "D7.4",
    opt: "Hầu như không"
  }, {
    code: "D7.5",
    opt: "Hầu như không"
  }, {
    code: "D7.6",
    opt: "Hầu như không"
  }, {
    code: "D7.7",
    opt: "Hầu như không"
  }, {
    code: "D8.1.1",
    opt: "Có"
  }, {
    code: "D8.1.2",
    opt: "Có"
  }, {
    code: "D8.1.3",
    opt: "Có"
  }, {
    code: "D8.1.4",
    opt: "Có"
  }, {
    code: "D8.1.5",
    opt: "Có"
  }, {
    code: "D8.1.6",
    opt: "Có"
  }, {
    code: "D8.2.1",
    opt: "Có"
  }, {
    code: "D8.2.2",
    opt: "Có"
  }, {
    code: "D8.2.3",
    opt: "Có"
  }, {
    code: "D8.2.4",
    opt: "Có"
  }, {
    code: "D8.2.5",
    opt: "Có"
  }, {
    code: "D8.2.6",
    opt: "Không"
  }, {
    code: "D8.2.7",
    opt: "Có"
  }, {
    code: "D8.2.8",
    opt: "Có"
  }, {
    code: "D8.3.1",
    opt: "Không/Một số lần"
  }, {
    code: "D8.3.2",
    opt: "Không"
  }, {
    code: "D8.3.3",
    opt: "Không"
  }, {
    code: "D8.4.1",
    opt: "Không"
  }, {
    code: "D8.4.2",
    opt: "Không"
  }, {
    code: "D8.4.3",
    opt: "Không"
  }, {
    code: "D8.5.1",
    opt: "Có"
  }, {
    code: "D8.5.2",
    opt: "Có"
  }, {
    code: "D8.5.3",
    opt: "Không"
  } ];
  var TE6_AUTO_FILL_PAGES = [ {
    match: "DauHieuSinhTon_MC",
    mode: "text",
    text: "Bình thường"
  }, {
    match: "DinhDuong_MC",
    mode: "text",
    text: "Bình thường"
  }, {
    match: "TinhThanVanDong_MC",
    mode: "index",
    values: [ "Có", "Có", "Không" ]
  }, {
    match: "TiemChung_MC",
    mode: "index",
    values: [ "Có", "Có", "Có" ]
  } ];
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
    if (!config) {
      _te6AutoFillDonePath = null;
      return 0;
    }
    var allGroups = document.querySelectorAll(".dx-radiogroup");
    if (!allGroups.length) return 0;
    var groups;
    if (config.mode === "index") {
      groups = [];
      allGroups.forEach(function(group) {
        var items = group.querySelectorAll(".dx-item.dx-radiobutton");
        if (items.length !== 2) return;
        var texts = [];
        items.forEach(function(it) {
          texts.push((it.textContent || "").trim());
        });
        var isCoKhong = texts.some(function(t) {
          return t.indexOf("Có") !== -1;
        }) && texts.some(function(t) {
          return t.indexOf("Không") !== -1;
        });
        if (isCoKhong) groups.push(group);
      });
    } else {
      groups = allGroups;
    }
    if (!groups.length) return 0;
    groups.forEach(function(group, idx) {
      var wantText = config.mode === "text" ? config.text : config.values[idx];
      if (!wantText) return;
      var items = group.querySelectorAll(".dx-item.dx-radiobutton");
      for (var i = 0; i < items.length; i++) {
        var text = (items[i].textContent || "").trim();
        if (text.indexOf(wantText) !== -1) {
          if (!items[i].classList.contains("dx-radiobutton-checked")) items[i].click();
          break;
        }
      }
    });
    var doneCount = 0;
    groups.forEach(function(group, idx) {
      var wantText = config.mode === "text" ? config.text : config.values[idx];
      if (!wantText) return;
      var items = group.querySelectorAll(".dx-item.dx-radiobutton");
      for (var i = 0; i < items.length; i++) {
        var text = (items[i].textContent || "").trim();
        if (text.indexOf(wantText) !== -1) {
          if (items[i].classList.contains("dx-radiobutton-checked")) doneCount++;
          break;
        }
      }
    });
    if (!silent && doneCount > 0 && _te6AutoFillDonePath !== path) {
      showToast("✅ Đã tự động điền giá trị mặc định");
    }
    _te6AutoFillDonePath = path;
    te6BillDelta(location.href + "|main", doneCount);
    return doneCount;
  }
  var TE6_KLS_FIELD_MAP = {
    ToanTrang_MauSacDa: 0,
    Da_LongBanTay: 0,
    DauCo_Thop: 0,
    DauCo_KichThuoc: 0,
    DauCo_VanDongCo: 0,
    DauCo_KhoiBatThuong: 0,
    Mat_ViTri2Mat: 0,
    Mat_DongTu: 0,
    Mat_MiMatKetMac: 0,
    LacMat: 0,
    Tai_TaiVaMangNhi: 0,
    Tai_ThinhLuc: 0,
    Tai_CoKhoiSungSauTai: 0,
    Tai_DauHieuChayMu: 0,
    Mui_HinhDang: 0,
    ChayNuocMui: 0,
    NghetMui: 0,
    Hong: 0,
    KhamMieng_HinhDang: 0,
    KhamMieng_RangSuaSauSinh: 1,
    KhamMieng_HinhDangLuoi: 0,
    KhamMieng_DinhThangLuoi: 0,
    KhamMieng_NamMieng: 0,
    KhamMieng_CamNho: 0,
    VetSauMangBamLoTrenRang: 0,
    HoHap_NhipThoKhongDeu: 0,
    HoHap_ThoRutLom: 0,
    HoHap_TiengThoBatThuong: 0,
    HoHap_SuyHoHap: 0,
    HoHap_NghePhoi: 0,
    Tim_ViTriMomTim: 0,
    Tim_MachNgoaiVi: 0,
    Tim_NgheTim: 0,
    Bung_HinhDang: 0,
    Bung_GanLachTo: 0,
    Bung_KhoiBatThuong: 0,
    Bung_LoHauMon: 0,
    Bung_CoQuanSinhDucNgoai: 0,
    CoXuong_VanDongKDX: 0,
    CoXuong_PhanXaBu: 1,
    CoXuong_PhanXaNam: 1,
    CoXuong_PhanXaMoro: 1,
    CoXuong_TruongLuc: 0,
    CoXuong_KhopHang: 0,
    CoXuong_PhanXaCo: 0,
    CoXuong_Lung: 0,
    CoXuong_TuChi: 0,
    CoXuong_DangDi: 0,
    CoXuong_DauHinhCoiXuong: 0
  };
  function te6KlsSelectRadio(fieldClass, optionIndex) {
    var wrapper = document.querySelector(".h-item." + CSS.escape(fieldClass));
    if (!wrapper) return {
      ok: false,
      reason: "khong-tim-thay-truong",
      clicked: false
    };
    var radioGroup = wrapper.querySelector(".dx-radiogroup");
    if (!radioGroup) return {
      ok: false,
      reason: "khong-co-radiogroup",
      clicked: false
    };
    var items = radioGroup.querySelectorAll(".dx-item.dx-radiobutton");
    if (!items || !items[optionIndex]) return {
      ok: false,
      reason: "khong-co-option",
      clicked: false
    };
    var target = items[optionIndex];
    var wasChecked = target.classList.contains("dx-radiobutton-checked");
    if (!wasChecked) target.click();
    return {
      ok: true,
      clicked: !wasChecked
    };
  }
  function te6FillKhamLamSang(silent) {
    var done = 0, clicked = 0, missed = [];
    Object.keys(TE6_KLS_FIELD_MAP).forEach(function(fieldClass) {
      var result = te6KlsSelectRadio(fieldClass, TE6_KLS_FIELD_MAP[fieldClass]);
      if (result.ok) {
        done++;
        if (result.clicked) clicked++;
      } else missed.push(fieldClass + " (" + result.reason + ")");
    });
    var total = Object.keys(TE6_KLS_FIELD_MAP).length;
    if (missed.length) console.warn("[TE6] Khong xu ly duoc:", missed);
    if (silent) return {
      done: done,
      total: total,
      clicked: clicked
    };
    if (done === total) {
      showToast("✅ Đã điền " + done + "/" + total + " trường Khám lâm sàng");
    } else if (done > 0) {
      showToast("⚠️ Đã điền " + done + "/" + total + " trường, thiếu " + missed.length + " (xem console)", "warn");
    } else {
      showToast("❌ Không tìm thấy trường nào để điền. Kiểm tra lại trang.", "error");
    }
    return {
      done: done,
      total: total,
      clicked: clicked
    };
  }
  var _te6KlsAutoFillDonePath = null;
  function te6AutoFillKhamLamSang() {
    var path = location.pathname;
    if (path.indexOf("KhamLamSang_MC") === -1) {
      _te6KlsAutoFillDonePath = null;
      return 0;
    }
    var firstField = document.querySelector(".h-item." + CSS.escape(Object.keys(TE6_KLS_FIELD_MAP)[0]));
    if (!firstField) return 0;
    var result = te6FillKhamLamSang(true);
    if (result.done > 0 && _te6KlsAutoFillDonePath !== path) {
      if (result.done === result.total) {
        showToast("✅ Đã tự động điền " + result.done + "/" + result.total + " trường Khám lâm sàng");
      } else {
        showToast("⚠️ Đã tự động điền " + result.done + "/" + result.total + " trường, xem console", "warn");
      }
    }
    _te6KlsAutoFillDonePath = path;
    te6BillDelta(location.href + "|kls", result.done);
    return result.clicked;
  }
  function te6ClickRadioInGroup(fieldClass, wantText) {
    var wrapper = document.querySelector(".h-item." + CSS.escape(fieldClass));
    if (!wrapper) return {
      found: false,
      clicked: false
    };
    var group = wrapper.querySelector(".dx-radiogroup");
    if (!group) return {
      found: false,
      clicked: false
    };
    var items = group.querySelectorAll(".dx-item.dx-radiobutton");
    for (var i = 0; i < items.length; i++) {
      var text = (items[i].textContent || "").trim();
      if (text.indexOf(wantText) !== -1) {
        var wasChecked = items[i].classList.contains("dx-radiobutton-checked");
        if (!wasChecked) items[i].click();
        return {
          found: true,
          clicked: !wasChecked
        };
      }
    }
    return {
      found: false,
      clicked: false
    };
  }
  function te6SimulateClick(el) {
    var opts = {
      bubbles: true,
      cancelable: true,
      view: window
    };
    try {
      el.dispatchEvent(new PointerEvent("pointerdown", opts));
    } catch (e) {}
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    try {
      el.dispatchEvent(new PointerEvent("pointerup", opts));
    } catch (e) {}
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  }
  function te6ClickListItem(fieldClass, wantText) {
    var wrapper = document.querySelector(".h-item." + CSS.escape(fieldClass));
    if (!wrapper) return {
      found: false,
      clicked: false
    };
    var items = wrapper.querySelectorAll(".dx-list-item");
    for (var i = 0; i < items.length; i++) {
      var contentEl = items[i].querySelector(".dx-list-item-content") || items[i];
      var text = (contentEl.textContent || "").trim();
      if (text.indexOf(wantText) === -1) continue;
      var isSelected = function() {
        return items[i].classList.contains("dx-list-item-selected") || items[i].getAttribute("aria-selected") === "true";
      };
      if (isSelected()) return {
        found: true,
        clicked: false
      };
      items[i].click();
      if (isSelected()) return {
        found: true,
        clicked: true
      };
      var icon = items[i].querySelector(".dx-list-select-radiobutton, .dx-list-select-checkbox, .dx-radio-value-container, .dx-checkbox-container");
      if (icon) {
        icon.click();
        if (isSelected()) return {
          found: true,
          clicked: true
        };
      }
      te6SimulateClick(items[i]);
      if (isSelected()) return {
        found: true,
        clicked: true
      };
      if (icon) {
        te6SimulateClick(icon);
        if (isSelected()) return {
          found: true,
          clicked: true
        };
      }
      return {
        found: true,
        clicked: false
      };
    }
    return {
      found: false,
      clicked: false
    };
  }
  var TE6_TTHC_FIELDS = [ {
    field: "TienSuBanThanCokhong",
    mode: "radio",
    value: "Không"
  }, {
    field: "TienSuGiaDinhCoKhong",
    mode: "radio",
    value: "Không"
  }, {
    field: "TienSu_TX_NguoiBenhLao",
    mode: "radio",
    value: "Không"
  }, {
    field: "HinhThucKham",
    mode: "list",
    value: "Ngân sách thành phố hỗ trợ"
  }, {
    field: "HinhThucChiTra",
    mode: "radio",
    value: "Khám theo hợp đồng"
  }, {
    field: "DiaDiemKham",
    mode: "list",
    value: "Trường học"
  } ];
  function te6FillThongTinHanhChinh(silent) {
    var done = 0, clicked = 0, missed = [];
    TE6_TTHC_FIELDS.forEach(function(item) {
      var r = item.mode === "radio" ? te6ClickRadioInGroup(item.field, item.value) : te6ClickListItem(item.field, item.value);
      if (r.found) {
        done++;
        if (r.clicked) clicked++;
      } else missed.push(item.field);
    });
    var total = TE6_TTHC_FIELDS.length;
    if (missed.length) console.warn("[TE6] Khong xu ly duoc (Thong tin hanh chinh):", missed);
    if (!silent) {
      if (done === total) showToast("✅ Đã điền " + done + "/" + total + " mục Thông tin hành chính"); else if (done > 0) showToast("⚠️ Đã điền " + done + "/" + total + " mục, thiếu " + missed.length + " (xem console)", "warn"); else showToast("❌ Không tìm thấy mục nào để điền. Kiểm tra lại trang.", "error");
    }
    return {
      done: done,
      total: total,
      clicked: clicked
    };
  }
  var _te6TthcAutoFillDonePath = null;
  var _te6TthcPollTimer = null;
  var _te6TthcPollPath = null;
  function te6AutoFillThongTinHanhChinh() {
    var path = location.pathname;
    if (path.indexOf("ThongTinHanhChinh_MC") === -1) {
      _te6TthcAutoFillDonePath = null;
      if (_te6TthcPollTimer) {
        clearInterval(_te6TthcPollTimer);
        _te6TthcPollTimer = null;
        _te6TthcPollPath = null;
      }
      return 0;
    }
    var firstField = document.querySelector(".h-item." + CSS.escape(TE6_TTHC_FIELDS[0].field));
    if (!firstField) return 0;
    var result = te6FillThongTinHanhChinh(true);
    if (result.done > 0 && _te6TthcAutoFillDonePath !== path) {
      if (result.done === result.total) {
        showToast("✅ Đã tự động điền " + result.done + "/" + result.total + " mục Thông tin hành chính");
      } else {
        showToast("⚠️ Đã tự động điền " + result.done + "/" + result.total + " mục, xem console", "warn");
      }
    }
    if (result.done === result.total) _te6TthcAutoFillDonePath = path;
    te6BillDelta(location.href + "|tthc", result.done);
    if (result.done < result.total && _te6TthcPollPath !== path) {
      _te6TthcPollPath = path;
      if (_te6TthcPollTimer) clearInterval(_te6TthcPollTimer);
      var attempts = 0;
      _te6TthcPollTimer = setInterval(function() {
        attempts++;
        if (location.pathname.indexOf("ThongTinHanhChinh_MC") === -1 || attempts > 30) {
          clearInterval(_te6TthcPollTimer);
          _te6TthcPollTimer = null;
          _te6TthcPollPath = null;
          return;
        }
        var r = te6FillThongTinHanhChinh(true);
        te6BillDelta(location.href + "|tthc", r.done);
        if (r.done === r.total) {
          showToast("✅ Đã tự động điền " + r.done + "/" + r.total + " mục Thông tin hành chính");
          _te6TthcAutoFillDonePath = location.pathname;
          clearInterval(_te6TthcPollTimer);
          _te6TthcPollTimer = null;
          _te6TthcPollPath = null;
        }
      }, 500);
    }
    return result.clicked;
  }
  function te6GetBilledCount(key) {
    try {
      var v = parseInt(sessionStorage.getItem("_mtt_billed_count:" + key), 10);
      return isNaN(v) ? 0 : v;
    } catch (e) {
      return 0;
    }
  }
  function te6SetBilledCount(key, v) {
    try {
      sessionStorage.setItem("_mtt_billed_count:" + key, String(v));
    } catch (e) {}
  }
  function te6BillDelta(key, currentDoneCount) {
    var billedSoFar = te6GetBilledCount(key);
    var delta = currentDoneCount - billedSoFar;
    if (delta <= 0) return;
    te6SetBilledCount(key, currentDoneCount);
    spendCredits(delta);
  }
  function te6RunAutoFillIfLicensed() {
    if (!isLicenseValid()) return;
    te6AutoFillCurrentPage();
    te6AutoFillKhamLamSang();
    te6AutoFillThongTinHanhChinh();
  }
  var SUBMENU_ID = "_mtt_submenu";
  function closeSubmenu() {
    var sm = document.getElementById(SUBMENU_ID);
    if (sm) sm.remove();
  }
  function getPatientAge() {
    var el = document.querySelector('.NgaySinh input[type="hidden"]');
    if (!el) el = document.querySelector('.NgaySinh dx-date-box input[type="hidden"]');
    if (!el || !el.value) return null;
    var m = el.value.match(/^(\d{4})/);
    if (!m) return null;
    return (new Date).getFullYear() - parseInt(m[1], 10);
  }
  function getAgeGroupIndex(age) {
    if (age === null) return null;
    if (age <= 40) return 0;
    if (age <= 60) return 1;
    if (age <= 70) return 2;
    if (age <= 80) return 3;
    return 4;
  }
  function openSubmenu(parentItem, subItems, noAgeLogic) {
    closeSubmenu();
    var sm = document.createElement("div");
    sm.id = SUBMENU_ID;
    Object.assign(sm.style, {
      position: "fixed",
      zIndex: "2000001",
      background: "#fff",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
      minWidth: "220px",
      padding: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    });
    var ageIdx = getAgeGroupIndex(getPatientAge());
    var AGE_ITEM_COUNT = 5;
    var visibleSubCount = 0;
    subItems.forEach(function(sub, i) {
      if (sub.check && !sub.check()) return;
      var btn = document.createElement("button");
      btn.innerHTML = (sub.emoji ? '<span style="margin-right:6px">' + sub.emoji + "</span>" : "") + sub.label;
      var dimmed = !noAgeLogic && i < AGE_ITEM_COUNT && ageIdx !== null && i !== ageIdx;
      Object.assign(btn.style, {
        display: "block",
        width: "100%",
        padding: "9px 12px",
        border: "1.5px solid " + sub.color,
        borderRadius: "6px",
        background: dimmed ? "#f5f5f5" : "#fff",
        color: dimmed ? "#aaa" : sub.color,
        borderColor: dimmed ? "#ddd" : sub.color,
        fontSize: "13px",
        fontWeight: "600",
        cursor: dimmed ? "default" : "pointer",
        textAlign: "left",
        transition: "opacity 0.15s",
        opacity: dimmed ? "0.38" : "1"
      });
      if (!dimmed) {
        btn.addEventListener("mouseenter", function() {
          btn.style.opacity = "0.75";
        });
        btn.addEventListener("mouseleave", function() {
          btn.style.opacity = "1";
        });
      }
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (dimmed) return;
        closeSubmenu();
        var menu = document.getElementById("_mtt_menu");
        if (menu) menu.style.display = "none";
        if (!isLicenseValid()) {
          showLicenseExpiredPopup();
          return;
        }
        sub.fn();
        if (!sub.selfBills) spendCredits(sub.creditCost || DEFAULT_ACTION_COST);
      });
      sm.appendChild(btn);
      visibleSubCount++;
    });
    if (visibleSubCount === 0) {
      var emptySub = document.createElement("div");
      emptySub.style.cssText = "padding:10px 12px;font-size:12.5px;color:#888;text-align:center;font-weight:500;";
      emptySub.textContent = "Không có thao tác nào khả dụng trên trang này";
      sm.appendChild(emptySub);
    }
    document.body.appendChild(sm);
    var rect = parentItem.getBoundingClientRect();
    var smW = sm.offsetWidth || 240;
    var smH = sm.offsetHeight || 200;
    var top = rect.top;
    var mainMenu = document.getElementById("_mtt_menu");
    var mainRect = mainMenu ? mainMenu.getBoundingClientRect() : rect;
    var leftCandidate = mainRect.right + 6;
    if (leftCandidate + smW > window.innerWidth - 4) {
      leftCandidate = mainRect.left - smW - 6;
    }
    if (leftCandidate < 4) leftCandidate = 4;
    if (top + smH > window.innerHeight - 8) top = window.innerHeight - smH - 8;
    if (top < 4) top = 4;
    sm.style.top = top + "px";
    sm.style.left = leftCandidate + "px";
  }
  document.addEventListener("click", function(e) {
    var sm = document.getElementById(SUBMENU_ID);
    if (!sm) return;
    if (sm.contains(e.target)) return;
    var menu = document.getElementById("_mtt_menu");
    if (menu && menu.contains(e.target)) return;
    closeSubmenu();
  }, true);
  var XLS_CACHE_KEY = "_mtt_xls_cls_cache_v1";
  var XLS_FIELDS = [ [ "F", "CongThucMau_SLHC" ], [ "G", "XNM_HuyetSacTo" ], [ "H", "XNM_Hematocrit" ], [ "I", "XNM_MCV" ], [ "J", "XNM_MCH" ], [ "K", "XNM_MCHC" ], [ "L", "XNM_RDW" ], [ "M", "CongThucMau_SLBC" ], [ "N", "SLBC_TrungTinh" ], [ "O", "SLBC_lympho" ], [ "P", "SLBC_DonNhan" ], [ "Q", "SLBC_AiToan" ], [ "R", "SLBC_AiKiem" ], [ "S", "CongThucMau_SLTC" ], [ "T", "SinhHoaMau_DuongMau" ], [ "U", "SinhHoaMau_Ure" ], [ "V", "SinhHoaMau_Creatinin" ], [ "W", "SinhHoaMau_ASAT_GOT" ], [ "X", "SinhHoaMau_ALAT_GPT" ], [ "Y", "NuocTieu_TiTrong" ], [ "Z", "NuocTieu_pH" ], [ "AA", "NuocTieu_BC" ], [ "AB", "NuocTieu_HC" ], [ "AC", "NuocTieu_Protein" ], [ "AD", "NuocTieu_Duong" ], [ "AE", "NuocTieu_Cetonic" ], [ "AF", "NuocTieu_Bilirubin" ], [ "AG", "NuocTieu_Urobilinogen" ] ];
  var XLS_NITRIT_CLASS = "NuocTieu_NiTrit";
  var XLS_MAX_DEC = {
    XNM_Hematocrit: 2
  };
  function xlsRoundFor(cls, val) {
    var d = XLS_MAX_DEC[cls];
    if (d == null || !/^-?\d+(\.\d+)?$/.test(val)) return val;
    var m = Math.pow(10, d);
    return String(Math.round((parseFloat(val) + Number.EPSILON) * m) / m);
  }
  function xlsNormCccd(v) {
    var d = String(v == null ? "" : v).replace(/\D/g, "");
    if (d.length >= 9 && d.length < 12) d = ("000000000000" + d).slice(-12);
    return d;
  }
  function xlsNormVal(v) {
    if (v == null) return "";
    if (typeof v === "number") return String(Math.round(v * 1e6) / 1e6);
    return String(v).trim();
  }
  function xlsGetPageCccdDirect() {
    var m = (document.body.innerText || "").match(/CCCD\s*:?\s*([0-9]{9,12})/i);
    return m ? xlsNormCccd(m[1]) : "";
  }
  var _xlsCccdCache = {
    value: ""
  };
  var XLS_CDMAP_KEY = "_mtt_cdid_cccd_v1";
  function xlsCdMapRead() {
    try {
      return JSON.parse(GM_getValue(XLS_CDMAP_KEY, "{}") || "{}");
    } catch (e) {
      return {};
    }
  }
  function xlsCdRec(cd) {
    var v = cd ? xlsCdMapRead()[cd] : null;
    if (!v) return null;
    return typeof v === "string" ? {
      c: v,
      n: "",
      d: "",
      g: ""
    } : v;
  }
  function xlsCdCccdLoad() {
    var r = xlsCdRec(xlsCdId());
    return r && r.c || "";
  }
  function xlsCdCccdSave(cccd, cd, extra) {
    cd = cd || xlsCdId();
    if (!cd || !cccd) return;
    try {
      var m = xlsCdMapRead();
      var old = m[cd] && typeof m[cd] === "object" && m[cd].c === cccd ? m[cd] : null;
      var rec = {
        c: cccd,
        n: extra && extra.n || old && old.n || "",
        d: extra && extra.d || old && old.d || "",
        g: extra && extra.g || old && old.g || ""
      };
      if (JSON.stringify(m[cd]) === JSON.stringify(rec)) return;
      m[cd] = rec;
      var ks = Object.keys(m);
      if (ks.length > 1500) ks.slice(0, ks.length - 1e3).forEach(function(k) {
        delete m[k];
      });
      GM_setValue(XLS_CDMAP_KEY, JSON.stringify(m));
    } catch (e) {}
  }
  var _xlsFrameEl = null, _xlsFrameTimer = null, _xlsFrameCd = "", _xlsFrameFailed = false;
  function xlsCccdFrameEnd() {
    if (_xlsFrameTimer) clearTimeout(_xlsFrameTimer);
    _xlsFrameTimer = null;
    if (_xlsFrameEl) {
      _xlsFrameEl.remove();
      _xlsFrameEl = null;
    }
  }
  function xlsCccdFrameStart() {
    if (_xlsFrameFailed || _xlsFrameEl) return false;
    var cd = xlsCdId();
    if (!cd || window.location.href.indexOf("KNCT_PhieuCLS_CanLamSang") === -1) return false;
    var url = window.location.href;
    var f = document.createElement("iframe");
    f.id = "_mtt_cccd_frame";
    f.name = "_mtt_cccd_frame";
    f.src = url;
    f.style.cssText = "position:fixed;left:-10000px;top:0;width:1280px;height:900px;opacity:0;pointer-events:none;border:0;";
    document.body.appendChild(f);
    _xlsFrameEl = f;
    _xlsFrameCd = cd;
    console.log("[MTT] Đọc CCCD nền: mở iframe ẩn, cdId=" + cd);
    _xlsFrameTimer = setTimeout(function() {
      xlsCccdFrameEnd();
      console.warn("[MTT] Không đọc được CCCD từ trang Thông tin hành chính sau 30 giây");
      _xlsFrameFailed = true;
      _xlsCccdResolving = false;
    }, 3e4);
    return true;
  }
  window.addEventListener("message", function(ev) {
    var d = ev.data;
    if (!d || !d.mttCccd || ev.origin !== window.location.origin || !_xlsFrameEl || d.cdId !== _xlsFrameCd) return;
    var cccd = xlsNormCccd(d.mttCccd);
    if (!cccd) return;
    if (xlsCdId() === d.cdId) _xlsCccdCache = {
      value: cccd
    };
    console.log("[MTT] Đọc CCCD qua iframe xong:", cccd, "|", d.name, "|", d.dob, "|", d.gender);
    xlsCdCccdSave(cccd, d.cdId, {
      n: d.name,
      d: d.dob,
      g: d.gender
    });
    xlsCccdFrameEnd();
    _xlsCccdResolving = false;
  });
  function xlsGetPageCccd() {
    var direct = xlsGetPageCccdDirect();
    if (direct) return direct;
    if (!_xlsCccdCache.value) {
      var pv = xlsCdCccdLoad();
      if (pv) {
        _xlsCccdCache = {
          value: pv
        };
        console.log("[MTT] CCCD lấy từ bộ nhớ (không mở iframe, không chuyển tab):", pv);
      }
    }
    return _xlsCccdCache.value || "";
  }
  var _xlsCccdResolving = false, _xlsCccdAttempted = false;
  function xlsCccdResolverTick() {
    if (_xlsCccdResolving || _xlsCccdAttempted || !isScriptEnabled() || _wrapperHidden || !xlsPageIsCls()) return;
    if (!_xlsCccdCache.value) {
      var pv0 = xlsCdCccdLoad();
      if (pv0) _xlsCccdCache = {
        value: pv0
      };
    }
    if (xlsGetPageCccdDirect() || _xlsCccdCache.value) return;
    if (!document.querySelector('li[data-item-id="KNCT_PhieuCLS_CanLamSang"]')) return;
    if (xlsCccdFrameStart()) {
      _xlsCccdAttempted = true;
      _xlsCccdResolving = true;
    }
  }
  setInterval(xlsCccdResolverTick, 900);
  function xlsSetInput(cls, val) {
    var item = document.querySelector("." + cls);
    if (!item) return 0;
    var input = item.querySelector("input.dx-texteditor-input");
    if (!input || input.disabled) return 0;
    var cur = input.value == null ? "" : String(input.value).trim();
    if (cur === val) return 1;
    input.focus({
      preventScroll: true
    });
    nativeSetter.call(input, val);
    input.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    input.dispatchEvent(new Event("change", {
      bubbles: true
    }));
    input.blur();
    input.dispatchEvent(new Event("focusout", {
      bubbles: true
    }));
    return 1;
  }
  function xlsNitritWant(raw) {
    var s = xlsNormVal(raw).toLowerCase().normalize("NFC");
    if (s === "1" || s === "neg" || s === "negative" || s === "âm tính") return "âm tính";
    if (s === "0" || s === "pos" || s === "positive" || s === "dương tính") return "dương tính";
    return "";
  }
  function xlsFindNitritGroup() {
    var cands = [];
    document.querySelectorAll("." + XLS_NITRIT_CLASS).forEach(function(el) {
      if (el.matches && el.matches(".dx-radiogroup")) cands.push(el);
      el.querySelectorAll(".dx-radiogroup").forEach(function(g) {
        cands.push(g);
      });
    });
    function usable(g) {
      return !g.classList.contains("dx-state-disabled") && g.getAttribute("aria-disabled") !== "true" && !!g.offsetParent;
    }
    for (var i = 0; i < cands.length; i++) if (usable(cands[i])) return cands[i];
    var all = document.querySelectorAll(".dx-radiogroup");
    for (var k = 0; k < all.length; k++) {
      var g = all[k], t = (g.textContent || "").toLowerCase();
      if (!usable(g) || t.indexOf("âm") === -1 || t.indexOf("dương") === -1) continue;
      var box = g.closest(".dx-field-item, .h-item");
      if (box && /nitrit/i.test(box.textContent)) return g;
    }
    return null;
  }
  function xlsNitritIsChecked(it) {
    return it.getAttribute("aria-checked") === "true" || it.classList.contains("dx-radiobutton-checked");
  }
  function xlsSetNitrit(raw) {
    var want = xlsNitritWant(raw);
    if (!want) return 0;
    var group = xlsFindNitritGroup();
    if (!group) return 0;
    var items = group.querySelectorAll(".dx-item.dx-radiobutton");
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var txt = it.textContent.trim().toLowerCase().normalize("NFC");
      if (txt !== want) continue;
      if (xlsNitritIsChecked(it)) return 1;
      fullClick(it.querySelector(".dx-radiobutton-icon") || it);
      setTimeout(function() {
        if (!xlsNitritIsChecked(it)) fullClick(it.querySelector(".dx-item-content") || it);
      }, 250);
      setTimeout(function() {
        if (!xlsNitritIsChecked(it)) it.click();
      }, 500);
      return 1;
    }
    return 0;
  }
  var _xlsLastAoa = null;
  function xlsHdrKey(v) {
    var t = String(v == null ? "" : v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d");
    t = t.split("(")[0];
    return t.replace(/\s+/g, " ").trim();
  }
  var XLS_HDR_KEYS = {
    CongThucMau_SLHC: [ "so luong hc", "so luong hong cau" ],
    XNM_HuyetSacTo: [ "huyet sac to", "hemoglobin", "hgb" ],
    XNM_Hematocrit: [ "hematocrit", "hct" ],
    XNM_MCV: [ "mcv" ],
    XNM_MCH: [ "mch" ],
    XNM_MCHC: [ "mchc" ],
    XNM_RDW: [ "rdw" ],
    CongThucMau_SLBC: [ "so luong bach cau" ],
    SLBC_TrungTinh: [ "so luong bach cau trung tinh" ],
    SLBC_lympho: [ "so luong bach cau lympho" ],
    SLBC_DonNhan: [ "so luong bach cau don nhan" ],
    SLBC_AiToan: [ "so luong bach cau ai toan" ],
    SLBC_AiKiem: [ "so luong bach cau ai kiem" ],
    CongThucMau_SLTC: [ "so luong tieu cau" ],
    SinhHoaMau_DuongMau: [ "duong mau" ],
    SinhHoaMau_Ure: [ "ure", "urea" ],
    SinhHoaMau_Creatinin: [ "creatinin", "creatinine" ],
    SinhHoaMau_ASAT_GOT: [ "asat", "got", "ast" ],
    SinhHoaMau_ALAT_GPT: [ "alat", "gpt", "alt" ],
    NuocTieu_TiTrong: [ "ti trong", "ty trong" ],
    NuocTieu_pH: [ "ph" ],
    NuocTieu_BC: [ "bach cau" ],
    NuocTieu_HC: [ "hong cau" ],
    NuocTieu_Protein: [ "protein" ],
    NuocTieu_Duong: [ "glucose", "duong" ],
    NuocTieu_Cetonic: [ "the cetonic", "cetonic", "ketone" ],
    NuocTieu_Bilirubin: [ "bilirubin" ],
    NuocTieu_Urobilinogen: [ "urobilinogen" ],
    NuocTieu_NiTrit: [ "nitrit", "nitrite" ]
  };
  var XLS_ID_KEYS = {
    cccd: [ "cccd", "so cccd", "cmnd", "can cuoc cong dan", "so can cuoc" ],
    name: [ "benh nhan", "ho ten", "ho va ten", "ten benh nhan", "ten" ],
    gender: [ "phai", "gioi tinh", "gioi", "gt" ],
    dob: [ "ngay sinh" ],
    year: [ "nam sinh", "tuoi", "ns" ]
  };
  function xlsFmtDate(d, m, y) {
    return (d < 10 ? "0" : "") + d + "/" + (m < 10 ? "0" : "") + m + "/" + y;
  }
  function xlsParseBirth(raw) {
    var out = {
      text: "",
      year: null,
      full: false
    };
    if (raw == null || raw === "") return out;
    var thisYear = (new Date).getFullYear();
    if (typeof raw === "number") {
      if (raw > 1900 && raw < 2100) {
        out.year = Math.round(raw);
        out.text = String(out.year);
        return out;
      }
      if (raw > 20000 && raw < 80000) {
        var dt = new Date(Math.round((raw - 25569) * 864e5));
        out.year = dt.getUTCFullYear();
        out.text = xlsFmtDate(dt.getUTCDate(), dt.getUTCMonth() + 1, out.year);
        out.full = true;
        return out;
      }
      if (raw > 0 && raw < 150) {
        out.year = thisYear - Math.round(raw);
        out.text = "";
        return out;
      }
      return out;
    }
    var str = String(raw).trim();
    var m = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
    if (m) {
      out.year = parseInt(m[3], 10);
      out.text = xlsFmtDate(parseInt(m[1], 10), parseInt(m[2], 10), out.year);
      out.full = true;
      return out;
    }
    m = str.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
    if (m) {
      out.year = parseInt(m[1], 10);
      out.text = xlsFmtDate(parseInt(m[3], 10), parseInt(m[2], 10), out.year);
      out.full = true;
      return out;
    }
    if (/^\d{4}$/.test(str)) {
      out.year = parseInt(str, 10);
      out.text = str;
      return out;
    }
    if (/^\d{1,3}$/.test(str) && parseInt(str, 10) < 150) {
      out.year = thisYear - parseInt(str, 10);
      return out;
    }
    return out;
  }
  function xlsGenderLabel(g) {
    var k = xlsHdrKey(g);
    if (k === "f" || k === "nu" || k === "female" || k === "0") return "Nữ";
    if (k === "m" || k === "nam" || k === "male" || k === "1") return "Nam";
    return String(g == null ? "" : g).trim();
  }
  function xlsParseBuffer(buf, fileName) {
    if (typeof XLSX === "undefined") throw new Error("Chưa tải được thư viện đọc Excel (SheetJS)");
    var wb = XLSX.read(new Uint8Array(buf), {
      type: "array"
    });
    var ws = wb.Sheets[wb.SheetNames[0]];
    var aoa = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: ""
    });
    _xlsLastAoa = aoa;
    var scan = Math.min(aoa.length, 6), maxCols = 0, i, c;
    for (i = 0; i < scan; i++) if ((aoa[i] || []).length > maxCols) maxCols = aoa[i].length;
    var hdr = [];
    for (c = 0; c < maxCols; c++) hdr[c] = [];
    var cccdRow = -1, labRow = -1, labBest = 0;
    for (i = 0; i < scan; i++) {
      var rr = aoa[i] || [], labHits = 0;
      for (c = 0; c < rr.length; c++) {
        var k = xlsHdrKey(rr[c]);
        if (!k) continue;
        if (cccdRow === -1 && XLS_ID_KEYS.cccd.indexOf(k) !== -1) cccdRow = i;
        for (var cls in XLS_HDR_KEYS) if (XLS_HDR_KEYS[cls].indexOf(k) !== -1) {
          labHits++;
          break;
        }
      }
      if (labHits > labBest) {
        labBest = labHits;
        labRow = i;
      }
    }
    if (cccdRow === -1) throw new Error("Sai định dạng file: không thấy cột tiêu đề \"CCCD\" trong 6 dòng đầu");
    if (labBest < 5) throw new Error("Sai định dạng file: không nhận diện được các cột xét nghiệm (tiêu đề như \"Số lượng HC\", \"Huyết sắc tố\"...)");
    var hdrEnd = Math.max(cccdRow, labRow);
    for (i = 0; i <= hdrEnd; i++) {
      var r0 = aoa[i] || [];
      for (c = 0; c < maxCols; c++) {
        var kk = xlsHdrKey(r0[c]);
        if (kk) hdr[c].push(kk);
      }
    }
    function findId(list) {
      for (var a = 0; a < list.length; a++) for (var cc = 0; cc < maxCols; cc++) if (hdr[cc].indexOf(list[a]) !== -1) return cc;
      return -1;
    }
    var colMap = {
      __missing: []
    };
    var ci = {
      cccd: findId(XLS_ID_KEYS.cccd),
      name: findId(XLS_ID_KEYS.name),
      gender: findId(XLS_ID_KEYS.gender),
      dob: findId(XLS_ID_KEYS.dob),
      year: findId(XLS_ID_KEYS.year)
    };
    if (ci.cccd === -1) throw new Error("Sai định dạng file: không thấy cột \"CCCD\"");
    for (var cls2 in XLS_HDR_KEYS) {
      var found = -1;
      for (c = 0; c < maxCols && found === -1; c++) {
        var last = hdr[c].length ? hdr[c][hdr[c].length - 1] : "";
        if (last && XLS_HDR_KEYS[cls2].indexOf(last) !== -1) found = c;
      }
      if (found === -1) colMap.__missing.push(cls2); else colMap[cls2] = found;
    }
    var rows = [], ident = {};
    for (i = hdrEnd + 1; i < aoa.length; i++) {
      var r = aoa[i], cccd = xlsNormCccd(r[ci.cccd]);
      if (!cccd) continue;
      var bRaw = ci.dob !== -1 && r[ci.dob] !== "" ? r[ci.dob] : ci.year !== -1 ? r[ci.year] : "";
      var b = xlsParseBirth(bRaw);
      if (!b.year && ci.year !== -1 && ci.dob !== -1) b = xlsParseBirth(r[ci.year]);
      var nm = ci.name !== -1 ? String(r[ci.name] || "").trim() : "";
      var gd = ci.gender !== -1 ? xlsGenderLabel(r[ci.gender]) : "";
      rows.push({
        cccd: cccd,
        name: nm,
        cells: r,
        birthYear: b.year && b.year > 1900 && b.year < 2100 ? b.year : null
      });
      ident[cccd] = {
        name: nm,
        gender: gd,
        birth: b.text,
        full: b.full,
        year: b.year || null
      };
    }
    if (!rows.length) throw new Error("Không có dòng bệnh nhân nào (cột CCCD trống)");
    rows.colMap = colMap;
    xlsIdentSave(ident, fileName);
    return rows;
  }
  function xlsFillFromRows(rows, meta) {
    var cccd = xlsGetPageCccd();
    if (!cccd) {
      showToast("⚠ Không đọc được CCCD trên trang, chờ trang tải xong rồi thử lại", "warn");
      return 0;
    }
    var row = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].cccd === cccd) {
      row = rows[i];
      break;
    }
    if (!row) {
      showToast("❌ CCCD " + cccd + " không có trong file Excel", "error");
      return 0;
    }
    var filled = 0, missing = [], colMap = rows.colMap || {
      __missing: []
    }, noCol = [];
    function cellOf(cls) {
      var ix = colMap[cls];
      return ix == null ? "" : row.cells[ix];
    }
    XLS_FIELDS.forEach(function(f) {
      if (colMap[f[1]] == null) {
        noCol.push(f[1]);
        return;
      }
      var val = xlsNormVal(cellOf(f[1]));
      if (val === "") return;
      val = xlsRoundFor(f[1], val);
      if (/^-?\d+\.\d+$/.test(val)) val = val.replace(".", ",");
      if (!document.querySelector("." + f[1])) {
        missing.push(f[1]);
        return;
      }
      filled += xlsSetInput(f[1], val);
    });
    filled += xlsSetNitrit(cellOf(XLS_NITRIT_CLASS));
    setTimeout(function() {
      var bad = [];
      XLS_FIELDS.forEach(function(f) {
        var want = xlsNormVal(cellOf(f[1]));
        if (want === "") return;
        want = xlsRoundFor(f[1], want);
        var it = document.querySelector("." + f[1]);
        var inp = it && it.querySelector("input.dx-texteditor-input");
        if (!inp) return;
        var got = String(inp.value || "").trim();
        var a = parseFloat(want.replace(",", ".")), b = parseFloat(got.replace(",", "."));
        var same = !isNaN(a) && !isNaN(b) ? Math.abs(a - b) < 1e-9 : got === want;
        if (!same) bad.push(f[1] + ": Excel " + want + " → trang " + (got || "(trống)"));
      });
      var wantN = xlsNitritWant(cellOf(XLS_NITRIT_CLASS));
      if (wantN) {
        var gN = xlsFindNitritGroup();
        var okN = false;
        if (gN) {
          var selN = gN.querySelector('.dx-radiobutton-checked, [aria-checked="true"]');
          okN = !!selN && selN.textContent.trim().toLowerCase().normalize("NFC") === wantN;
        }
        if (!okN) bad.push("Nitrit: Excel " + wantN + " → trang không khớp");
      }
      if (bad.length) {
        console.warn("[Medinet] Ô không khớp Excel:", bad);
        showToast("⚠ " + bad.length + " ô không khớp Excel: " + bad.slice(0, 3).join(" | ") + (bad.length > 3 ? " …" : ""), "warn");
      }
    }, 900);
    if (missing.length) console.warn("[Medinet] Không thấy ô:", missing);
    if (noCol.length) {
      console.warn("[Medinet] Excel thiếu cột:", noCol);
      showToast("⚠ File Excel thiếu " + noCol.length + " cột (không có tiêu đề tương ứng): " + noCol.slice(0, 4).join(", ") + (noCol.length > 4 ? " …" : ""), "warn");
    }
    showToast("✅ " + row.name + " — đã điền " + filled + " ô" + (missing.length ? " (thiếu " + missing.length + " ô trên trang)" : "") + (meta ? " [" + meta + "]" : "") + ". Nhớ bấm Lưu thay đổi.", missing.length ? "warn" : "success");
    return filled;
  }
  var XLS_DB_NAME = "_mtt_xls_handle_db", XLS_DB_STORE = "h";
  function xlsIdbOpen() {
    return new Promise(function(resolve, reject) {
      var req = _pageWin.indexedDB.open(XLS_DB_NAME, 1);
      req.onupgradeneeded = function() {
        req.result.createObjectStore(XLS_DB_STORE);
      };
      req.onsuccess = function() {
        resolve(req.result);
      };
      req.onerror = function() {
        reject(req.error);
      };
    });
  }
  function xlsIdbPut(key, val) {
    return xlsIdbOpen().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(XLS_DB_STORE, "readwrite");
        tx.objectStore(XLS_DB_STORE).put(val, key);
        tx.oncomplete = function() {
          resolve();
        };
        tx.onerror = function() {
          reject(tx.error);
        };
      });
    });
  }
  function xlsIdbGet(key) {
    return xlsIdbOpen().then(function(db) {
      return new Promise(function(resolve, reject) {
        var req = db.transaction(XLS_DB_STORE, "readonly").objectStore(XLS_DB_STORE).get(key);
        req.onsuccess = function() {
          resolve(req.result || null);
        };
        req.onerror = function() {
          reject(req.error);
        };
      });
    });
  }
  function xlsReadHandle(handle) {
    return handle.queryPermission({
      mode: "read"
    }).then(function(p) {
      return p === "granted" ? p : handle.requestPermission({
        mode: "read"
      });
    }).then(function(p) {
      if (p !== "granted") throw new Error("Chưa cấp quyền đọc file Excel");
      return handle.getFile();
    }).then(function(file) {
      return file.arrayBuffer().then(function(buf) {
        return {
          file: file,
          buf: buf
        };
      });
    });
  }
  function xlsFmtTime(ms) {
    var d = new Date(ms);
    function p2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
  }
  function xlsFillFromBuffer(file, buf) {
    try {
      var rows = xlsParseBuffer(buf, file.name);
      var n = xlsFillFromRows(rows, file.name + " - sửa lúc " + xlsFmtTime(file.lastModified));
      if (n > 0) spendCredits(n);
    } catch (err) {
      showToast("❌ " + err.message, "error");
    }
  }
  function xlsHandleError(err) {
    if (err && err.name === "AbortError") return;
    var msg = err && err.message ? err.message : String(err);
    if (err && err.name === "NotFoundError") msg = "Không tìm thấy file (đã đổi tên/di chuyển?) - hãy chọn lại file";
    showToast("❌ " + msg, "error");
  }
  function xlsPickAndFill() {
    if (typeof _pageWin.showOpenFilePicker !== "function") {
      xlsOpenPickerLegacy();
      return;
    }
    _pageWin.showOpenFilePicker({
      multiple: false,
      types: [ {
        description: "Excel",
        accept: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [ ".xlsx" ],
          "application/vnd.ms-excel": [ ".xls" ]
        }
      } ]
    }).then(function(hs) {
      var h = hs[0];
      xlsIdbPut("file", h).catch(function() {});
      return xlsReadHandle(h);
    }).then(function(r) {
      xlsFillFromBuffer(r.file, r.buf);
    }).catch(xlsHandleError);
  }
  function xlsOpenPickerLegacy() {
    var inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".xlsx,.xls";
    inp.style.display = "none";
    inp.addEventListener("change", function() {
      var f = inp.files && inp.files[0];
      inp.remove();
      if (!f) return;
      var fr = new FileReader;
      fr.onload = function() {
        xlsFillFromBuffer(f, fr.result);
      };
      fr.onerror = function() {
        showToast("❌ Không đọc được file", "error");
      };
      fr.readAsArrayBuffer(f);
    });
    document.body.appendChild(inp);
    inp.click();
  }
  function xlsShowChoiceModal(handle) {
    var ID = "_mtt_xls_modal";
    var old = document.getElementById(ID);
    if (old) old.remove();
    var overlay = document.createElement("div");
    overlay.id = ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.45)",
      zIndex: "2147483000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    var card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fff",
      borderRadius: "10px",
      padding: "18px",
      width: "380px",
      maxWidth: "92vw",
      fontFamily: "Segoe UI, Arial, sans-serif",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    });
    function mkBtn(text, bg, color, onClick) {
      var b = document.createElement("button");
      b.textContent = text;
      Object.assign(b.style, {
        display: "block",
        width: "100%",
        padding: "10px",
        margin: "8px 0 0",
        border: "none",
        borderRadius: "6px",
        background: bg,
        color: color,
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
      });
      b.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        overlay.remove();
        onClick();
      });
      return b;
    }
    var title = document.createElement("div");
    title.textContent = "📊 Điền cận lâm sàng từ Excel";
    title.style.cssText = "font-size:15px;font-weight:700;color:#0f766e;";
    card.appendChild(title);
    if (handle) {
      var info = document.createElement("div");
      info.textContent = "File: " + handle.name + " — mỗi lần bấm sẽ đọc lại nội dung MỚI NHẤT từ ổ đĩa (nhớ Lưu file Excel trước khi điền).";
      info.style.cssText = "font-size:12px;color:#555;margin-top:6px;line-height:1.5;";
      card.appendChild(info);
      card.appendChild(mkBtn("▶ Đọc lại file & điền theo CCCD trang này", "#0f766e", "#fff", function() {
        xlsReadHandle(handle).then(function(r) {
          xlsFillFromBuffer(r.file, r.buf);
        }).catch(xlsHandleError);
      }));
    }
    card.appendChild(mkBtn("📂 Chọn file Excel" + (handle ? " khác" : ""), "#e5e7eb", "#111", xlsPickAndFill));
    card.appendChild(mkBtn("Đóng", "#fff", "#666", function() {}));
    overlay.appendChild(card);
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }
  function xlsStart() {
    if (typeof _pageWin.showOpenFilePicker !== "function" || !_pageWin.indexedDB) {
      xlsOpenPickerLegacy();
      return;
    }
    xlsIdbGet("file").then(function(h) {
      xlsShowChoiceModal(h);
    }).catch(function() {
      xlsShowChoiceModal(null);
    });
  }
  var XLS_FLOAT_KEY = "_mtt_xls_float_on";
  var XLS_FLOAT_ID = "_mtt_xls_float";
  var XLS_FLOAT_CTX_ID = "_mtt_xls_ctx";
  var XLS_AUTO_KEY = "_mtt_xls_auto_on";
  function xlsFloatEnabled() {
    try {
      return GM_getValue(XLS_FLOAT_KEY, true) !== false;
    } catch (e) {
      return true;
    }
  }
  function xlsSetFloatEnabled(v) {
    try {
      GM_setValue(XLS_FLOAT_KEY, !!v);
    } catch (e) {}
  }
  function xlsAutoEnabled() {
    try {
      return GM_getValue(XLS_AUTO_KEY, false) === true;
    } catch (e) {
      return false;
    }
  }
  function xlsSetAutoEnabled(v) {
    try {
      GM_setValue(XLS_AUTO_KEY, !!v);
    } catch (e) {}
  }
  function xlsPageIsCls() {
    var h = window.location.href;
    return h.indexOf("KSKDK_Phieu_CanLamSang") !== -1 || h.indexOf("KNCT_PhieuCLS_CanLamSang") !== -1;
  }
  function xlsAutoFill() {
    if (typeof _pageWin.showOpenFilePicker !== "function" || !_pageWin.indexedDB) {
      xlsOpenPickerLegacy();
      return;
    }
    xlsIdbGet("file").then(function(h) {
      if (!h) {
        xlsShowChoiceModal(null);
        return null;
      }
      return xlsReadHandle(h).then(function(r) {
        xlsFillFromBuffer(r.file, r.buf);
      });
    }).catch(function(err) {
      xlsHandleError(err);
      if (!(err && err.name === "AbortError")) xlsShowChoiceModal(null);
    });
  }
  function xlsPlaceFloat(btn) {
    var W = btn.offsetWidth || 140;
    var box = document.querySelector(".emptybox2980");
    var left = null;
    if (box) {
      var r = box.getBoundingClientRect();
      if (r.width > 0) left = Math.min(Math.max(r.right - W - 8, 8), window.innerWidth - W - 8);
    }
    btn.style.top = "200px";
    if (left !== null) {
      btn.style.left = left + "px";
      btn.style.right = "auto";
    } else {
      btn.style.left = "auto";
      btn.style.right = "24px";
    }
  }
  function xlsUpdateFloatBtn() {
    var btn = document.getElementById(XLS_FLOAT_ID);
    var show = xlsFloatEnabled() && xlsPageIsCls() && isScriptEnabled() && !_wrapperHidden;
    if (!show) {
      if (btn) btn.remove();
      return;
    }
    if (!btn) {
      btn = document.createElement("button");
      btn.id = XLS_FLOAT_ID;
      btn.type = "button";
      btn.textContent = "📊 Điền kết quả CLS";
      btn.title = "Bấm: đọc file Excel mới nhất và điền theo CCCD • Chuột phải: tùy chọn (nút nổi / điền tự động khi load trang)";
      Object.assign(btn.style, {
        position: "fixed",
        zIndex: "2000000",
        padding: "10px 16px",
        background: "#0f766e",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        fontFamily: "Segoe UI, Arial, sans-serif",
        whiteSpace: "nowrap"
      });
      btn.addEventListener("mouseenter", function() {
        btn.style.background = "#115e59";
      });
      btn.addEventListener("mouseleave", function() {
        btn.style.background = "#0f766e";
      });
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!isLicenseValid()) {
          showLicenseExpiredPopup();
          return;
        }
        xlsAutoFill();
      });
      btn.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        e.stopPropagation();
        xlsShowFloatCtx(e.clientX, e.clientY);
      });
      document.body.appendChild(btn);
    }
    xlsPlaceFloat(btn);
  }
  function xlsShowFloatCtx(x, y) {
    var old = document.getElementById(XLS_FLOAT_CTX_ID);
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = XLS_FLOAT_CTX_ID;
    Object.assign(m.style, {
      position: "fixed",
      zIndex: "2147483001",
      background: "#fff",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
      padding: "6px",
      fontFamily: "Segoe UI, Arial, sans-serif"
    });
    function mkRow(text, checked, onChange) {
      var label = document.createElement("label");
      Object.assign(label.style, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#111",
        cursor: "pointer",
        whiteSpace: "nowrap"
      });
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = checked;
      Object.assign(cb.style, {
        width: "16px",
        height: "16px",
        cursor: "pointer"
      });
      cb.addEventListener("change", function() {
        onChange(cb.checked);
        m.remove();
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(text));
      m.appendChild(label);
    }
    mkRow("Hiện nút nổi điền dữ liệu Excel", xlsFloatEnabled(), function(on) {
      xlsSetFloatEnabled(on);
      xlsUpdateFloatBtn();
      showToast(on ? "📊 Đã BẬT nút nổi điền Excel" : "📊 Đã TẮT nút nổi điền Excel", on ? "success" : "warn");
    });
    mkRow("Điền tự động sau khi load trang xong", xlsAutoEnabled(), function(on) {
      xlsSetAutoEnabled(on);
      xlsAutoDoneKey = xlsAutoPageKey();
      showToast(on ? "⚡ Đã BẬT điền tự động: từ lần load trang Cận lâm sàng sau sẽ tự điền" : "⚡ Đã TẮT điền tự động", on ? "success" : "warn");
    });
    document.body.appendChild(m);
    var w = m.offsetWidth || 260, h = m.offsetHeight || 40;
    m.style.left = Math.max(4, Math.min(x, window.innerWidth - w - 8)) + "px";
    m.style.top = Math.max(4, Math.min(y, window.innerHeight - h - 8)) + "px";
    function closer(e) {
      if (m.contains(e.target)) return;
      m.remove();
      document.removeEventListener("mousedown", closer, true);
    }
    setTimeout(function() {
      document.addEventListener("mousedown", closer, true);
    }, 0);
  }
  var xlsAutoSeen = {
    key: "",
    t: 0
  };
  var xlsAutoDoneKey = "";
  var xlsAutoBusy = false;
  function xlsAutoPageKey() {
    var cccd = xlsGetPageCccd();
    if (!cccd) return "";
    if (!document.querySelector(".CongThucMau_SLHC input.dx-texteditor-input")) return "";
    return window.location.href + "|" + cccd;
  }
  function xlsAutoTick() {
    if (!xlsAutoEnabled() || !xlsPageIsCls() || !isScriptEnabled() || _wrapperHidden || xlsAutoBusy) return;
    var key = xlsAutoPageKey();
    if (!key) {
      xlsAutoSeen = {
        key: "",
        t: 0
      };
      return;
    }
    if (key === xlsAutoDoneKey) return;
    var now = Date.now();
    if (xlsAutoSeen.key !== key) {
      xlsAutoSeen = {
        key: key,
        t: now
      };
      return;
    }
    if (now - xlsAutoSeen.t < 1200) return;
    if (!isLicenseValid() && !isVerifiedWalletFresh() && now - xlsAutoSeen.t < 1e4) return;
    xlsAutoDoneKey = key;
    if (!isLicenseValid()) {
      showLicenseExpiredPopup();
      return;
    }
    if (typeof _pageWin.showOpenFilePicker !== "function" || !_pageWin.indexedDB) {
      showToast("⚠ Trình duyệt không hỗ trợ điền tự động - hãy bấm nút Điền kết quả CLS", "warn");
      return;
    }
    xlsAutoBusy = true;
    xlsIdbGet("file").then(function(h) {
      if (!h) {
        showToast("⚠ Điền tự động: chưa chọn file Excel - bấm nút Điền kết quả CLS để chọn file 1 lần", "warn");
        return null;
      }
      return h.queryPermission({
        mode: "read"
      }).then(function(p) {
        if (p !== "granted") {
          showToast("⚠ Điền tự động: cần cấp quyền đọc file Excel - bấm nút Điền kết quả CLS 1 lần (sau đó các trang sau sẽ tự điền)", "warn");
          return null;
        }
        return h.getFile().then(function(file) {
          return file.arrayBuffer().then(function(buf) {
            xlsFillFromBuffer(file, buf);
          });
        });
      });
    }).catch(function(err) {
      xlsHandleError(err);
    }).then(function() {
      xlsAutoBusy = false;
    });
  }
  setInterval(xlsUpdateFloatBtn, 800);
  setInterval(xlsAutoTick, 700);
  var XLS_IDENT_KEY = "_mtt_xls_ident_v1";
  var _xlsIdent = null;
  function xlsIdentSave(map, fileName) {
    var prev = _xlsIdent;
    _xlsIdent = {
      map: map,
      file: fileName || prev && prev.file || "",
      at: Date.now()
    };
    try {
      GM_setValue(XLS_IDENT_KEY, JSON.stringify(_xlsIdent));
    } catch (e) {}
  }
  function xlsIdentLoad() {
    if (_xlsIdent) return _xlsIdent;
    try {
      var v = GM_getValue(XLS_IDENT_KEY, null);
      if (v) _xlsIdent = JSON.parse(v);
    } catch (e) {}
    return _xlsIdent;
  }
  var _identRefreshAt = 0, _identRefreshing = false;
  function xlsIdentRefreshFromFile() {
    if (_identRefreshing || Date.now() - _identRefreshAt < 1e4 || !_pageWin.indexedDB) return;
    _identRefreshing = true;
    _identRefreshAt = Date.now();
    var keepAoa = _xlsLastAoa;
    xlsIdbGet("file").then(function(h) {
      if (!h) return null;
      return h.queryPermission({
        mode: "read"
      }).then(function(p) {
        if (p !== "granted") return null;
        return h.getFile().then(function(file) {
          return file.arrayBuffer().then(function(buf) {
            xlsParseBuffer(buf, file.name);
          });
        });
      });
    }).catch(function() {}).then(function() {
      _xlsLastAoa = keepAoa;
      _identRefreshing = false;
    });
  }
  function xlsCdId() {
    var m = window.location.href.match(/[?&]cdId=(\d+)/i);
    return m ? m[1] : "";
  }
  var _xlsCdIdSeen = xlsCdId();
  function xlsCdIdWatch() {
    if (!xlsPageIsCls()) return;
    var c = xlsCdId();
    if (c && _xlsCdIdSeen && c !== _xlsCdIdSeen) {
      _xlsCccdCache = {
        value: ""
      };
      _xlsCccdAttempted = false;
      _xlsFrameFailed = false;
      if (_xlsFrameEl) {
        xlsCccdFrameEnd();
        _xlsCccdResolving = false;
      }
    }
    if (c) _xlsCdIdSeen = c;
  }
  setInterval(xlsCdIdWatch, 500);
  var XLS_IDENT_PANEL_ID = "_mtt_ident_panel";
  function xlsIdentPageOk() {
    return window.location.href.indexOf("KNCT_PhieuCLS_CanLamSang") !== -1;
  }
  function xlsIdentFindAnchor() {
    var a = document.querySelector(".groupitem65351003785");
    if (a) return a;
    var hs = document.querySelectorAll(".h-item");
    for (var i = 0; i < hs.length; i++) {
      var t = (hs[i].textContent || "").replace(/\s+/g, " ").trim();
      if (t.indexOf("Nội dung") === 0 && t.indexOf("Cận lâm sàng thực hiện") !== -1) return hs[i];
    }
    return null;
  }
  function xlsIdentItem(icon, color, label, value, bold) {
    var sp = document.createElement("span");
    sp.style.cssText = "display:inline-flex;align-items:center;gap:5px;margin:2px 14px;font-size:13.5px;color:#4b5563;";
    var ic = document.createElement("i");
    ic.className = "fa " + icon;
    ic.style.color = color;
    sp.appendChild(ic);
    sp.appendChild(document.createTextNode(label + ": "));
    var b = document.createElement("b");
    b.style.color = "#111";
    b.textContent = value;
    sp.appendChild(b);
    return sp;
  }
  function xlsIdentRender(panel, sig, cccd, rec, ident, pinfo, failed) {
    if (panel.getAttribute("data-sig") === sig) return;
    panel.setAttribute("data-sig", sig);
    panel.textContent = "";
    var title = document.createElement("div");
    title.style.cssText = "text-align:center;font-weight:700;font-size:15px;color:#1e88e5;margin-bottom:4px;";
    title.innerHTML = '<i class="fa fa-id-card" style="margin-right:6px"></i>THÔNG TIN ĐỐI TƯỢNG KHÁM';
    panel.appendChild(title);
    var body = document.createElement("div");
    body.style.cssText = "text-align:center;";
    if (!cccd) {
      body.style.cssText += failed ? "font-size:13px;color:#dc2626;font-weight:600;" : "font-size:13px;color:#6b7280;";
      body.textContent = failed ? "Không đọc được CCCD từ trang Thông tin hành chính — tải lại trang (F5) để thử lại." : "Đang đọc CCCD của đối tượng…";
    } else if (!ident) {
      body.style.cssText += "font-size:13px;color:#b45309;";
      body.textContent = "CCCD " + cccd + " — chưa có dữ liệu Excel. Bấm nút \"Điền kết quả CLS\" để chọn file Excel 1 lần.";
    } else if (!rec) {
      body.style.cssText += "font-size:13px;color:#dc2626;font-weight:600;";
      body.textContent = "CCCD " + cccd + " không có trong file Excel" + (ident.file ? " (" + ident.file + ")" : "");
    } else {
      body.appendChild(xlsIdentItem("fa-user", "#1e88e5", "Họ tên", rec.name || "—"));
      body.appendChild(xlsIdentItem("fa-id-card-o", "#16a34a", "CCCD", cccd));
      body.appendChild(xlsIdentItem("fa-calendar", "#f97316", pinfo && pinfo.d || rec.full ? "Ngày sinh" : "Năm sinh", pinfo && pinfo.d || rec.birth || (rec.year ? String(rec.year) : "—")));
      body.appendChild(xlsIdentItem("fa-venus-mars", "#8b5cf6", "Giới tính", rec.gender || "—"));
    }
    panel.appendChild(body);
    if (rec && pinfo) {
      var nk = function(x) {
        return String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/\s+/g, " ").trim();
      };
      var warns = [];
      if (pinfo.n && rec.name && nk(pinfo.n) !== nk(rec.name)) warns.push("tên trên Medinet \"" + pinfo.n + "\" khác Excel \"" + rec.name + "\"");
      var py = (pinfo.d || "").match(/(\d{4})\s*$/);
      if (py && rec.year && parseInt(py[1], 10) !== rec.year) warns.push("năm sinh Medinet " + py[1] + " khác Excel " + rec.year);
      if (pinfo.g && rec.gender && nk(pinfo.g) !== nk(rec.gender)) warns.push("giới tính Medinet " + pinfo.g + " khác Excel " + rec.gender);
      if (warns.length) {
        var w = document.createElement("div");
        w.style.cssText = "text-align:center;font-size:12.5px;color:#dc2626;font-weight:700;margin-top:3px;";
        w.textContent = "⚠ Lệch dữ liệu: " + warns.join("; ") + " — kiểm tra lại trước khi lưu!";
        panel.appendChild(w);
      }
    }
    if (rec && ident) {
      var src = document.createElement("div");
      src.style.cssText = "text-align:center;font-size:11px;color:#9ca3af;margin-top:2px;";
      src.textContent = "Nguồn: file Excel" + (ident.file ? " " + ident.file : "");
      panel.appendChild(src);
    }
  }
  function xlsIdentTick() {
    var panel = document.getElementById(XLS_IDENT_PANEL_ID);
    if (!xlsIdentPageOk() || !isScriptEnabled() || _wrapperHidden) {
      if (panel) panel.remove();
      return;
    }
    var anchor = xlsIdentFindAnchor();
    if (!anchor || !anchor.parentNode) return;
    if (!panel) {
      panel = document.createElement("div");
      panel.id = XLS_IDENT_PANEL_ID;
      panel.style.cssText = "border:1px solid #e0e7f3;border-radius:8px;padding:8px 10px;margin:0 0 8px 0;background:#fff;font-family:inherit;";
    }
    if (panel.parentNode !== anchor.parentNode || panel.nextElementSibling !== anchor) anchor.parentNode.insertBefore(panel, anchor);
    var cccd = xlsGetPageCccd();
    var ident = xlsIdentLoad();
    var rec = cccd && ident && ident.map ? ident.map[cccd] || null : null;
    if (cccd && !rec) xlsIdentRefreshFromFile();
    if (!ident) xlsIdentRefreshFromFile();
    var pinfo = xlsCdRec(xlsCdId());
    if (!pinfo || pinfo.c !== cccd) pinfo = null;
    var sig = [ cccd, ident ? ident.at : 0, rec ? rec.name + rec.birth + rec.gender : "-", pinfo ? pinfo.n + "|" + pinfo.d + "|" + pinfo.g : "", _xlsFrameFailed ? "F" : "" ].join("|");
    xlsIdentRender(panel, sig, cccd, rec, ident, pinfo, _xlsFrameFailed && !cccd);
  }
  setInterval(xlsIdentTick, 800);
  var BATCH_KEY = "_mtt_batch_state_v1";
  var BATCH_SURCHARGE_MANUAL = 30;
  var BATCH_SURCHARGE_AUTO = 50;
  var BATCH_M3_URL = "https://quanlyskcd.medinet.org.vn/app/main/dynamicreport/report/viewer-utility/KSKDK_DanhSach_KSK_M13";
  var BATCH_NCT_URL = "https://quanlyskcd.medinet.org.vn/app/main/dynamicreport/report/viewer-utility/KSKDK_DanhSach_KSK_NguoiCaoTuoi_Report";
  var BATCH_PHASE_TIMEOUT = 35e3;
  var BATCH_DONE_KEY = "_mtt_batch_done_v1";
  var BATCH_DONE_TTL = 7 * 864e5;
  function batchDoneRead() {
    try {
      var m = JSON.parse(GM_getValue(BATCH_DONE_KEY, "{}") || "{}");
      var now = Date.now(), out = {};
      Object.keys(m).forEach(function(k) {
        if (now - m[k] < BATCH_DONE_TTL) out[k] = m[k];
      });
      return out;
    } catch (e) {
      return {};
    }
  }
  function batchDoneMark(cccd) {
    try {
      var m = batchDoneRead();
      m[cccd] = Date.now();
      GM_setValue(BATCH_DONE_KEY, JSON.stringify(m));
    } catch (e) {}
  }
  function batchDoneClear() {
    try {
      GM_setValue(BATCH_DONE_KEY, "{}");
    } catch (e) {}
  }
  function batchFmtStamp(ms) {
    var d = new Date(ms);
    function p(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  var batchTicking = false;
  var batchManualHooked = false;
  function batchGetState() {
    try {
      var v = GM_getValue(BATCH_KEY, null);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  }
  function batchSetState(st) {
    try {
      GM_setValue(BATCH_KEY, st ? JSON.stringify(st) : "");
    } catch (e) {}
  }
  function batchClearState() {
    batchSetState(null);
  }
  function batchAgeGroupFromCccd(cccd) {
    if (!/^\d{12}$/.test(cccd)) return null;
    var centuryCode = parseInt(cccd[3], 10);
    var centuryBase = [ 1900, 1900, 2e3, 2e3, 2100, 2100, 2200, 2200 ][centuryCode];
    if (!centuryBase) return null;
    var birthYear = centuryBase + parseInt(cccd.substr(4, 2), 10);
    return batchAgeGroupFromYear(birthYear);
  }
  function batchAgeGroupFromYear(birthYear) {
    if (!birthYear) return null;
    var age = (new Date).getFullYear() - birthYear;
    if (age >= 18 && age <= 59) return "m3";
    if (age >= 60) return "nct";
    return null;
  }
  function batchAgeGroupFromRow(row) {
    return batchAgeGroupFromYear(row.birthYear) || batchAgeGroupFromCccd(row.cccd);
  }
  function batchIsBusyPage() {
    var sels = [ ".dx-loadpanel:not(.dx-state-invisible)", ".dx-overlay-loading-indicator", ".dx-loadindicator", 'ngx-loading-bar .bar:not([style*="width: 0"])' ];
    for (var i = 0; i < sels.length; i++) if (document.querySelector(sels[i])) return true;
    return false;
  }
  function batchWaitFor(find, timeoutMs) {
    timeoutMs = timeoutMs || BATCH_PHASE_TIMEOUT;
    return new Promise(function(resolve) {
      var start = Date.now(), stableSince = 0;
      (function poll() {
        var el = null;
        try {
          el = find();
        } catch (e) {}
        var busy = batchIsBusyPage();
        if (el && !busy) {
          if (!stableSince) stableSince = Date.now();
          if (Date.now() - stableSince > 450) {
            resolve(el);
            return;
          }
        } else {
          stableSince = 0;
        }
        if (Date.now() - start > timeoutMs) {
          resolve(null);
          return;
        }
        setTimeout(poll, 250);
      })();
    });
  }
  function batchFindXemBtn() {
    var btns = document.querySelectorAll("dx-button");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].querySelector(".dx-button-text") || btns[i]).textContent.trim();
      if (t === "Xem") return btns[i];
    }
    return null;
  }
  function batchFindCccdInput() {
    return document.querySelector('input[name="KSKDK_DinhDanhCaNhan"]');
  }
  function batchSetCccdInput(inp, val) {
    fullClick(inp);
    inp.focus({
      preventScroll: true
    });
    try {
      inp.setSelectionRange(0, inp.value.length);
    } catch (e) {}
    nativeSetter.call(inp, "");
    inp.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    nativeSetter.call(inp, val);
    inp.dispatchEvent(new Event("input", {
      bubbles: true
    }));
    inp.dispatchEvent(new Event("change", {
      bubbles: true
    }));
  }
  function batchFindResultRow(expectedCccd) {
    var rv = document.querySelector(".dx-datagrid-rowsview .dx-scrollable-content .dx-datagrid-content") || document.querySelector(".dx-datagrid-rowsview .dx-datagrid-content");
    if (!rv) return null;
    var row = rv.querySelector('tr.dx-data-row[aria-rowindex="1"]');
    if (!row) return null;
    if (row.querySelector(".dx-datagrid-nodata") || !row.cells || row.cells.length < 3) return null;
    if (expectedCccd && (row.textContent || "").indexOf(expectedCccd) === -1) return null;
    return row;
  }
  function batchFindM3EditLink(row) {
    return row.querySelector("a i.fa-pen") ? row.querySelector("a i.fa-pen").closest("a") : null;
  }
  function batchFindNctCogBtn(row) {
    var b = row.querySelector(".dropdown-toggle.btn");
    return b || (row.querySelector("i.fa-cog") ? row.querySelector("i.fa-cog").closest("button") : null);
  }
  function batchFindDropdownEditLink() {
    var links = document.querySelectorAll(".dropdown-menu.show a, ul.dropdown-menu a");
    for (var i = 0; i < links.length; i++) if (/Chỉnh sửa/i.test(links[i].textContent)) return links[i];
    return null;
  }
  function batchFindTreeItem(itemId) {
    return document.querySelector('li[data-item-id="' + itemId + '"]');
  }
  function batchSearchUrl(group) {
    return group === "nct" ? BATCH_NCT_URL : BATCH_M3_URL;
  }
  function batchClsItemId(group) {
    return group === "nct" ? "KNCT_PhieuCLS_CanLamSang" : "KSKDK_Phieu_CanLamSang";
  }
  function batchStatusUpdate(text) {
    var bar = document.getElementById("_mtt_batch_bar");
    if (bar) bar.querySelector("._mtt_batch_text").textContent = text;
  }
  function batchShowBar(st) {
    var ID = "_mtt_batch_bar";
    var bar = document.getElementById(ID);
    if (!bar) {
      bar = document.createElement("div");
      bar.id = ID;
      Object.assign(bar.style, {
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "2147483002",
        background: "#0f172a",
        color: "#fff",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "13px"
      });
      var txt = document.createElement("div");
      txt.className = "_mtt_batch_text";
      txt.style.flex = "1";
      bar.appendChild(txt);
      var skipBtn = document.createElement("button");
      skipBtn.textContent = "Bỏ qua người này";
      Object.assign(skipBtn.style, {
        padding: "6px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#f59e0b",
        color: "#111",
        fontWeight: "700",
        cursor: "pointer"
      });
      skipBtn.addEventListener("click", function() {
        batchSkipCurrent("người dùng bỏ qua");
      });
      var okBtn = document.createElement("button");
      okBtn.className = "_mtt_batch_confirm";
      okBtn.textContent = "✔ Đã lưu — chuyển tiếp";
      Object.assign(okBtn.style, {
        display: "none",
        padding: "6px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#16a34a",
        color: "#fff",
        fontWeight: "700",
        cursor: "pointer"
      });
      okBtn.addEventListener("click", function() {
        var cur = batchGetState();
        if (!cur || !cur.active || cur.phase !== "await_save") return;
        if (!window.confirm("Chỉ bấm OK nếu bạn đã thấy Medinet báo LƯU THÀNH CÔNG cho người này.\nChuyển sang người tiếp theo?")) return;
        cur.stats.done++;
        batchLogRow(cur, "Thành công", "người dùng xác nhận đã lưu");
        batchAdvance(cur);
      });
      bar.appendChild(okBtn);
      bar.appendChild(skipBtn);
      var logBtn = document.createElement("button");
      logBtn.textContent = "⬇ Xuất log Excel";
      Object.assign(logBtn.style, {
        padding: "6px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#0ea5e9",
        color: "#fff",
        fontWeight: "700",
        cursor: "pointer"
      });
      logBtn.addEventListener("click", function() {
        var cur = batchGetState();
        if (cur) batchExportLog(cur);
      });
      bar.appendChild(logBtn);
      var stopBtn = document.createElement("button");
      stopBtn.textContent = "⏹ Dừng Chế độ hàng loạt";
      Object.assign(stopBtn.style, {
        padding: "6px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#dc2626",
        color: "#fff",
        fontWeight: "700",
        cursor: "pointer"
      });
      stopBtn.addEventListener("click", batchStop);
      bar.appendChild(stopBtn);
      document.body.appendChild(bar);
    }
    var n = st.queue.length;
    bar.querySelector("._mtt_batch_text").textContent = "🔎 Chế độ hàng loạt: bệnh nhân " + (st.idx + 1) + "/" + n + (st.queue[st.idx] ? " — " + st.queue[st.idx].cccd : "") + " — đã xong " + st.stats.done + ", bỏ qua " + st.stats.skip + " [" + batchModeLabel(st) + "]" + (st.msg ? " — " + st.msg : "");
    var cbtn = bar.querySelector("._mtt_batch_confirm");
    if (cbtn) cbtn.style.display = st.phase === "await_save" ? "" : "none";
  }
  function batchHideBar() {
    var bar = document.getElementById("_mtt_batch_bar");
    if (bar) bar.remove();
  }
  function batchStop() {
    var st = batchGetState();
    if (!st) return;
    st.active = false;
    batchSetState(st);
    showToast("⏹ Đã dừng Chế độ hàng loạt", "warn");
    batchFinish(st);
  }
  function batchFinish(st) {
    batchHideBar();
    showToast("✅ Chế độ hàng loạt xong: " + st.stats.done + " người, bỏ qua " + st.stats.skip, "success");
    var ID = "_mtt_batch_done_modal";
    var old = document.getElementById(ID);
    if (old) old.remove();
    var overlay = document.createElement("div");
    overlay.id = ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.45)",
      zIndex: "2147483003",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    var card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fff",
      borderRadius: "10px",
      padding: "18px",
      width: "380px",
      maxWidth: "92vw",
      fontFamily: "Segoe UI, Arial, sans-serif",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    });
    var title = document.createElement("div");
    title.textContent = "✅ Chế độ hàng loạt đã chạy xong";
    title.style.cssText = "font-size:15px;font-weight:700;color:#0f766e;margin-bottom:8px;";
    card.appendChild(title);
    var info = document.createElement("div");
    info.textContent = "Thành công: " + st.stats.done + " — Bỏ qua: " + st.stats.skip + (st.stats.skipList.length ? "\n" + st.stats.skipList.slice(0, 6).join("\n") + (st.stats.skipList.length > 6 ? "\n…" : "") : "");
    if (batchModeOf(st) === "auto_skip" && st.stats.skip > 0) info.textContent += "\n\n⚠ Có " + st.stats.skip + " người chưa lưu/bị lỗi — xuất log Excel, lọc cột \"Kết quả\" bắt đầu bằng \"Lỗi\" rồi sửa tay.";
    info.style.cssText = "font-size:12px;color:#333;margin-bottom:14px;line-height:1.6;white-space:pre-line;max-height:220px;overflow:auto;";
    card.appendChild(info);
    function mkBtn(text, bg, color, onClick) {
      var b = document.createElement("button");
      b.textContent = text;
      Object.assign(b.style, {
        display: "block",
        width: "100%",
        padding: "10px",
        margin: "8px 0 0",
        border: "none",
        borderRadius: "6px",
        background: bg,
        color: color,
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer"
      });
      b.addEventListener("click", function(e) {
        e.preventDefault();
        onClick();
      });
      return b;
    }
    card.appendChild(mkBtn("⬇ Xuất log Excel", "#0ea5e9", "#fff", function() {
      batchExportLog(st);
    }));
    card.appendChild(mkBtn("Đóng", "#e5e7eb", "#111", function() {
      overlay.remove();
      batchClearState();
    }));
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }
  function batchNowStr() {
    var d = new Date;
    function p2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
  }
  var BATCH_SAVE_WAIT_AUTO = 20e3;
  var BATCH_SAVE_WAIT_MANUAL = 45e3;
  var BATCH_TOAST_SEL = '.ngx-toastr, .toast, .toast-success, .toast-error, .toast-warning, .dx-toast-content, .dx-toast-message, .swal2-popup, .alert, .notyf__toast, .mat-snack-bar-container, .mat-mdc-snack-bar-container, .Toastify__toast, .noty_bar, .dx-popup-visible .dx-popup-content, .modal.show .modal-body, [role="alert"]';
  var BATCH_INVALID_SEL = ".dx-invalid, .dx-validationsummary-item, .is-invalid";
  var BATCH_OK_RE = /thành công|đã lưu|lưu xong/i;
  var BATCH_ERR_RE = /lỗi|thất bại|không thành công|chưa thành công|không thể|không hợp lệ|bắt buộc|chưa nhập|trùng|error|failed/i;
  var BATCH_YES_RE = /^(Đồng ý|OK|Có|Xác nhận)$/i;
  var BATCH_NO_RE = /^(Hủy|Huỷ|Không|Đóng|Bỏ qua|Cancel)$/i;
  var batchOpBusy = false;
  function batchModeOf(st) {
    return st.mode || (st.autoSave ? "auto_stop" : "manual");
  }
  function batchModeLabel(st) {
    var m = batchModeOf(st);
    return m === "auto_skip" ? "tự động, bỏ qua lỗi" : m === "auto_stop" ? "tự động Lưu, dừng khi lỗi" : "Lưu tay";
  }
  function batchTxt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function batchDialogBox(el) {
    return el.closest(".dx-popup-wrapper, .modal.show, .swal2-popup");
  }
  function batchIsConfirmBox(box) {
    if (!box) return false;
    var yes = false, no = false;
    box.querySelectorAll("button").forEach(function(b) {
      var t = (b.textContent || "").trim();
      if (BATCH_YES_RE.test(t)) yes = true;
      if (BATCH_NO_RE.test(t)) no = true;
    });
    return yes && no;
  }
  function batchSaveSnap() {
    var m = new Map;
    document.querySelectorAll(BATCH_TOAST_SEL).forEach(function(el) {
      m.set(el, batchTxt(el));
    });
    return {
      toasts: m,
      invalid: document.querySelectorAll(BATCH_INVALID_SEL).length
    };
  }
  function batchSaveScan(snap) {
    var res = {
      ok: false,
      err: ""
    };
    document.querySelectorAll(BATCH_TOAST_SEL).forEach(function(el) {
      if (el.closest("#_medinet_toast, #_mtt_batch_bar, #_mtt_batch_modal")) return;
      var t = batchTxt(el);
      if (!t || t.length > 500 || snap.toasts.get(el) === t) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (batchIsConfirmBox(batchDialogBox(el))) return;
      var isErr = BATCH_ERR_RE.test(t) || !!el.closest(".toast-error, .dx-toast-error, .alert-danger") || !!el.querySelector(".swal2-icon-error");
      var isOk = BATCH_OK_RE.test(t) || !!el.closest(".toast-success, .dx-toast-success, .alert-success") || !!el.querySelector(".swal2-icon-success");
      if (isErr) {
        if (!res.err) res.err = t;
      } else if (isOk) res.ok = true;
    });
    if (!res.err && document.querySelectorAll(BATCH_INVALID_SEL).length > snap.invalid) res.err = "có ô dữ liệu chưa hợp lệ";
    return res;
  }
  function batchWatchSave(auto, onResult) {
    var snap = batchSaveSnap();
    var t0 = Date.now(), wait = auto ? BATCH_SAVE_WAIT_AUTO : BATCH_SAVE_WAIT_MANUAL;
    var clicked = [], okAt = 0, finished = false;
    function finish(ok, detail) {
      if (finished) return;
      finished = true;
      onResult(ok, detail);
    }
    if (auto) {
      var btns = findToolbarSaveButtons();
      if (!btns.length) {
        finish(false, "không tìm thấy nút Lưu thay đổi");
        return;
      }
      pointerClick(btns[0]);
    }
    (function poll() {
      if (finished) return;
      var sc = batchSaveScan(snap);
      if (sc.err) {
        finish(false, sc.err);
        return;
      }
      if (sc.ok) {
        if (!okAt) okAt = Date.now();
        if (Date.now() - okAt >= 800) {
          finish(true, "");
          return;
        }
      }
      if (auto) {
        Array.prototype.slice.call(document.querySelectorAll(".dx-popup-visible button, .modal.show button")).forEach(function(b) {
          if (clicked.indexOf(b) !== -1) return;
          if (!BATCH_YES_RE.test((b.textContent || "").trim())) return;
          var box = batchDialogBox(b);
          if (box && !batchIsConfirmBox(box) && BATCH_ERR_RE.test(batchTxt(box))) return;
          clicked.push(b);
          pointerClick(b);
        });
      }
      if (!okAt && Date.now() - t0 > wait) {
        finish(false, "không thấy thông báo lưu thành công sau " + Math.round(wait / 1e3) + " giây");
        return;
      }
      setTimeout(poll, 250);
    })();
  }
  function batchSaveRun(st, auto) {
    var idx0 = st.idx;
    batchOpBusy = true;
    st.phase = "saving";
    st.msg = "💾 Đang chờ Medinet xác nhận đã lưu…";
    batchSetState(st);
    batchWatchSave(auto, function(ok, detail) {
      batchOpBusy = false;
      var cur = batchGetState();
      if (!cur || !cur.active || cur.idx !== idx0) return;
      if (ok) {
        cur.stats.done++;
        batchLogRow(cur, "Thành công", "");
        showToast("💾 Medinet xác nhận đã lưu — chuyển sang người tiếp theo", "success");
        batchAdvance(cur);
      } else if (batchModeOf(cur) === "auto_skip") {
        showToast("⚠ Chưa lưu được (" + detail + ") — bỏ qua, chạy người tiếp theo", "warn");
        console.warn("[MTT] Bỏ qua do chưa xác nhận lưu:", detail);
        batchSkipCurrent("chưa lưu được: " + detail);
      } else {
        cur.phase = "await_save";
        cur.lastSaveErr = detail;
        cur.msg = "⚠ Chưa lưu được (" + detail + ") — KHÔNG tự chuyển. Sửa rồi bấm \"Lưu thay đổi\" lại; nếu bạn thấy Medinet đã lưu thì bấm \"Đã lưu — chuyển tiếp\".";
        batchSetState(cur);
        batchHookManualSave(cur);
        showToast("⚠ Chưa xác nhận được lưu: " + detail, "warn");
        console.warn("[MTT] Chưa xác nhận lưu:", detail);
      }
    });
  }
  function batchLogRow(st, status, reason) {
    if (!st.stats.log) st.stats.log = [];
    var row = st.queue[st.idx];
    st.stats.log.push({
      cccd: row.cccd,
      name: row.name || "",
      status: status,
      reason: reason || "",
      time: batchNowStr()
    });
    if (status === "Thành công") batchDoneMark(row.cccd);
  }
  function batchSkipCurrent(reason) {
    var st = batchGetState();
    if (!st || !st.active) return;
    var why = reason, status = reason === "người dùng bỏ qua" ? "Bỏ qua" : "Lỗi";
    if (st.lastSaveErr && reason === "người dùng bỏ qua") {
      why = "chưa lưu được: " + st.lastSaveErr;
      status = "Lỗi";
    }
    st.stats.skip++;
    st.stats.skipList.push(st.queue[st.idx].cccd + ": " + why);
    batchLogRow(st, status, why);
    batchAdvance(st);
  }
  function batchStatusMap(st) {
    var map = {};
    (st.stats.log || []).forEach(function(e) {
      map[xlsNormCccd(e.cccd)] = {
        status: e.status,
        reason: e.reason
      };
    });
    (st.queue || []).forEach(function(q, i) {
      var k = xlsNormCccd(q.cccd);
      if (!map[k] && i >= st.idx) map[k] = {
        status: "Chưa xử lý",
        reason: ""
      };
    });
    (st.excluded || []).forEach(function(e) {
      var k = xlsNormCccd(e.cccd);
      if (!map[k]) map[k] = {
        status: "Bỏ qua",
        reason: e.reason
      };
    });
    return map;
  }
  function batchExportLog(st) {
    if (typeof XLSX === "undefined") {
      showToast("❌ Chưa tải được thư viện xuất Excel", "error");
      return;
    }
    var map = batchStatusMap(st);
    var wb = XLSX.utils.book_new(), ws;
    if (st.originalAoa && st.originalAoa.length) {
      var out = st.originalAoa.map(function(row) {
        return row.slice();
      });
      out[0].splice(2, 0, "Kết quả");
      if (out[1]) out[1].splice(2, 0, "");
      var seenX = {};
      for (var i = 2; i < out.length; i++) {
        var cccd = xlsNormCccd(out[i][1]);
        var m = cccd ? map[cccd] : null;
        var text = m ? m.reason ? m.status + ": " + m.reason : m.status : "";
        if (cccd) {
          if (seenX[cccd]) text = "Bỏ qua: trùng CCCD với dòng phía trên";
          seenX[cccd] = true;
        }
        out[i].splice(2, 0, text);
      }
      ws = XLSX.utils.aoa_to_sheet(out);
    } else {
      var aoa2 = [ [ "STT", "CCCD", "Kết quả", "Họ tên", "Giờ" ] ];
      Object.keys(map).forEach(function(k, i) {
        aoa2.push([ i + 1, k, map[k].reason ? map[k].status + ": " + map[k].reason : map[k].status, "", "" ]);
      });
      ws = XLSX.utils.aoa_to_sheet(aoa2);
    }
    XLSX.utils.book_append_sheet(wb, ws, "Chế độ hàng loạt - log");
    var d = new Date;
    function p2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    var fname = "HangLoat_log_" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + "_" + p2(d.getHours()) + p2(d.getMinutes()) + ".xlsx";
    XLSX.writeFile(wb, fname);
  }
  function batchAdvance(st) {
    batchOpBusy = false;
    st.msg = "";
    st.lastSaveErr = "";
    st.idx++;
    if (st.idx >= st.queue.length) {
      batchFinish(st);
      return;
    }
    st.phase = "fill_cccd";
    batchSetState(st);
    var url = batchSearchUrl(st.queue[st.idx].group);
    if (window.location.href.indexOf(url) === 0) {
      setTimeout(batchTick, 200);
    } else {
      window.location.href = url;
    }
  }
  function batchDoSave(st) {
    batchSaveRun(st, true);
  }
  function batchHookManualSave(st) {
    if (batchManualHooked) return;
    batchManualHooked = true;
    document.addEventListener("click", function onSave(e) {
      var btns = findToolbarSaveButtons();
      if (btns.indexOf(e.target) === -1 && !btns.some(function(b) {
        return b.contains(e.target);
      })) return;
      document.removeEventListener("click", onSave, true);
      batchManualHooked = false;
      var cur = batchGetState();
      if (!cur || !cur.active) return;
      batchSaveRun(cur, false);
    }, true);
  }
  function batchTick() {
    if (batchTicking) return;
    var st = batchGetState();
    if (!st || !st.active) {
      batchHideBar();
      return;
    }
    if (!isLicenseValid()) {
      showLicenseExpiredPopup();
      batchStop();
      return;
    }
    batchShowBar(st);
    var row = st.queue[st.idx];
    if (!row) {
      batchFinish(st);
      return;
    }
    batchTicking = true;
    function done() {
      batchTicking = false;
    }
    if (st.phase === "fill_cccd") {
      var wantUrl = batchSearchUrl(row.group);
      if (window.location.href.indexOf(wantUrl) !== 0) {
        done();
        batchSetState(st);
        window.location.href = wantUrl;
        return;
      }
      batchWaitFor(batchFindCccdInput).then(function(inp) {
        if (!inp) {
          done();
          batchSkipCurrent("không thấy ô Định danh cá nhân");
          return;
        }
        batchSetCccdInput(inp, row.cccd);
        var checkStart = Date.now();
        (function verifyTyped() {
          if (inp.value && xlsNormCccd(inp.value) === row.cccd) {
            inp.dispatchEvent(new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            }));
            inp.dispatchEvent(new KeyboardEvent("keyup", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true
            }));
            setTimeout(function() {
              var btn = batchFindXemBtn();
              if (btn) fullClick(btn);
              st.phase = "open_edit";
              batchSetState(st);
              done();
              setTimeout(batchTick, 900);
            }, 350);
            return;
          }
          if (Date.now() - checkStart > 2500) {
            done();
            batchSkipCurrent("không gõ được CCCD vào ô Định danh cá nhân (giá trị ô không khớp sau khi điền — có thể trang chưa tải xong)");
            return;
          }
          setTimeout(verifyTyped, 200);
        })();
      });
      return;
    }
    if (st.phase === "open_edit") {
      batchWaitFor(function() {
        return batchFindResultRow(row.cccd);
      }, 12e3).then(function(r) {
        done();
        if (!r) {
          if (!row.triedOtherGroup) {
            row.triedOtherGroup = true;
            row.group = row.group === "nct" ? "m3" : "nct";
            st.phase = "fill_cccd";
            batchSetState(st);
            setTimeout(batchTick, 200);
            return;
          }
          batchSkipCurrent("không tìm thấy ở cả 2 danh sách (M3 và Người cao tuổi) — kiểm tra lại CCCD hoặc bệnh nhân chưa có trên hệ thống");
          return;
        }
        if (row.group === "nct") {
          var cog = batchFindNctCogBtn(r);
          if (!cog) {
            batchSkipCurrent("không thấy nút thao tác (⚙) trên dòng kết quả");
            return;
          }
          pointerClick(cog);
          st.phase = "nct_menu";
          batchSetState(st);
        } else {
          var a = batchFindM3EditLink(r);
          if (!a) {
            batchSkipCurrent("không thấy nút Chỉnh sửa trên dòng kết quả");
            return;
          }
          pointerClick(a);
          st.phase = "open_cls";
          batchSetState(st);
        }
        setTimeout(batchTick, 700);
      });
      return;
    }
    if (st.phase === "nct_menu") {
      batchWaitFor(batchFindDropdownEditLink, 6e3).then(function(a) {
        done();
        if (!a) {
          batchSkipCurrent("không thấy mục Chỉnh sửa trong menu");
          return;
        }
        pointerClick(a);
        st.phase = "open_cls";
        batchSetState(st);
        setTimeout(batchTick, 700);
      });
      return;
    }
    if (st.phase === "open_cls") {
      var itemId = batchClsItemId(row.group);
      batchWaitFor(function() {
        return batchFindTreeItem(itemId);
      }, 15e3).then(function(li) {
        done();
        if (!li) {
          batchSkipCurrent("không thấy mục Khám cận lâm sàng");
          return;
        }
        pointerClick(li.querySelector(".dx-item-content") || li);
        st.phase = "on_form";
        batchSetState(st);
        setTimeout(batchTick, 900);
      });
      return;
    }
    if (st.phase === "filling" || st.phase === "saving") {
      if (!batchOpBusy) {
        if (st.phase === "saving" && batchModeOf(st) === "auto_skip") {
          done();
          batchSkipCurrent("trang tải lại khi đang lưu — chưa xác nhận được đã lưu");
          return;
        }
        if (st.phase === "filling") {
          st.phase = "on_form";
        } else {
          st.phase = "await_save";
          st.msg = "⚠ Trang vừa tải lại khi đang lưu — chưa xác nhận được đã lưu. Kiểm tra rồi bấm \"Lưu thay đổi\" lại, hoặc \"Đã lưu — chuyển tiếp\" nếu Medinet đã lưu.";
        }
        batchSetState(st);
      }
      done();
      return;
    }
    if (st.phase === "await_save") {
      batchHookManualSave(st);
      done();
      return;
    }
    if (st.phase === "on_form") {
      batchWaitFor(function() {
        return xlsPageIsCls() && xlsGetPageCccd() === row.cccd && document.querySelector(".CongThucMau_SLHC input.dx-texteditor-input") ? true : null;
      }, 2e4).then(function(ok) {
        done();
        if (!ok) {
          batchSkipCurrent("trang Cận lâm sàng không tải đúng bệnh nhân");
          return;
        }
        st.phase = "filling";
        st.msg = "";
        batchSetState(st);
        batchOpBusy = true;
        xlsIdbGet("file").then(function(h) {
          if (!h) throw new Error("no-handle");
          return xlsReadHandle(h);
        }).then(function(r2) {
          var rows = xlsParseBuffer(r2.buf);
          var n = xlsFillFromRows(rows, "Chế độ hàng loạt " + (st.idx + 1) + "/" + st.queue.length);
          if (!n) {
            batchSkipCurrent("không điền được ô nào (CCCD không có trong Excel hoặc trang chưa sẵn sàng) — không lưu");
            return;
          }
          spendCredits(n + (st.autoSave ? BATCH_SURCHARGE_AUTO : BATCH_SURCHARGE_MANUAL));
          if (st.autoSave) {
            batchDoSave(st);
          } else {
            st.phase = "await_save";
            st.msg = "✏️ Đã điền — kiểm tra rồi bấm \"Lưu thay đổi\"; chỉ khi Medinet báo lưu thành công mới tự chuyển người tiếp theo (" + (st.idx + 1) + "/" + st.queue.length + ")";
            batchSetState(st);
            batchOpBusy = false;
            batchHookManualSave(st);
          }
        }).catch(function(err) {
          batchSkipCurrent("lỗi điền dữ liệu: " + (err && err.message ? err.message : err));
        });
      });
      return;
    }
    done();
  }
  function batchBuildQueue(rows, skipDone) {
    var queue = [], excluded = [], seen = {}, dup = 0, doneSkipped = 0;
    var doneMap = skipDone ? batchDoneRead() : {};
    rows.forEach(function(r) {
      if (seen[r.cccd]) {
        dup++;
        return;
      }
      seen[r.cccd] = true;
      if (doneMap[r.cccd]) {
        excluded.push({
          cccd: r.cccd,
          name: r.name,
          kind: "done",
          reason: "đã điền thành công ở lần chạy trước (" + batchFmtStamp(doneMap[r.cccd]) + ")"
        });
        doneSkipped++;
        return;
      }
      var g = batchAgeGroupFromRow(r);
      if (!g) {
        excluded.push({
          cccd: r.cccd,
          name: r.name,
          kind: "age",
          reason: "không xác định được năm sinh hoặc dưới 18 tuổi"
        });
        return;
      }
      queue.push({
        cccd: r.cccd,
        name: r.name,
        group: g
      });
    });
    queue.sort(function(a, b) {
      return a.group === b.group ? 0 : a.group === "m3" ? -1 : 1;
    });
    return {
      queue: queue,
      excluded: excluded,
      dup: dup,
      doneSkipped: doneSkipped
    };
  }
  function batchShowStartModal(rows) {
    var builtOn = batchBuildQueue(rows, true), builtOff = batchBuildQueue(rows, false);
    var built = builtOn;
    var ID = "_mtt_batch_modal";
    var old = document.getElementById(ID);
    if (old) old.remove();
    var overlay = document.createElement("div");
    overlay.id = ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.45)",
      zIndex: "2147483003",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
    var card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fff",
      borderRadius: "10px",
      padding: "18px",
      width: "440px",
      maxWidth: "92vw",
      fontFamily: "Segoe UI, Arial, sans-serif",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    });
    var title = document.createElement("div");
    title.style.cssText = "font-size:15px;font-weight:700;color:#0f766e;margin-bottom:10px;";
    card.appendChild(title);
    var mw = document.createElement("div");
    mw.style.cssText = "font-size:12px;color:#b91c1c;margin-bottom:10px;line-height:1.5;";
    card.appendChild(mw);
    var dupNote = document.createElement("div");
    dupNote.style.cssText = "font-size:12px;color:#1d4ed8;margin-bottom:10px;line-height:1.5;";
    card.appendChild(dupNote);
    var doneCb = null;
    if (builtOn.doneSkipped > 0) {
      var doneLabel = document.createElement("label");
      doneLabel.style.cssText = "display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#111;margin-bottom:10px;cursor:pointer;";
      doneCb = document.createElement("input");
      doneCb.type = "checkbox";
      doneCb.checked = true;
      doneLabel.appendChild(doneCb);
      doneLabel.appendChild(document.createTextNode("Bỏ qua " + builtOn.doneSkipped + " người đã điền thành công ở lần chạy trước (nhớ 7 ngày)"));
      card.appendChild(doneLabel);
    }
    var doneTotal = Object.keys(batchDoneRead()).length;
    if (doneTotal > 0) {
      var clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.textContent = "🗑 Xóa danh sách người đã điền (" + doneTotal + " người)";
      clearBtn.style.cssText = "display:block;border:none;background:none;color:#6b7280;font-size:12px;cursor:pointer;padding:0;margin:0 0 12px;text-decoration:underline;";
      clearBtn.addEventListener("click", function(e) {
        e.preventDefault();
        batchDoneClear();
        showToast("🗑 Đã xóa danh sách người đã điền thành công", "warn");
        overlay.remove();
        batchShowStartModal(rows);
      });
      card.appendChild(clearBtn);
    }
    var MODES = [ {
      v: "manual",
      t: "Bấm Lưu tay (mặc định)",
      d: "Script chỉ điền; bạn kiểm tra rồi bấm \"Lưu thay đổi\". Chỉ khi Medinet báo lưu thành công mới tự chuyển người. Phụ thu " + BATCH_SURCHARGE_MANUAL / 100 + " Medi/người."
    }, {
      v: "auto_stop",
      t: "Tự động bấm Lưu sau khi điền, dừng lại khi lỗi",
      d: "Lưu lỗi hoặc không xác nhận được thì DỪNG tại người đó để bạn xử lý. Phụ thu " + BATCH_SURCHARGE_AUTO / 100 + " Medi/người."
    }, {
      v: "auto_skip",
      t: "Tự động hàng loạt, bỏ qua lỗi",
      d: "Lưu lỗi thì ghi log rồi chạy tiếp người sau, không dừng. Sửa tay sau khi chạy xong (xuất log Excel để xem danh sách lỗi). Phụ thu " + BATCH_SURCHARGE_AUTO / 100 + " Medi/người."
    } ];
    var modeVal = "manual";
    var modeRows = [];
    var modeBox = document.createElement("div");
    modeBox.style.cssText = "display:flex;flex-direction:column;gap:6px;margin-bottom:10px;";
    MODES.forEach(function(m, i) {
      var lab = document.createElement("label");
      lab.style.cssText = "display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border:1.5px solid #e5e7eb;border-radius:8px;cursor:pointer;";
      var rb = document.createElement("input");
      rb.type = "radio";
      rb.name = "_mtt_batch_mode";
      rb.value = m.v;
      rb.checked = i === 0;
      rb.style.marginTop = "3px";
      var txtBox = document.createElement("div");
      var tt = document.createElement("div");
      tt.textContent = m.t;
      tt.style.cssText = "font-size:13px;font-weight:700;color:#111;";
      var dd = document.createElement("div");
      dd.textContent = m.d;
      dd.style.cssText = "font-size:11.5px;color:#6b7280;line-height:1.5;margin-top:2px;";
      txtBox.appendChild(tt);
      txtBox.appendChild(dd);
      lab.appendChild(rb);
      lab.appendChild(txtBox);
      rb.addEventListener("change", function() {
        modeVal = m.v;
        paintModes();
      });
      modeRows.push({
        lab: lab,
        v: m.v
      });
      modeBox.appendChild(lab);
    });
    card.appendChild(modeBox);
    var warn = document.createElement("div");
    warn.style.cssText = "font-size:12px;color:#b45309;margin-bottom:12px;line-height:1.5;";
    card.appendChild(warn);
    function paintModes() {
      modeRows.forEach(function(r) {
        var on = r.v === modeVal;
        r.lab.style.borderColor = on ? "#0f766e" : "#e5e7eb";
        r.lab.style.background = on ? "#f0fdfa" : "#fff";
      });
      warn.textContent = modeVal === "auto_skip" ? "⚠ Người bị lỗi sẽ KHÔNG được lưu — chạy xong nhớ xuất log Excel và sửa tay các dòng \"Lỗi\"." : "⚠ Tính năng mới — nên thử vài người ở chế độ \"Bấm Lưu tay\" trước khi chạy hàng loạt.";
    }
    paintModes();
    function mkBtn(text, bg, color, onClick) {
      var b = document.createElement("button");
      b.textContent = text;
      Object.assign(b.style, {
        display: "block",
        width: "100%",
        padding: "10px",
        margin: "8px 0 0",
        border: "none",
        borderRadius: "6px",
        background: bg,
        color: color,
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
      });
      b.addEventListener("click", function(e) {
        e.preventDefault();
        overlay.remove();
        onClick();
      });
      return b;
    }
    var startBtn = mkBtn("", "#0f766e", "#fff", function() {
      if (!built.queue.length) {
        showToast("⚠ Không có bệnh nhân cần xử lý (tất cả đã điền, trùng hoặc không hợp lệ)", "warn");
        return;
      }
      var st = {
        active: true,
        idx: 0,
        phase: "fill_cccd",
        autoSave: modeVal !== "manual",
        mode: modeVal,
        queue: built.queue,
        excluded: built.excluded,
        originalAoa: _xlsLastAoa,
        stats: {
          done: 0,
          skip: 0,
          skipList: [],
          log: []
        }
      };
      batchSetState(st);
      var url0 = batchSearchUrl(built.queue[0].group);
      if (window.location.href.indexOf(url0) === 0) setTimeout(batchTick, 200); else window.location.href = url0;
    });
    function refresh() {
      built = doneCb && !doneCb.checked ? builtOff : builtOn;
      var m3n = built.queue.filter(function(q) {
        return q.group === "m3";
      }).length;
      var nctn = built.queue.length - m3n;
      title.textContent = "🔎 Chế độ hàng loạt — " + built.queue.length + " bệnh nhân (M3: " + m3n + ", NCT: " + nctn + ")";
      var ageN = built.excluded.filter(function(e) {
        return e.kind === "age";
      }).length;
      mw.style.display = ageN ? "" : "none";
      mw.textContent = "⚠ " + ageN + " dòng không xác định được năm sinh hoặc dưới 18 tuổi — sẽ bị bỏ qua (xem chi tiết trong log xuất ra).";
      var notes = [];
      if (built.dup) notes.push(built.dup + " dòng trùng CCCD trong file — chỉ xử lý 1 lần");
      if (built.doneSkipped) notes.push(built.doneSkipped + " người đã điền thành công trước đó — bỏ qua");
      dupNote.style.display = notes.length ? "" : "none";
      dupNote.textContent = "ℹ " + notes.join("; ") + " (xem chi tiết trong log xuất ra).";
      startBtn.textContent = "▶ Bắt đầu (" + built.queue.length + " người)";
    }
    if (doneCb) doneCb.addEventListener("change", refresh);
    refresh();
    card.appendChild(startBtn);
    card.appendChild(mkBtn("Đóng", "#e5e7eb", "#111", function() {}));
    overlay.appendChild(card);
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }
  function batchPickFileThen(cb) {
    if (typeof _pageWin.showOpenFilePicker !== "function" || !_pageWin.indexedDB) {
      showToast("⚠ Trình duyệt không hỗ trợ Chế độ hàng loạt (cần Chrome/Edge)", "warn");
      return;
    }
    xlsIdbGet("file").then(function(h) {
      if (!h) {
        showToast("⚠ Chưa chọn file Excel — bấm nút Điền kết quả CLS để chọn file trước", "warn");
        return;
      }
      return xlsReadHandle(h).then(function(r) {
        cb(xlsParseBuffer(r.buf));
      });
    }).catch(xlsHandleError);
  }
  var BATCH_ENABLED = false;
  function batchStart() {
    if (!BATCH_ENABLED) return;
    if (!isLicenseValid()) {
      showLicenseExpiredPopup();
      return;
    }
    batchPickFileThen(function(rows) {
      batchShowStartModal(rows);
    });
  }
  var BATCH_FLOAT_ID = "_mtt_batch_float";
  function batchUpdateFloatBtn() {
    var btn = document.getElementById(BATCH_FLOAT_ID);
    var st = batchGetState();
    var show = isScriptEnabled() && !_wrapperHidden && (xlsPageIsCls() || st && st.active);
    if (!show) {
      if (btn) btn.remove();
      return;
    }
    if (!btn) {
      btn = document.createElement("button");
      btn.id = BATCH_FLOAT_ID;
      btn.type = "button";
      Object.assign(btn.style, {
        position: "fixed",
        zIndex: "2000000",
        top: "248px",
        right: "24px",
        padding: "10px 16px",
        background: "#7c3aed",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        fontFamily: "Segoe UI, Arial, sans-serif",
        whiteSpace: "nowrap"
      });
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!BATCH_ENABLED) return;
        var cur = batchGetState();
        if (cur && cur.active) {
          batchTick();
          return;
        }
        batchStart();
      });
      document.body.appendChild(btn);
    }
    var cur = batchGetState();
    if (!BATCH_ENABLED) {
      btn.textContent = "🔎 Chế độ hàng loạt (đang phát triển)";
      btn.disabled = true;
      btn.title = "Tính năng đang phát triển, tạm thời chưa dùng được";
      btn.style.opacity = "0.45";
      btn.style.cursor = "not-allowed";
      btn.style.filter = "grayscale(0.6)";
      return;
    }
    btn.disabled = false;
    btn.title = "";
    btn.style.opacity = "";
    btn.style.cursor = "pointer";
    btn.style.filter = "";
    btn.textContent = cur && cur.active ? "🔎 Đang chạy (" + (cur.idx + 1) + "/" + cur.queue.length + ")" : "🔎 Chế độ hàng loạt";
  }
  setInterval(batchUpdateFloatBtn, 900);
  setInterval(function() {
    if (!BATCH_ENABLED) return;
    var st = batchGetState();
    if (st && st.active) batchTick();
  }, 1500);
  setTimeout(function() {
    if (!BATCH_ENABLED) return;
    var st = batchGetState();
    if (st && st.active) batchTick();
  }, 2e3);
  var ACTIONS = [ {
    emoji: "📄",
    label: "Thông tin hành chính TE <6T",
    tier: "lite",
    color: "#0369a1",
    hoverColor: "#075985",
    check: function() {
      return location.pathname.indexOf("ThongTinHanhChinh_MC") !== -1;
    },
    selfBills: true,
    fn: function() {
      te6FillThongTinHanhChinh(false);
    }
  }, {
    emoji: "🌡️",
    label: "Dấu hiệu sinh tồn TE <6T",
    tier: "lite",
    color: "#0369a1",
    hoverColor: "#075985",
    check: function() {
      return location.pathname.indexOf("DauHieuSinhTon_MC") !== -1;
    },
    selfBills: true,
    fn: function() {
      te6AutoFillCurrentPage(false);
    }
  }, {
    emoji: "🍼",
    label: "Dinh dưỡng TE <6T",
    tier: "lite",
    color: "#0369a1",
    hoverColor: "#075985",
    check: function() {
      return location.pathname.indexOf("DinhDuong_MC") !== -1;
    },
    selfBills: true,
    fn: function() {
      te6AutoFillCurrentPage(false);
    }
  }, {
    emoji: "🧩",
    label: "Tinh thần - vận động TE <6T",
    tier: "lite",
    color: "#0369a1",
    hoverColor: "#075985",
    check: function() {
      return location.pathname.indexOf("TinhThanVanDong_MC") !== -1;
    },
    selfBills: true,
    fn: function() {
      te6AutoFillCurrentPage(false);
    }
  }, {
    emoji: "💉",
    label: "Tiêm chủng TE <6T",
    tier: "lite",
    color: "#0369a1",
    hoverColor: "#075985",
    check: function() {
      return location.pathname.indexOf("TiemChung_MC") !== -1;
    },
    selfBills: true,
    fn: function() {
      te6AutoFillCurrentPage(false);
    }
  }, {
    emoji: "📝",
    label: "Tiền sử bản thân",
    tier: "lite",
    color: "#c62828",
    hoverColor: "#8e0000",
    noAgeLogic: true,
    check: function() {
      if (document.querySelector('td[aria-colindex="' + TC_COL_INDEX + '"]')) return true;
      var ths = document.querySelectorAll('th, .dx-header-row td, [role="columnheader"]');
      for (var i = 0; i < ths.length; i++) {
        var t = (ths[i].textContent || "").toUpperCase();
        if (t.indexOf("TÌNH TRẠNG TIÊM") !== -1) return true;
      }
      return window.location.href.indexOf("KSKD18_TTHC_TienSu") !== -1;
    },
    selfBills: true,
    fn: function() {
      var doneBT = tickAllBinhThuongRadio();
      var doneTC = tcScanTableColumnOnce();
      autoTienSuCoNangKhong(function(countKhong) {
        var total = doneBT + doneTC + countKhong;
        if (total > 0) {
          showToast("✅ Đã tích " + total + " mục (Bình thường / Không / Đã tiêm)");
          spendCredits(total);
        } else {
          showToast("⚠ Không tìm thấy mục nào để tích");
        }
      });
    }
  }, {
    emoji: "🧠",
    label: "Giảm chú ý - tăng động",
    tier: "lite",
    color: "#7b3f00",
    hoverColor: "#5c2d00",
    noAgeLogic: true,
    check: function() {
      if (window.location.href.indexOf("KSKD18_TAB_DANHGIATAMTHAN") === -1) return false;
      var txt = document.body.innerText || "";
      return txt.indexOf("giảm chú ý") !== -1 && txt.indexOf("tăng động") !== -1;
    },
    selfBills: true,
    fn: function() {
      showToast('⏳ Đang chọn "Không có" cho toàn bộ câu hỏi...');
      tamThanAutoFill(TAMTHAN_ADHD_TARGET, null, function(count) {
        var ketQuaFilled = tamThanFillKetQua("Bình thường");
        var total = count + (ketQuaFilled ? 1 : 0);
        if (total > 0) {
          var msg = '✅ Đã chọn "Không có" cho ' + count + " câu";
          if (ketQuaFilled) msg += ', điền "Bình thường" vào Kết quả đánh giá';
          showToast(msg);
          spendCredits(total);
        } else {
          showToast("⚠ Không có câu nào cần chọn");
        }
      });
    }
  }, {
    emoji: "🧩",
    label: "Phổ tự kỷ",
    tier: "lite",
    color: "#7b3f00",
    hoverColor: "#5c2d00",
    noAgeLogic: true,
    check: function() {
      if (window.location.href.indexOf("KSKD18_TAB_DANHGIATAMTHAN") === -1) return false;
      var txt = document.body.innerText || "";
      return txt.indexOf("phổ tự kỷ") !== -1;
    },
    selfBills: true,
    fn: function() {
      showToast('⏳ Đang chọn "Hoàn toàn đồng ý" cho toàn bộ câu hỏi...');
      tamThanAutoFill(TAMTHAN_AUTISM_TARGET_AGREE, tamThanBuildAutismExceptionMap(), function(count) {
        var ketQuaFilled = tamThanFillKetQua("Bình thường");
        var total = count + (ketQuaFilled ? 1 : 0);
        if (total > 0) {
          var msg = "✅ Đã chọn xong " + count + " câu (câu 5, 7, 10 chọn ngược)";
          if (ketQuaFilled) msg += ', điền "Bình thường" vào Kết quả đánh giá';
          showToast(msg);
          spendCredits(total);
        } else {
          showToast("⚠ Không có câu nào cần chọn");
        }
      });
    }
  }, {
    emoji: "📝",
    label: "Khám lâm sàng TE <6T",
    tier: "lite",
    color: "#2e7d32",
    hoverColor: "#1b5e20",
    check: function() {
      return location.pathname.indexOf("KhamLamSang_MC") !== -1;
    },
    selfBills: true,
    fn: function() {
      te6FillKhamLamSang(false);
    }
  }, {
    emoji: "🏠",
    label: "Thông tin hành chính",
    tier: "pro",
    color: "#00796b",
    hoverColor: "#004d40",
    check: function() {
      return !!document.querySelector(".DoiTuongKham");
    },
    selfBills: true,
    fn: function() {
      fillThongTinHanhChinh(function(count) {
        spendCredits(count);
      });
    }
  }, {
    emoji: "📋",
    label: "Tiền sử khám thực thể",
    tier: "pro",
    color: "#7b3f00",
    hoverColor: "#5c2d00",
    check: function() {
      var rows = document.querySelectorAll('tr[role="row"]');
      for (var i = 0; i < rows.length; i++) {
        var cell = rows[i].querySelector('td[aria-colindex="1"]');
        if (cell && cell.textContent.trim() === "B1") return true;
      }
      return false;
    },
    selfBills: true,
    fn: function() {
      var list = [ {
        code: "B1",
        opt: "Không"
      }, {
        code: "B1.1",
        opt: "Không"
      }, {
        code: "B1.2",
        opt: "Không"
      }, {
        code: "B1.3",
        opt: "Không"
      }, {
        code: "B1.4",
        opt: "Không"
      }, {
        code: "B1.5",
        opt: "Không"
      }, {
        code: "B1.6",
        opt: "Không"
      }, {
        code: "B1.7",
        opt: "Không"
      } ];
      showToast("⏳ Đang điền tiền sử khám thực thể...");
      selectNCTRadioBulk(list, function(count) {
        showToast("📌 Đã điền xong: Tiền sử khám thực thể" + " (" + count + " ô)");
        spendCredits(count);
      });
    }
  }, {
    emoji: "🧠",
    label: "Tiền sử khám cơ năng",
    tier: "pro",
    color: "#8.34aa",
    hoverColor: "#6a1b9a",
    check: function() {
      return window.location.href.indexOf("TienSuBenhCuaDoiTuong") !== -1;
    },
    selfBills: true,
    fn: function() {
      showToast('⏳ Đang tích "Không" cho toàn bộ tiền sử...');
      autoTienSuCoNangKhong(function(count) {
        if (count > 0) {
          showToast('✅ Đã tích "Không" cho ' + count + " mục tiền sử");
          spendCredits(count);
        } else {
          showToast("⚠ Không tìm thấy mục nào để tích, vui lòng kiểm tra lại trang");
        }
      });
    }
  }, {
    emoji: "🧠",
    label: "Tiền sử bản thân",
    tier: "pro",
    color: "#8.34aa",
    hoverColor: "#6a1b9a",
    check: function() {
      return window.location.href.indexOf("KSKDK_TTHC_TienSu") !== -1;
    },
    selfBills: true,
    fn: function() {
      showToast('⏳ Đang tích "Không" cho toàn bộ tiền sử...');
      autoTienSuCoNangKhong(function(count) {
        if (count > 0) {
          showToast('✅ Đã tích "Không" cho ' + count + " mục tiền sử");
          spendCredits(count);
        } else {
          showToast("⚠ Không tìm thấy mục nào để tích, vui lòng kiểm tra lại trang");
        }
      });
    }
  }, {
    emoji: "🚗",
    label: "Tiền sử Ô tô (lái xe)",
    tier: "pro",
    color: "#8.34aa",
    hoverColor: "#6a1b9a",
    check: function() {
      return window.location.href.indexOf("KSKOT_TienSu") !== -1;
    },
    selfBills: true,
    fn: function() {
      showToast('⏳ Đang tích "Không" cho toàn bộ tiền sử Ô tô...');
      autoTienSuCoNangKhong(function(count) {
        if (count > 0) {
          showToast('✅ Đã tích "Không" cho ' + count + " mục tiền sử");
          spendCredits(count);
        } else {
          showToast("⚠ Không tìm thấy mục nào để tích tự động - có thể trang này dùng widget khác, báo lại để tôi điều chỉnh thêm");
        }
      });
    }
  }, {
    emoji: "📝",
    label: "Khám lâm sàng người >18 tuổi (M3)",
    tier: "lite",
    color: "#2e7d32",
    hoverColor: "#1b5e20",
    check: function() {
      return window.location.href.indexOf("KSKDK_ThongTinKham") !== -1;
    },
    selfBills: true,
    fn: function() {
      resetAll();
      var total = 0;
      setTimeout(function() {
        total += tickAllChuaPhatHien([]);
        total += selectRadioMultiException([], "", "Loại I");
        if (setNumberField("Mat_KhongKinh_MP", "10")) total++;
        if (setNumberField("Mat_KhongKinh_MT", "10")) total++;
        total += fillCommonNumbers();
        showToast("📝 Đã điền: Chưa phát hiện bất thường + Loại I (M3)");
        spendCredits(total);
      }, 400);
    }
  }, {
    emoji: "📂",
    label: "Hỏi bệnh và khám lâm sàng NCT (M4)",
    tier: "lite",
    color: "#1565c0",
    hoverColor: "#0d47a1",
    hasFlyout: true,
    check: function() {
      var rows = document.querySelectorAll('tr[role="row"]');
      for (var i = 0; i < rows.length; i++) {
        var cell = rows[i].querySelector('td[aria-colindex="1"]');
        if (cell && cell.textContent.trim() === "D1") return true;
      }
      return false;
    },
    flyoutItems: [ {
      label: "👤 Từ 40 tuổi trở xuống",
      color: "#1565c0",
      selfBills: true,
      fn: function() {
        var list = [ {
          code: "D1",
          opt: "Không"
        }, {
          code: "D1.1",
          opt: "Không"
        }, {
          code: "D1.2",
          opt: "Không"
        }, {
          code: "D1.3",
          opt: "Không"
        }, {
          code: "D1.4",
          opt: "Không"
        }, {
          code: "D1.5",
          opt: "Không"
        }, {
          code: "D1.6",
          opt: "Không"
        }, {
          code: "D1.7",
          opt: "Không"
        }, {
          code: "D1.8",
          opt: "Không"
        }, {
          code: "D1.9",
          opt: "Không"
        }, {
          code: "D1.10",
          opt: "Không"
        }, {
          code: "D1.11",
          opt: "Không"
        }, {
          code: "D1.12",
          opt: "Không"
        }, {
          code: "D1.13",
          opt: "Không"
        }, {
          code: "D1.14",
          opt: "Không"
        }, {
          code: "D2.1",
          opt: "Không"
        }, {
          code: "D2.2",
          opt: "Không"
        }, {
          code: "D2.3",
          opt: "Không"
        }, {
          code: "D2.4",
          opt: "Không"
        }, {
          code: "D2.5",
          opt: "Không"
        }, {
          code: "D3.1",
          opt: "Không"
        }, {
          code: "D3.2",
          opt: "Không"
        }, {
          code: "D3.3",
          opt: "Không"
        }, {
          code: "D4.1",
          opt: "Không"
        }, {
          code: "D4.2",
          opt: "Không"
        }, {
          code: "D4.3",
          opt: "Không"
        }, {
          code: "D4.4",
          opt: "Không"
        }, {
          code: "D4.5",
          opt: "Không"
        }, {
          code: "D4.6",
          opt: "Không"
        }, {
          code: "D4.7",
          opt: "Không"
        }, {
          code: "D4.8",
          opt: "Không"
        }, {
          code: "D5.1",
          opt: "Không"
        }, {
          code: "D5.2",
          opt: "Không"
        }, {
          code: "D5.3",
          opt: "Không"
        }, {
          code: "D5.4",
          opt: "Không"
        }, {
          code: "D5.5",
          opt: "Không"
        }, {
          code: "D5.6",
          opt: "Không"
        }, {
          code: "D5.7",
          opt: "Không"
        }, {
          code: "D5.8",
          opt: "Không"
        }, {
          code: "D5.9",
          opt: "Không"
        }, {
          code: "D5.10",
          opt: "Không"
        }, {
          code: "D5.11",
          opt: "Không"
        }, {
          code: "D6.1",
          opt: "Hầu như không"
        }, {
          code: "D6.2",
          opt: "Hầu như không"
        }, {
          code: "D6.3",
          opt: "Hầu như không"
        }, {
          code: "D6.4",
          opt: "Hầu như không"
        }, {
          code: "D6.5",
          opt: "Hầu như không"
        }, {
          code: "D6.6",
          opt: "Hầu như không"
        }, {
          code: "D6.7",
          opt: "Hầu như không"
        }, {
          code: "D6.8",
          opt: "Hầu như không"
        }, {
          code: "D6.9",
          opt: "Hầu như không"
        }, {
          code: "D7.1",
          opt: "Hầu như không"
        }, {
          code: "D7.2",
          opt: "Hầu như không"
        }, {
          code: "D7.3",
          opt: "Hầu như không"
        }, {
          code: "D7.4",
          opt: "Hầu như không"
        }, {
          code: "D7.5",
          opt: "Hầu như không"
        }, {
          code: "D7.6",
          opt: "Hầu như không"
        }, {
          code: "D7.7",
          opt: "Hầu như không"
        }, {
          code: "D8.1.1",
          opt: "Có"
        }, {
          code: "D8.1.2",
          opt: "Có"
        }, {
          code: "D8.1.3",
          opt: "Có"
        }, {
          code: "D8.1.4",
          opt: "Có"
        }, {
          code: "D8.1.5",
          opt: "Có"
        }, {
          code: "D8.1.6",
          opt: "Có"
        }, {
          code: "D8.2.1",
          opt: "Có"
        }, {
          code: "D8.2.2",
          opt: "Có"
        }, {
          code: "D8.2.3",
          opt: "Có"
        }, {
          code: "D8.2.4",
          opt: "Có"
        }, {
          code: "D8.2.5",
          opt: "Có"
        }, {
          code: "D8.2.6",
          opt: "Có"
        }, {
          code: "D8.2.7",
          opt: "Có"
        }, {
          code: "D8.2.8",
          opt: "Có"
        }, {
          code: "D8.3.1",
          opt: "Không/Một số lần"
        }, {
          code: "D8.3.2",
          opt: "Không"
        }, {
          code: "D8.3.3",
          opt: "Không"
        }, {
          code: "D8.4.1",
          opt: "Không"
        }, {
          code: "D8.4.2",
          opt: "Không"
        }, {
          code: "D8.4.3",
          opt: "Không"
        }, {
          code: "D8.5.1",
          opt: "Có"
        }, {
          code: "D8.5.2",
          opt: "Có"
        }, {
          code: "D8.5.3",
          opt: "Không"
        } ];
        showToast("⏳ Đang điền nhóm ≤40 tuổi...");
        selectNCTRadioBulk(list, function(count) {
          showToast("👤 Đã điền xong: nhóm ≤40 tuổi" + " (" + count + " ô)");
          spendCredits(count);
        });
      }
    }, {
      label: "👤 Từ 41 đến 60 tuổi",
      color: "#1565c0",
      selfBills: true,
      fn: function() {
        var list = [ {
          code: "D1",
          opt: "Không"
        }, {
          code: "D1.1",
          opt: "Không"
        }, {
          code: "D1.2",
          opt: "Không"
        }, {
          code: "D1.3",
          opt: "Không"
        }, {
          code: "D1.4",
          opt: "Không"
        }, {
          code: "D1.5",
          opt: "Không"
        }, {
          code: "D1.6",
          opt: "Không"
        }, {
          code: "D1.7",
          opt: "Không"
        }, {
          code: "D1.8",
          opt: "Không"
        }, {
          code: "D1.9",
          opt: "Không"
        }, {
          code: "D1.10",
          opt: "Không"
        }, {
          code: "D1.11",
          opt: "Không"
        }, {
          code: "D1.12",
          opt: "Không"
        }, {
          code: "D1.13",
          opt: "Không"
        }, {
          code: "D1.14",
          opt: "Không"
        }, {
          code: "D2.1",
          opt: "Không"
        }, {
          code: "D2.2",
          opt: "Không"
        }, {
          code: "D2.3",
          opt: "Không"
        }, {
          code: "D2.4",
          opt: "Không"
        }, {
          code: "D2.5",
          opt: "Không"
        }, {
          code: "D3.1",
          opt: "Không"
        }, {
          code: "D3.2",
          opt: "Không"
        }, {
          code: "D3.3",
          opt: "Không"
        }, {
          code: "D4.1",
          opt: "Không"
        }, {
          code: "D4.2",
          opt: "Không"
        }, {
          code: "D4.3",
          opt: "Không"
        }, {
          code: "D4.4",
          opt: "Không"
        }, {
          code: "D4.5",
          opt: "Không"
        }, {
          code: "D4.6",
          opt: "Không"
        }, {
          code: "D4.7",
          opt: "Không"
        }, {
          code: "D4.8",
          opt: "Không"
        }, {
          code: "D5.1",
          opt: "Không"
        }, {
          code: "D5.2",
          opt: "Không"
        }, {
          code: "D5.3",
          opt: "Không"
        }, {
          code: "D5.4",
          opt: "Không"
        }, {
          code: "D5.5",
          opt: "Không"
        }, {
          code: "D5.6",
          opt: "Không"
        }, {
          code: "D5.7",
          opt: "Không"
        }, {
          code: "D5.8",
          opt: "Không"
        }, {
          code: "D5.9",
          opt: "Không"
        }, {
          code: "D5.10",
          opt: "Không"
        }, {
          code: "D5.11",
          opt: "Không"
        }, {
          code: "D6.1",
          opt: "Hầu như không"
        }, {
          code: "D6.2",
          opt: "Hầu như không"
        }, {
          code: "D6.3",
          opt: "Hầu như không"
        }, {
          code: "D6.4",
          opt: "Hầu như không"
        }, {
          code: "D6.5",
          opt: "Hầu như không"
        }, {
          code: "D6.6",
          opt: "Hầu như không"
        }, {
          code: "D6.7",
          opt: "Hầu như không"
        }, {
          code: "D6.8",
          opt: "Hầu như không"
        }, {
          code: "D6.9",
          opt: "Hầu như không"
        }, {
          code: "D7.1",
          opt: "Hầu như không"
        }, {
          code: "D7.2",
          opt: "Hầu như không"
        }, {
          code: "D7.3",
          opt: "Hầu như không"
        }, {
          code: "D7.4",
          opt: "Hầu như không"
        }, {
          code: "D7.5",
          opt: "Hầu như không"
        }, {
          code: "D7.6",
          opt: "Hầu như không"
        }, {
          code: "D7.7",
          opt: "Hầu như không"
        }, {
          code: "D8.1.1",
          opt: "Có"
        }, {
          code: "D8.1.2",
          opt: "Có"
        }, {
          code: "D8.1.3",
          opt: "Có"
        }, {
          code: "D8.1.4",
          opt: "Có"
        }, {
          code: "D8.1.5",
          opt: "Có"
        }, {
          code: "D8.1.6",
          opt: "Có"
        }, {
          code: "D8.2.1",
          opt: "Có"
        }, {
          code: "D8.2.2",
          opt: "Có"
        }, {
          code: "D8.2.3",
          opt: "Có"
        }, {
          code: "D8.2.4",
          opt: "Có"
        }, {
          code: "D8.2.5",
          opt: "Có"
        }, {
          code: "D8.2.6",
          opt: "Có"
        }, {
          code: "D8.2.7",
          opt: "Có"
        }, {
          code: "D8.2.8",
          opt: "Có"
        }, {
          code: "D8.3.1",
          opt: "Không/Một số lần"
        }, {
          code: "D8.3.2",
          opt: "Không"
        }, {
          code: "D8.3.3",
          opt: "Không"
        }, {
          code: "D8.4.1",
          opt: "Không"
        }, {
          code: "D8.4.2",
          opt: "Không"
        }, {
          code: "D8.4.3",
          opt: "Không"
        }, {
          code: "D8.5.1",
          opt: "Có"
        }, {
          code: "D8.5.2",
          opt: "Có"
        }, {
          code: "D8.5.3",
          opt: "Không"
        } ];
        showToast("⏳ Đang điền nhóm 41-60 tuổi...");
        selectNCTRadioBulk(list, function(count) {
          showToast("👤 Đã điền xong: nhóm 41-60 tuổi" + " (" + count + " ô)");
          spendCredits(count);
        });
      }
    }, {
      label: "👤 Từ 61 đến 70 tuổi",
      color: "#1565c0",
      selfBills: true,
      fn: function() {
        var list = [ {
          code: "D1",
          opt: "Không"
        }, {
          code: "D1.1",
          opt: "Không"
        }, {
          code: "D1.2",
          opt: "Không"
        }, {
          code: "D1.3",
          opt: "Không"
        }, {
          code: "D1.4",
          opt: "Không"
        }, {
          code: "D1.5",
          opt: "Không"
        }, {
          code: "D1.6",
          opt: "Không"
        }, {
          code: "D1.7",
          opt: "Không"
        }, {
          code: "D1.8",
          opt: "Không"
        }, {
          code: "D1.9",
          opt: "Không"
        }, {
          code: "D1.10",
          opt: "Không"
        }, {
          code: "D1.11",
          opt: "Không"
        }, {
          code: "D1.12",
          opt: "Không"
        }, {
          code: "D1.13",
          opt: "Không"
        }, {
          code: "D1.14",
          opt: "Không"
        }, {
          code: "D2.1",
          opt: "Không"
        }, {
          code: "D2.2",
          opt: "Không"
        }, {
          code: "D2.3",
          opt: "Không"
        }, {
          code: "D2.4",
          opt: "Không"
        }, {
          code: "D2.5",
          opt: "Không"
        }, {
          code: "D3.1",
          opt: "Không"
        }, {
          code: "D3.2",
          opt: "Không"
        }, {
          code: "D3.3",
          opt: "Không"
        }, {
          code: "D4.1",
          opt: "Không"
        }, {
          code: "D4.2",
          opt: "Không"
        }, {
          code: "D4.3",
          opt: "Không"
        }, {
          code: "D4.4",
          opt: "Không"
        }, {
          code: "D4.5",
          opt: "Không"
        }, {
          code: "D4.6",
          opt: "Không"
        }, {
          code: "D4.7",
          opt: "Không"
        }, {
          code: "D4.8",
          opt: "Không"
        }, {
          code: "D5.1",
          opt: "Không"
        }, {
          code: "D5.2",
          opt: "Không"
        }, {
          code: "D5.3",
          opt: "Không"
        }, {
          code: "D5.4",
          opt: "Không"
        }, {
          code: "D5.5",
          opt: "Không"
        }, {
          code: "D5.6",
          opt: "Không"
        }, {
          code: "D5.7",
          opt: "Không"
        }, {
          code: "D5.8",
          opt: "Không"
        }, {
          code: "D5.9",
          opt: "Không"
        }, {
          code: "D5.10",
          opt: "Không"
        }, {
          code: "D5.11",
          opt: "Không"
        }, {
          code: "D6.1",
          opt: "Hầu như không"
        }, {
          code: "D6.2",
          opt: "Hầu như không"
        }, {
          code: "D6.3",
          opt: "Hầu như không"
        }, {
          code: "D6.4",
          opt: "Hầu như không"
        }, {
          code: "D6.5",
          opt: "Hầu như không"
        }, {
          code: "D6.6",
          opt: "Hầu như không"
        }, {
          code: "D6.7",
          opt: "Hầu như không"
        }, {
          code: "D6.8",
          opt: "Hầu như không"
        }, {
          code: "D6.9",
          opt: "Hầu như không"
        }, {
          code: "D7.1",
          opt: "Hầu như không"
        }, {
          code: "D7.2",
          opt: "Hầu như không"
        }, {
          code: "D7.3",
          opt: "Hầu như không"
        }, {
          code: "D7.4",
          opt: "Hầu như không"
        }, {
          code: "D7.5",
          opt: "Hầu như không"
        }, {
          code: "D7.6",
          opt: "Hầu như không"
        }, {
          code: "D7.7",
          opt: "Hầu như không"
        }, {
          code: "D8.1.1",
          opt: "Có"
        }, {
          code: "D8.1.2",
          opt: "Có"
        }, {
          code: "D8.1.3",
          opt: "Có"
        }, {
          code: "D8.1.4",
          opt: "Có"
        }, {
          code: "D8.1.5",
          opt: "Có"
        }, {
          code: "D8.1.6",
          opt: "Có"
        }, {
          code: "D8.2.1",
          opt: "Có"
        }, {
          code: "D8.2.2",
          opt: "Có"
        }, {
          code: "D8.2.3",
          opt: "Có"
        }, {
          code: "D8.2.4",
          opt: "Có"
        }, {
          code: "D8.2.5",
          opt: "Có"
        }, {
          code: "D8.2.6",
          opt: "Không"
        }, {
          code: "D8.2.7",
          opt: "Có"
        }, {
          code: "D8.2.8",
          opt: "Có"
        }, {
          code: "D8.3.1",
          opt: "Không/Một số lần"
        }, {
          code: "D8.3.2",
          opt: "Không"
        }, {
          code: "D8.3.3",
          opt: "Không"
        }, {
          code: "D8.4.1",
          opt: "Không"
        }, {
          code: "D8.4.2",
          opt: "Không"
        }, {
          code: "D8.4.3",
          opt: "Không"
        }, {
          code: "D8.5.1",
          opt: "Có"
        }, {
          code: "D8.5.2",
          opt: "Có"
        }, {
          code: "D8.5.3",
          opt: "Không"
        } ];
        showToast("⏳ Đang điền nhóm 61-70 tuổi...");
        selectNCTRadioBulk(list, function(count) {
          showToast("👤 Đã điền xong: nhóm 61-70 tuổi" + " (" + count + " ô)");
          spendCredits(count);
        });
      }
    }, {
      label: "👤 Từ 71 đến 80 tuổi",
      color: "#1565c0",
      selfBills: true,
      fn: function() {
        var list = [ {
          code: "D1",
          opt: "Có"
        }, {
          code: "D1.1",
          opt: "Có"
        }, {
          code: "D1.2",
          opt: "Không"
        }, {
          code: "D1.3",
          opt: "Không"
        }, {
          code: "D1.4",
          opt: "Không"
        }, {
          code: "D1.5",
          opt: "Không"
        }, {
          code: "D1.6",
          opt: "Không"
        }, {
          code: "D1.7",
          opt: "Không"
        }, {
          code: "D1.8",
          opt: "Không"
        }, {
          code: "D1.9",
          opt: "Có"
        }, {
          code: "D1.10",
          opt: "Không"
        }, {
          code: "D1.11",
          opt: "Không"
        }, {
          code: "D1.12",
          opt: "Không"
        }, {
          code: "D1.13",
          opt: "Không"
        }, {
          code: "D1.14",
          opt: "Không"
        }, {
          code: "D2.1",
          opt: "Không"
        }, {
          code: "D2.2",
          opt: "Không"
        }, {
          code: "D2.3",
          opt: "Không"
        }, {
          code: "D2.4",
          opt: "Không"
        }, {
          code: "D2.5",
          opt: "Không"
        }, {
          code: "D3.1",
          opt: "Không"
        }, {
          code: "D3.2",
          opt: "Không"
        }, {
          code: "D3.3",
          opt: "Không"
        }, {
          code: "D4.1",
          opt: "Không"
        }, {
          code: "D4.2",
          opt: "Không"
        }, {
          code: "D4.3",
          opt: "Không"
        }, {
          code: "D4.4",
          opt: "Không"
        }, {
          code: "D4.5",
          opt: "Không"
        }, {
          code: "D4.6",
          opt: "Không"
        }, {
          code: "D4.7",
          opt: "Không"
        }, {
          code: "D4.8",
          opt: "Không"
        }, {
          code: "D5.1",
          opt: "Không"
        }, {
          code: "D5.2",
          opt: "Không"
        }, {
          code: "D5.3",
          opt: "Không"
        }, {
          code: "D5.4",
          opt: "Không"
        }, {
          code: "D5.5",
          opt: "Không"
        }, {
          code: "D5.6",
          opt: "Không"
        }, {
          code: "D5.7",
          opt: "Không"
        }, {
          code: "D5.8",
          opt: "Không"
        }, {
          code: "D5.9",
          opt: "Không"
        }, {
          code: "D5.10",
          opt: "Không"
        }, {
          code: "D5.11",
          opt: "Không"
        }, {
          code: "D6.1",
          opt: "Hầu như không"
        }, {
          code: "D6.2",
          opt: "Hầu như không"
        }, {
          code: "D6.3",
          opt: "Một vài ngày"
        }, {
          code: "D6.4",
          opt: "Một vài ngày"
        }, {
          code: "D6.5",
          opt: "Một vài ngày"
        }, {
          code: "D6.6",
          opt: "Hầu như không"
        }, {
          code: "D6.7",
          opt: "Một vài ngày"
        }, {
          code: "D6.8",
          opt: "Hầu như không"
        }, {
          code: "D6.9",
          opt: "Hầu như không"
        }, {
          code: "D7.1",
          opt: "Hầu như không"
        }, {
          code: "D7.2",
          opt: "Hầu như không"
        }, {
          code: "D7.3",
          opt: "Một vài ngày"
        }, {
          code: "D7.4",
          opt: "Hầu như không"
        }, {
          code: "D7.5",
          opt: "Hầu như không"
        }, {
          code: "D7.6",
          opt: "Hầu như không"
        }, {
          code: "D7.7",
          opt: "Hầu như không"
        }, {
          code: "D8.1.1",
          opt: "Có"
        }, {
          code: "D8.1.2",
          opt: "Có"
        }, {
          code: "D8.1.3",
          opt: "Có"
        }, {
          code: "D8.1.4",
          opt: "Có"
        }, {
          code: "D8.1.5",
          opt: "Có"
        }, {
          code: "D8.1.6",
          opt: "Có"
        }, {
          code: "D8.2.1",
          opt: "Không"
        }, {
          code: "D8.2.2",
          opt: "Không"
        }, {
          code: "D8.2.3",
          opt: "Không"
        }, {
          code: "D8.2.4",
          opt: "Không"
        }, {
          code: "D8.2.5",
          opt: "Có"
        }, {
          code: "D8.2.6",
          opt: "Không"
        }, {
          code: "D8.2.7",
          opt: "Có"
        }, {
          code: "D8.2.8",
          opt: "Có"
        }, {
          code: "D8.3.1",
          opt: "Không/Một số lần"
        }, {
          code: "D8.3.2",
          opt: "Có"
        }, {
          code: "D8.3.3",
          opt: "Có"
        }, {
          code: "D8.4.1",
          opt: "Có"
        }, {
          code: "D8.4.2",
          opt: "Không"
        }, {
          code: "D8.4.3",
          opt: "Không"
        }, {
          code: "D8.5.1",
          opt: "Có"
        }, {
          code: "D8.5.2",
          opt: "Không"
        }, {
          code: "D8.5.3",
          opt: "Không"
        } ];
        showToast("⏳ Đang điền nhóm 71-80 tuổi...");
        selectNCTRadioBulk(list, function(count) {
          showToast("👤 Đã điền xong: nhóm 71-80 tuổi" + " (" + count + " ô)");
          spendCredits(count);
        });
      }
    }, {
      label: "👤 Từ 81 tuổi trở lên",
      color: "#1565c0",
      selfBills: true,
      fn: function() {
        var list = [ {
          code: "D1",
          opt: "Có"
        }, {
          code: "D1.1",
          opt: "Có"
        }, {
          code: "D1.2",
          opt: "Không"
        }, {
          code: "D1.3",
          opt: "Không"
        }, {
          code: "D1.4",
          opt: "Không"
        }, {
          code: "D1.5",
          opt: "Không"
        }, {
          code: "D1.6",
          opt: "Không"
        }, {
          code: "D1.7",
          opt: "Không"
        }, {
          code: "D1.8",
          opt: "Không"
        }, {
          code: "D1.9",
          opt: "Có"
        }, {
          code: "D1.10",
          opt: "Không"
        }, {
          code: "D1.11",
          opt: "Không"
        }, {
          code: "D1.12",
          opt: "Không"
        }, {
          code: "D1.13",
          opt: "Không"
        }, {
          code: "D1.14",
          opt: "Không"
        }, {
          code: "D2.1",
          opt: "Không"
        }, {
          code: "D2.2",
          opt: "Không"
        }, {
          code: "D2.3",
          opt: "Không"
        }, {
          code: "D2.4",
          opt: "Không"
        }, {
          code: "D2.5",
          opt: "Không"
        }, {
          code: "D3.1",
          opt: "Không"
        }, {
          code: "D3.2",
          opt: "Không"
        }, {
          code: "D3.3",
          opt: "Không"
        }, {
          code: "D4.1",
          opt: "Không"
        }, {
          code: "D4.2",
          opt: "Không"
        }, {
          code: "D4.3",
          opt: "Không"
        }, {
          code: "D4.4",
          opt: "Không"
        }, {
          code: "D4.5",
          opt: "Không"
        }, {
          code: "D4.6",
          opt: "Không"
        }, {
          code: "D4.7",
          opt: "Không"
        }, {
          code: "D4.8",
          opt: "Không"
        }, {
          code: "D5.1",
          opt: "Không"
        }, {
          code: "D5.2",
          opt: "Không"
        }, {
          code: "D5.3",
          opt: "Không"
        }, {
          code: "D5.4",
          opt: "Không"
        }, {
          code: "D5.5",
          opt: "Không"
        }, {
          code: "D5.6",
          opt: "Không"
        }, {
          code: "D5.7",
          opt: "Không"
        }, {
          code: "D5.8",
          opt: "Không"
        }, {
          code: "D5.9",
          opt: "Không"
        }, {
          code: "D5.10",
          opt: "Không"
        }, {
          code: "D5.11",
          opt: "Không"
        }, {
          code: "D6.1",
          opt: "Hầu như không"
        }, {
          code: "D6.2",
          opt: "Hầu như không"
        }, {
          code: "D6.3",
          opt: "Một vài ngày"
        }, {
          code: "D6.4",
          opt: "Một vài ngày"
        }, {
          code: "D6.5",
          opt: "Một vài ngày"
        }, {
          code: "D6.6",
          opt: "Hầu như không"
        }, {
          code: "D6.7",
          opt: "Một vài ngày"
        }, {
          code: "D6.8",
          opt: "Hầu như không"
        }, {
          code: "D6.9",
          opt: "Hầu như không"
        }, {
          code: "D7.1",
          opt: "Hầu như không"
        }, {
          code: "D7.2",
          opt: "Hầu như không"
        }, {
          code: "D7.3",
          opt: "Một vài ngày"
        }, {
          code: "D7.4",
          opt: "Hầu như không"
        }, {
          code: "D7.5",
          opt: "Hầu như không"
        }, {
          code: "D7.6",
          opt: "Hầu như không"
        }, {
          code: "D7.7",
          opt: "Hầu như không"
        }, {
          code: "D8.1.1",
          opt: "Có"
        }, {
          code: "D8.1.2",
          opt: "Có"
        }, {
          code: "D8.1.3",
          opt: "Có"
        }, {
          code: "D8.1.4",
          opt: "Có"
        }, {
          code: "D8.1.5",
          opt: "Có"
        }, {
          code: "D8.1.6",
          opt: "Có"
        }, {
          code: "D8.2.1",
          opt: "Không"
        }, {
          code: "D8.2.2",
          opt: "Không"
        }, {
          code: "D8.2.3",
          opt: "Không"
        }, {
          code: "D8.2.4",
          opt: "Không"
        }, {
          code: "D8.2.5",
          opt: "Không"
        }, {
          code: "D8.2.6",
          opt: "Không"
        }, {
          code: "D8.2.7",
          opt: "Có"
        }, {
          code: "D8.2.8",
          opt: "Có"
        }, {
          code: "D8.3.1",
          opt: "Tất cả mọi lúc/ hầu hết thời gian"
        }, {
          code: "D8.3.2",
          opt: "Có"
        }, {
          code: "D8.3.3",
          opt: "Có"
        }, {
          code: "D8.4.1",
          opt: "Có"
        }, {
          code: "D8.4.2",
          opt: "Không"
        }, {
          code: "D8.4.3",
          opt: "Không"
        }, {
          code: "D8.5.1",
          opt: "Có"
        }, {
          code: "D8.5.2",
          opt: "Không"
        }, {
          code: "D8.5.3",
          opt: "Không"
        } ];
        showToast("⏳ Đang điền nhóm 81 tuổi trở lên...");
        selectNCTRadioBulk(list, function(count) {
          showToast("👤 Đã điền xong: nhóm 81 tuổi trở lên" + " (" + count + " ô)");
          spendCredits(count);
        });
      }
    }, {
      label: "❤️ Bệnh nền THA & ĐTĐ",
      color: "#b71c1c",
      selfBills: true,
      fn: function() {
        showToast("⏳ Đang điền THA & ĐTĐ...");
        selectNCTRadioBulk(NCT_THA_DTD, function(count) {
          showToast("❤️ Đã điền xong: Bệnh nền THA & ĐTĐ" + " (" + count + " ô)");
          spendCredits(count);
        });
      }
    } ],
    fn: function() {}
  }, {
    emoji: "✅",
    label: "Thông tin khám NCT bình thường (M4)",
    tier: "lite",
    color: "#2e7d32",
    hoverColor: "#1b5e20",
    check: function() {
      return window.location.href.indexOf("KNCT_ThongTinKham") !== -1;
    },
    selfBills: true,
    fn: function() {
      resetAll();
      var total = 0;
      setTimeout(function() {
        total += tickAllChuaPhatHien([]);
        total += selectRadioMultiException([], "", "Loại I");
        if (setNumberField("Mat_KhongKinh_MP", "10")) total++;
        if (setNumberField("Mat_KhongKinh_MT", "10")) total++;
        total += fillCommonNumbers();
        showToast("✅ NCT bình thường — đã tick Chưa phát hiện + Loại I toàn bộ!");
        spendCredits(total);
      }, 400);
    }
  }, {
    emoji: "📁",
    label: "KSK Việc làm + Lái xe",
    tier: "pro",
    color: "#2e7d32",
    hoverColor: "#1b5e20",
    noAgeLogic: true,
    check: function() {
      if (window.location.href.indexOf("kskdk_thongtinkhamtren18") === -1) return false;
      return !!document.querySelector(".TuanHoan_PhanLoai") || !!document.querySelector(".Mat_PhanLoai") || !!document.querySelector(".RHM_PhanLoai");
    },
    selfBills: true,
    fn: function() {
      showVLOptionsPopup(function(opts) {
        applyVLSelections(opts, function(count) {
          spendCredits(count);
        });
      });
    }
  }, {
    emoji: "👦",
    label: "Khám lâm sàng <18 (M2)",
    tier: "lite",
    color: "#e65100",
    hoverColor: "#bf360c",
    check: function() {
      return window.location.href.indexOf("KSKD18_ThongTinKham") !== -1;
    },
    selfBills: true,
    fn: function() {
      var icdClasses = [ "TuanHoan_ChanDoanSoBo_ICD", "TuanHoan_ChanDoanXacDinh_ICD", "HoHap_ChanDoanSoBo_ICD", "HoHap_ChanDoanXacDinh_ICD", "TieuHoa_ChanDoanSoBo_ICD", "TieuHoa_ChanDoanXacDinh_ICD", "ThanTietNieu_ChanDoanSoBo_ICD", "ThanTietNieu_ChanDoanXacDinh_ICD", "NoiTiet_ChanDoanSoBo_ICD", "NoiTiet_ChanDoanXacDinh_ICD", "TamThan_ChanDoanSoBo_ICD", "TamThan_ChanDoanXacDinh_ICD", "Mat_ChanDoanSoBo_ICD", "Mat_ChanDoanXacDinh_ICD", "TMH_ChanDoanSoBo_ICD", "TMH_ChanDoanXacDinh_ICD", "RHM_ChanDoanSoBo_ICD", "RHM_ChanDoanXacDinh_ICD" ];
      var total = 0;
      icdClasses.forEach(function(cls) {
        if (clearTagBox(cls)) total++;
      });
      setTimeout(function() {
        var seenCbsM2 = [];
        document.querySelectorAll("b").forEach(function(bEl) {
          if (!bEl.textContent.includes("Chưa phát hiện bất thường")) return;
          var cb = findCheckboxNear(bEl);
          if (!cb || seenCbsM2.indexOf(cb) !== -1) return;
          seenCbsM2.push(cb);
          if (tickCheckbox(cb)) total++;
        });
        if (setNumberField("Mat_KhongKinh_MP", "10")) total++;
        if (setNumberField("Mat_KhongKinh_MT", "10")) total++;
        total += fillCommonNumbers();
        var r = autoSelectLoaiIAndBinhThuong();
        total += r.done;
        showToast("✅ Đã tích Chưa phát hiện bất thường + Loại I / Bình thường toàn bộ (M2)");
        spendCredits(total);
      }, 300);
    }
  }, {
    emoji: "🚗",
    label: "KSK Ô tô — Thông tin khám",
    tier: "pro",
    color: "#1565c0",
    hoverColor: "#0d47a1",
    noAgeLogic: true,
    check: function() {
      return window.location.href.indexOf("KSKOT_ThongTinKham") !== -1;
    },
    selfBills: true,
    fn: function() {
      showVLOptionsPopup(function(opts) {
        applyVLSelections(opts, function(count) {
          spendCredits(count);
        });
      });
    }
  }, {
    emoji: "📝",
    label: "KSK Người lái xe — Tiền sử",
    tier: "pro",
    color: "#6a1b9a",
    hoverColor: "#4a148c",
    check: function() {
      return window.location.href.indexOf("KSKLX_TienSu") !== -1;
    },
    selfBills: true,
    fn: function() {
      showToast('⏳ Đang tích "Không" cho toàn bộ tiền sử lái xe...');
      autoTienSuCoNangKhong(function(count) {
        if (count > 0) {
          showToast('✅ Đã tích "Không" cho ' + count + " mục tiền sử (lái xe)");
          spendCredits(count);
        } else {
          showToast("⚠ Không tìm thấy mục nào để tích, kiểm tra lại trang");
        }
      });
    }
  }, {
    emoji: "🧑‍🚗",
    label: "KSK Người lái xe — Thông tin khám",
    tier: "pro",
    color: "#1565c0",
    hoverColor: "#0d47a1",
    noAgeLogic: true,
    check: function() {
      return window.location.href.indexOf("KSKLX_ThongTinKham") !== -1;
    },
    selfBills: true,
    fn: function() {
      showVLOptionsPopup(function(opts) {
        applyVLSelections(opts, function(count) {
          spendCredits(count);
        });
      });
    }
  }, {
    emoji: "🧪",
    label: "KSK Người lái xe — Cận lâm sàng (Xet nghiệm ma túy Âm Tính)",
    tier: "pro",
    color: "#2e7d32",
    hoverColor: "#1b5e20",
    noAgeLogic: true,
    check: function() {
      return window.location.href.indexOf("KSKLX_Phieu_CanLamSang") !== -1;
    },
    selfBills: true,
    fn: function() {
      var r = autoDrugTestAmTinh();
      if (r.done === r.total) {
        showToast('✅ Đã chọn "Âm Tính" cho ' + r.done + "/" + r.total + " xét nghiệm ma túy");
        spendCredits(r.done);
      } else if (r.done > 0) {
        showToast("⚠️ Đã chọn " + r.done + "/" + r.total + ", thiếu " + r.missed.length + " mục (xem console)", "warn");
        spendCredits(r.done);
      } else {
        showToast("⚠ Không tìm thấy mục nào để chọn, kiểm tra lại trang");
      }
    }
  }, {
    emoji: "🧪",
    label: "KSK Ô tô — Cận lâm sàng (Xet nghiệm ma túy Âm Tính)",
    tier: "pro",
    color: "#2e7d32",
    hoverColor: "#1b5e20",
    noAgeLogic: true,
    check: function() {
      return window.location.href.indexOf("KSKOT_Phieu_CanLamSang") !== -1;
    },
    selfBills: true,
    fn: function() {
      var r = autoDrugTestAmTinh();
      if (r.done === r.total) {
        showToast('✅ Đã chọn "Âm Tính" cho ' + r.done + "/" + r.total + " xét nghiệm ma túy");
        spendCredits(r.done);
      } else if (r.done > 0) {
        showToast("⚠️ Đã chọn " + r.done + "/" + r.total + ", thiếu " + r.missed.length + " mục (xem console)", "warn");
        spendCredits(r.done);
      } else {
        showToast("⚠ Không tìm thấy mục nào để chọn, kiểm tra lại trang");
      }
    }
  }, {
    emoji: "📊",
    label: "Upload Excel — Điền Cận lâm sàng theo CCCD",
    tier: "pro",
    color: "#0f766e",
    hoverColor: "#115e59",
    noAgeLogic: true,
    check: function() {
      var h = window.location.href;
      return h.indexOf("KSKDK_Phieu_CanLamSang") !== -1 || h.indexOf("KNCT_PhieuCLS_CanLamSang") !== -1;
    },
    selfBills: true,
    xlsFloatCtx: true,
    fn: function() {
      xlsStart();
    }
  }, {
    emoji: "🔎",
    label: "Chế độ hàng loạt — Tự tìm & điền theo Excel",
    tier: "pro",
    color: "#7c3aed",
    hoverColor: "#6d28d9",
    noAgeLogic: true,
    check: function() {
      var h = window.location.href;
      return h.indexOf("KSKDK_DanhSach_KSK_M13") !== -1 || h.indexOf("KSKDK_DanhSach_KSK_NguoiCaoTuoi_Report") !== -1 || h.indexOf("KSKDK_Phieu_CanLamSang") !== -1 || h.indexOf("KNCT_PhieuCLS_CanLamSang") !== -1;
    },
    selfBills: true,
    fn: function() {
      batchStart();
    }
  } ];
  var WALLET_API = "https://medinet-wallet.dha-medinet.workers.dev";
  var WALLET_KEY = "_mtt_wallet_cache_v1";
  var DEFAULT_ACTION_COST = 8;
  var DEVICE_SECRET_KEY = "_mtt_device_secret_v1";
  var _deviceSecret = null;
  function getDeviceSecret() {
    if (_deviceSecret) return _deviceSecret;
    try {
      var saved = GM_getValue(DEVICE_SECRET_KEY, null);
      if (saved && typeof saved === "string" && saved.length >= 32) {
        _deviceSecret = saved;
        try {
          if (localStorage.getItem(DEVICE_SECRET_KEY) !== saved) localStorage.setItem(DEVICE_SECRET_KEY, saved);
        } catch (e2) {}
        return _deviceSecret;
      }
    } catch (e) {}
    try {
      var bak = localStorage.getItem(DEVICE_SECRET_KEY);
      if (bak && typeof bak === "string" && bak.length >= 32) {
        _deviceSecret = bak;
        try {
          GM_setValue(DEVICE_SECRET_KEY, bak);
        } catch (e3) {}
        return _deviceSecret;
      }
    } catch (e) {}
    var bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    var hex = Array.prototype.map.call(bytes, function(b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
    try {
      GM_setValue(DEVICE_SECRET_KEY, hex);
    } catch (e) {}
    try {
      localStorage.setItem(DEVICE_SECRET_KEY, hex);
    } catch (e) {}
    _deviceSecret = hex;
    return _deviceSecret;
  }
  var WALLET_PUBLIC_JWK = {
    kty: "EC",
    crv: "P-256",
    x: "l6Z_atNLQ_jvgC3uk6J3hqAJy7FgvH4qVT0qkpRLuQ0",
    y: "RL9H0U5QVyH7aL7gufqygwz-n9KtIuESjK6qYyTH3zU"
  };
  var _walletPublicKeyPromise = null;
  function getWalletPublicKey() {
    if (!_walletPublicKeyPromise) {
      _walletPublicKeyPromise = crypto.subtle.importKey("jwk", WALLET_PUBLIC_JWK, {
        name: "ECDSA",
        namedCurve: "P-256"
      }, false, [ "verify" ]).catch(function() {
        return null;
      });
    }
    return _walletPublicKeyPromise;
  }
  function base64UrlToBytes(b64url) {
    var b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  var _verifiedWallet = {
    balance: 0,
    estimatedBalance: 0,
    trialUsed: false,
    exp: 0
  };
  function isVerifiedWalletFresh() {
    return _verifiedWallet.exp > Math.floor(Date.now() / 1e3);
  }
  function fmtMedi(n) {
    var v = Math.round((typeof n === "number" ? n : 0) * 100) / 100;
    if (v < 0) v = 0;
    return v.toFixed(2);
  }
  function verifyWalletToken(token, expectMid) {
    if (!token || token.indexOf(".") === -1) return Promise.resolve(false);
    var parts = token.split(".");
    if (parts.length !== 2) return Promise.resolve(false);
    var payloadPart = parts[0], sigPart = parts[1];
    return getWalletPublicKey().then(function(pubKey) {
      if (!pubKey) return false;
      var sigBytes = base64UrlToBytes(sigPart);
      var msgBytes = (new TextEncoder).encode(payloadPart);
      return crypto.subtle.verify({
        name: "ECDSA",
        hash: "SHA-256"
      }, pubKey, sigBytes, msgBytes).then(function(ok) {
        if (!ok) return false;
        var payload;
        try {
          payload = JSON.parse((new TextDecoder).decode(base64UrlToBytes(payloadPart)));
        } catch (e) {
          return false;
        }
        if (expectMid && payload.mid !== expectMid) return false;
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1e3)) return false;
        return payload;
      });
    }).catch(function() {
      return false;
    });
  }
  function applyVerifiedToken(payload, rawToken) {
    if (isVerifiedWalletFresh() && payload.exp < _verifiedWallet.exp) return;
    _walletBase = typeof payload.balance === "number" ? payload.balance : payload.estimatedBalance;
    _verifiedWallet = {
      balance: 0,
      estimatedBalance: 0,
      trialUsed: !!payload.trialUsed,
      exp: payload.exp
    };
    walletRecalc();
    try {
      GM_setValue(WALLET_KEY, rawToken);
    } catch (e) {}
  }
  function initWalletFromCache() {
    var raw = null;
    try {
      raw = GM_getValue(WALLET_KEY, null);
    } catch (e) {}
    if (!raw || typeof raw !== "string") return;
    verifyWalletToken(raw, getMachineId()).then(function(payload) {
      if (payload) applyVerifiedToken(payload, raw);
    });
  }
  function _djb2(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h ^ str.charCodeAt(i)) & 4294967295;
    }
    return (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
  }
  function _fpWebGL() {
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "nogl";
      var dbg = gl.getExtension("WEBGL_debug_renderer_info");
      var vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      var renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      return (vendor || "") + "|" + (renderer || "");
    } catch (e) {
      return "errgl";
    }
  }
  function _fpCanvas() {
    try {
      var canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 40;
      var ctx = canvas.getContext("2d");
      if (!ctx) return "noctx";
      ctx.textBaseline = "top";
      ctx.font = "15px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(0, 0, 90, 22);
      ctx.fillStyle = "#069";
      ctx.fillText("MedinetTTT ÁÂÊO đặc 0123", 2, 16);
      ctx.fillStyle = "rgba(102, 200, 0, 0.65)";
      ctx.fillText("MedinetTTT ÁÂÊO đặc 0123", 4, 19);
      return canvas.toDataURL();
    } catch (e) {
      return "errcanvas";
    }
  }
  function _fpFonts() {
    try {
      if (!document.body) return "nobody";
      var testFonts = [ "Arial", "Times New Roman", "Courier New", "Verdana", "Tahoma", "Segoe UI", "Calibri", "Cambria", "Consolas", "Comic Sans MS", "Vni-Times", "VNI-Times", ".VnTime", "UTM Avo", "Roboto Condensed" ];
      var baseFonts = [ "monospace", "sans-serif", "serif" ];
      var testString = "mmmmmmmmmmlli0123";
      var span = document.createElement("span");
      span.style.position = "absolute";
      span.style.left = "-9999px";
      span.style.top = "-9999px";
      span.style.fontSize = "72px";
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
      return detected.join(",");
    } catch (e) {
      return "errfont";
    }
  }
  function _computeFingerprintMid() {
    // ===== THUAT TOAN GOC (v14.19) - TUYET DOI KHONG SUA =====
    // Chi dung de sinh MID LAN DAU khi chua co MID luu san.
    var raw = [ navigator.platform || "", (screen.width || 0) + "x" + (screen.height || 0), (screen.availWidth || 0) + "x" + (screen.availHeight || 0), (screen.colorDepth || 0) + "", (window.devicePixelRatio || 1) + "", navigator.language || "", (navigator.languages || []).join(","), (navigator.hardwareConcurrency || 0) + "", (navigator.deviceMemory || 0) + "", (navigator.maxTouchPoints || 0) + "", (new Date).getTimezoneOffset() + "", _fpWebGL(), _fpCanvas(), _fpFonts() ].join("||");
    return "MID-" + _djb2(raw);
  }
  // ================================================================
  //  MID BEN VUNG (v14.20) - KHONG DOI TEN KHOA, KHONG DOI LOGIC
  //  Thu tu uu tien: (1) GM da luu -> (2) localStorage sao luu ->
  //  (3) MID cu trong cache vi da ky (khach nang cap tu ban truoc) ->
  //  (4) tinh van tay 1 LAN roi luu lai vinh vien.
  // ================================================================
  var MID_KEY = "_mtt_machine_id_v1";
  var MID_BACKUP_KEY = "_mtt_machine_id_bak_v1";
  var _midCached = null;
  function _isValidMid(v) {
    return typeof v === "string" && /^MID-[0-9A-F]{8}$/.test(v);
  }
  function _saveMid(mid) {
    try {
      GM_setValue(MID_KEY, mid);
    } catch (e) {}
    try {
      localStorage.setItem(MID_BACKUP_KEY, mid);
    } catch (e) {}
  }
  function _midFromWalletCache() {
    try {
      var raw = GM_getValue(WALLET_KEY, null);
      if (!raw || typeof raw !== "string" || raw.indexOf(".") === -1) return null;
      var payloadPart = raw.split(".")[0];
      var payload = JSON.parse((new TextDecoder).decode(base64UrlToBytes(payloadPart)));
      return payload && _isValidMid(payload.mid) ? payload.mid : null;
    } catch (e) {
      return null;
    }
  }
  function getMachineId() {
    if (_midCached) return _midCached;
    var mid = null;
    try {
      mid = GM_getValue(MID_KEY, null);
    } catch (e) {}
    if (!_isValidMid(mid)) {
      mid = null;
      try {
        var bak = localStorage.getItem(MID_BACKUP_KEY);
        if (_isValidMid(bak)) mid = bak;
      } catch (e) {}
    }
    if (!mid) mid = _midFromWalletCache();
    if (!mid) mid = _computeFingerprintMid();
    _midCached = mid;
    _saveMid(mid);
    return mid;
  }
  var WALLET_UNSYNCED_KEY = "_mtt_unsynced_clicks_v1";
  function getUnsyncedClicks() {
    try {
      var v = GM_getValue(WALLET_UNSYNCED_KEY, 0);
      return typeof v === "number" ? v : 0;
    } catch (e) {
      return 0;
    }
  }
  function setUnsyncedClicks(v) {
    try {
      GM_setValue(WALLET_UNSYNCED_KEY, v);
    } catch (e) {}
  }
  var WALLET_INFLIGHT_KEY = "_mtt_inflight_clicks_v1";
  var _walletBase = 0;
  var _deductInFlight = false;
  var _deductBlocked = false;
  function getInflightClicks() {
    try {
      var v = GM_getValue(WALLET_INFLIGHT_KEY, 0);
      return typeof v === "number" ? v : 0;
    } catch (e) {
      return 0;
    }
  }
  function setInflightClicks(v) {
    try {
      GM_setValue(WALLET_INFLIGHT_KEY, v);
    } catch (e) {}
  }
  function walletPendingClicks() {
    return getUnsyncedClicks() + getInflightClicks();
  }
  function walletRecalc() {
    var b = Math.round(Math.max(0, _walletBase - walletPendingClicks() / 100) * 100) / 100;
    _verifiedWallet.balance = b;
    _verifiedWallet.estimatedBalance = b;
  }
  function getWalletCache() {
    return {
      balance: _verifiedWallet.balance,
      estimatedBalance: _verifiedWallet.estimatedBalance,
      trialUsed: _verifiedWallet.trialUsed,
      unsyncedClicks: getUnsyncedClicks()
    };
  }
  function isLicenseValid() {
    return isVerifiedWalletFresh() && _verifiedWallet.balance > 0;
  }
  function getWalletBalance() {
    return isVerifiedWalletFresh() ? _verifiedWallet.balance : 0;
  }
  function refreshWalletBalance(cb) {
    var mid = getMachineId();
    fetch(WALLET_API + "/balance?mid=" + encodeURIComponent(mid)).then(function(r) {
      return r.json();
    }).then(function(data) {
      return verifyWalletToken(data.token, mid).then(function(payload) {
        if (payload) applyVerifiedToken(payload, data.token);
        if (cb) cb(!!payload, getWalletCache());
      });
    }).catch(function() {
      if (cb) cb(false, getWalletCache());
    });
  }
  function activateTrial(onDone) {
    var mid = getMachineId();
    fetch(WALLET_API + "/trial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Secret": getDeviceSecret()
      },
      body: JSON.stringify({
        mid: mid
      })
    }).then(function(r) {
      return r.json().then(function(d) {
        return {
          status: r.status,
          data: d
        };
      });
    }).then(function(res) {
      if (res.status === 200) {
        return verifyWalletToken(res.data.token, mid).then(function(payload) {
          if (!payload) {
            onDone(false, "loi");
            return;
          }
          applyVerifiedToken(payload, res.data.token);
          onDone(true, payload.balance);
        });
      } else {
        var reason = "loi";
        if (res.data && res.data.error === "trial_already_used") reason = "da_dung_thu"; else if (res.data && res.data.error === "trial_limit_ip") reason = "gioi_han_ip"; else if (res.data && res.data.error === "device_mismatch") reason = "sai_thiet_bi"; else if (res.data && res.data.error === "wallet_blocked") reason = "vi_da_khoa";
        onDone(false, reason);
      }
    }).catch(function() {
      onDone(false, "network");
    });
  }
  var LOW_BALANCE_CLICKS = 300;
  var _heartbeatTimer = null;
  var _lastHeartbeatLiveClicks = null;
  function doSendHeartbeatNow(liveClicks) {
    var mid = getMachineId();
    fetch(WALLET_API + "/heartbeat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Secret": getDeviceSecret()
      },
      body: JSON.stringify({
        mid: mid,
        liveClicks: liveClicks
      }),
      keepalive: true
    }).catch(function() {});
  }
  function sendHeartbeat(liveClicks) {
    _lastHeartbeatLiveClicks = liveClicks;
    clearTimeout(_heartbeatTimer);
    _heartbeatTimer = setTimeout(function() {
      doSendHeartbeatNow(liveClicks);
    }, 2e3);
  }
  function flushHeartbeatNow() {
    if (_lastHeartbeatLiveClicks === null) return;
    clearTimeout(_heartbeatTimer);
    doSendHeartbeatNow(_lastHeartbeatLiveClicks);
  }
  window.addEventListener("pagehide", flushHeartbeatNow);
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") flushHeartbeatNow();
  });
  function spendCredits(cost) {
    setUnsyncedClicks(getUnsyncedClicks() + cost);
    walletRecalc();
    sendHeartbeat(getUnsyncedClicks());
    var clickBudget = Math.round(_verifiedWallet.balance * 100);
    if (clickBudget > 0 && clickBudget <= LOW_BALANCE_CLICKS) {
      showToast("⚠️ Sắp hết Medi — còn ≈" + clickBudget + " lượt, nạp thêm để không bị gián đoạn", "warn");
    } else if (clickBudget <= 0) {
      showToast("🔴 Đã hết Medi — vào Ví Medi để nạp thêm", "warn");
    }
    walletMaybeDeduct();
  }
  function walletMaybeDeduct() {
    if (_deductInFlight || _deductBlocked) return;
    var unsynced = getUnsyncedClicks();
    if (unsynced < 100) return;
    _deductInFlight = true;
    var toSend = unsynced;
    setUnsyncedClicks(0);
    setInflightClicks(toSend);
    clearTimeout(_heartbeatTimer);
    _lastHeartbeatLiveClicks = 0;
    var mid = getMachineId();
    var ok = false;
    fetch(WALLET_API + "/deduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Secret": getDeviceSecret()
      },
      body: JSON.stringify({
        mid: mid,
        clicks: toSend
      }),
      keepalive: true
    }).then(function(r) {
      return r.json();
    }).then(function(data) {
      if (data.error === "device_mismatch") {
        setInflightClicks(0);
        setUnsyncedClicks(getUnsyncedClicks() + toSend);
        walletRecalc();
        _deductBlocked = true;
        showToast("⚠️ Không xác nhận được thiết bị cho ví này — " + "nhắn Zalo 0868.91.97.90 để được hỗ trợ", "warn");
        return;
      }
      ok = true;
      setInflightClicks(0);
      return verifyWalletToken(data.token, mid).then(function(payload) {
        if (payload) {
          applyVerifiedToken(payload, data.token);
          var numEl = document.getElementById("_mtt_balance_num");
          var subEl = document.getElementById("_mtt_balance_sub");
          var boxEl = document.getElementById("_mtt_balance_box");
          var bal = _verifiedWallet.balance;
          if (numEl) numEl.innerHTML = fmtMedi(bal) + ' <span style="font-size:19px;font-weight:700">Medi</span>';
          if (subEl) subEl.textContent = "≈ " + Math.round(bal * 100) + " lượt autofill/autoclick còn lại";
          if (numEl) numEl.style.color = bal > 0 ? "#2e7d32" : "#e65100";
          if (boxEl) {
            boxEl.style.background = bal > 0 ? "#e8f5e9" : "#fff3e0";
            boxEl.style.border = "1.5px solid " + (bal > 0 ? "#a5d6a7" : "#ffcc80");
          }
        } else {
          refreshWalletBalance();
        }
        if (data.insufficientBalance) {
          showToast("⚠️ Ví không đủ Medi cho một phần lượt đã dùng — " + "phần đó vẫn được giữ lại chờ bạn nạp thêm, không bị mất", "warn");
        }
      });
    }).catch(function() {
      setInflightClicks(0);
      setUnsyncedClicks(getUnsyncedClicks() + toSend);
      walletRecalc();
    }).then(function() {
      _deductInFlight = false;
      sendHeartbeat(getUnsyncedClicks());
      if (ok) walletMaybeDeduct();
    });
  }
  function formatDDMMYYYY(date) {
    var d = String(date.getDate()).padStart(2, "0");
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var y = date.getFullYear();
    return d + "-" + m + "-" + y;
  }
  var TOS_ACCEPTED_KEY = "_mtt_tos_accepted_v1";
  function showTermsPopup(onAccepted) {
    try {
      if (GM_getValue(TOS_ACCEPTED_KEY, false)) {
        onAccepted();
        return;
      }
    } catch (e) {
      onAccepted();
      return;
    }
    var POPUP_ID = "_mtt_tos_popup";
    if (document.getElementById(POPUP_ID)) return;
    var overlay = document.createElement("div");
    overlay.id = POPUP_ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999999999",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Segoe UI, Arial, sans-serif",
      backdropFilter: "blur(5px)"
    });
    var card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fff",
      borderRadius: "18px",
      padding: "26px 26px 22px",
      maxWidth: "440px",
      width: "92vw",
      maxHeight: "88vh",
      overflowY: "auto",
      boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      boxSizing: "border-box"
    });
    var titleEl = document.createElement("div");
    titleEl.innerHTML = "📝 <b>Điều khoản sử dụng</b>";
    Object.assign(titleEl.style, {
      fontSize: "19px",
      color: "#0d47a1",
      marginBottom: "12px"
    });
    card.appendChild(titleEl);
    var body = document.createElement("div");
    Object.assign(body.style, {
      fontSize: "13.5px",
      color: "#374151",
      lineHeight: "1.7",
      textAlign: "left"
    });
    body.innerHTML = '<ul style="margin:0 0 12px;padding-left:18px">' + "<li>Medinet AutoFill chỉ hỗ trợ <b>điền nhanh</b> giá trị thông thường, <b>không khám bệnh</b> và không biết kết quả thực tế.</li>" + '<li>Sau khi dùng "Thao tác nhanh", bạn <b>bắt buộc kiểm tra, chỉnh lại</b> toàn bộ số liệu cho đúng với Phiếu khám thật do bác sĩ xác nhận trước khi lưu hồ sơ.</li>' + "<li>Bạn tự chịu trách nhiệm về tính chính xác của dữ liệu đã nhập; tác giả không chịu trách nhiệm với hậu quả pháp lý/y khoa phát sinh do không kiểm tra lại.</li>" + "<li>Dùng thử: tặng 5 Medi miễn phí, <b>chỉ 1 lần/máy</b>. Medi đã mua <b>không hết hạn</b> nhưng <b>không hoàn tiền</b> sau khi đã nạp/sử dụng.</li>" + "<li>Mã máy gắn với 1 thiết bị; không chia sẻ/can thiệp kỹ thuật để gian lận số dư hay dùng thú nhiều lần.</li>" + "</ul>";
    card.appendChild(body);
    var checkLabel = document.createElement("label");
    Object.assign(checkLabel.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13.5px",
      color: "#1f2937",
      fontWeight: "700",
      margin: "4px 0 16px",
      cursor: "pointer",
      userSelect: "none"
    });
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    Object.assign(checkbox.style, {
      width: "17px",
      height: "17px",
      cursor: "pointer",
      flexShrink: "0"
    });
    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(document.createTextNode("Tôi đã đọc và đồng ý với điều khoản sử dụng trên"));
    card.appendChild(checkLabel);
    var okBtn = document.createElement("button");
    okBtn.textContent = "OK, tiếp tục";
    Object.assign(okBtn.style, {
      width: "100%",
      padding: "13px",
      border: "none",
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: "800",
      color: "#fff",
      background: "#c8c8c8",
      cursor: "not-allowed",
      transition: "background .15s"
    });
    okBtn.disabled = true;
    checkbox.onchange = function() {
      okBtn.disabled = !checkbox.checked;
      okBtn.style.background = checkbox.checked ? "#1565c0" : "#c8c8c8";
      okBtn.style.cursor = checkbox.checked ? "pointer" : "not-allowed";
    };
    okBtn.onclick = function() {
      if (!checkbox.checked) return;
      try {
        GM_setValue(TOS_ACCEPTED_KEY, true);
      } catch (e) {}
      overlay.remove();
      onAccepted();
    };
    card.appendChild(okBtn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }
  function showLicenseExpiredPopup(forceTitle) {
    var POPUP_ID = "_mtt_license_popup";
    if (document.getElementById(POPUP_ID)) return;
    showTermsPopup(function() {
      _renderWalletPopup(forceTitle);
    });
  }
  function _renderWalletPopup(forceTitle) {
    var POPUP_ID = "_mtt_license_popup";
    if (document.getElementById(POPUP_ID)) return;
    var mid = getMachineId();
    var cache = getWalletCache();
    var overlay = document.createElement("div");
    overlay.id = POPUP_ID;
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999999",
      background: "rgba(0,0,0,0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Segoe UI, Arial, sans-serif",
      backdropFilter: "blur(5px)"
    });
    var card = document.createElement("div");
    Object.assign(card.style, {
      background: "#fff",
      borderRadius: "20px",
      padding: "32px 32px 26px",
      maxWidth: "480px",
      width: "94vw",
      maxHeight: "92vh",
      overflowY: "auto",
      boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      textAlign: "center",
      position: "relative",
      boxSizing: "border-box"
    });
    var qrZoomOverlayRef;
    var closeX = document.createElement("button");
    closeX.textContent = "×";
    Object.assign(closeX.style, {
      position: "absolute",
      top: "12px",
      right: "16px",
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#bbb",
      lineHeight: "1",
      padding: "0"
    });
    closeX.onclick = function() {
      overlay.remove();
      if (qrZoomOverlayRef) qrZoomOverlayRef.remove();
    };
    card.appendChild(closeX);
    var iconEl = document.createElement("div");
    iconEl.textContent = "💰";
    Object.assign(iconEl.style, {
      fontSize: "44px",
      marginBottom: "10px"
    });
    card.appendChild(iconEl);
    var titleEl = document.createElement("div");
    titleEl.textContent = "Ví Medi";
    Object.assign(titleEl.style, {
      fontSize: "24px",
      fontWeight: "800",
      color: "#0d47a1",
      marginBottom: "4px"
    });
    card.appendChild(titleEl);
    var balanceBox = document.createElement("div");
    balanceBox.id = "_mtt_balance_box";
    Object.assign(balanceBox.style, {
      background: cache.balance > 0 ? "#e8f5e9" : "#fff3e0",
      border: "1.5px solid " + (cache.balance > 0 ? "#a5d6a7" : "#ffcc80"),
      borderRadius: "14px",
      padding: "18px",
      margin: "14px 0 6px"
    });
    balanceBox.innerHTML = '<div style="font-size:13px;color:#4b5563;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Số dư hiện tại</div>' + '<div id="_mtt_balance_num" style="font-size:40px;font-weight:900;color:' + (cache.balance > 0 ? "#2e7d32" : "#e65100") + '">' + fmtMedi(cache.balance) + ' <span style="font-size:19px;font-weight:700">Medi</span></div>' + '<div id="_mtt_balance_sub" style="font-size:14px;color:#374151;font-weight:600;margin-top:4px">≈ ' + Math.round(cache.balance * 100) + " lượt autofill/autoclick còn lại</div>";
    card.appendChild(balanceBox);
    function updateBalanceDisplay(balance) {
      var numEl = document.getElementById("_mtt_balance_num");
      var subEl = document.getElementById("_mtt_balance_sub");
      var boxEl = document.getElementById("_mtt_balance_box");
      if (numEl) numEl.innerHTML = fmtMedi(balance) + ' <span style="font-size:19px;font-weight:700">Medi</span>';
      if (subEl) subEl.textContent = "≈ " + Math.round(balance * 100) + " lượt autofill/autoclick còn lại";
      if (numEl) numEl.style.color = balance > 0 ? "#2e7d32" : "#e65100";
      if (boxEl) {
        boxEl.style.background = balance > 0 ? "#e8f5e9" : "#fff3e0";
        boxEl.style.border = "1.5px solid " + (balance > 0 ? "#a5d6a7" : "#ffcc80");
      }
    }
    var refreshBtn = document.createElement("button");
    refreshBtn.textContent = "🔄 Làm mới số dư";
    Object.assign(refreshBtn.style, {
      border: "none",
      background: "none",
      color: "#1565c0",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      marginBottom: "16px",
      padding: "6px"
    });
    refreshBtn.onclick = function() {
      refreshBtn.textContent = "⏳ Đang tải...";
      refreshWalletBalance(function(ok, c) {
        updateBalanceDisplay(c.balance);
        refreshBtn.textContent = ok ? "✅ Đã cập nhật" : "⚠️ Lỗi mạng, thử lại";
        setTimeout(function() {
          refreshBtn.textContent = "🔄 Làm mới số dư";
        }, 1800);
      });
    };
    card.appendChild(refreshBtn);
    refreshWalletBalance(function(ok, c) {
      if (ok) updateBalanceDisplay(c.balance);
    });
    if (!cache.trialUsed) {
      var trialBtn = document.createElement("button");
      trialBtn.textContent = "⏳ Dùng thử +5 Medi (miễn phí, 1 lần/máy)";
      Object.assign(trialBtn.style, {
        width: "100%",
        padding: "15px",
        border: "none",
        borderRadius: "12px",
        background: "#e65100",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "800",
        cursor: "pointer",
        marginBottom: "14px"
      });
      trialBtn.onclick = function() {
        trialBtn.disabled = true;
        trialBtn.textContent = "⏳ Đang kích hoạt...";
        activateTrial(function(ok, result) {
          if (ok) {
            trialBtn.textContent = "🎉 Đã nhận +5 Medi!";
            updateBalanceDisplay(result);
            setTimeout(function() {
              trialBtn.remove();
            }, 1400);
          } else {
            trialBtn.disabled = false;
            if (result === "da_dung_thu") {
              trialBtn.textContent = "⚠️ Máy này đã dùng thử rồi";
            } else if (result === "gioi_han_ip") {
              trialBtn.textContent = "⚠️ Mạng này đã dùng hết lượt thử";
            } else if (result === "sai_thiet_bi") {
              trialBtn.textContent = "⚠️ Lỗi thiết bị, nhắn Zalo hỗ trợ";
            } else if (result === "vi_da_khoa") {
              trialBtn.textContent = "⚠️ Mã máy này đã khóa, nhắn Zalo hỗ trợ";
            } else {
              trialBtn.textContent = "⚠️ Lỗi mạng, thử lại";
            }
          }
        });
      };
      card.appendChild(trialBtn);
    }
    var divEl = document.createElement("div");
    Object.assign(divEl.style, {
      height: "1px",
      background: "#eee",
      margin: "4px 0 16px"
    });
    card.appendChild(divEl);
    var topupMsg = document.createElement("div");
    topupMsg.innerHTML = '<div style="font-size:15px;color:#374151;font-weight:700;margin-bottom:8px;text-align:left">Nạp thêm Medi</div>' + '<div style="font-size:14px;color:#4b5563;text-align:left;line-height:1.8">' + "• 2.000đ = 1 Medi = 100 lượt<br>" + "• Tối thiểu 100.000đ (50 Medi)<br>" + "• Tặng 5% khi nạp ≥ 500.000đ, tặng 10% khi nạp ≥ 1.000.000đ, tặng 15% khi nạp ≥ 2.000.000đ" + "</div>";
    Object.assign(topupMsg.style, {
      marginBottom: "14px"
    });
    card.appendChild(topupMsg);
    var midBox = document.createElement("div");
    Object.assign(midBox.style, {
      background: "#f5f7fa",
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "16px",
      textAlign: "left",
      border: "1px solid #e0e4ea"
    });
    midBox.innerHTML = '<div style="font-size:12.5px;color:#4b5563;font-weight:700;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">Mã máy của bạn (ghi vào nội dung CK)</div>' + '<div style="display:flex;align-items:center;gap:8px">' + '<b style="font-size:19px;color:#1565c0;letter-spacing:1px;flex:1">' + mid + "</b>" + '<button id="_mtt_copy_mid" style="padding:7px 12px;background:#1565c0;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;white-space:nowrap">📋 Sao chép</button>' + "</div>";
    card.appendChild(midBox);
    var CONTACT_STORE_KEY = "_mtt_contact_info_v1";
    var savedContact = {};
    try {
      savedContact = JSON.parse(GM_getValue(CONTACT_STORE_KEY, "{}")) || {};
    } catch (e) {
      savedContact = {};
    }
    var contactBox = document.createElement("div");
    Object.assign(contactBox.style, {
      background: "#fff8e1",
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "14px",
      textAlign: "left",
      border: "1px solid #ffe082"
    });
    contactBox.innerHTML = '<div style="font-size:12.5px;color:#6d4c00;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">📞 Thông tin liên hệ (bắt buộc, để hỗ trợ/bảo hành sau này)</div>' + '<input id="_mtt_contact_phone" type="tel" placeholder="Số điện thoại Zalo" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e0c896;border-radius:8px;font-size:14px;margin-bottom:8px" value="' + (savedContact.phone || "").replace(/"/g, "") + '">' + '<input id="_mtt_contact_name" type="text" placeholder="Tên của bạn" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e0c896;border-radius:8px;font-size:14px" value="' + (savedContact.name || "").replace(/"/g, "") + '">' + '<div id="_mtt_contact_hint" style="font-size:12px;color:#e65100;margin-top:8px;line-height:1.6"></div>';
    card.appendChild(contactBox);
    var BANK_NAME = "BIDV";
    var VA_NUMBER = "96247MEDINET";
    var VA_HOLDER = "DOAN HOANG ANH";
    var vaBox = document.createElement("div");
    Object.assign(vaBox.style, {
      background: "#e8f5e9",
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "10px",
      textAlign: "left",
      border: "1px solid #a5d6a7"
    });
    vaBox.innerHTML = '<div style="font-size:12.5px;color:#2e7d32;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;font-weight:700">Chuyển khoản vào (tự động cộng Medi)</div>' + '<div style="font-size:14px;color:#555;margin-bottom:4px">Ngân hàng: <b>' + BANK_NAME + "</b></div>" + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' + '<div style="font-size:14px;color:#555">Số TK: <b style="font-size:17px;color:#2e7d32;letter-spacing:.5px">' + VA_NUMBER + "</b></div>" + '<button id="_mtt_copy_va" style="padding:6px 11px;background:#2e7d32;color:#fff;border:none;border-radius:6px;font-size:12.5px;cursor:pointer;font-weight:600;white-space:nowrap;margin-left:auto">📋 Sao chép</button>' + "</div>" + '<div style="font-size:14px;color:#555">Chủ TK: ' + VA_HOLDER + "</div>" + '<div style="font-size:13px;color:#e65100;margin-top:8px;line-height:1.6">⚠️ Nội dung CK PHẢI ghi đúng Mã máy ' + mid + " ở trên, nếu không hệ thống không nhận diện được.</div>";
    card.appendChild(vaBox);
    var qrChipsBox = document.createElement("div");
    Object.assign(qrChipsBox.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "14px"
    });
    var QR_AMOUNTS = [ {
      amt: 1e5,
      label: "100.000 VNĐ",
      bonus: "",
      medi: "50 Medi"
    }, {
      amt: 5e5,
      label: "500.000 VNĐ",
      bonus: "+5%",
      medi: "262 Medi"
    }, {
      amt: 1e6,
      label: "1.000.000 VNĐ",
      bonus: "+10%",
      medi: "550 Medi"
    }, {
      amt: 2e6,
      label: "2.000.000 VNĐ",
      bonus: "+15%",
      medi: "1.150 Medi"
    } ];
    var qrImgEl = document.createElement("img");
    var currentQrAmt = 1e5;
    function renderQrImg() {
      qrImgEl.src = "https://img.vietqr.io/image/" + BANK_NAME + "-" + VA_NUMBER + "-compact2.png?amount=" + currentQrAmt + "&addInfo=" + encodeURIComponent(mid);
    }
    function isPhoneValid(v) {
      return /^[0-9+ ]{8,15}$/.test((v || "").trim());
    }
    function isNameValid(v) {
      return (v || "").trim().length >= 2;
    }
    function getContactValues() {
      return {
        phone: (document.getElementById("_mtt_contact_phone") || {}).value || "",
        name: (document.getElementById("_mtt_contact_name") || {}).value || ""
      };
    }
    function setChipsEnabled(enabled) {
      qrChipsBox.style.opacity = enabled ? "1" : ".45";
      qrChipsBox.style.pointerEvents = enabled ? "auto" : "none";
      qrBox.style.opacity = enabled ? "1" : ".45";
      qrBox.style.pointerEvents = enabled ? "auto" : "none";
    }
    var contactRegisteredFor = "";
    function syncContactState() {
      var c = getContactValues();
      var hintEl = document.getElementById("_mtt_contact_hint");
      var ok = isPhoneValid(c.phone) && isNameValid(c.name);
      if (hintEl) {
        hintEl.textContent = ok ? "" : "Nhập đầy đủ Số điện thoại Zalo và Tên để tạo mã QR (bắt buộc, giúp hỗ trợ/bảo hành sau này).";
      }
      setChipsEnabled(ok);
      try {
        GM_setValue(CONTACT_STORE_KEY, JSON.stringify(c));
      } catch (e) {}
      if (ok && contactRegisteredFor !== c.phone) {
        contactRegisteredFor = c.phone;
        fetch(WALLET_API + "/customer/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mid: mid,
            phone: c.phone.trim(),
            name: c.name.trim()
          })
        }).catch(function() {});
        if (typeof reportPendingOrder === "function") reportPendingOrder(currentQrAmt);
      }
      return ok;
    }
    setTimeout(function() {
      [ "_mtt_contact_phone", "_mtt_contact_name" ].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
          el.addEventListener("input", syncContactState);
          el.addEventListener("blur", syncContactState);
        }
      });
      syncContactState();
    }, 50);
    var reportedOrderFor = "";
    function reportPendingOrder(amt) {
      var key = mid + "|" + amt;
      if (reportedOrderFor === key) return;
      reportedOrderFor = key;
      fetch(WALLET_API + "/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mid: mid,
          amountVnd: amt
        })
      }).catch(function() {});
    }
    QR_AMOUNTS.forEach(function(opt, idx) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.dataset.amt = opt.amt;
      var isActive = idx === 0;
      chip.innerHTML = '<span style="font-weight:800;font-size:14.5px">' + opt.label + "</span>" + (opt.bonus ? '<span style="font-weight:800;font-size:12px;background:' + (isActive ? "rgba(255,255,255,0.25)" : "#e8f5e9") + ";color:" + (isActive ? "#fff" : "#2e7d32") + ';border-radius:999px;padding:2px 9px;margin-left:8px">' + opt.bonus + "</span>" : "") + '<span style="float:right;font-size:12.5px;font-weight:700;opacity:.9">' + opt.medi + "</span>";
      Object.assign(chip.style, {
        display: "block",
        width: "100%",
        padding: "11px 14px",
        borderRadius: "10px",
        cursor: "pointer",
        border: "1.5px solid " + (isActive ? "#2e7d32" : "#c8e0cb"),
        background: isActive ? "#2e7d32" : "#fff",
        color: isActive ? "#fff" : "#2e7d32",
        textAlign: "left",
        boxSizing: "border-box"
      });
      chip.addEventListener("click", function() {
        Array.prototype.forEach.call(qrChipsBox.children, function(c, i) {
          c.style.background = "#fff";
          c.style.color = "#2e7d32";
          c.style.borderColor = "#c8e0cb";
          var badge = c.querySelector("span:nth-child(2)");
          if (badge && QR_AMOUNTS[i].bonus) {
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
          }
        });
        chip.style.background = "#2e7d32";
        chip.style.color = "#fff";
        chip.style.borderColor = "#2e7d32";
        var activeBadge = chip.querySelector("span:nth-child(2)");
        if (activeBadge && opt.bonus) {
          activeBadge.style.background = "rgba(255,255,255,0.25)";
          activeBadge.style.color = "#fff";
        }
        currentQrAmt = parseInt(chip.dataset.amt, 10);
        renderQrImg();
        reportPendingOrder(currentQrAmt);
      });
      qrChipsBox.appendChild(chip);
    });
    card.appendChild(qrChipsBox);
    var qrBox = document.createElement("div");
    Object.assign(qrBox.style, {
      background: "#fff",
      border: "1.5px solid #a5d6a7",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "10px",
      textAlign: "center"
    });
    var qrImgWrap = document.createElement("div");
    Object.assign(qrImgWrap.style, {
      position: "relative",
      width: "190px",
      margin: "0 auto"
    });
    Object.assign(qrImgEl.style, {
      width: "190px",
      height: "190px",
      borderRadius: "8px",
      display: "block",
      margin: "0 auto",
      border: "1px solid #e0e0e0"
    });
    qrImgEl.alt = "QR chuyển khoản";
    renderQrImg();
    var qrZoomBtn = document.createElement("button");
    qrZoomBtn.type = "button";
    qrZoomBtn.title = "Phóng to QR";
    qrZoomBtn.textContent = "🔍";
    Object.assign(qrZoomBtn.style, {
      position: "absolute",
      right: "4px",
      bottom: "4px",
      width: "30px",
      height: "30px",
      borderRadius: "8px",
      border: "none",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      cursor: "pointer",
      fontSize: "15px",
      opacity: "0",
      transition: "opacity .15s"
    });
    qrImgWrap.addEventListener("mouseenter", function() {
      qrZoomBtn.style.opacity = "1";
    });
    qrImgWrap.addEventListener("mouseleave", function() {
      qrZoomBtn.style.opacity = "0";
    });
    var qrZoomOverlay = document.createElement("div");
    Object.assign(qrZoomOverlay.style, {
      display: "none",
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,.82)",
      zIndex: "2147483647",
      alignItems: "center",
      justifyContent: "center",
      cursor: "zoom-out"
    });
    var qrZoomImg = document.createElement("img");
    qrZoomImg.alt = "QR chuyển khoản phóng to";
    Object.assign(qrZoomImg.style, {
      width: "min(88vw,420px)",
      height: "min(88vw,420px)",
      borderRadius: "16px",
      background: "#fff",
      padding: "14px",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,.6)"
    });
    qrZoomOverlay.appendChild(qrZoomImg);
    qrZoomOverlay.addEventListener("click", function() {
      qrZoomOverlay.style.display = "none";
    });
    document.body.appendChild(qrZoomOverlay);
    qrZoomOverlayRef = qrZoomOverlay;
    function openQrZoom() {
      qrZoomImg.src = qrImgEl.src;
      qrZoomOverlay.style.display = "flex";
    }
    qrZoomBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      openQrZoom();
    });
    qrImgEl.style.cursor = "zoom-in";
    qrImgEl.addEventListener("click", openQrZoom);
    qrImgWrap.appendChild(qrImgEl);
    qrImgWrap.appendChild(qrZoomBtn);
    qrBox.appendChild(qrImgWrap);
    var qrNote = document.createElement("div");
    qrNote.textContent = "📱 Mở app ngân hàng → quét mã này — số tiền & nội dung Mã máy được điền sẵn, không cần gõ tay. Rê chuột và bấm 🔍 để xem QR to hơn.";
    Object.assign(qrNote.style, {
      fontSize: "12.5px",
      color: "#2e7d32",
      marginTop: "10px",
      lineHeight: "1.6",
      fontWeight: "600"
    });
    qrBox.appendChild(qrNote);
    card.appendChild(qrBox);
    setTimeout(function() {
      var copyVaBtn = document.getElementById("_mtt_copy_va");
      if (copyVaBtn) {
        copyVaBtn.addEventListener("click", function() {
          try {
            GM_setClipboard(VA_NUMBER);
          } catch (e) {
            try {
              var ta2 = document.createElement("textarea");
              ta2.value = VA_NUMBER;
              document.body.appendChild(ta2);
              ta2.select();
              document.execCommand("copy");
              document.body.removeChild(ta2);
            } catch (e2) {}
          }
          copyVaBtn.textContent = "✅ Đã sao!";
          setTimeout(function() {
            copyVaBtn.textContent = "📋 Sao chép";
          }, 1800);
        });
      }
    }, 50);
    setTimeout(function() {
      var copyMidBtn = document.getElementById("_mtt_copy_mid");
      if (!copyMidBtn) return;
      copyMidBtn.addEventListener("click", function() {
        try {
          GM_setClipboard(mid);
        } catch (e) {
          try {
            var ta = document.createElement("textarea");
            ta.value = mid;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          } catch (e2) {}
        }
        copyMidBtn.textContent = "✅ Đã sao!";
        setTimeout(function() {
          copyMidBtn.textContent = "📋 Sao chép";
        }, 1800);
      });
    }, 50);
    var zaloBtn = document.createElement("a");
    zaloBtn.href = "https://zalo.me/0868919790";
    zaloBtn.target = "_blank";
    zaloBtn.rel = "noopener";
    zaloBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" ' + 'alt="Zalo" style="width:18px;height:18px;vertical-align:middle;margin-right:7px">' + '<span>Nhắn Zalo 0868.91.97.90<br><span style="font-weight:600;font-size:12.5px;opacity:.9">Hỗ trợ nếu chuyển khoản bị lỗi</span></span>';
    Object.assign(zaloBtn.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      background: "#1565c0",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "700",
      textDecoration: "none",
      boxSizing: "border-box",
      textAlign: "center",
      lineHeight: "1.5"
    });
    card.appendChild(zaloBtn);
    overlay.appendChild(card);
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
    refreshWalletBalance(function(ok, c) {
      updateBalanceDisplay(c.balance);
    });
  }
  var MENU_ID = "_mtt_menu";
  var WRAPPER_ID = "_mtt_wrapper";
  var _styleInjected = false;
  var CONTEXT_MENU_ID = "_mtt_context_menu";
  var CONTEXT_ACTIONS = [ {
    emoji: "🔄",
    label: "Cập nhật phiên bản",
    tier: "lite",
    color: "#0369a1",
    hoverColor: "#075985",
    check: function() {
      return true;
    },
    fn: function() {
      var MODAL_ID = "_mtt_update_modal";
      if (document.getElementById(MODAL_ID)) {
        document.getElementById(MODAL_ID).remove();
        return;
      }
      var RAW_URL = "https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js";
      var META_URL = "https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js";
      var CURRENT_VERSION = typeof GM_info !== "undefined" && GM_info.script && GM_info.script.version || "8.0";
      var AUTO_UPDATE_KEY = "_mtt_auto_update";
      function getAutoUpdate() {
        try {
          return localStorage.getItem(AUTO_UPDATE_KEY) === "1";
        } catch (e) {
          return false;
        }
      }
      function setAutoUpdate(v) {
        try {
          localStorage.setItem(AUTO_UPDATE_KEY, v ? "1" : "0");
        } catch (e) {}
      }
      function extractVersion(text) {
        var m = text.match(/@version\s+([\d.]+)/);
        return m ? m[1] : null;
      }
      function versionGt(a, b) {
        var pa = a.split(".").map(Number);
        var pb = b.split(".").map(Number);
        for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
          var na = pa[i] || 0, nb = pb[i] || 0;
          if (na > nb) return true;
          if (na < nb) return false;
        }
        return false;
      }
      function escHtml(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      function extractChangelog(text) {
        var block = text.match(/==Changelog==([\s\S]*?)==\/Changelog==/);
        if (!block) return [];
        var entries = [];
        block[1].split("\n").forEach(function(line) {
          var m = line.match(/^\s*\/\/\s*([\d.]+)\s*\|\s*([^|]*)\|\s*(.+?)\s*$/);
          if (m) entries.push({
            version: m[1],
            date: m[2].trim(),
            desc: m[3].trim()
          });
        });
        return entries;
      }
      function buildChangelogHtml(entries, curVer) {
        var newer = entries.filter(function(e) {
          return versionGt(e.version, curVer);
        });
        if (!newer.length) return "";
        return newer.map(function(e) {
          var items = e.desc.split("•").map(function(s) {
            return s.trim();
          }).filter(Boolean);
          return '<div style="margin-bottom:10px">' + '<div style="font-weight:700;color:#0369a1;font-size:13px;margin-bottom:4px">' + "🆕 v" + escHtml(e.version) + (e.date ? " — " + escHtml(e.date) : "") + "</div>" + '<ul style="margin:0;padding-left:18px;font-size:13.5px;color:#374151;line-height:1.7">' + items.map(function(it) {
            return "<li>" + escHtml(it) + "</li>";
          }).join("") + "</ul>" + "</div>";
        }).join("");
      }
      var overlay = document.createElement("div");
      overlay.id = MODAL_ID;
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9999999",
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, Arial, sans-serif",
        backdropFilter: "blur(4px)"
      });
      var card = document.createElement("div");
      Object.assign(card.style, {
        background: "#fff",
        borderRadius: "18px",
        padding: "0",
        width: "640px",
        maxWidth: "94vw",
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden"
      });
      var header = document.createElement("div");
      Object.assign(header.style, {
        background: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)",
        padding: "20px 24px 18px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      });
      var headerIcon = document.createElement("span");
      headerIcon.textContent = "🔄";
      Object.assign(headerIcon.style, {
        fontSize: "28px",
        lineHeight: "1"
      });
      var headerText = document.createElement("div");
      var headerTitle = document.createElement("div");
      headerTitle.textContent = "Cập nhật phiên bản";
      Object.assign(headerTitle.style, {
        fontSize: "20px",
        fontWeight: "700",
        color: "#fff",
        lineHeight: "1.2"
      });
      var headerSub = document.createElement("div");
      headerSub.textContent = "Medinet Script";
      Object.assign(headerSub.style, {
        fontSize: "13px",
        color: "rgba(255,255,255,0.75)",
        marginTop: "2px"
      });
      headerText.appendChild(headerTitle);
      headerText.appendChild(headerSub);
      header.appendChild(headerIcon);
      header.appendChild(headerText);
      card.appendChild(header);
      var closeBtn2 = document.createElement("button");
      closeBtn2.innerHTML = "×";
      Object.assign(closeBtn2.style, {
        position: "absolute",
        top: "12px",
        right: "16px",
        background: "rgba(255,255,255,0.25)",
        border: "none",
        fontSize: "22px",
        color: "#fff",
        cursor: "pointer",
        lineHeight: "1",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "300"
      });
      closeBtn2.addEventListener("mouseenter", function() {
        closeBtn2.style.background = "rgba(255,255,255,0.4)";
      });
      closeBtn2.addEventListener("mouseleave", function() {
        closeBtn2.style.background = "rgba(255,255,255,0.25)";
      });
      closeBtn2.addEventListener("click", function() {
        overlay.remove();
      });
      card.appendChild(closeBtn2);
      var body = document.createElement("div");
      Object.assign(body.style, {
        padding: "22px 24px 20px"
      });
      var verBox = document.createElement("div");
      Object.assign(verBox.style, {
        background: "#f0f9ff",
        border: "1px solid #bae6fd",
        borderRadius: "10px",
        padding: "14px 18px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      });
      var verLabel = document.createElement("span");
      verLabel.textContent = "Phiên bản hiện tại";
      Object.assign(verLabel.style, {
        fontSize: "15px",
        color: "#374151"
      });
      var verValue = document.createElement("span");
      verValue.textContent = CURRENT_VERSION;
      Object.assign(verValue.style, {
        fontSize: "18px",
        fontWeight: "700",
        color: "#0369a1",
        background: "#e0f2fe",
        padding: "3px 12px",
        borderRadius: "20px"
      });
      verBox.appendChild(verLabel);
      verBox.appendChild(verValue);
      body.appendChild(verBox);
      var statusArea = document.createElement("div");
      statusArea.textContent = "⏳ Đang kiểm tra phìiên bản mới...";
      Object.assign(statusArea.style, {
        fontSize: "15px",
        color: "#374151",
        fontWeight: "600",
        minHeight: "28px",
        marginBottom: "18px",
        lineHeight: "1.6",
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        textAlign: "center"
      });
      body.appendChild(statusArea);
      var changelogBox = document.createElement("div");
      Object.assign(changelogBox.style, {
        display: "none",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "12px 14px",
        marginBottom: "16px",
        maxHeight: "180px",
        overflowY: "auto"
      });
      body.appendChild(changelogBox);
      var checkBtn = document.createElement("button");
      checkBtn.textContent = "🔍 Kiểm tra cập nhật";
      Object.assign(checkBtn.style, {
        display: "block",
        width: "100%",
        padding: "13px",
        background: "#0369a1",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        marginBottom: "10px",
        transition: "background 0.15s, transform 0.1s",
        letterSpacing: "0.3px"
      });
      checkBtn.addEventListener("mouseenter", function() {
        checkBtn.style.background = "#075985";
        checkBtn.style.transform = "translateY(-1px)";
      });
      checkBtn.addEventListener("mouseleave", function() {
        checkBtn.style.background = "#0369a1";
        checkBtn.style.transform = "translateY(0)";
      });
      var installBtn = document.createElement("button");
      installBtn.textContent = "⬇️ Cài đặt phiên bản mới";
      Object.assign(installBtn.style, {
        display: "none",
        width: "100%",
        padding: "13px",
        background: "linear-gradient(135deg, #16a34a, #15803d)",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        marginBottom: "10px",
        transition: "filter 0.15s, transform 0.1s",
        letterSpacing: "0.3px"
      });
      installBtn.addEventListener("mouseenter", function() {
        installBtn.style.filter = "brightness(1.1)";
        installBtn.style.transform = "translateY(-1px)";
      });
      installBtn.addEventListener("mouseleave", function() {
        installBtn.style.filter = "";
        installBtn.style.transform = "translateY(0)";
      });
      installBtn.addEventListener("click", function() {
        var copied = false;
        try {
          GM_setClipboard(RAW_URL);
          copied = true;
        } catch (e) {
          try {
            var ta = document.createElement("textarea");
            ta.value = RAW_URL;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            copied = true;
          } catch (e2) {}
        }
        installBtn.style.display = "none";
        var guide = document.createElement("div");
        Object.assign(guide.style, {
          background: "#fffbeb",
          border: "2px solid #fbbf24",
          borderRadius: "10px",
          padding: "14px 16px",
          marginBottom: "10px",
          fontSize: "14px",
          color: "#92400e",
          lineHeight: "2.0",
          textAlign: "left"
        });
        guide.innerHTML = '<b style="font-size:15px">' + (copied ? "✅ Đã copy URL!" : "📋 Sao chép URL bên dưới") + "</b><br>" + "1️⃣ Mở trang Tampermonkey bên dưới<br>" + "2️⃣ Mục <b>Import từ URL</b> → dán URL → <b>Import</b><br>" + "3️⃣ Nhấn <b>Cài đặt</b> → xong!";
        var urlBox = document.createElement("div");
        Object.assign(urlBox.style, {
          marginTop: "8px",
          padding: "8px 10px",
          background: "#fef3c7",
          borderRadius: "6px",
          fontSize: "11px",
          wordBreak: "break-all",
          color: "#78350f",
          fontFamily: "monospace",
          cursor: "pointer",
          border: "1px solid #fbbf24",
          userSelect: "all"
        });
        var urlLabel = document.createElement("div");
        urlLabel.textContent = "📋 URL để dán vào Tampermonkey (click để copy):";
        Object.assign(urlLabel.style, {
          fontSize: "12px",
          color: "#92400e",
          marginTop: "10px",
          marginBottom: "3px",
          fontWeight: "600"
        });
        guide.appendChild(urlLabel);
        urlBox.title = "Click để chọn toàn bộ";
        urlBox.textContent = RAW_URL;
        urlBox.addEventListener("click", function() {
          try {
            GM_setClipboard(RAW_URL);
          } catch (e) {}
          window.getSelection().selectAllChildren(urlBox);
        });
        guide.appendChild(urlBox);
        var tmBtn = document.createElement("button");
        tmBtn.textContent = "🔗 Mở Tampermonkey → Tiện ích";
        Object.assign(tmBtn.style, {
          display: "block",
          width: "100%",
          marginTop: "10px",
          padding: "9px 12px",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "14px",
          textAlign: "center"
        });
        tmBtn.addEventListener("click", function() {
          try {
            GM_openInTab("chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=utils", false);
          } catch (e) {
            window.open("chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=utils", "_blank");
          }
        });
        guide.appendChild(tmBtn);
        installBtn.parentNode.insertBefore(guide, installBtn);
      });
      checkBtn.addEventListener("click", function() {
        checkBtn.disabled = true;
        checkBtn.textContent = "⏳ Đang kiểm tra…";
        checkBtn.style.background = "#7dd3fc";
        statusArea.style.color = "#6b7280";
        statusArea.style.background = "#f9fafb";
        statusArea.style.borderColor = "#e5e7eb";
        statusArea.textContent = "⏳ Đang kết nối tới server...";
        installBtn.style.display = "none";
        changelogBox.style.display = "none";
        var xhr = new XMLHttpRequest;
        xhr.open("GET", META_URL + "?t=" + Date.now(), true);
        xhr.timeout = 1e4;
        xhr.onload = function() {
          checkBtn.disabled = false;
          checkBtn.textContent = "🔍 Kiểm tra cập nhật";
          checkBtn.style.background = "#0369a1";
          if (xhr.status === 200) {
            var remoteVer = extractVersion(xhr.responseText);
            if (!remoteVer) {
              statusArea.style.color = "#b91c1c";
              statusArea.style.background = "#fef2f2";
              statusArea.style.borderColor = "#fca5a5";
              statusArea.textContent = "⚠️ Không đọc được phiên bản từ server.";
            } else if (versionGt(remoteVer, CURRENT_VERSION)) {
              statusArea.style.color = "#15803d";
              statusArea.style.background = "#f0fdf4";
              statusArea.style.borderColor = "#86efac";
              statusArea.innerHTML = '✅ Có phiên bản mới: <b style="font-size:17px">' + remoteVer + "</b>";
              installBtn.style.display = "block";
              var clHtml = buildChangelogHtml(extractChangelog(xhr.responseText), CURRENT_VERSION);
              if (clHtml) {
                changelogBox.innerHTML = clHtml;
                changelogBox.style.display = "block";
              } else {
                changelogBox.style.display = "none";
              }
            } else {
              statusArea.style.color = "#15803d";
              statusArea.style.background = "#f0fdf4";
              statusArea.style.borderColor = "#86efac";
              statusArea.textContent = "✅ Bạn đang dùng phiên bản mới nhất!";
            }
          } else {
            statusArea.style.color = "#b91c1c";
            statusArea.style.background = "#fef2f2";
            statusArea.style.borderColor = "#fca5a5";
            statusArea.textContent = "⚠️ Lỗi kết nối (" + xhr.status + "). Kiểm tra lại sau.";
          }
        };
        xhr.onerror = xhr.ontimeout = function() {
          checkBtn.disabled = false;
          checkBtn.textContent = "🔍 Kiểm tra cập nhật";
          checkBtn.style.background = "#0369a1";
          statusArea.style.color = "#b91c1c";
          statusArea.style.background = "#fef2f2";
          statusArea.style.borderColor = "#fca5a5";
          statusArea.textContent = "⚠️ Không thể kết nối. Kiểm tra lại sau.";
        };
        xhr.send();
      });
      body.appendChild(checkBtn);
      body.appendChild(installBtn);
      var div2 = document.createElement("div");
      Object.assign(div2.style, {
        height: "1px",
        background: "#e5e7eb",
        margin: "14px 0"
      });
      body.appendChild(div2);
      var autoRow = document.createElement("label");
      Object.assign(autoRow.style, {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "15px",
        color: "#374151",
        cursor: "pointer"
      });
      var chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = getAutoUpdate();
      Object.assign(chk.style, {
        cursor: "pointer",
        width: "18px",
        height: "18px",
        accentColor: "#0369a1"
      });
      chk.addEventListener("change", function() {
        setAutoUpdate(chk.checked);
      });
      var chkLabel = document.createElement("span");
      chkLabel.textContent = "Tự động cập nhật khi có phiên bản mới";
      autoRow.appendChild(chk);
      autoRow.appendChild(chkLabel);
      body.appendChild(autoRow);
      var autoNote = document.createElement("div");
      autoNote.textContent = 'ℹ️ Tắt: bạn cần tự mở mục này mới biết có bản mới. Bật: script tự kiểm tra mỗi lần tải trang, mở sẵn tab cài đặt nếu có bản mới — Tampermonkey vẫn cần bạn bấm "Install" để hoàn tất, không tự cài ngầm.';
      Object.assign(autoNote.style, {
        fontSize: "13px",
        color: "#4b5563",
        fontWeight: "600",
        marginTop: "8px",
        lineHeight: "1.6",
        paddingLeft: "28px"
      });
      body.appendChild(autoNote);
      card.appendChild(body);
      overlay.appendChild(card);
      overlay.addEventListener("click", function(e) {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
      checkBtn.click();
    }
  }, {
    emoji: "📞",
    label: "Liên hệ và bảo hành",
    tier: "lite",
    color: "#6d28d9",
    hoverColor: "#5b21b6",
    check: function() {
      return true;
    },
    fn: function() {
      var MODAL_ID = "_mtt_contact_modal";
      if (document.getElementById(MODAL_ID)) {
        document.getElementById(MODAL_ID).remove();
        return;
      }
      var overlay = document.createElement("div");
      overlay.id = MODAL_ID;
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.55)",
        zIndex: "9999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, Arial, sans-serif",
        backdropFilter: "blur(3px)"
      });
      var card = document.createElement("div");
      Object.assign(card.style, {
        background: "#fff",
        borderRadius: "20px",
        width: "640px",
        maxWidth: "94vw",
        boxSizing: "border-box",
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
        position: "relative",
        overflow: "hidden"
      });
      var header = document.createElement("div");
      Object.assign(header.style, {
        background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)",
        padding: "26px 30px 22px",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      });
      var headerIcon = document.createElement("span");
      headerIcon.textContent = "👨‍⚕️";
      Object.assign(headerIcon.style, {
        fontSize: "38px",
        lineHeight: "1"
      });
      var headerText = document.createElement("div");
      var headerTitle = document.createElement("div");
      headerTitle.textContent = "Liên hệ và bảo hành";
      Object.assign(headerTitle.style, {
        fontSize: "24px",
        fontWeight: "800",
        color: "#fff",
        lineHeight: "1.2"
      });
      var headerSub = document.createElement("div");
      headerSub.textContent = "Medinet AutoFill — medinetautofill.github.io";
      Object.assign(headerSub.style, {
        fontSize: "14px",
        color: "rgba(255,255,255,0.85)",
        marginTop: "4px",
        fontWeight: "600"
      });
      headerText.appendChild(headerTitle);
      headerText.appendChild(headerSub);
      header.appendChild(headerIcon);
      header.appendChild(headerText);
      card.appendChild(header);
      var closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "14px",
        right: "18px",
        background: "rgba(255,255,255,0.25)",
        border: "none",
        fontSize: "24px",
        color: "#fff",
        cursor: "pointer",
        lineHeight: "1",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "300"
      });
      closeBtn.addEventListener("mouseenter", function() {
        closeBtn.style.background = "rgba(255,255,255,0.4)";
      });
      closeBtn.addEventListener("mouseleave", function() {
        closeBtn.style.background = "rgba(255,255,255,0.25)";
      });
      closeBtn.addEventListener("click", function() {
        overlay.remove();
      });
      card.appendChild(closeBtn);
      var body = document.createElement("div");
      Object.assign(body.style, {
        padding: "26px 30px 28px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px"
      });
      function infoCard(bg, border, titleColor, titleText, innerHtml) {
        var box = document.createElement("div");
        Object.assign(box.style, {
          background: bg,
          border: "1.5px solid " + border,
          borderRadius: "14px",
          padding: "18px 20px",
          boxSizing: "border-box"
        });
        var t = document.createElement("div");
        t.textContent = titleText;
        Object.assign(t.style, {
          fontSize: "13px",
          fontWeight: "800",
          color: titleColor,
          textTransform: "uppercase",
          letterSpacing: ".5px",
          marginBottom: "10px"
        });
        box.appendChild(t);
        var inner = document.createElement("div");
        inner.innerHTML = innerHtml;
        box.appendChild(inner);
        return box;
      }
      var zaloCard = infoCard("#ecfdf5", "#a7f3d0", "#047857", "💬 Hỗ trợ trực tiếp", '<div style="font-size:17px;font-weight:800;color:#065f46;margin-bottom:6px">Zalo: 0868.91.97.90</div>' + '<div style="font-size:14px;color:#374151;line-height:1.7">Nhắn tin khi cần hỗ trợ cài đặt, lỗi chuyển khoản, hoặc bất kỳ vấn đề nào với Ví Medi.</div>');
      var zaloOpenBtn = document.createElement("a");
      zaloOpenBtn.href = "https://zalo.me/0868919790";
      zaloOpenBtn.target = "_blank";
      zaloOpenBtn.rel = "noopener";
      zaloOpenBtn.textContent = "💬 Nhắn Zalo ngay";
      Object.assign(zaloOpenBtn.style, {
        display: "block",
        width: "100%",
        marginTop: "12px",
        padding: "11px",
        background: "#1565c0",
        color: "#fff",
        textAlign: "center",
        borderRadius: "10px",
        fontWeight: "800",
        fontSize: "15px",
        textDecoration: "none",
        boxSizing: "border-box"
      });
      zaloCard.appendChild(zaloOpenBtn);
      body.appendChild(zaloCard);
      var warrantyCard = infoCard("#eff6ff", "#bfdbfe", "#1d4ed8", "🛡️ Chính sách bảo hành", '<ul style="margin:0;padding-left:18px;font-size:14px;color:#374151;line-height:1.8">' + "<li>Hỗ trợ cài đặt lại miễn phí khi đổi máy/trình duyệt</li>" + "<li>Medi đã mua không hết hạn, giữ nguyên khi nâng cấp phiên bản</li>" + "<li>Hỗ trợ gỡ khoá thiết bị nếu bị khoá nhầm</li>" + "<li>Phản hồi lỗi kỹ thuật qua Zalo, xử lý trong ngày</li>" + "</ul>");
      body.appendChild(warrantyCard);
      card.appendChild(body);
      var footer = document.createElement("div");
      footer.textContent = "Copyright © Medinet AutoFill. All rights reserved.";
      Object.assign(footer.style, {
        textAlign: "center",
        fontSize: "12.5px",
        color: "#9ca3af",
        padding: "0 30px 22px"
      });
      card.appendChild(footer);
      overlay.appendChild(card);
      overlay.addEventListener("click", function(e) {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    }
  }, {
    emoji: "💰",
    label: "Quản lý ví Medi",
    tier: "lite",
    color: "#0d47a1",
    hoverColor: "#0a3a82",
    check: function() {
      return true;
    },
    fn: function() {
      var MODAL_ID = "_mtt_author_modal";
      if (document.getElementById(MODAL_ID)) {
        document.getElementById(MODAL_ID).remove();
        return;
      }
      var overlay = document.createElement("div");
      overlay.id = MODAL_ID;
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.55)",
        zIndex: "9999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, Arial, sans-serif",
        backdropFilter: "blur(3px)"
      });
      var card = document.createElement("div");
      Object.assign(card.style, {
        background: "#fff",
        borderRadius: "20px",
        width: "640px",
        maxWidth: "94vw",
        boxSizing: "border-box",
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
        position: "relative",
        overflow: "hidden"
      });
      var header = document.createElement("div");
      Object.assign(header.style, {
        background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)",
        padding: "26px 30px 22px",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      });
      var headerIcon = document.createElement("span");
      headerIcon.textContent = "💰";
      Object.assign(headerIcon.style, {
        fontSize: "38px",
        lineHeight: "1"
      });
      var headerText = document.createElement("div");
      var headerTitle = document.createElement("div");
      headerTitle.textContent = "Quản lý ví Medi";
      Object.assign(headerTitle.style, {
        fontSize: "24px",
        fontWeight: "800",
        color: "#fff",
        lineHeight: "1.2"
      });
      var headerSub = document.createElement("div");
      headerSub.textContent = "Medinet AutoFill";
      Object.assign(headerSub.style, {
        fontSize: "14px",
        color: "rgba(255,255,255,0.85)",
        marginTop: "4px",
        fontWeight: "600"
      });
      headerText.appendChild(headerTitle);
      headerText.appendChild(headerSub);
      header.appendChild(headerIcon);
      header.appendChild(headerText);
      card.appendChild(header);
      var closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "14px",
        right: "18px",
        background: "rgba(255,255,255,0.25)",
        border: "none",
        fontSize: "24px",
        color: "#fff",
        cursor: "pointer",
        lineHeight: "1",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "300"
      });
      closeBtn.addEventListener("mouseenter", function() {
        closeBtn.style.background = "rgba(255,255,255,0.4)";
      });
      closeBtn.addEventListener("mouseleave", function() {
        closeBtn.style.background = "rgba(255,255,255,0.25)";
      });
      closeBtn.addEventListener("click", function() {
        overlay.remove();
      });
      card.appendChild(closeBtn);
      var body = document.createElement("div");
      Object.assign(body.style, {
        padding: "26px 30px 28px"
      });
      var walletC = getWalletCache();
      var isPositive = walletC.balance > 0;
      var licInfoBox = document.createElement("div");
      Object.assign(licInfoBox.style, {
        background: isPositive ? "#ecfdf5" : "#fef2f2",
        border: "1.5px solid " + (isPositive ? "#a7f3d0" : "#fecaca"),
        borderRadius: "14px",
        padding: "20px 22px",
        marginBottom: "18px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "18px",
        boxSizing: "border-box"
      });
      var balCol = document.createElement("div");
      balCol.innerHTML = '<div style="font-size:12.5px;font-weight:800;color:' + (isPositive ? "#047857" : "#b91c1c") + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' + (isPositive ? "🟢 Số dư hiện tại" : "🔴 Trạng thái") + "</div>" + '<div style="font-size:22px;font-weight:800;color:' + (isPositive ? "#065f46" : "#991b1b") + '">' + (isPositive ? fmtMedi(walletC.balance) + " Medi" : "Hết Medi") + "</div>" + (isPositive ? '<div style="font-size:13px;color:#374151;margin-top:4px">≈ ' + Math.round(walletC.balance * 100) + " lượt dùng</div>" : '<div style="font-size:13px;color:#7f1d1d;margin-top:4px">Chưa kích hoạt / cần nạp thêm</div>');
      var midCol = document.createElement("div");
      midCol.innerHTML = '<div style="font-size:12.5px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🖥️ Mã máy của bạn</div>' + '<div style="font-size:16px;font-weight:800;color:#111827;word-break:break-all;font-family:monospace">' + getMachineId() + "</div>" + '<div style="font-size:12.5px;color:#6b7280;margin-top:4px">Dùng để tra cứu/bảo hành khi cần hỗ trợ</div>';
      licInfoBox.appendChild(balCol);
      licInfoBox.appendChild(midCol);
      body.appendChild(licInfoBox);
      var licBtn = document.createElement("button");
      licBtn.textContent = "💳 Nạp / Quản lý Medi chi tiết";
      Object.assign(licBtn.style, {
        display: "block",
        width: "100%",
        padding: "15px",
        background: "#0d47a1",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "800",
        cursor: "pointer",
        letterSpacing: ".3px"
      });
      licBtn.addEventListener("mouseenter", function() {
        licBtn.style.background = "#0a3a82";
      });
      licBtn.addEventListener("mouseleave", function() {
        licBtn.style.background = "#0d47a1";
      });
      licBtn.addEventListener("click", function() {
        var authModal = document.getElementById("_mtt_author_modal");
        if (authModal) authModal.remove();
        showLicenseExpiredPopup();
      });
      body.appendChild(licBtn);
      card.appendChild(body);
      overlay.appendChild(card);
      overlay.addEventListener("click", function(e) {
        if (e.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
    }
  } ];
  var SCRIPT_ENABLED_KEY = "_mtt_script_enabled";
  function isScriptEnabled() {
    try {
      var v = GM_getValue(SCRIPT_ENABLED_KEY, true);
      return v !== false;
    } catch (e) {
      return true;
    }
  }
  function setScriptEnabled(enabled) {
    try {
      GM_setValue(SCRIPT_ENABLED_KEY, !!enabled);
    } catch (e) {}
  }
  function injectStyle() {
    if (_styleInjected || document.getElementById("_mtt_style")) return;
    _styleInjected = true;
    var s = document.createElement("style");
    s.id = "_mtt_style";
    s.textContent = "#_mtt_menu,#_mtt_context_menu{display:none;position:fixed;z-index:2000000;background:#fff;" + "border:1px solid #d1d5db;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,0.22);" + "min-width:275px;padding:8px;flex-direction:column;gap:6px;}" + "._mtt_item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;" + "border-width:1.5px;border-style:solid;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;" + "text-align:left;background:#fff;transition:opacity 0.2s,transform 0.1s;}" + "._mtt_item:not([data-unavailable]):not([data-nocredit]):hover{opacity:0.78;transform:translateX(2px);}" + "._mtt_item:active:not([data-unavailable]):not([data-nocredit]){transform:scale(0.97);}" + "._mtt_item[data-unavailable]{opacity:0.32;cursor:not-allowed;filter:grayscale(0.5);}" + "._mtt_item[data-nocredit]{opacity:0.5;filter:grayscale(0.3);}" + "._mtt_sep{display:none;}" + "._mtt_toggle_row{display:flex;align-items:center;justify-content:space-between;width:100%;" + "padding:9px 12px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;" + "background:#f3f4f6;border:1.5px solid #e5e7eb;transition:background 0.2s;}" + "._mtt_toggle_row:hover{background:#e9ebee;}" + "._mtt_toggle_label{display:flex;align-items:center;gap:8px;}" + '._mtt_toggle_row[data-on="0"] ._mtt_toggle_label{color:#b91c1c;}' + '._mtt_toggle_row[data-on="1"] ._mtt_toggle_label{color:#15803d;}' + "._mtt_switch{position:relative;width:38px;height:20px;border-radius:10px;background:#cbd5e1;" + "flex-shrink:0;transition:background 0.2s;}" + '._mtt_switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;' + "border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.35);}" + '._mtt_toggle_row[data-on="1"] ._mtt_switch{background:#16a34a;}' + '._mtt_toggle_row[data-on="1"] ._mtt_switch::after{left:20px;}' + "._mtt_toggle_sep{height:1px;background:#e5e7eb;margin:2px 0 4px;}";
    document.head.appendChild(s);
  }
  function getOrBuildMenu() {
    var existing = document.getElementById(MENU_ID);
    if (existing) return existing;
    injectStyle();
    var menu = document.createElement("div");
    menu.id = MENU_ID;
    var toggleRow = document.createElement("div");
    toggleRow.id = "_mtt_toggle_row";
    toggleRow.className = "_mtt_toggle_row";
    toggleRow.innerHTML = '<span class="_mtt_toggle_label"><span style="font-size:15px">⚡</span><span id="_mtt_toggle_text">Bật</span></span>' + '<span class="_mtt_switch"></span>';
    toggleRow.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var newState = !isScriptEnabled();
      setScriptEnabled(newState);
      updateMenuAvailability(menu);
      showToast(newState ? "⚡ Đã BẬT script" : "🔌 Đã TẮT script - các thao tác nhanh sẽ không chạy", newState ? "success" : "warn");
    });
    menu.appendChild(toggleRow);
    var toggleSep = document.createElement("div");
    toggleSep.className = "_mtt_toggle_sep";
    menu.appendChild(toggleSep);
    ACTIONS.forEach(function(action, idx) {
      var item = document.createElement("button");
      item.className = "_mtt_item";
      item.dataset.actionIdx = idx;
      item.style.borderColor = action.color;
      item.style.color = action.color;
      var arrowHtml = action.hasFlyout ? ' <span style="margin-left:auto;opacity:0.6">▶</span>' : "";
      item.innerHTML = '<span style="font-size:15px">' + action.emoji + "</span><span>" + action.label + "</span>" + arrowHtml;
      if (action.xlsFloatCtx) {
        item.addEventListener("contextmenu", function(e) {
          e.preventDefault();
          e.stopPropagation();
          xlsShowFloatCtx(e.clientX, e.clientY);
        });
      }
      item.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (item.hasAttribute("data-unavailable")) return;
        if (action.hasFlyout && action.flyoutItems) {
          var existing = document.getElementById(SUBMENU_ID);
          if (existing) {
            closeSubmenu();
            return;
          }
          openSubmenu(item, action.flyoutItems, action.noAgeLogic);
          return;
        }
        if (!isLicenseValid()) {
          menu.style.display = "none";
          showLicenseExpiredPopup();
          return;
        }
        menu.style.display = "none";
        action.fn();
        if (!action.selfBills) spendCredits(action.creditCost || DEFAULT_ACTION_COST);
      });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    return menu;
  }
  function getOrBuildContextMenu() {
    var existing = document.getElementById(CONTEXT_MENU_ID);
    if (existing) return existing;
    injectStyle();
    var menu = document.createElement("div");
    menu.id = CONTEXT_MENU_ID;
    CONTEXT_ACTIONS.forEach(function(action) {
      var item = document.createElement("button");
      item.className = "_mtt_item";
      item.style.borderColor = action.color;
      item.style.color = action.color;
      item.innerHTML = '<span style="font-size:15px">' + action.emoji + "</span><span>" + action.label + "</span>";
      item.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        menu.style.display = "none";
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
    var top = y;
    if (left + menuW > window.innerWidth - 8) left = window.innerWidth - 8 - menuW;
    if (left < 4) left = 4;
    menu.style.top = top + "px";
    menu.style.left = left + "px";
    menu.style.display = "flex";
  }
  document.addEventListener("click", function(e) {
    var menu = document.getElementById(MENU_ID);
    var ctxMenu = document.getElementById(CONTEXT_MENU_ID);
    var wrapper = document.getElementById(WRAPPER_ID);
    var sm = document.getElementById(SUBMENU_ID);
    if (menu && menu.style.display !== "none") {
      var xctx = document.getElementById("_mtt_xls_ctx");
      var insideMain = wrapper && wrapper.contains(e.target) || menu.contains(e.target) || sm && sm.contains(e.target) || xctx && xctx.contains(e.target);
      if (!insideMain) {
        menu.style.display = "none";
        closeSubmenu();
      }
    }
    if (ctxMenu && ctxMenu.style.display !== "none" && !ctxMenu.contains(e.target)) {
      ctxMenu.style.display = "none";
    }
  }, true);
  function updateMenuAvailability(menu) {
    var scriptEnabled = isScriptEnabled();
    var toggleRow = menu.querySelector("#_mtt_toggle_row");
    if (toggleRow) {
      toggleRow.setAttribute("data-on", scriptEnabled ? "1" : "0");
      var toggleText = toggleRow.querySelector("#_mtt_toggle_text");
      if (toggleText) toggleText.textContent = scriptEnabled ? "Bật" : "Tắt";
    }
    var hasCredits = isLicenseValid();
    var visibleCount = 0;
    menu.querySelectorAll("._mtt_item").forEach(function(item) {
      var idx = parseInt(item.dataset.actionIdx, 10);
      var action = ACTIONS[idx];
      if (!action) return;
      var available = !action.check || action.check();
      if (!available) {
        item.style.display = "none";
        item.removeAttribute("data-unavailable");
        return;
      }
      item.style.display = "";
      visibleCount++;
      if (!scriptEnabled) {
        item.setAttribute("data-unavailable", "1");
        item.title = "Script đang TẮT - bật lên ở đầu menu để sử dụng";
        return;
      }
      if (!hasCredits) {
        item.setAttribute("data-nocredit", "1");
        item.title = "Hết Medi - bam để nạp thêm";
      } else {
        item.removeAttribute("data-nocredit");
      }
    });
    var emptyHint = menu.querySelector("#_mtt_empty_hint");
    if (visibleCount === 0) {
      if (!emptyHint) {
        emptyHint = document.createElement("div");
        emptyHint.id = "_mtt_empty_hint";
        emptyHint.style.cssText = "padding:10px 12px;font-size:12.5px;color:#888;text-align:center;font-weight:500;";
        emptyHint.textContent = "Không có thao tác nào khả dụng trên trang này";
        menu.appendChild(emptyHint);
      }
      emptyHint.style.display = "";
    } else if (emptyHint) {
      emptyHint.style.display = "none";
    }
  }
  function openMenu(anchorBtn) {
    if (!isLicenseValid()) {
      showLicenseExpiredPopup();
      return;
    }
    var menu = getOrBuildMenu();
    updateMenuAvailability(menu);
    var rect = anchorBtn.getBoundingClientRect();
    var menuW = 275;
    var top = rect.bottom + 4;
    var left = rect.left;
    if (left + menuW > window.innerWidth - 8) left = rect.right - menuW;
    if (left < 4) left = 4;
    menu.style.top = top + "px";
    menu.style.left = left + "px";
    menu.style.display = "flex";
  }
  injectStyle();
  initWalletFromCache();
  refreshWalletBalance(function(ok) {
    if (ok && !_deductInFlight && getInflightClicks() > 0) {
      setInflightClicks(0);
      walletRecalc();
    }
  });
  var _injectedContainers = typeof WeakSet !== "undefined" ? new WeakSet : null;
  function buildWrapper() {
    var mainBtn = document.createElement("button");
    mainBtn.innerHTML = '⚡ Thao tác nhanh <span style="font-size:10px;opacity:0.8">▼</span>';
    mainBtn.title = "Mở menu thao tác nhanh";
    Object.assign(mainBtn.style, {
      padding: "6px 14px",
      background: "transparent",
      color: "#0369a1",
      border: "1px solid #000",
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      whiteSpace: "nowrap",
      fontFamily: "inherit",
      lineHeight: "1.5",
      transition: "background 0.15s",
      flexShrink: "0"
    });
    mainBtn.addEventListener("mouseenter", function() {
      mainBtn.style.background = "#e0f2fe";
    });
    mainBtn.addEventListener("mouseleave", function() {
      mainBtn.style.background = "transparent";
    });
    mainBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var menu = document.getElementById(MENU_ID);
      if (menu && menu.style.display !== "none") {
        menu.style.display = "none";
      } else {
        openMenu(mainBtn);
      }
    });
    mainBtn.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var mainMenu = document.getElementById(MENU_ID);
      if (mainMenu) mainMenu.style.display = "none";
      closeSubmenu();
      var ctxMenu = document.getElementById(CONTEXT_MENU_ID);
      if (ctxMenu && ctxMenu.style.display !== "none") {
        ctxMenu.style.display = "none";
      } else {
        openContextMenu(e.clientX, e.clientY);
      }
    });
    var wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;
    Object.assign(wrapper.style, {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: "0"
    });
    wrapper.appendChild(mainBtn);
    return wrapper;
  }
  function getDirectParentInContainer(container, el) {
    var node = el;
    while (node && node.parentElement !== container) {
      node = node.parentElement;
    }
    return node || null;
  }
  function ensureWrapperPosition(container, wrapper) {
    var themMoiParent = null, luuThayDoiParent = null;
    container.querySelectorAll("dx-button[aria-label]").forEach(function(btn) {
      var label = btn.getAttribute("aria-label") || "";
      if (label.indexOf("Thêm mới phiếu") !== -1 && !themMoiParent) themMoiParent = getDirectParentInContainer(container, btn);
      if ((label.indexOf("Lưu thay đổi") !== -1 || label.trim() === "Lưu") && !luuThayDoiParent) luuThayDoiParent = getDirectParentInContainer(container, btn);
    });
    if (luuThayDoiParent && wrapper.nextSibling !== luuThayDoiParent) {
      container.insertBefore(wrapper, luuThayDoiParent);
    } else if (!luuThayDoiParent && themMoiParent && wrapper.previousSibling !== themMoiParent) {
      themMoiParent.after ? themMoiParent.after(wrapper) : container.insertBefore(wrapper, themMoiParent.nextSibling);
    } else if (!luuThayDoiParent && !themMoiParent) {
      if (wrapper.parentElement !== container) container.insertBefore(wrapper, container.firstChild);
    }
  }
  function tryInjectIntoContainer(container) {
    var saveBtnEl = null;
    container.querySelectorAll("dx-button[aria-label]").forEach(function(btn) {
      var label = (btn.getAttribute("aria-label") || "").trim();
      if (!saveBtnEl && (label.indexOf("Lưu thay đổi") !== -1 || label === "Lưu")) saveBtnEl = btn;
    });
    if (!saveBtnEl) return;
    var wrapper = container.querySelector("#" + WRAPPER_ID);
    if (!wrapper) {
      wrapper = buildWrapper();
      wrapper.style.order = "";
      container.appendChild(wrapper);
      if (_injectedContainers) _injectedContainers.add(container);
      var wrapperObserver = new MutationObserver(function() {
        if (!container.contains(wrapper)) {
          wrapperObserver.disconnect();
          if (_injectedContainers) _injectedContainers.delete(container);
        }
      });
      wrapperObserver.observe(container, {
        childList: true
      });
    }
    ensureWrapperPosition(container, wrapper);
  }
  function findToolbarSaveButtons() {
    var result = [];
    document.querySelectorAll("dx-button[aria-label]").forEach(function(btn) {
      if (btn.closest(".footer-dynamic-form_btn_container")) return;
      var label = (btn.getAttribute("aria-label") || "").trim();
      if (label === "Lưu" || label === "Lưu thay đổi") result.push(btn);
    });
    return result;
  }
  function tryInjectToolbarButton(btn) {
    var item = btn.closest(".dx-toolbar-item") || btn.closest(".dx-item") || btn.parentElement;
    var container = item && item.parentElement;
    if (!item || !container) return;
    if (container.querySelector("#" + WRAPPER_ID)) return;
    var wrapper = buildWrapper();
    wrapper.style.order = "";
    container.insertBefore(wrapper, item);
    if (_injectedContainers) _injectedContainers.add(container);
    var wrapperObserver = new MutationObserver(function() {
      if (!container.contains(wrapper)) wrapperObserver.disconnect();
    });
    wrapperObserver.observe(container, {
      childList: true
    });
  }
  function scanToolbarInject() {
    findToolbarSaveButtons().forEach(tryInjectToolbarButton);
  }
  function scanAndInject() {
    document.querySelectorAll(".footer-dynamic-form_btn_container").forEach(function(container) {
      tryInjectIntoContainer(container);
    });
    scanToolbarInject();
    te6RunAutoFillIfLicensed();
  }
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var target = mutations[i].target;
      var added = mutations[i].addedNodes;
      if (target && target.classList && target.classList.contains("footer-dynamic-form_btn_container")) {
        tryInjectIntoContainer(target);
        continue;
      }
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.classList && node.classList.contains("footer-dynamic-form_btn_container")) {
          tryInjectIntoContainer(node);
          break;
        }
        var inner = node.querySelector && node.querySelector(".footer-dynamic-form_btn_container");
        if (inner) {
          tryInjectIntoContainer(inner);
          break;
        }
        var parent = node.parentElement;
        if (parent && parent.classList && parent.classList.contains("footer-dynamic-form_btn_container")) {
          tryInjectIntoContainer(parent);
          break;
        }
        if (node.querySelector && node.querySelector("dx-button[aria-label]")) {
          scanToolbarInject();
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  var M14_SPECIALTIES = [ {
    radio: "NoiKhoa_PhanLoai",
    cb: "NoiKhoa_ChuaPhatHienBatThuong",
    icds: [ "NoiKhoa_ChanDoanSoBo_ICD", "NoiKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "NgoaiKhoa_PhanLoai",
    cb: "NgoaiKhoa_ChuaPhatHienBatThuong",
    icds: [ "NgoaiKhoa_ChanDoanSoBo_ICD", "NgoaiKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "DaLieu_PhanLoai",
    cb: "DaLieu_ChuaPhatHienBatThuong",
    icds: [ "DaLieu_ChanDoanSoBo_ICD", "DaLieu_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "SanKhoa_PhanLoai",
    cb: "SanKhoa_ChuaPhatHienBatThuong",
    icds: [ "SanKhoa_ChanDoanSoBo_ICD", "SanKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "PhuKhoa_PhanLoai",
    cb: "PhuKhoa_ChuaPhatHienBatThuong",
    icds: [ "PhuKhoa_ChanDoanSoBo_ICD", "PhuKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "Mat_PhanLoai",
    cb: "Mat_ChuaPhatHienBatThuong",
    icds: [ "Mat_ChanDoanSoBo_ICD", "Mat_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TMH_PhanLoai",
    cb: "TMH_ChuaPhatHienBatThuong",
    icds: [ "TMH_ChanDoanSoBo_ICD", "TMH_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "RHM_PhanLoai",
    cb: "RHM_ChuaPhatHienBatThuong",
    icds: [ "RHM_ChanDoanSoBo_ICD", "RHM_ChanDoanXacDinh_ICD" ]
  } ];
  var _m14SyncGuard = false;
  function m14GetSelectedLabel(radioContainerCls) {
    var container = document.querySelector("." + radioContainerCls);
    if (!container) return null;
    var selected = container.querySelector(".dx-list-item-selected .dx-item-content.dx-list-item-content");
    return selected ? (selected.textContent || "").trim() : null;
  }
  function m14SelectLoaiI(radioContainerCls) {
    var container = document.querySelector("." + radioContainerCls);
    if (!container) return;
    var items = container.querySelectorAll('.dx-item.dx-list-item[role="option"]');
    for (var i = 0; i < items.length; i++) {
      var lbl = items[i].querySelector(".dx-item-content.dx-list-item-content");
      if (lbl && (lbl.textContent || "").trim() === "Loại I") {
        if (!items[i].classList.contains("dx-list-item-selected")) {
          pointerClick(items[i]);
          var icon = items[i].querySelector(".dx-radiobutton-icon");
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
      var cb = document.querySelector("." + spec.cb + ' dx-check-box[role="checkbox"]');
      if (selectedLabel === "Loại I") {
        spec.icds.forEach(function(cls) {
          clearTagBox(cls);
        });
        if (cb && cb.getAttribute("aria-checked") !== "true") tickCheckbox(cb);
      } else {
        if (cb && cb.getAttribute("aria-checked") === "true") untickCheckbox(cb);
        spec.icds.forEach(function(cls) {
          clearTagBox(cls);
        });
      }
    } finally {
      setTimeout(function() {
        _m14SyncGuard = false;
      }, 50);
    }
  }
  function m14SyncFromCheckbox(spec, checked) {
    if (_m14SyncGuard) return;
    _m14SyncGuard = true;
    try {
      if (checked) {
        spec.icds.forEach(function(cls) {
          clearTagBox(cls);
        });
        m14SelectLoaiI(spec.radio);
      } else {
        var current = m14GetSelectedLabel(spec.radio);
        if (current === "Loại I") {
          var container = document.querySelector("." + spec.radio);
          if (container) {
            var sel = container.querySelector(".dx-list-item-selected");
            if (sel) pointerClick(sel);
          }
        }
      }
    } finally {
      setTimeout(function() {
        _m14SyncGuard = false;
      }, 50);
    }
  }
  function setupM14Sync() {
    if (window.location.href.indexOf("KNCT_ThongTinKham") === -1) return;
    M14_SPECIALTIES.forEach(function(spec) {
      var radioContainer = document.querySelector("." + spec.radio);
      var cbContainer = document.querySelector("." + spec.cb);
      if (!radioContainer || !cbContainer) return;
      radioContainer.addEventListener("click", function(e) {
        var item = e.target.closest('.dx-item.dx-list-item[role="option"]');
        if (!item) return;
        setTimeout(function() {
          var lbl = m14GetSelectedLabel(spec.radio);
          if (lbl) m14SyncFromRadio(spec, lbl);
        }, 80);
      }, true);
      cbContainer.addEventListener("click", function() {
        setTimeout(function() {
          var cb = cbContainer.querySelector('dx-check-box[role="checkbox"]');
          if (!cb) return;
          var isChecked = cb.getAttribute("aria-checked") === "true";
          m14SyncFromCheckbox(spec, isChecked);
        }, 80);
      }, true);
    });
  }
  var _m14SyncSetup = false;
  var m14SyncObserver = new MutationObserver(function() {
    if (_m14SyncSetup) return;
    if (window.location.href.indexOf("KNCT_ThongTinKham") === -1) return;
    if (!document.querySelector(".NoiKhoa_PhanLoai")) return;
    _m14SyncSetup = true;
    m14SyncObserver.disconnect();
    setupM14Sync();
  });
  m14SyncObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  var M13_SPECIALTIES = [ {
    radio: "NoiKhoa_PhanLoai",
    cb: "NoiKhoa_ChuaPhatHienBatThuong",
    icds: [ "NoiKhoa_ChanDoanSoBo_ICD", "NoiKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "HoHap_PhanLoai",
    cb: "HoHap_ChuaPhatHienBatThuong",
    icds: [ "HoHap_ChanDoanSoBo_ICD", "HoHap_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TieuHoa_PhanLoai",
    cb: "TieuHoa_ChuaPhatHienBatThuong",
    icds: [ "TieuHoa_ChanDoanSoBo_ICD", "TieuHoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "ThanTietNieu_PhanLoai",
    cb: "ThanTietNieu_ChuaPhatHienBatThuong",
    icds: [ "ThanTietNieu_ChanDoanSoBo_ICD", "ThanTietNieu_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "NoiTiet_PhanLoai",
    cb: "NoiTiet_ChuaPhatHienBatThuong",
    icds: [ "NoiTiet_ChanDoanSoBo_ICD", "NoiTiet_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TamThan_PhanLoai",
    cb: "TamThan_ChuaPhatHienBatThuong",
    icds: [ "TamThan_ChanDoanSoBo_ICD", "TamThan_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "CoXuongKhop_PhanLoai",
    cb: "CoXuongKhop_ChuaPhatHienBatThuong",
    icds: [ "CoXuongKhop_ChanDoanSoBo_ICD", "CoXuongKhop_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "ThanKinh_PhanLoai",
    cb: "ThanKinh_ChuaPhatHienBatThuong",
    icds: [ "ThanKinh_ChanDoanSoBo_ICD", "ThanKinh_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "NgoaiKhoa_PhanLoai",
    cb: "NgoaiKhoa_ChuaPhatHienBatThuong",
    icds: [ "NgoaiKhoa_ChanDoanSoBo_ICD", "NgoaiKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "DaLieu_PhanLoai",
    cb: "DaLieu_ChuaPhatHienBatThuong",
    icds: [ "DaLieu_ChanDoanSoBo_ICD", "DaLieu_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "SanKhoa_PhanLoai",
    cb: "SanKhoa_ChuaPhatHienBatThuong",
    icds: [ "SanKhoa_ChanDoanSoBo_ICD", "SanKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "PhuKhoa_PhanLoai",
    cb: "PhuKhoa_ChuaPhatHienBatThuong",
    icds: [ "PhuKhoa_ChanDoanSoBo_ICD", "PhuKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "Mat_PhanLoai",
    cb: "Mat_ChuaPhatHienBatThuong",
    icds: [ "Mat_ChanDoanSoBo_ICD", "Mat_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TMH_PhanLoai",
    cb: "TMH_ChuaPhatHienBatThuong",
    icds: [ "TMH_ChanDoanSoBo_ICD", "TMH_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "RHM_PhanLoai",
    cb: "RHM_ChuaPhatHienBatThuong",
    icds: [ "RHM_ChanDoanSoBo_ICD", "RHM_ChanDoanXacDinh_ICD" ]
  } ];
  var _m13SyncGuard = false;
  function m13GetSelectedLabel(radioContainerCls) {
    var container = document.querySelector("." + radioContainerCls);
    if (!container) return null;
    var selected = container.querySelector(".dx-list-item-selected .dx-item-content.dx-list-item-content");
    return selected ? (selected.textContent || "").trim() : null;
  }
  function m13SelectLoaiI(radioContainerCls) {
    var container = document.querySelector("." + radioContainerCls);
    if (!container) return;
    var items = container.querySelectorAll('.dx-item.dx-list-item[role="option"]');
    for (var i = 0; i < items.length; i++) {
      var lbl = items[i].querySelector(".dx-item-content.dx-list-item-content");
      if (lbl && (lbl.textContent || "").trim() === "Loại I") {
        if (!items[i].classList.contains("dx-list-item-selected")) {
          pointerClick(items[i]);
          var icon = items[i].querySelector(".dx-radiobutton-icon");
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
      var cb = document.querySelector("." + spec.cb + ' dx-check-box[role="checkbox"]');
      if (selectedLabel === "Loại I") {
        spec.icds.forEach(function(cls) {
          clearTagBox(cls);
        });
        if (cb && cb.getAttribute("aria-checked") !== "true") tickCheckbox(cb);
      } else {
        if (cb && cb.getAttribute("aria-checked") === "true") untickCheckbox(cb);
        spec.icds.forEach(function(cls) {
          clearTagBox(cls);
        });
      }
    } finally {
      setTimeout(function() {
        _m13SyncGuard = false;
      }, 50);
    }
  }
  function m13SyncFromCheckbox(spec, checked) {
    if (_m13SyncGuard) return;
    _m13SyncGuard = true;
    try {
      if (checked) {
        spec.icds.forEach(function(cls) {
          clearTagBox(cls);
        });
        m13SelectLoaiI(spec.radio);
      } else {
        var current = m13GetSelectedLabel(spec.radio);
        if (current === "Loại I") {
          var container = document.querySelector("." + spec.radio);
          if (container) {
            var sel = container.querySelector(".dx-list-item-selected");
            if (sel) pointerClick(sel);
          }
        }
      }
    } finally {
      setTimeout(function() {
        _m13SyncGuard = false;
      }, 50);
    }
  }
  function setupM13Sync() {
    if (window.location.href.indexOf("KSKDK_ThongTinKham") === -1) return;
    M13_SPECIALTIES.forEach(function(spec) {
      var radioContainer = document.querySelector("." + spec.radio);
      var cbContainer = document.querySelector("." + spec.cb);
      if (!radioContainer || !cbContainer) return;
      radioContainer.addEventListener("click", function(e) {
        var item = e.target.closest('.dx-item.dx-list-item[role="option"]');
        if (!item) return;
        setTimeout(function() {
          var lbl = m13GetSelectedLabel(spec.radio);
          if (lbl) m13SyncFromRadio(spec, lbl);
        }, 80);
      }, true);
      cbContainer.addEventListener("click", function() {
        setTimeout(function() {
          var cb = cbContainer.querySelector('dx-check-box[role="checkbox"]');
          if (!cb) return;
          var isChecked = cb.getAttribute("aria-checked") === "true";
          m13SyncFromCheckbox(spec, isChecked);
        }, 80);
      }, true);
    });
  }
  var _m13SyncSetup = false;
  var m13SyncObserver = new MutationObserver(function() {
    if (_m13SyncSetup) return;
    if (window.location.href.indexOf("KSKDK_ThongTinKham") === -1) return;
    if (!document.querySelector(".NoiKhoa_PhanLoai")) return;
    _m13SyncSetup = true;
    m13SyncObserver.disconnect();
    setupM13Sync();
  });
  m13SyncObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  var VL_SPECIALTIES = [ {
    radio: "TuanHoan_PhanLoai",
    cb: "TuanHoan_ChuaPhatHienBatThuong",
    icds: [ "TuanHoan_ChanDoanSoBo_ICD", "TuanHoan_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "HoHap_PhanLoai",
    cb: "HoHap_ChuaPhatHienBatThuong",
    icds: [ "HoHap_ChanDoanSoBo_ICD", "HoHap_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TieuHoa_PhanLoai",
    cb: "TieuHoa_ChuaPhatHienBatThuong",
    icds: [ "TieuHoa_ChanDoanSoBo_ICD", "TieuHoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "ThanTietNieu_PhanLoai",
    cb: "ThanTietNieu_ChuaPhatHienBatThuong",
    icds: [ "ThanTietNieu_ChanDoanSoBo_ICD", "ThanTietNieu_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "NoiTiet_PhanLoai",
    cb: "NoiTiet_ChuaPhatHienBatThuong",
    icds: [ "NoiTiet_ChanDoanSoBo_ICD", "NoiTiet_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "CoXuongKhop_PhanLoai",
    cb: "CoXuongKhop_ChuaPhatHienBatThuong",
    icds: [ "CoXuongKhop_ChanDoanSoBo_ICD", "CoXuongKhop_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "ThanKinh_PhanLoai",
    cb: "ThanKinh_ChuaPhatHienBatThuong",
    icds: [ "ThanKinh_ChanDoanSoBo_ICD", "ThanKinh_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TamThan_PhanLoai",
    cb: "TamThan_ChuaPhatHienBatThuong",
    icds: [ "TamThan_ChanDoanSoBo_ICD", "TamThan_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "NgoaiKhoa_PhanLoai",
    cb: "NgoaiKhoa_ChuaPhatHienBatThuong",
    icds: [ "NgoaiKhoa_ChanDoanSoBo_ICD", "NgoaiKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "DaLieu_PhanLoai",
    cb: "DaLieu_ChuaPhatHienBatThuong",
    icds: [ "DaLieu_ChanDoanSoBo_ICD", "DaLieu_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "SanKhoa_PhanLoai",
    cb: "SanKhoa_ChuaPhatHienBatThuong",
    icds: [ "SanKhoa_ChanDoanSoBo_ICD", "SanKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "PhuKhoa_PhanLoai",
    cb: "PhuKhoa_ChuaPhatHienBatThuong",
    icds: [ "PhuKhoa_ChanDoanSoBo_ICD", "PhuKhoa_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "Mat_PhanLoai",
    cb: "Mat_ChuaPhatHienBatThuong",
    icds: [ "Mat_ChanDoanSoBo_ICD", "Mat_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "TMH_PhanLoai",
    cb: "TMH_ChuaPhatHienBatThuong",
    icds: [ "TMH_ChanDoanSoBo_ICD", "TMH_ChanDoanXacDinh_ICD" ]
  }, {
    radio: "RHM_PhanLoai",
    cb: "RHM_ChuaPhatHienBatThuong",
    icds: [ "RHM_ChanDoanSoBo_ICD", "RHM_ChanDoanXacDinh_ICD" ]
  } ];
  function setupVLSync() {
    VL_SPECIALTIES.forEach(function(spec) {
      var radioContainer = document.querySelector("." + spec.radio);
      var cbContainer = document.querySelector("." + spec.cb);
      if (!radioContainer || !cbContainer) return;
      radioContainer.addEventListener("click", function(e) {
        var item = e.target.closest('.dx-item.dx-list-item[role="option"]');
        if (!item) return;
        setTimeout(function() {
          var lbl = m13GetSelectedLabel(spec.radio);
          if (lbl) m13SyncFromRadio(spec, lbl);
        }, 80);
      }, true);
      cbContainer.addEventListener("click", function() {
        setTimeout(function() {
          var cb = cbContainer.querySelector('dx-check-box[role="checkbox"]');
          if (!cb) return;
          var isChecked = cb.getAttribute("aria-checked") === "true";
          m13SyncFromCheckbox(spec, isChecked);
        }, 80);
      }, true);
    });
  }
  var _vl_SyncSetup = false;
  var vlSyncObserver = new MutationObserver(function() {
    if (_vl_SyncSetup) return;
    if (window.location.href.indexOf("kskdk_thongtinkhamtren18") === -1) return;
    if (!document.querySelector(".TuanHoan_PhanLoai")) return;
    _vl_SyncSetup = true;
    vlSyncObserver.disconnect();
    setupVLSync();
  });
  vlSyncObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  var _wrapperHidden = false;
  document.addEventListener("keydown", function(e) {
    if (!e.shiftKey || e.key !== "A") return;
    _wrapperHidden = !_wrapperHidden;
    document.querySelectorAll("#" + WRAPPER_ID).forEach(function(w) {
      w.style.display = _wrapperHidden ? "none" : "inline-flex";
    });
    if (_wrapperHidden) {
      var menu = document.getElementById(MENU_ID);
      if (menu) menu.style.display = "none";
      closeSubmenu();
    }
  });
  function showToast(msg, type) {
    var old = document.getElementById("_medinet_toast");
    if (old) old.remove();
    var toast = document.createElement("div");
    toast.id = "_medinet_toast";
    toast.textContent = msg;
    var bg = type === "error" ? "#c0392b" : type === "success" ? "#27ae60" : type === "warn" ? "#e67e22" : "#323232";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "90px",
      right: "24px",
      zIndex: "2147483000",
      padding: "10px 16px",
      background: bg,
      color: "#fff",
      borderRadius: "6px",
      fontSize: "13px",
      fontFamily: "Segoe UI, Arial, sans-serif",
      boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
      opacity: "1",
      transition: "opacity 0.5s",
      maxWidth: "360px"
    });
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = "0";
    }, 2800);
    setTimeout(function() {
      toast.remove();
    }, 3400);
  }
  scanAndInject();
  [ 200, 600, 1200, 2500 ].forEach(function(ms) {
    setTimeout(scanAndInject, ms);
  });
  (function autoCheckUpdate() {
    var AUTO_UPDATE_KEY = "_mtt_auto_update";
    var META_URL = "https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.meta.js";
    var RAW_URL = "https://raw.githubusercontent.com/Guitar72/medinet-autofill/refs/heads/main/Medinet.user.js";
    var CURRENT_VERSION = typeof GM_info !== "undefined" && GM_info.script && GM_info.script.version || "8.0";
    try {
      if (localStorage.getItem(AUTO_UPDATE_KEY) !== "1") return;
    } catch (e) {
      return;
    }
    function extractVersion(text) {
      var m = text.match(/@version\s+([\S]+)/);
      return m ? m[1] : null;
    }
    function versionGt(a, b) {
      var pa = a.split(".").map(Number);
      var pb = b.split(".").map(Number);
      for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
        var na = pa[i] || 0, nb = pb[i] || 0;
        if (na > nb) return true;
        if (na < nb) return false;
      }
      return false;
    }
    function escHtml(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function extractChangelog(text) {
      var block = text.match(/==Changelog==([\s\S]*?)==\/Changelog==/);
      if (!block) return [];
      var entries = [];
      block[1].split("\n").forEach(function(line) {
        var m = line.match(/^\s*\/\/\s*([\d.]+)\s*\|\s*([^|]*)\|\s*(.+?)\s*$/);
        if (m) entries.push({
          version: m[1],
          date: m[2].trim(),
          desc: m[3].trim()
        });
      });
      return entries;
    }
    function buildChangelogHtml(entries, curVer) {
      var newer = entries.filter(function(e) {
        return versionGt(e.version, curVer);
      });
      if (!newer.length) return "";
      return newer.map(function(e) {
        var items = e.desc.split("•").map(function(s) {
          return s.trim();
        }).filter(Boolean);
        return '<div style="margin-bottom:10px">' + '<div style="font-weight:700;color:#0369a1;font-size:13px;margin-bottom:4px">' + "🆕 v" + escHtml(e.version) + (e.date ? " — " + escHtml(e.date) : "") + "</div>" + '<ul style="margin:0;padding-left:18px;font-size:13.5px;color:#374151;line-height:1.7">' + items.map(function(it) {
          return "<li>" + escHtml(it) + "</li>";
        }).join("") + "</ul>" + "</div>";
      }).join("");
    }
    var xhr = new XMLHttpRequest;
    xhr.open("GET", META_URL + "?t=" + Date.now(), true);
    xhr.timeout = 1e4;
    xhr.onload = function() {
      if (xhr.status !== 200) return;
      var remoteVer = extractVersion(xhr.responseText);
      if (!remoteVer || !versionGt(remoteVer, CURRENT_VERSION)) return;
      var overlay2 = document.createElement("div");
      Object.assign(overlay2.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9999999",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Segoe UI, Arial, sans-serif",
        backdropFilter: "blur(5px)"
      });
      var card2 = document.createElement("div");
      Object.assign(card2.style, {
        background: "#fff",
        borderRadius: "20px",
        width: "440px",
        maxWidth: "94vw",
        boxShadow: "0 30px 70px rgba(0,0,0,0.4)",
        overflow: "hidden",
        position: "relative",
        animation: "mtt_popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)"
      });
      if (!document.getElementById("_mtt_anim")) {
        var st = document.createElement("style");
        st.id = "_mtt_anim";
        st.textContent = "@keyframes mtt_popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}";
        document.head.appendChild(st);
      }
      var hdr2 = document.createElement("div");
      Object.assign(hdr2.style, {
        background: "linear-gradient(135deg,#0369a1 0%,#0ea5e9 100%)",
        padding: "24px 28px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      });
      hdr2.innerHTML = '<div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">🔄</div>' + "<div>" + '<div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.3px">Có phiên bản mới!</div>' + '<div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:3px">Medinet Script — phiên bản <b style="background:rgba(255,255,255,0.25);padding:2px 10px;border-radius:20px">' + remoteVer + "</b> sẵn sàng</div>" + "</div>";
      var closeX = document.createElement("button");
      closeX.innerHTML = "&times;";
      Object.assign(closeX.style, {
        position: "absolute",
        top: "14px",
        right: "16px",
        background: "rgba(255,255,255,0.2)",
        border: "none",
        color: "#fff",
        fontSize: "22px",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        cursor: "pointer",
        lineHeight: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      });
      closeX.addEventListener("click", function() {
        overlay2.remove();
      });
      closeX.addEventListener("mouseenter", function() {
        closeX.style.background = "rgba(255,255,255,0.35)";
      });
      closeX.addEventListener("mouseleave", function() {
        closeX.style.background = "rgba(255,255,255,0.2)";
      });
      var body2 = document.createElement("div");
      Object.assign(body2.style, {
        padding: "24px 28px 20px"
      });
      var verRow = document.createElement("div");
      Object.assign(verRow.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "20px",
        background: "#f8fafc",
        borderRadius: "12px",
        padding: "14px",
        border: "1px solid #e2e8f0"
      });
      verRow.innerHTML = '<div style="text-align:center">' + '<div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Hiện tại</div>' + '<div style="font-size:20px;font-weight:700;color:#64748b">' + CURRENT_VERSION + "</div>" + "</div>" + '<div style="font-size:24px;color:#0ea5e9">&#8594;</div>' + '<div style="text-align:center">' + '<div style="font-size:12px;color:#0369a1;margin-bottom:4px">Phìiên bản mới</div>' + '<div style="font-size:24px;font-weight:800;color:#0369a1">' + remoteVer + "</div>" + "</div>";
      body2.appendChild(verRow);
      var clHtml2 = buildChangelogHtml(extractChangelog(xhr.responseText), CURRENT_VERSION);
      if (clHtml2) {
        var changelogBox2 = document.createElement("div");
        Object.assign(changelogBox2.style, {
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "14px 16px",
          marginBottom: "18px",
          maxHeight: "220px",
          overflowY: "auto"
        });
        changelogBox2.innerHTML = clHtml2;
        body2.appendChild(changelogBox2);
      }
      var guideBox = document.createElement("div");
      Object.assign(guideBox.style, {
        display: "none",
        background: "#f0fdf4",
        border: "2px solid #86efac",
        borderRadius: "12px",
        padding: "16px 18px",
        marginBottom: "16px"
      });
      guideBox.innerHTML = '<div style="font-size:15px;font-weight:700;color:#15803d;margin-bottom:10px">✅ URL đã copy!</div>' + '<div style="font-size:15px;color:#166534;line-height:2.2">' + '<b style="display:inline-block;background:#bbf7d0;border-radius:6px;padding:1px 8px;margin-right:6px">1</b>Nhấn vào nút bên dưới<br>' + '<b style="display:inline-block;background:#bbf7d0;border-radius:6px;padding:1px 8px;margin-right:6px">2</b>Dán vào ô <b>“Cài từ URL”</b> và nhấn <b>“Cài đặt”</b><br>' + '<b style="display:inline-block;background:#bbf7d0;border-radius:6px;padding:1px 8px;margin-right:6px">3</b>Reload lại trang web <b>(F5)</b>' + "</div>";
      var tmBtn2 = document.createElement("button");
      tmBtn2.textContent = "Nhấn vào đây";
      Object.assign(tmBtn2.style, {
        display: "block",
        width: "100%",
        padding: "10px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "14px",
        marginTop: "12px"
      });
      tmBtn2.addEventListener("click", function() {
        try {
          GM_openInTab("chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=utils", false);
        } catch (e) {}
      });
      guideBox.appendChild(tmBtn2);
      body2.appendChild(guideBox);
      var installBtn2 = document.createElement("button");
      installBtn2.innerHTML = "⬇️ &nbsp;Cài đặt phiên bản mới";
      Object.assign(installBtn2.style, {
        display: "block",
        width: "100%",
        padding: "15px",
        background: "linear-gradient(135deg,#16a34a,#15803d)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "17px",
        fontWeight: "800",
        cursor: "pointer",
        marginBottom: "10px",
        letterSpacing: "0.2px",
        boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
        transition: "transform 0.1s, filter 0.1s"
      });
      installBtn2.addEventListener("mouseenter", function() {
        installBtn2.style.filter = "brightness(1.08)";
        installBtn2.style.transform = "translateY(-2px)";
      });
      installBtn2.addEventListener("mouseleave", function() {
        installBtn2.style.filter = "";
        installBtn2.style.transform = "";
      });
      installBtn2.addEventListener("click", function() {
        try {
          GM_setClipboard(RAW_URL);
        } catch (e) {
          try {
            var ta = document.createElement("textarea");
            ta.value = RAW_URL;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          } catch (e2) {}
        }
        installBtn2.style.display = "none";
        guideBox.style.display = "block";
      });
      body2.appendChild(installBtn2);
      var dismiss2 = document.createElement("button");
      dismiss2.textContent = "Bỏ qua, nhắc lần sau";
      Object.assign(dismiss2.style, {
        display: "block",
        width: "100%",
        padding: "11px",
        background: "none",
        color: "#94a3b8",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s"
      });
      dismiss2.addEventListener("mouseenter", function() {
        dismiss2.style.color = "#64748b";
        dismiss2.style.borderColor = "#cbd5e1";
      });
      dismiss2.addEventListener("mouseleave", function() {
        dismiss2.style.color = "#94a3b8";
        dismiss2.style.borderColor = "#e2e8f0";
      });
      dismiss2.addEventListener("click", function() {
        overlay2.remove();
      });
      body2.appendChild(dismiss2);
      card2.appendChild(hdr2);
      card2.appendChild(closeX);
      card2.appendChild(body2);
      overlay2.appendChild(card2);
      overlay2.addEventListener("click", function(e) {
        if (e.target === overlay2) overlay2.remove();
      });
      document.body.appendChild(overlay2);
    };
    xhr.send();
  })();
  (function() {
    var PHAN_LOAI_MAP = {
      NoiKhoa_PhanLoai: "NoiKhoa_ChuaPhatHienBatThuong",
      Mat_PhanLoai: "Mat_ChuaPhatHienBatThuong",
      RHM_PhanLoai: "RHM_ChuaPhatHienBatThuong",
      TMH_PhanLoai: "TMH_ChuaPhatHienBatThuong",
      ThanKinh_PhanLoai: "ThanKinh_ChuaPhatHienBatThuong",
      TamThan_PhanLoai: "TamThan_ChuaPhatHienBatThuong"
    };
    function getSelectedLabel(plContainer) {
      var checked = plContainer.querySelector('.dx-item.dx-list-item[role="option"] .dx-list-select-radiobutton[aria-checked="true"]');
      if (!checked) return null;
      var item = checked.closest('.dx-item.dx-list-item[role="option"]');
      if (!item) return null;
      var lbl = item.querySelector(".dx-item-content.dx-list-item-content");
      return lbl ? (lbl.textContent || "").trim() : null;
    }
    function syncChuaPhatHien(plCls, cbtCls) {
      var plEl = document.querySelector("." + plCls);
      var cbtEl = document.querySelector("." + cbtCls);
      if (!plEl || !cbtEl) return;
      var label = getSelectedLabel(plEl);
      if (!label) return;
      var cb = cbtEl.querySelector('dx-check-box[role="checkbox"]');
      if (!cb) return;
      if (label === "Loại I") {
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
      obs.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: [ "aria-checked" ]
      });
    }
    if (document.body) {
      startObserver();
    } else {
      document.addEventListener("DOMContentLoaded", startObserver);
    }
  })();
})();
