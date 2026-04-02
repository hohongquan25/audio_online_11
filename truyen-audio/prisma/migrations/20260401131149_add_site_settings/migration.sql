-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "heroBackground" TEXT NOT NULL DEFAULT '',
    "heroTitle" TEXT NOT NULL DEFAULT 'Nghe truyện độc quyền mọi lúc, mọi nơi',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Khám phá hàng ngàn tập truyện audio hấp dẫn từ các thể loại tiên hiệp, kiếm hiệp, ngôn tình đến trinh thám, kinh dị.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
