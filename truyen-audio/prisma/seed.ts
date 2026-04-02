import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Bắt đầu seed data...");

  // Xóa dữ liệu cũ theo thứ tự quan hệ
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.listeningHistory.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.story.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const hashedPassword = await bcrypt.hash("123456", 10);

  const userNormal = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: hashedPassword,
      name: "Nguyễn Văn A",
      role: "USER",
    },
  });

  const userVip = await prisma.user.create({
    data: {
      email: "vip@example.com",
      password: hashedPassword,
      name: "Trần Thị B",
      role: "VIP",
      vipExpiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Tạo ${2} users`);

  // --- Stories & Episodes ---
  const storiesData = [
    {
      title: "Dế Mèn Phiêu Lưu Ký",
      slug: "de-men-phieu-luu-ky",
      description:
        "Câu chuyện phiêu lưu của chú Dế Mèn qua nhiều vùng đất, gặp gỡ nhiều bạn bè và học được những bài học quý giá về tình bạn và lòng dũng cảm.",
      coverImage: "https://placehold.co/400x600?text=De+Men",
      isVip: false,
      episodes: [
        { title: "Tập 1: Tuổi thơ của Dế Mèn", duration: 1200 },
        { title: "Tập 2: Cuộc phiêu lưu bắt đầu", duration: 1350 },
        { title: "Tập 3: Gặp gỡ Dế Trũi", duration: 1100 },
      ],
    },
    {
      title: "Tắt Đèn",
      slug: "tat-den",
      description:
        "Tiểu thuyết hiện thực phê phán của Ngô Tất Tố, kể về cuộc sống cơ cực của người nông dân Việt Nam trước Cách mạng tháng Tám qua nhân vật chị Dậu.",
      coverImage: "https://placehold.co/400x600?text=Tat+Den",
      isVip: false,
      episodes: [
        { title: "Tập 1: Gia cảnh chị Dậu", duration: 1500 },
        { title: "Tập 2: Bán con trả sưu", duration: 1400 },
        { title: "Tập 3: Tức nước vỡ bờ", duration: 1300 },
      ],
    },
    {
      title: "Truyện Kiều",
      slug: "truyen-kieu",
      description:
        "Kiệt tác văn học của Nguyễn Du, kể về cuộc đời đầy sóng gió của nàng Thúy Kiều — một thiếu nữ tài sắc vẹn toàn nhưng số phận nghiệt ngã.",
      coverImage: "https://placehold.co/400x600?text=Truyen+Kieu",
      isVip: true,
      episodes: [
        { title: "Tập 1: Gặp gỡ Kim Trọng", duration: 1800 },
        { title: "Tập 2: Gia biến", duration: 1600 },
        { title: "Tập 3: Lưu lạc", duration: 1700 },
      ],
    },
    {
      title: "Số Đỏ",
      slug: "so-do",
      description:
        "Tiểu thuyết trào phúng của Vũ Trọng Phụng, phản ánh xã hội Việt Nam thời thuộc Pháp qua nhân vật Xuân Tóc Đỏ — kẻ bất tài nhưng gặp may mắn liên tục.",
      coverImage: "https://placehold.co/400x600?text=So+Do",
      isVip: true,
      episodes: [
        { title: "Tập 1: Xuân Tóc Đỏ xuất hiện", duration: 1250 },
        { title: "Tập 2: Vận may kỳ lạ", duration: 1400 },
        { title: "Tập 3: Đỉnh cao danh vọng", duration: 1350 },
      ],
    },
    {
      title: "Chí Phèo",
      slug: "chi-pheo",
      description:
        "Truyện ngắn nổi tiếng của Nam Cao về cuộc đời bi kịch của Chí Phèo — từ một anh nông dân hiền lành bị xã hội đẩy vào con đường tha hóa.",
      coverImage: "https://placehold.co/400x600?text=Chi+Pheo",
      isVip: false,
      episodes: [
        { title: "Tập 1: Chí Phèo ra tù", duration: 900 },
        { title: "Tập 2: Gặp Thị Nở", duration: 1000 },
        { title: "Tập 3: Bi kịch cuối cùng", duration: 1100 },
      ],
    },
  ];

  const createdStories = [];
  for (const storyData of storiesData) {
    const { episodes, ...storyFields } = storyData;
    const story = await prisma.story.create({
      data: {
        ...storyFields,
        episodes: {
          create: episodes.map((ep, index) => ({
            title: ep.title,
            audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(index % 16) + 1}.mp3`,
            order: index + 1,
            duration: ep.duration,
            isFreePreview: index === 0, // Tập đầu tiên luôn miễn phí preview
          })),
        },
      },
      include: { episodes: true },
    });
    createdStories.push(story);
  }

  console.log(`✅ Tạo ${createdStories.length} truyện, mỗi truyện 3 tập`);

  // --- Community Posts ---
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content:
          "Mình vừa nghe xong Dế Mèn Phiêu Lưu Ký, hay quá! Giọng đọc rất truyền cảm, ai chưa nghe thì thử đi nhé.",
        authorId: userNormal.id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Truyện Kiều phiên bản audio thật sự rất đáng nghe. Mỗi tập đều được diễn đạt rất tình cảm và sâu lắng.",
        authorId: userVip.id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Có ai biết khi nào nền tảng sẽ cập nhật thêm truyện mới không? Mình đã nghe hết rồi, muốn có thêm nội dung quá!",
        authorId: userNormal.id,
      },
    }),
  ]);

  console.log(`✅ Tạo ${posts.length} bài viết cộng đồng`);

  console.log("🎉 Seed data hoàn tất!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
