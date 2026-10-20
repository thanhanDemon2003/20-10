# Một chút dịu dàng · 20 tháng 10

Website quà tặng cá nhân bằng tiếng Việt: một lời xin lỗi đến muộn, một chàng trai trao hoa, một tấm thiệp và một chỗ để người nhận gửi lời nhắn lại.

Ứng dụng dùng Next.js App Router, React, TypeScript strict, Tailwind CSS, Motion và các hiệu ứng CSS nhỏ. Nội dung thiệp không cần gọi API. Các API Node.js chỉ xử lý lời nhắn và đăng nhập hộp thư. Không có SQL, ORM, backend riêng, tracker hay dịch vụ AI trong runtime.

## Chạy tại máy

Yêu cầu Node.js **22 trở lên** và npm.

```sh
npm install
```

Sao chép `.env.example` thành `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Điền hai giá trị riêng vào `.env.local`:

```dotenv
LETTERS_ADMIN_PASSWORD=mat-khau-rieng-cua-ban-it-nhat-12-ky-tu
ADMIN_SESSION_SECRET=chuoi-ngau-nhien-rieng-it-nhat-32-ky-tu
BLOB_READ_WRITE_TOKEN=
```

Các giá trị trên chỉ minh họa cấu trúc, **không dùng làm mật khẩu thật**. Tạo khóa ngẫu nhiên bằng lệnh sau, rồi chép kết quả vào `ADMIN_SESSION_SECRET`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Dùng một mật khẩu dài, riêng cho hộp thư. Có thể chạy cùng lệnh để tạo mật khẩu ngẫu nhiên. Không gửi hai giá trị này vào chat, không thêm tiền tố `NEXT_PUBLIC_`, không commit `.env.local`. File này đã được bỏ qua trong `.gitignore`.

```sh
npm run dev
```

Mở `http://localhost:3000`. Nếu cổng 3000 đang được dùng, xem URL thực tế trong terminal. Khởi động lại dev server sau khi đổi biến môi trường.

| Đường dẫn | Người nhận |
| --- | --- |
| `/` hoặc `/?to=2` | Món quà đặc biệt dành cho em — xưng mình / em |
| `/?to=1` | Mẹ — xưng con / mẹ |
| `/?to=3` | Em — xưng anh / em |
| `/?to=4` | Chị — xưng em / chị |
| `/20-10?to=N` với `N` là 1, 2, 3 hoặc 4 | Các đường dẫn cũ vẫn mở đúng thiệp tương ứng |
| `/20-10`, query không hợp lệ hoặc `to` bị lặp | Trang chọn một trong bốn tấm thiệp |
| `/letters` | Hộp thư riêng, yêu cầu mật khẩu |

Mở trang chủ không có query sẽ vào thẳng thiệp dành cho em (`id=2`), không qua màn chọn. Các URL thiệp là đường dẫn chia sẻ cá nhân, không phải cơ chế xác thực người nhận. Người biết URL có thể mở thiệp hoặc gửi lời nhắn; hộp thư đọc lời nhắn luôn yêu cầu phiên quản trị.

## Chỉnh lời chúc và hình ảnh

