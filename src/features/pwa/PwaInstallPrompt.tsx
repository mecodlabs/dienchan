import React from 'react';
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  PlusSquare,
  Share,
  Smartphone,
  X,
} from 'lucide-react';
import type { PwaInstallState } from './usePwaInstall';

interface PwaInstallPromptProps {
  pwa: PwaInstallState;
}

type IosTab = 'safari' | 'chrome';

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ pwa }) => {
  const [iosTab, setIosTab] = React.useState<IosTab>(() =>
    pwa.iosBrowser === 'chrome' ? 'chrome' : 'safari'
  );

  React.useEffect(() => {
    if (pwa.showGuideModal && pwa.isIos) {
      setIosTab(pwa.iosBrowser === 'chrome' ? 'chrome' : 'safari');
    }
  }, [pwa.showGuideModal, pwa.isIos, pwa.iosBrowser]);

  return (
    <>
      {/* Subtle Top Mobile Banner (sits cleanly below header, never overlaps bottom dock or zoom controls) */}
      {pwa.showAutoBanner && !pwa.showGuideModal && (
        <div className="relative z-25 flex shrink-0 items-center justify-between gap-2.5 border-b border-[#1B6B46]/20 bg-[#1B6B46]/8 px-3.5 py-2 lg:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src="/icons/icon-192.png"
              alt="Diện Chẩn Atlas"
              className="h-8 w-8 shrink-0 rounded-lg shadow-2xs"
            />
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-[#0F3D27]">
                Thêm vào màn hình chính
              </div>
              <div className="truncate text-[11px] text-[#1B4332]">
                {pwa.canNativeInstall
                  ? 'Mở nhanh toàn màn hình, tra cứu offline'
                  : 'Mở như app, không vướng thanh địa chỉ'}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => void pwa.triggerInstall()}
              className="inline-flex items-center gap-1 rounded-xl bg-[#1B6B46] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition active:bg-[#145235]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{pwa.canNativeInstall ? 'Cài ngay' : 'Hướng dẫn'}</span>
            </button>
            <button
              type="button"
              onClick={pwa.dismissAutoBanner}
              aria-label="Ẩn gợi ý cài đặt ứng dụng"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5B656E] hover:bg-white/70 hover:text-[#1A2229]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Install Guide Modal (for iOS Safari & Chrome, In-App Browsers, or Manual Install) */}
      {pwa.showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:items-center"
          onClick={pwa.closeGuideModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#E2DDD5] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:pb-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/icon-192.png"
                  alt="Diện Chẩn Atlas"
                  className="h-11 w-11 shrink-0 rounded-2xl shadow-sm"
                />
                <div>
                  <h2 id="pwa-install-title" className="text-base font-bold text-[#1A2229]">
                    Thêm Diện Chẩn vào màn hình chính
                  </h2>
                  <p className="text-xs text-[#5B656E]">
                    Mở nhanh 1 chạm, toàn màn hình & dùng được khi mất mạng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={pwa.closeGuideModal}
                aria-label="Đóng hướng dẫn cài đặt"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F1EFEA] text-[#1A2229] hover:bg-[#E6E2DA]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* In-App Browser Warning (Zalo / Facebook / Messenger) */}
            {pwa.isInAppBrowser && (
              <div className="mt-3.5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" />
                <span>
                  Bạn đang mở link bên trong Zalo / Facebook. Hãy bấm nút <strong>⋯</strong> chọn{' '}
                  <strong>Mở bằng {pwa.isIos ? 'Safari hoặc Chrome' : 'Chrome'}</strong> trước, rồi làm theo hướng dẫn bên dưới.
                </span>
              </div>
            )}

            {/* Step-by-step instructions tailored to iOS (Safari + Chrome) vs Android/Desktop */}
            {pwa.isIos ? (
              <div className="mt-4 space-y-3">
                {/* Browser Switcher on iPhone/iPad (auto-selects current browser) */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F2F0EC] p-1">
                  <button
                    type="button"
                    onClick={() => setIosTab('safari')}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                      iosTab === 'safari'
                        ? 'bg-white text-[#1A2229] shadow-2xs'
                        : 'text-[#5B656E] hover:text-[#1A2229]'
                    }`}
                  >
                    Safari (iPhone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIosTab('chrome')}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                      iosTab === 'chrome'
                        ? 'bg-white text-[#1A2229] shadow-2xs'
                        : 'text-[#5B656E] hover:text-[#1A2229]'
                    }`}
                  >
                    Chrome (iPhone)
                  </button>
                </div>

                <ol className="space-y-3 text-xs leading-relaxed text-[#2F3A42]">
                  {/* STEP 1: Find Share Icon with Visual Bar Mockup */}
                  <li className="rounded-2xl border border-[#E6E2DA] bg-[#F9F8F6] p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1B6B46] font-mono text-xs font-bold text-white">
                        1
                      </span>
                      <div>
                        <div className="font-bold text-[#1A2229]">
                          Tìm & chạm biểu tượng Chia sẻ{' '}
                          <span className="mx-0.5 inline-flex items-center rounded border border-[#1B6B46]/40 bg-white px-1 py-0.5 align-middle text-[#1B6B46]">
                            <Share className="h-3 w-3" />
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#5B656E]">
                          {iosTab === 'safari'
                            ? 'Nằm ở chính giữa thanh công cụ phía dưới cùng màn hình Safari (ô vuông có mũi tên chỉ lên).'
                            : 'Nằm ở góc trên bên phải thanh địa chỉ Chrome — ngay cạnh tên miền trang web (ô vuông có mũi tên chỉ lên).'}
                        </p>
                      </div>
                    </div>

                    {/* Visual Mini-Mockup showing exact Share icon position */}
                    {iosTab === 'safari' ? (
                      <div className="mt-2.5 rounded-xl border border-[#E2DDD5] bg-white px-3 py-2">
                        <div className="mb-1 text-center text-[10px] font-medium text-[#7A858E]">
                          Thanh công cụ dưới cùng của Safari
                        </div>
                        <div className="flex items-center justify-between px-2 text-[#8A949C]">
                          <ChevronLeft className="h-4 w-4" />
                          <ChevronRight className="h-4 w-4 opacity-40" />
                          <span className="inline-flex items-center gap-1 rounded-lg border-2 border-[#C63131] bg-[#C63131]/10 px-2.5 py-1 text-[11px] font-bold text-[#C63131]">
                            <Share className="h-3.5 w-3.5" />
                            <span>Bấm ở đây</span>
                          </span>
                          <span className="h-3.5 w-3.5 rounded-xs border border-current opacity-50" />
                          <span className="h-3.5 w-3.5 rounded-xs border border-current opacity-50" />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5 rounded-xl border border-[#E2DDD5] bg-white px-2.5 py-2">
                        <div className="mb-1 text-center text-[10px] font-medium text-[#7A858E]">
                          Thanh địa chỉ phía trên của Chrome
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-[#F2F0EC] px-2.5 py-1.5">
                          <span className="truncate font-mono text-[10px] text-[#5B656E]">
                            dien-chan-atlas-404.pages.dev
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border-2 border-[#C63131] bg-white px-2 py-0.5 text-[11px] font-bold text-[#C63131]">
                            <Share className="h-3.5 w-3.5" />
                            <span>Bấm ở đây</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </li>

                  {/* STEP 2: Scroll down Share Sheet to find Add to Home Screen */}
                  <li className="rounded-2xl border border-[#E6E2DA] bg-[#F9F8F6] p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1B6B46] font-mono text-xs font-bold text-white">
                        2
                      </span>
                      <div>
                        <div className="font-bold text-[#1A2229]">
                          Kéo xuống danh sách để tìm “Thêm vào MH chính”
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#5B656E]">
                          Bảng Chia sẻ sẽ trượt từ dưới lên. <strong>Vuốt bảng lên trên</strong> (kéo qua hàng icon Zalo, Tin nhắn, Sao chép…) sẽ thấy dòng <strong>Thêm vào MH chính</strong> (<em>Add to Home Screen</em>).
                        </p>
                      </div>
                    </div>

                    {/* Visual Mini-Mockup of iOS Share Sheet menu */}
                    <div className="mt-2.5 space-y-1.5 rounded-xl border border-[#E2DDD5] bg-white p-2.5">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#7A858E]">
                        <ArrowDown className="h-3 w-3" />
                        <span>Kéo xuống dưới hàng Sao chép / Đánh dấu…</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border-2 border-[#1B6B46] bg-[#1B6B46]/10 px-3 py-2 text-xs font-bold text-[#0F3D27]">
                        <span>Thêm vào MH chính</span>
                        <PlusSquare className="h-4 w-4 text-[#1B6B46]" />
                      </div>
                    </div>
                  </li>

                  {/* STEP 3: Confirm Add */}
                  <li className="flex items-start gap-2.5 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F6] p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1B6B46] font-mono text-xs font-bold text-white">
                      3
                    </span>
                    <div className="pt-0.5">
                      Bấm nút <strong className="text-[#1A2229]">Thêm</strong> (<em>Add</em>) ở góc trên bên phải — biểu tượng <strong>Diện Chẩn</strong> sẽ xuất hiện ngay trên màn hình chính.
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              <ol className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#2F3A42]">
                <li className="flex items-start gap-3 rounded-2xl bg-[#F9F8F6] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#1B6B46]/12 font-mono text-xs font-bold text-[#145235]">
                    1
                  </span>
                  <div className="pt-0.5">
                    Mở biểu tượng menu trình duyệt (<strong>⋮</strong> ở góc trên bên phải Chrome / Edge).
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-[#F9F8F6] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#1B6B46]/12 font-mono text-xs font-bold text-[#145235]">
                    2
                  </span>
                  <div className="pt-0.5">
                    Chọn{' '}
                    <span className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-[#DDD8CE] bg-white px-1.5 py-0.5 font-semibold text-[#1A2229]">
                      <Smartphone className="h-3.5 w-3.5 text-[#1B6B46]" />
                      Cài đặt ứng dụng
                    </span>{' '}
                    hoặc <strong>Thêm vào màn hình chính</strong> rồi xác nhận.
                  </div>
                </li>
              </ol>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              {pwa.canNativeInstall && (
                <button
                  type="button"
                  onClick={() => void pwa.triggerInstall()}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1B6B46] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#155739]"
                >
                  <Download className="h-4 w-4" />
                  <span>Cài đặt ngay</span>
                </button>
              )}
              <button
                type="button"
                onClick={pwa.closeGuideModal}
                className="rounded-xl border border-[#DDD8CE] bg-[#F9F8F6] px-4 py-2.5 text-xs font-semibold text-[#1A2229] hover:bg-[#EFECE7]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
