# Kiến trúc Tổng thể — Diện Chẩn Atlas (Bùi Quốc Châu)

Tài liệu này mô tả kiến trúc phân tầng của **Diện Chẩn Atlas**, được thiết kế theo hướng **Web-first MVP** nhưng giữ **tầng dữ liệu JSON hoàn toàn độc lập với UI/Framework**, sẵn sàng tái sử dụng trực tiếp cho các ứng dụng Mobile (Flutter / iOS / Android) trong giai đoạn tiếp theo.

---

## 1. Mục tiêu thiết kế

1. **Chính xác theo hệ quy chiếu Diện Chẩn Bùi Quốc Châu**:
   - Phân biệt rõ **Trục giữa (`O`)**, **Huyệt đối xứng 2 bên** và **Huyệt đơn bên** (ví dụ: Gan `50`, Mật `41` nằm bên **Phải người bệnh**; Tỳ `37`, Bao tử `39` nằm bên **Trái người bệnh**).
   - Luôn hiển thị định hướng giải phẫu theo góc nhìn người bệnh để người thực hành không bị nhầm trái/phải khi soi gương hoặc làm cho người khác.
2. **Đồ hình 2D giải phẫu đổ khối giả 3D mượt mà**:
   - Dùng vector SVG độ phân giải vô hạn kết hợp nhiều lớp ánh sáng/bóng đổ giải phẫu (Alabaster 3D Sculpted Lighting) thay vì ảnh bitmap tĩnh, đảm bảo sắc nét tuyệt đối ở mức zoom `70%` đến `450%`.
   - Hỗ trợ đầy đủ góc **Chính diện (`front`)** và **Mặt nghiêng phải (`side`)**, đồng bộ hệ tọa độ ngang `H1–H10`.
3. **Tương tác 60fps**:
   - Kéo thả (Pan), cuộn chuột / chụm tay phóng to tại tâm con trỏ (Focal Zoom), trượt tự động đến huyệt được chọn (`Fly-to`), bù tỷ lệ kích thước điểm huyệt theo mức zoom.
4. **Tính di động dữ liệu (Data Portability)**:
   - Tách toàn bộ dữ liệu huyệt, tuyến, phác đồ ra khỏi React/DOM trong thư mục `/data/*.json`.
   - Danh sách huyệt cá nhân của người dùng lưu tại `localStorage` và hỗ trợ **Export / Import JSON** chuẩn hóa.

---

## 2. Cấu trúc phân tầng (Layered Architecture)

```text
/Users/mac/aiprj/dienchan
├── data/                         # [Layer 1: Portable Data] JSON độc lập framework
│   ├── schema.json               # JSON Schema chuẩn cho Acupoint & PointCollection
│   ├── grid-lines.json           # Hệ tuyến dọc (O, A..F) & tuyến ngang (H1..H10)
│   ├── acupoints.core.json       # Bộ 35 huyệt Diện Chẩn cốt lõi thông dụng
│   └── protocols.core.json       # 5 phác đồ / bộ huyệt tham khảo tích hợp sẵn
├── src/
│   ├── domain/                   # [Layer 2: Pure Domain] Thuần TypeScript, 0 phụ thuộc DOM/React
│   │   ├── types.ts              # Entities & ViewModels
│   │   ├── projection.ts         # Chiếu huyệt đơn bên / đối xứng theo góc nhìn
│   │   ├── search.ts             # Tìm kiếm tiếng Việt không dấu & xếp hạng mã huyệt
│   │   └── viewport.ts           # Toán học Pan / Focal Zoom / Clamp / Fly-to
│   ├── data/                     # [Layer 3: Repository & Persistence]
│   │   ├── acupointRepository.ts # Nạp & index dữ liệu JSON chuẩn
│   │   └── collectionStorage.ts  # CRUD danh sách huyệt người dùng (localStorage + Export/Import)
│   └── features/                 # [Layer 4: Presentation / Feature Modules]
│       ├── face-map/             # Đồ hình giả 3D, lưới tuyến, lớp huyệt, viewport & HUD
│       ├── search/               # Thanh tìm kiếm, lọc theo vùng & triệu chứng
│       ├── collections/          # Quản lý bộ huyệt cá nhân & phác đồ mẫu
│       └── inspector/            # Bảng chi tiết huyệt, cách dò, lưu ý & nút lưu nhanh
└── docs/
    └── ARCHITECTURE.md
```

