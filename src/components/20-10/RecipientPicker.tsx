import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { recipients } from "@/config/recipients";
import { Botanical, FlowerMark } from "./Botanical";
import { FloatingPetals } from "./FloatingPetals";

export function RecipientPicker({ keepOpen = false }: { keepOpen?: boolean }) {
  const suffix = keepOpen ? "&open=true" : "";
  return <main className="gift-shell picker-shell">
    <FloatingPetals />
    <header className="gift-header"><Link href={keepOpen ? "/?open=true" : "/"} className="wordmark"><FlowerMark /><span>một chút dịu dàng</span></Link><span className="header-date">20 . 10</span></header>
    <div className="picker-content">
      <div className="picker-illustration"><Image src="/images/floral-envelope-cutout.png" alt="Một chiếc phong bì được trang trí bằng những bông hoa hồng" width={1254} height={1254} sizes="280px" priority /></div>
      <p className="eyebrow">NGÀY PHỤ NỮ VIỆT NAM · 20 THÁNG 10</p>
      <h1>Có một món quà<br /><em>đang chờ người thương.</em></h1>
      <p className="picker-intro">Mỗi người thương, một lời chúc thật lòng.<br />Chọn tấm thiệp dành riêng cho mình nhé.</p>
      <div className="recipient-links">
        {Object.values(recipients).map((recipient, i) => <Link href={`/?to=${recipient.id}${suffix}`} className="recipient-link" key={recipient.id}>
          <span className="recipient-number">0{i + 1}</span><span><strong>{recipient.recipientLabel}</strong><small>{recipient.relationship}</small></span><ArrowUpRight size={19} strokeWidth={1.4} />
        </Link>)}
      </div>
    </div>
    <Botanical className="botanical-bottom" />
    <footer className="simple-footer">Được chuẩn bị bằng cả tấm lòng <Heart size={12} /></footer>
  </main>;
}
