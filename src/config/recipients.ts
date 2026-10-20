export type RecipientId = 1 | 2 | 3 | 4;

export const sender = {
  name: "Thành An",
  facebookUrl: "https://www.facebook.com/thanhanthinker",
} as const;

export interface Recipient {
  id: RecipientId;
  recipientLabel: string;
  relationship: string;
  senderPronoun: string;
  recipientPronoun: string;
  pageTitle: string;
  openingEyebrow: string;
  openingMessage: string;
  apologyMessage: string;
  apologyButtonLabel: string;
  offeringTitle: string;
  offeringMessage: string;
  offeringCaption?: string;
  flowerButtonLabel: string;
  greetingTitle: string;
  greetingMessage: string;
  closingMessage: string;
  signature: string;
  responseTitle: string;
  responseIntro: string;
  responseYesLabel: string;
  responseNoLabel: string;
  responseSuccess: string;
  responseEnd: string;
}

export const recipients: Record<RecipientId, Recipient> = {
  1: {
    id: 1,
    recipientLabel: "Mẹ",
    relationship: "Người phụ nữ đầu tiên con yêu",
    senderPronoun: "con",
    recipientPronoun: "mẹ",
    pageTitle: "Gửi mẹ,\nngười con thương.",
    openingEyebrow: "20 THÁNG 10 · MỘT LỜI CHÚC ĐẾN MUỘN",
    openingMessage: "Mẹ ơi, hôm nay cũng sắp khép lại rồi.",
    apologyMessage:
      "Con xin lỗi vì lời chúc đến muộn. Con không muốn chỉ gửi vội vài dòng cho kịp ngày đặc biệt, nên đã dành một chút thời gian chuẩn bị món quà nhỏ này.\n\nMong mẹ nhận lấy, cùng với tất cả yêu thương của con.",
    apologyButtonLabel: "Chấp nhận",
    offeringTitle: "Một bó hoa.\nCả lòng con gửi mẹ.",
    offeringMessage: "Có một bó hoa, và thật nhiều yêu thương con muốn gửi mẹ.",
    flowerButtonLabel: "Mẹ nhận hoa nhé",
    greetingTitle: "Gửi mẹ,\nmột ngày bình yên.",
    greetingMessage:
      "Nhân ngày 20/10, con chúc mẹ luôn khỏe, vui vử và có nhiều thời gian được nghỉ ngơi hơn. Cảm ơn mẹ đã chăm lo cho con, cả những điều nhỏ con chưa kịp nói lời cảm ơn.\n\nHôm nay, con gửi mẹ bó hoa này. Mong mẹ bớt lo một chút, ăn một bữa thật ngon, nghĩ những điều thật đẹp và có một đêm tối nhẹ nhàng nhé mẹ.",
    closingMessage: "Con yêu mẹ nhiều.",
    signature: "Thương mẹ,",
    responseTitle: "Mẹ có điều gì muốn nhắn với con không?",
    responseIntro:
      "Con đã gửi mẹ một lời chúc. Nếu mẹ có điều muốn nói, con sẽ rất vui khi được đọc những dòng của mẹ.",
    responseYesLabel: "Có, mẹ muốn nhắn",
    responseNoLabel: "Để dịp khác nhé",
    responseSuccess:
      "Lời nhắn của mẹ đã được gửi đến nơi rồi. Cảm ơn mẹ đã dành thời gian viết những điều này cho con.",
    responseEnd: "Món quà nhỏ đã đến tay mẹ. Mong mẹ có một buổi tối thật bình yên.",
  },
  2: {
    id: 2,
    recipientLabel: "Cô gái đặc biệt",
    relationship: "Một món quà dành riêng cho em",
    senderPronoun: "mình",
    recipientPronoun: "em",
    pageTitle: "Món quà đặc biệt\ndành cho em.",
    openingEyebrow: "20 THÁNG 10 · MỘT LỜI CHÚC ĐẾN MUỘN",
    openingMessage: "Cô gái à, hôm nay cũng sắp khép lại rồi.",
    apologyMessage:
      "Mình rất xin lỗi vì lời chúc đến muộn mang như này. Mình muốn dành chút thời gian để chuẩn bị một điều thật riêng cho em, thay vì gửi những lời vội vàng rồi để ngày hôm nay trôi qua.\n\nMón quà này không lớn, nhưng từng chút đều được mình chuẩn bị bằng tất cả sự chân thành. Mong em sẽ mỉm cười khi mở nó nhá.",
    apologyButtonLabel: "Chấp nhận",
    offeringTitle: "Một bó hoa.\nThật nhiều thương mến.",
    offeringMessage: "Mình gửi em một bó hoa, cùng những điều chưa kịp nói thành lời.",
    flowerButtonLabel: "Nhận hoa nhé",
    greetingTitle: "Dành cho em,\nmột chút dịu dàng.",
    greetingMessage:
      "Ngày 20/10, mình gửi em một bó hoa cùng vài lời thật lòng nhất. Mong em có một buổi tối thật bình yên, một nụ cười nhẹ và một điều nhỏ khiến lòng vui.\n\nMình đã nghĩ đến em khi chuẩn bị món quà này. Mong những ngày sắp tới sẽ dịu dàng với em, và em luôn được yêu thương bằng những điều tử tế nhất, Chúc em ngủ ngon!.",
    closingMessage: "Thương mến gửi em.",
    signature: "Thân ái,",
    responseTitle: "Em có điều gì muốn nhắn gửi tới mình không?",
    responseIntro:
      "Mình đã gửi em những điều muốn nói. Nếu em cũng muốn để lại vài dòng, mình sẽ rất vui được đọc.",
    responseYesLabel: "Có, em muốn nhắn",
    responseNoLabel: "Để dịp khác nhé",
    responseSuccess:
      "Lời nhắn của em đã được gửi đến nơi rồi. Cảm ơn em đã dành thời gian viết những điều này cho mình.",
    responseEnd: "Cảm ơn em đã nhận món quà nhỏ này. Mong nụ cười sẽ ở lại cùng em thật lâu.",
  },
  3: {
    id: 3,
    recipientLabel: "Em gái",
    relationship: "Cô em gái của anh",
    senderPronoun: "anh",
    recipientPronoun: "em",
    pageTitle: "Gửi em gái,\nmột chút nắng ấm.",
    openingEyebrow: "20 THÁNG 10 · MỘT LỜI CHÚC ĐẾN MUỘN",
    openingMessage: "Em gái ơi, anh có một món quà nhỏ cho em.",
    apologyMessage:
      "Xin lỗi em vì anh chúc hơi muộn một chút. Anh muốn chuẩn bị một điều vui vui để ngày 20/10 của em có thêm một kỷ niệm dễ thương.\n\nMột món quà nhỏ thôi, nhưng là tất cả lời chúc tốt lành anh muốn gửi em.",
    apologyButtonLabel: "Chấp nhận",
    offeringTitle: "Một bó hoa.\nGửi em gái của anh.",
    offeringMessage: "Bó hoa này dành cho em gái của anh, cùng một lời chúc thật vui.",
    offeringCaption: "for my little sister",
    flowerButtonLabel: "Em nhận hoa nhé",
    greetingTitle: "Gửi em gái,\nmột ngày thật vui.",
    greetingMessage:
      "Chúc em gái của anh một ngày 20/10 vui vẻ, được ăn món mình thích và có thời gian nghỉ ngơi. Anh mong em luôn khỏe, ngủ đủ giấc và học hành thuận lợi.\n\nCó chuyện vui hay chuyện buồn, khi muốn tâm sự thì cứ nhắn anh nhé. Anh sẽ lắng nghe em, cả những chuyện nhỏ trong ngày.",
    closingMessage: "Anh luôn mong em vui và bình an.",
    signature: "Thương em gái,",
    responseTitle: "Có điều gì em muốn kể với anh không?",
    responseIntro:
      "Em muốn kể chuyện học hành hay chuyện gì trong ngày cũng được. Anh rất sẵn lòng nghe.",
    responseYesLabel: "Có, em muốn nhắn",
    responseNoLabel: "Để dịp khác nhé",
    responseSuccess:
      "Lời nhắn của em đã được gửi đến nơi rồi. Cảm ơn em đã dành thời gian viết những điều này cho anh.",
    responseEnd: "Cảm ơn em gái đã ghé nhận quà. Chúc em có thật nhiều ngày vui như hôm nay!",
  },
  4: {
    id: 4,
    recipientLabel: "Chị",
    relationship: "Người bạn, người bạn quý mến",
    senderPronoun: "em",
    recipientPronoun: "chị",
    pageTitle: "Gửi chị,\nmột lời chúc vui.",
    openingEyebrow: "20 THÁNG 10 · MỘT LỜI CHÚC ĐẾN MUỘN",
    openingMessage: "Chị ơi, em gửi chị một món quà nhỏ nhân ngày 20/10.",
    apologyMessage:
      "Em xin lỗi vì gửi lời chúc hơi muộn. Em chuẩn bị món quà nhỏ này để chúc chị một ngày 20/10 vui vẻ, thay cho vài dòng nhắn vội.\n\nMong bó hoa sẽ mang đến cho chị một chút niềm vui sau giờ làm.",
    apologyButtonLabel: "Chấp nhận",
    offeringTitle: "Một bó hoa.\nMột lời cảm ơn.",
    offeringMessage: "Em gửi chị bó hoa này cùng lời chúc vui vẻ và lời cảm ơn vì đã cùng nhau học tập và làm việc.",
    offeringCaption: "with appreciation",
    flowerButtonLabel: "Chị nhận hoa nhé",
    greetingTitle: "Chúc chị\nmột ngày thật vui.",
    greetingMessage:
      "Nhân ngày 20/10, em chúc chị luôn khỏe, công việc thuận lợi và có nhiều thời gian nghỉ ngơi. Cảm ơn chị vì những lần hỗ trợ và vì đã cùng em học tập vui vẻ.\n\nMong chị có một buổi tối thoải mái, được ăn món mình thích và tạm gác lại những bận rộn. Em gửi chị bó hoa nhỏ thay lời cảm ơn nhá.",
    closingMessage: "Chúc chị luôn vui!",
    signature: "Thân mến,",
    responseTitle: "Chị muốn để lại lời nhắn nào không?",
    responseIntro:
      "Nếu chị muốn gửi lại vài dòng, em rất sẵn lòng đọc. Không cần viết dài, một lời chào cũng vui rồi.",
    responseYesLabel: "Có, chị muốn nhắn",
    responseNoLabel: "Để dịp khác nhé",
    responseSuccess:
      "Lời nhắn của chị đã được gửi đến nơi rồi. Cảm ơn chị đã dành thời gian viết những điều này cho em.",
    responseEnd: "Cảm ơn chị đã nhận món quà nhỏ. Chúc chị một buổi tối thoải mái và ngày mai làm việc thuận lợi.",
  },
};

export function getRecipient(value: string | undefined): Recipient | null {
  if (value !== "1" && value !== "2" && value !== "3" && value !== "4") return null;
  return recipients[Number(value) as RecipientId];
}
