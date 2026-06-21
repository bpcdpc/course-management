/*
  Warnings:

  - You are about to drop the column `hours` on the `TimeTable` table. All the data in the column will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,dayOfWeek,hour]` on the table `TimeTable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hour` to the `TimeTable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TimeTable" DROP CONSTRAINT "TimeTable_courseId_fkey";

-- AlterTable
ALTER TABLE "TimeTable" DROP COLUMN "hours",
ADD COLUMN     "hour" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Attendance";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "TimeTable_dayOfWeek_hour_idx" ON "TimeTable"("dayOfWeek", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "TimeTable_courseId_dayOfWeek_hour_key" ON "TimeTable"("courseId", "dayOfWeek", "hour");

-- AddForeignKey
ALTER TABLE "TimeTable" ADD CONSTRAINT "TimeTable_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