### Quy tắc phụ thuộc (Dependency Rule)
- `data/*.json` không phụ thuộc bất kỳ mã nguồn nào.
- `src/domain/` chỉ dùng TypeScript thuần — có thể port nguyên trạng sang Dart (cho Flutter) hoặc Swift/Kotlin.
- `src/data/` đọc `data/*.json` và quản lý `localStorage`.
- `src/features/` chỉ giao tiếp qua hooks/props của React, không nhúng logic toán học tọa độ hay lọc chuỗi phức tạp vào JSX.

---

## 3. Hệ tọa độ chuẩn (`1000 × 1200`)

Tất cả dữ liệu trong `acupoints.core.json` và `grid-lines.json` dùng không gian tọa độ chuẩn **`1000 × 1200`** (tương ứng `viewBox="0 0 1000 1200"`):

1. **Trục giữa (Tuyến O)**: `x = 500`.
2. **Quy ước Trái / Phải (theo người bệnh trên đồ hình Chính diện)**:
   - **Bên Phải của người bệnh**: nằm ở **nửa trái màn hình** (`x < 500`) — ví dụ: Huyệt `50` (Gan), Huyệt `41` (Mật).
   - **Bên Trái của người bệnh**: nằm ở **nửa phải màn hình** (`x > 500`) — ví dụ: Huyệt `37` (Tỳ), Huyệt `39` (Bao tử).
3. **Phản chiếu tự động (Bilateral Mirroring)**:
   - Các huyệt đối xứng (`laterality: "bilateral"`) chỉ lưu tọa độ gốc bên nửa trái màn hình (`x < 500`).
   - Tầng `src/domain/projection.ts` tự động nhân bản điểm đối xứng qua trục `O` bằng công thức `mirrorX = 1000 - x`. Điều này loại bỏ hoàn toàn nguy cơ lệch trái/phải trong dữ liệu JSON.
4. **Đồng bộ tuyến ngang giữa 2 góc nhìn**:
   - Các tuyến ngang `H1` (`y=190`) đến `H10` (`y=874`) giữ nguyên tung độ `y` ở cả góc **Chính diện** và **Mặt nghiêng**, giúp người dùng đối chiếu vị trí chiều cao dễ dàng khi chuyển góc.

---

## 4. Lộ trình mở rộng sang Mobile (iOS / Android) & Phiên bản sau

### Giai đoạn 1 (MVP hiện tại — Web App)
- Chạy thuần client-side (`Vite + React + TypeScript + Tailwind CSS`), không cần backend.
- Nạp sẵn 35 huyệt thông dụng + 5 bộ huyệt mẫu + danh sách cá nhân lưu trình duyệt + Export/Import JSON.

### Giai đoạn 2 (Mở rộng dữ liệu & Công cụ thực hành)
- Đóng gói thành **PWA** (cài lên màn hình chính iPhone/Android, dùng offline 100%).
- Bổ sung bộ 500+ huyệt đầy đủ kèm trình **Biên tập/Hiệu chỉnh tọa độ huyệt** cho người dùng tự kiểm tra theo đồ hình giấy chuẩn.
- Thêm ghi chú cá nhân theo từng huyệt và lịch sử thực hành.

### Giai đoạn 3 (Mobile Native — Flutter iOS / Android)
- Tạo dự án Flutter dùng chung bộ `data/acupoints.core.json`, `data/grid-lines.json`, và `data/protocols.core.json` làm asset bundle gốc.
- Tái hiện lại các quy tắc trong `src/domain/` sang Dart (`AcupointProjection`, `VietnameseSearch`, `CollectionRepository`).
- Tùy chọn tích hợp thêm **MediaPipe Face Landmarker** như một lớp tham chiếu phụ trên camera nếu cần gợi ý vùng mặt thực tế (vẫn giữ đồ hình 2D/3D làm nguồn tra cứu chuẩn).
