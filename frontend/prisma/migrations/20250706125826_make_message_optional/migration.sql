-- DropForeignKey
ALTER TABLE `Response` DROP FOREIGN KEY `Response_messageId_fkey`;

-- AlterTable
ALTER TABLE `Response` MODIFY `messageId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Response` ADD CONSTRAINT `Response_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