**Nội dung:** sửa `src/config/recipients.ts`. Đây là nguồn duy nhất của nội dung riêng cho bốn người nhận: tiêu đề, cách xưng hô, xin lỗi, lời mời nhận hoa, lời chúc, lời ký và lời mời nhắn lại. `sender` chứa tên **Thành An** và [Facebook người gửi](https://www.facebook.com/thanhanthinker); chữ ký hiển thị tên với liên kết này. TypeScript kiểm tra đầy đủ các trường. Ký tự xuống dòng `\n` tạo ngắt dòng có chủ đích, `\n\n` ngăn cách đoạn.

**Minh họa:** các hình dùng trên trang nằm trong `public/images/`. Nhân vật được lấy từ ảnh minh họa người gửi đã cung cấp, cùng hình phong bì hoa. Nếu thay ảnh, giữ đúng tỉ lệ canvas và điều chỉnh vị trí lớp mí mắt trong `src/components/20-10/BoyIllustration.tsx`. Lớp mí mắt cần trùng với đôi mắt, kính không được biến dạng. Cũng kiểm tra lại lớp bó hoa và animation ở màn trao hoa. Không tự thay bằng ảnh chân dung thật nếu chưa có sự đồng ý của người trong ảnh.

Nhân vật có ba lớp ảnh: `boy-with-flowers.png` giữ gương mặt và hình gốc, `boy-clean-plate.png` làm lớp nền sau vùng chuyển động, `hands-and-bouquet.png` chứa tay và bó hoa. SVG mask/clip tách các nhánh lá và bông hoa để chuyển động nhẹ, trong khi tay nâng và đưa bó hoa về phía trước. Mí mắt là lớp SVG riêng, có nhịp chớp thưa và biến thiên nhẹ; không làm méo kính hoặc phóng to gương mặt. Khi lớp animation chưa tải được, hình minh họa gốc vẫn hiện; nếu hình gốc thiếu, component có SVG dự phòng.

**Chuyển động và cuộn:** ba cảnh dùng state `apology | offering | greeting`. Ngoài cánh hoa và vài nét gió ở nền, phần đọc thiệp có nội dung hiện dần khi đi vào viewport, bó hoa dịch chuyển nhẹ theo cuộn, thanh báo tiến độ đọc và liên kết xuống phần nhắn lại. Tùy chọn `prefers-reduced-motion` giảm hoặc tắt các chuyển động. Không khóa cuộn trang; người nhận có thể đọc hết thiệp và chọn nhắn lại hoặc kết thúc.

**Tên người gửi:** `SenderLink` lấy tên và Facebook từ `sender` trong cấu hình chung, xuất hiện ở lời mở đầu, chữ ký trong thiệp và phần kết. Liên kết mở tab mới với `noopener noreferrer`. Cách xưng hô của từng trải nghiệm vẫn giữ riêng: con/mẹ, mình/em, anh/em và em/chị.

**Nhạc:** đã kèm hai đoạn piano không lời tự tổng hợp cho dự án, nguồn tạo ở `scripts/generate-piano.mjs`:

- `public/audio/20-10-piano.mp3` — **Một chút dịu dàng**, nhịp 4/4, nhạc nền ban đầu.
- `public/audio/20-10-for-you.mp3` — **Hoa và lời thương**, nhịp 3/4, chuyển sang khi bấm nút **Nhận hoa nhé**.

Không lấy bản thu từ dịch vụ bên ngoài. Muốn thay nhạc, đặt MP3 có quyền sử dụng vào các đường dẫn tương ứng. Nếu thiếu hoặc không phát được MP3, trải nghiệm vẫn tiếp tục bình thường.

Nhạc chỉ bắt đầu sau tương tác, dùng một audio instance xuyên suốt; bấm nút **Nhận hoa nhé** đổi nguồn của cùng phần tử audio nên không phát chồng. Nhãn nút có thể đổi theo người nhận. Lựa chọn tắt nhạc được giữ khi đổi bài, có điều khiển bật/tắt và giảm âm lượng khi đọc thiệp. Trình duyệt có thể chặn phát nhạc; người nhận có thể bật lại bằng nút âm thanh.

Hai họ font Cormorant Garamond và Be Vietnam Pro được phục vụ từ package tại máy, có bộ ký tự tiếng Việt và fallback. Không phụ thuộc việc tải Google Fonts khi build hoặc mở trang.

## Lời nhắn được lưu ở đâu?

Schema chung:

```json
{
  "version": 1,
  "messages": [
    {
      "id": "UUID do server sinh",
      "name": "Tên người gửi",
      "message": "Lời nhắn",
      "recipientId": 2,
      "createdAt": "Thời gian ISO-8601 do server sinh"
    }
  ]
}
```

### Development local

Khi chạy `npm run dev` và chưa cấu hình Blob, dữ liệu nằm trong `data/messages.json`. Bản khởi đầu có `{"version":1,"messages":[]}`; nếu chưa có file, lần ghi đầu tiên sẽ tạo nó.

Ghi dữ liệu dùng file khóa độc quyền để tuần tự hóa các request, ghi file tạm cùng thư mục, flush nội dung rồi đổi tên nguyên tử. Không ghi đè dữ liệu đang dùng bằng một file rỗng. Nếu tiến trình bị tắt đột ngột và để lại `data/messages.json.lock`, **dừng toàn bộ server local trước**, kiểm tra không còn tiến trình ghi rồi xóa riêng file `.lock` cũ để thử lại. File JSON gốc được giữ lại.

`data/messages.json`, file tạm và file khóa đều bị loại khỏi Git để tránh đẩy lời nhắn riêng tư lên repository. Sao lưu bằng nút **Xuất JSON** trong `/letters`, hoặc sao chép `data/messages.json` vào nơi riêng tư khi đã dừng server.

### Production / Vercel

Production đọc và ghi **một private Blob**, pathname cố định:

```text
20-10/messages.json
```

Đây là object storage chứa JSON, không phải database. File JSON trong repository / máy phát triển **không phải** file dữ liệu production và không tự được nhập lên Blob.

Server dùng `@vercel/blob`: đọc với `access: "private"` và `useCache: false` để lấy nội dung mới từ origin; khi cập nhật dùng ETag và `ifMatch`. Nếu hai request ghi gần nhau, request xung đột đọc lại rồi thử lại tối đa 6 lần. Lần tạo đầu dùng `allowOverwrite: false` để request đồng thời không ghi đè nhau. Nếu chưa cấu hình Blob, production trả lỗi có thể hiểu được, không chuyển sang lưu filesystem tạm.

Vì vậy, `npm run build` có thể chạy chưa cần Blob, nhưng `npm start` dùng production mode sẽ cần Blob để lưu/đọc lời nhắn. Dùng `npm run dev` để thử lưu file local.

Tham khảo SDK và cơ chế đọc nhất quán: [Vercel Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk), [consistent reads cho private storage](https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage).

## Triển khai lên Vercel

1. Tạo repository GitHub riêng cho mã nguồn. Kiểm tra `.gitignore`, không đưa `.env.local`, token hoặc lời nhắn cá nhân vào commit.
2. Import repository trong Vercel, chọn framework **Next.js**, Node.js **22 trở lên**. Build command: `npm run build`. Giữ output directory mặc định.
3. Trong phần Storage của Vercel, tạo **Blob store với quyền truy cập Private** và kết nối với project. Không chọn Public cho hộp thư.
4. Cấp biến **`BLOB_READ_WRITE_TOKEN`** của store cho server của project. Khi kết nối store, Vercel có thể tự thêm biến này. Kiểm tra đúng môi trường Production / Preview cần dùng. Không gửi token vào trình duyệt hoặc Git.
5. Thêm **`LETTERS_ADMIN_PASSWORD`** tối thiểu 12 ký tự và **`ADMIN_SESSION_SECRET`** ngẫu nhiên tối thiểu 32 ký tự vào Environment Variables. Không dùng các chuỗi minh họa trong README.
6. Deploy hoặc redeploy sau khi thêm biến môi trường. Nếu môi trường có thiết lập OIDC tương thích, code cũng hỗ trợ `BLOB_STORE_ID` cùng `VERCEL_OIDC_TOKEN`; dùng token của Blob store là cách thiết lập trực tiếp trong hướng dẫn này.
7. Thêm rule phù hợp trong **Vercel Firewall** để giới hạn thử đăng nhập tại `/api/admin/login`. Bộ giới hạn trong một serverless instance chỉ là lớp bảo vệ bổ sung, không thay cho giới hạn phân tán ở nền tảng.
8. Thay `https://ten-mien-cua-ban.vercel.app` bằng tên miền vừa nhận để chia sẻ:

```text
https://ten-mien-cua-ban.vercel.app/?to=1
https://ten-mien-cua-ban.vercel.app/
https://ten-mien-cua-ban.vercel.app/?to=3
https://ten-mien-cua-ban.vercel.app/?to=4
```

Mở `https://ten-mien-cua-ban.vercel.app/letters` để đọc lời nhắn.

### Kiểm tra sau khi deploy

- Mở từng tấm thiệp trên điện thoại; đi qua lời xin lỗi, trao hoa và lời chúc.
- Gửi một lời nhắn thử. Chỉ coi là thành công khi giao diện báo API đã lưu.
- Đăng nhập `/letters`, kiểm tra tên, nội dung, người nhận và giờ Việt Nam.
- Tải lại, sau đó redeploy một phiên bản mã nguồn; lời nhắn phải còn trong cùng Blob store.
- Mở cửa sổ riêng tư chưa đăng nhập; `/api/messages` phải trả `401`.
- Dùng **Xuất JSON** để lưu bản sao riêng tư. File tải về chứa nội dung cá nhân, không commit lên Git.
- Nếu dùng Preview, nên kết nối store riêng để các bản thử không ghi vào hộp thư thật.

Chưa thể xác minh lưu production bằng store thật nếu chưa cung cấp quyền truy cập Vercel Blob. Kiểm thử giả lập xung đột không thay thế bước kiểm tra thực tế sau deploy.

## API và bảo mật

| API | Quyền | Chức năng |
| --- | --- | --- |
| `POST /api/messages` | Công khai, cùng origin | Nhận `{name, message, recipientId, website: ""}` |
| `GET /api/messages` | Phiên quản trị | Đọc JSON, mới nhất trước |
| `GET /api/messages?download=1` | Phiên quản trị | Xuất JSON để sao lưu |
| `POST /api/admin/login` | Cùng origin | Nhận `{password}`, tạo cookie phiên |
| `POST /api/admin/logout` | Phiên quản trị, cùng origin | Xóa cookie phiên |

- Server chuẩn hóa khoảng trắng và kiểm tra tên 2–50 ký tự, lời nhắn 1–1.000 ký tự, `recipientId` là số 1, 2, 3 hoặc 4. ID và thời gian do server tạo. Lời nhắn cũ với id 1–3 giữ nguyên schema và tiếp tục đọc được sau khi thêm id 4.
- Body JSON tối đa 8.192 byte cho lời nhắn, 2.048 byte cho đăng nhập. Form có honeypot `website`.
- Giới hạn ghi bền vững được kiểm tra trong cùng lần cập nhật JSON: tối đa 5 lời nhắn / người nhận / 60 giây và 30 lời nhắn tổng / 60 giây. Không thu thập IP hoặc định danh trình duyệt.
- Có thêm giới hạn trong từng instance: 60 lần gửi lời nhắn / phút, 10 lần thử đăng nhập / phút. Serverless có nhiều instance nên đây không phải bảo vệ toàn diện.
- Cookie phiên ký HMAC, thời hạn 8 giờ, `HttpOnly`, `SameSite=Strict`, `Path=/`, `Secure` ở production. Mật khẩu/chữ ký so sánh an toàn. Đổi mật khẩu hoặc session secret sẽ vô hiệu hóa cookie đã cấp.
- Thiếu cấu hình quản trị hợp lệ thì từ chối đăng nhập, không dùng mật khẩu mặc định.
- Dữ liệu riêng dùng `Cache-Control: private, no-store`; Blob chỉ truy cập phía server. API công khai không trả nội dung các lời nhắn.
- React hiển thị nội dung như văn bản, không render HTML người gửi nhập. API thay đổi trạng thái kiểm tra origin. `/letters` có `noindex`, nhưng quyền đọc được bảo vệ tại API.

Không đăng thư mục `data` làm static/public, không tạo route trả JSON bỏ qua phiên đăng nhập, không đổi Blob sang public.

## Các lệnh kiểm tra

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`npm test` chạy kiểm thử backend bằng Node test runner với `tsx` và điều kiện `react-server`. Các bài kiểm tra sử dụng file tạm hoặc adapter giả lập; không cần token Blob thật và không ghi vào hộp thư production.

Các kiểm tra giao diện cần xác minh thêm trên browser: trang chủ mặc định, bốn URL hợp lệ, đường dẫn cũ và query sai/lặp; đủ ba cảnh; âm thanh không chồng và khi thiếu MP3; form hợp lệ / sai; nhánh bỏ qua lời nhắn; đăng nhập / đăng xuất / tải lại / xuất JSON; mobile, desktop và reduced motion. Trạng thái chạy thực tế được báo trong phần bàn giao; danh sách này không có nghĩa mọi kiểm tra đã được chạy.

### Kết quả kiểm chứng ngày 20/10/2026

- `npm run typecheck`, `npm run lint`, `npm run build`: đạt.
- `npm test`: 14 kiểm thử đạt, bao gồm kiểm tra dữ liệu, body quá lớn, origin/Host, phiên hết hạn và bị sửa, ghi local đồng thời, lỗi ghi, JSON hỏng, xung đột tạo Blob lần đầu và cập nhật ETag, giới hạn thử lại, quyền đọc/xuất và production thiếu Blob. Đã thêm kiểm tra xưng hô của bốn người nhận, ghi/đọc id 4 cùng dữ liệu id 1–3 có sẵn và gửi lời nhắn cho chị qua API. Trên Windows, test cần quyền ngoài sandbox do sandbox chặn atomic rename.
- Trình duyệt bản ba người nhận ban đầu: đã mở ba URL, query sai và thiếu query; đi qua ba cảnh; kiểm tra bản desktop 1440×1000 và mobile 390×844 không tràn ngang; gửi một lời nhắn thật vào JSON local; kiểm tra tên trống và nhánh không viết lời nhắn.
- Bản cập nhật bốn người nhận: đã xác nhận `/` mở thẳng thiệp dành cho em và dùng mình/em; đã mở `/?to=1`, `/?to=3`, `/?to=4`, `/20-10?to=2` và query sai trả đủ bốn lựa chọn. Nhân vật nhiều lớp hiển thị liền mạch trên desktop, màn 390px và 320px; cảnh nhận hoa không bị bóng kép. Các liên kết Thành An trỏ đúng Facebook. Đã kiểm tra cuộn tới form, các đoạn hiện dần, thanh tiến độ cập nhật khi chiều cao form thay đổi và ô nhập 16px trên điện thoại.
- Âm thanh: bản cập nhật đã xác nhận chỉ một phần tử audio, bài nền phát được và chuyển sang **Hoa và lời thương** khi nhận hoa. Tắt nhạc ở cảnh trao hoa được giữ nguyên khi chuyển bài và mở thiệp. Bản một bài trước đó đã thử trạng thái thiếu MP3 không làm gián đoạn thiệp và đã khôi phục file.
- Hộp thư: kiểm tra mật khẩu sai/đúng, tải lại giữ phiên và dữ liệu, xuất JSON bằng nút giao diện, đăng xuất về màn đăng nhập. Tài khoản kiểm thử chỉ tồn tại trong tiến trình QA, không lưu thành `.env.local`.
- HTTP thực tế: sáu trang trả 200, MP3 không tồn tại trả 404; tên rỗng, nội dung dài và recipient sai bị từ chối; đọc/xuất chưa đăng nhập trả 401; đăng nhập, đọc, xuất và logout hoạt động.
- Console trang hoàn thiện không ghi nhận warning/error. Các ảnh kiểm chứng nằm trong `docs/screenshots/`.
- `prefers-reduced-motion` đã được xử lý trong Motion và CSS; chưa mô phỏng trực tiếp tùy chọn hệ điều hành trong phiên kiểm thử trình duyệt này.
- **Chưa kiểm chứng** store Vercel Blob thật hoặc tồn tại qua redeploy: cần kết nối store riêng tư và chạy checklist phía trên. Các kiểm thử Blob hiện dùng adapter giả lập.

`npm audit --omit=dev`: 0 lỗ hổng dependency runtime tại thời điểm kiểm tra. Audit đầy đủ báo 5 mục mức high từ cùng một advisory của `braces` trong chuỗi công cụ ESLint; chưa có bản vá được công bố. Không tự hạ ESLint config xuống Next 14 vì dự án đang dùng Next 16. Theo dõi [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) và cập nhật công cụ khi có bản tương thích.

## Cấu trúc chính

```text
src/
  app/page.tsx         Trang quà tặng, mặc định cho em
  app/20-10/           Hỗ trợ đường dẫn cũ và chọn thiệp
  app/letters/         Hộp thư riêng
  app/api/messages/   Nhận và đọc lời nhắn
  app/api/admin/      Đăng nhập, đăng xuất
  components/20-10/   Các cảnh, nhân vật, nhạc và form
  components/letters/ Đăng nhập và danh sách lời nhắn
  config/recipients.ts Nội dung bốn tấm thiệp và thông tin Thành An
  lib/                Xác thực, validation và lưu JSON
public/
  images/             Minh họa
  audio/              Piano
scripts/              Nguồn tạo âm thanh
tests/                Kiểm thử backend
data/messages.json    Dữ liệu local, được bỏ qua trong Git
```
#   2 0 - 1 0  
 