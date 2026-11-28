import React from 'react';
import {
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

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ pwa }) => {
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

      {/* Install Guide Modal (for iOS Safari 2-step flow, In-App Browsers, or Manual Install) */}
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
            className="w-full max-w-md rounded-3xl border border-[#E2DDD5] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:pb-5"
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
                  Bạn đang mở liên kết bên trong ứng dụng (Zalo / Facebook). Hãy chọn{' '}
                  <strong>Mở bằng {pwa.isIos ? 'Safari' : 'Chrome'}</strong> ở góc màn hình trước, sau đó làm theo hướng dẫn bên dưới.
                </span>
              </div>
            )}

            {/* Step-by-step instructions tailored to iOS vs Android/Desktop */}
            {pwa.isIos ? (
              <ol className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#2F3A42]">
                <li className="flex items-start gap-3 rounded-2xl bg-[#F9F8F6] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#1B6B46]/12 font-mono text-xs font-bold text-[#145235]">
                    1
                  </span>
                  <div className="pt-0.5">
                    Chạm biểu tượng{' '}
                    <span className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-[#DDD8CE] bg-white px-1.5 py-0.5 font-semibold text-[#1A2229]">
                      <Share className="h-3.5 w-3.5 text-[#1B6B46]" />
                      Chia sẻ
                    </span>{' '}
                    ở thanh công cụ phía dưới của trình duyệt <strong>Safari</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-[#F9F8F6] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#1B6B46]/12 font-mono text-xs font-bold text-[#145235]">
                    2
                  </span>
                  <div className="pt-0.5">
                    Cuộn xuống chọn{' '}
                    <span className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-[#DDD8CE] bg-white px-1.5 py-0.5 font-semibold text-[#1A2229]">
                      <PlusSquare className="h-3.5 w-3.5 text-[#1B6B46]" />
                      Thêm vào MH chính
                    </span>{' '}
                    (<em>Add to Home Screen</em>), sau đó bấm <strong>Thêm</strong> ở góc phải trên.
                  </div>
                </li>
              </ol>
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
