import React from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import { useEnemyStore } from '../../../store/enemyStore';
import { RARITY_LABELS, RARITY_COLORS } from '../../../utils/gachaUtils';
import type { UnitRarity } from '../../../types/game';

/* ── 메이플 HUD 공통 패널 스타일 ─── */
const hudPanel: React.CSSProperties = {
  position: 'fixed', bottom: 0, zIndex: 30,
  background: 'linear-gradient(160deg,#1a0e06,#120a04)',
  borderTop: '3px solid #8b5e2e',
  fontFamily: '"Gulim","Dotum","MS Gothic",sans-serif',
  boxShadow: '0 -4px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,180,80,0.05)',
};

/* ── 등급 색상 (어두운 배경에서 보이는) ── */
const RARITY_BG: Record<UnitRarity, string> = {
  Common:     'rgba(156,163,175,0.15)',
  Rare:       'rgba(96,165,250,0.15)',
  Ancient:    'rgba(74,222,128,0.15)',
  Artifact:   'rgba(244,114,182,0.15)',
  Narrative:  'rgba(192,132,252,0.15)',
  Legendary:  'rgba(251,146,60,0.2)',
  Epic:       'rgba(239,68,68,0.2)',
  Mythic:     'rgba(251,191,36,0.2)',
  Primeval:   'rgba(56,189,248,0.2)',
};

/* ── 스탯 칸 ── */
const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: 'rgba(0,0,0,0.4)', border: '1px solid #3a2010', borderRadius: '3px', padding: '4px 8px',
  }}>
    <span style={{ color: '#5a3818', fontSize: '10px', display: 'block', letterSpacing: '0.5px' }}>{label}</span>
    <span style={{ color, fontSize: '14px', fontWeight: 'bold', textShadow: `0 0 6px ${color}66` }}>{value}</span>
  </div>
);

