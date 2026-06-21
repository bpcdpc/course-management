import { SemesterType } from '@prisma/client';

export function getCurrentYearAndSemester(): {
  currentYear: number;
  currentSemester: SemesterType;
} {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0 ~ 11

  // 월과 매칭되는 학기를 지정한다.
  const semesterTypeMap: Record<number, SemesterType> = {
    0: 'WINTER_SESSION',
    1: 'WINTER_SESSION',
    2: 'FIRST_SEMESTER',
    3: 'FIRST_SEMESTER',
    4: 'FIRST_SEMESTER',
    5: 'FIRST_SEMESTER',
    6: 'SUMMER_SESSION',
    7: 'SUMMER_SESSION',
    8: 'SECOND_SEMESTER',
    9: 'SECOND_SEMESTER',
    10: 'SECOND_SEMESTER',
    11: 'SECOND_SEMESTER',
  };

  return { currentYear, currentSemester: semesterTypeMap[currentMonth] };
}
