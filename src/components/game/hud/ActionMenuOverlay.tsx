import React, { useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useUnitStore } from '../../../store/unitStore';
import { useGameStore } from '../../../store/gameStore';
import { useChatStore } from '../../../store/chatStore';
import type { UnitRarity, UnitClass } from '../../../types/game';

/* ── 등급별 판매 가격 ── */
const RARITY_SELL_PRICES: Record<UnitRarity, number> = {
  Normal: 1,
  Rare: 2,
  Epic: 4,
  Unique: 8,
  Legendary: 15,
  Hero: 25,
  Mythic: 60,
  Primeval: 150,
  Apocalypse: 500,
};

interface ActionButtonProps {
  icon: string;
  label: string;
  count: number;
  goldValue: number;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, count, goldValue, onClick, disabled }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const finalDisabled = disabled || count === 0;

  return (
    <button
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
      disabled={finalDisabled}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #3a2212, #21130a)',
        border: '2px solid #5a3c24',
        borderRadius: '4px',
        color: finalDisabled ? '#888' : '#f0d080',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: finalDisabled ? 'not-allowed' : 'pointer',
        opacity: finalDisabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        fontFamily: '"Gulim", "Dotum", sans-serif',
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5)',
      }}
      // 인라인 호버 효과 대체용 이벤트 핸들러
      onMouseOver={(e) => {
        if (!finalDisabled) {
          e.currentTarget.style.border = '2px solid #ffcc00';
          e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 204, 0, 0.4)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.border = '2px solid #5a3c24';
        e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5)';
      }}
    >
      {/* 이모지 아이콘 */}
      <span style={{ fontSize: '20px', marginBottom: '2px' }}>{icon}</span>

      {/* 라벨 텍스트 */}
      <span style={{ fontSize: '10px', fontWeight: 'bold', textShadow: '1px 1px 1px #000' }}>
        {label}
        {count > 0 && <span style={{ color: '#ffcc00', marginLeft: '3px' }}>({count})</span>}
      </span>

      {/* 메이플 스타일 툴팁 팝업 */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            border: '2px solid #8b5e2e',
            borderRadius: '4px',
            padding: '8px 12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
            color: '#fff',
            zIndex: 999,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffcc00', textShadow: '1px 1px 1px #000' }}>
            {label} {count > 0 ? `(${count}개 선택됨)` : ''}
          </div>
          {count > 0 ? (
            <>
              <div style={{ height: '1px', background: '#5a3c24', margin: '3px 0' }} />
              <div style={{ fontSize: '10px', color: '#ddccaa' }}>
                판매 시 획득 골드: <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{goldValue} G</span>
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>클릭 시 즉시 판매됩니다.</div>
            </>
          ) : (
            <div style={{ fontSize: '9px', color: '#aaa' }}>
              {disabled ? '잠겨 있는 기능입니다.' : '판매할 대상을 먼저 선택해주세요.'}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

const ActionMenuOverlay: React.FC = () => {
  const { selectedUnitIds, setSelectedUnitIds } = useUIStore();
  const { units, removeUnit } = useUnitStore();
  const { addGold } = useGameStore();
  const { addMessage } = useChatStore();

  // 선택된 유닛들 정보 필터링 (기믹 옵션 유닛 제외)
  const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id) && !u.isGimmickUnit);

  // 직업별 유닛 분류
  const warriorUnits = selectedUnits.filter((u) => u.class === 'Warrior');
  const mageUnits = selectedUnits.filter((u) => u.class === 'Mage');
  const archerUnits = selectedUnits.filter((u) => u.class === 'Archer');

  // 직업별 판매 획득 총 골드 계산
  const getGoldValue = (targetUnits: typeof units) => {
    return targetUnits.reduce((sum, u) => sum + (RARITY_SELL_PRICES[u.rarity] || 1), 0);
  };

  const warriorGold = getGoldValue(warriorUnits);
  const mageGold = getGoldValue(mageUnits);
  const archerGold = getGoldValue(archerUnits);

  // 판매 처리 로직
  const handleSell = (unitClass: UnitClass, targetUnits: typeof units, goldEarned: number) => {
    if (targetUnits.length === 0) return;

    // 1. 유닛 제거
    targetUnits.forEach((u) => removeUnit(u.id));

    // 2. 골드 획득
    addGold(goldEarned);

    // 3. 선택 목록 갱신 (제거된 유닛들을 선택 해제)
    const soldIds = targetUnits.map((u) => u.id);
    const nextSelected = selectedUnitIds.filter((id) => !soldIds.includes(id));
    setSelectedUnitIds(nextSelected);

    // 4. 알림 시스템 메시지 출력
    const classKor = unitClass === 'Warrior' ? '전사' : unitClass === 'Mage' ? '마법사' : '궁수';
    addMessage(
      `[시스템] ${classKor} ${targetUnits.length}마리를 판매하여 ${goldEarned}골드를 획득하였습니다.`,
      '#55ff55'
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        zIndex: 30,
        width: '20vw',
        height: '20vw',
        minWidth: '200px',
        minHeight: '200px',
        maxHeight: '220px',
        background: 'linear-gradient(160deg, #1a0e06, #120a04)',
        borderTop: '3px solid #8b5e2e',
        borderLeft: '3px solid #8b5e2e',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,180,80,0.05)',
        padding: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '6px',
        boxSizing: 'border-box',
      }}
    >
      <ActionButton
        icon="🗡️"
        label="전사 판매"
        count={warriorUnits.length}
        goldValue={warriorGold}
        onClick={() => handleSell('Warrior', warriorUnits, warriorGold)}
      />
      <ActionButton
        icon="🧙"
        label="마법사 판매"
        count={mageUnits.length}
        goldValue={mageGold}
        onClick={() => handleSell('Mage', mageUnits, mageGold)}
      />
      <ActionButton
        icon="🏹"
        label="궁수 판매"
        count={archerUnits.length}
        goldValue={archerGold}
        onClick={() => handleSell('Archer', archerUnits, archerGold)}
      />

      <ActionButton icon="📜" label="도감 등록" count={0} goldValue={0} onClick={() => {}} disabled />
      <ActionButton icon="💎" label="전설 교환" count={0} goldValue={0} onClick={() => {}} disabled />
      <ActionButton icon="🔥" label="신화 구현" count={0} goldValue={0} onClick={() => {}} disabled />
    </div>
  );
};

export default ActionMenuOverlay;