/* ── HP 바 ── */
const HpBar: React.FC<{ label: string; current: number; max: number; color: string; bg: string }> = ({ label, current, max, color, bg }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
      <span style={{ color, fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
      <span style={{ color, fontSize: '10px' }}>{Math.ceil(current)} / {max}</span>
    </div>
    <div style={{ width: '100%', height: '8px', background: '#0a0604', border: '1px solid #2a1508', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${(current / max) * 100}%`,
        background: `linear-gradient(90deg,${color},${bg})`,
        transition: 'width 0.3s',
        boxShadow: `0 0 6px ${color}88`,
      }} />
    </div>
  </div>
);

const UnitInfoOverlay: React.FC = () => {
  const { selectedUnitIds, selectedEnemyId } = useUIStore();
  const { units } = useUnitStore();
  const { enemies } = useEnemyStore();

  const selectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
  const selectedEnemy = enemies.find(e => e.id === selectedEnemyId);

  if (selectedUnits.length === 0 && !selectedEnemy) return null;

  /* ── 적 선택 ── */
  if (selectedEnemy) {
    return (
      <div data-no-pan="true" style={{ ...hudPanel, left: '246px', right: 'calc(20vw + 20px)', height: '14vh', minHeight: '140px', display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderLeft: '3px solid #880000', borderRight: '3px solid #880000' }}>
        {/* 아이콘 */}
        <div style={{ aspectRatio: '1', height: '100%', maxHeight: '100px', background: 'rgba(100,0,0,0.3)', border: '2px solid #880000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
          👹
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ff6060', fontSize: '16px', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,80,80,0.5)' }}>{selectedEnemy.name}</span>
            <span style={{
              padding: '1px 6px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 'bold',
              background: selectedEnemy.size === 'Small' ? 'rgba(59,130,246,0.3)' : selectedEnemy.size === 'Medium' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
              border: `1px solid ${selectedEnemy.size === 'Small' ? '#3b82f6' : selectedEnemy.size === 'Medium' ? '#f59e0b' : '#ef4444'}`,
              color: '#fff',
            }}>
              {selectedEnemy.size === 'Small' ? '소형 몬스터' : selectedEnemy.size === 'Medium' ? '중형 몬스터' : '대형 몬스터'}
            </span>
            {selectedEnemy.armor > 0 && (
              <span style={{
                padding: '1px 6px',
                borderRadius: '2px',
                fontSize: '10px',
                fontWeight: 'bold',
                background: 'rgba(100,100,100,0.3)',
                border: '1px solid #888',
                color: '#ddd',
              }}>
                방어력 {selectedEnemy.armor}
              </span>
            )}
          </div>
          <HpBar label="HP" current={selectedEnemy.hp} max={selectedEnemy.maxHp} color="#ff4444" bg="#ff8888" />
          {selectedEnemy.maxShield > 0 && (
            <HpBar label="SHIELD" current={selectedEnemy.shield} max={selectedEnemy.maxShield} color="#4488ff" bg="#88aaff" />
          )}
        </div>
      </div>
    );
  }

  /* ── 다중 선택 ── */
  if (selectedUnits.length > 1) {
    return (
      <div data-no-pan="true" style={{ ...hudPanel, left: '246px', right: 'calc(20vw + 20px)', height: '14vh', minHeight: '140px', padding: '10px 14px', borderLeft: '3px solid #5a3818', borderRight: '3px solid #5a3818' }}>
        <div style={{ color: '#c8922a', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px' }}>
          ✦ 선택된 유닛 ({selectedUnits.length}개)
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {selectedUnits.map(unit => {
            let icon = unit.class === 'Ghost' ? '👻' : unit.class === 'Dragoon' ? '🤖' : '🦎';
            let label = RARITY_LABELS[unit.rarity];
            let color = RARITY_COLORS[unit.rarity];
            let bg = RARITY_BG[unit.rarity];
            
            if (unit.isGimmickUnit) {
              color = '#8e6d46';
              bg = 'rgba(142,109,70,0.15)';
              label = '일반';
              if (unit.id.includes('bgm')) icon = '🎵';
              else if (unit.id.includes('sfx')) icon = '🔊';
              else if (unit.id.includes('speed')) icon = '⚡';
              else if (unit.id.includes('hero')) icon = '🎫';
            }
            
            return (
              <div key={unit.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <div style={{
                  width: '52px', height: '52px',
                  background: bg,
                  border: `2px solid ${color}`,
                  borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                  {icon}
                </div>
                <span style={{ color: color, fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── 단일 유닛 ── */
  const unit = selectedUnits[0];

  if (unit.isGimmickUnit) {
    let gimmickIcon = '🎵';
    let gimmickDesc = '게임의 배경음악(BGM)을 조절할 수 있는 유닛입니다. 이 유닛을 BGM ON 구역에 놓으면 배경음악이 재생되고, BGM OFF 구역으로 이동시키면 배경음악이 음소거됩니다.';
    
    if (unit.id.includes('sfx')) {
      gimmickIcon = '🔊';
      gimmickDesc = '게임의 효과음(SFX)을 조절할 수 있는 유닛입니다. 이 유닛을 SFX ON 구역에 놓으면 공격 및 타격 효과음이 재생되고, SFX OFF 구역으로 이동시키면 효과음이 음소거됩니다.';
    } else if (unit.id.includes('speed')) {
      gimmickIcon = '⚡';
      gimmickDesc = '게임의 진행 속도(배속)를 조절하는 투표 유닛입니다. 모든 플레이어의 배속 유닛이 x4 영역에 배치되면 4배속(매우 빠름)으로 작동하며, 하나라도 x2 영역에 있으면 2배속(보통)으로 작동합니다. 실제 게임 및 웨이브 대기 시간도 배속의 영향을 받습니다.';
    } else if (unit.id.includes('hero')) {
      gimmickIcon = '🎫';
      gimmickDesc = '영웅 등급 유닛을 선택하거나 뽑을 수 있는 소모성 티켓 유닛입니다. 이 유닛을 원하는 직업 칸(고스트 👻, 드라군 🤖, 히드라 🦎, 또는 확률적인 🎁 랜덤 뽑기)으로 드래그하여 이동시키면 해당 유닛이 즉시 소환되고 선택권 유닛은 소멸합니다.';
    }

    return (
      <div data-no-pan="true" style={{ ...hudPanel, left: '246px', right: 'calc(20vw + 20px)', height: '14vh', minHeight: '140px', display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderLeft: `3px solid #8e6d46`, borderRight: `3px solid #8e6d46` }}>
        {/* 유닛 아이콘 */}
        <div style={{
          aspectRatio: '1', height: '100%', maxHeight: '100px',
          background: 'rgba(142,109,70,0.15)',
          border: `2px solid #8e6d46`,
          borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', flexShrink: 0,
          boxShadow: `0 0 16px rgba(142,109,70,0.4)`,
        }}>
          {gimmickIcon}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          {/* 이름 + 등급 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f0d080', fontSize: '15px', fontWeight: 'bold', textShadow: '0 0 8px rgba(240,200,80,0.3)' }}>
              {unit.name}
            </span>
            <span style={{
              padding: '1px 8px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold',
              background: 'rgba(142,109,70,0.2)',
              border: `1px solid #8e6d46`,
              color: '#f0d080',
              textShadow: `0 0 6px rgba(142,109,70,0.8)`,
            }}>
              일반 유닛
            </span>
          </div>

          {/* 설명 */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid #3a2010',
            borderRadius: '3px',
            padding: '8px 12px',
            fontSize: '11px',
            color: '#dccfc4',
            lineHeight: '1.4',
            maxHeight: '70px',
            overflowY: 'auto',
          }}>
            {gimmickDesc}
          </div>
        </div>
      </div>
    );
  }

  const rarityColor = RARITY_COLORS[unit.rarity];

  return (
    <div data-no-pan="true" style={{ ...hudPanel, left: '246px', right: 'calc(20vw + 20px)', height: '14vh', minHeight: '140px', display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderLeft: `3px solid ${rarityColor}44`, borderRight: `3px solid ${rarityColor}44` }}>
      {/* 유닛 아이콘 */}
      <div style={{
        aspectRatio: '1', height: '100%', maxHeight: '100px',
        background: RARITY_BG[unit.rarity],
        border: `2px solid ${rarityColor}`,
        borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px', flexShrink: 0,
        boxShadow: `0 0 16px ${rarityColor}44`,
      }}>
        {unit.class === 'Ghost' ? '👻' : unit.class === 'Dragoon' ? '🤖' : '🦎'}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
        {/* 이름 + 등급 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#f0d080', fontSize: '15px', fontWeight: 'bold', textShadow: '0 0 8px rgba(240,200,80,0.3)' }}>
            {unit.name}
          </span>
          <span style={{
            padding: '1px 8px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold',
            background: RARITY_BG[unit.rarity],
            border: `1px solid ${rarityColor}`,
            color: rarityColor,
            textShadow: `0 0 6px ${rarityColor}88`,
          }}>
            {RARITY_LABELS[unit.rarity]}
          </span>
        </div>

        {/* 스탯 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
          <StatBox label="공격력" value={unit.damage.toLocaleString()} color="#ffd700" />
          <StatBox label="공격속도" value={`${unit.attackSpeed}s`} color="#88aaff" />
          <StatBox label="공격형태" value={unit.attackType === 'Concussive' ? '진동형' : unit.attackType === 'Explosive' ? '폭발형' : '일반형'} color="#88ddaa" />
          <StatBox label="클래스" value={unit.class === 'Ghost' ? '고스트' : unit.class === 'Dragoon' ? '드라군' : '히드라'} color="#ddaaff" />
        </div>
      </div>
    </div>
  );
};

export default UnitInfoOverlay;
