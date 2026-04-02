-- CreateTable
CREATE TABLE "StoryComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoryComment" ADD CONSTRAINT "StoryComment_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryComment" ADD CONSTRAINT "StoryComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
