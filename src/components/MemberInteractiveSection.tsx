'use client';

import { useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import { Member } from '@/types/microcms';

const imgGroup2091 = "/figma/interview-staff-photos.png"; // フォールバック用
const imgGroup2071 = "/figma/interview-featured-staff.png";

interface MemberInteractiveSectionProps {
  members: Member[];
}

/**
 * メンバーアイコンコンポーネント（クリック可能）
 */
function ClickableMemberIcon({ 
  member, 
  index, 
  isSelected, 
  onClick 
}: { 
  member: Member; 
  index: number; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  return (
    <div
      className={`bg-center bg-cover bg-no-repeat h-[70px] w-[70px] md:h-[90px] md:w-[90px] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105 hover:ring-2 hover:ring-blue-300'
      }`}
      style={{
        backgroundImage: `url('${withBasePath(member.icon?.url || imgGroup2091)}')`,
      }}
      title={member.name || `メンバー ${index + 1}`}
      onClick={onClick}
    />
  );
}

/**
 * メンバー詳細表示コンポーネント
 */
function MemberDetail({ member }: { member: Member }) {
  return (
    <div className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative shrink-0 w-full max-w-full overflow-hidden">
      {/* メンバー画像 */}
      <div
        className="bg-center bg-cover bg-no-repeat h-[200px] md:h-[260px] shrink-0 w-[200px] md:w-[260px] rounded-lg overflow-hidden"
        style={{ 
          backgroundImage: `url('${withBasePath(member.icon?.url || imgGroup2071)}')` 
        }}
      />
      
      {/* メンバー情報 */}
      <div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full max-w-full">
        {/* 名前部分 */}
        <div className="box-border content-stretch flex flex-col items-center justify-start leading-[0] p-0 relative shrink-0 text-center w-full">
          <div className="flex flex-col font-bold justify-center relative shrink-0 text-[#2204db] text-xl md:text-lg">
            <p className="block leading-[normal] break-words">
              {member.name || '名前未設定'}
            </p>
          </div>
        </div>
        
        {/* テキスト部分 */}
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full max-w-full">
          <div className="flex flex-col font-bold justify-start relative shrink-0 text-base md:text-sm text-left text-neutral-950 w-full max-w-full px-2">
            <p className="block break-words">
              {member.text || 'メンバーの説明文が設定されていません。'}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

/**
 * メンバーインタラクティブセクション
 */
export default function MemberInteractiveSection({ members }: MemberInteractiveSectionProps) {
  // 表示メンバー（5つ以上ある場合は下に折り返し）。最低4つまではフォールバックで補完
  const displayMembers = [...members];
  while (displayMembers.length < 4) {
    displayMembers.push({
      id: `fallback-${displayMembers.length}`,
      name: '',
      icon: undefined,
      text: '',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
      revisedAt: ''
    });
  }

  // 最初のメンバー（または最初の実際のメンバー）を初期選択
  const firstRealMember = members.find(m => m.name && m.name.trim() !== '') || members[0];
  const [selectedMember, setSelectedMember] = useState<Member>(
    firstRealMember || displayMembers[0]
  );

  return (
    <div className="w-full">
      {/* メンバーアイコン一覧 */}
      <div className="box-border content-stretch flex flex-row flex-wrap gap-2 md:gap-4 items-start justify-center p-0 relative shrink-0 mb-6 md:mb-8 w-full">
        {displayMembers.map((member, index) => (
          <ClickableMemberIcon 
            key={member.id} 
            member={member} 
            index={index}
            isSelected={selectedMember.id === member.id}
            onClick={() => setSelectedMember(member)}
          />
        ))}
      </div>

      {/* 選択されたメンバーの詳細表示 */}
      <MemberDetail member={selectedMember} />
    </div>
  );
} 