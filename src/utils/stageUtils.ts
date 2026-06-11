import st1 from '../assets/map/st1.리스항구.jpg';
import st2 from '../assets/map/st2.리스항구 외각.jpg';
import st3 from '../assets/map/st3.세갈레길.jpg';
import st4 from '../assets/map/st4.헤네시스.jpg';
import st5 from '../assets/map/st5.헤네시스 사냥터ⅱ.jpg';
import st6 from '../assets/map/st6.수상한 언덕.jpg';
import st7 from '../assets/map/st7.엘리니아.jpg';
import st8 from '../assets/map/st8.남쪽숲나무던전.jpg';
import st9 from '../assets/map/st9.원숭이의숲.jpg';
import st10 from '../assets/map/st10.커닝시티.jpg';

export interface StageConfig {
  stage: number;
  name: string;
  image: string;
}

export const STAGE_CONFIGS: StageConfig[] = [
  { stage: 1, name: '리스항구', image: st1 },
  { stage: 2, name: '리스항구 외각', image: st2 },
  { stage: 3, name: '세갈레길', image: st3 },
  { stage: 4, name: '헤네시스', image: st4 },
  { stage: 5, name: '헤네시스 사냥터ⅱ', image: st5 },
  { stage: 6, name: '수상한 언덕', image: st6 },
  { stage: 7, name: '엘리니아', image: st7 },
  { stage: 8, name: '남쪽숲나무던전', image: st8 },
  { stage: 9, name: '원숭이의숲', image: st9 },
  { stage: 10, name: '커닝시티', image: st10 },
];

export const getStageConfig = (wave: number): StageConfig => {
  if (wave <= 0) return STAGE_CONFIGS[0];
  const index = (wave - 1) % STAGE_CONFIGS.length;
  return STAGE_CONFIGS[index];
};
