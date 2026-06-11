-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "targetPlatforms" "PlatformName"[] DEFAULT ARRAY[]::"PlatformName"[];
